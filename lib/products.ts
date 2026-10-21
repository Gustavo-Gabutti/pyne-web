import raw from "@/data/products.json";
import { client, urlFor } from "@/lib/sanity";
import { slugify } from "@/lib/utils";
import type { Category, Product, SizeType } from "./types";

const LOCAL_PRODUCTS = raw as Product[];

// Consulta GROQ para traer todos los productos desde Sanity
const ALL_PRODUCTS_QUERY = `*[_type == "product"] | order(_createdAt desc) {
  _id,
  name,
  "slug": slug.current,
  brand,
  "category": category->slug.current,
  subcategory,
  price,
  originalPrice,
  mainImage,
  images,
  sizes,
  description,
  isFeatured,
  stock,
  condition,
  sizeType,
  tags
}`;

/** Mapea y normaliza los productos traídos desde Sanity */
function mapSanityProduct(p: any): Product {
  const brandName = p.brand || "PYNE";
  const cat = (p.category || "zapatillas") as Category;
  const subcat = p.subcategory || (cat === "zapatillas" ? slugify(brandName) : "general");
  
  let st: SizeType = p.sizeType || "standard";
  if (cat === "zapatillas") st = "numeric";
  else if (cat === "accesorios") st = "unique";

  const mainImg = p.mainImage ? urlFor(p.mainImage).url() : "/logo.jpg";
  const extraImgs = Array.isArray(p.images) && p.images.length > 0
    ? p.images.map((img: any) => urlFor(img).url())
    : [mainImg];

  return {
    id: p._id,
    slug: p.slug || slugify(p.name || "producto"),
    name: p.name || "Producto sin nombre",
    brand: brandName,
    brandSlug: slugify(brandName),
    category: cat,
    subcategory: subcat,
    subcategoryLabel: p.subcategory || brandName,
    price: p.price || 0,
    compareAtPrice: p.originalPrice || null,
    description: p.description || "",
    image: mainImg,
    images: extraImgs,
    sizeType: st,
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    condition: p.condition || "Nuevo",
    stock: p.stock ?? 1,
    featured: Boolean(p.isFeatured),
    tags: Array.isArray(p.tags) ? p.tags : [],
  };
}

export async function getAllProducts(): Promise<Product[]> {
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    try {
      const sanityItems = await client.fetch(ALL_PRODUCTS_QUERY, {}, { next: { revalidate: 10 } });
      if (Array.isArray(sanityItems) && sanityItems.length > 0) {
        return sanityItems.map(mapSanityProduct);
      }
    } catch (err) {
      console.warn("No se pudo conectar a Sanity, usando catálogo local de respaldo:", err);
    }
  }
  return LOCAL_PRODUCTS;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getAllProducts();
  return products.find((p) => p.id === id || p.slug === id);
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.category === category);
}

export async function getProductsByBrand(brandSlug: string): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter(
    (p) => p.category === "zapatillas" && p.brandSlug === brandSlug.toLowerCase()
  );
}

export async function getProductsBySubcategory(
  category: Category,
  subcategory: string
): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter(
    (p) => p.category === category && p.subcategory.toLowerCase() === subcategory.toLowerCase()
  );
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.featured).slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await getAllProducts();
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const products = await getAllProducts();
  return products.filter((p) =>
    [p.name, p.brand, p.category, p.subcategoryLabel, p.condition, ...p.tags]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}

export function getBrandLabel(brandSlug: string): string {
  const found = LOCAL_PRODUCTS.find((p) => p.brandSlug === brandSlug.toLowerCase());
  return found ? found.brand : brandSlug;
}

export function getSubcategoryLabel(category: Category, subcategory: string): string {
  const found = LOCAL_PRODUCTS.find(
    (p) => p.category === category && p.subcategory === subcategory.toLowerCase()
  );
  return found ? found.subcategoryLabel : subcategory;
}

export function sortProducts(products: Product[], sort?: string): Product[] {
  const list = [...products];
  switch (sort) {
    case "precio-asc":
      return list.sort((a, b) => a.price - b.price);
    case "precio-desc":
      return list.sort((a, b) => b.price - a.price);
    case "nombre":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return list.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}