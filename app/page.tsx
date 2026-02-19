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

      {/* Hero Section - Full Background */}
      <header className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-32">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80"
            alt="Amigos conversando y sonriendo"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-sm font-medium mb-6">
              ✨ Confianza y Seguridad Garantizada
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6">
              La confianza que{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                acorta distancias
              </span>
            </h1>
            <p className="text-xl text-slate-200 leading-relaxed mb-8 max-w-xl">
              Tu representante local para verificar, gestionar y resolver
              trámites donde tú no puedes estar.
            </p>
            <blockquote className="border-l-4 border-emerald-400 pl-4 mb-10 italic text-slate-300">
              &quot;Gracias a Juan pude comprar el auto en Córdoba sin viajar.
              Verificó todo por mí.&quot;
            </blockquote>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth?mode=signup"
                className="px-8 py-4 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary-dark shadow-xl shadow-blue-500/20 transition-all transform hover:-translate-y-1 text-center"
              >
                Empezar Ahora
              </Link>
              <Link
                href="#como-funciona"
                className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all text-center"
              >
                Ver cómo funciona
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Roles Selection Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Client Card */}
            <Link
              href="/auth?mode=signup&role=client"
              className="group relative h-[500px] rounded-3xl overflow-hidden shadow-2xl transition-all hover:scale-[1.02]"
            >
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80"
                  alt="Persona relajada"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
              </div>
              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-white">
                  <span className="material-symbols-outlined text-3xl">
                    person
                  </span>
                </div>
                <h3 className="text-4xl font-bold text-white mb-4">
                  Para Clientes
                </h3>
                <p className="text-lg text-slate-200 mb-8 max-w-md">
                  Delega tareas tediosas y recupera tu tiempo libre. Seguridad y
                  calidad garantizada en cada servicio.
                </p>
                <div className="inline-flex items-center text-white font-bold group-hover:underline">
                  Regístrate como Cliente
                  <span className="material-symbols-outlined ml-2">
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>

            {/* Professional Card */}
            <Link
              href="/auth?mode=signup&role=rep"
              className="group relative h-[500px] rounded-3xl overflow-hidden shadow-2xl transition-all hover:scale-[1.02]"
            >
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80"
                  alt="Profesional trabajando"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
              </div>
              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-white">
                  <span className="material-symbols-outlined text-3xl">
                    badge
                  </span>
                </div>
                <h3 className="text-4xl font-bold text-white mb-4">
                  Para Profesionales
                </h3>
                <p className="text-lg text-slate-200 mb-8 max-w-md">
                  Accede a trabajos seguros, gestiona tu agenda y crece
                  profesionalmente con el respaldo de nuestra plataforma.
                </p>
                <div className="inline-flex items-center text-emerald-400 font-bold group-hover:underline">
                  Únete como Representante
                  <span className="material-symbols-outlined ml-2">
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem & Solution - Value Proposition */}
      <section className="py-20 bg-white dark:bg-[#1a2632]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Llenamos el vacío de los servicios tradicionales
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
              Las apps actuales son rígidas. Nosotros resolvemos la
              incertidumbre de la distancia con flexibilidad humana.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">
                  cancel
                </span>
                Mercado Tradicional (Rígido)
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Si necesitas verificar una moto, no puedes llamar a un plomero
                ni a un servicio de limpieza. El mercado está fragmentado y no
                ofrece soluciones para necesidades específicas y puntuales.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl border border-blue-200 dark:border-blue-800 relative overflow-hidden">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500">
                  check_circle
                </span>
                Personas de Confianza (Flexible)
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Una red de personas verificadas dispuestas a realizar tareas
                personalizadas que requieren criterio, honestidad y confianza.
                Desde verificar un inmueble hasta un trámite personal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
              La distancia es un problema real y costoso
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
              A veces necesitas ojos y manos en otro lugar, pero viajar no es
              una opción viable.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Compra de Vehículos",
                desc: "¿Vas a comprar un auto usado en otra ciudad? Evita estafas verificando su estado mecánico y legal antes de pagar.",
                icon: "directions_car",
                action: "Verificar auto",
                image:
                  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              },
              {
                title: "Alquileres Temporales",
                desc: "¿Esa casa de vacaciones existe realmente? Envía a alguien de confianza a confirmar que las fotos coinciden con la realidad.",
                icon: "cottage",
                action: "Revisar propiedad",
                image:
                  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              },
              {
                title: "Trámites Burocráticos",
                desc: "Legalizaciones, presentaciones en mesa de entradas o recogida de documentos en instituciones públicas.",
                icon: "description",
                action: "Gestionar trámite",
                image:
                  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 flex flex-col"
              >
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                    <span className="material-symbols-outlined text-2xl">
                      {item.icon}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 flex-1">
                    {item.desc}
                  </p>
                  <Link
                    href="/auth?mode=signup"
                    className="inline-flex items-center text-primary font-bold hover:underline"
                  >
                    {item.action}
                    <span className="material-symbols-outlined ml-2 text-sm">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Restored */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Planes transparentes
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Sin costos ocultos. Elige el plan que mejor se adapte a tus
              necesidades.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Client Plan */}
            <div className="p-10 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl">
                  person
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Para Clientes
              </h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">
                  Gratis
                </span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "Publicar solicitudes ilimitadas",
                  "Conexión con profesionales verificados",
                  "Sistema de chat integrado",
                  "Soporte 24/7",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-slate-600 dark:text-slate-400"
                  >
                    <span className="material-symbols-outlined text-green-500">
                      check_circle
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth?mode=signup&role=client"
                className="block w-full px-6 py-3 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold text-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Empezar Gratis
              </Link>
            </div>

            {/* Rep Plan */}
            <div className="p-10 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-400 hover:shadow-2xl transition-all relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                Recomendado
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm text-white rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl">
                  badge
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Para Profesionales
              </h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">Mínima</span>
                <span className="text-white/80 ml-2">comisión</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "Acceso a todos los trabajos",
                  "Pagos seguros y puntuales",
                  "Gestión de agenda integrada",
                  "Dashboard de estadísticas",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/90">
                    <span className="material-symbols-outlined text-yellow-300">
                      check_circle
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth?mode=signup&role=rep"
                className="block w-full px-6 py-3 rounded-full bg-white text-blue-600 font-bold text-center hover:bg-slate-100 transition-colors"
              >
                Unirse Ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Restored */}
      <section className="py-24 bg-white dark:bg-[#1a2632]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Miles de personas ya confían en nosotros para sus tareas del día a
              día.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "María González",
                role: "Cliente",
                avatar:
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
                rating: 5,
                text: "Increíble servicio. Contraté a alguien para reparar mi auto y el trabajo fue impecable. Totalmente recomendado.",
              },
              {
                name: "Carlos Ramírez",
                role: "Representante",
                avatar:
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
                rating: 5,
                text: "Como profesional, esta plataforma me ha permitido conseguir trabajos consistentes. El sistema de pagos es excelente.",
              },
              {
                name: "Ana Martínez",
                role: "Cliente",
                avatar:
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
                rating: 5,
                text: "La mejor decisión fue usar esta app. Me ayudaron con trámites que no tenía tiempo de hacer. Muy confiables.",
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  &quot;{testimonial.text}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      {/* Trust Pillars */}
      <section className="py-24 bg-white dark:bg-[#1a2632]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              ¿Cómo construimos confianza?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              Sabemos que delegar tareas importantes requiere garantías. Por eso
              hemos diseñado un sistema de 3 pilares.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "fingerprint",
                title: "Identidad Verificada",
                desc: "Cada 'Persona de Confianza' pasa por un riguroso proceso de validación de identidad con DNI, biometría y antecedentes.",
                color: "bg-blue-500",
              },
              {
                icon: "stars",
                title: "Reseñas de la Comunidad",
                desc: "Sistema de reputación transparente. Lee las experiencias de otros usuarios antes de contratar a tu representante.",
                color: "bg-yellow-500",
              },
              {
                icon: "lock_person",
                title: "Pagos Protegidos",
                desc: "Tu dinero se mantiene seguro en custodia hasta que el servicio se haya completado satisfactoriamente.",
                color: "bg-emerald-500",
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="group p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center"
              >
                <div
                  className={`w-16 h-16 ${pillar.color} text-white rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <span className="material-symbols-outlined text-4xl">
                    {pillar.icon}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {pillar.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/auth?mode=signup"
              className="inline-flex px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl transition-all transform hover:-translate-y-1 items-center gap-2"
            >
              Empezar ahora
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                <span className="text-primary">Personas</span>DeConfianza
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                Conectamos a personas que necesitan ayuda con profesionales
                verificados. Tu tranquilidad es nuestra prioridad.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">
                Enlaces
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/auth"
                    className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth?mode=signup"
                    className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                  >
                    Registrarse
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                  >
                    Términos
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                  >
                    Privacidad
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              © {new Date().getFullYear()} Personas de Confianza. Todos los
              derechos reservados.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-slate-400 hover:text-primary transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.954 10.954v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-primary transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="aspect-video bg-black">
              <video
                src="/videos/Personas_de_Confianza_Web.webm"
                className="w-full h-full"
                controls
                autoPlay
                muted
                playsInline
                preload="metadata"
                onError={(e) => {
                  console.error("Error loading video:", e);
                  console.error(
                    "Video source:",
                    "/videos/Personas_de_Confianza_Web.webm",
                  );
                }}
              >
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
