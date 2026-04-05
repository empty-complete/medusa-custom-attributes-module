import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOM_ATTRIBUTE_MODULE } from "../../../modules/product-attributes"
import type CustomAttributeService from "../../../modules/product-attributes/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: CustomAttributeService = req.scope.resolve(CUSTOM_ATTRIBUTE_MODULE)
  const attribute_templates = await service.listTemplates()
  res.json({ attribute_templates })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: CustomAttributeService = req.scope.resolve(CUSTOM_ATTRIBUTE_MODULE)
  const body = req.body as {
    label: string
    type?: string
    unit?: string | null
    description?: string | null
  }
  const attribute_template = await service.createTemplate(body)
  res.status(201).json({ attribute_template })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const service: CustomAttributeService = req.scope.resolve(CUSTOM_ATTRIBUTE_MODULE)
  const { id, ...data } = req.body as {
    id: string
    label?: string
    type?: string
    unit?: string | null
    description?: string | null
    deleted_at?: string
  }
  const attribute_template = await service.updateTemplate(id, data)
  res.json({ attribute_template })
}
