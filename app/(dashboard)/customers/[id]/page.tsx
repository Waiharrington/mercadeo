import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingCart,
  AlertTriangle,
  MessageCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CustomerActions } from "@/components/customers/customer-actions"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: customer, error } = await supabase
    .schema("mercadeo")
    .from("customers")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !customer) {
    notFound()
  }

  const { data: sales } = await supabase
    .schema("mercadeo")
    .from("sales")
    .select("*, sale_items(*, products(name))")
    .eq("customer_id", id)
    .order("created_at", { ascending: false })

  const allSales = sales ?? []

  const whatsappUrl = customer.phone
    ? `https://wa.me/${customer.phone.replace(/\D/g, "")}`
    : null

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/customers">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
              <p className="text-muted-foreground">
                Cliente desde {formatDate(customer.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <MessageCircle className="size-4" />
                  WhatsApp
                </Button>
              </a>
            )}
            <CustomerActions customer={customer} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Compras</p>
              <p className="text-xl font-bold">{formatCurrency(Number(customer.total_purchases))}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Deuda Pendiente</p>
              <p className={`text-xl font-bold ${Number(customer.debt_balance) > 0 ? "text-destructive" : ""}`}>
                {formatCurrency(Number(customer.debt_balance))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Num. Compras</p>
              <p className="text-xl font-bold">{customer.purchase_count}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Ultima Compra</p>
              <p className="text-xl font-bold">
                {customer.last_purchase_at
                  ? formatDate(customer.last_purchase_at)
                  : "Nunca"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Informacion del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                <span>{customer.phone || "Sin telefono"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span>{customer.email || "Sin email"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="size-4 text-muted-foreground" />
                <span>{customer.address || "Sin direccion"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span>ID: {customer.id_number || "Sin cedula/RIF"}</span>
              </div>
              {Number(customer.debt_balance) > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3">
                    <AlertTriangle className="size-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">
                      Deuda de {formatCurrency(Number(customer.debt_balance))}
                    </span>
                  </div>
                </>
              )}
              {customer.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Notas</p>
                    <p className="text-sm">{customer.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Historial de Compras</CardTitle>
              <CardDescription>{allSales.length} compras realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {allSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="mb-3 size-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Este cliente no tiene compras registradas.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allSales.map((sale) => (
                    <Link
                      key={sale.id}
                      href={`/orders/${sale.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                          <ShoppingCart className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Venta #{sale.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(sale.created_at)} &middot;{" "}
                            {sale.payment_method}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium tabular-nums">
                          {formatCurrency(Number(sale.total_amount))}
                        </p>
                        <Badge
                          variant={
                            sale.sale_status === "completed"
                              ? "default"
                              : sale.sale_status === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {sale.sale_status === "completed"
                            ? "Completada"
                            : sale.sale_status === "cancelled"
                            ? "Cancelada"
                            : sale.sale_status === "pending"
                            ? "Pendiente"
                            : "Reembolsada"}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
