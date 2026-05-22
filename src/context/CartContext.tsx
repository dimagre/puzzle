"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface CartItem {
  puzzleId: string;
  title: string;
  titleEn: string;
  imageUrl: string;
  pieceCount: number;
  rentalPricePerDay: number;
  depositAmount: number;
  rentalDays: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "rentalDays">) => void;
  removeItem: (puzzleId: string) => void;
  updateRentalDays: (puzzleId: string, days: number) => void;
  clearCart: () => void;
  isInCart: (puzzleId: string) => boolean;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "puzzleshare_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored) as CartItem[]);
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "rentalDays">) => {
    setItems((prev) => {
      if (prev.some((i) => i.puzzleId === item.puzzleId)) return prev;
      return [...prev, { ...item, rentalDays: 7 }];
    });
  }, []);

  const removeItem = useCallback((puzzleId: string) => {
    setItems((prev) => prev.filter((i) => i.puzzleId !== puzzleId));
  }, []);

  const updateRentalDays = useCallback((puzzleId: string, days: number) => {
    setItems((prev) =>
      prev.map((i) => (i.puzzleId === puzzleId ? { ...i, rentalDays: days } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (puzzleId: string) => items.some((i) => i.puzzleId === puzzleId),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateRentalDays, clearCart, isInCart, itemCount: items.length }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
