import type { NavItem } from "./types";

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

/** Talles disponibles por tipo */
export const NUMERIC_SIZES = [
  "US 6", "US 6.5", "US 7", "US 7.5", "US 8", "US 8.5",
  "US 9", "US 9.5", "US 10", "US 10.5", "US 11", "US 12",
];

export const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
export const UNIQUE_SIZE = "Talla Única";

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

export const NAVIGATION: NavItem[] = [
  {
    label: "Zapatillas",
    href: "/zapatillas",
    columns: [
      {
        title: "Marcas",
        items: SNEAKER_BRANDS.slice(0, 3).map((b) => ({
          label: b.label,
          href: `/zapatillas/${b.slug}`,
        })),
      },
      {
        title: "Más marcas",
        items: SNEAKER_BRANDS.slice(3).map((b) => ({
          label: b.label,
          href: `/zapatillas/${b.slug}`,
        })),
      },
    ],
    highlight: {
      title: "Deadstock Drop",
      subtitle: "Pares seleccionados, sin uso.",
      href: "/zapatillas",
      image:
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=70",
    },
  },
  {
    label: "Indumentaria",
    href: "/indumentaria",
    columns: [
      {
        title: "Prendas",
        items: CLOTHING_SUBCATEGORIES.slice(0, 3).map((s) => ({
          label: s.label,
          href: `/indumentaria/${s.slug}`,
        })),
      },
      {
        title: "Más",
        items: CLOTHING_SUBCATEGORIES.slice(3).map((s) => ({
          label: s.label,
          href: `/indumentaria/${s.slug}`,
        })),
      },
    ],
    highlight: {
      title: "Vintage 90s",
      subtitle: "Piezas únicas de archivo.",
      href: "/indumentaria",
      image:
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=70",
    },
  },
  {
    label: "Accesorios",
    href: "/accesorios",
    columns: [
      {
        title: "Categorías",
        items: ACCESSORY_SUBCATEGORIES.slice(0, 3).map((s) => ({
          label: s.label,
          href: `/accesorios/${s.slug}`,
        })),
      },
      {
        title: "Complementos",
        items: ACCESSORY_SUBCATEGORIES.slice(3).map((s) => ({
          label: s.label,
          href: `/accesorios/${s.slug}`,
        })),
      },
    ],
    highlight: {
      title: "Relojes Selected",
      subtitle: "Talla única. Carácter infinito.",
      href: "/accesorios/relojes",
      image:
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=70",
    },
  },
];