"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarLink {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

interface UserProfile {
  name: string;
  role: string;
  image: string;
}

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  user: UserProfile;
  links: SidebarLink[];
  secondaryLinks?: SidebarLink[]; // For Admin sections or bottom links
}

export default function DashboardSidebar({
  isOpen,
  onClose,
  title = "Personas de Confianza",
  user,
  links,
  secondaryLinks,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#1a2632] border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 hidden lg:flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined text-3xl">
              verified_user
            </span>
            <span className="font-bold text-xl">{title}</span>
          </div>

          {/* User Profile */}
          <div className="p-6 flex items-center gap-4">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.image}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-600 shadow-sm"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {user.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.role}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-primary"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                >
                  <span className="material-symbols-outlined">{link.icon}</span>
                  {link.label}
                  {link.badge && (
                    <span
                      className={`ml-auto text-white text-xs font-bold px-2 py-0.5 rounded-full ${
                        link.badgeColor || "bg-red-500"
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {secondaryLinks && (
              <>
                <div className="my-4 border-t border-slate-100 dark:border-slate-700 mx-4"></div>
                {secondaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl font-medium transition-colors"
                    onClick={() => window.innerWidth < 1024 && onClose()}
                  >
                    <span className="material-symbols-outlined">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* Footer / Logout */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <Link
              href="/auth"
              className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}
    </>
  );
}
