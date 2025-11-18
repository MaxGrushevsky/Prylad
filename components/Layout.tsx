'use client'

import Navigation from './Navigation'
import AdBanner from './AdBanner'

interface LayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export default function Layout({ children, title, description }: LayoutProps) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 lg:ml-80">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600">{description}</p>
            )}
          </div>
        </header>

        {/* Top ad banner */}
        <div className="container mx-auto px-4 mb-6">
          <AdBanner position="top" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>

        {/* Bottom ad banner */}
        <div className="container mx-auto px-4 mt-12 mb-8">
          <AdBanner position="bottom" />
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200/50">
          <div className="text-center text-gray-600">
            <p className="mb-2 font-medium">© 2025 Tuly</p>
            <p className="text-sm text-gray-500">
              All tools are free and work in the browser
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}
