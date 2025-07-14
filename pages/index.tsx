import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { JournalService, JournalEntry } from '../lib/database'
import { SimpleAuth } from '../lib/auth'

export default function Home() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [newEntry, setNewEntry] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const router = useRouter()

  // Check authentication and load entries on component mount
  useEffect(() => {
    if (!SimpleAuth.isAuthenticated()) {
      router.push('/login')
      return
    }
    loadEntries()
  }, [router])

  const loadEntries = async () => {
    setIsLoading(true)
    try {
      const data = await JournalService.getEntries()
      setEntries(data)
    } catch (error) {
      console.error('Error loading entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEntry.trim()) return

    setIsSubmitting(true)
    try {
      const result = await JournalService.createEntry(newEntry.trim())
      if (result) {
        setEntries(prev => [result, ...prev])
        setNewEntry('')
      }
    } catch (error) {
      console.error('Error creating entry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const success = await JournalService.deleteEntry(id)
      if (success) {
        setEntries(prev => prev.filter(entry => entry.id !== id))
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return

    try {
      const result = await JournalService.updateEntry(id, editContent.trim())
      if (result) {
        setEntries(prev => prev.map(entry => 
          entry.id === id ? result : entry
        ))
        setEditingId(null)
        setEditContent('')
      }
    } catch (error) {
      console.error('Error updating entry:', error)
    }
  }

  const startEditing = (entry: JournalEntry) => {
    setEditingId(entry.id)
    setEditContent(entry.content)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditContent('')
  }



  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showTextInput, setShowTextInput] = useState(false)
  const [textEntry, setTextEntry] = useState('')

  const startRecording = () => {
    setIsRecording(true)
    setIsPaused(false)
  }

  const pauseRecording = () => {
    setIsPaused(true)
  }

  const resumeRecording = () => {
    setIsPaused(false)
  }

  const stopRecording = () => {
    setIsRecording(false)
    setIsPaused(false)
    // TODO: Save audio recording
  }

  const startTextEntry = () => {
    setShowTextInput(true)
  }

  const submitTextEntry = async () => {
    if (!textEntry.trim()) return

    setIsSubmitting(true)
    try {
      const result = await JournalService.createEntry(textEntry.trim())
      if (result) {
        setTextEntry('')
        setShowTextInput(false)
      }
    } catch (error) {
      console.error('Error creating entry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelTextEntry = () => {
    setTextEntry('')
    setShowTextInput(false)
  }

  return (
    <>
      <Head>
        <title>The Breadcrumb Project</title>
        <meta name="description" content="Record your thoughts and memories" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        {/* Updated styling with Montserrat font and elegant design */}
      </Head>

      <main className="min-h-screen bg-black text-cream p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl sm:text-5xl font-light text-cream leading-tight">
                <span className="block">The Breadcrumb</span>
                <span className="block">Project</span>
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/basket')}
                className="px-4 py-2 bg-cream-10 border border-cream-30 rounded-lg text-cream hover:bg-cream-20 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Audio Recording Section */}
          <div className="flex flex-col items-center mb-16">
            {!isRecording ? (
              <div className="group cursor-pointer" onClick={startRecording}>
                <div className="w-40 h-40 bg-cream-10 border-2 border-cream-30 rounded-full flex items-center justify-center hover:bg-cream-20 hover:border-cream-50 transition-all duration-300">
                  <svg className="w-12 h-12 text-cream group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4V8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8V4C10 2.9 10.9 2 12 2ZM18 10V8C18 4.69 15.31 2 12 2C8.69 2 6 4.69 6 8V10C4.9 10 4 10.9 4 12V16C4 17.1 4.9 18 6 18H18C19.1 18 20 17.1 20 16V12C20 10.9 19.1 10 18 10ZM16 16H8V12H16V16Z"/>
                  </svg>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-40 h-40 bg-cream-20 border-2 border-cream-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-cream-80 text-lg mb-4">
                  {isPaused ? 'Recording Paused' : 'Recording...'}
                </p>
                <div className="flex gap-4 justify-center">
                  {isPaused ? (
                    <button
                      onClick={resumeRecording}
                      className="px-6 py-2 bg-cream-20 text-cream rounded-lg hover:bg-cream-30 transition-colors border border-cream-30"
                    >
                      Resume
                    </button>
                  ) : (
                    <button
                      onClick={pauseRecording}
                      className="px-6 py-2 bg-cream-20 text-cream rounded-lg hover:bg-cream-30 transition-colors border border-cream-30"
                    >
                      Pause
                    </button>
                  )}
                  <button
                    onClick={stopRecording}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Text Entry Section */}
          <div className="flex flex-col items-center">
            {!showTextInput ? (
              <div className="group cursor-pointer" onClick={startTextEntry}>
                <div className="w-40 h-40 bg-cream-10 border-2 border-cream-30 rounded-full flex items-center justify-center hover:bg-cream-20 hover:border-cream-50 transition-all duration-300">
                  <svg className="w-12 h-12 text-cream group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-2xl">
                <textarea
                  value={textEntry}
                  onChange={(e) => setTextEntry(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full p-4 border border-cream-30 rounded-xl resize-none focus:ring-2 focus:ring-cream-50 focus:border-transparent transition-all duration-200 bg-cream-10 text-cream mb-4"
                  rows={6}
                  autoFocus
                />
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={submitTextEntry}
                    disabled={!textEntry.trim() || isSubmitting}
                    className="px-6 py-2 bg-cream-20 text-cream rounded-lg hover:bg-cream-30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-cream-30"
                  >
                    {isSubmitting ? 'Saving...' : 'Submit'}
                  </button>
                  <button
                    onClick={cancelTextEntry}
                    className="px-6 py-2 bg-cream-10 text-cream-60 rounded-lg hover:bg-cream-20 transition-colors border border-cream-30"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
} 