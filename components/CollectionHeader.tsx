import Link from "next/link";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href: string;
}

interface FilterLink {
  label: string;
  href: string;
  active?: boolean;
}

interface CollectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  count?: number;
  breadcrumbs?: Crumb[];
  filters?: FilterLink[];
  sortOptions?: FilterLink[];
}

export default function CollectionHeader({
  eyebrow = "PYNE ✦ Selected Goods",
  title,
  description,
  count,
  breadcrumbs = [],
  filters = [],
  sortOptions = [],
}: CollectionHeaderProps) {
  return (
    <header className="border-b border-pyne-border pb-8">
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-pyne-muted"
        >
          {breadcrumbs.map((c, i) => (
            <span key={c.href} className="flex items-center gap-2">
              <Link href={c.href} className="transition hover:text-pyne-orange">
                {c.label}
              </Link>
              {i < breadcrumbs.length - 1 && <span className="text-pyne-border">/</span>}
            </span>
          ))}
        </nav>
      )}

      <p className="pyne-eyebrow">{eyebrow}</p>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl uppercase leading-none tracking-tight text-pyne-cream sm:text-5xl lg:text-6xl">
          {title}
        </h1>

        {typeof count === "number" && (
          <span className="rounded-full border border-pyne-border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] text-pyne-muted">
            {count} {count === 1 ? "producto" : "productos"}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-pyne-muted">{description}</p>
      )}

      {filters.length > 0 && (
        <div className="mt-7">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-pyne-muted">
            Filtrar
          </p>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className={cn(
                  "rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition",
                  f.active
                    ? "border-pyne-orange bg-pyne-orange text-pyne-black"
                    : "border-pyne-border text-pyne-kraft hover:border-pyne-orange hover:text-pyne-orange"
                )}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {sortOptions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-pyne-muted">
            Ordenar
          </span>

          <div className="flex flex-wrap gap-1.5">
            {sortOptions.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                scroll={false}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[11px] transition",
                  s.active
                    ? "bg-pyne-smoke text-pyne-orange"
                    : "text-pyne-muted hover:text-pyne-cream"
                )}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}