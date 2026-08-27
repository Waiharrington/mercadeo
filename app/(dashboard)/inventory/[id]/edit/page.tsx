import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { ProductForm } from "@/components/inventory/product-form"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Editar Producto",
}

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: product } = await supabase
    .schema("mercadeo")
    .from("products")
    .select("*, product_variants(*)")
    .eq("id", id)
    .eq("business_id", user.id)
    .single()

  if (!product) notFound()

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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" render={<Link href={`/inventory/${id}`} />}>
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Producto</h1>
            <p className="text-muted-foreground">
              Actualiza la informacion de {product.name}.
            </p>
          </div>
        </div>
        <ProductForm product={product} businessId={user.id} categories={categories} />
      </div>
    </DashboardShell>
  )
}
