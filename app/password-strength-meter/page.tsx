'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PasswordStrengthMeterRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/password-generator#check')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600 dark:text-gray-400">Redirecting to Password Generator...</p>
    </div>
  )
}
