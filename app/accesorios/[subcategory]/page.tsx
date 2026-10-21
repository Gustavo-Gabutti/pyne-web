import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CollectionHeader from "@/components/CollectionHeader";
import ProductGrid from "@/components/ProductGrid";
import { ACCESSORY_SUBCATEGORIES } from "@/lib/navigation";
import { getProductsBySubcategory, getSubcategoryLabel, sortProducts } from "@/lib/products";
import { titleize } from "@/lib/utils";

interface PageProps {
  params: Promise<{ subcategory: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export function generateStaticParams() {
  return ACCESSORY_SUBCATEGORIES.map((s) => ({ subcategory: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subcategory } = await params;
  const rawLabel = await getSubcategoryLabel("accesorios", subcategory);
  const label = rawLabel || titleize(subcategory);
  const subcatProducts = await getProductsBySubcategory("accesorios", subcategory);

  return {
    title: `${label} — Accesorios`,
    description: `${subcatProducts.length} ${label.toLowerCase()} seleccionados en PYNE. Piezas únicas y complementos de archivo.`,
    alternates: { canonical: `/accesorios/${subcategory}` },
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

  const isKnownSubcategory = ACCESSORY_SUBCATEGORIES.some((s) => s.slug === subcategory);
  if (!isKnownSubcategory) notFound();

  const rawLabel = await getSubcategoryLabel("accesorios", subcategory);
  const label = rawLabel || titleize(subcategory);
  const rawProducts = await getProductsBySubcategory("accesorios", subcategory);
  const products = sortProducts(rawProducts, sort);
  const base = `/accesorios/${subcategory}`;

  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow={`PYNE ✦ ${label}`}
        title={label}
        description={`Accesorios y complementos elegidos por su diseño y estado. ${label} de archivo.`}
        count={products.length}
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Accesorios", href: "/accesorios" },
          { label, href: base },
        ]}
        filters={[
          { label: "Todos", href: "/accesorios" },
          ...ACCESSORY_SUBCATEGORIES.map((s) => ({
            label: s.label,
            href: `/accesorios/${s.slug}`,
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
          emptyMessage="Por el momento no tenemos productos en esta subcategoría. Explorá otras opciones."
        />
      </div>
    </div>
  );
}