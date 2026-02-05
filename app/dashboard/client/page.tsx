"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-orange-500";
      case "assigned":
        return "text-blue-500";
      case "in_progress":
        return "text-green-500";
      case "completed":
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
        return "Completado";
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
    (r) => r.status !== "completed" && r.status !== "cancelled",
  ).length;
  const completedRequestsCount = requests.filter(
    (r) => r.status === "completed",
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
                En Curso
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
                                className={`w-2 h-2 rounded-full ${req.status === "pending" ? "bg-orange-500 animate-pulse" : "bg-current"}`}
                              ></span>
                              {getStatusLabel(req.status)}
                            </span>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            {(req.status === "assigned" ||
                              req.status === "in_progress") && (
                              <Link
                                href={`/dashboard/chat/${req.id}`}
                                className="flex-1 sm:flex-none px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  chat
                                </span>
                                Chat
                              </Link>
                            )}
                            <button className="flex-1 sm:flex-none px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                              Ver Detalles
                            </button>
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
    </div>
  );
}
