import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  PencilIcon,
  Trash2Icon,
  PackageIcon,
  DollarSignIcon,
  BarChart3Icon,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { deleteProduct } from "@/lib/actions/products"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { StockAlert } from "@/components/inventory/stock-alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = {
  title: "Detalle del Producto",
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
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

  const p = product as any
  const variants = (p.product_variants ?? []) as any[]

  const margin =
    p.cost_price > 0
      ? ((p.selling_price - p.cost_price) / p.cost_price * 100)
      : 0

  const hasLowStock = p.stock_quantity <= (p.min_stock_alert ?? 5)

  async function handleDelete() {
    "use server"
    await deleteProduct(id)
    // Redirect will happen via client-side refresh
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" render={<Link href="/inventory" />}>
              <ArrowLeftIcon className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
              {p.sku && (
                <p className="text-sm text-muted-foreground">SKU: {p.sku}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href={`/inventory/${id}/edit`} />}>
              <PencilIcon className="size-4" />
              Editar
            </Button>
            <form action={handleDelete}>
              <Button variant="destructive" type="submit">
                <Trash2Icon className="size-4" />
                Eliminar
              </Button>
            </form>
          </div>
        </div>

        {hasLowStock && (
          <StockAlert
            stockQuantity={p.stock_quantity}
            minStockAlert={p.min_stock_alert}
          />
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackageIcon className="size-4" />
                  Informacion del Producto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {p.description && (
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Categoria</p>
                    <p className="text-sm">
                      {p.category ? (
                        <Badge variant="secondary">{p.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Sin categoria</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Estado</p>
                    <p className="text-sm">
                      <Badge variant={p.is_active ? "default" : "secondary"}>
                        {p.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </p>
                  </div>
                </div>

                {p.tags && p.tags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Etiquetas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Variantes ({variants.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                          <th className="pb-2 pr-4">Tipo</th>
                          <th className="pb-2 pr-4">Valor</th>
                          <th className="pb-2 pr-4 text-right">Precio Adic.</th>
                          <th className="pb-2 pr-4 text-right">Stock</th>
                          <th className="pb-2">SKU</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v: any) => (
                          <tr key={v.id} className="border-b last:border-0">
                            <td className="py-2.5 pr-4 font-medium">{v.variant_name}</td>
                            <td className="py-2.5 pr-4">{v.variant_value}</td>
                            <td className="py-2.5 pr-4 text-right tabular-nums">
                              {v.additional_price > 0
                                ? `+${formatCurrency(v.additional_price)}`
                                : "—"}
                            </td>
                            <td className="py-2.5 pr-4 text-right tabular-nums">
                              {v.stock_quantity}
                            </td>
                            <td className="py-2.5 text-muted-foreground">{v.sku ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3Icon className="size-4" />
                  Historial de Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    Historial de movimientos de stock - proximamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSignIcon className="size-4" />
                  Resumen de Precios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Precio de costo</span>
                    <span className="text-sm font-medium tabular-nums">
                      {formatCurrency(p.cost_price)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Precio de venta</span>
                    <span className="text-base font-bold tabular-nums">
                      {formatCurrency(p.selling_price)}
                    </span>
                  </div>
                  {p.wholesale_price != null && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Precio mayoreo</span>
                        <span className="text-sm font-medium tabular-nums">
                          {formatCurrency(p.wholesale_price)}
                        </span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ganancia por unidad</span>
                    <span
                      className={
                        margin > 0
                          ? "text-sm font-bold text-emerald-600 tabular-nums"
                          : "text-sm font-bold text-destructive tabular-nums"
                      }
                    >
                      {formatCurrency(p.selling_price - p.cost_price)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Margen de ganancia</span>
                    <span
                      className={
                        margin > 0
                          ? "text-sm font-bold text-emerald-600"
                          : "text-sm font-bold text-destructive"
                      }
                    >
                      {margin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackageIcon className="size-4" />
                  Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">En stock</span>
                  <span className="text-2xl font-bold tabular-nums">
                    {p.stock_quantity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Alerta minima</span>
                  <span className="text-sm tabular-nums">{p.min_stock_alert ?? 5}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor total en stock</span>
                  <span className="text-sm font-bold tabular-nums">
                    {formatCurrency(p.stock_quantity * p.selling_price)}
                  </span>
                </div>
                {variants.length > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Stock en variantes</span>
                      <span className="text-sm tabular-nums">
                        {variants.reduce((sum: number, v: any) => sum + v.stock_quantity, 0)}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs text-muted-foreground">Metadatos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Creado</span>
                  <span>
                    {new Date(p.created_at).toLocaleDateString("es-DO", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Actualizado</span>
                  <span>
                    {new Date(p.updated_at).toLocaleDateString("es-DO", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
