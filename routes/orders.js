const express = require('express');
const router = express.Router();
const { payvesselApi } = require('../config/paystack');
const { supabase } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');
const crypto = require('crypto');

// Initialize Payvessel payment (no auth required)
router.post('/checkout', async (req, res) => {
  try {
    const { planId, macAddress, email } = req.body;
    console.log('[v0] Checkout request:', { planId, macAddress, email });

    // Validate inputs
    if (!planId || !macAddress || !email) {
      console.log('[v0] Missing required fields');
      return res.status(400).json({ error: 'planId, macAddress, and email are required' });
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    console.log('[v0] Plan lookup:', { planId, plan, planError });

    if (planError || !plan) {
      console.log('[v0] Plan not found:', planError);
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Create or get guest user by email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    let userId = existingUser?.id;

    // If user doesn't exist, create a guest user
    if (!userId) {
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
        console.error('User creation error:', createError);
        // Use email hash as fallback userId
        userId = crypto.createHash('md5').update(email).digest('hex');
      } else {
        userId = newUser?.id;
      }
    }

    // Create Payvessel payment initialization
    console.log('[v0] Initializing Payvessel payment for:', { email, amount: plan.price });
    
    const payvesselResponse = await payvesselApi.post('/transactions/initialize', {
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

    console.log('[v0] Payvessel response:', payvesselResponse.data);

    if (!payvesselResponse.data.success) {
      console.log('[v0] Payvessel error:', payvesselResponse.data);
      return res.status(400).json({ error: 'Failed to initialize payment', details: payvesselResponse.data });
    }

    const reference = payvesselResponse.data.data.reference;

    // Store pending order
    const { error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        plan_id: planId,
        status: 'pending',
        paystack_reference: reference,
        mac_address: macAddress,
        amount: plan.price
      }]);

    if (orderError) {
      console.error('Order creation error:', orderError);
      // Continue even if order creation fails - user can still complete payment
    }

    console.log('[v0] Payment URL:', payvesselResponse.data.data.payment_url);
    
    res.json({
      success: true,
      paymentUrl: payvesselResponse.data.data.payment_url,
      reference: reference
    });
  } catch (error) {
    console.error('[v0] Checkout error:', error);
    console.error('[v0] Error response:', error.response?.data);
    console.error('[v0] Error message:', error.message);
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
          paystack_reference: reference
        })
        .eq('paystack_reference', reference);

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
        .eq('paystack_reference', reference);

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
