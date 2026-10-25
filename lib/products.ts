import { cache } from "react";
import raw from "@/data/products.json";
import { client, projectId, urlFor } from "./sanity";
import { ACCESSORY_SUBCATEGORIES, CLOTHING_SUBCATEGORIES } from "./navigation";
import { PRODUCT_CONDITIONS } from "./types";
import type { Category, Product, ProductCondition, SizeType } from "./types";
import { compareSizes, slugify, titleize } from "./utils";

/* ------------------------------------------------------------------ */
/*  Configuración                                                      */
/* ------------------------------------------------------------------ */

/** Respaldo local: solo se usa si Sanity no está configurado o falla. */
const LOCAL_PRODUCTS = raw as Product[];

/** Cada cuántos segundos se vuelve a pedir el catálogo a Sanity. */
const REVALIDATE_SECONDS = 60;

const FALLBACK_IMAGE = "/logo.jpg";

/** Ancho máximo de las imágenes que se piden al CDN de Sanity. */
const IMAGE_MAX_WIDTH = 1200;

const CONDITIONS: readonly ProductCondition[] = PRODUCT_CONDITIONS;

const SIZE_TYPES: SizeType[] = ["numeric", "standard", "pants", "unique"];

const DEFAULT_SIZE_TYPE: Record<Category, SizeType> = {
  zapatillas: "numeric",
  indumentaria: "standard",
  accesorios: "unique",
};

/* ------------------------------------------------------------------ */
/*  Consulta GROQ                                                      */
/*  Acepta nombres de campo en inglés o en español (coalesce).         */
/*                                                                     */
/*  Imágenes: se trae el OBJETO de imagen completo (asset + hotspot +  */
/*  crop) para transformarlo con urlFor, y además la URL directa del   */
/*  asset como respaldo si urlFor no puede resolverlo.                 */
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
  "featuredOrder": coalesce(featuredOrder, ordenDestacado),
  "tags": tags,
  "mainImage": coalesce(image, mainImage, imagen),
  "mainImageUrl": coalesce(image.asset->url, mainImage.asset->url, imagen.asset->url),
  "gallery": coalesce(images, gallery, imagenes),
  "galleryUrls": coalesce(images[].asset->url, gallery[].asset->url, imagenes[].asset->url)
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
  featuredOrder?: unknown;
  tags?: unknown;
  mainImage?: unknown;
  mainImageUrl?: unknown;
  gallery?: unknown;
  galleryUrls?: unknown;
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

/**
 * Convierte una imagen de Sanity en una URL utilizable por next/image.
 * 1) Si ya es un string (URL), lo usa tal cual.
 * 2) Si es un objeto de imagen con asset, usa urlFor (aplica hotspot/crop).
 * 3) Si urlFor falla, usa la URL directa del asset (directUrl).
 * Devuelve "" si no hay imagen válida.
 */
function imageToUrl(source: unknown, directUrl?: unknown): string {
  if (typeof source === "string" && source.trim()) return source.trim();

  if (source && typeof source === "object" && (source as { asset?: unknown }).asset) {
    try {
      const url = urlFor(source)
        .width(IMAGE_MAX_WIDTH)
        .fit("max")
        .auto("format")
        .url();
      if (url) return url;
    } catch (error) {
      console.warn("[sanity] urlFor no pudo resolver la imagen, uso la URL directa:", error);
    }
  }

  return toStr(directUrl);
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

/**
 * Asocia el texto libre de subcategoría con las subcategorías fijas del menú.
 * Ej.: "Bolsos & Mochilas" → bolsos, "Buzos & Hoodies" → buzos.
 */
function resolveKnownSubcategory(
  category: Category,
  rawSub: string
): { slug: string; label: string } | null {
  const known =
    category === "indumentaria"
      ? CLOTHING_SUBCATEGORIES
      : category === "accesorios"
      ? ACCESSORY_SUBCATEGORIES
      : [];
  const s = slugify(rawSub);
  if (!s) return null;
  return (
    known.find(
      (k) => k.slug === s || slugify(k.label) === s || s.startsWith(`${k.slug}-`)
    ) ?? null
  );
}

function normalizeCondition(value: unknown): ProductCondition {
  const wanted = slugify(toStr(value));
  return CONDITIONS.find((c) => slugify(c) === wanted) ?? "Nuevo";
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
    const known = resolveKnownSubcategory(category, rawSub);
    if (known) {
      subcategory = known.slug;
      subcategoryLabel = known.label;
    } else {
      subcategory = slugify(rawSub);
      subcategoryLabel = labelFrom(rawSub);
    }
  }

  // Tipo de talle: el declarado en Sanity; si no hay, pantalones → "pants", si no, el default por categoría.
  const declared = slugify(toStr(r.sizeType)) as SizeType;
  const hasDeclared = SIZE_TYPES.includes(declared);
  let sizeType: SizeType = hasDeclared ? declared : DEFAULT_SIZE_TYPE[category];
  if (!hasDeclared && category === "indumentaria" && subcategory === "pantalones") {
    sizeType = "pants";
  }

  const rawSizes = toStrArray(r.sizes).map((s) =>
    sizeType === "standard" || sizeType === "pants" ? s.toUpperCase() : s
  );
  const sizes =
    sizeType === "unique"
      ? ["Talla Única"]
      : Array.from(new Set(rawSizes)).sort(compareSizes);

  const condition = normalizeCondition(r.condition);

  // Imágenes: principal + galería, transformadas con urlFor (con respaldo a la URL directa)
  const galleryObjects = Array.isArray(r.gallery) ? r.gallery : [];
  const galleryDirect = Array.isArray(r.galleryUrls) ? r.galleryUrls : [];

  const mainUrl = imageToUrl(r.mainImage, r.mainImageUrl);
  const galleryUrls = galleryObjects.map((g, i) => imageToUrl(g, galleryDirect[i]));

  const imageList = Array.from(new Set([mainUrl, ...galleryUrls].filter(Boolean)));

  if (imageList.length === 0) {
    console.warn(`[sanity] Producto sin imagen válida (${r._id} — ${name}), uso imagen de respaldo.`);
  }

  const images = imageList.length > 0 ? imageList : [FALLBACK_IMAGE];

  const slug = toStr(r.slug);
  const price = toNum(r.price) ?? 0;
  const compare = toNum(r.compareAtPrice);
  const tags = toStrArray(r.tags);

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
    // La tag "destacado" equivale a marcar el producto como destacado.
    featured: r.featured === true || tags.includes("destacado"),
    featuredOrder: toNum(r.featuredOrder),
    tags,
  };
}

/* ------------------------------------------------------------------ */
/*  Prioridad de destacados                                            */
/*  1) featured: true primero  2) featuredOrder ascendente             */
/*  3) a igual orden, se mantiene el orden de creación (sort estable)  */
/* ------------------------------------------------------------------ */

function byFeaturedPriority(a: Product, b: Product): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (!a.featured) return 0;
  const oa = a.featuredOrder ?? Number.MAX_SAFE_INTEGER;
  const ob = b.featuredOrder ?? Number.MAX_SAFE_INTEGER;
  return oa - ob;
}

/* ------------------------------------------------------------------ */
/*  Carga del catálogo (una sola consulta por render)                  */
/* ------------------------------------------------------------------ */

const loadProducts = cache(async (): Promise<Product[]> => {
  if (!projectId) {
    console.warn("[sanity] Falta NEXT_PUBLIC_SANITY_PROJECT_ID, uso datos locales.");
    return [...LOCAL_PRODUCTS].sort(byFeaturedPriority);
  }

  try {
    const docs = await client.fetch<RawProduct[]>(
      PRODUCTS_QUERY,
      {},
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    return docs
      .map(normalizeSanityProduct)
      .filter((p): p is Product => p !== null)
      .sort(byFeaturedPriority);
  } catch (error) {
    console.error("[sanity] No se pudo leer el catálogo, uso datos locales:", error);
    return [...LOCAL_PRODUCTS].sort(byFeaturedPriority);
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

/** Solo productos marcados como destacados, en el orden elegido en Sanity. */
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
      return list.sort(byFeaturedPriority);
  }
}