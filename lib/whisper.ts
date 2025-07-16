import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class WhisperService {
  static async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      console.log('WhisperService: Starting transcription, blob size:', audioBlob.size)
      
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured')
      }

      // Convert blob to file-like object
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.webm')
      formData.append('model', 'whisper-1')

      console.log('WhisperService: Sending request to OpenAI...')
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      })

      console.log('WhisperService: OpenAI response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('WhisperService: OpenAI API error response:', errorText)
        
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key')
        } else if (response.status === 429) {
          throw new Error('OpenAI API quota exceeded')
        } else if (response.status === 400) {
          throw new Error('Invalid audio format or file')
        } else {
          throw new Error(`Whisper API error: ${response.status} - ${errorText}`)
        }
      }

      const result = await response.json()
      console.log('WhisperService: Transcription result:', result)
      
      if (!result.text) {
        console.warn('WhisperService: No text in transcription result')
        return ''
      }

      return result.text
    } catch (error) {
      console.error('WhisperService: Error transcribing audio:', error)
      throw error
    }
  }

  static async generateTags(text: string): Promise<string[]> {
    try {
      console.log('WhisperService: Generating tags for text:', text.substring(0, 100) + '...')
      
      if (!process.env.OPENAI_API_KEY) {
        console.warn('WhisperService: OpenAI API key not configured, skipping tag generation')
        return []
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates relevant tags for journal entries. Focus on: 1) People\'s names mentioned, 2) Main themes or topics discussed, 3) Key events or activities. Generate 2-4 relevant tags. Return only the tags, separated by commas, no additional text or hashtags.'
          },
          {
            role: 'user',
            content: `Generate tags for this journal entry: "${text}"`
          }
        ],
        max_tokens: 50,
        temperature: 0.3,
      })

      const tagsText = response.choices[0]?.message?.content || ''
      console.log('WhisperService: Raw tags response:', tagsText)
      
      const tags = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      const finalTags = tags.slice(0, 4) // Limit to 4 tags maximum
      
      console.log('WhisperService: Generated tags:', finalTags)
      return finalTags
    } catch (error) {
      console.error('WhisperService: Error generating tags:', error)
      return []
    }
  }
} 