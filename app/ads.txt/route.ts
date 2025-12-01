import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'ads.txt')
    const fileContents = readFileSync(filePath, 'utf-8')
    
    return new NextResponse(fileContents, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error reading ads.txt:', error)
    return new NextResponse('File not found', { status: 404 })
  }
}

