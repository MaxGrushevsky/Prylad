'use client'

interface AdBannerProps {
  position: 'top' | 'bottom' | 'sidebar'
}

export default function AdBanner({ position }: AdBannerProps) {
  // Here will be integration with ad networks (Google AdSense, Yandex Direct, etc.)
  // Currently a placeholder for demonstration

  const getAdSize = () => {
    switch (position) {
      case 'top':
      case 'bottom':
        return 'h-20 md:h-28' // Horizontal banner
      case 'sidebar':
        return 'h-96 w-full' // Vertical banner
      default:
        return 'h-20'
    }
  }

  return (
    <div
      className={`w-full ${getAdSize()} bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center transition-opacity hover:opacity-90`}
      role="banner"
      aria-label="Advertisement"
    >
    </div>
  )
}
