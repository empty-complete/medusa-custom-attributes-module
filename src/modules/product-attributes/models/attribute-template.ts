import { model } from "@medusajs/framework/utils"

const AttributeTemplate = model.define("attribute_template", {
  id: model.id().primaryKey(),
  key: model.text(),
  label: model.text(),
  type: model.text().default("text"),
  unit: model.text().nullable(),
  description: model.text().nullable(),
})

export default AttributeTemplate
