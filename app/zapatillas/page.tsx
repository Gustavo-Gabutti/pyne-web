import type { Metadata } from "next";
import CollectionHeader from "@/components/CollectionHeader";
import ProductGrid from "@/components/ProductGrid";
import { SNEAKER_BRANDS } from "@/lib/navigation";
import { getBrandFacets, getProductsByCategory, mergeFacets, sortProducts } from "@/lib/products";

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export const metadata: Metadata = {
  title: "Zapatillas — PYNE ✦",
  description: "Explorá nuestra selección completa de zapatillas deadstock, retros y de archivo. Curaduría real con envíos a todo el país.",
};

const SORTS = [
  { label: "Destacados", value: "" },
  { label: "Menor precio", value: "precio-asc" },
  { label: "Mayor precio", value: "precio-desc" },
  { label: "A-Z", value: "nombre" },
];

export default async function ZapatillasPage({ searchParams }: PageProps) {
  const { sort } = await searchParams;

  const facets = mergeFacets(SNEAKER_BRANDS, await getBrandFacets());
  const rawProducts = await getProductsByCategory("zapatillas");
  const products = sortProducts(rawProducts, sort);
  const base = "/zapatillas";

  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow="PYNE ✦ Catálogo"
        title="Zapatillas"
        description="Siluetas icónicas seleccionadas una a una. Deadstock, retros y pares de archivo verificados."
        count={products.length}
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Zapatillas", href: base },
        ]}
        filters={[
          { label: "Todas", href: "/zapatillas", active: true },
          ...facets.map((b) => ({
            label: b.label,
            href: `/zapatillas/${b.slug}`,
            active: false,
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
          emptyTitle="Sin stock de zapatillas"
          emptyMessage="Por el momento no hay zapatillas cargadas en el catálogo."
        />
      </div>
    </div>
  );
}