import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { FirebaseService, JournalEntry } from '../lib/firebase-service'
import { FirebaseAuthService } from '../lib/firebase-auth'
// Remove Heroicons import - using Unicode emojis instead

// Unicode Microphone Emoji Component
const ModernMicrophoneIcon = ({ className }: { className?: string }) => (
  <span className={className} style={{ 
    filter: 'grayscale(100%) brightness(1.2) contrast(1.1)'
  }}>
    🎤
  </span>
)

// Unicode Writing Hand Emoji Component
const HandWritingIcon = ({ className }: { className?: string }) => (
  <span className={className} style={{ 
    filter: 'grayscale(100%) brightness(1.2) contrast(1.1)'
  }}>
    ✍️
  </span>
)

// Unicode Bread Emoji Component
const ElegantBreadIcon = ({ className }: { className?: string }) => (
  <span className={className} style={{ 
    fontSize: 'inherit',
    filter: 'brightness(0) saturate(100%) invert(94%) sepia(8%) saturate(427%) hue-rotate(359deg) brightness(96%) contrast(89%)'
  }}>
    🍞
  </span>
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
  const [textEntry, setTextEntry] = useState('')
  const [textTitle, setTextTitle] = useState('')
  const [audioTitle, setAudioTitle] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showTextInput, setShowTextInput] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const audioChunksRef = useRef<Blob[]>([])
  const recordRTCRef = useRef<any>(null)
  const router = useRouter()

  // Check authentication and load entries on component mount
  useEffect(() => {
    // Use Firebase Auth only - complete migration
    if (!FirebaseAuthService.isAuthenticated()) {
      router.push('/login')
      return
    }
    loadEntries()
  }, [router])

  const loadEntries = async () => {
    setIsLoading(true)
    try {
      const data = await FirebaseService.getEntries()
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
      const result = await FirebaseService.createEntry(newEntry.trim())
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
      // TODO: Add delete functionality to Firebase service
      setEntries(prev => prev.filter(entry => entry.id !== id))
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return

    try {
      // TODO: Add update functionality to Firebase service
      setEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, text: editContent.trim() } : entry
      ))
      setEditingId(null)
      setEditContent('')
    } catch (error) {
      console.error('Error updating entry:', error)
    }
  }

  const startEditing = (entry: JournalEntry) => {
    setEditingId(entry.id)
    setEditContent(entry.text)
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

  const startRecording = async () => {
    try {
      console.log('Starting audio recording with RecordRTC...')
      
      // Check if MediaRecorder is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Audio recording is not supported in this browser. Please use a modern browser.')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      console.log('Audio stream obtained successfully')
      
      // Dynamically import RecordRTC to avoid SSR issues
      const RecordRTC = (await import('recordrtc')).default
      
      // Use RecordRTC for better browser compatibility
      const recordRTC = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 44100,
        timeSlice: 1000,
        ondataavailable: (blob: Blob) => {
          console.log('RecordRTC: Audio data available, size:', blob.size)
          audioChunksRef.current.push(blob)
        }
      })
      
      recordRTCRef.current = recordRTC
      recordRTC.startRecording()
      
      setIsRecording(true)
      setIsPaused(false)
      console.log('RecordRTC recording started successfully')
    } catch (error) {
      console.error('Error starting recording:', error)
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('ERROR: Microphone access denied. Please allow microphone access and try again.')
        } else if (error.name === 'NotFoundError') {
          alert('ERROR: No microphone found. Please connect a microphone and try again.')
        } else {
          alert(`ERROR: ${error.message}`)
        }
      } else {
        alert('ERROR: Failed to start recording. Please try again.')
      }
    }
  }

  // Process audio blob (transcription and saving)
  const processAudioBlob = async (audioBlob: Blob) => {
    console.log('Processing audio blob, size:', audioBlob.size, 'type:', audioBlob.type)
    
    if (audioBlob.size === 0) {
      alert('No audio data was recorded. Please try again.')
      return
    }
    
    // Send to API for transcription
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    try {
      console.log('Sending audio to transcription API...')
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      console.log('Transcription API response status:', response.status)

      if (response.ok) {
        const { transcription, tags } = await response.json()
        console.log('Transcription received:', transcription)
        
        // Save to database
        const result = await FirebaseService.createEntry(transcription, audioTitle.trim(), tags)
        if (result) {
          console.log('Entry saved successfully')
          // Refresh entries
          loadEntries()
          alert('SUCCESS: Audio entry saved!')
        } else {
          alert('FAILED: Could not save entry to database')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Transcription failed:', response.status, errorData)
        
        if (response.status === 500 && errorData.error?.includes('Invalid audio format')) {
          alert('FAILED: Audio format not supported. Please try using Chrome or Safari.')
        } else if (response.status === 401) {
          alert('FAILED: API key error. Please check your OpenAI API key.')
        } else {
          alert(`FAILED: Transcription error (${response.status}). Please try again.`)
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      alert('ERROR: Failed to process audio. Please try again.')
    }
  }

  const pauseRecording = () => {
    if (recordRTCRef.current) {
      recordRTCRef.current.pauseRecording()
      setIsPaused(true)
    }
  }

  const resumeRecording = () => {
    if (recordRTCRef.current) {
      recordRTCRef.current.resumeRecording()
      setIsPaused(false)
    }
  }

  const stopRecording = () => {
    if (recordRTCRef.current) {
      recordRTCRef.current.stopRecording(() => {
        console.log('RecordRTC recording stopped, processing audio...')
        
        const blob = recordRTCRef.current?.getBlob()
        if (blob) {
          console.log('RecordRTC blob created, size:', blob.size, 'type:', blob.type)
          
          if (blob.size === 0) {
            alert('No audio data was recorded. Please try again.')
            return
          }
          
          processAudioBlob(blob)
        } else {
          alert('No audio data was recorded. Please try again.')
        }
        
        // Stop all tracks from the original stream
        if (recordRTCRef.current) {
          recordRTCRef.current.destroy()
        }
        recordRTCRef.current = null
        audioChunksRef.current = []
        setIsRecording(false)
        setIsPaused(false)
      })
    }
  }

  const startTextEntry = () => {
    setShowTextInput(true)
  }

  const submitTextEntry = async () => {
    if (!textEntry.trim()) return

    setIsSubmitting(true)
    try {
      console.log('Index: Starting text submission:', textEntry.trim())
      
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
        const { tags: generatedTags } = await response.json()
        tags = generatedTags
      }

      const result = await FirebaseService.createEntry(textEntry.trim(), textTitle.trim(), tags)
      console.log('Index: Firebase result:', result)
      
      if (result) {
        setTextEntry('')
        setTextTitle('')
        setShowTextInput(false)
        loadEntries()
        alert('SUCCESS: Entry saved!')
      } else {
        alert('FAILED: Could not save entry')
      }
    } catch (error: any) {
      console.error('Index: Error in submitTextEntry:', error)
      alert(`ERROR: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelTextEntry = () => {
    setTextEntry('')
    setTextTitle('')
    setShowTextInput(false)
  }

  return (
    <>
      <Head>
        <title>Write Here. Right Now</title>
        <meta name="description" content="Record your thoughts and memories" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        {/* Updated styling with Montserrat font and elegant design */}
      </Head>

      <main className="min-h-screen bg-black text-cream p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center">
            <div className="flex justify-between w-full mb-4">
              <button
                onClick={async () => {
                  await FirebaseAuthService.logoutUser()
                  router.push('/login')
                }}
                className="px-4 py-2 bg-cream-10 border border-cream-30 rounded-lg text-cream hover:bg-cream-20 transition-colors"
                style={{ fontFamily: 'IM Fell Double Pica, serif' }}
              >
                Logout
              </button>
              <button
                onClick={() => router.push('/basket')}
                className="px-4 py-2 bg-cream-10 border border-cream-30 rounded-lg text-cream hover:bg-cream-20 transition-colors"
              >
                <span className="text-xl">✍️</span>
              </button>
            </div>
          </div>

          {/* Main Content - Title and Circles as a Unit, Vertically Centered */}
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
            {/* Title and Circles Unit */}
            <div className="flex flex-col items-center">
              {/* Title with equal spacing */}
              <div className="text-center mb-8">
                <h1 className="text-5xl sm:text-6xl font-bold text-cream leading-tight" style={{ fontFamily: 'Special Elite, monospace' }}>
                  <span className="block">Write Here.</span>
                  <span className="block">Right Now.</span>
                </h1>
                <p className="text-2xl sm:text-3xl font-light text-cream-80 mt-8" style={{ fontFamily: 'Homemade Apple, cursive' }}>
                  Notes or it didn't happen
                </p>
              </div>

              {/* Audio Recording Section */}
              <div className="flex flex-col items-center mb-8">
                {!isRecording ? (
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
                    <div className="group cursor-pointer" onClick={startRecording}>
                      <div className="w-40 h-16 bg-cream-10 border-2 border-cream-30 rounded-lg flex items-center justify-center hover:bg-cream-20 hover:border-cream-50 transition-all duration-300">
                        <span className="text-cream text-lg font-medium" style={{ fontFamily: 'Cutive Mono, monospace' }}>Talk</span>
                      </div>
                    </div>
                    <div className="group cursor-pointer" onClick={startTextEntry}>
                      <div className="w-40 h-16 bg-cream-10 border-2 border-cream-30 rounded-lg flex items-center justify-center hover:bg-cream-20 hover:border-cream-50 transition-all duration-300">
                        <span className="text-cream text-lg font-medium" style={{ fontFamily: 'Cutive Mono, monospace' }}>Type</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <input
                      type="text"
                      value={audioTitle}
                      onChange={(e) => setAudioTitle(e.target.value)}
                      placeholder="Title for your audio entry (optional)"
                      className="w-64 p-2 border border-cream-30 rounded bg-cream-10 text-cream text-center mb-4"
                      style={{ fontFamily: 'Cutive Mono, monospace' }}
                    />
                    <div className="w-40 h-40 bg-cream-20 border-2 border-cream-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-cream-80 text-lg mb-4" style={{ fontFamily: 'Cutive Mono, monospace' }}>
                      {isPaused ? 'Recording Paused' : 'Recording...'}
                    </p>
                    <div className="flex gap-4 justify-center">
                      {isPaused ? (
                        <button
                          onClick={resumeRecording}
                          className="px-6 py-2 bg-cream-20 text-cream rounded-lg hover:bg-cream-30 transition-colors border border-cream-30"
                          style={{ fontFamily: 'Cutive Mono, monospace' }}
                        >
                          Resume
                        </button>
                      ) : (
                        <button
                          onClick={pauseRecording}
                          className="px-6 py-2 bg-cream-20 text-cream rounded-lg hover:bg-cream-30 transition-colors border border-cream-30"
                          style={{ fontFamily: 'Cutive Mono, monospace' }}
                        >
                          Pause
                        </button>
                      )}
                      <button
                        onClick={stopRecording}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        style={{ fontFamily: 'Cutive Mono, monospace' }}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Entry Section */}
              <div className="flex flex-col items-center">
                {showTextInput && (
                  <div className="w-full max-w-2xl">
                    <input
                      type="text"
                      value={textTitle}
                      onChange={(e) => setTextTitle(e.target.value)}
                      placeholder="Title for your entry (optional)"
                      className="w-full p-3 border border-cream-30 rounded-xl bg-cream-10 text-cream mb-4 text-center"
                      style={{ fontFamily: 'Cutive Mono, monospace' }}
                    />
                    <textarea
                      value={textEntry}
                      onChange={(e) => setTextEntry(e.target.value)}
                      placeholder="What's on your mind?"
                      className="w-full p-4 border border-cream-30 rounded-xl resize-none focus:ring-2 focus:ring-cream-50 focus:border-transparent transition-all duration-200 bg-cream-10 text-cream mb-4"
                      style={{ fontFamily: 'Cutive Mono, monospace' }}
                      rows={6}
                      autoFocus
                    />
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={submitTextEntry}
                        disabled={!textEntry.trim() || isSubmitting}
                        className="px-6 py-2 bg-cream-20 text-cream rounded-lg hover:bg-cream-30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-cream-30"
                        style={{ fontFamily: 'Cutive Mono, monospace' }}
                      >
                        {isSubmitting ? 'Saving...' : 'Submit'}
                      </button>
                      <button
                        onClick={cancelTextEntry}
                        className="px-6 py-2 bg-cream-10 text-cream-60 rounded-lg hover:bg-cream-20 transition-colors border border-cream-30"
                        style={{ fontFamily: 'Cutive Mono, monospace' }}
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