import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { generateInvoiceNumber } from "@/lib/actions/billing"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { InvoiceForm } from "@/components/billing/invoice-form"

export const metadata = {
  title: "Nueva Factura",
}

export default async function NewInvoicePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: profile } = await supabase
    .schema("mercadeo")
    .from("profiles")
    .select("business_name, rif_number, logo_url, phone_whatsapp")
    .eq("id", user.id)
    .single()

  const { data: sales } = await supabase
    .schema("mercadeo")
    .from("sales")
    .select("*, customers(name, phone, email, id_number), sale_items(*, products(name), product_variants(variant_name, variant_value))")
    .eq("business_id", user.id)
    .in("sale_status", ["pending", "completed"])
    .order("created_at", { ascending: false })

  const invoiceNumber = await generateInvoiceNumber(user.id)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Factura</h1>
          <p className="text-muted-foreground">
            Genera una factura a partir de una venta existente
          </p>
        </div>

        <InvoiceForm
          businessId={user.id}
          business={{
            business_name: profile?.business_name || "Mi Negocio",
            rif_number: profile?.rif_number || null,
            logo_url: profile?.logo_url || null,
            phone_whatsapp: profile?.phone_whatsapp || null,
          }}
          sales={sales ?? []}
          invoiceNumber={invoiceNumber}
        />
      </div>
    </DashboardShell>
  )
}
