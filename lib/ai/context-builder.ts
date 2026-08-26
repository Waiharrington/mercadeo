// Business Context Builder for AI Copilot
// Builds a context string from business data to give the AI knowledge about the business

export interface BusinessContext {
  businessName: string;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  recentSales: Array<{
    id: string;
    customer: string;
    total: number;
    date: string;
    items: number;
  }>;
  customerCount: number;
  totalRevenue: number;
  lowStockItems: Array<{ name: string; stock: number; minStock: number }>;
  monthlyExpenses: number;
  monthlyRevenue: number;
  pendingDebt: number;
}

export function buildBusinessContext(context: BusinessContext): string {
  const lines: string[] = [];

  lines.push(`=== CONTEXTO DEL NEGOCIO ===`);
  lines.push(`Negocio: ${context.businessName}`);
  lines.push(`Fecha: ${new Date().toLocaleDateString("es-DO")}`);
  lines.push("");

  // Financial summary
  lines.push(`=== RESUMEN FINANCIERO ===`);
  lines.push(`Ingresos del mes: $${context.monthlyRevenue.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`);
  lines.push(`Gastos del mes: $${context.monthlyExpenses.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`);
  const profit = context.monthlyRevenue - context.monthlyExpenses;
  lines.push(`Ganancia neta: $${profit.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`);
  lines.push(`Deuda pendiente: $${context.pendingDebt.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`);
  lines.push("");

  // Top products
  if (context.topProducts.length > 0) {
    lines.push(`=== PRODUCTOS MÁS VENDIDOS ===`);
    context.topProducts.slice(0, 5).forEach((p, i) => {
      lines.push(`${i + 1}. ${p.name} - ${p.quantity} unidades vendidas - $${p.revenue.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`);
    });
    lines.push("");
  }

  // Recent sales
  if (context.recentSales.length > 0) {
    lines.push(`=== VENTAS RECIENTES ===`);
    context.recentSales.slice(0, 10).forEach((s) => {
      lines.push(`${s.date} - ${s.customer} - $${s.total.toLocaleString("es-DO", { minimumFractionDigits: 2 })} (${s.items} productos)`);
    });
    lines.push("");
  }

  // Low stock
  if (context.lowStockItems.length > 0) {
    lines.push(`=== PRODUCTOS CON STOCK BAJO ===`);
    context.lowStockItems.forEach((item) => {
      lines.push(`- ${item.name}: ${item.stock} unidades (mínimo: ${item.minStock})`);
    });
    lines.push("");
  }

  // Customer stats
  lines.push(`=== CLIENTES ===`);
  lines.push(`Total de clientes registrados: ${context.customerCount}`);
  lines.push("");

  lines.push(`=== INSTRUCCIONES ===`);
  lines.push(`Eres el asistente inteligente de ${context.businessName}. Responde preguntas sobre el negocio usando los datos proporcionados.`);
  lines.push(`Responde en español, sé conciso y útil. Cuando sea relevante, incluye números y porcentajes.`);
  lines.push(`Si no tienes suficiente información para responder, indica qué datos faltan.`);

  return lines.join("\n");
}
