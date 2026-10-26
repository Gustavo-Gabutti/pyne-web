import type { Category, NavItem } from "./types";

/** Rutas principales (única fuente de verdad) */
export const ROUTES = {
  zapatillas: "/zapatillas",
  indumentaria: "/indumentaria",
  accesorios: "/accesorios",
} as const;

export const SNEAKER_BRANDS = [
  { label: "Nike", slug: "nike" },
  { label: "Adidas", slug: "adidas" },
  { label: "Jordan", slug: "jordan" },
  { label: "New Balance", slug: "new-balance" },
  { label: "Puma", slug: "puma" },
  { label: "Asics", slug: "asics" },
];

export const CLOTHING_SUBCATEGORIES = [
  { label: "Remeras", slug: "remeras" },
  { label: "Buzos & Hoodies", slug: "buzos" },
  { label: "Camperas", slug: "camperas" },
  { label: "Pantalones", slug: "pantalones" },
  { label: "Bermudas", slug: "bermudas" },
  { label: "Camisas", slug: "camisas" },
  { label: "Shorts", slug: "shorts" },
];

export const ACCESSORY_SUBCATEGORIES = [
  { label: "Relojes", slug: "relojes" },
  { label: "Gorras", slug: "gorras" },
  { label: "Bolsos & Mochilas", slug: "bolsos" },
  { label: "Lentes", slug: "lentes" },
  { label: "Cinturones", slug: "cinturones" },
];

/** Tags predefinidas que se pueden tildar en Sanity (editá esta lista para sumar o quitar). */
export const PRODUCT_TAGS = [
  { title: "Novedades", value: "novedades" },
  { title: "Destacado", value: "destacado" },
  { title: "Archivo", value: "archivo" },
  { title: "Retro", value: "retro" },
  { title: "Vintage 90s", value: "90s" },
  { title: "Y2K", value: "y2k" },
  { title: "Edición limitada", value: "edicion-limitada" },
  { title: "Oferta", value: "oferta" },
  { title: "Streetwear", value: "streetwear" },
  { title: "Básicos", value: "basicos" },
  { title: "Oversize", value: "oversize" },
  { title: "Unisex", value: "unisex" },
  { title: "Skate", value: "skate" },
  { title: "Utility", value: "utility" },
];

/** Talles disponibles por tipo */
export const NUMERIC_SIZES = [
  "US 6", "US 6.5", "US 7", "US 7.5", "US 8", "US 8.5",
  "US 9", "US 9.5", "US 10", "US 10.5", "US 11", "US 12",
];

export const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/** Pantalones y Bermudas: talles numéricos del 26 al 42 */
export const PANTS_SIZES = Array.from({ length: 17 }, (_, i) => String(26 + i));

export const UNIQUE_SIZE = "Talla Única";

/** Todos los talles que se pueden tildar en Sanity */
export const ALL_SIZE_OPTIONS = [...NUMERIC_SIZES, ...STANDARD_SIZES, ...PANTS_SIZES];

/** Tabla de equivalencias para la guía de talles de zapatillas */
export const SIZE_GUIDE_TABLE = [
  { us: "US 6", eu: "38.5", ar: "37", cm: "24.0" },
  { us: "US 6.5", eu: "39", ar: "38", cm: "24.5" },
  { us: "US 7", eu: "40", ar: "38.5", cm: "25.0" },
  { us: "US 7.5", eu: "40.5", ar: "39", cm: "25.5" },
  { us: "US 8", eu: "41", ar: "40", cm: "26.0" },
  { us: "US 8.5", eu: "42", ar: "40.5", cm: "26.5" },
  { us: "US 9", eu: "42.5", ar: "41", cm: "27.0" },
  { us: "US 9.5", eu: "43", ar: "42", cm: "27.5" },
  { us: "US 10", eu: "44", ar: "42.5", cm: "28.0" },
  { us: "US 10.5", eu: "44.5", ar: "43", cm: "28.5" },
  { us: "US 11", eu: "45", ar: "44", cm: "29.0" },
  { us: "US 12", eu: "46", ar: "45", cm: "30.0" },
];

/* ------------------------------------------------------------------ */
/*  Banners del menú                                                   */
/* ------------------------------------------------------------------ */

/** Imágenes de respaldo: se usan solo si no hay productos con foto en esa categoría. */
export const FALLBACK_MENU_IMAGES: Record<Category, string> = {
  zapatillas:
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=70",
  indumentaria:
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=70",
  accesorios:
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=70",
};

export interface NavigationOptions {
  /** Foto real de un producto por categoría (si falta, se usa el respaldo). */
  images?: Partial<Record<Category, string>>;
  /**
   * true  → el banner de Accesorios es "Relojes Selected" (la foto es un reloj o es el respaldo).
   * false → la foto es de otro accesorio, el banner pasa a "Accesorios Selected".
   */
  accessoriesBannerIsWatch?: boolean;
}

/** Arma el menú. Es una función pura: se puede usar tanto en servidor como en cliente. */
export function buildNavigation(options: NavigationOptions = {}): NavItem[] {
  const { images = {}, accessoriesBannerIsWatch = true } = options;
  const imageFor = (category: Category): string =>
    images[category] || FALLBACK_MENU_IMAGES[category];

  return [
    {
      label: "Zapatillas",
      href: ROUTES.zapatillas,
      columns: [
        {
          title: "Marcas",
          items: SNEAKER_BRANDS.slice(0, 3).map((b) => ({
            label: b.label,
            href: `${ROUTES.zapatillas}/${b.slug}`,
          })),
        },
        {
          title: "Más marcas",
          items: SNEAKER_BRANDS.slice(3).map((b) => ({
            label: b.label,
            href: `${ROUTES.zapatillas}/${b.slug}`,
          })),
        },
      ],
      highlight: {
        title: "Deadstock Drop",
        subtitle: "Pares seleccionados, sin uso.",
        href: ROUTES.zapatillas,
        image: imageFor("zapatillas"),
      },
    },
    {
      label: "Indumentaria",
      href: ROUTES.indumentaria,
      columns: [
        {
          title: "Prendas",
          items: CLOTHING_SUBCATEGORIES.slice(0, 4).map((s) => ({
            label: s.label,
            href: `${ROUTES.indumentaria}/${s.slug}`,
          })),
        },
        {
          title: "Más",
          items: CLOTHING_SUBCATEGORIES.slice(4).map((s) => ({
            label: s.label,
            href: `${ROUTES.indumentaria}/${s.slug}`,
          })),
        },
      ],
      highlight: {
        title: "Vintage 90s",
        subtitle: "Piezas únicas de archivo.",
        href: ROUTES.indumentaria,
        image: imageFor("indumentaria"),
      },
    },
    {
      label: "Accesorios",
      href: ROUTES.accesorios,
      columns: [
        {
          title: "Categorías",
          items: ACCESSORY_SUBCATEGORIES.map((s) => ({
            label: s.label,
            href: `${ROUTES.accesorios}/${s.slug}`,
          })),
        },
      ],
      highlight: accessoriesBannerIsWatch
        ? {
            title: "Relojes Selected",
            subtitle: "Talla única. Carácter infinito.",
            href: `${ROUTES.accesorios}/relojes`,
            image: imageFor("accesorios"),
          }
        : {
            title: "Accesorios Selected",
            subtitle: "Piezas de talla única.",
            href: ROUTES.accesorios,
            image: imageFor("accesorios"),
          },
    },
  ];
}

/** Menú estático (con imágenes de respaldo). Se usa como valor por defecto. */
export const NAVIGATION: NavItem[] = buildNavigation();