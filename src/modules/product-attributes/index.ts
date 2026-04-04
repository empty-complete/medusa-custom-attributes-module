import { Module } from "@medusajs/framework/utils"
import CustomAttributeService from "./service"

export const CUSTOM_ATTRIBUTE_MODULE = "customAttributeModule"

export default Module(CUSTOM_ATTRIBUTE_MODULE, {
  service: CustomAttributeService,
})
