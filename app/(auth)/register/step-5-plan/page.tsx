"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { updateProfile } from "@/lib/actions/auth"

const plans = [
  {
    id: "free_trial" as const,
    name: "Prueba 7 Dias",
    price: "Gratis",
    description: "Acceso total a todas las funciones por 7 dias.",
    features: [
      "Inventario ilimitado",
      "Reportes financieros",
      "Catalogo online",
      "Copiloto IA",
    ],
    cta: "Empezar Prueba Gratis",
  },
  {
    id: "personal" as const,
    name: "Personal",
    price: "$3.99/mes",
    description: "Para emprendedores individuales.",
    features: [
      "Todo lo de Prueba",
      "Hasta 100 productos",
      "Soporte prioritario",
      "Sin marca de agua",
    ],
    cta: "Seleccionar Plan",
    popular: true,
  },
  {
    id: "business" as const,
    name: "Empresarial",
    price: "$6.99/mes",
    description: "Para negocios con equipo.",
    features: [
      "Todo lo de Personal",
      "Productos ilimitados",
      "Multiples usuarios",
      "API acceso",
    ],
    cta: "Seleccionar Plan",
  },
]

export default function Step5PlanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<"free_trial" | "personal" | "business">("free_trial")

  async function handleSelectPlan(plan: "free_trial" | "personal" | "business") {
    setSelectedPlan(plan)
    setError("")
    setLoading(true)

    const result = await updateProfile({
      subscription_plan: plan,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push("/register/step-6-branding")
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Elige tu plan</h1>
        <p className="text-muted-foreground">
          Selecciona el plan que mejor se adapte a tus necesidades.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative cursor-pointer transition-all ${
              selectedPlan === plan.id
                ? "ring-2 ring-primary"
                : "hover:ring-1 hover:ring-muted-foreground/50"
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="text-2xl font-bold">{plan.price}</div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={selectedPlan === plan.id ? "default" : "outline"}
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectPlan(plan.id)
                }}
              >
                {loading && selectedPlan === plan.id
                  ? "Procesando..."
                  : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
