"use client";

import * as React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { QuickViewProduct } from "@/lib/catalog/types";

export type CartItem = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  sizeLabel: string;
  price: number;
  maxStock: number;
  imageUrl: string;
  categoryName?: string | null;
  quantity: number;
};

export type StoreToastMessage = {
  id: number;
  message: string;
  actionLabel?: string;
  actionHref?: string;
};

type CartContextValue = {
  items: CartItem[];
  wishlistIds: string[];
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    item: Omit<CartItem, "quantity"> & { quantity?: number },
    options?: { openBag?: boolean }
  ) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  totalItems: number;
  subtotal: number;
  toast: StoreToastMessage | null;
  notify: (message: string, options?: { actionLabel?: string; actionHref?: string }) => void;
  dismissToast: () => void;
  quickViewProduct: QuickViewProduct | null;
  openQuickView: (product: QuickViewProduct) => void;
  closeQuickView: () => void;
};

const CART_KEY = "spacetrip_cart_v1";
const WISHLIST_KEY = "spacetrip_wishlist_v1";

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = React.useState<string[]>([]);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);
  const [toast, setToast] = React.useState<StoreToastMessage | null>(null);
  const [quickViewProduct, setQuickViewProduct] = React.useState<QuickViewProduct | null>(null);
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = React.useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const notify = React.useCallback(
    (message: string, options?: { actionLabel?: string; actionHref?: string }) => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      setToast({
        id: Date.now(),
        message,
        actionLabel: options?.actionLabel,
        actionHref: options?.actionHref,
      });
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, 2800);
    },
    []
  );

  // Hydrate from localStorage + sync wishlist if authenticated
  React.useEffect(() => {
    let active = true;
    (async () => {
      await Promise.resolve();
      if (!active) return;

      try {
        const rawCart = localStorage.getItem(CART_KEY);
        if (rawCart) {
          const parsed = JSON.parse(rawCart);
          if (Array.isArray(parsed)) setItems(parsed);
        }
        const rawWish = localStorage.getItem(WISHLIST_KEY);
        if (rawWish) {
          const parsedWish = JSON.parse(rawWish);
          if (Array.isArray(parsedWish)) setWishlistIds(parsedWish);
        }
      } catch {
        // Ignore storage errors
      }
      setHydrated(true);

      // Sync wishlist from Supabase if logged in
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !active) return;
        const { data } = await supabase
          .from("wishlists")
          .select("product_id")
          .eq("user_id", user.id);
        if (data && data.length > 0 && active) {
          const serverIds = data.map((r: { product_id: string }) => r.product_id);
          setWishlistIds((prev) => Array.from(new Set([...prev, ...serverIds])));
        }
      } catch {
        // Non-blocking
      }
    })();

    return () => {
      active = false;
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota errors
    }
  }, [items, hydrated]);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Ignore quota errors
    }
  }, [wishlistIds, hydrated]);

  const addItem = React.useCallback(
    (
      incoming: Omit<CartItem, "quantity"> & { quantity?: number },
      options?: { openBag?: boolean }
    ) => {
      const addQty = Math.max(1, incoming.quantity ?? 1);
      setItems((prev) => {
        const existing = prev.find((i) => i.variantId === incoming.variantId);
        if (existing) {
          return prev.map((i) =>
            i.variantId === incoming.variantId
              ? {
                  ...i,
                  quantity: Math.min(i.maxStock, i.quantity + addQty),
                }
              : i
          );
        }
        return [
          ...prev,
          {
            ...incoming,
            quantity: Math.min(incoming.maxStock, addQty),
          },
        ];
      });
      if (options?.openBag === false) {
        notify(`${incoming.name} (${incoming.sizeLabel}) masuk keranjang`);
      } else {
        setCartOpen(true);
      }
    },
    [notify]
  );

  const updateQuantity = React.useCallback((variantId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.variantId === variantId
            ? { ...i, quantity: Math.max(0, Math.min(i.maxStock, quantity)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = React.useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const clearCart = React.useCallback(() => {
    setItems([]);
  }, []);

  const toggleWishlist = React.useCallback(
    async (productId: string) => {
      const added = !wishlistIds.includes(productId);
      setWishlistIds((prev) =>
        added
          ? prev.includes(productId)
            ? prev
            : [...prev, productId]
          : prev.filter((id) => id !== productId)
      );

      notify(added ? "Disimpan ke Wishlist" : "Dihapus dari Wishlist", {
        actionLabel: added ? "Lihat" : undefined,
        actionHref: added ? "/wishlist" : undefined,
      });

      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        if (added) {
          await supabase
            .from("wishlists")
            .upsert({ user_id: user.id, product_id: productId }, { onConflict: "user_id,product_id" });
        } else {
          await supabase
            .from("wishlists")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId);
        }
      } catch {
        // Fallback already persisted in localStorage
      }
    },
    [notify, wishlistIds]
  );

  const isWishlisted = React.useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const totalItems = React.useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = React.useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const value = React.useMemo<CartContextValue>(
    () => ({
      items,
      wishlistIds,
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      toggleWishlist,
      isWishlisted,
      totalItems,
      subtotal,
      toast,
      notify,
      dismissToast,
      quickViewProduct,
      openQuickView: (p) => setQuickViewProduct(p),
      closeQuickView: () => setQuickViewProduct(null),
    }),
    [
      items,
      wishlistIds,
      cartOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      toggleWishlist,
      isWishlisted,
      totalItems,
      subtotal,
      toast,
      notify,
      dismissToast,
      quickViewProduct,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
