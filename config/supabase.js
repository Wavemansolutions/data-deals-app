const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('[v0] Supabase config:', {
  url: supabaseUrl ? 'SET' : 'MISSING',
  key: supabaseKey ? 'SET' : 'MISSING',
  serviceKey: supabaseServiceKey ? 'SET' : 'MISSING'
});

if (!supabaseUrl || !supabaseKey) {
  console.warn('[v0] WARNING: Supabase credentials incomplete. Some features may fail.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');
const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

module.exports = { supabase, supabaseAdmin };
