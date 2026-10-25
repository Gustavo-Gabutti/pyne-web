"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { NAVIGATION } from "@/lib/navigation";
import type { NavItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MegaMenuProps {
  /** Menú con las imágenes reales (viene del servidor). Si no se pasa, usa el estático. */
  navigation?: NavItem[];
}

export default function MegaMenu({ navigation = NAVIGATION }: MegaMenuProps) {
  const [active, setActive] = useState<string | null>(null);

  const close = (): void => setActive(null);

  return (
    <nav
      className="hidden lg:flex lg:items-center lg:gap-1"
      onMouseLeave={close}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
    >
      {navigation.map((item) => (
        <div
          key={item.label}
          onMouseEnter={() => setActive(item.label)}
          onFocus={() => setActive(item.label)}
        >
          <Link
            href={item.href}
            onClick={close}
            className={cn(
              "relative block px-4 py-6 text-[12px] font-bold uppercase tracking-[0.18em] transition-colors",
              active === item.label ? "text-pyne-orange" : "text-pyne-cream hover:text-pyne-orange"
            )}
          >
            {item.label}
            <span
              className={cn(
                "absolute bottom-4 left-4 h-px bg-pyne-orange transition-all duration-300",
                active === item.label ? "w-[calc(100%-2rem)]" : "w-0"
              )}
            />
          </Link>

          {active === item.label && item.columns && (
            /*
              El panel se ancla al <header> sticky (el <nav> no es "relative"),
              por eso ocupa todo el ancho y no queda aplastado.
              "-mt-3 pt-3" cubre el padding del header (py-3) para que el mouse
              no pierda el hover al bajar del link al panel.
            */
            <div className="absolute inset-x-0 top-full z-50 -mt-3 pt-3 animate-fadeUp">
              <div className="pyne-container">
                <div className="mx-auto flex max-w-4xl gap-10 rounded-2xl border border-pyne-border bg-pyne-coal p-8 shadow-2xl">
                  {/* Columnas de links */}
                  <div className="flex flex-1 flex-col justify-between gap-8">
                    <div className="flex flex-wrap gap-x-14 gap-y-8">
                      {item.columns.map((col) => (
                        <div key={col.title} className="min-w-[150px]">
                          <h4 className="pyne-eyebrow mb-4 whitespace-nowrap">{col.title}</h4>
                          <ul className="space-y-2.5">
                            {col.items.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={close}
                                  className="group flex items-center gap-2 whitespace-nowrap text-sm text-pyne-kraft transition-colors hover:text-pyne-orange"
                                >
                                  <span className="h-px w-0 bg-pyne-orange transition-all duration-200 group-hover:w-3" />
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <Link
                      href={item.href}
                      onClick={close}
                      className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-pyne-orange transition-colors hover:text-pyne-cream"
                    >
                      Ver todo {item.label}
                      <span aria-hidden>→</span>
                    </Link>
                  </div>

                  {/* Banner con la foto real de un producto de la categoría */}
                  {item.highlight && (
                    <Link
                      href={item.highlight.href}
                      onClick={close}
                      className="group relative block min-h-[220px] w-72 shrink-0 overflow-hidden rounded-xl border border-pyne-border bg-pyne-smoke"
                    >
                      <Image
                        src={item.highlight.image}
                        alt={item.highlight.title}
                        fill
                        sizes="288px"
                        className="object-cover opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-pyne-black via-pyne-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-6">
                        <p className="pyne-eyebrow mb-1">PYNE ✦ Selected</p>
                        <h3 className="font-display text-2xl uppercase text-pyne-cream">
                          {item.highlight.title}
                        </h3>
                        <p className="mt-1 text-xs text-pyne-muted">{item.highlight.subtitle}</p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}