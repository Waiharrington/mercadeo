"use server";

import { createClient } from "@/lib/supabase/server";

interface ServerResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

interface SaleFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  payment_method?: string;
  customer_id?: string;
  limit?: number;
  offset?: number;
}

interface SaleItemInput {
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  cost_price?: number;
  discount?: number;
}

export async function getSales(
  businessId: string,
  filters?: SaleFilters
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .schema("mercadeo").from("sales")
      .select("*, customers(name, phone), sale_items(*, products(name, images))")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate);
    }
    if (filters?.status) {
      query = query.eq("sale_status", filters.status);
    }
    if (filters?.payment_method) {
      query = query.eq("payment_method", filters.payment_method);
    }
    if (filters?.customer_id) {
      query = query.eq("customer_id", filters.customer_id);
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
      error: error instanceof Error ? error.message : "Failed to get sales",
    };
  }
}

export async function getSale(
  id: string
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .schema("mercadeo").from("sales")
      .select("*, customers(*), sale_items(*, products(name, images), product_variants(variant_name, variant_value))")
      .eq("id", id)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get sale",
    };
  }
}

export async function createSale(
  businessId: string,
  data: {
    customer_id?: string;
    total_amount: number;
    discount_amount?: number;
    tax_amount?: number;
    igtf_amount?: number;
    payment_method: string;
    payment_currency?: string;
    exchange_rate?: number;
    sale_type?: string;
    notes?: string;
    items: SaleItemInput[];
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: sale, error: saleError } = await supabase
      .schema("mercadeo").from("sales")
      .insert({
        business_id: businessId,
        customer_id: data.customer_id ?? null,
        total_amount: data.total_amount,
        discount_amount: data.discount_amount ?? 0,
        tax_amount: data.tax_amount ?? 0,
        igtf_amount: data.igtf_amount ?? 0,
        payment_method: data.payment_method,
        payment_currency: data.payment_currency ?? "USD",
        exchange_rate: data.exchange_rate ?? 1,
        sale_type: data.sale_type ?? "POS",
        sale_status: "completed",
        notes: data.notes ?? null,
      })
      .select()
      .single();

    if (saleError) throw saleError;

    const saleItems = data.items.map((item) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      cost_price: item.cost_price ?? 0,
      discount: item.discount ?? 0,
    }));

    const { error: itemsError } = await supabase
      .schema("mercadeo").from("sale_items")
      .insert(saleItems);

    if (itemsError) throw itemsError;

    for (const item of data.items) {
      const { data: product } = await supabase
        .schema("mercadeo").from("products")
        .select("stock_quantity")
        .eq("id", item.product_id)
        .single();

      if (product) {
        await supabase
          .schema("mercadeo").from("products")
          .update({ stock_quantity: product.stock_quantity - item.quantity })
          .eq("id", item.product_id);
      }

      if (item.variant_id) {
        const { data: variant } = await supabase
          .schema("mercadeo").from("product_variants")
          .select("stock_quantity")
          .eq("id", item.variant_id)
          .single();

        if (variant) {
          await supabase
            .schema("mercadeo").from("product_variants")
            .update({ stock_quantity: variant.stock_quantity - item.quantity })
            .eq("id", item.variant_id);
        }
      }
    }

    if (data.customer_id) {
      const { data: customer } = await supabase
        .schema("mercadeo").from("customers")
        .select("total_purchases, purchase_count")
        .eq("id", data.customer_id)
        .single();

      if (customer) {
        await supabase
          .schema("mercadeo").from("customers")
          .update({
            total_purchases: Number(customer.total_purchases) + data.total_amount,
            purchase_count: customer.purchase_count + 1,
            last_purchase_at: new Date().toISOString(),
          })
          .eq("id", data.customer_id);
      }

      if (data.payment_method === "debt") {
        const { data: cust } = await supabase
          .schema("mercadeo").from("customers")
          .select("debt_balance")
          .eq("id", data.customer_id)
          .single();

        if (cust) {
          await supabase
            .schema("mercadeo").from("customers")
            .update({ debt_balance: Number(cust.debt_balance) + data.total_amount })
            .eq("id", data.customer_id);
        }
      }
    }

    await supabase.schema("mercadeo").from("cash_movements").insert({
      business_id: businessId,
      type: "income",
      amount: data.total_amount,
      currency: data.payment_currency ?? "USD",
      exchange_rate: data.exchange_rate ?? 1,
      description: `Sale ${sale.id}`,
      category: "sales",
      reference_id: sale.id,
      reference_type: "sale",
    });

    const { data: fullSale } = await supabase
      .schema("mercadeo").from("sales")
      .select("*, sale_items(*)")
      .eq("id", sale.id)
      .single();

    return { success: true, data: fullSale };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create sale",
    };
  }
}

export async function updateSaleStatus(
  id: string,
  status: string
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const validStatuses = ["pending", "completed", "cancelled", "refunded"];
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Invalid sale status" };
    }

    const { data: sale, error } = await supabase
      .schema("mercadeo").from("sales")
      .update({ sale_status: status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: sale };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update sale status",
    };
  }
}

export async function cancelSale(
  id: string
): Promise<ServerResponse> {
  try {
    const supabase = await createClient();

    const { data: sale, error: saleError } = await supabase
      .schema("mercadeo").from("sales")
      .select("*, sale_items(product_id, variant_id, quantity)")
      .eq("id", id)
      .single();

    if (saleError) throw saleError;

    if (sale.sale_status === "cancelled") {
      return { success: false, error: "Sale is already cancelled" };
    }

    const { error } = await supabase
      .schema("mercadeo").from("sales")
      .update({ sale_status: "cancelled" })
      .eq("id", id);

    if (error) throw error;

    for (const item of sale.sale_items) {
      const { data: product } = await supabase
        .schema("mercadeo").from("products")
        .select("stock_quantity")
        .eq("id", item.product_id)
        .single();

      if (product) {
        await supabase
          .schema("mercadeo").from("products")
          .update({ stock_quantity: product.stock_quantity + item.quantity })
          .eq("id", item.product_id);
      }

      if (item.variant_id) {
        const { data: variant } = await supabase
          .schema("mercadeo").from("product_variants")
          .select("stock_quantity")
          .eq("id", item.variant_id)
          .single();

        if (variant) {
          await supabase
            .schema("mercadeo").from("product_variants")
            .update({ stock_quantity: variant.stock_quantity + item.quantity })
            .eq("id", item.variant_id);
        }
      }
    }

    if (sale.customer_id && sale.payment_method === "debt") {
      const { data: customer } = await supabase
        .schema("mercadeo").from("customers")
        .select("debt_balance")
        .eq("id", sale.customer_id)
        .single();

      if (customer) {
        const newBalance = Math.max(0, Number(customer.debt_balance) - Number(sale.total_amount));
        await supabase
          .schema("mercadeo").from("customers")
          .update({ debt_balance: newBalance })
          .eq("id", sale.customer_id);
      }
    }

    await supabase.schema("mercadeo").from("cash_movements").insert({
      business_id: sale.business_id,
      type: "adjustment",
      amount: -Number(sale.total_amount),
      description: `Cancelled sale ${id}`,
      category: "sales",
      reference_id: id,
      reference_type: "sale",
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel sale",
    };
  }
}

export async function getDailySales(
  businessId: string,
  date: string
): Promise<
  ServerResponse<{
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    salesCount: number;
    byPaymentMethod: Record<string, number>;
  }>
> {
  try {
    const supabase = await createClient();

    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data, error } = await supabase
      .schema("mercadeo").from("sales")
      .select("total_amount, payment_method")
      .eq("business_id", businessId)
      .eq("sale_status", "completed")
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay);

    if (error) throw error;

    const totalRevenue = data.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const byPaymentMethod: Record<string, number> = {};

    for (const sale of data) {
      byPaymentMethod[sale.payment_method] =
        (byPaymentMethod[sale.payment_method] ?? 0) + Number(sale.total_amount);
    }

    return {
      success: true,
      data: {
        totalSales: data.length,
        totalRevenue,
        averageOrderValue: data.length > 0 ? totalRevenue / data.length : 0,
        salesCount: data.length,
        byPaymentMethod,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get daily sales",
    };
  }
}

export async function getMonthlySales(
  businessId: string,
  month: number,
  year: number
): Promise<
  ServerResponse<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    salesCount: number;
    dailyBreakdown: Array<{ date: string; revenue: number; count: number }>;
  }>
> {
  try {
    const supabase = await createClient();

    const startDate = `${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`;

    const [salesResult, expensesResult] = await Promise.all([
      supabase
        .schema("mercadeo").from("sales")
        .select("total_amount, created_at")
        .eq("business_id", businessId)
        .eq("sale_status", "completed")
        .gte("created_at", startDate)
        .lte("created_at", endDate),
      supabase
        .schema("mercadeo").from("expenses")
        .select("amount, expense_date")
        .eq("business_id", businessId)
        .gte("expense_date", `${year}-${String(month).padStart(2, "0")}-01`)
        .lte("expense_date", `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`),
    ]);

    if (salesResult.error) throw salesResult.error;
    if (expensesResult.error) throw expensesResult.error;

    const totalRevenue = salesResult.data.reduce(
      (sum, s) => sum + Number(s.total_amount),
      0
    );
    const totalExpenses = expensesResult.data.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );

    const dailyMap: Record<string, { revenue: number; count: number }> = {};
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      dailyMap[dateStr] = { revenue: 0, count: 0 };
    }

    for (const sale of salesResult.data) {
      const dateStr = sale.created_at.split("T")[0];
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].revenue += Number(sale.total_amount);
        dailyMap[dateStr].count += 1;
      }
    }

    const dailyBreakdown = Object.entries(dailyMap).map(([date, val]) => ({
      date,
      ...val,
    }));

    return {
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        salesCount: salesResult.data.length,
        dailyBreakdown,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get monthly sales",
    };
  }
}

export async function getSalesByPaymentMethod(
  businessId: string,
  period: { startDate: string; endDate: string }
): Promise<ServerResponse<Record<string, { count: number; total: number }>>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .schema("mercadeo").from("sales")
      .select("payment_method, total_amount")
      .eq("business_id", businessId)
      .eq("sale_status", "completed")
      .gte("created_at", period.startDate)
      .lte("created_at", period.endDate);

    if (error) throw error;

    const breakdown: Record<string, { count: number; total: number }> = {};

    for (const sale of data) {
      if (!breakdown[sale.payment_method]) {
        breakdown[sale.payment_method] = { count: 0, total: 0 };
      }
      breakdown[sale.payment_method].count += 1;
      breakdown[sale.payment_method].total += Number(sale.total_amount);
    }

    return { success: true, data: breakdown };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get sales by payment method",
    };
  }
}
