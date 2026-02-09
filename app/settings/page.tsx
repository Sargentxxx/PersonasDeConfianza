"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { storage } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function SettingsPage() {
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = useState("perfil");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data into state
  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await updateProfile(user, {
        displayName: name,
      });
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Optimistic UI update (optional, but good for UX) - forcing reload for now is simpler
    try {
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: url });
      alert(
        "Foto de perfil actualizada. Recarga la página para ver los cambios.",
      );
      // window.location.reload(); // Hard reload to show new image if Auth context doesn't auto-update immediately
    } catch (error) {
      console.error("Error uploading profile pic:", error);
      alert("Error al subir la imagen");
    }
  };

  const dashboardPath =
    userData?.role === "rep" ? "/dashboard/rep" : "/dashboard/client";

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-slate-800 dark:text-slate-200">
      {/* Navbar Content */}
      <nav className="bg-white dark:bg-[#1a2632] border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 lg:px-8">
        <Link
          href={dashboardPath}
          className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-semibold hidden sm:inline">
            Volver al Dashboard
          </span>
        </Link>
        <div className="font-bold text-lg">Configuración</div>
        <div className="w-8"></div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 lg:p-8">
        <div className="bg-white dark:bg-[#1a2632] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab("perfil")}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === "perfil" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              Mi Perfil
            </button>
            <button
              onClick={() => setActiveTab("seguridad")}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === "seguridad" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              Seguridad
            </button>
            <button
              onClick={() => setActiveTab("pagos")}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === "pagos" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              Métodos de Pago
            </button>
            <button
              onClick={() => setActiveTab("notificaciones")}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === "notificaciones" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              Notificaciones
            </button>
            {userData?.role === "rep" && (
              <button
                onClick={() => setActiveTab("verificacion")}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === "verificacion" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                Verificación de Identidad
              </button>
            )}
          </div>

          <div className="p-6 lg:p-8">
            {activeTab === "perfil" && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative group cursor-pointer">
                    <img
                      src={
                        user?.photoURL ||
                        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                      }
                      className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 dark:border-slate-700 group-hover:opacity-75 transition-opacity"
                      alt="Profile"
                      onClick={() => fileInputRef.current?.click()}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors shadow-lg"
                    >
                      <span className="material-symbols-outlined text-sm">
                        edit
                      </span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {user?.displayName || "Usuario"}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSave}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ""}
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed px-4 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      ID de Usuario
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user?.uid || ""}
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed px-4 py-2 font-mono text-xs"
                    />
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                      {loading ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "seguridad" && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Cambiar Contraseña
                  </h3>
                  <div className="space-y-4 max-w-md">
                    <input
                      type="password"
                      placeholder="Contraseña actual"
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="password"
                      placeholder="Nueva contraseña"
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="password"
                      placeholder="Confirmar nueva contraseña"
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    />
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors">
                      Actualizar Contraseña
                    </button>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Autenticación de dos pasos (2FA)
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <span className="material-symbols-outlined">
                          security
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          Autenticación por SMS
                        </p>
                        <p className="text-xs text-slate-500">
                          Recibe un código en tu teléfono al iniciar sesión.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "notificaciones" && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Preferencias de Notificación
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        id: "new_tasks",
                        label: "Nuevas tareas disponibles",
                        desc: "Te avisaremos cuando haya tareas cerca de tu ubicación.",
                      },
                      {
                        id: "chat",
                        label: "Mensajes de chat",
                        desc: "Recibe una notificación cuando un cliente te escriba.",
                      },
                      {
                        id: "status",
                        label: "Cambios de estado",
                        desc: "Alertas cuando una tarea cambie de estado.",
                      },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "verificacion" && userData?.role === "rep" && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">
                      badge
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Verificación de Identidad
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                    Para poder tomar tareas y recibir pagos, necesitamos
                    verificar tu identidad. Sube una foto de tu DNI o Pasaporte
                    (frente y dorso).
                  </p>

                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-medium">Estado:</span>
                      <span
                        className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                          userData?.verificationStatus === "verified"
                            ? "bg-green-100 text-green-700"
                            : userData?.verificationStatus === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : userData?.verificationStatus === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {userData?.verificationStatus === "verified"
                          ? "Verificado"
                          : userData?.verificationStatus === "pending"
                            ? "Pendiente de Revisión"
                            : userData?.verificationStatus === "rejected"
                              ? "Rechazado"
                              : "No Verificado"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4">
                      {[
                        { id: "front", label: "DNI (Frente)", icon: "badge" },
                        { id: "back", label: "DNI (Dorso)", icon: "badge" },
                        { id: "selfie", label: "Selfie con DNI", icon: "face" },
                      ].map((docType) => {
                        const isUploaded = !!userData?.[`doc_${docType.id}`];
                        return (
                          <button
                            key={docType.id}
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*";
                              input.onchange = async (e: any) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setLoading(true);
                                try {
                                  const { doc, updateDoc } =
                                    await import("firebase/firestore");
                                  const { db } = await import("@/lib/firebase");
                                  const storageRef = ref(
                                    storage,
                                    `verifications/${user?.uid}/${docType.id}`,
                                  );
                                  await uploadBytes(storageRef, file);
                                  const url = await getDownloadURL(storageRef);

                                  await updateDoc(doc(db, "users", user!.uid), {
                                    [`doc_${docType.id}`]: url,
                                    verificationStatus: "pending",
                                    verificationSubmittedAt: new Date(),
                                  });
                                  alert(
                                    `${docType.label} subida correctamente.`,
                                  );
                                } catch (err) {
                                  console.error(err);
                                  alert("Error al subir el documento");
                                } finally {
                                  setLoading(false);
                                }
                              };
                              input.click();
                            }}
                            disabled={
                              loading ||
                              userData?.verificationStatus === "verified"
                            }
                            className={`flex flex-col items-center p-4 rounded-xl border-2 border-dashed transition-all ${
                              isUploaded
                                ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                                : "border-slate-200 dark:border-slate-700 hover:border-primary bg-white dark:bg-slate-800"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-2xl mb-2 ${isUploaded ? "text-green-500" : "text-slate-400"}`}
                            >
                              {isUploaded ? "check_circle" : docType.icon}
                            </span>
                            <span className="text-xs font-bold">
                              {docType.label}
                            </span>
                            {isUploaded && (
                              <span className="text-[10px] text-green-600 font-medium">
                                Subido
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {userData?.verificationStatus === "pending" && (
                      <p className="text-xs text-slate-400 italic">
                        Tu documento está siendo procesado por nuestro equipo de
                        seguridad.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="material-symbols-outlined text-primary mb-2">
                      lock
                    </span>
                    <h4 className="font-bold text-sm mb-1">Privacidad</h4>
                    <p className="text-xs text-slate-500">
                      Tus datos están encriptados y protegidos.
                    </p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="material-symbols-outlined text-primary mb-2">
                      speed
                    </span>
                    <h4 className="font-bold text-sm mb-1">Rapidez</h4>
                    <p className="text-xs text-slate-500">
                      Revisamos los documentos en menos de 24hs.
                    </p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="material-symbols-outlined text-primary mb-2">
                      verified_user
                    </span>
                    <h4 className="font-bold text-sm mb-1">Confianza</h4>
                    <p className="text-xs text-slate-500">
                      Un perfil verificado atrae 3x más clientes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
