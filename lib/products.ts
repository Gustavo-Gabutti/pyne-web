import { cache } from "react";
import raw from "@/data/products.json";
import { client, projectId } from "./sanity";
import type { Category, Product, SizeType } from "./types";
import { slugify, titleize } from "./utils";

/* ------------------------------------------------------------------ */
/*  Configuración                                                      */
/* ------------------------------------------------------------------ */

/** Respaldo local: solo se usa si Sanity no está configurado o falla. */
const LOCAL_PRODUCTS = raw as Product[];

/** Cada cuántos segundos se vuelve a pedir el catálogo a Sanity. */
const REVALIDATE_SECONDS = 60;

const FALLBACK_IMAGE = "/logo.jpg";

const CONDITIONS: Product["condition"][] = [
  "Nuevo",
  "Deadstock",
  "Usado - 9/10",
  "Usado - 8/10",
  "Vintage",
];

const SIZE_TYPES: SizeType[] = ["numeric", "standard", "unique"];

const DEFAULT_SIZE_TYPE: Record<Category, SizeType> = {
  zapatillas: "numeric",
  indumentaria: "standard",
  accesorios: "unique",
};

/* ------------------------------------------------------------------ */
/*  Consulta GROQ                                                      */
/*  Acepta nombres de campo en inglés o en español (coalesce).         */
/* ------------------------------------------------------------------ */

const PRODUCTS_QUERY = `*[_type in ["product", "producto"] && !(_id in path("drafts.**"))] | order(_createdAt desc) {
  _id,
  "slug": coalesce(slug.current, slug),
  "name": coalesce(name, title, nombre),
  "brand": coalesce(brand, marca),
  "category": coalesce(category, categoria),
  "subcategory": coalesce(subcategory, subcategoria),
  "price": coalesce(price, precio),
  "compareAtPrice": coalesce(compareAtPrice, precioAnterior, precioOriginal),
  "description": coalesce(description, descripcion),
  "sizeType": sizeType,
  "sizes": coalesce(sizes, talles),
  "condition": coalesce(condition, condicion, estado),
  "stock": stock,
  "featured": coalesce(featured, destacado, false),
  "tags": tags,
  "mainImage": coalesce(image.asset->url, mainImage.asset->url, imagen.asset->url),
  "gallery": coalesce(images[].asset->url, gallery[].asset->url, imagenes[].asset->url)
}`;

interface RawProduct {
  _id: string;
  slug?: unknown;
  name?: unknown;
  brand?: unknown;
  category?: unknown;
  subcategory?: unknown;
  price?: unknown;
  compareAtPrice?: unknown;
  description?: unknown;
  sizeType?: unknown;
  sizes?: unknown;
  condition?: unknown;
  stock?: unknown;
  featured?: unknown;
  tags?: unknown;
  mainImage?: unknown;
  gallery?: unknown;
}

/* ------------------------------------------------------------------ */
/*  Helpers de normalización                                           */
/* ------------------------------------------------------------------ */

function toStr(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNum(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value.replace(",", ".")) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function toStrArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => toStr(v)).filter(Boolean) : [];
}

/** Soporta descripción como texto simple o como bloques (Portable Text). */
function descriptionToText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!Array.isArray(value)) return "";
  return value
    .map((block) => {
      const children = (block as { children?: { text?: unknown }[] } | null)?.children;
      if (!Array.isArray(children)) return "";
      return children.map((c) => (typeof c?.text === "string" ? c.text : "")).join("");
    })
    .filter(Boolean)
    .join("\n\n");
}

function normalizeCategory(value: unknown): Category | null {
  const s = slugify(toStr(value));
  if (s.startsWith("zapatilla") || s === "sneakers" || s === "calzado") return "zapatillas";
  if (s.startsWith("indumentaria") || s === "ropa") return "indumentaria";
  if (s.startsWith("accesorio")) return "accesorios";
  return null;
}

function labelFrom(text: string): string {
  return /^[a-z0-9-]+$/.test(text) ? titleize(text) : text;
}

function normalizeSanityProduct(r: RawProduct): Product | null {
  const name = toStr(r.name);
  const category = normalizeCategory(r.category);

  if (!name || !category) {
    console.warn(`[sanity] Producto omitido (${r._id}): falta nombre o categoría válida`, {
      name,
      category: r.category,
    });
    return null;
  }

  const brand = toStr(r.brand) || "PYNE";
  const brandSlug = slugify(brand);

  let subcategory: string;
  let subcategoryLabel: string;
  if (category === "zapatillas") {
    subcategory = brandSlug;
    subcategoryLabel = brand;
  } else {
    const rawSub = toStr(r.subcategory) || "otros";
    subcategory = slugify(rawSub);
    subcategoryLabel = labelFrom(rawSub);
  }

  const declared = slugify(toStr(r.sizeType)) as SizeType;
  const sizeType = SIZE_TYPES.includes(declared) ? declared : DEFAULT_SIZE_TYPE[category];
  const sizes = sizeType === "unique" ? ["Talla Única"] : toStrArray(r.sizes);

  const wantedCondition = toStr(r.condition).toLowerCase();
  const condition =
    CONDITIONS.find((c) => c.toLowerCase() === wantedCondition) ?? "Nuevo";

  const imageList = Array.from(
    new Set(
      [toStr(r.mainImage), ...(Array.isArray(r.gallery) ? r.gallery.map((g) => toStr(g)) : [])].filter(
        Boolean
      )
    )
  );
  const images = imageList.length > 0 ? imageList : [FALLBACK_IMAGE];

  const slug = toStr(r.slug);
  const price = toNum(r.price) ?? 0;
  const compare = toNum(r.compareAtPrice);

  return {
    id: slug || r._id,
    slug: slug || r._id,
    name,
    brand,
    brandSlug,
    category,
    subcategory,
    subcategoryLabel,
    price,
    compareAtPrice: compare && compare > 0 ? compare : null,
    description: descriptionToText(r.description),
    image: images[0],
    images,
    sizeType,
    sizes,
    condition,
    // Si el producto no tiene stock cargado en Sanity, se asume disponible.
    stock: toNum(r.stock) ?? 10,
    featured: r.featured === true,
    tags: toStrArray(r.tags),
  };
}

/* ------------------------------------------------------------------ */
/*  Carga del catálogo (una sola consulta por render)                  */
/* ------------------------------------------------------------------ */

const loadProducts = cache(async (): Promise<Product[]> => {
  if (!projectId) {
    console.warn("[sanity] Falta NEXT_PUBLIC_SANITY_PROJECT_ID, uso datos locales.");
    return LOCAL_PRODUCTS;
  }

  try {
    const docs = await client.fetch<RawProduct[]>(
      PRODUCTS_QUERY,
      {},
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    return docs.map(normalizeSanityProduct).filter((p): p is Product => p !== null);
  } catch (error) {
    console.error("[sanity] No se pudo leer el catálogo, uso datos locales:", error);
    return LOCAL_PRODUCTS;
  }
});

/* ------------------------------------------------------------------ */
/*  API pública (todas async, excepto sortProducts)                    */
/* ------------------------------------------------------------------ */

export async function getAllProducts(): Promise<Product[]> {
  return loadProducts();
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await loadProducts();
  return products.find((p) => p.id === id || p.slug === id);
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
  const products = await loadProducts();
  return products.filter((p) => p.category === category);
}

export async function getProductsByBrand(brandSlug: string): Promise<Product[]> {
  const products = await loadProducts();
  return products.filter(
    (p) => p.category === "zapatillas" && p.brandSlug === brandSlug.toLowerCase()
  );
}

export async function getProductsBySubcategory(
  category: Category,
  subcategory: string
): Promise<Product[]> {
  const products = await loadProducts();
  return products.filter(
    (p) => p.category === category && p.subcategory === subcategory.toLowerCase()
  );
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await loadProducts();
  return products.filter((p) => p.featured).slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await loadProducts();
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export async function searchProducts(query: string): Promise<Product[]> {
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const products = await loadProducts();
  return products.filter((p) => {
    const haystack = normalizeText(
      [p.name, p.brand, p.category, p.subcategoryLabel, p.condition, ...p.tags].join(" ")
    );
    return tokens.every((t) => haystack.includes(t));
  });
}

export async function getBrandLabel(brandSlug: string): Promise<string> {
  const products = await loadProducts();
  const found = products.find((p) => p.brandSlug === brandSlug.toLowerCase());
  return found ? found.brand : brandSlug;
}

export async function getSubcategoryLabel(
  category: Category,
  subcategory: string
): Promise<string> {
  const products = await loadProducts();
  const found = products.find(
    (p) => p.category === category && p.subcategory === subcategory.toLowerCase()
  );
  return found ? found.subcategoryLabel : subcategory;
}

/* ------------------------------------------------------------------ */
/*  Filtros dinámicos (marcas / subcategorías que existen en Sanity)   */
/* ------------------------------------------------------------------ */

export interface Facet {
  slug: string;
  label: string;
}

export async function getBrandFacets(): Promise<Facet[]> {
  const products = await getProductsByCategory("zapatillas");
  const map = new Map<string, string>();
  for (const p of products) map.set(p.brandSlug, p.brand);
  return Array.from(map, ([slug, label]) => ({ slug, label }));
}

export async function getSubcategoryFacets(category: Category): Promise<Facet[]> {
  const products = await getProductsByCategory(category);
  const map = new Map<string, string>();
  for (const p of products) map.set(p.subcategory, p.subcategoryLabel);
  return Array.from(map, ([slug, label]) => ({ slug, label }));
}

/** Une la lista fija de navigation.ts con lo que exista en Sanity, sin duplicar. */
export function mergeFacets(base: readonly Facet[], extra: readonly Facet[]): Facet[] {
  const result: Facet[] = base.map((f) => ({ slug: f.slug, label: f.label }));
  for (const f of extra) {
    if (!result.some((r) => r.slug === f.slug)) result.push(f);
  }
  return result;
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