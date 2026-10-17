"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";

import type { CartAction, CartItem, CartState, Product } from "@/lib/types";
import { cartCount, cartKey, cartTotal } from "@/lib/utils";

const STORAGE_KEY = "pyne-cart-v1";

const initialState: CartState = { items: [] };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.payload };

    case "ADD": {
      const { product, selectedSize, quantity = 1 } = action.payload;
      const key = cartKey(product.id, selectedSize);
      const existing = state.items.find(
        (i) => i.product.id === product.id && i.selectedSize === selectedSize
      );

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.key === key
              ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock || 99) }
              : i
          ),
        };
      }

      const newItem: CartItem = { key, product, selectedSize, quantity };
      return { items: [...state.items, newItem] };
    }

    case "INC":
      return {
        items: state.items.map((i) =>
          i.key === action.payload.key
            ? { ...i, quantity: Math.min(i.quantity + 1, i.product.stock || 99) }
            : i
        ),
      };

    case "DEC":
      return {
        items: state.items
          .map((i) =>
            i.key === action.payload.key ? { ...i, quantity: i.quantity - 1 } : i
          )
          .filter((i) => i.quantity > 0),
      };

    case "REMOVE":
      return { items: state.items.filter((i) => i.key !== action.payload.key) };

    case "CLEAR":
      return { items: [] };

    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  hydrated: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, selectedSize: string, quantity?: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items, hydrated]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const addItem = useCallback(
    (product: Product, selectedSize: string, quantity = 1) => {
      dispatch({ type: "ADD", payload: { product, selectedSize, quantity } });
      // Se removió setIsOpen(true) para no desplegar automáticamente el CartDrawer
    },
    []
  );

  const increment = useCallback((key: string) => dispatch({ type: "INC", payload: { key } }), []);
  const decrement = useCallback((key: string) => dispatch({ type: "DEC", payload: { key } }), []);
  const removeItem = useCallback((key: string) => dispatch({ type: "REMOVE", payload: { key } }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      count: cartCount(state.items),
      total: cartTotal(state.items),
      hydrated,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      increment,
      decrement,
      removeItem,
      clearCart,
    }),
    [state.items, hydrated, isOpen, addItem, increment, decrement, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}