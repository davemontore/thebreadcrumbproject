import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface SearchEntry {
  id: string
  text: string
  title: string
  tags: string[]
  timestamp: string
}

interface SearchRequest {
  query: string
  entries: SearchEntry[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' })
  }

  try {
    const { query, entries }: SearchRequest = req.body

    if (!query || !entries || entries.length === 0) {
      return res.status(400).json({ error: 'Invalid request data' })
    }

    console.log('Search API: Processing query:', query, 'with', entries.length, 'entries')

    // Create a context-aware search prompt
    const searchPrompt = `You are a helpful assistant that searches through journal entries to find relevant matches based on a user's query.

The user is searching for entries that match: "${query}"

Here are the available journal entries (each entry has an ID, text content, title, tags, and timestamp):

${entries.map(entry => `
Entry ID: ${entry.id}
Title: ${entry.title || 'No title'}
Tags: ${entry.tags.join(', ') || 'No tags'}
Text: ${entry.text.substring(0, 500)}${entry.text.length > 500 ? '...' : ''}
`).join('\n')}

Your task is to find entries that are relevant to the user's query. Consider:
1. Exact keyword matches in text, title, or tags
2. Semantic similarity and context
3. Related themes, emotions, or topics
4. People, places, or events mentioned
5. Sentiment or mood that matches the query

Return ONLY a JSON array of entry IDs that match the query, ordered by relevance (most relevant first). 
If no entries match, return an empty array.

Example response format: ["entry_id_1", "entry_id_2", "entry_id_3"]

Return only the JSON array, no additional text or explanation.`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a search assistant that returns only JSON arrays of entry IDs.'
        },
        {
          role: 'user',
          content: searchPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.1,
    })

    const result = response.choices[0]?.message?.content || '[]'
    console.log('Search API: Raw LLM response:', result)

    // Parse the JSON response
    let matchingEntryIds: string[] = []
    try {
      matchingEntryIds = JSON.parse(result)
      if (!Array.isArray(matchingEntryIds)) {
        matchingEntryIds = []
      }
    } catch (error) {
      console.error('Search API: Failed to parse LLM response:', error)
      matchingEntryIds = []
    }

    // Filter to only include valid entry IDs
    const validEntryIds = entries.map(entry => entry.id)
    const filteredIds = matchingEntryIds.filter(id => validEntryIds.includes(id))

    console.log('Search API: Returning', filteredIds.length, 'matching entries')
    res.status(200).json({ matchingEntryIds: filteredIds })

  } catch (error) {
    console.error('Search API: Error:', error)
    res.status(500).json({ error: 'Search failed' })
  }
} 