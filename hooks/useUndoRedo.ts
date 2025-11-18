import { useState, useCallback, useRef } from 'react'

export function useUndoRedo<T>(initialValue: T, maxHistory: number = 50) {
  const [current, setCurrent] = useState<T>(initialValue)
  const historyRef = useRef<T[]>([initialValue])
  const historyIndexRef = useRef(0)

  const setValue = useCallback((newValue: T) => {
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1)
    newHistory.push(newValue)
    
    // Limit history size
    if (newHistory.length > maxHistory) {
      newHistory.shift()
    } else {
      historyIndexRef.current = newHistory.length - 1
    }
    
    historyRef.current = newHistory
    setCurrent(newValue)
  }, [maxHistory])

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--
      setCurrent(historyRef.current[historyIndexRef.current])
      return true
    }
    return false
  }, [])

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++
      setCurrent(historyRef.current[historyIndexRef.current])
      return true
    }
    return false
  }, [])

  const canUndo = historyIndexRef.current > 0
  const canRedo = historyIndexRef.current < historyRef.current.length - 1

  return {
    value: current,
    setValue,
    undo,
    redo,
    canUndo,
    canRedo
  }
}

