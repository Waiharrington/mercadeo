import {
  DollarSign,
  TrendingUpIcon,
  TrendingDownIcon,
  CreditCard,
  Receipt,
  PlusIcon,
} from "lucide-react"
import Link from "next/link"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { FinanceSummaryCard } from "@/components/finances/finance-summary-card"
import { CashFlowChart } from "@/components/finances/cash-flow-chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/actions/auth"

export const metadata = {
  title: "Finanzas",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export default async function FinancesPage() {
  const supabase = await createClient()
  const { profile } = await getCurrentUser()

  if (!profile) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Finanzas</h1>
            <p className="text-muted-foreground">
              Necesitas estar autenticado para ver las finanzas.
            </p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const businessId = profile.id

  const [summaryResult, recentIncomeResult, recentExpensesResult, cashFlowResult] =
    await Promise.all([
      // Financial summary: income + expenses + AR + AP
      Promise.all([
        supabase
          .schema("mercadeo")
          .from("sales")
          .select("total_amount")
          .eq("business_id", businessId)
          .eq("sale_status", "completed"),
        supabase
          .schema("mercadeo")
          .from("expenses")
          .select("amount")
          .eq("business_id", businessId),
        supabase
          .schema("mercadeo")
          .from("accounts_receivable")
          .select("remaining_amount")
          .eq("business_id", businessId)
          .in("status", ["pending", "partial", "overdue"]),
        supabase
          .schema("mercadeo")
          .from("accounts_payable")
          .select("remaining_amount")
          .eq("business_id", businessId)
          .in("status", ["pending", "partial", "overdue"]),
      ]),
      // Recent income
      supabase
        .schema("mercadeo")
        .from("sales")
        .select("id, total_amount, payment_method, created_at, customers(name)")
        .eq("business_id", businessId)
        .eq("sale_status", "completed")
        .order("created_at", { ascending: false })
        .limit(5),
      // Recent expenses
      supabase
        .schema("mercadeo")
        .from("expenses")
        .select("id, title, amount, category, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5),
      // Cash flow data for chart (last 6 months)
      (async () => {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        sixMonthsAgo.setDate(1)
        sixMonthsAgo.setHours(0, 0, 0, 0)

        const [salesRes, expensesRes] = await Promise.all([
          supabase
            .schema("mercadeo")
            .from("sales")
            .select("total_amount, created_at")
            .eq("business_id", businessId)
            .eq("sale_status", "completed")
            .gte("created_at", sixMonthsAgo.toISOString()),
          supabase
            .schema("mercadeo")
            .from("expenses")
            .select("amount, expense_date")
            .eq("business_id", businessId)
            .gte("expense_date", sixMonthsAgo.toISOString().split("T")[0]),
        ])

        const months: Array<{ label: string; income: number; expenses: number }> = []
        for (let i = 5; i >= 0; i--) {
          const d = new Date()
          d.setMonth(d.getMonth() - i)
          const key = d.toISOString().substring(0, 7)
          const label = d.toLocaleDateString("es-DO", { month: "short", year: "2-digit" })
          months.push({ label, income: 0, expenses: 0 })

          for (const sale of salesRes.data ?? []) {
            if (sale.created_at.substring(0, 7) === key) {
              months[months.length - 1].income += Number(sale.total_amount)
            }
          }
          for (const exp of expensesRes.data ?? []) {
            if (exp.expense_date?.substring(0, 7) === key) {
              months[months.length - 1].expenses += Number(exp.amount)
            }
          }
        }

        return months
      })(),
    ])

  const [incomeRes, expensesRes, receivableRes, payableRes] = summaryResult

  const incomeData = (incomeRes as any).data ?? []
  const expensesData = (expensesRes as any).data ?? []
  const receivableData = (receivableRes as any).data ?? []
  const payableData = (payableRes as any).data ?? []

  const totalIncome = incomeData.reduce(
    (sum: number, s: any) => sum + Number(s.total_amount),
    0
  )
  const totalExpenses = expensesData.reduce(
    (sum: number, e: any) => sum + Number(e.amount),
    0
  )
  const netProfit = totalIncome - totalExpenses
  const totalReceivable = receivableData.reduce(
    (sum: number, r: any) => sum + Number(r.remaining_amount),
    0
  )
  const totalPayable = payableData.reduce(
    (sum: number, p: any) => sum + Number(p.remaining_amount),
    0
  )

  const recentIncome = ((recentIncomeResult as any).data ?? []) as any[]
  const recentExpenses = ((recentExpensesResult as any).data ?? []) as any[]
  const cashFlowData = (await cashFlowResult) as any[]

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Finanzas</h1>
            <p className="text-muted-foreground">
              Resumen financiero de tu negocio.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/finances/income">
              <Button size="sm">
                <PlusIcon className="size-4" />
                Registrar Ingreso
              </Button>
            </Link>
            <Link href="/finances/expenses">
              <Button size="sm" variant="outline">
                <PlusIcon className="size-4" />
                Registrar Gasto
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <FinanceSummaryCard
            icon={<TrendingUpIcon className="size-4 text-emerald-600" />}
            label="Total Ingresos"
            amount={totalIncome}
          />
          <FinanceSummaryCard
            icon={<TrendingDownIcon className="size-4 text-red-600" />}
            label="Total Gastos"
            amount={totalExpenses}
          />
          <FinanceSummaryCard
            icon={<DollarSign className="size-4" />}
            label="Utilidad Neta"
            amount={netProfit}
            trend={{
              value: netProfit >= 0 ? "Positivo" : "En perdida",
              type: netProfit >= 0 ? "positive" : "negative",
            }}
          />
          <FinanceSummaryCard
            icon={<CreditCard className="size-4 text-amber-600" />}
            label="Cuentas por Cobrar"
            amount={totalReceivable}
          />
          <FinanceSummaryCard
            icon={<Receipt className="size-4 text-blue-600" />}
            label="Cuentas por Pagar"
            amount={totalPayable}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <CashFlowChart data={cashFlowData} />

          <Card>
            <CardHeader>
              <CardTitle>Ingresos Recientes</CardTitle>
              <CardDescription>Ultimas 5 transacciones</CardDescription>
            </CardHeader>
            <CardContent>
              {recentIncome.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No hay ingresos registrados.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentIncome.map((sale: any) => (
                    <div key={sale.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                          <TrendingUpIcon className="size-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {sale.customers?.name ?? "Venta"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sale.created_at).toLocaleDateString("es-DO", {
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            · {sale.payment_method}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium tabular-nums text-emerald-600">
                        +{formatCurrency(sale.total_amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Gastos Recientes</CardTitle>
              <CardDescription>Ultimos 5 gastos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              {recentExpenses.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No hay gastos registrados.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentExpenses.map((expense: any) => (
                    <div key={expense.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                          <TrendingDownIcon className="size-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{expense.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(expense.created_at).toLocaleDateString("es-DO", {
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            · <Badge variant="secondary" className="text-[10px]">{expense.category}</Badge>
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium tabular-nums text-red-600">
                        -{formatCurrency(expense.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rapidas</CardTitle>
              <CardDescription>Accesos directos a las secciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href="/finances/income" className="block">
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <TrendingUpIcon className="size-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium">Ingresos</p>
                      <p className="text-xs text-muted-foreground">Ver y gestionar</p>
                    </div>
                  </div>
                </Link>
                <Link href="/finances/expenses" className="block">
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <TrendingDownIcon className="size-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">Gastos</p>
                      <p className="text-xs text-muted-foreground">Ver y registrar</p>
                    </div>
                  </div>
                </Link>
                <Link href="/finances/accounts-receivable" className="block">
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <CreditCard className="size-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium">Cuentas por Cobrar</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(totalReceivable)} pendiente</p>
                    </div>
                  </div>
                </Link>
                <Link href="/finances/accounts-payable" className="block">
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <Receipt className="size-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Cuentas por Pagar</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(totalPayable)} pendiente</p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
