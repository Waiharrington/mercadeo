"use client"

import * as React from "react"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AccountsTable } from "@/components/finances/accounts-table"
import { updateAccountsPayable, getAccountsPayable } from "@/lib/actions/finances"
import { getCurrentUser } from "@/lib/actions/auth"

export const metadata = {
  title: "Cuentas por Pagar",
}

export default function AccountsPayablePage() {
  const [accounts, setAccounts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function load() {
      try {
        const { profile } = await getCurrentUser()
        if (!profile) {
          setError("No autenticado")
          setLoading(false)
          return
        }
        const result = await getAccountsPayable(profile.id)
        if (result.success && result.data) {
          setAccounts(result.data)
        } else {
          setError(result.error ?? "Error al cargar datos")
        }
      } catch {
        setError("Error al cargar datos")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleUpdatePayment(id: string, paidAmount: number) {
    return await updateAccountsPayable(id, { paid_amount: paidAmount })
  }

  const totalPending = accounts
    .filter((a) => a.status !== "paid")
    .reduce((sum, a) => sum + Number(a.remaining_amount), 0)
  const totalOverdue = accounts
    .filter((a) => a.status === "overdue")
    .reduce((sum, a) => sum + Number(a.remaining_amount), 0)

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Cuentas por Pagar</h1>
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Cuentas por Pagar</h1>
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cuentas por Pagar</h1>
          <p className="text-muted-foreground">
            Control de deudas pendientes de pago a proveedores.
          </p>
        </div>

        <AccountsTable
          type="payable"
          accounts={accounts}
          totalPending={totalPending}
          totalOverdue={totalOverdue}
          onUpdatePayment={handleUpdatePayment}
        />
      </div>
    </DashboardShell>
  )
}
