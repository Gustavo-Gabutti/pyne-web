import type { Metadata } from "next";
import CollectionHeader from "@/components/CollectionHeader";
import ProductGrid from "@/components/ProductGrid";
import { CLOTHING_SUBCATEGORIES, STANDARD_SIZES } from "@/lib/navigation";
import { getProductsByCategory, sortProducts } from "@/lib/products";

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export const metadata: Metadata = {
  title: "Indumentaria Vintage & Streetwear",
  description:
    "Remeras, hoodies, camperas y denim de archivo. Talles XS a XXL. Indumentaria seleccionada por PYNE ✦ con envíos a todo el país.",
  alternates: { canonical: "/indumentaria" },
};

const SORTS = [
  { label: "Destacados", value: "" },
  { label: "Menor precio", value: "precio-asc" },
  { label: "Mayor precio", value: "precio-desc" },
  { label: "A-Z", value: "nombre" },
];

export default async function IndumentariaPage({ searchParams }: PageProps) {
  const { sort } = await searchParams;

  const products = sortProducts(getProductsByCategory("indumentaria"), sort);

  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow="PYNE ✦ Apparel"
        title="Indumentaria"
        description="Prendas con carácter: heavyweight, vintage de archivo y básicos bien hechos. Talles estándar XS a XXL."
        count={products.length}
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Indumentaria", href: "/indumentaria" },
        ]}
        filters={[
          { label: "Todo", href: "/indumentaria", active: true },
          ...CLOTHING_SUBCATEGORIES.map((s) => ({
            label: s.label,
            href: `/indumentaria/${s.slug}`,
          })),
        ]}
        sortOptions={SORTS.map((s) => ({
          label: s.label,
          href: s.value ? `/indumentaria?sort=${s.value}` : "/indumentaria",
          active: (sort ?? "") === s.value,
        }))}
      />

      {/* Info de talles */}
      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-pyne-border bg-pyne-smoke/40 px-5 py-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-pyne-muted">
          Talles disponibles
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
      </div>

      <div className="mt-10">
        <ProductGrid
          products={products}
          emptyTitle="Sin indumentaria disponible"
          emptyMessage="Estamos preparando el próximo drop de prendas."
        />
      </div>
    </div>
  );
}