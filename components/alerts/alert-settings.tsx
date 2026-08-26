"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Bell, BellOff, Volume2 } from "lucide-react"

const ALERT_TYPES = [
  { id: "stock_low", label: "Stock Bajo", description: "Notificar cuando un producto tiene stock bajo" },
  { id: "debt_due", label: "Deudas por Cobrar", description: "Notificar cuando una deuda esta por vencer o vencida" },
  { id: "payment_received", label: "Pagos Recibidos", description: "Notificar cuando se recibe un pago" },
  { id: "sale_completed", label: "Ventas Completadas", description: "Notificar al completar una venta" },
  { id: "low_inventory_value", label: "Valor de Inventario Bajo", description: "Notificar cuando el valor total del inventario es bajo" },
]

export function AlertSettings() {
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(ALERT_TYPES.map((t) => [t.id, true]))
  )
  const [saved, setSaved] = useState(false)

  function toggleSetting(id: string) {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }))
    setSaved(false)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-4" />
          Preferencias de Alertas
        </CardTitle>
        <CardDescription>
          Configura que tipo de alertas deseas recibir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ALERT_TYPES.map((type) => (
          <div
            key={type.id}
            className="flex items-center justify-between gap-4 rounded-lg border p-3"
          >
            <div className="min-w-0 flex-1">
              <Label className="text-sm font-medium">{type.label}</Label>
              <p className="text-xs text-muted-foreground">{type.description}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting(type.id)}
              className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{
                backgroundColor: settings[type.id] ? "#16a34a" : "#d1d5db",
              }}
            >
              <span
                className="pointer-events-none block size-4 rounded-full bg-white shadow-lg ring-0 transition-transform"
                style={{
                  transform: settings[type.id] ? "translateX(18px)" : "translateX(2px)",
                }}
              />
            </button>
          </div>
        ))}

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            {saved ? (
              <BellOff className="size-4 text-muted-foreground" />
            ) : (
              <Volume2 className="size-4 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              {saved ? "Preferencias guardadas" : "Los cambios se guardan localmente"}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleSave}>
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
