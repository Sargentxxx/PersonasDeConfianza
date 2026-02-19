"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
      await updateDoc(taskRef, {
        status: "closed",
        rating: rating,
        ratingComment: comment,
        closedAt: serverTimestamp(),
      });
      setRatingTask(null);
      setComment("");
      setRating(5);
    } catch (error) {
      console.error("Error closing task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending": return { label: "Buscando Rep", color: "bg-orange-500/10 text-orange-500", icon: "search" };
      case "assigned": return { label: "Asignado", color: "bg-blue-500/10 text-blue-500", icon: "person_check" };
      case "payment_pending": return { label: "Pago Pendiente", color: "bg-amber-500/10 text-amber-500", icon: "payment" };
      case "paid": return { label: "Pagado", color: "bg-emerald-500/10 text-emerald-500", icon: "check_circle" };
      case "in_progress": return { label: "En Progreso", color: "bg-primary/10 text-primary", icon: "engineering" };
      case "completed": return { label: "Finalizado", color: "bg-purple-500/10 text-purple-500", icon: "verified" };
      case "closed": return { label: "Cerrado", color: "bg-slate-500/10 text-slate-500", icon: "archive" };
      default: return { label: "Desconocido", color: "bg-slate-500/10 text-slate-500", icon: "help" };
    }
  };

  const activeCount = requests.filter(r => !["closed", "cancelled"].includes(r.status)).length;
  const completedCount = requests.filter(r => r.status === "closed").length;
  const totalSpent = requests.filter(r => r.status === "closed").reduce((s, r) => s + Number(r.budget || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex overflow-hidden">
      {/* Premium Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900/50 backdrop-blur-3xl border-r border-slate-200 dark:border-white/5 transform transition-all duration-500 ease-spring lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full p-8">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <span className="font-display text-lg font-black tracking-tight">
              <span className="text-primary font-black">Personas</span>DeConfianza
            </span>
          </Link>

          <nav className="flex-1 space-y-2">
            {[
              { label: "Dashboard", icon: "grid_view", href: "/dashboard/client", active: true },
              { label: "Nuevo Trámite", icon: "add_circle", href: "/dashboard/client/new-request" },
              { label: "Mensajes", icon: "chat_bubble", href: "/dashboard/chat", count: 2 },
              { label: "Directorio", icon: "find_in_page", href: "#" },
              { label: "Mi Perfil", icon: "account_circle", href: "/settings" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${item.active
                    ? "bg-primary text-white shadow-xl shadow-primary/30"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </div>
                {item.count && (
                  <span className="w-5 h-5 bg-accent text-white rounded-full text-[10px] flex items-center justify-center font-black animate-pulse">
                    {item.count}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform"></div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Ayuda</p>
              <h4 className="font-bold text-sm mb-3">¿Necesitas soporte?</h4>
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all backdrop-blur-md">Contactar</button>
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
      <main className="flex-1 h-screen overflow-y-auto relative">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#f8fafc]/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-8 py-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                <span className="material-symbols-outlined">menu</span>
              </button>
              <div>
                <h1 className="font-display text-2xl font-black tracking-tight flex items-center gap-3">
                  Hola, {user?.displayName?.split(' ')[0] || "Usuario"} 👋
                </h1>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Gestión de trámites activos</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center bg-slate-200/50 dark:bg-white/5 rounded-2xl px-4 py-2 border border-slate-200 dark:border-white/5 group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <span className="material-symbols-outlined text-slate-400">search</span>
                <input type="text" placeholder="Buscar trámite..." className="bg-transparent border-none outline-none px-3 text-sm font-medium w-48 group-focus:w-64 transition-all" />
              </div>
              <NotificationBell />
              <Link href="/settings" className="relative group">
                <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary transition-all">
                  <img src={user?.photoURL || "https://i.pravatar.cc/100"} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#f8fafc] dark:border-[#020617] rounded-full"></div>
              </Link>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {[
              { label: "Trámites Activos", value: activeCount, color: "text-primary", bg: "bg-primary/5", icon: "pending_actions" },
              { label: "Completados", value: completedCount, color: "text-emerald-500", bg: "bg-emerald-500/5", icon: "verified" },
              { label: "Inversión Total", value: `$${totalSpent}`, color: "text-purple-500", bg: "bg-purple-500/5", icon: "wallet" },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-3xl font-bold">{stat.icon}</span>
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <div className="text-4xl font-black tracking-tight">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Main Grid Content */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-2xl font-black tracking-tight">Solicitudes Recientes</h2>
              <Link href="/dashboard/client/new-request" className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <span className="material-symbols-outlined">add</span>
                Nuevo Trámite
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                {[1, 2].map(i => <div key={i} className="h-64 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-white/5"></div>)}
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5">
                <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400 mb-6">
                  <span className="material-symbols-outlined text-4xl">inventory_2</span>
                </div>
                <h3 className="font-display text-xl font-black mb-2 tracking-tight">No tienes solicitudes todavía</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs text-center font-medium">Comienza solicitando un representante para cualquier tarea que necesites.</p>
                <Link href="/dashboard/client/new-request" className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-lg transition-all hover:scale-105">Empezar ahora</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {requests.map(req => {
                  const status = getStatusInfo(req.status);
                  return (
                    <div key={req.id} className="group bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden flex flex-col h-full">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-8">
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                          <span className="material-symbols-outlined text-[14px]">{status.icon}</span>
                          {status.label}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{req.id.slice(0, 8)}</span>
                      </div>

                      <div className="mb-auto">
                        <h3 className="font-display text-2xl font-black leading-tight mb-4 group-hover:text-primary transition-colors">{req.title}</h3>
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 mb-6">
                          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            {req.location?.city || "Remoto"}
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl">
                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                            {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'Pendiente'}
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-8">{req.description || "Sin descripción adicional proporcionada."}</p>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Presupuesto</span>
                          <span className="text-xl font-black tracking-tight text-emerald-500">{req.budget ? `$${req.budget}` : 'A cotizar'}</span>
                        </div>

                        <div className="flex gap-2">
                          {req.status === "completed" ? (
                            <button onClick={() => setRatingTask(req)} className="px-6 py-3 bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95">Finalizar</button>
                          ) : (
                            <>
                              {["assigned", "in_progress"].includes(req.status) && (
                                <Link href={`/dashboard/chat?id=${req.id}`} className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-2xl transition-all hover:bg-primary hover:text-white">
                                  <span className="material-symbols-outlined">chat</span>
                                </Link>
                              )}
                              <button onClick={() => setSelectedRequest(req)} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs rounded-2xl transition-all hover:scale-105">Detalles</button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Special Payment Button */}
                      {req.status === "assigned" && req.budget && !req.id.includes('_X_') && ( // Mock check for payment
                        <div className="mt-4">
                          <MercadoPagoButton
                            requestId={req.id}
                            title={req.title}
                            amount={Number(req.budget)}
                            clientEmail={user?.email || ""}
                            clientName={user?.displayName || ""}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all shadow-lg shadow-blue-500/20"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal Redesign */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-6" onClick={() => setSelectedRequest(null)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="h-40 bg-gradient-to-br from-primary via-primary-dark to-slate-900 p-12 flex items-end relative">
              <button onClick={() => setSelectedRequest(null)} className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest">
                    {getStatusInfo(selectedRequest.status).label}
                  </span>
                  <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">Trámite #{selectedRequest.id.slice(0, 8)}</span>
                </div>
                <h2 className="font-display text-4xl font-black text-white leading-none">{selectedRequest.title}</h2>
              </div>
            </div>
            <div className="p-12">
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-6">
                  <div className="group">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">description</span> Descripción
                    </p>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{selectedRequest.description || "No hay descripción adicional."}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">payments</span> Inversión
                    </p>
                    <p className="text-3xl font-black text-emerald-500 tracking-tight">{selectedRequest.budget ? `$${selectedRequest.budget}` : 'A cotizar'}</p>
                  </div>
                  <div className="flex items-center gap-10">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Destino</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-tight">{selectedRequest.location?.city || "Sin definir"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-tight">
                        {selectedRequest.createdAt?.toDate ? selectedRequest.createdAt.toDate().toLocaleDateString() : 'Procesando'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setSelectedRequest(null)} className="flex-1 py-4 px-6 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all outline-none">Volver</button>
                {["assigned", "in_progress"].includes(selectedRequest.status) && (
                  <Link href={`/dashboard/chat?id=${selectedRequest.id}`} className="flex-[2] py-4 px-6 bg-primary text-white text-center font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    Ir al Chat del Trámite
                    <span className="material-symbols-outlined">chat</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal Redesign */}
      {ratingTask && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-lg p-6" onClick={() => setRatingTask(null)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-12 text-center animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <span className="material-symbols-outlined text-5xl font-bold">verified</span>
            </div>
            <h2 className="font-display text-4xl font-black mb-4 tracking-tight">¡Misión cumplida!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">Ayúdanos a mejorar calificando tu experiencia con este representante.</p>

            <div className="flex justify-center gap-3 mb-10">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} className={`text-4xl transition-all hover:scale-125 ${star <= rating ? "text-yellow-400" : "text-slate-300 dark:text-slate-700"}`}>
                  <span className="material-symbols-outlined text-4xl leading-none fill-current">{star <= rating ? "star" : "star"}</span>
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Cuéntanos un poco más sobre el servicio..."
              className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-3xl p-6 mb-8 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all min-h-[120px]"
            />

            <div className="flex flex-col gap-4">
              <button onClick={handleConfirmCompletion} disabled={submitting} className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 transition-all">Confirmar Trámite</button>
              <button onClick={() => setRatingTask(null)} className="w-full py-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Ahora no</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
