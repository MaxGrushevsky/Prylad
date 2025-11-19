'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import QRCode from 'qrcode'

export default function WiFiQRGeneratorPage() {
  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const [security, setSecurity] = useState<'WPA' | 'WEP' | 'nopass'>('WPA')
  const [hidden, setHidden] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    if (!ssid.trim()) {
      setQrCodeUrl('')
      return
    }

    const generateQR = async () => {
      try {
        // Format: WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:true;;
        let wifiString = 'WIFI:'
        wifiString += `T:${security};`
        wifiString += `S:${ssid};`
        if (password) {
          wifiString += `P:${password};`
        }
        if (hidden) {
          wifiString += `H:true;`
        }
        wifiString += ';'

        const dataUrl = await QRCode.toDataURL(wifiString, {
          width: 300,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })
        setQrCodeUrl(dataUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    generateQR()
  }, [ssid, password, security, hidden])

  const downloadQR = () => {
    if (!qrCodeUrl) return
    const link = document.createElement('a')
    link.download = `wifi-qr-${ssid}-${Date.now()}.png`
    link.href = qrCodeUrl
    link.click()
  }

  return (
    <Layout
      title="📶 WiFi QR Code Generator"
      description="Create QR code for WiFi network connection"
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-6">WiFi Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Network Name (SSID) *
                </label>
                <input
                  type="text"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="MyWiFiNetwork"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Security Type
                </label>
                <select
                  value={security}
                  onChange={(e) => setSecurity(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">No Password</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hidden}
                    onChange={(e) => setHidden(e.target.checked)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-sm font-medium">Hidden Network</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-6">QR Code</h2>
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border-2 border-dashed border-gray-200">
              {qrCodeUrl ? (
                <div className="text-center">
                  <div className="relative inline-block p-4 bg-white rounded-2xl shadow-2xl">
                    <img
                      src={qrCodeUrl}
                      alt="WiFi QR Code"
                      className="mx-auto rounded-lg"
                    />
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    Scan QR code to connect to network
                  </p>
                  <button
                    onClick={downloadQR}
                    className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Download QR Code
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <svg className="w-32 h-32 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                  <p className="text-lg font-medium">Enter WiFi network details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}


