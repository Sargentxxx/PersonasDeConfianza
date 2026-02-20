"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  const requestId = searchParams.get("requestId");
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with animation */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-6xl text-green-500">
                check_circle
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-4">
              ¡Pago Exitoso!
            </h1>
            <p className="text-green-100 mt-2">
              Tu pago ha sido procesado correctamente
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-4">
              {/* Payment ID */}
              {paymentId && (
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">
                    ID de Pago
                  </p>
                  <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                    {paymentId}
                  </p>
                </div>
              )}

              {/* Status */}
              {status && (
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">
                    Estado
                  </p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {status === "approved" ? "Aprobado" : status}
                  </p>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                    info
                  </span>
                  <div>
                    <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-1">
                      ¿Qué sigue?
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      El dinero quedará en custodia hasta que el servicio se
                      complete satisfactoriamente y ambas partes se califiquen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="text-center pt-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Redirigiendo a tu panel en{" "}
                  <span className="font-bold text-primary">{countdown}</span>{" "}
                  segundos...
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push(`/dashboard/chat?id=${requestId}`)}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">chat</span>
                <span>Ir al Chat del Servicio</span>
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

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">lock</span>
            Pago procesado de forma segura por Mercado Pago
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></span>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
