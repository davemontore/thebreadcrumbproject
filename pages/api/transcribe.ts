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
    console.error('ASSEMBLYAI_API_KEY is not configured')
    return res.status(500).json({ error: 'AssemblyAI API key not configured' })
  }

  try {
    console.log('Transcribe API: Starting audio processing...')
    
    // Parse FormData using formidable
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB max (increased for longer recordings)
      allowEmptyFiles: false,
    })

    form.parse(req, async (err: any, fields: Fields, files: Files) => {
      if (err) {
        console.error('Transcribe API: Form parsing error:', err)
        return res.status(400).json({ error: 'Failed to parse form data' })
      }

      try {
        console.log('Transcribe API: Form parsed successfully')
        console.log('Transcribe API: Fields:', fields)
        console.log('Transcribe API: Files:', files)

        const audioFile = files.audio
        if (!audioFile || Array.isArray(audioFile) && audioFile.length === 0) {
          console.error('Transcribe API: No audio file found in request')
          return res.status(400).json({ error: 'No audio file provided' })
        }

        // Handle both single file and array of files
        const file = Array.isArray(audioFile) ? audioFile[0] : audioFile
        
        console.log('Transcribe API: Audio file details:', {
          originalName: file.originalFilename,
          size: file.size,
          mimetype: file.mimetype,
          filepath: file.filepath
        })

        if (!file.size || file.size === 0) {
          console.error('Transcribe API: Audio file is empty')
          return res.status(400).json({ error: 'Audio file is empty' })
        }

        // Read the file
        const fs = require('fs')
        const audioBuffer = fs.readFileSync(file.filepath)
        console.log('Transcribe API: Audio buffer size:', audioBuffer.length)

        // Create blob with proper type
        const audioType = file.mimetype || 'audio/webm'
        console.log('Transcribe API: Using audio type:', audioType)
        
        const audioBlob = new Blob([audioBuffer], { type: audioType })
        console.log('Transcribe API: Audio blob created, size:', audioBlob.size)

        // Transcribe audio using AssemblyAI with sentiment analysis
        console.log('Transcribe API: Starting AssemblyAI transcription with sentiment analysis...')
        const transcriptionResult = await AssemblyAIService.transcribeAudioFile(audioBuffer)
        console.log('Transcribe API: AssemblyAI transcription completed:', transcriptionResult)
        
        const transcription = transcriptionResult.text

        if (!transcription || transcription.trim() === '') {
          console.warn('Transcribe API: Empty transcription received')
          return res.status(200).json({
            transcription: 'No speech detected',
            tags: ['no-speech']
          })
        }

        // Use sentiment and emotions from AssemblyAI for tags
        console.log('Transcribe API: Using AssemblyAI sentiment data...')
        
        // Combine sentiment and emotions for better searchability
        const allTags = [
          transcriptionResult.sentiment,
          ...transcriptionResult.emotions,
          ...transcriptionResult.highlights.slice(0, 2) // Add top 2 highlights as tags
        ].filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates

        res.status(200).json({
          transcription,
          tags: allTags,
          sentiment: transcriptionResult.sentiment,
          emotions: transcriptionResult.emotions,
          highlights: transcriptionResult.highlights
        })
      } catch (error) {
        console.error('Transcribe API: Error processing audio:', error)
        if (error instanceof Error) {
          if (error.message.includes('API key')) {
            res.status(500).json({ error: 'Invalid AssemblyAI API key' })
          } else if (error.message.includes('quota')) {
            res.status(500).json({ error: 'AssemblyAI API quota exceeded' })
          } else if (error.message.includes('Invalid audio format')) {
            console.error('Transcribe API: Audio format error details:', error.message)
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
    console.error('Transcribe API: Error handling request:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 