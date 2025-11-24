/**
 * SEO Helpers Tests
 * Tests for SEO utility functions
 */

import { generateBreadcrumbs, getRelatedTools, getCategoryForPath, getToolNameFromPath } from '@/lib/seo-helpers'

describe('SEO Helpers', () => {
  describe('generateBreadcrumbs', () => {
    test('should generate breadcrumbs with home', () => {
      const breadcrumbs = generateBreadcrumbs('Test Tool', '/test-tool')
      expect(breadcrumbs).toHaveLength(2)
      expect(breadcrumbs[0]).toEqual({ name: 'Home', url: 'https://prylad.pro' })
      expect(breadcrumbs[1]).toEqual({ name: 'Test Tool', url: 'https://prylad.pro/test-tool' })
    })

    test('should include category when provided', () => {
      const breadcrumbs = generateBreadcrumbs('Test Tool', '/test-tool', 'code')
      expect(breadcrumbs).toHaveLength(3)
      expect(breadcrumbs[0]).toEqual({ name: 'Home', url: 'https://prylad.pro' })
      expect(breadcrumbs[1]).toEqual({ name: 'Code', url: 'https://prylad.pro/code' })
      expect(breadcrumbs[2]).toEqual({ name: 'Test Tool', url: 'https://prylad.pro/test-tool' })
    })

    test('should handle invalid category gracefully', () => {
      const breadcrumbs = generateBreadcrumbs('Test Tool', '/test-tool', 'invalid-category')
      expect(breadcrumbs).toHaveLength(2)
      expect(breadcrumbs[0]).toEqual({ name: 'Home', url: 'https://prylad.pro' })
      expect(breadcrumbs[1]).toEqual({ name: 'Test Tool', url: 'https://prylad.pro/test-tool' })
    })
  })

  describe('getRelatedTools', () => {
    test('should return related tools from same category', () => {
      const related = getRelatedTools('/json-formatter', 'code', 3)
      expect(related.length).toBeGreaterThan(0)
      expect(related.length).toBeLessThanOrEqual(3)
      expect(related.every(tool => tool.path !== '/json-formatter')).toBe(true)
    })

    test('should respect limit parameter', () => {
      const related = getRelatedTools('/json-formatter', 'code', 2)
      expect(related.length).toBeLessThanOrEqual(2)
    })

    test('should return empty array for invalid category', () => {
      const related = getRelatedTools('/test-tool', 'invalid-category', 5)
      expect(related).toEqual([])
    })

    test('should exclude current tool from results', () => {
      const related = getRelatedTools('/json-formatter', 'code', 10)
      expect(related.every(tool => tool.path !== '/json-formatter')).toBe(true)
    })

    test('should return empty array when no category provided', () => {
      const related = getRelatedTools('/test-tool', undefined, 5)
      expect(related).toEqual([])
    })
  })

  describe('getCategoryForPath', () => {
    test('should find category for valid tool path', () => {
      const category = getCategoryForPath('/json-formatter')
      expect(category).toBe('code')
    })

    test('should return undefined for invalid path', () => {
      const category = getCategoryForPath('/non-existent-tool')
      expect(category).toBeUndefined()
    })

    test('should find category for different tool types', () => {
      expect(getCategoryForPath('/uuid-generator')).toBe('generators')
      expect(getCategoryForPath('/color-generator')).toBe('colors')
      expect(getCategoryForPath('/password-generator')).toBe('security')
    })
  })

  describe('getToolNameFromPath', () => {
    test('should return tool name for valid path', () => {
      const name = getToolNameFromPath('/json-formatter')
      expect(name).toBe('JSON Formatter')
    })

    test('should generate name from path when tool not found', () => {
      const name = getToolNameFromPath('/my-custom-tool')
      expect(name).toBe('My Custom Tool')
    })

    test('should handle paths with multiple segments', () => {
      const name = getToolNameFromPath('/test-data-generator')
      expect(name).toBe('Test Data Generator')
    })

    test('should handle single word paths', () => {
      const name = getToolNameFromPath('/markdown')
      expect(name).toBe('Markdown')
    })
  })
})

