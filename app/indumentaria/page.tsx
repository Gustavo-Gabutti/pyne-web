import type { Metadata } from "next";
import CollectionHeader from "@/components/CollectionHeader";
import SizeFilterGrid from "@/components/SizeFilterGrid";
import { CLOTHING_SUBCATEGORIES } from "@/lib/navigation";
import { getAllProducts, sortProducts } from "@/lib/products";


interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}


export const metadata: Metadata = {
  title: "Indumentaria Vintage & Streetwear",
  description:
    "Remeras, hoodies, camperas y denim de archivo. Talles XS a XXL y pantalones del 26 al 42. Indumentaria seleccionada por PYNE ✦ con envíos a todo el país.",
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


  // Obtenemos los productos desde Sanity y filtramos indumentaria
  const allProducts = await getAllProducts();
  const clothingList = allProducts.filter((p) => p.category === "indumentaria");
  const products = sortProducts(clothingList, sort);


  return (
    <div className="pyne-container py-10 lg:py-14">
      <CollectionHeader
        eyebrow="PYNE ✦ Apparel"
        title="Indumentaria"
        description="Prendas con carácter: heavyweight, vintage de archivo y básicos bien hechos. Talles XS a XXL y pantalones del 26 al 42."
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


      <SizeFilterGrid
        products={products}
        emptyTitle="Sin indumentaria disponible"
        emptyMessage="Estamos preparando el próximo drop de prendas."
      />
    </div>
  );
}