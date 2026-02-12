// 💡 EJEMPLO DE USO DEL BOTÓN DE PAGO EN EL DASHBOARD DEL CLIENTE
// Este archivo muestra cómo integrar el botón de Mercado Pago en tu interfaz

import MercadoPagoButton from "@/components/MercadoPagoButton";
import { useAuth } from "@/components/AuthProvider";

export default function ExampleClientDashboard() {
  const { user } = useAuth();

  // Ejemplo de datos de una solicitud desde Firebase
  const exampleRequest = {
    id: "request_123",
    title: "Verificar estado de auto en Córdoba",
    description:
      "Necesito que alguien vaya a ver un auto usado antes de comprarlo",
    amount: 5000,
    status: "accepted", // El representante aceptó el presupuesto
    clientId: user?.uid,
    repId: "rep_456",
    repName: "Juan Pérez",
    createdAt: new Date(),
  };

  // Verificar si debe mostrar el botón de pago
  const shouldShowPaymentButton =
    exampleRequest.status === "accepted" && !exampleRequest.paymentId;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mis Solicitudes</h1>

      {/* Card de la solicitud */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {exampleRequest.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {exampleRequest.description}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              exampleRequest.status === "accepted"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            }`}
          >
            {exampleRequest.status === "accepted" ? "Esperando pago" : "Pagado"}
          </span>
        </div>

        {/* Rep Info */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            {exampleRequest.repName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {exampleRequest.repName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Representante asignado
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Monto acordado
          </p>
          <p className="text-3xl font-bold text-primary">
            ${exampleRequest.amount.toLocaleString("es-AR")}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            + comisión de plataforma incluida
          </p>
        </div>

        {/* Payment Button - Solo se muestra si está aceptado y no pagado */}
        {shouldShowPaymentButton && (
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                  info
                </span>
                <div>
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-1">
                    El servicio fue aceptado
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Para que el representante pueda comenzar, debes abonar el
                    servicio. El dinero quedará en custodia hasta que el trabajo
                    esté completo.
                  </p>
                </div>
              </div>
            </div>

            <MercadoPagoButton
              requestId={exampleRequest.id}
              title={exampleRequest.title}
              amount={exampleRequest.amount}
              clientEmail={user?.email || ""}
              clientName={user?.displayName || ""}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              onPaymentCreated={(url) => {
                console.log("Redirigiendo a Mercado Pago:", url);
                // Opcional: Guardar en analytics que el usuario inició el pago
              }}
            />

            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              Pago 100% seguro procesado por Mercado Pago
            </p>
          </div>
        )}

        {/* Ya pagado */}
        {exampleRequest.paymentId && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
                check_circle
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                  Pago confirmado
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  El dinero está en custodia. El representante comenzará el
                  servicio.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <button className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">chat</span>
            <span>Chatear</span>
          </button>
          <button className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">
              visibility
            </span>
            <span>Ver detalles</span>
          </button>
        </div>
      </div>

      {/* EJEMPLO 2: Versión compacta en una lista */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Versión Compacta (Lista)</h2>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {exampleRequest.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ${exampleRequest.amount.toLocaleString("es-AR")} • Aceptado
            </p>
          </div>
          {shouldShowPaymentButton && (
            <MercadoPagoButton
              requestId={exampleRequest.id}
              title={exampleRequest.title}
              amount={exampleRequest.amount}
              clientEmail={user?.email || ""}
              clientName={user?.displayName || ""}
              className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            />
          )}
        </div>
      </div>

      {/* EJEMPLO 3: Versión en modal */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Versión Modal (Confirmación)</h2>
        <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-white">
                payments
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Confirmar Pago
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Estás a punto de pagar el servicio
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Servicio
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {exampleRequest.title}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Representante
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {exampleRequest.repName}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-600">
              <span className="text-base font-semibold text-slate-900 dark:text-white">
                Total
              </span>
              <span className="text-2xl font-bold text-primary">
                ${exampleRequest.amount.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          <MercadoPagoButton
            requestId={exampleRequest.id}
            title={exampleRequest.title}
            amount={exampleRequest.amount}
            clientEmail={user?.email || ""}
            clientName={user?.displayName || ""}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all mb-3"
          />

          <button className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-3 px-6 rounded-xl transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
