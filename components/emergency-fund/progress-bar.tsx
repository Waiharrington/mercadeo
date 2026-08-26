"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Target, TrendingUp, Clock, CheckCircle } from "lucide-react"

interface FundProgressBarProps {
  currentAmount: number
  targetAmount: number
  percentage: number
  remaining: number
  monthlyTargetDate: string | null
  monthlyContribution: number
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

function getProgressColor(percentage: number) {
  if (percentage >= 75) return "bg-emerald-500"
  if (percentage >= 25) return "bg-yellow-500"
  return "bg-red-500"
}

function getProgressBg(percentage: number) {
  if (percentage >= 75) return "bg-emerald-100 dark:bg-emerald-950/30"
  if (percentage >= 25) return "bg-yellow-100 dark:bg-yellow-950/30"
  return "bg-red-100 dark:bg-red-950/30"
}

function getMessage(percentage: number) {
  if (percentage >= 75) return "Excelente! Casi alcanzas tu meta. Sigue asi!"
  if (percentage >= 50) return "Muy bien! Vas por buen camino."
  if (percentage >= 25) return "Buen progreso! Continua ahorrando."
  if (percentage > 0) return "Estas empezando! Cada contribucion cuenta."
  return "Comienza a construir tu fondo de emergencia hoy!"
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-DO", {
    month: "long",
    year: "numeric",
  })
}

export function FundProgressBar({
  currentAmount,
  targetAmount,
  percentage,
  remaining,
  monthlyTargetDate,
  monthlyContribution,
}: FundProgressBarProps) {
  return (
    <div className="space-y-4">
      <Card className={cn("border-2", getProgressBg(percentage))}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium">Progreso del Fondo</span>
            </div>
            <span className={cn("text-2xl font-bold", percentage >= 75 ? "text-emerald-600" : percentage >= 25 ? "text-yellow-600" : "text-red-600")}>
              {Math.round(percentage)}%
            </span>
          </div>

          <div className="relative h-4 w-full overflow-hidden rounded-full bg-background">
            <div
              className={cn("h-full rounded-full transition-all duration-500", getProgressColor(percentage))}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatCurrency(currentAmount)} de {formatCurrency(targetAmount)}
            </span>
            <span className="font-medium text-muted-foreground">
              {formatCurrency(remaining)} restante
            </span>
          </div>

          <p className="mt-3 text-sm text-center text-muted-foreground italic">
            {getMessage(percentage)}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contribucion mensual</p>
              <p className="text-sm font-medium">{formatCurrency(monthlyContribution)}</p>
            </div>
          </CardContent>
        </Card>

        {monthlyTargetDate && (
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center bg-emerald-100 dark:bg-emerald-950/30 rounded-lg">
                <Clock className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Meta estimada</p>
                <p className="text-sm font-medium">{formatDate(monthlyTargetDate)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {percentage >= 100 && (
          <Card className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500">
                <CheckCircle className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Fondo completo</p>
                <p className="text-sm font-medium">Has alcanzado tu meta!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
