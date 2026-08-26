"use client"

import { AlertTriangle, AlertCircle, Info, CheckCircle, Clock, ExternalLink, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { markAlertAsRead, deleteAlert } from "@/lib/actions/alerts"


interface AlertCardProps {
  alert: {
    id: string
    type: string
    title: string
    message: string
    severity: string
    is_read: boolean
    action_url?: string | null
    created_at: string
  }
  onRead?: (id: string) => void
  onDelete?: (id: string) => void
}

function AlertTypeIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "stock_low":
      return <AlertTriangle className={className} />
    case "debt_due":
      return <AlertCircle className={className} />
    case "info":
      return <Info className={className} />
    default:
      return <AlertCircle className={className} />
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
    case "warning":
      return "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20"
    case "info":
      return "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
    default:
      return "border-l-muted"
  }
}

function getIconColor(severity: string) {
  switch (severity) {
    case "critical":
      return "text-red-500"
    case "warning":
      return "text-yellow-500"
    case "info":
      return "text-blue-500"
    default:
      return "text-muted-foreground"
  }
}

function getBadgeVariant(severity: string): "destructive" | "secondary" | "outline" {
  switch (severity) {
    case "critical":
      return "destructive"
    case "warning":
      return "secondary"
    default:
      return "outline"
  }
}

function timeAgo(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "hace un momento"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days}d`
  return date.toLocaleDateString("es-DO", { day: "numeric", month: "short" })
}

export function AlertCard({ alert, onRead, onDelete }: AlertCardProps) {
  async function handleMarkRead() {
    const result = await markAlertAsRead(alert.id)
    if (result.success) onRead?.(alert.id)
  }

  async function handleDelete() {
    const result = await deleteAlert(alert.id)
    if (result.success) onDelete?.(alert.id)
  }

  return (
    <Card
      className={cn(
        "border-l-4 transition-all",
        getSeverityColor(alert.severity),
        !alert.is_read && "shadow-sm"
      )}
    >
      <CardContent className="flex items-start gap-3 py-3">
        <div className={cn("mt-0.5 shrink-0", getIconColor(alert.severity))}>
          <AlertTypeIcon type={alert.type} className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={cn("text-sm font-medium", !alert.is_read && "font-semibold")}>
                {alert.title}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                {alert.message}
              </p>
            </div>
            <Badge variant={getBadgeVariant(alert.severity)} className="shrink-0">
              {alert.severity === "critical" ? "Urgente" : alert.severity === "warning" ? "Advertencia" : "Info"}
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {timeAgo(alert.created_at)}
            </span>
            {!alert.is_read && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleMarkRead}
              >
                <CheckCircle className="size-3" />
                Marcar leido
              </Button>
            )}
            {alert.action_url && (
              <Button
                variant="ghost"
                size="xs"
                render={<a href={alert.action_url} target="_blank" rel="noopener noreferrer" />}
              >
                <ExternalLink className="size-3" />
                Ver
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleDelete}
              className="ml-auto text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
