import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: '🔒 Text Encryption & Decryption - Secure Text Cipher Online',
  description: 'Encrypt and decrypt text using multiple methods: Caesar cipher, ROT13, Atbash, XOR, Vigenère, and Base64. Free online text encryption tool with real-time processing. Perfect for learning cryptography and securing messages.',
  keywords: [
    'text encryption',
    'text decryption',
    'caesar cipher',
    'rot13',
    'atbash cipher',
    'xor encryption',
    'vigenere cipher',
    'base64 encoding',
    'cipher tool',
    'encryption online',
    'cryptography tool',
    'text cipher'
  ],
  path: '/text-encryption',
  category: 'Security'
})

export default function TextEncryptionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

