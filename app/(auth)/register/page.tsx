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
import { signUp } from "@/lib/actions/auth"

const countries = [
  "Venezuela",
  "Colombia",
  "Mexico",
  "Argentina",
  "Chile",
  "Peru",
  "Ecuador",
  "Bolivia",
  "Paraguay",
  "Uruguay",
  "Otro",
]

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userType, setUserType] = useState<"personal" | "business">("personal")
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    country: "Venezuela",
    location: "",
    cedula: "",
    phone: "",
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signUp(form.email, form.password, {
      first_name: form.first_name,
      last_name: form.last_name,
      country: form.country,
      location: form.location,
      cedula: form.cedula,
      phone: form.phone,
      user_type: userType,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (userType === "personal") {
      router.push("/register/step-2-personal")
    } else {
      router.push("/register/step-2-business")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crea tu cuenta</CardTitle>
        <CardDescription>
          Comienza a gestionar tu negocio con MERCADEO en minutos.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input
                id="first_name"
                placeholder="Juan"
                value={form.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input
                id="last_name"
                placeholder="Perez"
                value={form.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electronico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@negocio.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contrasena</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Pais</Label>
            <select
              id="country"
              value={form.country}
              onChange={(e) => updateField("country", e.target.value)}
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              required
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Ubicacion</Label>
            <Input
              id="location"
              placeholder="Ciudad, Estado"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cedula">Cedula</Label>
              <Input
                id="cedula"
                placeholder="V-12345678"
                value={form.cedula}
                onChange={(e) => updateField("cedula", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+58 412 1234567"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <div className="grid w-full grid-cols-2 gap-3">
            <Button
              type="button"
              variant={userType === "personal" ? "default" : "outline"}
              onClick={() => setUserType("personal")}
            >
              Soy Persona
            </Button>
            <Button
              type="button"
              variant={userType === "business" ? "default" : "outline"}
              onClick={() => setUserType("business")}
            >
              Tengo Empresa
            </Button>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando cuenta..." : "Continuar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
