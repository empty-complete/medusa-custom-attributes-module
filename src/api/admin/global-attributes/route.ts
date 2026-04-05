import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOM_ATTRIBUTE_MODULE } from "../../../modules/product-attributes"
import type CustomAttributeService from "../../../modules/product-attributes/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: CustomAttributeService = req.scope.resolve(CUSTOM_ATTRIBUTE_MODULE)
  const global_attributes = await service.listGlobalAttributes()
  res.json({ global_attributes })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: CustomAttributeService = req.scope.resolve(CUSTOM_ATTRIBUTE_MODULE)
  const body = req.body as {
    label: string
    type?: string
    unit?: string | null
  }
  const global_attribute = await service.createCategoryAttribute({
    label: body.label,
    type: body.type || "text",
    unit: body.unit ?? null,
    category_id: null,
    is_global: true,
  })
  res.status(201).json({ global_attribute })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const service: CustomAttributeService = req.scope.resolve(CUSTOM_ATTRIBUTE_MODULE)
  const { id, ...data } = req.body as {
    id: string
    label?: string
    type?: string
    unit?: string | null
    deleted_at?: string
  }
  const global_attribute = await service.updateCategoryAttribute(id, data)
  res.json({ global_attribute })
}
