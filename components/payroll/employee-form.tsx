"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { createEmployee, updateEmployee } from "@/lib/actions/payroll"
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

interface EmployeeFormProps {
  mode?: "create" | "edit"
  employeeId?: string
  businessId: string
  initialData?: {
    full_name?: string
    position?: string
    phone?: string
    email?: string
    salary?: number
    commission_rate?: number
    hire_date?: string
  }
}

export function EmployeeForm({
  mode = "create",
  employeeId,
  businessId,
  initialData,
}: EmployeeFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    const data = {
      full_name: formData.get("full_name") as string,
      position: (formData.get("position") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
      salary: parseFloat(formData.get("salary") as string) || 0,
      commission_rate: parseFloat(formData.get("commission_rate") as string) || 0,
      hire_date: (formData.get("hire_date") as string) || undefined,
    }

    if (!data.full_name.trim()) {
      setError("El nombre completo es requerido.")
      return
    }

    if (data.commission_rate < 0 || data.commission_rate > 100) {
      setError("La tasa de comision debe estar entre 0 y 100.")
      return
    }

    startTransition(async () => {
      const result =
        mode === "edit" && employeeId
          ? await updateEmployee(employeeId, data)
          : await createEmployee(businessId, data)

      if (result.success) {
        router.push("/payroll")
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
          {mode === "edit" ? "Editar Empleado" : "Nuevo Empleado"}
        </CardTitle>
        <CardDescription>
          {mode === "edit"
            ? "Actualiza la informacion del empleado."
            : "Agrega un nuevo empleado a tu negocio."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo *</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={initialData?.full_name}
                placeholder="Nombre del empleado"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                name="position"
                defaultValue={initialData?.position}
                placeholder="Ej: Vendedor, Gerente"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={initialData?.phone}
                placeholder="0412-1234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initialData?.email}
                placeholder="empleado@email.com"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="salary">Salario Base ($)</Label>
              <Input
                id="salary"
                name="salary"
                type="number"
                min="0"
                step="0.01"
                defaultValue={initialData?.salary ?? 0}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission_rate">Comision (%)</Label>
              <Input
                id="commission_rate"
                name="commission_rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                defaultValue={initialData?.commission_rate ?? 0}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hire_date">Fecha de Contratacion</Label>
              <Input
                id="hire_date"
                name="hire_date"
                type="date"
                defaultValue={initialData?.hire_date ?? new Date().toISOString().split("T")[0]}
              />
            </div>
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
            {mode === "edit" ? "Guardar Cambios" : "Crear Empleado"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
