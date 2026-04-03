import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOM_ATTRIBUTE_MODULE } from "../../../../../index"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { productId } = req.params
  const service = req.scope.resolve(CUSTOM_ATTRIBUTE_MODULE)

  const product_custom_attributes = await service.getProductAttributes(productId)

  res.json({ product_custom_attributes })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { productId } = req.params
  const { attributes } = req.body as {
    attributes: Array<{ id: string; value: string }>
  }

  const service = req.scope.resolve(CUSTOM_ATTRIBUTE_MODULE)

  // Get existing product attributes
  const existing = await service.getProductAttributes(productId)

  const results = []

  for (const attr of attributes) {
    const existingAttr = existing.find(
      (e: any) => e.category_custom_attribute?.id === attr.id
    )

    if (existingAttr) {
      // Update existing
      const updated = await service.updateProductAttribute(existingAttr.id, {
        value: attr.value,
        value_numeric: isNaN(Number(attr.value)) ? null : Number(attr.value),
      })
      results.push(updated)
    } else {
      // Create new
      const created = await service.createProductAttribute({
        product_id: productId,
        category_custom_attribute_id: attr.id,
        value: attr.value,
        value_numeric: isNaN(Number(attr.value)) ? null : Number(attr.value),
      })
      results.push(created)
    }
  }

  res.json({ product_custom_attributes: results })
}
