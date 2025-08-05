import { NextApiRequest, NextApiResponse } from 'next'
import { AssemblyAIService } from '../../lib/assemblyai'
import formidable, { Fields, Files } from 'formidable'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check if AssemblyAI API key is configured
  if (!process.env.ASSEMBLYAI_API_KEY) {
    console.error('AssemblyAI Transcribe API: ASSEMBLYAI_API_KEY is not configured')
    return res.status(500).json({ error: 'AssemblyAI API key not configured' })
  }

  try {
    console.log('AssemblyAI Transcribe API: Starting audio processing...')
    
    // Parse FormData using formidable
    const form = formidable({
      maxFileSize: 25 * 1024 * 1024, // 25MB max
      allowEmptyFiles: false,
    })

    form.parse(req, async (err: any, fields: Fields, files: Files) => {
      if (err) {
        console.error('AssemblyAI Transcribe API: Form parsing error:', err)
        return res.status(400).json({ error: 'Failed to parse form data' })
      }

      try {
        console.log('AssemblyAI Transcribe API: Form parsed successfully')

        const audioFile = files.audio
        if (!audioFile || Array.isArray(audioFile) && audioFile.length === 0) {
          console.error('AssemblyAI Transcribe API: No audio file found in request')
          return res.status(400).json({ error: 'No audio file provided' })
        }

        // Handle both single file and array of files
        const file = Array.isArray(audioFile) ? audioFile[0] : audioFile
        
        console.log('AssemblyAI Transcribe API: Audio file details:', {
          originalName: file.originalFilename,
          size: file.size,
          mimetype: file.mimetype,
          filepath: file.filepath
        })

        if (!file.size || file.size === 0) {
          console.error('AssemblyAI Transcribe API: Audio file is empty')
          return res.status(400).json({ error: 'Audio file is empty' })
        }

        // Read the file
        const fs = require('fs')
        const audioBuffer = fs.readFileSync(file.filepath)
        console.log('AssemblyAI Transcribe API: Audio buffer size:', audioBuffer.length)

        // Transcribe audio using AssemblyAI
        console.log('AssemblyAI Transcribe API: Starting transcription...')
        const transcription = await AssemblyAIService.transcribeAudioFile(audioBuffer)
        console.log('AssemblyAI Transcribe API: Transcription completed:', transcription)

        if (!transcription || transcription.trim() === '') {
          console.warn('AssemblyAI Transcribe API: Empty transcription received')
          return res.status(200).json({
            transcription: 'No speech detected',
            tags: ['no-speech']
          })
        }

        // Generate tags using OpenAI (reusing existing functionality)
        console.log('AssemblyAI Transcribe API: Generating tags...')
        const { WhisperService } = await import('../../lib/whisper')
        const tags = await WhisperService.generateTags(transcription)
        console.log('AssemblyAI Transcribe API: Tags generated:', tags)

        res.status(200).json({
          transcription,
          tags,
        })
      } catch (error) {
        console.error('AssemblyAI Transcribe API: Error processing audio:', error)
        if (error instanceof Error) {
          if (error.message.includes('API key')) {
            res.status(500).json({ error: 'Invalid AssemblyAI API key' })
          } else if (error.message.includes('quota')) {
            res.status(500).json({ error: 'AssemblyAI API quota exceeded' })
          } else if (error.message.includes('Invalid audio format')) {
            res.status(500).json({ error: `Invalid audio format: ${error.message}` })
          } else {
            res.status(500).json({ error: `Transcription failed: ${error.message}` })
          }
        } else {
          res.status(500).json({ error: 'Failed to process audio' })
        }
      }
    })

  } catch (error) {
    console.error('AssemblyAI Transcribe API: Error handling request:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 