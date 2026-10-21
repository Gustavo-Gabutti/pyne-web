import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CollectionHeader from "@/components/CollectionHeader";
import ProductGrid from "@/components/ProductGrid";
import { CLOTHING_SUBCATEGORIES } from "@/lib/navigation";
import { getProductsBySubcategory, getSubcategoryLabel, sortProducts } from "@/lib/products";
import { titleize } from "@/lib/utils";

interface PageProps {
  params: Promise<{ subcategory: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export function generateStaticParams() {
  return CLOTHING_SUBCATEGORIES.map((s) => ({ subcategory: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subcategory } = await params;
  const rawLabel = await getSubcategoryLabel("indumentaria", subcategory);
  const label = rawLabel || titleize(subcategory);
  const subcatProducts = await getProductsBySubcategory("indumentaria", subcategory);

  return {
    title: `${label} — Indumentaria`,
    description: `${subcatProducts.length} ${label.toLowerCase()} de archivo y vintage en PYNE. Curaduría real y piezas únicas.`,
    alternates: { canonical: `/indumentaria/${subcategory}` },
  };
}

const SORTS = [
  { label: "Destacados", value: "" },
  { label: "Menor precio", value: "precio-asc" },
  { label: "Mayor precio", value: "precio-desc" },
  { label: "A-Z", value: "nombre" },
];

export default async function SubcategoryPage({ params, searchParams }: PageProps) {
  const { subcategory } = await params;
  const { sort } = await searchParams;

  const isKnownSubcategory = CLOTHING_SUBCATEGORIES.some((s) => s.slug === subcategory);
  if (!isKnownSubcategory) notFound();

  const rawLabel = await getSubcategoryLabel("indumentaria", subcategory);
  const label = rawLabel || titleize(subcategory);
  const rawProducts = await getProductsBySubcategory("indumentaria", subcategory);
  const products = sortProducts(rawProducts, sort);
  const base = `/indumentaria/${subcategory}`;

  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow={`PYNE ✦ ${label}`}
        title={label}
        description={`Prendas seleccionadas una a una. ${label} vintage y de archivo con historial real.`}
        count={products.length}
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Indumentaria", href: "/indumentaria" },
          { label, href: base },
        ]}
        filters={[
          { label: "Toda la ropa", href: "/indumentaria" },
          ...CLOTHING_SUBCATEGORIES.map((s) => ({
            label: s.label,
            href: `/indumentaria/${s.slug}`,
            active: s.slug === subcategory,
          })),
        ]}
        sortOptions={SORTS.map((s) => ({
          label: s.label,
          href: s.value ? `${base}?sort=${s.value}` : base,
          active: (sort ?? "") === s.value,
        }))}
      />

      <div className="mt-10">
        <ProductGrid
          products={products}
          emptyTitle={`Sin stock de ${label}`}
          emptyMessage="Por el momento no tenemos prendas en esta subcategoría. Explorá el resto del catálogo."
        />
      </div>
    </div>
  );
}