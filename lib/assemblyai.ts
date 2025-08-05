import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
})

export class AssemblyAIService {
  static async createRealtimeSession(): Promise<{ sessionId: string; token: string }> {
    try {
      console.log('AssemblyAIService: Creating realtime session...')
      
      if (!process.env.ASSEMBLYAI_API_KEY) {
        throw new Error('AssemblyAI API key not configured')
      }

      const session = await client.realtime.createSession({
        sample_rate: 16000,
        audio_format: 'pcm16',
        enable_partials: true,
        enable_entity_detection: true,
        enable_sentiment_analysis: true,
      })

      console.log('AssemblyAIService: Session created successfully:', session.id)
      
      return {
        sessionId: session.id,
        token: session.token
      }
    } catch (error) {
      console.error('AssemblyAIService: Error creating session:', error)
      throw error
    }
  }

  static async transcribeAudioFile(audioBuffer: Buffer): Promise<{
    text: string;
    sentiment: string;
    emotions: string[];
    highlights: string[];
  }> {
    try {
      console.log('AssemblyAIService: Starting file transcription with sentiment analysis...')
      
      if (!process.env.ASSEMBLYAI_API_KEY) {
        throw new Error('AssemblyAI API key not configured')
      }

      const transcript = await client.transcripts.create({
        audio: audioBuffer,
        speaker_labels: true,
        auto_highlights: true,
        entity_detection: true,
        sentiment_analysis: true,
      })

      console.log('AssemblyAIService: Transcription completed with sentiment analysis')
      
      // Extract sentiment and emotions
      const sentiment = transcript.sentiment_analysis?.overall || 'neutral'
      const emotions = transcript.sentiment_analysis?.sentiments?.map(s => s.sentiment) || []
      const highlights = transcript.auto_highlights?.results?.map(h => h.text) || []
      
      return {
        text: transcript.text || '',
        sentiment,
        emotions,
        highlights
      }
    } catch (error) {
      console.error('AssemblyAIService: Error transcribing audio file:', error)
      throw error
    }
  }

  static async getTranscript(transcriptId: string): Promise<any> {
    try {
      console.log('AssemblyAIService: Getting transcript:', transcriptId)
      
      const transcript = await client.transcripts.get(transcriptId)
      return transcript
    } catch (error) {
      console.error('AssemblyAIService: Error getting transcript:', error)
      throw error
    }
  }

  static async deleteSession(sessionId: string): Promise<void> {
    try {
      console.log('AssemblyAIService: Deleting session:', sessionId)
      
      await client.realtime.deleteSession(sessionId)
      console.log('AssemblyAIService: Session deleted successfully')
    } catch (error) {
      console.error('AssemblyAIService: Error deleting session:', error)
      throw error
    }
  }
} 