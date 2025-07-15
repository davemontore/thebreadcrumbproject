import { NextApiRequest, NextApiResponse } from 'next'
import { JournalService } from '../../lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text } = req.body
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    // Try to create a simple entry
    const result = await JournalService.createEntry(text, 'text', [])
    
    if (result) {
      res.status(200).json({ success: true, entry: result })
    } else {
      res.status(500).json({ error: 'Failed to create entry - returned null' })
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Database error', details: error })
  }
} 