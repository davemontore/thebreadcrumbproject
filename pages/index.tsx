import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { FirebaseService, JournalEntry } from '../lib/firebase-service'
import { SimpleAuth } from '../lib/auth'
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
      console.log('Starting audio recording...')
      
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
      
      // Check if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      console.log('Mobile detection:', isMobile)
      
      // Use MP3 format for maximum compatibility
      let mimeType = 'audio/mp3'
      
      // Check if MP3 is supported, fallback to webm if not
      if (!MediaRecorder.isTypeSupported('audio/mp3')) {
        console.log('MP3 not supported, falling back to webm')
        mimeType = 'audio/webm'
      }
      
      console.log('Using MIME type:', mimeType)
      
      const recorder = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 128000
      })
      
      // Set up data collection with a timer to ensure we get data
      let dataTimeout: NodeJS.Timeout
      
      recorder.ondataavailable = (event) => {
        console.log('Audio data available, size:', event.data.size, 'type:', event.data.type)
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log('Added audio chunk, total chunks:', audioChunksRef.current.length)
        }
      }

      recorder.onstart = () => {
        console.log('Recording started, setting up data collection...')
        // Request data every second to ensure we capture audio
        dataTimeout = setInterval(() => {
          if (recorder.state === 'recording') {
            recorder.requestData()
          }
        }, 1000)
      }

      recorder.onstop = async () => {
        console.log('Recording stopped, processing audio...')
        
        // Clear the data collection interval
        if (dataTimeout) {
          clearInterval(dataTimeout)
        }
        
        // Wait a moment for any final data
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Get the current audio chunks from ref
        const currentChunks = [...audioChunksRef.current]
        console.log('Final audio chunks count:', currentChunks.length)
        console.log('Total audio data size:', currentChunks.reduce((total, chunk) => total + chunk.size, 0))
        
        if (currentChunks.length === 0) {
          alert('No audio data was recorded. Please try again.')
          stream.getTracks().forEach(track => track.stop())
          audioChunksRef.current = []
          return
        }
        
        // Create blob with MP3 format
        const audioBlob = new Blob(currentChunks, { type: mimeType })
        console.log('Audio blob created, size:', audioBlob.size, 'type:', mimeType)
        
        if (audioBlob.size === 0) {
          alert('No audio data was recorded. This might be a browser compatibility issue. Please try using Chrome or Safari.')
          stream.getTracks().forEach(track => track.stop())
          audioChunksRef.current = []
          return
        }
        
        await processAudioBlob(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        audioChunksRef.current = []
      }

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        alert('ERROR: Recording failed. Please try again.')
        stream.getTracks().forEach(track => track.stop())
        audioChunksRef.current = []
        if (dataTimeout) {
          clearInterval(dataTimeout)
        }
      }

      setMediaRecorder(recorder)
      recorder.start(1000) // Start with 1-second timeslices
      setIsRecording(true)
      setIsPaused(false)
      console.log('Recording started successfully')
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
    formData.append('audio', audioBlob, 'recording.mp3')

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
            <div className="flex flex-col items-center">
              {/* Title with equal spacing */}
              <div className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-cream leading-tight">
                  <span className="block">The Breadcrumb</span>
                  <span className="block">Project</span>
                </h1>
                <p className="text-xl sm:text-2xl font-light text-cream-80 mt-8" style={{ fontFamily: 'Caveat, cursive' }}>
                  A trail of wisdom for your kids to follow after you're gone.
                </p>
              </div>

              {/* Audio Recording Section */}
              <div className="flex flex-col items-center mb-8">
                {!isRecording ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="group cursor-pointer" onClick={startRecording}>
                      <div className="w-40 h-40 bg-cream-10 border-2 border-cream-30 rounded-full flex items-center justify-center hover:bg-cream-20 hover:border-cream-50 transition-all duration-300">
                        {/* Unicode Microphone Emoji */}
                        <ModernMicrophoneIcon className="text-[3rem] text-cream group-hover:scale-110 transition-transform duration-300"/>
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
                    />
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
                    {/* Unicode Writing Hand Emoji */}
                    <HandWritingIcon className="text-[2rem] text-cream group-hover:scale-110 transition-transform duration-300"/>
                  </div>
                </div>
                ) : (
                  <div className="w-full max-w-2xl">
                    <input
                      type="text"
                      value={textTitle}
                      onChange={(e) => setTextTitle(e.target.value)}
                      placeholder="Title for your entry (optional)"
                      className="w-full p-3 border border-cream-30 rounded-xl bg-cream-10 text-cream mb-4 text-center"
                    />
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