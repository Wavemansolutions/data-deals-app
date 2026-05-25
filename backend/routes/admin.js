const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get dashboard stats (Admin only)
router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Total revenue
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('amount')
      .eq('status', 'completed');

    const totalRevenue = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

    // Recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        *,
        user:user_id(name, email),
        plan:plan_id(label)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (Admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role (Admin only)
router.put('/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contact form submissions (Admin only)
router.get('/contact-submissions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update submission status (Admin only)
router.put('/contact-submissions/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
