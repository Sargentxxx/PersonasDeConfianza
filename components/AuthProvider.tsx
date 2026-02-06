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
    // Prevent redirecting while auth state is being determined
    if (loading) return;

    if (!user) {
      // List of roots that require authentication
      const protectedPrefixes = [
        "/dashboard",
        "/admin",
        "/messages",
        "/settings",
      ];

      // usePathname() in Next.js already handles basePath (it doesn't include it)
      // but let's be extra safe and check for both relative and potentially full paths
      const isProtected = protectedPrefixes.some(
        (prefix) =>
          pathname.startsWith(prefix) ||
          pathname.startsWith("/PersonasDeConfianza" + prefix),
      );

      if (isProtected) {
        console.log(
          "Protected route accessed without user, redirecting to /auth",
          pathname,
        );
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
