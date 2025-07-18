import { NextApiRequest, NextApiResponse } from 'next'
import { WhisperService } from '../../lib/whisper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    const tags = await WhisperService.generateTags(text)
    
    res.status(200).json({ tags })
  } catch (error) {
    console.error('Error generating tags:', error)
    res.status(500).json({ error: 'Failed to generate tags' })
  }
} 