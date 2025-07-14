import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class WhisperService {
  static async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Convert blob to file-like object
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.webm')
      formData.append('model', 'whisper-1')

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status}`)
      }

      const result = await response.json()
      return result.text
    } catch (error) {
      console.error('Error transcribing audio:', error)
      throw error
    }
  }

  static async generateTags(text: string): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates relevant hashtags for journal entries. Generate 3-5 relevant hashtags based on the content. Return only the hashtags, separated by commas, no additional text.'
          },
          {
            role: 'user',
            content: `Generate hashtags for this journal entry: "${text}"`
          }
        ],
        max_tokens: 50,
        temperature: 0.3,
      })

      const tagsText = response.choices[0]?.message?.content || ''
      return tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    } catch (error) {
      console.error('Error generating tags:', error)
      return []
    }
  }
} 