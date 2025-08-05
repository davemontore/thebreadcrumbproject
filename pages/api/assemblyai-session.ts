import { NextApiRequest, NextApiResponse } from 'next'
import { AssemblyAIService } from '../../lib/assemblyai'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('AssemblyAI Session API: Creating new session...')
    
    if (!process.env.ASSEMBLYAI_API_KEY) {
      console.error('AssemblyAI Session API: ASSEMBLYAI_API_KEY is not configured')
      return res.status(500).json({ error: 'AssemblyAI API key not configured' })
    }

    const { sessionId, token } = await AssemblyAIService.createRealtimeSession()
    
    console.log('AssemblyAI Session API: Session created successfully:', sessionId)
    
    res.status(200).json({
      sessionId,
      token,
      message: 'Session created successfully'
    })
  } catch (error) {
    console.error('AssemblyAI Session API: Error creating session:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        res.status(500).json({ error: 'Invalid AssemblyAI API key' })
      } else if (error.message.includes('quota')) {
        res.status(500).json({ error: 'AssemblyAI API quota exceeded' })
      } else {
        res.status(500).json({ error: `Session creation failed: ${error.message}` })
      }
    } else {
      res.status(500).json({ error: 'Failed to create session' })
    }
  }
} 