/**
 * Text Utilities Tests
 * Tests for text manipulation utilities (reverser, cleaner, etc.)
 */

describe('Text Utilities', () => {
  describe('Text Reverser', () => {
    const reverseText = (text: string, mode: 'all' | 'words' | 'lines' | 'characters'): string => {
      switch (mode) {
        case 'all':
          return text.split('').reverse().join('')
        case 'words':
          return text.split(' ').reverse().join(' ')
        case 'lines':
          return text.split('\n').reverse().join('\n')
        case 'characters':
          return text.split('').reverse().join('')
        default:
          return text
      }
    }

    test('should reverse all characters', () => {
      expect(reverseText('Hello', 'all')).toBe('olleH')
    })

    test('should reverse words', () => {
      expect(reverseText('Hello World', 'words')).toBe('World Hello')
    })

    test('should reverse lines', () => {
      expect(reverseText('Line 1\nLine 2\nLine 3', 'lines')).toBe('Line 3\nLine 2\nLine 1')
    })

    test('should reverse characters in each word', () => {
      expect(reverseText('Hello World', 'characters')).toBe('olleH dlroW')
    })

    test('should handle empty string', () => {
      expect(reverseText('', 'all')).toBe('')
    })

    test('should handle single word', () => {
      expect(reverseText('Hello', 'words')).toBe('Hello')
    })
  })

  describe('Text Cleaner', () => {
    const cleanText = (text: string, type: string): string => {
      switch (type) {
        case 'spaces':
          return text.replace(/\s+/g, ' ').trim()
        case 'allSpaces':
          return text.replace(/\s/g, '')
        case 'duplicates':
          return text.split(' ').filter((word, index, arr) => arr.indexOf(word) === index).join(' ')
        case 'emptyLines':
          return text.split('\n').filter(line => line.trim() !== '').join('\n')
        case 'trim':
          return text.trim()
        case 'specialChars':
          return text.replace(/[^a-zA-Z0-9\s]/g, '')
        case 'numbers':
          return text.replace(/\d/g, '')
        case 'letters':
          return text.replace(/[a-zA-Z]/g, '')
        case 'all':
          return text.replace(/[^a-zA-Z0-9]/g, '').replace(/\s+/g, ' ').trim()
        default:
          return text
      }
    }

    test('should remove extra spaces', () => {
      expect(cleanText('Hello    World', 'spaces')).toBe('Hello World')
    })

    test('should remove all spaces', () => {
      expect(cleanText('Hello World', 'allSpaces')).toBe('HelloWorld')
    })

    test('should remove duplicate words', () => {
      expect(cleanText('hello hello world', 'duplicates')).toBe('hello world')
    })

    test('should remove empty lines', () => {
      expect(cleanText('Line 1\n\nLine 2\n\nLine 3', 'emptyLines')).toBe('Line 1\nLine 2\nLine 3')
    })

    test('should trim whitespace', () => {
      expect(cleanText('  Hello World  ', 'trim')).toBe('Hello World')
    })

    test('should remove special characters', () => {
      expect(cleanText('Hello!@# World$%^', 'specialChars')).toBe('Hello World')
    })

    test('should remove numbers', () => {
      expect(cleanText('Hello123 World456', 'numbers')).toBe('Hello World')
    })

    test('should remove letters', () => {
      expect(cleanText('Hello123 World456', 'letters')).toBe('123 456')
    })

    test('should clean all (remove special chars and extra spaces)', () => {
      expect(cleanText('  Hello!@#   World$%^  ', 'all')).toBe('Hello World')
    })
  })

  describe('Text Statistics', () => {
    const getTextStats = (text: string) => {
      return {
        characters: text.length,
        charactersNoSpaces: text.replace(/\s/g, '').length,
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        lines: text.split('\n').length,
        paragraphs: text.split(/\n\s*\n/).filter(p => p.trim()).length
      }
    }

    test('should count characters', () => {
      const stats = getTextStats('Hello World')
      expect(stats.characters).toBe(11)
    })

    test('should count characters without spaces', () => {
      const stats = getTextStats('Hello World')
      expect(stats.charactersNoSpaces).toBe(10)
    })

    test('should count words', () => {
      const stats = getTextStats('Hello World Test')
      expect(stats.words).toBe(3)
    })

    test('should count lines', () => {
      const stats = getTextStats('Line 1\nLine 2\nLine 3')
      expect(stats.lines).toBe(3)
    })

    test('should count paragraphs', () => {
      const stats = getTextStats('Para 1\n\nPara 2\n\nPara 3')
      expect(stats.paragraphs).toBe(3)
    })

    test('should handle empty text', () => {
      const stats = getTextStats('')
      expect(stats.characters).toBe(0)
      expect(stats.words).toBe(0)
    })
  })
})

