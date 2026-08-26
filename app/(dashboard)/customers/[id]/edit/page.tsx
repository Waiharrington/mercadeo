import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { CustomerForm } from "@/components/customers/customer-form"

export const metadata = {
  title: "Editar Cliente",
}

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .schema("mercadeo")
    .from("profiles")
    .select("business_id")
    .eq("id", user.id)
    .single()

  const businessId = profile?.business_id ?? ""

  const { data: customer, error } = await supabase
    .schema("mercadeo")
    .from("customers")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !customer) {
    notFound()
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/customers/${id}`}>
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Cliente</h1>
            <p className="text-muted-foreground">
              Actualiza la informacion de {customer.name}.
            </p>
          </div>
        </div>

        <CustomerForm
          mode="edit"
          customerId={id}
          businessId={businessId}
          initialData={{
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            id_number: customer.id_number,
            notes: customer.notes,
          }}
        />
      </div>
    </DashboardShell>
  )
}
