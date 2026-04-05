import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Globe } from "@medusajs/icons"
import { Container, Heading, Button, Input, Text, Badge } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../../../lib/sdk"

type AttributeType = "text" | "number" | "file" | "boolean"

type GlobalAttribute = {
  id: string
  key: string
  label: string
  type: AttributeType
  unit: string | null
}

type FormState = {
  label: string
  type: AttributeType
  unit: string
}

const emptyForm = (): FormState => ({ label: "", type: "text", unit: "" })

const typeLabel = (t: string) =>
  t === "text" ? "Текст"
  : t === "number" ? "Число"
  : t === "file" ? "Файл"
  : t === "boolean" ? "Да/Нет"
  : t

const GlobalAttributesSettingsPage = () => {
  const qc = useQueryClient()
  const queryKey = ["global-attributes"]

  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery<{
    global_attributes: GlobalAttribute[]
  }>({
    queryKey,
    queryFn: () => sdk.client.fetch(`/admin/global-attributes`),
  })

  const attrs = data?.global_attributes ?? []

  const createMutation = useMutation({
    mutationFn: (body: FormState) =>
      sdk.client.fetch(`/admin/global-attributes`, {
        method: "POST",
        body: {
          label: body.label,
          type: body.type,
          unit: body.type === "number" && body.unit ? body.unit : null,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey })
      setShowAddForm(false)
      setAddForm(emptyForm())
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/global-attributes`, {
        method: "PATCH",
        body: { id, deleted_at: new Date().toISOString() },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey })
      setConfirmDeleteId(null)
    },
  })

  const handleAdd = () => {
    if (!addForm.label.trim()) return
    createMutation.mutate({
      label: addForm.label.trim(),
      type: addForm.type,
      unit: addForm.unit.trim(),
    })
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Глобальные атрибуты</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Применяются ко всем товарам автоматически. Значения у продуктов необязательны.
          </Text>
        </div>
        {!showAddForm && (
          <Button variant="secondary" size="small" onClick={() => setShowAddForm(true)}>+ Добавить</Button>
        )}
      </div>

      {isLoading && <div className="px-6 py-4"><Text className="text-ui-fg-muted text-sm">Загрузка…</Text></div>}
      {isError && <div className="px-6 py-4"><Text className="text-ui-fg-error text-sm">Не удалось загрузить.</Text></div>}
      {!isLoading && !isError && attrs.length === 0 && !showAddForm && (
        <div className="px-6 py-4"><Text className="text-ui-fg-muted text-sm">Глобальных атрибутов нет.</Text></div>
      )}

      <div className="divide-y">
        {attrs.map((a) =>
          confirmDeleteId === a.id ? (
            <div key={a.id} className="flex items-center gap-3 px-6 py-3 text-sm">
              <span className="flex-1">Удалить «{a.label}»?</span>
              <Button size="small" variant="danger" onClick={() => deleteMutation.mutate(a.id)} isLoading={deleteMutation.isPending}>Удалить</Button>
              <Button size="small" variant="secondary" onClick={() => setConfirmDeleteId(null)}>Отмена</Button>
            </div>
          ) : (
            <div key={a.id} className="flex items-center gap-3 px-6 py-3">
              <span className="flex-1 text-sm">{a.label}</span>
              <Badge size="2xsmall" color="grey">{typeLabel(a.type)}{a.unit ? `, ${a.unit}` : ""}</Badge>
              <button onClick={() => setConfirmDeleteId(a.id)} className="text-xs text-ui-fg-error hover:underline">Удалить</button>
            </div>
          )
        )}
      </div>

      {showAddForm && (
        <div className="flex items-center gap-2 px-6 py-4">
          <Input value={addForm.label} onChange={(e) => setAddForm((f) => ({ ...f, label: e.target.value }))} placeholder="Название" className="flex-1 h-8 text-sm" autoFocus />
          <select value={addForm.type} onChange={(e) => setAddForm((f) => ({ ...f, type: e.target.value as AttributeType, unit: e.target.value === "number" ? f.unit : "" }))} className="h-8 rounded border border-ui-border-base bg-ui-bg-base px-2 text-sm">
            <option value="text">Текст</option>
            <option value="number">Число</option>
            <option value="file">Файл</option>
            <option value="boolean">Да/Нет</option>
          </select>
          {addForm.type === "number" && <Input value={addForm.unit} onChange={(e) => setAddForm((f) => ({ ...f, unit: e.target.value }))} placeholder="ед." className="w-28 h-8 text-sm" />}
          <Button size="small" onClick={handleAdd} isLoading={createMutation.isPending}>Создать</Button>
          <Button variant="secondary" size="small" onClick={() => { setShowAddForm(false); setAddForm(emptyForm()) }}>Отмена</Button>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Global Attributes",
  icon: Globe,
})

export default GlobalAttributesSettingsPage
