import { NextApiRequest, NextApiResponse } from 'next'
import { WhisperService } from '../../lib/whisper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text, sentiment, emotions, highlights } = req.body as {
      text: string;
      sentiment?: string;
      emotions?: string[];
      highlights?: string[];
    }

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    let tags: string[] = []

    const isSentimentLike = (tag: string): boolean => {
      const t = tag.toLowerCase().trim()
      const banned = new Set([
        'positive', 'negative', 'neutral', 'mixed',
        'joy', 'sadness', 'anger', 'fear', 'disgust', 'surprise', 'trust', 'anticipation', 'confusion', 'frustration', 'excitement', 'concern', 'gratitude'
      ])
      return banned.has(t)
    }

    // If we have AssemblyAI sentiment data, use it to enhance tag generation
    if (sentiment && emotions && highlights) {
      console.log('Generate Tags API: Using AssemblyAI enhanced context')
      
      // Extract meaningful words from the text
      const words = text.toLowerCase().split(/\s+/)
      const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'])
      
      const meaningfulWords = words.filter((word: string) => 
        word.length > 3 && 
        !commonWords.has(word) && 
        /^[a-zA-Z]+$/.test(word)
      )
      
      // Get unique meaningful words
      const uniqueWords = Array.from(new Set(meaningfulWords))
      
      // Combine meaningful words with highlights for intelligent tagging
      const allPotentialTags = [
        ...uniqueWords.slice(0, 2), // Top 2 meaningful words
        ...highlights.slice(0, 1), // Top highlight
        ...emotions.slice(0, 1) // Top emotion (but only if it's not just "neutral")
      ].filter((tag: string) => tag && tag.length > 0 && tag !== 'neutral')
      
      // Remove duplicates and limit to 4 tags
      tags = Array.from(new Set(allPotentialTags)).slice(0, 4)
      
    } else {
      // Manual text entry: Prefer GPT-4 analysis when available; fallback to basic method
      if (process.env.OPENAI_API_KEY) {
        try {
          console.log('Generate Tags API: Using GPT-4 analysis for manual text')
          const analysis = await WhisperService.generateTagsWithGPT4(text)
          const aiTags = Array.isArray(analysis.tags) ? analysis.tags : []
          tags = Array.from(new Set(aiTags
            .map(t => t.trim())
            .filter(t => t.length > 0 && !isSentimentLike(t))
          )).slice(0, 4)
        } catch (err) {
          console.error('Generate Tags API: GPT-4 analysis failed, falling back to basic method:', err)
        }
      }

      if (tags.length === 0) {
        console.log('Generate Tags API: Using basic text analysis (fallback)')
        const words = text.toLowerCase().split(/\s+/)
        const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'])
        const meaningfulWords = words.filter((word: string) => 
          word.length > 3 && 
          !commonWords.has(word) && 
          /^[a-zA-Z]+$/.test(word)
        )
        const uniqueWords = Array.from(new Set(meaningfulWords))
        tags = uniqueWords.filter(w => !isSentimentLike(w)).slice(0, 4)
      }
    }
    
    // If no meaningful tags found, use default tags
    if (tags.length === 0) {
      tags.push('text-entry', 'manual')
    }
    
    res.status(200).json({ tags })
  } catch (error) {
    console.error('Error generating tags:', error)
    res.status(500).json({ error: 'Failed to generate tags' })
  }
} 