"use server";

import { createClient } from "@/lib/supabase/server";

interface ServerResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getEmergencyFund(
  businessId: string
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .schema("mercadeo").from("emergency_fund")
      .select("*")
      .eq("business_id", businessId)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return { success: true, data: data ?? null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get emergency fund",
    };
  }
}

export async function createEmergencyFund(
  businessId: string,
  data: {
    target_amount: number;
    monthly_contribution?: number;
    notes?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: existing } = await supabase
      .schema("mercadeo").from("emergency_fund")
      .select("id")
      .eq("business_id", businessId)
      .limit(1);

    if (existing && existing.length > 0) {
      return { success: false, error: "Emergency fund already exists. Use update instead." };
    }

    const { data: fund, error } = await supabase
      .schema("mercadeo").from("emergency_fund")
      .insert({
        business_id: businessId,
        target_amount: data.target_amount,
        current_amount: 0,
        monthly_contribution: data.monthly_contribution ?? 0,
        notes: data.notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: fund };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create emergency fund",
    };
  }
}

export async function updateEmergencyFund(
  id: string,
  data: {
    target_amount?: number;
    monthly_contribution?: number;
    notes?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: fund, error } = await supabase
      .schema("mercadeo").from("emergency_fund")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: fund };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update emergency fund",
    };
  }
}

export async function contributeToFund(
  id: string,
  amount: number
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    if (amount <= 0) {
      return { success: false, error: "Amount must be positive" };
    }

    const { data: current, error: fetchError } = await supabase
      .schema("mercadeo").from("emergency_fund")
      .select("current_amount")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const newAmount = Number(current.current_amount) + amount;

    const { data: fund, error } = await supabase
      .schema("mercadeo").from("emergency_fund")
      .update({ current_amount: newAmount })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await supabase.schema("mercadeo").from("cash_movements").insert({
      business_id: fund.business_id,
      type: "transfer",
      amount,
      description: "Emergency fund contribution",
      category: "emergency_fund",
      reference_id: id,
      reference_type: "emergency_fund",
    });

    return { success: true, data: fund };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to contribute to fund",
    };
  }
}

export async function getEmergencyFundProgress(
  businessId: string
): Promise<
  ServerResponse<{
    fund: Record<string, unknown>;
    percentage: number;
    remaining: number;
    monthlyTargetDate: string | null;
  }>
> {
  try {
    const supabase = await createClient();

    const { data: fund, error } = await supabase
      .schema("mercadeo").from("emergency_fund")
      .select("*")
      .eq("business_id", businessId)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    if (!fund) {
      return {
        success: true,
        data: {
          fund: null as unknown as Record<string, unknown>,
          percentage: 0,
          remaining: 0,
          monthlyTargetDate: null,
        },
      };
    }

    const percentage =
      Number(fund.target_amount) > 0
        ? (Number(fund.current_amount) / Number(fund.target_amount)) * 100
        : 0;

    const remaining = Math.max(
      0,
      Number(fund.target_amount) - Number(fund.current_amount)
    );

    let monthlyTargetDate: string | null = null;
    if (Number(fund.monthly_contribution) > 0 && remaining > 0) {
      const monthsNeeded = Math.ceil(
        remaining / Number(fund.monthly_contribution)
      );
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + monthsNeeded);
      monthlyTargetDate = targetDate.toISOString().split("T")[0];
    }

    return {
      success: true,
      data: {
        fund,
        percentage: Math.min(100, percentage),
        remaining,
        monthlyTargetDate,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get emergency fund progress",
    };
  }
}
