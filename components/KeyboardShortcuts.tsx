'use client'

interface KeyboardShortcutsProps {
  shortcuts: Array<{
    keys: string[]
    description: string
  }>
}

export default function KeyboardShortcuts({ shortcuts }: KeyboardShortcutsProps) {
  if (shortcuts.length === 0) return null

  const formatKey = (key: string) => {
    if (key === 'Ctrl') return navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'
    if (key === 'Cmd') return '⌘'
    if (key === 'Enter') return '↵'
    if (key === 'Escape') return 'Esc'
    if (key === 'Shift') return '⇧'
    if (key === 'Alt') return '⌥'
    return key
  }

  return (
    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">Keyboard Shortcuts</div>
      <div className="space-y-1.5">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">{shortcut.description}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, keyIndex) => (
                <span key={keyIndex}>
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 rounded text-xs font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    {formatKey(key)}
                  </kbd>
                  {keyIndex < shortcut.keys.length - 1 && (
                    <span className="mx-1 text-gray-400">+</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


