"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { NAVIGATION } from "@/lib/navigation";
import Logo from "./Logo";
import MegaMenu from "./MegaMenu";
import SearchBar from "./SearchBar";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const { count, openCart, hydrated } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* Barra promo */}
      <div className="bg-pyne-orange py-2 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-pyne-black">
        Envíos a todo el país ✦ Retiro en local sin cargo
      </div>

      <header className="sticky top-0 z-40 border-b border-pyne-border bg-pyne-black/85 backdrop-blur-xl">
        <div className="pyne-container flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Logo />
            <MegaMenu />
          </div>

          <div className="hidden max-w-md flex-1 md:block">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Buscar"
              className="grid h-9 w-9 place-items-center rounded-full border border-pyne-border text-pyne-cream transition hover:border-pyne-orange hover:text-pyne-orange md:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.2-3.2" />
              </svg>
            </button>


            <button
              type="button"
              onClick={openCart}
              aria-label="Abrir carrito"
              className="relative grid h-9 w-9 place-items-center rounded-full border border-pyne-border text-pyne-cream transition hover:border-pyne-orange hover:text-pyne-orange"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
              </svg>
              {hydrated && count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-pyne-orange px-1 text-[10px] font-bold text-pyne-black">
                  {count}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menú"
              className="grid h-9 w-9 place-items-center rounded-full border border-pyne-border text-pyne-cream lg:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Buscador mobile */}
        {searchOpen && (
          <div className="border-t border-pyne-border p-4 md:hidden">
            <SearchBar autoFocus onNavigate={() => setSearchOpen(false)} />
          </div>
        )}

        {/* Menú mobile */}
        {mobileOpen && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-pyne-border lg:hidden">
            <div className="pyne-container space-y-6 py-6">
              {NAVIGATION.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-display text-lg uppercase tracking-wide text-pyne-cream"
                  >
                    {item.label}
                  </Link>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.columns?.flatMap((c) => c.items).map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-full border border-pyne-border px-3 py-1.5 text-[11px] uppercase tracking-wide text-pyne-kraft transition hover:border-pyne-orange hover:text-pyne-orange"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}