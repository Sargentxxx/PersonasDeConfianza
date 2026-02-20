"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen selection:bg-primary/20 bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-white/10 py-4 shadow-xl shadow-black/5"
            : "bg-transparent py-8"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="font-display text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <span className={scrolled ? "text-foreground" : "text-white"}>
              <span className="text-primary">Personas</span>DeConfianza
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#como-funciona"
              className={`text-sm font-medium transition-colors ${scrolled ? "text-foreground/70 hover:text-primary" : "text-white/70 hover:text-white"}`}
            >
              Funcionalidad
            </Link>
            <Link
              href="#servicios"
              className={`text-sm font-medium transition-colors ${scrolled ? "text-foreground/70 hover:text-primary" : "text-white/70 hover:text-white"}`}
            >
              Servicios
            </Link>
            <Link
              href="#precios"
              className={`text-sm font-medium transition-colors ${scrolled ? "text-foreground/70 hover:text-primary" : "text-white/70 hover:text-white"}`}
            >
              Precios
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/auth?mode=login"
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                scrolled
                  ? "text-foreground/80 hover:bg-slate-100"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth?mode=signup"
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark shadow-xl shadow-primary/25 transition-all transform hover:-translate-y-0.5"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80"
            alt="Human Connection"
            fill
            className="object-cover opacity-40 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950"></div>
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-white text-sm font-medium mb-8 border-white/10">
              ✨ Confianza y Seguridad Garantizada
            </div>

            <h1 className="font-display text-6xl md:text-8xl font-black text-white tracking-tight leading-[0.9] mb-8">
              La confianza que <br />
              <span className="text-gradient">acorta distancias</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-12 max-w-xl font-medium">
              Tu representante personal para verificar, gestionar y resolver
              trámites en cualquier lugar del mundo.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                href="/auth?mode=signup"
                className="group relative px-10 py-5 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-dark shadow-2xl shadow-primary/30 transition-all flex items-center justify-center"
              >
                Empezar Ahora
                <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
              <button
                onClick={() => setShowVideo(true)}
                className="px-10 py-5 rounded-2xl glass-card text-white font-bold text-lg hover:bg-white/20 transition-all border-white/20 flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined scale-125">
                  play_circle
                </span>
                Ver cómo funciona
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dual Roles Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          {[
            {
              role: "client",
              title: "Para Clientes",
              subtitle: "Delega con tranquilidad",
              desc: "Recupera tu tiempo libre. Seguridad y calidad garantizada en cada servicio personalizado.",
              img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1000&q=80",
              btn: "Registrarse como Cliente",
              icon: "person",
            },
            {
              role: "rep",
              title: "Para Profesionales",
              subtitle: "Convierte confianza en ingresos",
              desc: "Accede a trabajos seguros y crece con el respaldo de nuestra plataforma.",
              img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&q=80",
              btn: "Unirse como Representante",
              icon: "badge",
              accent: true,
            },
          ].map((card, i) => (
            <Link
              key={i}
              href={`/auth?mode=signup&role=${card.role}`}
              className="group relative h-[500px] rounded-4xl overflow-hidden shadow-2xl transition-all duration-700 hover:-translate-y-2"
            >
              <Image
                src={card.img}
                alt={card.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 text-white to-transparent p-12 flex flex-col justify-end">
                <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">
                    {card.icon}
                  </span>
                </div>
                <h3 className="font-display text-4xl font-extrabold mb-4">
                  {card.title}
                </h3>
                <p className="text-lg text-slate-300 mb-8 max-w-md">
                  {card.desc}
                </p>
                <div
                  className={`inline-flex items-center gap-2 font-bold ${card.accent ? "text-accent" : "text-white"}`}
                >
                  {card.btn}{" "}
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Problem & Solution - Value Proposition (Restored) */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-black mb-6">
              Llenamos el vacío de los servicios tradicionales
            </h2>
            <p className="text-xl text-slate-500 max-w-3xl mx-auto">
              Las apps actuales son rígidas. Nosotros resolvemos la
              incertidumbre de la distancia con flexibilidad humana.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-black/5">
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500 scale-125">
                  cancel
                </span>
                Mercado Tradicional (Rígido)
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Si necesitas verificar una moto, no puedes llamar a un plomero
                ni a un servicio de limpieza. El mercado está fragmentado y no
                ofrece soluciones para necesidades específicas y puntuales.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-10 rounded-4xl border border-primary/20 shadow-xl shadow-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-accent scale-125">
                  check_circle
                </span>
                Personas de Confianza (Flexible)
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Una red de personas verificadas dispuestas a realizar tareas
                personalizadas que requieren criterio, honestidad y confianza.
                Desde verificar un inmueble hasta un trámite personal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="servicios" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-black mb-6">
              La distancia es un problema real y costoso
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              A veces necesitas ojos y manos en otro lugar, pero viajar no es
              una opción viable.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Compra de Vehículos",
                desc: "¿Vas a comprar un auto en otra ciudad? Evita estafas verificando su estado antes de pagar.",
                icon: "directions_car",
                img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
              },
              {
                title: "Alquileres Temporales",
                desc: "¿Esa casa existe realmente? Envía a alguien a confirmar que las fotos coinciden con la realidad.",
                icon: "cottage",
                img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
              },
              {
                title: "Trámites Burocráticos",
                desc: "Legalizaciones, presentaciones o recogida de documentos en instituciones públicas.",
                icon: "description",
                img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group glass-card border-slate-100 dark:border-slate-800 rounded-4xl overflow-hidden p-4 hover:shadow-2xl transition-all"
              >
                <div className="relative h-56 rounded-3xl overflow-hidden mb-8">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="px-4 pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                    <span className="material-symbols-outlined">
                      {item.icon}
                    </span>
                  </div>
                  <h4 className="font-display text-2xl font-bold mb-4">
                    {item.title}
                  </h4>
                  <p className="text-slate-500 mb-8 leading-relaxed">
                    {item.desc}
                  </p>
                  <Link
                    href="/auth?mode=signup"
                    className="text-primary font-bold inline-flex items-center gap-2"
                  >
                    Me interesa{" "}
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section (Restored) */}
      <section id="precios" className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-6xl font-black mb-6">
              Planes transparentes
            </h2>
            <p className="text-xl text-slate-500">
              Sin costos ocultos. Elige el plan que mejor se adapte a ti.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-12 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-xl">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-3xl">
                  person
                </span>
              </div>
              <h3 className="font-display text-3xl font-bold mb-4">
                Para Clientes
              </h3>
              <div className="text-5xl font-black mb-10 text-slate-900 dark:text-white">
                Gratis
              </div>
              <ul className="space-y-5 mb-12">
                {[
                  "Publicar solicitudes ilimitadas",
                  "Conexión con profesionales verificados",
                  "Sistema de chat integrado",
                  "Soporte 24/7",
                ].map((t, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-slate-600 dark:text-slate-400"
                  >
                    <span className="material-symbols-outlined text-accent font-bold">
                      check
                    </span>{" "}
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth?mode=signup&role=client"
                className="block w-full py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-center font-bold hover:bg-slate-200 transition-all"
              >
                Empezar Gratis
              </Link>
            </div>

            <div className="bg-primary p-12 rounded-4xl text-white shadow-2xl shadow-primary/30 relative overflow-hidden transform hover:-translate-y-2 transition-all">
              <div className="absolute top-6 right-6 px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest">
                Recomendado
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-3xl">
                  badge
                </span>
              </div>
              <h3 className="font-display text-3xl font-bold mb-4">
                Para Profesionales
              </h3>
              <div className="text-5xl font-black mb-2">Mínima</div>
              <p className="text-white/80 mb-10 text-xl">
                comisión por servicio
              </p>
              <ul className="space-y-5 mb-12">
                {[
                  "Acceso a todos los trabajos",
                  "Pagos seguros y puntuales",
                  "Gestión de agenda integrada",
                  "Dashboard de estadísticas",
                ].map((t, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-white/90 font-medium"
                  >
                    <span className="material-symbols-outlined text-emerald-400 font-bold scale-110">
                      check
                    </span>{" "}
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth?mode=signup&role=rep"
                className="block w-full py-5 rounded-2xl bg-white text-primary text-center font-bold hover:bg-slate-50 transition-all shadow-xl"
              >
                Unirse Ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (Restored) */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-black mb-6">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-slate-500">
              Miles de personas ya confían en nosotros para sus tareas del día a
              día.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "María González",
                role: "Cliente",
                text: "Increíble servicio. Contraté a alguien para reparar mi auto y el trabajo fue impecable. Totalmente recomendado.",
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
              },
              {
                name: "Carlos Ramírez",
                role: "Representante",
                text: "Como profesional, esta plataforma me ha permitido conseguir trabajos consistentes. El sistema de pagos es excelente.",
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
              },
              {
                name: "Ana Martínez",
                role: "Cliente",
                text: "La mejor decisión fue usar esta app. Me ayudaron con trámites que no tenía tiempo de hacer. Muy confiables.",
                img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-10 rounded-4xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-black/5"
              >
                <div className="flex items-center gap-4 mb-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                  />
                  <div>
                    <h4 className="font-bold text-lg">{t.name}</h4>
                    <p className="text-slate-500 text-sm">{t.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-6 text-yellow-400">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="material-symbols-outlined">
                      star
                    </span>
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400 italic leading-relaxed text-lg">
                  &quot;{t.text}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="lg:col-span-2">
              <div className="font-display text-3xl font-black mb-8">
                <span className="text-primary">Personas</span>DeConfianza
              </div>
              <p className="text-slate-500 text-lg max-w-md leading-relaxed">
                Conectamos a personas que necesitan ayuda con profesionales
                verificados. Tu tranquilidad es nuestra prioridad.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-8">Enlaces</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/auth"
                    className="text-slate-500 hover:text-primary transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth?mode=signup"
                    className="text-slate-500 hover:text-primary transition-colors"
                  >
                    Registrarse
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-500 hover:text-primary transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-8">Legal</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#"
                    className="text-slate-500 hover:text-primary transition-colors"
                  >
                    Términos
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-500 hover:text-primary transition-colors"
                  >
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-slate-500 hover:text-primary transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500">
              © {new Date().getFullYear()} Personas de Confianza. Todos los
              derechos reservados.
            </p>
            <div className="flex gap-8">
              <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer transition-all">
                share
              </span>
              <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer transition-all">
                language
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4">
          <div className="relative w-full max-w-5xl rounded-4xl overflow-hidden shadow-2xl border border-white/10">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="aspect-video bg-black">
              <video
                src="/videos/Personas_de_Confianza_Web.webm"
                className="w-full h-full object-cover"
                controls
                autoPlay
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
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
