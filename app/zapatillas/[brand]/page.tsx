import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionHeader from "@/components/CollectionHeader";
import ProductGrid from "@/components/ProductGrid";
import { SNEAKER_BRANDS } from "@/lib/navigation";
import { getBrandLabel, getProductsByBrand, sortProducts } from "@/lib/products";
import { titleize } from "@/lib/utils";

interface PageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export function generateStaticParams() {
  return SNEAKER_BRANDS.map((b) => ({ brand: b.slug }));
}

/* ---------- SEO dinámico ---------- */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand } = await params;
  const label = getBrandLabel(brand) || titleize(brand);
  const count = getProductsByBrand(brand).length;

  return {
    title: `Zapatillas ${label}`,
    description: `${count} modelos de zapatillas ${label} seleccionados en PYNE. Deadstock, retros y vintage con talles US reales y envíos a todo el país.`,
    alternates: { canonical: `/zapatillas/${brand}` },
    openGraph: {
      title: `Zapatillas ${label} | PYNE ✦`,
      description: `Sneakers ${label} curadas por PYNE ✦ Vintage & Selected Goods.`,
    },
  };
}

const SORTS = [
  { label: "Destacados", value: "" },
  { label: "Menor precio", value: "precio-asc" },
  { label: "Mayor precio", value: "precio-desc" },
  { label: "A-Z", value: "nombre" },
];

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { brand } = await params;
  const { sort } = await searchParams;

  const isKnownBrand = SNEAKER_BRANDS.some((b) => b.slug === brand);
  if (!isKnownBrand) notFound();

  const label = getBrandLabel(brand) || titleize(brand);
  const products = sortProducts(getProductsByBrand(brand), sort);

  const base = `/zapatillas/${brand}`;

  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow={`PYNE ✦ ${label}`}
        title={`Zapatillas ${label}`}
        description={`Nuestra selección de siluetas ${label}. Cada par es verificado por el equipo PYNE antes de salir a la venta.`}
        count={products.length}
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Zapatillas", href: "/zapatillas" },
          { label, href: base },
        ]}
        filters={[
          { label: "Todas", href: "/zapatillas" },
          ...SNEAKER_BRANDS.map((b) => ({
            label: b.label,
            href: `/zapatillas/${b.slug}`,
            active: b.slug === brand,
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
          emptyMessage="Por el momento no tenemos pares de esta marca. Mirá el resto del catálogo."
        />
      </div>
    </div>
  );
}