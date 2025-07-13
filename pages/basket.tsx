import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { AuthService } from '../lib/auth'
import { DatabaseService } from '../lib/database'
import { Breadcrumb } from '../lib/supabase'

export default function Basket() {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
  const [user, setUser] = useState<any>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    // Check authentication with Supabase
    const checkUser = async () => {
      const { user } = await AuthService.getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Load breadcrumbs from database
      const breadcrumbs = await DatabaseService.getBreadcrumbs(user.id)
      setBreadcrumbs(breadcrumbs)
    }

    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        // Reload breadcrumbs when user changes
        DatabaseService.getBreadcrumbs(user.id).then(setBreadcrumbs)
      }
    })

    return () => subscription?.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await AuthService.signOut()
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
          <p className="text-cream/80">Loading...</p>
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
                className="px-4 py-2 bg-cream/10 border border-cream/30 rounded-lg text-cream hover:bg-cream/20 transition-colors"
              >
                🏠
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-cream/10 border border-cream/30 rounded-lg text-cream hover:bg-cream/20 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Breadcrumbs Display */}
          {breadcrumbs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-cream/60 text-lg mb-4">No breadcrumbs yet.</p>
              <p className="text-cream/40 mb-6">Start recording or writing to leave your first trace.</p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-cream/10 border border-cream/30 rounded-lg text-cream hover:bg-cream/20 transition-colors"
              >
                Create Your First Breadcrumb
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {breadcrumbs.map((breadcrumb) => (
                <div key={breadcrumb.id} className="bg-cream/5 border border-cream/10 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm text-cream/60">
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
                      <span className="text-xs bg-cream/10 text-cream/80 px-2 py-1 rounded-full">
                        {breadcrumb.type === 'audio' ? '🎤' : '✏️'}
                      </span>
                      {breadcrumb.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-cream/10 text-cream/80 px-2 py-1 rounded-full">
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
                          className="text-sm text-cream/60 hover:text-cream/80 mt-2 underline"
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
                            className="text-sm text-cream/60 hover:text-cream/80 mt-2 underline"
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

      <style jsx global>{`
        :root {
          --cream: #f5f5dc;
        }
        
        body {
          background-color: #000000;
          color: #f5f5dc;
        }
        
        .bg-black {
          background-color: #000000;
        }
        
        .text-cream {
          color: #f5f5dc;
        }
        
        .bg-cream\/5 {
          background-color: rgba(245, 245, 220, 0.05);
        }
        
        .bg-cream\/10 {
          background-color: rgba(245, 245, 220, 0.1);
        }
        
        .bg-cream\/20 {
          background-color: rgba(245, 245, 220, 0.2);
        }
        
        .border-cream\/10 {
          border-color: rgba(245, 245, 220, 0.1);
        }
        
        .border-cream\/30 {
          border-color: rgba(245, 245, 220, 0.3);
        }
        
        .text-cream\/80 {
          color: rgba(245, 245, 220, 0.8);
        }
        
        .text-cream\/60 {
          color: rgba(245, 245, 220, 0.6);
        }
        
        .text-cream\/40 {
          color: rgba(245, 245, 220, 0.4);
        }
      `}</style>
    </>
  )
} 