/**
 * Morse Code Tests
 * Tests for Morse code encoding and decoding
 */

describe('Morse Code', () => {
  const morseCodeMap: Record<string, string> = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
    'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
    'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
    'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
    'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
    '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
    ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
  }

  const encodeToMorse = (text: string): string => {
    return text.toUpperCase()
      .split('')
      .map(char => {
        if (char === ' ') return '/'
        return morseCodeMap[char] || ''
      })
      .filter(code => code !== '')
      .join(' ')
  }

  const decodeFromMorse = (morse: string): string => {
    const reverseMap: Record<string, string> = {}
    Object.entries(morseCodeMap).forEach(([char, code]) => {
      reverseMap[code] = char
    })

    return morse.split(' / ')
      .map(word => {
        return word.split(' ')
          .map(code => reverseMap[code] || '')
          .join('')
      })
      .join(' ')
  }

  describe('Morse Code Encoding', () => {
    test('should encode simple text', () => {
      const text = 'HELLO'
      const morse = encodeToMorse(text)
      expect(morse).toContain('....') // H
      expect(morse).toContain('.') // E
      expect(morse).toContain('.-..') // L
    })

    test('should encode text with spaces', () => {
      const text = 'HELLO WORLD'
      const morse = encodeToMorse(text)
      expect(morse).toContain('/')
    })

    test('should encode numbers', () => {
      const text = '123'
      const morse = encodeToMorse(text)
      expect(morse).toContain('.----') // 1
      expect(morse).toContain('..---') // 2
      expect(morse).toContain('...--') // 3
    })

    test('should handle special characters', () => {
      const text = 'HELLO!'
      const morse = encodeToMorse(text)
      expect(morse).toContain('-.-.--') // !
    })

    test('should convert to uppercase', () => {
      const text = 'hello'
      const morse = encodeToMorse(text)
      expect(morse).toContain('....') // H
    })
  })

  describe('Morse Code Decoding', () => {
    test('should decode simple morse code', () => {
      const morse = '.... . .-.. .-.. ---'
      const text = decodeFromMorse(morse)
      expect(text).toBe('HELLO')
    })

    test('should decode morse code with spaces', () => {
      const morse = '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'
      const text = decodeFromMorse(morse)
      expect(text).toBe('HELLO WORLD')
    })

    test('should decode numbers', () => {
      const morse = '.---- ..--- ...--'
      const text = decodeFromMorse(morse)
      expect(text).toBe('123')
    })

    test('should handle invalid morse code gracefully', () => {
      const morse = '.... . .-.. .-.. --- .---'
      const text = decodeFromMorse(morse)
      // Should decode valid parts
      expect(text).toContain('HELLO')
    })
  })

  describe('Round-trip Encoding/Decoding', () => {
    test('should encode and decode back to original', () => {
      const original = 'HELLO WORLD'
      const morse = encodeToMorse(original)
      const decoded = decodeFromMorse(morse)
      expect(decoded).toBe(original)
    })

    test('should handle numbers in round-trip', () => {
      const original = 'TEST 123'
      const morse = encodeToMorse(original)
      const decoded = decodeFromMorse(morse)
      expect(decoded).toBe(original)
    })
  })

  describe('Morse Code Formatting', () => {
    test('should use correct separators', () => {
      const text = 'HELLO WORLD'
      const morse = encodeToMorse(text)
      // Words should be separated by ' / '
      expect(morse).toContain('/')
    })

    test('should use spaces between letters', () => {
      const text = 'HELLO'
      const morse = encodeToMorse(text)
      // Letters should be separated by spaces
      expect(morse.split(' ').length).toBeGreaterThan(1)
    })
  })
})

