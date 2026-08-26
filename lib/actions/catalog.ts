"use server";

import { createClient } from "@/lib/supabase/server";

interface ServerResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getPublicCatalog(
  businessSlug: string
): Promise<
  ServerResponse<{
    business: {
      business_name: string;
      logo_url: string | null;
      banner_url: string | null;
      category_niche: string | null;
      phone_whatsapp: string | null;
      social_links: Record<string, string> | null;
      description: string | null;
    };
    products: Array<{
      id: string;
      name: string;
      description: string | null;
      category: string | null;
      selling_price: number;
      wholesale_price: number | null;
      images: string[];
      product_variants: Array<{
        id: string;
        variant_name: string;
        variant_value: string;
        additional_price: number;
        stock_quantity: number;
      }>;
    }>;
  }>
> {
  try {
    const supabase = await createClient();

    const { data: profile, error: profileError } = await supabase
      .schema("mercadeo").from("profiles")
      .select(
        "id, business_name, logo_url, banner_url, category_niche, phone_whatsapp, social_links, description"
      )
      .eq("business_slug", businessSlug)
      .single();

    if (profileError) throw profileError;

    const { data: products, error: productsError } = await supabase
      .schema("mercadeo").from("products")
      .select(
        "id, name, description, category, selling_price, wholesale_price, images, product_variants(id, variant_name, variant_value, additional_price, stock_quantity)"
      )
      .eq("business_id", profile.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (productsError) throw productsError;

    return {
      success: true,
      data: {
        business: profile,
        products: products ?? [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get public catalog",
    };
  }
}

export async function getPublicProduct(
  productId: string
): Promise<ServerResponse<unknown>> {
  try {
    const supabase = await createClient();

    const { data: product, error: productError } = await supabase
      .schema("mercadeo").from("products")
      .select(
        "id, business_id, name, description, category, selling_price, wholesale_price, images, stock_quantity, min_stock_alert, tags, product_variants(*)"
      )
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError) throw productError;

    const { data: profile, error: profileError } = await supabase
      .schema("mercadeo").from("profiles")
      .select("business_name, logo_url, phone_whatsapp")
      .eq("id", product.business_id)
      .single();

    if (profileError) throw profileError;

    return {
      success: true,
      data: {
        ...product,
        business: profile,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get public product",
    };
  }
}

export async function searchCatalogProducts(
  businessId: string,
  query: string
): Promise<ServerResponse<unknown[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .schema("mercadeo").from("products")
      .select("id, name, description, category, selling_price, images")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order("name", { ascending: true });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to search catalog products",
    };
  }
}
