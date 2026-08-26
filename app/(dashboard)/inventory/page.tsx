import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  PlusIcon,
  SearchIcon,
  LayoutGridIcon,
  ListIcon,
  PackageIcon,
  AlertTriangleIcon,
  TagIcon,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { ProductCard } from "@/components/inventory/product-card"
import { ProductRow } from "@/components/inventory/product-row"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

export const metadata = {
  title: "Inventario",
}

interface InventoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function InventoryContent({ searchParams }: InventoryPageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const search = typeof params.search === "string" ? params.search : ""
  const category = typeof params.category === "string" ? params.category : ""
  const view = typeof params.view === "string" ? params.view : "grid"

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  let query = supabase
    .schema("mercadeo")
    .from("products")
    .select("*, product_variants(*)")
    .eq("business_id", user.id)
    .order("created_at", { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,category.ilike.%${search}%`)
  }
  if (category) {
    query = query.eq("category", category)
  }

  const { data: products } = await query
  const productList = (products as any[]) ?? []

  const totalProducts = productList.length
  const lowStockCount = productList.filter(
    (p) => p.stock_quantity <= (p.min_stock_alert ?? 5)
  ).length
  const totalStockValue = productList.reduce(
    (sum, p) => sum + p.stock_quantity * p.selling_price,
    0
  )

  const categorySet = new Set(productList.map((p) => p.category).filter(Boolean))
  const categories = [...categorySet].sort() as string[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">
            Administra tus productos, stock y categorias.
          </p>
        </div>
        <Button render={<Link href="/inventory/new" />}>
          <PlusIcon className="size-4" />
          Nuevo Producto
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Productos"
          value={String(totalProducts)}
          icon={PackageIcon}
        />
        <StatsCard
          title="Stock Bajo"
          value={String(lowStockCount)}
          icon={AlertTriangleIcon}
          change={lowStockCount > 0 ? "Requiere atencion" : undefined}
          changeType={lowStockCount > 0 ? "negative" : "neutral"}
        />
        <StatsCard
          title="Categorias"
          value={String(categories.length)}
          icon={TagIcon}
        />
        <StatsCard
          title="Valor del Stock"
          value={`$${totalStockValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={PackageIcon}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <form>
            <Input
              name="search"
              placeholder="Buscar productos..."
              defaultValue={search}
              className="pl-8"
            />
            {category && <input type="hidden" name="category" value={category} />}
            <input type="hidden" name="view" value={view} />
          </form>
        </div>
        <div className="flex gap-2">
          <form className="flex gap-2">
            <select
              name="category"
              defaultValue={category}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              onChange={(e) => {
                const form = e.target.closest("form")
                form?.requestSubmit()
              }}
            >
              <option value="">Todas las categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input type="hidden" name="search" value={search} />
            <input type="hidden" name="view" value={view} />
          </form>
          <div className="flex rounded-lg border">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              render={<Link href={`/inventory?search=${search}&category=${category}&view=grid`} />}
            >
              <LayoutGridIcon className="size-3.5" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              render={<Link href={`/inventory?search=${search}&category=${category}&view=list`} />}
            >
              <ListIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {productList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <PackageIcon className="size-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-base font-medium">Sin productos</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || category
                ? "No se encontraron productos con esos filtros."
                : "Comienza agregando tu primer producto al inventario."}
            </p>
            {!search && !category && (
              <Button className="mt-4" render={<Link href="/inventory/new" />}>
                <PlusIcon className="size-4" />
                Agregar Producto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : view === "list" ? (
        <div className="space-y-2">
          <div className="hidden items-center gap-3 px-3 py-1 text-xs font-medium text-muted-foreground lg:flex">
            <div className="size-10" />
            <div className="flex-1">Producto</div>
            <div className="w-24 text-right">Precio</div>
            <div className="w-16 text-center">Stock</div>
            <div className="w-16" />
          </div>
          {productList.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function InventoryPage(props: InventoryPageProps) {
  return (
    <DashboardShell>
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        }
      >
        <InventoryContent searchParams={props.searchParams} />
      </Suspense>
    </DashboardShell>
  )
}
