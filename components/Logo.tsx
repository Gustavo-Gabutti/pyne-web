import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export default function Logo({ size = "md" }: LogoProps) {
  const dimensions = {
    sm: { width: 36, height: 36, className: "h-9 w-9" },
    md: { width: 44, height: 44, className: "h-11 w-11" },
    lg: { width: 56, height: 56, className: "h-14 w-14" },
  }[size];

  return (
    <Link href="/" className="flex items-center gap-2">
      <div className={`${dimensions.className} relative overflow-hidden rounded-full shrink-0`}>
        <Image
          src="/logo.jpg"
          alt="PYNE Logo"
          fill
          sizes="56px"
          className="object-cover"
          priority
        />
      </div>
    </Link>
  );
}