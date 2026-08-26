import Link from "next/link"
import { Receipt, Plus, Filter, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/currency"

export const metadata = {
  title: "Facturas",
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  completed: {
    label: "Entregada",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  pending: {
    label: "Pendiente",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-red-100 text-red-800 border-red-200",
  },
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  bank_transfer: "Transferencia",
  mobile_pay: "Pago M\u00f3vil",
  card: "Tarjeta",
  debt: "Cr\u00e9dito",
  zelle: "Zelle",
  usdt: "USDT",
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: filterStatus } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: sales } = await supabase
    .schema("mercadeo")
    .from("sales")
    .select("*, customers(name, phone, id_number), sale_items(*, products(name))")
    .eq("business_id", user?.id ?? "")
    .order("created_at", { ascending: false })

  const allSales = sales ?? []

  const filteredSales = filterStatus
    ? allSales.filter((s) => s.sale_status === filterStatus)
    : allSales

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthTotal = allSales
    .filter(
      (s) =>
        s.created_at >= startOfMonth && s.sale_status !== "cancelled"
    )
    .reduce((sum, s) => sum + Number(s.total_amount), 0)

  const completedCount = allSales.filter((s) => s.sale_status === "completed").length
  const pendingCount = allSales.filter((s) => s.sale_status === "pending").length

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Facturas</h1>
            <p className="text-muted-foreground">
              Gestiona las facturas de tus ventas
            </p>
          </div>
          <Link href="/billing/new">
            <Button>
              <Plus className="size-4" />
              Nueva Factura
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <DollarSign className="size-3" />
                Total Facturado (Mes)
              </div>
              <p className="text-xl font-bold tabular-nums">
                {formatCurrency(monthTotal)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Receipt className="size-3" />
                Entregadas
              </div>
              <p className="text-xl font-bold">{completedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Receipt className="size-3" />
                Pendientes
              </div>
              <p className="text-xl font-bold">{pendingCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Facturas</CardTitle>
                <CardDescription>
                  {filteredSales.length} factura{filteredSales.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Filter className="size-4 text-muted-foreground" />
                <Link href="/billing">
                  <Badge
                    variant={!filterStatus ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    Todas
                  </Badge>
                </Link>
                <Link href="/billing?status=completed">
                  <Badge
                    variant={filterStatus === "completed" ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    Entregada
                  </Badge>
                </Link>
                <Link href="/billing?status=pending">
                  <Badge
                    variant={filterStatus === "pending" ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    Pendiente
                  </Badge>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Receipt className="mb-3 size-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No hay facturas{filterStatus ? ` con estado "${filterStatus}"` : ""}
                </p>
                <Link href="/billing/new" className="mt-3">
                  <Button variant="outline" size="sm">
                    <Plus className="size-4" />
                    Crear primera factura
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">N\u00famero</th>
                      <th className="pb-3 font-medium">Fecha</th>
                      <th className="pb-3 font-medium">Cliente</th>
                      <th className="pb-3 font-medium">M\u00e9todo Pago</th>
                      <th className="pb-3 font-medium text-right">Total</th>
                      <th className="pb-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale, index) => {
                      const statusConfig =
                        STATUS_LABELS[sale.sale_status] ?? {
                          label: sale.sale_status,
                          className: "bg-secondary text-secondary-foreground",
                        }

                      return (
                        <tr
                          key={sale.id}
                          className="border-b last:border-0"
                        >
                          <td className="py-3">
                            <Link
                              href={`/billing/${sale.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              INV-{new Date(sale.created_at).getFullYear()}
                              {String(new Date(sale.created_at).getMonth() + 1).padStart(2, "0")}-
                              {String(index + 1).padStart(4, "0")}
                            </Link>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {formatDate(sale.created_at)}
                          </td>
                          <td className="py-3">
                            <p className="font-medium">
                              {sale.customers?.name || "Cliente general"}
                            </p>
                          </td>
                          <td className="py-3">
                            <Badge variant="outline" className="text-[10px]">
                              {PAYMENT_LABELS[sale.payment_method] || sale.payment_method}
                            </Badge>
                          </td>
                          <td className="py-3 text-right font-medium tabular-nums">
                            {formatCurrency(Number(sale.total_amount))}
                          </td>
                          <td className="py-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${statusConfig.className}`}
                            >
                              {statusConfig.label}
                            </Badge>
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
      </div>
    </DashboardShell>
  )
}
