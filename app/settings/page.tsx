"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { auth, storage } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
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

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-slate-800 dark:text-slate-200">
      {/* Navbar Content */}
      <nav className="bg-white dark:bg-[#1a2632] border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-semibold hidden sm:inline">
            Volver al Dashboard
          </span>
        </button>
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
