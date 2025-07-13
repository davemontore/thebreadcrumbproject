import { NextApiRequest, NextApiResponse } from 'next'
import { verify } from 'jsonwebtoken'
import { parse } from 'cookie'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify authentication
  const cookies = parse(req.headers.cookie || '')
  const token = cookies['auth-token']

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    verify(token, JWT_SECRET)
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Check if OpenAI API key is configured
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' })
  }

  try {
    // Get the audio file from the request
    const audioBlob = req.body

    if (!audioBlob) {
      return res.status(400).json({ error: 'Audio data is required' })
    }

    // Convert base64 to buffer if needed
    let audioBuffer: Buffer
    if (typeof audioBlob === 'string' && audioBlob.startsWith('data:')) {
      const base64Data = audioBlob.split(',')[1]
      audioBuffer = Buffer.from(base64Data, 'base64')
    } else {
      audioBuffer = Buffer.from(audioBlob)
    }

    // Create form data for OpenAI
    const formData = new FormData()
    formData.append('file', new Blob([audioBuffer], { type: 'audio/wav' }), 'recording.wav')
    formData.append('model', 'whisper-1')
    formData.append('response_format', 'json')

    // Send to OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const result = await response.json()
    
    res.status(200).json({ 
      success: true, 
      transcription: result.text 
    })

  } catch (error) {
    console.error('Transcription error:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Transcription failed' 
    })
  }
} 