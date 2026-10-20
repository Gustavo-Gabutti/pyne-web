import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { getBrandLabel, getProductsByBrand, sortProducts } from "@/lib/products";

interface PageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand } = await params;
  const label = await getBrandLabel(brand);
  return {
    title: `Zapatillas ${label}`,
    description: `Catálogo de zapatillas ${label} en PYNE.`,
  };
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { brand } = await params;
  const { sort } = await searchParams;

  const rawProducts = await getProductsByBrand(brand);
  const brandLabel = await getBrandLabel(brand);

  if (!rawProducts || rawProducts.length === 0) {
    notFound();
  }

  const products = sortProducts(rawProducts, sort);

  return (
    <div className="pyne-container py-10 lg:py-14">
      <nav className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-pyne-muted">
        <Link href="/" className="hover:text-pyne-orange transition">Inicio</Link>
        <span>/</span>
        <Link href="/zapatillas" className="hover:text-pyne-orange transition">Zapatillas</Link>
        <span>/</span>
        <span className="text-pyne-cream">{brandLabel}</span>
      </nav>

      <h1 className="font-display text-4xl uppercase text-pyne-cream mb-8">{brandLabel}</h1>
      <ProductGrid products={products} />
    </div>
  );
}