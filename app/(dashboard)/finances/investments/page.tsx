"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Loader2Icon,
  PlusIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react"

import { DashboardShellClient } from "@/components/layout/dashboard-shell-client"
import { FinanceSummaryCard } from "@/components/finances/finance-summary-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, signOut } from "@/lib/actions/auth"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export default function InvestmentsPage() {
  const router = useRouter()
  const [investments, setInvestments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [user, setUser] = React.useState<{ email?: string; displayName: string; initials: string; avatarUrl?: string | null } | null>(null)

  const [form, setForm] = React.useState({
    investor_name: "",
    amount: "",
    equity_percentage: "",
    investment_date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  React.useEffect(() => {
    loadInvestments()
  }, [])

  async function loadInvestments() {
    try {
      const { profile } = await getCurrentUser()
      if (!profile) {
        setError("No autenticado")
        setLoading(false)
        return
      }

      const name = profile.full_name || profile.email || ""
      setUser({
        email: profile.email,
        displayName: name,
        initials: name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?",
        avatarUrl: profile.avatar_url ?? null,
      })

      const supabase = await createClient()
      const { data, error: queryError } = await supabase
        .schema("mercadeo")
        .from("investments")
        .select("*")
        .eq("business_id", profile.id)
        .order("investment_date", { ascending: false })

      if (queryError) throw queryError

      setInvestments(data ?? [])
    } catch {
      setError("Error al cargar inversiones")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateInvestment(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.investor_name.trim()) {
      setError("El nombre del inversor es requerido")
      return
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError("El monto debe ser mayor a 0")
      return
    }

    setSaving(true)
    try {
      const { profile } = await getCurrentUser()
      if (!profile) {
        setError("No autenticado")
        return
      }

      const supabase = await createClient()
      const { error: insertError } = await supabase
        .schema("mercadeo")
        .from("investments")
        .insert({
          business_id: profile.id,
          investor_name: form.investor_name.trim(),
          amount: Number(form.amount),
          equity_percentage: form.equity_percentage
            ? Number(form.equity_percentage)
            : null,
          investment_date: form.investment_date,
          notes: form.notes.trim() || null,
        })

      if (insertError) throw insertError

      setForm({
        investor_name: "",
        amount: "",
        equity_percentage: "",
        investment_date: new Date().toISOString().split("T")[0],
        notes: "",
      })
      setDialogOpen(false)
      loadInvestments()
      router.refresh()
    } catch {
      setError("Error al crear la inversion")
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const totalInvested = investments.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  )
  const totalEquity = investments.reduce(
    (sum, inv) => sum + (Number(inv.equity_percentage) || 0),
    0
  )

  return (
    <DashboardShellClient user={user} signOutAction={signOut}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inversiones</h1>
            <p className="text-muted-foreground">
              Registro de inversiones y participacion de socios.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm">
                  <PlusIcon className="size-4" />
                  Nueva Inversion
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Inversion</DialogTitle>
                <DialogDescription>
                  Agrega una nueva inversion o participacion de socio.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateInvestment} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="investor_name">Nombre del Inversor *</Label>
                  <Input
                    id="investor_name"
                    placeholder="Ej: Juan Perez"
                    value={form.investor_name}
                    onChange={(e) => updateField("investor_name", e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto Invertido *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => updateField("amount", e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equity_percentage">
                      Porcentaje de Equity (%)
                    </Label>
                    <Input
                      id="equity_percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0.00"
                      value={form.equity_percentage}
                      onChange={(e) =>
                        updateField("equity_percentage", e.target.value)
                      }
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investment_date">Fecha de Inversion</Label>
                  <Input
                    id="investment_date"
                    type="date"
                    value={form.investment_date}
                    onChange={(e) =>
                      updateField("investment_date", e.target.value)
                    }
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Input
                    id="notes"
                    placeholder="Notas opcionales"
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    disabled={saving}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2Icon className="size-4 animate-spin" />}
                    {saving ? "Guardando..." : "Registrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FinanceSummaryCard
            icon={<TrendingUpIcon className="size-4 text-emerald-600" />}
            label="Total Invertido"
            amount={totalInvested}
          />
          <FinanceSummaryCard
            icon={<UsersIcon className="size-4 text-blue-600" />}
            label="Total Equity Asignado"
            amount={totalEquity}
            currency=""
          />
          <FinanceSummaryCard
            icon={<UsersIcon className="size-4" />}
            label="Numero de Inversores"
            amount={investments.length}
            currency=""
          />
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        ) : investments.length === 0 ? (
          <Card>
            <CardContent>
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/30">
                <div className="text-center">
                  <TrendingUpIcon className="mx-auto size-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No hay inversiones registradas.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Haz clic en &quot;Nueva Inversion&quot; para comenzar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Inversiones Registradas</CardTitle>
              <CardDescription>
                {investments.length} inversion(es) en total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Inversor</th>
                      <th className="pb-2 text-right font-medium">Monto</th>
                      <th className="pb-2 text-right font-medium">Equity %</th>
                      <th className="pb-2 font-medium">Fecha</th>
                      <th className="pb-2 font-medium">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {investments.map((inv) => (
                      <tr key={inv.id} className="py-2">
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                              <UsersIcon className="size-4 text-blue-600" />
                            </div>
                            <span className="font-medium">{inv.investor_name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 text-right font-medium tabular-nums text-emerald-600">
                          {formatCurrency(inv.amount)}
                        </td>
                        <td className="py-2.5 pr-4 text-right">
                          {inv.equity_percentage ? (
                            <Badge variant="secondary">
                              {Number(inv.equity_percentage).toFixed(1)}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {new Date(
                            inv.investment_date ?? inv.created_at
                          ).toLocaleDateString("es-DO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {inv.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShellClient>
  )
}
