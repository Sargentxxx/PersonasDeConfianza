"use client";

import { createContext, useContext, useEffect, useState } from "react";
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

  const protectedPrefixes = ["/dashboard", "/admin", "/messages", "/settings"];

  const isProtected = protectedPrefixes.some(
    (prefix) =>
      pathname.startsWith(prefix) ||
      pathname.startsWith("/PersonasDeConfianza" + prefix),
  );

  useEffect(() => {
    if (loading) return;

    if (isProtected && !user) {
      console.log("Redirigiendo a log-in, acceso protegido sin sesion.");
      router.push("/auth");
    }
  }, [user, loading, pathname, router, isProtected]);

  // ROLE-BASED ACCESS CONTROL
  useEffect(() => {
    if (loading || !user || !userData) return;

    const userRole = userData.role || "client";
    const normalizedPath = pathname.startsWith("/PersonasDeConfianza")
      ? pathname.substring("/PersonasDeConfianza".length)
      : pathname;

    const sharedRoutes = ["/dashboard/chat", "/messages", "/settings"];
    const isSharedRoute = sharedRoutes.some((route) =>
      normalizedPath.startsWith(route),
    );

    const roleRoutes: Record<string, string[]> = {
      admin: ["/admin"],
      rep: ["/dashboard/rep"],
      client: ["/dashboard/client"],
    };

    const allowedPaths = roleRoutes[userRole] || roleRoutes.client;
    const isAllowedPath =
      userRole === "admin" ||
      allowedPaths.some((path) => normalizedPath.startsWith(path));

    const isDashboardRoute =
      normalizedPath.startsWith("/dashboard/") ||
      normalizedPath.startsWith("/admin");

    if (isDashboardRoute && !isAllowedPath && !isSharedRoute) {
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

  // Block rendering of children if we are evaluating a protected route
  // to avoid flashes of restricted content
  if (isProtected && (loading || (!user && !loading))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
