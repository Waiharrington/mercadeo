"use client"

import { useState, useRef } from "react"
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

export default function Step6BrandingPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fileName, setFileName] = useState("")
  const [form, setForm] = useState({
    business_name: "",
    primary_color: "#10B981",
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await updateProfile({
      business_name: form.business_name || undefined,
      primary_color: form.primary_color || undefined,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Personaliza tu marca</CardTitle>
        <CardDescription>
          Configura la apariencia de tu negocio en MERCADEO.
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
            <Label>Logo del negocio</Label>
            <div
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-muted-foreground/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {fileName ? (
                <p className="text-sm text-foreground">{fileName}</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Arrastra tu logo o haz clic para seleccionar
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG hasta 5MB
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_name">Nombre comercial</Label>
            <Input
              id="business_name"
              placeholder="Nombre que veran tus clientes"
              value={form.business_name}
              onChange={(e) => updateField("business_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primary_color">Color de marca</Label>
            <div className="flex items-center gap-3">
              <input
                id="primary_color"
                type="color"
                value={form.primary_color}
                onChange={(e) => updateField("primary_color", e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border border-input"
              />
              <Input
                type="text"
                value={form.primary_color}
                onChange={(e) => updateField("primary_color", e.target.value)}
                className="flex-1"
                placeholder="#10B981"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Guardando..." : "Continuar al Dashboard"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
