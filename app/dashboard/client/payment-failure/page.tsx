"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  const requestId = searchParams.get("requestId");
  const statusDetail = searchParams.get("status_detail");

  useEffect(() => {
    if (countdown === 0) {
      router.push("/dashboard/client");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  // Traducir mensajes de error
  const getErrorMessage = () => {
    if (statusDetail === "cc_rejected_insufficient_amount") {
      return "Fondos insuficientes en la tarjeta";
    }
    if (statusDetail === "cc_rejected_bad_filled_security_code") {
      return "Código de seguridad incorrecto";
    }
    if (statusDetail === "cc_rejected_call_for_authorize") {
      return "Debes autorizar el pago con tu banco";
    }
    return "El pago fue rechazado. Por favor, intenta nuevamente.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Failure Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-600 p-8 text-center">
            <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-red-500">
                cancel
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-4">
              Pago Rechazado
            </h1>
            <p className="text-red-100 mt-2">No se pudo procesar tu pago</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-4">
              {/* Error Message */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                    error
                  </span>
                  <div>
                    <p className="text-sm text-red-900 dark:text-red-100 font-semibold mb-1">
                      Motivo del rechazo
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {getErrorMessage()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                    lightbulb
                  </span>
                  <div>
                    <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">
                      Sugerencias
                    </p>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                      <li>
                        Verifica que los datos de tu tarjeta sean correctos
                      </li>
                      <li>Asegúrate de tener fondos suficientes</li>
                      <li>Intenta con otro método de pago</li>
                      <li>Contacta a tu banco si el problema persiste</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="text-center pt-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Redirigiendo al panel en{" "}
                  <span className="font-bold text-primary">{countdown}</span>{" "}
                  segundos...
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() =>
                  router.push(`/dashboard/client?retry=${requestId}`)
                }
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">refresh</span>
                <span>Intentar Nuevamente</span>
              </button>
              <button
                onClick={() => router.push("/dashboard/client")}
                className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">dashboard</span>
                <span>Volver al Panel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ¿Necesitas ayuda?{" "}
            <a
              href="/settings"
              className="text-primary hover:underline font-semibold"
            >
              Contacta soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></span>
        </div>
      }
    >
      <PaymentFailureContent />
    </Suspense>
  );
}
