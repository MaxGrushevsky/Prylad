'use client'

import { useEffect } from 'react'

interface AdBannerProps {
  position: 'top' | 'bottom' | 'sidebar'
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export default function AdBanner({ position }: AdBannerProps) {
  useEffect(() => {
    try {
      // Initialize AdSense ads
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  // Show AdSense for top position
  if (position === 'top') {
    return (
      <div className="w-full flex justify-center items-center my-4" role="banner" aria-label="Advertisement">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-3205919903681434"
          data-ad-slot="1790047243"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    )
  }

  // Show AdSense for bottom position
  if (position === 'bottom') {
    return (
      <div className="w-full flex justify-center items-center my-4" role="banner" aria-label="Advertisement">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-format="autorelaxed"
          data-ad-client="ca-pub-3205919903681434"
          data-ad-slot="2911557228"
        />
      </div>
    )
  }

  // Placeholder for sidebar position
  return (
    <div
      className="w-full h-96 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center transition-opacity hover:opacity-90 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
      role="banner"
      aria-label="Advertisement"
    >
    </div>
  )
}
