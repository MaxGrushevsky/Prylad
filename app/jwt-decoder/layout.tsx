import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free JWT Decoder & Generator - Decode, Generate & Validate JWT Tokens Online',
  description: 'Decode and generate JWT (JSON Web Token) tokens online for free. View header, payload, and signature. Create signed tokens with custom payload and headers. Check expiration, issuer, and other claims. Support for HS256, HS384, HS512 algorithms. No registration required.',
  keywords: [
    'JWT decoder',
    'JWT token decoder',
    'JWT generator',
    'JWT token generator',
    'decode JWT',
    'generate JWT',
    'JWT validator',
    'JSON Web Token decoder',
    'JSON Web Token generator',
    'JWT claims',
    'JWT header',
    'JWT payload',
    'JWT signature',
    'HMAC JWT',
    'JWT HS256',
    'JWT HS384',
    'JWT HS512',
    'free JWT decoder',
    'free JWT generator',
    'online JWT tool'
  ],
  path: '/jwt-decoder',
  category: 'Security'
})

export default function JWTDecoderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


