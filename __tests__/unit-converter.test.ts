/**
 * Unit Converter Tests
 * Tests for unit conversion (length, weight, volume, etc.)
 */

describe('Unit Converter', () => {
  describe('Length Conversion', () => {
    const lengthConversions: Record<string, number> = {
      'meter': 1,
      'kilometer': 1000,
      'centimeter': 0.01,
      'millimeter': 0.001,
      'inch': 0.0254,
      'foot': 0.3048,
      'yard': 0.9144,
      'mile': 1609.34
    }

    const convertLength = (value: number, from: string, to: string): number => {
      const fromMeters = value * lengthConversions[from]
      return fromMeters / lengthConversions[to]
    }

    test('should convert meters to kilometers', () => {
      expect(convertLength(1000, 'meter', 'kilometer')).toBe(1)
    })

    test('should convert kilometers to meters', () => {
      expect(convertLength(1, 'kilometer', 'meter')).toBe(1000)
    })

    test('should convert inches to centimeters', () => {
      expect(convertLength(1, 'inch', 'centimeter')).toBeCloseTo(2.54, 2)
    })

    test('should convert feet to meters', () => {
      expect(convertLength(1, 'foot', 'meter')).toBeCloseTo(0.3048, 4)
    })

    test('should convert miles to kilometers', () => {
      expect(convertLength(1, 'mile', 'kilometer')).toBeCloseTo(1.60934, 5)
    })
  })

  describe('Weight Conversion', () => {
    const weightConversions: Record<string, number> = {
      'kilogram': 1,
      'gram': 0.001,
      'pound': 0.453592,
      'ounce': 0.0283495,
      'ton': 1000
    }

    const convertWeight = (value: number, from: string, to: string): number => {
      const fromKilograms = value * weightConversions[from]
      return fromKilograms / weightConversions[to]
    }

    test('should convert kilograms to grams', () => {
      expect(convertWeight(1, 'kilogram', 'gram')).toBe(1000)
    })

    test('should convert pounds to kilograms', () => {
      expect(convertWeight(1, 'pound', 'kilogram')).toBeCloseTo(0.453592, 6)
    })

    test('should convert ounces to grams', () => {
      expect(convertWeight(1, 'ounce', 'gram')).toBeCloseTo(28.3495, 4)
    })
  })

  describe('Volume Conversion', () => {
    const volumeConversions: Record<string, number> = {
      'liter': 1,
      'milliliter': 0.001,
      'gallon': 3.78541,
      'quart': 0.946353,
      'pint': 0.473176,
      'cup': 0.236588,
      'fluid-ounce': 0.0295735
    }

    const convertVolume = (value: number, from: string, to: string): number => {
      const fromLiters = value * volumeConversions[from]
      return fromLiters / volumeConversions[to]
    }

    test('should convert liters to milliliters', () => {
      expect(convertVolume(1, 'liter', 'milliliter')).toBe(1000)
    })

    test('should convert gallons to liters', () => {
      expect(convertVolume(1, 'gallon', 'liter')).toBeCloseTo(3.78541, 5)
    })

    test('should convert cups to milliliters', () => {
      expect(convertVolume(1, 'cup', 'milliliter')).toBeCloseTo(236.588, 3)
    })
  })

  describe('Area Conversion', () => {
    const areaConversions: Record<string, number> = {
      'square-meter': 1,
      'square-kilometer': 1000000,
      'square-centimeter': 0.0001,
      'square-inch': 0.00064516,
      'square-foot': 0.092903,
      'acre': 4046.86,
      'hectare': 10000
    }

    const convertArea = (value: number, from: string, to: string): number => {
      const fromSquareMeters = value * areaConversions[from]
      return fromSquareMeters / areaConversions[to]
    }

    test('should convert square meters to square feet', () => {
      expect(convertArea(1, 'square-meter', 'square-foot')).toBeCloseTo(10.764, 3)
    })

    test('should convert acres to hectares', () => {
      expect(convertArea(1, 'acre', 'hectare')).toBeCloseTo(0.404686, 6)
    })
  })

  describe('Time Conversion', () => {
    const timeConversions: Record<string, number> = {
      'second': 1,
      'minute': 60,
      'hour': 3600,
      'day': 86400,
      'week': 604800,
      'month': 2592000, // 30 days
      'year': 31536000 // 365 days
    }

    const convertTime = (value: number, from: string, to: string): number => {
      const fromSeconds = value * timeConversions[from]
      return fromSeconds / timeConversions[to]
    }

    test('should convert minutes to seconds', () => {
      expect(convertTime(1, 'minute', 'second')).toBe(60)
    })

    test('should convert hours to minutes', () => {
      expect(convertTime(1, 'hour', 'minute')).toBe(60)
    })

    test('should convert days to hours', () => {
      expect(convertTime(1, 'day', 'hour')).toBe(24)
    })

    test('should convert weeks to days', () => {
      expect(convertTime(1, 'week', 'day')).toBe(7)
    })
  })
})


