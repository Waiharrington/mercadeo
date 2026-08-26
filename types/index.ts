import type { Database } from "./database";

type Tables<T extends keyof Database["mercadeo"]["Tables"]> =
  Database["mercadeo"]["Tables"][T]["Row"];

export type Profile = Tables<"profiles">;
export type Product = Tables<"products">;
export type ProductVariant = Tables<"product_variants">;
export type Customer = Tables<"customers">;
export type Sale = Tables<"sales">;
export type SaleItem = Tables<"sale_items">;
export type Expense = Tables<"expenses">;

export type BusinessRole = "owner" | "admin" | "staff";
export type OrderStatus = "pending" | "confirmed" | "fulfilled" | "cancelled";
export type OrderSource = "manual" | "catalog" | "import";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockProducts: number;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  description?: string;
  children?: { label: string; href: string }[];
}
