import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Tag } from "@medusajs/icons"
import { Container, Heading, Button, Input, Text, Badge } from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../../../lib/sdk"
import { useT } from "../../../lib/i18n"

type AttributeType = "text" | "number" | "file" | "boolean"

type AttributeRow = {
  id: string
  key: string
  label: string
  type: AttributeType
  unit: string | null
  description?: string | null
}

type FormState = {
  label: string
  type: AttributeType
  unit: string
  description: string
}

const emptyForm = (): FormState => ({ label: "", type: "text", unit: "", description: "" })

type TabKey = "globals" | "templates"

const ProductAttributesSettingsPage = () => {
  const t = useT()
  const [tab, setTab] = useState<TabKey>("globals")

  return (
    <Container className="p-0">
      <div className="flex items-center gap-6 border-b border-ui-border-base px-6 pt-4">
        <TabButton active={tab === "globals"} onClick={() => setTab("globals")}>
          {t("globals")}
        </TabButton>
        <TabButton active={tab === "templates"} onClick={() => setTab("templates")}>
          {t("templates")}
        </TabButton>
      </div>
      {tab === "globals" ? <GlobalsTab /> : <TemplatesTab />}
    </Container>
  )
}

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) => (
  <button
    onClick={onClick}
    className={`-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
      active
        ? "border-ui-border-interactive text-ui-fg-base"
        : "border-transparent text-ui-fg-subtle hover:text-ui-fg-base"
    }`}
  >
    {children}
  </button>
)

// ---------- Globals tab ----------
const GlobalsTab = () => {
  const t = useT()
  const qc = useQueryClient()
  const queryKey = ["global-attributes"]
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery<{ global_attributes: AttributeRow[] }>({
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
      ...addForm,
      label: addForm.label.trim(),
      unit: addForm.unit.trim(),
      description: addForm.description.trim(),
    })
  }

  return (
    <div className="divide-y">
      <div className="flex items-start justify-between px-6 py-4">
        <div>
          <Heading level="h2">{t("globals")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">{t("globalsDesc")}</Text>
        </div>
        {!showAddForm && (
          <Button variant="secondary" size="small" onClick={() => setShowAddForm(true)}>
            {t("add")}
          </Button>
        )}
      </div>

      {isLoading && <div className="px-6 py-4"><Text className="text-ui-fg-muted text-sm">{t("loading")}</Text></div>}
      {isError && <div className="px-6 py-4"><Text className="text-ui-fg-error text-sm">{t("loadFailed")}</Text></div>}
      {!isLoading && !isError && attrs.length === 0 && !showAddForm && (
        <div className="px-6 py-4"><Text className="text-ui-fg-muted text-sm">{t("noGlobals")}</Text></div>
      )}

      <div className="divide-y">
        {attrs.map((a) =>
          confirmDeleteId === a.id ? (
            <div key={a.id} className="flex items-center gap-3 px-6 py-3 text-sm">
              <span className="flex-1">{t("confirmDelete").replace("{name}", a.label)}</span>
              <Button size="small" variant="danger" onClick={() => deleteMutation.mutate(a.id)} isLoading={deleteMutation.isPending}>{t("delete")}</Button>
              <Button size="small" variant="secondary" onClick={() => setConfirmDeleteId(null)}>{t("cancel")}</Button>
            </div>
          ) : (
            <div key={a.id} className="flex items-center gap-3 px-6 py-3">
              <span className="flex-1 text-sm">{a.label}</span>
              <Badge size="2xsmall" color="grey">{t(`type.${a.type}`, a.type)}{a.unit ? `, ${a.unit}` : ""}</Badge>
              <button onClick={() => setConfirmDeleteId(a.id)} className="text-xs text-ui-fg-error hover:underline">{t("delete")}</button>
            </div>
          )
        )}
      </div>

      {showAddForm && <AddForm t={t} form={addForm} setForm={setAddForm} onCancel={() => { setShowAddForm(false); setAddForm(emptyForm()) }} onSubmit={handleAdd} isLoading={createMutation.isPending} withDescription={false} />}
    </div>
  )
}

// ---------- Templates tab ----------
const TemplatesTab = () => {
  const t = useT()
  const qc = useQueryClient()
  const queryKey = ["attribute-templates"]
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery<{ attribute_templates: AttributeRow[] }>({
    queryKey,
    queryFn: () => sdk.client.fetch(`/admin/attribute-templates`),
  })

  const templates = data?.attribute_templates ?? []

  const createMutation = useMutation({
    mutationFn: (body: FormState) =>
      sdk.client.fetch(`/admin/attribute-templates`, {
        method: "POST",
        body: {
          label: body.label,
          type: body.type,
          unit: body.type === "number" && body.unit ? body.unit : null,
          description: body.description || null,
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
      sdk.client.fetch(`/admin/attribute-templates`, {
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
      ...addForm,
      label: addForm.label.trim(),
      unit: addForm.unit.trim(),
      description: addForm.description.trim(),
    })
  }

  return (
    <div className="divide-y">
      <div className="flex items-start justify-between px-6 py-4">
        <div>
          <Heading level="h2">{t("templates")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">{t("templatesDesc")}</Text>
        </div>
        {!showAddForm && (
          <Button variant="secondary" size="small" onClick={() => setShowAddForm(true)}>
            {t("add")}
          </Button>
        )}
      </div>

      {isLoading && <div className="px-6 py-4"><Text className="text-ui-fg-muted text-sm">{t("loading")}</Text></div>}
      {isError && <div className="px-6 py-4"><Text className="text-ui-fg-error text-sm">{t("loadFailed")}</Text></div>}
      {!isLoading && !isError && templates.length === 0 && !showAddForm && (
        <div className="px-6 py-4"><Text className="text-ui-fg-muted text-sm">{t("noTemplates")}</Text></div>
      )}

      <div className="divide-y">
        {templates.map((p) =>
          confirmDeleteId === p.id ? (
            <div key={p.id} className="flex items-center gap-3 px-6 py-3 text-sm">
              <span className="flex-1">{t("confirmDelete").replace("{name}", p.label)}</span>
              <Button size="small" variant="danger" onClick={() => deleteMutation.mutate(p.id)} isLoading={deleteMutation.isPending}>{t("delete")}</Button>
              <Button size="small" variant="secondary" onClick={() => setConfirmDeleteId(null)}>{t("cancel")}</Button>
            </div>
          ) : (
            <div key={p.id} className="flex items-center gap-3 px-6 py-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Text size="small" weight="plus">{p.label}</Text>
                  <Badge size="2xsmall" color="grey">{t(`type.${p.type}`, p.type)}{p.unit ? `, ${p.unit}` : ""}</Badge>
                </div>
                {p.description && <Text size="xsmall" className="text-ui-fg-subtle">{p.description}</Text>}
              </div>
              <button onClick={() => setConfirmDeleteId(p.id)} className="text-xs text-ui-fg-error hover:underline">{t("delete")}</button>
            </div>
          )
        )}
      </div>

      {showAddForm && <AddForm t={t} form={addForm} setForm={setAddForm} onCancel={() => { setShowAddForm(false); setAddForm(emptyForm()) }} onSubmit={handleAdd} isLoading={createMutation.isPending} withDescription={true} />}
    </div>
  )
}

// ---------- Shared Add form ----------
const AddForm = ({
  t,
  form,
  setForm,
  onCancel,
  onSubmit,
  isLoading,
  withDescription,
}: {
  t: (k: string, f?: string) => string
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onCancel: () => void
  onSubmit: () => void
  isLoading: boolean
  withDescription: boolean
}) => (
  <div className="flex flex-col gap-2 px-6 py-4">
    <div className="flex items-center gap-2">
      <Input
        value={form.label}
        onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
        placeholder={t("name")}
        className="flex-1 h-8 text-sm"
        autoFocus
      />
      <select
        value={form.type}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            type: e.target.value as AttributeType,
            unit: e.target.value === "number" ? f.unit : "",
          }))
        }
        className="h-8 rounded border border-ui-border-base bg-ui-bg-base px-2 text-sm"
      >
        <option value="text">{t("type.text")}</option>
        <option value="number">{t("type.number")}</option>
        <option value="file">{t("type.file")}</option>
        <option value="boolean">{t("type.boolean")}</option>
      </select>
      {form.type === "number" && (
        <Input
          value={form.unit}
          onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          placeholder={t("unit")}
          className="w-28 h-8 text-sm"
        />
      )}
    </div>
    {withDescription && (
      <Input
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        placeholder={t("description")}
        className="h-8 text-sm"
      />
    )}
    <div className="flex justify-end gap-2">
      <Button variant="secondary" size="small" onClick={onCancel}>{t("cancel")}</Button>
      <Button size="small" onClick={onSubmit} isLoading={isLoading}>{t("create")}</Button>
    </div>
  </div>
)

export const config = defineRouteConfig({
  label: "Product Attributes",
  icon: Tag,
})

export default ProductAttributesSettingsPage
