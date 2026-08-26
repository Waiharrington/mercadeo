"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { createCustomer, updateCustomer } from "@/lib/actions/customers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CustomerFormProps {
  mode?: "create" | "edit"
  customerId?: string
  businessId: string
  initialData?: {
    name?: string
    email?: string
    phone?: string
    address?: string
    id_number?: string
    notes?: string
  }
}

export function CustomerForm({
  mode = "create",
  customerId,
  businessId,
  initialData,
}: CustomerFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    const data = {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      id_number: (formData.get("id_number") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    }

    if (!data.name.trim()) {
      setError("El nombre es requerido.")
      return
    }

    startTransition(async () => {
      const result =
        mode === "edit" && customerId
          ? await updateCustomer(customerId, data)
          : await createCustomer(businessId, data)

      if (result.success) {
        router.push("/customers")
        router.refresh()
      } else {
        setError(result.error || "Ocurrio un error.")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "edit" ? "Editar Cliente" : "Nuevo Cliente"}
        </CardTitle>
        <CardDescription>
          {mode === "edit"
            ? "Actualiza la informacion del cliente."
            : "Agrega un nuevo cliente a tu negocio."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={initialData?.name}
                placeholder="Nombre del cliente"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={initialData?.phone}
                placeholder="0412-1234567"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initialData?.email}
                placeholder="cliente@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_number">Cedula / RIF</Label>
              <Input
                id="id_number"
                name="id_number"
                defaultValue={initialData?.id_number}
                placeholder="V-12345678"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Direccion</Label>
            <Input
              id="address"
              name="address"
              defaultValue={initialData?.address}
              placeholder="Direccion del cliente"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              name="notes"
              defaultValue={initialData?.notes}
              placeholder="Notas adicionales sobre el cliente..."
              className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {mode === "edit" ? "Guardar Cambios" : "Crear Cliente"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
