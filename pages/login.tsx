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
    const validCodes = process.env.NEXT_PUBLIC_INVITATION_CODES?.split(',') || []
    return validCodes.includes(code.trim())
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

    if (!validateInvitationCode(invitationCode)) {
      setError('Invalid invitation code. Please check your code and try again.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const registerResult = await FirebaseAuthService.registerUser(username.trim(), password)
      if (registerResult.success) {
        router.push('/')
      } else {
        setError(registerResult.error || 'Failed to create account. Please try again.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - The Breadcrumb Project</title>
        <meta name="description" content="Secure access to your journal" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-cream-10 border border-cream-30 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-light text-cream mb-2">
                The Breadcrumb Project
              </h1>
              <p className="text-cream-80 mb-2 text-base italic">
                Leaving a trail of wisdom for your kids to follow after you're gone
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
                  placeholder="invitation code (for new accounts)"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900 border border-red-700 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={!password.trim() || !username.trim() || isLoading}
                  className="flex-1 py-3 bg-cream-20 text-cream rounded-xl hover:bg-cream-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-cream-30"
                >
                  {isLoading ? 'Please wait...' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={handleSignup}
                  disabled={!password.trim() || !username.trim() || !invitationCode.trim() || isLoading}
                  className="flex-1 py-3 bg-cream-10 text-cream rounded-xl hover:bg-cream-20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-cream-30"
                >
                  {isLoading ? 'Please wait...' : 'Sign Up'}
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