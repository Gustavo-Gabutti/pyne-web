import raw from "@/data/products.json";
import type { Category, Product } from "./types";

const PRODUCTS = raw as Product[];

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id || p.slug === id);
}

export function getProductsByCategory(category: Category): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getProductsByBrand(brandSlug: string): Product[] {
  return PRODUCTS.filter(
    (p) => p.category === "zapatillas" && p.brandSlug === brandSlug.toLowerCase()
  );
}

export function getProductsBySubcategory(
  category: Category,
  subcategory: string
): Product[] {
  return PRODUCTS.filter(
    (p) => p.category === category && p.subcategory === subcategory.toLowerCase()
  );
}

export function getFeaturedProducts(limit = 8): Product[] {
  return PRODUCTS.filter((p) => p.featured).slice(0, limit);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category
  ).slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter((p) =>
    [p.name, p.brand, p.category, p.subcategoryLabel, p.condition, ...p.tags]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}

export function getBrandLabel(brandSlug: string): string {
  const found = PRODUCTS.find((p) => p.brandSlug === brandSlug.toLowerCase());
  return found ? found.brand : brandSlug;
}

export function getSubcategoryLabel(
  category: Category,
  subcategory: string
): string {
  const found = PRODUCTS.find(
    (p) => p.category === category && p.subcategory === subcategory.toLowerCase()
  );
  return found ? found.subcategoryLabel : subcategory;
}

/** Ordena por el parámetro `sort` de la URL */
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