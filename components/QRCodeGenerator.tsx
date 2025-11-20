'use client'

import { useState, useEffect, useCallback } from 'react'
import QRCode from 'qrcode'
interface QRCodeOptions {
  color: {
    dark: string
    light: string
  }
  width: number
  margin: number
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
}

type QRType = 'text' | 'url' | 'wifi' | 'email'

export default function QRCodeGenerator() {
  const [qrType, setQrType] = useState<QRType>('text')
  const [text, setText] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [options, setOptions] = useState<QRCodeOptions>({
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    width: 300,
    margin: 1,
    errorCorrectionLevel: 'M',
  })
  
  // WiFi specific state
  const [wifiSsid, setWifiSsid] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [wifiSecurity, setWifiSecurity] = useState<'WPA' | 'WEP' | 'nopass'>('WPA')
  const [wifiHidden, setWifiHidden] = useState(false)

  // Generate QR code content based on type
  const getQRContent = useCallback(() => {
    switch (qrType) {
      case 'wifi':
        if (!wifiSsid.trim()) return ''
        let wifiString = 'WIFI:'
        wifiString += `T:${wifiSecurity};`
        wifiString += `S:${wifiSsid};`
        if (wifiPassword) {
          wifiString += `P:${wifiPassword};`
        }
        if (wifiHidden) {
          wifiString += `H:true;`
        }
        wifiString += ';'
        return wifiString
      case 'email':
        return text.trim() || ''
      case 'url':
        return text.trim() || ''
      case 'text':
      default:
        return text.trim() || ''
    }
  }, [qrType, text, wifiSsid, wifiPassword, wifiSecurity, wifiHidden])

  // Debounce for QR code generation
  useEffect(() => {
    const content = getQRContent()
    if (!content) {
      setQrCodeUrl('')
      setIsGenerating(false)
      return
    }

    setIsGenerating(true)
    const timer = setTimeout(async () => {
      try {
        const qrOptions: QRCode.QRCodeToDataURLOptions = {
          width: options.width,
          margin: options.margin,
          color: {
            dark: options.color.dark,
            light: options.color.light,
          },
          errorCorrectionLevel: options.errorCorrectionLevel,
        }

        const dataUrl = await QRCode.toDataURL(content, qrOptions)
        setQrCodeUrl(dataUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
      } finally {
        setIsGenerating(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [getQRContent, options, ])

  const downloadQRCode = useCallback(() => {
    if (!qrCodeUrl) return

    try {
      const link = document.createElement('a')
      link.download = `qr-code-${Date.now()}.png`
      link.href = qrCodeUrl
      link.click()
    } catch (error) {
    }
  }, [qrCodeUrl, ])

  const copyToClipboard = useCallback(async () => {
    if (!qrCodeUrl) return

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
    } catch (error) {
      // Fallback for older browsers
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        img.onload = async () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          canvas.toBlob(async (blob) => {
            if (blob) {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ])
            }
          })
        }
        img.src = qrCodeUrl
      } catch (fallbackError) {
      }
    }
  }, [qrCodeUrl, ])

  const handleColorChange = useCallback((type: 'dark' | 'light', color: string) => {
    setOptions((prev) => ({
      ...prev,
      color: {
        ...prev.color,
        [type]: color,
      },
    }))
  }, [])

  const handleSizeChange = useCallback((size: number) => {
    setOptions((prev) => ({
      ...prev,
      width: size,
    }))
  }, [])

  const applyPreset = useCallback((preset: 'url' | 'text' | 'wifi' | 'email') => {
    setQrType(preset)
    if (preset === 'wifi') {
      setWifiSsid('MyWiFiNetwork')
      setWifiPassword('')
      setWifiSecurity('WPA')
      setWifiHidden(false)
    } else {
      const presets = {
        url: 'https://example.com',
        text: 'Example text for QR code',
        email: 'mailto:example@email.com?subject=Hello&body=Hi there!',
      }
      setText(presets[preset])
    }
  }, [])

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* QR Type selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
            QR Code Type
          </label>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setQrType('text')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                qrType === 'text'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              📝 Text
            </button>
            <button
              onClick={() => setQrType('url')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                qrType === 'url'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🌐 URL
            </button>
            <button
              onClick={() => setQrType('wifi')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                qrType === 'wifi'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              📶 WiFi
            </button>
            <button
              onClick={() => setQrType('email')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                qrType === 'email'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              ✉️ Email
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left column - Settings */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Settings
            </h2>

            {/* Content input based on type */}
            {qrType === 'wifi' ? (
              <div className="mb-6 space-y-4">
                <div>
                  <label htmlFor="wifi-ssid" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Network Name (SSID) *
                  </label>
                  <input
                    id="wifi-ssid"
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="MyWiFiNetwork"
                    aria-label="WiFi network name"
                  />
                </div>
                <div>
                  <label htmlFor="wifi-password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="wifi-password"
                    type="password"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Enter password"
                    aria-label="WiFi password"
                  />
                </div>
                <div>
                  <label htmlFor="wifi-security" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Security Type
                  </label>
                  <select
                    id="wifi-security"
                    value={wifiSecurity}
                    onChange={(e) => setWifiSecurity(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    aria-label="WiFi security type"
                  >
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">No password</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="w-4 h-4 accent-primary-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hidden network</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <label htmlFor="qr-text" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {qrType === 'url' ? 'URL' : qrType === 'email' ? 'Email' : 'Text'}
                </label>
                <textarea
                  id="qr-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  rows={4}
                  placeholder={
                    qrType === 'url' 
                      ? 'Enter URL (e.g., https://example.com)...'
                      : qrType === 'email'
                      ? 'Enter email (e.g., mailto:example@email.com?subject=Hello)...'
                      : 'Enter text...'
                  }
                  aria-label="Text for QR code"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {text.length} characters
                </p>
              </div>
            )}

            {/* Size */}
            <div className="mb-6">
              <label htmlFor="qr-size" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Size: <span className="text-primary-600 font-bold">{options.width}px</span>
              </label>
              <input
                id="qr-size"
                type="range"
                min="200"
                max="600"
                step="50"
                value={options.width}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg appearance-none cursor-pointer accent-primary-600"
                style={{
                  background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${((options.width - 200) / 400) * 100}%, rgb(229, 231, 235) ${((options.width - 200) / 400) * 100}%, rgb(229, 231, 235) 100%)`
                }}
                aria-label="QR code size"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>200px</span>
                <span>600px</span>
              </div>
            </div>

            {/* Colors */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Colors
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="qr-color-dark" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Code color
                  </label>
                  <label htmlFor="qr-color-dark" className="relative block cursor-pointer group">
                    <input
                      id="qr-color-dark"
                      type="color"
                      value={options.color.dark}
                      onChange={(e) => handleColorChange('dark', e.target.value)}
                      className="w-full h-14 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 group-hover:shadow-md transition-all opacity-0 absolute bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      aria-label="QR code color"
                    />
                    <div 
                      className="w-full h-14 rounded-xl border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 group-hover:shadow-md transition-all flex items-center justify-end px-4 relative overflow-hidden"
                      style={{ backgroundColor: options.color.dark }}
                    >
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8)) drop-shadow(0 0 1px rgba(0,0,0,0.9))' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </label>
                </div>
                <div>
                  <label htmlFor="qr-color-light" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Background
                  </label>
                  <label htmlFor="qr-color-light" className="relative block cursor-pointer group">
                    <input
                      id="qr-color-light"
                      type="color"
                      value={options.color.light}
                      onChange={(e) => handleColorChange('light', e.target.value)}
                      className="w-full h-14 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 group-hover:shadow-md transition-all opacity-0 absolute bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      aria-label="Background color"
                    />
                    <div 
                      className="w-full h-14 rounded-xl border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 group-hover:shadow-md transition-all flex items-center justify-end px-4 relative overflow-hidden"
                      style={{ backgroundColor: options.color.light }}
                    >
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8)) drop-shadow(0 0 1px rgba(0,0,0,0.9))' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Error correction level */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Error correction level
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    setOptions((prev) => ({
                      ...prev,
                      errorCorrectionLevel: 'L',
                    }))
                  }
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    options.errorCorrectionLevel === 'L'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  L - Low (~7%)
                </button>
                <button
                  onClick={() =>
                    setOptions((prev) => ({
                      ...prev,
                      errorCorrectionLevel: 'M',
                    }))
                  }
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    options.errorCorrectionLevel === 'M'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  M - Medium (~15%)
                </button>
                <button
                  onClick={() =>
                    setOptions((prev) => ({
                      ...prev,
                      errorCorrectionLevel: 'Q',
                    }))
                  }
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    options.errorCorrectionLevel === 'Q'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Q - High (~25%)
                </button>
                <button
                  onClick={() =>
                    setOptions((prev) => ({
                      ...prev,
                      errorCorrectionLevel: 'H',
                    }))
                  }
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    options.errorCorrectionLevel === 'H'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  H - Maximum (~30%)
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={downloadQRCode}
                disabled={!qrCodeUrl || isGenerating}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!qrCodeUrl || isGenerating}
                className="flex-1 bg-white dark:bg-gray-800 border-2 border-primary-600 text-primary-600 dark:text-primary-400 font-semibold py-3 px-6 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
          </div>

          {/* Right column - Preview */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Preview
            </h2>
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              {isGenerating ? (
                <div className="text-center">
                  <div className="relative w-64 h-64 mx-auto mb-4">
                    <div className="absolute inset-0 border-4 border-primary-200 rounded-xl animate-pulse" />
                    <div className="absolute inset-4 border-4 border-primary-400 rounded-xl animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="absolute inset-8 border-4 border-primary-600 rounded-xl animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Generating QR code...</p>
                </div>
              ) : qrCodeUrl ? (
                <div className="text-center animate-fade-in">
                  <div className="relative inline-block p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-transform hover:scale-105">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="mx-auto rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-6 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Scan QR code to verify
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-400 dark:text-gray-500">
                  <svg className="w-32 h-32 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="text-lg font-medium dark:text-gray-300">Enter text to generate QR code</p>
                  <p className="text-sm mt-2 dark:text-gray-400">Use quick presets above</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      </>
  )
}
