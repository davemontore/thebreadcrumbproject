import { NextApiRequest, NextApiResponse } from 'next'
import { AssemblyAIService } from '../../lib/assemblyai'
import { WhisperService } from '../../lib/whisper'
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

  // Check if required API keys are configured
  if (!process.env.ASSEMBLYAI_API_KEY) {
    console.error('ASSEMBLYAI_API_KEY is not configured')
    return res.status(500).json({ error: 'AssemblyAI API key not configured' })
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not configured')
    return res.status(500).json({ error: 'OpenAI API key not configured' })
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

        // Step 1: Transcribe audio using AssemblyAI (for accuracy)
        console.log('Transcribe API: Starting AssemblyAI transcription...')
        const transcriptionResult = await AssemblyAIService.transcribeAudioFile(audioBuffer)
        console.log('Transcribe API: AssemblyAI transcription completed')
        
        const transcription = transcriptionResult.text

        if (!transcription || transcription.trim() === '') {
          console.warn('Transcribe API: Empty transcription received')
          return res.status(200).json({
            transcription: 'No speech detected',
            tags: ['no-speech'],
            sentiment: 'neutral',
            emotions: [],
            highlights: []
          })
        }

        // Step 2: Use OpenAI GPT-4 for intelligent analysis and tagging
        console.log('Transcribe API: Starting OpenAI GPT-4 analysis...')
        
        let tags: string[] = []
        let sentiment = 'neutral'
        let emotions: string[] = []
        let highlights: string[] = []
        
        try {
          // Use GPT-4 for intelligent tag generation and analysis
          const analysisResult = await WhisperService.generateTagsWithGPT4(transcription)
          tags = analysisResult.tags
          sentiment = analysisResult.sentiment
          emotions = analysisResult.emotions
          highlights = analysisResult.highlights
          
          console.log('Transcribe API: GPT-4 analysis completed:', { tags, sentiment, emotions, highlights })
        } catch (error) {
          console.error('Transcribe API: Error with GPT-4 analysis, using AssemblyAI fallback:', error)
          // Fallback: use AssemblyAI data if GPT-4 fails
          tags = [
            ...transcriptionResult.highlights.slice(0, 2),
            ...transcriptionResult.emotions.slice(0, 2)
          ].filter((tag, index, arr) => arr.indexOf(tag) === index && tag.length > 0)
          sentiment = transcriptionResult.sentiment
          emotions = transcriptionResult.emotions
          highlights = transcriptionResult.highlights
        }

        res.status(200).json({
          transcription,
          tags: tags,
          sentiment: sentiment,
          emotions: emotions,
          highlights: highlights
        })
      } catch (error) {
        console.error('Transcribe API: Error processing audio:', error)
        if (error instanceof Error) {
          if (error.message.includes('API key')) {
            if (error.message.includes('AssemblyAI')) {
              res.status(500).json({ error: 'Invalid AssemblyAI API key' })
            } else if (error.message.includes('OpenAI')) {
              res.status(500).json({ error: 'Invalid OpenAI API key' })
            } else {
              res.status(500).json({ error: 'API key configuration error' })
            }
          } else if (error.message.includes('quota')) {
            if (error.message.includes('AssemblyAI')) {
              res.status(500).json({ error: 'AssemblyAI API quota exceeded' })
            } else if (error.message.includes('OpenAI')) {
              res.status(500).json({ error: 'OpenAI API quota exceeded' })
            } else {
              res.status(500).json({ error: 'API quota exceeded' })
            }
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