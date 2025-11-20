'use client'

interface SEOContentProps {
  toolName: string
  toolPath: string
  category?: string
  faqs?: Array<{ question: string; answer: string }>
  howToSteps?: Array<{ name: string; text: string }>
  description?: string
  useCases?: Array<{ title: string; description: string }>
  features?: Array<{ title: string; description: string }>
}

export default function SEOContent({
  toolName,
  toolPath,
  category,
  faqs = [],
  howToSteps = [],
  description,
  useCases = [],
  features = []
}: SEOContentProps) {
  return (
    <div className="max-w-4xl mx-auto mt-16 space-y-8">
      {/* Introduction */}
      {description && (
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            What is {toolName}?
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>
        </section>
      )}

      {/* How To Use */}
      {howToSteps.length > 0 && (
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            How to Use {toolName}
          </h2>
          <div className="prose prose-gray max-w-none">
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
              {howToSteps.map((step, index) => (
                <li key={index}>
                  <strong>{step.name}:</strong> {step.text}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Use Cases */}
      {useCases.length > 0 && (
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Common Use Cases
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {useCase.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      {features.length > 0 && (
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index}>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

