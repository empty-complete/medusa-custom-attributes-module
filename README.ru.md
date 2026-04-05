<div align="center">
  <img src="./assets/logo.png" alt="medusa-product-attributes logo" width="120">
  <h1>Medusa Product Attributes</h1>
  <p><i>Гибкая система атрибутов для Medusa v2 — текст, число, файл, да/нет, с единицами измерения и наследованием по категориям</i></p>

  <p>
    <a href="https://github.com/empty-complete/medusa-product-attributes/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/@empty-complete-org/medusa-product-attributes" alt="License">
    </a>
    <a href="https://www.npmjs.com/package/@empty-complete-org/medusa-product-attributes">
      <img src="https://img.shields.io/npm/v/@empty-complete-org/medusa-product-attributes" alt="npm version">
    </a>
    <a href="https://www.npmjs.com/package/@empty-complete-org/medusa-product-attributes">
      <img src="https://img.shields.io/npm/dm/@empty-complete-org/medusa-product-attributes" alt="npm downloads">
    </a>
    <a href="https://github.com/empty-complete/medusa-product-attributes/actions/workflows/ci.yml">
      <img src="https://github.com/empty-complete/medusa-product-attributes/actions/workflows/ci.yml/badge.svg" alt="CI Status">
    </a>
  </p>

  <p><a href="./README.md">English version</a></p>
</div>

---

## Возможности

- **4 типа атрибутов**: текст, число (с единицами), файл, да/нет
- **Наследование по категориям**: атрибуты родительской категории автоматически подхватываются дочерними
- **Глобальные атрибуты**: применяются ко всем товарам магазина
- **Шаблоны**: готовые заготовки атрибутов — применяются к любой категории в один клик
- **Автогенерация slug**: транслитерация любого языка (рус, кит, ...)
- **Умные имена файлов**: изображения сохраняются как `{product_handle}_{attr_key}.ext`
- **Встроенный UI админки**: виджет категории, виджет товара, две страницы в Settings
- **Миграции в комплекте**: достаточно `npx medusa db:migrate`

## Скриншоты

### Виджет категории с наследованием
![Виджет категории](./assets/category-widget.png)

### Значения атрибутов у товара
![Виджет товара](./assets/product-widget.png)

### Глобальные атрибуты
![Глобальные атрибуты](./assets/global-attributes.png)

### Шаблоны атрибутов
![Шаблоны](./assets/templates.png)

## Установка

```bash
pnpm add @empty-complete-org/medusa-product-attributes
```

В `medusa-config.ts`:

```ts
module.exports = defineConfig({
  plugins: [
    {
      resolve: "@empty-complete-org/medusa-product-attributes",
      options: {},
    },
  ],
})
```

Миграции:

```bash
npx medusa db:migrate
```

## Использование

1. **Атрибуты категории** — виджет «Атрибуты» под деталями категории. Добавь свои или выбери из шаблона.
2. **Глобальные атрибуты** — Settings → *Global Attributes*. Применяются к каждому товару автоматически.
3. **Шаблоны** — Settings → *Attribute Templates*. Многоразовые заготовки.
4. **Значения товара** — виджет «Характеристики» под деталями товара, показывает все унаследованные + глобальные атрибуты.

## Лицензия

MIT © empty-complete
