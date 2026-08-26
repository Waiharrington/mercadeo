"use client"

import Link from "next/link"
import { PencilIcon, Trash2Icon, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StockAlert } from "@/components/inventory/stock-alert"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
  onDelete?: (id: string) => void
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  const hasLowStock =
    product.stock_quantity <= (product.min_stock_alert ?? 5)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md">
      <div className="relative aspect-square bg-muted/50">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon className="size-10 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-1.5">
          {product.category && (
            <Badge variant="secondary" className="text-[10px]">
              {product.category}
            </Badge>
          )}
        </div>
        {hasLowStock && (
          <div className="absolute right-2 top-2">
            <StockAlert
              stockQuantity={product.stock_quantity}
              minStockAlert={product.min_stock_alert}
              compact
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <Link
          href={`/inventory/${product.id}`}
          className="line-clamp-2 text-sm font-medium hover:underline"
        >
          {product.name}
        </Link>
        {product.sku && (
          <p className="mt-0.5 text-xs text-muted-foreground">SKU: {product.sku}</p>
        )}
        <div className="mt-auto flex items-end justify-between pt-2">
          <span className="text-base font-bold">{formatCurrency(product.selling_price)}</span>
          <span className="text-xs text-muted-foreground">
            Stock: {product.stock_quantity}
          </span>
        </div>
      </div>

      <div className="flex border-t px-1 py-1">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-1.5 text-xs"
          render={<Link href={`/inventory/${product.id}`} />}
        >
          <PencilIcon className="size-3" />
          Ver
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-destructive hover:text-destructive"
            onClick={() => onDelete(product.id)}
          >
            <Trash2Icon className="size-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
