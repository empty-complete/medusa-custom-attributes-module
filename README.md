<div align="center">
  <img src="./assets/logo.png" alt="medusa-product-attributes logo" width="120">
  <h1>Medusa Product Attributes</h1>
  <p><i>A flexible attribute system for Medusa v2 — text, number, file, boolean, with units and category inheritance</i></p>

  <p>
    <a href="https://www.npmjs.com/package/@empty-complete-org/medusa-product-attributes">
      <img src="https://img.shields.io/npm/v/@empty-complete-org/medusa-product-attributes" alt="npm version">
    </a>
    <a href="https://www.npmjs.com/package/@empty-complete-org/medusa-product-attributes">
      <img src="https://img.shields.io/npm/dm/@empty-complete-org/medusa-product-attributes" alt="npm downloads">
    </a>
    <a href="https://github.com/empty-complete/medusa-product-attributes/actions/workflows/ci.yml">
      <img src="https://github.com/empty-complete/medusa-product-attributes/actions/workflows/ci.yml/badge.svg" alt="CI Status">
    </a>
    <a href="https://github.com/empty-complete/medusa-product-attributes/commits/main">
      <img src="https://img.shields.io/github/commit-activity/m/empty-complete/medusa-product-attributes" alt="GitHub commit activity">
    </a>
    <a href="https://github.com/empty-complete/medusa-product-attributes/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/@empty-complete-org/medusa-product-attributes" alt="License">
    </a>
  </p>

  <p>
    <a href="https://medusajs.com/"><img src="https://img.shields.io/badge/Medusa-v2-000000" alt="Medusa v2"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6" alt="TypeScript"></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E=20-339933" alt="Node.js"></a>
  </p>

  <p>
    <a href="https://t.me/kinesis_lab">
      <img src="https://img.shields.io/badge/Telegram-follow-229ED9?logo=telegram" alt="Telegram">
    </a>
  </p>
</div>

---

## Features

| Feature | Description |
|---------|-------------|
| **Text Attributes** | Arbitrary text values for products |
| **Numeric Attributes** | Numbers with units (kg, m, pcs, etc.) |
| **File Attributes** | File uploads: certificates, 3D models, manuals |
| **Boolean Attributes** | Yes/No values |
| **Category Inheritance** | Attributes cascade from parent to child categories |
| **Global Attributes** | Applied to every product automatically |
| **Templates** | Reusable blueprints — apply to any category in one click |
| **Auto Slug** | Labels are transliterated (Russian, Chinese, any script) |
| **Smart File Naming** | Uploaded images renamed to `{product_handle}_{attr_key}.ext` |
| **i18n** | English and Russian out of the box, extensible |

---

### Requirements

| Dependency | Version |
|------------|---------|
| Medusa | ^2.13 |
| Node.js | >=20 |
| TypeScript | ^5.0 |

---

## Quick Start

### Installation

```bash
# Via pnpm
pnpm add @empty-complete-org/medusa-product-attributes

# Via npm
npm install @empty-complete-org/medusa-product-attributes

# Via yarn
yarn add @empty-complete-org/medusa-product-attributes
```

### 1. Add the plugin to configuration

```typescript
// medusa-config.ts
import { defineConfig } from '@medusajs/framework/utils'

export default defineConfig({
  plugins: [
    {
      resolve: "@empty-complete-org/medusa-product-attributes",
      options: {},
    },
  ],
})
```

### 2. Run migrations

```bash
npx medusa db:migrate
```

### 3. Done!

The plugin automatically creates tables and registers admin widgets.

---

## Screenshots

### Category widget with inheritance
![Category widget](./assets/category-widget.png)

### Product attribute values
![Product widget](./assets/product-widget.png)

### Settings — Global Attributes & Templates
![Settings page](./assets/settings-page.png)

---

## Usage

### Admin

1. **Category attributes** — open any category, the "Attributes" widget appears below details. Add custom attributes (inherited by subcategories), or pick from a template.
2. **Global attributes** — Settings → *Product Attributes* → Globals tab. Applied to every product automatically.
3. **Templates** — Settings → *Product Attributes* → Templates tab. Reusable blueprints.
4. **Product values** — open any product, the "Characteristics" widget shows all inherited + global attributes with inputs.

### API

```
GET    /admin/product/:productId/attribute-schema
GET    /admin/category/:categoryId/custom-attributes
POST   /admin/category/:categoryId/custom-attributes
PATCH  /admin/category/:categoryId/custom-attributes
GET    /admin/global-attributes
POST   /admin/global-attributes
PATCH  /admin/global-attributes
GET    /admin/attribute-templates
POST   /admin/attribute-templates
PATCH  /admin/attribute-templates
POST   /admin/attribute-templates/:id/apply  { category_id }
GET    /admin/product/:productId/custom-attributes
POST   /admin/product/:productId/custom-attributes
```

### Programmatic usage

```typescript
import { CUSTOM_ATTRIBUTE_MODULE } from '@empty-complete-org/medusa-product-attributes'

const module = container.resolve(CUSTOM_ATTRIBUTE_MODULE)

// Create a category attribute
await module.createCategoryAttribute({
  label: 'Screen Size',
  type: 'number',
  unit: 'inch',
  category_id: 'pcat_phones',
})

// Add a product value
await module.createProductAttribute({
  product_id: 'prod_iphone15pro',
  category_custom_attribute_id: 'attr_screen_size',
  value: '6.1',
  value_numeric: 6.1,
})
```

---

## Attribute types

| Type | Admin input | Stored in |
|------|-------------|-----------|
| `text` | text input | `value` |
| `number` | number input + unit badge | `value`, `value_numeric` |
| `file` | upload button | `value` (URL), `value_file` |
| `boolean` | select Yes/No | `value` |

---

## Project Structure

```
medusa-product-attributes/
├── src/
│   ├── admin/
│   │   ├── lib/
│   │   │   ├── i18n.ts
│   │   │   ├── locales/
│   │   │   │   ├── en.json
│   │   │   │   └── ru.json
│   │   │   └── sdk.ts
│   │   ├── routes/settings/product-attributes/
│   │   │   └── page.tsx
│   │   └── widgets/
│   │       ├── category-attribute-templates.tsx
│   │       └── product-attribute-values.tsx
│   ├── api/admin/
│   │   ├── attribute-templates/
│   │   ├── category/[categoryId]/custom-attributes/
│   │   ├── global-attributes/
│   │   └── product/[productId]/
│   │       ├── attribute-schema/
│   │       └── custom-attributes/
│   └── modules/product-attributes/
│       ├── models/
│       ├── migrations/
│       ├── service.ts
│       └── index.ts
├── assets/
├── package.json
├── tsconfig.json
└── LICENSE
```

---

## Development

```bash
pnpm install
pnpm test              # Jest unit tests
pnpm run build         # medusa plugin:build
pnpm run dev           # medusa plugin:develop
```

---

<div align="center">
  <h2>Contributing</h2>
  <p>Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.</p>
  <p>
    <sub>Made with ❤️ for the Medusa community</sub>
  </p>
</div>
