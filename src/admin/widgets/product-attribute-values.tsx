import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Container, Heading, Button, Input, Text } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { sdk } from "../lib/sdk"

type ProductCustomAttribute = {
  id: string
  value: string
  type: "text" | "number" | "file" | "boolean"
  product_id: string
}

type CategoryCustomAttribute = {
  id: string
  label: string
  type: "text" | "number" | "file" | "boolean"
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
      const existing = values.find((v) => v.id === attr.id)
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
      .filter(
        (attr) =>
          formValues[attr.id] !== undefined && formValues[attr.id] !== ""
      )
      .map((attr) => ({ id: attr.id, value: formValues[attr.id] }))

    saveMutation.mutate({ attributes: attributesToUpdate })
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
                <Text size="small" weight="plus" className="text-ui-fg-base">
                  {attr.label}
                </Text>
                <div className="flex items-center gap-2">
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
