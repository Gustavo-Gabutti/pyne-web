"use client";

import { useState } from "react";
import { Truck, Calculator, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ShippingOption {
  type: string;
  price: number;
  time: string;
}

export default function ShippingCalculator() {
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [options, setOptions] = useState<ShippingOption[] | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCp = postalCode.trim();

    if (!cleanCp || cleanCp.length < 4) {
      setError("Ingresá un Código Postal válido (ej. 3600 o C1002)");
      setOptions(null);
      return;
    }

    setError("");
    setLoading(true);

    // Simulación de cotización Paq.Ar con despacho exclusivo desde Formosa Capital (CP 3600)
    setTimeout(() => {
      // Intraprovincial / Local Formosa (CP 36xx)
      const isLocalFormosa = cleanCp.startsWith("36");
      // Regional cercano NEA (Corrientes, Chaco, Misiones: CP 34xx, 35xx, 33xx)
      const isRegional =
        cleanCp.startsWith("34") || cleanCp.startsWith("35") || cleanCp.startsWith("33");

      let baseSucursal = 6500;
      let baseDomicilio = 8900;
      let estimatedTime = "3 a 5 días hábiles";

      if (isLocalFormosa) {
        baseSucursal = 4200;
        baseDomicilio = 5500;
        estimatedTime = "24 a 48 hs hábiles";
      } else if (isRegional) {
        baseSucursal = 5100;
        baseDomicilio = 6800;
        estimatedTime = "48 a 72 hs hábiles";
      }

      setOptions([
        {
          type: "Correo Argentino — Retiro en Sucursal",
          price: baseSucursal,
          time: estimatedTime,
        },
        {
          type: "Correo Argentino — Entrega a Domicilio",
          price: baseDomicilio,
          time: estimatedTime,
        },
      ]);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="rounded-2xl border border-pyne-border bg-pyne-smoke/60 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <Truck className="h-5 w-5 text-pyne-orange" />
        <h4 className="font-display text-base uppercase text-pyne-cream">
          Cotizar Envío (Despacho desde Formosa Capital ✦ CP 3600)
        </h4>
      </div>

      <p className="mt-1.5 text-xs leading-relaxed text-pyne-muted">
        Ingresá tu Código Postal para calcular la tarifa estimada de Correo Argentino (Paq.Ar) a cualquier punto del país.
      </p>

      <form onSubmit={handleCalculate} className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Ej: 3600"
            maxLength={8}
            value={postalCode}
            onChange={(e) => {
              setPostalCode(e.target.value);
              if (error) setError("");
            }}
            className="w-full text-xs uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !postalCode.trim()}
          className="pyne-btn-primary px-5 py-2.5 text-[11px] disabled:opacity-50"
        >
          {loading ? (
            <span className="animate-pulse">Calculando…</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Calculator className="h-3.5 w-3.5" />
              Calcular
            </span>
          )}
        </button>
      </form>

      {error && <p className="mt-2 text-[11px] text-pyne-ember">⚠ {error}</p>}

      {options && (
        <div className="mt-4 space-y-2.5 border-t border-pyne-border/60 pt-4 animate-fadeUp">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-pyne-kraft">
            Opciones de envío desde Formosa a CP {postalCode.toUpperCase()}:
          </p>
          {options.map((opt) => (
            <div
              key={opt.type}
              className="flex items-center justify-between rounded-xl border border-pyne-border bg-pyne-black/40 p-3 text-xs"
            >
              <div>
                <span className="block font-medium text-pyne-cream">{opt.type}</span>
                <span className="text-[10px] text-pyne-muted">Demora: {opt.time}</span>
              </div>
              <span className="font-display text-base text-pyne-orange">
                {formatPrice(opt.price)}
              </span>
            </div>
          ))}
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-pyne-muted">
            <CheckCircle2 className="h-3.5 w-3.5 text-pyne-orange shrink-0" />
            <span>Despacho en sucursal Formosa en 24hs hábiles tras confirmar tu pedido por WhatsApp.</span>
          </div>
        </div>
      )}
    </div>
  );
}