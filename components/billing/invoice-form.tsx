"use client"

import { useState, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, FileText, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { createInvoice } from "@/lib/actions/billing"
import { formatCurrency } from "@/lib/currency"
import { InvoicePreview } from "@/components/billing/invoice-preview"

interface SaleItem {
  id: string
  product_id: string
  variant_id?: string | null
  quantity: number
  unit_price: number
  cost_price?: number
  discount?: number
  products?: { name: string; description?: string | null } | null
  product_variants?: { variant_name: string; variant_value: string } | null
}

interface Sale {
  id: string
  total_amount: number
  discount_amount: number
  tax_amount: number
  igtf_amount: number
  payment_method: string
  payment_currency: string
  sale_status: string
  notes?: string | null
  created_at: string
  customers?: {
    name: string
    phone?: string | null
    email?: string | null
    id_number?: string | null
    address?: string | null
  } | null
  sale_items: SaleItem[]
}

interface InvoiceFormProps {
  businessId: string
  business: {
    business_name: string
    rif_number?: string | null
    logo_url?: string | null
    phone_whatsapp?: string | null
    address?: string | null
  }
  sales: Sale[]
  invoiceNumber: string
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  bank_transfer: "Transferencia",
  mobile_pay: "Pago M\u00f3vil",
  card: "Tarjeta",
  debt: "Cr\u00e9dito",
  zelle: "Zelle",
  usdt: "USDT",
}

export function InvoiceForm({
  businessId,
  business,
  sales,
  invoiceNumber,
}: InvoiceFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedSaleId, setSelectedSaleId] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const selectedSale = sales.find((s) => s.id === selectedSaleId) || null

  const subtotal = selectedSale
    ? selectedSale.sale_items.reduce(
        (sum, item) => sum + Number(item.unit_price) * item.quantity,
        0
      )
    : 0

  const discountAmount = selectedSale ? Number(selectedSale.discount_amount || 0) : 0
  const taxAmount = selectedSale ? Number(selectedSale.tax_amount || 0) : 0
  const igtfAmount = selectedSale ? Number(selectedSale.igtf_amount || 0) : 0
  const total = selectedSale ? Number(selectedSale.total_amount) : 0

  const handleGenerate = useCallback(async () => {
    if (!selectedSaleId) {
      setError("Selecciona una venta para facturar")
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await createInvoice(businessId, {
        sale_id: selectedSaleId,
        notes: notes || undefined,
      })

      if (result.success && result.data) {
        const invoiceData = result.data as { sale: { id: string } };
        router.push(`/billing/${invoiceData.sale.id}`)
      } else {
        setError(result.error || "Error al crear la factura")
      }
    })
  }, [selectedSaleId, businessId, notes, router])

  const invoiceDate = new Date().toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="size-4" />
                Seleccionar Venta
              </CardTitle>
              <CardDescription>
                Elige la venta que deseas facturar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <div className="rounded-lg border border-dashed py-12 text-center">
                  <ShoppingCart className="mx-auto mb-3 size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No hay ventas pendientes de facturar
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sales.map((sale) => (
                    <button
                      key={sale.id}
                      onClick={() => setSelectedSaleId(sale.id)}
                      className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors ${
                        selectedSaleId === sale.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                          {sale.sale_items.length}
                        </div>
                        <div>
                          <p className="font-medium">
                            {sale.customers?.name || "Cliente general"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sale.created_at).toLocaleDateString("es-VE", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium tabular-nums">
                          {formatCurrency(Number(sale.total_amount))}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                        >
                          {PAYMENT_LABELS[sale.payment_method] || sale.payment_method}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedSale && (
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Venta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 font-medium">Producto</th>
                        <th className="pb-2 font-medium text-right">Cant.</th>
                        <th className="pb-2 font-medium text-right">P. Unit.</th>
                        <th className="pb-2 font-medium text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.sale_items.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2.5">
                            <span className="font-medium">
                              {item.products?.name || "Producto"}
                            </span>
                            {item.product_variants && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({item.product_variants.variant_value})
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-right tabular-nums">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 text-right tabular-nums">
                            {formatCurrency(Number(item.unit_price))}
                          </td>
                          <td className="py-2.5 text-right font-medium tabular-nums">
                            {formatCurrency(Number(item.unit_price) * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Descuento</span>
                      <span className="text-destructive tabular-nums">
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IVA (16%)</span>
                    <span className="tabular-nums">{formatCurrency(taxAmount)}</span>
                  </div>
                  {igtfAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IGTF (3%)</span>
                      <span className="tabular-nums">{formatCurrency(igtfAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="tabular-nums">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Input
                    id="notes"
                    placeholder="Notas para la factura..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4" />
                Vista Previa
              </CardTitle>
              <CardDescription>{invoiceNumber}</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSale ? (
                <div className="scale-[0.5] origin-top-left" style={{ height: "420px" }}>
                  <InvoicePreview
                    business={business}
                    customer={{
                      name: selectedSale.customers?.name || "Cliente general",
                      id_number: selectedSale.customers?.id_number || null,
                      phone: selectedSale.customers?.phone || null,
                      email: selectedSale.customers?.email || null,
                    }}
                    invoiceNumber={invoiceNumber}
                    invoiceDate={invoiceDate}
                    items={selectedSale.sale_items}
                    subtotal={subtotal}
                    taxAmount={taxAmount}
                    igtfAmount={igtfAmount}
                    total={total}
                    paymentMethod={selectedSale.payment_method}
                    notes={notes}
                  />
                </div>
              ) : (
                <div className="flex h-[210px] items-center justify-center rounded-lg border border-dashed">
                  <p className="text-sm text-muted-foreground">
                    Selecciona una venta para ver la vista previa
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/billing")}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={!selectedSaleId || isPending}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileText className="size-4" />
          )}
          Generar Factura
        </Button>
      </div>
    </div>
  )
}
