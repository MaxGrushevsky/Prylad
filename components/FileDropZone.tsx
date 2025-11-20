'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'

interface FileDropZoneProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number // in bytes
  children?: React.ReactNode
  className?: string
  disabled?: boolean
}

export default function FileDropZone({
  onFileSelect,
  accept,
  maxSize,
  children,
  className = '',
  disabled = false
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (accept && !accept.split(',').some(type => {
      const trimmed = type.trim()
      if (trimmed.startsWith('.')) {
        return file.name.toLowerCase().endsWith(trimmed.toLowerCase())
      }
      return file.type.match(trimmed.replace('*', '.*'))
    })) {
      return `File type not supported. Accepted: ${accept}`
    }

    if (maxSize && file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2)
      return `File too large. Maximum size: ${maxSizeMB} MB`
    }

    return null
  }

  const handleFile = (file: File) => {
    setError(null)
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    onFileSelect(file)
  }

  const handleDragEnter = (e: DragEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div
      className={`relative ${className}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
      <div
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
          ${isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {children || (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            {accept && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {accept}
              </p>
            )}
            {maxSize && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Max size: {(maxSize / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}


