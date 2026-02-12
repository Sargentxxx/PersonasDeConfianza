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

      // En modo de prueba, usar sandbox_init_point
      // En producción, usar init_point
      const paymentUrl = data.sandbox_init_point || data.init_point;

      if (onPaymentCreated) {
        onPaymentCreated(paymentUrl);
      }

      // Redirigir al usuario a Mercado Pago
      window.location.href = paymentUrl;
    } catch (err: any) {
      console.error("Error creating payment:", err);
      setError(err.message || "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`${className} ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Procesando...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 4h18v2H3V4zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" />
            </svg>
            <span>Pagar con Mercado Pago</span>
          </div>
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
