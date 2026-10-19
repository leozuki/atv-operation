import React, { useState, useMemo } from "react";
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
  Clock,
  Truck,
  ShieldCheck,
  FileCheck,
  Zap,
  Layers,
} from "lucide-react";
import { formatDate } from "../utils/formatters";
import FieldWorkLogModal from "./FieldWorkLogModal";

export default function InstallationChecklist({
  checklists,
  setChecklists,
  projects,
  selectedProjectId,
  setSelectedProjectId,
  showToast,
}) {
  const [showFieldLogModal, setShowFieldLogModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const currentProjectId = selectedProjectId || checklists[0]?.projectId;
  const currentChecklist =
    checklists.find((c) => c.projectId === currentProjectId) || checklists[0];

  const [newItem, setNewItem] = useState({
    name: "",
    category: "equipment_bom",
    sopDeliverable: "",
    orderedQty: 1,
    receivedQty: 1,
    unit: "Bộ",
    status: "pass",
    note: "",
  });

  const handleUpdateItemStatus = (itemId, status) => {
    if (!currentChecklist) return;
    const updatedItems = currentChecklist.items.map((item) => {
      if (item.id !== itemId) return item;
      const newReceived = status === "pass" ? item.orderedQty : Math.min(item.receivedQty, Math.max(0, item.orderedQty - 1));
      return {
        ...item,
        status,
        receivedQty: newReceived,
      };
    });

    const hasShortage = updatedItems.some((it) => it.status === "shortage");
    const allReceivedZero = updatedItems.every((it) => (it.receivedQty || 0) === 0);
    const newStatus = allReceivedZero ? "missing" : hasShortage ? "warning" : "ready";

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
    if (showToast) {
      showToast(`Đã cập nhật trạng thái: ${status === "pass" ? "ĐẠT" : "THIẾU / CẦN XỬ LÝ"}`);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !currentChecklist) return;

    const ordered = Number(newItem.orderedQty) || 1;
    const received = Number(newItem.receivedQty) || 0;
    const itemToAdd = {
      id: `CK-${Date.now().toString().slice(-4)}`,
      name: newItem.name,
      category: newItem.category || "equipment_bom",
      sopDeliverable: newItem.sopDeliverable || undefined,
      orderedQty: ordered,
      receivedQty: Math.min(received, ordered),
      unit: newItem.unit || "Bộ",
      status: received < ordered ? "shortage" : "pass",
      note: newItem.note,
    };

    const updatedItems = [...currentChecklist.items, itemToAdd];
    const hasShortage = updatedItems.some((it) => it.status === "shortage");
    const allReceivedZero = updatedItems.every((it) => (it.receivedQty || 0) === 0);
    const newStatus = allReceivedZero ? "missing" : hasShortage ? "warning" : "ready";

    setChecklists(
      checklists.map((c) =>
        c.projectId === currentChecklist.projectId
          ? {
              ...c,
              items: updatedItems,
              status: newStatus,
            }
          : c
      )
    );

    setNewItem({
      name: "",
      category: "equipment_bom",
      sopDeliverable: "",
      orderedQty: 1,
      receivedQty: 1,
      unit: "Bộ",
      status: "pass",
      note: "",
    });

    if (showToast) {
      showToast("Đã bổ sung hạng mục checklist mới thành công!");
    }
  };

  // SOP 4 Deliverables Status Calculation
  const sopStatus = useMemo(() => {
    if (!currentChecklist?.items) {
      return { truck: "pending", cocq: "pending", bbgh: "pending", warranty: "pending" };
    }
    const findStatus = (keyword) => {
      const it = currentChecklist.items.find(
        (i) =>
          i.sopDeliverable === keyword ||
          (i.name && i.name.toLowerCase().includes(keyword.toLowerCase()))
      );
      if (!it) return "pending";
      return it.status === "pass" ? "pass" : "shortage";
    };

    return {
      truck: findStatus("Đặt xe"),
      cocq: findStatus("COCQ"),
      bbgh: findStatus("BBGH/NT"),
      warranty: findStatus("Bảo hành"),
    };
  }, [currentChecklist]);

  // Filter items by category and search
  const filteredItems = useMemo(() => {
    if (!currentChecklist?.items) return [];
    return currentChecklist.items.filter((item) => {
      const matchCategory =
        activeCategory === "all" ||
        item.category === activeCategory ||
        (activeCategory === "sop_docs" && item.sopDeliverable);

      const matchSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchCategory && matchSearch;
    });
  }, [currentChecklist, activeCategory, searchTerm]);

  const stats = useMemo(() => {
    if (!currentChecklist?.items) return { total: 0, pass: 0, shortage: 0, rate: 0 };
    const total = currentChecklist.items.length;
    const pass = currentChecklist.items.filter((i) => i.status === "pass").length;
    const shortage = total - pass;
    const rate = total > 0 ? Math.round((pass / total) * 100) : 0;
    return { total, pass, shortage, rate };
  }, [currentChecklist]);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800">
            <ClipboardCheck className="w-5 h-5 text-cyan-700" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Checklist Lắp Đặt Thiết Bị
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chuẩn hóa theo SOP Logistics Attivo: 4 chốt chặn bắt buộc (Đặt xe, COCQ, BBGH/NT, Bảo hành) & Kiểm định BOM
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFieldLogModal(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition self-start md:self-auto"
          title="Ghi nhận giờ làm KTV & Chụp ảnh nghiệm thu (Telegram Bot)"
        >
          <Clock className="w-4 h-4" />
          <span>Log Time KTV & Chụp Ảnh</span>
        </button>
      </div>

      {/* Project Selector Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 mr-2">Chọn Dự Án Lắp Đặt (8 Dự Án):</span>
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
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">{currentChecklist.projectName}</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    HĐ: {currentChecklist.contractCode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {currentChecklist.projectId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Kỹ thuật viên kiểm tra: <strong className="text-slate-800">{currentChecklist.verifier}</strong> • Ngày kiểm đếm: {formatDate(currentChecklist.inspectionDate)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Tỷ lệ đạt chuẩn:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base font-black text-cyan-800">{stats.rate}%</span>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
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
                        ? "ĐÃ ĐỦ ĐIỀU KIỆN BÀN GIAO"
                        : currentChecklist.status === "warning"
                        ? "CẦN LƯU Ý / THIẾU HÀNG"
                        : "CHƯA ĐỦ HÀNG ĐỂ LẮP"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Mandatory Deliverables from Logistics SOP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div
                className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                  sopStatus.truck === "pass"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
              >
                <div className="p-2 rounded-lg bg-white/80 shadow-2xs">
                  <Truck className={`w-4 h-4 ${sopStatus.truck === "pass" ? "text-emerald-700" : "text-amber-700"}`} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chốt Chặn 1</div>
                  <div className="text-xs font-black">Đặt Xe Vận Tải</div>
                  <span className={`text-[10px] font-bold ${sopStatus.truck === "pass" ? "text-emerald-700" : "text-amber-700"}`}>
                    {sopStatus.truck === "pass" ? "✓ Đã Duyệt Xe" : "⏳ Chờ Điều Phối"}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                  sopStatus.cocq === "pass"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
              >
                <div className="p-2 rounded-lg bg-white/80 shadow-2xs">
                  <FileCheck className={`w-4 h-4 ${sopStatus.cocq === "pass" ? "text-emerald-700" : "text-amber-700"}`} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chốt Chặn 2</div>
                  <div className="text-xs font-black">Hồ Sơ COCQ</div>
                  <span className={`text-[10px] font-bold ${sopStatus.cocq === "pass" ? "text-emerald-700" : "text-amber-700"}`}>
                    {sopStatus.cocq === "pass" ? "✓ Đầy Đủ CO/CQ" : "⏳ Đang Chờ Bản Gốc"}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                  sopStatus.bbgh === "pass"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
              >
                <div className="p-2 rounded-lg bg-white/80 shadow-2xs">
                  <ClipboardCheck className={`w-4 h-4 ${sopStatus.bbgh === "pass" ? "text-emerald-700" : "text-amber-700"}`} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chốt Chặn 3</div>
                  <div className="text-xs font-black">BBGH / Nghiệm Thu</div>
                  <span className={`text-[10px] font-bold ${sopStatus.bbgh === "pass" ? "text-emerald-700" : "text-amber-700"}`}>
                    {sopStatus.bbgh === "pass" ? "✓ Ký 3 Bên" : "⏳ Chờ Khách Ký"}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                  sopStatus.warranty === "pass"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
              >
                <div className="p-2 rounded-lg bg-white/80 shadow-2xs">
                  <ShieldCheck className={`w-4 h-4 ${sopStatus.warranty === "pass" ? "text-emerald-700" : "text-amber-700"}`} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chốt Chặn 4</div>
                  <div className="text-xs font-black">Tem & Sổ Bảo Hành</div>
                  <span className={`text-[10px] font-bold ${sopStatus.warranty === "pass" ? "text-emerald-700" : "text-amber-700"}`}>
                    {sopStatus.warranty === "pass" ? "✓ Đã Dán Tem & HDSD" : "⏳ Chưa Xuất Tem"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-900 flex items-start gap-2">
              <FileText className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-800">Ghi chú đối chiếu kho & kỹ thuật: </strong>
                {currentChecklist.summary}
              </div>
            </div>
          </div>

          {/* Filtering Bar: Category Tabs & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              {[
                { id: "all", label: `Tất Cả (${currentChecklist.items.length})` },
                { id: "sop_docs", label: "Hồ Sơ SOP (4 Chốt Chặn)" },
                { id: "site_prep", label: "Khảo Sát & Nguồn Điện" },
                { id: "equipment_bom", label: "Thiết Bị BOM" },
                { id: "technical", label: "Cân Chỉnh Kỹ Thuật" },
                { id: "handover", label: "Vận Hành & Bàn Giao" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    activeCategory === tab.id
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm hạng mục / linh kiện..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-cyan-700"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Tên Hạng Mục / Tiêu Chí Kiểm Định</th>
                    <th className="py-3.5 px-4 text-center">Phân Loại</th>
                    <th className="py-3.5 px-4 text-center">SL Yêu Cầu</th>
                    <th className="py-3.5 px-4 text-center">SL Thực Tế</th>
                    <th className="py-3.5 px-4 text-center">ĐVT</th>
                    <th className="py-3.5 px-4">Đánh Giá Kỹ Thuật</th>
                    <th className="py-3.5 px-4">Ghi Chú Chi Tiết</th>
                    <th className="py-3.5 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredItems.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{it.name}</span>
                          {it.sopDeliverable && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {it.sopDeliverable}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          {it.category === "sop_docs"
                            ? "Hồ Sơ SOP"
                            : it.category === "site_prep"
                            ? "Khảo Sát"
                            : it.category === "technical"
                            ? "Cân Chỉnh"
                            : it.category === "handover"
                            ? "Bàn Giao"
                            : "Thiết Bị BOM"}
                        </span>
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
                            <CheckCircle2 className="w-3.5 h-3.5" /> ĐẠT CHUẨN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-3.5 h-3.5" /> THIẾU / CẦN XỬ LÝ
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">
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
                            title="Đánh dấu Đạt"
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
                            title="Đánh dấu Thiếu / Cần lưu ý"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        Không tìm thấy hạng mục nào trong bộ lọc hiện tại.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Item Row Form */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" /> Bổ Sung Hạng Mục Kiểm Tra Vào Checklist:
            </h4>
            <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
              <input
                type="text"
                placeholder="Tên máy / tiêu chí / phụ kiện..."
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="sm:col-span-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                required
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="sm:col-span-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="equipment_bom">Thiết Bị BOM</option>
                <option value="sop_docs">Hồ Sơ SOP</option>
                <option value="site_prep">Khảo Sát Mặt Bằng</option>
                <option value="technical">Cân Chỉnh Kỹ Thuật</option>
                <option value="handover">Bàn Giao & Vận Hành</option>
              </select>
              <select
                value={newItem.sopDeliverable}
                onChange={(e) => setNewItem({ ...newItem, sopDeliverable: e.target.value })}
                className="sm:col-span-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="">(Không thuộc SOP)</option>
                <option value="Đặt xe">Đặt xe</option>
                <option value="COCQ">COCQ</option>
                <option value="BBGH/NT">BBGH/NT</option>
                <option value="Bảo hành">Bảo hành</option>
              </select>
              <input
                type="number"
                placeholder="SL Yêu Cầu"
                value={newItem.orderedQty}
                onChange={(e) => setNewItem({ ...newItem, orderedQty: e.target.value })}
                className="sm:col-span-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                min={1}
              />
              <input
                type="number"
                placeholder="SL Thực Tế"
                value={newItem.receivedQty}
                onChange={(e) => setNewItem({ ...newItem, receivedQty: e.target.value })}
                className="sm:col-span-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                min={0}
              />
              <input
                type="text"
                placeholder="ĐVT"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="sm:col-span-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
              <button
                type="submit"
                className="sm:col-span-1 p-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl transition"
              >
                + Thêm
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Field Work Log Modal (Log Time & Photo Evidence) */}
      <FieldWorkLogModal
        isOpen={showFieldLogModal}
        onClose={() => setShowFieldLogModal(false)}
        project={projects?.find((p) => p.id === currentProjectId)}
        checklist={currentChecklist}
        onSaveLog={(log) => {
          if (showToast) {
            showToast(`Đã lưu Log Time hiện trường: ${log.durationFormatted}`);
          }
        }}
        onUpdateChecklist={(updated) => {
          setChecklists((prev) =>
            prev.map((c) => (c.projectId === updated.projectId ? updated : c))
          );
        }}
        showToast={showToast}
      />
    </div>
  );
}
