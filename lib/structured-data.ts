// Structured Data (Schema.org) utilities for SEO

export interface FAQItem {
  question: string
  answer: string
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface HowToStep {
  name: string
  text: string
  image?: string
}

/**
 * Generate FAQPage structured data
 */
export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }
}

/**
 * Generate HowTo structured data
 */
export function generateHowToSchema(
  name: string,
  description: string,
  steps: HowToStep[],
  totalTime?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && { "image": step.image })
    })),
    ...(totalTime && { "totalTime": totalTime })
  }
}

/**
 * Generate ItemList structured data for tool categories
 */
export function generateItemListSchema(
  name: string,
  description: string,
  items: Array<{ name: string; url: string; description?: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": name,
    "description": description,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "url": item.url,
      ...(item.description && { "description": item.description })
    }))
  }
}

/**
 * Generate SoftwareApplication structured data for individual tools
 */
export function generateSoftwareApplicationSchema(
  name: string,
  description: string,
  url: string,
  applicationCategory: string,
  operatingSystem: string = "Any",
  offers: { price: string; priceCurrency: string } = { price: "0", priceCurrency: "USD" }
) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "description": description,
    "url": url,
    "applicationCategory": applicationCategory,
    "operatingSystem": operatingSystem,
    "offers": {
      "@type": "Offer",
      "price": offers.price,
      "priceCurrency": offers.priceCurrency
    }
  }
}

