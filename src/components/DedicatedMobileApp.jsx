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
  ChevronLeft,
  ChevronDown,
  Building2,
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
  Truck,
  AlertCircle,
  PackageCheck,
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

  // Project Picker Modal & Navigation
  const [showProjectPickerModal, setShowProjectPickerModal] = useState(false);
  const [projectPickerSearch, setProjectPickerSearch] = useState("");

  const currentProjectIndex = Math.max(0, projects.findIndex((p) => p.id === selectedProjectId));
  const hasPrevProject = currentProjectIndex > 0;
  const hasNextProject = currentProjectIndex < projects.length - 1;

  const handlePrevProject = () => {
    if (hasPrevProject) {
      setSelectedProjectId(projects[currentProjectIndex - 1].id);
    }
  };

  const handleNextProject = () => {
    if (hasNextProject) {
      setSelectedProjectId(projects[currentProjectIndex + 1].id);
    }
  };

  // Checklist Category Filter
  const [checklistCategory, setChecklistCategory] = useState("all");
  const [checklistSearch, setChecklistSearch] = useState("");

  // Projects View Search & Filter
  const [projectSearch, setProjectSearch] = useState("");
  const [projectRegion, setProjectRegion] = useState("all");

  // Schedule View Selected Date & Region
  const [selectedScheduleDay, setSelectedScheduleDay] = useState(todayISO);
  const [selectedScheduleRegion, setSelectedScheduleRegion] = useState("all");

  // Finance View: 'outstanding' (Công nợ tồn đọng) | 'collected' (Phiếu đã thu)
  const [financeView, setFinanceView] = useState("outstanding");

  // Warehouse / Logistics Filter: 'all' | 'BD' | 'DA' | 'shortage'
  const [warehouseFilter, setWarehouseFilter] = useState("all");

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

  // Persona quick switch options with dedicated tabs and descriptions
  const personas = [
    {
      id: "tech",
      label: "KTV",
      roleId: "field_tech",
      icon: "🔧",
      name: "Tuấn Anh",
      title: "Kỹ Thuật Hiện Trường",
      defaultTab: "checklist",
      desc: "Nghiệm thu BOM 8 dự án • Kiểm tra linh kiện • Ký biên bản bàn giao",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      id: "sale",
      label: "Sale",
      roleId: "sales_rep",
      icon: "💼",
      name: "Phương Thảo",
      title: "Kinh Doanh & Dự Án",
      defaultTab: "projects",
      desc: "Theo dõi 8 hợp đồng thầu • Giục tạm ứng đợt 1 • Phối hợp bàn giao mặt bằng",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
    {
      id: "boss",
      label: "Sếp",
      roleId: "admin",
      icon: "👑",
      name: "Hùng Attivo",
      title: "Ban Điều Hành (BOD)",
      defaultTab: "projects",
      desc: "Toàn cảnh 8 dự án • Doanh thu 14.59 Tỷ • Giám sát thu nợ tồn đọng & điều hành",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      id: "accountant",
      label: "K.Toán",
      roleId: "accountant",
      icon: "💵",
      name: "Thanh Kế Toán",
      title: "Kế Toán & Công Nợ",
      defaultTab: "finance",
      desc: "Đã thu 2.89 Tỷ • Công nợ tồn đọng 11.7 Tỷ • Đối soát VCB / BIDV / Techcombank",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
  ];

  const activePersona = personas.find((p) => p.roleId === currentUser?.roleId) || personas[0];

  const handleSelectPersona = (p) => {
    const targetUser = users.find((u) => u.roleId === p.roleId) || users[0];
    if (targetUser && setCurrentUser) {
      setCurrentUser(targetUser);
    }
    setMobileTab(p.defaultTab);
    if (showToast) {
      showToast(`✓ Chuyển sang vai trò: ${p.title} (${targetUser?.name || p.name})`);
    }
  };

  // Finance calculations for all projects: Contract Value, Collected, Remaining Outstanding Debt
  const projectFinanceList = projects.map((p) => {
    const tender = tenders.find((t) => t.projectId === p.id || t.contractCode === p.contractCode);
    const contractVal = tender?.valueBeforeVat || p.hubspotDeal?.amount || 0;
    const pCust = String(p.customer || "").toLowerCase();
    const pName = String(p.name || "").toLowerCase();
    const projectCols = collections.filter((c) => {
      const cCust = String(c.customer || "").toLowerCase();
      const cProj = String(c.project || "").toLowerCase();
      return (
        (cCust && (cCust.includes(pCust) || pCust.includes(cCust) || cCust.includes(pName) || pName.includes(cCust))) ||
        (cProj && (cProj.includes(pName) || pName.includes(cProj)))
      );
    });
    const collected = projectCols.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    const remaining = Math.max(0, contractVal - collected);
    const percent = contractVal > 0 ? Math.min(100, Math.round((collected / contractVal) * 100)) : 0;
    return {
      ...p,
      contractVal,
      collected,
      remaining,
      percent,
      collectionsCount: projectCols.length,
      linkedCols: projectCols,
    };
  });

  const totalContractValueAll = projectFinanceList.reduce((sum, p) => sum + p.contractVal, 0);
  const totalCollectedAll = collections.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const totalOutstandingDebt = Math.max(0, totalContractValueAll - totalCollectedAll);
  const overallCollectionPercent =
    totalContractValueAll > 0 ? Math.round((totalCollectedAll / totalContractValueAll) * 100) : 0;

  // Schedule Tasks & Matching for selected day
  const scheduleTasksForSelectedDay = (() => {
    const list = [];
    const hcmDay = (schedule?.HCM || []).find((d) => d.date === selectedScheduleDay);
    if (hcmDay?.tasks && (selectedScheduleRegion === "all" || selectedScheduleRegion === "HCM")) {
      hcmDay.tasks.forEach((t) => list.push({ ...t, region: "HCM", dayName: hcmDay.day }));
    }
    const hnDay = (schedule?.HN || []).find((d) => d.date === selectedScheduleDay);
    if (hnDay?.tasks && (selectedScheduleRegion === "all" || selectedScheduleRegion === "HN")) {
      hnDay.tasks.forEach((t) => list.push({ ...t, region: "HN", dayName: hnDay.day }));
    }
    // Match milestones from projects
    projects.forEach((p) => {
      if (selectedScheduleRegion !== "all" && p.region !== selectedScheduleRegion) return;
      if (p.installationDate === selectedScheduleDay) {
        list.push({
          id: `EVT-INST-${p.id}`,
          site: p.name,
          type: "delivery",
          content: `Lắp đặt chính thức thiết bị gym: ${p.name} (${p.customer})`,
          tech: p.assignedTech || "Đội KTV Attivo",
          status: "in_progress",
          priority: "high",
          region: p.region,
          matchedProjectId: p.id,
          isProjectMilestone: true,
        });
      }
      if (p.handoverDate === selectedScheduleDay) {
        list.push({
          id: `EVT-HO-${p.id}`,
          site: p.name,
          type: "handover",
          content: `Nghiệm thu & Bàn giao mặt bằng: ${p.name} (${p.customer})`,
          tech: p.assignedTech || "Đội KTV & Ban Bàn Giao",
          status: "pending",
          priority: "high",
          region: p.region,
          matchedProjectId: p.id,
          isProjectMilestone: true,
        });
      }
    });
    return list;
  })();

  const getTaskMatchedProject = (task) => {
    if (task.matchedProjectId) {
      return projects.find((p) => p.id === task.matchedProjectId);
    }
    const fullText = `${task.site || ""} ${task.content || ""}`.toLowerCase();
    return projects.find((p) => {
      const pName = p.name.toLowerCase();
      const pCust = p.customer.toLowerCase();
      if (fullText.includes("fullton") || fullText.includes("fulton")) return p.id === "PRJ-004";
      if (fullText.includes("cà na") || fullText.includes("cana")) return p.id === "PRJ-001";
      if (fullText.includes("chateau")) return p.id === "PRJ-002";
      if (fullText.includes("grab")) return p.id === "PRJ-003";
      if (fullText.includes("flamingo") || fullText.includes("cát bà")) return p.id === "PRJ-005";
      if (fullText.includes("vinhomes")) return p.id === "PRJ-006";
      if (fullText.includes("skelcore")) return p.id === "PRJ-007";
      if (fullText.includes("cambodia") || fullText.includes("gogym")) return p.id === "PRJ-008";
      return fullText.includes(pName) || pName.includes(task.site?.toLowerCase() || "___");
    });
  };

  // Logistics: match projects from shipment.projects to actual project records
  const getShipmentMatchedProjects = (shipment) => {
    const matched = [];
    (shipment.projects || []).forEach((projStr) => {
      const pLower = projStr.toLowerCase();
      const found = projects.find((p) => {
        const nameLower = p.name.toLowerCase();
        const custLower = p.customer.toLowerCase();
        return pLower.includes(nameLower) || nameLower.includes(pLower) || pLower.includes(custLower);
      });
      matched.push({
        targetName: projStr,
        project: found || null,
      });
    });
    return matched;
  };

  // Filtered shipments
  const filteredShipments = shipments.filter((s) => {
    if (warehouseFilter === "all") return true;
    if (warehouseFilter === "BD") return s.warehouse === "BD";
    if (warehouseFilter === "DA") return s.warehouse === "DA" || s.warehouse === "HN";
    return true;
  });

  // Shortage items list across all checklists with project info
  const allShortageItems = checklists.flatMap((c) => {
    const proj = projects.find((p) => p.id === c.projectId);
    return (c.items || [])
      .filter((i) => i.status === "shortage")
      .map((it) => ({
        ...it,
        projectName: proj?.name || c.projectId,
        projectId: c.projectId,
      }));
  });

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
                <span className="font-extrabold text-sm tracking-tight">ĐIỀU HÀNH ATTIVO</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Hiện trường & Quản trị • {todayFormatted}</span>
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
        {/* Dynamic Role Context Banner */}
        {activePersona && (
          <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-lg shrink-0">
                {activePersona.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${activePersona.badgeColor}`}>
                    {activePersona.title}
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {currentUser?.name || activePersona.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                  {activePersona.desc}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-1 rounded-lg border border-blue-800 shrink-0">
              {activePersona.label}
            </span>
          </div>
        )}
        {/* ======================================================== */}
        {/* TAB 1: KTV CHECKLIST (Trạm Hiện Trường Lắp Đặt) */}
        {/* ======================================================== */}
        {mobileTab === "checklist" && (
          <div className="space-y-3">
            {/* Unified Compact Project Card & Selector */}
            {selectedProject && (
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                {/* 1. Header Bar: Counter + "Xem tất cả" Modal Trigger */}
                <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    Công Trình ({currentProjectIndex + 1}/{projects.length}):
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowProjectPickerModal(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 active:scale-95 transition px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100"
                  >
                    <span>Xem tất cả</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* 2. Interactive Switcher: Prev [ < ] + Dropdown Select [ Project Name ▼ ] + Next [ > ] */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevProject}
                    disabled={!hasPrevProject}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition shrink-0 active:scale-95 ${
                      hasPrevProject
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                        : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                    }`}
                    title="Dự án trước"
                    aria-label="Dự án trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1 min-w-0">
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full appearance-none bg-blue-50/70 hover:bg-blue-50 border border-blue-200 hover:border-blue-400 rounded-xl px-3 py-2 pr-8 font-black text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer truncate"
                      aria-label="Chọn công trình thi công"
                    >
                      {projects.map((p, idx) => {
                        const chk = checklists.find((c) => c.projectId === p.id);
                        const prog = chk?.progress || p.checklistProgress || 0;
                        return (
                          <option key={p.id} value={p.id}>
                            #{idx + 1} • {p.name} [{p.region === "HCM" ? "Miền Nam" : "Miền Bắc"}] - {prog}% BOM
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-blue-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    onClick={handleNextProject}
                    disabled={!hasNextProject}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition shrink-0 active:scale-95 ${
                      hasNextProject
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                        : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                    }`}
                    title="Dự án kế tiếp"
                    aria-label="Dự án kế tiếp"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 3. Project Detail Snapshot */}
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                        {selectedProject.region === "HCM" ? "Miền Nam" : "Miền Bắc"}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        HĐ: {selectedProject.contractCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-700">
                      <span>BOM:</span>
                      <span className="text-sm font-black">
                        {currentChecklist?.progress || selectedProject.checklistProgress || 0}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium truncate">
                    🏢 <span className="font-bold text-slate-900">{selectedProject.customer}</span> • {selectedProject.address}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${currentChecklist?.progress || selectedProject.checklistProgress || 0}%` }}
                    />
                  </div>
                </div>

                {/* 4. Quick 1-Tap Action Buttons: Phone & Maps */}
                <div className="grid grid-cols-2 gap-2">
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
                    <span>Chỉ Đường Maps</span>
                  </a>
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

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
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
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> Lịch Công Tác Tuần 43
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  Hôm nay: {todayFormatted}
                </span>
              </div>

              {/* Region Filter for Schedule */}
              <div className="flex items-center gap-1.5 text-xs">
                {[
                  { id: "all", label: "Tất cả vùng" },
                  { id: "HCM", label: "Miền Nam (HCM)" },
                  { id: "HN", label: "Miền Bắc (HN)" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedScheduleRegion(r.id)}
                    className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition ${
                      selectedScheduleRegion === r.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
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
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
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
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Công Việc & Lịch Trình ({scheduleTasksForSelectedDay.length} sự vụ):
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {formatDate(selectedScheduleDay)}
                </span>
              </div>

              {scheduleTasksForSelectedDay.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-1">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">Không có lịch công tác ngày này</p>
                  <p className="text-xs text-slate-400">Chọn ngày khác trên thanh lịch tuần ở trên.</p>
                </div>
              ) : (
                scheduleTasksForSelectedDay.map((task, idx) => {
                  const matchedProj = getTaskMatchedProject(task);
                  const isHandover = task.type === "handover";
                  const isDelivery = task.type === "delivery";
                  const isRepair = task.type === "repair";

                  return (
                    <div
                      key={task.id || idx}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                            isHandover
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : isDelivery
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : isRepair
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          }`}
                        >
                          {isHandover
                            ? "Bàn Giao MB"
                            : isDelivery
                            ? "Lắp Đặt Hiện Trường"
                            : isRepair
                            ? "Sửa Chữa Kỹ Thuật"
                            : "Bảo Trì Định Kỳ"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {task.region === "HCM" ? "Miền Nam" : "Miền Bắc"}
                          </span>
                          {task.priority === "high" && (
                            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              Ưu tiên cao
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="font-black text-slate-900 text-sm leading-snug">
                        {task.site}: {task.content}
                      </h4>

                      <p className="text-xs text-slate-500 font-medium">
                        KTV phụ trách: <strong className="text-slate-700">{task.tech}</strong>
                      </p>

                      {/* Direct Link to Main Project */}
                      {matchedProj ? (
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProjectId(matchedProj.id);
                              setMobileTab("checklist");
                              if (showToast) {
                                showToast(`✓ Đã mở Checklist dự án: ${matchedProj.name}`);
                              }
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-between active:scale-95 transition shadow-xs"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <FolderGit2 className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">
                                Dự án chính: <strong>{matchedProj.name}</strong>
                              </span>
                            </span>
                            <span className="shrink-0 text-[10px] bg-blue-800 px-1.5 py-0.5 rounded font-black">
                              Mở Checklist →
                            </span>
                          </button>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                            <span className="truncate">Khách hàng: {matchedProj.customer}</span>
                            <a
                              href="tel:0327794884"
                              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 shrink-0"
                            >
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>Gọi KTV</span>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 italic">Vận hành bảo trì định kỳ</span>
                          <a
                            href="tel:0327794884"
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>Gọi KTV</span>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: THU TIỀN & TÀI CHÍNH (Finance & Collections) */}
        {/* ======================================================== */}
        {mobileTab === "finance" && (
          <div className="space-y-3">
            {/* Quick KPI Bar: Contract Total, Collected, Outstanding Receivables */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  Bức Tranh Tài Chính & Công Nợ
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {projects.length} Dự án
                </span>
              </div>

              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                    Đã Thu Thực Tế:
                  </span>
                  <span className="text-base font-black text-emerald-700">
                    {formatCurrency(totalCollectedAll)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    {collections.length} Phiếu Thu VCB/BIDV
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 space-y-0.5">
                  <span className="text-[10px] font-black text-rose-800 uppercase block flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-600" /> Nợ Tồn Đọng Chưa Thu:
                  </span>
                  <span className="text-base font-black text-rose-700">
                    {formatCurrency(totalOutstandingDebt)}
                  </span>
                  <span className="text-[10px] text-rose-600 font-semibold block">
                    Tổng HĐ: {formatCurrency(totalContractValueAll)}
                  </span>
                </div>
              </div>

              {/* Overall Collection Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Tỷ lệ thu hồi công nợ:</span>
                  <span className="text-blue-700 font-black">{overallCollectionPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${overallCollectionPercent}%` }}
                  />
                </div>
              </div>

              {/* Add Collection Quick Button */}
              <button
                type="button"
                onClick={() => setShowAddMoneyModal(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Ghi Nhận Thu Tiền Mới</span>
              </button>
            </div>

            {/* Sub-view Switcher: Outstanding Debt vs Collected Vouchers */}
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFinanceView("outstanding")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  financeView === "outstanding"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Công Nợ Tồn Đọng ({projectFinanceList.filter((p) => p.remaining > 0).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFinanceView("collected")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  financeView === "collected"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Phiếu Đã Thu ({collections.length})</span>
              </button>
            </div>

            {/* Content for Outstanding Debt */}
            {financeView === "outstanding" && (
              <div className="space-y-2.5">
                {projectFinanceList
                  .sort((a, b) => b.remaining - a.remaining)
                  .map((p) => {
                    const isFullyPaid = p.remaining === 0 && p.contractVal > 0;
                    const isZeroCollected = p.collected === 0 && p.contractVal > 0;

                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-2xl border shadow-xs space-y-2.5 transition ${
                          isFullyPaid
                            ? "bg-emerald-50/20 border-emerald-200"
                            : isZeroCollected
                            ? "bg-rose-50/20 border-rose-200"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {p.region === "HCM" ? "Miền Nam" : "Miền Bắc"}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {p.contractCode}
                              </span>
                            </div>
                            <h4 className="font-black text-slate-900 text-sm mt-1 leading-snug">
                              {p.name}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">{p.customer}</p>
                          </div>

                          <div className="text-right shrink-0">
                            {isFullyPaid ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ✓ Đã Thu Đủ 100%
                              </span>
                            ) : isZeroCollected ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                                ⚠ Chưa Thu Đợt Nào
                              </span>
                            ) : (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                Đã Thu {p.percent}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Financial figures breakdown */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 grid grid-cols-3 gap-1.5 text-center text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">
                              Giá trị HĐ
                            </span>
                            <span className="font-extrabold text-slate-800 text-[11px]">
                              {p.contractVal > 0 ? formatShortCurrency(p.contractVal) : "Đang lập"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-emerald-600 font-bold block uppercase">
                              Đã thu
                            </span>
                            <span className="font-extrabold text-emerald-700 text-[11px]">
                              {formatShortCurrency(p.collected)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-rose-600 font-bold block uppercase">
                              Còn nợ tồn
                            </span>
                            <span className="font-black text-rose-700 text-xs">
                              {formatShortCurrency(p.remaining)}
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isFullyPaid ? "bg-emerald-600" : "bg-amber-500"
                            }`}
                            style={{ width: `${p.percent}%` }}
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setMoneyCustomer(p.customer);
                              setShowAddMoneyModal(true);
                            }}
                            className="py-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1 border border-emerald-200 active:scale-95 transition"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-600" />
                            <span>+ Thu Tiền</span>
                          </button>

                          <a
                            href="tel:0327794884"
                            className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>Gọi Giục Tiền</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Content for Collected Vouchers */}
            {financeView === "collected" && (
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
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: KHO VẬN & BÙ HÀNG (Logistics & Shipments) */}
        {/* ======================================================== */}
        {mobileTab === "logistics" && (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <Ship className="w-4 h-4 text-blue-600" /> Kho Hàng & Vận Chuyển Cont
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {totalShortageCount} Linh Kiện Thiếu
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Theo dõi 14 PO đường biển/hàng không, nhận hàng tại kho Bình Dương & Đông Anh và vận chuyển đích đến từng dự án.
              </p>

              {/* Warehouse Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                {[
                  { id: "all", label: `Tất cả (${shipments.length})` },
                  { id: "BD", label: "Kho Bình Dương (7)" },
                  { id: "DA", label: "Kho Đông Anh (7)" },
                  { id: "shortage", label: `Hàng Thiếu Cần Bù (${totalShortageCount})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setWarehouseFilter(f.id)}
                    className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition ${
                      warehouseFilter === f.id
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shortage View */}
            {warehouseFilter === "shortage" ? (
              <div className="space-y-2.5">
                <span className="text-xs font-black text-rose-800 uppercase px-1 block">
                  Danh Sách Linh Kiện Đang Thiếu Cần Bù Hiện Trường:
                </span>
                {allShortageItems.map((item, idx) => (
                  <div
                    key={`${item.projectId}-${item.id || idx}`}
                    className="p-3.5 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        ⚠ Báo Thiếu Hụt
                      </span>
                      <span className="text-xs font-black text-rose-700">
                        Thiếu {item.orderedQty - item.receivedQty} {item.unit || "cái"}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                    <p className="text-xs text-slate-500">
                      Công trình: <strong className="text-blue-700">{item.projectName}</strong>
                    </p>
                    {item.note && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                        Ghi chú: {item.note}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(item.projectId);
                        setMobileTab("checklist");
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      <span>Mở Checklist Dự Án Này</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* All Shipments List */
              <div className="space-y-2.5">
                {filteredShipments.map((s) => {
                  const isInWarehouse = s.status === "in_warehouse";
                  const matchedProjList = getShipmentMatchedProjects(s);

                  return (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5"
                    >
                      {/* Top: PO Code & Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {s.poCode}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            Kho {s.warehouse === "BD" ? "Bình Dương" : "Đông Anh"}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isInWarehouse
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {isInWarehouse ? "✓ Đã nhập kho" : "Đang vận chuyển"}
                        </span>
                      </div>

                      {/* Tender Vận Chuyển & Nhận Hàng Details */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            Hãng tàu / Brand:
                          </span>
                          <span className="font-bold">{s.brand}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            Cước vận tải dự toán:
                          </span>
                          <span className="font-extrabold text-blue-900">
                            {formatCurrency(s.estimatedCost || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            Ngày cập kho (ETA):
                          </span>
                          <span className="font-bold text-slate-800">{formatDate(s.eta)}</span>
                        </div>
                      </div>

                      {/* VẬN CHUYỂN ĐẾN DỰ ÁN NÀO (Destination Projects) */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          Vận chuyển đến dự án nào:
                        </span>

                        <div className="space-y-1.5">
                          {matchedProjList.map((item, pIdx) => {
                            const coreProj = item.project;
                            return (
                              <div
                                key={pIdx}
                                className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                                  coreProj
                                    ? "bg-blue-50/70 border-blue-200"
                                    : "bg-slate-50 border-slate-200 text-slate-700"
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1 font-bold text-slate-900 truncate">
                                    <span>🏢</span>
                                    <span className="truncate">{item.targetName}</span>
                                    {coreProj && (
                                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-blue-600 text-white shrink-0">
                                        Dự Án Trọng Điểm
                                      </span>
                                    )}
                                  </div>
                                  {coreProj && (
                                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                      {coreProj.customer} • {coreProj.address}
                                    </p>
                                  )}
                                </div>

                                {coreProj && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedProjectId(coreProj.id);
                                      setMobileTab("checklist");
                                      if (showToast) {
                                        showToast(`✓ Đã mở Checklist công trình: ${coreProj.name}`);
                                      }
                                    }}
                                    className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shrink-0 active:scale-95 transition"
                                  >
                                    Mở Kiểm Hàng
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Chọn Dự Án Thu Tiền:
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  const pId = e.target.value;
                  setSelectedProjectId(pId);
                  const pObj = projects.find((p) => p.id === pId);
                  if (pObj) setMoneyCustomer(pObj.customer);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 mb-2"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.customer})
                  </option>
                ))}
              </select>

              <label className="text-[11px] font-bold text-slate-600 block mb-1">Khách Hàng / Đơn Vị:</label>
              <input
                type="text"
                value={moneyCustomer}
                onChange={(e) => setMoneyCustomer(e.target.value)}
                placeholder="Tên khách hàng..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
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

      {/* 8. Project Picker Bottom Sheet Modal */}
      {showProjectPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Chọn Công Trình Thi Công</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Chạm để mở ngay checklist & tiến độ dự án
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProjectPickerModal(false);
                  setProjectPickerSearch("");
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold active:scale-95 transition"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo tên công trình, khách hàng, mã HĐ..."
                  value={projectPickerSearch}
                  onChange={(e) => setProjectPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-blue-600 shadow-xs"
                />
              </div>
            </div>

            {/* List of projects */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[60vh]">
              {projects
                .filter((p) => {
                  if (!projectPickerSearch) return true;
                  const q = projectPickerSearch.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(q) ||
                    p.customer.toLowerCase().includes(q) ||
                    (p.contractCode && p.contractCode.toLowerCase().includes(q))
                  );
                })
                .map((p, idx) => {
                  const isSelected = p.id === selectedProjectId;
                  const chk = checklists.find((c) => c.projectId === p.id);
                  const prog = chk?.progress || p.checklistProgress || 0;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        setShowProjectPickerModal(false);
                        setProjectPickerSearch("");
                        if (showToast) {
                          showToast(`Đã chuyển sang công trình: ${p.name}`);
                        }
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition active:scale-[0.98] flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-400"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                            {p.region === "HCM" ? "Miền Nam" : "Miền Bắc"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {p.contractCode}
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 text-xs mt-1 truncate">
                          {p.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {p.customer} • {p.address}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-blue-600">{prog}%</div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">
                          BOM Đạt
                        </span>
                        {isSelected && (
                          <span className="inline-block mt-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            ✓ Đang chọn
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
