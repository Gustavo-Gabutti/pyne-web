import type { Metadata } from "next";
import CollectionHeader from "@/components/CollectionHeader";
import ProductGrid from "@/components/ProductGrid";
import { SNEAKER_BRANDS } from "@/lib/navigation";
import { getProductsByCategory, sortProducts } from "@/lib/products";

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export const metadata: Metadata = {
  title: "Zapatillas — Deadstock, Retro & Vintage",
  description:
    "Sneakers seleccionadas en PYNE: Nike, Adidas, Jordan, New Balance, Vans y más. Talles US reales, guía de medidas y envíos a todo el país.",
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

  const products = sortProducts(getProductsByCategory("zapatillas"), sort);

  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow="PYNE ✦ Footwear"
        title="Zapatillas"
        description="Pares curados uno por uno: deadstock, retros y siluetas de archivo. Todos los talles en escala US con guía de equivalencias."
        count={products.length}
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Zapatillas", href: "/zapatillas" },
        ]}
        filters={[
          { label: "Todas", href: "/zapatillas", active: true },
          ...SNEAKER_BRANDS.map((b) => ({
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
          emptyMessage="Estamos reponiendo stock. Volvé en unos días."
        />
      </div>
    </div>
  );
}