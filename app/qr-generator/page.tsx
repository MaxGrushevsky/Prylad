import Layout from '@/components/Layout'
import QRCodeGenerator from '@/components/QRCodeGenerator'
import StructuredData from '@/components/StructuredData'
import { generatePageMetadata } from '@/lib/seo'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free QR Code Generator - Create Custom QR Codes Online',
  description: 'Generate QR codes for free. Create custom QR codes for text, URLs, WiFi networks, and email addresses. Customize colors, size, and error correction level. No registration required.',
  keywords: [
    'QR code generator',
    'QR code maker',
    'free QR code',
    'custom QR code',
    'WiFi QR code',
    'QR code online',
    'QR code creator',
    'barcode generator'
  ],
  path: '/qr-generator',
  category: 'QR Code Tools'
})

export default function QRGeneratorPage() {
  // FAQ data for structured data
  const faqs = [
    {
      question: "Are the QR codes generated here free to use?",
      answer: "Yes, absolutely! All QR codes generated with our tool are completely free to use for personal or commercial purposes. There are no hidden fees, subscriptions, or usage limits."
    },
    {
      question: "Do you store or track my QR codes?",
      answer: "No, we don't store, track, or have access to any QR codes you generate. All processing happens locally in your browser, ensuring complete privacy and security of your data."
    },
    {
      question: "What's the difference between error correction levels?",
      answer: "Error correction levels determine how much of the QR code can be damaged or obscured while still remaining scannable. Level L (Low) can recover ~7% damage, M (Medium) ~15%, Q (Quartile) ~25%, and H (High) ~30%. Higher levels create denser codes but are more resilient."
    },
    {
      question: "Can I use custom colors for my QR code?",
      answer: "Yes! You can customize both the QR code color and background color. However, ensure there's sufficient contrast between the two colors for reliable scanning. We recommend testing your colored QR codes before final use."
    },
    {
      question: "What file format are the QR codes saved in?",
      answer: "QR codes are downloaded as PNG images, which provide high quality and are compatible with all major image editing software and printing services. PNG format ensures your QR codes remain crisp and scannable at any size."
    },
    {
      question: "Can I generate QR codes for WiFi networks?",
      answer: "Yes! Our generator supports WiFi QR codes. Simply select the WiFi option, enter your network name (SSID), password, security type, and whether it's a hidden network. The generated QR code allows users to connect to your WiFi network instantly by scanning."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose QR Code Type",
      text: "Select from Text, URL, WiFi, or Email depending on what you want to encode."
    },
    {
      name: "Enter Your Content",
      text: "Type your text, paste a URL, fill in WiFi network details, or enter an email address."
    },
    {
      name: "Customize Appearance",
      text: "Adjust colors, size, and error correction level to match your brand or design preferences."
    },
    {
      name: "Download or Copy",
      text: "Once generated, download the QR code as a PNG image or copy it to your clipboard."
    },
    {
      name: "Test Your QR Code",
      text: "Scan it with your smartphone to ensure it works correctly before sharing."
    }
  ]

  // Breadcrumbs
  const breadcrumbs = [
    { name: "Home", url: "https://prylad.pro" },
    { name: "QR Code Generator", url: "https://prylad.pro/qr-generator" }
  ]

  // Structured data schemas
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Generate a QR Code",
      "Learn how to create custom QR codes for text, URLs, WiFi networks, and email addresses using our free online QR code generator.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "QR Code Generator",
      "Free online QR code generator. Create custom QR codes for text, URLs, WiFi networks, and email addresses.",
      "https://prylad.pro/qr-generator",
      "UtilityApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="📱 QR Code Generator"
        description="Create QR codes online for free. Customize colors, size and error correction level. Generate QR codes for text, URLs, WiFi networks, and email addresses."
        breadcrumbs={breadcrumbs}
      >
        <QRCodeGenerator />
      
      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        {/* Introduction */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a QR Code?</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              A QR (Quick Response) code is a two-dimensional barcode that can store various types of information, 
              including text, URLs, contact details, WiFi credentials, and more. QR codes were invented in 1994 by 
              Denso Wave, a Japanese company, and have since become one of the most popular ways to share information 
              quickly and efficiently.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Unlike traditional barcodes that can only store a limited amount of data, QR codes can hold up to 
              4,296 alphanumeric characters, making them incredibly versatile for modern digital communication. 
              They can be scanned by any smartphone camera, making them accessible to billions of users worldwide.
            </p>
          </div>
        </section>

        {/* How to Use */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our QR Code Generator</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Our free online QR code generator makes it easy to create custom QR codes in seconds. Here&apos;s how to use it:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
              <li><strong>Choose QR Code Type:</strong> Select from Text, URL, WiFi, or Email depending on what you want to encode.</li>
              <li><strong>Enter Your Content:</strong> Type your text, paste a URL, fill in WiFi network details, or enter an email address.</li>
              <li><strong>Customize Appearance:</strong> Adjust colors, size, and error correction level to match your brand or design preferences.</li>
              <li><strong>Download or Copy:</strong> Once generated, download the QR code as a PNG image or copy it to your clipboard.</li>
              <li><strong>Test Your QR Code:</strong> Scan it with your smartphone to ensure it works correctly before sharing.</li>
            </ol>
          </div>
        </section>

        {/* Use Cases */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common QR Code Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📱 Business Cards</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Create QR codes that link to your contact information, LinkedIn profile, or portfolio website. 
                Perfect for networking events and professional meetings.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌐 Website Promotion</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Generate QR codes for your website URL to include in print advertisements, flyers, or business materials. 
                Makes it easy for customers to visit your site.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📶 WiFi Sharing</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Create WiFi QR codes for your home, office, or cafe. Guests can scan and connect instantly without 
                manually entering the network password.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">✉️ Email Marketing</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Include QR codes in email campaigns that link to landing pages, special offers, or contact forms. 
                Great for tracking engagement and conversions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📋 Event Management</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Use QR codes for event registration, ticket validation, or providing additional event information. 
                Streamlines check-in processes and enhances attendee experience.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🏪 Product Information</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Add QR codes to product packaging that link to manuals, reviews, or additional product details. 
                Enhances customer experience and reduces support inquiries.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features of Our QR Code Generator</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Custom Colors</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Personalize your QR codes with custom colors for both the code and background. 
                  Match your brand identity or create eye-catching designs.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📏</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Adjustable Size</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Control the size of your QR code from 200px to 600px. Choose the perfect dimensions 
                  for your specific use case, whether for print or digital display.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Error Correction</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Select from four error correction levels (L, M, Q, H) to ensure your QR code remains 
                  scannable even if partially damaged or obscured.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Instant Generation</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Generate QR codes instantly in your browser. No registration required, no data stored, 
                  and completely free to use.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📥</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Easy Download</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Download your QR code as a high-quality PNG image or copy it directly to your clipboard 
                  for immediate use in documents or presentations.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Privacy First</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  All QR code generation happens locally in your browser. We don&apos;t store, track, or have 
                  access to any of your data or generated codes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Best Practices for QR Codes</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">1.</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Choose the Right Error Correction Level</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use higher error correction levels (Q or H) for QR codes that will be printed or displayed 
                  in challenging conditions. Lower levels (L or M) work well for digital displays.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">2.</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Ensure Proper Contrast</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Maintain high contrast between the QR code color and background. Dark codes on light backgrounds 
                  or light codes on dark backgrounds work best for reliable scanning.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">3.</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Test Before Distribution</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Always test your QR code with multiple devices and scanning apps before printing or sharing. 
                  This ensures compatibility across different platforms and devices.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">4.</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Provide Context</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Include text near your QR code explaining what users will find when they scan it. 
                  This increases trust and improves scan rates.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">5.</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Optimize for Print</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  When printing QR codes, ensure they&apos;re at least 2cm x 2cm (0.8&quot; x 0.8&quot;) in size. 
                  Use high-resolution images and avoid compression that might degrade the code quality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Are the QR codes generated here free to use?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Yes, absolutely! All QR codes generated with our tool are completely free to use for personal 
                or commercial purposes. There are no hidden fees, subscriptions, or usage limits.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Do you store or track my QR codes?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                No, we don&apos;t store, track, or have access to any QR codes you generate. All processing happens 
                locally in your browser, ensuring complete privacy and security of your data.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between error correction levels?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Error correction levels determine how much of the QR code can be damaged or obscured while still 
                remaining scannable. Level L (Low) can recover ~7% damage, M (Medium) ~15%, Q (Quartile) ~25%, 
                and H (High) ~30%. Higher levels create denser codes but are more resilient.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I use custom colors for my QR code?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Yes! You can customize both the QR code color and background color. However, ensure there&apos;s sufficient 
                contrast between the two colors for reliable scanning. We recommend testing your colored QR codes 
                before final use.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What file format are the QR codes saved in?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                QR codes are downloaded as PNG images, which provide high quality and are compatible with all major 
                image editing software and printing services. PNG format ensures your QR codes remain crisp and 
                scannable at any size.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I generate QR codes for WiFi networks?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Yes! Our generator supports WiFi QR codes. Simply select the WiFi option, enter your network name (SSID), 
                password, security type, and whether it&apos;s a hidden network. The generated QR code allows users to connect 
                to your WiFi network instantly by scanning.
              </p>
            </div>
          </div>
        </section>
      </div>
      </Layout>
    </>
  )
}
