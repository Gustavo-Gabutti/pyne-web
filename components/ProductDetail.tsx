"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { SIZE_GUIDE_TABLE } from "@/lib/navigation";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

export default function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const isUnique = product.sizeType === "unique";
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [selectedSize, setSelectedSize] = useState<string>(isUnique ? "Talla Única" : "");
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const [guideOpen, setGuideOpen] = useState(false);

  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const discount = hasDiscount
    ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100)
    : 0;

  const sizeLabel = useMemo(() => {
    if (product.sizeType === "numeric") return "Seleccioná tu talle (US)";
    if (product.sizeType === "standard") return "Seleccioná tu talle";
    return "Talle";
  }, [product.sizeType]);

  const handleAdd = (): void => {
    if (!isUnique && !selectedSize) {
      setError("Elegí un talle para continuar.");
      return;
    }
    setError("");
    addItem(product, isUnique ? "Talla Única" : selectedSize, quantity);
  };

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Galería */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-pyne-border bg-pyne-smoke">
            <Image
              src={activeImage}
              alt={`${product.brand} ${product.name}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {hasDiscount && (
              <span className="absolute left-4 top-4 rounded-full bg-pyne-orange px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-pyne-black">
                -{discount}% OFF
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  aria-label="Ver imagen"
                  className={cn(
                    "relative h-20 w-20 overflow-hidden rounded-xl border-2 transition",
                    activeImage === img
                      ? "border-pyne-orange"
                      : "border-pyne-border hover:border-pyne-kraft/50"
                  )}
                >
                  <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info del Producto */}
        <div className="flex flex-col">
          <Link
            href={
              product.category === "zapatillas"
                ? `/zapatillas/${product.brandSlug}`
                : `/${product.category}/${product.subcategory}`
            }
            className="pyne-eyebrow hover:underline"
          >
            {product.brand} ✦ {product.subcategoryLabel}
          </Link>
          <h1 className="mt-3 font-display text-3xl uppercase leading-tight text-pyne-cream sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-pyne-border px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-pyne-kraft">
              {product.condition}
            </span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-pyne-muted">
              {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
            </span>
          </div>
          <div className="mt-6 flex items-end gap-4">
            <span className="font-display text-4xl text-pyne-cream">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="pb-1 text-lg text-pyne-muted line-through">
                {formatPrice(product.compareAtPrice as number)}
              </span>
            )}
          </div>
          <p className="mt-6 text-sm leading-relaxed text-pyne-muted">{product.description}</p>

          {/* Selector de talles */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-pyne-cream">
                {sizeLabel}
              </span>
              {product.sizeType === "numeric" && (
                <button
                  type="button"
                  onClick={() => setGuideOpen(true)}
                  className="text-[11px] uppercase tracking-[0.12em] text-pyne-orange underline underline-offset-4 hover:text-pyne-cream"
                >
                  Guía de talles
                </button>
              )}
            </div>

            {isUnique ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-pyne-border bg-pyne-smoke px-5 py-3">
                <span className="text-pyne-orange">✦</span>
                <span className="text-sm font-semibold uppercase tracking-[0.12em] text-pyne-cream">
                  Talla Única
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size);
                      setError("");
                    }}
                    className={cn(
                      "min-w-[70px] rounded-xl border px-4 py-3 text-sm font-semibold transition",
                      selectedSize === size
                        ? "border-pyne-orange bg-pyne-orange text-pyne-black"
                        : "border-pyne-border text-pyne-cream hover:border-pyne-kraft"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
            {error && <p className="mt-3 text-xs text-pyne-ember">⚠ {error}</p>}
          </div>

          {/* Cantidad + Botones */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 rounded-full border border-pyne-border px-2 py-1.5">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Restar cantidad"
                className="grid h-8 w-8 place-items-center text-pyne-cream hover:text-pyne-orange"
              >
                −
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                aria-label="Sumar cantidad"
                className="grid h-8 w-8 place-items-center text-pyne-cream hover:text-pyne-orange"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="pyne-btn-primary flex-1 sm:flex-none sm:px-12"
            >
              {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
            </button>
          </div>

          <Link href="/checkout" className="pyne-btn-outline mt-3 w-full sm:w-auto sm:px-12">
            Ir al checkout
          </Link>
        </div>
      </div>

      {/* Modal Guía de talles */}
      {guideOpen && (
        <div
          className="fixed inset-0 z-[3] grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Guía de talles"
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setGuideOpen(false)}
            aria-hidden
          />
          <div className="pyne-card relative w-full max-w-lg animate-fadeUp overflow-hidden">
            <header className="flex items-center justify-between border-b border-pyne-border px-6 py-4">
              <div>
                <p className="pyne-eyebrow">PYNE ✦ Fit Guide</p>
                <h3 className="font-display text-xl uppercase text-pyne-cream">Guía de talles</h3>
              </div>
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                aria-label="Cerrar guía"
                className="grid h-9 w-9 place-items-center rounded-full border border-pyne-border text-pyne-cream hover:border-pyne-orange hover:text-pyne-orange"
              >
                ✕
              </button>
            </header>
            <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.16em] text-pyne-muted">
                    <th className="pb-3">US</th>
                    <th className="pb-3">EU</th>
                    <th className="pb-3">ARG</th>
                    <th className="pb-3">CM</th>
                  </tr>
                </thead>
                <tbody className="text-pyne-cream">
                  {SIZE_GUIDE_TABLE.map((row) => (
                    <tr key={row.us} className="border-t border-pyne-border/60">
                      <td className="py-2.5 font-semibold text-pyne-orange">{row.us}</td>
                      <td className="py-2.5">{row.eu}</td>
                      <td className="py-2.5">{row.ar}</td>
                      <td className="py-2.5">{row.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}