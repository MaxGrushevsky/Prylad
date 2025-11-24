/**
 * Roman Numerals Tests
 * Tests for Roman numeral conversion
 */

describe('Roman Numerals', () => {
  const numberToRoman = (num: number): string => {
    if (num <= 0 || num > 3999) return ''
    
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
    
    let result = ''
    for (let i = 0; i < values.length; i++) {
      while (num >= values[i]) {
        result += symbols[i]
        num -= values[i]
      }
    }
    return result
  }

  const romanToNumber = (roman: string): number => {
    const romanMap: Record<string, number> = {
      'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000
    }
    
    let result = 0
    for (let i = 0; i < roman.length; i++) {
      const current = romanMap[roman[i]]
      const next = romanMap[roman[i + 1]]
      
      if (next && current < next) {
        result += next - current
        i++
      } else {
        result += current
      }
    }
    return result
  }

  describe('Number to Roman', () => {
    test('should convert 1 to I', () => {
      expect(numberToRoman(1)).toBe('I')
    })

    test('should convert 5 to V', () => {
      expect(numberToRoman(5)).toBe('V')
    })

    test('should convert 10 to X', () => {
      expect(numberToRoman(10)).toBe('X')
    })

    test('should convert 50 to L', () => {
      expect(numberToRoman(50)).toBe('L')
    })

    test('should convert 100 to C', () => {
      expect(numberToRoman(100)).toBe('C')
    })

    test('should convert 500 to D', () => {
      expect(numberToRoman(500)).toBe('D')
    })

    test('should convert 1000 to M', () => {
      expect(numberToRoman(1000)).toBe('M')
    })

    test('should convert 4 to IV', () => {
      expect(numberToRoman(4)).toBe('IV')
    })

    test('should convert 9 to IX', () => {
      expect(numberToRoman(9)).toBe('IX')
    })

    test('should convert 40 to XL', () => {
      expect(numberToRoman(40)).toBe('XL')
    })

    test('should convert 90 to XC', () => {
      expect(numberToRoman(90)).toBe('XC')
    })

    test('should convert 400 to CD', () => {
      expect(numberToRoman(400)).toBe('CD')
    })

    test('should convert 900 to CM', () => {
      expect(numberToRoman(900)).toBe('CM')
    })

    test('should convert complex numbers', () => {
      expect(numberToRoman(1994)).toBe('MCMXCIV')
      expect(numberToRoman(2024)).toBe('MMXXIV')
      expect(numberToRoman(3999)).toBe('MMMCMXCIX')
    })

    test('should return empty string for invalid numbers', () => {
      expect(numberToRoman(0)).toBe('')
      expect(numberToRoman(-1)).toBe('')
      expect(numberToRoman(4000)).toBe('')
    })
  })

  describe('Roman to Number', () => {
    test('should convert I to 1', () => {
      expect(romanToNumber('I')).toBe(1)
    })

    test('should convert V to 5', () => {
      expect(romanToNumber('V')).toBe(5)
    })

    test('should convert X to 10', () => {
      expect(romanToNumber('X')).toBe(10)
    })

    test('should convert IV to 4', () => {
      expect(romanToNumber('IV')).toBe(4)
    })

    test('should convert IX to 9', () => {
      expect(romanToNumber('IX')).toBe(9)
    })

    test('should convert XL to 40', () => {
      expect(romanToNumber('XL')).toBe(40)
    })

    test('should convert XC to 90', () => {
      expect(romanToNumber('XC')).toBe(90)
    })

    test('should convert CD to 400', () => {
      expect(romanToNumber('CD')).toBe(400)
    })

    test('should convert CM to 900', () => {
      expect(romanToNumber('CM')).toBe(900)
    })

    test('should convert complex roman numerals', () => {
      expect(romanToNumber('MCMXCIV')).toBe(1994)
      expect(romanToNumber('MMXXIV')).toBe(2024)
      expect(romanToNumber('MMMCMXCIX')).toBe(3999)
    })

    test('should handle lowercase input', () => {
      expect(romanToNumber('iv')).toBe(4)
      expect(romanToNumber('ix')).toBe(9)
    })
  })

  describe('Round-trip Conversion', () => {
    test('should convert number to roman and back', () => {
      const numbers = [1, 5, 10, 50, 100, 500, 1000, 4, 9, 40, 90, 400, 900, 1994, 2024]
      numbers.forEach(num => {
        const roman = numberToRoman(num)
        const backToNumber = romanToNumber(roman)
        expect(backToNumber).toBe(num)
      })
    })
  })
})

