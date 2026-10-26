import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionHeader from "@/components/CollectionHeader";
import SizeFilterGrid from "@/components/SizeFilterGrid";
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

/** Copys específicos por subcategoría de indumentaria (incluyendo bermudas) */
const SUBCATEGORY_COPY: Record<string, string> = {
  remeras: "Jersey de algodón heavyweight y lavado vintage. Corte boxy y estampas de archivo.",
  buzos: "Frisa perchada de alta densidad, capuchas dobles y moldería oversize.",
  camperas: "Denim rígido, camperas utility y piezas de archivo con desgaste natural.",
  pantalones: "Gabardina rip-stop, cargo pants y cortes relaxed con ajuste en tobillo.",
  bermudas: "Bermudas de jean, gabardina y cortes sueltos ideales para los días de calor sin perder estilo.",
  camisas: "Algodón Oxford, cuellos button-down y fits clásicos seleccionados.",
  shorts: "Shorts deportivos y urbanos de archivo con tramas y colores únicos.",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subcategory } = await params;
  const rawLabel = await getSubcategoryLabel("indumentaria", subcategory);
  const label = rawLabel || titleize(subcategory);
  const subcatProducts = await getProductsBySubcategory("indumentaria", subcategory);
  
  const description =
    SUBCATEGORY_COPY[subcategory] ??
    `${subcatProducts.length} ${label.toLowerCase()} de archivo y vintage en PYNE. Curaduría real y piezas únicas.`;

  return {
    title: `${label} — Indumentaria`,
    description,
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

  const description =
    SUBCATEGORY_COPY[subcategory] ??
    `Prendas seleccionadas una a una. ${label} vintage y de archivo con historial real.`;

  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow={`PYNE ✦ ${label}`}
        title={label}
        description={description}
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
      <SizeFilterGrid
        products={products}
        emptyTitle={`Sin stock de ${label.toLowerCase()}`}
        emptyMessage="Por el momento no tenemos prendas en esta subcategoría. Explorá el resto del catálogo."
      />
    </div>
  );
}