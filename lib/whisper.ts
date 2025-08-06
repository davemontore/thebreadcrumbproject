import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class WhisperService {
  static async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      console.log('WhisperService: Starting transcription, blob size:', audioBlob.size, 'type:', audioBlob.type)
      
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured')
      }

      // Validate the audio blob
      if (audioBlob.size === 0) {
        throw new Error('Audio blob is empty')
      }

      if (audioBlob.size > 25 * 1024 * 1024) {
        throw new Error('Audio file is too large (max 25MB)')
      }

      // Check if the blob has a valid audio type
      if (!audioBlob.type || !audioBlob.type.startsWith('audio/')) {
        console.warn('WhisperService: Blob has invalid type:', audioBlob.type, 'forcing audio/webm')
        // Recreate the blob with proper type
        audioBlob = new Blob([audioBlob], { type: 'audio/webm' })
      }

      // Convert blob to file-like object
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.webm')
      formData.append('model', 'whisper-1')

      console.log('WhisperService: Sending request to OpenAI with blob type:', audioBlob.type)
      console.log('WhisperService: Blob details:', {
        size: audioBlob.size,
        type: audioBlob.type,
        lastModified: new Date().toISOString()
      })
      
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
        console.error('WhisperService: Full error details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        })
        
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key')
        } else if (response.status === 429) {
          throw new Error('OpenAI API quota exceeded')
        } else if (response.status === 400) {
          throw new Error(`Invalid audio format or file: ${errorText}`)
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

  static async generateTagsWithGPT4(text: string): Promise<{
    tags: string[];
    sentiment: string;
    emotions: string[];
    highlights: string[];
  }> {
    try {
      console.log('WhisperService: Starting GPT-4 analysis for text:', text.substring(0, 100) + '...')
      
      if (!process.env.OPENAI_API_KEY) {
        console.warn('WhisperService: OpenAI API key not configured, skipping GPT-4 analysis')
        return {
          tags: [],
          sentiment: 'neutral',
          emotions: [],
          highlights: []
        }
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an intelligent journal analysis assistant. Analyze the given text and provide:

1. TAGS: Generate 2-4 intelligent, topic-based tags (not just sentiment words). Focus on people, places, activities, themes, or specific topics mentioned. Return as comma-separated list.

2. SENTIMENT: Overall emotional tone (positive, negative, neutral, mixed)

3. EMOTIONS: Specific emotions detected (e.g., joy, frustration, excitement, concern, gratitude, etc.) - up to 3 emotions

4. HIGHLIGHTS: Key phrases or important points mentioned - up to 2 highlights

Return your response in this exact JSON format:
{
  "tags": ["tag1", "tag2", "tag3"],
  "sentiment": "positive",
  "emotions": ["emotion1", "emotion2"],
  "highlights": ["highlight1", "highlight2"]
}

Only return valid JSON, no additional text.`
          },
          {
            role: 'user',
            content: `Analyze this journal entry: "${text}"`
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      })

      const analysisText = response.choices[0]?.message?.content || ''
      console.log('WhisperService: Raw GPT-4 analysis response:', analysisText)
      
      try {
        const analysis = JSON.parse(analysisText)
        
        // Validate and clean the response
        const tags = Array.isArray(analysis.tags) ? analysis.tags.slice(0, 4) : []
        const sentiment = analysis.sentiment || 'neutral'
        const emotions = Array.isArray(analysis.emotions) ? analysis.emotions.slice(0, 3) : []
        const highlights = Array.isArray(analysis.highlights) ? analysis.highlights.slice(0, 2) : []
        
        console.log('WhisperService: GPT-4 analysis completed:', { tags, sentiment, emotions, highlights })
        
        return {
          tags,
          sentiment,
          emotions,
          highlights
        }
      } catch (parseError) {
        console.error('WhisperService: Error parsing GPT-4 response:', parseError)
        console.error('WhisperService: Raw response was:', analysisText)
        
        // Fallback: generate basic tags
        const fallbackTags = await this.generateTags(text)
        return {
          tags: fallbackTags,
          sentiment: 'neutral',
          emotions: [],
          highlights: []
        }
      }
    } catch (error) {
      console.error('WhisperService: Error with GPT-4 analysis:', error)
      return {
        tags: [],
        sentiment: 'neutral',
        emotions: [],
        highlights: []
      }
    }
  }
} 