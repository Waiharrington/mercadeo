"use client"

import * as React from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface VariantEntry {
  id: string
  variant_name: string
  variant_value: string
  additional_price: number
  stock_quantity: number
  sku: string
}

interface VariantManagerProps {
  variants: VariantEntry[]
  onChange: (variants: VariantEntry[]) => void
}

export function VariantManager({ variants, onChange }: VariantManagerProps) {
  const addVariant = () => {
    onChange([
      ...variants,
      {
        id: crypto.randomUUID(),
        variant_name: "",
        variant_value: "",
        additional_price: 0,
        stock_quantity: 0,
        sku: "",
      },
    ])
  }

  const removeVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id))
  }

  const updateVariant = (id: string, field: keyof VariantEntry, value: string | number) => {
    onChange(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Variantes</Label>
        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
          <PlusIcon className="size-3" />
          Agregar variante
        </Button>
      </div>

      {variants.length === 0 && (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Sin variantes. Agrega variantes para opciones como talla o color.
        </p>
      )}

      <div className="space-y-3">
        {variants.map((variant, _index) => (
          <div
            key={variant.id}
            className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto_auto_auto_auto]"
          >
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <Input
                placeholder="Talla, Color..."
                value={variant.variant_name}
                onChange={(e) => updateVariant(variant.id, "variant_name", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Valor</Label>
              <Input
                placeholder="M, Rojo..."
                value={variant.variant_value}
                onChange={(e) => updateVariant(variant.id, "variant_value", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Precio adicional</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={variant.additional_price}
                onChange={(e) =>
                  updateVariant(variant.id, "additional_price", parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Stock</Label>
              <Input
                type="number"
                min="0"
                value={variant.stock_quantity}
                onChange={(e) =>
                  updateVariant(variant.id, "stock_quantity", parseInt(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">SKU</Label>
              <Input
                placeholder="Opcional"
                value={variant.sku}
                onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={() => removeVariant(variant.id)}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
