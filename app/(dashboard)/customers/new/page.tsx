import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { CustomerForm } from "@/components/customers/customer-form"

export const metadata = {
  title: "Nuevo Cliente",
}

export default async function NewCustomerPage() {
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

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/customers">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nuevo Cliente</h1>
            <p className="text-muted-foreground">
              Registra un nuevo cliente en tu negocio.
            </p>
          </div>
        </div>

        <CustomerForm mode="create" businessId={businessId} />
      </div>
    </DashboardShell>
  )
}
