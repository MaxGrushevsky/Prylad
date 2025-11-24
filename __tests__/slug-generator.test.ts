/**
 * Slug Generator Tests
 * Tests for URL-friendly slug generation
 */

describe('Slug Generator', () => {
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }

  describe('Basic Slug Generation', () => {
    test('should convert to lowercase', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    test('should replace spaces with hyphens', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    test('should handle multiple spaces', () => {
      expect(generateSlug('Hello   World')).toBe('hello-world')
    })

    test('should remove special characters', () => {
      expect(generateSlug('Hello!@# World')).toBe('hello-world')
    })

    test('should trim whitespace', () => {
      expect(generateSlug('  Hello World  ')).toBe('hello-world')
    })
  })

  describe('Special Characters', () => {
    test('should remove punctuation', () => {
      expect(generateSlug('Hello, World!')).toBe('hello-world')
    })

    test('should handle underscores', () => {
      expect(generateSlug('Hello_World')).toBe('hello-world')
    })

    test('should handle mixed separators', () => {
      expect(generateSlug('Hello_World Test')).toBe('hello-world-test')
    })

    test('should preserve alphanumeric characters', () => {
      expect(generateSlug('Hello123 World456')).toBe('hello123-world456')
    })
  })

  describe('Edge Cases', () => {
    test('should handle empty string', () => {
      expect(generateSlug('')).toBe('')
    })

    test('should handle only special characters', () => {
      expect(generateSlug('!@#$%')).toBe('')
    })

    test('should handle only spaces', () => {
      expect(generateSlug('   ')).toBe('')
    })

    test('should handle single word', () => {
      expect(generateSlug('Hello')).toBe('hello')
    })

    test('should handle numbers only', () => {
      expect(generateSlug('123 456')).toBe('123-456')
    })
  })

  describe('Unicode and International Characters', () => {
    test('should handle accented characters', () => {
      expect(generateSlug('Café Müñoz')).toBe('caf-moz')
    })

    test('should handle Cyrillic characters', () => {
      expect(generateSlug('Привет Мир')).toBe('')
    })

    test('should handle Chinese characters', () => {
      expect(generateSlug('你好 世界')).toBe('')
    })
  })

  describe('Multiple Hyphens', () => {
    test('should collapse multiple hyphens', () => {
      expect(generateSlug('Hello---World')).toBe('hello-world')
    })

    test('should remove leading hyphens', () => {
      expect(generateSlug('-Hello World')).toBe('hello-world')
    })

    test('should remove trailing hyphens', () => {
      expect(generateSlug('Hello World-')).toBe('hello-world')
    })
  })

  describe('Real-world Examples', () => {
    test('should generate slug for article title', () => {
      expect(generateSlug('How to Build a Web App')).toBe('how-to-build-a-web-app')
    })

    test('should generate slug for product name', () => {
      expect(generateSlug('iPhone 15 Pro Max')).toBe('iphone-15-pro-max')
    })

    test('should generate slug for blog post', () => {
      expect(generateSlug('10 Best Practices for React Development')).toBe('10-best-practices-for-react-development')
    })
  })
})

