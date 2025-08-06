import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../lib/firebase'
import { ref, get } from 'firebase/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { query, limit = 20, offset = 0, userId } = req.body

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' })
    }

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID is required' })
    }

    console.log('Search API: Searching for:', query, 'for user:', userId)

    // Get all entries for this specific user directly from Firebase
    const userEntriesRef = ref(db, `users/${userId}/journal_entries`)
    const snapshot = await get(userEntriesRef)
    
    console.log('Search API: Firebase query completed, entries exist:', snapshot.exists())
    
    const allEntries: any[] = []
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val()
        allEntries.push({
          id: childSnapshot.key || '',
          title: data.title || '',
          text: data.text,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
          tags: data.tags || [],
          sentiment: data.sentiment || 'neutral',
          emotions: data.emotions || [],
          highlights: data.highlights || []
        })
      })
    }
    
    console.log('Search API: Total entries retrieved:', allEntries.length)
    console.log('Search API: Sample entry data:', allEntries.slice(0, 2).map(entry => ({
      id: entry.id,
      title: entry.title,
      text: entry.text?.substring(0, 50) + '...',
      tags: entry.tags,
      sentiment: entry.sentiment,
      emotions: entry.emotions
    })))
    
    // Convert query to lowercase for case-insensitive search
    const searchQuery = query.toLowerCase()
    
    // Debug: Check if any entries contain the search term
    console.log('Search API: Looking for term:', searchQuery)
    allEntries.forEach((entry, index) => {
      if (entry.text.toLowerCase().includes(searchQuery)) {
        console.log(`Search API: Found "${searchQuery}" in entry ${index}:`, entry.text.substring(0, 100) + '...')
      }
    })
    
    // Search through titles, text, tags, and sentiment
    const matchingEntries = allEntries.filter(entry => {
      const titleMatch = entry.title?.toLowerCase().includes(searchQuery) || false
      const textMatch = entry.text.toLowerCase().includes(searchQuery) || false
      const tagsMatch = entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery)) || false
      const sentimentMatch = entry.sentiment?.toLowerCase().includes(searchQuery) || false
      const emotionsMatch = entry.emotions?.some(emotion => emotion.toLowerCase().includes(searchQuery)) || false
      
      if (titleMatch || textMatch || tagsMatch || sentimentMatch || emotionsMatch) {
        console.log('Search API: Found match in entry:', entry.id, {
          titleMatch,
          textMatch,
          tagsMatch,
          sentimentMatch,
          emotionsMatch,
          query: searchQuery
        })
      }
      
      return titleMatch || textMatch || tagsMatch || sentimentMatch || emotionsMatch
    })

    // Apply pagination
    const paginatedEntries = matchingEntries.slice(offset, offset + limit)
    
    console.log('Search API: Found', matchingEntries.length, 'matching entries')

    res.status(200).json({
      entries: paginatedEntries,
      total: matchingEntries.length,
      hasMore: offset + limit < matchingEntries.length
    })

  } catch (error) {
    console.error('Search API: Error searching entries:', error)
    res.status(500).json({ error: 'Failed to search entries' })
  }
} 