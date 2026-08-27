"use client"

import * as React from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AlertTriangleIcon, ArrowLeftIcon, PackageIcon } from "lucide-react"
import { DashboardShellClient } from "@/components/layout/dashboard-shell-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/lib/actions/auth"

interface LowStockProduct {
  id: string
  name: string
  sku: string | null
  stock_quantity: number
  min_stock_alert: number
  category: string | null
  selling_price: number
}

export default function LowStockPage() {
  const [products, setProducts] = React.useState<LowStockProduct[]>([])
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState<{ email?: string; displayName: string; initials: string; avatarUrl?: string | null } | null>(null)

  React.useEffect(() => {
    async function loadLowStockProducts() {
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

      const { data } = await supabase
        .schema("mercadeo")
        .from("products")
        .select("id, name, sku, stock_quantity, min_stock_alert, category, selling_price")
        .eq("business_id", authUser.id)
        .eq("is_active", true)

      const lowStock = ((data ?? []) as LowStockProduct[]).filter(
        (p) => p.stock_quantity <= (p.min_stock_alert ?? 5)
      )

      setProducts(lowStock.sort((a, b) => a.stock_quantity - b.stock_quantity))
      setLoading(false)
    }
    loadLowStockProducts()
  }, [])

  return (
    <DashboardShellClient user={user} signOutAction={signOut}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" render={<Link href="/inventory" />}>
              <ArrowLeftIcon className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Stock Bajo</h1>
              <p className="text-muted-foreground">
                Productos que requieren reabastecimiento.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <PackageIcon className="size-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-base font-medium">Todo en orden</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No hay productos con stock bajo en este momento.
              </p>
              <Button className="mt-4" render={<Link href="/inventory" />}>
                Volver al Inventario
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3 text-center">Stock Actual</th>
                      <th className="px-4 py-3 text-center">Alerta Minima</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3 text-right">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <Link
                            href={`/inventory/${product.id}`}
                            className="font-medium hover:underline"
                          >
                            {product.name}
                          </Link>
                          {product.sku && (
                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1.5 font-bold text-destructive tabular-nums">
                            <AlertTriangleIcon className="size-3.5" />
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">
                          {product.min_stock_alert ?? 5}
                        </td>
                        <td className="px-4 py-3">
                          {product.category ? (
                            <Badge variant="secondary">{product.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          ${product.selling_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShellClient>
  )
}
