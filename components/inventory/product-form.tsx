"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ImageIcon, Loader2Icon, SaveIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { VariantManager, type VariantEntry } from "@/components/inventory/variant-manager"
import { createProduct, updateProduct, createVariant, deleteVariant } from "@/lib/actions/products"
import type { Product, ProductVariant } from "@/types"

interface ProductFormProps {
  product?: Product & { product_variants?: ProductVariant[] }
  businessId: string
  categories: string[]
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ProductForm({ product, businessId, categories }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!product

  const [name, setName] = React.useState(product?.name ?? "")
  const [description, setDescription] = React.useState(product?.description ?? "")
  const [category, setCategory] = React.useState(product?.category ?? "")
  const [sku, setSku] = React.useState(product?.sku ?? "")
  const [costPrice, setCostPrice] = React.useState(String(product?.cost_price ?? ""))
  const [sellingPrice, setSellingPrice] = React.useState(String(product?.selling_price ?? ""))
  const [wholesalePrice, setWholesalePrice] = React.useState(String(product?.wholesale_price ?? ""))
  const [stockQuantity, setStockQuantity] = React.useState(String(product?.stock_quantity ?? "0"))
  const [minStockAlert, setMinStockAlert] = React.useState(String(product?.min_stock_alert ?? "5"))
  const [tags, setTags] = React.useState<string[]>(product?.tags ?? [])
  const [tagInput, setTagInput] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [variants, setVariants] = React.useState<VariantEntry[]>(
    (product?.product_variants ?? []).map((v) => ({
      id: v.id,
      variant_name: v.variant_name,
      variant_value: v.variant_value,
      additional_price: v.additional_price,
      stock_quantity: v.stock_quantity,
      sku: v.sku ?? "",
    }))
  )

  const cost = parseFloat(costPrice) || 0
  const selling = parseFloat(sellingPrice) || 0
  const margin = cost > 0 ? ((selling - cost) / cost * 100) : 0

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const productData = {
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        sku: sku.trim() || undefined,
        cost_price: cost,
        selling_price: selling,
        wholesale_price: wholesalePrice ? parseFloat(wholesalePrice) : undefined,
        stock_quantity: parseInt(stockQuantity) || 0,
        min_stock_alert: parseInt(minStockAlert) || 5,
        tags,
      }

      let productId: string

      if (isEditing) {
        const result = await updateProduct(product.id, productData)
        if (!result.success) throw new Error(result.error)
        productId = product.id
      } else {
        const result = await createProduct(businessId, productData)
        if (!result.success) throw new Error(result.error)
        productId = (result.data as { id: string }).id
      }

      if (isEditing && product?.product_variants) {
        const existingIds = new Set(variants.filter((v) => !v.id.startsWith("")).map((v) => v.id))
        for (const oldVariant of product.product_variants) {
          if (!existingIds.has(oldVariant.id)) {
            await deleteVariant(oldVariant.id)
          }
        }
      }

      for (const variant of variants) {
        if (variant.variant_name && variant.variant_value) {
          if (isEditing && !variant.id.startsWith("")) {
            // existing variant - would need updateVariant but we just create new ones
          } else {
            await createVariant(productId, {
              variant_name: variant.variant_name,
              variant_value: variant.variant_value,
              additional_price: variant.additional_price,
              stock_quantity: variant.stock_quantity,
              sku: variant.sku || undefined,
            })
          }
        }
      }

      router.push(`/inventory/${productId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el producto")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informacion del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del producto *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Camiseta Basica"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripcion</Label>
                <textarea
                  id="description"
                  placeholder="Descripcion del producto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="flex w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    placeholder="Seleccionar o crear..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    list="categories-list"
                  />
                  <datalist id="categories-list">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="Codigo unico"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Etiquetas</Label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer gap-1"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <span className="ml-0.5 text-[10px]">×</span>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar etiqueta..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag} disabled={!tagInput.trim()}>
                    Agregar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Precios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Precio de costo *</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selling_price">Precio de venta *</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wholesale_price">Precio mayoreo</Label>
                  <Input
                    id="wholesale_price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                  />
                </div>
              </div>

              {cost > 0 && (
                <div className="mt-3 rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Margen de ganancia:</span>
                    <span
                      className={
                        margin > 0
                          ? "font-bold text-emerald-600"
                          : "font-bold text-destructive"
                      }
                    >
                      {margin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Ganancia por unidad:</span>
                    <span className="tabular-nums">
                      {formatCurrency(selling - cost)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Cantidad en stock *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_stock_alert">Alerta de stock minimo</Label>
                  <Input
                    id="min_stock_alert"
                    type="number"
                    min="0"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variantes</CardTitle>
            </CardHeader>
            <CardContent>
              <VariantManager variants={variants} onChange={setVariants} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Imagen del Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
                <ImageIcon className="size-10 text-muted-foreground/30" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Arrastra una imagen o haz click para subir
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  JPG, PNG. Max 5MB.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <SaveIcon className="size-4" />
              )}
              {isEditing ? "Guardar Cambios" : "Crear Producto"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
