import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, Truck, Store, MessageSquare } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import SneakerCarousel from "@/components/SneakerCarousel";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "PYNE ✦ Vintage & Selected Goods",
  description:
    "Sneakers e indumentaria originales second hand, seleccionados uno a uno. Accesorios nuevos para completar la coleccion.",
  alternates: { canonical: "/" },
};

const BENEFITS = [
  { icon: ShieldCheck, title: "Autenticidad verificada", copy: "Cada pieza pasa por control del equipo PYNE." },
  { icon: Truck, title: "Envíos a todo el país", copy: "Despacho en 24hs hábiles tras confirmar." },
  { icon: Store, title: "Retiro presencial", copy: "Turno mañana o tarde en Av. Dr. Luis Gutnisky 4186, sin cargo." },
  { icon: MessageSquare, title: "Compra por WhatsApp", copy: "Te acompañamos en todo el proceso." },
];

export default async function HomePage() {
  // Obtenemos todos los productos desde Sanity (con respaldo local si aplica)
  const allProducts = await getAllProducts();
  
  // Filtramos destacados y zapatillas para el drop
  const featured = allProducts.filter((p) => p.featured).slice(0, 8);
  const sneakers = allProducts.filter((p) => p.category === "zapatillas").slice(0, 4);

  // Obtenemos dinámicamente la foto del primer producto de cada categoría (o usamos un respaldo prolijo)
  const zapaImage = allProducts.find((p) => p.category === "zapatillas")?.image || "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=70";
  const indImage = allProducts.find((p) => p.category === "indumentaria")?.image || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=70";
  const accImage = allProducts.find((p) => p.category === "accesorios")?.image || "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=70";

  const categories = [
    {
      title: "Zapatillas",
      href: "/zapatillas",
      copy: "Deadstock, retros y pares de archivo.",
      image: zapaImage,
    },
    {
      title: "Indumentaria",
      href: "/indumentaria",
      copy: "Remeras, hoodies y denim vintage.",
      image: indImage,
    },
    {
      title: "Accesorios",
      href: "/accesorios",
      copy: "Relojes, gorras y complementos.",
      image: accImage,
    },
  ];

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-pyne-border">
        <div className="pyne-container relative flex min-h-[78vh] flex-col justify-center py-24">
          <p className="pyne-eyebrow animate-fadeUp">Vintage & Selected Goods</p>
          <h1 className="mt-5 max-w-4xl animate-fadeUp font-display text-6xl uppercase leading-[0.88] tracking-tight text-pyne-cream sm:text-7xl lg:text-[7.5rem]">
            Piezas con
            <br />
            <span className="text-pyne-orange">historia</span> que sigue
          </h1>
          <p className="mt-7 max-w-xl animate-fadeUp text-base leading-relaxed text-pyne-kraft">
            Sneakers deadstock, indumentaria de archivo y accesorios elegidos uno por uno.
            Curaduría real, sin relleno.
          </p>
          <div className="mt-10 flex animate-fadeUp flex-wrap gap-4">
            <Link href="/zapatillas" className="pyne-btn-primary">
              Ver zapatillas
            </Link>
            <Link href="/indumentaria" className="pyne-btn-outline">
              Explorar indumentaria
            </Link>
          </div>

          {/* Bloque de Atributos */}
          <div className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-pyne-border pt-8">
            {[
              { k: "100%", v: "Autenticidad" },
              { k: "24h", v: "Despacho" },
              { k: "✦", v: "Selección curada" },
            ].map((s) => (
              <div key={s.v}>
                <p className="font-display text-2xl text-pyne-orange">{s.k}</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-pyne-muted">{s.v}</p>
              </div>
            ))}
          </div>

          {/* ================= CARRUSEL 3D ================= */}
          <SneakerCarousel products={allProducts} />
        </div>
      </section>

      {/* ================= CATEGORÍAS (DINÁMICAS SEGÚN SANITY) ================= */}
      <section className="pyne-container py-20">
        <div className="mb-10">
          <p className="pyne-eyebrow">Explorá</p>
          <h2 className="mt-2 font-display text-4xl uppercase text-pyne-cream">Categorías</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-pyne-border"
            >
              <Image
                src={c.image}
                alt={c.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover opacity-55 transition duration-700 group-hover:scale-105 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pyne-black via-pyne-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-7">
                <h3 className="font-display text-3xl uppercase text-pyne-cream">{c.title}</h3>
                <p className="mt-1 text-xs text-pyne-kraft">{c.copy}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-pyne-orange">
                  Ver todo
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= DESTACADOS ================= */}
      <section className="pyne-container pb-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="pyne-eyebrow">PYNE ✦ Picks</p>
            <h2 className="mt-2 font-display text-4xl uppercase text-pyne-cream">Destacados</h2>
          </div>
          <Link href="/zapatillas" className="pyne-btn-outline">
            Ver catálogo
          </Link>
        </div>
        <ProductGrid
          products={featured}
          emptyTitle="Sin destacados por ahora"
          emptyMessage="Estamos curando el próximo drop. Volvé pronto."
        />
      </section>

      {/* ================= BANNER DROP ================= */}
      <section className="border-y border-pyne-border bg-pyne-coal/60">
        <div className="pyne-container grid items-center gap-10 py-16 lg:grid-cols-2">
          <div>
            <p className="pyne-eyebrow">Deadstock Drop</p>
            <h2 className="mt-3 font-display text-4xl uppercase leading-tight text-pyne-cream sm:text-5xl">
              Pares que no
              <br />
              vas a encontrar
              <br />
              <span className="text-pyne-orange">en otro lado</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-pyne-muted">
              Stock limitado, talles reales y guía de medidas para que aciertes a la primera.
            </p>
            <Link href="/zapatillas" className="pyne-btn-primary mt-8">
              Ver el drop
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {sneakers.map((p) => (
              <Link
                key={p.id}
                href={`/producto/${p.id}`}
                className="relative aspect-square overflow-hidden rounded-xl border border-pyne-border bg-pyne-smoke"
              >
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BENEFICIOS ================= */}
      <section className="pyne-container py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="pyne-card p-6">
                <Icon className="h-6 w-6 text-pyne-orange stroke-[1.5]" />
                <h3 className="mt-4 font-display text-lg uppercase text-pyne-cream">{b.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-pyne-muted">{b.copy}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}