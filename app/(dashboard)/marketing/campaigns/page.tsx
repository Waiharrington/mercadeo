import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { CampaignCard } from "@/components/marketing/campaign-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Campanas",
}

async function CampaignsContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: campaigns } = await supabase
    .schema("mercadeo")
    .from("ai_insights")
    .select("*")
    .eq("business_id", user.id)
    .eq("type", "marketing_copy")
    .order("created_at", { ascending: false })

  interface CampaignRow {
    id: string
    content: string
    created_at: string
    metadata?: Record<string, unknown> | null
  }

  const campaignList = (campaigns as CampaignRow[]) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campanas</h1>
          <p className="text-muted-foreground">
            Historial de campanas de marketing creadas.
          </p>
        </div>
        <Button render={<Link href="/marketing/campaigns/new" />}>
          <Plus className="size-4" />
          Nueva Campana
        </Button>
      </div>

      {campaignList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Send className="size-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-base font-medium">Sin campanas</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea tu primera campana para llegar a tus clientes.
            </p>
            <Button className="mt-4" render={<Link href="/marketing/campaigns/new" />}>
              <Plus className="size-4" />
              Crear Campana
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaignList.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CampaignsPage() {
  return (
    <DashboardShell>
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        }
      >
        <CampaignsContent />
      </Suspense>
    </DashboardShell>
  )
}
