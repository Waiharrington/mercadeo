import { PackageSearch } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "./product-card";

interface Product {
  id: string;
  name: string;
  selling_price: number;
  category: string | null;
  images: string[];
}

interface ProductGridProps {
  products: Product[];
  slug: string;
  businessName: string;
  businessPhone: string | null;
}

export function ProductGrid({
  products,
  slug,
  businessName,
  businessPhone,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <PackageSearch className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No hay productos</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Este negocio aún no ha publicado productos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.selling_price}
          category={product.category}
          image={product.images[0] ?? null}
          slug={slug}
          businessName={businessName}
          businessPhone={businessPhone}
        />
      ))}
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square rounded-none" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
