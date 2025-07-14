import { createClient } from '@supabase/supabase-js'

// Simple interface for journal entries
export interface JournalEntry {
  id: string
  content: string
  created_at: string
  updated_at: string
  type?: 'audio' | 'text'
  tags?: string[]
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if environment variables are available
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export class JournalService {
  // Get all journal entries
  static async getEntries(): Promise<JournalEntry[]> {
    if (!supabase) {
      console.warn('Supabase not configured, returning empty entries')
      return []
    }
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching entries:', error)
      throw error
    }
  }

  // Create a new journal entry
  static async createEntry(content: string, type: 'audio' | 'text' = 'text', tags: string[] = []): Promise<JournalEntry | null> {
    console.log('JournalService.createEntry called with:', { content, type, tags })
    console.log('Supabase client exists:', !!supabase)
    console.log('Supabase URL:', supabaseUrl)
    console.log('Supabase Key exists:', !!supabaseKey)
    
    if (!supabase) {
      console.warn('Supabase not configured, cannot create entry')
      return null
    }
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({ content, type, tags })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw error
      }
      
      console.log('Entry created successfully:', data)
      return data
    } catch (error) {
      console.error('Error creating entry:', error)
      throw error
    }
  }

  // Update a journal entry
  static async updateEntry(id: string, content: string): Promise<JournalEntry | null> {
    if (!supabase) {
      console.warn('Supabase not configured, cannot update entry')
      return null
    }
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error updating entry:', error)
      throw error
    }
  }

  // Delete a journal entry
  static async deleteEntry(id: string): Promise<boolean> {
    if (!supabase) {
      console.warn('Supabase not configured, cannot delete entry')
      return false
    }
    
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Database error:', error)
        throw error
      }
      
      return true
    } catch (error) {
      console.error('Error deleting entry:', error)
      throw error
    }
  }

  // Subscribe to real-time updates
  static subscribeToEntries(callback: (entry: JournalEntry) => void) {
    if (!supabase) {
      console.warn('Supabase not configured, cannot subscribe to entries')
      return null
    }
    
    return supabase
      .channel('journal_entries')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            callback(payload.new as JournalEntry)
          }
        }
      )
      .subscribe()
  }
} 