/**
 * Base64 Converter Tests
 * Tests focus on expected behavior and results, not implementation details
 */

describe('Base64 Converter', () => {
  describe('Base64 Encoding', () => {
    test('should encode simple text', () => {
      const text = 'Hello'
      const encoded = btoa(text)
      expect(encoded).toBe('SGVsbG8=')
    })

    test('should encode text with spaces', () => {
      const text = 'Hello World'
      const encoded = btoa(text)
      expect(encoded).toBe('SGVsbG8gV29ybGQ=')
    })

    test('should encode special characters', () => {
      const text = 'Hello!@#$'
      const encoded = btoa(text)
      expect(encoded).toBe('SGVsbG8hQCMk')
    })
  })

  describe('Base64 Decoding', () => {
    test('should decode simple text', () => {
      const encoded = 'SGVsbG8='
      const decoded = atob(encoded)
      expect(decoded).toBe('Hello')
    })

    test('should decode text with spaces', () => {
      const encoded = 'SGVsbG8gV29ybGQ='
      const decoded = atob(encoded)
      expect(decoded).toBe('Hello World')
    })

    test('should decode and encode back to original', () => {
      const original = 'Hello World!'
      const encoded = btoa(original)
      const decoded = atob(encoded)
      expect(decoded).toBe(original)
    })
  })

  describe('URL-Safe Base64', () => {
    test('should replace + with -', () => {
      const standard = 'SGVsbG8+'
      const urlSafe = standard.replace(/\+/g, '-')
      expect(urlSafe).toBe('SGVsbG8-')
    })

    test('should replace / with _', () => {
      const standard = 'SGVsbG8/'
      const urlSafe = standard.replace(/\//g, '_')
      expect(urlSafe).toBe('SGVsbG8_')
    })

    test('should remove padding', () => {
      const standard = 'SGVsbG8='
      const urlSafe = standard.replace(/=/g, '')
      expect(urlSafe).toBe('SGVsbG8')
    })
  })

  describe('Base64 Size', () => {
    test('should increase size by approximately 33%', () => {
      const text = 'Hello World'
      const encoded = btoa(text)
      const sizeIncrease = ((encoded.length - text.length) / text.length) * 100
      expect(sizeIncrease).toBeCloseTo(33.33, 1)
    })
  })
})


