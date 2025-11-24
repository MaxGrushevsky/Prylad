import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free JSONPath Query Tool - Query & Extract JSON Data Online | Prylad',
  description: 'Query and extract data from JSON using JSONPath expressions. Visual tree selector and advanced JSONPath syntax. Free online JSONPath query tool with interactive UI. No registration required. Works entirely in your browser.',
  keywords: [
    'JSONPath',
    'JSON query',
    'JSON extract',
    'JSONPath query tool',
    'JSON selector',
    'JSON filter',
    'query JSON',
    'extract JSON data',
    'free JSONPath tool',
    'JSONPath online',
    'JSONPath tester',
    'JSONPath validator',
    'JSON query language',
    'JSON data extraction',
    'JSONPath expression',
    'JSONPath syntax',
    'JSON navigator',
    'JSON parser tool',
    'JSONPath evaluator',
    'JSONPath browser',
    'online JSONPath',
    'JSONPath visualizer',
    'JSONPath builder',
    'JSONPath generator',
    'JSON API query',
    'JSON data query',
    'JSONPath examples',
    'JSONPath tutorial',
    'JSONPath guide'
  ],
  path: '/json-path-query',
  category: 'Code Tools'
})

export default function JSONPathQueryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

