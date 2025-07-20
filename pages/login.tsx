import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { FirebaseAuthService } from '../lib/firebase-auth'

export default function Login() {
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [invitationCode, setInvitationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if already authenticated with Firebase Auth only
    if (FirebaseAuthService.isAuthenticated()) {
      router.push('/')
      return
    }
  }, [router])

  // Validate invitation code
  const validateInvitationCode = (code: string): boolean => {
    const validCode = process.env.NEXT_PUBLIC_INVITATION_CODES || ''
    const isValid = code.trim() === validCode.trim()
    
    console.log('Valid code:', validCode)
    console.log('Checking code:', code.trim())
    console.log('Is valid:', isValid)
    
    return isValid
  }



  const handleLogin = async () => {
    if (!password.trim() || !username.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const loginResult = await FirebaseAuthService.loginUser(username.trim(), password)
      if (loginResult.success) {
        router.push('/')
      } else {
        setError(loginResult.error || 'Login failed. Please try again.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async () => {
    if (!password.trim() || !username.trim()) return

    if (!invitationCode.trim()) {
      setError('Invitation code is required to create an account.')
      return
    }

    // Client-side validation with detailed logging
    const clientValid = validateInvitationCode(invitationCode)
    console.log('Client-side validation result:', clientValid)

    if (!clientValid) {
      setError('Invalid invitation code. Please check your code and try again.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Double-check with server-side validation
      const serverCheck = await fetch('/api/validate-invitation-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: invitationCode.trim() })
      })
      
      const serverResult = await serverCheck.json()
      console.log('Server validation result:', serverResult)
      
      if (!serverResult.valid) {
        setError('Server validation failed. Please try again.')
        setIsLoading(false)
        return
      }

      const registerResult = await FirebaseAuthService.registerUser(username.trim(), password)
      if (registerResult.success) {
        router.push('/')
      } else {
        setError(registerResult.error || 'Failed to create account. Please try again.')
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - Write Here. Right Now</title>
        <meta name="description" content="Secure access to your journal" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-cream-10 border border-cream-30 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-5xl sm:text-6xl font-light text-cream mb-2" style={{ fontFamily: 'Special Elite, monospace' }}>
                Write Here. Right Now.
              </h1>
              <p className="text-2xl sm:text-3xl font-light text-cream-80 mb-2 text-base italic" style={{ fontFamily: 'Homemade Apple, cursive' }}>
                Notes or it didn't happen
              </p>
              <p className="text-cream-80">
                Enter your credentials to continue
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <input
                  type="email"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border border-cream-30 rounded-xl focus:ring-2 focus:ring-cream-50 focus:border-transparent transition-all duration-200 bg-cream-10 text-cream text-center placeholder-cream-60 lowercase"
                  style={{ fontFamily: 'Cutive Mono, monospace' }}
                  placeholder="email address"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-cream-30 rounded-xl focus:ring-2 focus:ring-cream-50 focus:border-transparent transition-all duration-200 bg-cream-10 text-cream text-center placeholder-cream-60 lowercase"
                  style={{ fontFamily: 'Cutive Mono, monospace' }}
                  placeholder="password"
                  disabled={isLoading}
                  autoComplete="current-password"
                  minLength={6}
                />
              </div>
              
              <div>
                <input
                  type="text"
                  id="invitationCode"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  className="w-full p-3 border border-cream-30 rounded-xl focus:ring-2 focus:ring-cream-50 focus:border-transparent transition-all duration-200 bg-cream-10 text-cream text-center placeholder-cream-60 lowercase"
                  style={{ fontFamily: 'Cutive Mono, monospace' }}
                  placeholder="invitation code (for new accounts)"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <p className="text-xs text-cream-60 mt-1 text-center">
                  Required to create a new account
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-900 border border-red-700 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={!password.trim() || !username.trim() || isLoading}
                  className="w-full py-3 bg-cream-20 text-cream rounded-xl hover:bg-cream-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-cream-30"
                  style={{ fontFamily: 'Cutive Mono, monospace' }}
                >
                  {isLoading ? 'Please wait...' : 'Login to Existing Account'}
                </button>
                <div className="text-center">
                  <span className="text-cream-60 text-sm">— or —</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignup}
                  disabled={!password.trim() || !username.trim() || !invitationCode.trim() || isLoading}
                  className="w-full py-3 bg-cream-10 text-cream rounded-xl hover:bg-cream-20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-cream-30"
                  style={{ fontFamily: 'Cutive Mono, monospace' }}
                >
                  {isLoading ? 'Please wait...' : 'Create New Account'}
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-cream-60">
                Don't have an account? Create one.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 