import { supabase } from './supabase'
import { AuthError } from '@supabase/supabase-js'

export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string) {
    if (!supabase) {
      return { user: null, error: new Error('Supabase client not available') as AuthError }
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error
      return { user: data.user, error: null }
    } catch (error) {
      console.error('Error signing up:', error)
      return { user: null, error: error as AuthError }
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    if (!supabase) {
      return { user: null, error: new Error('Supabase client not available') as AuthError }
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { user: data.user, error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      return { user: null, error: error as AuthError }
    }
  }

  // Sign out
  static async signOut() {
    if (!supabase) {
      return { error: new Error('Supabase client not available') as AuthError }
    }
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error signing out:', error)
      return { error: error as AuthError }
    }
  }

  // Get current user
  static async getCurrentUser() {
    if (!supabase) {
      return { user: null, error: new Error('Supabase client not available') as AuthError }
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      console.error('Error getting current user:', error)
      return { user: null, error: error as AuthError }
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: any) => void) {
    if (!supabase) {
      return { data: { subscription: null } }
    }
    
    return supabase.auth.onAuthStateChange((event: string, session: any) => {
      callback(session?.user || null)
    })
  }
} 