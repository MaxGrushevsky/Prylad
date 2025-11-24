/**
 * Structured Data Tests
 * Tests for Schema.org structured data generation functions
 */

import {
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateHowToSchema,
  generateItemListSchema,
  generateSoftwareApplicationSchema,
  FAQItem,
  BreadcrumbItem,
  HowToStep
} from '@/lib/structured-data'

describe('Structured Data', () => {
  describe('generateFAQSchema', () => {
    test('should generate valid FAQPage schema', () => {
      const faqs: FAQItem[] = [
        { question: 'What is this?', answer: 'A tool' },
        { question: 'How to use?', answer: 'Just use it' }
      ]
      const schema = generateFAQSchema(faqs)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('FAQPage')
      expect(schema.mainEntity).toHaveLength(2)
      expect(schema.mainEntity[0]['@type']).toBe('Question')
      expect(schema.mainEntity[0].name).toBe('What is this?')
      expect(schema.mainEntity[0].acceptedAnswer['@type']).toBe('Answer')
      expect(schema.mainEntity[0].acceptedAnswer.text).toBe('A tool')
    })

    test('should handle empty FAQ list', () => {
      const schema = generateFAQSchema([])
      expect(schema.mainEntity).toEqual([])
    })

    test('should handle single FAQ', () => {
      const faqs: FAQItem[] = [{ question: 'Q?', answer: 'A' }]
      const schema = generateFAQSchema(faqs)
      expect(schema.mainEntity).toHaveLength(1)
    })
  })

  describe('generateBreadcrumbSchema', () => {
    test('should generate valid BreadcrumbList schema', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Category', url: 'https://example.com/category' },
        { name: 'Tool', url: 'https://example.com/category/tool' }
      ]
      const schema = generateBreadcrumbSchema(breadcrumbs)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('BreadcrumbList')
      expect(schema.itemListElement).toHaveLength(3)
      expect(schema.itemListElement[0].position).toBe(1)
      expect(schema.itemListElement[0].name).toBe('Home')
      expect(schema.itemListElement[0].item).toBe('https://example.com')
    })

    test('should assign correct positions', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Tool', url: 'https://example.com/tool' }
      ]
      const schema = generateBreadcrumbSchema(breadcrumbs)
      expect(schema.itemListElement[0].position).toBe(1)
      expect(schema.itemListElement[1].position).toBe(2)
    })
  })

  describe('generateHowToSchema', () => {
    test('should generate valid HowTo schema', () => {
      const steps: HowToStep[] = [
        { name: 'Step 1', text: 'Do this' },
        { name: 'Step 2', text: 'Do that' }
      ]
      const schema = generateHowToSchema('How to Use', 'Description', steps, 'PT5M')

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('HowTo')
      expect(schema.name).toBe('How to Use')
      expect(schema.description).toBe('Description')
      expect(schema.totalTime).toBe('PT5M')
      expect(schema.step).toHaveLength(2)
      expect(schema.step[0].position).toBe(1)
      expect(schema.step[0].name).toBe('Step 1')
      expect(schema.step[0].text).toBe('Do this')
    })

    test('should handle steps without totalTime', () => {
      const steps: HowToStep[] = [{ name: 'Step 1', text: 'Do this' }]
      const schema = generateHowToSchema('How to Use', 'Description', steps)
      expect(schema.totalTime).toBeUndefined()
    })

    test('should include image when provided', () => {
      const steps: HowToStep[] = [
        { name: 'Step 1', text: 'Do this', image: 'https://example.com/image.jpg' }
      ]
      const schema = generateHowToSchema('How to Use', 'Description', steps)
      expect(schema.step[0].image).toBe('https://example.com/image.jpg')
    })
  })

  describe('generateItemListSchema', () => {
    test('should generate valid ItemList schema', () => {
      const items = [
        { name: 'Item 1', url: 'https://example.com/item1', description: 'Description 1' },
        { name: 'Item 2', url: 'https://example.com/item2' }
      ]
      const schema = generateItemListSchema('List Name', 'List Description', items)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('ItemList')
      expect(schema.name).toBe('List Name')
      expect(schema.description).toBe('List Description')
      expect(schema.itemListElement).toHaveLength(2)
      expect(schema.itemListElement[0].position).toBe(1)
      expect(schema.itemListElement[0].name).toBe('Item 1')
      expect(schema.itemListElement[0].url).toBe('https://example.com/item1')
      expect(schema.itemListElement[0].description).toBe('Description 1')
      expect(schema.itemListElement[1].description).toBeUndefined()
    })
  })

  describe('generateSoftwareApplicationSchema', () => {
    test('should generate valid SoftwareApplication schema', () => {
      const schema = generateSoftwareApplicationSchema(
        'Test App',
        'Test Description',
        'https://example.com/app',
        'WebApplication'
      )

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('SoftwareApplication')
      expect(schema.name).toBe('Test App')
      expect(schema.description).toBe('Test Description')
      expect(schema.url).toBe('https://example.com/app')
      expect(schema.applicationCategory).toBe('WebApplication')
      expect(schema.operatingSystem).toBe('Any')
      expect(schema.offers['@type']).toBe('Offer')
      expect(schema.offers.price).toBe('0')
      expect(schema.offers.priceCurrency).toBe('USD')
    })

    test('should use custom operating system', () => {
      const schema = generateSoftwareApplicationSchema(
        'Test App',
        'Test Description',
        'https://example.com/app',
        'WebApplication',
        'Web'
      )
      expect(schema.operatingSystem).toBe('Web')
    })

    test('should use custom offers', () => {
      const schema = generateSoftwareApplicationSchema(
        'Test App',
        'Test Description',
        'https://example.com/app',
        'WebApplication',
        'Any',
        { price: '9.99', priceCurrency: 'EUR' }
      )
      expect(schema.offers.price).toBe('9.99')
      expect(schema.offers.priceCurrency).toBe('EUR')
    })
  })
})

