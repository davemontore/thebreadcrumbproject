import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { FirebaseService, JournalEntry } from '../lib/firebase-service'
import { FirebaseAuthService } from '../lib/firebase-auth'

// Custom Elegant House Icon Component
const ElegantHouseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
    {/* Main house structure */}
    <path d="M3 12l9-9 9 9" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Door */}
    <path d="M9 21v-6a3 3 0 0 1 6 0v6" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Windows */}
    <path d="M7 14h2" strokeLinecap="round"/>
    <path d="M15 14h2" strokeLinecap="round"/>
    {/* Roof details */}
    <path d="M3 12h18" strokeLinecap="round"/>
  </svg>
)

export default function TextEntry() {
  const [newEntry, setNewEntry] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Check authentication on component mount
  useEffect(() => {
    if (!FirebaseAuthService.isAuthenticated()) {
      router.push('/login')
      return
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEntry.trim()) return

    setIsSubmitting(true)
    try {
      console.log('TextEntry: Starting submission with text:', newEntry.trim())
      
      // Generate tags for text entry
      const response = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newEntry.trim() }),
      })

      let tags: string[] = []
      
      if (response.ok) {
        const { tags: generatedTags } = await response.json()
        tags = generatedTags
      }

      const result = await FirebaseService.createEntry(newEntry.trim(), '', tags)
      console.log('TextEntry: Firebase result:', result)
      
      if (result) {
        setNewEntry('')
        router.push('/basket')
      } else {
        console.error('TextEntry: Firebase returned null result')
        alert('Failed to save entry - please try again')
      }
    } catch (error: any) {
      console.error('TextEntry: Error in handleSubmit:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await FirebaseAuthService.logoutUser()
    router.push('/login')
  }

  return (
    <>
      <Head>
        <title>Write Text - Write Here. Right Now</title>
        <meta name="description" content="Write your thoughts and memories" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </Head>

      <main className="min-h-screen bg-black text-cream p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-light text-cream" style={{ fontFamily: 'IM Fell Double Pica, serif' }}>Write Text</h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-cream-10 border border-cream-30 rounded-lg text-cream hover:bg-cream-20 transition-colors"
                style={{ fontFamily: 'Cutive Mono, monospace' }}
              >
                <ElegantHouseIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-cream-10 border border-cream-30 rounded-lg text-cream hover:bg-cream-20 transition-colors"
                style={{ fontFamily: 'Cutive Mono, monospace' }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Text Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-6 border border-cream-30 rounded-xl resize-none focus:ring-2 focus:ring-cream-50 focus:border-transparent transition-all duration-200 bg-cream-10 text-cream"
                style={{ fontFamily: 'Cutive Mono, monospace' }}
                rows={12}
                autoFocus
                required
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!newEntry.trim() || isSubmitting}
                className="px-8 py-3 bg-cream-20 text-cream rounded-xl hover:bg-cream-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-cream-30"
                style={{ fontFamily: 'Cutive Mono, monospace' }}
              >
                {isSubmitting ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
} 