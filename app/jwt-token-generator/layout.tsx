import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JWT Token Generator - Redirecting...',
  description: 'Redirecting to JWT Decoder & Generator',
}

export default function JWTTokenGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

