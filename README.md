<div align="center">
  <img src="https://raw.githubusercontent.com/empty-complete/medusa-product-attributes/main/assets/logo_medusa-custom-attributes.png" alt="logo medusa product attributes module repo" width="120">
  <h1>Product Attributes Module for Medusa v2</h1>
  <p><i>Extend your store's capabilities with a flexible attribute system for products and categories</i></p>
  
  <p>
    <a href="https://github.com/empty-complete/medusa-product-attributes/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/empty-complete/medusa-product-attributes" alt="License">
    </a>
    <a href="https://www.npmjs.com/package/@empty-complete/medusa-product-attributes">
      <img src="https://img.shields.io/npm/v/@empty-complete/medusa-product-attributes" alt="npm version">
    </a>
    <a href="https://github.com/empty-complete/medusa-product-attributes/actions/workflows/ci.yml">
      <img src="https://github.com/empty-complete/medusa-product-attributes/actions/workflows/ci.yml/badge.svg" alt="CI Status">
    </a>
    <a href="https://github.com/empty-complete/medusa-product-attributes/commits/main">
      <img src="https://img.shields.io/github/commit-activity/m/empty-complete/medusa-product-attributes" alt="GitHub commit activity">
    </a>
    <a href="https://www.npmjs.com/package/@empty-complete/medusa-product-attributes">
      <img src="https://img.shields.io/npm/dm/@empty-complete/medusa-product-attributes" alt="npm downloads">
    </a>
  </p>
  
  <p>
    <a href="https://medusajs.com/">
      <img src="https://img.shields.io/badge/Medusa-v2-000000" alt="Medusa v2">
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6" alt="TypeScript">
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/badge/Node.js-%3E=20-339933" alt="Node.js">
    </a>
  </p>
  
  <p>
    <a href="https://t.me/kinesis_lab">
      <img src="https://img.shields.io/badge/Telegram-follow-229ED9?logo=telegram" alt="Telegram">
    </a>
  </p>
</div>

---

## ✨ Features

| Feature | Description |
|---------|----------|
| 📝 **Text Attributes** | Arbitrary text values for products |
| 🔢 **Numeric Attributes** | Numbers with support for units (kg, m, pcs) |
| 📎 **File Attributes** | File uploads: certificates, 3D models, manuals |
| 🏷️ **Standard Keys** | Pre-defined attributes: `certificates`, `3dmodel`, `manual` |
| 📂 **Category Templates** | Attribute inheritance from category to products |
| 🗑️ **Soft Delete** | Safe deletion with recovery capability |

---

### Requirements

| Dependency | Version |
|------------|---------|
| Medusa | ^2.0.0 |
| Node.js | >=20 |
| TypeScript | ^5.0.0 |

---

## 🚀 Quick Start

### 📦 Installation

```bash
# Via npm
npm install @empty-complete/medusa-product-attributes

# Via pnpm
pnpm add @empty-complete/medusa-product-attributes

# Via yarn
yarn add @empty-complete/medusa-product-attributes

# Via GitHub Packages (requires authentication)
npm install @empty-complete/medusa-product-attributes --registry=https://npm.pkg.github.com
```

### 1. Add the module to configuration

```typescript
// medusa-config.ts
import { defineConfig } from '@medusajs/framework/utils'

export default defineConfig({
  modules: [
    {
      resolve: '@empty-complete/medusa-product-attributes',
    },
  ],
})
```

### 2. Run migrations

```bash
pnpm medusa db:migrate
```

### 3. Done!

The module will automatically create the necessary tables and register services.

---

## 💡 Usage

### Creating a category attribute

```typescript
import { CUSTOM_ATTRIBUTE_MODULE } from '@empty-complete/medusa-product-attributes'

const module = container.resolve(CUSTOM_ATTRIBUTE_MODULE)

// Create a "Weight" attribute with unit
await module.createCategoryAttribute({
  label: 'Weight',
  type: 'number',
  unit: 'kg',
  category_id: 'pcat_123',
  sort_order: 0,
})

// Create a 3D model attribute
await module.createCategoryAttribute({
  label: '3D Model',
  type: 'file',
  category_id: 'pcat_123',
  is_standard: true,
})
```

### Adding attributes to a product

```typescript
// Get the attribute template
const attributes = await module.getCategoryAttributes('pcat_123')

// Add values to the product
await module.createProductAttribute({
  product_id: 'prod_456',
  category_custom_attribute_id: attributes[0].id,
  value_numeric: 5.5,
})
```

### Getting product attributes

```typescript
const productAttributes = await module.getProductAttributes('prod_456')

console.log(productAttributes)
// [
//   {
//     id: 'pat_...',
//     value: 'Premium quality',
//     value_numeric: 5.5,
//     value_file: null,
//     category_custom_attribute: {
//       label: 'Weight',
//       unit: 'kg',
//       type: 'number'
//     }
//   }
// ]
```

---

## 📚 API Reference

### CategoryCustomAttribute

| Method | Description | Parameters |
|--------|-------------|------------|
| `getCategoryAttributes(categoryId)` | Get all category attributes | `categoryId: string` |
| `createCategoryAttribute(data)` | Create a new attribute | See below |
| `updateCategoryAttribute(id, data)` | Update an attribute | `id: string`, `data: Partial<Attribute>` |

#### createCategoryAttribute

```typescript
{
  label: string           // Display name
  type: 'text' | 'number' | 'file' | 'boolean'
  unit?: string | null    // Unit of measurement (optional)
  category_id: string     // Category ID
  is_standard?: boolean   // Standard attribute flag
  sort_order?: number     // Sort order
}
```

### ProductCustomAttribute

| Method | Description | Parameters |
|--------|-------------|------------|
| `getProductAttributes(productId)` | Get product attributes | `productId: string` |
| `createProductAttribute(data)` | Create attribute value | See below |
| `updateProductAttribute(id, data)` | Update value | `id: string`, `data: Partial<Value>` |

#### createProductAttribute

```typescript
{
  product_id: string
  category_custom_attribute_id: string
  value?: string
  value_numeric?: number | null
  value_file?: string | null
}
```

---

## 🗄️ Data Structure

### CategoryCustomAttribute

```
┌─────────────────────────────────────────┐
│ CategoryCustomAttribute                 │
├─────────────────────────────────────────┤
│ id: string (PK)                         │
│ key: string                             │
│ label: string                           │
│ type: 'text' | 'number' | 'file'        │
│ unit: string | null                     │
│ sort_order: number                      │
│ is_standard: boolean                    │
│ category_id: string                     │
│ created_at: timestamp                   │
│ updated_at: timestamp                   │
│ deleted_at: timestamp | null            │
└─────────────────────────────────────────┘
```

### ProductCustomAttribute

```
┌─────────────────────────────────────────┐
│ ProductCustomAttribute                  │
├─────────────────────────────────────────┤
│ id: string (PK)                         │
│ product_id: string                      │
│ value: string | null                    │
│ value_numeric: number | null            │
│ value_file: string | null               │
│ category_custom_attribute_id: FK        │
│ created_at: timestamp                   │
│ updated_at: timestamp                   │
│ deleted_at: timestamp | null            │
└─────────────────────────────────────────┘
```

---

## 📝 Examples

### Example 1: Creating attributes for electronics

```typescript
// Attributes for "Smartphones" category
await module.createCategoryAttribute({
  label: 'Screen Size',
  type: 'number',
  unit: 'inch',
  category_id: 'pcat_phones',
  sort_order: 1,
})

await module.createCategoryAttribute({
  label: 'Storage Capacity',
  type: 'number',
  unit: 'GB',
  category_id: 'pcat_phones',
  sort_order: 2,
})

await module.createCategoryAttribute({
  label: 'Certificate',
  type: 'file',
  category_id: 'pcat_phones',
  is_standard: true,
  sort_order: 3,
})
```

### Example 2: Adding attribute values to a product

```typescript
// iPhone 15 Pro
await module.createProductAttribute({
  product_id: 'prod_iphone15pro',
  category_custom_attribute_id: 'attr_screen_size',
  value_numeric: 6.1,
})

await module.createProductAttribute({
  product_id: 'prod_iphone15pro',
  category_custom_attribute_id: 'attr_storage',
  value_numeric: 256,
})
```

### Example 3: Store API — getting attributes for storefront

```typescript
// GET /store/attribute-values?product_id=prod_iphone15pro
// Response:
{
  "attribute_values": [
    {
      "id": "pat_...",
      "name": "Screen Size",
      "type": "number",
      "unit": "inch",
      "numeric_value": 6.1,
      "is_standard": false
    },
    {
      "id": "pat_...",
      "name": "Certificate",
      "type": "file",
      "file_value": "/files/cert_iphone15pro.pdf",
      "is_standard": true
    }
  ]
}
```

---

## Project Structure

```
medusa-product-attributes/
├── src/
│   ├── models/
│   │   ├── category-custom-attribute.ts
│   │   └── product-custom-attribute.ts
│   ├── index.ts
│   └── service.ts
├── assets/
│   └── *.png
├── dist/
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

---

<div align="center">
  <h2>🤝 Contributing</h2>
  <p>Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.</p>
  <p>
    <sub>Made with ❤️ for the Medusa community</sub>
  </p>
</div>
