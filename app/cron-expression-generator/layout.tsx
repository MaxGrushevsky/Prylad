import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Cron Expression Generator & Parser - Create & Decode Cron Jobs Online',
  description: 'Generate and parse cron expressions online for free. Create cron schedules with visual builder, decode existing cron expressions, see next execution times. Perfect for developers, DevOps, and system administrators. No registration required.',
  keywords: [
    'cron expression generator',
    'cron expression parser',
    'cron job generator',
    'cron schedule generator',
    'cron expression builder',
    'cron expression decoder',
    'parse cron expression',
    'cron syntax',
    'cron schedule',
    'cron job creator',
    'free cron generator',
    'online cron tool',
    'cron expression validator',
    'cron expression examples',
    'cron schedule maker'
  ],
  path: '/cron-expression-generator',
  category: 'Developer Tools'
})

export default function CronExpressionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


