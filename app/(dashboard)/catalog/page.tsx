"use client"

import * as React from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ExternalLinkIcon, PackageIcon, StoreIcon } from "lucide-react"
import { DashboardShellClient } from "@/components/layout/dashboard-shell-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/lib/actions/auth"

interface CatalogProduct {
  id: string
  name: string
  sku: string | null
  selling_price: number
  category: string | null
  description: string | null
  image_url: string | null
  stock_quantity: number
}

export default function CatalogPage() {
  const [products, setProducts] = React.useState<CatalogProduct[]>([])
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState<{ email?: string; displayName: string; initials: string; avatarUrl?: string | null } | null>(null)
  const [businessSlug, setBusinessSlug] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadCatalog() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        redirect("/login")
        return
      }

      const displayName = authUser.user_metadata?.full_name ?? authUser.email?.split("@")[0] ?? "Usuario"
      const initials = authUser.email?.charAt(0)?.toUpperCase() ?? "U"
      const avatarUrl = authUser.user_metadata?.avatar_url ?? null
      setUser({ email: authUser.email, displayName, initials, avatarUrl })

      const { data: profile } = await supabase
        .schema("mercadeo")
        .from("profiles")
        .select("business_slug")
        .eq("id", authUser.id)
        .single()

      setBusinessSlug((profile as { business_slug: string } | null)?.business_slug ?? null)

      const { data } = await supabase
        .schema("mercadeo")
        .from("products")
        .select("id, name, sku, selling_price, category, description, image_url, stock_quantity")
        .eq("business_id", authUser.id)
        .eq("is_active", true)
        .order("name")

      setProducts((data as CatalogProduct[]) ?? [])
      setLoading(false)
    }
    loadCatalog()
  }, [])

  return (
    <DashboardShellClient user={user} signOutAction={signOut}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Catalogo</h1>
            <p className="text-muted-foreground">
              Administra el catalogo online de tu negocio.
            </p>
          </div>
          {businessSlug && (
            <Button variant="outline" render={<a href={`/store/${businessSlug}`} target="_blank" rel="noopener noreferrer" />}>
              <ExternalLinkIcon className="size-4" />
              Ver Catalogo Publico
            </Button>
          )}
        </div>

        {businessSlug && (
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <StoreIcon className="size-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Direccion del Catalogo</p>
                <p className="text-sm text-muted-foreground truncate">
                  /store/{businessSlug}
                </p>
              </div>
              <Button variant="ghost" size="sm" render={<a href={`/store/${businessSlug}`} target="_blank" rel="noopener noreferrer" />}>
                <ExternalLinkIcon className="size-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <PackageIcon className="size-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-base font-medium">Sin productos</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Agrega productos a tu inventario para que aparezcan en el catalogo.
              </p>
              <Button className="mt-4" render={<Link href="/inventory/new" />}>
                Agregar Producto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PackageIcon className="size-10 text-muted-foreground/30" />
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate">{product.name}</h3>
                      {product.sku && (
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular-nums">
                      ${product.selling_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {product.description && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    {product.category ? (
                      <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-muted-foreground tabular-nums">
                      Stock: {product.stock_quantity}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShellClient>
  )
}
