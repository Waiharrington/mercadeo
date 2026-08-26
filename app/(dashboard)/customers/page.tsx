import Link from "next/link"
import { Users, Plus, AlertTriangle, TrendingUp, Search, UserX } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { StatsCard } from "@/components/dashboard/stats-card"
import { CustomerCard } from "@/components/customers/customer-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export const metadata = {
  title: "Clientes",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .schema("mercadeo")
    .from("profiles")
    .select("business_id")
    .eq("id", user.id)
    .single()

  const businessId = profile?.business_id ?? ""

  let query = supabase
    .schema("mercadeo")
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,phone.ilike.%${params.search}%,email.ilike.%${params.search}%`
    )
  }

  const { data: customers } = await query

  const allCustomers = customers ?? []
  const totalDebt = allCustomers.reduce((sum, c) => sum + Number(c.debt_balance || 0), 0)
  const totalPurchases = allCustomers.reduce((sum, c) => sum + Number(c.total_purchases || 0), 0)
  const topCustomers = [...allCustomers]
    .sort((a, b) => Number(b.total_purchases) - Number(a.total_purchases))
    .slice(0, 5)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Administra tus clientes, contactos e historial de compras.
            </p>
          </div>
          <Link href="/customers/new">
            <Button>
              <Plus className="size-4" />
              Nuevo Cliente
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Clientes"
            value={String(allCustomers.length)}
            icon={Users}
            description={`${allCustomers.filter((c) => c.is_active).length} activos`}
          />
          <StatsCard
            title="Deuda Total"
            value={formatCurrency(totalDebt)}
            icon={AlertTriangle}
            changeType={totalDebt > 0 ? "negative" : "positive"}
            change={totalDebt > 0 ? "Pendiente de cobro" : "Sin deudas"}
          />
          <StatsCard
            title="Compras Totales"
            value={formatCurrency(totalPurchases)}
            icon={TrendingUp}
            description="Historial acumulado"
          />
          <StatsCard
            title="Clientes Inactivos"
            value={String(allCustomers.filter((c) => !c.last_purchase_at).length)}
            icon={UserX}
            description="Sin compras registradas"
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Lista de Clientes</CardTitle>
                <CardDescription>
                  {allCustomers.length} clientes registrados
                </CardDescription>
              </div>
              <form className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Buscar por nombre, telefono..."
                  defaultValue={params.search}
                  className="pl-9"
                />
              </form>
            </div>
          </CardHeader>
          <CardContent>
            {allCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="mb-3 size-10 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  No hay clientes registrados
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {params.search
                    ? "No se encontraron resultados para tu busqueda."
                    : "Agrega tu primer cliente para comenzar."}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {allCustomers.map((customer) => (
                  <CustomerCard key={customer.id} customer={customer} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {topCustomers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Clientes</CardTitle>
              <CardDescription>Clientes con mas compras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCustomers.map((customer, i) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.purchase_count} compras
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {formatCurrency(Number(customer.total_purchases))}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}
