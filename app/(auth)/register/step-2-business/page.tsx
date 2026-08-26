"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/lib/actions/auth"

export default function Step2BusinessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    business_name: "",
    business_size: "" as "Grande" | "Emprendimiento" | "",
    has_rif: null as boolean | null,
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleRifChoice(hasRif: boolean) {
    setForm((prev) => ({ ...prev, has_rif: hasRif }))
    setLoading(true)
    setError("")

    const result = await updateProfile({
      business_name: form.business_name,
      business_size: form.business_size || null,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (hasRif) {
      router.push("/register/step-3-rif")
    } else {
      router.push("/register/step-3-person-type")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Datos de empresa</CardTitle>
        <CardDescription>
          Cuéntanos sobre tu empresa para personalizar tu experiencia.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="business_name">Nombre de la empresa</Label>
          <Input
            id="business_name"
            placeholder="Mi Empresa C.A."
            value={form.business_name}
            onChange={(e) => updateField("business_name", e.target.value)}
            required
          />
        </div>
        <div className="space-y-3">
          <Label>Tamano de la empresa</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={form.business_size === "Grande" ? "default" : "outline"}
              onClick={() => updateField("business_size", "Grande")}
              className="h-auto py-3"
            >
              Grande
            </Button>
            <Button
              type="button"
              variant={form.business_size === "Emprendimiento" ? "default" : "outline"}
              onClick={() => updateField("business_size", "Emprendimiento")}
              className="h-auto py-3"
            >
              Emprendimiento
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <Label>Tiene RIF?</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleRifChoice(true)}
              disabled={!form.business_name || !form.business_size || loading}
              className="h-auto py-3"
            >
              {loading ? "Guardando..." : "Si"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleRifChoice(false)}
              disabled={!form.business_name || !form.business_size || loading}
              className="h-auto py-3"
            >
              No
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
