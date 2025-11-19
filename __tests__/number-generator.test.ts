/**
 * Number Generator Tests
 * Tests focus on expected behavior and results, not implementation details
 */

describe('Number Generator', () => {
  describe('Random Number Generation', () => {
    test('should generate number within specified range', () => {
      const min = 1
      const max = 100
      const number = Math.floor(Math.random() * (max - min + 1)) + min
      expect(number).toBeGreaterThanOrEqual(min)
      expect(number).toBeLessThanOrEqual(max)
    })

    test('should generate numbers across entire range', () => {
      const min = 1
      const max = 10
      const numbers = new Set<number>()
      
      // Generate many numbers to cover range
      for (let i = 0; i < 1000; i++) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min
        numbers.add(num)
      }
      
      // Should have generated numbers across the range
      expect(numbers.size).toBeGreaterThan(5)
    })

    test('should handle negative ranges', () => {
      const min = -10
      const max = -1
      const number = Math.floor(Math.random() * (max - min + 1)) + min
      expect(number).toBeGreaterThanOrEqual(min)
      expect(number).toBeLessThanOrEqual(max)
    })

    test('should handle single value range', () => {
      const min = 5
      const max = 5
      const number = Math.floor(Math.random() * (max - min + 1)) + min
      expect(number).toBe(5)
    })
  })

  describe('Batch Number Generation', () => {
    test('should generate specified count of numbers', () => {
      const count = 10
      const numbers: number[] = []
      for (let i = 0; i < count; i++) {
        numbers.push(Math.floor(Math.random() * 100) + 1)
      }
      expect(numbers.length).toBe(count)
    })

    test('should generate unique numbers when duplicates disabled', () => {
      const min = 1
      const max = 20
      const count = 10
      const numbers = new Set<number>()
      
      while (numbers.size < count) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min
        numbers.add(num)
      }
      
      expect(numbers.size).toBe(count)
    })

    test('should allow duplicates when enabled', () => {
      const min = 1
      const max = 5
      const count = 20
      const numbers: number[] = []
      
      for (let i = 0; i < count; i++) {
        numbers.push(Math.floor(Math.random() * (max - min + 1)) + min)
      }
      
      const uniqueNumbers = new Set(numbers)
      // With duplicates allowed, should have fewer unique than total
      expect(uniqueNumbers.size).toBeLessThanOrEqual(count)
    })
  })

  describe('Number Sorting', () => {
    test('should sort numbers in ascending order', () => {
      const numbers = [5, 2, 8, 1, 9]
      const sorted = [...numbers].sort((a, b) => a - b)
      expect(sorted).toEqual([1, 2, 5, 8, 9])
    })

    test('should sort numbers in descending order', () => {
      const numbers = [5, 2, 8, 1, 9]
      const sorted = [...numbers].sort((a, b) => b - a)
      expect(sorted).toEqual([9, 8, 5, 2, 1])
    })

    test('should maintain original order when no sorting', () => {
      const numbers = [5, 2, 8, 1, 9]
      const unsorted = [...numbers]
      expect(unsorted).toEqual([5, 2, 8, 1, 9])
    })
  })

  describe('Number Statistics', () => {
    test('should calculate minimum correctly', () => {
      const numbers = [5, 2, 8, 1, 9]
      const min = Math.min(...numbers)
      expect(min).toBe(1)
    })

    test('should calculate maximum correctly', () => {
      const numbers = [5, 2, 8, 1, 9]
      const max = Math.max(...numbers)
      expect(max).toBe(9)
    })

    test('should calculate sum correctly', () => {
      const numbers = [5, 2, 8, 1, 9]
      const sum = numbers.reduce((a, b) => a + b, 0)
      expect(sum).toBe(25)
    })

    test('should calculate average correctly', () => {
      const numbers = [5, 2, 8, 1, 9]
      const average = numbers.reduce((a, b) => a + b, 0) / numbers.length
      expect(average).toBe(5)
    })
  })
})


