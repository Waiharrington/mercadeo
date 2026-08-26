import { Suspense } from "react"
import { redirect } from "next/navigation"
import { Bell, CheckCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AlertCard } from "@/components/alerts/alert-card"
import { AlertSettings } from "@/components/alerts/alert-settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Alertas",
}

interface AlertsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function AlertsContent({ searchParams }: AlertsPageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const filter = typeof params.filter === "string" ? params.filter : "all"

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: alerts } = await supabase
    .schema("mercadeo")
    .from("alerts")
    .select("*")
    .eq("business_id", user.id)
    .order("created_at", { ascending: false })

  interface AlertRow {
    id: string
    type: string
    title: string
    message: string
    severity: string
    is_read: boolean
    action_url?: string | null
    created_at: string
    business_id: string
  }

  const allAlerts = (alerts as AlertRow[]) ?? []
  const unreadCount = allAlerts.filter((a) => !a.is_read).length

  const filteredAlerts = allAlerts.filter((alert) => {
    switch (filter) {
      case "unread":
        return !alert.is_read
      case "stock_low":
        return alert.type === "stock_low"
      case "debt_due":
        return alert.type === "debt_due"
      case "info":
        return alert.severity === "info"
      default:
        return true
    }
  })

  const filters = [
    { value: "all", label: "Todas", count: allAlerts.length },
    { value: "unread", label: "No leidas", count: unreadCount },
    { value: "stock_low", label: "Stock bajo", count: allAlerts.filter((a) => a.type === "stock_low").length },
    { value: "debt_due", label: "Deudas", count: allAlerts.filter((a) => a.type === "debt_due").length },
    { value: "info", label: "Pagos", count: allAlerts.filter((a) => a.severity === "info").length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
          <p className="text-muted-foreground">
            Centro de notificaciones de tu negocio.
          </p>
        </div>
        {unreadCount > 0 && (
          <form>
            <input type="hidden" name="filter" value={filter} />
            <Button type="submit" variant="outline" size="sm">
              <CheckCheck className="size-4" />
              Marcar todo como leido
            </Button>
          </form>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <form key={f.value}>
            <input type="hidden" name="filter" value={f.value} />
            <Button
              type="submit"
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
            >
              {f.label}
              {f.count > 0 && (
                <Badge
                  variant={filter === f.value ? "secondary" : "ghost"}
                  className="ml-1"
                >
                  {f.count}
                </Badge>
              )}
            </Button>
          </form>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <Bell className="size-12 text-muted-foreground/30" />
                <h3 className="mt-4 text-base font-medium">
                  {filter === "all" ? "Sin alertas" : "Sin resultados"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filter === "all"
                    ? "No hay alertas en este momento. Todo esta funcionando bien."
                    : "No se encontraron alertas con ese filtro."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))
          )}
        </div>

        <div>
          <AlertSettings />
        </div>
      </div>
    </div>
  )
}

export default function AlertsPage(props: AlertsPageProps) {
  return (
    <DashboardShell>
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        }
      >
        <AlertsContent searchParams={props.searchParams} />
      </Suspense>
    </DashboardShell>
  )
}
