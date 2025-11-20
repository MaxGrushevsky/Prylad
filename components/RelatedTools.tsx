'use client'

import Link from 'next/link'

export interface RelatedTool {
  name: string
  path: string
  description: string
  icon?: string
}

interface RelatedToolsProps {
  tools: RelatedTool[]
  title?: string
}

export default function RelatedTools({ tools, title = "Related Tools" }: RelatedToolsProps) {
  if (tools.length === 0) return null

  return (
    <section className="max-w-4xl mx-auto mt-16">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.path}
              href={tool.path}
              className="group p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                {tool.icon && (
                  <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

