const { createClient } = require("@supabase/supabase-js")
const WebSocket = require("ws")

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

const options = {
  realtime: {
    transport: WebSocket,
  },
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  options
)

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  options
)

module.exports = {
  supabase,
  supabaseAdmin,
}