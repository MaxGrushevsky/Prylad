import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Password Generator - Create Strong Secure Passwords Online',
  description: 'Generate strong, secure passwords online for free. Customize length, character types, and security options. Calculate password strength, entropy, and crack time. No registration required.',
  keywords: [
    'password generator',
    'strong password',
    'secure password',
    'random password',
    'password strength',
    'password entropy',
    'password crack time',
    'free password generator'
  ],
  path: '/password-generator',
  category: 'Security Tools'
})

export default function PasswordGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

