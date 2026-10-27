import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getNavigation } from "@/lib/menu";
import { WHATSAPP_NUMBER } from "@/lib/utils";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const display = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pyne.com.ar"),
  title: {
    default: "PYNE ✦ Vintage & Selected Goods",
    template: "%s | PYNE ✦",
  },
  description:
    "PYNE — Vintage & Selected Goods. Zapatillas deadstock, indumentaria vintage y accesorios seleccionados. Envíos a todo el país.",
  keywords: ["zapatillas", "vintage", "streetwear", "deadstock", "sneakers", "PYNE"],
  icons: {
    icon: "/icon.jpg",
    shortcut: "/icon.jpg",
    apple: "/icon.jpg",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "PYNE",
    title: "PYNE ✦ Vintage & Selected Goods",
    description: "Zapatillas, indumentaria y accesorios seleccionados.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0D0D",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Menú con las fotos reales del inventario (Sanity), con respaldo si falla
  const navigation = await getNavigation();

  return (
    <html
      lang="es"
      className={`dark ${sans.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans" suppressHydrationWarning>
        <CartProvider>
          <Navbar navigation={navigation} />
          <main className="flex-1">{children}</main>
          <footer className="mt-24 border-t border-pyne-border bg-pyne-coal/50">
            <div className="pyne-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-4">
                <Logo size="md" />
                <p className="max-w-xs text-xs leading-relaxed text-pyne-muted">
                  Vintage & Selected Goods. Curamos piezas con historia: sneakers deadstock,
                  indumentaria de archivo y accesorios elegidos uno por uno.
                </p>
              </div>

              {navigation.map((item) => (
                <div key={item.label}>
                  <h4 className="pyne-eyebrow mb-4">{item.label}</h4>
                  <ul className="space-y-2">
                    {item.columns
                      ?.flatMap((c) => c.items)
                      .slice(0, 6)
                      .map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="text-xs text-pyne-kraft transition hover:text-pyne-orange"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t border-pyne-border">
              <div className="pyne-container flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
                <p className="text-[11px] uppercase tracking-[0.16em] text-pyne-muted">
                  © {new Date().getFullYear()} PYNE ✦ Todos los derechos reservados
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] uppercase tracking-[0.16em] text-pyne-orange hover:text-pyne-cream"
                >
                  WhatsApp: +54 9 3704 23-3558
                </a>
              </div>
            </div>
          </footer>

          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}