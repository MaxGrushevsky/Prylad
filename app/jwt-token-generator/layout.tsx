import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free JWT Token Generator - Create JWT Tokens Online',
  description: 'Generate JWT (JSON Web Token) tokens online. Create signed tokens with custom payload and headers. Support for HS256, RS256 algorithms. No registration required.',
  keywords: [
    'JWT generator',
    'JWT token generator',
    'JSON Web Token generator',
    'create JWT',
    'JWT token',
    'JWT sign',
    'free JWT generator'
  ],
  path: '/jwt-token-generator',
  category: 'Security'
})

export default function JWTTokenGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

