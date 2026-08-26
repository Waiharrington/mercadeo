import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Printer,
  ShoppingCart,
  CreditCard,
  Calendar,
  User,
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
import { Separator } from "@/components/ui/separator"
import { SaleStatusBadge } from "@/components/sales/status-badge"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
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

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  bank_transfer: "Transferencia",
  mobile_pay: "Pago Movil",
  card: "Tarjeta",
  debt: "Deuda",
}

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: sale, error } = await supabase
    .schema("mercadeo")
    .from("sales")
    .select("*, customers(*), sale_items(*, products(name, images), product_variants(variant_name, variant_value))")
    .eq("id", id)
    .single()

  if (error || !sale) {
    notFound()
  }

  const subtotal = sale.sale_items.reduce(
    (sum: number, item: any) => sum + Number(item.unit_price) * item.quantity,
    0
  )
  const discountAmount = Number(sale.discount_amount || 0)
  const taxAmount = Number(sale.tax_amount || 0)
  const igtfAmount = Number(sale.igtf_amount || 0)
  const total = Number(sale.total_amount)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/orders">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Venta #{sale.id.slice(0, 8)}
              </h1>
              <p className="text-muted-foreground">
                {formatDateTime(sale.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SaleStatusBadge status={sale.sale_status} />
            <Button variant="outline" size="sm">
              <Printer className="size-4" />
              Imprimir
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <User className="size-3" />
                Cliente
              </div>
              <p className="text-sm font-medium">
                {sale.customers?.name || "Cliente general"}
              </p>
              {sale.customers?.phone && (
                <p className="text-xs text-muted-foreground">{sale.customers.phone}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <CreditCard className="size-3" />
                Metodo de Pago
              </div>
              <p className="text-sm font-medium">
                {PAYMENT_LABELS[sale.payment_method] || sale.payment_method}
              </p>
              <p className="text-xs text-muted-foreground">
                {sale.payment_currency || "USD"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Calendar className="size-3" />
                Fecha
              </div>
              <p className="text-sm font-medium">{formatDateTime(sale.created_at)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <ShoppingCart className="size-3" />
                Total
              </div>
              <p className="text-xl font-bold">{formatCurrency(total)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Productos</CardTitle>
              <CardDescription>
                {sale.sale_items.length} productos en esta venta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Producto</th>
                      <th className="pb-2 font-medium text-right">Cantidad</th>
                      <th className="pb-2 font-medium text-right">Precio Unit.</th>
                      <th className="pb-2 font-medium text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.sale_items.map((item: any) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-3">
                          <p className="font-medium">{item.products?.name || "Producto"}</p>
                          {item.product_variants && (
                            <p className="text-xs text-muted-foreground">
                              {item.product_variants.variant_name}:{" "}
                              {item.product_variants.variant_value}
                            </p>
                          )}
                        </td>
                        <td className="py-3 text-right tabular-nums">{item.quantity}</td>
                        <td className="py-3 text-right tabular-nums">
                          {formatCurrency(Number(item.unit_price))}
                        </td>
                        <td className="py-3 text-right font-medium tabular-nums">
                          {formatCurrency(Number(item.unit_price) * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento</span>
                  <span className="text-destructive tabular-nums">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Impuesto</span>
                  <span className="tabular-nums">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {igtfAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IGTF</span>
                  <span className="tabular-nums">{formatCurrency(igtfAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(total)}</span>
              </div>
              {sale.exchange_rate && sale.exchange_rate !== 1 && (
                <p className="text-xs text-muted-foreground">
                  Tasa de cambio: {sale.exchange_rate} Bs./USD
                </p>
              )}
              {sale.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Notas</p>
                    <p className="text-sm">{sale.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
