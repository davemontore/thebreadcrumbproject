import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { JournalService, JournalEntry } from '../lib/database'
import { SimpleAuth } from '../lib/auth'

// Elegant Wand Microphone Icon Component
const ModernMicrophoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    {/* Microphone head - classic oval shape */}
    <ellipse cx="12" cy="7" rx="3.5" ry="2.5" strokeLinecap="round"/>
    {/* Microphone handle - elegant wand */}
    <line x1="12" y1="9.5" x2="12" y2="16" strokeLinecap="round"/>
    {/* Stand base */}
    <line x1="7" y1="16" x2="17" y2="16" strokeLinecap="round"/>
    {/* Stand legs */}
    <line x1="8" y1="16" x2="8" y2="19" strokeLinecap="round"/>
    <line x1="16" y1="16" x2="16" y2="19" strokeLinecap="round"/>
    {/* Mesh grille pattern */}
    <circle cx="10" cy="6.5" r="0.4" fill="currentColor"/>
    <circle cx="12" cy="6.5" r="0.4" fill="currentColor"/>
    <circle cx="14" cy="6.5" r="0.4" fill="currentColor"/>
    <circle cx="10" cy="7.5" r="0.4" fill="currentColor"/>
    <circle cx="12" cy="7.5" r="0.4" fill="currentColor"/>
    <circle cx="14" cy="7.5" r="0.4" fill="currentColor"/>
  </svg>
)

// Elegant Feather Quill Icon Component
const HandWritingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    {/* Quill shaft - main pen body */}
    <line x1="12" y1="18" x2="12" y2="8" strokeLinecap="round"/>
    {/* Quill tip - writing point */}
    <line x1="12" y1="8" x2="14" y2="6" strokeLinecap="round"/>
    {/* Feather plume - elegant curved feathers */}
    <path d="M12 10c0 0-2-1-4-1s-4 1-4 1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12c0 0-2-1-4-1s-4 1-4 1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 14c0 0-2-1-4-1s-4 1-4 1" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Feather details - individual feather lines */}
    <line x1="8" y1="9" x2="6" y2="8" strokeLinecap="round"/>
    <line x1="8" y1="11" x2="6" y2="10" strokeLinecap="round"/>
    <line x1="8" y1="13" x2="6" y2="12" strokeLinecap="round"/>
    <line x1="8" y1="15" x2="6" y2="14" strokeLinecap="round"/>
    {/* Ink well or base */}
    <ellipse cx="12" cy="19" rx="2" ry="1" strokeLinecap="round"/>
  </svg>
)

// Custom Elegant Bread Slice Icon Component
const ElegantBreadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
    {/* Main bread slice */}
    <path d="M6 8c0-2 2-4 6-4s6 2 6 4v8c0 2-2 4-6 4s-6-2-6-4V8z" strokeLinecap="round"/>
    {/* Bread texture lines */}
    <path d="M8 10h8" strokeLinecap="round"/>
    <path d="M8 12h8" strokeLinecap="round"/>
    <path d="M8 14h6" strokeLinecap="round"/>
    {/* Crust details */}
    <path d="M6 8c0-2 2-4 6-4s6 2 6 4" strokeLinecap="round"/>
  </svg>
)

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
          <div className="flex flex-col items-center">
            <div className="flex justify-end w-full mb-4">
              <button
                onClick={() => router.push('/basket')}
                className="px-4 py-2 bg-cream-10 border border-cream-30 rounded-lg text-cream hover:bg-cream-20 transition-colors"
              >
                <ElegantBreadIcon className="w-6 h-6 text-cream"/>
              </button>
            </div>
          </div>

          {/* Main Content - Title and Circles as a Unit, Vertically Centered */}
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
            {/* Title and Circles Unit */}
            <div className="flex flex-col items-center space-y-12">
              {/* Title */}
              <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-bold text-cream leading-tight">
                  <span className="block">The Breadcrumb</span>
                  <span className="block">Project</span>
                </h1>
                <p className="text-xl sm:text-2xl font-light text-cream-80 mt-2" style={{ fontFamily: 'Caveat, cursive' }}>
                  A trail of wisdom for your kids to follow after you're gone
                </p>
              </div>

              {/* Audio Recording Section */}
              <div className="flex flex-col items-center">
              {!isRecording ? (
                <div className="group cursor-pointer" onClick={startRecording}>
                  <div className="w-40 h-40 bg-cream-10 border-2 border-cream-30 rounded-full flex items-center justify-center hover:bg-cream-20 hover:border-cream-50 transition-all duration-300">
                    {/* Elegant Vintage Microphone */}
                    <ModernMicrophoneIcon className="w-16 h-16 text-cream group-hover:scale-110 transition-transform duration-300"/>
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
                      {/* Elegant Writing Quill */}
                      <HandWritingIcon className="w-16 h-16 text-cream group-hover:scale-110 transition-transform duration-300"/>
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
        </div>
      </main>
    </>
  )
} 