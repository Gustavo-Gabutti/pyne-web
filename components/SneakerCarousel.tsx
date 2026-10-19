"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface SneakerCarouselProps {
  products: Product[];
}

export default function SneakerCarousel({ products }: SneakerCarouselProps) {
  // Garantizar que products sea un Array antes de filtrar
  const safeProducts = Array.isArray(products) ? products : [];
  const sneakers = safeProducts.filter((p) => p.category === "zapatillas");
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    if (sneakers.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % sneakers.length);
  }, [sneakers.length]);

  const prevSlide = useCallback(() => {
    if (sneakers.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + sneakers.length) % sneakers.length);
  }, [sneakers.length]);

  // Temporizador automático de 10 segundos (se pausa si el usuario hace hover)
  useEffect(() => {
    if (isHovered || sneakers.length === 0) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 10000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isHovered, sneakers.length]);

  if (sneakers.length === 0) return null;

  const currentProduct = sneakers[currentIndex];

  return (
    <div
      className="relative mt-12 overflow-hidden rounded-2xl border border-pyne-border bg-pyne-coal/80 p-6 sm:p-8 backdrop-blur-md shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="pyne-eyebrow">Footwear Highlight</p>
          <h3 className="font-display text-2xl uppercase text-pyne-cream sm:text-3xl">
            Destacados 3D
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Anterior zapatilla"
            className="grid h-10 w-10 place-items-center rounded-full border border-pyne-border text-pyne-cream transition hover:border-pyne-orange hover:text-pyne-orange active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Siguiente zapatilla"
            className="grid h-10 w-10 place-items-center rounded-full border border-pyne-border text-pyne-cream transition hover:border-pyne-orange hover:text-pyne-orange active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid items-center gap-8 md:grid-cols-2">
        {/* Contenedor con efecto 3D Spin */}
        <div className="flex justify-center [perspective:1000px]">
          <div className="group relative h-64 w-64 sm:h-72 sm:w-72 transition-transform duration-700 ease-out [transform-style:preserve-3d] hover:[transform:rotateY(180deg)]">
            {/* Frente de la tarjeta */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl border border-pyne-border bg-pyne-smoke [backface-visibility:hidden]">
              <Image
                src={currentProduct.image}
                alt={currentProduct.name}
                fill
                priority
                sizes="(max-width: 640px) 256px, 288px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-pyne-black/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-pyne-orange backdrop-blur">
                {currentProduct.condition}
              </span>
            </div>

            {/* Dorso 3D rotado */}
            <div className="absolute inset-0 flex flex-col justify-center rounded-2xl border border-pyne-orange/40 bg-pyne-smoke/95 p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pyne-orange">
                {currentProduct.brand}
              </p>
              <h4 className="mt-2 font-display text-xl uppercase text-pyne-cream">
                {currentProduct.name}
              </h4>
              <p className="mt-2 text-xs text-pyne-kraft">
                Talles: {currentProduct.sizes.join(", ")}
              </p>
              <Link
                href={`/producto/${currentProduct.id}`}
                className="pyne-btn-primary mt-4 inline-block text-[10px]"
              >
                Ver par
              </Link>
            </div>
          </div>
        </div>

        {/* Información del par activo */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-pyne-border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-pyne-orange">
              {currentProduct.brand}
            </span>
            <span className="text-[11px] uppercase tracking-[0.14em] text-pyne-muted">
              {currentIndex + 1} / {sneakers.length}
            </span>
          </div>

          <h4 className="font-display text-3xl uppercase leading-tight text-pyne-cream sm:text-4xl">
            {currentProduct.name}
          </h4>

          <p className="text-sm leading-relaxed text-pyne-muted line-clamp-3">
            {currentProduct.description}
          </p>

          <div className="flex items-baseline gap-3 pt-2">
            <span className="font-display text-3xl text-pyne-cream">
              {formatPrice(currentProduct.price)}
            </span>
            {currentProduct.compareAtPrice && currentProduct.compareAtPrice > currentProduct.price && (
              <span className="text-sm text-pyne-muted line-through">
                {formatPrice(currentProduct.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href={`/producto/${currentProduct.id}`}
              className="pyne-btn-primary"
            >
              Comprar ahora
            </Link>
            <Link
              href="/zapatillas"
              className="pyne-btn-outline"
            >
              Ver todas las zapatillas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}