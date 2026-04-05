import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Container, Heading, Button, Input, Text, Badge } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useRef } from "react"
import { sdk } from "../lib/sdk"

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
  const categoryId = (data.categories as { id: string }[])?.[0]?.id ?? null

  const qc = useQueryClient()
  const [formValues, setFormValues] = useState<FormValues>({})
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  const attributesQuery = useQuery<{
    category_custom_attributes: CategoryCustomAttribute[]
  }>({
    queryKey: ["category-custom-attributes", categoryId],
    queryFn: () =>
      sdk.client.fetch(`/admin/category/${categoryId}/custom-attributes`),
    enabled: !!categoryId,
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
    const attributes = attributesQuery.data.category_custom_attributes
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
    const attributes = attributesQuery.data.category_custom_attributes
    const attributesToUpdate = attributes
      .filter((attr) => formValues[attr.id] !== undefined)
      .map((attr) => ({ id: attr.id, value: formValues[attr.id] ?? "" }))

    saveMutation.mutate({ attributes: attributesToUpdate })
  }

  const handleFileUpload = async (attrId: string, file: File) => {
    setUploadingId(attrId)
    try {
      const formData = new FormData()
      formData.append("files", file)
      const response = await fetch(`/admin/uploads`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      if (!response.ok) {
        const text = await response.text()
        console.error("Upload failed", response.status, text)
        alert(`Ошибка загрузки файла: ${response.status}`)
        return
      }
      const res: any = await response.json()
      const url = res?.files?.[0]?.url
      if (url) {
        setFormValues((prev) => ({ ...prev, [attrId]: url }))
      } else {
        console.error("No URL in upload response", res)
        alert("Файл загружен, но URL не получен")
      }
    } catch (err) {
      console.error("Upload error", err)
      alert("Ошибка загрузки файла")
    } finally {
      setUploadingId(null)
    }
  }

  if (!categoryId) {
    return (
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Характеристики</Heading>
        </div>
        <div className="px-6 py-4">
          <Text className="text-ui-fg-muted text-sm">
            Назначьте категорию товару, чтобы заполнить характеристики.
          </Text>
        </div>
      </Container>
    )
  }

  const isLoading = attributesQuery.isLoading || valuesQuery.isLoading
  const isError = attributesQuery.isError || valuesQuery.isError
  const attributes = attributesQuery.data?.category_custom_attributes ?? []

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Характеристики</Heading>
      </div>

      {isLoading && (
        <div className="px-6 py-4">
          <Text className="text-ui-fg-muted text-sm">Загрузка…</Text>
        </div>
      )}

      {isError && (
        <div className="px-6 py-4">
          <Text className="text-ui-fg-error text-sm">
            Не удалось загрузить характеристики.
          </Text>
        </div>
      )}

      {!isLoading && !isError && attributes.length === 0 && (
        <div className="px-6 py-4">
          <Text className="text-ui-fg-muted text-sm">
            В категории нет атрибутов. Добавьте их в настройках категории.
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
                      <option value="true">Да</option>
                      <option value="false">Нет</option>
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
                          if (f) handleFileUpload(attr.id, f)
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
                        placeholder="URL файла"
                        className="h-8 text-sm flex-1"
                      />
                      <Button
                        size="small"
                        variant="secondary"
                        type="button"
                        onClick={() => fileInputs.current[attr.id]?.click()}
                        isLoading={uploadingId === attr.id}
                      >
                        Загрузить
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
                      placeholder={attr.type === "number" ? "0" : "Значение"}
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
              {saveSuccess ? "Сохранено ✓" : "Сохранить"}
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
