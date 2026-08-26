"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, MessageSquare, Smartphone, Mail, Eye } from "lucide-react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createCampaign } from "@/lib/actions/marketing"

const CAMPAIGN_TYPES = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "text-green-600" },
  { id: "sms", label: "SMS", icon: Smartphone, color: "text-blue-600" },
  { id: "email", label: "Email", icon: Mail, color: "text-purple-600" },
]

const SEGMENTS = [
  { id: "all", label: "Todos los clientes" },
  { id: "inactive", label: "Clientes inactivos (>30 dias)" },
  { id: "high_spenders", label: "Grandes compradores (>$500)" },
  { id: "debtors", label: "Clientes con deuda" },
]

const TEMPLATES = [
  {
    name: "Promocion",
    content: "Hola {nombre}! Tenemos una oferta especial para ti: {producto} con un descuento especial. No te lo pierdas!",
  },
  {
    name: "Recordatorio de deuda",
    content: "Hola {nombre}, te recordamos que tienes un saldo pendiente de {monto}. Por favor acercate a regularizar.",
  },
  {
    name: "Reactivacion",
    content: "Hola {nombre}! Te extrañamos. Visitanos y descubre las nuevas {producto} que tenemos para ti.",
  },
  {
    name: "Agradecimiento",
    content: "Gracias por tu compra {nombre}! Tu apoyo significa mucho para nosotros. Esperamos verte pronto.",
  },
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [type, setType] = useState("whatsapp")
  const [segment, setSegment] = useState("all")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [schedule, setSchedule] = useState("now")

  function applyTemplate(content: string) {
    setMessage(content)
  }

  function getPreview() {
    return message
      .replace("{nombre}", "Juan Perez")
      .replace("{producto}", "laptops")
      .replace("{monto}", "$500.00")
  }

  async function handleSubmit() {
    if (!message.trim()) return
    setSending(true)

    const result = await createCampaign("", {
      content: JSON.stringify({
        name,
        type,
        segment,
        message,
        schedule,
      }),
    })

    setSending(false)
    if (result.success) {
      router.push("/marketing/campaigns")
    }
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            render={<a href="/marketing/campaigns" />}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nueva Campana</h1>
            <p className="text-muted-foreground">
              Crea una campana para llegar a tus clientes.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Campana</CardTitle>
            <CardDescription>Configura el nombre y tipo de campana</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Nombre de la campana</Label>
              <Input
                id="campaign-name"
                placeholder="Ej: Promo fin de semana"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de envio</Label>
              <div className="flex gap-2">
                {CAMPAIGN_TYPES.map((t) => {
                  const Icon = t.icon
                  return (
                    <Button
                      key={t.id}
                      variant={type === t.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setType(t.id)}
                      className="gap-1.5"
                    >
                      <Icon className={`size-4 ${t.color}`} />
                      {t.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Segmento objetivo</Label>
              <div className="flex flex-wrap gap-2">
                {SEGMENTS.map((s) => (
                  <Button
                    key={s.id}
                    variant={segment === s.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSegment(s.id)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mensaje</CardTitle>
            <CardDescription>
              Usa {"{nombre}"}, {"{producto}"}, {"{monto}"} como variables
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Plantillas rapidas</Label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t) => (
                  <Button
                    key={t.name}
                    variant="outline"
                    size="xs"
                    onClick={() => applyTemplate(t.content)}
                  >
                    {t.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <textarea
                id="message"
                rows={4}
                placeholder="Escribe tu mensaje aqui..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length} caracteres
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-1.5"
            >
              <Eye className="size-4" />
              {showPreview ? "Ocultar vista previa" : "Ver vista previa"}
            </Button>

            {showPreview && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Vista previa:</p>
                <p className="text-sm whitespace-pre-wrap">{getPreview()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Programacion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={schedule === "now" ? "default" : "outline"}
                size="sm"
                onClick={() => setSchedule("now")}
              >
                Enviar ahora
              </Button>
              <Button
                variant={schedule === "scheduled" ? "default" : "outline"}
                size="sm"
                onClick={() => setSchedule("scheduled")}
              >
                Programar
              </Button>
            </div>
            {schedule === "scheduled" && (
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Fecha y hora</Label>
                <Input
                  id="schedule-date"
                  type="datetime-local"
                  className="w-full max-w-xs"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" render={<a href="/marketing/campaigns" />}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || sending}
            className="gap-1.5"
          >
            <Send className="size-4" />
            {sending ? "Enviando..." : schedule === "now" ? "Enviar Campana" : "Programar Campana"}
          </Button>
        </div>
      </div>
    </DashboardShell>
  )
}
