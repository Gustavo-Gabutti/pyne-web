import { client, urlFor } from "./sanity";
import raw from "@/data/products.json";
import type { Category, Product } from "./types";

const LOCAL_PRODUCTS = raw as Product[];

export async function getAllProducts(): Promise<Product[]> {
  try {
    const query = `*[_type == "product"]{
      "id": _id,
      "slug": slug.current,
      name,
      brand,
      brandSlug,
      category,
      subcategory,
      subcategoryLabel,
      price,
      compareAtPrice,
      description,
      image,
      images,
      sizeType,
      sizes,
      condition,
      stock,
      featured,
      tags
    }`;
    const sanityProducts = await client.fetch(query);
    if (Array.isArray(sanityProducts) && sanityProducts.length > 0) {
      return sanityProducts.map((p: any) => ({
        ...p,
        image: p.image ? urlFor(p.image).url() : "",
        images: p.images ? p.images.map((img: any) => urlFor(img).url()) : [],
      }));
    }
  } catch (err) {
    console.warn("Utilizando productos locales como respaldo:", err);
  }
  return LOCAL_PRODUCTS;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.featured).slice(0, limit);
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
    (p) => p.category === category && p.subcategory === subcategory.toLowerCase()
  );
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getAllProducts();
  return products.find((p) => p.id === id || p.slug === id || (p as any)._id === id);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter(
    (p) => p.id !== product.id && p.category === product.category
  ).slice(0, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = await getAllProducts();
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter((p) =>
    [p.name, p.brand, p.category, p.subcategoryLabel, p.condition, ...(p.tags || [])]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}

export async function getBrandLabel(brandSlug: string): Promise<string> {
  const products = await getAllProducts();
  const found = products.find((p) => p.brandSlug === brandSlug.toLowerCase());
  return found ? found.brand : brandSlug;
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