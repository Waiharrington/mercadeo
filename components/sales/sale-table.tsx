"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

interface SaleItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  cost_price?: number
}

interface SaleTableProps {
  items: SaleItem[]
  onUpdateQuantity: (index: number, quantity: number) => void
  onUpdatePrice: (index: number, price: number) => void
  onRemove: (index: number) => void
}

export function SaleTable({
  items,
  onUpdateQuantity,
  onUpdatePrice,
  onRemove,
}: SaleTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Agrega productos a la venta.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left text-muted-foreground">
            <th className="px-3 py-2 font-medium">Producto</th>
            <th className="px-3 py-2 font-medium text-right w-24">Cantidad</th>
            <th className="px-3 py-2 font-medium text-right w-32">Precio Unit.</th>
            <th className="px-3 py-2 font-medium text-right w-32">Subtotal</th>
            <th className="px-3 py-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.product_id} className="border-b last:border-0">
              <td className="px-3 py-2 font-medium">{item.product_name}</td>
              <td className="px-3 py-2 text-right">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateQuantity(index, Math.max(1, Number(e.target.value) || 1))
                  }
                  className="h-7 w-16 rounded border border-input bg-transparent px-2 text-right text-sm tabular-nums outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                />
              </td>
              <td className="px-3 py-2 text-right">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) =>
                    onUpdatePrice(index, Math.max(0, Number(e.target.value) || 0))
                  }
                  className="h-7 w-24 rounded border border-input bg-transparent px-2 text-right text-sm tabular-nums outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                />
              </td>
              <td className="px-3 py-2 text-right font-medium tabular-nums">
                {formatCurrency(item.unit_price * item.quantity)}
              </td>
              <td className="px-3 py-2 text-right">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
