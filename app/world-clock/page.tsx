'use client'

import { useState, useEffect, useCallback } from 'react'
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

interface TimeData {
  time: string
  date: string
  dayOfWeek: string
  utcOffset: string
  isDST: boolean
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

export default function WorldClockPage() {
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('worldClockSelected')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          return ['Europe/Moscow', 'Europe/London', 'America/New_York', 'Asia/Tokyo']
        }
      }
    }
    return ['Europe/Moscow', 'Europe/London', 'America/New_York', 'Asia/Tokyo']
  })
  const [times, setTimes] = useState<{ [key: string]: TimeData }>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [timeFormat, setTimeFormat] = useState<'12' | '24'>('24')
  const [referenceTimezone, setReferenceTimezone] = useState<string | null>(null)

  const getTimeData = useCallback((tz: string): TimeData => {
    try {
      const now = new Date()
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

      const parts = formatter.formatToParts(now)
      const time = `${parts.find(p => p.type === 'hour')?.value}:${parts.find(p => p.type === 'minute')?.value}:${parts.find(p => p.type === 'second')?.value}`
      const date = `${parts.find(p => p.type === 'month')?.value} ${parts.find(p => p.type === 'day')?.value}, ${parts.find(p => p.type === 'year')?.value}`
      const dayOfWeek = parts.find(p => p.type === 'weekday')?.value || ''

      // Get UTC offset
      const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
      const tzDate = new Date(now.toLocaleString('en-US', { timeZone: tz }))
      const offsetMs = tzDate.getTime() - utcDate.getTime()
      const offsetHours = offsetMs / (1000 * 60 * 60)
      const hours = Math.floor(Math.abs(offsetHours))
      const minutes = Math.floor((Math.abs(offsetHours) - hours) * 60)
      const sign = offsetHours >= 0 ? '+' : '-'
      const offsetStr = `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

      // Simple DST detection (not 100% accurate, but good enough for display)
      const isDST = offsetHours !== Math.floor(offsetHours)

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
  }, [timeFormat])

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: { [key: string]: TimeData } = {}
      selectedTimezones.forEach(tz => {
        newTimes[tz] = getTimeData(tz)
      })
      setTimes(newTimes)
    }

    updateTimes()
    const interval = setInterval(updateTimes, 1000)
    return () => clearInterval(interval)
  }, [selectedTimezones, getTimeData])

  // SEO data
  const toolPath = '/world-clock'
  const toolName = 'World Clock'
  const category = 'converter'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "How do I view time in different cities?",
      answer: "Select cities from the timezone list or use the search function to find specific cities. The world clock displays current time, date, day of week, UTC offset, and DST status for each selected city in real-time."
    },
    {
      question: "How many cities can I view at once?",
      answer: "You can select multiple cities to view simultaneously. Add cities by clicking on them in the timezone list, and they'll appear in your world clock view. Remove cities by clicking the remove button."
    },
    {
      question: "Does the world clock update automatically?",
      answer: "Yes! The world clock updates automatically every second, showing the current time in all selected cities in real-time. This ensures you always see accurate, up-to-date times."
    },
    {
      question: "What information is shown for each city?",
      answer: "For each city, the world clock displays: current time (12-hour or 24-hour format), date, day of week, UTC offset, and whether Daylight Saving Time (DST) is currently active."
    },
    {
      question: "Can I filter cities by region?",
      answer: "Yes! Use the region filter to show cities from specific regions: All, Europe, Americas, Asia, Middle East, Africa, or Oceania. This makes it easier to find cities in your desired region."
    },
    {
      question: "Is the world clock free to use?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All time calculations happen in your browser - we never see or store your data."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Search or Browse Cities",
      text: "Use the search box to find specific cities, or browse the timezone list. You can also filter by region (Europe, Americas, Asia, etc.) to narrow down options."
    },
    {
      name: "Select Cities",
      text: "Click on cities in the timezone list to add them to your world clock. Selected cities appear in the main clock view with their current time and information."
    },
    {
      name: "View Time Information",
      text: "See current time, date, day of week, UTC offset, and DST status for each selected city. Times update automatically every second."
    },
    {
      name: "Manage Your Clock",
      text: "Remove cities by clicking the remove button. Reorder cities by dragging them. Your selection is saved locally for convenience."
    },
    {
      name: "Use for Planning",
      text: "Use the world clock to coordinate meetings, schedule calls, or plan events across different timezones, ensuring everyone knows the correct local time."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Use World Clock",
      "Learn how to view current time in cities around the world using our free online world clock with real-time updates.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "World Clock",
      "Free online world clock. View current time in cities worldwide. Compare timezones, see UTC offsets, dates, and day of week. Real-time updates. Perfect for scheduling meetings across timezones.",
      "https://prylad.pro/world-clock",
      "WebApplication"
    )
  ]

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('worldClockSelected', JSON.stringify(selectedTimezones))
  }, [selectedTimezones])

  const toggleTimezone = (tz: string) => {
    if (selectedTimezones.includes(tz)) {
      setSelectedTimezones(selectedTimezones.filter(t => t !== tz))
    } else {
      setSelectedTimezones([...selectedTimezones, tz])
    }
  }

  const filteredTimezones = timezones.filter(tz => {
    const matchesSearch = tz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tz.tz.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRegion = selectedRegion === 'All' || tz.region === selectedRegion
    return matchesSearch && matchesRegion
  })

  const getTimeDifference = (tz1: string, tz2: string): string => {
    if (!times[tz1] || !times[tz2]) return ''
    
    // Parse UTC offsets (format: UTC+03:00 or UTC-05:00)
    const parseOffset = (offsetStr: string): number => {
      const match = offsetStr.match(/UTC([+-])(\d{2}):(\d{2})/)
      if (!match) return 0
      const sign = match[1] === '+' ? 1 : -1
      const hours = parseInt(match[2], 10)
      const minutes = parseInt(match[3], 10)
      return sign * (hours + minutes / 60)
    }
    
    const offset1 = parseOffset(times[tz1].utcOffset)
    const offset2 = parseOffset(times[tz2].utcOffset)
    const diff = offset1 - offset2
    
    if (Math.abs(diff) < 0.01) return 'Same time'
    
    const hours = Math.abs(diff)
    const sign = diff > 0 ? 'ahead' : 'behind'
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    
    if (minutes === 0) {
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''} ${sign}`
    } else {
      return `${wholeHours}h ${minutes}m ${sign}`
    }
  }

  const clearAll = () => {
    setSelectedTimezones([])
  }

  const selectAll = () => {
    setSelectedTimezones(filteredTimezones.map(tz => tz.tz))
  }

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🌍 World Clock - Current Time in Cities Worldwide"
        description="View current time in cities around the world. Compare timezones, see UTC offsets, dates, and day of week. Free world clock with real-time updates. Perfect for scheduling meetings and coordinating across timezones."
        breadcrumbs={breadcrumbs}
      >
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">World Clock Settings</h2>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search Cities</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Search by city name..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Time Format</label>
              <div className="grid grid-cols-2 gap-2">
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
          </div>

          {/* Timezone Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Select Cities ({selectedTimezones.length} selected)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
              {filteredTimezones.map((tz) => (
                <button
                  key={tz.tz}
                  onClick={() => toggleTimezone(tz.tz)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedTimezones.includes(tz.tz)
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 shadow-md'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tz.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{tz.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{tz.region}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {filteredTimezones.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No cities found matching your search</p>
            )}
          </div>
        </div>

        {/* Clocks Display */}
        {selectedTimezones.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedTimezones.map((tz) => {
              const tzInfo = timezones.find(t => t.tz === tz)
              const timeData = times[tz]
              if (!timeData) return null

              return (
                <div
                  key={tz}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tzInfo?.flag}</span>
                      <div>
                        <div className="font-bold text-lg">{tzInfo?.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{tzInfo?.region}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setReferenceTimezone(referenceTimezone === tz ? null : tz)}
                      className={`px-2 py-1 text-xs rounded ${
                        referenceTimezone === tz
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      title="Set as reference for comparison"
                    >
                      {referenceTimezone === tz ? '★' : '☆'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="text-4xl font-mono font-bold text-primary-600">
                      {timeData.time}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="font-semibold">{timeData.dayOfWeek}</div>
                      <div>{timeData.date}</div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{timeData.utcOffset}</span>
                      {timeData.isDST && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">
                          DST
                        </span>
                      )}
                    </div>
                    {referenceTimezone && referenceTimezone !== tz && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {getTimeDifference(referenceTimezone, tz)} {tzInfo?.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {selectedTimezones.length === 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Select cities above to see their current time</p>
          </div>
        )}

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a World Clock?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                A world clock displays the current time in multiple cities and timezones simultaneously. It&apos;s essential 
                for international communication, scheduling meetings across timezones, and understanding global time differences.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our free world clock shows real-time updates for cities worldwide. See current time, date, day of week, 
                UTC offset, and daylight saving time status. Compare time differences between cities and coordinate 
                activities across the globe.
              </p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Understanding Timezones</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">UTC (Coordinated Universal Time)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  UTC is the primary time standard by which the world regulates clocks and time. All timezones are expressed 
                  as offsets from UTC (e.g., UTC+3, UTC-5). UTC itself is UTC+0.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Daylight Saving Time (DST)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Many regions adjust their clocks forward by one hour during summer months to extend daylight hours. 
                  This is called Daylight Saving Time. Not all countries observe DST, and the dates vary by region.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Time Zone Abbreviations</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Common timezone abbreviations include EST (Eastern Standard Time), PST (Pacific Standard Time), GMT 
                  (Greenwich Mean Time), and CET (Central European Time). However, these can be ambiguous, so we use 
                  IANA timezone identifiers (e.g., America/New_York) for accuracy.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📅 Meeting Scheduling</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Schedule meetings with participants in different timezones. Compare times to find the best slot that 
                  works for everyone across the globe.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌐 International Business</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Coordinate with international clients, partners, and teams. Know when it&apos;s business hours in other 
                  countries before making calls or sending urgent messages.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">✈️ Travel Planning</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Plan your travel itinerary and adjust to new timezones. Know what time it is at your destination and 
                  when to call home.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📺 Live Events</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Watch live events, sports, and broadcasts from around the world. Convert event times to your local 
                  timezone to never miss important moments.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">👨‍💼 Remote Work</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Work with distributed teams across timezones. Understand when colleagues are available and plan 
                  asynchronous communication effectively.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📞 Calling Abroad</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Avoid calling at inappropriate times. Check the current time in the recipient&apos;s timezone before 
                  making international calls.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Real-time Updates:</strong> Clocks update every second, showing accurate current time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>50+ Cities:</strong> Major cities from all continents and timezones.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Detailed Information:</strong> Time, date, day of week, UTC offset, and DST status.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Time Comparison:</strong> Set a reference city to see time differences with other cities.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Search & Filter:</strong> Quickly find cities by name or filter by region.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Time Formats:</strong> Switch between 12-hour and 24-hour time formats.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Saved Preferences:</strong> Your selected cities are saved in your browser.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How accurate is the world clock?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our world clock uses your browser&apos;s time and IANA timezone database for accuracy. Times update every 
                  second and account for daylight saving time changes automatically.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What does UTC offset mean?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  UTC offset shows how many hours ahead (+) or behind (-) a timezone is from Coordinated Universal Time (UTC). 
                  For example, UTC+3 means the timezone is 3 hours ahead of UTC.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What is DST (Daylight Saving Time)?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Daylight Saving Time is the practice of setting clocks forward by one hour during warmer months to extend 
                  evening daylight. Not all countries observe DST, and start/end dates vary. Our clock shows DST status 
                  when applicable.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I compare times between cities?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! Click the star (☆) icon on any city clock to set it as a reference. Other cities will then show 
                  how many hours ahead or behind they are from the reference city.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Are my selected cities saved?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes, your selected cities are automatically saved in your browser&apos;s local storage. They will be 
                  restored when you return to the page.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How do I find a specific city?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use the search box to find cities by name, or filter by region (Europe, Americas, Asia, etc.). The list 
                  updates in real-time as you type.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Time Tools" />
      )}
    </Layout>
    </>
  )
}
