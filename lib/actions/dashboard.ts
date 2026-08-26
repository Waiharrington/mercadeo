"use server";

import { createClient } from "@/lib/supabase/server";

interface ServerResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getDashboardStats(
  businessId: string
): Promise<
  ServerResponse<{
    revenue: number;
    orders: number;
    customers: number;
    products: number;
    lowStock: number;
    pendingOrders: number;
    unreadAlerts: number;
  }>
> {
  try {
    const supabase = await createClient();

    const [
      salesResult,
      customersResult,
      productsResult,
      lowStockResult,
      pendingResult,
      alertsResult,
    ] = await Promise.all([
      supabase
        .schema("mercadeo").from("sales")
        .select("total_amount")
        .eq("business_id", businessId)
        .eq("sale_status", "completed"),
      supabase
        .schema("mercadeo").from("customers")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId),
      supabase
        .schema("mercadeo").from("products")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("is_active", true),
      supabase
        .schema("mercadeo").from("products")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("is_active", true)
        .filter("stock_quantity", "lte", "min_stock_alert"),
      supabase
        .schema("mercadeo").from("sales")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("sale_status", "pending"),
      supabase
        .schema("mercadeo").from("alerts")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("is_read", false),
    ]);

    const revenue = salesResult.data?.reduce(
      (sum, s) => sum + Number(s.total_amount),
      0
    ) ?? 0;

    return {
      success: true,
      data: {
        revenue,
        orders: salesResult.data?.length ?? 0,
        customers: customersResult.count ?? 0,
        products: productsResult.count ?? 0,
        lowStock: lowStockResult.count ?? 0,
        pendingOrders: pendingResult.count ?? 0,
        unreadAlerts: alertsResult.count ?? 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get dashboard stats",
    };
  }
}

export async function getRecentActivity(
  businessId: string
): Promise<
  ServerResponse<{
    recentSales: Array<{
      id: string;
      total_amount: number;
      payment_method: string;
      created_at: string;
      customers: { name: string } | null;
    }>;
    recentExpenses: Array<{
      id: string;
      title: string;
      amount: number;
      category: string;
      created_at: string;
    }>;
    recentAlerts: Array<{
      id: string;
      title: string;
      message: string;
      severity: string;
      created_at: string;
    }>;
  }>
> {
  try {
    const supabase = await createClient();

    const [salesResult, expensesResult, alertsResult] = await Promise.all([
      supabase
        .schema("mercadeo").from("sales")
        .select("id, total_amount, payment_method, created_at, customers(name)")
        .eq("business_id", businessId)
        .eq("sale_status", "completed")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .schema("mercadeo").from("expenses")
        .select("id, title, amount, category, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .schema("mercadeo").from("alerts")
        .select("id, title, message, severity, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return {
      success: true,
      data: {
        recentSales: (salesResult.data ?? []) as unknown as Array<{
          id: string;
          total_amount: number;
          payment_method: string;
          created_at: string;
          customers: { name: string } | null;
        }>,
        recentExpenses: expensesResult.data ?? [],
        recentAlerts: alertsResult.data ?? [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get recent activity",
    };
  }
}

export async function getRevenueChart(
  businessId: string,
  period: "daily" | "weekly" | "monthly" = "monthly"
): Promise<
  ServerResponse<Array<{ label: string; revenue: number; expenses: number }>>
> {
  try {
    const supabase = await createClient();

    const now = new Date();
    let startDate: Date;
    let groupByFn: (date: Date) => string;

    switch (period) {
      case "daily":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        groupByFn = (d) => d.toISOString().split("T")[0];
        break;
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 90);
        groupByFn = (d) => {
          const weekStart = new Date(d);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          return weekStart.toISOString().split("T")[0];
        };
        break;
      case "monthly":
      default:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 12);
        groupByFn = (d) => d.toISOString().substring(0, 7);
        break;
    }

    const [salesResult, expensesResult] = await Promise.all([
      supabase
        .schema("mercadeo").from("sales")
        .select("total_amount, created_at")
        .eq("business_id", businessId)
        .eq("sale_status", "completed")
        .gte("created_at", startDate.toISOString()),
      supabase
        .schema("mercadeo").from("expenses")
        .select("amount, expense_date")
        .eq("business_id", businessId)
        .gte("expense_date", startDate.toISOString().split("T")[0]),
    ]);

    const revenueByPeriod: Record<string, number> = {};
    for (const sale of salesResult.data ?? []) {
      const key = groupByFn(new Date(sale.created_at));
      revenueByPeriod[key] = (revenueByPeriod[key] ?? 0) + Number(sale.total_amount);
    }

    const expensesByPeriod: Record<string, number> = {};
    for (const expense of expensesResult.data ?? []) {
      const key = expense.expense_date.substring(0, period === "monthly" ? 7 : 10);
      expensesByPeriod[key] = (expensesByPeriod[key] ?? 0) + Number(expense.amount);
    }

    const allKeys = [
      ...new Set([...Object.keys(revenueByPeriod), ...Object.keys(expensesByPeriod)]),
    ].sort();

    const result = allKeys.map((key) => ({
      label: key,
      revenue: revenueByPeriod[key] ?? 0,
      expenses: expensesByPeriod[key] ?? 0,
    }));

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get revenue chart",
    };
  }
}
