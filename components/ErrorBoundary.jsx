'use client'

import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0e0e0e] px-6 text-center gap-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1.5"/>
              <path d="M12 7v5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16.5" r="1" fill="#ef4444"/>
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-xl font-semibold text-white">
            Something went wrong
          </h1>

          {/* Developer notice */}
          <div className="bg-[#1a1a1a] border border-white/[0.07] rounded-xl px-5 py-3.5 max-w-sm">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1cc978] animate-pulse" />
              <p className="text-[#1cc978] text-[12px] font-medium">
                Our team is working on it
              </p>
            </div>
            <p className="text-white/40 text-[12.5px] leading-relaxed">
              We're aware of the issue and are actively working to fix it.
              Please try again in a few moments.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#1cc978] text-white text-[13px] font-medium px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Reload page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-white/5 border border-white/10 text-white/60 text-[13px] font-medium px-5 py-2.5 rounded-lg hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              Go home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary