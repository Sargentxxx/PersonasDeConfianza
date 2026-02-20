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
          <div className="flex items-center justify-center gap-3">
            <span className="font-bold">Pagar con</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/d/d1/MercadoPago_logo.svg"
              alt="Mercado Pago"
              style={{ height: "24px", width: "auto" }}
            />
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
