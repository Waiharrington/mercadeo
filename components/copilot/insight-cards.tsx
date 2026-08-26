"use client";

import { Lightbulb, Megaphone, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type InsightType = "financial_tip" | "marketing_copy" | "daily_advice";

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface InsightCardsProps {
  insights: Insight[];
}

const typeConfig: Record<
  InsightType,
  { icon: typeof Lightbulb; color: string; bg: string }
> = {
  financial_tip: {
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  marketing_copy: {
    icon: Megaphone,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  daily_advice: {
    icon: Calendar,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
};

export function InsightCards({ insights }: InsightCardsProps) {
  if (insights.length === 0) return null;

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight) => {
        const config = typeConfig[insight.type];
        const Icon = config.icon;

        return (
          <div
            key={insight.id}
            className={cn(
              "rounded-lg border p-4 transition-shadow hover:shadow-md",
              config.bg
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  config.color,
                  "bg-white"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{insight.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {insight.description}
                </p>
                {insight.actionLabel && insight.onAction && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-2 text-xs"
                    onClick={insight.onAction}
                  >
                    {insight.actionLabel}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Pre-defined insight templates
export const defaultInsights: Insight[] = [
  {
    id: "1",
    type: "financial_tip",
    title: "Consejo financiero",
    description:
      "Tu margen de ganancia este mes es del 64%. ¡Está por encima del promedio del sector!",
    actionLabel: "Ver detalles",
  },
  {
    id: "2",
    type: "marketing_copy",
    title: "Sugerencia de marketing",
    description:
      "El café es uno de tus productos más vendidos. Considera crear una promoción de café + galletas.",
    actionLabel: "Crear promoción",
  },
  {
    id: "3",
    type: "daily_advice",
    title: "Consejo del día",
    description:
      "Tienes 2 productos con stock bajo. Reabastecerlos a tiempo evita pérdidas de ventas.",
    actionLabel: "Ver inventario",
  },
];
