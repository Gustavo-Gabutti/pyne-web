import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  message?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function EmptyState({
  title = "Nada por acá",
  message = "No encontramos resultados para tu búsqueda.",
  ctaLabel = "Volver al inicio",
  ctaHref = "/",
}: EmptyStateProps) {
  return (
    <div className="pyne-card flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
      <span className="text-5xl text-pyne-orange">✦</span>
      <h3 className="font-display text-2xl uppercase tracking-wide text-pyne-cream">{title}</h3>
      <p className="max-w-md text-sm text-pyne-muted">{message}</p>
      <Link href={ctaHref} className="pyne-btn-outline mt-2">
        {ctaLabel}
      </Link>
    </div>
  );
}