import { Suspense } from "react"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { SegmentCard } from "@/components/marketing/customer-segment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Segmentos",
}

async function SegmentsContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  const { data: customers } = await supabase
    .schema("mercadeo")
    .from("customers")
    .select("id, name, total_purchases, purchase_count, last_purchase_at, created_at")
    .eq("business_id", user.id)
    .eq("is_active", true)

  interface CustomerRow {
    id: string
    name: string
    total_purchases: number
    last_purchase_at: string | null
    created_at: string
    [key: string]: unknown
  }

  const allCustomers = (customers as CustomerRow[]) ?? []

  const segments = [
    {
      name: "Todos los clientes",
      count: allCustomers.length,
      totalValue: allCustomers.reduce((sum, c) => sum + Number(c.total_purchases), 0),
      description: "Total de clientes activos en el negocio",
      icon: "all" as const,
    },
    {
      name: "Clientes inactivos (>30 dias)",
      count: allCustomers.filter((c) => {
        if (!c.last_purchase_at) return true
        return new Date(c.last_purchase_at) < thirtyDaysAgo
      }).length,
      totalValue: allCustomers
        .filter((c) => {
          if (!c.last_purchase_at) return true
          return new Date(c.last_purchase_at) < thirtyDaysAgo
        })
        .reduce((sum, c) => sum + Number(c.total_purchases), 0),
      description: "Sin compras en los ultimos 30 dias",
      icon: "inactive" as const,
    },
    {
      name: "Grandes compradores (>$500)",
      count: allCustomers.filter((c) => Number(c.total_purchases) >= 500).length,
      totalValue: allCustomers
        .filter((c) => Number(c.total_purchases) >= 500)
        .reduce((sum, c) => sum + Number(c.total_purchases), 0),
      description: "Clientes con mas de $500 en compras totales",
      icon: "high" as const,
    },
    {
      name: "Clientes con deuda",
      count: allCustomers.filter((c) => {
        if (!c.last_purchase_at) return true
        return new Date(c.last_purchase_at) < sixtyDaysAgo
      }).length,
      totalValue: 0,
      description: "Saldo pendiente por cobrar",
      icon: "debtors" as const,
    },
    {
      name: "Nuevos este mes",
      count: allCustomers.filter((c) => new Date(c.created_at) >= thirtyDaysAgo).length,
      totalValue: allCustomers
        .filter((c) => new Date(c.created_at) >= thirtyDaysAgo)
        .reduce((sum, c) => sum + Number(c.total_purchases), 0),
      description: "Clientes registrados en los ultimos 30 dias",
      icon: "new" as const,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          render={<a href="/marketing" />}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Segmentos de Clientes</h1>
          <p className="text-muted-foreground">
            Grupos de clientes organizados por comportamiento de compra.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {segments.map((segment) => (
          <SegmentCard
            key={segment.name}
            name={segment.name}
            count={segment.count}
            totalValue={segment.totalValue}
            description={segment.description}
            icon={segment.icon}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Segmentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {segments.map((segment) => (
              <div key={segment.name} className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">{segment.count}</p>
                <p className="text-xs text-muted-foreground mt-1">{segment.name.split(" (")[0]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SegmentsPage() {
  return (
    <DashboardShell>
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        }
      >
        <SegmentsContent />
      </Suspense>
    </DashboardShell>
  )
}
