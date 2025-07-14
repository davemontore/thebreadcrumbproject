import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { SimpleAuth } from '../lib/auth'
import { JournalService } from '../lib/database'
import { Breadcrumb } from '../lib/supabase'

export default function Basket() {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
  const [user, setUser] = useState<boolean>(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const checkUser = async () => {
      if (!SimpleAuth.isAuthenticated()) {
        router.push('/login')
        return
      }
      
      setUser(true)
      
      // Load breadcrumbs from database
      try {
        const entries = await JournalService.getEntries()
        setBreadcrumbs(entries.map(entry => ({
          id: entry.id,
          user_id: 'default',
          content: entry.content,
          created_at: entry.created_at,
          updated_at: entry.updated_at,
          type: 'text' as const,
          tags: []
        })))
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

  const getPreviewText = (text: string): string => {
    const lines = text.split('\n')
    const previewLines = lines.slice(0, 3)
    return previewLines.join('\n')
  }

  const isLongerThanPreview = (text: string): boolean => {
    const lines = text.split('\n')
    return lines.length > 3 || text.length > 200
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
        <title>Breadcrumb Basket - The Breadcrumb Project</title>
        <meta name="description" content="View your recorded thoughts and memories" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-black text-cream p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex justify-end w-full mb-4">
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
              <h1 className="text-3xl sm:text-4xl font-bold text-cream">Breadcrumb Basket</h1>
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
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm text-cream-60">
                      {new Date(breadcrumb.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} - {new Date(breadcrumb.created_at).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <div className="flex gap-2">
                      <span className="text-xs bg-cream-10 text-cream-80 px-2 py-1 rounded-full">
                        {breadcrumb.type === 'audio' ? (
                          <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 15c1.66 0 3-1.34 3-3V7a3 3 0 1 0-6 0v5c0 1.66 1.34 3 3 3zm5-3a1 1 0 1 1 2 0c0 3.07-2.13 5.64-5 6.32V21h3a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2h3v-2.68c-2.87-.68-5-3.25-5-6.32a1 1 0 1 1 2 0c0 2.76 2.24 5 5 5s5-2.24 5-5z"/>
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M16.24 3.56c-1.13-1.13-2.95-1.13-4.08 0l-7.6 7.6a2.88 2.88 0 0 0-.84 2.04c0 .77.3 1.5.84 2.04l2.12 2.12c.54.54 1.27.84 2.04.84.77 0 1.5-.3 2.04-.84l7.6-7.6c1.13-1.13 1.13-2.95 0-4.08zm-9.19 9.19l4.24 4.24M14.12 7.88l2 2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      {breadcrumb.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-cream-10 text-cream-80 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-cream leading-relaxed">
                    {expandedItems.has(breadcrumb.id) ? (
                      <div>
                        <p className="whitespace-pre-wrap">{breadcrumb.content}</p>
                        <button
                          onClick={() => toggleExpanded(breadcrumb.id)}
                          className="text-sm text-cream-60 hover:text-cream-80 mt-2 underline"
                        >
                          See Less
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="whitespace-pre-wrap">{getPreviewText(breadcrumb.content)}</p>
                        {isLongerThanPreview(breadcrumb.content) && (
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
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
} 