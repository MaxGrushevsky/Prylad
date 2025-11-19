'use client'

import { useState, useCallback } from 'react'
import Layout from '@/components/Layout'
interface IPInfo {
  ip: string
  city?: string
  region?: string
  country?: string
  countryCode?: string
  timezone?: string
  isp?: string
  org?: string
  as?: string
  lat?: number
  lon?: number
  postal?: string
}

export default function IPAddressInfoPage() {
  const [ipAddress, setIpAddress] = useState('')
  const [info, setInfo] = useState<IPInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [myIP, setMyIP] = useState<string | null>(null)
  const fetchMyIP = useCallback(async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      setMyIP(data.ip)
      setIpAddress(data.ip)
    } catch (error) {
    }
  }, [])

  const lookupIP = useCallback(async (ip: string) => {
    if (!ip.trim()) {
      return
    }

    // Basic IP validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(ip)) {
      return
    }

    setLoading(true)
    try {
      // Using ipapi.co as it's free and doesn't require API key
      const response = await fetch(`https://ipapi.co/${ip}/json/`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch IP information')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.reason || 'Failed to get IP information')
      }

      setInfo({
        ip: data.ip || ip,
        city: data.city,
        region: data.region,
        country: data.country_name,
        countryCode: data.country_code,
        timezone: data.timezone,
        isp: data.org,
        org: data.org,
        as: data.asn,
        lat: data.latitude,
        lon: data.longitude,
        postal: data.postal
      })
    } catch (error) {.message}`)
      setInfo(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLookup = () => {
    lookupIP(ipAddress)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
    }
  }

  return (
    <Layout
      title="🌐 IP Address Info"
      description="Get detailed information about any IP address. Find location, ISP, organization, and network details."
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                IP Address
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
                  placeholder="192.168.1.1 or leave empty for your IP"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                />
                <button
                  onClick={fetchMyIP}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium text-sm"
                >
                  My IP
                </button>
                <button
                  onClick={handleLookup}
                  disabled={loading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Lookup'}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter an IP address to lookup or click "My IP" to get your current IP
              </p>
            </div>

            {/* Results */}
            {info && (
              <div className="space-y-4">
                {/* IP Address */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">IP Address</div>
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 font-mono">
                        {info.ip}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(info.ip)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Location Info */}
                {(info.city || info.region || info.country) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {info.city && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">City</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{info.city}</div>
                        </div>
                      )}
                      {info.region && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Region</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{info.region}</div>
                        </div>
                      )}
                      {info.country && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Country</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {info.country} {info.countryCode && `(${info.countryCode})`}
                          </div>
                        </div>
                      )}
                      {info.postal && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Postal Code</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{info.postal}</div>
                        </div>
                      )}
                      {info.timezone && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Timezone</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{info.timezone}</div>
                        </div>
                      )}
                      {(info.lat !== undefined && info.lon !== undefined) && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Coordinates</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">
                            {info.lat.toFixed(4)}, {info.lon.toFixed(4)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Network Info */}
                {(info.isp || info.org || info.as) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Network Information
                    </h3>
                    <div className="space-y-3">
                      {info.isp && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">ISP</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{info.isp}</div>
                        </div>
                      )}
                      {info.org && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Organization</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{info.org}</div>
                        </div>
                      )}
                      {info.as && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">ASN</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">{info.as}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Map Link */}
                {info.lat !== undefined && info.lon !== undefined && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <a
                      href={`https://www.google.com/maps?q=${info.lat},${info.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 font-medium text-sm flex items-center gap-2"
                    >
                      <span>📍</span>
                      <span>View on Google Maps</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">About IP Lookup</h3>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p>
                  IP address lookup provides information about the geographic location and network details of an IP address.
                </p>
                <p>
                  <strong>Note:</strong> Location data is approximate and may not always be accurate. VPN and proxy services can mask the actual location.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 mt-10">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Lookup an IP Address</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>Enter an IPv4 address (e.g., 8.8.8.8) or click &ldquo;My IP&rdquo; to auto-fill your current public IP.</li>
            <li>Click &ldquo;Lookup&rdquo; to fetch geolocation, ISP, and ASN data.</li>
            <li>Review the location cards, network info, and coordinates. Open Google Maps for a visual reference.</li>
            <li>Copy the IP or stats when documenting incidents, support tickets, or QA reports.</li>
          </ol>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Note: Data is approximate and may differ for VPNs, proxies, or mobile networks.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Information Can You See?</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Location Data</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>City, region, and country</li>
                <li>Postal code and timezone</li>
                <li>Latitude / longitude coordinates</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Network Details</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>ISP (internet service provider)</li>
                <li>Organization name</li>
                <li>Autonomous system number (ASN)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Best Practices</h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed list-disc list-inside">
            <li>Use this tool for troubleshooting, QA, or educational purposes; do not misuse IP data.</li>
            <li>Correlate IP information with server logs for accurate incident response.</li>
            <li>Respect privacy laws (GDPR, CCPA). IP data can be considered personal information.</li>
            <li>Combine with WHOIS or domain age tools to build a full picture of suspicious hosts.</li>
          </ul>
        </section>
      </div>

      </Layout>
  )
}

