"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import {
  LayoutDashboard,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Globe,
  Receipt,
  UserCog,
  BookOpen,
  Bot,
  Bell,
  Megaphone,
  Shield,
  Settings,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavSubItem {
  label: string
  href: string
}

interface NavItemDef {
  label: string
  icon: React.ElementType
  href?: string
  badge?: number
  children?: NavSubItem[]
}

const navItems: NavItemDef[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  {
    label: "Finanzas",
    icon: DollarSign,
    children: [
      { label: "Resumen", href: "/finances" },
      { label: "Ingresos", href: "/finances/income" },
      { label: "Gastos", href: "/finances/expenses" },
      { label: "Cuentas por Cobrar", href: "/finances/accounts-receivable" },
      { label: "Cuentas por Pagar", href: "/finances/accounts-payable" },
      { label: "Inversiones", href: "/finances/investments" },
    ],
  },
  {
    label: "Inventario",
    icon: Package,
    children: [
      { label: "Productos", href: "/inventory" },
      { label: "Categorias", href: "/inventory/categorias" },
      { label: "Stock Bajo", href: "/inventory/stock-bajo" },
    ],
  },
  { label: "Clientes", icon: Users, href: "/customers" },
  { label: "Ordenes/Ventas", icon: ShoppingCart, href: "/orders" },
  { label: "Catalogo Online", icon: Globe, href: "/catalogo" },
  {
    label: "Facturacion",
    icon: Receipt,
    children: [
      { label: "Facturas", href: "/billing" },
      { label: "Nueva Factura", href: "/billing/new" },
    ],
  },
  {
    label: "Nomina",
    icon: UserCog,
    children: [
      { label: "Empleados", href: "/nomina/empleados" },
      { label: "Comisiones", href: "/nomina/comisiones" },
    ],
  },
  { label: "Contabilidad", icon: BookOpen, href: "/contabilidad" },
  { label: "Copilot IA", icon: Bot, href: "/copilot" },
  { label: "Alertas", icon: Bell, href: "/alertas", badge: 3 },
  {
    label: "Marketing",
    icon: Megaphone,
    children: [
      { label: "Campanas", href: "/marketing/campanas" },
      { label: "Segmentacion", href: "/marketing/segmentacion" },
    ],
  },
  { label: "Fondo Emergencia", icon: Shield, href: "/fondo-emergencia" },
]

const bottomItems: NavItemDef[] = [
  { label: "Configuracion", icon: Settings, href: "/settings" },
]

function SidebarNavItem({ item }: { item: NavItemDef }) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  const isActive = item.href
    ? pathname === item.href || pathname.startsWith(item.href + "/")
    : item.children?.some(
        (c) => pathname === c.href || pathname.startsWith(c.href + "/")
      )

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <item.icon className="size-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge !== undefined && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {item.badge}
            </span>
          )}
          <ChevronRight
            className={cn(
              "size-4 shrink-0 transition-transform duration-200",
              open && "rotate-90"
            )}
          />
        </button>
        <div
          className={cn(
            "grid overflow-hidden transition-all duration-200",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l pl-3">
              {item.children.map((child) => {
                const childActive =
                  pathname === child.href || pathname.startsWith(child.href + "/")
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors",
                      childActive
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                  >
                    {child.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <item.icon className="size-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && (
        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

interface SidebarNavProps {
  className?: string
  onNavigate?: () => void
}

export function SidebarNav({ className, onNavigate }: SidebarNavProps) {
  const wrapped = onNavigate
    ? (item: NavItemDef) => (
        <div key={item.label} onClick={onNavigate}>
          <SidebarNavItem item={item} />
        </div>
      )
    : undefined

  return (
    <nav
      className={cn("flex flex-1 flex-col gap-1", className)}
      onClick={onNavigate}
    >
      {navItems.map(wrapped ?? ((item) => <SidebarNavItem key={item.label} item={item} />))}
      <div className="my-2 h-px bg-border" />
      {bottomItems.map(wrapped ?? ((item) => <SidebarNavItem key={item.label} item={item} />))}
    </nav>
  )
}
