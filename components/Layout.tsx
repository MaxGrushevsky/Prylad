'use client'

import { memo } from 'react'
import Navigation from './Navigation'
import AdBanner from './AdBanner'
import HelpPanel from './HelpPanel'
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs'

interface LayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  helpContent?: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

function Layout({ children, title, description, helpContent, breadcrumbs }: LayoutProps) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 lg:ml-80 transition-colors">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 md:py-8">
          <div className="max-w-4xl mx-auto">
            {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {title}
                </h1>
                {description && (
                  <p className="text-gray-600 dark:text-gray-400">{description}</p>
                )}
              </div>
              {helpContent && (
                <HelpPanel title={`Help: ${title}`} content={helpContent} />
              )}
            </div>
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
        <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2 font-medium">© 2025 Prylad</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
              All tools are free and work in the browser
            </p>
            <a
              href="https://buymeacoffee.com/mgrushevsky"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <span>☕</span>
              <span>Support us</span>
            </a>
          </div>
        </footer>
      </main>
    </>
  )
}

export default memo(Layout)
