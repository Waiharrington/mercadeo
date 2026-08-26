import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  MessageCircle,
  CheckCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"

import { Separator } from "@/components/ui/separator"
import { SaleStatusBadge } from "@/components/sales/status-badge"
import { InvoicePdf } from "@/components/billing/invoice-pdf"
import { formatDate, whatsappLink, formatPhone } from "@/lib/currency"
import { markAsDelivered } from "@/lib/actions/billing"

export const metadata = {
  title: "Detalle de Factura",
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  bank_transfer: "Transferencia Bancaria",
  mobile_pay: "Pago M\u00f3vil",
  card: "Tarjeta de Cr\u00e9dito/D\u00e9bito",
  debt: "Cr\u00e9dito",
  zelle: "Zelle",
  usdt: "USDT",
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: sale, error: saleError } = await supabase
    .schema("mercadeo")
    .from("sales")
    .select(
      "*, customers(*), sale_items(*, products(name, description, images), product_variants(variant_name, variant_value))"
    )
    .eq("id", id)
    .single()

  if (saleError || !sale) {
    notFound()
  }

  const { data: business } = await supabase
    .schema("mercadeo")
    .from("profiles")
    .select("business_name, rif_number, logo_url, phone_whatsapp")
    .eq("id", sale.business_id)
    .single()

  interface SaleItem {
    id: string
    quantity: number
    unit_price: number
    discount?: number
    products?: { name: string } | null
    product_variants?: { variant_name: string; variant_value: string } | null
  }

  const subtotal = sale.sale_items.reduce(
    (sum: number, item: SaleItem) => sum + Number(item.unit_price) * item.quantity,
    0
  )
  const discountAmount = Number(sale.discount_amount || 0)
  const taxAmount = Number(sale.tax_amount || 0)
  const igtfAmount = Number(sale.igtf_amount || 0)
  const total = Number(sale.total_amount)

  const invoiceNumber = `INV-${new Date(sale.created_at).getFullYear()}${String(
    new Date(sale.created_at).getMonth() + 1
  ).padStart(2, "0")}-${String(1).padStart(4, "0")}`

  const invoiceDate = formatDate(sale.created_at)

  async function handleMarkDelivered() {
    "use server"
    await markAsDelivered(id)
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/billing">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Factura {invoiceNumber}
              </h1>
              <p className="text-muted-foreground">{invoiceDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SaleStatusBadge status={sale.sale_status} />
            {sale.sale_status === "pending" && (
              <form action={handleMarkDelivered}>
                <Button type="submit" variant="outline" size="sm">
                  <CheckCircle className="size-4" />
                  Marcar Entregada
                </Button>
              </form>
            )}
            {sale.customers?.phone && (
              <a
                href={whatsappLink(sale.customers.phone)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <MessageCircle className="size-4" />
                  WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="mb-1 text-xs text-muted-foreground">Cliente</p>
            <p className="text-sm font-medium">
              {sale.customers?.name || "Cliente general"}
            </p>
            {sale.customers?.id_number && (
              <p className="text-xs text-muted-foreground">
                RIF/C.I.: {sale.customers.id_number}
              </p>
            )}
            {sale.customers?.phone && (
              <p className="text-xs text-muted-foreground">
                {formatPhone(sale.customers.phone)}
              </p>
            )}
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="mb-1 text-xs text-muted-foreground">M\u00e9todo de Pago</p>
            <p className="text-sm font-medium">
              {PAYMENT_LABELS[sale.payment_method] || sale.payment_method}
            </p>
            <p className="text-xs text-muted-foreground">
              {sale.payment_currency || "USD"}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="mb-1 text-xs text-muted-foreground">Fecha de Emisi\u00f3n</p>
            <p className="text-sm font-medium">{invoiceDate}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="mb-1 text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold tabular-nums">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(total)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <InvoicePdf
              business={{
                business_name: business?.business_name || "Mi Negocio",
                rif_number: business?.rif_number || null,
                logo_url: business?.logo_url || null,
                phone_whatsapp: business?.phone_whatsapp || null,
              }}
              customer={{
                name: sale.customers?.name || "Cliente general",
                id_number: sale.customers?.id_number || null,
                phone: sale.customers?.phone || null,
                email: sale.customers?.email || null,
                address: sale.customers?.address || null,
              }}
              invoiceNumber={invoiceNumber}
              invoiceDate={invoiceDate}
              items={sale.sale_items}
              subtotal={subtotal}
              taxAmount={taxAmount}
              igtfAmount={igtfAmount}
              total={total}
              paymentMethod={sale.payment_method}
              notes={sale.notes}
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold">Desglose</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(subtotal)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Descuento</span>
                    <span className="text-destructive tabular-nums">
                      -
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA (16%)</span>
                  <span className="tabular-nums">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(taxAmount)}
                  </span>
                </div>
                {igtfAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IGTF (3%)</span>
                    <span className="tabular-nums">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(igtfAmount)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(total)}
                  </span>
                </div>
                {sale.exchange_rate && sale.exchange_rate !== 1 && (
                  <p className="text-xs text-muted-foreground">
                    Tasa de cambio: {sale.exchange_rate} Bs./USD
                  </p>
                )}
              </div>
            </div>

            {sale.notes && (
              <div className="rounded-xl border bg-card p-5">
                <h3 className="mb-2 text-sm font-semibold">Notas</h3>
                <p className="text-sm text-muted-foreground">{sale.notes}</p>
              </div>
            )}

            <div className="rounded-xl border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">Art\u00edculos</h3>
              <div className="space-y-3">
                {sale.sale_items.map((item: SaleItem) => (
                  <div key={item.id} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        {item.products?.name || "Producto"}
                      </p>
                      {item.product_variants && (
                        <p className="text-xs text-muted-foreground">
                          {item.product_variants.variant_name}:{" "}
                          {item.product_variants.variant_value}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x{" "}
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(Number(item.unit_price))}
                      </p>
                    </div>
                    <p className="text-sm font-medium tabular-nums">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(Number(item.unit_price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
