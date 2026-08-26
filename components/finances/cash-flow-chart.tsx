import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CashFlowChartProps {
  data: Array<{
    label: string
    income: number
    expenses: number
  }>
  title?: string
  description?: string
}

function formatShortCurrency(amount: number) {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`
  }
  return `$${amount.toFixed(0)}`
}

export function CashFlowChart({
  data,
  title = "Flujo de Caja Mensual",
  description = "Ingresos vs Gastos por mes",
}: CashFlowChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.income, d.expenses)),
    1
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Sin datos para mostrar
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-sm bg-emerald-500" />
                Ingresos
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-sm bg-red-500" />
                Gastos
              </div>
            </div>
            <div className="flex h-40 items-end gap-2">
              {data.map((item, i) => {
                const incomeHeight = (item.income / maxValue) * 100
                const expenseHeight = (item.expenses / maxValue) * 100
                return (
                  <div
                    key={i}
                    className="flex flex-1 items-end gap-1"
                    title={`${item.label}: Ingresos ${formatShortCurrency(item.income)} / Gastos ${formatShortCurrency(item.expenses)}`}
                  >
                    <div
                      className="w-full rounded-t-sm bg-emerald-500 transition-all hover:bg-emerald-600"
                      style={{ height: `${Math.max(incomeHeight, 2)}%` }}
                    />
                    <div
                      className="w-full rounded-t-sm bg-red-500 transition-all hover:bg-red-600"
                      style={{ height: `${Math.max(expenseHeight, 2)}%` }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2">
              {data.map((item, i) => (
                <div
                  key={i}
                  className="flex-1 truncate text-center text-[10px] text-muted-foreground"
                >
                  {item.label.length > 5 ? item.label.slice(5) : item.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
