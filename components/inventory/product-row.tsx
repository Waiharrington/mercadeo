"use client"

import Link from "next/link"
import { PencilIcon, Trash2Icon, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StockAlert } from "@/components/inventory/stock-alert"
import type { Product } from "@/types"

interface ProductRowProps {
  product: Product
  onDelete?: (id: string) => void
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ProductRow({ product, onDelete }: ProductRowProps) {
  const hasLowStock =
    product.stock_quantity <= (product.min_stock_alert ?? 5)

  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50">
      <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon className="size-4 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/inventory/${product.id}`}
            className="truncate text-sm font-medium hover:underline"
          >
            {product.name}
          </Link>
          {hasLowStock && (
            <StockAlert
              stockQuantity={product.stock_quantity}
              minStockAlert={product.min_stock_alert}
              compact
            />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {product.sku && <span>SKU: {product.sku}</span>}
          {product.category && (
            <>
              {product.sku && <span>·</span>}
              <Badge variant="secondary" className="text-[10px]">
                {product.category}
              </Badge>
            </>
          )}
        </div>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-sm font-bold tabular-nums">{formatCurrency(product.selling_price)}</p>
        {product.wholesale_price != null && (
          <p className="text-xs text-muted-foreground tabular-nums">
            May: {formatCurrency(product.wholesale_price)}
          </p>
        )}
      </div>

      <div className="w-16 text-center">
        <span
          className={
            hasLowStock
              ? "text-sm font-semibold text-destructive"
              : "text-sm font-medium"
          }
        >
          {product.stock_quantity}
        </span>
      </div>

      <div className="hidden gap-1 lg:flex">
        <Button
          variant="ghost"
          size="icon-xs"
          render={<Link href={`/inventory/${product.id}`} />}
        >
          <PencilIcon className="size-3" />
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(product.id)}
          >
            <Trash2Icon className="size-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
