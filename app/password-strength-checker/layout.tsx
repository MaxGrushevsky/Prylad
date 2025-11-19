import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Password Strength Checker - Test Password Security Online',
  description: 'Check password strength and security online. Get detailed feedback on password quality, common patterns, and recommendations. Free password strength tester.',
  keywords: [
    'password strength checker',
    'password security',
    'password tester',
    'password strength',
    'password validator',
    'password analyzer',
    'free password checker'
  ],
  path: '/password-strength-checker',
  category: 'Security'
})

export default function PasswordStrengthCheckerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

