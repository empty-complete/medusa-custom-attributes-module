import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import CustomAttributeModule from "../modules/product-attributes"

// Read-only link so product_custom_attribute records are queryable from the
// product graph (e.g. /store/products?fields=*product_custom_attribute.*)
// without consumers having to define the link in their own app.
export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    field: "id",
    isList: true,
  },
  {
    ...CustomAttributeModule.linkable.productCustomAttribute.id,
    primaryKey: "product_id",
  },
  {
    readOnly: true,
  }
)
