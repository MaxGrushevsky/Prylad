'use client'

import Link from 'next/link'
import { generateBreadcrumbSchema } from '@/lib/structured-data'

export interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema(items)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          {items.map((item, index) => (
            <li key={item.url} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400 dark:text-gray-500">/</span>
              )}
              {index === items.length - 1 ? (
                <span className="text-gray-900 dark:text-gray-100 font-medium" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

