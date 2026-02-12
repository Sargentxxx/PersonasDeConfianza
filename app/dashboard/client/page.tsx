"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import MobileHeader from "@/components/MobileHeader";
import { useAuth } from "@/components/AuthProvider";
import { db, auth } from "@/lib/firebase";
import NotificationBell from "@/components/NotificationBell";
import MercadoPagoButton from "@/components/MercadoPagoButton";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

interface Request {
  id: string;
  title: string;
  type: string;
  status: string;
  description?: string;
  createdAt: Timestamp;
  repId?: string;
  budget?: string | number;
  rating?: number;
  location?: {
    city: string;
    address?: string;
  };
}

export default function ClientDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  // Rating Modal State
  const [ratingTask, setRatingTask] = useState<Request | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "requests"),
      where("clientId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Request[];
      setRequests(fetchedRequests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleConfirmCompletion = async () => {
    if (!ratingTask) return;
    setSubmitting(true);

    try {
      const taskRef = doc(db, "requests", ratingTask.id);

      // 1. Update task status to closed
      await updateDoc(taskRef, {
        status: "closed",
        rating: rating,
        ratingComment: comment,
        closedAt: serverTimestamp(),
      });

      // 2. Ideally, we would also update the Rep's profile with this rating here

      setRatingTask(null);
      setComment("");
      setRating(5);
      alert("¡Gracias! Tu trámite ha sido cerrado correctamente.");
    } catch (error) {
      console.error("Error closing task:", error);
      alert("Hubo un error al guardar tu calificación.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-orange-500";
      case "assigned":
        return "text-blue-500";
      case "in_progress":
        return "text-green-500";
      case "completed":
        return "text-purple-600"; // Distinct color for ready-to-close
      case "closed":
        return "text-slate-500";
      default:
        return "text-slate-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Buscando Rep";
      case "assigned":
        return "Asignado";
      case "in_progress":
        return "En Progreso";
      case "completed":
        return "Finalizado (Confirmar)";
      case "closed":
        return "Cerrado";
      default:
        return "Desconocido";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "verificacion":
        return "Verificación Vehicular";
      case "gestoria":
        return "Trámite / Gestoría";
      case "compra":
        return "Compra / Pick-up";
      default:
        return "Otro";
    }
  };

  const activeRequestsCount = requests.filter(
    (r) => r.status !== "closed" && r.status !== "cancelled",
  ).length;
  const completedRequestsCount = requests.filter(
    (r) => r.status === "closed",
  ).length;
  const totalInvested = requests
    .filter((r) => r.status === "closed")
    .reduce((sum, r) => sum + Number(r.budget || 0), 0);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-slate-800 dark:text-slate-200">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex pt-0 lg:pt-0">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#1a2632] border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 hidden lg:flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined text-3xl">
                verified_user
              </span>
              <span className="font-bold text-xl">Personas de Confianza</span>
            </div>

            <div className="p-6 flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 text-xl font-bold uppercase">
                  {user?.displayName ? user.displayName.charAt(0) : "U"}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[120px]">
                  {user?.displayName || "Usuario"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cliente Verificado
                </p>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
              <Link
                href="/dashboard/client"
                className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-xl font-medium transition-colors"
              >
                <span className="material-symbols-outlined">dashboard</span>
                Mis Trámites
              </Link>
              <Link
                href="/dashboard/client/new-request"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl font-medium transition-colors"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Nueva Solicitud
              </Link>
              <Link
                href="/messages"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl font-medium transition-colors"
              >
                <span className="material-symbols-outlined">chat</span>
                Mensajes
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl font-medium transition-colors"
              >
                <span className="material-symbols-outlined">settings</span>
                Configuración
              </Link>
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => auth.signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
              >
                <span className="material-symbols-outlined">logout</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Mis Trámites
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Gestiona y da seguimiento a tus solicitudes activas.
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <NotificationBell />
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Cliente
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {user?.displayName || "Usuario"}
                  </p>
                </div>
                <Link
                  href="/settings"
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-primary/20 p-0.5 hover:border-primary transition-all overflow-hidden bg-slate-100"
                >
                  <img
                    src={
                      user?.photoURL ||
                      "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                    }
                    className="w-full h-full rounded-full object-cover"
                    alt="Profile"
                  />
                </Link>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <div className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">
                    pending_actions
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {activeRequestsCount}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Trámites en Curso
                </p>
              </div>
              <div className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">
                    check_circle
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {completedRequestsCount}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Completados
                </p>
              </div>
              <div className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">
                    payments
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  ${totalInvested}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total invertido
                </p>
              </div>
            </div>

            {/* Active Tasks List */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Todas las Solicitudes
              </h2>

              {loading ? (
                <div className="flex justify-center p-10">
                  <span className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></span>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">
                    inbox
                  </span>
                  <p className="text-slate-500 font-medium">
                    No tienes trámites en curso.
                  </p>
                  <Link
                    href="/dashboard/client/new-request"
                    className="text-primary hover:underline mt-2 inline-block"
                  >
                    crear una nueva solicitud
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white dark:bg-[#1a2632] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-primary text-xs font-bold uppercase tracking-wide">
                              {getTypeLabel(req.type)}
                            </span>
                            <span className="text-xs text-slate-400">
                              #{req.id.slice(0, 6).toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                            {req.title}{" "}
                            {req.location?.city ? `- ${req.location.city}` : ""}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-lg">
                                calendar_today
                              </span>
                              <span>
                                Iniciado:{" "}
                                {req.createdAt?.toDate
                                  ? req.createdAt
                                      .toDate()
                                      .toLocaleDateString("es-ES")
                                  : req.createdAt
                                    ? new Date(
                                        (req.createdAt as any).seconds * 1000,
                                      ).toLocaleDateString("es-ES")
                                    : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 items-center">
                          <div className="flex flex-col items-end mr-4">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              Estado
                            </span>
                            <span
                              className={`font-medium text-sm flex items-center gap-1 ${getStatusColor(req.status)}`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${req.status === "pending" || req.status === "assigned" ? "bg-current animate-pulse" : "bg-current"}`}
                              ></span>
                              {getStatusLabel(req.status)}
                            </span>
                          </div>

                          <div className="flex flex-col gap-3 w-full sm:w-auto">
                            {/* Payment Button - Solo si está asignado, tiene presupuesto y NO está pagado */}
                            {req.status === "assigned" &&
                              req.budget &&
                              Number(req.budget) > 0 &&
                              !(req as any).paymentId && (
                                <div className="w-full">
                                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2">
                                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                      <span className="material-symbols-outlined text-sm">
                                        info
                                      </span>
                                      <span>
                                        Paga para que el representante comience
                                      </span>
                                    </p>
                                  </div>
                                  <MercadoPagoButton
                                    requestId={req.id}
                                    title={req.title}
                                    amount={Number(req.budget)}
                                    clientEmail={user?.email || ""}
                                    clientName={user?.displayName || ""}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                  />
                                </div>
                              )}

                            <div className="flex gap-2">
                              {/* Chat Button (Only if Assigned/In Progress/Completed) */}
                              {[
                                "assigned",
                                "in_progress",
                                "completed",
                              ].includes(req.status) && (
                                <Link
                                  href={`/dashboard/chat?id=${req.id}`}
                                  className="flex-1 sm:flex-none px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-[20px]">
                                    chat
                                  </span>
                                  Chat
                                </Link>
                              )}

                              {/* Confirm Completion Button */}
                              {req.status === "completed" ? (
                                <button
                                  onClick={() => setRatingTask(req)}
                                  className="flex-1 sm:flex-none px-5 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                                >
                                  <span className="material-symbols-outlined text-[20px]">
                                    verified
                                  </span>
                                  Confirmar
                                </button>
                              ) : (
                                <button
                                  onClick={() => setSelectedRequest(req)}
                                  className="flex-1 sm:flex-none px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                >
                                  Ver Detalles
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Rating Modal */}
      {ratingTask && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setRatingTask(null)}
        >
          <div
            className="bg-white dark:bg-[#1a2632] rounded-2xl p-6 w-full max-w-md shadow-xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">
                  check_circle
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                ¡Trabajo Finalizado!
              </h3>
              <p className="text-slate-500 mt-2">
                Por favor confirma que se realizó el trabajo y califica al
                representante.
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <span
                    className={`material-symbols-outlined ${star <= rating ? "text-yellow-400 fill-current" : "text-slate-300"}`}
                  >
                    {star <= rating ? "star" : "star"}
                  </span>
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe un comentario o reseña (opcional)..."
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 mb-6 focus:ring-2 focus:ring-primary min-h-[100px]"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setRatingTask(null)}
                className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmCompletion}
                disabled={submitting}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70"
              >
                {submitting ? "Enviando..." : "Confirmar y Cerrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white dark:bg-[#1a2632] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
              {selectedRequest.location?.city ? (
                <div className="h-full w-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-primary/20">
                    map
                  </span>
                </div>
              ) : (
                <div className="h-full w-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-slate-400">
                    image_not_supported
                  </span>
                </div>
              )}
              <button
                onClick={() => setSelectedRequest(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all font-bold shadow-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-primary text-xs font-bold uppercase tracking-wide">
                      Trámite Activo
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      #{selectedRequest.id.slice(0, 8)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedRequest.title}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Presupuesto
                  </p>
                  <p className="text-2xl font-black text-green-600 dark:text-green-400">
                    {selectedRequest.budget
                      ? `$${selectedRequest.budget}`
                      : "A cotizar"}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">
                      info
                    </span>
                    Descripción del Trámite
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {/* Note: if description isn't in Interface, TS might complain. I'll add it if needed */}
                    {selectedRequest.description ||
                      "Sin descripción adicional."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">
                        location_on
                      </span>
                      Ubicación
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedRequest.location?.city}
                      <br />
                      <span className="text-xs opacity-70">
                        {selectedRequest.location?.address ||
                          "Dirección no detallada"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">
                        calendar_today
                      </span>
                      Fecha del Pedido
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedRequest.createdAt?.toDate
                        ? selectedRequest.createdAt
                            .toDate()
                            .toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                        : selectedRequest.createdAt
                          ? new Date(
                              (selectedRequest.createdAt as any).seconds * 1000,
                            ).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Fecha desconocida"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-10 flex gap-4">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  Cerrar
                </button>
                {["assigned", "in_progress", "completed"].includes(
                  selectedRequest.status,
                ) && (
                  <Link
                    href={`/dashboard/chat?id=${selectedRequest.id}`}
                    className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3"
                  >
                    Ir al Chat
                    <span className="material-symbols-outlined">chat</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
