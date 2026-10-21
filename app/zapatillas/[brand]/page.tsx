import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionHeader from "@/components/CollectionHeader";
import ProductGrid from "@/components/ProductGrid";
import { SNEAKER_BRANDS } from "@/lib/navigation";
import {
  getBrandFacets,
  getProductsByBrand,
  mergeFacets,
  sortProducts,
} from "@/lib/products";

interface PageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ sort?: string }>;
}

const SORTS = [
  { label: "Destacados", value: "" },
  { label: "Menor precio", value: "precio-asc" },
  { label: "Mayor precio", value: "precio-desc" },
  { label: "A-Z", value: "nombre" },
];

/** Marcas fijas de navigation.ts + las que existan en Sanity. */
async function resolveBrand(brand: string) {
  const facets = mergeFacets(SNEAKER_BRANDS, await getBrandFacets());
  const current = facets.find((b) => b.slug === brand.toLowerCase());
  return { facets, current };
}

/* ---------- SEO dinámico ---------- */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand } = await params;
  const { current } = await resolveBrand(brand);

  if (!current) return { title: "Marca no encontrada" };

  const count = (await getProductsByBrand(brand)).length;

  return {
    title: `Zapatillas ${current.label}`,
    description: `${count} ${count === 1 ? "modelo" : "modelos"} de zapatillas ${current.label} seleccionados en PYNE. Deadstock, retros y vintage con talles US reales y envíos a todo el país.`,
    alternates: { canonical: `/zapatillas/${brand}` },
    openGraph: {
      title: `Zapatillas ${current.label} | PYNE ✦`,
      description: `Sneakers ${current.label} curadas por PYNE ✦ Vintage & Selected Goods.`,
    },
  };
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { brand } = await params;
  const { sort } = await searchParams;

  const { facets, current } = await resolveBrand(brand);
  if (!current) notFound();

  const products = sortProducts(await getProductsByBrand(brand), sort);
  const base = `/zapatillas/${current.slug}`;

  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow={`PYNE ✦ ${current.label}`}
        title={`Zapatillas ${current.label}`}
        description={`Nuestra selección de siluetas ${current.label}. Cada par es verificado por el equipo PYNE antes de salir a la venta.`}
        count={products.length}
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Zapatillas", href: "/zapatillas" },
          { label: current.label, href: base },
        ]}
        filters={[
          { label: "Todas", href: "/zapatillas" },
          ...facets.map((b) => ({
            label: b.label,
            href: `/zapatillas/${b.slug}`,
            active: b.slug === current.slug,
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
          emptyTitle={`Sin stock de ${current.label}`}
          emptyMessage="Por el momento no tenemos pares de esta marca. Mirá el resto del catálogo."
        />
      </div>
    </div>
  );
}