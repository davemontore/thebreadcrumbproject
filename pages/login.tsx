import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { SimpleAuth } from '../lib/auth'
import { FirebaseAuthService } from '../lib/firebase-auth'

export default function Login() {
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSetup, setIsSetup] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if already authenticated with either method
    if (SimpleAuth.isAuthenticated() || FirebaseAuthService.isAuthenticated()) {
      router.push('/')
      return
    }

    // Check if password is already set up (for backward compatibility)
    setIsSetup(SimpleAuth.isPasswordSet())
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || !username.trim()) return

    setIsLoading(true)
    setError('')

    try {
      let success = false

      if (isSetup) {
        // Try Firebase Auth first, then fallback to SimpleAuth
        const firebaseResult = await FirebaseAuthService.loginUser(username.trim(), password)
        if (firebaseResult.success) {
          success = true
        } else {
          // Fallback to SimpleAuth for existing users
          success = await SimpleAuth.authenticate(password)
          if (!success) {
            setError('Incorrect password. Please try again.')
          }
        }
      } else {
        // First time setup - create Firebase account
        const firebaseResult = await FirebaseAuthService.registerUser(username.trim(), password)
        if (firebaseResult.success) {
          success = true
        } else {
          setError(firebaseResult.error || 'Failed to create account. Please try again.')
        }
      }

      if (success) {
        router.push('/')
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
                {isSetup ? 'Enter your credentials to continue' : 'Create your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border border-cream-30 rounded-xl focus:ring-2 focus:ring-cream-50 focus:border-transparent transition-all duration-200 bg-cream-10 text-cream text-center placeholder-cream-60 lowercase"
                  placeholder="email address"
                  required
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
                  required
                  disabled={isLoading}
                  autoComplete={isSetup ? "current-password" : "new-password"}
                  minLength={6}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900 border border-red-700 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!password.trim() || !username.trim() || isLoading}
                className="w-full py-3 bg-cream-20 text-cream rounded-xl hover:bg-cream-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-cream-30"
              >
                {isLoading ? 'Please wait...' : (isSetup ? 'Login' : 'Create Account')}
              </button>
            </form>

            {isSetup && (
              <div className="mt-6 text-center">
                <p className="text-sm text-cream-60">
                  Forgot your password? Clear your browser data to reset.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 