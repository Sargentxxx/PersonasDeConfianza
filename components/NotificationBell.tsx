"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "./AuthProvider";
import Link from "next/link";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notes);
      setUnreadCount(notes.filter((n: any) => n.status === "unread").length);
    });

    return () => unsubscribe();
  }, [user]);

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    const batch = writeBatch(db);
    notifications.forEach((n) => {
      if (n.status === "unread") {
        const ref = doc(db, "notifications", n.id);
        batch.update(ref, { status: "read" });
      }
    });
    await batch.commit();
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Recientemente";
    const now = new Date();
    const date = timestamp.toDate();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Ahora";
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
    return date.toLocaleDateString();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "chat":
        return "chat";
      case "validation":
        return "verified";
      case "request":
        return "assignment";
      default:
        return "notifications";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) markAllAsRead();
        }}
        className="relative p-2 text-slate-500 hover:text-primary transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <span className="material-symbols-outlined text-[28px]">
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#1a2632]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1a2632] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-scale-in origin-top-right">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Notificaciones
              </h3>
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Marcar todas como leídas
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">
                    notifications_off
                  </span>
                  <p className="text-sm text-slate-500">
                    No tienes notificaciones
                  </p>
                </div>
              ) : (
                notifications.map((note) => (
                  <Link
                    key={note.id}
                    href={note.link || "#"}
                    onClick={() => setIsOpen(false)}
                    className={`block p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${note.status === "unread" ? "bg-blue-50/30 dark:bg-primary/5" : ""}`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          note.status === "unread"
                            ? "bg-primary text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {getIcon(note.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${note.status === "unread" ? "font-bold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}
                        >
                          {note.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {note.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                          {getTimeAgo(note.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-center">
                <button className="text-xs text-slate-500 font-bold hover:text-primary transition-colors">
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
