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

  try {
    // Get the audio data from the request
    const chunks: Buffer[] = []
    
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })

    req.on('end', async () => {
      try {
        const audioBuffer = Buffer.concat(chunks)
        const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' })

        // Transcribe audio
        const transcription = await WhisperService.transcribeAudio(audioBlob)

        // Generate tags
        const tags = await WhisperService.generateTags(transcription)

        res.status(200).json({
          transcription,
          tags,
        })
      } catch (error) {
        console.error('Error processing audio:', error)
        res.status(500).json({ error: 'Failed to process audio' })
      }
    })
  } catch (error) {
    console.error('Error handling request:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 