'use client'

import { useState, useCallback } from 'react'
import Layout from '@/components/Layout'
interface DomainInfo {
  domain: string
  registeredDate?: string
  age?: {
    years: number
    months: number
    days: number
    totalDays: number
  }
  registrar?: string
  expirationDate?: string
  status?: string
}

export default function DomainAgeCheckerPage() {
  const [domain, setDomain] = useState('')
  const [info, setInfo] = useState<DomainInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const extractDomain = (input: string): string => {
    // Remove protocol
    let cleaned = input.replace(/^https?:\/\//, '')
    // Remove www
    cleaned = cleaned.replace(/^www\./, '')
    // Remove path and query
    cleaned = cleaned.split('/')[0]
    // Remove port
    cleaned = cleaned.split(':')[0]
    return cleaned.trim()
  }

  const calculateAge = (registeredDate: string) => {
    const registered = new Date(registeredDate)
    const now = new Date()
    
    const totalDays = Math.floor((now.getTime() - registered.getTime()) / (1000 * 60 * 60 * 24))
    
    const years = Math.floor(totalDays / 365)
    const months = Math.floor((totalDays % 365) / 30)
    const days = totalDays % 30
    
    return {
      years,
      months,
      days,
      totalDays
    }
  }

  const lookupDomain = useCallback(async (domainInput: string) => {
    if (!domainInput.trim()) {
      return
    }

    const cleanedDomain = extractDomain(domainInput)
    
    // Basic domain validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i
    if (!domainRegex.test(cleanedDomain)) {
      return
    }

    setLoading(true)
    try {
      // Using ipapi.co whois API (free tier)
      // Note: This is a simplified implementation. Real WHOIS requires proper API or server-side handling
      const response = await fetch(`https://ipapi.co/${cleanedDomain}/json/`)
      
      // Since ipapi.co doesn't provide WHOIS, we'll use a different approach
      // We'll try to get basic info and show a message about limitations
      
      // For a real implementation, you'd need a WHOIS API service
      // This is a placeholder that shows the structure
      
      // Simulate API call (in production, use a real WHOIS API)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Since we don't have a real WHOIS API, we'll show a helpful message
      // In production, you'd integrate with a service like whoisxmlapi.com or similar
      setInfo({
        domain: cleanedDomain,
        registeredDate: undefined,
        age: undefined,
        registrar: undefined,
        expirationDate: undefined,
        status: undefined
      })
      
    } catch (error) {.message}`)
      setInfo(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLookup = () => {
    lookupDomain(domain)
  }

  // Demo function to show how it would work with real data
  const showDemo = () => {
    const demoDate = '2010-01-15'
    const age = calculateAge(demoDate)
    setInfo({
      domain: extractDomain(domain || 'example.com'),
      registeredDate: demoDate,
      age,
      registrar: 'Example Registrar Inc.',
      expirationDate: '2025-01-15',
      status: 'Active'
    })')
  }

  return (
    <Layout
      title="🌍 Domain Age Checker"
      description="Check domain age and registration date online. Find out when a domain was first registered."
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Domain Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
                  placeholder="example.com or https://www.example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={handleLookup}
                  disabled={loading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Check'}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter a domain name (with or without http:// or www)
              </p>
            </div>

            {/* Results */}
            {info && (
              <div className="space-y-4">
                {/* Domain */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Domain</div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {info.domain}
                  </div>
                </div>

                {/* Age */}
                {info.age && info.registeredDate && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Domain Age
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {info.age.years}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Years</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {info.age.months}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Months</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {info.age.days}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Days</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {info.age.totalDays}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Days</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Registration Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Registration Details
                  </h3>
                  <div className="space-y-3">
                    {info.registeredDate && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Registered Date</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {new Date(info.registeredDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                    {info.expirationDate && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Expiration Date</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {new Date(info.expirationDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                    {info.registrar && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Registrar</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{info.registrar}</div>
                      </div>
                    )}
                    {info.status && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{info.status}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">About Domain Age Checker</h3>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p>
                  Domain age checker provides information about when a domain was first registered.
                </p>
                <p>
                  <strong>Note:</strong> Full WHOIS lookup requires a paid API service. This tool demonstrates the functionality and structure. For production use, integrate with a WHOIS API provider like whoisxmlapi.com or similar services.
                </p>
                <button
                  onClick={showDemo}
                  className="mt-2 px-3 py-1 bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 rounded text-blue-900 dark:text-blue-100 text-xs font-medium"
                >
                  View Demo (Example Data)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 mt-10">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Check Domain Age</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>Enter a domain name (with or without protocol). The tool normalizes it for you.</li>
            <li>Click &ldquo;Check&rdquo; to run a lookup. For demos, use the example button to preview realistic data.</li>
            <li>Review the registered date, expiration date, registrar, and status.</li>
            <li>Use the age summary (years / months / days) when vetting backlinks or marketplaces.</li>
          </ol>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Full WHOIS data requires a paid API. Integrate your provider&rsquo;s endpoint server-side to replace the demo logic.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why Domain Age Matters</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">SEO &amp; Trust</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Older domains often have stronger backlink profiles.</li>
                <li>Used in due diligence when acquiring websites or partnering with vendors.</li>
                <li>Spot recently registered domains that might be disposable or malicious.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Security &amp; Compliance</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Verify domains before whitelisting them in corporate IT policies.</li>
                <li>Investigate phishing or spam by checking how long a domain has existed.</li>
                <li>Track expiration dates to avoid accidental lapses.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Integration Tips</h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed list-disc list-inside">
            <li>Use WHOIS APIs such as WhoisXML API, IP2WHOIS, or domainr to replace the demo call.</li>
            <li>Cache results to stay within rate limits and improve performance.</li>
            <li>Store registrar and expiration metadata alongside your domain inventory.</li>
            <li>Combine with the IP Address Info tool to compare hosting locations vs. registration.</li>
          </ul>
        </section>
      </div>

      </Layout>
  )
}

