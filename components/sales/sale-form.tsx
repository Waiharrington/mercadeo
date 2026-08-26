"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Loader2, ShoppingCart } from "lucide-react"

import { createSale } from "@/lib/actions/sales"
import { getProducts } from "@/lib/actions/products"
import { getCustomers } from "@/lib/actions/customers"
import { CustomerSearch } from "@/components/customers/customer-search"
import { SaleTable } from "@/components/sales/sale-table"
import { PaymentSelector } from "@/components/sales/payment-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Product {
  id: string
  name: string
  selling_price: number
  cost_price: number
  stock_quantity: number
  category?: string | null
  product_variants?: Array<{
    id: string
    variant_name: string
    variant_value: string
    additional_price: number
    stock_quantity: number
  }>
}

interface Customer {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  debt_balance?: number
  total_purchases?: number
}

interface SaleItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  cost_price: number
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function SaleForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [showProductDropdown, setShowProductDropdown] = useState(false)

  const [customerId, setCustomerId] = useState<string | null>(null)
  const [items, setItems] = useState<SaleItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [taxRate, setTaxRate] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [currency, setCurrency] = useState("USD")
  const [exchangeRate, setExchangeRate] = useState(36.5)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    async function loadData() {
      const [productsResult, customersResult] = await Promise.all([
        getProducts("", { is_active: true, limit: 100 }),
        getCustomers("", { is_active: true, limit: 500 }),
      ])
      if (productsResult.success) setProducts((productsResult.data as Product[]) ?? [])
      if (customersResult.success) setCustomers((customersResult.data as Customer[]) ?? [])
    }
    loadData()
  }, [])

  const filteredProducts = products.filter((p) => {
    if (!productSearch) return true
    const q = productSearch.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    )
  })

  const addItem = useCallback(
    (product: Product) => {
      const existing = items.find((i) => i.product_id === product.id)
      if (existing) {
        setItems(
          items.map((i) =>
            i.product_id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        )
      } else {
        setItems([
          ...items,
          {
            product_id: product.id,
            product_name: product.name,
            quantity: 1,
            unit_price: Number(product.selling_price),
            cost_price: Number(product.cost_price),
          },
        ])
      }
      setProductSearch("")
      setShowProductDropdown(false)
    },
    [items]
  )

  const updateQuantity = useCallback(
    (index: number, quantity: number) => {
      setItems(
        items.map((item, i) => (i === index ? { ...item, quantity } : item))
      )
    },
    [items]
  )

  const updatePrice = useCallback(
    (index: number, price: number) => {
      setItems(
        items.map((item, i) => (i === index ? { ...item, unit_price: price } : item))
      )
    },
    [items]
  )

  const removeItem = useCallback(
    (index: number) => {
      setItems(items.filter((_, i) => i !== index))
    },
    [items]
  )

  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const discountAmount = discount
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (taxRate / 100)
  const total = afterDiscount + taxAmount
  const totalInBs = currency === "Bs" ? total * exchangeRate : total

  async function handleSubmit() {
    setError(null)

    if (items.length === 0) {
      setError("Agrega al menos un producto.")
      return
    }

    startTransition(async () => {
      const saleData = {
        customer_id: customerId ?? undefined,
        total_amount: total,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        igtf_amount: 0,
        payment_method: paymentMethod,
        payment_currency: currency,
        exchange_rate: currency === "Bs" ? exchangeRate : 1,
        notes: notes || undefined,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          cost_price: item.cost_price,
        })),
      }

      const result = await createSale("", saleData)

      if (result.success) {
        router.push("/orders")
        router.refresh()
      } else {
        setError(result.error || "Error al crear la venta.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
          <CardDescription>
            Selecciona un cliente o deja vacio para venta general.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerSearch
            customers={customers}
            value={customerId}
            onSelect={setCustomerId}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
          <CardDescription>Busca y agrega productos a la venta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar producto por nombre o categoria..."
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value)
                setShowProductDropdown(true)
              }}
              onFocus={() => setShowProductDropdown(true)}
              className="pl-9"
            />
            {showProductDropdown && productSearch && (
              <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border bg-popover shadow-md">
                {filteredProducts.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    No se encontraron productos
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="cursor-pointer px-3 py-2 hover:bg-accent"
                      onClick={() => addItem(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Stock: {product.stock_quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium tabular-nums">
                            {formatCurrency(Number(product.selling_price))}
                          </p>
                          <button
                            className="text-xs text-primary hover:underline"
                            onClick={(e) => {
                              e.stopPropagation()
                              addItem(product)
                            }}
                          >
                            <Plus className="inline size-3" /> Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <SaleTable
            items={items}
            onUpdateQuantity={updateQuantity}
            onUpdatePrice={updatePrice}
            onRemove={removeItem}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PaymentSelector
            value={paymentMethod}
            onChange={setPaymentMethod}
            currency={currency}
            onCurrencyChange={setCurrency}
            exchangeRate={exchangeRate}
            onExchangeRateChange={setExchangeRate}
          />

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="discount">Descuento ($)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax">Impuesto (%)</Label>
              <Input
                id="tax"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas sobre la venta..."
              className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Descuento</span>
                <span className="text-destructive tabular-nums">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Impuesto ({taxRate}%)</span>
                <span className="tabular-nums">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(total)}</span>
            </div>
            {currency === "Bs" && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total en Bolivares</span>
                <span className="tabular-nums">
                  Bs. {new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2 }).format(totalInBs)}
                </span>
              </div>
            )}
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || items.length === 0}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              <ShoppingCart className="size-4" />
              Registrar Venta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
