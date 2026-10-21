"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  autoFocus?: boolean;
  onNavigate?: () => void;
}

interface SearchHit {
  id: string;
  brand: string;
  name: string;
}

export default function SearchBar({ autoFocus, onNavigate }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query.trim();

    if (!q) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    // Debounce: espera 250 ms después de la última tecla
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { products: SearchHit[] };
        setResults(data.products);
      } catch {
        // Petición cancelada o error de red: se ignora
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onNavigate) onNavigate();
      setResults([]);
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar zapatillas, marcas, prendas..."
          className="w-full bg-pyne-border/30 border border-pyne-border px-4 py-2 text-xs text-pyne-cream focus:outline-none focus:border-pyne-orange transition"
        />
        <button
          type="submit"
          className="bg-pyne-orange px-4 py-2 text-xs uppercase font-bold text-black"
        >
          Buscar
        </button>
      </form>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-black border border-pyne-border shadow-lg">
          {results.map((p) => (
            <Link
              key={p.id}
              href={`/producto/${p.id}`}
              onClick={() => {
                setQuery("");
                setResults([]);
                if (onNavigate) onNavigate();
              }}
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