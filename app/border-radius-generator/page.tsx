'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BorderRadiusRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/css-generators#border-radius')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600 dark:text-gray-400">Redirecting to CSS Generators...</p>
    </div>
  )
}
