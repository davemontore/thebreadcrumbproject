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

  const handleLogout = async () => {
    SimpleAuth.logout()
    router.push('/login')
  }

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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-light text-cream">Breadcrumb Basket</h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-cream-10 border border-cream-30 rounded-lg text-cream hover:bg-cream-20 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-cream-10 border border-cream-30 rounded-lg text-cream hover:bg-cream-20 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Breadcrumbs Display */}
          {breadcrumbs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-cream-60 text-lg mb-4">No breadcrumbs yet.</p>
              <p className="text-cream-40 mb-6">Start recording or writing to leave your first trace.</p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-cream-10 border border-cream-30 rounded-lg text-cream hover:bg-cream-20 transition-colors"
              >
                Create Your First Breadcrumb
              </button>
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
                        {breadcrumb.type === 'audio' ? '🎤' : '✏️'}
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