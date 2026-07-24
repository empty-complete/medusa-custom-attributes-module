import { describe, it, expect } from '@jest/globals'

// Root entry point tests - the README documents importing CUSTOM_ATTRIBUTE_MODULE
// from the package root, so src/index.ts must re-export the module pieces
describe('Package root entry point', () => {
  it('should export CUSTOM_ATTRIBUTE_MODULE', () => {
    expect(() => require('../index')).not.toThrow()
    // @ts-ignore - dynamic import for testing
    const rootExports = require('../index')
    expect(rootExports.CUSTOM_ATTRIBUTE_MODULE).toBe('customAttributeModule')
  })
})
