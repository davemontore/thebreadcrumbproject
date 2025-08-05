import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    // Simple text-based tag generation for manual text entries
    // Since AssemblyAI is for audio transcription, we'll use basic text analysis
    const words = text.toLowerCase().split(/\s+/)
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'])
    
    const meaningfulWords = words.filter((word: string) => 
      word.length > 3 && 
      !commonWords.has(word) && 
      /^[a-zA-Z]+$/.test(word)
    )
    
    // Get unique words and limit to 4 tags
    const uniqueWords = Array.from(new Set(meaningfulWords))
    const tags = uniqueWords.slice(0, 4)
    
    // If no meaningful words found, use default tags
    if (tags.length === 0) {
      tags.push('text-entry', 'manual')
    }
    
    res.status(200).json({ tags })
  } catch (error) {
    console.error('Error generating tags:', error)
    res.status(500).json({ error: 'Failed to generate tags' })
  }
} 