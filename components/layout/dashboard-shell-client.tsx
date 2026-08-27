"use client"

import Link from "next/link"
import { Store, LogOutIcon, BellIcon } from "lucide-react"

import { SidebarNav } from "@/components/layout/sidebar-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

interface DashboardShellClientProps {
  children: React.ReactNode
  user: {
    email?: string
    displayName: string
    initials: string
    avatarUrl?: string | null
  } | null
  signOutAction: () => Promise<void>
}

export function DashboardShellClient({
  children,
  user,
  signOutAction,
}: DashboardShellClientProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Store className="size-5" />
          <Link href="/dashboard" className="font-semibold tracking-tight">
            MERCADEO
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarNav />
        </div>
        <Separator />
        <div className="p-4">
          <form action={signOutAction}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground"
              size="sm"
            >
              <LogOutIcon className="size-4" />
              Cerrar Sesion
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav
              user={user ? { name: user.displayName, email: user.email, avatar: user.avatarUrl ?? undefined } : null}
              signOutAction={signOutAction}
            />
            <Link href="/dashboard" className="font-semibold md:hidden">
              MERCADEO
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <BellIcon className="size-4" />
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                3
              </span>
              <span className="sr-only">Alertas</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="rounded-full" />
                }
              >
                <Avatar size="sm">
                  <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.displayName} />
                  <AvatarFallback>{user?.initials ?? "U"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.displayName ?? "Usuario"}</span>
                    <span className="text-xs text-muted-foreground">{user?.email ?? ""}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/settings" />}>Configuracion</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/customers" />}>Clientes</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <form action={signOutAction} className="w-full">
                    <button type="submit" className="w-full text-left">
                      Cerrar Sesion
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
