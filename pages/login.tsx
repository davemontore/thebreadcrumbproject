import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // SET YOUR CREDENTIALS HERE - Change these to your desired username and password
    const correctUsername = 'davemontore' // Change this to your desired username
    const correctPassword = 'BizzyBell1225!@' // Change this to your desired password
    
    if (username === correctUsername && password === correctPassword) {
      // Store authentication in localStorage
      localStorage.setItem('authenticated', 'true')
      localStorage.setItem('loginTime', Date.now().toString())
      
      // Redirect to homepage
      router.push('/')
    } else {
      setError('Invalid username or password')
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

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
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
            
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-cream/10 border border-cream/30 rounded-lg text-cream hover:bg-cream/20 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Access Journal'}
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