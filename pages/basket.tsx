import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { FirebaseAuthService } from '../lib/firebase-auth'
import { FirebaseService, JournalEntry } from '../lib/firebase-service'

export default function Basket() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [user, setUser] = useState<boolean>(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<JournalEntry[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentOffset, setCurrentOffset] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      console.log('Mobile detection:', { width: window.innerWidth, isMobile: mobile })
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Check authentication
    const checkUser = async () => {
      if (!FirebaseAuthService.isAuthenticated()) {
        router.push('/login')
        return
      }
      
      setUser(true)
      
      // Load entries from database
      try {
        const entries = await FirebaseService.getEntries()
        console.log('Basket: Loaded entries:', entries)
        setEntries(entries)
      } catch (error) {
        console.error('Error loading entries:', error)
      }
    }

    checkUser()
  }, [router])

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const startEditing = (entry: JournalEntry) => {
    setEditingId(entry.id)
    setEditText(entry.text)
    setEditTitle(entry.title || '')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditText('')
    setEditTitle('')
  }

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return

    setIsSubmitting(true)
    try {
      // Generate new tags for the edited text
      const response = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: editText.trim() }),
      })

      let newTags: string[] = []
      
      if (response.ok) {
        const { tags: generatedTags } = await response.json()
        newTags = generatedTags
      }

      const success = await FirebaseService.updateEntry(editingId, editText.trim(), editTitle.trim(), newTags)
      
      if (success) {
        // Refresh entries
        const entries = await FirebaseService.getEntries()
        setEntries(entries)
        cancelEditing()
      } else {
        alert('Failed to update entry')
      }
    } catch (error) {
      console.error('Error updating entry:', error)
      alert('Error updating entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLongerThanPreview = (text: string): boolean => {
    // Check if text has more than 3 lines by counting actual line breaks
    const lines = text.split('\n')
    if (lines.length > 3) return true
    
    // Also check if text is very long (likely to wrap to more than 3 lines on mobile)
    // Rough estimate: if text is longer than ~120 characters, it's likely to wrap
    if (text.length > 120) return true
    
    return false
  }

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchQuery('')
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setSearchQuery(query)

    try {
      const response = await fetch('/api/search-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit: 20, offset: 0 }),
      })

      if (response.ok) {
        const { entries: results, total, hasMore: moreResults } = await response.json()
        setSearchResults(results)
        setHasMore(moreResults)
        setCurrentOffset(20)
      } else {
        console.error('Search failed:', response.status)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Load more search results
  const loadMoreSearchResults = async () => {
    if (!searchQuery.trim() || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const response = await fetch('/api/search-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery, 
          limit: 20, 
          offset: currentOffset 
        }),
      })

      if (response.ok) {
        const { entries: moreResults, hasMore: moreResultsAvailable } = await response.json()
        setSearchResults(prev => [...prev, ...moreResults])
        setHasMore(moreResultsAvailable)
        setCurrentOffset(prev => prev + 20)
      }
    } catch (error) {
      console.error('Error loading more results:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Infinite scroll for regular entries
  const loadMoreEntries = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      // For now, we'll load all entries at once since Firebase doesn't have built-in pagination
      // In a production app, you'd implement proper pagination
      const allEntries = await FirebaseService.getEntries()
      setEntries(allEntries)
      setHasMore(false)
    } catch (error) {
      console.error('Error loading more entries:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Show loading while checking authentication
  if (!user) {
    return (
      <main className="min-h-screen bg-black text-cream flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-cream-80">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <>
      <Head>
        <title>Basket - Write Here. Right Now</title>
        <meta name="description" content="View your journal entries" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </Head>

      <main className="min-h-screen bg-black text-cream p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center mb-12">
            <div className="flex justify-end w-full mb-8">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-cream-10 border border-cream-30 rounded-lg text-cream hover:bg-cream-20 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl font-bold text-cream" style={{ fontFamily: 'IM Fell Double Pica, serif' }}>Basket</h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="search..."
                value={searchQuery}
                onChange={(e) => {
                  const query = e.target.value
                  setSearchQuery(query)
                  // Debounce search
                  clearTimeout((window as any).searchTimeout)
                  ;(window as any).searchTimeout = setTimeout(() => {
                    handleSearch(query)
                  }, 300)
                }}
                className="w-full p-3 border border-cream-30 rounded-lg bg-cream-10 text-cream placeholder-cream-60 focus:ring-2 focus:ring-cream-50 focus:border-transparent transition-all duration-200"
                style={{ fontFamily: 'Cutive Mono, monospace' }}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cream-60">
                  Searching...
                </div>
              )}
            </div>
          </div>

          {/* Entries Display */}
          {searchQuery ? (
            // Search results
            searchResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-cream-60 text-lg mb-4">No entries found for "{searchQuery}"</p>
                <p className="text-cream-40">Try searching for different words, emotions, or topics.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((entry) => (
                  <div key={entry.id} className="bg-black border border-cream-10 rounded-lg p-6">
                    {editingId === entry.id ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Title (optional)"
                          className="w-full p-2 border border-cream-30 rounded bg-cream-10 text-cream"
                          style={{ fontFamily: 'Cutive Mono, monospace' }}
                        />
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-4 border border-cream-30 rounded resize-none bg-cream-10 text-cream"
                          style={{ fontFamily: 'Cutive Mono, monospace' }}
                          rows={6}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={!editText.trim() || isSubmitting}
                            className="px-4 py-2 bg-cream-20 text-cream rounded hover:bg-cream-30 disabled:opacity-50 transition-colors"
                            style={{ fontFamily: 'Cutive Mono, monospace' }}
                          >
                            {isSubmitting ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-4 py-2 bg-cream-10 text-cream-60 rounded hover:bg-cream-20 transition-colors"
                            style={{ fontFamily: 'Cutive Mono, monospace' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Title and Edit button at the top */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            {entry.title && (
                              <h3 className="text-lg font-semibold text-cream" style={{ fontFamily: 'IM Fell Double Pica, serif' }}>{entry.title}</h3>
                            )}
                          </div>
                          <button
                            onClick={() => startEditing(entry)}
                            className="text-xs bg-cream-10 text-cream-80 px-2 py-1 rounded-full hover:bg-cream-20 transition-colors flex-shrink-0 ml-2"
                            style={{ fontFamily: 'Cutive Mono, monospace' }}
                          >
                            Edit
                          </button>
                        </div>
                        
                        {/* Date underneath title */}
                        <div className="text-sm text-cream-60 mb-3" style={{ fontFamily: 'Special Elite, monospace' }}>
                          {new Date(entry.timestamp).toLocaleDateString('en-US', { 
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric'
                          })}
                        </div>
                        
                        {/* Sentiment and emotions */}
                        {(entry.sentiment || entry.emotions?.length) && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {entry.sentiment && (
                              <span className="text-xs bg-cream-20 text-cream px-2 py-1 rounded-full" style={{ fontFamily: 'Cutive Mono, monospace' }}>
                                {entry.sentiment}
                              </span>
                            )}
                            {entry.emotions?.map((emotion, index) => (
                              <span key={index} className="text-xs bg-cream-15 text-cream-80 px-2 py-1 rounded-full" style={{ fontFamily: 'Cutive Mono, monospace' }}>
                                {emotion}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Tags below date */}
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {entry.tags.slice(0, 4).map((tag, index) => (
                              <span key={index} className="text-xs bg-cream-10 text-cream-80 px-2 py-1 rounded-full" style={{ fontFamily: 'Cutive Mono, monospace' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Entry text */}
                        <div className="text-cream leading-relaxed" style={{ fontFamily: 'IM Fell Double Pica, serif' }}>
                          {expandedItems.has(entry.id) ? (
                            <div>
                              <p className="whitespace-pre-wrap">{entry.text}</p>
                              <button
                                onClick={() => toggleExpanded(entry.id)}
                                className="text-sm text-cream-60 hover:text-cream-80 mt-2 underline"
                              >
                                See Less
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p className="whitespace-pre-wrap line-clamp-3">{entry.text}</p>
                              {isLongerThanPreview(entry.text) && (
                                <button
                                  onClick={() => toggleExpanded(entry.id)}
                                  className="text-sm text-cream-60 hover:text-cream-80 mt-2 underline"
                                >
                                  See More
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
                
                {/* Load more search results */}
                {hasMore && (
                  <div className="text-center py-4">
                    <button
                      onClick={loadMoreSearchResults}
                      disabled={isLoadingMore}
                      className="px-6 py-2 bg-cream-10 text-cream rounded-lg hover:bg-cream-20 disabled:opacity-50 transition-colors border border-cream-30"
                      style={{ fontFamily: 'Cutive Mono, monospace' }}
                    >
                      {isLoadingMore ? 'Loading...' : 'Load More Results'}
                    </button>
                  </div>
                )}
              </div>
            )
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-cream-60 text-lg mb-4">No entries yet.</p>
              <p className="text-cream-40">Start recording or writing to leave your first trace.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-black border border-cream-10 rounded-lg p-6">
                  {editingId === entry.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title (optional)"
                        className="w-full p-2 border border-cream-30 rounded bg-cream-10 text-cream"
                        style={{ fontFamily: 'Cutive Mono, monospace' }}
                      />
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-4 border border-cream-30 rounded resize-none bg-cream-10 text-cream"
                        style={{ fontFamily: 'Cutive Mono, monospace' }}
                        rows={6}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={!editText.trim() || isSubmitting}
                          className="px-4 py-2 bg-cream-20 text-cream rounded hover:bg-cream-30 disabled:opacity-50 transition-colors"
                          style={{ fontFamily: 'Cutive Mono, monospace' }}
                        >
                          {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-4 py-2 bg-cream-10 text-cream-60 rounded hover:bg-cream-20 transition-colors"
                          style={{ fontFamily: 'Cutive Mono, monospace' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Title and Edit button at the top */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          {entry.title && (
                            <h3 className="text-lg font-semibold text-cream" style={{ fontFamily: 'IM Fell Double Pica, serif' }}>{entry.title}</h3>
                          )}
                        </div>
                        <button
                          onClick={() => startEditing(entry)}
                          className="text-xs bg-cream-10 text-cream-80 px-2 py-1 rounded-full hover:bg-cream-20 transition-colors flex-shrink-0 ml-2"
                          style={{ fontFamily: 'Cutive Mono, monospace' }}
                        >
                          Edit
                        </button>
                      </div>
                      
                      {/* Date underneath title */}
                      <div className="text-sm text-cream-60 mb-3" style={{ fontFamily: 'Special Elite, monospace' }}>
                        {new Date(entry.timestamp).toLocaleDateString('en-US', { 
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric'
                        })}
                      </div>
                      
                      {/* Tags below date */}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {entry.tags.slice(0, 4).map((tag, index) => (
                            <span key={index} className="text-xs bg-cream-10 text-cream-80 px-2 py-1 rounded-full" style={{ fontFamily: 'Cutive Mono, monospace' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Entry text */}
                      <div className="text-cream leading-relaxed" style={{ fontFamily: 'IM Fell Double Pica, serif' }}>
                        {expandedItems.has(entry.id) ? (
                          <div>
                            <p className="whitespace-pre-wrap">{entry.text}</p>
                            <button
                              onClick={() => toggleExpanded(entry.id)}
                              className="text-sm text-cream-60 hover:text-cream-80 mt-2 underline"
                            >
                              See Less
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="whitespace-pre-wrap line-clamp-3">{entry.text}</p>
                            {isLongerThanPreview(entry.text) && (
                              <button
                                onClick={() => toggleExpanded(entry.id)}
                                className="text-sm text-cream-60 hover:text-cream-80 mt-2 underline"
                              >
                                See More
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
} 