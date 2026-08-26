"use client"

import Link from "next/link"
import { Users, Phone, Mail, ShoppingCart, AlertTriangle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

interface CustomerCardProps {
  customer: {
    id: string
    name: string
    phone?: string | null
    email?: string | null
    total_purchases?: number
    purchase_count?: number
    debt_balance?: number
    last_purchase_at?: string | null
  }
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const hasDebt = Number(customer.debt_balance || 0) > 0

  return (
    <Link href={`/customers/${customer.id}`}>
      <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <Users className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{customer.name}</p>
                {customer.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="size-3" />
                    {customer.phone}
                  </p>
                )}
                {customer.email && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Mail className="size-3" />
                    {customer.email}
                  </p>
                )}
              </div>
            </div>
            {hasDebt && (
              <Badge variant="destructive" className="text-[10px]">
                <AlertTriangle className="size-2.5" />
                Deuda
              </Badge>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
            <span className="flex items-center gap-1">
              <ShoppingCart className="size-3" />
              {customer.purchase_count || 0} compras
            </span>
            <span className="font-medium text-foreground tabular-nums">
              {formatCurrency(Number(customer.total_purchases || 0))}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
