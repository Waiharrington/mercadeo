import Link from "next/link"
import {
  ShoppingCart,
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { StatsCard } from "@/components/dashboard/stats-card"
import { SaleStatusBadge } from "@/components/sales/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export const metadata = {
  title: "Ordenes / Ventas",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  bank_transfer: "Transferencia",
  mobile_pay: "Pago Movil",
  card: "Tarjeta",
  debt: "Deuda",
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; start?: string; end?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .schema("mercadeo")
    .from("profiles")
    .select("business_id")
    .eq("id", user.id)
    .single()

  const businessId = profile?.business_id ?? ""

  let query = supabase
    .schema("mercadeo")
    .from("sales")
    .select("*, customers(name, phone), sale_items(*, products(name))")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })

  if (params.status) {
    query = query.eq("sale_status", params.status)
  }
  if (params.start) {
    query = query.gte("created_at", params.start)
  }
  if (params.end) {
    const endDate = new Date(params.end)
    endDate.setDate(endDate.getDate() + 1)
    query = query.lte("created_at", endDate.toISOString())
  }

  const { data: sales } = await query
  const allSales = sales ?? []

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const todaySales = allSales.filter(
    (s) => s.created_at >= startOfDay && s.sale_status === "completed"
  )
  const monthSales = allSales.filter(
    (s) => s.created_at >= startOfMonth && s.sale_status === "completed"
  )

  const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total_amount), 0)
  const monthRevenue = monthSales.reduce((sum, s) => sum + Number(s.total_amount), 0)
  const totalRevenue = allSales
    .filter((s) => s.sale_status === "completed")
    .reduce((sum, s) => sum + Number(s.total_amount), 0)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ordenes / Ventas</h1>
            <p className="text-muted-foreground">
              Gestiona todas las ventas y ordenes de tu negocio.
            </p>
          </div>
          <Link href="/orders/new">
            <Button>
              <Plus className="size-4" />
              Nueva Venta
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Ventas Hoy"
            value={formatCurrency(todayRevenue)}
            icon={DollarSign}
            description={`${todaySales.length} transacciones`}
          />
          <StatsCard
            title="Ventas del Mes"
            value={formatCurrency(monthRevenue)}
            icon={TrendingUp}
            description={`${monthSales.length} transacciones`}
          />
          <StatsCard
            title="Total Ventas"
            value={formatCurrency(totalRevenue)}
            icon={ShoppingCart}
            description={`${allSales.filter((s) => s.sale_status === "completed").length} completadas`}
          />
          <StatsCard
            title="Pendientes"
            value={String(allSales.filter((s) => s.sale_status === "pending").length)}
            icon={Calendar}
            description="Esperando confirmacion"
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Historial de Ventas</CardTitle>
                <CardDescription>
                  {allSales.length} ventas registradas
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <form className="flex gap-2">
                  <select
                    name="status"
                    defaultValue={params.status}
                    className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Todas</option>
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="refunded">Reembolsada</option>
                  </select>
                  <Input
                    name="start"
                    type="date"
                    defaultValue={params.start}
                    className="w-36"
                  />
                  <Input
                    name="end"
                    type="date"
                    defaultValue={params.end}
                    className="w-36"
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Filtrar
                  </Button>
                </form>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {allSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="mb-3 size-10 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  No hay ventas registradas
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Crea tu primera venta para comenzar a rastrear ingresos.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {allSales.map((sale) => (
                  <Link
                    key={sale.id}
                    href={`/orders/${sale.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <ShoppingCart className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {sale.customers?.name || "Cliente general"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(sale.created_at)} &middot;{" "}
                          {PAYMENT_LABELS[sale.payment_method] || sale.payment_method}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium tabular-nums">
                          {formatCurrency(Number(sale.total_amount))}
                        </p>
                      </div>
                      <SaleStatusBadge status={sale.sale_status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
