'use client'

import { useState, useEffect, ReactNode } from 'react'

interface HelpPanelProps {
  title: string
  content: ReactNode
  className?: string
}

export default function HelpPanel({ title, content, className = '' }: HelpPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors ${className}`}
        aria-label="Show help"
        title="Show help (?)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                aria-label="Close help"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 max-w-none">
              <div className="text-gray-700 dark:text-gray-300 prose prose-gray dark:prose-invert max-w-none">
                {content}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

