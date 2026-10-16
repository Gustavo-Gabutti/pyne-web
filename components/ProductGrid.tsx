import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import EmptyState from "./EmptyState";

interface ProductGridProps {
  products: Product[];
  emptyTitle?: string;
  emptyMessage?: string;
}

export default function ProductGrid({
  products,
  emptyTitle = "No encontramos productos",
  emptyMessage = "Probá con otra categoría o revisá nuestra selección destacada.",
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}