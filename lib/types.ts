export type Category = "zapatillas" | "indumentaria" | "accesorios";

/** Define qué tipo de selector de talle se renderiza */
export type SizeType = "numeric" | "standard" | "unique";

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  category: Category;
  subcategory: string;      // slug: "remeras" | "relojes" | "nike" ...
  subcategoryLabel: string;
  price: number;
  compareAtPrice?: number | null;
  description: string;
  image: string;
  images: string[];
  sizeType: SizeType;
  sizes: string[];
  condition: "Nuevo" | "Deadstock" | "Usado - 9/10" | "Usado - 8/10" | "Vintage";
  stock: number;
  featured: boolean;
  tags: string[];
}

export interface CartItem {
  /** clave compuesta `${product.id}__${selectedSize}` */
  key: string;
  product: Product;
  selectedSize: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: "HYDRATE"; payload: CartItem[] }
  | { type: "ADD"; payload: { product: Product; selectedSize: string; quantity?: number } }
  | { type: "INC"; payload: { key: string } }
  | { type: "DEC"; payload: { key: string } }
  | { type: "REMOVE"; payload: { key: string } }
  | { type: "CLEAR" };

/* ---------- Checkout ---------- */

export type DeliveryMethod = "envio" | "retiro";
export type PickupSlot = "manana" | "tarde";

export interface CheckoutForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  delivery: DeliveryMethod;
  street: string;
  streetNumber: string;
  floor: string;
  apartment: string;
  city: string;
  pickupSlot: PickupSlot;
  notes: string;
}

/* ---------- Navegación ---------- */

export interface NavChild {
  label: string;
  href: string;
  description?: string;
}

export interface NavColumn {
  title: string;
  items: NavChild[];
}

export interface NavItem {
  label: string;
  href: string;
  columns?: NavColumn[];
  highlight?: { title: string; subtitle: string; href: string; image: string };
}