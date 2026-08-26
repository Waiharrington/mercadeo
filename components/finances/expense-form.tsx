"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createExpense } from "@/lib/actions/finances"

const CATEGORIES = [
  "Alquiler",
  "Nomina",
  "Proveedores",
  "Servicios",
  "Marketing",
  "Impuestos",
  "Otro",
] as const

interface ExpenseFormProps {
  businessId: string
  onSuccess?: () => void
}

export function ExpenseForm({ businessId, onSuccess }: ExpenseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [form, setForm] = React.useState({
    title: "",
    description: "",
    category: "Otro",
    amount: "",
    currency: "USD",
    expense_date: new Date().toISOString().split("T")[0],
    is_recurring: false,
    recurring_frequency: "",
  })

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.title.trim()) {
      setError("El titulo es requerido")
      return
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError("El monto debe ser mayor a 0")
      return
    }
    if (!form.category) {
      setError("Selecciona una categoria")
      return
    }

    setLoading(true)
    try {
      const result = await createExpense(businessId, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        amount: Number(form.amount),
        currency: form.currency,
        expense_date: form.expense_date,
        is_recurring: form.is_recurring,
        recurring_frequency: form.is_recurring ? form.recurring_frequency : undefined,
      })

      if (!result.success) {
        setError(result.error ?? "Error al crear el gasto")
        return
      }

      setForm({
        title: "",
        description: "",
        category: "Otro",
        amount: "",
        currency: "USD",
        expense_date: new Date().toISOString().split("T")[0],
        is_recurring: false,
        recurring_frequency: "",
      })

      router.refresh()
      onSuccess?.()
    } catch {
      setError("Error inesperado al crear el gasto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Gasto</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo *</Label>
              <Input
                id="title"
                placeholder="Ej: Alquiler oficina"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                disabled={loading}
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 md:text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Input
              id="description"
              placeholder="Descripcion opcional"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <select
                id="currency"
                value={form.currency}
                onChange={(e) => updateField("currency", e.target.value)}
                disabled={loading}
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 md:text-sm"
              >
                <option value="USD">USD</option>
                <option value="Bs.">Bs.</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense_date">Fecha</Label>
              <Input
                id="expense_date"
                type="date"
                value={form.expense_date}
                onChange={(e) => updateField("expense_date", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_recurring}
                onChange={(e) => updateField("is_recurring", e.target.checked)}
                disabled={loading}
                className="size-4 rounded border-input"
              />
              Gasto recurrente
            </label>
            {form.is_recurring && (
              <select
                value={form.recurring_frequency}
                onChange={(e) => updateField("recurring_frequency", e.target.value)}
                disabled={loading}
                className="h-8 min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 md:text-sm"
              >
                <option value="">Frecuencia</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2Icon className="size-4 animate-spin" />}
            {loading ? "Guardando..." : "Registrar Gasto"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
