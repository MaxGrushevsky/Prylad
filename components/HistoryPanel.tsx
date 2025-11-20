'use client'

import { useState } from 'react'

interface HistoryItem<T> {
  id: string
  data: T
  timestamp: number
  label?: string
}

interface HistoryPanelProps<T> {
  history: HistoryItem<T>[]
  onSelect: (item: T) => void
  onRemove: (id: string) => void
  onClear: () => void
  formatItem: (item: T) => string
  title?: string
  maxDisplay?: number
}

export default function HistoryPanel<T>({
  history,
  onSelect,
  onRemove,
  onClear,
  formatItem,
  title = 'History',
  maxDisplay = 10
}: HistoryPanelProps<T>) {
  const [isOpen, setIsOpen] = useState(false)

  if (history.length === 0) return null

  const displayHistory = history.slice(0, maxDisplay)

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm"
      >
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {title} ({history.length})
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
          {displayHistory.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <button
                onClick={() => onSelect(item.data)}
                className="flex-1 text-left min-w-0"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.label || formatItem(item.data)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </button>
              <button
                onClick={() => onRemove(item.id)}
                className="ml-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove from history"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear History
            </button>
          )}
        </div>
      )}
    </div>
  )
}


