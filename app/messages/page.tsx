"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  limit,
} from "firebase/firestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Message {
  id: string;
  text?: string;
  imageUrl?: string;
  senderId: string;
  createdAt: Timestamp;
}

interface Conversation {
  id: string;
  title: string;
  clientId: string;
  repId: string;
  clientName: string;
  repName: string;
  lastMessage?: {
    text?: string;
    imageUrl?: string;
    createdAt?: Timestamp;
  };
}

export default function MessagesPage() {
  const { user, userData } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Load all conversations where the user is involved
  useEffect(() => {
    if (!user) return;

    // Split 'or' query into two for better index compatibility
    const q1 = query(
      collection(db, "requests"),
      where("clientId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    const q2 = query(
      collection(db, "requests"),
      where("repId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const handleSnapshot = async (snapshot: QuerySnapshot) => {
      const convs: Conversation[] = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const messagesQuery = query(
          collection(db, "requests", doc.id, "messages"),
          orderBy("createdAt", "desc"),
          limit(1),
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const lastMsg = messagesSnapshot.docs[0]?.data();

        convs.push({
          id: doc.id,
          title: data.title,
          clientId: data.clientId,
          repId: data.repId,
          clientName: data.clientName,
          repName: data.repName || "Representante",
          lastMessage: lastMsg
            ? {
                text: lastMsg.text,
                imageUrl: lastMsg.imageUrl,
                createdAt: lastMsg.createdAt,
              }
            : undefined,
        });
      }
      return convs;
    };

    const unsubscribe1 = onSnapshot(q1, async (snapshot) => {
      const clientConvs = await handleSnapshot(snapshot);
      setConversations((prev) => {
        const others = prev.filter((c) => c.repId === user.uid);
        return [...clientConvs, ...others].sort(
          (a, b) =>
            (b.lastMessage?.createdAt?.toMillis() || 0) -
            (a.lastMessage?.createdAt?.toMillis() || 0),
        );
      });
      setLoading(false);
    });

    const unsubscribe2 = onSnapshot(q2, async (snapshot) => {
      const repConvs = await handleSnapshot(snapshot);
      setConversations((prev) => {
        const others = prev.filter((c) => c.clientId === user.uid);
        return [...others, ...repConvs].sort(
          (a, b) =>
            (b.lastMessage?.createdAt?.toMillis() || 0) -
            (a.lastMessage?.createdAt?.toMillis() || 0),
        );
      });
      setLoading(false);
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [user]);

  // 2. Load messages for active conversation
  useEffect(() => {
    if (!activeChat) return;

    const q = query(
      collection(db, "requests", activeChat, "messages"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);

      // Auto-scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [activeChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeChat) return;

    try {
      await addDoc(collection(db, "requests", activeChat, "messages"), {
        text: newMessage,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error al enviar mensaje.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeChat) return;

    setUploading(true);
    try {
      const storageRef = ref(
        storage,
        `chat_images/${activeChat}/${Date.now()}_${file.name}`,
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "requests", activeChat, "messages"), {
        imageUrl: url,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error al subir imagen.");
    } finally {
      setUploading(false);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeChat);
  const otherPersonName =
    user?.uid === activeConversation?.clientId
      ? activeConversation?.repName
      : activeConversation?.clientName;

  const dashboardPath =
    userData?.role === "rep" ? "/dashboard/rep" : "/dashboard/client";

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans text-slate-800 dark:text-slate-200">
      {/* Navbar */}
      <nav className="bg-white dark:bg-[#1a2632] border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 lg:px-8">
        <Link
          href={dashboardPath}
          className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-semibold hidden sm:inline">
            Volver al Dashboard
          </span>
        </Link>
        <div className="font-bold text-lg">Mensajes</div>
        <div className="w-8"></div>
      </nav>

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Chat List Sidebar */}
        <div
          className={`w-full md:w-80 lg:w-96 bg-white dark:bg-[#1a2632] border-r border-slate-200 dark:border-slate-700 flex flex-col ${
            mobileMenuOpen ? "block fixed inset-0 z-50" : "hidden md:flex"
          }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="font-bold text-lg">Conversaciones</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-10">
                <span className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center p-10 text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2 block">
                  inbox
                </span>
                <p className="text-sm">No tienes conversaciones activas</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    window.location.href = `/dashboard/chat?id=${conv.id}`;
                  }}
                  className={`p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    activeChat === conv.id
                      ? "bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-primary"
                      : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold">
                      {(user?.uid === conv.clientId
                        ? conv.repName
                        : conv.clientName
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-sm truncate text-slate-900 dark:text-white">
                          {user?.uid === conv.clientId
                            ? conv.repName
                            : conv.clientName}
                        </h3>
                        {conv.lastMessage?.createdAt && (
                          <span className="text-xs text-slate-500">
                            {conv.lastMessage.createdAt
                              .toDate()
                              .toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {conv.lastMessage?.text ||
                          (conv.lastMessage?.imageUrl
                            ? "📷 Imagen"
                            : "Nueva conversación")}
                      </p>
                      <div className="mt-2 flex gap-1">
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase truncate">
                          {conv.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-background-dark">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <button
                    className="md:hidden p-2 -ml-2 text-slate-600"
                    onClick={() => setMobileMenuOpen(true)}
                  >
                    <span className="material-symbols-outlined">menu</span>
                  </button>
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold">
                    {otherPersonName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {otherPersonName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {activeConversation?.title}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/chat?id=${activeChat}`}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined">open_in_new</span>
                </Link>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                    <span className="material-symbols-outlined text-6xl mb-2">
                      forum
                    </span>
                    <p>Inicia la conversación...</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${
                          isMe ? "flex-row-reverse ml-auto" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mt-1 ${
                            isMe
                              ? "bg-blue-100 text-primary"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {isMe
                            ? "YO"
                            : otherPersonName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div
                            className={`p-3 rounded-2xl shadow-sm ${
                              isMe
                                ? "bg-primary text-white rounded-tr-none shadow-blue-500/20"
                                : "bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-tl-none"
                            }`}
                          >
                            {msg.imageUrl && (
                              <img
                                src={msg.imageUrl}
                                alt="Adjunto"
                                className="w-full h-auto rounded-lg mb-2 max-w-[200px] object-cover"
                              />
                            )}
                            {msg.text && <p className="text-sm">{msg.text}</p>}
                          </div>
                          <div
                            className={`flex items-center gap-1 mt-1 ${
                              isMe ? "justify-end" : ""
                            }`}
                          >
                            <span className="text-[10px] text-slate-400">
                              {msg.createdAt?.toDate
                                ? msg.createdAt
                                    .toDate()
                                    .toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                : "Enviando..."}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={scrollRef}></div>
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-[#1a2632] border-t border-slate-200 dark:border-slate-700">
                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-2 items-center"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 text-slate-400 hover:text-primary transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <span className="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin block"></span>
                    ) : (
                      <span className="material-symbols-outlined">
                        add_photo_alternate
                      </span>
                    )}
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 pl-4 pr-10 focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <span className="material-symbols-outlined text-6xl mb-4">
                chat_bubble_outline
              </span>
              <p className="text-lg font-medium">
                Selecciona una conversación para comenzar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
