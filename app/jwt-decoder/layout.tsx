import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free JWT Decoder - Decode & Validate JWT Tokens Online',
  description: 'Decode and validate JWT (JSON Web Token) tokens online for free. View header, payload, and signature. Check expiration, issuer, and other claims. No registration required.',
  keywords: [
    'JWT decoder',
    'JWT token decoder',
    'decode JWT',
    'JWT validator',
    'JSON Web Token decoder',
    'JWT claims',
    'JWT header',
    'JWT payload',
    'free JWT decoder'
  ],
  path: '/jwt-decoder',
  category: 'Code Tools'
})

export default function JWTDecoderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


