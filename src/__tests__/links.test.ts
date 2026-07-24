import { describe, it, expect } from '@jest/globals'

// The global setup.ts mock replaces model/Module with stubs; the link
// definition needs the real DML linkables, so use the actual implementation
jest.unmock('@medusajs/framework/utils')

// defineLink registers through global.MedusaModule, which the Medusa runtime
// initializes by loading the modules SDK before any link file
import '@medusajs/modules-sdk'

// Read-only defineLink returns undefined by design; it registers the link via
// MedusaModule.setCustomLink, so assertions go through getCustomLinks
describe('Link Definitions', () => {
  describe('product-custom-attribute link', () => {
    it('registers a read-only list link from product to product_custom_attribute', () => {
      const { MedusaModule } = require('@medusajs/modules-sdk')
      const before = MedusaModule.getCustomLinks().length

      expect(() => require('../links/product-custom-attribute')).not.toThrow()

      const links = MedusaModule.getCustomLinks()
      expect(links.length).toBe(before + 1)

      const register = links[links.length - 1]
      const definition = register([
        { serviceName: 'product' },
        { serviceName: 'customAttributeModule' },
      ])

      expect(definition.isReadOnlyLink).toBe(true)
      const rel = definition.extends[0]
      expect(rel.serviceName).toBe('product')
      expect(rel.relationship.serviceName).toBe('customAttributeModule')
      expect(rel.relationship.primaryKey).toBe('product_id')
      expect(rel.relationship.foreignKey).toBe('id')
      expect(rel.relationship.isList).toBe(true)
    })

    it('exposes both singular and pluralized aliases on product', () => {
      const { MedusaModule } = require('@medusajs/modules-sdk')
      require('../links/product-custom-attribute')

      const links = MedusaModule.getCustomLinks()
      const register = links[links.length - 1]
      const definition = register([
        { serviceName: 'product' },
        { serviceName: 'customAttributeModule' },
      ])

      const aliases = definition.extends.map(
        (e: { relationship: { alias: string } }) => e.relationship.alias
      )
      expect(aliases).toContain('product_custom_attribute')
      expect(aliases).toContain('product_custom_attributes')
    })
  })
})
