export async function generateTagsWithContext(
  text: string, 
  sentiment?: string, 
  emotions?: string[], 
  highlights?: string[]
): Promise<string[]> {
  let tags: string[] = []

  // If we have AssemblyAI sentiment data, use it to enhance tag generation
  if (sentiment && emotions && highlights) {
    console.log('Generate Tags Helper: Using AssemblyAI enhanced context')
    
    // Extract meaningful words from the text
    const words = text.toLowerCase().split(/\s+/)
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'])
    
    const meaningfulWords = words.filter((word: string) => 
      word.length > 3 && 
      !commonWords.has(word) && 
      /^[a-zA-Z]+$/.test(word)
    )
    
    // Get unique meaningful words
    const uniqueWords = Array.from(new Set(meaningfulWords))
    
    // Combine meaningful words with highlights for intelligent tagging
    const allPotentialTags = [
      ...uniqueWords.slice(0, 2), // Top 2 meaningful words
      ...highlights.slice(0, 1), // Top highlight
      ...emotions.slice(0, 1) // Top emotion (but only if it's not just "neutral")
    ].filter((tag: string) => tag && tag.length > 0 && tag !== 'neutral')
    
    // Remove duplicates and limit to 4 tags
    tags = Array.from(new Set(allPotentialTags)).slice(0, 4)
    
  } else {
    // Fallback to basic text analysis for manual entries
    console.log('Generate Tags Helper: Using basic text analysis')
    const words = text.toLowerCase().split(/\s+/)
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'])
    
    const meaningfulWords = words.filter((word: string) => 
      word.length > 3 && 
      !commonWords.has(word) && 
      /^[a-zA-Z]+$/.test(word)
    )
    
    const uniqueWords = Array.from(new Set(meaningfulWords))
    tags = uniqueWords.slice(0, 4)
  }
  
  // If no meaningful tags found, use default tags
  if (tags.length === 0) {
    tags.push('text-entry', 'manual')
  }

  return tags
} 