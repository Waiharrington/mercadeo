"use client"

import { useState, useEffect, useTransition } from "react"
import {
  FileText,
  Scale,
  TrendingUp,
  ShoppingCart,
  Package,
  Loader2,
} from "lucide-react"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { BalanceSheet } from "@/components/accounting/balance-sheet"
import { AccountingExport } from "@/components/accounting/accounting-export"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ReportType = "balance" | "income-statement" | "sales-book" | "purchases-book"

interface ReportConfig {
  id: ReportType
  label: string
  description: string
  icon: typeof Scale
}

const reportTypes: ReportConfig[] = [
  {
    id: "balance",
    label: "Balance General",
    description: "Activos, pasivos y capital",
    icon: Scale,
  },
  {
    id: "income-statement",
    label: "Estado de Resultados",
    description: "Ingresos, gastos y utilidad neta",
    icon: TrendingUp,
  },
  {
    id: "sales-book",
    label: "Libro de Ventas",
    description: "Detalle de todas las ventas",
    icon: ShoppingCart,
  },
  {
    id: "purchases-book",
    label: "Libro de Compras",
    description: "Detalle de todas las compras",
    icon: Package,
  },
]

export default function AccountingReportsPage() {
  const [isPending, startTransition] = useTransition()
  const [businessId, setBusinessId] = useState<string>("")
  const [selectedReport, setSelectedReport] = useState<ReportType>("balance")

  const now = new Date()
  const [startDate, setStartDate] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  )
  const [endDate, setEndDate] = useState(now.toISOString().split("T")[0])

  interface AccountEntry { name: string; amount: number }
  interface BalanceData { type: "balance"; assets: AccountEntry[]; liabilities: AccountEntry[]; equity: AccountEntry[] }
  interface IncomeData { type: "income-statement"; income: number; expenses: number; netProfit: number; expenseBreakdown: AccountEntry[] }
  interface BookRow { [key: string]: string | number }
  interface BookData { type: "sales-book" | "purchases-book"; data: BookRow[] }
  type ReportData = BalanceData | IncomeData | BookData | null

  const [reportData, setReportData] = useState<ReportData>(null)

  useEffect(() => {
    async function loadBusinessId() {
      const { getCurrentUser } = await import("@/lib/actions/auth")
      const { profile } = await getCurrentUser()
      if (profile) setBusinessId(profile.id)
    }
    loadBusinessId()
  }, [])

  async function generateReport() {
    if (!businessId) return

    startTransition(async () => {
      const { createClient } = await import("@/lib/supabase/server")
      const supabase = await createClient()

      if (selectedReport === "balance") {
        const [salesRes, expensesRes, receivableRes, payableRes] =
          await Promise.all([
            supabase
              .schema("mercadeo")
              .from("sales")
              .select("total_amount")
              .eq("business_id", businessId)
              .eq("sale_status", "completed")
              .gte("created_at", startDate)
              .lte("created_at", endDate + "T23:59:59.999Z"),
            supabase
              .schema("mercadeo")
              .from("expenses")
              .select("amount")
              .eq("business_id", businessId)
              .gte("expense_date", startDate)
              .lte("expense_date", endDate),
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
          ])

        interface Row { total_amount?: number; amount?: number; remaining_amount?: number }
        const totalIncome = ((salesRes as { data?: Row[] }).data ?? []).reduce(
          (sum, s) => sum + Number(s.total_amount),
          0
        )
        const totalExpenses = ((expensesRes as { data?: Row[] }).data ?? []).reduce(
          (sum, e) => sum + Number(e.amount),
          0
        )
        const receivable = ((receivableRes as { data?: Row[] }).data ?? []).reduce(
          (sum, r) => sum + Number(r.remaining_amount),
          0
        )
        const payable = ((payableRes as { data?: Row[] }).data ?? []).reduce(
          (sum, p) => sum + Number(p.remaining_amount),
          0
        )

        setReportData({
          type: "balance",
          assets: [
            { name: "Caja y Bancos", amount: totalIncome - totalExpenses },
            { name: "Cuentas por Cobrar", amount: receivable },
          ],
          liabilities: [
            { name: "Cuentas por Pagar", amount: payable },
          ],
          equity: [
            { name: "Capital Social", amount: totalIncome - totalExpenses },
          ],
        })
      } else if (selectedReport === "income-statement") {
        const [salesRes, expensesRes] = await Promise.all([
          supabase
            .schema("mercadeo")
            .from("sales")
            .select("total_amount")
            .eq("business_id", businessId)
            .eq("sale_status", "completed")
            .gte("created_at", startDate)
            .lte("created_at", endDate + "T23:59:59.999Z"),
          supabase
            .schema("mercadeo")
            .from("expenses")
            .select("amount, category")
            .eq("business_id", businessId)
            .gte("expense_date", startDate)
            .lte("expense_date", endDate),
        ])

        interface IncomeRow { total_amount?: number; amount?: number; category?: string }
        const totalIncome = ((salesRes as { data?: IncomeRow[] }).data ?? []).reduce(
          (sum, s) => sum + Number(s.total_amount),
          0
        )
        const expenses = ((expensesRes as { data?: IncomeRow[] }).data ?? []) as IncomeRow[]
        const totalExpenses = expenses.reduce(
          (sum, e) => sum + Number(e.amount),
          0
        )

        const expenseByCategory: Record<string, number> = {}
        expenses.forEach((e) => {
          const cat = e.category || "Sin categoria"
          expenseByCategory[cat] =
            (expenseByCategory[cat] || 0) + Number(e.amount)
        })

        setReportData({
          type: "income-statement",
          income: totalIncome,
          expenses: totalExpenses,
          netProfit: totalIncome - totalExpenses,
          expenseBreakdown: Object.entries(expenseByCategory).map(
            ([name, amount]) => ({ name, amount })
          ),
        })
      } else if (selectedReport === "sales-book") {
        const { data: sales } = await supabase
          .schema("mercadeo")
          .from("sales")
          .select("id, total_amount, payment_method, created_at, customers(name)")
          .eq("business_id", businessId)
          .eq("sale_status", "completed")
          .gte("created_at", startDate)
          .lte("created_at", endDate + "T23:59:59.999Z")
          .order("created_at", { ascending: true })

        interface SaleRow { created_at?: string; total_amount?: number; payment_method?: string; customers?: { name?: string } }
        setReportData({
          type: "sales-book",
          data: ((sales as SaleRow[] | null) ?? []).map((s) => ({
            Fecha: s.created_at?.split("T")[0] ?? "",
            Cliente: s.customers?.name ?? "N/A",
            "Monto Total": Number(s.total_amount),
            "Metodo Pago": s.payment_method ?? "",
          })),
        })
      } else if (selectedReport === "purchases-book") {
        const { data: expenses } = await supabase
          .schema("mercadeo")
          .from("expenses")
          .select("title, amount, category, expense_date, created_at")
          .eq("business_id", businessId)
          .gte("expense_date", startDate)
          .lte("expense_date", endDate)
          .order("expense_date", { ascending: true })

        interface ExpenseRow { expense_date?: string; created_at?: string; title?: string; category?: string; amount?: number }
        setReportData({
          type: "purchases-book",
          data: ((expenses as ExpenseRow[] | null) ?? []).map((e) => ({
            Fecha: e.expense_date ?? e.created_at?.split("T")[0] ?? "",
            Descripcion: e.title ?? "",
            Categoria: e.category ?? "",
            Monto: Number(e.amount),
          })),
        })
      }
    })
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes Contables</h1>
          <p className="text-muted-foreground">
            Genera y exporta reportes financieros de tu negocio.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reportTypes.map((report) => {
            const Icon = report.icon
            return (
              <button
                key={report.id}
                onClick={() => {
                  setSelectedReport(report.id)
                  setReportData(null)
                }}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  selectedReport === report.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <Icon
                  className={`mb-2 size-5 ${
                    selectedReport === report.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <p className="text-sm font-medium">{report.label}</p>
                <p className="text-xs text-muted-foreground">
                  {report.description}
                </p>
              </button>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generar Reporte</CardTitle>
            <CardDescription>
              Selecciona el rango de fechas y genera el reporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="space-y-2">
                <Label>Fecha Inicio</Label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha Fin</Label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <Button onClick={generateReport} disabled={isPending || !businessId}>
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileText className="size-4" />
                )}
                Generar Reporte
              </Button>
            </div>
          </CardContent>
        </Card>

        {reportData?.type === "balance" && (() => {
          const bd = reportData
          return (
          <>
            <BalanceSheet
              assets={bd.assets}
              liabilities={bd.liabilities}
              equity={bd.equity}
              asOfDate={endDate}
            />
            <AccountingExport
              reportType="Balance General"
              data={[
                ...bd.assets.map((a) => ({
                  Seccion: "Activos",
                  Cuenta: a.name,
                  Monto: a.amount,
                })),
                ...bd.liabilities.map((l) => ({
                  Seccion: "Pasivos",
                  Cuenta: l.name,
                  Monto: l.amount,
                })),
                ...bd.equity.map((eq) => ({
                  Seccion: "Capital",
                  Cuenta: eq.name,
                  Monto: eq.amount,
                })),
              ]}
              filename={`balance-general-${startDate}-${endDate}`}
            />
          </>
          )
        })()}

        {reportData?.type === "income-statement" && (() => {
          const id = reportData
          return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Resultados</CardTitle>
                <CardDescription>
                  Del {startDate} al {endDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ingresos por Ventas</span>
                  <span className="text-sm font-medium tabular-nums text-emerald-600">
                    ${id.income.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Gastos</p>
                  {id.expenseBreakdown.map((e) => (
                    <div
                      key={e.name}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm text-muted-foreground">{e.name}</span>
                      <span className="text-sm tabular-nums text-red-600">
                        -${e.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="text-sm font-bold">Utilidad Neta</span>
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      id.netProfit >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    ${id.netProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
            </Card>
            <AccountingExport
              reportType="Estado de Resultados"
              data={[
                { Concepto: "Ingresos por Ventas", Monto: id.income },
                ...id.expenseBreakdown.map((e) => ({
                  Concepto: `Gasto: ${e.name}`,
                  Monto: -e.amount,
                })),
                { Concepto: "Utilidad Neta", Monto: id.netProfit },
              ]}
              filename={`estado-resultados-${startDate}-${endDate}`}
            />
          </div>
          )
        })()}

        {reportData?.type === "sales-book" && (() => {
          const sd = reportData
          return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Libro de Ventas</CardTitle>
                <CardDescription>
                  Del {startDate} al {endDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sd.data.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No hay ventas en este periodo.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                          <th className="pb-3 pr-4">Fecha</th>
                          <th className="pb-3 pr-4">Cliente</th>
                          <th className="pb-3 pr-4 text-right">Monto Total</th>
                          <th className="pb-3 text-right">Metodo Pago</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sd.data.map((row, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-3 pr-4 tabular-nums">{String(row.Fecha)}</td>
                            <td className="py-3 pr-4">{String(row.Cliente)}</td>
                            <td className="py-3 pr-4 text-right font-medium tabular-nums">
                              ${Number(row["Monto Total"]).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 text-right">{String(row["Metodo Pago"])}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
            <AccountingExport
              reportType="Libro de Ventas"
              data={sd.data}
              filename={`libro-ventas-${startDate}-${endDate}`}
            />
          </div>
          )
        })()}

        {reportData?.type === "purchases-book" && (() => {
          const pd = reportData
          return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Libro de Compras</CardTitle>
                <CardDescription>
                  Del {startDate} al {endDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pd.data.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No hay compras/gastos en este periodo.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                          <th className="pb-3 pr-4">Fecha</th>
                          <th className="pb-3 pr-4">Descripcion</th>
                          <th className="pb-3 pr-4">Categoria</th>
                          <th className="pb-3 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pd.data.map((row, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-3 pr-4 tabular-nums">{String(row.Fecha)}</td>
                            <td className="py-3 pr-4">{String(row.Descripcion)}</td>
                            <td className="py-3 pr-4">
                              <Badge variant="secondary">{String(row.Categoria)}</Badge>
                            </td>
                            <td className="py-3 text-right font-medium tabular-nums text-red-600">
                              -${Number(row.Monto).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
            <AccountingExport
              reportType="Libro de Compras"
              data={pd.data}
              filename={`libro-compras-${startDate}-${endDate}`}
            />
          </div>
          )
        })()}

        {!reportData && !isPending && (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <FileText className="size-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-base font-medium">Sin reporte generado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Selecciona un tipo de reporte y haz clic en generar para ver los
                datos.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}
