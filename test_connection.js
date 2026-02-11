import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Load .env file
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('Testing connection to:', supabaseUrl)

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    console.log('Sending query to Supabase...')
    const start = Date.now()
    try {
        const { data, error } = await supabase.from('courses').select('id').limit(1)
        const duration = Date.now() - start

        if (error) {
            console.error('Connection FAILED:', error.message)
        } else {
            console.log(`Connection SUCCESS! took ${duration}ms`)
            console.log('Data received:', data)
        }
    } catch (err) {
        console.error('Connection ERROR:', err.message)
    }
}

testConnection()
