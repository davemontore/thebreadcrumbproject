import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { SimpleAuth } from '../lib/auth'

export default function Login() {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSetup, setIsSetup] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if already authenticated
    if (SimpleAuth.isAuthenticated()) {
      router.push('/')
      return
    }

    // Check if password is already set up
    setIsSetup(SimpleAuth.isPasswordSet())
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setIsLoading(true)
    setError('')

    try {
      let success = false

      if (isSetup) {
        // Regular login
        success = await SimpleAuth.authenticate(password)
        if (!success) {
          setError('Incorrect password. Please try again.')
        }
      } else {
        // First time setup
        success = await SimpleAuth.setupPassword(password)
        if (!success) {
          setError('Failed to set up password. Please try again.')
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
        <title>Login - Simple Journal</title>
        <meta name="description" content="Secure access to your journal" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Simple Journal
              </h1>
              <p className="text-slate-600">
                {isSetup ? 'Enter your password to continue' : 'Set up your password'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={isSetup ? "Enter your password" : "Choose a secure password"}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!password.trim() || isLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {isLoading ? 'Please wait...' : (isSetup ? 'Login' : 'Set Password')}
              </button>
            </form>

            {isSetup && (
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
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