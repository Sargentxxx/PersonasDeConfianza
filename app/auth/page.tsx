"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  AuthError,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"client" | "rep">("client");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Fetch user role from Firestore to redirect correctly
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      // CRITICAL: Use Firestore role, NOT the UI state 'role'
      let dbRole: string = "client"; // Safe default fallback

      if (userDoc.exists()) {
        dbRole = userDoc.data().role;
      } else {
        console.warn(
          "Usuario sin documento en Firestore, usando rol por defecto: client",
        );
      }

      console.log("Login exitoso. Rol en BD:", dbRole);

      // Redirection logic based on real DB role
      if (dbRole === "admin") {
        router.push("/admin");
      } else if (dbRole === "rep") {
        router.push("/dashboard/rep");
      } else {
        router.push("/dashboard/client");
      }
    } catch (err: any) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(userCredential.user, { displayName: name });

      // Save extra user info to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        phone: phone,
        role: role,
        createdAt: new Date().toISOString(),
      });

      if (role === "client") router.push("/dashboard/client");
      else router.push("/dashboard/rep");
    } catch (err: any) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Forzar que Google pida cuenta si hay varias
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);

      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);

      let dbRole: string;

      if (!userDoc.exists()) {
        console.log("Creando nuevo usuario con Google:", role);
        // Create new user doc - HERE we DO use the UI 'role' because it's a new account
        await setDoc(userDocRef, {
          uid: result.user.uid,
          name: result.user.displayName || "Usuario Google",
          email: result.user.email,
          phone: result.user.phoneNumber || "",
          role: role,
          createdAt: new Date().toISOString(),
        });
        dbRole = role; // New user: use selected role from UI
      } else {
        // Existing user: ALWAYS use Firestore role, ignore UI selection
        dbRole = userDoc.data().role;
      }

      console.log("Login Google exitoso. Rol en BD:", dbRole);

      // Redirection logic based on real DB role
      if (dbRole === "admin") {
        router.push("/admin");
      } else if (dbRole === "rep") {
        router.push("/dashboard/rep");
      } else {
        router.push("/dashboard/client");
      }
    } catch (err: any) {
      console.error("Error completo de Google Login:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setIsLoading(false);
        return;
      }
      if (err.code === "auth/unauthorized-domain") {
        const domain =
          typeof window !== "undefined"
            ? window.location.hostname
            : "este dominio";
        console.error(
          `ERROR TÉCNICO: El dominio ${domain} no está autorizado en Firebase Console.`,
        );
        setError(
          "Lo sentimos, el servicio de autenticación no está disponible temporalmente en este dominio. Por favor, intenta desde el dominio principal o contacta con el administrador.",
        );
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: AuthError) => {
    switch (error.code) {
      case "auth/invalid-email":
        return "El correo electrónico no es válido.";
      case "auth/user-disabled":
        return "Este usuario ha sido deshabilitado.";
      case "auth/user-not-found":
        return "No existe una cuenta con este correo.";
      case "auth/wrong-password":
        return "La contraseña es incorrecta.";
      case "auth/email-already-in-use":
        return "El correo electrónico ya está registrado.";
      case "auth/weak-password":
        return "La contraseña es muy débil (mínimo 6 caracteres).";
      default:
        return "Ocurrió un error inesperado. Inténtalo de nuevo.";
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4 lg:p-0">
      <div className="w-full max-w-[1920px] h-screen lg:min-h-[800px] flex overflow-hidden bg-white dark:bg-[#1a2632] shadow-2xl rounded-none lg:rounded-none relative">
        {/* Left Side (Visual/Brand) */}
        <div
          className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between p-12 text-white bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBCALw-3etFjVdcUvGuUl6d7rXqS2RyWvaj6mwxuzasi67dFynakrPb3EtE3g8JU_GcwdldytzxcRxYhs_hm1lpR8I9U-xpGN4slmRaL7zkLhXVxjkgyCid6Biz9xSWDvYSlgyiRS7VkJZgdwJudsxEJZ0qZJvOZCvWjYpJ329qo2PPnZgfF3YC_cy9dQtzBIfANcADWc3Os8RvPP2XspEiv6RJm9167BnDSf_l6bF4x6P3GdK_4gnzjiQLZov2wz0oV5Lu08X_Xg')",
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-blue-900/60 mix-blend-multiply z-0"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-0"></div>
          {/* Logo Area */}
          <div className="relative z-10 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">
                  verified_user
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Personas de Confianza
              </h1>
            </Link>
          </div>
          {/* Tagline Area */}
          <div className="relative z-10 max-w-lg mb-10">
            <blockquote className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight mb-6">
              "La confianza que acorta distancias"
            </blockquote>
            <p className="text-lg text-blue-100 font-medium">
              Conectando personas y oportunidades con la seguridad que mereces.
            </p>
            <div className="flex gap-2 mt-8">
              <div className="h-1.5 w-8 bg-white rounded-full"></div>
              <div className="h-1.5 w-2 bg-white/40 rounded-full"></div>
              <div className="h-1.5 w-2 bg-white/40 rounded-full"></div>
            </div>
          </div>
        </div>
        {/* Right Side (Form Area) */}
        <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col h-full bg-white dark:bg-[#1a2632] overflow-y-auto">
          {/* Mobile Header */}
          <div className="lg:hidden p-6 pb-0 flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-2xl">
              verified_user
            </span>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              Personas de Confianza
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-12 lg:px-24 xl:px-32 max-w-3xl mx-auto w-full">
            {/* Main Header */}
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Bienvenido
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Ingresa tus datos para continuar
              </p>
            </div>
            {/* Tabs (Login/Register) */}
            <div className="w-full mb-8">
              <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button
                  className={`flex-1 pb-4 text-center font-semibold text-sm border-b-2 transition-colors ${
                    activeTab === "login"
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                  onClick={() => setActiveTab("login")}
                >
                  Iniciar Sesión
                </button>
                <button
                  className={`flex-1 pb-4 text-center font-semibold text-sm border-b-2 transition-colors ${
                    activeTab === "register"
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                  onClick={() => setActiveTab("register")}
                >
                  Registrarse
                </button>
              </div>
            </div>
            {/* Segmented Control (Role) */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-8">
              <button
                className={`flex-1 h-10 flex items-center justify-center rounded-md text-sm font-medium transition-all ${
                  role === "client"
                    ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                    : "text-slate-600 dark:text-slate-300"
                }`}
                onClick={() => setRole("client")}
              >
                Soy un Cliente
              </button>
              <button
                className={`flex-1 h-10 flex items-center justify-center rounded-md text-sm font-medium transition-all ${
                  role === "rep"
                    ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                    : "text-slate-600 dark:text-slate-300"
                }`}
                onClick={() => setRole("rep")}
              >
                Quiero ser Representante
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
              <form
                className="flex flex-col gap-5 animate-fade-in"
                onSubmit={handleLogin}
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-3 px-4 pl-4 sm:text-sm"
                      placeholder="nombre@ejemplo.com"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Contraseña
                    </label>
                    <a
                      href="#"
                      className="text-sm font-medium text-primary hover:text-primary-dark hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-3 px-4 pl-4 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Iniciando sesión..." : "Entrar a mi cuenta"}
                </button>
              </form>
            )}

            {/* Registration Form */}
            {activeTab === "register" && (
              <form
                className="flex flex-col gap-5 animate-fade-in"
                onSubmit={handleRegister}
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-3 px-4 pl-4 sm:text-sm"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-3 px-4 pl-4 sm:text-sm"
                        placeholder="nombre@ejemplo.com"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Teléfono
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-3 px-4 pl-4 sm:text-sm"
                        placeholder="+34 600 000 000"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary py-3 px-4 pl-4 sm:text-sm"
                      placeholder="Crear contraseña"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Debe tener al menos 8 caracteres
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creando cuenta..." : "Crear mi cuenta"}
                </button>
                <p className="text-xs text-center text-slate-500 mt-2">
                  Al registrarte aceptas nuestros{" "}
                  <a href="#" className="text-primary hover:underline">
                    Términos y condiciones
                  </a>
                  .
                </p>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-[#1a2632] text-slate-500">
                  O continúa con
                </span>
              </div>
            </div>

            {/* Social Auth */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="flex items-center justify-center p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group disabled:opacity-50"
                title="Google"
              >
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="flex items-center justify-center p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                title="Apple"
              >
                <span className="material-symbols-outlined text-xl text-slate-900 dark:text-white">
                  apple
                </span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                title="Microsoft"
              >
                <svg className="h-5 w-5" viewBox="0 0 23 23">
                  <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
              </button>
              <button
                type="button"
                className="flex items-center justify-center p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                title="LinkedIn"
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTEB0T0uxdGoDRU6YFSNCNF7Vm5En4xNQARj57AcTS102VcJ8YNoz8xDrEShJKAqoWU6KNUk7Mm0qv2awtDCiEdlPfqSuEUwXqbz51Y-tBI8b1jnK7oc3GBBRmtSumg1bCSJjWXbCX6ZqcH39LbN3NB56z6y7dbNwi1FVAc9P1Vx7YiRx-Ew6357iw5o8uWPthgIbhayDmZDtyUFqt46A-JzBPHpwX2GtL-jIgLn-1fHRxDuY_22e1G6xXtmNJYP_3ohjN56Oarw"
                  alt="LinkedIn Logo"
                  className="h-5 w-5"
                />
              </button>
            </div>

            {/* Footer Links */}
            <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-center gap-6 text-xs text-slate-500">
              <a href="#" className="hover:text-primary transition-colors">
                Términos y condiciones
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Política de privacidad
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Ayuda
              </a>
            </div>
          </div>
        </div>
        <style jsx global>{`
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
    </div>
  );
}
