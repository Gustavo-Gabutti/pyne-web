import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { getProductsBySubcategory, sortProducts } from "@/lib/products";

interface PageProps {
  params: Promise<{ subcategory: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subcategory } = await params;
  return {
    title: `Indumentaria — ${subcategory}`,
  };
}

export default async function SubcategoryPage({ params, searchParams }: PageProps) {
  const { subcategory } = await params;
  const { sort } = await searchParams;

  const rawProducts = await getProductsBySubcategory("indumentaria", subcategory);

  if (!rawProducts || rawProducts.length === 0) {
    notFound();
  }

  const products = sortProducts(rawProducts, sort);

  return (
    <div className="pyne-container py-10 lg:py-14">
      <nav className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-pyne-muted">
        <Link href="/" className="hover:text-pyne-orange transition">Inicio</Link>
        <span>/</span>
        <Link href="/indumentaria" className="hover:text-pyne-orange transition">Indumentaria</Link>
        <span>/</span>
        <span className="text-pyne-cream capitalize">{subcategory}</span>
      </nav>

      <h1 className="font-display text-4xl uppercase text-pyne-cream mb-8 capitalize">{subcategory}</h1>
      <ProductGrid products={products} />
    </div>
  );
}