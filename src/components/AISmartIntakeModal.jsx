import React, { useState, useMemo } from "react";
import {
  Sparkles,
  X,
  FolderGit2,
  FileSpreadsheet,
  Palette,
  DollarSign,
  Ship,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Wand2,
  User,
  MapPin,
  Building2,
  Layers,
} from "lucide-react";
import { parseSmartInput } from "../utils/aiSmartParser";
import { formatVND } from "../utils/formatters";

const SAMPLE_PROMPTS = [
  {
    id: "new_project_full",
    label: "Dự án mới (Phân bổ 6 phân hệ)",
    text: "Dự án mới: Sala Signature Gym Quận 2, khách hàng Mr. Hoàng (0909123456), địa chỉ 10 Mai Chí Thọ Quận 2 TP.HCM. Gói thiết bị Precor & Merrithew trị giá 2.4 tỷ, khách vừa chuyển khoản cọc đợt 1 720 triệu qua TCB. Giao Designer Lý lên bản vẽ 2D/3D, Sale Khánh Nguyễn phụ trách, đặt PO ULS-AT2688 về kho Bình Dương và cử KTV Tuấn Anh khảo sát Thứ 5.",
  },
  {
    id: "note_cana_payment_tech",
    label: "Note Cà Na: Thu tiền + KTV + Media",
    text: "Cà Na Pilates Tây Ninh (PRJ-001): Mr. Vũ vừa chuyển khoản thanh toán thêm 180 triệu qua VCB. Mặt bằng đã sạch đẹp, bật cờ báo Marketing chụp ảnh flycam và cử KTV Tuấn Anh, Thái Châu xuống lắp bổ sung 2 bộ lò xo SPX Max vào Thứ 3.",
  },
  {
    id: "note_fulton_po",
    label: "Note Fulton HN: Kho PO + Lịch lắp",
    text: "Clubhouse Fulton (PRJ-004): Lô hàng PO ULS-AT2609 Precor tại Hà Nội đã về kho Đông Anh, cử KTV Anh Chu Việt và Tuân Bùi Duy kiểm đếm mở thùng và lắp đặt máy vào Thứ 6.",
  },
  {
    id: "note_design_tender",
    label: "Note Go Gym: Bản vẽ 3D + Báo giá",
    text: "Go Gym Cambodia (PRJ-008): Hoàn thành phương án Revise phối cảnh 3D của Designer Lý, cập nhật hồ sơ báo giá thầu BOQ Merrithew & Ziva trị giá 9.08 tỷ, Sale Hoài Trịnh trình ký hợp đồng.",
  },
];

const MODULE_ICONS = {
  projects: FolderGit2,
  tender: FileSpreadsheet,
  design: Palette,
  finance: DollarSign,
  logistics: Ship,
  maintenance: Wrench,
};

const MODULE_COLORS = {
  projects: "bg-indigo-50 text-indigo-700 border-indigo-200",
  tender: "bg-emerald-50 text-emerald-700 border-emerald-200",
  design: "bg-purple-50 text-purple-700 border-purple-200",
  finance: "bg-amber-50 text-amber-700 border-amber-200",
  logistics: "bg-sky-50 text-sky-700 border-sky-200",
  maintenance: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function AISmartIntakeModal({
  isOpen,
  onClose,
  projects = [],
  currentUser,
  onApplyAllocations,
  onNavigateTab,
}) {
  const [inputText, setInputText] = useState(SAMPLE_PROMPTS[0].text);
  const [disabledModules, setDisabledModules] = useState({});
  const [customOverrides, setCustomOverrides] = useState({});
  const [allocatedResult, setAllocatedResult] = useState(null);

  const parsed = useMemo(() => {
    return parseSmartInput(inputText, { projects, currentUser });
  }, [inputText, projects, currentUser]);

  if (!isOpen) return null;

  const effectivePlan = parsed
    ? {
        ...parsed,
        projectName: customOverrides.projectName ?? parsed.projectName,
        customerName: customOverrides.customerName ?? parsed.customerName,
        region: customOverrides.region ?? parsed.region,
        leadSale: customOverrides.leadSale ?? parsed.leadSale,
        assignedTech: customOverrides.assignedTech ?? parsed.assignedTech,
        contractValue:
          customOverrides.contractValue !== undefined
            ? Number(customOverrides.contractValue)
            : parsed.contractValue,
        collectionAmount:
          customOverrides.collectionAmount !== undefined
            ? Number(customOverrides.collectionAmount)
            : parsed.collectionAmount,
        allocations: parsed.allocations.map((a) => ({
          ...a,
          enabled: disabledModules[a.module] !== true,
        })),
      }
    : null;

  const toggleModule = (modKey) => {
    if (modKey === "projects") return; // Primary project/note record is always active
    setDisabledModules((prev) => ({
      ...prev,
      [modKey]: !prev[modKey],
    }));
  };

  const handleSelectSample = (sampleText) => {
    setInputText(sampleText);
    setDisabledModules({});
    setCustomOverrides({});
    setAllocatedResult(null);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!effectivePlan || !onApplyAllocations) return;
    const result = onApplyAllocations(effectivePlan);
    setAllocatedResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  AI Smart Intake & Tự Động Phân Bổ Đa Phân Hệ
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  AI Auto-Router
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Nhập nội dung dự án mới, tin nhắn Zalo hoặc ghi chú họp — AI tự bóc tách và đồng bộ vào Dự án, Báo giá, 2D/3D, Thu tiền, Kho PO & Lịch KTV.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Quick Sample Buttons */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mẫu nhập thử nhanh (Click để AI phân tích ngay):</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => handleSelectSample(sp.text)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                    inputText === sp.text
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Free-form AI Input Area */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Nội dung Dự án mới hoặc Ghi chú vận hành (Tiếng Việt / Tiếng Anh):
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setCustomOverrides({});
                setAllocatedResult(null);
              }}
              placeholder="Ví dụ: Dự án mới Sala Gym Quận 2, khách hàng Mr. Hoàng, gói máy Precor 2.4 tỷ, đã cọc 720 triệu qua TCB, giao Lý vẽ 2D/3D, KTV Tuấn Anh khảo sát Thứ 5..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs leading-relaxed focus:bg-white focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Success Banner after Allocation */}
          {allocatedResult && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Đã ghi nhận & tự động phân bổ vào {allocatedResult.allocatedModules.length} phân hệ thành công!
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[11px] font-bold">
                  {allocatedResult.projectId}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {allocatedResult.allocatedModules.map((mod) => (
                  <button
                    key={mod.tab}
                    type="button"
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab(mod.tab, mod.params || {});
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  >
                    <span>Mở {mod.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live AI Extraction & Multi-Module Allocation Preview */}
          {effectivePlan && (
            <div className="space-y-4 pt-1">
              {/* Target Mode & Editable Key Entities */}
              <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/90 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        effectivePlan.isNewProject
                          ? "bg-indigo-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {effectivePlan.isNewProject
                        ? "✨ KHỞI TẠO DỰ ÁN MỚI"
                        : `🔗 CẬP NHẬT DỰ ÁN ĐANG CÓ: ${effectivePlan.matchedProject?.id}`}
                    </span>
                    <span className="text-slate-600 font-semibold">
                      {effectivePlan.projectName}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    AI đã nhận diện <strong>{effectivePlan.allocations.filter((a) => a.enabled).length}</strong> phân hệ liên quan
                  </span>
                </div>

                {/* Editable Extracted Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                      <Building2 className="w-3 h-3" /> Tên Dự Án
                    </label>
                    <input
                      type="text"
                      value={effectivePlan.projectName}
                      onChange={(e) =>
                        setCustomOverrides({ ...customOverrides, projectName: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                      <User className="w-3 h-3" /> Khách Hàng / CĐT
                    </label>
                    <input
                      type="text"
                      value={effectivePlan.customerName}
                      onChange={(e) =>
                        setCustomOverrides({ ...customOverrides, customerName: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" /> Khu Vực & Kho
                    </label>
                    <select
                      value={effectivePlan.region}
                      onChange={(e) =>
                        setCustomOverrides({ ...customOverrides, region: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-semibold"
                    >
                      <option value="HCM">Miền Nam (HCM / Kho Bình Dương)</option>
                      <option value="HN">Miền Bắc (HN / Kho Đông Anh)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                      Sale Phụ Trách (Deal Owner)
                    </label>
                    <input
                      type="text"
                      value={effectivePlan.leadSale}
                      onChange={(e) =>
                        setCustomOverrides({ ...customOverrides, leadSale: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                      Giá Trị Hợp Đồng / Báo Giá (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={effectivePlan.contractValue}
                      onChange={(e) =>
                        setCustomOverrides({ ...customOverrides, contractValue: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                      Số Tiền Thu / Cọc Đợt Này (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={effectivePlan.collectionAmount}
                      onChange={(e) =>
                        setCustomOverrides({ ...customOverrides, collectionAmount: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-emerald-700 font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Downstream Auto-Allocation Cards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Các phân hệ sẽ được tự động phân bổ & liên kết chặt chẽ:</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Nhấp vào từng mục để bật/tắt phân bổ
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {effectivePlan.allocations.map((alloc) => {
                    const Icon = MODULE_ICONS[alloc.module] || FolderGit2;
                    const colorClass = MODULE_COLORS[alloc.module] || MODULE_COLORS.projects;
                    return (
                      <div
                        key={alloc.module}
                        onClick={() => toggleModule(alloc.module)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                          alloc.enabled
                            ? "bg-white border-slate-200/90 shadow-2xs hover:border-indigo-300"
                            : "bg-slate-50/60 border-slate-200/50 opacity-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={alloc.enabled}
                          disabled={alloc.module === "projects"}
                          onChange={() => {}}
                          className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className={`p-2 rounded-lg border shrink-0 ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-bold text-slate-900 truncate">
                              {alloc.moduleLabel}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 shrink-0">
                              {alloc.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                            {alloc.summary}
                          </p>
                          {alloc.module === "finance" && effectivePlan.collectionAmount > 0 && (
                            <div className="mt-1 text-[11px] font-bold text-emerald-700">
                              + Ghi nhận thu: {formatVND(effectivePlan.collectionAmount)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="text-slate-500 text-[11px]">
            Mọi dữ liệu sau khi phân bổ sẽ tự động liên kết 2 chiều theo mã dự án (<code className="font-mono font-bold text-slate-700">{effectivePlan?.isNewProject ? "PRJ-MỚI" : effectivePlan?.matchedProject?.id}</code>).
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!effectivePlan}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Xác Nhận & Phân Bổ Tự Động</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
