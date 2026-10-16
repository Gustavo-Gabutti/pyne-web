import type { Metadata } from "next";
import Link from "next/link";
import CollectionHeader from "@/components/CollectionHeader";
import EmptyState from "@/components/EmptyState";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import { getFeaturedProducts, searchProducts, sortProducts } from "@/lib/products";

interface PageProps {
  searchParams: Promise<{ q?: string; sort?: string }>;
}

const SORTS = [
  { label: "Relevancia", value: "" },
  { label: "Menor precio", value: "precio-asc" },
  { label: "Mayor precio", value: "precio-desc" },
  { label: "A-Z", value: "nombre" },
];

/** Sugerencias rápidas cuando no hay query o no hay resultados */
const SUGGESTED_TERMS = [
  { label: "Nike", href: "/buscar?q=nike" },
  { label: "Jordan", href: "/buscar?q=jordan" },
  { label: "Vintage", href: "/buscar?q=vintage" },
  { label: "Deadstock", href: "/buscar?q=deadstock" },
  { label: "Hoodies", href: "/buscar?q=hoodie" },
  { label: "Relojes", href: "/buscar?q=reloj" },
];

/* ---------- SEO dinámico ---------- */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  if (!term) {
    return {
      title: "Buscar productos",
      description:
        "Buscá zapatillas, indumentaria y accesorios en el catálogo de PYNE ✦ Vintage & Selected Goods.",
      robots: { index: false, follow: true },
    };
  }

  const count = searchProducts(term).length;

  return {
    title: `Resultados para “${term}”`,
    description: `${count} ${count === 1 ? "resultado" : "resultados"} para “${term}” en PYNE ✦ Vintage & Selected Goods.`,
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, sort } = await searchParams;

  const term = (q ?? "").trim();
  const hasQuery = term.length > 0;

  const results = hasQuery ? sortProducts(searchProducts(term), sort) : [];
  const fallback = getFeaturedProducts(8);

  const base = `/buscar?q=${encodeURIComponent(term)}`;

  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow="PYNE ✦ Search"
        title={hasQuery ? `“${term}”` : "Buscar"}
        description={
          hasQuery
            ? `Resultados encontrados en zapatillas, indumentaria y accesorios.`
            : "Escribí lo que estás buscando: marca, modelo, categoría o condición."
        }
        count={hasQuery ? results.length : undefined}
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Buscar", href: "/buscar" },
        ]}
        sortOptions={
          hasQuery && results.length > 1
            ? SORTS.map((s) => ({
                label: s.label,
                href: s.value ? `${base}&sort=${s.value}` : base,
                active: (sort ?? "") === s.value,
              }))
            : []
        }
      />

      {/* Buscador */}
      <div className="mt-8 max-w-2xl">
        <SearchBar placeholder="Buscar zapatillas, marcas, prendas…" />
      </div>

      {/* Sugerencias */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-pyne-muted">
          Sugerencias
        </span>
        {SUGGESTED_TERMS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-full border border-pyne-border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-pyne-kraft transition hover:border-pyne-orange hover:text-pyne-orange"
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* Resultados */}
      <div className="mt-12">
        {!hasQuery ? (
          <>
            <EmptyState
              title="Empezá tu búsqueda"
              message="Usá el buscador de arriba o elegí una de las sugerencias para explorar el catálogo."
              ctaLabel="Ver zapatillas"
              ctaHref="/zapatillas"
            />

            <section className="mt-16 border-t border-pyne-border pt-12">
              <p className="pyne-eyebrow">Mientras tanto</p>
              <h2 className="mt-2 mb-8 font-display text-3xl uppercase text-pyne-cream">
                Productos destacados
              </h2>
              <ProductGrid products={fallback} />
            </section>
          </>
        ) : results.length === 0 ? (
          <>
            <EmptyState
              title={`Sin resultados para “${term}”`}
              message="Probá con otra palabra, revisá la ortografía o explorá las categorías del menú."
              ctaLabel="Ver catálogo completo"
              ctaHref="/zapatillas"
            />

            <section className="mt-16 border-t border-pyne-border pt-12">
              <p className="pyne-eyebrow">Quizás te interese</p>
              <h2 className="mt-2 mb-8 font-display text-3xl uppercase text-pyne-cream">
                Selección PYNE ✦
              </h2>
              <ProductGrid products={fallback} />
            </section>
          </>
        ) : (
          <>
            <p className="mb-6 text-xs uppercase tracking-[0.16em] text-pyne-muted">
              Mostrando{" "}
              <span className="text-pyne-orange">
                {results.length} {results.length === 1 ? "producto" : "productos"}
              </span>{" "}
              para “{term}”
            </p>
            <ProductGrid products={results} />
          </>
        )}
      </div>
    </div>
  );
}