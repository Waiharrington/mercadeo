import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { SaleForm } from "@/components/sales/sale-form"

export const metadata = {
  title: "Nueva Venta",
}

export default function NewSalePage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/orders">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nueva Venta</h1>
            <p className="text-muted-foreground">
              Registra una nueva venta para tu negocio.
            </p>
          </div>
        </div>

        <SaleForm />
      </div>
    </DashboardShell>
  )
}
