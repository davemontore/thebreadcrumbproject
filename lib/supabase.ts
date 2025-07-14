// Build fix - updated for Vercel deployment
// Test change - checking if GitHub Desktop detects this
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_DATABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_API_KEY || ''

// Only create the client if we're in the browser and have the required environment variables
export const supabase = typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database types
export interface Breadcrumb {
  id: string
  user_id: string
  content: string
  tags: string[]
  type: 'audio' | 'text'
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
} 