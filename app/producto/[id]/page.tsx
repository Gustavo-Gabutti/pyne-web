import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ProductGrid from "@/components/ProductGrid";
import { getAllProducts, getProductById, getRelatedProducts } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

/* ---------- SSG ---------- */
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ id: p.id }));
}

/* ---------- SEO dinámico ---------- */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const title = `${product.brand} ${product.name}`;
  const description = `${product.description.slice(0, 150)} — ${formatPrice(product.price)} en PYNE ✦ Vintage & Selected Goods.`;

  return {
    title,
    description,
    alternates: { canonical: `/producto/${product.id}` },
    openGraph: {
      type: "website",
      title: `${title} | PYNE ✦`,
      description,
      images: [{ url: product.image, width: 1000, height: 1000, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);

  const categoryHref = `/${product.category}`;
  const subHref =
    product.category === "zapatillas"
      ? `/zapatillas/${product.brandSlug}`
      : `/${product.category}/${product.subcategory}`;

  return (
    <div className="pyne-container py-10 lg:py-14">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-pyne-muted"
      >
        <Link href="/" className="transition hover:text-pyne-orange">
          Inicio
        </Link>
        <span className="text-pyne-border">/</span>
        <Link href={categoryHref} className="capitalize transition hover:text-pyne-orange">
          {product.category}
        </Link>
        <span className="text-pyne-border">/</span>
        <Link href={subHref} className="transition hover:text-pyne-orange">
          {product.category === "zapatillas" ? product.brand : product.subcategoryLabel}
        </Link>
        <span className="text-pyne-border">/</span>
        <span className="text-pyne-cream">{product.name}</span>
      </nav>

      {/* Detalle (Client Component) */}
      <ProductDetail product={product} />

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="mt-24 border-t border-pyne-border pt-14">
          <p className="pyne-eyebrow">También te puede interesar</p>
          <h2 className="mt-2 mb-8 font-display text-3xl uppercase text-pyne-cream">
            Productos relacionados
          </h2>
          <ProductGrid products={related} />
        </section>
      )}

      {/* JSON-LD para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: `${product.brand} ${product.name}`,
            image: product.images,
            description: product.description,
            brand: { "@type": "Brand", name: product.brand },
            sku: product.id,
            offers: {
              "@type": "Offer",
              priceCurrency: "ARS",
              price: product.price,
              availability:
                product.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />
    </div>
  );
}