"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import MobileHeader from "@/components/MobileHeader";
import { useAuth } from "@/components/AuthProvider";

export default function NewRequestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("gestoria"); // Default option
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    let lat = null;
    let lng = null;

    try {
      console.log("Geocodificando dirección:", address, city);
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        throw new Error("Google Maps API Key no configurada");
      }

      // 1. Geocode the address using Google Maps Geocoding API
      const query = `${address}, ${city}`;
      let response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          query,
        )}&key=${apiKey}`,
      );
      let data = await response.json();

      if (data.status === "ZERO_RESULTS") {
        console.warn(
          "Dirección exacta no encontrada, intentando solo ciudad...",
        );
        // Fallback: Try just the city
        response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            city,
          )}&key=${apiKey}`,
        );
        data = await response.json();
      }

      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        lat = location.lat;
        lng = location.lng;
        console.log("Coordenadas encontradas:", lat, lng);
      } else {
        console.warn(
          "No se encontraron coordenadas para esta ubicación.",
          data.status,
        );
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      // We continue even if geocoding fails, just without coordinates
    }

    try {
      if (!lat || !lng) {
        if (
          !confirm(
            "No pudimos localizar la dirección exacta en el mapa. ¿Deseas publicar la solicitud de todos modos (sin pin en el mapa)?",
          )
        ) {
          setIsLoading(false);
          return;
        }
      }

      // 2. Add request to Firestore
      await addDoc(collection(db, "requests"), {
        clientId: user.uid,
        clientName: user.displayName || "Usuario",
        clientEmail: user.email,
        title,
        type,
        description,
        location: {
          address,
          city,
          lat,
          lng,
        },
        dueDate: date,
        budget: budget || null, // Guardamos el presupuesto
        status: "pending", // pending, assigned, in_progress, completed, cancelled
        createdAt: serverTimestamp(),
        repId: null, // No representative assigned yet
      });

      // Redirect back to dashboard
      console.log("Solicitud creada exitosamente");
      router.push("/dashboard/client");
    } catch (error) {
      console.error("Error creating request:", error);
      alert("Hubo un error al crear la solicitud. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-slate-800 dark:text-slate-200">
      <MobileHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex pt-0 lg:pt-0">
        {/* Reuse Sidebar Structure (Manually for now to ensure consistency with main dashboard if component isn't fully ready) */}
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

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-6">
              <Link
                href="/dashboard/client"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl font-medium transition-colors"
              >
                <span className="material-symbols-outlined">dashboard</span>
                Mis Trámites
              </Link>
              <Link
                href="/dashboard/client/new-request"
                className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-xl font-medium transition-colors"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Nueva Solicitud
              </Link>
              {/* Other links can be added here */}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <Link
                href="/auth"
                className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
              >
                <span className="material-symbols-outlined">logout</span>
                Cerrar Sesión
              </Link>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-x-hidden">
          <div className="max-w-3xl mx-auto">
            <header className="mb-8">
              <Link
                href="/dashboard/client"
                className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-4 transition-colors"
              >
                <span className="material-symbols-outlined text-lg mr-1">
                  arrow_back
                </span>
                Volver al panel
              </Link>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Nueva Solicitud
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Completa los detalles para encontrar un representante de
                confianza.
              </p>
            </header>

            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-[#1a2632] rounded-2xl shadow-[var(--shadow-md)] border border-slate-100 dark:border-slate-700 p-[var(--space-md)] sm:p-8 animate-fade-in"
            >
              {/* Sección 1: Qué necesitas */}
              <div className="mb-[var(--space-md)]">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-primary text-xs">
                    1
                  </span>
                  ¿Qué tipo de trámite es?
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--space-md)] mb-[var(--space-md)]">
                  <label
                    className={`cursor-pointer border p-[var(--space-md)] rounded-xl transition-all duration-300 ${type === "gestoria" ? "border-primary bg-blue-50 dark:bg-blue-900/20 shadow-[var(--shadow-md)] ring-1 ring-primary" : "border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-[var(--shadow-md)] hover:-translate-y-1"}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="gestoria"
                      checked={type === "gestoria"}
                      onChange={(e) => setType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">
                        description
                      </span>
                      <div>
                        <span className="block font-medium text-slate-900 dark:text-white">
                          Trámite / Gestoría
                        </span>
                        <span className="text-xs text-slate-500">
                          Legalizaciones, apostillas, bancos
                        </span>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`cursor-pointer border p-[var(--space-md)] rounded-xl transition-all duration-300 ${type === "verificacion" ? "border-primary bg-blue-50 dark:bg-blue-900/20 shadow-[var(--shadow-md)] ring-1 ring-primary" : "border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-[var(--shadow-md)] hover:-translate-y-1"}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="verificacion"
                      checked={type === "verificacion"}
                      onChange={(e) => setType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">
                        directions_car
                      </span>
                      <div>
                        <span className="block font-medium text-slate-900 dark:text-white">
                          Verificación Vehicular
                        </span>
                        <span className="text-xs text-slate-500">
                          Inspección física de auto/moto
                        </span>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`cursor-pointer border p-[var(--space-md)] rounded-xl transition-all duration-300 ${type === "compra" ? "border-primary bg-blue-50 dark:bg-blue-900/20 shadow-[var(--shadow-md)] ring-1 ring-primary" : "border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-[var(--shadow-md)] hover:-translate-y-1"}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="compra"
                      checked={type === "compra"}
                      onChange={(e) => setType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">
                        shopping_bag
                      </span>
                      <div>
                        <span className="block font-medium text-slate-900 dark:text-white">
                          Compra / Pick-up
                        </span>
                        <span className="text-xs text-slate-500">
                          Retirar un producto y enviarlo
                        </span>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`cursor-pointer border p-[var(--space-md)] rounded-xl transition-all duration-300 ${type === "otro" ? "border-primary bg-blue-50 dark:bg-blue-900/20 shadow-[var(--shadow-md)] ring-1 ring-primary" : "border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-[var(--shadow-md)] hover:-translate-y-1"}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="otro"
                      checked={type === "otro"}
                      onChange={(e) => setType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">
                        help
                      </span>
                      <div>
                        <span className="block font-medium text-slate-900 dark:text-white">
                          Otro
                        </span>
                        <span className="text-xs text-slate-500">
                          Cualquier otra gestión
                        </span>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="space-y-[var(--space-md)]">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Título de la Solicitud
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej. Legalizar título en el Ministerio de Educación"
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-2.5 px-4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Descripción Detallada
                    </label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Describe qué necesitas que haga el representante paso a paso..."
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-2.5 px-4"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Dónde y Cuándo */}
              <div className="mb-[var(--space-md)]">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-primary text-xs">
                    2
                  </span>
                  Ubicación y Fecha
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-md)]">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Ciudad / Localidad
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ej. Córdoba Capital"
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-2.5 px-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Dirección (Opcional por ahora)
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ej. Av. Colón 1234"
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-2.5 px-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Presupuesto Estimado ($)
                    </label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="Ej. 5000"
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-2.5 px-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Fecha Límite (Opcional)
                    </label>
                    <input
                      title="Fecha límite"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-2.5 px-4"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <Link
                  href="/dashboard/client"
                  className="px-6 py-2.5 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary text-white px-8 py-2.5 rounded-lg font-bold hover:bg-primary-dark transition shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      Publicar Solicitud
                      <span className="material-symbols-outlined text-lg">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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
