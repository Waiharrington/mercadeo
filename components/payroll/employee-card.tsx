"use client"

import Link from "next/link"
import { User, DollarSign } from "lucide-react"

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

interface EmployeeCardProps {
  employee: {
    id: string
    full_name: string
    position?: string | null
    phone?: string | null
    email?: string | null
    salary?: number
    commission_rate?: number
    is_active?: boolean
  }
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const isActive = employee.is_active !== false

  return (
    <Link href={`/payroll/${employee.id}`}>
      <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{employee.full_name}</p>
                {employee.position && (
                  <p className="text-xs text-muted-foreground truncate">
                    {employee.position}
                  </p>
                )}
              </div>
            </div>
            <Badge
              variant={isActive ? "default" : "secondary"}
              className="text-[10px]"
            >
              {isActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
            <span className="flex items-center gap-1">
              <DollarSign className="size-3" />
              {formatCurrency(Number(employee.salary || 0))}
            </span>
            <span className="font-medium text-foreground">
              {Number(employee.commission_rate || 0)}% comision
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
