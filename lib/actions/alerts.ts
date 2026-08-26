"use server";

import { createClient } from "@/lib/supabase/server";

interface ServerResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getAlerts(
  businessId: string
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .schema("mercadeo").from("alerts")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get alerts",
    };
  }
}

export async function getUnreadAlerts(
  businessId: string
): Promise<ServerResponse<number>> {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .schema("mercadeo").from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("is_read", false);

    if (error) throw error;

    return { success: true, data: count ?? 0 };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get unread alerts",
    };
  }
}

export async function createAlert(
  businessId: string,
  data: {
    type: string;
    title: string;
    message: string;
    severity?: string;
    action_url?: string;
    expires_at?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: alert, error } = await supabase
      .schema("mercadeo").from("alerts")
      .insert({
        business_id: businessId,
        type: data.type,
        title: data.title,
        message: data.message,
        severity: data.severity ?? "info",
        action_url: data.action_url ?? null,
        expires_at: data.expires_at ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: alert };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create alert",
    };
  }
}

export async function markAlertAsRead(
  id: string
): Promise<ServerResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .schema("mercadeo").from("alerts")
      .update({ is_read: true })
      .eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark alert as read",
    };
  }
}

export async function markAllAsRead(
  businessId: string
): Promise<ServerResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .schema("mercadeo").from("alerts")
      .update({ is_read: true })
      .eq("business_id", businessId)
      .eq("is_read", false);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark all alerts as read",
    };
  }
}

export async function deleteAlert(id: string): Promise<ServerResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.schema("mercadeo").from("alerts").delete().eq("id", id);
    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete alert",
    };
  }
}

export async function checkLowStockAlerts(
  businessId: string
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();

    const { data: products, error } = await supabase
      .schema("mercadeo").from("products")
      .select("id, name, stock_quantity, min_stock_alert")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .filter("stock_quantity", "lte", "min_stock_alert");

    if (error) throw error;

    const newAlerts: unknown[] = [];

    for (const product of products ?? []) {
      const { data: existing } = await supabase
        .schema("mercadeo").from("alerts")
        .select("id")
        .eq("business_id", businessId)
        .eq("type", "stock_low")
        .eq("is_read", false)
        .like("message", `%${product.name}%`)
        .limit(1);

      if (!existing || existing.length === 0) {
        const severity =
          product.stock_quantity === 0 ? "critical" : "warning";

        const { data: alert, error: alertError } = await supabase
          .schema("mercadeo").from("alerts")
          .insert({
            business_id: businessId,
            type: "stock_low",
            title: "Low Stock Alert",
            message: `${product.name} has only ${product.stock_quantity} units remaining (min: ${product.min_stock_alert})`,
            severity,
          })
          .select()
          .single();

        if (!alertError && alert) {
          newAlerts.push(alert);
        }
      }
    }

    return { success: true, data: newAlerts };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check low stock alerts",
    };
  }
}

export async function checkDebtAlerts(
  businessId: string
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();

    const today = new Date().toISOString().split("T")[0];

    const { data: receivables, error: recError } = await supabase
      .schema("mercadeo").from("accounts_receivable")
      .select("id, customer_id, remaining_amount, due_date, customers(name)")
      .eq("business_id", businessId)
      .in("status", ["pending", "partial", "overdue"])
      .lte("due_date", today);

    if (recError) throw recError;

    const newAlerts: unknown[] = [];

    for (const receivable of receivables ?? []) {
      const { data: existing } = await supabase
        .schema("mercadeo").from("alerts")
        .select("id")
        .eq("business_id", businessId)
        .eq("type", "debt_due")
        .eq("is_read", false)
        .like("message", `%${receivable.id}%`)
        .limit(1);

      if (!existing || existing.length === 0) {
        const isOverdue = receivable.due_date < today;
        const severity = isOverdue ? "critical" : "warning";
        const customerName =
          (receivable.customers as unknown as Record<string, unknown>)?.name ?? "Unknown Customer";

        const { data: alert, error: alertError } = await supabase
          .schema("mercadeo").from("alerts")
          .insert({
            business_id: businessId,
            type: "debt_due",
            title: isOverdue ? "Overdue Payment" : "Payment Due",
            message: `${customerName} owes $${receivable.remaining_amount} (due: ${receivable.due_date})`,
            severity,
          })
          .select()
          .single();

        if (!alertError && alert) {
          newAlerts.push(alert);
        }
      }
    }

    return { success: true, data: newAlerts };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check debt alerts",
    };
  }
}
