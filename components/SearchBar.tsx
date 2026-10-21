"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { searchProducts } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
}

export default function SearchBar({
  placeholder = "Buscar zapatillas, marcas, prendas…",
  autoFocus = false,
  onNavigate,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Búsqueda asíncrona de productos */
  useEffect(() => {
    let active = true;

    if (query.trim().length >= 2) {
      searchProducts(query).then((results) => {
        if (active) {
          setSuggestions(results.slice(0, 5));
        }
      });
    } else {
      setSuggestions([]);
    }

    return () => {
      active = false;
    };
  }, [query]);

  /** Navegación tipada, reutilizable por el form y por el botón */
  const goToResults = useCallback((): void => {
    const term = query.trim();
    if (!term) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/buscar?q=${encodeURIComponent(term)}`);
  }, [query, router, onNavigate]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      goToResults();
    },
    [goToResults]
  );

  const goToProduct = useCallback(
    (id: string): void => {
      setOpen(false);
      setQuery("");
      onNavigate?.();
      router.push(`/producto/${id}`);
    },
    [router, onNavigate]
  );

  /* Cerrar al clickear afuera */
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} role="search" className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pyne-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
        </span>
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-label="Buscar productos"
          className="w-full !pl-11 !pr-24"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-pyne-orange px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-pyne-black transition hover:bg-pyne-cream disabled:opacity-40"
        >
          Buscar
        </button>
      </form>

      {open && query.trim().length >= 2 && (
        <div className="pyne-card absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden p-2 shadow-2xl">
          {suggestions.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-pyne-muted">
              Sin resultados para <span className="text-pyne-cream">“{query}”</span>
            </p>
          ) : (
            <ul className="space-y-1">
              {suggestions.map((p: Product) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => goToProduct(p.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-pyne-smoke"
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-pyne-smoke">
                      <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-pyne-cream">{p.name}</span>
                      <span className="block text-[11px] uppercase tracking-wide text-pyne-muted">
                        {p.brand} · {p.subcategoryLabel}
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-pyne-orange">
                      {formatPrice(p.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={goToResults}
            className="mt-2 w-full rounded-xl border border-pyne-border py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-pyne-cream transition hover:border-pyne-orange hover:text-pyne-orange"
          >
            Ver todos los resultados
          </button>
        </div>
      )}
    </div>
  );
}