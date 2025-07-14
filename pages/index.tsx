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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data])
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        
        // Send to API for transcription
        const formData = new FormData()
        formData.append('audio', audioBlob)

        try {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            const { transcription, tags } = await response.json()
            
            // Save to database
            const result = await JournalService.createEntry(transcription, 'audio', tags)
            if (result) {
              // Refresh entries
              loadEntries()
            }
          } else {
            console.error('Transcription failed')
          }
        } catch (error) {
          console.error('Error processing audio:', error)
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        setAudioChunks([])
      }

      setMediaRecorder(recorder)
      recorder.start()
      setIsRecording(true)
      setIsPaused(false)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause()
      setIsPaused(true)
    }
  }

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume()
      setIsPaused(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
  }

  const startTextEntry = () => {
    setShowTextInput(true)
  }

  const submitTextEntry = async () => {
    if (!textEntry.trim()) return

    setIsSubmitting(true)
    try {
      // Generate tags for text entry
      const response = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textEntry.trim() }),
      })

      let tags: string[] = []
      if (response.ok) {
        const result = await response.json()
        tags = result.tags
      }

      const result = await JournalService.createEntry(textEntry.trim(), 'text', tags)
      if (result) {
        setTextEntry('')
        setShowTextInput(false)
        loadEntries()
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-12">
            <div className="text-center mb-6 sm:mb-0">
              <h1 className="text-4xl sm:text-5xl font-light text-cream leading-tight">
                <span className="block">The Breadcrumb</span>
                <span className="block">Project</span>
              </h1>
            </div>
            <div className="flex justify-center sm:justify-end">
              <button
                onClick={() => router.push('/basket')}
                className="px-4 py-2 bg-cream-10 border border-cream-30 rounded-lg text-cream hover:bg-cream-20 transition-colors"
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.5 12C2.5 6.75 12 2.5 21.5 12c0 4.5-4.5 7.5-9.5 7.5S2.5 16.5 2.5 12Z"/>
                  <ellipse cx="8.5" cy="15" rx="1" ry="2" fill="#f5f5dc"/>
                  <ellipse cx="12" cy="16" rx="1" ry="2" fill="#f5f5dc"/>
                  <ellipse cx="15.5" cy="15" rx="1" ry="2" fill="#f5f5dc"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Main Content - Centered on Mobile */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-auto">
            {/* Audio Recording Section */}
            <div className="flex flex-col items-center mb-16">
              {!isRecording ? (
                <div className="group cursor-pointer" onClick={startRecording}>
                  <div className="w-40 h-40 bg-cream-10 border-2 border-cream-30 rounded-full flex items-center justify-center hover:bg-cream-20 hover:border-cream-50 transition-all duration-300">
                    <svg className="w-12 h-12 text-cream group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 15c1.66 0 3-1.34 3-3V7a3 3 0 1 0-6 0v5c0 1.66 1.34 3 3 3zm5-3a1 1 0 1 1 2 0c0 3.07-2.13 5.64-5 6.32V21h3a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2h3v-2.68c-2.87-.68-5-3.25-5-6.32a1 1 0 1 1 2 0c0 2.76 2.24 5 5 5s5-2.24 5-5z"/>
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
                    <svg className="w-12 h-12 text-cream group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M16.24 3.56c-1.13-1.13-2.95-1.13-4.08 0l-7.6 7.6a2.88 2.88 0 0 0-.84 2.04c0 .77.3 1.5.84 2.04l2.12 2.12c.54.54 1.27.84 2.04.84.77 0 1.5-.3 2.04-.84l7.6-7.6c1.13-1.13 1.13-2.95 0-4.08zm-9.19 9.19l4.24 4.24M14.12 7.88l2 2" strokeLinecap="round" strokeLinejoin="round"/>
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
        </div>
      </main>
    </>
  )
} 