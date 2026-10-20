import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";
import { searchProducts, sortProducts } from "@/lib/products";

interface PageProps {
  searchParams: Promise<{ q?: string; sort?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Búsqueda: "${q}"` : "Buscar productos",
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, sort } = await searchParams;
  const query = q || "";

  const rawProducts = query ? await searchProducts(query) : [];
  const products = sortProducts(rawProducts, sort);

  return (
    <div className="pyne-container py-10 lg:py-14">
      <h1 className="font-display text-3xl uppercase text-pyne-cream mb-6">
        {query ? `Resultados para "${query}"` : "Buscar en el catálogo"}
      </h1>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <p className="text-pyne-muted text-sm">
          {query ? "No se encontraron productos para tu búsqueda." : "Ingresá un término en el buscador."}
        </p>
      )}
    </div>
  );
}