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
  const taskId = searchParams.get("id"); // Get ID from query param ?id=...
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [taskData, setTaskData] = useState<RequestData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Audio Recording State
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

  // 1. Load Task Details to verify access & show title
  useEffect(() => {
    if (!user || !taskId) return;

    const fetchTask = async () => {
      try {
        const docRef = doc(db, "requests", taskId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as RequestData;

          // Verificación de seguridad mejorada
          const isClient = user.uid === data.clientId;
          const isRep = user.uid === data.repId;

          if (!isClient && !isRep) {
            console.warn(
              "Acceso denegado: El usuario no es ni el cliente ni el rep de esta tarea.",
            );
            setAccessDenied(true);
            return;
          }
          setTaskData(data);
        } else {
          console.error("La tarea no existe en base de datos:", taskId);
        }
      } catch (err) {
        console.error("Error al cargar la tarea:", err);
      } finally {
        setLoading(false);
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
      // Ensure messages are sorted by createdAt, handling potential nulls
      const sortedMsgs = msgs.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return aTime - bTime;
      });
      setMessages(sortedMsgs);
      setLoading(false);
      // Auto-scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [taskId]);

  // Effect to construct blob when recording stops
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
        // Upload Audio
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
          createdAt: serverTimestamp(),
          fileType: "audio/webm",
        });
        setAudioBlob(null);
        setAudioChunks([]);
      } else {
        // Text Message
        await addDoc(collection(db, "requests", taskId, "messages"), {
          text: newMessage,
          senderId: user.uid,
          createdAt: serverTimestamp(),
        });
      }

      // Trigger Notification
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
      alert("Error al enviar mensaje.");
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
        createdAt: serverTimestamp(),
        fileName: file.name,
        fileType: file.type,
      };

      if (type === "image") messageData.imageUrl = url;
      else if (type === "video") messageData.videoUrl = url;
      else if (type === "document") messageData.documentUrl = url;

      await addDoc(collection(db, "requests", taskId, "messages"), messageData);

      // Trigger Notification
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
      alert(`Error al subir ${type}.`);
    } finally {
      setUploading(false);
      // Clear inputs
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  // Audio Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      setMediaRecorder(recorder);
      setAudioChunks([]);
      setIsRecording(true);
      setRecordingTime(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        // Cleanup happens in effect or separate logic
      };

      recorder.start();

      // Timer for UI
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      // alert("No se pudo acceder al micrófono."); // Removed alert to avoid annoyance if permissions pending
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop()); // Stop stream
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setAudioChunks([]);
    setAudioBlob(null);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorder) {
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (accessDenied) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 text-center">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
          gpp_maybe
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Acceso Denegado al Chat
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
          No tienes permiso para ver esta conversación. Esto puede suceder si no
          eres parte de la tarea o si hubo un error en la carga.
        </p>
        <button
          onClick={() => router.push(dashboardPath)}
          className="bg-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-dark transition"
        >
          Volver al Panel
        </button>
      </div>
    );
  }

  if ((loading || authLoading) && !taskData) {
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
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
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
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none"
                  }`}
                >
                  {msg.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={msg.imageUrl}
                      alt="Imagen adjunta"
                      className="w-full h-auto rounded-lg mb-2 max-w-[240px] object-cover"
                    />
                  )}

                  {/* Video */}
                  {msg.videoUrl && (
                    <video
                      controls
                      src={msg.videoUrl}
                      className="w-full max-w-[280px] rounded-lg mb-2"
                    />
                  )}

                  {/* Audio */}
                  {msg.audioUrl && (
                    <div className="flex items-center gap-2 mb-2 min-w-[200px]">
                      <audio
                        controls
                        src={msg.audioUrl}
                        className={`h-10 w-full rounded-md ${isMe ? "" : "bg-slate-100"}`}
                      />
                    </div>
                  )}

                  {/* Document */}
                  {msg.documentUrl && (
                    <a
                      href={msg.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-colors ${
                        isMe
                          ? "bg-white/10 hover:bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">
                        description
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-xs">
                          {msg.fileName || "Documento"}
                        </p>
                        <p className="opacity-70 text-[10px] uppercase">
                          {msg.fileType?.split("/").pop() || "ARCHIVO"}
                        </p>
                      </div>
                      <span className="material-symbols-outlined">
                        download
                      </span>
                    </a>
                  )}

                  {msg.text && (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}

                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      isMe ? "justify-end" : ""
                    }`}
                  >
                    <span
                      className={`text-[10px] ${isMe ? "text-blue-100" : "text-slate-400"}`}
                    >
                      {msg.createdAt?.toDate
                        ? msg.createdAt.toDate().toLocaleTimeString([], {
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
      <div className="p-3 sm:p-4 bg-white dark:bg-[#1a2632] border-t border-slate-200 dark:border-slate-700">
        {/* Hidden Inputs */}
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

        {/* Audio Recording UI */}
        {audioBlob ? (
          <div className="flex items-center gap-4 py-2 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-2">
            <div className="flex-1 flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500">
                mic
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Audio grabado
              </span>
              <audio
                controls
                src={URL.createObjectURL(audioBlob)}
                className="h-8 w-48"
              />
            </div>
            <button
              onClick={() => setAudioBlob(null)}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
            <button
              onClick={() => handleSendMessage()}
              className="bg-primary text-white p-2 px-4 rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors"
            >
              Enviar Audio
            </button>
          </div>
        ) : isRecording ? (
          <div className="flex items-center justify-between py-3 px-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500 animate-pulse">
                radio_button_checked
              </span>
              <span className="font-mono font-bold text-red-600 dark:text-red-400">
                {formatTime(recordingTime)}
              </span>
              <span className="text-sm text-slate-500">Grabando...</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={cancelRecording}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 rounded-full shadow-sm"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <button
                onClick={stopRecording}
                className="p-2 text-white bg-red-500 hover:bg-red-600 transition-colors rounded-full shadow-sm"
              >
                <span className="material-symbols-outlined">check</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            {/* Attachments Menu */}
            <div className="flex gap-1" id="attachments-menu">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors disabled:opacity-50"
                title="Imagen"
              >
                <span className="material-symbols-outlined">image</span>
              </button>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading}
                className="p-3 text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors disabled:opacity-50"
                title="Video"
              >
                <span className="material-symbols-outlined">videocam</span>
              </button>
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                disabled={uploading}
                className="p-3 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors disabled:opacity-50"
                title="Documento"
              >
                <span className="material-symbols-outlined">attach_file</span>
              </button>
            </div>

            {/* Input */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center px-2 border-2 border-transparent focus-within:border-primary/50 transition-all">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-transparent border-0 text-slate-900 dark:text-white focus:ring-0 resize-none py-3 max-h-32 min-h-[44px]"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>

            {newMessage.trim() ? (
              <button
                type="submit"
                disabled={uploading}
                className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-md shadow-blue-500/20"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                disabled={uploading}
                className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 p-3 rounded-xl transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined">mic</span>
              </button>
            )}
          </form>
        )}
      </div>

      {/* Mobile Overflow Styles Fix */}
      <style jsx>{`
        #attachments-menu button {
          /* Ensure buttons are touch-friendly */
          min-width: 44px;
        }
        @media (max-width: 640px) {
          #attachments-menu {
            /* On small screens, maybe just show fewer or use efficient spacing */
            gap: 0;
          }
          #attachments-menu button {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          Cargando chat...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
