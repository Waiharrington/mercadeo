import { formatCurrency } from "@/lib/currency"

interface InvoiceItem {
  products?: { name: string } | null
  product_variants?: { variant_name: string; variant_value: string } | null
  quantity: number
  unit_price: number
  discount?: number
}

interface InvoicePreviewProps {
  business: {
    business_name: string
    rif_number?: string | null
    logo_url?: string | null
    phone_whatsapp?: string | null
    address?: string | null
  }
  customer: {
    name: string
    id_number?: string | null
    phone?: string | null
    email?: string | null
    address?: string | null
  }
  invoiceNumber: string
  invoiceDate: string
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  igtfAmount: number
  total: number
  paymentMethod: string
  notes?: string | null
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

export function InvoicePreview({
  business,
  customer,
  invoiceNumber,
  invoiceDate,
  items,
  subtotal,
  taxAmount,
  igtfAmount,
  total,
  paymentMethod,
  notes,
}: InvoicePreviewProps) {
  return (
    <div className="mx-auto w-full max-w-[210mm] bg-white text-black shadow-lg">
      <div className="p-8">
        <header className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.business_name}
                className="h-16 w-16 rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-2xl font-bold text-gray-400">
                {business.business_name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{business.business_name}</h2>
              {business.rif_number && (
                <p className="text-sm text-gray-600">RIF: {business.rif_number}</p>
              )}
              {business.phone_whatsapp && (
                <p className="text-sm text-gray-600">Tel: {business.phone_whatsapp}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <h1 className="mb-1 text-3xl font-bold uppercase tracking-wide text-gray-800">
              Factura
            </h1>
            <p className="text-sm font-semibold text-gray-700">{invoiceNumber}</p>
            <p className="text-sm text-gray-500">{invoiceDate}</p>
          </div>
        </header>

        <div className="mb-8 grid grid-cols-2 gap-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Facturar a
            </p>
            <p className="text-sm font-bold">{customer.name}</p>
            {customer.id_number && (
              <p className="text-sm text-gray-600">RIF/C.I.: {customer.id_number}</p>
            )}
            {customer.phone && (
              <p className="text-sm text-gray-600">Tel: {customer.phone}</p>
            )}
            {customer.email && (
              <p className="text-sm text-gray-600">{customer.email}</p>
            )}
            {customer.address && (
              <p className="text-sm text-gray-600">{customer.address}</p>
            )}
          </div>
          <div className="text-right">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              M\u00e9todo de Pago
            </p>
            <p className="text-sm font-bold">
              {PAYMENT_LABELS[paymentMethod] || paymentMethod}
            </p>
          </div>
        </div>

        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-800 text-left">
              <th className="pb-2 font-bold">Descripci\u00f3n</th>
              <th className="pb-2 text-center font-bold">Cant.</th>
              <th className="pb-2 text-right font-bold">P. Unitario</th>
              <th className="pb-2 text-right font-bold">Descuento</th>
              <th className="pb-2 text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const name = item.products?.name || "Producto"
              const variant = item.product_variants
                ? ` - ${item.product_variants.variant_name}: ${item.product_variants.variant_value}`
                : ""
              const lineSubtotal = Number(item.unit_price) * item.quantity
              const lineDiscount = Number(item.discount || 0)
              const lineTotal = lineSubtotal - lineDiscount

              return (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-2.5">
                    <span className="font-medium">{name}</span>
                    {variant && (
                      <span className="ml-1 text-gray-500">{variant}</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center tabular-nums">{item.quantity}</td>
                  <td className="py-2.5 text-right tabular-nums">
                    {formatCurrency(Number(item.unit_price))}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">
                    {lineDiscount > 0 ? (
                      <span className="text-red-600">-{formatCurrency(lineDiscount)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right font-medium tabular-nums">
                    {formatCurrency(lineTotal)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="mb-6 rounded-lg border border-dashed border-gray-300 py-8 text-center text-sm text-gray-500">
            No hay art\u00edculos en esta factura
          </div>
        )}

        <div className="ml-auto w-72">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">IVA (16%)</span>
              <span className="tabular-nums">{formatCurrency(taxAmount)}</span>
            </div>
            {igtfAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">IGTF (3%)</span>
                <span className="tabular-nums">{formatCurrency(igtfAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-gray-800 pt-2 text-base font-bold">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {notes && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Notas
            </p>
            <p className="text-sm text-gray-700">{notes}</p>
          </div>
        )}

        <div className="mt-10 border-t border-gray-200 pt-6 text-center">
          <p className="text-xs text-gray-500">
            Gracias por su compra
          </p>
          <p className="mt-1 text-[10px] text-gray-400">
            {business.business_name} - {business.rif_number || "Sin RIF"}
          </p>
        </div>
      </div>
    </div>
  )
}
