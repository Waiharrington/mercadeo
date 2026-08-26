import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { ProductForm } from "@/components/inventory/product-form"

export const metadata = {
  title: "Nuevo Producto",
}

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: products } = await supabase
    .schema("mercadeo")
    .from("products")
    .select("category")
    .eq("business_id", user.id)
    .not("category", "is", null)

  const categories = [...new Set(
    (products as { category: string }[] | null)
      ?.map((p) => p.category)
      .filter(Boolean) ?? []
  )].sort()

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Producto</h1>
          <p className="text-muted-foreground">
            Agrega un nuevo producto a tu inventario.
          </p>
        </div>
        <ProductForm businessId={user.id} categories={categories} />
      </div>
    </DashboardShell>
  )
}
