import { Users, TrendingUp, AlertTriangle, Sparkles, UserCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SegmentCardProps {
  name: string
  count: number
  totalValue: number
  description: string
  icon?: "all" | "inactive" | "high" | "debtors" | "new"
}

function getSegmentConfig(icon: SegmentCardProps["icon"]) {
  switch (icon) {
    case "inactive":
      return { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30" }
    case "high":
      return { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" }
    case "debtors":
      return { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" }
    case "new":
      return { icon: Sparkles, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" }
    default:
      return { icon: Users, color: "text-muted-foreground", bg: "bg-muted/50" }
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function SegmentCard({ name, count, totalValue, description, icon = "all" }: SegmentCardProps) {
  const config = getSegmentConfig(icon)
  const Icon = config.icon

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-start gap-3 py-4">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", config.bg)}>
          <Icon className={cn("size-5", config.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <UserCheck className="size-3" />
              {count} clientes
            </Badge>
            {totalValue > 0 && (
              <Badge variant="outline" className="text-xs">
                {formatCurrency(totalValue)}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
