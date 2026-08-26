"use client"

import { Building2, TrendingUp, TrendingDown, Scale } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

interface AccountEntry {
  name: string
  amount: number
}

interface BalanceSheetProps {
  assets?: AccountEntry[]
  liabilities?: AccountEntry[]
  equity?: AccountEntry[]
  asOfDate?: string
}

export function BalanceSheet({
  assets = [],
  liabilities = [],
  equity = [],
  asOfDate,
}: BalanceSheetProps) {
  const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0)
  const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0)
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity

  const formattedDate = asOfDate
    ? new Date(asOfDate).toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Balance General
          </CardTitle>
          <CardDescription>Al {formattedDate}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <TrendingUp className="size-4" />
                Activos
              </h3>
              <div className="space-y-2">
                {assets.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    Sin datos disponibles
                  </p>
                ) : (
                  assets.map((asset, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{asset.name}</span>
                      <span className="tabular-nums">{formatCurrency(asset.amount)}</span>
                    </div>
                  ))
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Total Activos</span>
                <span className="tabular-nums">{formatCurrency(totalAssets)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-red-600">
                <TrendingDown className="size-4" />
                Pasivos
              </h3>
              <div className="space-y-2">
                {liabilities.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    Sin datos disponibles
                  </p>
                ) : (
                  liabilities.map((liability, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{liability.name}</span>
                      <span className="tabular-nums">{formatCurrency(liability.amount)}</span>
                    </div>
                  ))
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Total Pasivos</span>
                <span className="tabular-nums">{formatCurrency(totalLiabilities)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                <Scale className="size-4" />
                Capital
              </h3>
              <div className="space-y-2">
                {equity.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    Sin datos disponibles
                  </p>
                ) : (
                  equity.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="tabular-nums">{formatCurrency(item.amount)}</span>
                    </div>
                  ))
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Total Capital</span>
                <span className="tabular-nums">{formatCurrency(totalEquity)}</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Total Pasivos + Capital</span>
            <span className="font-bold tabular-nums">
              {formatCurrency(totalLiabilitiesAndEquity)}
            </span>
          </div>

          {Math.abs(totalAssets - totalLiabilitiesAndEquity) > 0.01 && (
            <p className="mt-2 text-xs text-destructive">
              Aviso: Los activos no cuadran con pasivos + capital. Verifique los
              datos.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
