"use client"

import * as React from "react"
import { redirect } from "next/navigation"
import { TagIcon } from "lucide-react"
import { DashboardShellClient } from "@/components/layout/dashboard-shell-client"
import { CategoryManager } from "@/components/inventory/category-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/lib/actions/auth"

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<string[]>([])
  const [productCounts, setProductCounts] = React.useState<Record<string, number>>({})
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState<{ email?: string; displayName: string; initials: string; avatarUrl?: string | null } | null>(null)

  React.useEffect(() => {
    async function loadCategories() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        redirect("/login")
        return
      }

      const displayName = authUser.user_metadata?.full_name ?? authUser.email?.split("@")[0] ?? "Usuario"
      const initials = authUser.email?.charAt(0)?.toUpperCase() ?? "U"
      const avatarUrl = authUser.user_metadata?.avatar_url ?? null
      setUser({ email: authUser.email, displayName, initials, avatarUrl })

      const { data } = await supabase
        .schema("mercadeo")
        .from("products")
        .select("category")
        .eq("business_id", authUser.id)
        .not("category", "is", null)

      const categoryMap: Record<string, number> = {}
      const categorySet = new Set<string>()

      for (const row of (data ?? []) as { category: string }[]) {
        categorySet.add(row.category)
        categoryMap[row.category] = (categoryMap[row.category] ?? 0) + 1
      }

      setCategories([...categorySet].sort())
      setProductCounts(categoryMap)
      setLoading(false)
    }
    loadCategories()
  }, [])

  async function handleAdd(name: string) {
    setCategories((prev) => [...prev, name].sort())
  }

  async function handleUpdate(oldName: string, newName: string) {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    await supabase
      .schema("mercadeo")
      .from("products")
      .update({ category: newName })
      .eq("business_id", authUser.id)
      .eq("category", oldName)

    setCategories((prev) =>
      prev.map((c) => (c === oldName ? newName : c)).sort()
    )
    setProductCounts((prev) => {
      const count = prev[oldName] ?? 0
      const rest = Object.fromEntries(Object.entries(prev).filter(([k]) => k !== oldName))
      return { ...rest, [newName]: count }
    })
  }

  async function handleDelete(name: string) {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    await supabase
      .schema("mercadeo")
      .from("products")
      .update({ category: null })
      .eq("business_id", authUser.id)
      .eq("category", name)

    setCategories((prev) => prev.filter((c) => c !== name))
    setProductCounts((prev) => {
      const rest = Object.fromEntries(Object.entries(prev).filter(([k]) => k !== name))
      return rest
    })
  }

  return (
    <DashboardShellClient user={user} signOutAction={signOut}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Organiza tus productos en categorias para mejor gestion.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="size-5" />
              Gestion de Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : (
              <CategoryManager
                categories={categories}
                productCounts={productCounts}
                onAdd={handleAdd}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShellClient>
  )
}
