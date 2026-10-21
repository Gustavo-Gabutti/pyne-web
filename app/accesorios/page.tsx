import type { Metadata } from "next";
import CollectionHeader from "@/components/CollectionHeader";
import ProductGrid from "@/components/ProductGrid";
import { SNEAKER_BRANDS } from "@/lib/navigation";
import {
  getBrandFacets,
  getProductsByCategory,
  mergeFacets,
  sortProducts,
} from "@/lib/products";

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export const metadata: Metadata = {
  title: "Zapatillas Deadstock, Retro & Vintage",
  description:
    "Sneakers deadstock, retros y pares de archivo con talles US reales y envíos a todo el país. Selección curada por PYNE ✦.",
  alternates: { canonical: "/zapatillas" },
};

const SORTS = [
  { label: "Destacados", value: "" },
  { label: "Menor precio", value: "precio-asc" },
  { label: "Mayor precio", value: "precio-desc" },
  { label: "A-Z", value: "nombre" },
];

export default async function ZapatillasPage({ searchParams }: PageProps) {
  const { sort } = await searchParams;

  const [list, dynamicBrands] = await Promise.all([
    getProductsByCategory("zapatillas"),
    getBrandFacets(),
  ]);

  const brands = mergeFacets(SNEAKER_BRANDS, dynamicBrands);
  const products = sortProducts(list, sort);

  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow="PYNE ✦ Footwear"
        title="Zapatillas"
        description="Deadstock, retros y pares de archivo. Cada par es verificado por el equipo PYNE antes de salir a la venta."
        count={products.length}
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Zapatillas", href: "/zapatillas" },
        ]}
        filters={[
          { label: "Todas", href: "/zapatillas", active: true },
          ...brands.map((b) => ({
            label: b.label,
            href: `/zapatillas/${b.slug}`,
          })),
        ]}
        sortOptions={SORTS.map((s) => ({
          label: s.label,
          href: s.value ? `/zapatillas?sort=${s.value}` : "/zapatillas",
          active: (sort ?? "") === s.value,
        }))}
      />

      <div className="mt-10">
        <ProductGrid
          products={products}
          emptyTitle="Sin zapatillas disponibles"
          emptyMessage="Estamos preparando el próximo drop de pares."
        />
      </div>
    </div>
  );
}