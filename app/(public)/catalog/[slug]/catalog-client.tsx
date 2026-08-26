"use client";

import { useState, useMemo } from "react";
import { SearchBar } from "@/components/catalog/search-bar";
import { CategoryTabs } from "@/components/catalog/category-tabs";
import { ProductGrid } from "@/components/catalog/product-grid";
import { CartProvider } from "@/components/catalog/cart";

interface Product {
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
}

interface CatalogClientProps {
  products: Product[];
  categories: string[];
  slug: string;
  businessName: string;
  businessPhone: string | null;
}

export function CatalogClient({
  products,
  categories,
  slug,
  businessName,
  businessPhone,
}: CatalogClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "Todos" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  return (
    <CartProvider businessName={businessName} businessPhone={businessPhone}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Productos</h2>
          <p className="text-muted-foreground">
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <SearchBar value={search} onChange={setSearch} />

        {categories.length > 0 && (
          <CategoryTabs
            categories={categories}
            active={activeCategory}
            onChange={setActiveCategory}
          />
        )}

        <ProductGrid
          products={filtered}
          slug={slug}
          businessName={businessName}
          businessPhone={businessPhone}
        />
      </div>
    </CartProvider>
  );
}
