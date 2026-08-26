"use server";

import { createClient } from "@/lib/supabase/server";

interface ServerResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getMarketingStats(
  businessId: string
): Promise<
  ServerResponse<{
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    totalSales: number;
    averageOrderValue: number;
    topCategory: string;
    repeatCustomerRate: number;
  }>
> {
  try {
    const supabase = await createClient();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      customersResult,
      activeResult,
      salesResult,
      productsResult,
      repeatResult,
    ] = await Promise.all([
      supabase
        .schema("mercadeo").from("customers")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId),
      supabase
        .schema("mercadeo").from("customers")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .gte("last_purchase_at", thirtyDaysAgo.toISOString()),
      supabase
        .schema("mercadeo").from("sales")
        .select("total_amount")
        .eq("business_id", businessId)
        .eq("sale_status", "completed"),
      supabase
        .schema("mercadeo").from("products")
        .select("category")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .not("category", "is", null),
      supabase
        .schema("mercadeo").from("customers")
        .select("purchase_count")
        .eq("business_id", businessId)
        .gt("purchase_count", 1),
    ]);

    const totalCustomers = customersResult.count ?? 0;
    const activeCustomers = activeResult.count ?? 0;
    const inactiveCustomers = totalCustomers - activeCustomers;

    const totalSales = salesResult.data?.reduce(
      (sum, s) => sum + Number(s.total_amount),
      0
    ) ?? 0;
    const salesCount = salesResult.data?.length ?? 0;

    const categoryCount: Record<string, number> = {};
    for (const p of productsResult.data ?? []) {
      if (p.category) {
        categoryCount[p.category] = (categoryCount[p.category] ?? 0) + 1;
      }
    }
    const topCategory =
      Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "";

    const repeatCustomers = repeatResult.data?.length ?? 0;
    const repeatCustomerRate =
      totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    return {
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
        totalSales,
        averageOrderValue: salesCount > 0 ? totalSales / salesCount : 0,
        topCategory,
        repeatCustomerRate,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get marketing stats",
    };
  }
}

export async function getCampaigns(
  businessId: string
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .schema("mercadeo").from("ai_insights")
      .select("*")
      .eq("business_id", businessId)
      .eq("type", "marketing_copy")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get campaigns",
    };
  }
}

export async function createCampaign(
  businessId: string,
  data: {
    content: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: campaign, error } = await supabase
      .schema("mercadeo").from("ai_insights")
      .insert({
        business_id: businessId,
        type: "marketing_copy",
        content: data.content,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: campaign };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create campaign",
    };
  }
}

export async function getCustomerSegments(
  businessId: string
): Promise<
  ServerResponse<{
    highValue: Array<{ id: string; name: string; total_purchases: number }>;
    mediumValue: Array<{ id: string; name: string; total_purchases: number }>;
    lowValue: Array<{ id: string; name: string; total_purchases: number }>;
    atRisk: Array<{ id: string; name: string; last_purchase_at: string | null }>;
    newCustomers: Array<{ id: string; name: string; created_at: string }>;
  }>
> {
  try {
    const supabase = await createClient();

    const { data: customers, error } = await supabase
      .schema("mercadeo").from("customers")
      .select("id, name, total_purchases, purchase_count, last_purchase_at, created_at")
      .eq("business_id", businessId)
      .eq("is_active", true);

    if (error) throw error;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const sorted = [...(customers ?? [])].sort(
      (a, b) => Number(b.total_purchases) - Number(a.total_purchases)
    );

    const highThreshold =
      sorted.length > 0 ? Number(sorted[0].total_purchases) * 0.6 : 1000;
    const mediumThreshold =
      sorted.length > 0 ? Number(sorted[0].total_purchases) * 0.25 : 500;

    const highValue = sorted
      .filter((c) => Number(c.total_purchases) >= highThreshold)
      .map(({ id, name, total_purchases }) => ({
        id,
        name,
        total_purchases: Number(total_purchases),
      }));

    const mediumValue = sorted
      .filter(
        (c) =>
          Number(c.total_purchases) >= mediumThreshold &&
          Number(c.total_purchases) < highThreshold
      )
      .map(({ id, name, total_purchases }) => ({
        id,
        name,
        total_purchases: Number(total_purchases),
      }));

    const lowValue = sorted
      .filter((c) => Number(c.total_purchases) < mediumThreshold)
      .map(({ id, name, total_purchases }) => ({
        id,
        name,
        total_purchases: Number(total_purchases),
      }));

    const atRisk = (customers ?? [])
      .filter((c) => {
        if (!c.last_purchase_at) return true;
        const lastPurchase = new Date(c.last_purchase_at);
        return lastPurchase < sixtyDaysAgo;
      })
      .map(({ id, name, last_purchase_at }) => ({
        id,
        name,
        last_purchase_at,
      }));

    const newCustomers = (customers ?? [])
      .filter((c) => new Date(c.created_at) >= thirtyDaysAgo)
      .map(({ id, name, created_at }) => ({ id, name, created_at }));

    return {
      success: true,
      data: {
        highValue,
        mediumValue,
        lowValue,
        atRisk,
        newCustomers,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get customer segments",
    };
  }
}

export async function getInactiveCustomersForReactivation(
  businessId: string
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .schema("mercadeo").from("customers")
      .select("id, name, phone, email, last_purchase_at, total_purchases")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .or(
        `last_purchase_at.is.null,last_purchase_at.lt.${thirtyDaysAgo.toISOString()}`
      )
      .order("total_purchases", { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Failed to get inactive customers for reactivation",
    };
  }
}

export async function getSalesProjections(
  businessId: string,
  period: "weekly" | "monthly" | "quarterly" | "yearly"
): Promise<
  ServerResponse<{
    historical: Array<{ period: string; revenue: number }>;
    projected: Array<{ period: string; projected: number }>;
    growthRate: number;
  }>
> {
  try {
    const supabase = await createClient();

    const now = new Date();
    let historyMonths: number;

    switch (period) {
      case "weekly":
        historyMonths = 3;
        break;
      case "monthly":
        historyMonths = 6;
        break;
      case "quarterly":
        historyMonths = 12;
        break;
      case "yearly":
        historyMonths = 24;
        break;
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - historyMonths);
    const startDateStr = startDate.toISOString();

    const { data: sales, error } = await supabase
      .schema("mercadeo").from("sales")
      .select("total_amount, created_at")
      .eq("business_id", businessId)
      .eq("sale_status", "completed")
      .gte("created_at", startDateStr);

    if (error) throw error;

    const monthlyData: Record<string, number> = {};
    for (const sale of sales ?? []) {
      const monthKey = sale.created_at.substring(0, 7);
      monthlyData[monthKey] = (monthlyData[monthKey] ?? 0) + Number(sale.total_amount);
    }

    const historical = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, revenue]) => ({ period, revenue }));

    const growthRates: number[] = [];
    for (let i = 1; i < historical.length; i++) {
      if (historical[i - 1].revenue > 0) {
        growthRates.push(
          (historical[i].revenue - historical[i - 1].revenue) /
            historical[i - 1].revenue
        );
      }
    }

    const avgGrowthRate =
      growthRates.length > 0
        ? growthRates.reduce((sum, r) => sum + r, 0) / growthRates.length
        : 0;

    const lastRevenue =
      historical.length > 0 ? historical[historical.length - 1].revenue : 0;

    const projected: Array<{ period: string; projected: number }> = [];
    const projectionCount = period === "yearly" ? 4 : period === "quarterly" ? 3 : 6;

    for (let i = 1; i <= projectionCount; i++) {
      const projectedDate = new Date(now);
      projectedDate.setMonth(projectedDate.getMonth() + i);
      const periodKey = projectedDate.toISOString().substring(0, 7);
      projected.push({
        period: periodKey,
        projected: lastRevenue * Math.pow(1 + avgGrowthRate, i),
      });
    }

    return {
      success: true,
      data: {
        historical,
        projected,
        growthRate: avgGrowthRate * 100,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get sales projections",
    };
  }
}
