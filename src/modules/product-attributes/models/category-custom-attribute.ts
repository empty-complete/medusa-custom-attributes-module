import { model } from "@medusajs/framework/utils"
import ProductCustomAttribute from "./product-custom-attribute"

const CategoryCustomAttribute = model
  .define("category_custom_attribute", {
    id: model.id().primaryKey(),
    key: model.text(),
    type: model.text().default("text"),
    label: model.text().default(""),
    unit: model.text().nullable(), // Единица измерения (кг, м, шт и т.д.)
    sort_order: model.number().default(0),
    category_id: model.text(),
    is_standard: model.boolean().default(false), // Стандартные атрибуты (certificates, 3dmodel, manual)
    product_custom_attributes: model.hasMany(() => ProductCustomAttribute),
  })
  .cascades({
    delete: ["product_custom_attributes"],
  })

export default CategoryCustomAttribute
