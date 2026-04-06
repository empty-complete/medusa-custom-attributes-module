import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Container, Heading, Button, Input, Text, Badge } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useRef } from "react"
import { sdk } from "../lib/sdk"
import { useT } from "../lib/i18n"

type AttributeType = "text" | "number" | "file" | "boolean"

type ProductCustomAttribute = {
  id: string
  value: string
  value_file: string | null
  category_custom_attribute_id: string
  category_custom_attribute?: { id: string }
  product_id: string
}

type CategoryCustomAttribute = {
  id: string
  key: string
  label: string
  type: AttributeType
  unit: string | null
  category_id: string
}

type FormValues = Record<string, string>

const ProductAttributeValuesWidget = ({
  data,
}: DetailWidgetProps<AdminProduct>) => {
  const productId = data.id
  const productHandle = (data as any).handle || productId
  const t = useT()

  // Hide built-in Medusa "Attributes" widget (Height/Width/Weight/etc.)
  useEffect(() => {
    const headings = document.querySelectorAll("h2")
    for (const h of headings) {
      if (h.textContent === "Attributes" || h.textContent === "Атрибуты") {
        const container = h.closest(".shadow-elevation-card-rest")
        if (container && container.querySelector("p")?.textContent?.includes("Height") ||
            container?.querySelector("p")?.textContent?.includes("Weight")) {
          ;(container as HTMLElement).style.display = "none"
        }
      }
    }
  }, [])

  const qc = useQueryClient()
  const [formValues, setFormValues] = useState<FormValues>({})
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  const attributesQuery = useQuery<{
    attributes: CategoryCustomAttribute[]
  }>({
    queryKey: ["product-attribute-schema", productId],
    queryFn: () =>
      sdk.client.fetch(`/admin/product/${productId}/attribute-schema`),
  })

  const valuesQuery = useQuery<{
    product_custom_attributes: ProductCustomAttribute[]
  }>({
    queryKey: ["product-custom-attributes", productId],
    queryFn: () =>
      sdk.client.fetch(`/admin/product/${productId}/custom-attributes`),
  })

  useEffect(() => {
    if (!attributesQuery.data || !valuesQuery.data) return
    const attributes = attributesQuery.data.attributes
    const values = valuesQuery.data.product_custom_attributes
    const initial: FormValues = {}
    for (const attr of attributes) {
      const existing = values.find(
        (v) =>
          v.category_custom_attribute?.id === attr.id ||
          v.category_custom_attribute_id === attr.id
      )
      initial[attr.id] = existing ? existing.value : ""
    }
    setFormValues(initial)
  }, [attributesQuery.data, valuesQuery.data])

  const saveMutation = useMutation({
    mutationFn: (body: { attributes: Array<{ id: string; value: string }> }) =>
      sdk.client.fetch(`/admin/product/${productId}/custom-attributes`, {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["product-custom-attributes", productId],
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    },
  })

  const handleSave = () => {
    if (!attributesQuery.data) return
    const attributes = attributesQuery.data.attributes
    const attributesToUpdate = attributes
      .filter((attr) => formValues[attr.id] !== undefined)
      .map((attr) => ({ id: attr.id, value: formValues[attr.id] ?? "" }))

    saveMutation.mutate({ attributes: attributesToUpdate })
  }

  const handleFileUpload = async (
    attr: CategoryCustomAttribute,
    file: File
  ) => {
    const attrId = attr.id
    setUploadingId(attrId)
    try {
      const isImage = file.type.startsWith("image/")
      let toUpload: File = file
      if (isImage) {
        const dot = file.name.lastIndexOf(".")
        const ext = dot > -1 ? file.name.slice(dot) : ""
        toUpload = new File(
          [file],
          `${productHandle}_${attr.key}${ext}`,
          { type: file.type }
        )
      }
      const formData = new FormData()
      formData.append("files", toUpload)
      const response = await fetch(`/admin/uploads`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      if (!response.ok) {
        const text = await response.text()
        console.error("Upload failed", response.status, text)
        alert(`${t("uploadError")}: ${response.status}`)
        return
      }
      const res: any = await response.json()
      const url = res?.files?.[0]?.url
      if (url) {
        setFormValues((prev) => ({ ...prev, [attrId]: url }))
      } else {
        console.error("No URL in upload response", res)
        alert(t("uploadError"))
      }
    } catch (err) {
      console.error("Upload error", err)
      alert(t("uploadError"))
    } finally {
      setUploadingId(null)
    }
  }

  const isLoading = attributesQuery.isLoading || valuesQuery.isLoading
  const isError = attributesQuery.isError || valuesQuery.isError
  const attributes = attributesQuery.data?.attributes ?? []

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">{t("characteristics")}</Heading>
      </div>

      {isLoading && (
        <div className="px-6 py-4">
          <Text className="text-ui-fg-muted text-sm">{t("loading")}</Text>
        </div>
      )}

      {isError && (
        <div className="px-6 py-4">
          <Text className="text-ui-fg-error text-sm">
            {t("loadFailed")}
          </Text>
        </div>
      )}

      {!isLoading && !isError && attributes.length === 0 && (
        <div className="px-6 py-4">
          <Text className="text-ui-fg-muted text-sm">
            {t("noAttributes")}
          </Text>
        </div>
      )}

      {!isLoading && !isError && attributes.length > 0 && (
        <>
          <div className="divide-y">
            {attributes.map((attr) => (
              <div
                key={attr.id}
                className="grid grid-cols-2 items-center gap-4 px-6 py-3"
              >
                <div className="flex items-center gap-2">
                  <Text size="small" weight="plus" className="text-ui-fg-base">
                    {attr.label}
                  </Text>
                  {attr.unit && (
                    <Badge size="2xsmall" color="grey">
                      {attr.unit}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {attr.type === "boolean" ? (
                    <select
                      value={formValues[attr.id] ?? ""}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          [attr.id]: e.target.value,
                        }))
                      }
                      className="h-8 flex-1 rounded border border-ui-border-base bg-ui-bg-base px-2 text-sm"
                    >
                      <option value="">—</option>
                      <option value="true">{t("yes")}</option>
                      <option value="false">{t("no")}</option>
                    </select>
                  ) : attr.type === "file" ? (
                    <>
                      <input
                        ref={(el) => {
                          fileInputs.current[attr.id] = el
                        }}
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) handleFileUpload(attr, f)
                        }}
                      />
                      <Input
                        value={formValues[attr.id] ?? ""}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            [attr.id]: e.target.value,
                          }))
                        }
                        placeholder={t("fileUrl")}
                        className="h-8 text-sm flex-1"
                      />
                      <Button
                        size="small"
                        variant="secondary"
                        type="button"
                        onClick={() => fileInputs.current[attr.id]?.click()}
                        isLoading={uploadingId === attr.id}
                      >
                        {t("upload")}
                      </Button>
                    </>
                  ) : (
                    <Input
                      type={attr.type === "number" ? "number" : "text"}
                      value={formValues[attr.id] ?? ""}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          [attr.id]: e.target.value,
                        }))
                      }
                      placeholder={attr.type === "number" ? "0" : t("value")}
                      className="h-8 text-sm flex-1"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end px-6 py-4">
            <Button
              size="small"
              onClick={handleSave}
              isLoading={saveMutation.isPending}
            >
              {saveSuccess ? t("saved") : t("save")}
            </Button>
          </div>
        </>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductAttributeValuesWidget
