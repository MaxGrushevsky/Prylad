'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CodeBeautifierRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/minifier')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Redirecting to Code Minifier & Beautifier...</p>
    </div>
  )
}
