"use client"

import * as React from "react"
import { MenuIcon, Store, LogOutIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SidebarNav } from "@/components/layout/sidebar-nav"

interface MobileNavProps {
  user?: { name?: string; email?: string; avatar?: string } | null
  signOutAction?: () => Promise<void>
}

export function MobileNav({ user, signOutAction }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden" />
        }
      >
        <MenuIcon className="size-5" />
        <span className="sr-only">Abrir menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b p-4">
          <div className="flex items-center gap-2">
            <Store className="size-5" />
            <SheetTitle>MERCADEO</SheetTitle>
          </div>
        </SheetHeader>
        {user && (
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Avatar size="sm">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{user.name ?? "Usuario"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email ?? ""}
              </p>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
        {signOutAction && (
          <div className="border-t p-4">
            <form action={signOutAction}>
              <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                <LogOutIcon className="size-4" />
                Cerrar Sesion
              </Button>
            </form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
