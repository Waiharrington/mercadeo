import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  description?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = "neutral",
  description,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(change || description) && (
          <p
            className={cn(
              "text-xs",
              changeType === "positive" && "text-emerald-600",
              changeType === "negative" && "text-destructive",
              !change && "text-muted-foreground"
            )}
          >
            {change ? change : description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
