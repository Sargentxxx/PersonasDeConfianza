"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  // Handle navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-white dark:bg-slate-900 dark:text-white overflow-x-hidden">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-primary">Personas</span>
            <span
              className={
                scrolled ? "text-slate-800 dark:text-white" : "text-white"
              }
            >
              DeConfianza
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth?mode=login"
              className={`px-5 py-2 rounded-full font-medium transition-colors ${
                scrolled
                  ? "text-slate-600 hover:text-primary dark:text-slate-300"
                  : "text-white/90 hover:text-white"
              }`}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth?mode=signup"
              className="px-5 py-2 rounded-full bg-primary text-white font-medium hover:bg-primary-dark shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2084&q=80')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8 animate-fade-in-up">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-sm font-medium mb-4">
            ✨ La forma segura de delegar tareas
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
            Tu tranquilidad es <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              nuestra prioridad
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Conectamos a personas que necesitan ayuda con profesionales de
            confianza verificados. Sin complicaciones, sin riesgos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard/client/new-request"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary-dark shadow-xl shadow-blue-500/20 transition-all transform hover:-translate-y-1"
            >
              Necesito Ayuda
            </Link>
            <Link
              href="/auth?mode=signup"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all"
            >
              Soy Profesional
            </Link>
          </div>
        </div>
      </header>

      {/* How it works */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Simplificamos el proceso de contratación para que puedas enfocarte
              en lo importante.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: "post_add",
                title: "1. Publica tu solicitud",
                desc: "Describe qué necesitas. Desde reparaciones en el hogar hasta trámites personales.",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: "verified_user",
                title: "2. Conecta con expertos",
                desc: "Nuestros representantes verificados aceptarán tu tarea al instante.",
                color: "bg-emerald-100 text-emerald-600",
              },
              {
                icon: "thumb_up",
                title: "3. Solución garantizada",
                desc: "Recibe el servicio, valida el trabajo y califica tu experiencia.",
                color: "bg-purple-100 text-purple-600",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="group p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <span className="material-symbols-outlined text-3xl">
                    {step.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-24 bg-slate-50 dark:bg-[#1a2632]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Client Card */}
            <div className="relative overflow-hidden rounded-3xl h-[500px] group cursor-pointer">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1932&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-slate-900/20 group-hover:bg-slate-900/80 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 p-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 text-white">
                  <span className="material-symbols-outlined text-2xl">
                    person
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  Para Clientes
                </h3>
                <p className="text-white/80 mb-6 max-w-sm">
                  Delega tareas tediosas y recupera tu tiempo libre. Seguridad y
                  calidad garantizada.
                </p>
                <Link
                  href="/auth?mode=signup&role=client"
                  className="inline-flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all"
                >
                  Regístrate como Cliente
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>

            {/* Rep Card */}
            <div className="relative overflow-hidden rounded-3xl h-[500px] group cursor-pointer">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-slate-900/20 group-hover:bg-slate-900/80 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 p-10">
                <div className="w-12 h-12 bg-emerald-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 text-emerald-400">
                  <span className="material-symbols-outlined text-2xl">
                    badge
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  Para Profesionales
                </h3>
                <p className="text-white/80 mb-6 max-w-sm">
                  Accede a trabajos seguros, gestiona tu agenda y crece
                  profesionalmente.
                </p>
                <Link
                  href="/auth?mode=signup&role=rep"
                  className="inline-flex items-center gap-2 text-emerald-400 font-semibold group-hover:gap-4 transition-all"
                >
                  Únete como Representante
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="text-primary">Personas</span>DeConfianza
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-slate-400 hover:text-primary transition-colors"
            >
              Términos
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-primary transition-colors"
            >
              Privacidad
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-primary transition-colors"
            >
              Contacto
            </a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
