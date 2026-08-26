import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Briefcase,
} from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { EmployeeActions } from "@/components/payroll/employee-actions"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: employee, error } = await supabase
    .schema("mercadeo")
    .from("employees")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !employee) {
    notFound()
  }

  const { data: sales } = await supabase
    .schema("mercadeo")
    .from("sales")
    .select("id, total_amount, created_at")
    .eq("business_id", employee.business_id)
    .eq("sale_status", "completed")

  interface SaleRow { id: string; total_amount: number; created_at: string }
  const allSales = (sales as SaleRow[] | null) ?? []
  const totalSalesAmount = allSales.reduce(
    (sum, s) => sum + Number(s.total_amount),
    0
  )
  const commissionRate = Number(employee.commission_rate) / 100
  const totalCommissions = totalSalesAmount * commissionRate

  const commissionHistory = allSales.map((sale) => ({
    id: sale.id,
    amount: Number(sale.total_amount),
    commission: Number(sale.total_amount) * commissionRate,
    date: sale.created_at,
  }))

  const isActive = employee.is_active !== false

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/payroll">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {employee.full_name}
              </h1>
              <p className="text-muted-foreground">
                {employee.position || "Sin cargo definido"} &middot; Empleado
                desde {formatDate(employee.hire_date || employee.created_at)}
              </p>
            </div>
          </div>
          <EmployeeActions employee={employee} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Salario Base</p>
              <p className="text-xl font-bold">
                {formatCurrency(Number(employee.salary || 0))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Tasa de Comision</p>
              <p className="text-xl font-bold">
                {Number(employee.commission_rate || 0)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">
                Total Comisiones Generadas
              </p>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(totalCommissions)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">
                Ingreso Total Estimado
              </p>
              <p className="text-xl font-bold">
                {formatCurrency(Number(employee.salary || 0) + totalCommissions)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Informacion del Empleado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge
                variant={isActive ? "default" : "secondary"}
                className="w-fit"
              >
                {isActive ? "Activo" : "Inactivo"}
              </Badge>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                <span>{employee.phone || "Sin telefono"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span>{employee.email || "Sin email"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="size-4 text-muted-foreground" />
                <span>{employee.position || "Sin cargo"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span>
                  Contratado: {formatDate(employee.hire_date || employee.created_at)}
                </span>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Salario Base</span>
                  <span className="font-medium">
                    {formatCurrency(Number(employee.salary || 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Comision</span>
                  <span className="font-medium">
                    {Number(employee.commission_rate || 0)}%
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>Total Mensual Est.</span>
                  <span>
                    {formatCurrency(
                      Number(employee.salary || 0) + totalCommissions
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Historial de Comisiones</CardTitle>
              <CardDescription>
                {commissionHistory.length} ventas completadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {commissionHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="mb-3 size-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Este empleado no tiene ventas asociadas.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                        <th className="pb-3 pr-4">Fecha</th>
                        <th className="pb-3 pr-4 text-right">Monto Venta</th>
                        <th className="pb-3 text-right">Comision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissionHistory.slice(0, 20).map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b last:border-0"
                        >
                          <td className="py-3 pr-4">
                            {formatDate(entry.date)}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums">
                            {formatCurrency(entry.amount)}
                          </td>
                          <td className="py-3 text-right font-medium tabular-nums text-emerald-600">
                            {formatCurrency(entry.commission)}
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
      </div>
    </DashboardShell>
  )
}
