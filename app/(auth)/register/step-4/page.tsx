"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/lib/actions/auth"

export default function Step4Page() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    description: "",
    category_niche: "",
    client_count_approx: "",
    monthly_revenue_approx: "",
    monthly_expenses_approx: "",
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await updateProfile({
      description: form.description || null,
      category_niche: form.category_niche || null,
      client_count_approx: form.client_count_approx ? Number(form.client_count_approx) : 0,
      monthly_revenue_approx: form.monthly_revenue_approx ? Number(form.monthly_revenue_approx) : 0,
      monthly_expenses_approx: form.monthly_expenses_approx ? Number(form.monthly_expenses_approx) : 0,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push("/register/step-5-plan")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Datos operacionales</CardTitle>
        <CardDescription>
          Cuéntanos sobre las operaciones de tu negocio.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">Descripcion del negocio</Label>
            <Input
              id="description"
              placeholder="Describe que vende tu negocio"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category_niche">Producto/Modelo/Nicho</Label>
            <Input
              id="category_niche"
              placeholder="Ej: Ropa femenina, Servicios de consultoria"
              value={form.category_niche}
              onChange={(e) => updateField("category_niche", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_count_approx">Volumen de clientes</Label>
            <Input
              id="client_count_approx"
              type="number"
              placeholder="Ej: 50"
              value={form.client_count_approx}
              onChange={(e) => updateField("client_count_approx", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_revenue_approx">Ingreso aproximado</Label>
              <Input
                id="monthly_revenue_approx"
                type="number"
                placeholder="0.00"
                value={form.monthly_revenue_approx}
                onChange={(e) => updateField("monthly_revenue_approx", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly_expenses_approx">Gastos aproximados</Label>
              <Input
                id="monthly_expenses_approx"
                type="number"
                placeholder="0.00"
                value={form.monthly_expenses_approx}
                onChange={(e) => updateField("monthly_expenses_approx", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Guardando..." : "Continuar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
