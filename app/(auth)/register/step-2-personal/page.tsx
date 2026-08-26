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

export default function Step2PersonalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    monthly_revenue_approx: "",
    monthly_expenses_approx: "",
    purpose: "" as "savings" | "control" | "investment" | "",
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await updateProfile({
      monthly_revenue_approx: form.monthly_revenue_approx ? Number(form.monthly_revenue_approx) : 0,
      monthly_expenses_approx: form.monthly_expenses_approx ? Number(form.monthly_expenses_approx) : 0,
      description: form.purpose || null,
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
        <CardTitle>Configuracion financiera</CardTitle>
        <CardDescription>
          Cuéntanos sobre tus finanzas para personalizar tu experiencia.
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
            <Label htmlFor="monthly_revenue_approx">Ingreso aproximado mensual</Label>
            <Input
              id="monthly_revenue_approx"
              type="number"
              placeholder="0.00"
              value={form.monthly_revenue_approx}
              onChange={(e) => updateField("monthly_revenue_approx", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly_expenses_approx">Gastos fijos</Label>
            <Input
              id="monthly_expenses_approx"
              type="number"
              placeholder="0.00"
              value={form.monthly_expenses_approx}
              onChange={(e) => updateField("monthly_expenses_approx", e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label>Proposito</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={form.purpose === "savings" ? "default" : "outline"}
                onClick={() => updateField("purpose", "savings")}
                className="h-auto py-3"
              >
                Ahorro
              </Button>
              <Button
                type="button"
                variant={form.purpose === "control" ? "default" : "outline"}
                onClick={() => updateField("purpose", "control")}
                className="h-auto py-3"
              >
                Control
              </Button>
              <Button
                type="button"
                variant={form.purpose === "investment" ? "default" : "outline"}
                onClick={() => updateField("purpose", "investment")}
                className="h-auto py-3"
              >
                Inversion
              </Button>
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
