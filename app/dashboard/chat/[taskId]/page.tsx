"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { use } from "react";

export async function generateStaticParams() {
  return [{ taskId: "placeholder" }];
}

interface Message {
  id: string;
  text?: string;
  imageUrl?: string;
  senderId: string;
  createdAt: Timestamp;
}

interface RequestData {
  title: string;
  clientId: string;
  repId: string;
  clientName: string;
  repName: string;
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [taskData, setTaskData] = useState<RequestData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load Task Details to verify access & show title
  useEffect(() => {
    if (!user || !taskId) return;

    const fetchTask = async () => {
      try {
        const docRef = doc(db, "requests", taskId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as RequestData;
          // Simple Security Check: User must be Client OR Rep of this task
          if (user.uid !== data.clientId && user.uid !== data.repId) {
            alert("No tienes permiso para ver este chat.");
            router.push("/dashboard/client"); // Fallback redirect
            return;
          }
          setTaskData(data);
        } else {
          console.error("Task not found");
        }
      } catch (err) {
        console.error("Error fetching task:", err);
      }
    };

    fetchTask();
  }, [taskId, user, router]);

  // 2. Load Messages in Real-Time
  useEffect(() => {
    if (!taskId) return;

    const q = query(
      collection(db, "requests", taskId, "messages"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
      // Auto-scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [taskId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, "requests", taskId, "messages"), {
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
    if (!file || !user) return;

    setUploading(true);
    try {
      const storageRef = ref(
        storage,
        `chat_images/${taskId}/${Date.now()}_${file.name}`,
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "requests", taskId, "messages"), {
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

  if (loading && !taskData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <span className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></span>
      </div>
    );
  }

  const otherPersonName =
    user?.uid === taskData?.clientId ? taskData?.repName : taskData?.clientName;

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-[#1a2632] border-b border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
            arrow_back
          </span>
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-slate-900 dark:text-white truncate text-lg">
            {taskData?.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Chateando con {otherPersonName || "Usuario"}
          </p>
        </div>
      </header>

      {/* Messages Area */}
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
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none"
                  }`}
                >
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Adjunto"
                      className="w-full h-auto rounded-lg mb-2 max-w-[200px] object-cover"
                    />
                  )}
                  {msg.text && <p>{msg.text}</p>}
                  <span
                    className={`text-[10px] block text-right mt-1 opacity-70 ${isMe ? "text-blue-100" : "text-slate-400"}`}
                  >
                    {msg.createdAt?.toDate().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
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
          className="flex gap-2 max-w-4xl mx-auto"
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
            className="p-3 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin block"></span>
            ) : (
              <span className="material-symbols-outlined">
                add_photo_alternate
              </span>
            )}
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-slate-100 dark:bg-slate-900 border-0 rounded-xl px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-black transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
