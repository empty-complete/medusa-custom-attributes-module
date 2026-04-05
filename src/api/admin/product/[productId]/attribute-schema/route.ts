import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { CUSTOM_ATTRIBUTE_MODULE } from "../../../../../modules/product-attributes"
import type CustomAttributeService from "../../../../../modules/product-attributes/service"

async function resolveAncestorChain(
  productService: any,
  leafId: string
): Promise<string[]> {
  const chain: string[] = []
  let currentId: string | null = leafId
  let depth = 0
  while (currentId && depth < 20) {
    chain.push(currentId)
    const category: any = await productService.retrieveProductCategory(currentId, {
      select: ["id", "parent_category_id"],
    })
    currentId = (category?.parent_category_id as string | null) ?? null
    depth++
  }
  return chain
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { productId } = req.params
  const service: CustomAttributeService = req.scope.resolve(CUSTOM_ATTRIBUTE_MODULE)
  const productService = req.scope.resolve(Modules.PRODUCT)

  const product: any = await productService.retrieveProduct(productId, {
    relations: ["categories"],
  })
  const categoryId = product?.categories?.[0]?.id ?? null

  const categoryIds = categoryId
    ? await resolveAncestorChain(productService, categoryId)
    : []
  const attributes = await service.getAttributesByCategoryIds(categoryIds)

  res.json({ attributes })
}
