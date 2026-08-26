"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { deleteEmployee, updateEmployee } from "@/lib/actions/payroll"
import { Button } from "@/components/ui/button"

interface EmployeeActionsProps {
  employee: {
    id: string
    full_name: string
    is_active?: boolean
  }
}

export function EmployeeActions({ employee }: EmployeeActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEmployee(employee.id)
      if (result.success) {
        router.push("/payroll")
        router.refresh()
      }
      setShowConfirm(false)
    })
  }

  function handleToggleActive() {
    startTransition(async () => {
      await updateEmployee(employee.id, { is_active: !employee.is_active })
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleActive}
        disabled={isPending}
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {employee.is_active !== false ? "Desactivar" : "Activar"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/payroll/new?edit=${employee.id}`)}
      >
        <Edit className="size-4" />
        Editar
      </Button>
      {showConfirm ? (
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Confirmar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfirm(false)}
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowConfirm(true)}
        >
          <Trash2 className="size-4" />
          Eliminar
        </Button>
      )}
    </div>
  )
}
