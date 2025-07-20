import { supabase, Breadcrumb } from './supabase'

export class DatabaseService {
  // Get all breadcrumbs for the current user
  static async getBreadcrumbs(userId: string): Promise<Breadcrumb[]> {
    if (!supabase) {
      console.error('Supabase client not available')
      return []
    }
    
    try {
      const { data, error } = await supabase
        .from('breadcrumbs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching breadcrumbs:', error)
      return []
    }
  }

  // Create a new breadcrumb
  static async createBreadcrumb(
    userId: string,
    content: string,
    tags: string[],
    type: 'audio' | 'text'
  ): Promise<Breadcrumb | null> {
    if (!supabase) {
      console.error('Supabase client not available')
      return null
    }
    
    try {
      const { data, error } = await supabase
        .from('breadcrumbs')
        .insert({
          user_id: userId,
          content,
          tags,
          type
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating breadcrumb:', error)
      return null
    }
  }

  // Update a breadcrumb
  static async updateBreadcrumb(
    id: string,
    updates: Partial<Breadcrumb>
  ): Promise<Breadcrumb | null> {
    if (!supabase) {
      console.error('Supabase client not available')
      return null
    }
    
    try {
      const { data, error } = await supabase
        .from('breadcrumbs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating breadcrumb:', error)
      return null
    }
  }

  // Delete a breadcrumb
  static async deleteBreadcrumb(id: string): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase client not available')
      return false
    }
    
    try {
      const { error } = await supabase
        .from('breadcrumbs')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting breadcrumb:', error)
      return false
    }
  }

  // Subscribe to real-time updates
  static subscribeToBreadcrumbs(userId: string, callback: (breadcrumb: Breadcrumb) => void) {
    if (!supabase) {
      console.error('Supabase client not available')
      return null
    }
    
    return supabase
      .channel('breadcrumbs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'breadcrumbs',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            callback(payload.new as Breadcrumb)
          }
        }
      )
      .subscribe()
  }
} 