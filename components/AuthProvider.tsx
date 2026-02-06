"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // No hacer nada mientras está cargando el estado inicial
    if (loading) return;

    if (!user) {
      const protectedPrefixes = [
        "/dashboard",
        "/admin",
        "/messages",
        "/settings",
      ];

      const isProtected = protectedPrefixes.some(
        (prefix) =>
          pathname.startsWith(prefix) ||
          pathname.startsWith("/PersonasDeConfianza" + prefix),
      );

      if (isProtected) {
        console.log(
          "Acceso protegido sin sesión, esperando brevemente antes de redirigir...",
        );
        const timer = setTimeout(() => {
          // Re-chequeamos después de 500ms para evitar falsos positivos durante la navegación
          router.push("/auth");
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, loading, pathname, router]);

  // Optional: Show a loading spinner while checking auth state globally
  // const isProtected = ["/dashboard", "/admin", "/messages", "/settings"].some(route => pathname.startsWith(route));
  // if (loading && isProtected) return <div className="h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
