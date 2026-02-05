"use client";

import { useState } from "react";
import Link from "next/link";

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState("chat1");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-slate-800 dark:text-slate-200">
      {/* Navbar Content (Simplified) */}
      <nav className="bg-white dark:bg-[#1a2632] border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 lg:px-8">
        <Link
          href="/dashboard/client"
          className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-semibold hidden sm:inline">
            Volver al Dashboard
          </span>
        </Link>
        <div className="font-bold text-lg">Mensajes</div>
        <div className="w-8"></div> {/* Spacer */}
      </nav>

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Chat List Sidebar */}
        <div
          className={`w-full md:w-80 lg:w-96 bg-white dark:bg-[#1a2632] border-r border-slate-200 dark:border-slate-700 flex flex-col ${mobileMenuOpen ? "block fixed inset-0 z-50" : "hidden md:flex"}`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="font-bold text-lg">Chats</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar mensaje..."
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">
                search
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div
              onClick={() => {
                setActiveChat("chat1");
                setMobileMenuOpen(false);
              }}
              className={`p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${activeChat === "chat1" ? "bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-primary" : ""}`}
            >
              <div className="flex gap-3">
                <div className="relative">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIlpSyjW0VtGa3WuNey-gR2qsXObLjrbfTyEVWcIp2l8btBMT-xG79trnfMdlnqPuYUHzA9Qw9Nuc2HveLmR3_oQzezjbnzZ8_3sywpZeELpL4bjONmZJT4-_ewcCLEdT2vzz3yNLSZ2Ak9khN-QUPskONx5Yh1iITrOBI9eg_y8_BaLpY0UI7aQ1vYlD8K7_A4OGzr7dlscT-OUzDVTrs53oqwfTAeAU3vqUXe6GbZ2njy3sv6T7WcaU2LYK6xt2oyqYu3NYDDg"
                    className="w-12 h-12 rounded-full object-cover"
                    alt="User"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#1a2632]"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-sm truncate text-slate-900 dark:text-white">
                      Juan Martinez
                    </h3>
                    <span className="text-xs text-slate-500">10:45 AM</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    Sisi, ya llegue a la concesionaria. Ahora te paso las fotos
                    del motor.
                  </p>
                  <div className="mt-2 flex gap-1">
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      Verificación #NB-8821
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              onClick={() => {
                setActiveChat("chat2");
                setMobileMenuOpen(false);
              }}
              className={`p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${activeChat === "chat2" ? "bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-primary" : ""}`}
            >
              <div className="flex gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                    SP
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-sm truncate text-slate-900 dark:text-white">
                      Soporte Plataforma
                    </h3>
                    <span className="text-xs text-slate-500">Ayer</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    El pago ha sido liberado correctamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-background-dark">
          {/* Chat Header */}
          <div className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 -ml-2 text-slate-600"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <div className="relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIlpSyjW0VtGa3WuNey-gR2qsXObLjrbfTyEVWcIp2l8btBMT-xG79trnfMdlnqPuYUHzA9Qw9Nuc2HveLmR3_oQzezjbnzZ8_3sywpZeELpL4bjONmZJT4-_ewcCLEdT2vzz3yNLSZ2Ak9khN-QUPskONx5Yh1iITrOBI9eg_y8_BaLpY0UI7aQ1vYlD8K7_A4OGzr7dlscT-OUzDVTrs53oqwfTAeAU3vqUXe6GbZ2njy3sv6T7WcaU2LYK6xt2oyqYu3NYDDg"
                  className="w-10 h-10 rounded-full object-cover"
                  alt="Current User"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#1a2632]"></div>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Juan Martinez
                </h3>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  En línea
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <span className="material-symbols-outlined">phone</span>
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <span className="material-symbols-outlined">videocam</span>
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <span className="material-symbols-outlined">info</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex justify-center my-4">
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-wider">
                Hoy, 2 de Octubre
              </span>
            </div>

            <div className="flex gap-3 max-w-[85%]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIlpSyjW0VtGa3WuNey-gR2qsXObLjrbfTyEVWcIp2l8btBMT-xG79trnfMdlnqPuYUHzA9Qw9Nuc2HveLmR3_oQzezjbnzZ8_3sywpZeELpL4bjONmZJT4-_ewcCLEdT2vzz3yNLSZ2Ak9khN-QUPskONx5Yh1iITrOBI9eg_y8_BaLpY0UI7aQ1vYlD8K7_A4OGzr7dlscT-OUzDVTrs53oqwfTAeAU3vqUXe6GbZ2njy3sv6T7WcaU2LYK6xt2oyqYu3NYDDg"
                className="w-8 h-8 rounded-full object-cover mt-1"
                alt="Other User"
              />
              <div>
                <div className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Hola Carlos! Ya estoy en camino a la concesionaria Ford.
                    Llego en 10 minutos aprox.
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 ml-1 mt-1 block">
                  10:30 AM
                </span>
              </div>
            </div>

            <div className="flex gap-3 max-w-[85%] flex-row-reverse ml-auto">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-xs mt-1">
                YO
              </div>
              <div>
                <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-none shadow-sm shadow-blue-500/20">
                  <p className="text-sm">
                    Buenísimo Juan. Acordate de revisar bien el número de motor
                    que a veces está medio sucio.
                  </p>
                </div>
                <div className="flex justify-end items-center gap-1 mt-1">
                  <span className="text-[10px] text-slate-400">10:32 AM</span>
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    done_all
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 max-w-[85%]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIlpSyjW0VtGa3WuNey-gR2qsXObLjrbfTyEVWcIp2l8btBMT-xG79trnfMdlnqPuYUHzA9Qw9Nuc2HveLmR3_oQzezjbnzZ8_3sywpZeELpL4bjONmZJT4-_ewcCLEdT2vzz3yNLSZ2Ak9khN-QUPskONx5Yh1iITrOBI9eg_y8_BaLpY0UI7aQ1vYlD8K7_A4OGzr7dlscT-OUzDVTrs53oqwfTAeAU3vqUXe6GbZ2njy3sv6T7WcaU2LYK6xt2oyqYu3NYDDg"
                className="w-8 h-8 rounded-full object-cover mt-1"
                alt="Other User"
              />
              <div>
                <div className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Sisi, ya llegue a la concesionaria. Ahora te paso las fotos
                    del motor.
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 ml-1 mt-1 block">
                  10:45 AM
                </span>
              </div>
            </div>

            <div className="flex gap-3 max-w-[85%]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIlpSyjW0VtGa3WuNey-gR2qsXObLjrbfTyEVWcIp2l8btBMT-xG79trnfMdlnqPuYUHzA9Qw9Nuc2HveLmR3_oQzezjbnzZ8_3sywpZeELpL4bjONmZJT4-_ewcCLEdT2vzz3yNLSZ2Ak9khN-QUPskONx5Yh1iITrOBI9eg_y8_BaLpY0UI7aQ1vYlD8K7_A4OGzr7dlscT-OUzDVTrs53oqwfTAeAU3vqUXe6GbZ2njy3sv6T7WcaU2LYK6xt2oyqYu3NYDDg"
                className="w-8 h-8 rounded-full object-cover mt-1"
                alt="Other User"
              />
              <div>
                <div className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 p-1 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="relative group cursor-pointer overflow-hidden rounded-xl">
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjCp_lqT-6Z5zCbfkLwGKgNqJc7S4wD6L2Xg&s"
                      alt="Engine"
                      className="w-64 h-48 object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 ml-1 mt-1 block">
                  10:46 AM
                </span>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-[#1a2632] border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2 items-center">
              <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">
                  add_photo_alternate
                </span>
              </button>
              <button className="p-2 text-slate-400 hover:text-primary transition-colors hidden sm:block">
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 pl-4 pr-10 focus:ring-2 focus:ring-primary"
                />
                <button className="absolute right-2 top-2 p-1 text-slate-400 hover:text-primary">
                  <span className="material-symbols-outlined">
                    sentiment_satisfied
                  </span>
                </button>
              </div>
              <button className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-blue-500/20">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
