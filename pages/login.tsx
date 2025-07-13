import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { AuthService } from '../lib/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signupCode, setSignupCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  // SET YOUR PRIVATE SIGNUP CODE HERE
  const PRIVATE_SIGNUP_CODE = 'breadcrumb2024' // Change this to your own secret code

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isSignUp) {
        // Check signup code for new accounts
        if (signupCode !== PRIVATE_SIGNUP_CODE) {
          setError('Invalid signup code')
          setPassword('')
          setIsLoading(false)
          return
        }
        
        const { user, error } = await AuthService.signUp(email, password)
        if (error) {
          setError(error.message || 'Account creation failed')
          setPassword('')
        } else if (user) {
          router.push('/')
        }
      } else {
        // Regular sign in
        const { user, error } = await AuthService.signIn(email, password)
        if (error) {
          setError(error.message || 'Sign in failed')
          setPassword('')
        } else if (user) {
          router.push('/')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setPassword('')
    }
    
    setIsLoading(false)
  }

  return (
    <>
      <Head>
        <title>The Breadcrumb Project</title>
        <meta name="description" content="Login to access your personal journal" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-black text-cream flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <h1 className="text-4xl font-light mb-12 text-cream">
            The Breadcrumb Project
          </h1>

          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-cream text-black placeholder-black/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream/30"
              required
            />
            
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-cream text-black placeholder-black/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream/30"
              required
            />
            
            {isSignUp && (
              <input
                type="text"
                value={signupCode}
                onChange={(e) => setSignupCode(e.target.value)}
                placeholder="Signup Code"
                className="w-full px-4 py-3 bg-cream text-black placeholder-black/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cream/30"
                required
              />
            )}
            
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-cream/10 border border-cream/30 rounded-lg text-cream hover:bg-cream/20 transition-colors disabled:opacity-50"
            >
              {isLoading ? (isSignUp ? 'Creating Account...' : 'Logging in...') : (isSignUp ? 'Create Account' : 'Access Journal')}
            </button>
            
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full px-4 py-2 text-cream/60 hover:text-cream/80 transition-colors text-sm"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </form>
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
        
        .bg-cream {
          background-color: #f5f5dc;
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
        
        .text-black {
          color: #000000;
        }
        
        .placeholder-black\/50::placeholder {
          color: rgba(0, 0, 0, 0.5);
        }
        
        .focus\:ring-cream\/30:focus {
          box-shadow: 0 0 0 2px rgba(245, 245, 220, 0.3);
        }
      `}</style>
    </>
  )
} 