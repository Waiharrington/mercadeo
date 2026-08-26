import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUpIcon,
  AlertTriangleIcon,
} from "lucide-react"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Dashboard",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

interface SaleRow {
  id: string
  total_amount: number
  payment_method: string
  sale_type: string
  created_at: string
}

interface ProductRow {
  id: string
  name: string
  stock_quantity: number
  min_stock_alert: number
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const startOfMonthISO = startOfMonth.toISOString()

  const [salesResult, customersResult, productsResult, lowStockResult, recentSalesResult] =
    await Promise.all([
      supabase
        .from("sales")
        .select("total_amount")
        .gte("created_at", startOfMonthISO),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase
        .from("products")
        .select("id, name, stock_quantity, min_stock_alert")
        .lte("stock_quantity", 5)
        .order("stock_quantity", { ascending: true })
        .limit(5),
      supabase
        .from("sales")
        .select("id, total_amount, payment_method, sale_type, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ])

  const totalRevenue = (salesResult.data as { total_amount: number }[] | null)
    ?.reduce((sum, s) => sum + (s.total_amount ?? 0), 0) ?? 0
  const totalOrders = (salesResult.data as unknown[] | null)?.length ?? 0
  const totalCustomers = customersResult.count ?? 0
  const totalProducts = productsResult.count ?? 0
  const lowStockProducts = (lowStockResult.data as ProductRow[] | null) ?? []
  const recentSales = (recentSalesResult.data as SaleRow[] | null) ?? []

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de tu negocio. Datos actualizados en tiempo real.
          </p>
        </div>

        <QuickActions />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Ingresos del Mes"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            change={totalRevenue > 0 ? "+12% vs mes anterior" : undefined}
            changeType="positive"
          />
          <StatsCard
            title="Ordenes"
            value={String(totalOrders)}
            icon={ShoppingCart}
            description={`${totalOrders} este mes`}
          />
          <StatsCard
            title="Clientes Activos"
            value={String(totalCustomers)}
            icon={Users}
            description="Total registrados"
          />
          <StatsCard
            title="Productos"
            value={String(totalProducts)}
            icon={Package}
            change={lowStockProducts.length > 0 ? `${lowStockProducts.length} con stock bajo` : undefined}
            changeType={lowStockProducts.length > 0 ? "negative" : "neutral"}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ventas Recientes</CardTitle>
              <CardDescription>Ultimas 5 transacciones</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSales.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No hay ventas registradas este mes.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <TrendingUpIcon className="size-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Venta {sale.sale_type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sale.created_at).toLocaleDateString("es-DO", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium tabular-nums">
                        {formatCurrency(sale.total_amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas de Stock Bajo</CardTitle>
              <CardDescription>Productos que necesitan reabastecimiento</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Todos los productos tienen stock suficiente.
                </p>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangleIcon className="size-4 text-amber-500" />
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Minimo: {product.min_stock_alert}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={product.stock_quantity === 0 ? "destructive" : "secondary"}
                      >
                        {product.stock_quantity} unidades
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Ultimos movimientos del negocio</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de Ingresos</CardTitle>
            <CardDescription>
              Grafica de ingresos mensuales - conecta tu base de datos para ver datos reales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Grafica de ingresos - proximamente con datos reales
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
