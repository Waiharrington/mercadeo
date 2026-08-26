"use client";

import { useState, createContext, useContext, useCallback, type ReactNode } from "react";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({
  children,
  businessName,
  businessPhone,
}: {
  children: ReactNode;
  businessName: string;
  businessPhone: string | null;
}) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.variant === item.variant);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.variant === item.variant
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const whatsappMessage = encodeURIComponent(
    `Hola! Quiero hacer un pedido de *${businessName}*:\n\n` +
      items
        .map(
          (i) =>
            `• ${i.name}${i.variant ? ` (${i.variant})` : ""} x${i.quantity} - $${(i.price * i.quantity).toFixed(2)}`
        )
        .join("\n") +
      `\n\n*Total: $${total.toFixed(2)}*\n\n¿Me pueden confirmar la disponibilidad?`
  );
  const cleanPhone = businessPhone?.replace(/[^0-9]/g, "") ?? "";

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
        <Sheet>
          <SheetTrigger
            render={
              <Button size="icon-lg" className="rounded-full shadow-lg">
                <ShoppingBag className="size-5" />
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 flex size-5 items-center justify-center p-0 text-[10px]"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            }
          />
          <SheetContent side="right" showCloseButton>
            <SheetHeader>
              <SheetTitle>Mi Carrito ({itemCount})</SheetTitle>
              <SheetDescription>
                {items.length === 0
                  ? "Tu carrito está vacío"
                  : `${items.length} producto${items.length > 1 ? "s" : ""} en tu carrito`}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingBag className="size-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Agrega productos para comenzar
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.variant}`}
                      className="flex gap-3 rounded-lg border p-3"
                    >
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="size-full rounded-lg object-cover"
                          />
                        ) : (
                          <ShoppingBag className="size-5 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">{item.variant}</p>
                        )}
                        <p className="mt-1 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="min-w-[20px] text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="ml-auto text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t p-4 space-y-3">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                {cleanPhone && (
                  <Button
                    className="w-full bg-[#25D366] text-white hover:bg-[#1da851]"
                    size="lg"
                    render={
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    Finalizar por WhatsApp
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={clearCart}>
                  Vaciar carrito
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </CartContext.Provider>
  );
}
