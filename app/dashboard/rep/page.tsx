"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/AuthProvider";
import { db, auth } from "@/lib/firebase";
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
    <div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl"></div>
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
  status: string;
  rating?: number;
}

export default function RepDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, userData } = useAuth();

  const [availableTasks, setAvailableTasks] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Request | null>(null);
  const [stats, setStats] = useState({
    income: 0,
    completed: 0,
    rating: 0,
    responseTime: "10min",
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [historyTasks, setHistoryTasks] = useState<Request[]>([]);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  const handleApply = async (taskId: string) => {
    if (!user || applyingId) return;
    setApplyingId(taskId);
    try {
      const taskRef = doc(db, "requests", taskId);
      await updateDoc(taskRef, {
        status: "assigned",
        repId: user.uid,
        repName: user.displayName || "Representante",
        assignedAt: serverTimestamp(),
      });
      setSelectedTask(null);
    } catch (error) {
      console.error("Error applying for task:", error);
    } finally {
      setApplyingId(null);
    }
  };

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "requests"), where("repId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let income = 0;
      let completed = 0;
      let totalRating = 0;
      let ratedCount = 0;
      const history: Request[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.status === "closed" || data.status === "completed") {
          completed++;
          income += Number(data.budget || 0);
          if (data.rating) {
            totalRating += data.rating;
            ratedCount++;
          }
          history.push({ id: doc.id, ...data } as Request);
        }
      });
      setHistoryTasks(history);
      setStats((prev) => ({
        ...prev,
        income,
        completed,
        rating: ratedCount > 0 ? totalRating / ratedCount : 5.0,
      }));
    });
    return () => unsubscribe();
  }, [user]);

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

  const markers = availableTasks
    .filter((t) => t.location?.lat && t.location?.lng)
    .map((t) => ({
      position: [t.location!.lat!, t.location!.lng!] as [number, number],
      title: t.title,
    }));

  const mapCenter: [number, number] =
    markers.length > 0 ? markers[0].position : [-34.6037, -58.3816];

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "verificacion":
        return "directions_car";
      case "gestoria":
        return "description";
      case "compra":
        return "shopping_bag";
      default:
        return "work";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex overflow-hidden">
      {/* Premium Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900/50 backdrop-blur-3xl border-r border-slate-200 dark:border-white/5 transform transition-all duration-500 ease-spring lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full p-8">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-2xl">
                verified_user
              </span>
            </div>
            <span className="font-display text-lg font-black tracking-tight">
              <span className="text-primary font-black">Personas</span>
              DeConfianza
            </span>
          </Link>

          <nav className="flex-1 space-y-2">
            {[
              {
                label: "Oportunidades",
                icon: "explore",
                href: "/dashboard/rep",
                active: true,
              },
              {
                label: "Mis Tareas",
                icon: "assignment_late",
                href: "/dashboard/rep/tasks",
              },
              {
                label: "Ingresos",
                icon: "payments",
                href: "#",
                onClick: () => setSelectedStat("income"),
              },
              { label: "Mensajes", icon: "forum", href: "/messages", count: 3 },
              { label: "Configuración", icon: "settings", href: "/settings" },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.onClick}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                  item.active
                    ? "bg-primary text-white shadow-xl shadow-primary/30"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-bold text-sm tracking-tight">
                    {item.label}
                  </span>
                </div>
                {item.count && (
                  <span className="px-2 py-0.5 bg-accent text-white rounded-full text-[10px] font-black">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="p-6 rounded-[2rem] bg-gradient-to-tr from-primary to-primary-dark text-white relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                  Nivel Actual
                </p>
                <h4 className="font-black text-lg mb-3">Premium Rep</h4>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-white w-[75%] rounded-full"></div>
                </div>
                <p className="text-[10px] font-bold text-white/80">
                  350xp para el siguiente nivel
                </p>
              </div>
            </div>
            <button
              onClick={() => auth.signOut()}
              className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-500/10 rounded-2xl font-bold transition-all"
            >
              <span className="material-symbols-outlined">logout</span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative bg-[#f8fafc] dark:bg-[#020617]">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#f8fafc]/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm text-slate-600 dark:text-slate-300"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <div>
                <h1 className="font-display text-2xl font-black tracking-tight">
                  Panel de Representante
                </h1>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                  Explora nuevas misiones en tu zona
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-2xl flex items-center gap-2 border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                <span className="text-xs font-black uppercase tracking-widest">
                  En línea
                </span>
              </div>
              <NotificationBell />
              <Link
                href="/settings"
                className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-primary/20 hover:ring-primary transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user?.photoURL || "https://i.pravatar.cc/100"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </Link>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                label: "Ingresos Brutos",
                value: `$${stats.income}`,
                icon: "payments",
                color: "text-blue-500",
                bg: "bg-blue-500/5",
                onClick: () => setSelectedStat("income"),
              },
              {
                label: "Tareas Completadas",
                value: stats.completed,
                icon: "verified",
                color: "text-emerald-500",
                bg: "bg-emerald-500/5",
                onClick: () => setSelectedStat("completed"),
              },
              {
                label: "Calificación",
                value: `${stats.rating.toFixed(1)} ★`,
                icon: "star",
                color: "text-yellow-500",
                bg: "bg-yellow-500/5",
                onClick: () => setSelectedStat("rating"),
              },
              {
                label: "Tiempo Respuesta",
                value: stats.responseTime,
                icon: "bolt",
                color: "text-purple-500",
                bg: "bg-purple-500/5",
                onClick: () => setSelectedStat("response"),
              },
            ].map((stat, i) => (
              <button
                key={i}
                onClick={stat.onClick}
                className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-left"
              >
                <div
                  className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform`}
                >
                  <span className="material-symbols-outlined text-2xl font-bold">
                    {stat.icon}
                  </span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  {stat.label}
                </p>
                <div className="text-3xl font-black tracking-tight">
                  {stat.value}
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map & List Section */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm h-[400px] relative">
                <Map center={mapCenter} zoom={12} markers={markers} />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl shadow-2xl z-[10]">
                  <p className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      near_me
                    </span>
                    {availableTasks.length} Tareas disponibles cerca
                  </p>
                </div>
              </div>

              <div>
                <h2 className="font-display text-2xl font-black tracking-tight mb-6">
                  Misiones Sugeridas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  {loading ? (
                    [1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-32 bg-white dark:bg-slate-900/50 rounded-3xl animate-pulse"
                      ></div>
                    ))
                  ) : availableTasks.length === 0 ? (
                    <div className="py-20 text-center bg-white dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5">
                      <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">
                        search_off
                      </span>
                      <p className="font-bold text-slate-500">
                        Nada por aquí... ¡Sigue atento!
                      </p>
                    </div>
                  ) : (
                    availableTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group bg-white dark:bg-slate-900/50 rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all flex flex-col sm:flex-row items-start sm:items-center gap-6"
                      >
                        <div className="w-16 h-16 bg-primary/5 text-primary rounded-[1.5rem] flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                          <span className="material-symbols-outlined text-3xl">
                            {getStatusIcon(task.type)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-display font-black text-lg tracking-tight group-hover:text-primary transition-colors">
                              {task.title}
                            </h3>
                            {task.location?.city && (
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-md">
                                {task.location.city}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                            {task.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-white/5">
                          <div className="text-right shrink-0">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                              Presupuesto
                            </p>
                            <p className="text-lg font-black text-emerald-500">
                              ${task.budget || "?"}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-2xl hover:scale-105 active:scale-95 transition-all"
                          >
                            Ver Misión
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Notifications & Active Sidebar */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <h3 className="font-display text-xl font-black mb-6">
                  Alertas Flash
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                    <span className="material-symbols-outlined text-orange-500 text-xl">
                      priority_high
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white mb-1">
                        Trámite urgente en tu zona
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase font-black">
                        Hace 5 min
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-center text-slate-400 font-bold py-4">
                    No hay más alertas
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full -mb-20 -mr-20 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <h3 className="font-display text-xl font-black mb-4">
                  Consejo Pro
                </h3>
                <p className="text-sm font-medium text-indigo-100 leading-relaxed mb-6">
                  Completa 5 misiones esta semana para desbloquear la insignia
                  de &quot;Ejecutor de Confianza&quot; y duplicar tus propinas.
                </p>
                <button className="px-6 py-3 bg-white text-indigo-600 font-black text-xs rounded-2xl shadow-xl transition-all hover:translate-x-2">
                  Saber más
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Task Details Modal Redesign */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-6"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-40 bg-gradient-to-br from-primary via-primary-dark to-slate-900 p-12 flex items-end relative">
              <button
                onClick={() => setSelectedTask(null)}
                className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all flex items-center justify-center border border-white/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-[10px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                    Nueva Misión
                  </span>
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                    Job #{selectedTask.id.slice(0, 8)}
                  </span>
                </div>
                <h2 className="font-display text-4xl font-black text-white leading-none">
                  {selectedTask.title}
                </h2>
              </div>
            </div>
            <div className="p-12">
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">
                        description
                      </span>{" "}
                      Detalles de la tarea
                    </p>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedTask.description}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">
                        payments
                      </span>{" "}
                      Pago Estimado
                    </p>
                    <p className="text-4xl font-black text-emerald-500 tracking-tight">
                      ${selectedTask.budget || "?"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 italic">
                      Este valor incluye la comisión de la plataforma
                    </p>
                  </div>
                  <div className="flex items-center gap-10 pt-4 border-t border-slate-100 dark:border-white/5">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Ciudad
                      </p>
                      <p className="text-sm font-bold text-slate-700 dark:text-white uppercase">
                        {selectedTask.location?.city || "Pendiente"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Creado
                      </p>
                      <p className="text-sm font-bold text-slate-700 dark:text-white uppercase">
                        {selectedTask.createdAt?.toDate
                          ? selectedTask.createdAt.toDate().toLocaleDateString()
                          : "Nuevo"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 py-4 px-6 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all outline-none"
                >
                  Volver
                </button>
                <button
                  onClick={() => handleApply(selectedTask.id)}
                  disabled={applyingId === selectedTask.id}
                  className="flex-[2] py-4 px-6 bg-primary text-white text-center font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {applyingId === selectedTask.id
                    ? "Aceptando..."
                    : "Aceptar Misión"}
                  <span className="material-symbols-outlined">
                    rocket_launch
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modals (Simplified for brevity but consistent) */}
      {selectedStat && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-6"
          onClick={() => setSelectedStat(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-12 text-center animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-3xl font-black mb-8 tracking-tight capitalize">
              {selectedStat}
            </h2>
            <div className="py-20 text-slate-400 font-bold">
              Resumen detallado de {selectedStat} en desarrollo...
            </div>
            <button
              onClick={() => setSelectedStat(null)}
              className="w-full py-5 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black rounded-2xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
