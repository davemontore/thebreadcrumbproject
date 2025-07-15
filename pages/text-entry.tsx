import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { FirebaseService, JournalEntry } from '../lib/firebase-service'
import { SimpleAuth } from '../lib/auth'

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
    if (!SimpleAuth.isAuthenticated()) {
      router.push('/login')
      return
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEntry.trim()) return

    setIsSubmitting(true)
    try {
      const result = await FirebaseService.createEntry(newEntry.trim())
      if (result) {
        setNewEntry('')
        router.push('/basket')
      }
    } catch (error) {
      console.error('Error creating entry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    SimpleAuth.logout()
    router.push('/login')
  }

  return (
    <>
      <Head>
        <title>Write Text - The Breadcrumb Project</title>
        <meta name="description" content="Write your thoughts and memories" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </Head>

      <main className="min-h-screen bg-black text-cream p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-light text-cream">Write Text</h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-cream-10 border border-cream-30 rounded-lg text-cream hover:bg-cream-20 transition-colors"
              >
                <ElegantHouseIcon className="w-6 h-6 text-cream" />
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-cream-10 border border-cream-30 rounded-lg text-cream hover:bg-cream-20 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Text Entry Form */}
          <div className="bg-cream-5 rounded-2xl shadow-sm border border-cream-10 p-6 max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-4 border border-cream-30 rounded-xl resize-none focus:ring-2 focus:ring-cream-50 focus:border-transparent transition-all duration-200 bg-cream-10 text-cream"
                rows={8}
                disabled={isSubmitting}
                autoFocus
              />
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={!newEntry.trim() || isSubmitting}
                  className="px-6 py-3 bg-cream-20 text-cream rounded-xl hover:bg-cream-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-cream-30"
                >
                  {isSubmitting ? 'Saving...' : 'Save Breadcrumb'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/basket')}
                  className="px-4 py-2 text-cream-60 hover:text-cream transition-colors"
                >
                  View Basket
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
} 