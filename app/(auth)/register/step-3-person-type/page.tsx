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
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/lib/actions/auth"

export default function Step3PersonTypePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(type: "natural_person" | "legal_firm") {
    setError("")
    setLoading(true)

    const result = await updateProfile({
      legal_type: type,
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
        <CardTitle>Tipo juridico</CardTitle>
        <CardDescription>
          Selecciona el tipo de contribuyente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-3">
          <Label>Tipo de persona</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit("natural_person")}
              disabled={loading}
              className="h-auto py-4"
            >
              Persona Natural
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit("legal_firm")}
              disabled={loading}
              className="h-auto py-4"
            >
              Firma Juridica
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
