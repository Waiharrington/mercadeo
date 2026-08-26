"use client"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const PAYMENT_METHODS = [
  { value: "cash", label: "Efectivo", icon: "💵" },
  { value: "bank_transfer", label: "Transferencia", icon: "🏦" },
  { value: "mobile_pay", label: "Pago Movil", icon: "📱" },
  { value: "card", label: "Tarjeta", icon: "💳" },
  { value: "debt", label: "Deuda", icon: "📋" },
] as const

interface PaymentSelectorProps {
  value: string
  onChange: (method: string) => void
  currency: string
  onCurrencyChange: (currency: string) => void
  exchangeRate: number
  onExchangeRateChange: (rate: number) => void
}

export function PaymentSelector({
  value,
  onChange,
  currency,
  onCurrencyChange,
  exchangeRate,
  onExchangeRateChange,
}: PaymentSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-3 block">Metodo de Pago</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => onChange(method.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-3 text-sm transition-colors",
                value === method.value
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-border hover:bg-muted text-muted-foreground"
              )}
            >
              <span className="text-lg">{method.icon}</span>
              <span className="text-xs">{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-sm font-medium mb-2 block">Moneda</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onCurrencyChange("USD")}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                currency === "USD"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:bg-muted text-muted-foreground"
              )}
            >
              $ USD
            </button>
            <button
              type="button"
              onClick={() => onCurrencyChange("Bs")}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                currency === "Bs"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:bg-muted text-muted-foreground"
              )}
            >
              Bs. Bolivares
            </button>
          </div>
        </div>

        {currency === "Bs" && (
          <div className="space-y-2">
            <Label htmlFor="exchange_rate" className="text-sm font-medium">
              Tasa de Cambio (Bs./USD)
            </Label>
            <Input
              id="exchange_rate"
              type="number"
              step="0.01"
              min="0"
              value={exchangeRate}
              onChange={(e) => onExchangeRateChange(Number(e.target.value) || 1)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
