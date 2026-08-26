import {
  ShoppingCartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  type: "sale" | "expense" | "order"
  description: string
  amount: number
  timeAgo: string
}

function getIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "sale":
      return <TrendingUpIcon className="size-4 text-emerald-600" />
    case "expense":
      return <TrendingDownIcon className="size-4 text-destructive" />
    case "order":
      return <ShoppingCartIcon className="size-4 text-blue-600" />
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

interface RecentActivityProps {
  items?: ActivityItem[]
}

export function RecentActivity({ items }: RecentActivityProps) {
  const activityItems: ActivityItem[] = items ?? [
    { id: "1", type: "sale", description: "Venta directa - Cliente Walk-in", amount: 245.00, timeAgo: "Hace 15 min" },
    { id: "2", type: "expense", description: "Proveedor de empaques", amount: -89.50, timeAgo: "Hace 1 hora" },
    { id: "3", type: "sale", description: "Pedido online #1042", amount: 1230.00, timeAgo: "Hace 2 horas" },
    { id: "4", type: "order", description: "Pedido pendiente #1043 - Maria G.", amount: 675.00, timeAgo: "Hace 3 horas" },
    { id: "5", type: "sale", description: "Catalogo - Juan P.", amount: 320.00, timeAgo: "Hace 5 horas" },
  ]

  return (
    <div className="space-y-4">
      {activityItems.map((item) => (
        <div key={item.id} className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
            {getIcon(item.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm">{item.description}</p>
            <p className="text-xs text-muted-foreground">{item.timeAgo}</p>
          </div>
          <span
            className={cn(
              "text-sm font-medium tabular-nums",
              item.amount >= 0 ? "text-foreground" : "text-destructive"
            )}
          >
            {item.amount >= 0 ? "+" : ""}
            {formatCurrency(Math.abs(item.amount))}
          </span>
        </div>
      ))}
    </div>
  )
}
