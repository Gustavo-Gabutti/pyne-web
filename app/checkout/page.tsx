"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent, type ReactNode } from "react";
import { useCart } from "@/context/CartContext";
import EmptyState from "@/components/EmptyState";
import ShippingCalculator from "@/components/ShippingCalculator";
import type { CheckoutForm, DeliveryMethod, PickupSlot } from "@/lib/types";
import { buildWhatsAppUrl, cn, formatPrice } from "@/lib/utils";

/* ---------- Campo reutilizable ---------- */
interface FieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div data-error={Boolean(error)}>
      <label className="pyne-label">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-[11px] text-pyne-ember">⚠ {error}</p>}
    </div>
  );
}

/* ---------- Estado inicial ---------- */
const INITIAL_FORM: CheckoutForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  delivery: "envio",
  street: "",
  streetNumber: "",
  floor: "",
  apartment: "",
  city: "",
  pickupSlot: "manana",
  notes: "",
};

type FormErrors = Partial<Record<keyof CheckoutForm, string>>;

const PICKUP_SLOTS = [
  { id: "manana", title: "Mañana", range: "9:00 - 12:00 hs" },
  { id: "tarde", title: "Tarde", range: "15:00 - 19:00 hs" },
] as const;

export default function CheckoutPage() {
  const { items, total, hydrated, increment, decrement, removeItem } = useCart();
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const setDelivery = (method: DeliveryMethod): void => {
    setForm((prev) => ({ ...prev, delivery: method }));
    setErrors((prev) => ({
      ...prev,
      street: undefined,
      streetNumber: undefined,
      city: undefined,
    }));
  };

  const setSlot = (slot: PickupSlot): void => {
    setForm((prev) => ({ ...prev, pickupSlot: slot }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.firstName.trim()) next.firstName = "Ingresá tu nombre";
    if (!form.lastName.trim()) next.lastName = "Ingresá tu apellido";
    if (!/^[\d\s+()-]{7,}$/.test(form.phone.trim())) next.phone = "Teléfono inválido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Email inválido";

    if (form.delivery === "envio") {
      if (!form.street.trim()) next.street = "Ingresá la calle";
      if (!form.streetNumber.trim()) next.streetNumber = "Ingresá la altura";
      if (!form.city.trim()) next.city = "Ingresá la ciudad";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (): void => {
    if (items.length === 0) return;
    if (!validate()) {
      const firstError = document.querySelector<HTMLElement>('[data-error="true"]');
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const url = buildWhatsAppUrl(form, items);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* ---------- Loading ---------- */
  if (!hydrated) {
    return (
      <div className="pyne-container py-32 text-center">
        <span className="animate-pulse text-3xl text-pyne-orange">✦</span>
        <p className="mt-4 text-sm text-pyne-muted">Cargando tu carrito…</p>
      </div>
    );
  }

  /* ---------- Carrito vacío ---------- */
  if (items.length === 0) {
    return (
      <div className="pyne-container py-20">
        <EmptyState
          title="Tu carrito está vacío"
          message="Agregá productos para poder finalizar tu pedido por WhatsApp."
          ctaLabel="Ver catálogo"
          ctaHref="/zapatillas"
        />
      </div>
    );
  }

  return (
    <div className="pyne-container py-12 lg:py-16">
      <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-pyne-muted">
        <Link href="/" className="transition hover:text-pyne-orange">
          Inicio
        </Link>
        <span className="text-pyne-border">/</span>
        <span className="text-pyne-cream">Checkout</span>
      </nav>
      <p className="pyne-eyebrow">Último paso</p>
      <h1 className="mt-2 font-display text-4xl uppercase text-pyne-cream sm:text-5xl">
        Finalizar pedido
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-pyne-muted">
        Completá tus datos y te redirigimos a WhatsApp con el detalle listo para confirmar.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        {/* ================= FORMULARIO ================= */}
        <div className="space-y-8">
          {/* --- Paso 1: Tus datos --- */}
          <section className="pyne-card p-6 sm:p-8">
            <h2 className="mb-6 flex items-center gap-3 font-display text-xl uppercase text-pyne-cream">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-pyne-orange text-xs font-bold text-pyne-black">
                1
              </span>
              Tus datos
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nombre *" error={errors.firstName}>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Juan"
                  className="w-full"
                />
              </Field>
              <Field label="Apellido *" error={errors.lastName}>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Pérez"
                  className="w-full"
                />
              </Field>
              <Field label="Teléfono *" error={errors.phone}>
                <input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="3704 96-8752"
                  className="w-full"
                />
              </Field>
              <Field label="Email *" error={errors.email}>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="juan@mail.com"
                  className="w-full"
                />
              </Field>
            </div>
          </section>

          {/* --- Paso 2: Tipo de entrega --- */}
          <section className="pyne-card p-6 sm:p-8">
            <h2 className="mb-6 flex items-center gap-3 font-display text-xl uppercase text-pyne-cream">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-pyne-orange text-xs font-bold text-pyne-black">
                2
              </span>
              Tipo de entrega
            </h2>

            {/* Tabs */}
            <div className="mb-7 grid grid-cols-2 gap-2 rounded-xl border border-pyne-border p-1.5">
              <button
                type="button"
                onClick={() => setDelivery("envio")}
                aria-pressed={form.delivery === "envio"}
                className={cn(
                  "rounded-lg py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition",
                  form.delivery === "envio"
                    ? "bg-pyne-orange text-pyne-black"
                    : "text-pyne-muted hover:text-pyne-cream"
                )}
              >
                🚚 Envío a domicilio
              </button>
              <button
                type="button"
                onClick={() => setDelivery("retiro")}
                aria-pressed={form.delivery === "retiro"}
                className={cn(
                  "rounded-lg py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition",
                  form.delivery === "retiro"
                    ? "bg-pyne-orange text-pyne-black"
                    : "text-pyne-muted hover:text-pyne-cream"
                )}
              >
                🏬 Retiro presencial
              </button>
            </div>

            {/* Opción A: Envío */}
            {form.delivery === "envio" && (
              <div className="space-y-6 animate-fadeUp">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Calle *" error={errors.street}>
                    <input
                      name="street"
                      value={form.street}
                      onChange={handleChange}
                      placeholder="Av. 25 de Mayo"
                      className="w-full"
                    />
                  </Field>
                  <Field label="Número *" error={errors.streetNumber}>
                    <input
                      name="streetNumber"
                      value={form.streetNumber}
                      onChange={handleChange}
                      placeholder="1234"
                      className="w-full"
                    />
                  </Field>
                  <Field label="Piso (opcional)">
                    <input
                      name="floor"
                      value={form.floor}
                      onChange={handleChange}
                      placeholder="3"
                      className="w-full"
                    />
                  </Field>
                  <Field label="Depto (opcional)">
                    <input
                      name="apartment"
                      value={form.apartment}
                      onChange={handleChange}
                      placeholder="B"
                      className="w-full"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Ciudad / Localidad *" error={errors.city}>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Formosa"
                        className="w-full"
                      />
                    </Field>
                  </div>
                </div>

                {/* Calculadora de envíos */}
                <ShippingCalculator />
              </div>
            )}

            {/* Opción B: Retiro presencial */}
            {form.delivery === "retiro" && (
              <div className="animate-fadeUp">
                <p className="pyne-label">Elegí tu turno de retiro *</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PICKUP_SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSlot(slot.id)}
                      aria-pressed={form.pickupSlot === slot.id}
                      className={cn(
                        "rounded-xl border p-5 text-left transition",
                        form.pickupSlot === slot.id
                          ? "border-pyne-orange bg-pyne-orange/10"
                          : "border-pyne-border hover:border-pyne-kraft/50"
                      )}
                    >
                      <span className="block font-display text-lg uppercase text-pyne-cream">
                        {slot.title}
                      </span>
                      <span className="mt-1 block text-xs text-pyne-muted">{slot.range}</span>
                      {form.pickupSlot === slot.id && (
                        <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-[0.16em] text-pyne-orange">
                          ✦ Seleccionado
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-5 rounded-xl border border-pyne-border bg-pyne-smoke/60 p-4 text-xs leading-relaxed text-pyne-cream">
                  <p className="font-semibold text-pyne-orange">📍 Punto de retiro presencial:</p>
                  <p className="mt-1 font-medium text-pyne-cream">Avenida Dr. Luis Gutnisky 4186</p>
                  <p className="mt-1 text-[11px] text-pyne-muted">Te confirmaremos los detalles de tu turno por WhatsApp.</p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <Field label="Notas del pedido (opcional)">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Alguna aclaración sobre tu pedido…"
                  className="w-full resize-none"
                />
              </Field>
            </div>
          </section>
        </div>

        {/* ================= RESUMEN DEL PEDIDO ================= */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="pyne-card overflow-hidden">
            <header className="border-b border-pyne-border px-6 py-5">
              <p className="pyne-eyebrow">Resumen</p>
              <h2 className="font-display text-xl uppercase text-pyne-cream">Tu pedido</h2>
            </header>
            <ul className="max-h-[380px] space-y-5 overflow-y-auto px-6 py-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-pyne-smoke">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-pyne-muted">
                      {item.product.brand}
                    </p>
                    <p className="truncate text-sm text-pyne-cream">{item.product.name}</p>
                    <p className="mt-1 text-[11px] text-pyne-kraft">
                      Talle: <span className="text-pyne-orange">{item.selectedSize}</span> · Cant.{" "}
                      {item.quantity}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-pyne-border">
                        <button
                          type="button"
                          onClick={() => decrement(item.key)}
                          aria-label="Restar cantidad"
                          className="h-6 w-6 text-pyne-cream transition hover:text-pyne-orange"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-[11px]">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => increment(item.key)}
                          aria-label="Sumar cantidad"
                          className="h-6 w-6 text-pyne-cream transition hover:text-pyne-orange"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-pyne-cream">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-pyne-muted transition hover:text-pyne-ember"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-4 border-t border-pyne-border bg-pyne-black/40 px-6 py-5">
              <div className="flex justify-between text-sm text-pyne-muted">
                <span>Subtotal</span>
                <span className="text-pyne-cream">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-pyne-muted">
                <span>{form.delivery === "envio" ? "Envío" : "Retiro presencial"}</span>
                <span className="text-pyne-cream">
                  {form.delivery === "envio" ? "A coordinar" : "Sin cargo"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-pyne-border pt-4">
                <span className="text-xs uppercase tracking-[0.2em] text-pyne-muted">Total</span>
                <span className="font-display text-3xl text-pyne-orange">
                  {formatPrice(total)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:brightness-110 active:scale-[0.98]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29z" />
                </svg>
                Enviar pedido por WhatsApp
              </button>
              <p className="text-center text-[11px] leading-relaxed text-pyne-muted">
                Al enviar, se abre WhatsApp con el detalle de tu pedido listo para confirmar.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-4 block text-center text-[11px] uppercase tracking-[0.16em] text-pyne-muted transition hover:text-pyne-orange"
          >
            ← Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}