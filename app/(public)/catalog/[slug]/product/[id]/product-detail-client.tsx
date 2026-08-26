"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/catalog/whatsapp-button";
import { CartProvider, useCart } from "@/components/catalog/cart";
import { ProductCard } from "@/components/catalog/product-card";

interface Variant {
  id: string;
  variant_name: string;
  variant_value: string;
  additional_price: number;
  stock_quantity: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  selling_price: number;
  wholesale_price: number | null;
  images: string[];
  stock_quantity: number;
  product_variants: Variant[];
  business: {
    business_name: string;
    logo_url: string | null;
    phone_whatsapp: string | null;
  };
}

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Array<{
    id: string;
    name: string;
    selling_price: number;
    category: string | null;
    images: string[];
  }>;
  slug: string;
}

export function ProductDetailClient({
  product,
  relatedProducts,
  slug,
}: ProductDetailClientProps) {
  return (
    <CartProvider
      businessName={product.business.business_name}
      businessPhone={product.business.phone_whatsapp}
    >
      <ProductDetail
        product={product}
        relatedProducts={relatedProducts}
        slug={slug}
      />
    </CartProvider>
  );
}

function ProductDetail({
  product,
  relatedProducts,
  slug,
}: {
  product: Product;
  relatedProducts: ProductDetailClientProps["relatedProducts"];
  slug: string;
}) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.product_variants[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);

  const currentPrice =
    selectedVariant
      ? product.selling_price + selectedVariant.additional_price
      : product.selling_price;

  const currentStock = selectedVariant
    ? selectedVariant.stock_quantity
    : product.stock_quantity;

  const inStock = currentStock > 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: currentPrice,
      variant: selectedVariant?.variant_value,
      image: product.images[0],
    });
  };

  const variantsByName = product.product_variants.reduce(
    (acc, v) => {
      if (!acc[v.variant_name]) acc[v.variant_name] = [];
      acc[v.variant_name].push(v);
      return acc;
    },
    {} as Record<string, Variant[]>
  );

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <Link
          href={`/catalog/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Volver al catálogo
        </Link>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-xl bg-muted">
              {product.images[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Package className="size-16 text-muted-foreground/30" />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`size-16 overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImage === i
                        ? "border-foreground"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              {product.category && (
                <Badge variant="secondary" className="mb-2">
                  {product.category}
                </Badge>
              )}
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
              <p className="mt-3 text-2xl font-bold" style={{ color: "var(--accent-color, inherit)" }}>
                ${currentPrice.toFixed(2)}
              </p>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {Object.keys(variantsByName).length > 0 && (
              <div className="space-y-4">
                {Object.entries(variantsByName).map(([name, variants]) => (
                  <div key={name}>
                    <p className="mb-2 text-sm font-medium">
                      {name}
                      {selectedVariant?.variant_name === name && (
                        <span className="ml-1 text-muted-foreground">
                          — {selectedVariant.variant_value}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                            selectedVariant?.id === v.id
                              ? "border-foreground bg-foreground text-background"
                              : v.stock_quantity > 0
                                ? "border-border hover:border-foreground/50"
                                : "border-border opacity-50 cursor-not-allowed"
                          }`}
                          disabled={v.stock_quantity === 0}
                        >
                          {v.variant_value}
                          {v.additional_price > 0 && (
                            <span className="ml-1 text-xs opacity-70">
                              +${v.additional_price.toFixed(2)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Disponibilidad:</span>
              {inStock ? (
                <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  En stock ({currentStock})
                </Badge>
              ) : (
                <Badge variant="destructive">Agotado</Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Cantidad:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!inStock}
                >
                  <Minus className="size-3" />
                </Button>
                <span className="min-w-[30px] text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={!inStock}
                >
                  <Plus className="size-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <WhatsAppButton
                phone={product.business.phone_whatsapp ?? ""}
                productName={product.name}
                productPrice={currentPrice}
                businessName={product.business.business_name}
                quantity={quantity}
                variant={selectedVariant?.variant_value}
                size="lg"
                className="w-full"
              />
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                disabled={!inStock}
                onClick={handleAddToCart}
              >
                Agregar al carrito
              </Button>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold">Productos relacionados</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.selling_price}
                  category={p.category}
                  image={p.images[0] ?? null}
                  slug={slug}
                  businessName={product.business.business_name}
                  businessPhone={product.business.phone_whatsapp}
                />
              ))}
            </div>
          </section>
        )}
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
