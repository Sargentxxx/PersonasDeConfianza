"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileHeader from "@/components/MobileHeader";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
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
      // The list will automatically update because of the snapshot listener
    } catch (error) {
      console.error("Error applying for task:", error);
      alert("Error al tomar la tarea. Inténtalo de nuevo.");
    } finally {
      setApplyingId(null);
    }
  };

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
        return "real_estate_agent"; // Example additional type
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
            { label: "Ingresos", href: "#", icon: "payments" },
            {
              label: "Mensajes",
              href: "/messages",
              icon: "chat",
              badge: "5",
              badgeColor: "bg-red-500",
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
                  $0
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ingresos este mes
                </p>
              </div>
              <div className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">
                    assignment_turned_in
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  0
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
                  5.0
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
                  10min
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
                                "Aplicar para este trabajo"
                              )}
                            </button>
                            <button className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
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
    </div>
  );
}
