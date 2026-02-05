"use client";

import Link from "next/link";

interface MobileHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function MobileHeader({
  onMenuClick,
  title = "Personas de Confianza",
}: MobileHeaderProps) {
  return (
    <div className="lg:hidden bg-white dark:bg-[#1a2632] p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
      <Link href="/" className="flex items-center gap-2 text-primary">
        <span className="material-symbols-outlined text-2xl">
          verified_user
        </span>
        <span className="font-bold text-lg">{title}</span>
      </Link>
      <button
        onClick={onMenuClick}
        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>
    </div>
  );
}
