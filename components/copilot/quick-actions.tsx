"use client";

import { TrendingUp, ShoppingCart, Users, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAction: (message: string) => void;
}

const quickActions = [
  {
    icon: TrendingUp,
    label: "Productos más vendidos",
    message: "¿Cuáles son mis productos más vendidos?",
  },
  {
    icon: DollarSign,
    label: "Ventas del mes",
    message: "¿Cuánto he vendido este mes?",
  },
  {
    icon: Users,
    label: "Clientes con deuda",
    message: "¿Quiénes son mis clientes con deuda?",
  },
  {
    icon: Package,
    label: "Reabastecer productos",
    message: "¿Qué productos necesitan reabastecer?",
  },
  {
    icon: ShoppingCart,
    label: "Resumen financiero",
    message: "Dame un resumen de mis finanzas",
  },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-md">
      {quickActions.map((action) => (
        <Button
          key={action.message}
          variant="outline"
          size="sm"
          className="h-auto py-2 px-3 text-xs"
          onClick={() => onAction(action.message)}
        >
          <action.icon className="h-3 w-3 mr-1.5" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
