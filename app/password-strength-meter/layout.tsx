import { generateRedirectMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateRedirectMetadata({
  title: 'Free Password Strength Meter - Check Your Password Security Online',
  description: 'Test your password strength online for free. Get detailed security analysis, entropy calculation, crack time estimates, and actionable feedback to improve your password security.',
  keywords: [
    'password strength meter',
    'password checker',
    'password security',
    'password strength test',
    'check password strength',
    'password analyzer',
    'password entropy',
    'password crack time',
    'password strength calculator',
    'how strong is my password',
    'password security checker',
    'free password strength meter',
    'online password checker',
    'password strength tool',
    'password strength analyzer'
  ],
  path: '/password-strength-meter',
  category: 'Security Tools'
}, '/password-generator#check')

export default function PasswordStrengthMeterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


