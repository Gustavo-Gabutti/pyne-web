import type { Metadata } from "next";
import CollectionHeader from "@/components/CollectionHeader";
import ProductGrid from "@/components/ProductGrid";
import { ACCESSORY_SUBCATEGORIES, ROUTES } from "@/lib/navigation";
import {
  getProductsByCategory,
  getSubcategoryFacets,
  mergeFacets,
  sortProducts,
} from "@/lib/products";


interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}


export const metadata: Metadata = {
  title: "Accesorios Vintage & Streetwear",
  description:
    "Relojes, gorras, bolsos, lentes y cinturones seleccionados por PYNE ✦ con envíos a todo el país.",
  alternates: { canonical: ROUTES.accesorios },
};


const SORTS = [
  { label: "Destacados", value: "" },
  { label: "Menor precio", value: "precio-asc" },
  { label: "Mayor precio", value: "precio-desc" },
  { label: "A-Z", value: "nombre" },
];


export default async function AccesoriosPage({ searchParams }: PageProps) {
  const { sort } = await searchParams;


  // Todos los productos de la categoría accesorios (sin filtrar por subcategoría)
  const [list, dynamicSubs] = await Promise.all([
    getProductsByCategory("accesorios"),
    getSubcategoryFacets("accesorios"),
  ]);


  const subcategories = mergeFacets(ACCESSORY_SUBCATEGORIES, dynamicSubs);
  const products = sortProducts(list, sort);


  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow="PYNE ✦ Accessories"
        title="Accesorios"
        description="Relojes, gorras y complementos elegidos uno por uno. Piezas de talla única, seleccionadas por calidad y diseño."
        count={products.length}
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Accesorios", href: ROUTES.accesorios },
        ]}
        filters={[
          { label: "Todo", href: ROUTES.accesorios, active: true },
          ...subcategories.map((s) => ({
            label: s.label,
            href: `${ROUTES.accesorios}/${s.slug}`,
          })),
        ]}
        sortOptions={SORTS.map((s) => ({
          label: s.label,
          href: s.value ? `${ROUTES.accesorios}?sort=${s.value}` : ROUTES.accesorios,
          active: (sort ?? "") === s.value,
        }))}
      />


      <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-pyne-orange/30 bg-pyne-orange/5 px-5 py-2.5">
        <span className="text-pyne-orange">✦</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pyne-cream">
          Talla única — sin selección de medida
        </span>
      </div>


      <div className="mt-10">
        <ProductGrid
          products={products}
          emptyTitle="Sin accesorios disponibles"
          emptyMessage="Estamos preparando el próximo drop de accesorios."
        />
      </div>
    </div>
  );
}