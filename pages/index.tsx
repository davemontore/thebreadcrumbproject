import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { AuthService } from '../lib/auth'
import { DatabaseService } from '../lib/database'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [textInput, setTextInput] = useState('')
  const [isTextExpanded, setIsTextExpanded] = useState(false)
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
    }

    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    })

    return () => subscription?.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await AuthService.signOut()
    router.push('/login')
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Store mediaRecorder reference for stopping
      ;(window as any).mediaRecorder = mediaRecorder
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    const mediaRecorder = (window as any).mediaRecorder
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }
    setIsRecording(false)
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsLoading(true)
    
    try {
      // Get API key from localStorage (stored by user in browser)
      const openaiApiKey = localStorage.getItem('openaiApiKey')
      
      if (!openaiApiKey) {
        alert('Please enter your OpenAI API key first. You can do this in your browser settings.')
        setIsLoading(false)
        return
      }

      // Convert blob to base64
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      
      reader.onload = async () => {
        const base64Audio = reader.result as string
        
        // Extract base64 data (remove data:audio/wav;base64, prefix)
        const base64Data = base64Audio.split(',')[1]
        
        // Create form data for OpenAI
        const formData = new FormData()
        formData.append('file', new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: 'audio/wav' }), 'recording.wav')
        formData.append('model', 'whisper-1')
        formData.append('response_format', 'json')

        // Send to OpenAI directly
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
        }

        const result = await response.json()
        
        // Save to Supabase database
        if (user) {
          const tags = generateTags(result.text)
          await DatabaseService.createBreadcrumb(
            user.id,
            result.text,
            tags,
            'audio'
          )
        }
        
        // No confirmation dialog - just silently save for maximum elegance
      }
    } catch (error) {
      console.error('Transcription error:', error)
      alert(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!textInput.trim() || !user) return

    setIsLoading(true)
    
    try {
      const tags = generateTags(textInput)
      const breadcrumb = await DatabaseService.createBreadcrumb(
        user.id,
        textInput.trim(),
        tags,
        'text'
      )
      
      if (breadcrumb) {
        setTextInput('')
        setIsTextExpanded(false)
        // No confirmation dialog - just silently save for maximum elegance
      }
    } catch (error) {
      console.error('Error saving breadcrumb:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateTags = (text: string): string[] => {
    const tags: string[] = []
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('work') || lowerText.includes('job')) tags.push('#work')
    if (lowerText.includes('family') || lowerText.includes('home')) tags.push('#family')
    if (lowerText.includes('idea') || lowerText.includes('think')) tags.push('#idea')
    if (lowerText.includes('feeling') || lowerText.includes('emotion')) tags.push('#feeling')
    if (lowerText.includes('memory') || lowerText.includes('remember')) tags.push('#memory')
    if (lowerText.includes('wisdom') || lowerText.includes('learn')) tags.push('#wisdom')
    
    if (tags.length === 0) tags.push('#thought', '#reflection')
    
    return tags
  }

  const handleRecordingClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const toggleTextInput = () => {
    setIsTextExpanded(!isTextExpanded)
    if (!isTextExpanded) {
      // Focus the textarea when expanding
      setTimeout(() => {
        const textarea = document.getElementById('textInput') as HTMLTextAreaElement
        if (textarea) textarea.focus()
      }, 100)
    }
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
        <title>The Breadcrumb Project</title>
        <meta name="description" content="Record your thoughts and memories" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-black text-cream flex flex-col items-center justify-center p-4">
        <button 
          onClick={handleLogout}
          className="fixed top-4 right-4 px-4 py-2 bg-cream/10 border border-cream/30 rounded-lg text-cream hover:bg-cream/20 transition-colors"
        >
          Logout
        </button>

        <div className="text-center max-w-md">
          <h1 className="text-4xl font-light mb-12 text-cream">
            The Breadcrumb Project
          </h1>
          
          <p className="text-lg mb-12 text-cream/80 leading-relaxed">
            A trail of wisdom for your kids to follow after you're gone.
          </p>

          {/* Audio Recording Button */}
          <button
            onClick={handleRecordingClick}
            disabled={isLoading}
            className={`
              w-24 h-24 rounded-full border-2 transition-all duration-300 mb-6
              ${isRecording 
                ? 'bg-red-600 border-red-400 animate-pulse' 
                : 'bg-cream/10 border-cream/30 hover:bg-cream/20'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="text-2xl">
              {isLoading ? '⏳' : isRecording ? '⏹️' : '🎤'}
            </div>
          </button>

          <p className="text-sm text-cream/60 mb-8">
            {isLoading ? 'Processing...' : isRecording ? 'Recording... Tap to stop' : 'Tap to record a breadcrumb'}
          </p>

          {/* Text Input Container */}
          <div className="w-full mb-8">
            {!isTextExpanded ? (
              <button
                onClick={toggleTextInput}
                className="w-24 h-24 rounded-full border-2 border-cream/30 bg-cream/10 hover:bg-cream/20 transition-all duration-300 mx-auto flex items-center justify-center"
              >
                <div className="text-2xl">✏️</div>
              </button>
            ) : (
              <form onSubmit={handleTextSubmit} className="w-full">
                <textarea
                  id="textInput"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Write your thoughts..."
                  className="w-full px-4 py-3 bg-cream/10 border border-cream/30 rounded-lg text-cream placeholder-cream/50 focus:outline-none focus:border-cream/50 resize-none"
                  rows={4}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    type="submit"
                    disabled={!textInput.trim()}
                    className="flex-1 px-4 py-2 bg-cream/10 border border-cream/30 rounded-lg text-cream hover:bg-cream/20 transition-colors disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={toggleTextInput}
                    className="px-4 py-2 bg-cream/10 border border-cream/30 rounded-lg text-cream hover:bg-cream/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            
            {!isTextExpanded && (
              <p className="text-sm text-cream/60 mt-3">
                Tap to write a breadcrumb
              </p>
            )}
          </div>

          {/* Navigation to Breadcrumb Basket */}
          <button
            onClick={() => router.push('/basket')}
            className="px-6 py-3 bg-cream/10 border border-cream/30 rounded-lg text-cream hover:bg-cream/20 transition-colors"
          >
            View Breadcrumb Basket
          </button>
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
        
        .bg-cream\/10 {
          background-color: rgba(245, 245, 220, 0.1);
        }
        
        .bg-cream\/20 {
          background-color: rgba(245, 245, 220, 0.2);
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
        
        .text-cream\/50 {
          color: rgba(245, 245, 220, 0.5);
        }
        
        .placeholder-cream\/50::placeholder {
          color: rgba(245, 245, 220, 0.5);
        }
      `}</style>
    </>
  )
} 