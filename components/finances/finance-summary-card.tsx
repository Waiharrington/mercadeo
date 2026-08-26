import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FinanceSummaryCardProps {
  icon: React.ReactNode
  label: string
  amount: number
  currency?: string
  trend?: {
    value: string
    type: "positive" | "negative" | "neutral"
  }
  className?: string
}

function formatCurrency(amount: number, currency: string = "USD") {
  if (currency === "Bs.") {
    return `Bs. ${amount.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function FinanceSummaryCard({
  icon,
  label,
  amount,
  currency = "USD",
  trend,
  className,
}: FinanceSummaryCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            {icon}
          </div>
          <span className="text-sm font-medium">{label}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight tabular-nums">
          {formatCurrency(amount, currency)}
        </p>
        {trend && (
          <p
            className={cn(
              "mt-1 text-xs font-medium",
              trend.type === "positive" && "text-emerald-600",
              trend.type === "negative" && "text-red-600",
              trend.type === "neutral" && "text-muted-foreground"
            )}
          >
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
