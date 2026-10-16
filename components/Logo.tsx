import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export default function Logo({ size = "md" }: LogoProps) {
  const dimensions = {
    sm: { width: 80, height: 80, className: "h-8 w-auto" },
    md: { width: 100, height: 100, className: "h-10 w-auto" },
    lg: { width: 140, height: 140, className: "h-14 w-auto" },
  }[size];

  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/logo.png"
        alt="PYNE Logo"
        width={dimensions.width}
        height={dimensions.height}
        className={`${dimensions.className} object-contain`}
        priority
      />
    </Link>
  );
}