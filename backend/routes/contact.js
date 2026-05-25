const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Submit contact form
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, message, subject } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([{
        name,
        email,
        phone: phone || null,
        subject: subject || 'General Inquiry',
        message,
        status: 'new'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Thank you for contacting us. We will get back to you soon.',
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contact submissions (Admin only)
router.get('/submissions', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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

module.exports = router;
