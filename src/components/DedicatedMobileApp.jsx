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
  FileText,
  Bot,
  Send,
  Download,
  Upload,
  Share2,
  FileCheck,
  FileSpreadsheet,
  MoreHorizontal,
  Menu,
  Users,
  Activity,
  BarChart3,
  Target,
  ExternalLink as ExtLink,
  Eye,
  Briefcase,
} from "lucide-react";
import {
  formatCurrency,
  formatShortCurrency,
  formatDate,
  getTodayFormatted,
  getTodayISO,
  getProjectStageBadge,
} from "../utils/formatters";
import { HUBSPOT_DASHBOARD_URLS, HUBSPOT_PORTAL_ID } from "../utils/hubspotService";

export default function DedicatedMobileApp({
  projects = [],
  setProjects,
  checklists = [],
  setChecklists,
  shipments = [],
  setShipments,
  collections = [],
  setCollections,
  schedule = { HN: [], HCM: [] },
  setSchedule,
  tenders = [],
  setTenders,
  dmsDocuments = [],
  setDmsDocuments,
  users = [],
  setUsers,
  roles = [],
  currentUser,
  setCurrentUser,
  hubspotTickets = [],
  setHubspotTickets,
  hubspotContacts = [],
  setHubspotContacts,
  notifications = [],
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
  const [scheduleViewMode, setScheduleViewMode] = useState("day"); // 'day' | 'all'

  // Finance View: 'outstanding' (Công nợ tồn đọng) | 'collected' (Phiếu đã thu)
  const [financeView, setFinanceView] = useState("outstanding");

  // Warehouse / Logistics Filter: 'all' | 'BD' | 'DA' | 'shortage'
  const [warehouseFilter, setWarehouseFilter] = useState("all");

  // Extended Modules: Tender, DMS, Telegram Bot, Staff / Users
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [tenderCategory, setTenderCategory] = useState("all");
  const [tenderSearch, setTenderSearch] = useState("");
  const [dmsCategory, setDmsCategory] = useState("all");
  const [dmsSearch, setDmsSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [telegramStatus, setTelegramStatus] = useState("online");
  const [botBroadcastSent, setBotBroadcastSent] = useState(false);

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

  // Quick Add Project Modal (Mobile)
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newMobileProject, setNewMobileProject] = useState({
    name: "",
    customer: "",
    contact: "",
    address: "",
    brand: "Merrithew",
    type: "Pilates Studio / Phòng tập Pilates",
    region: "HCM",
    contractCode: "",
    stage: "site_prep",
    progress: 10,
    handoverDate: "",
    installationDate: "",
    leadSale: "Hoài Trịnh",
    dealOwner: "Hoài Trịnh",
    assignedTech: "Đội KTV HCM",
  });

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
      name: "Dominic Pham",
      title: "Operations Director (BOD)",
      defaultTab: "projects",
      desc: "Toàn cảnh 20 dự án • Doanh thu 14.59 Tỷ • Giám sát thu nợ tồn đọng & điều hành",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      id: "accountant",
      label: "K.Toán",
      roleId: "finance_lead",
      icon: "💵",
      name: "La Can",
      title: "Kế Toán Trưởng & Thu Tiền",
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

  // Finance calculations for all projects: Contract Value, Collected, Remaining Outstanding Debt, Owner & Overdue Days
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

    // Project Owner
    const owner = p.dealOwner || p.leadSale || p.contactOwner || "Hoài Trịnh (Sale Attivo)";

    // Overdue calculation (comparison against today 21/10/2026)
    const dueDateStr = p.handoverDate || p.installationDate || "2026-10-20";
    let overdueDays = 0;
    let isOverdue = false;
    if (remaining > 0 && dueDateStr) {
      const due = new Date(dueDateStr);
      const today = new Date("2026-10-21");
      const diffMs = today - due;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        overdueDays = diffDays;
        isOverdue = true;
      }
    }

    return {
      ...p,
      contractVal,
      collected,
      remaining,
      percent,
      owner,
      dueDateStr,
      overdueDays,
      isOverdue,
      collectionsCount: projectCols.length,
      linkedCols: projectCols,
    };
  });

  const totalContractValueAll = projectFinanceList.reduce((sum, p) => sum + p.contractVal, 0);
  const totalCollectedAll = collections.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const totalOutstandingDebt = Math.max(0, totalContractValueAll - totalCollectedAll);
  const overallCollectionPercent =
    totalContractValueAll > 0 ? Math.round((totalCollectedAll / totalContractValueAll) * 100) : 0;

  // Average BOM progress across all projects
  const averageBOMProgress = Math.round(
    projects.reduce((acc, p) => {
      const c = checklists.find((chk) => chk.projectId === p.id);
      return acc + (c?.progress || p.checklistProgress || 0);
    }, 0) / (projects.length || 1)
  );

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

  // All schedule tasks grouped across all dates (for "Toàn bộ lịch trình")
  const allScheduleTasksGrouped = (() => {
    const map = {};
    const add = (dateStr, task) => {
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(task);
    };

    (schedule?.HCM || []).forEach((d) => {
      if (selectedScheduleRegion === "all" || selectedScheduleRegion === "HCM") {
        (d.tasks || []).forEach((t) => add(d.date, { ...t, region: "HCM", dayName: d.day }));
      }
    });

    (schedule?.HN || []).forEach((d) => {
      if (selectedScheduleRegion === "all" || selectedScheduleRegion === "HN") {
        (d.tasks || []).forEach((t) => add(d.date, { ...t, region: "HN", dayName: d.day }));
      }
    });

    projects.forEach((p) => {
      if (selectedScheduleRegion !== "all" && p.region !== selectedScheduleRegion) return;
      if (p.installationDate) {
        add(p.installationDate, {
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
      if (p.handoverDate) {
        add(p.handoverDate, {
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

    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  })();

  // Mobile User Deletion Handler
  const handleDeleteUserMobile = (userId, userName) => {
    if (currentUser?.id === userId) {
      alert("Không thể xóa tài khoản bạn đang đăng nhập!");
      return;
    }
    const confirmed = typeof window !== "undefined" && window.confirm
      ? window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn nhân sự "${userName || userId}" khỏi hệ thống Attivo?`)
      : true;
    if (!confirmed) return;

    if (setUsers) {
      setUsers((prev) => {
        const updated = prev.filter((u) => u.id !== userId && u.name !== userName);
        if (typeof window !== "undefined") {
          localStorage.setItem("atv_users", JSON.stringify(updated));
        }
        return updated;
      });
    }
    if (showToast) {
      showToast(`✓ Đã xóa vĩnh viễn nhân sự "${userName || userId}"!`);
    }
  };

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

        {/* Quick Module Navigation Pills (All Modules accessible on phone) */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: "checklist", label: "Checklist" },
            { id: "projects", label: "Dự Án" },
            { id: "schedule", label: "Lịch Việc" },
            { id: "finance", label: "Thu Tiền" },
            { id: "logistics", label: "Kho PO" },
            { id: "hubspot_bi", label: "Báo Cáo BI" },
            { id: "tender", label: "Báo Giá Thầu" },
            { id: "dms", label: "Tài Liệu DMS" },
            { id: "bot", label: "Bot Báo Cáo" },
            { id: "users", label: "Nhân Sự" },
          ].map((m) => {
            const isTabActive = mobileTab === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMobileTab(m.id)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 transition active:scale-95 ${
                  isTabActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {m.label}
              </button>
            );
          })}
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
            {/* Overall All-Projects Progress Dashboard Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-4 rounded-2xl shadow-md border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400" /> Tiến Độ Toàn Bộ Dự Án
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {projects.length} Dự Án Trọng Điểm
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddProjectModal(true)}
                    className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tạo Dự Án</span>
                  </button>
                </div>
              </div>

              {/* Average BOM Progress Metric */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-3xl font-black text-white tracking-tight">
                    {averageBOMProgress}%
                  </div>
                  <span className="text-[11px] text-slate-300 font-medium">
                    Tỷ lệ hoàn thành BOM trung bình
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-400">
                    {projects.filter((p) => (checklists.find((c) => c.projectId === p.id)?.progress || p.checklistProgress || 0) >= 80).length}/{projects.length}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Sắp/Đã bàn giao
                  </span>
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="w-full bg-slate-700/60 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${averageBOMProgress}%` }}
                />
              </div>

              {/* Project Status Mini-Badges */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-[10px]">
                <div className="bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block font-semibold">Đang Thi Công</span>
                  <span className="font-black text-amber-400 text-xs">
                    {projects.filter((p) => p.stage === "installation" || p.stage === "delivery").length}
                  </span>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block font-semibold">Nghiệm Thu</span>
                  <span className="font-black text-purple-400 text-xs">
                    {projects.filter((p) => p.stage === "handover").length}
                  </span>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block font-semibold">Bảo Trì / Hoàn Tất</span>
                  <span className="font-black text-emerald-400 text-xs">
                    {projects.filter((p) => p.stage === "maintenance" || p.stage === "completed").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Search & Region Filter */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm dự án, khách hàng, mã HĐ, phụ trách..."
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
                    {r === "all" ? `Tất Cả (${projects.length})` : r === "HCM" ? "Miền Nam" : "Miền Bắc"}
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
                const chk = checklists.find((c) => c.projectId === p.id);
                const bomProgress = chk?.progress || p.checklistProgress || 0;
                const owner = p.dealOwner || p.leadSale || p.pm || p.pic || "Văn phòng Điều Hành";

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stageBadge.bg}`}>
                            {stageBadge.label}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {p.contractCode}
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 text-base mt-1 leading-snug">
                          {p.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">{p.customer}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                        {p.region === "HCM" ? "Miền Nam" : "Miền Bắc"}
                      </span>
                    </div>

                    {/* Progress Bar & Percentage */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Tiến độ BOM lắp đặt:
                        </span>
                        <span className={`font-black ${bomProgress >= 80 ? "text-emerald-600" : "text-blue-700"}`}>
                          {bomProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            bomProgress >= 80 ? "bg-emerald-600" : "bg-blue-600"
                          }`}
                          style={{ width: `${bomProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Financial Summary & Owner */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Giá trị HĐ:</span>
                        <span className="font-extrabold text-blue-900 text-sm">
                          {contractVal > 0 ? formatShortCurrency(contractVal) : "Đang lập giá"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Người phụ trách:</span>
                        <span className="font-bold text-slate-800 text-xs truncate block" title={owner}>
                          👤 {owner}
                        </span>
                      </div>
                    </div>

                    {/* Bàn giao MB date */}
                    <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                      <span className="text-[11px] text-slate-500">Dự kiến bàn giao MB:</span>
                      <span className="font-bold text-pink-700 text-xs">
                        {formatDate(p.handoverDate)}
                      </span>
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
                        <span>Gọi KTV/Sale</span>
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
                  <Calendar className="w-4 h-4 text-blue-600" /> Lịch Công Tác Vận Hành
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  Hôm nay: {todayFormatted}
                </span>
              </div>

              {/* View Mode Switcher: Theo Ngày vs Toàn Bộ Lịch Trình */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setScheduleViewMode("day")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    scheduleViewMode === "day"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Theo Ngày</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScheduleViewMode("all")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    scheduleViewMode === "all"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>Toàn Bộ ({allScheduleTasksGrouped.reduce((acc, g) => acc + g[1].length, 0)})</span>
                </button>
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

              {/* Date Selector Strip, Month Navigation & HTML5 Date Picker (Only in "day" mode) */}
              {scheduleViewMode === "day" && (
                <div className="space-y-2.5 pt-1.5 border-t border-slate-100">
                  {/* Month Navigation Strip: [ < ] Tháng 10/2026 [ > ] */}
                  <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = new Date(selectedScheduleDay);
                        cur.setMonth(cur.getMonth() - 1);
                        const y = cur.getFullYear();
                        const m = String(cur.getMonth() + 1).padStart(2, "0");
                        const d = String(Math.min(cur.getDate(), 28)).padStart(2, "0");
                        setSelectedScheduleDay(`${y}-${m}-${d}`);
                      }}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition flex items-center gap-0.5 text-xs font-bold"
                      title="Tháng trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-[10px]">Tháng trước</span>
                    </button>

                    <div className="text-center">
                      <span className="text-xs font-black text-slate-900 block">
                        Tháng {new Date(selectedScheduleDay).getMonth() + 1} / {new Date(selectedScheduleDay).getFullYear()}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">
                        Kéo / Bấm qua lại theo tháng
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const cur = new Date(selectedScheduleDay);
                        cur.setMonth(cur.getMonth() + 1);
                        const y = cur.getFullYear();
                        const m = String(cur.getMonth() + 1).padStart(2, "0");
                        const d = String(Math.min(cur.getDate(), 28)).padStart(2, "0");
                        setSelectedScheduleDay(`${y}-${m}-${d}`);
                      }}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition flex items-center gap-0.5 text-xs font-bold"
                      title="Tháng sau"
                    >
                      <span className="text-[10px]">Tháng sau</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* HTML5 Date Picker with quick jump */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      Chọn ngày cụ thể:
                    </span>
                    <input
                      type="date"
                      value={selectedScheduleDay}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedScheduleDay(e.target.value);
                        }
                      }}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-blue-600"
                    />
                  </div>

                  {/* Dynamic 7-day strip centered around the selected date */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block px-0.5">
                      Thanh ngày trong tuần (trượt / bấm để chọn):
                    </span>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {(() => {
                        const center = new Date(selectedScheduleDay);
                        const days = [];
                        const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                        // generate 7 days centered (3 before, center, 3 after)
                        for (let i = -3; i <= 3; i++) {
                          const dt = new Date(center);
                          dt.setDate(center.getDate() + i);
                          const iso = dt.toISOString().split("T")[0];
                          days.push({
                            date: iso,
                            label: dayNames[dt.getDay()],
                            day: dt.getDate(),
                          });
                        }
                        return days.map((d) => {
                          const isCurrent = d.date === selectedScheduleDay;
                          const isToday = d.date === todayISO;
                          return (
                            <button
                              key={d.date}
                              type="button"
                              onClick={() => setSelectedScheduleDay(d.date)}
                              className={`p-1.5 rounded-xl transition flex flex-col items-center active:scale-95 ${
                                isCurrent
                                  ? "bg-blue-600 text-white font-black shadow-xs ring-1 ring-blue-400"
                                  : isToday
                                  ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              <span className="text-[9px] uppercase font-bold">{d.label}</span>
                              <span className="text-xs font-black mt-0.5">{d.day}</span>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scheduled Tasks for Selected Day (Single Day Mode) */}
            {scheduleViewMode === "day" && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Công Việc Ngày {formatDate(selectedScheduleDay)} ({scheduleTasksForSelectedDay.length} việc):
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedScheduleDay(todayISO)}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Về hôm nay
                  </button>
                </div>

                {scheduleTasksForSelectedDay.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-1">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-sm text-slate-700">Không có lịch công tác ngày này</p>
                    <p className="text-xs text-slate-400">Chọn ngày khác trên thanh lịch tuần ở trên hoặc bấm &quot;Toàn Bộ&quot; để xem toàn thời gian.</p>
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
            )}

            {/* FULL TIMELINE (View All Dates Mode) */}
            {scheduleViewMode === "all" && (
              <div className="space-y-4">
                {allScheduleTasksGrouped.map(([dateKey, tasks]) => {
                  const filteredByRegion = tasks.filter(
                    (t) => selectedScheduleRegion === "all" || t.region === selectedScheduleRegion
                  );
                  if (filteredByRegion.length === 0) return null;

                  const isToday = dateKey === todayISO;

                  return (
                    <div key={dateKey} className="space-y-2">
                      <div className={`flex items-center justify-between px-2 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                        isToday ? "bg-blue-600 text-white shadow-xs" : "bg-slate-200 text-slate-700"
                      }`}>
                        <span>
                          {isToday ? "★ HÔM NAY - " : ""}{formatDate(dateKey)}
                        </span>
                        <span className="text-[10px] font-bold">
                          {filteredByRegion.length} việc
                        </span>
                      </div>

                      <div className="space-y-2 pl-1">
                        {filteredByRegion.map((task, idx) => {
                          const matchedProj = getTaskMatchedProject(task);
                          return (
                            <div
                              key={task.id || `${dateKey}-${idx}`}
                              className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                  {task.type === "handover" ? "Bàn giao MB" : "Lắp đặt / Kỹ thuật"}
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {task.region === "HCM" ? "Miền Nam" : "Miền Bắc"}
                                </span>
                              </div>
                              <h4 className="font-bold text-slate-900 text-xs">
                                {task.site}: {task.content}
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Phụ trách: <strong>{task.tech}</strong>
                              </p>
                              {matchedProj && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProjectId(matchedProj.id);
                                    setMobileTab("checklist");
                                    if (showToast) {
                                      showToast(`✓ Đã mở Checklist: ${matchedProj.name}`);
                                    }
                                  }}
                                  className="w-full text-left pt-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center justify-between"
                                >
                                  <span>Dự án: {matchedProj.name}</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {p.region === "HCM" ? "Miền Nam" : "Miền Bắc"}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {p.contractCode}
                              </span>
                            </div>
                            <h4 className="font-black text-slate-900 text-sm mt-1 leading-snug truncate">
                              {p.name}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium truncate">{p.customer}</p>
                            {/* Project Owner Display */}
                            <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium mt-0.5">
                              <span className="text-slate-400">Phụ trách:</span>
                              <strong className="text-blue-900 font-bold truncate">👤 {p.owner}</strong>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {isFullyPaid ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ✓ Đã Thu Đủ 100%
                              </span>
                            ) : p.isOverdue ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 animate-pulse">
                                ⚠ TRỄ HẠN: {p.overdueDays} NGÀY
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

        {/* ======================================================== */}
        {/* TAB 6: BÁO GIÁ & HỢP ĐỒNG THẦU (Tender / Quotations) */}
        {/* ======================================================== */}
        {mobileTab === "tender" && (
          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Báo Giá & Hợp Đồng Dự Án
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {tenders.length} Hồ Sơ
                </span>
              </div>

              {/* Search & Filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm gói thầu, mã HĐ, khách hàng..."
                  value={tenderSearch}
                  onChange={(e) => setTenderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-blue-600"
                />
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 text-xs">
                {[
                  { id: "all", label: `Tất cả (${tenders.length})` },
                  { id: "signed", label: "Đã Ký HĐ" },
                  { id: "bidding", label: "Đang Báo Giá" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTenderCategory(cat.id)}
                    className={`flex-1 py-1 rounded-xl font-bold text-[11px] transition ${
                      tenderCategory === cat.id
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tender Items List */}
            <div className="space-y-2.5">
              {tenders
                .filter((t) => {
                  if (tenderCategory === "signed" && t.status !== "signed" && t.status !== "won") return false;
                  if (tenderCategory === "bidding" && (t.status === "signed" || t.status === "won")) return false;
                  if (!tenderSearch) return true;
                  const q = tenderSearch.toLowerCase();
                  return (
                    (t.title && t.title.toLowerCase().includes(q)) ||
                    (t.contractCode && t.contractCode.toLowerCase().includes(q)) ||
                    (t.customer && t.customer.toLowerCase().includes(q))
                  );
                })
                .map((t) => {
                  const isWon = t.status === "signed" || t.status === "won";
                  return (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                isWon
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {isWon ? "✓ ĐÃ KÝ HỢP ĐỒNG" : "ĐANG LẬP BÁO GIÁ"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {t.contractCode || t.code}
                            </span>
                          </div>
                          <h4 className="font-black text-slate-900 text-sm mt-1 leading-snug">
                            {t.title || t.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">{t.customer}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Giá trị trước thuế:</span>
                          <span className="font-extrabold text-blue-900 text-sm">
                            {formatCurrency(t.valueBeforeVat || t.totalAmount || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Người phụ trách:</span>
                          <span className="font-bold text-slate-700 text-xs truncate block">
                            👤 {t.leadSale || t.owner || "Sales Dept"}
                          </span>
                        </div>
                      </div>

                      {t.projectId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProjectId(t.projectId);
                            setMobileTab("checklist");
                            if (showToast) {
                              showToast(`✓ Đã liên kết dự án: ${t.title || t.contractCode}`);
                            }
                          }}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-between border border-blue-200 transition active:scale-95"
                        >
                          <span className="flex items-center gap-1.5">
                            <FolderGit2 className="w-3.5 h-3.5" />
                            <span>Mở Checklist Công Trình</span>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: KHO TÀI LIỆU (DMS Document Management) */}
        {/* ======================================================== */}
        {mobileTab === "dms" && (
          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" /> Kho Tài Liệu Số (DMS)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {dmsDocuments.length} Văn Bản
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm tài liệu, hợp đồng, biên bản..."
                  value={dmsSearch}
                  onChange={(e) => setDmsSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-blue-600"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "all", label: "Tất Cả" },
                  { id: "contract", label: "Hợp Đồng" },
                  { id: "handover", label: "Biên Bản Bàn Giao" },
                  { id: "drawing", label: "Bản Vẽ Layout" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setDmsCategory(c.id)}
                    className={`px-3 py-1 rounded-xl font-bold text-[11px] whitespace-nowrap transition ${
                      dmsCategory === c.id
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* DMS List */}
            <div className="space-y-2.5">
              {dmsDocuments
                .filter((doc) => {
                  if (dmsCategory !== "all" && doc.category !== dmsCategory) return false;
                  if (!dmsSearch) return true;
                  const q = dmsSearch.toLowerCase();
                  return (
                    (doc.title && doc.title.toLowerCase().includes(q)) ||
                    (doc.project && doc.project.toLowerCase().includes(q)) ||
                    (doc.code && doc.code.toLowerCase().includes(q))
                  );
                })
                .map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                            {doc.category || "Hồ sơ"}
                          </span>
                          <h4 className="font-black text-slate-900 text-xs mt-0.5 leading-snug">
                            {doc.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            {doc.project} • {doc.size || "1.2 MB"} • {doc.date || "20/10/2026"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          if (showToast) showToast(`✓ Đang mở xem tài liệu: ${doc.title}`);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem Tài Liệu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (showToast) showToast(`✓ Đã tải xuống file: ${doc.title}`);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600" />
                        <span>Tải</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: BOT BÁO CÁO (Telegram Alert & Automation Bot) */}
        {/* ======================================================== */}
        {mobileTab === "bot" && (
          <div className="space-y-3">
            {/* Telegram Bot Status Card */}
            <div className="bg-gradient-to-br from-sky-600 to-blue-800 text-white p-4 rounded-2xl shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">Attivo Ops Telegram Bot</h3>
                    <p className="text-[11px] text-sky-100">Kênh Báo Cáo Điều Hành Trực Tuyến</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400 text-slate-900 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-ping" /> ONLINE
                </span>
              </div>

              <div className="bg-white/10 p-2.5 rounded-xl border border-white/20 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-sky-200">Bot Username:</span>
                  <span className="font-mono font-bold text-white">@AttivoOperationsBot</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-200">Kênh Điều Hành:</span>
                  <span className="font-bold text-white">Attivo BOD & Site Leads</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-200">Tần Suất Báo Cáo:</span>
                  <span className="font-bold text-emerald-300">08:00 AM & 17:00 PM Mỗi Ngày</span>
                </div>
              </div>

              {/* Broadcast Trigger */}
              <button
                type="button"
                onClick={() => {
                  setBotBroadcastSent(true);
                  if (showToast) {
                    showToast("✓ Đã bắn báo cáo nhanh qua Telegram Bot cho Ban Giám Đốc & KTV!");
                  }
                  setTimeout(() => setBotBroadcastSent(false), 3000);
                }}
                disabled={botBroadcastSent}
                className="w-full py-2.5 px-3 rounded-xl bg-white text-blue-900 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition disabled:opacity-75"
              >
                <Send className="w-4 h-4 text-blue-600" />
                <span>{botBroadcastSent ? "✓ Đã Bắn Báo Cáo Thành Công!" : "Bắn Báo Cáo Nhanh Điểm Nóng"}</span>
              </button>
            </div>

            {/* Recent Live Alert Feed */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Cảnh Báo & Tin Tức Vận Hành Mới Nhất:
              </span>

              <div className="space-y-2">
                {[
                  {
                    title: "⚠ Báo cáo thiếu linh kiện: Cà Na Tây Ninh",
                    desc: "Thiếu 4 x Cáp kéo chịu lực Skelcore & 2 x Tạ miếng 20kg. Đã gửi đề xuất bù hàng về kho Bình Dương.",
                    time: "10:15 Sáng nay",
                    badge: "bg-rose-50 text-rose-700 border-rose-200",
                  },
                  {
                    title: "✓ Nghiệm thu hoàn tất: Skelcore Fit Bà Rịa",
                    desc: "Khách hàng đã ký biên bản bàn giao MB sạch sẽ, sẵn sàng quay clip marketing.",
                    time: "Hôm qua",
                    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  },
                  {
                    title: "💰 Thông báo thu hồi công nợ: Fullton Fitness",
                    desc: "Kế toán đã nhận đợt thanh toán 250.000.000 VNĐ qua ngân hàng Vietcombank.",
                    time: "Hôm qua",
                    badge: "bg-blue-50 text-blue-700 border-blue-200",
                  },
                ].map((msg, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${msg.badge}`}>
                        {msg.title.split(":")[0]}
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.time}</span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs">{msg.title}</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{msg.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: BÁO CÁO TOÀN PHÒNG BAN & HUBSPOT BI */}
        {/* ======================================================== */}
        {mobileTab === "hubspot_bi" && (
          <div className="space-y-3">
            {/* Header banner */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-4 rounded-2xl shadow-md border border-indigo-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-400" /> Báo Cáo Phòng Ban & HubSpot BI
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Portal 19642405
                </span>
              </div>

              <div>
                <h3 className="font-black text-base text-white">HubSpot Cross-Department BI</h3>
                <p className="text-xs text-indigo-200 mt-0.5 leading-relaxed">
                  Kết hợp báo cáo vận hành dự án thực tế với 5 Dashboard chính thức của HubSpot.
                </p>
              </div>

              {/* Department quick jump pills */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-xs border border-white/10">
                  <span className="text-[10px] text-indigo-200 block">Doanh thu Deals:</span>
                  <span className="text-sm font-black text-emerald-300">
                    {formatShortCurrency(projects.reduce((acc, p) => acc + (p.hubspotDeal?.amount || 0), 0))}
                  </span>
                </div>
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-xs border border-white/10">
                  <span className="text-[10px] text-indigo-200 block">Tickets Bảo Trì:</span>
                  <span className="text-sm font-black text-amber-300">
                    {hubspotTickets.length || 6} Tickets AT
                  </span>
                </div>
              </div>
            </div>

            {/* 5 HubSpot Live Dashboards Direct Links Cards */}
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block px-1">
                5 Dashboard HubSpot Phòng Ban (Mở 1-Chạm):
              </span>

              {Object.entries(HUBSPOT_DASHBOARD_URLS).map(([key, db]) => (
                <div
                  key={key}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${db.color}`}>
                          {db.dept}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          ID: {db.id}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 text-xs mt-1 leading-snug">
                        {db.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                        {db.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">HubSpot Portal 19642405</span>
                    <a
                      href={db.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs flex items-center gap-1 border border-orange-200 active:scale-95 transition"
                    >
                      <span>Mở Dashboard Gốc</span>
                      <ExtLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* In-app Department Summary Breakdown */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600" /> Báo Cáo Chuyển Đổi Phòng Ban Attivo
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">1. Marketing Lead Gen</span>
                    <span className="text-[10px] text-slate-500">Contact Channels: Facebook, Google, Hotline</span>
                  </div>
                  <span className="font-black text-emerald-700 text-xs">
                    {projects.filter((p) => p.hubspotDeal?.source === "Marketing").length} Deals Mkt
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">2. Kinh Doanh (Sales Reps)</span>
                    <span className="text-[10px] text-slate-500">Loại bỏ kỹ thuật/CS theo SOP chuẩn</span>
                  </div>
                  <span className="font-black text-blue-700 text-xs">
                    {projects.filter((p) => p.hubspotDeal?.source !== "Marketing").length} Deals Direct
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">3. Kỹ Thuật (AT Technical Dept)</span>
                    <span className="text-[10px] text-slate-500">SLA bảo trì máy gym & kiểm hàng BOM</span>
                  </div>
                  <span className="font-black text-purple-700 text-xs">
                    100% Phủ 8 Dự Án
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">4. Kho Vận & Thu Mua (Logistics)</span>
                    <span className="text-[10px] text-slate-500">Kho Bình Dương & Đông Anh</span>
                  </div>
                  <span className="font-black text-amber-700 text-xs">
                    14 PO Nhập Khẩu
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 9: PHÂN QUYỀN & NHÂN SỰ (Staff & User Management) */}
        {/* ======================================================== */}
        {mobileTab === "users" && (
          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" /> Danh Sách Nhân Sự & Phân Quyền
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {users.length} Tài Khoản
                </span>
              </div>

              {/* Search user */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm nhân sự theo tên, email, vai trò..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-blue-600"
                />
              </div>
            </div>

            {/* Users list */}
            <div className="space-y-2.5">
              {users
                .filter((u) => {
                  if (!userSearch) return true;
                  const q = userSearch.toLowerCase();
                  return (
                    (u.name && u.name.toLowerCase().includes(q)) ||
                    (u.email && u.email.toLowerCase().includes(q)) ||
                    (u.role && u.role.toLowerCase().includes(q))
                  );
                })
                .map((u) => {
                  const roleObj = roles.find((r) => r.id === u.role);
                  const isCurrent = currentUser?.id === u.id;

                  return (
                    <div
                      key={u.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center shrink-0">
                            {u.name?.charAt(0) || "U"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-black text-slate-900 text-xs truncate">{u.name}</h4>
                              {isCurrent && (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium truncate">{u.email}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                          {roleObj?.name || u.role}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          u.status === "active" ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"
                        }`}>
                          ● {u.status === "active" ? "Đang hoạt động" : "Đã khóa"}
                        </span>

                        {/* Instant Delete Button for User */}
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUserMobile(u.id, u.name)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 border border-rose-200 active:scale-95 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Xóa Nhân Sự</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
          { id: "more", label: "Thêm ▾", icon: MoreHorizontal, isMoreTrigger: true },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = mobileTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.isMoreTrigger) {
                  setShowMoreDrawer(true);
                } else {
                  setMobileTab(item.id);
                }
              }}
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

      {/* "Thêm..." More Modules Bottom Sheet Drawer */}
      {showMoreDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in">
          <div className="bg-white rounded-t-3xl p-4 w-full max-w-md space-y-3 shadow-2xl border-t border-slate-200 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <Menu className="w-4 h-4 text-blue-600" /> Tất Cả Phân Hệ Attivo Mobile
              </h3>
              <button
                type="button"
                onClick={() => setShowMoreDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {[
                { id: "checklist", label: "Checklist Lắp Đặt", icon: ClipboardCheck, desc: "Trạm KTV hiện trường" },
                { id: "projects", label: "Tiến Độ Dự Án", icon: FolderGit2, desc: "BOM & Bàn giao MB" },
                { id: "schedule", label: "Lịch Vận Hành", icon: Calendar, desc: "Lịch tuần & toàn bộ" },
                { id: "finance", label: "Thu Tiền & Nợ", icon: DollarSign, desc: "Công nợ & hạn nợ" },
                { id: "logistics", label: "Kho PO & Cont", icon: Ship, desc: "Kho BD, ĐA & bù hàng" },
                { id: "hubspot_bi", label: "Báo Cáo HubSpot BI", icon: BarChart3, desc: "5 Dashboard phòng ban" },
                { id: "tender", label: "Báo Giá Thầu", icon: FileSpreadsheet, desc: "Hợp đồng & hồ sơ giá" },
                { id: "dms", label: "Kho Tài Liệu DMS", icon: FileText, desc: "Văn bản, BB bàn giao" },
                { id: "bot", label: "Bot Báo Cáo", icon: Bot, desc: "Telegram Hub & cảnh báo" },
                { id: "users", label: "Nhân Sự & Quyền", icon: Users, desc: "Danh sách & xóa tài khoản" },
              ].map((m) => {
                const MIcon = m.icon;
                const isCur = mobileTab === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMobileTab(m.id);
                      setShowMoreDrawer(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition active:scale-95 space-y-1 ${
                      isCur
                        ? "bg-blue-50 border-blue-500 ring-1 ring-blue-400"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <MIcon className={`w-5 h-5 ${isCur ? "text-blue-600" : "text-slate-600"}`} />
                      {isCur && <span className="text-[9px] font-black text-blue-600">● Đang mở</span>}
                    </div>
                    <div className="font-black text-xs text-slate-900">{m.label}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{m.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
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

      {/* Quick Add Project Modal (Mobile) */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm max-h-[90vh] overflow-y-auto space-y-3 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-600" /> Tạo Dự Án Mới
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProjectModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMobileProject.name.trim() || !setProjects) return;

                const newId = `PRJ-${Date.now().toString().slice(-3)}`;
                const createdProj = {
                  id: newId,
                  ...newMobileProject,
                  checklistComplete: false,
                  checklistProgress: 0,
                  designer2D: "Lý",
                  designer3D: "Lý",
                  activityComments: [
                    {
                      id: `cmt-${Date.now()}`,
                      author: newMobileProject.leadSale,
                      role: "Chuyên viên Dự án",
                      time: "Vừa xong",
                      text: "Dự án mới khởi tạo từ điện thoại. Đã thiết lập thông tin cơ sở và tiến độ sơ bộ.",
                    },
                  ],
                };

                // Add to projects list
                setProjects((prev) => [createdProj, ...prev]);

                // Also initialize a default checklist if setChecklists is provided
                if (setChecklists) {
                  const defaultChecklist = {
                    projectId: newId,
                    projectName: createdProj.name,
                    contractCode: createdProj.contractCode || `ATVE-${newId}`,
                    verifier: "Lương Nguyễn Tuấn Anh (KTV)",
                    inspectionDate: todayISO,
                    status: "warning",
                    summary: "Dự án mới khởi tạo. Cần hoàn tất đặt xe, kiểm tra điện áp và BOM linh kiện.",
                    items: [
                      { id: "CK-01", name: "[Đặt xe] Xe tải & đăng ký bốc xếp", orderedQty: 1, receivedQty: 1, unit: "Chuyến", status: "pass", category: "sop_docs" },
                      { id: "CK-02", name: "[COCQ] Chứng nhận xuất xứ CO/CQ", orderedQty: 1, receivedQty: 1, unit: "Bộ", status: "pass", category: "sop_docs" },
                      { id: "CK-03", name: "[Khảo sát] Kiểm tra mặt bằng & nguồn điện", orderedQty: 1, receivedQty: 1, unit: "Hạng mục", status: "pass", category: "site_prep" },
                      { id: "CK-04", name: "Bộ máy tập chính hãng", orderedQty: 4, receivedQty: 4, unit: "Bộ", status: "pass", category: "equipment_bom" },
                      { id: "CK-05", name: "[Bàn giao] Biên bản nghiệm thu kỹ thuật", orderedQty: 1, receivedQty: 0, unit: "Bộ", status: "shortage", category: "handover" },
                    ],
                  };
                  setChecklists((prev) => [defaultChecklist, ...prev]);
                }

                // Also initialize a default Tender / Quotation if setTenders is provided
                if (setTenders) {
                  const isContract = Boolean(createdProj.contractCode);
                  const tenderToAdd = {
                    id: Date.now(),
                    projectId: newId,
                    contractCode: createdProj.contractCode || "",
                    project: `${createdProj.contractCode ? createdProj.contractCode + " - " : ""}${createdProj.name}`,
                    note: createdProj.brand || "Precor",
                    type: isContract ? "Contract" : "Quotation",
                    valueBeforeVat: 0,
                    status: "New",
                    subType: createdProj.type || "Báo giá thiết bị",
                  };
                  setTenders((prev) => [tenderToAdd, ...(prev || [])]);
                }

                setShowAddProjectModal(false);
                setSelectedProjectId(newId);
                if (showToast) showToast(`✓ Đã tạo thành công dự án: ${createdProj.name} & gói thầu liên kết`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-slate-700 block mb-1 font-bold">Tên Dự Án *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Pilates Master Thảo Điền"
                  value={newMobileProject.name}
                  onChange={(e) => setNewMobileProject({ ...newMobileProject, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Khách Hàng</label>
                  <input
                    type="text"
                    placeholder="VD: Ms. Mai"
                    value={newMobileProject.customer}
                    onChange={(e) => setNewMobileProject({ ...newMobileProject, customer: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Số Điện Thoại</label>
                  <input
                    type="text"
                    placeholder="VD: 0909123456"
                    value={newMobileProject.contact}
                    onChange={(e) => setNewMobileProject({ ...newMobileProject, contact: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Địa Chỉ Công Trình</label>
                <input
                  type="text"
                  placeholder="Số nhà, đường, phường, quận/tỉnh..."
                  value={newMobileProject.address}
                  onChange={(e) => setNewMobileProject({ ...newMobileProject, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Thương Hiệu</label>
                  <select
                    value={newMobileProject.brand}
                    onChange={(e) => setNewMobileProject({ ...newMobileProject, brand: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Merrithew">Merrithew</option>
                    <option value="Precor">Precor</option>
                    <option value="InBody">InBody</option>
                    <option value="ZIVA">ZIVA</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Khu Vực</label>
                  <select
                    value={newMobileProject.region}
                    onChange={(e) => setNewMobileProject({ ...newMobileProject, region: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="HCM">Miền Nam (HCM)</option>
                    <option value="HN">Miền Bắc (HN)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Mã Hợp Đồng</label>
                  <input
                    type="text"
                    placeholder="VD: ATVE26099"
                    value={newMobileProject.contractCode}
                    onChange={(e) => setNewMobileProject({ ...newMobileProject, contractCode: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Chuyên Viên Sale</label>
                  <select
                    value={newMobileProject.leadSale}
                    onChange={(e) => setNewMobileProject({ ...newMobileProject, leadSale: e.target.value, dealOwner: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Hoài Trịnh">Hoài Trịnh</option>
                    <option value="Khánh Nguyễn">Khánh Nguyễn</option>
                    <option value="Phương Thảo">Phương Thảo</option>
                    <option value="Linh Nguyễn">Linh Nguyễn</option>
                    <option value="Vy Nguyễn">Vy Nguyễn</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Giai Đoạn</label>
                  <select
                    value={newMobileProject.stage}
                    onChange={(e) => setNewMobileProject({ ...newMobileProject, stage: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="site_prep">Khảo Sát Mặt Bằng</option>
                    <option value="delivery">Giao Hàng</option>
                    <option value="installation">Lắp Đặt</option>
                    <option value="handover">Nghiệm Thu</option>
                    <option value="maintenance">Bảo Trì</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Tiến Độ (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newMobileProject.progress}
                    onChange={(e) => setNewMobileProject({ ...newMobileProject, progress: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-4 h-4" /> Tạo Dự Án
                </button>
              </div>
            </form>
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
