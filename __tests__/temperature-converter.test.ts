/**
 * Temperature Converter Tests
 * Tests for temperature conversion between Celsius, Fahrenheit, and Kelvin
 */

describe('Temperature Converter', () => {
  const celsiusToFahrenheit = (c: number): number => {
    return (c * 9/5) + 32
  }

  const fahrenheitToCelsius = (f: number): number => {
    return (f - 32) * 5/9
  }

  const celsiusToKelvin = (c: number): number => {
    return c + 273.15
  }

  const kelvinToCelsius = (k: number): number => {
    return k - 273.15
  }

  const fahrenheitToKelvin = (f: number): number => {
    return celsiusToKelvin(fahrenheitToCelsius(f))
  }

  const kelvinToFahrenheit = (k: number): number => {
    return celsiusToFahrenheit(kelvinToCelsius(k))
  }

  describe('Celsius to Fahrenheit', () => {
    test('should convert 0°C to 32°F', () => {
      expect(celsiusToFahrenheit(0)).toBe(32)
    })

    test('should convert 100°C to 212°F', () => {
      expect(celsiusToFahrenheit(100)).toBe(212)
    })

    test('should convert -40°C to -40°F', () => {
      expect(celsiusToFahrenheit(-40)).toBeCloseTo(-40, 1)
    })

    test('should convert 37°C (body temperature) to 98.6°F', () => {
      expect(celsiusToFahrenheit(37)).toBeCloseTo(98.6, 1)
    })
  })

  describe('Fahrenheit to Celsius', () => {
    test('should convert 32°F to 0°C', () => {
      expect(fahrenheitToCelsius(32)).toBe(0)
    })

    test('should convert 212°F to 100°C', () => {
      expect(fahrenheitToCelsius(212)).toBe(100)
    })

    test('should convert -40°F to -40°C', () => {
      expect(fahrenheitToCelsius(-40)).toBeCloseTo(-40, 1)
    })

    test('should convert 98.6°F to 37°C', () => {
      expect(fahrenheitToCelsius(98.6)).toBeCloseTo(37, 1)
    })
  })

  describe('Celsius to Kelvin', () => {
    test('should convert 0°C to 273.15K', () => {
      expect(celsiusToKelvin(0)).toBe(273.15)
    })

    test('should convert 100°C to 373.15K', () => {
      expect(celsiusToKelvin(100)).toBe(373.15)
    })

    test('should convert -273.15°C to 0K (absolute zero)', () => {
      expect(celsiusToKelvin(-273.15)).toBe(0)
    })
  })

  describe('Kelvin to Celsius', () => {
    test('should convert 273.15K to 0°C', () => {
      expect(kelvinToCelsius(273.15)).toBe(0)
    })

    test('should convert 373.15K to 100°C', () => {
      expect(kelvinToCelsius(373.15)).toBe(100)
    })

    test('should convert 0K to -273.15°C (absolute zero)', () => {
      expect(kelvinToCelsius(0)).toBe(-273.15)
    })
  })

  describe('Fahrenheit to Kelvin', () => {
    test('should convert 32°F to 273.15K', () => {
      expect(fahrenheitToKelvin(32)).toBeCloseTo(273.15, 1)
    })

    test('should convert 212°F to 373.15K', () => {
      expect(fahrenheitToKelvin(212)).toBeCloseTo(373.15, 1)
    })
  })

  describe('Kelvin to Fahrenheit', () => {
    test('should convert 273.15K to 32°F', () => {
      expect(kelvinToFahrenheit(273.15)).toBeCloseTo(32, 1)
    })

    test('should convert 373.15K to 212°F', () => {
      expect(kelvinToFahrenheit(373.15)).toBeCloseTo(212, 1)
    })
  })

  describe('Round-trip Conversion', () => {
    test('should convert Celsius to Fahrenheit and back', () => {
      const celsius = 25
      const fahrenheit = celsiusToFahrenheit(celsius)
      const backToCelsius = fahrenheitToCelsius(fahrenheit)
      expect(backToCelsius).toBeCloseTo(celsius, 1)
    })

    test('should convert Celsius to Kelvin and back', () => {
      const celsius = 25
      const kelvin = celsiusToKelvin(celsius)
      const backToCelsius = kelvinToCelsius(kelvin)
      expect(backToCelsius).toBeCloseTo(celsius, 1)
    })

    test('should convert Fahrenheit to Kelvin and back', () => {
      const fahrenheit = 77
      const kelvin = fahrenheitToKelvin(fahrenheit)
      const backToFahrenheit = kelvinToFahrenheit(kelvin)
      expect(backToFahrenheit).toBeCloseTo(fahrenheit, 1)
    })
  })
})

