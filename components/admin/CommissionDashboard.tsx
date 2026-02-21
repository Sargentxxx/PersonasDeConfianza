"use client";

import { useState, useMemo } from "react";

interface CompletedRequest {
  id: string;
  title: string;
  clientName: string;
  repId: string;
  repName: string;
  budget: number;
  status: string;
  completedAt?: { toDate: () => Date } | null;
}

interface CommissionRecord {
  id: string;
  repId: string;
  repName: string;
  amount: number;
  commissionRate: number;
  taskIds: string[];
  paidAt?: { toDate: () => Date } | null;
  status: "paid";
}

interface RepCommission {
  repId: string;
  repName: string;
  tasks: CompletedRequest[];
  disputedTasks: CompletedRequest[];
  grossAmount: number;
  commissionAmount: number;
  isPaid: boolean;
  paidRecord?: CommissionRecord;
}

interface CommissionDashboardProps {
  completedRequests: CompletedRequest[];
  disputedRequests: CompletedRequest[];
  commissionRecords: CommissionRecord[];
  commissionRate: number;
  onReleasePayment: (
    repId: string,
    repName: string,
    taskIds: string[],
    amount: number,
  ) => Promise<void>;
  onDownloadCSV: () => void;
}

function InitialsAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();

  const colors = [
    "from-blue-500 to-indigo-600",
    "from-green-500 to-emerald-600",
    "from-purple-500 to-violet-600",
    "from-orange-500 to-amber-600",
    "from-pink-500 to-rose-600",
    "from-teal-500 to-cyan-600",
  ];
  const colorIdx = name.charCodeAt(0) % colors.length;

  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white font-black shrink-0 ${
        size === "sm" ? "w-8 h-8 text-xs" : "w-11 h-11 text-sm"
      }`}
    >
      {initials}
    </div>
  );
}

interface ConfirmModalProps {
  rep: RepCommission;
  commissionRate: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function ConfirmModal({
  rep,
  commissionRate,
  onConfirm,
  onCancel,
  loading,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a2632] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                payments
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Confirmar Liberación de Pago
            </h3>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Estás por registrar el pago de comisión para{" "}
            <strong>{rep.repName}</strong>.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Task breakdown */}
          <div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
              Tareas incluidas ({rep.tasks.length})
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {rep.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2"
                >
                  <span className="text-slate-700 dark:text-slate-300 truncate flex-1">
                    {task.title}
                  </span>
                  <span className="text-slate-500 shrink-0 ml-2">
                    ${task.budget.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-100 dark:border-green-900/30">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">
                Monto bruto de tareas
              </span>
              <span className="font-bold">${rep.grossAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-slate-600 dark:text-slate-400">
                Tasa de comisión
              </span>
              <span className="font-bold">{commissionRate}%</span>
            </div>
            <div className="flex justify-between border-t border-green-200 dark:border-green-800 pt-3">
              <span className="font-black text-green-700 dark:text-green-400">
                Comisión a liberar
              </span>
              <span className="font-black text-green-700 dark:text-green-400 text-lg">
                ${rep.commissionAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/20 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">
                  check_circle
                </span>
                Liberar Pago
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CommissionDashboard({
  completedRequests,
  disputedRequests,
  commissionRecords,
  commissionRate,
  onReleasePayment,
  onDownloadCSV,
}: CommissionDashboardProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");
  const [search, setSearch] = useState("");
  const [confirmRep, setConfirmRep] = useState<RepCommission | null>(null);
  const [releasingId, setReleasingId] = useState<string | null>(null);

  // Build per-rep commission data
  const repMap = useMemo(() => {
    const map = new Map<string, RepCommission>();

    // Group completed requests by rep
    completedRequests.forEach((req) => {
      if (!req.repId) return;
      if (!map.has(req.repId)) {
        map.set(req.repId, {
          repId: req.repId,
          repName: req.repName || "Sin nombre",
          tasks: [],
          disputedTasks: [],
          grossAmount: 0,
          commissionAmount: 0,
          isPaid: false,
        });
      }
      const entry = map.get(req.repId)!;
      entry.tasks.push(req);
      entry.grossAmount += req.budget || 0;
    });

    // Mark disputed tasks per rep
    disputedRequests.forEach((req) => {
      if (!req.repId || !map.has(req.repId)) return;
      map.get(req.repId)!.disputedTasks.push(req);
    });

    // Recalculate commission amounts
    map.forEach((entry) => {
      entry.commissionAmount = entry.grossAmount * (commissionRate / 100);
    });

    // Mark already-paid reps
    commissionRecords.forEach((record) => {
      if (map.has(record.repId)) {
        const entry = map.get(record.repId)!;
        // Remove paid tasks from pending list
        const paidTaskIds = new Set(record.taskIds);
        const remainingTasks = entry.tasks.filter(
          (t) => !paidTaskIds.has(t.id),
        );
        if (remainingTasks.length === 0) {
          entry.isPaid = true;
          entry.paidRecord = record;
        }
      }
    });

    return map;
  }, [completedRequests, disputedRequests, commissionRecords, commissionRate]);

  const allReps = Array.from(repMap.values());

  // KPI calculations
  const totalPending = allReps
    .filter((r) => !r.isPaid)
    .reduce((acc, r) => acc + r.commissionAmount, 0);
  const totalPaid = commissionRecords.reduce((acc, r) => acc + r.amount, 0);
  const totalCompletedTasks = completedRequests.length;
  const disputedCount = disputedRequests.length;

  // Filter + search
  const filteredReps = useMemo(() => {
    return allReps
      .filter((r) => {
        if (filter === "pending") return !r.isPaid;
        if (filter === "paid") return r.isPaid;
        return true;
      })
      .filter((r) => r.repName.toLowerCase().includes(search.toLowerCase()));
  }, [allReps, filter, search]);

  const handleConfirmRelease = async () => {
    if (!confirmRep) return;
    setReleasingId(confirmRep.repId);
    try {
      await onReleasePayment(
        confirmRep.repId,
        confirmRep.repName,
        confirmRep.tasks.map((t) => t.id),
        confirmRep.commissionAmount,
      );
      setConfirmRep(null);
    } finally {
      setReleasingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Confirmation Modal */}
      {confirmRep && (
        <ConfirmModal
          rep={confirmRep}
          commissionRate={commissionRate}
          onConfirm={handleConfirmRelease}
          onCancel={() => setConfirmRep(null)}
          loading={releasingId === confirmRep.repId}
        />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending */}
        <div className="bg-white dark:bg-[#1a2632] rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg">
                pending_actions
              </span>
            </div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Pendiente
            </p>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            ${totalPending.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {allReps.filter((r) => !r.isPaid).length} reps sin pagar
          </p>
        </div>

        {/* Paid */}
        <div className="bg-white dark:bg-[#1a2632] rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-lg">
                payments
              </span>
            </div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Total Pagado
            </p>
          </div>
          <p className="text-2xl font-black text-green-600 dark:text-green-400">
            ${totalPaid.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {commissionRecords.length} pagos realizados
          </p>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white dark:bg-[#1a2632] rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">
                task_alt
              </span>
            </div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Completadas
            </p>
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {totalCompletedTasks}
          </p>
          <p className="text-xs text-slate-400 mt-1">tareas finalizadas</p>
        </div>

        {/* Disputes */}
        <div
          className={`bg-white dark:bg-[#1a2632] rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all ${
            disputedCount > 0
              ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
              : "border-slate-200 dark:border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                disputedCount > 0
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-slate-100 dark:bg-slate-800"
              }`}
            >
              <span
                className={`material-symbols-outlined text-lg ${
                  disputedCount > 0
                    ? "text-red-600 dark:text-red-400 animate-pulse"
                    : "text-slate-400"
                }`}
              >
                gavel
              </span>
            </div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Disputas
            </p>
          </div>
          <p
            className={`text-2xl font-black ${disputedCount > 0 ? "text-red-600 dark:text-red-400" : "text-slate-500"}`}
          >
            {disputedCount}
          </p>
          <p className="text-xs text-slate-400 mt-1">casos en disputa</p>
        </div>
      </div>

      {/* Dispute global warning */}
      {disputedCount > 0 && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
          <span className="material-symbols-outlined text-red-500 text-xl shrink-0 mt-0.5">
            warning
          </span>
          <div>
            <p className="font-bold text-red-700 dark:text-red-400 text-sm">
              ⚠️ Hay {disputedCount} caso{disputedCount > 1 ? "s" : ""} en
              disputa activa
            </p>
            <p className="text-red-600 dark:text-red-500 text-xs mt-0.5">
              No liberes el pago de comisión de representantes vinculados a
              casos disputados hasta que se resuelvan.
            </p>
          </div>
        </div>
      )}

      {/* Search + Filter + Export */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar representante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1 shrink-0">
          {(["all", "pending", "paid"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {f === "all"
                ? "Todos"
                : f === "pending"
                  ? "Pendientes"
                  : "Pagados"}
            </button>
          ))}
        </div>

        {/* CSV Export */}
        <button
          onClick={onDownloadCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-md shrink-0"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          Exportar CSV
        </button>
      </div>

      {/* Commission Table */}
      {filteredReps.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#1a2632] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-3 block">
            payments
          </span>
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400">
            Sin resultados
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            No hay representantes en esta vista.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReps.map((rep) => {
            const hasDispute = rep.disputedTasks.length > 0;
            const isLoading = releasingId === rep.repId;

            return (
              <div
                key={rep.repId}
                className={`bg-white dark:bg-[#1a2632] rounded-2xl border transition-all hover:shadow-md ${
                  hasDispute && !rep.isPaid
                    ? "border-red-200 dark:border-red-800"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Rep Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <InitialsAvatar name={rep.repName} />
                      <div className="min-w-0">
                        <h4 className="font-black text-slate-900 dark:text-white truncate">
                          {rep.repName}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {rep.tasks.length} tarea
                          {rep.tasks.length !== 1 ? "s" : ""} completada
                          {rep.tasks.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Financial Info */}
                    <div className="flex gap-6 lg:gap-10 shrink-0">
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Monto Bruto
                        </p>
                        <p className="font-black text-slate-700 dark:text-slate-200">
                          ${rep.grossAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Comisión ({commissionRate}%)
                        </p>
                        <p className="font-black text-primary text-lg">
                          ${rep.commissionAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Status + Action */}
                    <div className="flex items-center gap-3 shrink-0">
                      {rep.isPaid ? (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-black px-3 py-1.5 rounded-full">
                            <span className="material-symbols-outlined text-sm">
                              check_circle
                            </span>
                            PAGADO
                          </span>
                          {rep.paidRecord?.paidAt && (
                            <p className="text-xs text-slate-400">
                              {rep.paidRecord.paidAt
                                .toDate()
                                .toLocaleDateString("es-AR")}
                            </p>
                          )}
                        </div>
                      ) : hasDispute ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-black px-3 py-1.5 rounded-full animate-pulse">
                            <span className="material-symbols-outlined text-sm">
                              block
                            </span>
                            EN DISPUTA
                          </div>
                          <button
                            disabled
                            title={`No se puede liberar el pago: ${rep.disputedTasks.length} caso${rep.disputedTasks.length > 1 ? "s" : ""} en disputa`}
                            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-sm font-black cursor-not-allowed opacity-60 flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">
                              lock
                            </span>
                            Bloqueado
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRep(rep)}
                          disabled={isLoading}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/20 flex items-center gap-1.5 disabled:opacity-40"
                        >
                          {isLoading ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span className="material-symbols-outlined text-sm">
                              send_money
                            </span>
                          )}
                          Liberar Pago
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dispute warning detail */}
                  {hasDispute && !rep.isPaid && (
                    <div className="mt-4 pt-4 border-t border-red-100 dark:border-red-900/30">
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">
                          warning
                        </span>
                        Tiene {rep.disputedTasks.length} caso
                        {rep.disputedTasks.length > 1 ? "s" : ""} en disputa —
                        resuelve antes de liberar el pago:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rep.disputedTasks.map((t) => (
                          <span
                            key={t.id}
                            className="text-[11px] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full font-medium"
                          >
                            {t.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Task list (collapsible hint) */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap gap-1.5">
                      {rep.tasks.slice(0, 4).map((t) => (
                        <span
                          key={t.id}
                          className="text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full"
                        >
                          {t.title}
                        </span>
                      ))}
                      {rep.tasks.length > 4 && (
                        <span className="text-[11px] text-slate-400 px-2 py-0.5">
                          +{rep.tasks.length - 4} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History section */}
      {commissionRecords.length > 0 && (
        <div className="bg-white dark:bg-[#1a2632] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                history
              </span>
              Historial de Pagos
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {commissionRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <InitialsAvatar name={record.repName} size="sm" />
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      {record.repName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {record.taskIds.length} tarea
                      {record.taskIds.length !== 1 ? "s" : ""} •{" "}
                      {record.commissionRate}% comisión
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-green-600 dark:text-green-400">
                    ${record.amount.toFixed(2)}
                  </p>
                  {record.paidAt && (
                    <p className="text-xs text-slate-400">
                      {record.paidAt.toDate().toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
