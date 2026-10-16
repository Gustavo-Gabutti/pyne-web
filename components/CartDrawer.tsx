"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { items, total, count, isOpen, closeCart, increment, decrement, removeItem, clearCart } =
    useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden
      />

      <aside className="relative flex h-full w-full max-w-md animate-slideIn flex-col border-l border-pyne-border bg-pyne-coal">
        <header className="flex items-center justify-between border-b border-pyne-border px-6 py-5">
          <div>
            <p className="pyne-eyebrow">PYNE ✦ Bag</p>
            <h2 className="font-display text-xl uppercase text-pyne-cream">
              Tu carrito ({count})
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="grid h-9 w-9 place-items-center rounded-full border border-pyne-border text-pyne-cream transition hover:border-pyne-orange hover:text-pyne-orange"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="text-4xl text-pyne-orange">✦</span>
            <p className="font-display text-lg uppercase text-pyne-cream">Tu carrito está vacío</p>
            <p className="text-sm text-pyne-muted">
              Explorá nuestra selección de piezas vintage y deadstock.
            </p>
            <button onClick={closeCart} className="pyne-btn-primary mt-2">
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 border-b border-pyne-border pb-4">
                  <Link
                    href={`/producto/${item.product.id}`}
                    onClick={closeCart}
                    className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-pyne-smoke"
                  >
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-pyne-muted">
                      {item.product.brand}
                    </p>
                    <p className="truncate text-sm font-medium text-pyne-cream">
                      {item.product.name}
                    </p>
                    <p className="mt-1 inline-block rounded border border-pyne-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-pyne-kraft">
                      Talle: {item.selectedSize}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-pyne-border">
                        <button
                          type="button"
                          onClick={() => decrement(item.key)}
                          aria-label="Restar"
                          className="grid h-7 w-7 place-items-center text-pyne-cream hover:text-pyne-orange"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => increment(item.key)}
                          aria-label="Sumar"
                          className="grid h-7 w-7 place-items-center text-pyne-cream hover:text-pyne-orange"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-semibold text-pyne-orange">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="mt-2 text-[10px] uppercase tracking-[0.14em] text-pyne-muted underline-offset-2 hover:text-pyne-ember hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="space-y-4 border-t border-pyne-border bg-pyne-black/60 px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-pyne-muted">Total</span>
                <span className="font-display text-2xl text-pyne-cream">{formatPrice(total)}</span>
              </div>
              <p className="text-[11px] text-pyne-muted">
                El costo de envío se coordina por WhatsApp al confirmar el pedido.
              </p>
              <Link href="/checkout" onClick={closeCart} className="pyne-btn-primary w-full">
                Finalizar compra
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="w-full text-[10px] uppercase tracking-[0.16em] text-pyne-muted hover:text-pyne-ember"
              >
                Vaciar carrito
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}