import { Mail, MessageSquare, Smartphone, Calendar, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CampaignCardProps {
  campaign: {
    id: string
    content: string
    created_at: string
    metadata?: Record<string, unknown> | null
  }
}

function getCampaignType(content: string) {
  const lower = content.toLowerCase()
  if (lower.includes("whatsapp") || lower.includes("wa ")) return { label: "WhatsApp", color: "bg-green-100 text-green-700", icon: MessageSquare }
  if (lower.includes("sms") || lower.includes("mensaje")) return { label: "SMS", color: "bg-blue-100 text-blue-700", icon: Smartphone }
  return { label: "Email", color: "bg-purple-100 text-purple-700", icon: Mail }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const type = getCampaignType(campaign.content)
  const Icon = type.icon

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-start gap-3 py-3">
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", type.color)}>
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium line-clamp-1">{campaign.content.substring(0, 60)}...</p>
            <Badge variant="outline" className="shrink-0 text-xs">
              {type.label}
            </Badge>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDate(campaign.created_at)}
            </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="size-3" />
                {String(campaign.metadata?.reach ?? 0)} alcanzados
              </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
