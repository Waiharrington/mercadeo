"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  phone: string;
  productName?: string;
  productPrice?: number;
  businessName: string;
  quantity?: number;
  variant?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg" | "xs" | "icon-xs";
}

function buildMessage({
  productName,
  productPrice,
  businessName,
  quantity = 1,
  variant,
}: Omit<WhatsAppButtonProps, "phone" | "className" | "size">): string {
  const lines: string[] = [];
  lines.push(`Hola! Me interesa este producto de *${businessName}*:`);
  lines.push("");
  if (productName) lines.push(`• Producto: ${productName}`);
  if (variant) lines.push(`• Variante: ${variant}`);
  if (productPrice) lines.push(`• Precio: $${productPrice.toFixed(2)}`);
  if (quantity > 1) lines.push(`• Cantidad: ${quantity}`);
  lines.push("");
  lines.push("¿Me pueden dar más información?");
  return encodeURIComponent(lines.join("\n"));
}

export function WhatsAppButton({
  phone,
  productName,
  productPrice,
  businessName,
  quantity,
  variant,
  className,
  size = "default",
}: WhatsAppButtonProps) {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const message = buildMessage({
    productName,
    productPrice,
    businessName,
    quantity,
    variant,
  });
  const href = `https://wa.me/${cleanPhone}?text=${message}`;

  return (
    <Button
      size={size}
      className={`bg-[#25D366] text-white hover:bg-[#1da851] ${className ?? ""}`}
      render={<a href={href} target="_blank" rel="noopener noreferrer" />}
    >
      <MessageCircle className="size-4" />
      WhatsApp
    </Button>
  );
}
