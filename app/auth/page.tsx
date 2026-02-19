"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "register" : "login";
  const initialRole = (searchParams.get("role") as "client" | "rep") || "client";

  const [activeTab, setActiveTab] = useState<"login" | "register">(initialMode);
  const [role, setRole] = useState<"client" | "rep">(initialRole);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") setActiveTab("register");
    else setActiveTab("login");

    const r = searchParams.get("role");
    if (r === "rep" || r === "client") setRole(r);
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      let dbRole: string = "client";

      if (userDoc.exists()) {
        dbRole = userDoc.data().role;
      }

      if (dbRole === "admin") router.push("/admin");
      else if (dbRole === "rep") router.push("/dashboard/rep");
      else router.push("/dashboard/client");
    } catch (err: any) {
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name,
        email,
        phone,
        role,
        createdAt: new Date().toISOString(),
      });

      if (role === "client") router.push("/dashboard/client");
      else router.push("/dashboard/rep");
    } catch (err: any) {
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
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);

      let dbRole: string;

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: result.user.uid,
          name: result.user.displayName || "Usuario Google",
          email: result.user.email,
          phone: result.user.phoneNumber || "",
          role,
          createdAt: new Date().toISOString(),
        });
        dbRole = role;
      } else {
        dbRole = userDoc.data().role;
      }

      if (dbRole === "admin") router.push("/admin");
      else if (dbRole === "rep") router.push("/dashboard/rep");
      else router.push("/dashboard/client");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: AuthError) => {
    switch (error.code) {
      case "auth/invalid-email": return "El correo electrónico no es válido.";
      case "auth/user-disabled": return "Este usuario ha sido deshabilitado.";
      case "auth/user-not-found": return "No existe una cuenta con este correo.";
      case "auth/wrong-password": return "La contraseña es incorrecta.";
      case "auth/email-already-in-use": return "El correo electrónico ya está registrado.";
      case "auth/weak-password": return "La contraseña es muy débil.";
      default: return "Ocurrió un error inesperado.";
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-0 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-black/50 border border-white/5 bg-slate-900/40 backdrop-blur-3xl">
        {/* Left Side: Visual & Info */}
        <div className="hidden lg:flex flex-col justify-between p-16 relative overflow-hidden bg-slate-950/50">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Background"
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-slate-950/80 to-slate-950"></div>
          </div>

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <span className="font-display text-2xl font-black text-white">
                <span className="text-primary font-black">Personas</span>DeConfianza
              </span>
            </Link>
          </div>

          <div className="relative z-10">
            <h2 className="font-display text-5xl font-black text-white leading-[1.1] mb-6">
              La confianza que <br />
              <span className="text-gradient">acorta distancias</span>
            </h2>
            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-sm">
              Tu representante personal para verificar, gestionar y resolver trámites en cualquier lugar.
            </p>
          </div>

          <div className="relative z-10 flex gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                </div>
              ))}
            </div>
            <div className="text-sm font-semibold text-white/70">
              <span className="block text-white">+2,000 usuarios</span>
              confían en nosotros
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-900/50">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <span className="font-display text-xl font-black dark:text-white">Personas de Confianza</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="font-display text-3xl font-black text-slate-900 dark:text-white mb-3">
              {activeTab === "login" ? "¡Hola de nuevo!" : "Crea tu cuenta"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {activeTab === "login"
                ? "¿No tienes cuenta? "
                : "¿Ya tienes una cuenta? "}
              <button
                onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                className="text-primary font-bold hover:underline"
              >
                {activeTab === "login" ? "Regístrate gratis" : "Inicia sesión"}
              </button>
            </p>
          </div>

          {/* Role Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl mb-8 border border-white/5">
            <button
              onClick={() => setRole("client")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${role === "client"
                  ? "bg-white dark:bg-slate-700 text-primary shadow-xl shadow-black/10"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              Soy Cliente
            </button>
            <button
              onClick={() => setRole("rep")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${role === "rep"
                  ? "bg-white dark:bg-slate-700 text-primary shadow-xl shadow-black/10"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">badge</span>
              Soy Representante
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3 animate-fade-in">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form onSubmit={activeTab === "login" ? handleLogin : handleRegister} className="space-y-5">
            {activeTab === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Nombre Completo</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">person</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl py-4 flex pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white font-medium"
                    placeholder="Ej. Alberto Pérez"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Email</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl py-4 flex pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white font-medium"
                  placeholder="hola@ejemplo.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Contraseña</label>
                {activeTab === "login" && (
                  <button type="button" className="text-xs font-bold text-primary hover:underline">¿Olvidaste tu contraseña?</button>
                )}
              </div>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl py-4 flex pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-primary-dark hover:scale-[1.02] active:scale-[0.98] text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  {activeTab === "login" ? "Entrar ahora" : "Crear mi cuenta"}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs font-black uppercase tracking-widest text-slate-400">
              <span className="px-4 bg-white dark:bg-slate-900">O continúa con</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-4 py-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-slate-700 dark:text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
        </div>
      </div>
    </div>
  );
}
