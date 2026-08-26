"use client"

import { DollarSign, TrendingUp, Calculator } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

interface CommissionEntry {
  employee_id: string
  full_name: string
  commission_rate: number
  total_sales: number
  commission_earned: number
}

interface CommissionCalculatorProps {
  commissions: CommissionEntry[]
}

export function CommissionCalculator({ commissions }: CommissionCalculatorProps) {
  const totalSales = commissions.reduce((sum, c) => sum + c.total_sales, 0)
  const totalCommissions = commissions.reduce((sum, c) => sum + c.commission_earned, 0)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Ventas Totales</p>
            </div>
            <p className="text-xl font-bold mt-1">{formatCurrency(totalSales)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calculator className="size-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Comisiones</p>
            </div>
            <p className="text-xl font-bold mt-1">{formatCurrency(totalCommissions)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Empleados con Comision</p>
            </div>
            <p className="text-xl font-bold mt-1">{commissions.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Desglose de Comisiones</CardTitle>
          <CardDescription>
            Comisiones calculadas sobre ventas completadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calculator className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No hay comisiones para calcular en este periodo.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                    <th className="pb-3 pr-4">Empleado</th>
                    <th className="pb-3 pr-4 text-right">Ventas Totales</th>
                    <th className="pb-3 pr-4 text-right">Tasa</th>
                    <th className="pb-3 text-right">Comision</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((entry) => (
                    <tr key={entry.employee_id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{entry.full_name}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {formatCurrency(entry.total_sales)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {entry.commission_rate}%
                      </td>
                      <td className="py-3 text-right font-medium tabular-nums text-emerald-600">
                        {formatCurrency(entry.commission_earned)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="pt-3 pr-4">Total</td>
                    <td className="pt-3 pr-4 text-right tabular-nums">
                      {formatCurrency(totalSales)}
                    </td>
                    <td className="pt-3 pr-4 text-right">-</td>
                    <td className="pt-3 text-right tabular-nums text-emerald-600">
                      {formatCurrency(totalCommissions)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
