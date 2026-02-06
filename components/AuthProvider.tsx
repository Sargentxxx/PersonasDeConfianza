"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
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

  // Ref to access the latest state inside the timeout callback
  const authState = useRef({ user, loading });

  useEffect(() => {
    authState.current = { user, loading };
  }, [user, loading]);

  useEffect(() => {
    // If still loading initially, do nothing
    if (loading) return;

    // Check if current path is protected
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

    if (isProtected && !user) {
      console.log("Acceso protegido sin sesión, iniciando verificación...");

      const timer = setTimeout(() => {
        // CRITICAL CHECK: Use the REF to check the *current* state after the delay
        // If we simply checked 'user' here, it would be the stale value from when the timeout started
        const currentAuth = authState.current;

        if (!currentAuth.loading && !currentAuth.user) {
          console.log("Sesión no recuperada tras espera. Redirigiendo a /auth");
          router.push("/auth");
        } else {
          console.log(
            "Sesión recuperada justo a tiempo. Cancelando redirección.",
          );
        }
      }, 2000);

      return () => clearTimeout(timer);
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
