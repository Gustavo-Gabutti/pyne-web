import { buildNavigation, NAVIGATION } from "./navigation";
import { getAllProducts } from "./products";
import type { Category, NavItem, Product } from "./types";

const PRODUCT_FALLBACK_IMAGE = "/logo.jpg";

/** Un producto "sirve" para el banner si tiene una foto real (no el logo de respaldo). */
function hasRealImage(product: Product): boolean {
  return Boolean(product.image) && product.image !== PRODUCT_FALLBACK_IMAGE;
}

/**
 * Elige el producto de la categoría cuya foto va en el banner.
 * Como el catálogo ya viene ordenado con los destacados primero,
 * se usa el primer destacado con foto real, o el primer producto con foto.
 * `prefer` permite priorizar un tipo de producto (ej. relojes).
 */
function pickProduct(
  products: Product[],
  category: Category,
  prefer?: (product: Product) => boolean
): Product | undefined {
  const pool = products.filter((p) => p.category === category && hasRealImage(p));
  return (prefer ? pool.find(prefer) : undefined) ?? pool[0];
}

/**
 * Menú de navegación con las fotos reales del inventario (Sanity).
 * Si no hay productos en una categoría, esa categoría mantiene su imagen de respaldo.
 */
export async function getNavigation(): Promise<NavItem[]> {
  try {
    const products = await getAllProducts();

    const sneaker = pickProduct(products, "zapatillas");
    const clothing = pickProduct(products, "indumentaria");
    const watch = pickProduct(products, "accesorios", (p) => p.subcategory === "relojes");
    const accessory = watch ?? pickProduct(products, "accesorios");

    return buildNavigation({
      images: {
        zapatillas: sneaker?.image,
        indumentaria: clothing?.image,
        accesorios: accessory?.image,
      },
      // Si hay accesorios pero ninguno es reloj, el banner deja de decir "Relojes".
      accessoriesBannerIsWatch: Boolean(watch) || !accessory,
    });
  } catch (error) {
    console.error("[menu] No se pudieron obtener las imágenes del menú, uso respaldo:", error);
    return NAVIGATION;
  }
}