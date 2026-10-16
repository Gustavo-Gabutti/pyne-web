import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withCircle?: boolean;
}

const SIZES = {
  sm: { box: "h-9 w-9", text: "text-sm", star: "text-[7px]" },
  md: { box: "h-11 w-11", text: "text-base", star: "text-[9px]" },
  lg: { box: "h-24 w-24", text: "text-3xl", star: "text-sm" },
};

export default function Logo({
  className,
  size = "md",
  withCircle = true,
}: LogoProps) {
  const s = SIZES[size];

  return (
    <Link
      href="/"
      aria-label="PYNE — Vintage & Selected Goods"
      className={cn("group inline-flex items-center gap-3", className)}
    >
      {withCircle && (
        <span
          className={cn(
            "relative grid shrink-0 place-items-center rounded-full border-2 border-pyne-kraft/70 bg-pyne-black transition-colors group-hover:border-pyne-orange",
            s.box
          )}
        >
          <span className="font-display text-[10px] font-black tracking-tight text-pyne-cream">
            P
          </span>
        </span>
      )}

      <span className="flex items-baseline gap-[3px]">
        <span
          className={cn(
            "font-display font-black uppercase leading-none tracking-[0.02em] text-pyne-cream transition-colors group-hover:text-white",
            s.text
          )}
        >
          PYNE
        </span>
        <span className={cn("leading-none text-pyne-orange", s.star)}>✦</span>
      </span>
    </Link>
  );
}