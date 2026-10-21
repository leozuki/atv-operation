import React, { useState, useRef, useEffect } from "react";
import {
  ClipboardCheck,
  Calendar,
  FolderGit2,
  Ship,
  DollarSign,
  Phone,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Search,
  Check,
  Monitor,
  Sparkles,
  ChevronRight,
  Plus,
  RotateCcw,
  PenTool,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Trash2,
} from "lucide-react";
import {
  formatCurrency,
  formatShortCurrency,
  formatDate,
  getTodayFormatted,
  getTodayISO,
  getProjectStageBadge,
} from "../utils/formatters";

export default function DedicatedMobileApp({
  projects = [],
  setProjects,
  checklists = [],
  setChecklists,
  shipments = [],
  collections = [],
  setCollections,
  schedule = { HN: [], HCM: [] },
  tenders = [],
  users = [],
  currentUser,
  setCurrentUser,
  onSwitchToDesktop,
  showToast,
}) {
  const todayFormatted = getTodayFormatted();
  const todayISO = getTodayISO();

  // Active Mobile Tab: 'checklist' | 'projects' | 'schedule' | 'finance' | 'logistics'
  const [mobileTab, setMobileTab] = useState("checklist");

  // Selected Project for Checklist View
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "PRJ-001");
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const currentChecklist = checklists.find((c) => c.projectId === selectedProjectId) || checklists[0];

  // Checklist Category Filter
  const [checklistCategory, setChecklistCategory] = useState("all");
  const [checklistSearch, setChecklistSearch] = useState("");

  // Projects View Search & Filter
  const [projectSearch, setProjectSearch] = useState("");
  const [projectRegion, setProjectRegion] = useState("all");

  // Schedule View Selected Date
  const [selectedScheduleDay, setSelectedScheduleDay] = useState(todayISO);

  // Digital Signature State
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [signerName, setSignerName] = useState("");
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Quick Photo Log State
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const fileInputRef = useRef(null);

  // Quick Finance Collection Modal
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [moneyAmount, setMoneyAmount] = useState("");
  const [moneyCustomer, setMoneyCustomer] = useState(selectedProject?.customer || "");

  // Update item status in current checklist
  const handleUpdateItemStatus = (itemId, newStatus) => {
    if (!currentChecklist || !setChecklists) return;
    const updatedItems = (currentChecklist.items || []).map((it) => {
      if (it.id === itemId) {
        return {
          ...it,
          status: newStatus,
          receivedQty: newStatus === "pass" ? it.orderedQty : Math.max(0, it.receivedQty - 1),
        };
      }
      return it;
    });

    const passedCount = updatedItems.filter((i) => i.status === "pass").length;
    const progress = Math.round((passedCount / updatedItems.length) * 100);
    const overallStatus = progress === 100 ? "ready" : "warning";

    const updatedChecklist = {
      ...currentChecklist,
      items: updatedItems,
      progress,
      status: overallStatus,
    };

    setChecklists((prev) =>
      prev.map((c) => (c.projectId === currentChecklist.projectId ? updatedChecklist : c))
    );

    // Also sync progress to project
    if (setProjects) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === currentChecklist.projectId
            ? { ...p, checklistProgress: progress, checklistComplete: progress === 100 }
            : p
        )
      );
    }

    if (showToast) {
      showToast(newStatus === "pass" ? "✓ Đã đánh dấu ĐẠT CHUẨN" : "⚠ Đã ghi nhận BÁO THIẾU / LỖI");
    }
  };

  // Canvas Drawing Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureSaved(false);
  };

  const saveSignature = () => {
    setSignatureSaved(true);
    setShowSignaturePad(false);
    if (showToast) {
      showToast(`✓ Đã lưu chữ ký xác nhận của ${signerName || "Khách Hàng"}`);
    }
  };

  const handlePhotoCapture = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const previewUrl = URL.createObjectURL(file);
    setCapturedPhotos((prev) => [
      ...prev,
      { id: Date.now(), url: previewUrl, name: file.name, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) },
    ]);
    if (showToast) {
      showToast("✓ Đã chụp và đính kèm ảnh hiện trường công trình");
    }
  };

  // Filter items in current checklist
  const filteredChecklistItems = (currentChecklist?.items || []).filter((item) => {
    const matchesCategory = checklistCategory === "all" || item.category === checklistCategory;
    const matchesSearch =
      !checklistSearch ||
      item.name.toLowerCase().includes(checklistSearch.toLowerCase()) ||
      (item.note && item.note.toLowerCase().includes(checklistSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesRegion = projectRegion === "all" || p.region === projectRegion;
    const matchesSearch =
      !projectSearch ||
      p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.customer.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.contractCode.toLowerCase().includes(projectSearch.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  // Shortage items count across system
  const totalShortageCount = checklists.reduce((acc, c) => {
    return acc + (c.items || []).filter((i) => i.status === "shortage").length;
  }, 0);

  // Persona quick switch options
  const personas = [
    { id: "tech", label: "KTV", roleId: "field_tech", icon: "🔧", name: "Tuấn Anh" },
    { id: "sale", label: "Sale", roleId: "sales_rep", icon: "💼", name: "Phương Thảo" },
    { id: "boss", label: "Sếp", roleId: "admin", icon: "👑", name: "Hùng Attivo" },
    { id: "accountant", label: "K.Toán", roleId: "accountant", icon: "💵", name: "Thanh Kế Toán" },
  ];

  const handleSelectPersona = (p) => {
    const targetUser = users.find((u) => u.roleId === p.roleId) || users[0];
    if (targetUser && setCurrentUser) {
      setCurrentUser(targetUser);
    }
    if (showToast) {
      showToast(`Chuyển sang vai trò: ${p.label} (${targetUser?.name || p.name})`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col max-w-md mx-auto relative shadow-2xl safe-top">
      {/* 1. Mobile Top App Bar */}
      <header className="bg-slate-900 text-white px-4 pt-3 pb-3 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm text-white shadow-sm">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight">ATTIVO MOBILE</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Hôm nay: {todayFormatted}</span>
            </div>
          </div>

          {/* Switch to Desktop button */}
          <button
            type="button"
            onClick={onSwitchToDesktop}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] flex items-center gap-1.5 border border-slate-700 active:scale-95 transition"
            title="Chuyển sang giao diện máy tính đầy đủ"
          >
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span>Bản PC</span>
          </button>
        </div>

        {/* Persona quick selector bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between gap-1 text-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1">
            Vai trò:
          </span>
          <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
            {personas.map((p) => {
              const isActive = currentUser?.roleId === p.roleId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPersona(p)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition active:scale-95 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 2. Main Mobile Content Area (with safe bottom padding) */}
      <main className="flex-1 px-3 py-3 pb-24 space-y-3 overflow-y-auto">
        {/* ======================================================== */}
        {/* TAB 1: KTV CHECKLIST (Trạm Hiện Trường Lắp Đặt) */}
        {/* ======================================================== */}
        {mobileTab === "checklist" && (
          <div className="space-y-3">
            {/* Project Quick Selector Pills */}
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Chọn Công Trình Đang Lắp Đặt:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {projects.map((p) => {
                  const isSelected = p.id === selectedProjectId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition active:scale-95 ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {p.name.split(" ")[0]} {p.name.split(" ")[1] || ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Project Highlight Card */}
            {selectedProject && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {selectedProject.region === "HCM" ? "Miền Nam" : "Miền Bắc"} • {selectedProject.contractCode}
                    </span>
                    <h3 className="font-black text-slate-900 text-base mt-1 leading-snug">
                      {selectedProject.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">{selectedProject.customer}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Tiến Độ BOM</span>
                    <span className="text-lg font-black text-blue-600">
                      {currentChecklist?.progress || selectedProject.checklistProgress || 0}%
                    </span>
                  </div>
                </div>

                {/* Quick 1-Tap Action Buttons: Phone & Maps */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="tel:0327794884"
                    className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 active:scale-95 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Gọi Khách Hàng</span>
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(selectedProject.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 active:scale-95 transition truncate"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Chỉ Đường</span>
                  </a>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${currentChecklist?.progress || selectedProject.checklistProgress || 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Checklist Category Filter & Search */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm linh kiện, máy móc, bu lông..."
                  value={checklistSearch}
                  onChange={(e) => setChecklistSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-blue-600"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "equipment_bom", label: "Thiết Bị BOM" },
                  { id: "site_prep", label: "Khảo Sát MB" },
                  { id: "technical", label: "Cân Chỉnh" },
                  { id: "handover", label: "Bàn Giao" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setChecklistCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] shrink-0 transition ${
                      checklistCategory === cat.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist Items Touch Cards */}
            <div className="space-y-2.5">
              {filteredChecklistItems.map((it) => (
                <div
                  key={it.id}
                  className={`p-3.5 rounded-2xl border transition-all bg-white shadow-xs ${
                    it.status === "pass"
                      ? "border-emerald-200 bg-emerald-50/20"
                      : "border-rose-300 bg-rose-50/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {it.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          {it.category === "equipment_bom" ? "BOM" : "Kỹ Thuật"}
                        </span>
                        {it.sopDeliverable && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                            {it.sopDeliverable}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {it.status === "pass" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ĐẠT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertTriangle className="w-3.5 h-3.5" /> THIẾU
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity bar */}
                  <div className="mt-2.5 grid grid-cols-3 gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Yêu cầu</span>
                      <span className="font-bold text-slate-700">{it.orderedQty}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Thực nhận</span>
                      <span className={`font-black ${it.receivedQty >= it.orderedQty ? "text-emerald-700" : "text-rose-600"}`}>
                        {it.receivedQty}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Đơn vị</span>
                      <span className="font-semibold text-slate-600">{it.unit}</span>
                    </div>
                  </div>

                  {/* Note */}
                  {it.note && (
                    <p className="mt-2 text-[11px] text-slate-600 italic bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                      {it.note}
                    </p>
                  )}

                  {/* Big Touch Action Buttons (min-height 44px) */}
                  <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleUpdateItemStatus(it.id, "pass")}
                      className={`min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition ${
                        it.status === "pass"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Xác Nhận Đạt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateItemStatus(it.id, "shortage")}
                      className={`min-h-[44px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition ${
                        it.status === "shortage"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Báo Thiếu</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Field Photo Capture & Digital Signature Section */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-blue-600" /> Ký Nhận & Ảnh Nghiệm Thu Công Trình
              </h4>

              {/* Photo Upload/Camera Button */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handlePhotoCapture}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 active:scale-95 transition"
                >
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>Chụp Ảnh Nghiệm Thu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSignaturePad(true)}
                  className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-200 active:scale-95 transition"
                >
                  <PenTool className="w-4 h-4 text-purple-600" />
                  <span>Khách Hàng Ký Tay</span>
                </button>
              </div>

              {/* Display Captured Photos */}
              {capturedPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {capturedPhotos.map((p) => (
                    <div key={p.id} className="relative rounded-xl overflow-hidden border border-slate-200 shadow-2xs group">
                      <img src={p.url} alt="Hiện trường" className="w-full h-20 object-cover" />
                      <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 rounded bg-black/60 text-white">
                        {p.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Display Signature Confirmation if signed */}
              {signatureSaved && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-900 text-xs block">Đã có chữ ký nghiệm thu</span>
                      <span className="text-[10px] text-emerald-700">Người ký: {signerName || "Đại diện Chủ đầu tư"}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSignaturePad(true)}
                    className="text-xs text-emerald-800 font-bold underline"
                  >
                    Ký lại
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: DỰ ÁN & TIẾN ĐỘ (Projects for Sale & Management) */}
        {/* ======================================================== */}
        {mobileTab === "projects" && (
          <div className="space-y-3">
            {/* Search & Region Filter */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm dự án, khách hàng, mã HĐ..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-blue-600"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {["all", "HCM", "HN"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setProjectRegion(r)}
                    className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition ${
                      projectRegion === r
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {r === "all" ? "Tất Cả (8)" : r === "HCM" ? "Miền Nam" : "Miền Bắc"}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Mobile Cards */}
            <div className="space-y-3">
              {filteredProjects.map((p) => {
                const stageBadge = getProjectStageBadge(p.stage);
                const tender = tenders.find((t) => t.projectId === p.id || t.contractCode === p.contractCode);
                const contractVal = tender?.valueBeforeVat || p.hubspotDeal?.amount || 0;

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stageBadge.bg}`}>
                          {stageBadge.label}
                        </span>
                        <h4 className="font-black text-slate-900 text-base mt-1 leading-snug">
                          {p.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">{p.customer}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                        {p.region}
                      </span>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Giá trị HĐ:</span>
                        <span className="font-extrabold text-blue-900 text-sm">
                          {contractVal > 0 ? formatShortCurrency(contractVal) : "Đang lập giá"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Bàn giao MB:</span>
                        <span className="font-bold text-pink-700 text-xs">
                          {formatDate(p.handoverDate)}
                        </span>
                      </div>
                    </div>

                    {/* Marketing Ready Callout */}
                    {p.marketingReady && (
                      <div className="p-2 rounded-xl bg-pink-50 border border-pink-200 text-xs flex items-center gap-1.5 text-pink-800 font-bold">
                        <Camera className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                        <span>Mặt bằng sẵn sàng quay chụp Marketing!</span>
                      </div>
                    )}

                    {/* 1-Tap Action: Open Checklist directly on phone */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setMobileTab("checklist");
                        }}
                        className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Mở Checklist</span>
                      </button>

                      <a
                        href="tel:0327794884"
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>Gọi Điện</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: LỊCH VẬN HÀNH HÔM NAY (Daily Schedule Agenda) */}
        {/* ======================================================== */}
        {mobileTab === "schedule" && (
          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> Lịch Công Tác Tuần 43
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  Hôm nay: {todayFormatted}
                </span>
              </div>

              {/* Days Bar */}
              <div className="grid grid-cols-5 gap-1.5 text-center text-xs pt-1">
                {[
                  { date: "2026-10-19", label: "T2", day: "19" },
                  { date: "2026-10-20", label: "T3", day: "20" },
                  { date: "2026-10-21", label: "T4", day: "21" },
                  { date: "2026-10-22", label: "T5", day: "22" },
                  { date: "2026-10-23", label: "T6", day: "23" },
                ].map((d) => {
                  const isCurrent = d.date === selectedScheduleDay;
                  const isToday = d.date === todayISO;
                  return (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setSelectedScheduleDay(d.date)}
                      className={`p-2 rounded-xl transition flex flex-col items-center active:scale-95 ${
                        isCurrent
                          ? "bg-blue-600 text-white font-black shadow-xs"
                          : isToday
                          ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                          : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      <span className="text-[10px] uppercase">{d.label}</span>
                      <span className="text-sm font-extrabold mt-0.5">{d.day}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scheduled Tasks for Selected Day */}
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    Lắp Đặt • 08:30 - 16:00
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Tây Ninh</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Cà Na Pilates: Cân chỉnh 6 Reformer Merrithew
                </h4>
                <p className="text-xs text-slate-500">
                  KTV phụ trách: <strong>Lương Nguyễn Tuấn Anh & Thái Châu</strong>
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 font-bold">✓ Đã kiểm 85% BOM</span>
                  <a
                    href="tel:0909123456"
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> Gọi KTV
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">
                    Bảo Trì • 13:30 - 17:00
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Phú Mỹ Hưng</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Chateau Villa: Kiểm tra máy chạy Precor TRM631 & Wifi
                </h4>
                <p className="text-xs text-slate-500">
                  KTV phụ trách: <strong>Lương Nguyễn Tuấn Anh</strong>
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-blue-700 font-bold">✓ Hoàn tất kết nối mạng</span>
                  <a
                    href="tel:0909123456"
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> Gọi KTV
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: THU TIỀN & TÀI CHÍNH (Finance & Collections) */}
        {/* ======================================================== */}
        {mobileTab === "finance" && (
          <div className="space-y-3">
            {/* Quick KPI Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tổng Thu Tiền Trong Tuần:
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-700">
                  {formatCurrency(collections.reduce((sum, c) => sum + (c.amount || 0), 0))}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                  {collections.length} Phiếu Thu
                </span>
              </div>

              {/* Add Collection Quick Button */}
              <button
                type="button"
                onClick={() => setShowAddMoneyModal(true)}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Ghi Nhận Thu Tiền Mới</span>
              </button>
            </div>

            {/* Recent Collections List */}
            <div className="space-y-2.5">
              {collections.map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{c.customer}</span>
                    <span className="font-black text-emerald-700 text-sm">{formatCurrency(c.amount)}</span>
                  </div>
                  <p className="text-xs text-slate-600">{c.dealType}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>{c.paymentMethod}</span>
                    <span>{formatDate(c.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: KHO VẬN & BÙ HÀNG (Logistics & RMA) */}
        {/* ======================================================== */}
        {mobileTab === "logistics" && (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <Ship className="w-4 h-4 text-blue-600" /> Tình Trạng Kho & PO Hàng
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {totalShortageCount} Linh Kiện Thiếu
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Theo dõi 14 PO đường biển & hàng không cập kho Bình Dương / Đông Anh.
              </p>
            </div>

            {/* Shipment Cards */}
            <div className="space-y-2.5">
              {shipments.slice(0, 5).map((s) => (
                <div key={s.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-800">{s.poCode}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.status === "in_warehouse" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {s.status === "in_warehouse" ? "Đã nhập kho" : "Đang vận chuyển"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-semibold">{s.brand} • Kho {s.warehouse === "BD" ? "Bình Dương" : "Đông Anh"}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>ETA: {formatDate(s.eta)}</span>
                    <span className="font-bold text-slate-700">{formatShortCurrency(s.estimatedCost)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 3. Mobile Bottom Navigation Bar (Fixed for 1-hand thumb tapping) */}
      <nav
        aria-label="Thanh điều hướng di động"
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl px-2 py-1 flex items-center justify-around"
      >
        {[
          { id: "checklist", label: "Checklist", icon: ClipboardCheck, badge: totalShortageCount },
          { id: "projects", label: "Dự Án", icon: FolderGit2 },
          { id: "schedule", label: "Lịch Việc", icon: Calendar },
          { id: "finance", label: "Thu Tiền", icon: DollarSign },
          { id: "logistics", label: "Kho PO", icon: Ship },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = mobileTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMobileTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition relative min-h-[48px] active:scale-95 ${
                isActive
                  ? "text-blue-600 font-extrabold"
                  : "text-slate-600 hover:text-slate-900 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-600 stroke-[2.4]" : "text-slate-500"}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </nav>

      {/* 4. Digital Signature Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm space-y-3 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-blue-600" /> Ký Nhận Nghiệm Thu Hiện Trường
              </h3>
              <button
                type="button"
                onClick={() => setShowSignaturePad(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Họ tên người ký (Đại diện Khách hàng / CĐT):
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Mr. Vũ (Cana Tây Ninh)"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-600 block mb-1">
                Dùng ngón tay ký trực tiếp vào khung dưới:
              </span>
              <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 touch-none">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[150px] cursor-crosshair"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={clearCanvas}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Ký lại
              </button>
              <button
                type="button"
                onClick={saveSignature}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
              >
                <Check className="w-4 h-4" /> Xác Nhận Chữ Ký
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add Money / Payment Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm space-y-3 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Ghi Nhận Thu Tiền Nhanh
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMoneyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Khách Hàng / Dự Án:</label>
              <input
                type="text"
                value={moneyCustomer}
                onChange={(e) => setMoneyCustomer(e.target.value)}
                placeholder="Tên khách hàng..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Số Tiền (VNĐ):</label>
              <input
                type="number"
                value={moneyAmount}
                onChange={(e) => setMoneyAmount(e.target.value)}
                placeholder="Ví dụ: 100000000"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (!moneyAmount || !setCollections) return;
                const newCol = {
                  id: `COL-${Date.now().toString().slice(-4)}`,
                  customer: moneyCustomer || "Khách Hàng Dự Án",
                  amount: Number(moneyAmount),
                  date: todayISO,
                  dealType: "Thanh toán tiến độ hợp đồng qua mobile",
                  paymentMethod: "Chuyển khoản VCB",
                  status: "collected",
                  notes: `Ghi nhận nhanh trên điện thoại ngày ${todayFormatted}`,
                };
                setCollections((prev) => [newCol, ...prev]);
                setShowAddMoneyModal(false);
                setMoneyAmount("");
                if (showToast) showToast(`✓ Đã ghi nhận thu ${formatCurrency(Number(moneyAmount))}`);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1 shadow-xs"
            >
              <Check className="w-4 h-4" /> Xác Nhận Thu Tiền
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
