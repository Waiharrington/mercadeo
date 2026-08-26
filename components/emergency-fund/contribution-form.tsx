"use client"

import { useState } from "react"
import { DollarSign, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { contributeToFund } from "@/lib/actions/emergency-fund"

interface ContributionFormProps {
  fundId: string
  onSuccess?: () => void
}

export function ContributionForm({ fundId, onSuccess }: ContributionFormProps) {
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || parsedAmount <= 0) return

    setSubmitting(true)
    const result = await contributeToFund(fundId, parsedAmount)
    setSubmitting(false)

    if (result.success) {
      setSuccess(true)
      setAmount("")
      setNotes("")
      onSuccess?.()
      setTimeout(() => setSuccess(false), 2000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="size-4" />
          Hacer Contribucion
        </CardTitle>
        <CardDescription>Agrega fondos a tu reserva de emergencia</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-6"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution-date">Fecha</Label>
            <Input
              id="contribution-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Input
              id="notes"
              placeholder="Ej: Contribucion quincenal"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || submitting}
            className="w-full"
          >
            {success ? (
              <>
                <Check className="size-4" />
                Contribucion Registrada!
              </>
            ) : submitting ? (
              "Procesando..."
            ) : (
              <>
                <DollarSign className="size-4" />
                Contribuir {amount ? `$${parseFloat(amount).toFixed(2)}` : ""}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
