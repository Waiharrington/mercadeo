"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, DollarSignIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type AccountType = "receivable" | "payable"

interface AccountRecord {
  id: string
  total_amount: number
  paid_amount: number
  remaining_amount: number
  due_date: string
  status: string
  notes?: string | null
  customer?: { name: string; phone?: string } | null
  supplier_name?: string
  description?: string | null
}

interface AccountsTableProps {
  type: AccountType
  accounts: AccountRecord[]
  totalPending: number
  totalOverdue: number
  onUpdatePayment: (
    id: string,
    paidAmount: number
  ) => Promise<{ success: boolean; error?: string }>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

function getStatusBadge(status: string) {
  switch (status) {
    case "paid":
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Pagado</Badge>
    case "partial":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Parcial</Badge>
    case "overdue":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Vencido</Badge>
    case "pending":
    default:
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendiente</Badge>
  }
}

export function AccountsTable({
  type,
  accounts,
  totalPending,
  totalOverdue,
  onUpdatePayment,
}: AccountsTableProps) {
  const router = useRouter()
  const [selectedAccount, setSelectedAccount] = React.useState<AccountRecord | null>(null)
  const [paymentAmount, setPaymentAmount] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  function openPaymentDialog(account: AccountRecord) {
    setSelectedAccount(account)
    setPaymentAmount(String(account.remaining_amount))
    setError(null)
    setDialogOpen(true)
  }

  async function handleRecordPayment() {
    if (!selectedAccount) return

    const amount = Number(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Ingresa un monto valido")
      return
    }
    if (amount > selectedAccount.remaining_amount) {
      setError(`El monto no puede exceder ${formatCurrency(selectedAccount.remaining_amount)}`)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const newPaidAmount = selectedAccount.paid_amount + amount
      const result = await onUpdatePayment(selectedAccount.id, newPaidAmount)
      if (!result.success) {
        setError(result.error ?? "Error al registrar pago")
        return
      }
      setDialogOpen(false)
      setSelectedAccount(null)
      router.refresh()
    } catch {
      setError("Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  const title = type === "receivable" ? "Cuentas por Cobrar" : "Cuentas por Pagar"
  const entityLabel = type === "receivable" ? "Cliente" : "Proveedor"

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total Pendiente</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-amber-600 tabular-nums">
              {formatCurrency(totalPending)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Vencido</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-red-600 tabular-nums">
              {formatCurrency(totalOverdue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cuentas Activas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tabular-nums">
              {accounts.filter((a) => a.status !== "paid").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {accounts.length === 0
              ? `No hay ${type === "receivable" ? "cuentas por cobrar" : "cuentas por pagar"} registradas.`
              : `${accounts.length} registro(s) en total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/30">
              <p className="text-sm text-muted-foreground">Sin registros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">{entityLabel}</th>
                    <th className="pb-2 text-right font-medium">Monto Total</th>
                    <th className="pb-2 text-right font-medium">Pagado</th>
                    <th className="pb-2 text-right font-medium">Pendiente</th>
                    <th className="pb-2 font-medium">Vencimiento</th>
                    <th className="pb-2 font-medium">Estado</th>
                    <th className="pb-2 text-right font-medium">Accion</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {accounts.map((account) => {
                    const entityName =
                      type === "receivable"
                        ? account.customer?.name ?? "Sin cliente"
                        : account.supplier_name ?? "Sin proveedor"
                    return (
                      <tr key={account.id} className="py-2">
                        <td className="py-2.5 pr-4">
                          <div className="font-medium">{entityName}</div>
                          {account.description && (
                            <div className="text-xs text-muted-foreground">
                              {account.description}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 pr-4 text-right tabular-nums">
                          {formatCurrency(account.total_amount)}
                        </td>
                        <td className="py-2.5 pr-4 text-right tabular-nums text-emerald-600">
                          {formatCurrency(account.paid_amount)}
                        </td>
                        <td className="py-2.5 pr-4 text-right tabular-nums text-amber-600">
                          {formatCurrency(account.remaining_amount)}
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {new Date(account.due_date).toLocaleDateString("es-DO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-2.5 pr-4">
                          {getStatusBadge(account.status)}
                        </td>
                        <td className="py-2.5 text-right">
                          {account.status !== "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPaymentDialog(account)}
                            >
                              <DollarSignIcon className="size-3.5" />
                              Pagar
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              {selectedAccount &&
                `Registrando pago para ${
                  type === "receivable"
                    ? selectedAccount.customer?.name ?? "cliente"
                    : selectedAccount.supplier_name ?? "proveedor"
                }`}
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Monto Total</p>
                  <p className="font-medium tabular-nums">
                    {formatCurrency(selectedAccount.total_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ya Pagado</p>
                  <p className="font-medium tabular-nums text-emerald-600">
                    {formatCurrency(selectedAccount.paid_amount)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-amount">Monto a Pagar</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedAccount.remaining_amount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Pendiente: {formatCurrency(selectedAccount.remaining_amount)}
                </p>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button onClick={handleRecordPayment} disabled={loading}>
                  {loading && <Loader2Icon className="size-4 animate-spin" />}
                  {loading ? "Guardando..." : "Registrar Pago"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
