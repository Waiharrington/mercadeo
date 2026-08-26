"use client"

import { Printer, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InvoicePreview } from "@/components/billing/invoice-preview"

interface InvoicePdfProps {
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
  items: Array<{
    products?: { name: string } | null
    product_variants?: { variant_name: string; variant_value: string } | null
    quantity: number
    unit_price: number
    discount?: number
  }>
  subtotal: number
  taxAmount: number
  igtfAmount: number
  total: number
  paymentMethod: string
  notes?: string | null
}

export function InvoicePdf({
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
}: InvoicePdfProps) {
  function handlePrint() {
    window.print()
  }

  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="size-4" />
          Imprimir
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Download className="size-4" />
          Descargar PDF
        </Button>
      </div>

      <div className="print-area">
        <InvoicePreview
          business={business}
          customer={customer}
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          items={items}
          subtotal={subtotal}
          taxAmount={taxAmount}
          igtfAmount={igtfAmount}
          total={total}
          paymentMethod={paymentMethod}
          notes={notes}
        />
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 10mm;
            size: A4;
          }
        }
      `}</style>
    </div>
  )
}
