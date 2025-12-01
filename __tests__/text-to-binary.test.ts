/**
 * Text to Binary Tests
 * Tests for text to binary and binary to text conversion
 */

describe('Text to Binary', () => {
  const textToBinary = (text: string): string => {
    return text
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(' ')
  }

  const binaryToText = (binary: string): string => {
    return binary
      .split(' ')
      .map(bin => String.fromCharCode(parseInt(bin, 2)))
      .join('')
  }

  describe('Text to Binary Conversion', () => {
    test('should convert single character to binary', () => {
      const binary = textToBinary('A')
      expect(binary).toBe('01000001')
    })

    test('should convert simple text to binary', () => {
      const binary = textToBinary('Hi')
      expect(binary).toBe('01001000 01101001')
    })

    test('should convert text with spaces', () => {
      const binary = textToBinary('Hello World')
      expect(binary.split(' ').length).toBeGreaterThan(1)
    })

    test('should convert numbers as text', () => {
      const binary = textToBinary('123')
      expect(binary).toBe('00110001 00110010 00110011')
    })

    test('should convert special characters', () => {
      const binary = textToBinary('!@#')
      expect(binary.split(' ').length).toBe(3)
    })

    test('should handle empty string', () => {
      expect(textToBinary('')).toBe('')
    })
  })

  describe('Binary to Text Conversion', () => {
    test('should convert single binary to character', () => {
      const text = binaryToText('01000001')
      expect(text).toBe('A')
    })

    test('should convert binary to text', () => {
      const text = binaryToText('01001000 01101001')
      expect(text).toBe('Hi')
    })

    test('should convert binary with spaces', () => {
      const text = binaryToText('01001000 01100101 01101100 01101100 01101111')
      expect(text).toBe('Hello')
    })

    test('should convert numbers from binary', () => {
      const text = binaryToText('00110001 00110010 00110011')
      expect(text).toBe('123')
    })
  })

  describe('Round-trip Conversion', () => {
    test('should convert text to binary and back', () => {
      const original = 'Hello World'
      const binary = textToBinary(original)
      const text = binaryToText(binary)
      expect(text).toBe(original)
    })

    test('should handle special characters in round-trip', () => {
      const original = 'Hello!@#$'
      const binary = textToBinary(original)
      const text = binaryToText(binary)
      expect(text).toBe(original)
    })

    test('should handle unicode characters', () => {
      const original = 'Hello 世界'
      const binary = textToBinary(original)
      const text = binaryToText(binary)
      expect(text).toBe(original)
    })
  })

  describe('Binary Formatting', () => {
    test('should pad binary to 8 bits', () => {
      const binary = textToBinary('A')
      expect(binary.length).toBe(8)
      expect(binary).toMatch(/^[01]{8}$/)
    })

    test('should separate bytes with spaces', () => {
      const binary = textToBinary('Hi')
      expect(binary).toContain(' ')
    })

    test('should handle multiple bytes correctly', () => {
      const binary = textToBinary('ABC')
      const bytes = binary.split(' ')
      expect(bytes.length).toBe(3)
      bytes.forEach(byte => {
        expect(byte.length).toBe(8)
        expect(byte).toMatch(/^[01]{8}$/)
      })
    })
  })
})


