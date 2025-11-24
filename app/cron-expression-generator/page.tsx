'use client'

import { useState, useCallback, useMemo } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'

type CronMode = 'builder' | 'parser'

interface CronSchedule {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

interface ParsedCron {
  expression: string
  description: string
  nextExecutions: string[]
  isValid: boolean
  error?: string
}

const DAYS_OF_WEEK = [
  { value: '0', label: 'Sunday', short: 'Sun' },
  { value: '1', label: 'Monday', short: 'Mon' },
  { value: '2', label: 'Tuesday', short: 'Tue' },
  { value: '3', label: 'Wednesday', short: 'Wed' },
  { value: '4', label: 'Thursday', short: 'Thu' },
  { value: '5', label: 'Friday', short: 'Fri' },
  { value: '6', label: 'Saturday', short: 'Sat' },
]

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const CRON_EXAMPLES = [
  {
    name: 'Every minute',
    expression: '* * * * *',
    description: 'Runs every minute'
  },
  {
    name: 'Every hour',
    expression: '0 * * * *',
    description: 'Runs at the start of every hour'
  },
  {
    name: 'Every day at midnight',
    expression: '0 0 * * *',
    description: 'Runs daily at 12:00 AM'
  },
  {
    name: 'Every day at 2:30 AM',
    expression: '30 2 * * *',
    description: 'Runs daily at 2:30 AM'
  },
  {
    name: 'Every Monday at 9 AM',
    expression: '0 9 * * 1',
    description: 'Runs every Monday at 9:00 AM'
  },
  {
    name: 'Every weekday at 8 AM',
    expression: '0 8 * * 1-5',
    description: 'Runs Monday to Friday at 8:00 AM'
  },
  {
    name: 'Every month on the 1st at midnight',
    expression: '0 0 1 * *',
    description: 'Runs on the 1st day of every month at midnight'
  },
  {
    name: 'Every 15 minutes',
    expression: '*/15 * * * *',
    description: 'Runs every 15 minutes'
  },
  {
    name: 'Every 5 minutes',
    expression: '*/5 * * * *',
    description: 'Runs every 5 minutes'
  },
  {
    name: 'Every Sunday at 10 PM',
    expression: '0 22 * * 0',
    description: 'Runs every Sunday at 10:00 PM'
  },
]

export default function CronExpressionGeneratorPage() {
  const [mode, setMode] = useState<CronMode>('builder')
  const [schedule, setSchedule] = useState<CronSchedule>({
    minute: '*',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*'
  })
  const [cronExpression, setCronExpression] = useState('')
  const [parsedCron, setParsedCron] = useState<ParsedCron | null>(null)
  const [minuteType, setMinuteType] = useState<'every' | 'specific' | 'interval'>('every')
  const [hourType, setHourType] = useState<'every' | 'specific' | 'interval'>('every')
  const [specificMinutes, setSpecificMinutes] = useState<string[]>([])
  const [specificHours, setSpecificHours] = useState<string[]>([])
  const [minuteInterval, setMinuteInterval] = useState('5')
  const [hourInterval, setHourInterval] = useState('1')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [dayOfMonthType, setDayOfMonthType] = useState<'every' | 'specific' | 'last'>('every')
  const [specificDaysOfMonth, setSpecificDaysOfMonth] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  // Generate cron expression from schedule
  const generateCronExpression = useCallback((sched: CronSchedule): string => {
    return `${sched.minute} ${sched.hour} ${sched.dayOfMonth} ${sched.month} ${sched.dayOfWeek}`
  }, [])

  // Check if value matches cron field
  const matchesCronField = useCallback((value: number, field: string): boolean => {
    if (field === '*') return true
    if (field === 'L') {
      // For last day, we'd need to check if it's the last day of the month
      // This is complex, so we'll skip it for now in execution calculation
      return false
    }
    
    // Handle intervals first (before other checks)
    if (field.includes('/')) {
      const [range, interval] = field.split('/')
      const intervalNum = parseInt(interval)
      if (range === '*') {
        return value % intervalNum === 0
      } else if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number)
        if (value >= start && value <= end) {
          return (value - start) % intervalNum === 0
        }
        return false
      } else {
        // Interval with specific start value
        const start = parseInt(range)
        return value >= start && (value - start) % intervalNum === 0
      }
    }
    
    // Handle ranges
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number)
      return value >= start && value <= end
    }
    
    // Handle lists
    if (field.includes(',')) {
      return field.split(',').map(Number).includes(value)
    }
    
    // Exact match
    return value === parseInt(field)
  }, [])

  // Calculate next execution times
  const calculateNextExecutions = useCallback((expression: string, count: number): string[] => {
    const parts = expression.trim().split(/\s+/)
    if (parts.length !== 5) return []

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
    const executions: string[] = []
    let current = new Date()
    current.setSeconds(0, 0)
    current.setMilliseconds(0)
    
    // Start from next minute
    current.setMinutes(current.getMinutes() + 1)

    let attempts = 0
    const maxAttempts = 20000 // Check up to ~2 weeks ahead

    while (executions.length < count && attempts < maxAttempts) {
      attempts++
      
      // Check if current time matches all cron fields
      if (matchesCronField(current.getMinutes(), minute) &&
          matchesCronField(current.getHours(), hour) &&
          matchesCronField(current.getDate(), dayOfMonth) &&
          matchesCronField(current.getMonth() + 1, month) &&
          matchesCronField(current.getDay(), dayOfWeek)) {
        executions.push(current.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          weekday: 'long'
        }))
      }
      
      // Move to next minute
      current.setMinutes(current.getMinutes() + 1)
    }

    return executions
  }, [matchesCronField])

  // Update schedule when builder changes
  const updateSchedule = useCallback(() => {
    let minute = '*'
    let hour = '*'
    let dayOfMonth = '*'
    let month = '*'
    let dayOfWeek = '*'

    // Minute
    if (minuteType === 'specific' && specificMinutes.length > 0) {
      minute = specificMinutes.join(',')
    } else if (minuteType === 'interval') {
      minute = `*/${minuteInterval}`
    }

    // Hour
    if (hourType === 'specific' && specificHours.length > 0) {
      hour = specificHours.join(',')
    } else if (hourType === 'interval') {
      hour = `*/${hourInterval}`
    }

    // Day of month
    if (dayOfMonthType === 'specific' && specificDaysOfMonth.length > 0) {
      dayOfMonth = specificDaysOfMonth.join(',')
    } else if (dayOfMonthType === 'last') {
      dayOfMonth = 'L'
    }

    // Month
    if (selectedMonths.length > 0 && selectedMonths.length < 12) {
      month = selectedMonths.join(',')
    }

    // Day of week
    if (selectedDays.length > 0 && selectedDays.length < 7) {
      dayOfWeek = selectedDays.join(',')
    }

    const newSchedule: CronSchedule = { minute, hour, dayOfMonth, month, dayOfWeek }
    setSchedule(newSchedule)
    setCronExpression(generateCronExpression(newSchedule))
  }, [minuteType, specificMinutes, minuteInterval, hourType, specificHours, hourInterval, selectedDays, selectedMonths, dayOfMonthType, specificDaysOfMonth, generateCronExpression])

  // Parse cron expression to human-readable description
  const parseCronExpression = useCallback((expression: string): ParsedCron => {
    const trimmed = expression.trim()
    
    if (!trimmed) {
      return {
        expression: '',
        description: '',
        nextExecutions: [],
        isValid: false,
        error: 'Please enter a cron expression'
      }
    }

    const parts = trimmed.split(/\s+/)
    if (parts.length !== 5) {
      return {
        expression: trimmed,
        description: '',
        nextExecutions: [],
        isValid: false,
        error: 'Invalid cron format. Must have 5 parts: minute hour day-of-month month day-of-week'
      }
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
    const descriptions: string[] = []

    // Parse minute
    if (minute === '*') {
      descriptions.push('every minute')
    } else if (minute.includes('/')) {
      const interval = minute.split('/')[1]
      descriptions.push(`every ${interval} minute${interval !== '1' ? 's' : ''}`)
    } else if (minute.includes(',')) {
      const minutes = minute.split(',').map(m => `${m.padStart(2, '0')}:00`).join(', ')
      descriptions.push(`at minutes ${minutes}`)
    } else if (minute.includes('-')) {
      const [start, end] = minute.split('-')
      descriptions.push(`every minute from ${start} to ${end}`)
    } else {
      descriptions.push(`at minute ${minute}`)
    }

    // Parse hour
    if (hour === '*') {
      if (minute !== '*') {
        descriptions.push('of every hour')
      }
    } else if (hour.includes('/')) {
      const interval = hour.split('/')[1]
      descriptions.push(`every ${interval} hour${interval !== '1' ? 's' : ''}`)
    } else if (hour.includes(',')) {
      const hours = hour.split(',').map(h => {
        const hNum = parseInt(h)
        return hNum === 0 ? '12 AM' : hNum < 12 ? `${hNum} AM` : hNum === 12 ? '12 PM' : `${hNum - 12} PM`
      }).join(', ')
      descriptions.push(`at ${hours}`)
    } else if (hour.includes('-')) {
      const [start, end] = hour.split('-')
      const startNum = parseInt(start)
      const endNum = parseInt(end)
      const startStr = startNum === 0 ? '12 AM' : startNum < 12 ? `${startNum} AM` : startNum === 12 ? '12 PM' : `${startNum - 12} PM`
      const endStr = endNum === 0 ? '12 AM' : endNum < 12 ? `${endNum} AM` : endNum === 12 ? '12 PM' : `${endNum - 12} PM`
      descriptions.push(`from ${startStr} to ${endStr}`)
    } else {
      const hNum = parseInt(hour)
      const hourStr = hNum === 0 ? '12 AM' : hNum < 12 ? `${hNum} AM` : hNum === 12 ? '12 PM' : `${hNum - 12} PM`
      descriptions.push(`at ${hourStr}`)
    }

    // Parse day of month
    if (dayOfMonth === '*') {
      descriptions.push('of every day')
    } else if (dayOfMonth === 'L') {
      descriptions.push('on the last day of the month')
    } else if (dayOfMonth.includes(',')) {
      const days = dayOfMonth.split(',').join(', ')
      descriptions.push(`on day${dayOfMonth.split(',').length > 1 ? 's' : ''} ${days} of the month`)
    } else if (dayOfMonth.includes('-')) {
      const [start, end] = dayOfMonth.split('-')
      descriptions.push(`from day ${start} to ${end} of the month`)
    } else {
      descriptions.push(`on day ${dayOfMonth} of the month`)
    }

    // Parse month
    if (month === '*') {
      descriptions.push('of every month')
    } else if (month.includes(',')) {
      const months = month.split(',').map(m => {
        const mNum = parseInt(m)
        return MONTHS[mNum - 1]?.label || m
      }).join(', ')
      descriptions.push(`in ${months}`)
    } else if (month.includes('-')) {
      const [start, end] = month.split('-')
      const startMonth = MONTHS[parseInt(start) - 1]?.label || start
      const endMonth = MONTHS[parseInt(end) - 1]?.label || end
      descriptions.push(`from ${startMonth} to ${endMonth}`)
    } else {
      const mNum = parseInt(month)
      const monthName = MONTHS[mNum - 1]?.label || month
      descriptions.push(`in ${monthName}`)
    }

    // Parse day of week
    if (dayOfWeek === '*') {
      // Already covered by "every day"
    } else if (dayOfWeek.includes(',')) {
      const days = dayOfWeek.split(',').map(d => {
        const dNum = parseInt(d)
        return DAYS_OF_WEEK[dNum]?.label || d
      }).join(', ')
      descriptions.push(`on ${days}`)
    } else if (dayOfWeek.includes('-')) {
      const [start, end] = dayOfWeek.split('-')
      const startDay = DAYS_OF_WEEK[parseInt(start)]?.label || start
      const endDay = DAYS_OF_WEEK[parseInt(end)]?.label || end
      descriptions.push(`from ${startDay} to ${endDay}`)
    } else {
      const dNum = parseInt(dayOfWeek)
      const dayName = DAYS_OF_WEEK[dNum]?.label || dayOfWeek
      descriptions.push(`on ${dayName}`)
    }

    // Calculate next executions
    const nextExecutions = calculateNextExecutions(trimmed, 5)

    return {
      expression: trimmed,
      description: descriptions.join(' '),
      nextExecutions,
      isValid: true
    }
  }, [calculateNextExecutions])


  const handleParse = useCallback(() => {
    const parsed = parseCronExpression(cronExpression)
    setParsedCron(parsed)
  }, [cronExpression, parseCronExpression])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Silent fail
    }
  }

  const loadExample = (example: typeof CRON_EXAMPLES[0]) => {
    setCronExpression(example.expression)
    setMode('parser')
    const parsed = parseCronExpression(example.expression)
    setParsedCron(parsed)
  }

  // Update schedule when builder fields change
  useMemo(() => {
    updateSchedule()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minuteType, specificMinutes, minuteInterval, hourType, specificHours, hourInterval, selectedDays, selectedMonths, dayOfMonthType, specificDaysOfMonth])
  
  // Auto-parse when cron expression changes in builder mode
  useMemo(() => {
    if (mode === 'builder' && cronExpression) {
      const parsed = parseCronExpression(cronExpression)
      setParsedCron(parsed)
    }
  }, [cronExpression, mode, parseCronExpression])

  useKeyboardShortcuts({
    onEnter: mode === 'parser' ? handleParse : undefined
  })

  // SEO data
  const toolName = 'Cron Expression Generator & Parser'
  const toolPath = '/cron-expression-generator'
  const category = 'code'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is a cron expression?",
      answer: "A cron expression is a string consisting of five fields (minute, hour, day-of-month, month, day-of-week) that defines when a scheduled task should run. It's used in Unix-like operating systems, task schedulers, and automation tools to automate repetitive tasks."
    },
    {
      question: "How do I create a cron expression?",
      answer: "Use our visual Builder mode to select your schedule preferences. Choose minutes, hours, days, months, and days of week using simple radio buttons and checkboxes. The cron expression is generated automatically and you can see a human-readable description and next execution times."
    },
    {
      question: "How do I parse an existing cron expression?",
      answer: "Switch to Parser mode, paste your cron expression (e.g., '0 9 * * 1-5'), and click Parse. You'll see a human-readable description explaining when the task runs, plus the next 5 execution times calculated for you."
    },
    {
      question: "What do the special characters mean in cron expressions?",
      answer: "The asterisk (*) means 'every value', comma (,) separates multiple values, hyphen (-) defines ranges, and slash (/) defines intervals. For example, '*/15 * * * *' runs every 15 minutes, and '0 9,17 * * 1-5' runs at 9 AM and 5 PM on weekdays."
    },
    {
      question: "Can I see when my cron job will run next?",
      answer: "Yes! Both Builder and Parser modes show the next 5 execution times for your cron expression. This helps you verify that your schedule is correct before using it in production."
    },
    {
      question: "Is this tool free to use?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All processing happens in your browser - we never see or store your cron expressions."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose Builder or Parser Mode",
      text: "Select 'Builder' to create a new cron expression using visual controls, or 'Parser' to decode an existing cron expression into a human-readable description."
    },
    {
      name: "Configure Your Schedule (Builder Mode)",
      text: "In Builder mode, select your schedule preferences: choose minutes (every minute, specific minutes, or intervals), hours, days of month, months, and days of week using radio buttons and checkboxes."
    },
    {
      name: "View Generated Expression",
      text: "Your cron expression is generated automatically as you make selections. You'll see the expression, a human-readable description, and the next execution times displayed in real-time."
    },
    {
      name: "Parse Existing Expression (Parser Mode)",
      text: "In Parser mode, paste your cron expression (e.g., '0 9 * * 1-5') and click 'Parse'. The tool will decode it into a clear description and show when it will run next."
    },
    {
      name: "Copy and Use",
      text: "Click 'Copy' to copy your cron expression to the clipboard. Use it in your cron jobs, task schedulers, CI/CD pipelines, or any automation tool that supports cron syntax."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Generate and Parse Cron Expressions",
      "Learn how to create cron expressions using our visual builder and parse existing cron expressions into human-readable descriptions with next execution times.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Cron Expression Generator & Parser",
      "Free online cron expression generator and parser. Create cron schedules with visual builder, decode existing cron expressions, and see next execution times. Perfect for developers, DevOps, and system administrators.",
      "https://prylad.pro/cron-expression-generator",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="⏰ Cron Expression Generator & Parser"
        description="Generate and parse cron expressions online. Create cron schedules with visual builder, decode existing cron expressions, and see next execution times."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto">
        {/* Mode Selection */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('builder')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                mode === 'builder'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Builder
            </button>
            <button
              onClick={() => setMode('parser')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                mode === 'parser'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Parser
            </button>
          </div>
        </div>

        {/* Builder Mode */}
        {mode === 'builder' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Cron Expression Builder</h2>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  Visual Builder
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use the controls below to build your cron expression. The expression is generated automatically as you make selections.
              </p>
              
              {/* Minute */}
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span>Minute</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(0-59)</span>
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={minuteType === 'every'}
                        onChange={() => setMinuteType('every')}
                        className="mr-2"
                      />
                      <span className="text-sm">Every minute</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={minuteType === 'specific'}
                        onChange={() => setMinuteType('specific')}
                        className="mr-2"
                      />
                      <span className="text-sm">Specific minutes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={minuteType === 'interval'}
                        onChange={() => setMinuteType('interval')}
                        className="mr-2"
                      />
                      <span className="text-sm">Every N minutes</span>
                    </label>
                  </div>
                  {minuteType === 'specific' && (
                    <div>
                      <input
                        type="text"
                        placeholder="0, 15, 30, 45 (comma-separated)"
                        value={specificMinutes.join(', ')}
                        onChange={(e) => setSpecificMinutes(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Enter minute values (0-59) separated by commas
                      </p>
                    </div>
                  )}
                  {minuteType === 'interval' && (
                    <div>
                      <input
                        type="number"
                        min="1"
                        max="59"
                        value={minuteInterval}
                        onChange={(e) => setMinuteInterval(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Hour */}
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span>Hour</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(0-23, 0 = midnight)</span>
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={hourType === 'every'}
                        onChange={() => setHourType('every')}
                        className="mr-2"
                      />
                      <span className="text-sm">Every hour</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={hourType === 'specific'}
                        onChange={() => setHourType('specific')}
                        className="mr-2"
                      />
                      <span className="text-sm">Specific hours</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={hourType === 'interval'}
                        onChange={() => setHourType('interval')}
                        className="mr-2"
                      />
                      <span className="text-sm">Every N hours</span>
                    </label>
                  </div>
                  {hourType === 'specific' && (
                    <div>
                      <input
                        type="text"
                        placeholder="0, 6, 12, 18 (comma-separated)"
                        value={specificHours.join(', ')}
                        onChange={(e) => setSpecificHours(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Enter hour values (0-23) separated by commas
                      </p>
                    </div>
                  )}
                  {hourType === 'interval' && (
                    <div>
                      <input
                        type="number"
                        min="1"
                        max="23"
                        value={hourInterval}
                        onChange={(e) => setHourInterval(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Day of Month */}
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span>Day of Month</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(1-31)</span>
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={dayOfMonthType === 'every'}
                        onChange={() => setDayOfMonthType('every')}
                        className="mr-2"
                      />
                      <span className="text-sm">Every day</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={dayOfMonthType === 'specific'}
                        onChange={() => setDayOfMonthType('specific')}
                        className="mr-2"
                      />
                      <span className="text-sm">Specific days</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={dayOfMonthType === 'last'}
                        onChange={() => setDayOfMonthType('last')}
                        className="mr-2"
                      />
                      <span className="text-sm">Last day of month</span>
                    </label>
                  </div>
                  {dayOfMonthType === 'specific' && (
                    <div>
                      <input
                        type="text"
                        placeholder="1, 15, 30 (comma-separated)"
                        value={specificDaysOfMonth.join(', ')}
                        onChange={(e) => setSpecificDaysOfMonth(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Enter day values (1-31) separated by commas
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Month */}
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Month <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(leave empty for all months)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {MONTHS.map((m) => (
                    <label key={m.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedMonths.includes(m.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMonths([...selectedMonths, m.value])
                          } else {
                            setSelectedMonths(selectedMonths.filter(v => v !== m.value))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Day of Week */}
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Day of Week <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">(0=Sunday, 1=Monday, leave empty for all days)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((d) => (
                    <label key={d.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedDays.includes(d.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDays([...selectedDays, d.value])
                          } else {
                            setSelectedDays(selectedDays.filter(v => v !== d.value))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{d.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generated Cron Expression */}
              <div className={`bg-blue-50 dark:bg-blue-900/20 border-2 ${parsedCron && parsedCron.isValid ? 'border-blue-300 dark:border-blue-700' : 'border-blue-200 dark:border-blue-800'} rounded-lg p-4 transition-all`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-semibold text-blue-900 dark:text-blue-100">
                      Generated Cron Expression
                    </label>
                    {parsedCron && parsedCron.isValid && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                        ✓ Valid
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(cronExpression)}
                    className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                      copied
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 dark:text-blue-400'
                    }`}
                    title="Copy to clipboard"
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <code className="text-lg font-mono text-blue-900 dark:text-blue-100 block break-all mb-2 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded border border-blue-200 dark:border-blue-800">
                  {cronExpression || '* * * * *'}
                </code>
                {parsedCron && parsedCron.isValid && (
                  <>
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-lg">📅</span>
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium flex-1">
                        {parsedCron.description}
                      </p>
                    </div>
                    {parsedCron.nextExecutions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-300 dark:border-blue-700">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-1">
                          <span>⏰</span>
                          <span>Next executions:</span>
                        </p>
                        <div className="space-y-1">
                          {parsedCron.nextExecutions.slice(0, 3).map((execution, idx) => (
                            <div key={idx} className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              <span>{execution}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Parser Mode */}
        {mode === 'parser' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Cron Expression Parser</h2>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  Decode & Validate
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paste your cron expression to see a human-readable description and next execution times.
              </p>
              
              {/* Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Cron Expression
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleParse()}
                    placeholder="* * * * *"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
                  />
                  <button
                    onClick={handleParse}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Parse
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter a cron expression in the format: minute hour day-of-month month day-of-week
                </p>
              </div>

              {/* Examples */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Quick Examples
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CRON_EXAMPLES.map((example) => (
                    <button
                      key={example.name}
                      onClick={() => loadExample(example)}
                      className="px-4 py-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md"
                    >
                      <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1 flex items-center gap-2">
                        <span className="text-primary-600 dark:text-primary-400">⚡</span>
                        <span>{example.name}</span>
                      </div>
                      <code className="text-xs text-primary-600 dark:text-primary-400 font-mono bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded block mt-1 mb-1">
                        {example.expression}
                      </code>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {example.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {parsedCron && !parsedCron.isValid && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">{parsedCron.error}</p>
                </div>
              )}

              {/* Parsed Results */}
              {parsedCron && parsedCron.isValid && (
                <div className="space-y-4">
                  {/* Description */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Schedule Description</h3>
                    <p className="text-green-800 dark:text-green-200">{parsedCron.description}</p>
                  </div>

                  {/* Next Executions */}
                  {parsedCron.nextExecutions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Next Execution Times</h3>
                      <div className="space-y-2">
                        {parsedCron.nextExecutions.map((execution, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                          >
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {execution}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expression */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Cron Expression
                      </label>
                      <button
                        onClick={() => copyToClipboard(parsedCron.expression)}
                        className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                          copied
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 dark:text-blue-400'
                        }`}
                        title="Copy to clipboard"
                      >
                        {copied ? '✓ Copied!' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-lg font-mono text-blue-900 dark:text-blue-100 block break-all bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded border border-blue-200 dark:border-blue-800">
                      {parsedCron.expression}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a Cron Expression?</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              A cron expression is a string that defines a schedule for running tasks automatically. It consists of five fields separated by spaces:
            </p>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg mb-4">
              <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                minute hour day-of-month month day-of-week
              </code>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li><strong>Minute (0-59):</strong> The minute of the hour when the task should run</li>
              <li><strong>Hour (0-23):</strong> The hour of the day (0 = midnight, 23 = 11 PM)</li>
              <li><strong>Day of Month (1-31):</strong> The day of the month</li>
              <li><strong>Month (1-12):</strong> The month of the year</li>
              <li><strong>Day of Week (0-7):</strong> The day of the week (0 or 7 = Sunday, 1 = Monday, etc.)</li>
            </ul>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Cron Expression Syntax</h2>
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Special Characters</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>* (asterisk):</strong> Matches any value. Example: <code className="bg-gray-100 dark:bg-gray-900 px-1 rounded">* * * * *</code> runs every minute</li>
                  <li><strong>, (comma):</strong> Separates multiple values. Example: <code className="bg-gray-100 dark:bg-gray-900 px-1 rounded">0 9,17 * * *</code> runs at 9 AM and 5 PM</li>
                  <li><strong>- (hyphen):</strong> Defines a range. Example: <code className="bg-gray-100 dark:bg-gray-900 px-1 rounded">0 9-17 * * 1-5</code> runs every hour from 9 AM to 5 PM on weekdays</li>
                  <li><strong>/ (slash):</strong> Defines intervals. Example: <code className="bg-gray-100 dark:bg-gray-900 px-1 rounded">*/15 * * * *</code> runs every 15 minutes</li>
                  <li><strong>L (last):</strong> Last day of the month (day-of-month field only)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <strong className="text-gray-900 dark:text-gray-100">Backup Tasks:</strong> Run daily backups at midnight: <code className="bg-gray-100 dark:bg-gray-900 px-1 rounded">0 0 * * *</code>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-gray-100">Monitoring:</strong> Check system health every 5 minutes: <code className="bg-gray-100 dark:bg-gray-900 px-1 rounded">*/5 * * * *</code>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-gray-100">Weekly Reports:</strong> Generate reports every Monday at 9 AM: <code className="bg-gray-100 dark:bg-gray-900 px-1 rounded">0 9 * * 1</code>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-gray-100">Business Hours:</strong> Run tasks during business hours (9 AM - 5 PM) on weekdays: <code className="bg-gray-100 dark:bg-gray-900 px-1 rounded">0 9-17 * * 1-5</code>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-gray-100">Monthly Tasks:</strong> Run on the first day of every month: <code className="bg-gray-100 dark:bg-gray-900 px-1 rounded">0 0 1 * *</code>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{faq.question}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Cron Expression Best Practices</h2>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
                <span><strong>Test First:</strong> Always test your cron expressions before deploying to production. Use the Parser mode to verify the schedule matches your expectations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
                <span><strong>Timezone Awareness:</strong> Cron jobs run in the server&apos;s timezone. Make sure your server timezone is set correctly, or use UTC for consistency.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
                <span><strong>Avoid Overlapping:</strong> Be careful with intervals that might overlap. For example, &apos;*/5 * * * *&apos; and &apos;*/10 * * * *&apos; will both run at minute 0, 10, 20, etc.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
                <span><strong>Document Your Cron Jobs:</strong> Add comments or documentation explaining what each cron job does. This helps maintainability.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
                <span><strong>Monitor Execution:</strong> Set up logging and monitoring for your cron jobs to ensure they run successfully and on schedule.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
                <span><strong>Consider Resource Usage:</strong> Avoid scheduling too many resource-intensive tasks at the same time. Spread them out throughout the day.</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div className="max-w-6xl mx-auto mt-12">
            <RelatedTools tools={relatedTools} />
          </div>
        )}
      </div>
    </Layout>
    </>
  )
}

