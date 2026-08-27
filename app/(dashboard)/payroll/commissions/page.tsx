"use client"

import { useState, useEffect, useTransition } from "react"
import { Loader2, Calculator } from "lucide-react"

import { calculateCommissions } from "@/lib/actions/payroll"
import { signOut } from "@/lib/actions/auth"
import { DashboardShellClient } from "@/components/layout/dashboard-shell-client"
import { CommissionCalculator } from "@/components/payroll/commission-calculator"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function CommissionsPage() {
  const [isPending, startTransition] = useTransition()
  interface CommissionEntry { employee_id: string; full_name: string; commission_rate: number; total_sales: number; commission_earned: number }
  const [commissions, setCommissions] = useState<CommissionEntry[]>([])
  const [businessId, setBusinessId] = useState("")
  const [user, setUser] = useState<{ email?: string; displayName: string; initials: string; avatarUrl?: string | null } | null>(null)

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  useEffect(() => {
    async function loadBusinessId() {
      const { getCurrentUser } = await import("@/lib/actions/auth")
      const { profile } = await getCurrentUser()
      if (profile) {
        setBusinessId(profile.id)
        const name = profile.full_name || profile.email || ""
        setUser({
          email: profile.email,
          displayName: name,
          initials: name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?",
          avatarUrl: profile.avatar_url ?? null,
        })
      }
    }
    loadBusinessId()
  }, [])

  function handleCalculate() {
    if (!businessId) return

    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01T00:00:00.000Z`
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate()
    const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`

    startTransition(async () => {
      const result = await calculateCommissions(businessId, {
        startDate,
        endDate,
      })
      if (result.success && result.data) {
        setCommissions(result.data)
      }
    })
  }

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  return (
    <DashboardShellClient user={user} signOutAction={signOut}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Calculadora de Comisiones
          </h1>
          <p className="text-muted-foreground">
            Calcula las comisiones de tus empleados por periodo.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Periodo</CardTitle>
            <CardDescription>
              Elige el mes y ano para calcular las comisiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="space-y-2">
                <Label>Mes</Label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {months.map((month, i) => (
                    <option key={i + 1} value={i + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleCalculate}
                disabled={isPending || !businessId}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Calculator className="size-4" />
                )}
                Calcular Comisiones
              </Button>
            </div>
          </CardContent>
        </Card>

        {commissions.length > 0 && (
          <CommissionCalculator commissions={commissions} />
        )}

        {commissions.length === 0 && !isPending && (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Calculator className="size-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-base font-medium">Sin datos</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Selecciona un periodo y haz clic en calcular para ver las
                comisiones.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShellClient>
  )
}
