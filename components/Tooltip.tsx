'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'

interface TooltipProps {
  content: string | ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export default function Tooltip({ 
  content, 
  children, 
  position = 'top',
  delay = 200,
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current
      const trigger = triggerRef.current
      const rect = trigger.getBoundingClientRect()
      const tooltipRect = tooltip.getBoundingClientRect()
      
      // Check if tooltip fits in viewport, adjust position if needed
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      let newPosition = position
      
      if (position === 'top' && rect.top < tooltipRect.height + 10) {
        newPosition = 'bottom'
      } else if (position === 'bottom' && rect.bottom + tooltipRect.height + 10 > viewportHeight) {
        newPosition = 'top'
      } else if (position === 'left' && rect.left < tooltipRect.width + 10) {
        newPosition = 'right'
      } else if (position === 'right' && rect.right + tooltipRect.width + 10 > viewportWidth) {
        newPosition = 'left'
      }
      
      setActualPosition(newPosition)
    }
  }, [isVisible, position])

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700 border-t-transparent border-b-transparent border-l-transparent',
  }

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${positionClasses[actualPosition]} pointer-events-none`}
          role="tooltip"
        >
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg px-3 py-2 shadow-lg max-w-xs whitespace-normal">
            {content}
            <div className={`absolute w-0 h-0 border-4 ${arrowClasses[actualPosition]}`} />
          </div>
        </div>
      )}
    </div>
  )
}

