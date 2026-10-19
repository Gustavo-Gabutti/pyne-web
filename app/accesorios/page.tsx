import type { Metadata } from "next";
import CollectionHeader from "@/components/CollectionHeader";
import ProductGrid from "@/components/ProductGrid";
import { ACCESSORY_SUBCATEGORIES } from "@/lib/navigation";
import { getAllProducts, sortProducts } from "@/lib/products";

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

export const metadata: Metadata = {
  title: "Accesorios — Relojes, Gorras & Complementos",
  description:
    "Relojes automáticos, gorras bordadas, mochilas utility y lentes retro. Accesorios de talla única seleccionados por PYNE ✦ con envíos a todo el país.",
  alternates: { canonical: "/accesorios" },
  openGraph: {
    title: "Accesorios | PYNE ✦",
    description: "Relojes, gorras, bolsos y lentes seleccionados. Talla única, carácter infinito.",
    type: "website",
  },
};

const SORTS = [
  { label: "Destacados", value: "" },
  { label: "Menor precio", value: "precio-asc" },
  { label: "Mayor precio", value: "precio-desc" },
  { label: "A-Z", value: "nombre" },
];

export default async function AccesoriosPage({ searchParams }: PageProps) {
  const { sort } = await searchParams;

  // Obtenemos los productos desde Sanity y filtramos accesorios
  const allProducts = await getAllProducts();
  const accessoriesList = allProducts.filter((p) => p.category === "accesorios");
  const products = sortProducts(accessoriesList, sort);

  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow="PYNE ✦ Accessories"
        title="Accesorios"
        description="Los detalles que terminan de armar el outfit. Relojes, gorras, bolsos y lentes — todos en talla única, listos para usar."
        count={products.length}
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Accesorios", href: "/accesorios" },
        ]}
        filters={[
          { label: "Todo", href: "/accesorios", active: true },
          ...ACCESSORY_SUBCATEGORIES.map((s) => ({
            label: s.label,
            href: `/accesorios/${s.slug}`,
          })),
        ]}
        sortOptions={SORTS.map((s) => ({
          label: s.label,
          href: s.value ? `/accesorios?sort=${s.value}` : "/accesorios",
          active: (sort ?? "") === s.value,
        }))}
      />

      {/* Aviso de talla única */}
      <div className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-pyne-orange/30 bg-pyne-orange/5 px-5 py-4">
        <span className="text-xl text-pyne-orange">✦</span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-pyne-cream">
            Talla Única
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-pyne-muted">
            Todos los accesorios son de talle universal — podés agregarlos al carrito directamente,
            sin seleccionar medida.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <ProductGrid
          products={products}
          emptyTitle="Sin accesorios disponibles"
          emptyMessage="Estamos sumando nuevas piezas a la selección. Volvé pronto."
        />
      </div>
    </div>
  );
}