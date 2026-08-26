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

export default function Step3RifPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fileName, setFileName] = useState("")
  const [form, setForm] = useState({
    rif_number: "",
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
      rif_number: form.rif_number,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push("/register/step-4")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Registro de RIF</CardTitle>
        <CardDescription>
          Sube una imagen de tu RIF. Los datos se extraeran automaticamente.
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
            <Label>Imagen del RIF</Label>
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
                    Arrastra tu RIF o haz clic para seleccionar
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG hasta 10MB
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rif_number">Numero de RIF</Label>
            <Input
              id="rif_number"
              placeholder="J-12345678-9"
              value={form.rif_number}
              onChange={(e) => updateField("rif_number", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Se completara automaticamente al subir la imagen
            </p>
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
