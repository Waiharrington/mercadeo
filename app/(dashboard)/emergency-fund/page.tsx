import { Suspense } from "react"
import { redirect } from "next/navigation"
import { DollarSign, History, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { FundProgressBar } from "@/components/emergency-fund/progress-bar"
import { ContributionForm } from "@/components/emergency-fund/contribution-form"
import { FundSetup } from "@/components/emergency-fund/fund-setup"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Fondo de Emergencia",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

async function EmergencyFundContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: fund } = await supabase
    .schema("mercadeo")
    .from("emergency_fund")
    .select("*")
    .eq("business_id", user.id)
    .limit(1)
    .single()

  const progress = { percentage: 0, remaining: 0, monthlyTargetDate: null as string | null }

  if (fund) {
    const targetAmount = Number(fund.target_amount)
    const currentAmount = Number(fund.current_amount)
    const monthlyContribution = Number(fund.monthly_contribution)

    progress.percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
    progress.remaining = Math.max(0, targetAmount - currentAmount)

    if (monthlyContribution > 0 && progress.remaining > 0) {
      const monthsNeeded = Math.ceil(progress.remaining / monthlyContribution)
      const targetDate = new Date()
      targetDate.setMonth(targetDate.getMonth() + monthsNeeded)
      progress.monthlyTargetDate = targetDate.toISOString().split("T")[0]
    }
  }

  const { data: contributions } = fund
    ? await supabase
        .schema("mercadeo")
        .from("cash_movements")
        .select("id, amount, description, created_at")
        .eq("business_id", user.id)
        .eq("category", "emergency_fund")
        .eq("reference_id", fund.id)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: null }

  interface ContributionRow {
    id: string
    amount: number
    description: string
    created_at: string
  }

  const contributionList = (contributions as ContributionRow[]) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fondo de Emergencia</h1>
        <p className="text-muted-foreground">
          Construye un colchon financiero para imprevistos. Un negocio preparado es un negocio fuerte.
        </p>
      </div>

      {!fund ? (
        <FundSetup />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <FundProgressBar
              currentAmount={Number(fund.current_amount)}
              targetAmount={Number(fund.target_amount)}
              percentage={Math.min(100, progress.percentage)}
              remaining={progress.remaining}
              monthlyTargetDate={progress.monthlyTargetDate}
              monthlyContribution={Number(fund.monthly_contribution)}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="size-4" />
                  Historial de Contribuciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contributionList.length === 0 ? (
                  <div className="flex flex-col items-center py-8">
                    <DollarSign className="size-10 text-muted-foreground/30" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Aun no hay contribuciones. Haz tu primera contribucion!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contributionList.map((contrib) => (
                      <div
                        key={contrib.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30">
                            <TrendingUp className="size-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Contribucion</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(contrib.created_at).toLocaleDateString("es-DO", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-emerald-600">
                          +{formatCurrency(Number(contrib.amount))}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <ContributionForm fundId={fund.id} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function EmergencyFundPage() {
  return (
    <DashboardShell>
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
            <div className="grid gap-4 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        }
      >
        <EmergencyFundContent />
      </Suspense>
    </DashboardShell>
  )
}
