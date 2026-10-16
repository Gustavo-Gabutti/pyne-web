"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { NAVIGATION } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export default function MegaMenu() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <nav
      className="relative hidden lg:flex lg:items-center lg:gap-1"
      onMouseLeave={() => setActive(null)}
    >
      {NAVIGATION.map((item) => (
        <div key={item.label} onMouseEnter={() => setActive(item.label)}>
          <Link
            href={item.href}
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
            <div className="absolute left-0 right-0 top-full z-50 animate-fadeUp">
              <div className="pyne-card mx-auto grid max-w-5xl grid-cols-12 gap-8 rounded-2xl p-8 shadow-2xl">
                {item.columns.map((col) => (
                  <div key={col.title} className="col-span-3">
                    <h4 className="pyne-eyebrow mb-4">{col.title}</h4>
                    <ul className="space-y-2.5">
                      {col.items.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setActive(null)}
                            className="group flex items-center gap-2 text-sm text-pyne-kraft transition-colors hover:text-pyne-orange"
                          >
                            <span className="h-px w-0 bg-pyne-orange transition-all duration-200 group-hover:w-3" />
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="col-span-6">
                  {item.highlight && (
                    <Link
                      href={item.highlight.href}
                      onClick={() => setActive(null)}
                      className="group relative block h-full min-h-[220px] overflow-hidden rounded-xl border border-pyne-border"
                    >
                      <Image
                        src={item.highlight.image}
                        alt={item.highlight.title}
                        fill
                        sizes="500px"
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