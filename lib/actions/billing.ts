"use server";

import { createClient } from "@/lib/supabase/server";

interface ServerResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getInvoices(
  businessId: string
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .schema("mercadeo").from("sales")
      .select("*, customers(name, phone, email), sale_items(*, products(name))")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get invoices",
    };
  }
}

export async function getInvoice(
  id: string
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: sale, error: saleError } = await supabase
      .schema("mercadeo").from("sales")
      .select("*, customers(*), sale_items(*, products(name, description, images), product_variants(variant_name, variant_value))")
      .eq("id", id)
      .single();

    if (saleError) throw saleError;

    const { data: profile, error: profileError } = await supabase
      .schema("mercadeo").from("profiles")
      .select("business_name, phone_whatsapp, logo_url, category_niche")
      .eq("id", sale.business_id)
      .single();

    if (profileError) throw profileError;

    return { success: true, data: { ...sale, business: profile } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get invoice",
    };
  }
}

export async function createInvoice(
  businessId: string,
  data: {
    sale_id: string;
    notes?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: sale, error: saleError } = await supabase
      .schema("mercadeo").from("sales")
      .select("*, customers(name, phone, email)")
      .eq("id", data.sale_id)
      .eq("business_id", businessId)
      .single();

    if (saleError) throw saleError;

    const invoiceNumber = await generateInvoiceNumber(businessId);

    return {
      success: true,
      data: {
        invoice_number: invoiceNumber,
        sale,
        notes: data.notes,
        issued_at: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create invoice",
    };
  }
}

export async function generateInvoiceNumber(
  businessId: string
): Promise<string> {
  const supabase = await createClient();

  const { data } = await supabase
    .schema("mercadeo").from("sales")
    .select("id")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1);

  const count = (data?.length ?? 0) + 1;
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");

  return `INV-${year}${month}-${String(count).padStart(4, "0")}`;
}

export async function markAsDelivered(
  id: string
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .schema("mercadeo").from("sales")
      .update({ sale_status: "completed" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark as delivered",
    };
  }
}
