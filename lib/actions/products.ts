"use server";

import { createClient } from "@/lib/supabase/server";

interface ServerResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ProductFilters {
  search?: string;
  category?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export async function getProducts(
  businessId: string,
  filters?: ProductFilters
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .schema("mercadeo").from("products")
      .select("*, product_variants(*)")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
    }
    if (filters?.category) {
      query = query.eq("category", filters.category);
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
      error: error instanceof Error ? error.message : "Failed to get products",
    };
  }
}

export async function getProduct(
  id: string
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .schema("mercadeo").from("products")
      .select("*, product_variants(*)")
      .eq("id", id)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get product",
    };
  }
}

export async function createProduct(
  businessId: string,
  data: {
    name: string;
    description?: string;
    category?: string;
    sku?: string;
    cost_price: number;
    selling_price: number;
    wholesale_price?: number;
    stock_quantity?: number;
    min_stock_alert?: number;
    images?: string[];
    is_active?: boolean;
    tags?: string[];
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .schema("mercadeo").from("products")
      .insert({
        business_id: businessId,
        name: data.name,
        description: data.description ?? null,
        category: data.category ?? null,
        sku: data.sku ?? null,
        cost_price: data.cost_price,
        selling_price: data.selling_price,
        wholesale_price: data.wholesale_price ?? null,
        stock_quantity: data.stock_quantity ?? 0,
        min_stock_alert: data.min_stock_alert ?? 5,
        images: data.images ?? [],
        is_active: data.is_active ?? true,
        tags: data.tags ?? [],
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: product };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create product",
    };
  }
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    sku?: string;
    cost_price?: number;
    selling_price?: number;
    wholesale_price?: number;
    stock_quantity?: number;
    min_stock_alert?: number;
    images?: string[];
    is_active?: boolean;
    tags?: string[];
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .schema("mercadeo").from("products")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: product };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update product",
    };
  }
}

export async function deleteProduct(id: string): Promise<ServerResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.schema("mercadeo").from("products").delete().eq("id", id);
    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete product",
    };
  }
}

export async function getLowStockProducts(
  businessId: string
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .schema("mercadeo").from("products")
      .select("*, product_variants(*)")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .filter("stock_quantity", "lte", "min_stock_alert")
      .order("stock_quantity", { ascending: true });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get low stock products",
    };
  }
}

export async function getTopProducts(
  businessId: string,
  limit: number = 10
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();

    const { data: saleItems, error: itemsError } = await supabase
      .schema("mercadeo").from("sale_items")
      .select("product_id, quantity, unit_price")
      .in(
        "sale_id",
        (
          await supabase
            .schema("mercadeo").from("sales")
            .select("id")
            .eq("business_id", businessId)
            .eq("sale_status", "completed")
        ).data?.map((s) => s.id) ?? []
      );

    if (itemsError) throw itemsError;

    const productSales: Record<string, { totalQuantity: number; totalRevenue: number }> = {};
    for (const item of saleItems ?? []) {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = { totalQuantity: 0, totalRevenue: 0 };
      }
      productSales[item.product_id].totalQuantity += item.quantity;
      productSales[item.product_id].totalRevenue += Number(item.unit_price) * item.quantity;
    }

    const sortedProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit)
      .map(([productId, stats]) => ({ productId, ...stats }));

    const productIds = sortedProducts.map((p) => p.productId);

    if (productIds.length === 0) {
      return { success: true, data: [] };
    }

    const { data: products, error: productsError } = await supabase
      .schema("mercadeo").from("products")
      .select("*")
      .in("id", productIds);

    if (productsError) throw productsError;

    const productsMap = new Map(products?.map((p) => [p.id, p]) ?? []);
    const result = sortedProducts.map((p) => ({
      ...productsMap.get(p.productId),
      totalQuantity: p.totalQuantity,
      totalRevenue: p.totalRevenue,
    }));

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get top products",
    };
  }
}

export async function getCategories(
  businessId: string
): Promise<ServerResponse<string[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .schema("mercadeo").from("products")
      .select("category")
      .eq("business_id", businessId)
      .not("category", "is", null);

    if (error) throw error;

    const categories = [...new Set(data.map((d) => d.category).filter(Boolean))] as string[];

    return { success: true, data: categories };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get categories",
    };
  }
}

export async function createVariant(
  productId: string,
  data: {
    variant_name: string;
    variant_value: string;
    additional_price?: number;
    stock_quantity?: number;
    sku?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: variant, error } = await supabase
      .schema("mercadeo").from("product_variants")
      .insert({
        product_id: productId,
        variant_name: data.variant_name,
        variant_value: data.variant_value,
        additional_price: data.additional_price ?? 0,
        stock_quantity: data.stock_quantity ?? 0,
        sku: data.sku ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: variant };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create variant",
    };
  }
}

export async function updateVariant(
  id: string,
  data: {
    variant_name?: string;
    variant_value?: string;
    additional_price?: number;
    stock_quantity?: number;
    sku?: string;
  }
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: variant, error } = await supabase
      .schema("mercadeo").from("product_variants")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: variant };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update variant",
    };
  }
}

export async function deleteVariant(id: string): Promise<ServerResponse> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.schema("mercadeo").from("product_variants").delete().eq("id", id);
    if (error) throw error;

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete variant",
    };
  }
}
