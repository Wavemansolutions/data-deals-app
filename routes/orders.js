const express = require('express');
const router = express.Router();
const { payvesselApi } = require('../config/payvessel');
const { supabase } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');
const crypto = require('crypto');

// Test endpoint
router.get('/test', (req, res) => {
  console.log('[v0] Test endpoint called');
  res.json({ status: 'Orders route is working', timestamp: new Date().toISOString() });
});

// Initialize Payvessel payment (no auth required)
router.post('/checkout', async (req, res) => {
  console.log('[v0] ===== CHECKOUT ENDPOINT CALLED =====');
  console.log('[v0] Request body:', JSON.stringify(req.body));
  
  try {
    const { planId, macAddress, email } = req.body;
    console.log('[v0] Step 1: Extracted values - planId:', planId, 'email:', email, 'mac:', macAddress);

    // Validate inputs
    if (!planId || !macAddress || !email) {
      console.log('[v0] Step 1 FAILED: Missing required fields');
      return res.status(400).json({ error: 'planId, macAddress, and email are required' });
    }
    console.log('[v0] Step 1: PASSED - All inputs valid');

    // Step 2: Get plan details
    console.log('[v0] Step 2: Querying Supabase for plan:', planId);
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    console.log('[v0] Step 2 result:', { 
      planFound: !!plan, 
      planError: planError?.message,
      planData: plan ? { id: plan.id, label: plan.label, price: plan.price } : null
    });

    if (planError || !plan) {
      console.log('[v0] Step 2 FAILED - Plan not found:', planError?.message);
      return res.status(404).json({ error: 'Plan not found', details: planError?.message });
    }
    console.log('[v0] Step 2: PASSED - Plan found');

    // Step 3: Create or get guest user by email
    console.log('[v0] Step 3: Looking up user by email:', email);
    const { data: existingUser, error: userLookupError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    console.log('[v0] Step 3 result:', { userFound: !!existingUser, userLookupError: userLookupError?.message });

    let userId = existingUser?.id;

    // If user doesn't exist, create a guest user
    if (!userId) {
      console.log('[v0] Step 3b: Creating new guest user');
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          email,
          name: email.split('@')[0],
          is_guest: true
        }])
        .select('id')
        .single();

      if (createError) {
        console.error('[v0] Step 3b: User creation failed:', createError);
        // Use email hash as fallback userId
        userId = crypto.createHash('md5').update(email).digest('hex');
        console.log('[v0] Step 3b: Using fallback userId (hash)');
      } else {
        userId = newUser?.id;
        console.log('[v0] Step 3b: PASSED - New user created:', userId);
      }
    }
    console.log('[v0] Step 3: PASSED - userId:', userId);

    // Step 4: Create Payvessel payment initialization
    console.log('[v0] Step 4: Initializing Payvessel payment for:', { email, amount: plan.price, planId });
    
    let payvesselResponse;
    try {
      console.log('[v0] Step 4: Calling Payvessel API...');
      payvesselResponse = await payvesselApi.post('/transactions/initialize', {
        email: email,
        amount: plan.price,
        currency: 'NGN',
        description: `${plan.label} - ${plan.duration} Data Plan`,
        metadata: {
          userId,
          planId,
          macAddress,
          planLabel: plan.label,
          planCategory: plan.category,
          planDuration: plan.duration
        },
        return_url: `${process.env.CALLBACK_URL}?reference={REFERENCE}`
      });
      console.log('[v0] Step 4: Payvessel API responded');
    } catch (payvesselError) {
      console.error('[v0] Step 4 FAILED - Payvessel API error:', {
        message: payvesselError.message,
        status: payvesselError.response?.status,
        data: payvesselError.response?.data
      });
      throw new Error(`Payvessel API failed: ${payvesselError.message}`);
    }

    console.log('[v0] Step 4 result:', {
      success: payvesselResponse.data?.success,
      hasData: !!payvesselResponse.data?.data,
      keys: payvesselResponse.data?.data ? Object.keys(payvesselResponse.data.data) : []
    });

    if (!payvesselResponse.data?.success) {
      console.log('[v0] Step 4 FAILED - Payvessel unsuccessful response:', payvesselResponse.data);
      return res.status(400).json({ 
        error: 'Failed to initialize payment',
        details: payvesselResponse.data 
      });
    }

    if (!payvesselResponse.data.data?.payment_url) {
      console.log('[v0] Step 4 FAILED - Missing payment_url in response');
      return res.status(400).json({ 
        error: 'Payment URL not provided by Payvessel',
        details: payvesselResponse.data.data 
      });
    }
    console.log('[v0] Step 4: PASSED - Payment URL obtained');

    const reference = payvesselResponse.data.data.reference;

    // Step 5: Store pending order
    console.log('[v0] Step 5: Storing order in Supabase');
      const { error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: userId,
          plan_id: planId,
          status: 'pending',
          payvessel_reference: reference,
          mac_address: macAddress,
          amount: plan.price
        }]);

    if (orderError) {
      console.error('[v0] Step 5 WARNING - Order creation error (continuing):', orderError);
    } else {
      console.log('[v0] Step 5: PASSED - Order created');
    }

    console.log('[v0] ===== CHECKOUT SUCCESS =====');
    console.log('[v0] Sending response with payment URL');
    
    res.json({
      success: true,
      paymentUrl: payvesselResponse.data.data.payment_url,
      reference: reference
    });
  } catch (error) {
    console.error('[v0] ===== CHECKOUT FAILED =====');
    console.error('[v0] Error caught in main catch:', error);
    console.error('[v0] Error message:', error.message);
    console.error('[v0] Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Payment initialization failed' });
  }
});

// Get user orders
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        plan:plan_id(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (Admin)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:user_id(name, email),
        plan:plan_id(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Payvessel payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }

    // Verify with Payvessel
    const verifyResponse = await payvesselApi.get(`/transactions/${reference}`);

    if (!verifyResponse.data.success) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const paymentData = verifyResponse.data.data;

    if (paymentData.status === 'completed') {
      const { userId, planId, macAddress } = paymentData.metadata;

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          payvessel_reference: reference
        })
        .eq('payvessel_reference', reference);

      if (updateError) throw updateError;

      // Store MAC address
      const { error: macError } = await supabase
        .from('device_registrations')
        .insert([{
          user_id: userId,
          mac_address: macAddress,
          plan_id: planId,
          order_id: reference,
          activated_at: new Date().toISOString()
        }]);

      if (macError) {
        console.error('MAC registration error:', macError);
        // Don't fail the response if MAC registration fails
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        reference,
        macAddress
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not successful',
        status: paymentData.status
      });
    }
  } catch (error) {
    console.error('Verification error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get device registrations for user
router.get('/devices', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('device_registrations')
      .select(`
        *,
        plan:plan_id(label, category, duration)
      `)
      .eq('user_id', userId)
      .order('activated_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook for Payvessel (optional - for server-to-server confirmation)
router.post('/webhook', express.json(), async (req, res) => {
  try {
    const hash = crypto
      .createHmac('sha256', process.env.PAYVESSEL_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-payvessel-signature']) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;

    if (event === 'transaction.completed') {
      const { reference, metadata } = data;
      const { userId, planId, macAddress } = metadata;

      // Update order
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('payvessel_reference', reference);

      if (updateError) throw updateError;

      // Register device
      await supabase
        .from('device_registrations')
        .insert([{
          user_id: userId,
          mac_address: macAddress,
          plan_id: planId,
          order_id: reference,
          activated_at: new Date().toISOString()
        }]);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
