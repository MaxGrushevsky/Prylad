'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AgeCalculatorRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/date-calculator#age')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600 dark:text-gray-400">Redirecting to Date & Age Calculator...</p>
    </div>
  )
}
