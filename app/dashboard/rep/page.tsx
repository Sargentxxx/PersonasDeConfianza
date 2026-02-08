"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileHeader from "@/components/MobileHeader";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import NotificationBell from "@/components/NotificationBell";
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

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
  ),
});

interface Request {
  id: string;
  title: string;
  type: string;
  description: string;
  location?: {
    city: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  budget?: string;
  createdAt: Timestamp;
}

export default function RepDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const [availableTasks, setAvailableTasks] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Request | null>(null);
  const [stats, setStats] = useState({
    income: 0,
    completed: 0,
    rating: 0,
    responseTime: "10min", // Placeholder for now
  });

  const handleApply = async (taskId: string) => {
    if (!user || applyingId) return;

    if (!confirm("¿Estás seguro de que quieres tomar esta tarea?")) return;

    setApplyingId(taskId);
    try {
      const taskRef = doc(db, "requests", taskId);
      await updateDoc(taskRef, {
        status: "assigned",
        repId: user.uid,
        repName: user.displayName || "Representante",
        assignedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error applying for task:", error);
      alert("Error al tomar la tarea. Inténtalo de nuevo.");
    } finally {
      setApplyingId(null);
    }
  };

  // Load stats
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "requests"), where("repId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let income = 0;
      let completed = 0;
      let totalRating = 0;
      let ratedCount = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.status === "closed") {
          completed++;
          income += Number(data.budget || 0);
          if (data.rating) {
            totalRating += data.rating;
            ratedCount++;
          }
        }
      });

      setStats((prev) => ({
        ...prev,
        income,
        completed,
        rating: ratedCount > 0 ? totalRating / ratedCount : 5.0,
      }));
    });
    return () => unsubscribe();
  }, [user]);

  // Load available tasks (status: "pending")
  useEffect(() => {
    const q = query(
      collection(db, "requests"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Request[];
      setAvailableTasks(fetchedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Create markers from available tasks
  const markers = availableTasks
    .filter((t) => t.location?.lat && t.location?.lng)
    .map((t) => ({
      position: [t.location!.lat!, t.location!.lng!] as [number, number],
      title: t.title,
    }));

  // Initial center (Buenos Aires by default, or first task)
  const mapCenter: [number, number] =
    markers.length > 0 ? markers[0].position : [-34.6037, -58.3816];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "verificacion":
        return "directions_car";
      case "gestoria":
        return "description";
      case "compra":
        return "shopping_bag";
      case "real_estate":
        return "real_estate_agent";
      default:
        return "help";
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

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-slate-800 dark:text-slate-200">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex pt-0 lg:pt-0">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={{
            name: user?.displayName || "Usuario",
            role: "Rep. Verificado",
            image:
              user?.photoURL ||
              "https://lh3.googleusercontent.com/aida-public/AB6AXuBZnIA3x48aCRPG67Yfe8TDpzOHonG6pAJ6zSbd9u3yBIgqP7BK_eZqtU1-C_RF2UP2xRkEeEUZgmTYCZuf9jd8u4J1R7sjikJ5YJpUUbypBycWYaaW0ln2t40NQ7iKDaYaRF2p8-EM4uWuRCEuFBgarQsnTT7IeF3bDmQfDHwcHQ-LLzXzxYIPKG6axJp_3FAwlh69fTLWz3aVHy__GLTwxacekIWpg1PyDzLBNzmnddJn9nxuxOIZQOtSBC7xHnT-QQw8a2ZUcw",
          }}
          links={[
            {
              label: "Panel de Control",
              href: "/dashboard/rep",
              icon: "dashboard",
            },
            {
              label: "Mis Tareas",
              href: "/dashboard/rep/tasks",
              icon: "assignment_turned_in",
            },
            {
              label: "Historial",
              href: "/dashboard/rep/tasks",
              icon: "history",
            },
            {
              label: "Mensajes",
              href: "/messages",
              icon: "chat",
            },
            { label: "Configuración", href: "/settings", icon: "settings" },
          ]}
        />

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
                  Dashboard
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Bienvenida de nuevo,{" "}
                  {user?.displayName
                    ? user.displayName.split(" ")[0]
                    : "colega"}
                  . Aquí tienes tu resumen.
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <NotificationBell />
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Representante
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {user?.displayName || "Representante"}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">
                    payments
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  ${stats.income}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ingresos totales
                </p>
              </div>
              <div className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">
                    assignment_turned_in
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {stats.completed}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tareas completadas
                </p>
              </div>
              <div className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">
                    star
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {stats.rating.toFixed(1)}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Calificación promedio
                </p>
              </div>
              <div className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">
                    bolt
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {stats.responseTime}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tiempo resp. medio
                </p>
              </div>
            </div>

            {/* Map Section */}
            <div className="mb-8 w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 relative z-0">
              <Map center={mapCenter} zoom={11} markers={markers} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Active Task / Status */}
              <div className="xl:col-span-2 space-y-8">
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Tareas Disponibles Cercanas
                    </h2>
                    <button className="text-primary font-medium text-sm hover:underline">
                      Ver mapa más grande
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center p-10 bg-white dark:bg-[#1a2632] rounded-2xl border border-slate-100 dark:border-slate-700">
                      <span className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></span>
                      <span className="ml-3 text-slate-500">
                        Buscando solicitudes cercanas...
                      </span>
                    </div>
                  ) : availableTasks.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-[#1a2632] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                      <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">
                        location_off
                      </span>
                      <p className="text-slate-500 font-medium">
                        No hay solicitudes disponibles en este momento.
                      </p>
                      <p className="text-sm text-slate-400">
                        ¡Vuelve a revisar en unos minutos!
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-[#1a2632] rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                      {availableTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <span className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-500">
                                  {getTypeIcon(task.type)}
                                </span>
                              </span>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-sm tracking-wide">
                                  {getTypeLabel(task.type)}
                                </h4>
                                <h5 className="font-bold text-md text-slate-900 dark:text-white mt-0.5">
                                  {task.title}
                                </h5>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[10px]">
                                    location_on
                                  </span>
                                  {task.location?.city}{" "}
                                  {task.location?.address
                                    ? `• ${task.location.address}`
                                    : ""}
                                </p>
                              </div>
                            </div>
                            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                              {task.budget ? `$${task.budget}` : "A cotizar"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                            {task.description}
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApply(task.id)}
                              disabled={applyingId === task.id}
                              className="flex-1 bg-primary text-white py-2 rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {applyingId === task.id ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                  Procesando...
                                </>
                              ) : (
                                "Aplicar"
                              )}
                            </button>
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              Ver detalles
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Right Column (Notifications/Activity) */}
              <div className="xl:col-span-1">
                <div className="bg-white dark:bg-[#1a2632] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 sticky top-24">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">
                      notifications
                    </span>
                    Actividad Reciente
                  </h3>
                  <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-700">
                    <div className="relative pl-8">
                      <p className="text-sm text-slate-500 italic">
                        No tienes notificaciones nuevas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-white dark:bg-[#1a2632] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
              {selectedTask.location?.lat && selectedTask.location?.lng ? (
                <div className="h-full w-full">
                  {/* Simplified Map or placeholder */}
                  <div className="h-full w-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-primary/20">
                      map
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-full w-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-slate-400">
                    image_not_supported
                  </span>
                </div>
              )}
              <button
                onClick={() => setSelectedTask(null)}
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
                      {getTypeLabel(selectedTask.type)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      #{selectedTask.id.slice(0, 8)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedTask.title}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Presupuesto
                  </p>
                  <p className="text-2xl font-black text-green-600 dark:text-green-400">
                    {selectedTask.budget
                      ? `$${selectedTask.budget}`
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
                    {selectedTask.description}
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
                      {selectedTask.location?.city}
                      <br />
                      <span className="text-xs opacity-70">
                        {selectedTask.location?.address ||
                          "Dirección no especificada"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">
                        calendar_today
                      </span>
                      Fecha de Creación
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedTask.createdAt?.toDate
                        ? selectedTask.createdAt
                            .toDate()
                            .toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                        : selectedTask.createdAt
                          ? new Date(
                              (selectedTask.createdAt as any).seconds * 1000,
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
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    handleApply(selectedTask.id);
                    setSelectedTask(null);
                  }}
                  disabled={applyingId === selectedTask.id}
                  className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {applyingId === selectedTask.id
                    ? "Procesando..."
                    : "Aplicar para este Trabajo"}
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scaleIn 0.2s cubic-bezier(0, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
