"use client";

import { useMemo, useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import { UNIQUE_SIZE } from "@/lib/navigation";
import type { Product } from "@/lib/types";
import { cn, compareSizes } from "@/lib/utils";

interface SizeFilterGridProps {
  products: Product[];
  emptyTitle?: string;
  emptyMessage?: string;
}

export default function SizeFilterGrid({
  products,
  emptyTitle,
  emptyMessage,
}: SizeFilterGridProps) {
  const [selected, setSelected] = useState<string | null>(null);

  // Talles realmente disponibles en estos productos, con cantidad de productos por talle
  const sizeCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      for (const size of new Set(p.sizes)) {
        if (size === UNIQUE_SIZE) continue;
        map.set(size, (map.get(size) ?? 0) + 1);
      }
    }
    return Array.from(map.entries()).sort(([a], [b]) => compareSizes(a, b));
  }, [products]);

  // Si el talle elegido ya no existe en este listado, se ignora
  const activeSize =
    selected && sizeCounts.some(([size]) => size === selected) ? selected : null;

  const visible = useMemo(
    () => (activeSize ? products.filter((p) => p.sizes.includes(activeSize)) : products),
    [products, activeSize]
  );

  return (
    <>
      {sizeCounts.length > 0 && (
        <div className="mt-8 rounded-xl border border-pyne-border bg-pyne-smoke/40 px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-pyne-muted">
              Filtrar por talle
            </span>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-pressed={activeSize === null}
                className={cn(
                  "rounded border px-2.5 py-1 text-[11px] font-semibold uppercase transition",
                  activeSize === null
                    ? "border-pyne-orange bg-pyne-orange text-pyne-black"
                    : "border-pyne-border text-pyne-cream hover:border-pyne-orange hover:text-pyne-orange"
                )}
              >
                Todos
              </button>

              {sizeCounts.map(([size, count]) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelected((prev) => (prev === size ? null : size))}
                  aria-pressed={activeSize === size}
                  title={`${count} ${count === 1 ? "producto" : "productos"} en talle ${size}`}
                  className={cn(
                    "rounded border px-2.5 py-1 text-[11px] font-semibold transition",
                    activeSize === size
                      ? "border-pyne-orange bg-pyne-orange text-pyne-black"
                      : "border-pyne-border text-pyne-cream hover:border-pyne-orange hover:text-pyne-orange"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-3 text-[11px] text-pyne-muted" aria-live="polite">
            {activeSize
              ? `${visible.length} ${visible.length === 1 ? "producto" : "productos"} en talle ${activeSize}`
              : `${visible.length} ${visible.length === 1 ? "producto" : "productos"}`}
          </p>
        </div>
      )}

      <div className="mt-10">
        <ProductGrid
          products={visible}
          emptyTitle={activeSize ? `Sin stock en talle ${activeSize}` : emptyTitle}
          emptyMessage={
            activeSize
              ? "No hay productos con ese talle por el momento. Probá con otro talle."
              : emptyMessage
          }
        />
      </div>
    </>
  );
}