"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { db, storage } from "@/lib/firebase";
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { sendNotification } from "@/lib/notifications";

interface Message {
  id: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  documentUrl?: string;
  fileName?: string;
  fileType?: string;
  senderId: string;
  senderName?: string;
  createdAt: Timestamp;
}

interface RequestData {
  title: string;
  clientId: string;
  repId: string;
  clientName: string;
  repName: string;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("id");
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [taskData, setTaskData] = useState<RequestData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const dashboardPath =
    userData?.role === "rep" ? "/dashboard/rep" : "/dashboard/client";

  useEffect(() => {
    if (!user || !taskId) return;
    const fetchTask = async () => {
      try {
        const docRef = doc(db, "requests", taskId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as RequestData;
          const isClient = user.uid === data.clientId;
          const isRep = user.uid === data.repId;
          if (!isClient && !isRep) {
            setAccessDenied(true);
            return;
          }
          setTaskData(data);
        }
      } catch (err) {
        console.error("Error al cargar la tarea:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId, user, router]);

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
      const sortedMsgs = msgs.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return aTime - bTime;
      });
      setMessages(sortedMsgs);
      setLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });
    return () => unsubscribe();
  }, [taskId]);

  useEffect(() => {
    if (!isRecording && audioChunks.length > 0) {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      setAudioBlob(blob);
    }
  }, [isRecording, audioChunks]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !audioBlob) || !user || !taskId) return;

    try {
      if (audioBlob) {
        setUploading(true);
        const storageRef = ref(
          storage,
          `chat_audio/${taskId}/${Date.now()}.webm`,
        );
        await uploadBytes(storageRef, audioBlob);
        const url = await getDownloadURL(storageRef);
        await addDoc(collection(db, "requests", taskId, "messages"), {
          audioUrl: url,
          senderId: user.uid,
          senderName: user.displayName || "Usuario",
          createdAt: serverTimestamp(),
          fileType: "audio/webm",
        });
        setAudioBlob(null);
        setAudioChunks([]);
      } else {
        await addDoc(collection(db, "requests", taskId, "messages"), {
          text: newMessage,
          senderId: user.uid,
          senderName: user.displayName || "Usuario",
          createdAt: serverTimestamp(),
        });
      }

      const recipientId =
        user.uid === taskData?.clientId ? taskData?.repId : taskData?.clientId;
      if (recipientId) {
        sendNotification({
          recipientId,
          title: audioBlob ? "Nuevo audio" : "Nuevo mensaje",
          message: audioBlob
            ? "Te ha enviado un mensaje de voz."
            : `${user.displayName}: ${newMessage}`,
          type: "chat",
          link: `/dashboard/chat?id=${taskId}`,
        });
      }
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video" | "document",
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user || !taskId) return;
    setUploading(true);
    try {
      let folder = "chat_documents";
      if (type === "image") folder = "chat_images";
      if (type === "video") folder = "chat_videos";
      const storageRef = ref(
        storage,
        `${folder}/${taskId}/${Date.now()}_${file.name}`,
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const messageData: Record<string, unknown> = {
        senderId: user.uid,
        senderName: user.displayName || "Usuario",
        createdAt: serverTimestamp(),
        fileName: file.name,
        fileType: file.type,
      };
      if (type === "image") messageData.imageUrl = url;
      else if (type === "video") messageData.videoUrl = url;
      else if (type === "document") messageData.documentUrl = url;
      await addDoc(collection(db, "requests", taskId, "messages"), messageData);

      const recipientId =
        user.uid === taskData?.clientId ? taskData?.repId : taskData?.clientId;
      if (recipientId) {
        let notifMsg = "Te ha enviado un archivo.";
        if (type === "image") notifMsg = "Te ha enviado una imagen.";
        if (type === "video") notifMsg = "Te ha enviado un video.";
        sendNotification({
          recipientId,
          title: "Nuevo archivo adjunto",
          message: `${user.displayName}: ${notifMsg}`,
          type: "chat",
          link: `/dashboard/chat?id=${taskId}`,
        });
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setIsRecording(true);
      setRecordingTime(0);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0)
          setAudioChunks((prev) => [...prev, event.data]);
      };
      recorder.start();
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setAudioChunks([]);
    setAudioBlob(null);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorder)
      mediaRecorder.stream.getTracks().forEach((t) => t.stop());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Derive sender display name from taskData
  const getSenderName = (msg: Message): string => {
    if (msg.senderName) return msg.senderName;
    // fallback: check if senderId matches known participants
    if (taskData) {
      if (msg.senderId === taskData.clientId)
        return taskData.clientName || "Cliente";
      if (msg.senderId === taskData.repId)
        return taskData.repName || "Representante";
    }
    return "Usuario";
  };

  const otherPersonName =
    user?.uid === taskData?.clientId ? taskData?.repName : taskData?.clientName;

  // Avatar initials helper
  const initials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  if (accessDenied) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#0f172a] p-4 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-5xl text-red-400">
            gpp_maybe
          </span>
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Acceso Denegado</h1>
        <p className="text-slate-400 mb-8 max-w-md font-medium">
          No tienes permiso para ver esta conversación.
        </p>
        <button
          onClick={() => router.push(dashboardPath)}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          Volver al Panel
        </button>
      </div>
    );
  }

  if ((loading || authLoading) && !taskData) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f172a]">
        <span className="w-10 h-10 border-4 border-slate-700 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] overflow-hidden">
      {/* ── Header ── */}
      <header className="shrink-0 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4 shadow-2xl shadow-black/30 z-10">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-slate-300"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>

        {/* Avatar of the other person */}
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/20 shrink-0">
          {initials(otherPersonName || "U")}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-black text-white truncate text-base tracking-tight">
            {taskData?.title || "Chat"}
          </h1>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            {otherPersonName || "Usuario"}
          </p>
        </div>

        <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-slate-300 cursor-pointer">
          <span className="material-symbols-outlined text-xl">more_vert</span>
        </div>
      </header>

      {/* ── Messages Area ── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.05) 0%, transparent 60%)",
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-slate-500">
                forum
              </span>
            </div>
            <p className="text-slate-500 font-medium text-sm">
              Inicia la conversación...
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.uid;
            const senderName = getSenderName(msg);
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showSender = !prevMsg || prevMsg.senderId !== msg.senderId;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} gap-1`}
              >
                {/* Sender name above bubble */}
                {showSender && (
                  <span
                    className={`text-[11px] font-bold tracking-wide px-1 ${
                      isMe ? "text-primary/70" : "text-slate-400"
                    }`}
                  >
                    {isMe ? "Tú" : senderName}
                  </span>
                )}

                <div
                  className={`max-w-[80%] sm:max-w-[65%] rounded-3xl text-sm shadow-lg transition-all ${
                    isMe
                      ? "bg-gradient-to-br from-primary to-blue-600 text-white rounded-br-md shadow-blue-900/30"
                      : "bg-[#1e293b] text-slate-200 border border-white/5 rounded-bl-md shadow-black/30"
                  }`}
                >
                  <div className="px-4 py-3">
                    {/* Image */}
                    {msg.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={msg.imageUrl}
                        alt="Imagen adjunta"
                        className="w-full h-auto rounded-2xl mb-2 max-w-[260px] object-cover"
                      />
                    )}

                    {/* Video */}
                    {msg.videoUrl && (
                      <video
                        controls
                        src={msg.videoUrl}
                        className="w-full max-w-[280px] rounded-2xl mb-2"
                      />
                    )}

                    {/* Audio */}
                    {msg.audioUrl && (
                      <div className="mb-2 min-w-[200px]">
                        <audio
                          controls
                          src={msg.audioUrl}
                          className="h-10 w-full rounded-xl"
                        />
                      </div>
                    )}

                    {/* Document */}
                    {msg.documentUrl && (
                      <a
                        href={msg.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-3 rounded-2xl mb-2 transition-colors ${
                          isMe
                            ? "bg-white/10 hover:bg-white/20 text-white"
                            : "bg-white/5 hover:bg-white/10 text-slate-200"
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl">
                          description
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate text-xs">
                            {msg.fileName || "Documento"}
                          </p>
                          <p className="opacity-60 text-[10px] uppercase">
                            {msg.fileType?.split("/").pop() || "ARCHIVO"}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-lg opacity-60">
                          download
                        </span>
                      </a>
                    )}

                    {/* Text */}
                    {msg.text && (
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.text}
                      </p>
                    )}

                    {/* Timestamp */}
                    <div
                      className={`flex items-center gap-1 mt-1.5 ${isMe ? "justify-end" : ""}`}
                    >
                      <span
                        className={`text-[10px] font-medium ${isMe ? "text-blue-200/60" : "text-slate-500"}`}
                      >
                        {msg.createdAt?.toDate
                          ? msg.createdAt.toDate().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Enviando..."}
                      </span>
                      {isMe && (
                        <span className="material-symbols-outlined text-[12px] text-blue-200/60">
                          done_all
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="shrink-0 px-4 py-3 bg-[#0f172a]/90 backdrop-blur-xl border-t border-white/5">
        {/* Hidden file inputs */}
        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept="image/*"
          onChange={(e) => handleFileUpload(e, "image")}
        />
        <input
          type="file"
          ref={videoInputRef}
          hidden
          accept="video/*"
          onChange={(e) => handleFileUpload(e, "video")}
        />
        <input
          type="file"
          ref={docInputRef}
          hidden
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
          onChange={(e) => handleFileUpload(e, "document")}
        />

        {/* Audio blob preview */}
        {audioBlob ? (
          <div className="flex items-center gap-3 py-2 px-4 bg-[#1e293b] rounded-2xl mb-3 border border-white/5">
            <span className="material-symbols-outlined text-red-400">mic</span>
            <span className="text-sm font-bold text-slate-300 shrink-0">
              Audio grabado
            </span>
            <audio
              controls
              src={URL.createObjectURL(audioBlob)}
              className="h-8 flex-1 min-w-0"
            />
            <button
              onClick={() => setAudioBlob(null)}
              className="text-slate-500 hover:text-red-400 transition-colors"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
            <button
              onClick={() => handleSendMessage()}
              className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-black hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              Enviar
            </button>
          </div>
        ) : isRecording ? (
          <div className="flex items-center justify-between py-3 px-4 bg-red-950/30 rounded-2xl border border-red-500/20 mb-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-mono font-black text-red-400">
                {formatTime(recordingTime)}
              </span>
              <span className="text-sm text-slate-400">Grabando...</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={cancelRecording}
                className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
              <button
                onClick={stopRecording}
                className="w-9 h-9 flex items-center justify-center bg-red-500 hover:bg-red-600 rounded-xl text-white transition-all shadow-lg shadow-red-500/20"
              >
                <span className="material-symbols-outlined text-lg">check</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            {/* Attachment buttons */}
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Imagen"
                className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-xl">image</span>
              </button>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading}
                title="Video"
                className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-500 hover:text-purple-400 hover:bg-purple-400/10 transition-all disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-xl">
                  videocam
                </span>
              </button>
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                disabled={uploading}
                title="Documento"
                className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-500 hover:text-orange-400 hover:bg-orange-400/10 transition-all disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-xl">
                  attach_file
                </span>
              </button>
            </div>

            {/* Text input */}
            <div className="flex-1 bg-[#1e293b] rounded-3xl flex items-end px-4 py-2 border border-white/5 focus-within:border-primary/40 transition-all">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-transparent border-0 text-slate-200 placeholder-slate-500 focus:ring-0 resize-none py-1 max-h-32 min-h-[28px] text-sm leading-relaxed outline-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>

            {/* Send / Mic button */}
            {newMessage.trim() ? (
              <button
                type="submit"
                disabled={uploading}
                className="w-11 h-11 flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all disabled:opacity-40 shrink-0"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                disabled={uploading}
                className="w-11 h-11 flex items-center justify-center bg-[#1e293b] text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl border border-white/5 transition-all disabled:opacity-40 shrink-0"
              >
                <span className="material-symbols-outlined text-xl">mic</span>
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[#0f172a]">
          <span className="w-10 h-10 border-4 border-slate-700 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
