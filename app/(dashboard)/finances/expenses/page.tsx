import { TrendingDownIcon, FilterIcon } from "lucide-react"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { FinanceSummaryCard } from "@/components/finances/finance-summary-card"
import { ExpenseForm } from "@/components/finances/expense-form"
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
  title: "Gastos",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const CATEGORIES = [
  "Alquiler",
  "Nomina",
  "Proveedores",
  "Servicios",
  "Marketing",
  "Impuestos",
  "Otro",
]

interface ExpensesPageProps {
  searchParams?: Promise<{
    from?: string
    to?: string
    category?: string
  }>
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { profile } = await getCurrentUser()

  if (!profile) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Gastos</h1>
          <p className="text-muted-foreground">Necesitas estar autenticado.</p>
        </div>
      </DashboardShell>
    )
  }

  const businessId = profile.id

  let query = supabase
    .schema("mercadeo")
    .from("expenses")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })

  if (params?.category) {
    query = query.eq("category", params.category)
  }
  if (params?.from) {
    query = query.gte("expense_date", params.from)
  }
  if (params?.to) {
    query = query.lte("expense_date", params.to)
  }

  const { data: expenses } = await query

  const allExpenses = (expenses ?? []) as any[]

  const totalAmount = allExpenses.reduce(
    (sum: number, e: any) => sum + Number(e.amount),
    0
  )

  const categoryBreakdown: Record<string, number> = {}
  for (const exp of allExpenses) {
    const cat = exp.category ?? "Otro"
    categoryBreakdown[cat] = (categoryBreakdown[cat] ?? 0) + Number(exp.amount)
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gastos</h1>
          <p className="text-muted-foreground">
            Registro y control de gastos del negocio.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FinanceSummaryCard
            icon={<TrendingDownIcon className="size-4 text-red-600" />}
            label="Total Gastos"
            amount={totalAmount}
          />
          <FinanceSummaryCard
            icon={<TrendingDownIcon className="size-4" />}
            label="Total Registros"
            amount={allExpenses.length}
            currency=""
          />
          <FinanceSummaryCard
            icon={<TrendingDownIcon className="size-4 text-amber-600" />}
            label="Promedio por Gasto"
            amount={allExpenses.length > 0 ? totalAmount / allExpenses.length : 0}
          />
          <FinanceSummaryCard
            icon={<TrendingDownIcon className="size-4 text-blue-600" />}
            label="Mayor Gasto"
            amount={Math.max(...allExpenses.map((e: any) => Number(e.amount)), 0)}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
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
                    <Label htmlFor="category">Categoria</Label>
                    <select
                      id="category"
                      name="category"
                      defaultValue={params?.category ?? ""}
                      className="h-8 min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                    >
                      <option value="">Todas</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" variant="outline" size="sm">
                    Filtrar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-sm">Por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(categoryBreakdown).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin datos</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(categoryBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cat, amount]) => (
                        <div key={cat} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{cat}</span>
                          <span className="font-medium tabular-nums">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-1">
            <ExpenseForm businessId={businessId} />
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Gastos</CardTitle>
                <CardDescription>
                  {allExpenses.length} registro(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allExpenses.length === 0 ? (
                  <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      No hay gastos registrados.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[500px] space-y-3 overflow-y-auto">
                    {allExpenses.map((expense: any) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <TrendingDownIcon className="size-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{expense.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(expense.expense_date ?? expense.created_at).toLocaleDateString(
                                "es-DO",
                                { day: "numeric", month: "short", year: "numeric" }
                              )}{" "}
                              ·{" "}
                              <Badge variant="secondary" className="text-[10px]">
                                {expense.category}
                              </Badge>
                              {expense.is_recurring && (
                                <Badge variant="outline" className="ml-1 text-[10px]">
                                  Recurrente
                                </Badge>
                              )}
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
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
