'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type ConversionMode = 'timestamp-to-date' | 'date-to-timestamp'
type TimestampUnit = 'seconds' | 'milliseconds'
type DateFormat = 'iso' | 'us' | 'eu' | 'custom'

interface ConversionResult {
  timestamp: number
  date: Date
  formatted: {
    iso: string
    us: string
    eu: string
    custom: string
    rfc2822: string
    unix: string
  }
  timezone: string
  dayOfWeek: string
  dayOfYear: number
  weekOfYear: number
  isLeapYear: boolean
  isDST: boolean
}

const timePresets = [
  { name: 'Now', value: () => Math.floor(Date.now() / 1000) },
  { name: 'Unix Epoch', value: 0 },
  { name: 'Y2K', value: 946684800 },
  { name: 'Year 2000', value: 946684800 },
  { name: 'Year 2038 Problem', value: 2147483647 },
  { name: '1 Hour Ago', value: () => Math.floor((Date.now() - 3600000) / 1000) },
  { name: '1 Day Ago', value: () => Math.floor((Date.now() - 86400000) / 1000) },
  { name: '1 Week Ago', value: () => Math.floor((Date.now() - 604800000) / 1000) },
  { name: '1 Month Ago', value: () => Math.floor((Date.now() - 2592000000) / 1000) },
  { name: '1 Year Ago', value: () => Math.floor((Date.now() - 31536000000) / 1000) },
]

const datePresets = [
  { name: 'Now', value: () => new Date().toISOString().slice(0, 16) },
  { name: 'Unix Epoch', value: '1970-01-01T00:00' },
  { name: 'Y2K', value: '2000-01-01T00:00' },
  { name: 'Today Start', value: () => new Date().toISOString().slice(0, 10) + 'T00:00' },
  { name: 'Today End', value: () => new Date().toISOString().slice(0, 10) + 'T23:59' },
]

export default function UnixTimestampConverterPage() {
  const [mode, setMode] = useState<ConversionMode>('timestamp-to-date')
  const [timestamp, setTimestamp] = useState('')
  const [timestampUnit, setTimestampUnit] = useState<TimestampUnit>('seconds')
  const [dateInput, setDateInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [useCurrentTime, setUseCurrentTime] = useState(false)
  const [timezone, setTimezone] = useState('UTC')
  const [autoConvert, setAutoConvert] = useState(true)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState('')
  const [totalConversions, setTotalConversions] = useState(0)

  const timezones = [
    'UTC', 'GMT', 'EST', 'PST', 'CST', 'MST',
    'Europe/London', 'Europe/Paris', 'Europe/Moscow',
    'America/New_York', 'America/Los_Angeles', 'America/Chicago',
    'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai',
    'Australia/Sydney', 'Pacific/Auckland'
  ]

  const convertTimestampToDate = useCallback((ts: number, unit: TimestampUnit): ConversionResult | null => {
    try {
      const timestampMs = unit === 'milliseconds' ? ts : ts * 1000
      const date = new Date(timestampMs)
      
      if (isNaN(date.getTime())) {
        return null
      }

      // Format date in specified timezone
      const formatInTimezone = (date: Date, tz: string) => {
        try {
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })

          const parts = formatter.formatToParts(date)
          const year = parts.find(p => p.type === 'year')?.value || ''
          const month = parts.find(p => p.type === 'month')?.value || ''
          const day = parts.find(p => p.type === 'day')?.value || ''
          const hour = parts.find(p => p.type === 'hour')?.value || ''
          const minute = parts.find(p => p.type === 'minute')?.value || ''
          const second = parts.find(p => p.type === 'second')?.value || ''

          return { year, month, day, hour, minute, second }
        } catch (e) {
          // Fallback to UTC if timezone is invalid
          const year = date.getUTCFullYear().toString()
          const month = String(date.getUTCMonth() + 1).padStart(2, '0')
          const day = String(date.getUTCDate()).padStart(2, '0')
          const hour = String(date.getUTCHours()).padStart(2, '0')
          const minute = String(date.getUTCMinutes()).padStart(2, '0')
          const second = String(date.getUTCSeconds()).padStart(2, '0')
          return { year, month, day, hour, minute, second }
        }
      }

      const formatted = formatInTimezone(date, timezone)
      const iso = `${formatted.year}-${formatted.month}-${formatted.day}T${formatted.hour}:${formatted.minute}:${formatted.second}`
      const us = `${formatted.month}/${formatted.day}/${formatted.year} ${formatted.hour}:${formatted.minute}:${formatted.second}`
      const eu = `${formatted.day}/${formatted.month}/${formatted.year} ${formatted.hour}:${formatted.minute}:${formatted.second}`
      const custom = `${formatted.day}.${formatted.month}.${formatted.year} ${formatted.hour}:${formatted.minute}:${formatted.second}`
      
      let rfc2822 = ''
      try {
        rfc2822 = date.toLocaleString('en-US', { 
          timeZone: timezone, 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit', 
          timeZoneName: 'short' 
        })
      } catch (e) {
        rfc2822 = date.toUTCString()
      }
      
      const unix = date.toUTCString()

      let dayOfWeek = ''
      try {
        dayOfWeek = date.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'long' })
      } catch (e) {
        dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
      }
      
      // Calculate day of year
      const year = parseInt(formatted.year)
      const month = parseInt(formatted.month) - 1
      const day = parseInt(formatted.day)
      
      let dayOfYear = 1
      let weekOfYear = 1
      try {
        // Calculate based on the date components in timezone
        const tzDate = new Date(year, month, day)
        const startOfYear = new Date(year, 0, 1)
        dayOfYear = Math.floor((tzDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1
        if (dayOfYear < 1) dayOfYear = 1
        weekOfYear = Math.ceil(dayOfYear / 7)
        if (weekOfYear < 1) weekOfYear = 1
      } catch (e) {
        // Fallback calculation using UTC
        const startOfYear = new Date(date.getUTCFullYear(), 0, 1)
        dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1
        weekOfYear = Math.ceil(dayOfYear / 7)
      }
      
      const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
      
      // DST calculation (simplified - checks if timezone offset changes)
      let isDST = false
      try {
        const jan = new Date(year, 0, 1)
        const jul = new Date(year, 6, 1)
        const currentOffset = date.getTimezoneOffset()
        const janOffset = new Date(year, 0, 15).getTimezoneOffset()
        const julOffset = new Date(year, 6, 15).getTimezoneOffset()
        const stdOffset = Math.max(janOffset, julOffset)
        isDST = currentOffset < stdOffset
      } catch (e) {
        isDST = false
      }

      return {
        timestamp: ts,
        date,
        formatted: {
          iso,
          us,
          eu,
          custom,
          rfc2822,
          unix
        },
        timezone,
        dayOfWeek,
        dayOfYear,
        weekOfYear,
        isLeapYear: isLeapYear(date.getFullYear()),
        isDST
      }
    } catch (e) {
      return null
    }
  }, [timezone])

  const convertDateToTimestamp = useCallback((dateStr: string, timeStr: string): ConversionResult | null => {
    try {
      const dateTime = timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T00:00:00`
      const date = new Date(dateTime)
      
      if (isNaN(date.getTime())) {
        return null
      }

      const timestampSeconds = Math.floor(date.getTime() / 1000)
      const result = convertTimestampToDate(timestampSeconds, 'seconds')
      
      if (result) {
        // Update timestamp to show seconds (for date-to-timestamp mode)
        result.timestamp = timestampSeconds
      }
      
      return result
    } catch (e) {
      return null
    }
  }, [convertTimestampToDate])

  const handleConvert = useCallback(() => {
    setError('')
    
    if (mode === 'timestamp-to-date') {
      const ts = timestamp.trim()
      if (!ts) {
        setResult(null)
        return
      }

      const timestampNum = parseFloat(ts)
      if (isNaN(timestampNum)) {
        setError('Invalid timestamp. Please enter a valid number.')
        setResult(null)
        return
      }

      const result = convertTimestampToDate(timestampNum, timestampUnit)
      if (!result) {
        setError('Invalid timestamp. Date is out of range.')
        setResult(null)
        return
      }

      setResult(result)
      setTotalConversions(prev => prev + 1)
    } else {
      if (useCurrentTime) {
        const now = new Date()
        const dateStr = now.toISOString().slice(0, 10)
        const timeStr = now.toTimeString().slice(0, 5)
        const result = convertDateToTimestamp(dateStr, timeStr)
        if (result) {
          setResult(result)
          setTotalConversions(prev => prev + 1)
        }
      } else {
        if (!dateInput) {
          setResult(null)
          return
        }

        const result = convertDateToTimestamp(dateInput, timeInput)
        if (!result) {
          setError('Invalid date or time. Please check your input.')
          setResult(null)
          return
        }

        setResult(result)
        setTotalConversions(prev => prev + 1)
      }
    }
  }, [mode, timestamp, timestampUnit, dateInput, timeInput, useCurrentTime, convertTimestampToDate, convertDateToTimestamp])

  useEffect(() => {
    if (autoConvert) {
      handleConvert()
    }
  }, [autoConvert, handleConvert])

  useEffect(() => {
    if (useCurrentTime && mode === 'date-to-timestamp') {
      const now = new Date()
      setDateInput(now.toISOString().slice(0, 10))
      setTimeInput(now.toTimeString().slice(0, 5))
    }
  }, [useCurrentTime, mode])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Failed to copy
    }
  }

  const applyTimestampPreset = (preset: typeof timePresets[0]) => {
    const value = typeof preset.value === 'function' ? preset.value() : preset.value
    setTimestamp(value.toString())
    if (autoConvert) {
      setTimeout(() => handleConvert(), 0)
    }
  }

  const applyDatePreset = (preset: typeof datePresets[0]) => {
    const value = typeof preset.value === 'function' ? preset.value() : preset.value
    if (value.includes('T')) {
      const [date, time] = value.split('T')
      setDateInput(date)
      setTimeInput(time || '')
    } else {
      setDateInput(value)
      setTimeInput('')
    }
    if (autoConvert) {
      setTimeout(() => handleConvert(), 0)
    }
  }

  // SEO data
  const toolPath = '/unix-timestamp-converter'
  const toolName = 'Unix Timestamp Converter'
  const category = 'converter'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is a Unix timestamp?",
      answer: "A Unix timestamp (also called epoch time) is the number of seconds or milliseconds that have elapsed since January 1, 1970, 00:00:00 UTC. It's a standard way to represent time in computing systems."
    },
    {
      question: "How do I convert a timestamp to a date?",
      answer: "Enter your Unix timestamp (in seconds or milliseconds) in the input field, select the unit, choose your timezone, and the converter automatically shows the equivalent date and time in multiple formats (ISO, US, EU, RFC2822, etc.)."
    },
    {
      question: "How do I convert a date to a timestamp?",
      answer: "Switch to 'Date → Timestamp' mode, select your date and time, choose timezone, select timestamp unit (seconds or milliseconds), and the converter shows the Unix timestamp."
    },
    {
      question: "What's the difference between seconds and milliseconds?",
      answer: "Unix timestamps can be in seconds (10 digits, e.g., 1609459200) or milliseconds (13 digits, e.g., 1609459200000). JavaScript uses milliseconds, while many systems use seconds. The converter supports both."
    },
    {
      question: "Can I convert timestamps in different timezones?",
      answer: "Yes! The converter supports all major timezones. Select your desired timezone from the dropdown, and all date/time outputs will be displayed in that timezone."
    },
    {
      question: "Is the Unix timestamp converter free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All conversions happen in your browser - we never see or store your data."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Select Conversion Mode",
      text: "Choose 'Timestamp → Date' to convert Unix timestamp to date/time, or 'Date → Timestamp' to convert date/time to Unix timestamp."
    },
    {
      name: "Enter Your Value",
      text: "For timestamp to date: enter the Unix timestamp. For date to timestamp: select date, time, and timezone from the pickers."
    },
    {
      name: "Configure Options",
      text: "Select timestamp unit (seconds or milliseconds), choose timezone, and select date format (ISO, US, EU, or custom)."
    },
    {
      name: "View Results",
      text: "See the converted result in multiple formats including ISO 8601, US format, EU format, RFC2822, and Unix format. Additional info like day of week, day of year, and DST status is shown."
    },
    {
      name: "Copy and Use",
      text: "Copy any formatted date/time or timestamp value to your clipboard for use in your code, APIs, or documentation."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Convert Unix Timestamp to Date and Vice Versa",
      "Learn how to convert Unix timestamp (epoch time) to human-readable date and time, or convert date to timestamp using our free online converter.",
      howToSteps,
      "PT3M"
    ),
    generateSoftwareApplicationSchema(
      "Unix Timestamp Converter",
      "Free online Unix timestamp converter. Convert Unix timestamp to date/time or date/time to timestamp. Support for seconds and milliseconds, multiple timezones, and date formats.",
      "https://prylad.pro/unix-timestamp-converter",
      "UtilityApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="⏰ Unix Timestamp Converter"
        description="Convert Unix timestamp (epoch time) to human-readable date and time, or convert date to timestamp. Support for seconds and milliseconds. Free online converter with timezone support."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Main Tool */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Conversion Mode:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMode('timestamp-to-date')
                    setError('')
                    setResult(null)
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'timestamp-to-date'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Timestamp → Date
                </button>
                <button
                  onClick={() => {
                    setMode('date-to-timestamp')
                    setError('')
                    setResult(null)
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'date-to-timestamp'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Date → Timestamp
                </button>
              </div>
            </div>

            {/* Auto Convert Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-convert"
                checked={autoConvert}
                onChange={(e) => setAutoConvert(e.target.checked)}
                className="w-4 h-4 accent-primary-600 rounded"
              />
              <label htmlFor="auto-convert" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                Auto-convert on input change
              </label>
            </div>

            {/* Timestamp to Date Mode */}
            {mode === 'timestamp-to-date' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Unix Timestamp
                    </label>
                    <button
                      onClick={() => {
                        const now = timestampUnit === 'milliseconds' ? Date.now() : Math.floor(Date.now() / 1000)
                        setTimestamp(now.toString())
                        if (autoConvert) {
                          setTimeout(() => handleConvert(), 0)
                        }
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Use Current
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={timestamp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.-]/g, '')
                        setTimestamp(value)
                        if (autoConvert && value) {
                          setTimeout(() => handleConvert(), 100)
                        }
                      }}
                      placeholder="Enter timestamp (e.g., 1609459200)"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono"
                    />
                    <select
                      value={timestampUnit}
                      onChange={(e) => {
                        setTimestampUnit(e.target.value as TimestampUnit)
                        if (autoConvert && timestamp) {
                          setTimeout(() => handleConvert(), 0)
                        }
                      }}
                      className="px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="seconds">Seconds</option>
                      <option value="milliseconds">Milliseconds</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {timestampUnit === 'seconds' 
                      ? 'Enter timestamp in seconds (e.g., 1609459200)' 
                      : 'Enter timestamp in milliseconds (e.g., 1609459200000)'}
                  </p>
                </div>

                {/* Timestamp Presets */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Presets:</label>
                  <div className="flex flex-wrap gap-2">
                    {timePresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyTimestampPreset(preset)}
                        className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Date to Timestamp Mode */}
            {mode === 'date-to-timestamp' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="use-current"
                    checked={useCurrentTime}
                    onChange={(e) => setUseCurrentTime(e.target.checked)}
                    className="w-4 h-4 accent-primary-600 rounded"
                  />
                  <label htmlFor="use-current" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    Use current date and time
                  </label>
                </div>

                {!useCurrentTime && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                        <input
                          type="date"
                          value={dateInput}
                          onChange={(e) => {
                            setDateInput(e.target.value)
                            if (autoConvert) {
                              setTimeout(() => handleConvert(), 0)
                            }
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Time (optional)</label>
                        <input
                          type="time"
                          value={timeInput}
                          onChange={(e) => {
                            setTimeInput(e.target.value)
                            if (autoConvert) {
                              setTimeout(() => handleConvert(), 0)
                            }
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    {/* Date Presets */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Presets:</label>
                      <div className="flex flex-wrap gap-2">
                        {datePresets.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => applyDatePreset(preset)}
                            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Timezone Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => {
                  setTimezone(e.target.value)
                  if (autoConvert && (timestamp || dateInput)) {
                    setTimeout(() => handleConvert(), 0)
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            {/* Convert Button */}
            {!autoConvert && (
              <button
                onClick={handleConvert}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
              >
                Convert
              </button>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Error</h3>
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-4">
                {/* Main Result Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Conversion Result</h3>
                    {totalConversions > 0 && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        Conversions: {totalConversions}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Unix Timestamp</div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <code className="text-lg font-mono font-bold text-blue-900 dark:text-blue-100 flex-1 break-all">
                            {result.timestamp}
                          </code>
                          <button
                            onClick={() => copyToClipboard(result.timestamp.toString())}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          ({mode === 'date-to-timestamp' ? 'seconds' : (timestampUnit === 'seconds' ? 'seconds' : 'milliseconds')})
                        </div>
                        {/* Show alternative format */}
                        {mode === 'timestamp-to-date' && timestampUnit === 'seconds' && (
                          <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">In milliseconds:</div>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono text-blue-900 dark:text-blue-100 flex-1 break-all">
                                {result.timestamp * 1000}
                              </code>
                              <button
                                onClick={() => copyToClipboard((result.timestamp * 1000).toString())}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        )}
                        {mode === 'timestamp-to-date' && timestampUnit === 'milliseconds' && (
                          <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">In seconds:</div>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono text-blue-900 dark:text-blue-100 flex-1 break-all">
                                {Math.floor(result.timestamp / 1000)}
                              </code>
                              <button
                                onClick={() => copyToClipboard(Math.floor(result.timestamp / 1000).toString())}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        )}
                        {mode === 'date-to-timestamp' && (
                          <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">In milliseconds:</div>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono text-blue-900 dark:text-blue-100 flex-1 break-all">
                                {result.timestamp * 1000}
                              </code>
                              <button
                                onClick={() => copyToClipboard((result.timestamp * 1000).toString())}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Date & Time</div>
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-lg font-mono font-bold text-blue-900 dark:text-blue-100 flex-1 break-all">
                          {result.formatted.iso}
                        </code>
                        <button
                          onClick={() => copyToClipboard(result.formatted.iso)}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {result.timezone} • {result.dayOfWeek}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formatted Dates */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Formatted Dates</label>
                    <button
                      onClick={() => {
                        const allFormats = Object.entries(result.formatted)
                          .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
                          .join('\n')
                        copyToClipboard(allFormats)
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Copy All
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">ISO 8601</div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-gray-900 dark:text-gray-100 flex-1 break-all">
                          {result.formatted.iso}
                        </code>
                        <button
                          onClick={() => copyToClipboard(result.formatted.iso)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">US Format</div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-gray-900 dark:text-gray-100 flex-1 break-all">
                          {result.formatted.us}
                        </code>
                        <button
                          onClick={() => copyToClipboard(result.formatted.us)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">EU Format</div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-gray-900 dark:text-gray-100 flex-1 break-all">
                          {result.formatted.eu}
                        </code>
                        <button
                          onClick={() => copyToClipboard(result.formatted.eu)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">RFC 2822</div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-gray-900 dark:text-gray-100 flex-1 break-all">
                          {result.formatted.rfc2822}
                        </code>
                        <button
                          onClick={() => copyToClipboard(result.formatted.rfc2822)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">UTC String</div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-gray-900 dark:text-gray-100 flex-1 break-all">
                          {result.formatted.unix}
                        </code>
                        <button
                          onClick={() => copyToClipboard(result.formatted.unix)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Custom Format</div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-gray-900 dark:text-gray-100 flex-1 break-all">
                          {result.formatted.custom}
                        </code>
                        <button
                          onClick={() => copyToClipboard(result.formatted.custom)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Day of Week</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.dayOfWeek}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Day of Year</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.dayOfYear}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Week of Year</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.weekOfYear}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Leap Year</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {result.isLeapYear ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a Unix Timestamp?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                A Unix timestamp (also called epoch time or POSIX time) is a system for describing instants in time. 
                It represents the number of seconds (or milliseconds) that have elapsed since January 1, 1970, 00:00:00 UTC, 
                not counting leap seconds. This date is known as the Unix epoch.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Unix timestamps are widely used in computer systems, databases, and programming because they provide a 
                simple, unambiguous way to represent dates and times. They&apos;re timezone-independent (stored in UTC) 
                and easy to compare, calculate with, and store.
              </p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our Unix Timestamp Converter</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li><strong>Choose Conversion Mode:</strong> Select &quot;Timestamp → Date&quot; to convert a Unix timestamp to a readable date, or &quot;Date → Timestamp&quot; to convert a date to a Unix timestamp.</li>
                <li><strong>Enter Your Value:</strong> For timestamp mode, enter the Unix timestamp (in seconds or milliseconds). For date mode, select or enter a date and optional time.</li>
                <li><strong>Select Timezone:</strong> Choose your preferred timezone for the date display. The timestamp itself is always in UTC.</li>
                <li><strong>View Results:</strong> See the converted value along with multiple date formats (ISO, US, EU, RFC 2822, UTC string) and additional information like day of week, day of year, and leap year status.</li>
                <li><strong>Copy Results:</strong> Click the copy buttons to copy any format to your clipboard for use in your projects.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">💻 Programming & Development</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert timestamps from APIs, databases, or log files to human-readable dates for debugging, 
                  development, or data analysis. Essential for working with Unix-based systems.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📊 Data Analysis</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert timestamps in datasets, CSV files, or databases to readable dates for analysis, 
                  reporting, or visualization in spreadsheets and BI tools.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔍 Log Analysis</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Decode timestamps from server logs, application logs, or system logs to understand when 
                  events occurred. Critical for troubleshooting and debugging.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📅 Date Calculations</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert dates to timestamps for easy mathematical operations (adding/subtracting seconds), 
                  then convert back to dates. Useful for scheduling and time-based calculations.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Understanding Timestamp Formats</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Seconds vs Milliseconds</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Unix timestamps can be represented in two formats:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm ml-4">
                  <li><strong>Seconds:</strong> The number of seconds since the Unix epoch (e.g., 1609459200). This is the standard format used in Unix/Linux systems.</li>
                  <li><strong>Milliseconds:</strong> The number of milliseconds since the Unix epoch (e.g., 1609459200000). Commonly used in JavaScript, Java, and some APIs.</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                  Our converter automatically detects and handles both formats. Make sure to select the correct unit 
                  for accurate conversion.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Important Timestamps</h3>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">0</span>
                    <span>Unix Epoch - January 1, 1970, 00:00:00 UTC (the starting point)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">946684800</span>
                    <span>Y2K - January 1, 2000, 00:00:00 UTC</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">2147483647</span>
                    <span>Year 2038 Problem - January 19, 2038, 03:14:07 UTC (maximum 32-bit signed integer)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between seconds and milliseconds?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Seconds timestamps are the standard Unix format (e.g., 1609459200), while milliseconds timestamps 
                  are 1000 times larger (e.g., 1609459200000). JavaScript&apos;s Date.now() returns milliseconds, 
                  while most Unix systems use seconds. Our converter handles both formats.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Why is the timestamp always in UTC?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Unix timestamps are always stored in UTC (Coordinated Universal Time) to avoid timezone confusion. 
                  When you convert a timestamp to a date, you can choose any timezone for display, but the timestamp 
                  value itself is timezone-independent.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What is the Year 2038 Problem?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  On January 19, 2038, 32-bit signed integer timestamps will overflow. The maximum value is 2,147,483,647 
                  seconds, which represents this date. Systems using 64-bit integers don&apos;t have this limitation and 
                  can represent dates far into the future.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I convert negative timestamps?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! Negative timestamps represent dates before the Unix epoch (before January 1, 1970). This is 
                  useful for historical dates or dates in the past relative to the epoch.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How accurate are Unix timestamps?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Timestamps in seconds have 1-second precision. Millisecond timestamps have 1-millisecond precision. 
                  For most applications, this is sufficient. For higher precision (microseconds or nanoseconds), 
                  specialized formats are used.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is my data stored or transmitted?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, all conversions happen entirely in your browser. We never see, store, or transmit any of your 
                  timestamps or dates. Your privacy is completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Converter Tools" />
      )}
    </Layout>
    </>
  )
}

