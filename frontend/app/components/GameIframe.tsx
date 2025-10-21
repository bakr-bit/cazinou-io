'use client'

import {useState} from 'react'

type GameIframeProps = {
  url: string
  title: string
}

export function GameIframe({url, title}: GameIframeProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const toggleFullscreen = () => {
    const iframe = document.getElementById('game-iframe')
    if (!iframe) return

    if (!document.fullscreenElement) {
      iframe.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="relative rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-white">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-600 font-mono">
              Se încarcă jocul...
            </p>
          </div>
        </div>
      )}

      {/* Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition"
        title="Fullscreen"
      >
        {isFullscreen ? (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        )}
      </button>

      {/* Game Iframe */}
      <div className="relative w-full" style={{paddingBottom: '75%'}}>
        <iframe
          id="game-iframe"
          src={url}
          title={title}
          onLoad={handleLoad}
          className="absolute top-0 left-0 w-full h-full"
          allow="autoplay; fullscreen; payment"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  )
}
