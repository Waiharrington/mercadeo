import { AlertTriangleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StockAlertProps {
  stockQuantity: number
  minStockAlert: number | null
  className?: string
  compact?: boolean
}

export function StockAlert({ stockQuantity, minStockAlert, className, compact }: StockAlertProps) {
  const threshold = minStockAlert ?? 5

  if (stockQuantity > threshold) return null

  const isCritical = stockQuantity === 0

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
          isCritical
            ? "bg-destructive/10 text-destructive"
            : "bg-amber-500/10 text-amber-600",
          className
        )}
      >
        <AlertTriangleIcon className="size-2.5" />
        {stockQuantity === 0 ? "Sin stock" : `${stockQuantity} bajo`}
      </span>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
        isCritical
          ? "border-destructive/20 bg-destructive/5 text-destructive"
          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
        className
      )}
    >
      <AlertTriangleIcon className="size-4 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">
          {isCritical ? "Sin stock" : "Stock bajo"}
        </p>
        <p className="text-xs opacity-80">
          {stockQuantity} unidades (minimo: {threshold})
        </p>
      </div>
    </div>
  )
}
