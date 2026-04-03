import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOM_ATTRIBUTE_MODULE } from "../../../../../index"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { categoryId } = req.params
  const service = req.scope.resolve(CUSTOM_ATTRIBUTE_MODULE)

  const category_custom_attributes = await service.getCategoryAttributes(categoryId)

  res.json({ category_custom_attributes })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { categoryId } = req.params
  const { label, type, unit, sort_order } = req.body as {
    label: string
    type?: string
    unit?: string
    sort_order?: number
  }

  const service = req.scope.resolve(CUSTOM_ATTRIBUTE_MODULE)

  const category_custom_attribute = await service.createCategoryAttribute({
    label,
    type: type || "text",
    unit: unit || null,
    category_id: categoryId,
    sort_order,
  })

  res.status(201).json({ category_custom_attribute })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(CUSTOM_ATTRIBUTE_MODULE)
  const { id, ...data } = req.body as {
    id: string
    label?: string
    type?: string
    unit?: string
    sort_order?: number
    deleted_at?: string
  }

  const category_custom_attribute = await service.updateCategoryAttribute(id, data)

  res.json({ category_custom_attribute })
}
