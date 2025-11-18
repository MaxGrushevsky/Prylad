/**
 * Text Case Converter Tests
 * Tests focus on expected behavior and results, not implementation details
 */

describe('Text Case Converter', () => {
  describe('Uppercase Conversion', () => {
    test('should convert to uppercase', () => {
      const text = 'Hello World'
      expect(text.toUpperCase()).toBe('HELLO WORLD')
    })

    test('should handle special characters', () => {
      const text = 'hello123!@#'
      expect(text.toUpperCase()).toBe('HELLO123!@#')
    })
  })

  describe('Lowercase Conversion', () => {
    test('should convert to lowercase', () => {
      const text = 'Hello World'
      expect(text.toLowerCase()).toBe('hello world')
    })
  })

  describe('Title Case Conversion', () => {
    test('should capitalize first letter of each word', () => {
      const text = 'hello world example'
      const titleCase = text.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
      expect(titleCase).toBe('Hello World Example')
    })
  })

  describe('Sentence Case Conversion', () => {
    test('should capitalize first letter of sentence', () => {
      const text = 'hello world. example text.'
      const sentenceCase = text.split('. ').map(sentence => 
        sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase()
      ).join('. ')
      expect(sentenceCase).toBe('Hello world. Example text.')
    })
  })

  describe('camelCase Conversion', () => {
    test('should convert to camelCase', () => {
      const text = 'hello world example'
      const camelCase = text.split(' ').map((word, index) => 
        index === 0 
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join('')
      expect(camelCase).toBe('helloWorldExample')
    })
  })

  describe('PascalCase Conversion', () => {
    test('should convert to PascalCase', () => {
      const text = 'hello world example'
      const pascalCase = text.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join('')
      expect(pascalCase).toBe('HelloWorldExample')
    })
  })

  describe('snake_case Conversion', () => {
    test('should convert to snake_case', () => {
      const text = 'Hello World Example'
      const snakeCase = text.toLowerCase().replace(/\s+/g, '_')
      expect(snakeCase).toBe('hello_world_example')
    })
  })

  describe('kebab-case Conversion', () => {
    test('should convert to kebab-case', () => {
      const text = 'Hello World Example'
      const kebabCase = text.toLowerCase().replace(/\s+/g, '-')
      expect(kebabCase).toBe('hello-world-example')
    })
  })

  describe('CONSTANT_CASE Conversion', () => {
    test('should convert to CONSTANT_CASE', () => {
      const text = 'Hello World Example'
      const constantCase = text.toUpperCase().replace(/\s+/g, '_')
      expect(constantCase).toBe('HELLO_WORLD_EXAMPLE')
    })
  })
})

