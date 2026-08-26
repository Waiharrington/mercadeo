import Link from "next/link"
import { redirect } from "next/navigation"
import {
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/actions/auth"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = {
  title: "Contabilidad",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export default async function AccountingPage() {
  const supabase = await createClient()
  const { profile } = await getCurrentUser()

  if (!profile) redirect("/login")

  const businessId = profile.id

  const [salesResult, expensesResult, receivableResult, payableResult] =
    await Promise.all([
      supabase
        .schema("mercadeo")
        .from("sales")
        .select("total_amount, created_at")
        .eq("business_id", businessId)
        .eq("sale_status", "completed"),
      supabase
        .schema("mercadeo")
        .from("expenses")
        .select("amount, expense_date, category")
        .eq("business_id", businessId),
      supabase
        .schema("mercadeo")
        .from("accounts_receivable")
        .select("remaining_amount, status")
        .eq("business_id", businessId)
        .in("status", ["pending", "partial", "overdue"]),
      supabase
        .schema("mercadeo")
        .from("accounts_payable")
        .select("remaining_amount, status")
        .eq("business_id", businessId)
        .in("status", ["pending", "partial", "overdue"]),
    ])

  interface Row { total_amount?: number; amount?: number; remaining_amount?: number; created_at?: string; expense_date?: string; category?: string }
  const salesData = ((salesResult as { data?: Row[] }).data ?? []) as Row[]
  const expensesData = ((expensesResult as { data?: Row[] }).data ?? []) as Row[]
  const receivableData = ((receivableResult as { data?: Row[] }).data ?? []) as Row[]
  const payableData = ((payableResult as { data?: Row[] }).data ?? []) as Row[]

  const totalIncome = salesData.reduce(
    (sum, s) => sum + Number(s.total_amount),
    0
  )
  const totalExpenses = expensesData.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  )
  const netProfit = totalIncome - totalExpenses
  const totalReceivable = receivableData.reduce(
    (sum, r) => sum + Number(r.remaining_amount),
    0
  )
  const totalPayable = payableData.reduce(
    (sum, p) => sum + Number(p.remaining_amount),
    0
  )

  const now = new Date()
  const thisMonth = now.toISOString().substring(0, 7)
  const monthIncome = salesData
    .filter((s) => s.created_at?.startsWith(thisMonth))
    .reduce((sum, s) => sum + Number(s.total_amount), 0)
  const monthExpenses = expensesData
    .filter((e) => e.expense_date?.startsWith(thisMonth))
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const expenseByCategory: Record<string, number> = {}
  expensesData.forEach((e) => {
    const cat = e.category || "Sin categoria"
    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(e.amount)
  })
  const topCategories = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contabilidad</h1>
            <p className="text-muted-foreground">
              Resumen contable y reportes financieros de tu negocio.
            </p>
          </div>
          <Link href="/accounting/reports">
            <Button>
              <FileText className="size-4" />
              Ver Reportes
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Ingresos Totales"
            value={formatCurrency(totalIncome)}
            icon={TrendingUp}
            description="Periodo completo"
          />
          <StatsCard
            title="Gastos Totales"
            value={formatCurrency(totalExpenses)}
            icon={TrendingDown}
            description="Periodo completo"
          />
          <StatsCard
            title="Utilidad Neta"
            value={formatCurrency(netProfit)}
            icon={DollarSign}
            changeType={netProfit >= 0 ? "positive" : "negative"}
            change={netProfit >= 0 ? "Ganancia" : "Perdida"}
          />
          <StatsCard
            title="Flujo Neto Mes"
            value={formatCurrency(monthIncome - monthExpenses)}
            icon={Receipt}
            description={now.toLocaleDateString("es-VE", { month: "long", year: "numeric" })}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Resumen Mensual</CardTitle>
              <CardDescription>Mes actual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ingresos</span>
                <span className="text-sm font-medium tabular-nums text-emerald-600">
                  +{formatCurrency(monthIncome)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gastos</span>
                <span className="text-sm font-medium tabular-nums text-red-600">
                  -{formatCurrency(monthExpenses)}
                </span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Neto</span>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    monthIncome - monthExpenses >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(monthIncome - monthExpenses)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cuentas Pendientes</CardTitle>
              <CardDescription>Estado de cobros y pagos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Por Cobrar
                </span>
                <span className="text-sm font-medium tabular-nums text-amber-600">
                  {formatCurrency(totalReceivable)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Por Pagar
                </span>
                <span className="text-sm font-medium tabular-nums text-blue-600">
                  {formatCurrency(totalPayable)}
                </span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Posicion Neta</span>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    totalReceivable - totalPayable >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(totalReceivable - totalPayable)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
              <CardDescription>Top categorias del periodo</CardDescription>
            </CardHeader>
            <CardContent>
              {topCategories.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Sin gastos registrados.
                </p>
              ) : (
                <div className="space-y-3">
                  {topCategories.map(([category, amount]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-muted-foreground truncate">
                        {category}
                      </span>
                      <span className="text-sm font-medium tabular-nums">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rapidas</CardTitle>
            <CardDescription>Exportar y generar reportes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/accounting/reports" className="block">
                <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <FileText className="size-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Reportes</p>
                    <p className="text-xs text-muted-foreground">
                      Balance, estado de resultados
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/finances/income" className="block">
                <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <TrendingUp className="size-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">Ingresos</p>
                    <p className="text-xs text-muted-foreground">
                      Registrar ingresos
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/finances/expenses" className="block">
                <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <TrendingDown className="size-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Gastos</p>
                    <p className="text-xs text-muted-foreground">
                      Registrar gastos
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/payroll" className="block">
                <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <DollarSign className="size-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium">Nomina</p>
                    <p className="text-xs text-muted-foreground">
                      Gestionar empleados
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
