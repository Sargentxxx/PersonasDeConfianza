"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileHeader from "@/components/MobileHeader";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-slate-800 dark:text-slate-200">
      {/* Mobile Header */}
      <MobileHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        title="Admin Panel"
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
              <span className="font-bold text-xl">Admin Panel</span>
            </div>

            <div className="p-6">
              <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-4">
                Gestión
              </h3>
              <nav className="space-y-2">
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 bg-blue-600/20 text-blue-400 rounded-xl font-medium transition-colors"
                >
                  <span className="material-symbols-outlined">verified</span>
                  Validación Usuarios
                  <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    3
                  </span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors"
                >
                  <span className="material-symbols-outlined">gavel</span>
                  Disputas
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors"
                >
                  <span className="material-symbols-outlined">payments</span>
                  Comisiones (15%)
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors"
                >
                  <span className="material-symbols-outlined">group</span>
                  Usuarios
                </a>
              </nav>

              <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider mt-8 mb-4">
                Sistema
              </h3>
              <nav className="space-y-2">
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors"
                >
                  <span className="material-symbols-outlined">settings</span>
                  Configuración
                </a>
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
              <Link
                href="/auth"
                className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl font-medium transition-colors"
                onClick={() => {
                  // In a real app, sign out here
                }}
              >
                <span className="material-symbols-outlined">logout</span>
                Cerrar Sesión
              </Link>
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
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Verificación de Identidad
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Revisa y aprueba solicitudes de nuevos representantes.
            </p>
          </header>

          {/* Verification Requests List */}
          <div className="space-y-6">
            {/* Request 1 */}
            <div className="bg-white dark:bg-[#1a2632] rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIlpSyjW0VtGa3WuNey-gR2qsXObLjrbfTyEVWcIp2l8btBMT-xG79trnfMdlnqPuYUHzA9Qw9Nuc2HveLmR3_oQzezjbnzZ8_3sywpZeELpL4bjONmZJT4-_ewcCLEdT2vzz3yNLSZ2Ak9khN-QUPskONx5Yh1iITrOBI9eg_y8_BaLpY0UI7aQ1vYlD8K7_A4OGzr7dlscT-OUzDVTrs53oqwfTAeAU3vqUXe6GbZ2njy3sv6T7WcaU2LYK6xt2oyqYu3NYDDg"
                    alt="Applicant"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Roberto Fernández
                    </h3>
                    <p className="text-sm text-slate-500">
                      Candidato a Representante • Córdoba, Argentina
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Registrado: Hace 2 horas
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100 transition-colors">
                    Rechazar
                  </button>
                  <button className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20">
                    Aprobar Perfil
                  </button>
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 text-sm uppercase tracking-wide">
                  Documentación Presentada
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary">
                        badge
                      </span>
                      <span className="font-semibold text-sm">
                        DNI (Frente)
                      </span>
                    </div>
                    <div className="aspect-video bg-slate-200 rounded-lg relative overflow-hidden group cursor-pointer">
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
                        <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100">
                          visibility
                        </span>
                      </div>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/f/f5/DNI_frente.jpg"
                        alt="DNI Front"
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary">
                        badge
                      </span>
                      <span className="font-semibold text-sm">DNI (Dorso)</span>
                    </div>
                    <div className="aspect-video bg-slate-200 rounded-lg relative overflow-hidden group cursor-pointer">
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
                        <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100">
                          visibility
                        </span>
                      </div>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/4/4c/DNI_dorso.jpg"
                        alt="DNI Back"
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary">
                        face
                      </span>
                      <span className="font-semibold text-sm">
                        Selfie con DNI
                      </span>
                    </div>
                    <div className="aspect-video bg-slate-200 rounded-lg relative overflow-hidden group cursor-pointer">
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
                        <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100">
                          visibility
                        </span>
                      </div>
                      <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-500 text-xs">
                        [FOTO SELFIE]
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    Revisión Manual Requerida
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    IP: Argentina
                  </span>
                </div>
              </div>
            </div>

            {/* Request 2 (Simplified) */}
            <div className="bg-white dark:bg-[#1a2632] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xl">
                  MG
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    María González
                  </h3>
                  <p className="text-sm text-slate-500">
                    Candidato a Representante • Rosario, Argentina
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Registrado: Hace 5 horas
                  </p>
                </div>
              </div>
              <button className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Revisar
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
