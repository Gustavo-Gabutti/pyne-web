"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    if (query.trim()) {
      searchProducts(query).then((res) => {
        if (active) setResults(res.slice(0, 5));
      });
    } else {
      setResults([]);
    }
    return () => {
      active = false;
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar zapatillas, marcas, prendas..."
          className="w-full bg-pyne-border/30 border border-pyne-border px-4 py-2 text-xs text-pyne-cream focus:outline-none focus:border-pyne-orange transition"
        />
        <button type="submit" className="bg-pyne-orange px-4 py-2 text-xs uppercase font-bold text-black">
          Buscar
        </button>
      </form>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-black border border-pyne-border shadow-lg">
          {results.map((p: Product) => (
            <Link
              key={p.id}
              href={`/producto/${p.id}`}
              onClick={() => setQuery("")}
              className="block p-3 hover:bg-pyne-border/20 text-xs text-pyne-cream transition"
            >
              <span className="font-bold">{p.brand}</span> {p.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}