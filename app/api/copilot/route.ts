import { NextResponse } from "next/server";
import { BusinessContext } from "@/lib/ai/context-builder";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, conversationId } = body;

    if (!message) {
      return NextResponse.json({ error: "El mensaje es requerido" }, { status: 400 });
    }

    // In production, fetch real business data from database
    // For now, use mock context
    const mockContext: BusinessContext = {
      businessName: "Mi Negocio",
      topProducts: [
        { name: "Arroz 1lb", quantity: 150, revenue: 7500 },
        { name: "Aceite 1L", quantity: 98, revenue: 11760 },
        { name: "Azúcar 1lb", quantity: 85, revenue: 4250 },
        { name: "Leche 1L", quantity: 72, revenue: 6480 },
        { name: "Café 250g", quantity: 60, revenue: 6000 },
      ],
      recentSales: [
        { id: "1", customer: "María López", total: 2340, date: "2026-08-25", items: 5 },
        { id: "2", customer: "Juan Pérez", total: 890, date: "2026-08-25", items: 3 },
        { id: "3", customer: "Ana García", total: 1560, date: "2026-08-24", items: 4 },
        { id: "4", customer: "Carlos Rodríguez", total: 3200, date: "2026-08-24", items: 8 },
      ],
      customerCount: 127,
      totalRevenue: 145000,
      lowStockItems: [
        { name: "Café 250g", stock: 5, minStock: 20 },
        { name: "Leche 1L", stock: 8, minStock: 25 },
      ],
      monthlyExpenses: 32000,
      monthlyRevenue: 89000,
      pendingDebt: 12500,
    };

    // Mock AI response - in production, call OpenAI/Claude API
    const aiResponse = generateMockResponse(message, mockContext);

    // In production, save to database:
    // await saveMessage(conversationId, "user", message);
    // await saveMessage(conversationId, "assistant", aiResponse);

    return NextResponse.json({
      response: aiResponse,
      conversationId: conversationId || crypto.randomUUID(),
    });
  } catch (error) {
    console.error("Copilot API error:", error);
    return NextResponse.json(
      { error: "Error al procesar tu mensaje" },
      { status: 500 }
    );
  }
}

function generateMockResponse(
  message: string,
  context: BusinessContext
): string {
  const lower = message.toLowerCase();

  // Sales queries
  if (lower.includes("vendido") && (lower.includes("mes") || lower.includes("total"))) {
    const profit = context.monthlyRevenue - context.monthlyExpenses;
    return `📊 **Resumen de ventas del mes:**\n\n` +
      `- **Ingresos totales:** $${context.monthlyRevenue.toLocaleString("es-DO")}\n` +
      `- **Gastos:** $${context.monthlyExpenses.toLocaleString("es-DO")}\n` +
      `- **Ganancia neta:** $${profit.toLocaleString("es-DO")}\n\n` +
      `Tu margen de ganancia es del ${((profit / context.monthlyRevenue) * 100).toFixed(1)}%. ` +
      `${profit > 0 ? "¡Sigue así!" : "Revisa tus gastos para mejorar."}`;
  }

  // Top products
  if (lower.includes("más vendido") || lower.includes("producto") && lower.includes("top")) {
    const top3 = context.topProducts.slice(0, 3);
    return `🏆 **Tus productos más vendidos:**\n\n` +
      top3.map((p, i) => `${i + 1}. **${p.name}** - ${p.quantity} unidades ($${p.revenue.toLocaleString("es-DO")})`).join("\n") +
      `\n\nEstos productos representan el ${((top3.reduce((a, p) => a + p.quantity, 0) / context.topProducts.reduce((a, p) => a + p.quantity, 0)) * 100).toFixed(0)}% de tus ventas totales.`;
  }

  // Debt
  if (lower.includes("deuda") || lower.includes("pendiente") || lower.includes("deben")) {
    return `💳 **Clientes con deuda pendiente:**\n\n` +
      `- Deuda total pendiente: **$${context.pendingDebt.toLocaleString("es-DO")}**\n\n` +
      `Recomiendo enviar recordatorios de pago a los clientes con deuda antigua. ¿Quieres que te ayude a crear un mensaje de cobranza?`;
  }

  // Low stock / reabastecer
  if (lower.includes("reabastecer") || lower.includes("stock bajo") || lower.includes("falta")) {
    if (context.lowStockItems.length === 0) {
      return `✅ ¡Todos tus productos tienen stock suficiente! No hay productos que reabastecer en este momento.`;
    }
    return `⚠️ **Productos que necesitan reabastecimiento:**\n\n` +
      context.lowStockItems.map(item =>
        `- **${item.name}**: ${item.stock} unidades (mínimo: ${item.minStock})`
      ).join("\n") +
      `\n\nTe recomiendo contactar a tus proveedores para reabastecer estos productos lo antes posible.`;
  }

  // Financial summary
  if (lower.includes("finanza") || lower.includes("resumen") || lower.includes("dinero")) {
    const profit = context.monthlyRevenue - context.monthlyExpenses;
    return `💰 **Resumen financiero:**\n\n` +
      `- **Ingresos del mes:** $${context.monthlyRevenue.toLocaleString("es-DO")}\n` +
      `- **Gastos del mes:** $${context.monthlyExpenses.toLocaleString("es-DO")}\n` +
      `- **Ganancia neta:** $${profit.toLocaleString("es-DO")}\n` +
      `- **Deuda pendiente:** $${context.pendingDebt.toLocaleString("es-DO")}\n` +
      `- **Total de clientes:** ${context.customerCount}\n\n` +
      `Tu negocio está ${profit > 0 ? "generando ganancias" : "teniendo pérdidas"} este mes.`;
  }

  // Customers
  if (lower.includes("cliente")) {
    return `👥 **Información de clientes:**\n\n` +
      `- Total de clientes registrados: **${context.customerCount}**\n` +
      `- Deuda pendiente de clientes: **$${context.pendingDebt.toLocaleString("es-DO")}**\n\n` +
      `¿Quieres ver información específica sobre algún cliente o cliente con deuda?`;
  }

  // Greeting
  if (lower.includes("hola") || lower.includes("buenos") || lower.includes("buenas")) {
    return `¡Hola! 👋 Soy tu asistente de MERCADEO. Estoy aquí para ayudarte con:\n\n` +
      `- 📊 Análisis de ventas\n` +
      `- 📦 Estado del inventario\n` +
      `- 👥 Información de clientes\n` +
      `- 💰 Resumen financiero\n\n` +
      `¿Qué te gustaría saber sobre tu negocio?`;
  }

  // Help
  if (lower.includes("ayuda") || lower.includes("qué puedes") || lower.includes("que puedes")) {
    return `Puedo ayudarte con:\n\n` +
      `• **Ventas:** "¿Cuánto he vendido este mes?"\n` +
      `• **Productos:** "¿Cuáles son mis productos más vendidos?"\n` +
      `• **Inventario:** "¿Qué productos necesitan reabastecer?"\n` +
      `• **Clientes:** "¿Quiénes son mis clientes con deuda?"\n` +
      `• **Finanzas:** "Dame un resumen de mis finanzas"\n\n` +
      `También puedes hacerme preguntas específicas sobre tu negocio.`;
  }

  // Default response
  return `Gracias por tu pregunta. Basándome en los datos de tu negocio, aquí tienes algo de información:\n\n` +
    `- Tienes **${context.customerCount}** clientes registrados\n` +
    `- Tus ingresos del mes son **$${context.monthlyRevenue.toLocaleString("es-DO")}**\n` +
    `- Tienes **${context.lowStockItems.length}** productos con stock bajo\n\n` +
    `¿Puedes darme más detalles sobre lo que necesitas saber? Puedo ayudarte con ventas, inventario, clientes y finanzas.`;
}
