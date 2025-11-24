/**
 * SEO Tests
 * Tests for SEO metadata generation functions
 */

import { generatePageMetadata, generateRedirectMetadata } from '@/lib/seo'

describe('SEO', () => {
  describe('generatePageMetadata', () => {
    test('should generate basic metadata', () => {
      const metadata = generatePageMetadata({
        title: 'Test Tool',
        description: 'Test Description',
        path: '/test-tool',
        category: 'Technology'
      })

      expect(metadata.title).toBe('Test Tool')
      expect(metadata.description).toBe('Test Description')
      expect(metadata.category).toBe('Technology')
    })

    test('should include default keywords', () => {
      const metadata = generatePageMetadata({
        title: 'Test Tool',
        description: 'Test Description',
        path: '/test-tool',
        keywords: ['test', 'tool']
      })

      const keywords = metadata.keywords as string[]
      expect(keywords).toContain('test')
      expect(keywords).toContain('tool')
      expect(keywords).toContain('free online tools')
      expect(keywords).toContain('web tools')
    })

    test('should generate correct canonical URL', () => {
      const metadata = generatePageMetadata({
        title: 'Test Tool',
        description: 'Test Description',
        path: '/test-tool'
      })

      expect(metadata.alternates?.canonical).toBe('https://prylad.pro/test-tool')
    })

    test('should generate OpenGraph metadata', () => {
      const metadata = generatePageMetadata({
        title: 'Test Tool',
        description: 'Test Description',
        path: '/test-tool'
      })

      expect(metadata.openGraph?.title).toBe('Test Tool')
      expect(metadata.openGraph?.description).toBe('Test Description')
      expect(metadata.openGraph?.url).toBe('https://prylad.pro/test-tool')
      expect(metadata.openGraph?.siteName).toBe('Prylad')
      expect(metadata.openGraph?.type).toBe('website')
    })

    test('should generate Twitter metadata', () => {
      const metadata = generatePageMetadata({
        title: 'Test Tool',
        description: 'Test Description',
        path: '/test-tool'
      })

      expect(metadata.twitter?.card).toBe('summary_large_image')
      expect(metadata.twitter?.title).toBe('Test Tool')
      expect(metadata.twitter?.description).toBe('Test Description')
    })
  })

  describe('generateRedirectMetadata', () => {
    test('should generate redirect metadata with canonical', () => {
      const metadata = generateRedirectMetadata(
        {
          title: 'Old Tool',
          description: 'Old Description',
          path: '/old-tool'
        },
        '/new-tool'
      )

      expect(metadata.title).toBe('Old Tool')
      expect(metadata.alternates?.canonical).toBe('https://prylad.pro/new-tool')
    })

    test('should set robots to noindex, follow', () => {
      const metadata = generateRedirectMetadata(
        {
          title: 'Old Tool',
          description: 'Old Description',
          path: '/old-tool'
        },
        '/new-tool'
      )

      expect(metadata.robots?.index).toBe(false)
      expect(metadata.robots?.follow).toBe(true)
    })

    test('should point OpenGraph to canonical URL', () => {
      const metadata = generateRedirectMetadata(
        {
          title: 'Old Tool',
          description: 'Old Description',
          path: '/old-tool'
        },
        '/new-tool'
      )

      expect(metadata.openGraph?.url).toBe('https://prylad.pro/new-tool')
    })

    test('should include default keywords', () => {
      const metadata = generateRedirectMetadata(
        {
          title: 'Old Tool',
          description: 'Old Description',
          path: '/old-tool',
          keywords: ['old', 'tool']
        },
        '/new-tool'
      )

      const keywords = metadata.keywords as string[]
      expect(keywords).toContain('old')
      expect(keywords).toContain('tool')
      expect(keywords).toContain('free online tools')
    })
  })
})

