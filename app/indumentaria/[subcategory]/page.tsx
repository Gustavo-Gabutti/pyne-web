import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionHeader from "@/components/CollectionHeader";
import ProductGrid from "@/components/ProductGrid";
import { CLOTHING_SUBCATEGORIES, STANDARD_SIZES } from "@/lib/navigation";
import { getProductsBySubcategory, sortProducts } from "@/lib/products";
import { titleize } from "@/lib/utils";

interface PageProps {
  params: Promise<{ subcategory: string }>;
  searchParams: Promise<{ sort?: string }>;
}

const SORTS = [
  { label: "Destacados", value: "" },
  { label: "Menor precio", value: "precio-asc" },
  { label: "Mayor precio", value: "precio-desc" },
  { label: "A-Z", value: "nombre" },
];

/* ---------- SSG ---------- */
export function generateStaticParams() {
  return CLOTHING_SUBCATEGORIES.map((s) => ({ subcategory: s.slug }));
}

/* ---------- SEO dinámico ---------- */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subcategory } = await params;

  const found = CLOTHING_SUBCATEGORIES.find((s) => s.slug === subcategory);
  const label = found?.label ?? titleize(subcategory);
  const count = getProductsBySubcategory("indumentaria", subcategory).length;

  const description = `${count} ${count === 1 ? "prenda" : "prendas"} en la categoría ${label}. Indumentaria vintage y streetwear seleccionada por PYNE ✦ con talles XS a XXL y envíos a todo el país.`;

  return {
    title: `${label} — Indumentaria`,
    description,
    alternates: { canonical: `/indumentaria/${subcategory}` },
    openGraph: {
      title: `${label} | PYNE ✦`,
      description,
      type: "website",
    },
  };
}

export default async function ClothingSubcategoryPage({ params, searchParams }: PageProps) {
  const { subcategory } = await params;
  const { sort } = await searchParams;

  const found = CLOTHING_SUBCATEGORIES.find((s) => s.slug === subcategory);
  if (!found) notFound();

  const label = found.label;
  const products = sortProducts(getProductsBySubcategory("indumentaria", subcategory), sort);
  const base = `/indumentaria/${subcategory}`;

  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow={`PYNE ✦ ${label}`}
        title={label}
        description={`Nuestra selección de ${label.toLowerCase()}. Piezas elegidas por calidad de tela, corte y carácter. Talles estándar con fit real.`}
        count={products.length}
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Indumentaria", href: "/indumentaria" },
          { label, href: base },
        ]}
        filters={[
          { label: "Todo", href: "/indumentaria" },
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

      {/* Banda informativa de talles */}
      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-pyne-border bg-pyne-smoke/40 px-5 py-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-pyne-muted">
          Talles estándar
        </span>
        <div className="flex flex-wrap gap-1.5">
          {STANDARD_SIZES.map((size) => (
            <span
              key={size}
              className="rounded border border-pyne-border px-2.5 py-1 text-[11px] font-semibold text-pyne-cream"
            >
              {size}
            </span>
          ))}
        </div>
        <span className="ml-auto text-[11px] text-pyne-muted">
          La disponibilidad varía según cada prenda ✦
        </span>
      </div>

      <div className="mt-10">
        <ProductGrid
          products={products}
          emptyTitle={`Sin stock de ${label.toLowerCase()}`}
          emptyMessage="Por ahora no tenemos piezas en esta categoría. Explorá el resto de la indumentaria."
        />
      </div>
    </div>
  );
}