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
    // Simple client-side route protection
    // If not loading, and no user, and trying to access protected routes -> redirect
    if (!loading && !user) {
      const protectedRoutes = [
        "/dashboard",
        "/admin",
        "/messages",
        "/settings",
      ];
      const isProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route),
      );

      if (isProtected) {
        router.push("/auth");
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
