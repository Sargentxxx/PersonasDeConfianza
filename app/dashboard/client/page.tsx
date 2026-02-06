"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import MobileHeader from "@/components/MobileHeader";
import { useAuth } from "@/components/AuthProvider";
import { db, auth } from "@/lib/firebase";
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
  createdAt: Timestamp;
  repId?: string;
  location?: {
    city: string;
  };
}

export default function ClientDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  // Rating Modal State
  const [ratingTask, setRatingTask] = useState<Request | null>(null);
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
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl font-medium transition-colors"
              >
                <span className="material-symbols-outlined">settings</span>
                Configuración
              </a>
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
              <Link
                href="/dashboard/client/new-request"
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                Nueva Solicitud
              </Link>
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
                                {req.createdAt
                                  ?.toDate()
                                  .toLocaleDateString("es-ES")}
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

                          <div className="flex gap-2 w-full sm:w-auto">
                            {/* Chat Button (Only if Assigned/In Progress/Completed) */}
                            {["assigned", "in_progress", "completed"].includes(
                              req.status,
                            ) && (
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
                              <button className="flex-1 sm:flex-none px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                Ver Detalles
                              </button>
                            )}
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
    </div>
  );
}
