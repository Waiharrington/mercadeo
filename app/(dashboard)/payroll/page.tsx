import Link from "next/link"
import { redirect } from "next/navigation"
import { Users, Plus, DollarSign, UserCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/actions/auth"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { StatsCard } from "@/components/dashboard/stats-card"
import { EmployeeCard } from "@/components/payroll/employee-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = {
  title: "Nómina",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export default async function PayrollPage() {
  const supabase = await createClient()
  const { profile } = await getCurrentUser()

  if (!profile) redirect("/login")

  const businessId = profile.id

  const { data: employees } = await supabase
    .schema("mercadeo")
    .from("employees")
    .select("*")
    .eq("business_id", businessId)
    .order("full_name", { ascending: true })

  interface EmployeeRow { id: string; full_name: string; position?: string; salary?: number; commission_rate?: number; is_active?: boolean }
  const allEmployees = (employees as EmployeeRow[] | null) ?? []
  const activeEmployees = allEmployees.filter((e) => e.is_active !== false)
  const totalMonthlySalary = activeEmployees.reduce(
    (sum, e) => sum + Number(e.salary || 0),
    0
  )

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nómina</h1>
            <p className="text-muted-foreground">
              Administra tus empleados, salarios y comisiones.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/payroll/commissions">
              <Button variant="outline">
                <DollarSign className="size-4" />
                Calcular Comisiones
              </Button>
            </Link>
            <Link href="/payroll/new">
              <Button>
                <Plus className="size-4" />
                Agregar Empleado
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Empleados"
            value={String(allEmployees.length)}
            icon={Users}
            description={`${activeEmployees.length} activos`}
          />
          <StatsCard
            title="Empleados Activos"
            value={String(activeEmployees.length)}
            icon={UserCheck}
          />
          <StatsCard
            title="Nómina Mensual Estimada"
            value={formatCurrency(totalMonthlySalary)}
            icon={DollarSign}
            description="Solo salarios base"
          />
          <StatsCard
            title="Empleados con Comisión"
            value={String(
              activeEmployees.filter((e) => Number(e.commission_rate || 0) > 0).length
            )}
            icon={DollarSign}
            description="Tasa > 0%"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Empleados</CardTitle>
            <CardDescription>
              {allEmployees.length} empleados registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="mb-3 size-10 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  No hay empleados registrados
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Agrega tu primer empleado para comenzar.
                </p>
                <Link href="/payroll/new" className="mt-4">
                  <Button>
                    <Plus className="size-4" />
                    Agregar Empleado
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {allEmployees.map((employee) => (
                  <EmployeeCard key={employee.id} employee={employee} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
