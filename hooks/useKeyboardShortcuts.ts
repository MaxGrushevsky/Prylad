import { useEffect, useCallback } from 'react'

interface KeyboardShortcuts {
  onEnter?: () => void
  onEscape?: () => void
  onCopy?: () => void
  onSave?: () => void
  onClear?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts({
  onEnter,
  onEscape,
  onCopy,
  onSave,
  onClear,
  enabled = true
}: KeyboardShortcuts) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Allow Enter in textareas, but check for modifiers
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && onEnter) {
          e.preventDefault()
          onEnter()
          return
        }
        // Don't trigger other shortcuts when typing
        if (e.key !== 'Escape') return
      }

      // Ctrl/Cmd + Enter - Execute main action
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && onEnter) {
        e.preventDefault()
        onEnter()
        return
      }

      // Escape - Clear/Close
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault()
        onEscape()
        return
      }

      // Ctrl/Cmd + S - Save/Export
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && onSave) {
        e.preventDefault()
        onSave()
        return
      }

      // Ctrl/Cmd + Shift + C - Clear
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C' && onClear) {
        e.preventDefault()
        onClear()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onEnter, onEscape, onCopy, onSave, onClear, enabled])
}

