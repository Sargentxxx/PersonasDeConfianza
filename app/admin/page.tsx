"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileHeader from "@/components/MobileHeader";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { sendNotification } from "@/lib/notifications";

interface PendingUser {
  id: string;
  displayName: string;
  email: string;
  verificationStatus: string;
  doc_front?: string;
  doc_back?: string;
  doc_selfie?: string;
  verificationSubmittedAt?: Timestamp;
  role: string;
  photoURL?: string;
  location?: {
    city: string;
  };
}

interface PDCUser {
  id: string;
  name?: string;
  displayName?: string;
  email: string;
  role: string;
  verificationStatus?: string;
  photoURL?: string;
}

interface RequestData {
  id: string;
  title: string;
  clientName: string;
  repName: string;
  status: string;
  budget?: number;
}

export default function AdminDashboard() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("validation");
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<PDCUser[]>([]);
  const [disputes, setDisputes] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [stats, setStats] = useState({ totalGain: 0, completedTasks: 0 });

  useEffect(() => {
    if (!authLoading) {
      if (!userData || userData.role !== "admin") {
        router.push("/dashboard/client");
      }
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    if (userData?.role !== "admin") return;
    const q = query(
      collection(db, "users"),
      where("verificationStatus", "==", "pending"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: PendingUser[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PendingUser[];
      setPendingUsers(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  useEffect(() => {
    if (userData?.role !== "admin") return;

    // Fetch Global Stats for Commissions
    const unsubStats = onSnapshot(collection(db, "requests"), (snapshot) => {
      let gain = 0;
      let count = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.status === "completed" && data.budget) {
          gain += data.budget * 0.15; // 15% commission
          count++;
        }
      });
      setStats({ totalGain: gain, completedTasks: count });
    });

    return () => unsubStats();
  }, [userData]);

  useEffect(() => {
    if (userData?.role !== "admin") return;

    if (activeTab === "users") {
      setUsersLoading(true);
      const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
        setAllUsers(
          snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as PDCUser,
          ),
        );
        setUsersLoading(false);
      });
      return () => unsubscribe();
    }

    if (activeTab === "disputes") {
      setDisputesLoading(true);
      const q = query(
        collection(db, "requests"),
        where("status", "==", "disputed"),
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setDisputes(
          snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as RequestData,
          ),
        );
        setDisputesLoading(false);
      });
      return () => unsubscribe();
    }
  }, [activeTab, userData]);

  // Loading screen to prevent content flash for non-admins
  if (authLoading || !userData || userData.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">
            Verificando credenciales de administrador...
          </p>
        </div>
      </div>
    );
  }

  const handleVerifyUser = async (
    userId: string,
    status: "verified" | "rejected",
  ) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        verificationStatus: status,
        verifiedAt: status === "verified" ? new Date() : null,
      });

      // Trigger Notification
      await sendNotification({
        recipientId: userId,
        title:
          status === "verified"
            ? "¡Perfil Verificado!"
            : "Verificación Rechazada",
        message:
          status === "verified"
            ? "Tu identidad ha sido confirmada. Ya puedes tomar tareas."
            : "Hubo un problema con tus documentos. Por favor intenta de nuevo.",
        type: "validation",
        link: "/settings",
      });

      alert(
        `Usuario ${status === "verified" ? "verificado" : "rechazado"} correctamente`,
      );
    } catch (err) {
      console.error(err);
      alert("Error al actualizar estado del usuario");
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-slate-800 dark:text-slate-200">
      {/* Mobile Header */}
      <MobileHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        title="Panel de Administración"
      />

      <div className="flex pt-0 lg:pt-0">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-slate-800 hidden lg:flex items-center gap-3 text-white">
              <span className="material-symbols-outlined text-3xl text-primary">
                admin_panel_settings
              </span>
              <span className="font-bold text-xl">Panel de Administración</span>
            </div>

            <div className="p-6">
              <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-4">
                Gestión
              </h3>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("validation")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "validation" ? "bg-blue-600/20 text-blue-400" : "hover:bg-slate-800 hover:text-white text-slate-400"}`}
                >
                  <span className="material-symbols-outlined">verified</span>
                  Validación Usuarios
                  {pendingUsers.length > 0 && (
                    <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {pendingUsers.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("disputes")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "disputes" ? "bg-blue-600/20 text-blue-400" : "hover:bg-slate-800 hover:text-white text-slate-400"}`}
                >
                  <span className="material-symbols-outlined">gavel</span>
                  Disputas
                </button>
                <button
                  onClick={() => setActiveTab("commissions")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "commissions" ? "bg-blue-600/20 text-blue-400" : "hover:bg-slate-800 hover:text-white text-slate-400"}`}
                >
                  <span className="material-symbols-outlined">payments</span>
                  Comisiones (15%)
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "users" ? "bg-blue-600/20 text-blue-400" : "hover:bg-slate-800 hover:text-white text-slate-400"}`}
                >
                  <span className="material-symbols-outlined">group</span>
                  Usuarios
                </button>
              </nav>

              <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider mt-8 mb-4">
                Sistema
              </h3>
              <nav className="space-y-2">
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors"
                >
                  <span className="material-symbols-outlined">settings</span>
                  Configuración
                </Link>
              </nav>
            </div>

            <div className="mt-auto p-4 border-t border-slate-800">
              <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">
                  AD
                </div>
                <div className="text-sm">
                  <p className="font-bold text-white">Admin</p>
                  <p className="text-xs text-slate-500">admin@pdc.com</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const { getAuth, signOut } = await import("firebase/auth");
                  const auth = getAuth();
                  await signOut(auth);
                  router.push("/auth");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl font-medium transition-colors text-left"
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
          <header className="mb-10 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {activeTab === "validation"
                  ? "Verificación de Identidad"
                  : activeTab === "disputes"
                    ? "Gestión de Disputas"
                    : activeTab === "commissions"
                      ? "Comisiones"
                      : "Usuarios"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {activeTab === "validation"
                  ? "Revisa y aprueba solicitudes de nuevos representantes."
                  : activeTab === "disputes"
                    ? "Resuelve conflictos entre clientes y representantes."
                    : activeTab === "commissions"
                      ? "Configura y visualiza ganancias por comisiones."
                      : "Administra todos los usuarios de la plataforma."}
              </p>
            </div>
            <NotificationBell />
          </header>

          {activeTab === "validation" && (
            <div className="animate-fade-in">
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500">Cargando solicitudes...</p>
                  </div>
                ) : pendingUsers.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-[#1a2632] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">
                      done_all
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Todo al día
                    </h3>
                    <p className="text-slate-500">
                      No hay solicitudes de verificación pendientes.
                    </p>
                  </div>
                ) : (
                  pendingUsers.map((pUser) => (
                    <div
                      key={pUser.id}
                      className="bg-white dark:bg-[#1a2632] rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              pUser.photoURL ||
                              "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                            }
                            alt={`${pUser.displayName}'s profile picture`}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                              {pUser.displayName}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {pUser.email} •{" "}
                              {pUser.location?.city ||
                                "Ubicación no especificada"}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Enviado:{" "}
                              {pUser.verificationSubmittedAt
                                ?.toDate()
                                .toLocaleString() || "Recientemente"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              handleVerifyUser(pUser.id, "rejected")
                            }
                            className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100 transition-colors"
                          >
                            Rechazar
                          </button>
                          <button
                            onClick={() =>
                              handleVerifyUser(pUser.id, "verified")
                            }
                            className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                          >
                            Aprobar Perfil
                          </button>
                        </div>
                      </div>
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 text-sm uppercase tracking-wide">
                          Documentación Presentada
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[
                            {
                              id: "front",
                              label: "DNI (Frente)",
                              icon: "badge",
                            },
                            { id: "back", label: "DNI (Dorso)", icon: "badge" },
                            {
                              id: "selfie",
                              label: "Selfie con DNI",
                              icon: "face",
                            },
                          ].map((docType) => {
                            const docUrl = (pUser as any)[`doc_${docType.id}`];
                            return (
                              <div
                                key={docType.id}
                                className="bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-slate-200 dark:border-slate-700"
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="material-symbols-outlined text-primary text-lg">
                                    {docType.icon}
                                  </span>
                                  <span className="font-semibold text-sm">
                                    {docType.label}
                                  </span>
                                </div>
                                {docUrl ? (
                                  <a
                                    href={docUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="aspect-video bg-slate-200 rounded-lg relative overflow-hidden group cursor-pointer block"
                                  >
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all z-10">
                                      <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100">
                                        visibility
                                      </span>
                                    </div>
                                    <img
                                      src={docUrl}
                                      alt={docType.label}
                                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform"
                                    />
                                  </a>
                                ) : (
                                  <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 text-xs italic border border-dashed border-slate-300 dark:border-slate-700">
                                    No cargado
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Badges footer */}
                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                            Revisión Manual Requerida
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full">
                            IP: {pUser.location?.city || "Argentina"}
                          </span>
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full">
                            Dispositivo: Móvil / Chrome
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "disputes" && (
            <div className="animate-fade-in">
              {disputesLoading ? (
                <div className="text-center py-20">
                  <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-500">Cargando disputas...</p>
                </div>
              ) : disputes.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#1a2632] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">
                    gavel
                  </span>
                  <h3 className="text-xl font-bold">Sin disputas activas</h3>
                  <p className="text-slate-500">
                    Todo parece estar en orden entre usuarios.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {disputes.map((dispute) => (
                    <div
                      key={dispute.id}
                      className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-bold text-lg">{dispute.title}</h4>
                        <p className="text-sm text-slate-500">
                          Cliente: {dispute.clientName} • Rep: {dispute.repName}
                        </p>
                        <p className="text-xs text-red-500 mt-1 font-bold">
                          Estado: EN DISPUTA
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/chat?id=${dispute.id}`}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold"
                      >
                        Ver Chat & Resolver
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "commissions" && (
            <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 text-sm font-bold uppercase mb-2">
                    Ganancia Total
                  </p>
                  <p className="text-3xl font-black text-primary">
                    ${stats.totalGain.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 text-sm font-bold uppercase mb-2">
                    Comisión Actual
                  </p>
                  <p className="text-3xl font-black text-green-500">15%</p>
                </div>
                <div className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 text-sm font-bold uppercase mb-2">
                    Tareas Finalizadas
                  </p>
                  <p className="text-3xl font-black text-blue-500">
                    {stats.completedTasks}
                  </p>
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
                <p className="text-yellow-700 dark:text-yellow-500 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined">info</span>
                  La recaudación de comisiones se procesará automáticamente vía
                  Mercado Pago al finalizar cada servicio.
                </p>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="animate-fade-in">
              <div className="bg-white dark:bg-[#1a2632] rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {usersLoading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500">
                      Cargando lista de usuarios...
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                          <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                            Usuario
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                            Rol
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {allUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    user.photoURL ||
                                    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                                  }
                                  className="w-8 h-8 rounded-full"
                                  alt={`${user.name || user.displayName}'s avatar`}
                                />
                                <div>
                                  <p className="font-bold text-sm">
                                    {user.name || user.displayName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-700" : user.role === "rep" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`w-2 h-2 rounded-full inline-block mr-2 ${user.verificationStatus === "verified" ? "bg-green-500" : "bg-yellow-500"}`}
                              ></span>
                              <span className="text-xs">
                                {user.verificationStatus || "normal"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button className="text-primary hover:underline text-xs font-bold">
                                Editar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
