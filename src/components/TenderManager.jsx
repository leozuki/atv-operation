import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  DollarSign,
  FileCheck,
  FileText,
  TrendingUp,
  Download,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { formatCurrency, formatShortCurrency } from "../utils/formatters";
import { getShareableLink, copyToClipboard } from "../utils/navigation";
import TaskShareReminderModal from "./TaskShareReminderModal";

export default function TenderManager({
  tenders,
  setTenders,
  selectedTenderId,
  currentUser,
  onNavigateTab,
  showToast,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderItem, setReminderItem] = useState(null);

  useEffect(() => {
    if (selectedTenderId) {
      setTimeout(() => {
        const el = document.getElementById(`tender-${selectedTenderId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 250);
    }
  }, [selectedTenderId]);

  const [newDeal, setNewDeal] = useState({
    project: "",
    note: "",
    type: "Quotation",
    valueBeforeVat: "",
    status: "New",
    subType: "Báo giá thiết bị",
  });

  const newQuotations = tenders.filter((t) => t.type === "Quotation" && t.status === "New");
  const totalNewQuotationsVal = newQuotations.reduce((sum, t) => sum + (t.valueBeforeVat || 0), 0);

  const reviseQuotations = tenders.filter((t) => t.type === "Quotation" && t.status === "Revise");
  const totalReviseQuotationsVal = reviseQuotations.reduce((sum, t) => sum + (t.valueBeforeVat || 0), 0);

  const newContracts = tenders.filter((t) => t.type === "Contract" && t.status === "New");
  const totalNewContractsVal = newContracts.reduce((sum, t) => sum + (t.valueBeforeVat || 0), 0);

  const otherDeals = tenders.filter((t) => t.type === "Other");

  const filteredTenders = tenders.filter((t) => {
    const matchesSearch =
      t.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.subType && t.subType.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === "all" || t.type === filterType;
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newDeal.project) return;

    const dealToAdd = {
      id: tenders.length + 1,
      project: newDeal.project,
      note: newDeal.note,
      type: newDeal.type,
      valueBeforeVat: Number(newDeal.valueBeforeVat) || 0,
      status: newDeal.status,
      subType: newDeal.subType,
    };

    setTenders([...tenders, dealToAdd]);
    setShowAddModal(false);
    setNewDeal({
      project: "",
      note: "",
      type: "Quotation",
      valueBeforeVat: "",
      status: "New",
      subType: "Báo giá thiết bị",
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">
            Báo Giá & Hợp Đồng
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {(!currentUser?.roleId || ["admin", "sales_lead", "finance_lead"].includes(currentUser.roleId)) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm transition shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Deal / Báo Giá Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total New Quotations */}
        <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Total New Quotations
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{newQuotations.length} Deal</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              Mới
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-base font-black text-blue-700">
            {formatCurrency(totalNewQuotationsVal)}
          </div>
        </div>

        {/* Total New Contracts */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Total New Contracts
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{newContracts.length} HĐ Ký</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Chốt Ký
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-base font-black text-emerald-700">
            {formatCurrency(totalNewContractsVal)}
          </div>
        </div>

        {/* Revise Quotations */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Báo Giá Chỉnh Sửa (Revise)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{reviseQuotations.length} Deal</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
              Revise
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-base font-black text-amber-800">
            {formatCurrency(totalReviseQuotationsVal)}
          </div>
        </div>

        {/* Other tender documents */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Hồ Sơ Thầu & Phụ Lục (Other)
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{otherDeals.length} Hồ Sơ</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              BOQ / PLHĐ
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 truncate">
            Biên bản họp, phụ lục tiến độ thầu phụ
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên dự án (Winx, Go gym, Đất Xanh...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Phân Loại</option>
            <option value="Quotation">Báo Giá (Quotation)</option>
            <option value="Contract">Hợp Đồng (Contract)</option>
            <option value="Other">Hồ Sơ Khác (Other)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Trạng Thái</option>
            <option value="New">Mới (New)</option>
            <option value="Revise">Chỉnh sửa (Revise)</option>
          </select>
        </div>
      </div>

      {/* Tender Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">No.</th>
                <th className="py-3.5 px-4">Dự Án (Project)</th>
                <th className="py-3.5 px-4">Ghi Chú Hãng / Thương Hiệu (Note)</th>
                <th className="py-3.5 px-4">Loại (Type)</th>
                <th className="py-3.5 px-4 text-right">Giá Trị Trước VAT (VNĐ)</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái (New to date)</th>
                <th className="py-3.5 px-4 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredTenders.map((t) => {
                const isContract = t.type === "Contract";
                const isQuotation = t.type === "Quotation";
                const isSelected = String(selectedTenderId) === String(t.id);

                return (
                  <tr
                    key={t.id}
                    id={`tender-${t.id}`}
                    className={`hover:bg-slate-50 transition ${
                      isSelected
                        ? "ring-2 ring-blue-500 bg-blue-50/60"
                        : t.status === "New" && isContract
                        ? "bg-emerald-50/40"
                        : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                      {t.id}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {t.project}
                      {t.subType && (
                        <span className="block text-[11px] text-slate-500 font-medium">
                          {t.subType}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {t.note ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-xs">
                          {t.note}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isContract
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : isQuotation
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-black">
                      {t.valueBeforeVat > 0 ? (
                        <span
                          className={
                            isContract
                              ? "text-emerald-700"
                              : t.status === "Revise"
                              ? "text-amber-800"
                              : "text-slate-900"
                          }
                        >
                          {formatCurrency(t.valueBeforeVat)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {t.status ? (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                            t.status === "New"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {t.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={async () => {
                            const link = getShareableLink("tender", { tender: t.id });
                            const ok = await copyToClipboard(link);
                            if (ok && showToast) {
                              showToast(`Đã sao chép link báo giá: ${t.project}`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Sao chép link báo giá này"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setReminderItem({
                              id: t.id,
                              title: `${t.type === "Contract" ? "Hợp đồng" : "Báo giá"}: ${t.project} (${t.note || t.subType || ""})`,
                              type: "tender",
                              assignee: "Phòng Tender / Sales Attivo",
                              deadline: t.status === "New" ? "Deal Mới - Cần chốt sớm" : "Đang chỉnh sửa",
                              status: `${t.status} - Giá trị: ${formatCurrency(t.valueBeforeVat)}`,
                              notes: `Phân loại: ${t.type} (${t.subType || ""}). Hãng/Note: ${t.note || "—"}`,
                              shareUrl: getShareableLink("tender", { tender: t.id }),
                            });
                            setShowReminderModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                          title="Nhắc việc / Gửi Zalo, Email"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Thêm Hồ Sơ Tender / Báo Giá Mới
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-bold">Tên Dự Án (Project) *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Go gym (Cambodia) New Layout"
                  value={newDeal.project}
                  onChange={(e) => setNewDeal({ ...newDeal, project: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Hãng / Ghi Chú (Note)</label>
                  <input
                    type="text"
                    placeholder="VD: Precor 731, Merrithew, Eleiko..."
                    value={newDeal.note}
                    onChange={(e) => setNewDeal({ ...newDeal, note: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Phân Loại (Type) *</label>
                  <select
                    value={newDeal.type}
                    onChange={(e) => setNewDeal({ ...newDeal, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Quotation">Báo Giá (Quotation)</option>
                    <option value="Contract">Hợp Đồng Ký (Contract)</option>
                    <option value="Other">Hồ Sơ Khác (Other / BOQ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">
                    Giá Trị Trước VAT (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 9089777341"
                    value={newDeal.valueBeforeVat}
                    onChange={(e) => setNewDeal({ ...newDeal, valueBeforeVat: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Trạng Thái (New to date)</label>
                  <select
                    value={newDeal.status}
                    onChange={(e) => setNewDeal({ ...newDeal, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="New">New (Mới)</option>
                    <option value="Revise">Revise (Chỉnh sửa)</option>
                    <option value="">Không (Trống)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-sm"
                >
                  Lưu Báo Giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Share / Reminder Modal */}
      <TaskShareReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        task={reminderItem}
        showToast={showToast}
      />
    </div>
  );
}
