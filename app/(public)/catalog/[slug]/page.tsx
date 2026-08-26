import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicCatalog } from "@/lib/actions/catalog";
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { CatalogClient } from "./catalog-client";

interface CatalogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CatalogPageProps) {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ");
  return {
    title: `${name} — Catálogo`,
    description: `Explora los productos de ${name} en Mercadeo`,
    openGraph: { title: `${name} — Catálogo`, type: "website" },
  };
}

export default async function CatalogPage({ params }: CatalogPageProps) {
  const { slug } = await params;
  const result = await getPublicCatalog(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const { business, products } = result.data;
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];

  return (
    <div className="min-h-screen bg-muted/20">
      <CatalogHeader
        businessName={business.business_name}
        logoUrl={business.logo_url}
        description={business.description}
        phoneWhatsapp={business.phone_whatsapp}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <CatalogClient
          products={products}
          categories={categories}
          slug={slug}
          businessName={business.business_name}
          businessPhone={business.phone_whatsapp}
        />
      </main>

      <footer className="border-t bg-background py-6 text-center text-sm text-muted-foreground">
        Powered by{" "}
        <Link href="/" className="font-medium hover:underline">
          Mercadeo
        </Link>
      </footer>
    </div>
  );
}
