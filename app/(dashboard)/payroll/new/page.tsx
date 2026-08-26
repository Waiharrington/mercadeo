import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions/auth"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { EmployeeForm } from "@/components/payroll/employee-form"

export const metadata = {
  title: "Nuevo Empleado",
}

export default async function NewEmployeePage() {
  const { profile } = await getCurrentUser()

  if (!profile) redirect("/login")

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Empleado</h1>
          <p className="text-muted-foreground">
            Agrega un nuevo empleado a tu negocio.
          </p>
        </div>
        <EmployeeForm businessId={profile.id} />
      </div>
    </DashboardShell>
  )
}
