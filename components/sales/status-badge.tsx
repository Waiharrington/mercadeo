"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pendiente",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  completed: {
    label: "Completada",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  refunded: {
    label: "Reembolsada",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
}

interface SaleStatusBadgeProps {
  status: string
}

export function SaleStatusBadge({ status }: SaleStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-secondary text-secondary-foreground",
  }

  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}
