/**
 * Number Base Converter Tests
 * Tests for converting numbers between different bases (binary, octal, decimal, hex)
 */

describe('Number Base Converter', () => {
  const decimalToBase = (num: number, base: number): string => {
    if (num === 0) return '0'
    const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let result = ''
    while (num > 0) {
      result = digits[num % base] + result
      num = Math.floor(num / base)
    }
    return result
  }

  const baseToDecimal = (num: string, base: number): number => {
    return parseInt(num, base)
  }

  describe('Decimal to Binary', () => {
    test('should convert 0 to binary', () => {
      expect(decimalToBase(0, 2)).toBe('0')
    })

    test('should convert 1 to binary', () => {
      expect(decimalToBase(1, 2)).toBe('1')
    })

    test('should convert 2 to binary', () => {
      expect(decimalToBase(2, 2)).toBe('10')
    })

    test('should convert 10 to binary', () => {
      expect(decimalToBase(10, 2)).toBe('1010')
    })

    test('should convert 255 to binary', () => {
      expect(decimalToBase(255, 2)).toBe('11111111')
    })
  })

  describe('Binary to Decimal', () => {
    test('should convert 0 to decimal', () => {
      expect(baseToDecimal('0', 2)).toBe(0)
    })

    test('should convert 1 to decimal', () => {
      expect(baseToDecimal('1', 2)).toBe(1)
    })

    test('should convert 1010 to decimal', () => {
      expect(baseToDecimal('1010', 2)).toBe(10)
    })

    test('should convert 11111111 to decimal', () => {
      expect(baseToDecimal('11111111', 2)).toBe(255)
    })
  })

  describe('Decimal to Octal', () => {
    test('should convert 0 to octal', () => {
      expect(decimalToBase(0, 8)).toBe('0')
    })

    test('should convert 8 to octal', () => {
      expect(decimalToBase(8, 8)).toBe('10')
    })

    test('should convert 64 to octal', () => {
      expect(decimalToBase(64, 8)).toBe('100')
    })

    test('should convert 255 to octal', () => {
      expect(decimalToBase(255, 8)).toBe('377')
    })
  })

  describe('Octal to Decimal', () => {
    test('should convert 0 to decimal', () => {
      expect(baseToDecimal('0', 8)).toBe(0)
    })

    test('should convert 10 to decimal', () => {
      expect(baseToDecimal('10', 8)).toBe(8)
    })

    test('should convert 377 to decimal', () => {
      expect(baseToDecimal('377', 8)).toBe(255)
    })
  })

  describe('Decimal to Hexadecimal', () => {
    test('should convert 0 to hex', () => {
      expect(decimalToBase(0, 16)).toBe('0')
    })

    test('should convert 10 to hex', () => {
      expect(decimalToBase(10, 16)).toBe('A')
    })

    test('should convert 15 to hex', () => {
      expect(decimalToBase(15, 16)).toBe('F')
    })

    test('should convert 255 to hex', () => {
      expect(decimalToBase(255, 16)).toBe('FF')
    })

    test('should convert 4095 to hex', () => {
      expect(decimalToBase(4095, 16)).toBe('FFF')
    })
  })

  describe('Hexadecimal to Decimal', () => {
    test('should convert 0 to decimal', () => {
      expect(baseToDecimal('0', 16)).toBe(0)
    })

    test('should convert A to decimal', () => {
      expect(baseToDecimal('A', 16)).toBe(10)
    })

    test('should convert FF to decimal', () => {
      expect(baseToDecimal('FF', 16)).toBe(255)
    })

    test('should handle lowercase hex', () => {
      expect(baseToDecimal('ff', 16)).toBe(255)
    })
  })

  describe('Round-trip Conversion', () => {
    test('should convert decimal to binary and back', () => {
      const decimal = 42
      const binary = decimalToBase(decimal, 2)
      const backToDecimal = baseToDecimal(binary, 2)
      expect(backToDecimal).toBe(decimal)
    })

    test('should convert decimal to octal and back', () => {
      const decimal = 100
      const octal = decimalToBase(decimal, 8)
      const backToDecimal = baseToDecimal(octal, 8)
      expect(backToDecimal).toBe(decimal)
    })

    test('should convert decimal to hex and back', () => {
      const decimal = 255
      const hex = decimalToBase(decimal, 16)
      const backToDecimal = baseToDecimal(hex, 16)
      expect(backToDecimal).toBe(decimal)
    })
  })

  describe('Cross-base Conversion', () => {
    test('should convert binary to hex via decimal', () => {
      const binary = '11111111'
      const decimal = baseToDecimal(binary, 2)
      const hex = decimalToBase(decimal, 16)
      expect(hex).toBe('FF')
    })

    test('should convert octal to binary via decimal', () => {
      const octal = '377'
      const decimal = baseToDecimal(octal, 8)
      const binary = decimalToBase(decimal, 2)
      expect(binary).toBe('11111111')
    })
  })
})

