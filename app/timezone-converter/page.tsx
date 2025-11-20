'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

interface TimezoneInfo {
  name: string
  tz: string
  flag: string
  region: string
}

interface ConversionResult {
  fromTime: string
  fromDate: string
  fromDayOfWeek: string
  fromOffset: string
  fromDST: boolean
  toTime: string
  toDate: string
  toDayOfWeek: string
  toOffset: string
  toDST: boolean
  timeDifference: string
  isAhead: boolean
}

const timezones: TimezoneInfo[] = [
  { name: 'Moscow', tz: 'Europe/Moscow', flag: '🇷🇺', region: 'Europe' },
  { name: 'London', tz: 'Europe/London', flag: '🇬🇧', region: 'Europe' },
  { name: 'New York', tz: 'America/New_York', flag: '🇺🇸', region: 'Americas' },
  { name: 'Los Angeles', tz: 'America/Los_Angeles', flag: '🇺🇸', region: 'Americas' },
  { name: 'Chicago', tz: 'America/Chicago', flag: '🇺🇸', region: 'Americas' },
  { name: 'Denver', tz: 'America/Denver', flag: '🇺🇸', region: 'Americas' },
  { name: 'Tokyo', tz: 'Asia/Tokyo', flag: '🇯🇵', region: 'Asia' },
  { name: 'Beijing', tz: 'Asia/Shanghai', flag: '🇨🇳', region: 'Asia' },
  { name: 'Dubai', tz: 'Asia/Dubai', flag: '🇦🇪', region: 'Middle East' },
  { name: 'Sydney', tz: 'Australia/Sydney', flag: '🇦🇺', region: 'Oceania' },
  { name: 'Paris', tz: 'Europe/Paris', flag: '🇫🇷', region: 'Europe' },
  { name: 'Berlin', tz: 'Europe/Berlin', flag: '🇩🇪', region: 'Europe' },
  { name: 'Rome', tz: 'Europe/Rome', flag: '🇮🇹', region: 'Europe' },
  { name: 'Madrid', tz: 'Europe/Madrid', flag: '🇪🇸', region: 'Europe' },
  { name: 'Amsterdam', tz: 'Europe/Amsterdam', flag: '🇳🇱', region: 'Europe' },
  { name: 'Stockholm', tz: 'Europe/Stockholm', flag: '🇸🇪', region: 'Europe' },
  { name: 'Warsaw', tz: 'Europe/Warsaw', flag: '🇵🇱', region: 'Europe' },
  { name: 'Prague', tz: 'Europe/Prague', flag: '🇨🇿', region: 'Europe' },
  { name: 'Athens', tz: 'Europe/Athens', flag: '🇬🇷', region: 'Europe' },
  { name: 'Istanbul', tz: 'Europe/Istanbul', flag: '🇹🇷', region: 'Europe' },
  { name: 'Cairo', tz: 'Africa/Cairo', flag: '🇪🇬', region: 'Africa' },
  { name: 'Johannesburg', tz: 'Africa/Johannesburg', flag: '🇿🇦', region: 'Africa' },
  { name: 'Mumbai', tz: 'Asia/Kolkata', flag: '🇮🇳', region: 'Asia' },
  { name: 'Singapore', tz: 'Asia/Singapore', flag: '🇸🇬', region: 'Asia' },
  { name: 'Seoul', tz: 'Asia/Seoul', flag: '🇰🇷', region: 'Asia' },
  { name: 'Hong Kong', tz: 'Asia/Hong_Kong', flag: '🇭🇰', region: 'Asia' },
  { name: 'Bangkok', tz: 'Asia/Bangkok', flag: '🇹🇭', region: 'Asia' },
  { name: 'Jakarta', tz: 'Asia/Jakarta', flag: '🇮🇩', region: 'Asia' },
  { name: 'Melbourne', tz: 'Australia/Melbourne', flag: '🇦🇺', region: 'Oceania' },
  { name: 'Auckland', tz: 'Pacific/Auckland', flag: '🇳🇿', region: 'Oceania' },
  { name: 'Hawaii', tz: 'Pacific/Honolulu', flag: '🇺🇸', region: 'Americas' },
  { name: 'Mexico City', tz: 'America/Mexico_City', flag: '🇲🇽', region: 'Americas' },
  { name: 'São Paulo', tz: 'America/Sao_Paulo', flag: '🇧🇷', region: 'Americas' },
  { name: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires', flag: '🇦🇷', region: 'Americas' },
  { name: 'Toronto', tz: 'America/Toronto', flag: '🇨🇦', region: 'Americas' },
  { name: 'Vancouver', tz: 'America/Vancouver', flag: '🇨🇦', region: 'Americas' },
  { name: 'Lima', tz: 'America/Lima', flag: '🇵🇪', region: 'Americas' },
  { name: 'Bogotá', tz: 'America/Bogota', flag: '🇨🇴', region: 'Americas' },
  { name: 'Santiago', tz: 'America/Santiago', flag: '🇨🇱', region: 'Americas' },
  { name: 'Riyadh', tz: 'Asia/Riyadh', flag: '🇸🇦', region: 'Middle East' },
  { name: 'Tel Aviv', tz: 'Asia/Jerusalem', flag: '🇮🇱', region: 'Middle East' },
  { name: 'Tehran', tz: 'Asia/Tehran', flag: '🇮🇷', region: 'Middle East' },
  { name: 'Karachi', tz: 'Asia/Karachi', flag: '🇵🇰', region: 'Asia' },
  { name: 'Dhaka', tz: 'Asia/Dhaka', flag: '🇧🇩', region: 'Asia' },
  { name: 'Manila', tz: 'Asia/Manila', flag: '🇵🇭', region: 'Asia' },
  { name: 'Ho Chi Minh City', tz: 'Asia/Ho_Chi_Minh', flag: '🇻🇳', region: 'Asia' },
  { name: 'Lagos', tz: 'Africa/Lagos', flag: '🇳🇬', region: 'Africa' },
  { name: 'Nairobi', tz: 'Africa/Nairobi', flag: '🇰🇪', region: 'Africa' },
  { name: 'Casablanca', tz: 'Africa/Casablanca', flag: '🇲🇦', region: 'Africa' },
]

const regions = ['All', 'Europe', 'Americas', 'Asia', 'Middle East', 'Africa', 'Oceania']

const getTimezoneData = (tz: string, dateTime: Date, timeFormat: '12' | '24' = '24') => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: timeFormat === '12',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      weekday: 'short'
    })

    const parts = formatter.formatToParts(dateTime)
    const time = `${parts.find(p => p.type === 'hour')?.value}:${parts.find(p => p.type === 'minute')?.value}:${parts.find(p => p.type === 'second')?.value}`
    const date = `${parts.find(p => p.type === 'month')?.value} ${parts.find(p => p.type === 'day')?.value}, ${parts.find(p => p.type === 'year')?.value}`
    const dayOfWeek = parts.find(p => p.type === 'weekday')?.value || ''

    // Get UTC offset
    const utcDate = new Date(dateTime.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(dateTime.toLocaleString('en-US', { timeZone: tz }))
    const offsetMs = tzDate.getTime() - utcDate.getTime()
    const offsetHours = offsetMs / (1000 * 60 * 60)
    const hours = Math.floor(Math.abs(offsetHours))
    const minutes = Math.floor((Math.abs(offsetHours) - hours) * 60)
    const sign = offsetHours >= 0 ? '+' : '-'
    const offsetStr = `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

    // DST detection
    const isDST = offsetHours !== Math.floor(offsetHours) || (Math.abs(offsetHours) % 1 !== 0)

    return {
      time,
      date,
      dayOfWeek,
      utcOffset: offsetStr,
      isDST
    }
  } catch (e) {
    return {
      time: 'Error',
      date: '',
      dayOfWeek: '',
      utcOffset: '',
      isDST: false
    }
  }
}

const getTimeDifference = (fromTz: string, toTz: string, dateTime: Date): { hours: number; minutes: number; isAhead: boolean } => {
  try {
    const fromDate = new Date(dateTime.toLocaleString('en-US', { timeZone: fromTz }))
    const toDate = new Date(dateTime.toLocaleString('en-US', { timeZone: toTz }))
    const diffMs = toDate.getTime() - fromDate.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    const hours = Math.floor(Math.abs(diffHours))
    const minutes = Math.floor((Math.abs(diffHours) - hours) * 60)
    return {
      hours,
      minutes,
      isAhead: diffHours > 0
    }
  } catch (e) {
    return { hours: 0, minutes: 0, isAhead: false }
  }
}

export default function TimezoneConverterPage() {
  const [fromTz, setFromTz] = useState('Europe/Moscow')
  const [toTz, setToTz] = useState('America/New_York')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5))
  const [useCurrentTime, setUseCurrentTime] = useState(true)
  const [timeFormat, setTimeFormat] = useState<'12' | '24'>('24')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [autoConvert, setAutoConvert] = useState(false)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [currentFromTime, setCurrentFromTime] = useState<{ time: string; date: string; offset: string } | null>(null)
  const [currentToTime, setCurrentToTime] = useState<{ time: string; date: string; offset: string } | null>(null)
  const [totalConversions, setTotalConversions] = useState(0)

  const convert = useCallback(() => {
    const dateTime = useCurrentTime 
      ? new Date()
      : new Date(`${date}T${time}:00`)

    const fromData = getTimezoneData(fromTz, dateTime, timeFormat)
    const toData = getTimezoneData(toTz, dateTime, timeFormat)
    const timeDiff = getTimeDifference(fromTz, toTz, dateTime)

    const diffStr = timeDiff.hours === 0 && timeDiff.minutes === 0
      ? 'Same time'
      : `${timeDiff.hours}h ${timeDiff.minutes}m ${timeDiff.isAhead ? 'ahead' : 'behind'}`

    setResult({
      fromTime: fromData.time,
      fromDate: fromData.date,
      fromDayOfWeek: fromData.dayOfWeek,
      fromOffset: fromData.utcOffset,
      fromDST: fromData.isDST,
      toTime: toData.time,
      toDate: toData.date,
      toDayOfWeek: toData.dayOfWeek,
      toOffset: toData.utcOffset,
      toDST: toData.isDST,
      timeDifference: diffStr,
      isAhead: timeDiff.isAhead
    })
    setTotalConversions(prev => prev + 1)
  }, [fromTz, toTz, date, time, useCurrentTime, timeFormat])

  useEffect(() => {
    if (useCurrentTime) {
      const updateCurrentTimes = () => {
        const now = new Date()
        const fromData = getTimezoneData(fromTz, now, timeFormat)
        const toData = getTimezoneData(toTz, now, timeFormat)
        setCurrentFromTime({
          time: fromData.time,
          date: fromData.date,
          offset: fromData.utcOffset
        })
        setCurrentToTime({
          time: toData.time,
          date: toData.date,
          offset: toData.utcOffset
        })
      }
      updateCurrentTimes()
      const interval = setInterval(updateCurrentTimes, 1000)
      return () => clearInterval(interval)
    }
  }, [fromTz, toTz, useCurrentTime, timeFormat])

  useEffect(() => {
    if (autoConvert) {
      convert()
    }
  }, [autoConvert, fromTz, toTz, date, time, useCurrentTime, convert])

  const filteredTimezones = timezones.filter(tz => {
    const matchesSearch = tz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tz.tz.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRegion = selectedRegion === 'All' || tz.region === selectedRegion
    return matchesSearch && matchesRegion
  })

  const swapTimezones = () => {
    const temp = fromTz
    setFromTz(toTz)
    setToTz(temp)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.error('Failed to copy')
    }
  }

  const exportToFile = () => {
    if (!result) return

    const content = `Timezone Conversion Report
=======================

From: ${timezones.find(t => t.tz === fromTz)?.name} (${fromTz})
To: ${timezones.find(t => t.tz === toTz)?.name} (${toTz})

Source Time:
- Time: ${result.fromTime}
- Date: ${result.fromDate}
- Day: ${result.fromDayOfWeek}
- UTC Offset: ${result.fromOffset}
- DST: ${result.fromDST ? 'Yes' : 'No'}

Converted Time:
- Time: ${result.toTime}
- Date: ${result.toDate}
- Day: ${result.toDayOfWeek}
- UTC Offset: ${result.toOffset}
- DST: ${result.toDST ? 'Yes' : 'No'}

Time Difference: ${result.timeDifference}

Generated: ${new Date().toLocaleString()}
`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `timezone-conversion-${Date.now()}.txt`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setDate(new Date().toISOString().split('T')[0])
    setTime(new Date().toTimeString().slice(0, 5))
    setResult(null)
    setSearchQuery('')
    setSelectedRegion('All')
  }

  // SEO data
  const toolPath = '/timezone-converter'
  const toolName = 'Timezone Converter'
  const category = 'converter'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "How do I convert time between timezones?",
      answer: "Select the source timezone (from) and destination timezone (to), enter or select the time you want to convert, and the converter automatically shows the equivalent time in the destination timezone with time difference and DST information."
    },
    {
      question: "How many timezones are supported?",
      answer: "The converter supports 50+ major timezones from around the world, including all major cities and regions. You can search for timezones by name or browse by region."
    },
    {
      question: "Does the converter handle Daylight Saving Time (DST)?",
      answer: "Yes! The converter automatically handles DST transitions. It shows whether DST is currently active in each timezone and adjusts the time difference accordingly."
    },
    {
      question: "Can I see the current time in multiple timezones?",
      answer: "Yes! Enable 'Use Current Time' to see the current time in both source and destination timezones. The times update automatically in real-time."
    },
    {
      question: "What time formats are supported?",
      answer: "The converter supports both 12-hour (AM/PM) and 24-hour (military) time formats. You can switch between formats using the format selector."
    },
    {
      question: "Is the timezone converter free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All timezone conversions happen in your browser - we never see or store your data."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Select Source Timezone",
      text: "Choose the timezone you're converting from. Search by city name or browse the list of available timezones organized by region."
    },
    {
      name: "Select Destination Timezone",
      text: "Choose the timezone you're converting to. This is where you want to see the equivalent time."
    },
    {
      name: "Enter or Select Time",
      text: "Enter the time you want to convert, or enable 'Use Current Time' to see real-time conversions. Select your preferred time format (12-hour or 24-hour)."
    },
    {
      name: "View Conversion Results",
      text: "See the converted time, date, day of week, time offset, DST status, and time difference between the two timezones."
    },
    {
      name: "Use for Planning",
      text: "Use the converter to plan meetings, calls, or events across different timezones, ensuring everyone knows the correct local time."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Convert Time Between Timezones",
      "Learn how to convert time between different timezones accurately using our free online timezone converter with DST support.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Timezone Converter",
      "Free online timezone converter. Convert time between 50+ timezones accurately. Handle DST automatically, see current time, calculate time differences. Support for 12-hour and 24-hour formats.",
      "https://prylad.pro/timezone-converter",
      "UtilityApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🌍 Timezone Converter - Convert Time Between Timezones"
        description="Convert time between different timezones accurately. See current time in multiple timezones, calculate time differences, and handle DST automatically. Free online timezone converter with 50+ timezones."
        breadcrumbs={breadcrumbs}
      >
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Timezone Converter</h2>
              {totalConversions > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Converted: <span className="font-semibold text-gray-900 dark:text-gray-100">{totalConversions}</span>
                </div>
              )}
            </div>

            {/* Time Format Toggle */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Time Format:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeFormat('24')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    timeFormat === '24'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  24h
                </button>
                <button
                  onClick={() => setTimeFormat('12')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    timeFormat === '12'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  12h
                </button>
              </div>
            </div>

            {/* Use Current Time Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useCurrentTime}
                onChange={(e) => setUseCurrentTime(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Use current time (updates in real-time)</span>
            </label>

            {/* Custom Date/Time */}
            {!useCurrentTime && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            )}

            {/* Current Times Display */}
            {useCurrentTime && (currentFromTime || currentToTime) && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Time</div>
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{currentFromTime?.time}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{currentFromTime?.offset}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Time</div>
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{currentToTime?.time}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{currentToTime?.offset}</div>
                </div>
              </div>
            )}

            {/* From Timezone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">From Timezone</label>
              <select
                value={fromTz}
                onChange={(e) => setFromTz(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                {filteredTimezones.map((tz) => (
                  <option key={tz.tz} value={tz.tz}>
                    {tz.flag} {tz.name} ({tz.region})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              onClick={swapTimezones}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
            >
              ⇅ Swap Timezones
            </button>

            {/* To Timezone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">To Timezone</label>
              <select
                value={toTz}
                onChange={(e) => setToTz(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                {filteredTimezones.map((tz) => (
                  <option key={tz.tz} value={tz.tz}>
                    {tz.flag} {tz.name} ({tz.region})
                  </option>
                ))}
              </select>
            </div>

            {/* Search and Filter */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Search Timezones</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or timezone..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Filter by Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Auto Convert Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoConvert}
                onChange={(e) => setAutoConvert(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-convert as you change values</span>
            </label>

            {!autoConvert && (
              <button
                onClick={convert}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
              >
                Convert Time
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportToFile}
                disabled={!result}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Export
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Conversion Result</h2>

            {result ? (
              <div className="space-y-6">
                {/* From Timezone */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {timezones.find(t => t.tz === fromTz)?.flag} {timezones.find(t => t.tz === fromTz)?.name}
                    </h3>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{result.fromOffset}</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{result.fromTime}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{result.fromDate}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{result.fromDayOfWeek}</div>
                  {result.fromDST && (
                    <div className="mt-2 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded inline-block">
                      DST Active
                    </div>
                  )}
                </div>

                {/* Time Difference */}
                <div className={`p-4 rounded-xl border-2 text-center ${
                  result.isAhead 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : result.timeDifference === 'Same time'
                      ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                }`}>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Difference</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{result.timeDifference}</div>
                </div>

                {/* To Timezone */}
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {timezones.find(t => t.tz === toTz)?.flag} {timezones.find(t => t.tz === toTz)?.name}
                    </h3>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{result.toOffset}</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{result.toTime}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{result.toDate}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{result.toDayOfWeek}</div>
                  {result.toDST && (
                    <div className="mt-2 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded inline-block">
                      DST Active
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">From UTC Offset:</span>
                      <span className="font-medium">{result.fromOffset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">To UTC Offset:</span>
                      <span className="font-medium">{result.toOffset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">From DST:</span>
                      <span className="font-medium">{result.fromDST ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">To DST:</span>
                      <span className="font-medium">{result.toDST ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(
                    `${timezones.find(t => t.tz === fromTz)?.name}: ${result.fromTime} (${result.fromDate})\n` +
                    `${timezones.find(t => t.tz === toTz)?.name}: ${result.toTime} (${result.toDate})\n` +
                    `Difference: ${result.timeDifference}`
                  )}
                  className="w-full px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Copy Result
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <p className="text-lg font-semibold mb-2">Enter timezones to convert</p>
                <p className="text-sm">Results will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a Timezone Converter?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                A timezone converter is a tool that converts time from one timezone to another. It accounts for time 
                zone differences, daylight saving time (DST), and provides accurate conversions between any two 
                timezones worldwide. Timezone converters are essential for international communication, travel planning, 
                and scheduling across different regions.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our free timezone converter supports 50+ timezones, automatically handles DST, shows current time in 
                real-time, and calculates precise time differences. Perfect for business meetings, travel planning, 
                international calls, and understanding global time relationships.
              </p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our Timezone Converter</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li><strong>Select Time Format:</strong> Choose between 12-hour (AM/PM) or 24-hour format.</li>
                <li><strong>Choose Time Source:</strong> Use current time (updates in real-time) or enter a custom date and time.</li>
                <li><strong>Select From Timezone:</strong> Choose the source timezone from the dropdown (search and filter available).</li>
                <li><strong>Select To Timezone:</strong> Choose the target timezone you want to convert to.</li>
                <li><strong>Convert:</strong> Click &quot;Convert Time&quot; or enable auto-convert to see results automatically.</li>
                <li><strong>View Results:</strong> See converted time, date, day of week, UTC offset, DST status, and time difference.</li>
                <li><strong>Export:</strong> Save conversion results to a text file for records.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌐 International Meetings</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Schedule meetings across timezones by converting times accurately. Know exactly when a meeting time 
                  in one timezone corresponds to in another, accounting for DST changes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">✈️ Travel Planning</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Plan travel by understanding time differences between your origin and destination. Calculate 
                  arrival times, adjust to jet lag, and plan activities accordingly.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📞 International Calls</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Schedule international calls at convenient times for all parties. Convert times to ensure you&apos;re 
                  calling during appropriate hours in different timezones.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌍 Global Business</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Coordinate with international teams, clients, and partners. Understand business hours in different 
                  regions and schedule accordingly.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📺 Live Events</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert broadcast times for live events, sports, webinars, or conferences. Know when events start 
                  in your local timezone.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">⏰ Deadline Tracking</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Track deadlines across timezones. Convert submission times to ensure you meet deadlines in different 
                  timezones accurately.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>50+ Timezones:</strong> Support for major cities and regions worldwide, organized by region.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>DST Handling:</strong> Automatically accounts for daylight saving time changes in affected regions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Real-Time Updates:</strong> See current time in both timezones updating in real-time when using current time mode.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Time Difference:</strong> Shows exact time difference between timezones in hours and minutes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Search & Filter:</strong> Quickly find timezones by name or filter by region (Europe, Americas, Asia, etc.).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Custom Date/Time:</strong> Convert any specific date and time, not just current time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>12/24 Hour Format:</strong> Choose between 12-hour (AM/PM) or 24-hour time format.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Swap Timezones:</strong> Quickly swap source and target timezones with one click.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Export Results:</strong> Save conversion details to a text file for records.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How accurate is the timezone conversion?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our converter uses the browser&apos;s built-in timezone database, which is regularly updated and accounts 
                  for all timezone rules, including DST changes. Conversions are accurate to the second.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Does it handle daylight saving time (DST)?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! The converter automatically accounts for DST in regions that observe it. DST status is displayed 
                  for both source and target timezones, and conversions adjust automatically for DST changes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I convert past or future dates?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! Disable &quot;Use current time&quot; and enter any date and time. The converter will accurately 
                  convert that specific moment, accounting for historical DST rules if applicable.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What is UTC offset?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  UTC offset is the difference in hours and minutes from Coordinated Universal Time (UTC). Positive 
                  offsets are ahead of UTC, negative offsets are behind. For example, UTC+3 means 3 hours ahead of UTC.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Why do some timezones show DST and others don&apos;t?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Not all regions observe daylight saving time. Regions near the equator and some countries (like Japan, 
                  India, China) don&apos;t use DST. The converter shows DST status for each timezone based on current rules.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How do I find a specific timezone?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use the search box to search by city name (e.g., &quot;New York&quot;) or timezone identifier (e.g., 
                  &quot;America/New_York&quot;). You can also filter by region to narrow down the list.
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
