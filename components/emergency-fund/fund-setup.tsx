"use client"

import { useState } from "react"
import { Target, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createEmergencyFund } from "@/lib/actions/emergency-fund"

interface FundSetupProps {
  onSuccess?: () => void
}

export function FundSetup({ onSuccess }: FundSetupProps) {
  const [targetAmount, setTargetAmount] = useState("")
  const [monthlyContribution, setMonthlyContribution] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedTarget = parseFloat(targetAmount)
    const parsedMonthly = parseFloat(monthlyContribution) || 0
    if (!parsedTarget || parsedTarget <= 0) return

    setSubmitting(true)
    const result = await createEmergencyFund("", {
      target_amount: parsedTarget,
      monthly_contribution: parsedMonthly > 0 ? parsedMonthly : undefined,
      notes: notes || undefined,
    })
    setSubmitting(false)

    if (result.success) {
      setSuccess(true)
      onSuccess?.()
    }
  }

  if (success) {
    return (
      <Card className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30">
        <CardContent className="flex flex-col items-center py-12">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500">
            <Check className="size-8 text-white" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-emerald-700 dark:text-emerald-300">
            Fondo Creado!
          </h3>
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 text-center max-w-sm">
            Tu fondo de emergencia esta listo. Comienza a contribuir para alcanzar tu meta.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="size-4" />
          Configurar Fondo de Emergencia
        </CardTitle>
        <CardDescription>
          Establece una meta de ahorro para imprevistos. Un fondo saludable cubre 3-6 meses de gastos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target">Meta total del fondo</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="target"
                type="number"
                min="1"
                step="0.01"
                placeholder="10,000.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="pl-6"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Recomendado: 3-6 meses de gastos operativos
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly">Contribucion mensual (opcional)</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="monthly"
                type="number"
                min="0"
                step="0.01"
                placeholder="500.00"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="pl-6"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Cuanto planeas ahorrar cada mes
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fund-notes">Notas (opcional)</Label>
            <Input
              id="fund-notes"
              placeholder="Ej: Para emergencias del negocio"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={!targetAmount || parseFloat(targetAmount) <= 0 || submitting}
            className="w-full"
          >
            {submitting ? "Creando..." : "Crear Fondo de Emergencia"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
