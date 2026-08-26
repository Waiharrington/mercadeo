import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Send,
  Users,
  TrendingUp,
  BarChart3,
  Plus,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { StatsCard } from "@/components/dashboard/stats-card"
import { CampaignCard } from "@/components/marketing/campaign-card"
import { SegmentCard } from "@/components/marketing/customer-segment"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = {
  title: "Marketing",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

async function MarketingContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    customersResult,
    activeResult,
    salesResult,
    campaignsResult,
    segmentsResult,
  ] = await Promise.all([
    supabase
      .schema("mercadeo")
      .from("customers")
      .select("id, name, total_purchases, last_purchase_at, created_at", { count: "exact" })
      .eq("business_id", user.id)
      .eq("is_active", true),
    supabase
      .schema("mercadeo")
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("business_id", user.id)
      .eq("is_active", true)
      .gte("last_purchase_at", thirtyDaysAgo.toISOString()),
    supabase
      .schema("mercadeo")
      .from("sales")
      .select("total_amount")
      .eq("business_id", user.id)
      .eq("sale_status", "completed"),
    supabase
      .schema("mercadeo")
      .from("ai_insights")
      .select("*")
      .eq("business_id", user.id)
      .eq("type", "marketing_copy")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .schema("mercadeo")
      .from("customers")
      .select("id, name, total_purchases, last_purchase_at, created_at")
      .eq("business_id", user.id)
      .eq("is_active", true),
  ])

  const totalCustomers = customersResult.count ?? 0
  const activeCustomers = activeResult.count ?? 0
  const inactiveCustomers = totalCustomers - activeCustomers

  const totalSales = salesResult.data?.reduce(
    (sum, s) => sum + Number(s.total_amount),
    0
  ) ?? 0

  interface CampaignRow {
    id: string
    content: string
    created_at: string
    metadata?: Record<string, unknown> | null
  }

  interface CustomerRow {
    id: string
    name: string
    total_purchases: number
    last_purchase_at: string | null
    created_at: string
  }

  const campaigns = (campaignsResult.data as CampaignRow[]) ?? []
  const customers = (segmentsResult.data as CustomerRow[]) ?? []

  const highValue = customers.filter((c) => Number(c.total_purchases) >= 500).length
  const debtors = customers.filter((c) => {
    if (!c.last_purchase_at) return true
    const lastPurchase = new Date(c.last_purchase_at)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    return lastPurchase < sixtyDaysAgo
  }).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
          <p className="text-muted-foreground">
            Gestiona campanas y segmentos de clientes.
          </p>
        </div>
        <Button render={<Link href="/marketing/campaigns/new" />}>
          <Plus className="size-4" />
          Nueva Campana
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Clientes Activos"
          value={String(activeCustomers)}
          icon={Users}
          description={`${totalCustomers} totales`}
        />
        <StatsCard
          title="Clientes Inactivos"
          value={String(inactiveCustomers)}
          icon={Users}
          change={inactiveCustomers > 0 ? "Reactivar" : undefined}
          changeType={inactiveCustomers > 0 ? "negative" : "neutral"}
        />
        <StatsCard
          title="Tasa de Repetición"
          value={`${totalCustomers > 0 ? Math.round((highValue / totalCustomers) * 100) : 0}%`}
          icon={TrendingUp}
          description="Clientes recurrentes"
        />
        <StatsCard
          title="Ventas Totales"
          value={formatCurrency(totalSales)}
          icon={BarChart3}
          description={`${salesResult.data?.length ?? 0} transacciones`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Campanas Recientes</CardTitle>
                <CardDescription>Ultimas campanas creadas</CardDescription>
              </div>
              <Button variant="ghost" size="sm" render={<Link href="/marketing/campaigns" />}>
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <Send className="size-10 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No hay campanas aun. Crea tu primera campana.
                </p>
                <Button className="mt-3" size="sm" render={<Link href="/marketing/campaigns/new" />}>
                  <Plus className="size-3" />
                  Crear Campana
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Segmentos de Clientes</CardTitle>
                <CardDescription>Grupos de clientes por comportamiento</CardDescription>
              </div>
              <Button variant="ghost" size="sm" render={<Link href="/marketing/segments" />}>
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <SegmentCard
                name="Todos los clientes"
                count={totalCustomers}
                totalValue={totalSales}
                description="Total de clientes activos"
                icon="all"
              />
              <SegmentCard
                name="Grandes compradores"
                count={highValue}
                totalValue={0}
                description="Clientes con mas de $500 en compras"
                icon="high"
              />
              <SegmentCard
                name="Clientes inactivos"
                count={inactiveCustomers}
                totalValue={0}
                description="Sin compras en los ultimos 30 dias"
                icon="inactive"
              />
              <SegmentCard
                name="Clientes con deuda"
                count={debtors}
                totalValue={0}
                description="Saldo pendiente por cobrar"
                icon="debtors"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function MarketingPage() {
  return (
    <DashboardShell>
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        }
      >
        <MarketingContent />
      </Suspense>
    </DashboardShell>
  )
}
