"use client";

import { useState } from "react";

interface MercadoPagoButtonProps {
  requestId: string;
  title: string;
  amount: number;
  clientEmail: string;
  clientName?: string;
  onPaymentCreated?: (initPoint: string) => void;
  className?: string;
}

function MercadoPagoLogo() {
  return (
    <div className="flex items-center justify-center gap-2 py-2 px-3 select-none pointer-events-none">
      {/* Ícono oficial de Mercado Pago (pin azul con manos) - inline SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 52 52"
        className="h-8 w-8 shrink-0"
        aria-hidden="true"
      >
        <circle cx="26" cy="26" r="26" fill="#009EE3" />
        <path
          fill="#fff"
          d="M38.3 22.3c0 3.2-1.2 6.1-3.2 8.2L26 39.7l-9.1-9.2c-2-2.1-3.2-5-3.2-8.2C13.7 15.5 19.3 10 26 10s12.3 5.5 12.3 12.3z"
        />
        <circle cx="26" cy="22.3" r="6.2" fill="#009EE3" />
      </svg>
      <span
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#009EE3",
          fontSize: "16px",
          fontWeight: 700,
          letterSpacing: "-0.3px",
        }}
      >
        Mercado<span style={{ fontWeight: 800 }}>Pago</span>
      </span>
    </div>
  );
}

export default function MercadoPagoButton({
  requestId,
  title,
  amount,
  clientEmail,
  clientName = "",
  onPaymentCreated,
  className = "",
}: MercadoPagoButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          title,
          amount,
          clientEmail,
          clientName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al crear la preferencia de pago",
        );
      }

      const data = await response.json();

      // En modo de prueba, usar sandbox_init_point; en producción, init_point
      const paymentUrl = data.sandbox_init_point || data.init_point;

      if (onPaymentCreated) {
        onPaymentCreated(paymentUrl);
      }

      // Redirigir al usuario a Mercado Pago
      window.location.href = paymentUrl;
    } catch (err: unknown) {
      console.error("Error creating payment:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al procesar el pago");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`${className} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? (
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="w-4 h-4 border-2 border-[#009EE3] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#009EE3] font-semibold text-sm">
              Procesando...
            </span>
          </div>
        ) : (
          <MercadoPagoLogo />
        )}
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
