import { NextApiRequest, NextApiResponse } from 'next'
import { WhisperService } from '../../lib/whisper'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not configured')
    return res.status(500).json({ error: 'OpenAI API key not configured' })
  }

  try {
    console.log('Transcribe API: Starting audio processing...')
    
    // Get the audio data from the request
    const chunks: Buffer[] = []
    
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })

    req.on('end', async () => {
      try {
        console.log('Transcribe API: Received audio data, chunks:', chunks.length)
        
        const audioBuffer = Buffer.concat(chunks)
        console.log('Transcribe API: Audio buffer size:', audioBuffer.length)
        
        if (audioBuffer.length === 0) {
          console.error('Transcribe API: No audio data received')
          return res.status(400).json({ error: 'No audio data received' })
        }

        // For FormData, we'll use webm as the default format since that's what we're sending
        const audioType = 'audio/webm'
        console.log('Transcribe API: Using audio type:', audioType)
        
        const audioBlob = new Blob([audioBuffer], { type: audioType })
        console.log('Transcribe API: Audio blob created, size:', audioBlob.size)

        // Transcribe audio
        console.log('Transcribe API: Starting transcription...')
        const transcription = await WhisperService.transcribeAudio(audioBlob)
        console.log('Transcribe API: Transcription completed:', transcription)

        if (!transcription || transcription.trim() === '') {
          console.warn('Transcribe API: Empty transcription received')
          return res.status(200).json({
            transcription: 'No speech detected',
            tags: ['no-speech']
          })
        }

        // Generate tags
        console.log('Transcribe API: Generating tags...')
        const tags = await WhisperService.generateTags(transcription)
        console.log('Transcribe API: Tags generated:', tags)

        res.status(200).json({
          transcription,
          tags,
        })
      } catch (error) {
        console.error('Transcribe API: Error processing audio:', error)
        if (error instanceof Error) {
          if (error.message.includes('API key')) {
            res.status(500).json({ error: 'Invalid OpenAI API key' })
          } else if (error.message.includes('quota')) {
            res.status(500).json({ error: 'OpenAI API quota exceeded' })
          } else if (error.message.includes('Invalid audio format')) {
            res.status(500).json({ error: 'Invalid audio format. Please try recording again.' })
          } else {
            res.status(500).json({ error: `Transcription failed: ${error.message}` })
          }
        } else {
          res.status(500).json({ error: 'Failed to process audio' })
        }
      }
    })

    req.on('error', (error) => {
      console.error('Transcribe API: Request error:', error)
      res.status(500).json({ error: 'Request error' })
    })
  } catch (error) {
    console.error('Transcribe API: Error handling request:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 