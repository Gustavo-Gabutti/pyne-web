"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const discount = hasDiscount
    ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100)
    : 0;
  const isUnique = product.sizeType === "unique";

  // Verificación defensiva: aseguramos que sizes sea siempre un arreglo
  const sizesList = Array.isArray(product.sizes) ? product.sizes : [];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-pyne-border bg-pyne-coal/60 transition-all duration-300 hover:-translate-y-1 hover:border-pyne-orange/50 hover:shadow-pyne">
      <Link href={`/producto/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-pyne-smoke">
        <Image
          src={product.image || "/logo.jpg"}
          alt={`${product.brand || "PYNE"} ${product.name || "Producto"}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.condition && (
            <span className="rounded-full bg-pyne-black/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-pyne-kraft backdrop-blur">
              {product.condition}
            </span>
          )}
          {hasDiscount && (
            <span className="rounded-full bg-pyne-orange px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-pyne-black">
              -{discount}%
            </span>
          )}
        </div>
        {typeof product.stock === "number" && product.stock <= 3 && product.stock > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-pyne-ember/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
            Últimas {product.stock}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pyne-orange">
          {product.brand}
        </p>
        <Link
          href={`/producto/${product.id}`}
          className="line-clamp-2 text-sm font-medium leading-snug text-pyne-cream transition-colors hover:text-pyne-orange"
        >
          {product.name}
        </Link>

        {/* Renderizado condicional seguro de talles */}
        {sizesList.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {sizesList.slice(0, 5).map((size) => (
              <span
                key={size}
                className="rounded border border-pyne-border px-1.5 py-0.5 text-[9px] uppercase text-pyne-muted"
              >
                {size}
              </span>
            ))}
            {sizesList.length > 5 && (
              <span className="px-1 text-[9px] text-pyne-muted">+{sizesList.length - 5}</span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            {hasDiscount && (
              <p className="text-[11px] text-pyne-muted line-through">
                {formatPrice(product.compareAtPrice as number)}
              </p>
            )}
            <p className="font-display text-lg text-pyne-cream">{formatPrice(product.price)}</p>
          </div>
          {isUnique ? (
            <button
              type="button"
              onClick={() => addItem(product, "Talla Única", 1)}
              className="rounded-full bg-pyne-orange px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-pyne-black transition hover:bg-pyne-cream"
            >
              Agregar
            </button>
          ) : (
            <Link
              href={`/producto/${product.id}`}
              className="rounded-full border border-pyne-border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-pyne-cream transition hover:border-pyne-orange hover:text-pyne-orange"
            >
              Ver talles
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}