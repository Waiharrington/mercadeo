import {
  TrendingUpIcon,
  FilterIcon,
} from "lucide-react"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { FinanceSummaryCard } from "@/components/finances/finance-summary-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/actions/auth"

export const metadata = {
  title: "Ingresos",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

interface IncomePageProps {
  searchParams?: Promise<{
    from?: string
    to?: string
    payment_method?: string
  }>
}

export default async function IncomePage({ searchParams }: IncomePageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { profile } = await getCurrentUser()

  if (!profile) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Ingresos</h1>
          <p className="text-muted-foreground">Necesitas estar autenticado.</p>
        </div>
      </DashboardShell>
    )
  }

  const businessId = profile.id

  let query = supabase
    .schema("mercadeo")
    .from("sales")
    .select("*, customers(name, phone)")
    .eq("business_id", businessId)
    .eq("sale_status", "completed")
    .order("created_at", { ascending: false })

  if (params?.from) {
    query = query.gte("created_at", params.from)
  }
  if (params?.to) {
    const endDate = new Date(params.to)
    endDate.setDate(endDate.getDate() + 1)
    query = query.lte("created_at", endDate.toISOString())
  }
  if (params?.payment_method) {
    query = query.eq("payment_method", params.payment_method)
  }

  const { data: sales } = await query

  const allSales = (sales ?? []) as any[]

  const totalAmount = allSales.reduce(
    (sum: number, s: any) => sum + Number(s.total_amount),
    0
  )

  const paymentMethodCounts: Record<string, number> = {}
  for (const sale of allSales) {
    const method = sale.payment_method ?? "Otro"
    paymentMethodCounts[method] = (paymentMethodCounts[method] ?? 0) + 1
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ingresos</h1>
            <p className="text-muted-foreground">
              Historial de ventas completadas e ingresos del negocio.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FinanceSummaryCard
            icon={<TrendingUpIcon className="size-4 text-emerald-600" />}
            label="Total Ingresos"
            amount={totalAmount}
          />
          <FinanceSummaryCard
            icon={<TrendingUpIcon className="size-4" />}
            label="Total Transacciones"
            amount={allSales.length}
            currency=""
          />
          <FinanceSummaryCard
            icon={<TrendingUpIcon className="size-4 text-blue-600" />}
            label="Promedio por Venta"
            amount={allSales.length > 0 ? totalAmount / allSales.length : 0}
          />
          <FinanceSummaryCard
            icon={<TrendingUpIcon className="size-4 text-emerald-600" />}
            label="Este Mes"
            amount={allSales
              .filter((s: any) => {
                const d = new Date(s.created_at)
                const now = new Date()
                return (
                  d.getMonth() === now.getMonth() &&
                  d.getFullYear() === now.getFullYear()
                )
              })
              .reduce((sum: number, s: any) => sum + Number(s.total_amount), 0)}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilterIcon className="size-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form method="GET" className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="from">Desde</Label>
                <Input
                  id="from"
                  name="from"
                  type="date"
                  defaultValue={params?.from ?? ""}
                  className="w-40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="to">Hasta</Label>
                <Input
                  id="to"
                  name="to"
                  type="date"
                  defaultValue={params?.to ?? ""}
                  className="w-40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payment_method">Metodo de Pago</Label>
                <select
                  id="payment_method"
                  name="payment_method"
                  defaultValue={params?.payment_method ?? ""}
                  className="h-8 min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                >
                  <option value="">Todos</option>
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia</option>
                  <option value="card">Tarjeta</option>
                  <option value="mobile">Movil</option>
                  <option value="credit">Credito</option>
                </select>
              </div>
              <Button type="submit" variant="outline" size="sm">
                Filtrar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Ingresos</CardTitle>
            <CardDescription>
              {allSales.length} transaccion(es) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allSales.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/30">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    No hay ingresos registrados.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Cliente</th>
                      <th className="pb-2 font-medium">Fecha</th>
                      <th className="pb-2 font-medium">Metodo de Pago</th>
                      <th className="pb-2 font-medium">Tipo</th>
                      <th className="pb-2 text-right font-medium">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {allSales.map((sale: any) => (
                      <tr key={sale.id} className="py-2">
                        <td className="py-2.5 pr-4">
                          <div className="font-medium">
                            {sale.customers?.name ?? "Sin cliente"}
                          </div>
                          {sale.customers?.phone && (
                            <div className="text-xs text-muted-foreground">
                              {sale.customers.phone}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {new Date(sale.created_at).toLocaleDateString("es-DO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-2.5 pr-4">
                          <Badge variant="secondary">
                            {sale.payment_method ?? "N/A"}
                          </Badge>
                        </td>
                        <td className="py-2.5 pr-4">
                          <Badge variant="outline">
                            {sale.sale_type ?? "Venta"}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-right font-medium tabular-nums text-emerald-600">
                          {formatCurrency(sale.total_amount)}
                        </td>
                      </tr>
                    ))}
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
