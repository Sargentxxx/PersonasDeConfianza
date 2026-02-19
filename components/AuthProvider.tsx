"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

interface UserData {
  role: "client" | "rep" | "admin" | string;
  address?: string;
  profession?: string;
  specialization?: string;
  schedule?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Ref to access the latest state inside the timeout callback
  const authState = useRef({ user, userData, loading });

  useEffect(() => {
    authState.current = { user, userData, loading };
  }, [user, userData, loading]);

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

  // ROLE-BASED ACCESS CONTROL
  useEffect(() => {
    // Wait until we have user data
    if (loading || !user || !userData) return;

    const userRole = userData.role || "client";
    const normalizedPath = pathname.startsWith("/PersonasDeConfianza")
      ? pathname.substring("/PersonasDeConfianza".length)
      : pathname;

    // Define shared routes accessible by all authenticated users
    const sharedRoutes = ["/dashboard/chat", "/messages", "/settings"];

    // Check if current route is a shared route
    const isSharedRoute = sharedRoutes.some((route) =>
      normalizedPath.startsWith(route),
    );

    // Define role-specific allowed routes
    const roleRoutes: Record<string, string[]> = {
      admin: ["/admin"],
      rep: ["/dashboard/rep"],
      client: ["/dashboard/client"],
    };

    // Get allowed paths for current user's role
    const allowedPaths = roleRoutes[userRole] || roleRoutes.client;

    // Check if current path starts with any allowed path
    const isAllowedPath =
      userRole === "admin" ||
      allowedPaths.some((path) => normalizedPath.startsWith(path));

    // If trying to access a dashboard route
    const isDashboardRoute =
      normalizedPath.startsWith("/dashboard/") ||
      normalizedPath.startsWith("/admin");

    // If user is on a dashboard route but not their own, redirect
    // BUT allow shared routes for all users
    if (isDashboardRoute && !isAllowedPath && !isSharedRoute) {
      console.log(
        `AuthProvider: ⚠️ Redirección Forzada.`,
        `\n  - Rol Actual: "${userRole}"`,
        `\n  - Ruta Intentada: "${normalizedPath}"`,
        `\n  - Rutas Permitidas: ${JSON.stringify(allowedPaths)}`,
      );

      // Redirect to correct dashboard based on role
      if (userRole === "admin") {
        router.push("/admin");
      } else if (userRole === "rep") {
        router.push("/dashboard/rep");
      } else {
        router.push("/dashboard/client");
      }
    }
  }, [user, userData, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
