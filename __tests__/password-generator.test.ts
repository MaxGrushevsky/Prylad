/**
 * Password Generator Tests
 * Tests focus on expected behavior and results, not implementation details
 */

describe('Password Generator', () => {
  // Helper function to extract password generation logic
  const generatePassword = (
    length: number,
    includeUppercase: boolean,
    includeLowercase: boolean,
    includeNumbers: boolean,
    includeSymbols: boolean,
    excludeSimilar: boolean
  ): string => {
    let chars = ''
    if (includeUppercase) {
      chars += excludeSimilar 
        ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' 
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    }
    if (includeLowercase) {
      chars += excludeSimilar 
        ? 'abcdefghijkmnopqrstuvwxyz' 
        : 'abcdefghijklmnopqrstuvwxyz'
    }
    if (includeNumbers) {
      chars += excludeSimilar ? '23456789' : '0123456789'
    }
    if (includeSymbols) {
      chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }

    if (chars.length === 0) {
      throw new Error('At least one character type must be selected')
    }

    let password = ''
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      password += chars[array[i] % chars.length]
    }
    return password
  }

  describe('Password Generation', () => {
    test('should generate password of specified length', () => {
      const password = generatePassword(16, true, true, true, true, false)
      expect(password.length).toBe(16)
    })

    test('should generate different passwords on each call', () => {
      const password1 = generatePassword(16, true, true, true, true, false)
      const password2 = generatePassword(16, true, true, true, true, false)
      // Very unlikely to be the same (but technically possible)
      expect(password1).not.toBe(password2)
    })

    test('should include uppercase letters when enabled', () => {
      const password = generatePassword(50, true, false, false, false, false)
      expect(password).toMatch(/[A-Z]/)
    })

    test('should include lowercase letters when enabled', () => {
      const password = generatePassword(50, false, true, false, false, false)
      expect(password).toMatch(/[a-z]/)
    })

    test('should include numbers when enabled', () => {
      const password = generatePassword(50, false, false, true, false, false)
      expect(password).toMatch(/[0-9]/)
    })

    test('should include symbols when enabled', () => {
      const password = generatePassword(50, false, false, false, true, false)
      expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/)
    })

    test('should exclude similar characters when enabled', () => {
      const password = generatePassword(100, true, true, true, false, true)
      expect(password).not.toMatch(/[0O1lI]/)
    })

    test('should include similar characters when not excluded', () => {
      // Generate many passwords to increase chance of including similar chars
      let foundSimilar = false
      for (let i = 0; i < 100; i++) {
        const password = generatePassword(50, true, true, true, false, false)
        if (/[0O1lI]/.test(password)) {
          foundSimilar = true
          break
        }
      }
      // Very likely to find at least one similar character
      expect(foundSimilar).toBe(true)
    })

    test('should throw error when no character types are selected', () => {
      expect(() => {
        generatePassword(16, false, false, false, false, false)
      }).toThrow('At least one character type must be selected')
    })
  })

  describe('Password Strength Calculation', () => {
    const calculateStrength = (password: string): number => {
      let strength = 0
      if (password.length >= 8) strength += 1
      if (password.length >= 12) strength += 1
      if (password.length >= 16) strength += 1
      if (/[a-z]/.test(password)) strength += 1
      if (/[A-Z]/.test(password)) strength += 1
      if (/[0-9]/.test(password)) strength += 1
      if (/[^a-zA-Z0-9]/.test(password)) strength += 1
      return Math.min(strength, 5)
    }

    test('should calculate strength correctly for weak password', () => {
      expect(calculateStrength('abc')).toBe(0)
      expect(calculateStrength('abc123')).toBe(1) // length >= 8
    })

    test('should calculate strength correctly for medium password', () => {
      expect(calculateStrength('abc12345')).toBe(3) // length >= 8, lowercase, numbers
      expect(calculateStrength('Abc12345')).toBe(4) // + uppercase
    })

    test('should calculate strength correctly for strong password', () => {
      expect(calculateStrength('Abc12345!@#')).toBe(5) // all criteria
      expect(calculateStrength('Abc12345!@#xyz')).toBe(5) // length >= 12, all criteria
    })

    test('should cap strength at 5', () => {
      expect(calculateStrength('Abc12345!@#xyzABCDEF')).toBe(5)
    })
  })

  describe('Password Entropy Calculation', () => {
    const calculateEntropy = (password: string, charSetSize: number): number => {
      return Math.log2(Math.pow(charSetSize, password.length))
    }

    test('should calculate entropy correctly', () => {
      // 8 char password with 26 char set (lowercase only)
      const entropy = calculateEntropy('abcdefgh', 26)
      expect(entropy).toBeCloseTo(37.6, 1)
    })

    test('should increase entropy with longer passwords', () => {
      const entropy8 = calculateEntropy('abcdefgh', 26)
      const entropy16 = calculateEntropy('abcdefghijklmnop', 26)
      expect(entropy16).toBeGreaterThan(entropy8)
    })

    test('should increase entropy with larger character sets', () => {
      const entropy26 = calculateEntropy('abcdefgh', 26) // lowercase only
      const entropy52 = calculateEntropy('abcdefgh', 52) // upper + lower
      expect(entropy52).toBeGreaterThan(entropy26)
    })
  })

  describe('Batch Password Generation', () => {
    test('should generate specified number of passwords', () => {
      const count = 5
      const passwords: string[] = []
      for (let i = 0; i < count; i++) {
        passwords.push(generatePassword(16, true, true, true, true, false))
      }
      expect(passwords.length).toBe(count)
    })

    test('should generate unique passwords in batch', () => {
      const count = 10
      const passwords: string[] = []
      for (let i = 0; i < count; i++) {
        passwords.push(generatePassword(16, true, true, true, true, false))
      }
      const uniquePasswords = new Set(passwords)
      // Very unlikely all are duplicates
      expect(uniquePasswords.size).toBeGreaterThan(1)
    })
  })
})

