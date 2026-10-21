import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionHeader from "@/components/CollectionHeader";
import ProductGrid from "@/components/ProductGrid";
import { ACCESSORY_SUBCATEGORIES } from "@/lib/navigation";
import {
  getProductsBySubcategory,
  getSubcategoryFacets,
  mergeFacets,
  sortProducts,
} from "@/lib/products";

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

/** Copys específicos por subcategoría */
const SUBCATEGORY_COPY: Record<string, string> = {
  relojes:
    "Movimientos automáticos y quartz seleccionados. Cajas de acero, cristales resistentes y correas intercambiables.",
  gorras:
    "Snapbacks, truckers y dad hats. Bordados 3D, cierres regulables y materiales que aguantan el uso diario.",
  bolsos:
    "Mochilas y bolsos utility en Cordura y lona resistente. Compartimentos pensados para el día a día.",
  lentes:
    "Armazones de acetato y metal con lentes polarizadas UV400. Estuche rígido y paño incluidos.",
  cinturones:
    "Cuero genuino y webbing táctico. Hebillas metálicas mate con acabado vintage.",
};

/** Subcategorías fijas de navigation.ts + las que existan en Sanity. */
async function resolveSubcategory(subcategory: string) {
  const facets = mergeFacets(
    ACCESSORY_SUBCATEGORIES,
    await getSubcategoryFacets("accesorios")
  );
  const current = facets.find((s) => s.slug === subcategory.toLowerCase());
  return { facets, current };
}

/* ---------- SEO dinámico ---------- */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subcategory } = await params;
  const { current } = await resolveSubcategory(subcategory);

  if (!current) return { title: "Categoría no encontrada" };

  const count = (await getProductsBySubcategory("accesorios", subcategory)).length;

  const description =
    SUBCATEGORY_COPY[subcategory] ??
    `${count} ${count === 1 ? "producto" : "productos"} en la categoría ${current.label}. Accesorios de talla única seleccionados por PYNE ✦.`;

  return {
    title: `${current.label} — Accesorios`,
    description,
    alternates: { canonical: `/accesorios/${subcategory}` },
    openGraph: {
      title: `${current.label} | PYNE ✦`,
      description,
      type: "website",
    },
  };
}

export default async function AccessorySubcategoryPage({ params, searchParams }: PageProps) {
  const { subcategory } = await params;
  const { sort } = await searchParams;

  const { facets, current } = await resolveSubcategory(subcategory);
  if (!current) notFound();

  const label = current.label;
  const products = sortProducts(
    await getProductsBySubcategory("accesorios", subcategory),
    sort
  );
  const base = `/accesorios/${current.slug}`;

  const description =
    SUBCATEGORY_COPY[current.slug] ??
    `Nuestra selección de ${label.toLowerCase()}. Piezas de talla única, elegidas por calidad y diseño.`;

  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow={`PYNE ✦ ${label}`}
        title={label}
        description={description}
        count={products.length}
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Accesorios", href: "/accesorios" },
          { label, href: base },
        ]}
        filters={[
          { label: "Todo", href: "/accesorios" },
          ...facets.map((s) => ({
            label: s.label,
            href: `/accesorios/${s.slug}`,
            active: s.slug === current.slug,
          })),
        ]}
        sortOptions={SORTS.map((s) => ({
          label: s.label,
          href: s.value ? `${base}?sort=${s.value}` : base,
          active: (sort ?? "") === s.value,
        }))}
      />

      {/* Aviso de talla única */}
      <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-pyne-orange/30 bg-pyne-orange/5 px-5 py-2.5">
        <span className="text-pyne-orange">✦</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pyne-cream">
          Talla única — sin selección de medida
        </span>
      </div>

      <div className="mt-10">
        <ProductGrid
          products={products}
          emptyTitle={`Sin stock de ${label.toLowerCase()}`}
          emptyMessage="Por el momento no tenemos piezas en esta categoría. Mirá el resto de los accesorios."
        />
      </div>
    </div>
  );
}