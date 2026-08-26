"use server";

import { createClient } from "@/lib/supabase/server";

interface ServerResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  accountsReceivable: number;
  accountsPayable: number;
}

interface CashFlowSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  movements: Array<{
    id: string;
    type: string;
    amount: number;
    description: string | null;
    category: string | null;
    created_at: string;
  }>;
}

export async function getFinancialSummary(
  businessId: string
): Promise<ServerResponse<FinancialSummary>> {
  try {
    const supabase = await createClient();

    const [incomeResult, expensesResult, receivableResult, payableResult] =
      await Promise.all([
        supabase
          .schema("mercadeo").from("sales")
          .select("total_amount")
          .eq("business_id", businessId)
          .eq("sale_status", "completed"),
        supabase
          .schema("mercadeo").from("expenses")
          .select("amount")
          .eq("business_id", businessId),
        supabase
          .schema("mercadeo").from("accounts_receivable")
          .select("remaining_amount")
          .eq("business_id", businessId)
          .in("status", ["pending", "partial", "overdue"]),
        supabase
          .schema("mercadeo").from("accounts_payable")
          .select("remaining_amount")
          .eq("business_id", businessId)
          .in("status", ["pending", "partial", "overdue"]),
      ]);

    if (incomeResult.error) throw incomeResult.error;
    if (expensesResult.error) throw expensesResult.error;
    if (receivableResult.error) throw receivableResult.error;
    if (payableResult.error) throw payableResult.error;

    const totalIncome = incomeResult.data.reduce(
      (sum, s) => sum + Number(s.total_amount),
      0
    );
    const totalExpenses = expensesResult.data.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );
    const accountsReceivable = receivableResult.data.reduce(
      (sum, r) => sum + Number(r.remaining_amount),
      0
    );
    const accountsPayable = payableResult.data.reduce(
      (sum, p) => sum + Number(p.remaining_amount),
      0
    );

    return {
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        accountsReceivable,
        accountsPayable,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get financial summary",
    };
  }
}

export async function getIncome(
  businessId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .schema("mercadeo").from("sales")
      .select("*, customers(name, phone)")
      .eq("business_id", businessId)
      .eq("sale_status", "completed")
      .order("created_at", { ascending: false });

    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate);
    }
    if (filters?.limit) {
      query = query.range(
        filters.offset ?? 0,
        (filters.offset ?? 0) + filters.limit - 1
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get income",
    };
  }
}

export async function getExpenses(
  businessId: string,
  filters?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .schema("mercadeo").from("expenses")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.startDate) {
      query = query.gte("expense_date", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("expense_date", filters.endDate);
    }
    if (filters?.limit) {
      query = query.range(
        filters.offset ?? 0,
        (filters.offset ?? 0) + filters.limit - 1
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get expenses",
    };
  }
}

export async function createExpense(
  businessId: string,
  data: {
    title: string;
    description?: string;
    category: string;
    amount: number;
    currency?: string;
    exchange_rate?: number;
    is_recurring?: boolean;
    recurring_frequency?: string;
    expense_date?: string;
    receipt_url?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: expense, error } = await supabase
      .schema("mercadeo").from("expenses")
      .insert({
        business_id: businessId,
        title: data.title,
        description: data.description ?? null,
        category: data.category,
        amount: data.amount,
        currency: data.currency ?? "USD",
        exchange_rate: data.exchange_rate ?? 1,
        is_recurring: data.is_recurring ?? false,
        recurring_frequency: data.recurring_frequency ?? null,
        expense_date: data.expense_date ?? new Date().toISOString().split("T")[0],
        receipt_url: data.receipt_url ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.schema("mercadeo").from("cash_movements").insert({
      business_id: businessId,
      type: "expense",
      amount: data.amount,
      currency: data.currency ?? "USD",
      exchange_rate: data.exchange_rate ?? 1,
      description: data.title,
      category: data.category,
      reference_id: expense.id,
      reference_type: "expense",
    });

    return { success: true, data: expense };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create expense",
    };
  }
}

export async function updateExpense(
  id: string,
  data: {
    title?: string;
    description?: string;
    category?: string;
    amount?: number;
    is_recurring?: boolean;
    recurring_frequency?: string;
    expense_date?: string;
    receipt_url?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: expense, error } = await supabase
      .schema("mercadeo").from("expenses")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: expense };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update expense",
    };
  }
}

export async function deleteExpense(id: string): Promise<ServerResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.schema("mercadeo").from("expenses").delete().eq("id", id);
    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete expense",
    };
  }
}

export async function getAccountsReceivable(
  businessId: string,
  filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .schema("mercadeo").from("accounts_receivable")
      .select("*, customers(name, phone)")
      .eq("business_id", businessId)
      .order("due_date", { ascending: true });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.limit) {
      query = query.range(
        filters.offset ?? 0,
        (filters.offset ?? 0) + filters.limit - 1
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get accounts receivable",
    };
  }
}

export async function createAccountsReceivable(
  businessId: string,
  data: {
    customer_id: string;
    sale_id?: string;
    total_amount: number;
    due_date: string;
    notes?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: receivable, error } = await supabase
      .schema("mercadeo").from("accounts_receivable")
      .insert({
        business_id: businessId,
        customer_id: data.customer_id,
        sale_id: data.sale_id ?? null,
        total_amount: data.total_amount,
        paid_amount: 0,
        remaining_amount: data.total_amount,
        due_date: data.due_date,
        status: "pending",
        notes: data.notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: receivable };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create accounts receivable",
    };
  }
}

export async function updateAccountsReceivable(
  id: string,
  data: {
    paid_amount?: number;
    status?: string;
    notes?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = { ...data };

    if (data.paid_amount !== undefined) {
      const { data: current } = await supabase
        .schema("mercadeo").from("accounts_receivable")
        .select("total_amount")
        .eq("id", id)
        .single();

      if (current) {
        updateData.remaining_amount = Number(current.total_amount) - data.paid_amount;
        if (data.paid_amount <= 0) {
          updateData.status = "pending";
        } else if ((updateData.remaining_amount as number) <= 0) {
          updateData.status = "paid";
          updateData.paid_amount = Number(current.total_amount);
          updateData.remaining_amount = 0;
        } else {
          updateData.status = "partial";
        }
      }
    }

    const { data: receivable, error } = await supabase
      .schema("mercadeo").from("accounts_receivable")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: receivable };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update accounts receivable",
    };
  }
}

export async function getAccountsPayable(
  businessId: string,
  filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .schema("mercadeo").from("accounts_payable")
      .select("*")
      .eq("business_id", businessId)
      .order("due_date", { ascending: true });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.limit) {
      query = query.range(
        filters.offset ?? 0,
        (filters.offset ?? 0) + filters.limit - 1
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get accounts payable",
    };
  }
}

export async function createAccountsPayable(
  businessId: string,
  data: {
    supplier_name: string;
    description?: string;
    total_amount: number;
    due_date: string;
    notes?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: payable, error } = await supabase
      .schema("mercadeo").from("accounts_payable")
      .insert({
        business_id: businessId,
        supplier_name: data.supplier_name,
        description: data.description ?? null,
        total_amount: data.total_amount,
        paid_amount: 0,
        remaining_amount: data.total_amount,
        due_date: data.due_date,
        status: "pending",
        notes: data.notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: payable };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create accounts payable",
    };
  }
}

export async function updateAccountsPayable(
  id: string,
  data: {
    paid_amount?: number;
    status?: string;
    notes?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = { ...data };

    if (data.paid_amount !== undefined) {
      const { data: current } = await supabase
        .schema("mercadeo").from("accounts_payable")
        .select("total_amount")
        .eq("id", id)
        .single();

      if (current) {
        updateData.remaining_amount = Number(current.total_amount) - data.paid_amount;
        if (data.paid_amount <= 0) {
          updateData.status = "pending";
        } else if ((updateData.remaining_amount as number) <= 0) {
          updateData.status = "paid";
          updateData.paid_amount = Number(current.total_amount);
          updateData.remaining_amount = 0;
        } else {
          updateData.status = "partial";
        }
      }
    }

    const { data: payable, error } = await supabase
      .schema("mercadeo").from("accounts_payable")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: payable };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update accounts payable",
    };
  }
}

export async function getCashFlow(
  businessId: string,
  period: { startDate: string; endDate: string }
): Promise<ServerResponse<CashFlowSummary>> {
  try {
    const supabase = await createClient();

    const { data: movements, error } = await supabase
      .schema("mercadeo").from("cash_movements")
      .select("*")
      .eq("business_id", businessId)
      .gte("created_at", period.startDate)
      .lte("created_at", period.endDate)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const totalIncome = movements
      .filter((m) => m.type === "income")
      .reduce((sum, m) => sum + Number(m.amount), 0);

    const totalExpenses = movements
      .filter((m) => m.type === "expense")
      .reduce((sum, m) => sum + Number(m.amount), 0);

    return {
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netCashFlow: totalIncome - totalExpenses,
        movements,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get cash flow",
    };
  }
}

export async function recordCashMovement(
  businessId: string,
  data: {
    type: "income" | "expense" | "transfer" | "adjustment";
    amount: number;
    currency?: string;
    exchange_rate?: number;
    description?: string;
    category?: string;
    reference_id?: string;
    reference_type?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: movement, error } = await supabase
      .schema("mercadeo").from("cash_movements")
      .insert({
        business_id: businessId,
        type: data.type,
        amount: data.amount,
        currency: data.currency ?? "USD",
        exchange_rate: data.exchange_rate ?? 1,
        description: data.description ?? null,
        category: data.category ?? null,
        reference_id: data.reference_id ?? null,
        reference_type: data.reference_type ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: movement };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record cash movement",
    };
  }
}
