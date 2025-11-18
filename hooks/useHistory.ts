import { useState, useEffect, useCallback } from 'react'

interface HistoryItem<T> {
  id: string
  data: T
  timestamp: number
  label?: string
}

export function useHistory<T>(
  storageKey: string,
  maxItems: number = 10
) {
  const [history, setHistory] = useState<HistoryItem<T>[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setHistory(Array.isArray(parsed) ? parsed : [])
        } catch (e) {
          setHistory([])
        }
      }
    }
  }, [storageKey])

  // Save history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && history.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(history))
    }
  }, [history, storageKey])

  const addToHistory = useCallback((data: T, label?: string) => {
    const item: HistoryItem<T> = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      data,
      timestamp: Date.now(),
      label
    }
    setHistory(prev => [item, ...prev].slice(0, maxItems))
  }, [maxItems])

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  const getLatest = useCallback((): T | null => {
    return history.length > 0 ? history[0].data : null
  }, [history])

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getLatest
  }
}

