import React, { useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Package,
  Wrench,
  Search,
  Check,
  RefreshCw,
  FileText,
} from "lucide-react";
import { formatDate } from "../utils/formatters";

export default function InstallationChecklist({
  checklists,
  setChecklists,
  projects,
  selectedProjectId,
  setSelectedProjectId,
}) {
  const currentProjectId = selectedProjectId || checklists[0]?.projectId;
  const currentChecklist =
    checklists.find((c) => c.projectId === currentProjectId) || checklists[0];

  const [newItem, setNewItem] = useState({
    name: "",
    orderedQty: 1,
    receivedQty: 1,
    unit: "Bộ",
    status: "pass",
    note: "",
  });

  const handleUpdateItemStatus = (itemId, status) => {
    if (!currentChecklist) return;
    const updatedItems = currentChecklist.items.map((item) =>
      item.id === itemId ? { ...item, status } : item
    );

    const hasShortage = updatedItems.some((it) => it.status === "shortage");
    const newStatus = hasShortage ? "warning" : "ready";

    const updatedChecklists = checklists.map((c) =>
      c.projectId === currentChecklist.projectId
        ? {
            ...c,
            items: updatedItems,
            status: newStatus,
          }
        : c
    );
    setChecklists(updatedChecklists);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !currentChecklist) return;

    const itemToAdd = {
      id: `CK-${Date.now().toString().slice(-3)}`,
      name: newItem.name,
      orderedQty: Number(newItem.orderedQty) || 1,
      receivedQty: Number(newItem.receivedQty) || 0,
      unit: newItem.unit,
      status: Number(newItem.receivedQty) < Number(newItem.orderedQty) ? "shortage" : "pass",
      note: newItem.note,
    };

    const updatedItems = [...currentChecklist.items, itemToAdd];
    const hasShortage = updatedItems.some((it) => it.status === "shortage");

    setChecklists(
      checklists.map((c) =>
        c.projectId === currentChecklist.projectId
          ? {
              ...c,
              items: updatedItems,
              status: hasShortage ? "warning" : "ready",
            }
          : c
      )
    );

    setNewItem({
      name: "",
      orderedQty: 1,
      receivedQty: 1,
      unit: "Bộ",
      status: "pass",
      note: "",
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">
            Checklist Lắp Đặt Thiết Bị
          </h2>
        </div>
      </div>

      {/* Project Selector Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 mr-2">Chọn Công Trình Đang Lắp Đặt:</span>
        {checklists.map((c) => {
          const isSelected = c.projectId === currentProjectId;
          return (
            <button
              key={c.projectId}
              onClick={() => setSelectedProjectId(c.projectId)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-2 ${
                isSelected
                  ? "bg-cyan-700 border-cyan-700 text-white shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{c.projectName}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  c.status === "ready"
                    ? "bg-emerald-400"
                    : c.status === "warning"
                    ? "bg-amber-400"
                    : "bg-rose-500"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Main Checklist View */}
      {currentChecklist && (
        <div className="space-y-4">
          {/* Summary Box */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">{currentChecklist.projectName}</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    HĐ: {currentChecklist.contractCode}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Kỹ thuật viên kiểm tra: <strong className="text-slate-800">{currentChecklist.verifier}</strong> • Ngày kiểm đếm: {formatDate(currentChecklist.inspectionDate)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Trạng thái phê duyệt lắp:</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mt-0.5 ${
                      currentChecklist.status === "ready"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : currentChecklist.status === "warning"
                        ? "bg-amber-50 text-amber-800 border-amber-300"
                        : "bg-rose-50 text-rose-800 border-rose-300"
                    }`}
                  >
                    {currentChecklist.status === "ready" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {currentChecklist.status === "warning" && <AlertTriangle className="w-3.5 h-3.5" />}
                    {currentChecklist.status === "missing" && <XCircle className="w-3.5 h-3.5" />}
                    {currentChecklist.status === "ready"
                      ? "ĐÃ ĐỦ ĐIỀU KIỆN LẮP RÁP"
                      : currentChecklist.status === "warning"
                      ? "CÓ MẶT HÀNG THIẾU / CẦN LƯU Ý"
                      : "CHƯA ĐỦ HÀNG ĐỂ LẮP"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-900 flex items-start gap-2">
              <FileText className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-800">Ghi chú đối chiếu kho: </strong>
                {currentChecklist.summary}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Tên Thiết Bị / Phụ Kiện</th>
                  <th className="py-3.5 px-4 text-center">SL Đơn Hàng</th>
                  <th className="py-3.5 px-4 text-center">SL Đã Nhận</th>
                  <th className="py-3.5 px-4 text-center">ĐVT</th>
                  <th className="py-3.5 px-4">Tình Trạng Đối Chiếu</th>
                  <th className="py-3.5 px-4">Ghi Chú Kỹ Thuật</th>
                  <th className="py-3.5 px-4 text-center">Cập Nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {currentChecklist.items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {it.name}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                      {it.orderedQty}
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-cyan-800">
                      {it.receivedQty}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                      {it.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      {it.status === "pass" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đúng & Đủ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
                          <AlertTriangle className="w-3.5 h-3.5" /> Thiếu Hàng
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {it.note || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleUpdateItemStatus(it.id, "pass")}
                          className={`p-1.5 rounded-lg border transition ${
                            it.status === "pass"
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "bg-white border-slate-200 text-slate-500 hover:text-emerald-700"
                          }`}
                          title="Đánh dấu Đủ"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleUpdateItemStatus(it.id, "shortage")}
                          className={`p-1.5 rounded-lg border transition ${
                            it.status === "shortage"
                              ? "bg-rose-600 border-rose-600 text-white"
                              : "bg-white border-slate-200 text-slate-500 hover:text-rose-700"
                          }`}
                          title="Đánh dấu Thiếu"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Item Row Form */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" /> Thêm Mặt Hàng Cần Kiểm Đếm Vào Danh Mục:
            </h4>
            <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 text-xs">
              <input
                type="text"
                placeholder="Tên máy / linh kiện / phụ kiện..."
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="sm:col-span-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                required
              />
              <input
                type="number"
                placeholder="SL Đặt"
                value={newItem.orderedQty}
                onChange={(e) => setNewItem({ ...newItem, orderedQty: e.target.value })}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                min={1}
              />
              <input
                type="number"
                placeholder="SL Nhận"
                value={newItem.receivedQty}
                onChange={(e) => setNewItem({ ...newItem, receivedQty: e.target.value })}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                min={0}
              />
              <input
                type="text"
                placeholder="ĐVT (Máy, Bộ...)"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
              <button
                type="submit"
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
              >
                + Thêm
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
