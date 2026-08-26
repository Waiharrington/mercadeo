import { notFound } from "next/navigation";
import { getPublicProduct, getPublicCatalog } from "@/lib/actions/catalog";
import { ProductDetailClient } from "./product-detail-client";

interface ProductPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const result = await getPublicProduct(id);
  if (!result.success || !result.data) {
    return { title: "Producto no encontrado" };
  }
  const product = result.data as { name: string; description: string | null; selling_price: number; images: string[]; business: { business_name: string } };
  return {
    title: `${product.name} — ${product.business.business_name}`,
    description: product.description ?? `${product.name} - $${product.selling_price.toFixed(2)}`,
    openGraph: {
      title: product.name,
      description: product.description ?? "",
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, id } = await params;
  const result = await getPublicProduct(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data as {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    selling_price: number;
    wholesale_price: number | null;
    images: string[];
    stock_quantity: number;
    product_variants: Array<{
      id: string;
      variant_name: string;
      variant_value: string;
      additional_price: number;
      stock_quantity: number;
    }>;
    business: {
      business_name: string;
      logo_url: string | null;
      phone_whatsapp: string | null;
    };
  };

  const catalogResult = await getPublicCatalog(slug);
  const relatedProducts =
    catalogResult.success && catalogResult.data
      ? (catalogResult.data as { products: Array<{ id: string; name: string; selling_price: number; category: string | null; images: string[] }> }).products
          .filter((p) => p.id !== id && p.category === product.category)
          .slice(0, 4)
      : [];

  return (
    <ProductDetailClient
      product={product as any}
      relatedProducts={relatedProducts}
      slug={slug}
    />
  );
}
