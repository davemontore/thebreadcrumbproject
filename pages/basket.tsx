import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { FirebaseAuthService } from '../lib/firebase-auth'
import { FirebaseService, JournalEntry } from '../lib/firebase-service'

export default function Basket() {
  const [breadcrumbs, setBreadcrumbs] = useState<JournalEntry[]>([])
  const [user, setUser] = useState<boolean>(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
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
      
      // Load breadcrumbs from database
      try {
        const entries = await FirebaseService.getEntries()
        console.log('Basket: Loaded entries:', entries)
        setBreadcrumbs(entries)
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
        setBreadcrumbs(entries)
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
        <title>Entries - Write Here. Right Now</title>
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
              <h1 className="text-3xl sm:text-4xl font-bold text-cream" style={{ fontFamily: 'IM Fell Double Pica, serif' }}>Entries</h1>
            </div>
          </div>

          {/* Breadcrumbs Display */}
          {breadcrumbs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-cream-60 text-lg mb-4">No breadcrumbs yet.</p>
              <p className="text-cream-40">Start recording or writing to leave your first trace.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {breadcrumbs.map((breadcrumb) => (
                <div key={breadcrumb.id} className="bg-cream-5 border border-cream-10 rounded-lg p-6">
                  {editingId === breadcrumb.id ? (
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
                      {/* Title at the top */}
                      {breadcrumb.title && (
                        <h3 className="text-lg font-semibold text-cream mb-2">{breadcrumb.title}</h3>
                      )}
                      
                      {/* Date underneath title */}
                      <div className="text-sm text-cream-60 mb-3" style={{ fontFamily: 'Special Elite, monospace' }}>
                        {new Date(breadcrumb.timestamp).toLocaleDateString('en-US', { 
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric'
                        })}
                      </div>
                      
                      {/* Tags below date */}
                      {breadcrumb.tags && breadcrumb.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {breadcrumb.tags.slice(0, 4).map((tag, index) => (
                            <span key={index} className="text-xs bg-cream-10 text-cream-80 px-2 py-1 rounded-full" style={{ fontFamily: 'Cutive Mono, monospace' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Edit button and entry text */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="text-cream leading-relaxed">
                            {expandedItems.has(breadcrumb.id) ? (
                              <div>
                                <p className="whitespace-pre-wrap">{breadcrumb.text}</p>
                                <button
                                  onClick={() => toggleExpanded(breadcrumb.id)}
                                  className="text-sm text-cream-60 hover:text-cream-80 mt-2 underline"
                                >
                                  See Less
                                </button>
                              </div>
                            ) : (
                              <div>
                                <p className="whitespace-pre-wrap line-clamp-3">{breadcrumb.text}</p>
                                {isLongerThanPreview(breadcrumb.text) && (
                                  <button
                                    onClick={() => toggleExpanded(breadcrumb.id)}
                                    className="text-sm text-cream-60 hover:text-cream-80 mt-2 underline"
                                  >
                                    See More
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => startEditing(breadcrumb)}
                          className="text-xs bg-cream-10 text-cream-80 px-2 py-1 rounded-full hover:bg-cream-20 transition-colors ml-2 flex-shrink-0"
                          style={{ fontFamily: 'Cutive Mono, monospace' }}
                        >
                          Edit
                        </button>
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