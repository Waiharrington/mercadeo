"use server";

import { createClient } from "@/lib/supabase/server";

interface ServerResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CustomerFilters {
  search?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export async function getCustomers(
  businessId: string,
  filters?: CustomerFilters
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .schema("mercadeo").from("customers")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }
    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
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
      error: error instanceof Error ? error.message : "Failed to get customers",
    };
  }
}

export async function getCustomer(
  id: string
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: customer, error: customerError } = await supabase
      .schema("mercadeo").from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (customerError) throw customerError;

    const { data: sales, error: salesError } = await supabase
      .schema("mercadeo").from("sales")
      .select("*, sale_items(*, products(name))")
      .eq("customer_id", id)
      .order("created_at", { ascending: false });

    if (salesError) throw salesError;

    return { success: true, data: { ...customer, sales } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get customer",
    };
  }
}

export async function createCustomer(
  businessId: string,
  data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    id_number?: string;
    notes?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: customer, error } = await supabase
      .schema("mercadeo").from("customers")
      .insert({
        business_id: businessId,
        name: data.name,
        email: data.email ?? null,
        phone: data.phone ?? null,
        address: data.address ?? null,
        id_number: data.id_number ?? null,
        notes: data.notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: customer };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create customer",
    };
  }
}

export async function updateCustomer(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    id_number?: string;
    notes?: string;
    is_active?: boolean;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: customer, error } = await supabase
      .schema("mercadeo").from("customers")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: customer };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update customer",
    };
  }
}

export async function deleteCustomer(id: string): Promise<ServerResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.schema("mercadeo").from("customers").delete().eq("id", id);
    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete customer",
    };
  }
}

export async function getCustomerDebtors(
  businessId: string
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .schema("mercadeo").from("customers")
      .select("*")
      .eq("business_id", businessId)
      .gt("debt_balance", 0)
      .order("debt_balance", { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get customer debtors",
    };
  }
}

export async function recordCustomerPurchase(
  businessId: string,
  customerId: string,
  saleId: string,
  amount: number
): Promise<ServerResponse> {
  try {
    const supabase = await createClient();

    const { data: customer, error: fetchError } = await supabase
      .schema("mercadeo").from("customers")
      .select("total_purchases, purchase_count")
      .eq("id", customerId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .schema("mercadeo").from("customers")
      .update({
        total_purchases: Number(customer.total_purchases) + amount,
        purchase_count: customer.purchase_count + 1,
        last_purchase_at: new Date().toISOString(),
      })
      .eq("id", customerId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record customer purchase",
    };
  }
}

export async function getInactiveCustomers(
  businessId: string,
  days: number = 30
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .schema("mercadeo").from("customers")
      .select("*")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .or(
        `last_purchase_at.is.null,last_purchase_at.lt.${cutoffDate.toISOString()}`
      )
      .order("last_purchase_at", { ascending: true, nullsFirst: true });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get inactive customers",
    };
  }
}
