import Link from "next/link"
import {
  PackageIcon,
  GlobeIcon,
  ReceiptIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickAction {
  label: string
  href: string
  icon: React.ElementType
}

const actions: QuickAction[] = [
  { label: "Nueva Venta", href: "/orders/new", icon: ShoppingCartIcon },
  { label: "Agregar Producto", href: "/inventory/new", icon: PackageIcon },
  { label: "Ver Catalogo", href: "/catalog", icon: GlobeIcon },
  { label: "Nueva Factura", href: "/billing/new", icon: ReceiptIcon },
  { label: "Nuevo Cliente", href: "/customers/new", icon: UsersIcon },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
          render={<Link href={action.href} />}
        >
          <action.icon className="size-5 text-muted-foreground" />
          <span className="text-xs font-medium">{action.label}</span>
        </Button>
      ))}
    </div>
  )
}
