const { createClient } = require("@supabase/supabase-js")
const WebSocket = require("ws")

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: WebSocket,
  },
})

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  realtime: {
    transport: WebSocket,
  },
})

module.exports = { supabase, supabaseAdmin }