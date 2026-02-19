"use client";

import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PDCUser {
  id: string;
  name?: string;
  displayName?: string;
  email: string;
  role: string;
  verificationStatus?: string;
}

interface UserEditModalProps {
  user: PDCUser;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function UserEditModal({
  user,
  isOpen,
  onClose,
  onUpdate,
}: UserEditModalProps) {
  const [role, setRole] = useState(user.role);
  const [verificationStatus, setVerificationStatus] = useState(
    user.verificationStatus || "normal",
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.id), {
        role,
        verificationStatus,
      });
      onUpdate();
      onClose();
      alert("Usuario actualizado correctamente");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error al actualizar usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.",
      )
    )
      return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, "users", user.id));
      onUpdate();
      onClose();
      alert("Usuario eliminado correctamente");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error al eliminar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#1a2632] w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Editar Usuario
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={user.name || user.displayName || ""}
              disabled
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Rol
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            >
              <option value="client">Cliente</option>
              <option value="rep">Representante</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Estado de Verificación
            </label>
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            >
              <option value="normal">Normal</option>
              <option value="pending">Pendiente</option>
              <option value="verified">Verificado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            Eliminar Usuario
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
