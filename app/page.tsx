import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white dark:bg-surface-dark font-sans text-slate-800 dark:text-slate-200 antialiased selection:bg-primary selection:text-white">
      <header className="relative pt-16 pb-24 lg:pt-24 overflow-hidden">
        <nav className="absolute top-0 left-0 right-0 p-6 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-2xl font-bold text-primary dark:text-white tracking-tight">
              Personas de Confianza
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-600 dark:text-slate-300">
              <a href="#problemas" className="hover:text-primary transition">
                Problemas
              </a>
              <a href="#solucion" className="hover:text-primary transition">
                Solución
              </a>
              <a href="#seguridad" className="hover:text-primary transition">
                Seguridad
              </a>
            </div>
            <Link
              href="/auth"
              className="hidden md:inline-flex bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-50 transition"
            >
              Iniciar Sesión
            </Link>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 relative">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-primary text-xs font-bold tracking-wide uppercase mb-6">
            Conectando personas
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
            La confianza que <br className="hidden md:block" /> acorta
            distancias.
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto font-light">
            Tu representante local para verificar, gestionar y resolver trámites
            donde tú no puedes estar.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <button className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-sky-900 transition shadow-lg shadow-blue-900/20 flex items-center group">
              Encontrar representante
              <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
            <button className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-full font-medium text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center">
              <span className="material-symbols-outlined mr-2">
                play_circle
              </span>
              Cómo funciona
            </button>
          </div>
          <div className="relative w-full max-w-5xl mx-auto group perspective-1000">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 bg-slate-900">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2R4EVh96P23S13AAYzC0cAVGAMpJ6tcYz3KxsSjqkkUH63M05hg13iFB97Ot27jEBwwL7E98UV0yDIBgHkjzuD_W0Zzq6-rJmZxqIM9Zgmu2J2L_zrAFgSHvT3sUPNCkJvv3B0wcpUe32WLKHvdzZcNxvUgWDd-pvD91ZRIz8ImCWqSMELkxtA5HnYUcGL6Q1mvWZwxeSjg4BXhWZIq9SzX_8RZVg-zuuw5uJpeLtRADFToC68j0xlLVibh-g3-CER7zYvOPbgA"
                alt="Modern blue bridge architecture connecting two sides representing trust"
                className="w-full h-72 md:h-[500px] object-cover object-center opacity-90 group-hover:scale-105 transition duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 md:right-auto bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl max-w-sm text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-green-400">
                    verified
                  </span>
                  <span className="text-white font-semibold">
                    Verificación Exitosa
                  </span>
                </div>
                <p className="text-slate-200 text-sm">
                  "Gracias a Juan pude comprar el auto en Córdoba sin viajar.
                  Verificó todo por mí."
                </p>
              </div>
            </div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          </div>
        </div>
      </header>
      <section
        id="problemas"
        className="py-24 bg-white dark:bg-surface-dark relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              La distancia es un problema{" "}
              <span className="text-primary">real y costoso</span>.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              A veces necesitas ojos y manos en otro lugar, pero viajar no es
              una opción viable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIlpSyjW0VtGa3WuNey-gR2qsXObLjrbfTyEVWcIp2l8btBMT-xG79trnfMdlnqPuYUHzA9Qw9Nuc2HveLmR3_oQzezjbnzZ8_3sywpZeELpL4bjONmZJT4-_ewcCLEdT2vzz3yNLSZ2Ak9khN-QUPskONx5Yh1iITrOBI9eg_y8_BaLpY0UI7aQ1vYlD8K7_A4OGzr7dlscT-OUzDVTrs53oqwfTAeAU3vqUXe6GbZ2njy3sv6T7WcaU2LYK6xt2oyqYu3NYDDg"
                  alt="Professional mechanic inspecting a car engine"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="material-symbols-outlined text-3xl mb-1">
                    directions_car
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                  Compra de Vehículos
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  ¿Vas a comprar un auto usado en otra ciudad? Evita estafas
                  verificando su estado mecánico y legal antes de pagar.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center text-primary font-semibold hover:underline"
                >
                  Verificar auto{" "}
                  <span className="material-symbols-outlined text-sm ml-1">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>
            <div className="group relative bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh6GmwbftDraJxaVEdkTDkNU3c4xJrPQpCsCH3g_nYULcmYwI4G5jh3WhX2rq5SWXeXEHpn6-PU8JVH2mFsjhnqtFDpAuNCN3TqJrN6xWm7q4-MdyM3dIhoDK28hpSxzEqFi_8nqkzWGHnOmIwqAHYgds6CukGXJbg-523l1afQ2oCGeiLOwgGmbuagVD-azrrV_pRG6FAPR1KIkZY6uq-tEYFMRsWlfkpHSDaU-FYUU47iPg5xhDVl8j2NMumlAptVgGnNAT1KA"
                  alt="Couple looking at tablet"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="material-symbols-outlined text-3xl mb-1">
                    real_estate_agent
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                  Alquileres Temporales
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  ¿Esa casa de vacaciones existe realmente? Envía a alguien de
                  confianza a confirmar que las fotos coinciden con la realidad.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center text-primary font-semibold hover:underline"
                >
                  Revisar propiedad{" "}
                  <span className="material-symbols-outlined text-sm ml-1">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>
            <div className="group relative bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7L2gL7P0GezXS5OSL89JXd2HmiDgEGgZUgG3h71MK7v9_ZsDGj8BtC-mwDlAN7I5gpawZixZKmILWWw4hlH6-Wt7TmC5R5bru3ndPwHFdKodOLOP1QZuRQeMd2PjVKR8lIx-TCV0dHTxw3aG-CJNdnh8qr3mKy7W5APsGmipo8ntQFiKkKTQWStqN3tahei1a8D9AdgukIC_EeYd_J0pq9m7L0NkABZaov4JpTGLQgXHoXo_uSo0zKNRScqf8pxh4fpKgD9z3IQ"
                  alt="Professional handling paperwork in office"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="material-symbols-outlined text-3xl mb-1">
                    description
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                  Trámites Burocráticos
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Legalizaciones, presentaciones en mesa de entradas o recogida
                  de documentos en instituciones públicas o privadas.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center text-primary font-semibold hover:underline"
                >
                  Gestionar trámite{" "}
                  <span className="material-symbols-outlined text-sm ml-1">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        id="solucion"
        className="py-24 bg-slate-50 dark:bg-background-dark overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Llenamos el vacío que dejan los servicios tradicionales.
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Las apps actuales resuelven problemas específicos y rígidos.
                Nosotros resolvemos la incertidumbre de la distancia con
                flexibilidad humana.
              </p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mr-4">
                    <span className="material-symbols-outlined">block</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      Lo que falta hoy
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      Si necesitas verificar una moto, no puedes llamar a un
                      plomero ni a un servicio de limpieza. El mercado está
                      fragmentado.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center mr-4 shadow-lg shadow-blue-900/20">
                    <span className="material-symbols-outlined">
                      check_circle
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      Nuestra Propuesta
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      Una red de personas verificadas dispuestas a realizar
                      tareas personalizadas que requieren criterio y confianza.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-transparent dark:from-slate-800 rounded-3xl -rotate-3 transform"></div>
              <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col gap-8">
                  <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">
                      Mercado Tradicional (Rigido)
                    </h5>
                    <div className="flex justify-center gap-4 md:gap-8">
                      <div className="flex flex-col items-center opacity-60">
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-2">
                          <span className="material-symbols-outlined text-slate-500">
                            cleaning_services
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Limpieza
                        </span>
                      </div>
                      <div className="flex flex-col items-center opacity-60">
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-2">
                          <span className="material-symbols-outlined text-slate-500">
                            build
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Reparación
                        </span>
                      </div>
                      <div className="flex flex-col items-center opacity-60">
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-2">
                          <span className="material-symbols-outlined text-slate-500">
                            local_shipping
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Envios
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center -my-4 z-10">
                    <div className="bg-red-50 text-red-500 px-4 py-1 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        close
                      </span>{" "}
                      Sin cobertura
                    </div>
                  </div>
                  <div className="flex justify-center items-center py-2">
                    <div className="h-12 border-l-2 border-dashed border-slate-300"></div>
                  </div>
                  <div className="p-8 rounded-xl bg-primary text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <span className="material-symbols-outlined text-6xl">
                        handshake
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2 text-center">
                      Personas de Confianza (Flexible)
                    </h5>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">
                        Tu Necesidad Única
                      </h3>
                      <p className="text-blue-100 text-sm mb-4">
                        Desde verificar un auto hasta revisar una propiedad.
                      </p>
                      <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 text-xs font-medium">
                        <span className="material-symbols-outlined text-sm mr-1">
                          verified
                        </span>{" "}
                        Solución a medida
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        id="seguridad"
        className="py-24 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary font-bold text-sm tracking-widest uppercase">
              Seguridad ante todo
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mt-2 mb-6">
              ¿Cómo construimos confianza?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Sabemos que delegar tareas importantes requiere garantías. Por eso
              hemos diseñado un sistema de 3 pilares.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-primary flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl">
                  admin_panel_settings
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Identidad Verificada
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Cada "Persona de Confianza" pasa por un riguroso proceso de
                validación de identidad con DNI, biometría y antecedentes.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-primary flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl">
                  reviews
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Reseñas de la Comunidad
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Sistema de reputación transparente. Lee las experiencias de
                otros usuarios antes de contratar a tu representante.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-300">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-primary flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl">
                  savings
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Pagos Protegidos
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Tu dinero se mantiene seguro en custodia hasta que el servicio
                se haya completado satisfactoriamente.
              </p>
            </div>
          </div>
          <div className="mt-16 bg-background-dark rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[300px] text-white -mr-20 -mt-20">
                shield
              </span>
            </div>
            <div className="relative z-10 mb-8 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                ¿Listo para recuperar tu tranquilidad?
              </h3>
              <p className="text-slate-300">
                Únete a miles de usuarios que ya resolvieron sus trámites a
                distancia.
              </p>
            </div>
            <div className="relative z-10 flex-shrink-0">
              <a
                href="#"
                className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg"
              >
                Empezar ahora
              </a>
            </div>
          </div>
        </div>
      </section>
      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <h2 className="text-2xl font-bold text-white mb-6">
                Personas de Confianza
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                La plataforma líder en conexión con representantes locales
                verificados para gestiones remotas.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition"
                >
                  <span className="material-symbols-outlined">public</span>
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition"
                >
                  <span className="material-symbols-outlined">mail</span>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">
                Servicios
              </h3>
              <ul className="space-y-4 text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Verificación Vehicular
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Chequeo Inmobiliario
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Trámites Personales
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Compras Locales
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">
                Compañía
              </h3>
              <ul className="space-y-4 text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Sobre Nosotros
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Cómo Funciona
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Seguridad y Confianza
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition">
                    Preguntas Frecuentes
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">
                Contacto
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-lg mr-2 text-primary">
                    location_on
                  </span>
                  <span>
                    Av. Principal 123, Piso 4<br />
                    Buenos Aires, Argentina
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="material-symbols-outlined text-lg mr-2 text-primary">
                    email
                  </span>
                  <span>hola@personasdeconfianza.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>© 2023 Personas de Confianza. Todos los derechos reservados.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">
                Términos
              </a>
              <a href="#" className="hover:text-white transition">
                Privacidad
              </a>
              <a href="#" className="hover:text-white transition">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
      {/* Material Symbols */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
    </div>
  );
}
