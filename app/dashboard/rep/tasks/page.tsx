"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MobileHeader from "@/components/MobileHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
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

interface Request {
  id: string;
  title: string;
  type: string;
  status: string;
  description: string;
  location?: {
    city: string;
    address?: string;
  };
  budget?: string;
  createdAt: Timestamp;
}

export default function MyTasksPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [managingTask, setManagingTask] = useState<Request | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch tasks pending or in progress assigned to this rep
    const q = query(
      collection(db, "requests"),
      where("repId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Request[];
      setTasks(fetchedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!managingTask) return;
    setUpdating(true);
    try {
      const taskRef = doc(db, "requests", managingTask.id);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setManagingTask(null); // Close modal
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error al actualizar el estado");
    } finally {
      setUpdating(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "verificacion":
        return "directions_car";
      case "gestoria":
        return "description";
      case "compra":
        return "shopping_bag";
      default:
        return "help";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return (
          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
            Asignada
          </span>
        );
      case "in_progress":
        return (
          <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            En Curso
          </span>
        );
      case "completed":
        return (
          <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
            Completada
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-bold">
            Desconocido
          </span>
        );
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-slate-800 dark:text-slate-200">
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
            }, // Active link
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

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Mis Tareas
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Aquí están las solicitudes que has aceptado y estás gestionando.
              </p>
            </header>

            {loading ? (
              <div className="flex justify-center p-20">
                <span className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#1a2632] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">
                  assignment_add
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  No tienes tareas activas
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Ve al Panel de Control para buscar nuevas solicitudes de
                  clientes en tu zona.
                </p>
                <Link
                  href="/dashboard/rep"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors"
                >
                  Buscar Solicitudes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-[#1a2632] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">
                            {getTypeIcon(task.type)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">
                            {task.title}
                          </h3>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              location_on
                            </span>
                            {task.location?.city || "Sin ubicación"}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>

                    <div className="mb-6">
                      <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 gap-3">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="material-symbols-outlined text-lg">
                          calendar_month
                        </span>
                        {task.createdAt?.toDate().toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/chat?id=${task.id}`}
                          className="px-3 py-2 text-primary font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1 text-sm"
                        >
                          <span className="material-symbols-outlined text-lg">
                            chat
                          </span>
                          Chat
                        </Link>
                        <button
                          onClick={() => setManagingTask(task)}
                          className="px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors text-sm"
                        >
                          Gestionar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Manage Task Modal */}
      {managingTask && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setManagingTask(null)}
        >
          <div
            className="bg-white dark:bg-[#1a2632] rounded-2xl p-6 w-full max-w-sm shadow-xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Gestionar Tarea
            </h3>
            <p className="text-slate-500 mb-6 text-sm">
              Cambia el estado de:{" "}
              <span className="font-semibold">{managingTask.title}</span>
            </p>

            <div className="space-y-3">
              {managingTask.status === "assigned" && (
                <button
                  onClick={() => handleUpdateStatus("in_progress")}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  Comenzar Trabajo
                </button>
              )}

              {managingTask.status === "in_progress" && (
                <button
                  onClick={() => handleUpdateStatus("completed")}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>
                  Marcar como Completada
                </button>
              )}

              {managingTask.status === "completed" && (
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800">
                  <span className="material-symbols-outlined text-3xl text-green-500 mb-2">
                    task_alt
                  </span>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    Esta tarea ya ha sido completada.
                  </p>
                </div>
              )}

              <button
                onClick={() => setManagingTask(null)}
                className="w-full p-3 text-slate-500 hover:text-slate-700 font-medium mt-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
