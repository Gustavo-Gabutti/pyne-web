import type { CartItem, CheckoutForm } from "./types";
import { STANDARD_SIZES } from "./navigation";

export const WHATSAPP_NUMBER = "5493704968752";

/** Número del botón flotante de WhatsApp */
export const WHATSAPP_CONTACT_NUMBER = "5493704233558";
export const WHATSAPP_DEFAULT_MESSAGE =
  "¡Hola PYNE ✦! Quiero hacer una consulta sobre los productos.";

/** Une clases condicionalmente (mini clsx) */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function cartKey(productId: string, size: string): string {
  return `${productId}__${size}`;
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + i.quantity, 0);
}

export function titleize(slug?: string): string {
  if (!slug || typeof slug !== "string") return "";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Ordena talles: primero XS-XXL (en orden), después numéricos de menor a mayor. */
export function compareSizes(a: string, b: string): number {
  const ia = STANDARD_SIZES.indexOf(a);
  const ib = STANDARD_SIZES.indexOf(b);
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;

  const na = parseFloat(a.replace(/[^\d.]/g, ""));
  const nb = parseFloat(b.replace(/[^\d.]/g, ""));
  if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;

  return a.localeCompare(b);
}

/* ---------------- WhatsApp ---------------- */
const SLOT_LABEL: Record<string, string> = {
  manana: "Mañana (9:00 - 12:00 hs)",
  tarde: "Tarde (15:00 - 19:00 hs)",
};

export function buildWhatsAppMessage(form: CheckoutForm, items: CartItem[]): string {
  const lines: string[] = [];

  lines.push("*NUEVO PEDIDO — PYNE ✦*");
  lines.push("*Vintage & Selected Goods*");
  lines.push("");
  lines.push("*🧾 DETALLE DEL PEDIDO*");

  items.forEach((item, index) => {
    const subtotal = item.product.price * item.quantity;
    lines.push(
      `${index + 1}. ${item.product.brand} ${item.product.name}\n   • Talle: ${item.selectedSize}\n   • Cantidad: ${item.quantity}\n   • Subtotal: ${formatPrice(subtotal)}`
    );
  });

  lines.push("");
  lines.push(`*💰 TOTAL A PAGAR: ${formatPrice(cartTotal(items))}*`);
  lines.push("");
  lines.push("*👤 MIS DATOS*");
  lines.push(`Nombre: ${form.firstName} ${form.lastName}`);
  lines.push(`Teléfono: ${form.phone}`);
  lines.push(`Email: ${form.email}`);
  lines.push("");

  if (form.delivery === "envio") {
    lines.push("*🚚 ENVÍO A DOMICILIO*");
    const dir = [
      `${form.street} ${form.streetNumber}`,
      form.floor ? `Piso ${form.floor}` : "",
      form.apartment ? `Depto ${form.apartment}` : "",
    ]
      .filter(Boolean)
      .join(" — ");
    lines.push(`Dirección: ${dir}`);
    if (form.city) lines.push(`Ciudad: ${form.city}`);
  } else {
    lines.push("*🏬 RETIRO PRESENCIAL*");
    lines.push("Punto de retiro: Avenida Dr. Luis Gutnisky 4186");
    lines.push(`Turno: ${SLOT_LABEL[form.pickupSlot]}`);
  }

  if (form.notes.trim()) {
    lines.push("");
    lines.push(`*📝 Notas:* ${form.notes.trim()}`);
  }

  return lines.join("\n");
}

export function buildWhatsAppUrl(form: CheckoutForm, items: CartItem[]): string {
  const text = encodeURIComponent(buildWhatsAppMessage(form, items));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}