import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import '../styles/globals.css'
import { FirebaseAuthService } from '../lib/firebase-auth'

export default function App({ Component, pageProps }: AppProps) {
  const [authInitialized, setAuthInitialized] = useState(false)

  useEffect(() => {
    // Initialize Firebase authentication listener
    const unsubscribe = FirebaseAuthService.onAuthStateChange((user) => {
      console.log('App: Auth state changed:', user ? { uid: user.uid, email: user.email } : 'null')
      setAuthInitialized(true)
    })

    return () => unsubscribe()
  }, [])

  // Show loading while auth is initializing
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-black text-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-cream-80">Initializing...</p>
        </div>
      </div>
    )
  }

  return <Component {...pageProps} />
} 