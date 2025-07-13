import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [isRecording, setIsRecording] = useState(false)

  return (
    <>
      <Head>
        <title>The Breadcrumb Project</title>
        <meta name="description" content="Record your thoughts and memories" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-black text-cream flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-light mb-8 text-cream">
            The Breadcrumb Project
          </h1>
          
          <p className="text-lg mb-12 text-cream/80 leading-relaxed">
            Leave a trace of your journey, one thought at a time.
          </p>

          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`
              w-24 h-24 rounded-full border-2 transition-all duration-300
              ${isRecording 
                ? 'bg-red-600 border-red-400 animate-pulse' 
                : 'bg-cream/10 border-cream/30 hover:bg-cream/20'
              }
            `}
          >
            <div className="text-2xl">
              {isRecording ? '⏹️' : '🎤'}
            </div>
          </button>

          <p className="mt-6 text-sm text-cream/60">
            {isRecording ? 'Recording...' : 'Tap to record a breadcrumb'}
          </p>
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
      `}</style>
    </>
  )
} 