import React, { useState, useMemo } from "react";
import {
  FolderGit2,
  Ship,
  Camera,
  ClipboardCheck,
  Wrench,
  FileSpreadsheet,
  Palette,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Calendar,
  ArrowRight,
  Plane,
  Anchor,
  GitCommit,
  FolderOpen,
  Link2,
  ExternalLink,
  ShieldCheck,
  Truck,
  Target,
  UserCheck,
  CalendarRange,
  Star,
  Copy,
  DollarSign,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  formatDate,
  formatCurrency,
  formatShortCurrency,
  getWarehouseBadge,
  getShortageBadge,
} from "../utils/formatters";
import { getShareableLink, copyToClipboard } from "../utils/navigation";
import { estimateShipmentLeadTime, estimateTicketCompletion } from "../utils/slaEstimator";

export default function MasterOperationsMatrix({
  projects,
  _setProjects,
  shipments,
  checklists,
  schedule,
  tenders,
  designTasks,
  onNavigateTab,
  onOpenChecklist,
  showToast,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "in_progress" | "completed"
  const [expandedProjectId, setExpandedProjectId] = useState("PRJ-001");
  const [isCompactView, setIsCompactView] = useState(true);
  const [showTodayHotspots, setShowTodayHotspots] = useState(false);

  // Helper: Kiểm tra dự án đã xong / hoàn thành bàn giao
  const isProjectCompleted = (p) => {
    if (!p) return false;
    return (
      p.stage === "completed" ||
      p.stage === "accepted" ||
      p.stage === "handover" ||
      p.checklistComplete === true ||
      (p.progress ?? p.checklistProgress ?? 0) >= 100
    );
  };

  const getStageBadge = (project, data, isCompleted) => {
    if (isCompleted) {
      return {
        label: "Đã Hoàn Thành",
        dot: "bg-emerald-500",
        style: "bg-emerald-50/90 text-emerald-700 border-emerald-200/80 font-medium",
      };
    }
    if (project.marketingReady) {
      return {
        label: "Sẵn Sàng Quay",
        dot: "bg-pink-500",
        style: "bg-pink-50/90 text-pink-700 border-pink-200/80 font-medium",
      };
    }
    if (project.stage === "installation") {
      return {
        label: "Đang Lắp Đặt",
        dot: "bg-cyan-500",
        style: "bg-cyan-50/90 text-cyan-700 border-cyan-200/80 font-medium",
      };
    }
    if (
      data.relatedShipment &&
      (data.relatedShipment.status === "shipping" || data.relatedShipment.status === "customs")
    ) {
      return {
        label: "Hàng Đang Về",
        dot: "bg-blue-500",
        style: "bg-blue-50/90 text-blue-700 border-blue-200/80 font-medium",
      };
    }
    if (data.designTask && data.designTask.progressPercent < 100) {
      return {
        label: "Đang Thiết Kế",
        dot: "bg-purple-500",
        style: "bg-purple-50/90 text-purple-700 border-purple-200/80 font-medium",
      };
    }
    if (project.stage === "contract" || project.stage === "tender") {
      return {
        label: "Báo Giá & Ký HĐ",
        dot: "bg-amber-500",
        style: "bg-amber-50/90 text-amber-700 border-amber-200/80 font-medium",
      };
    }
    return {
      label: "Đang Triển Khai",
      dot: "bg-slate-400",
      style: "bg-slate-50 text-slate-700 border-slate-200/80 font-medium",
    };
  };

  const completedProjectsCount = useMemo(
    () => projects.filter(isProjectCompleted).length,
    [projects]
  );
  const inProgressProjectsCount = projects.length - completedProjectsCount;

  // Helper to cross-reference data across departments for a project

  const getProjectComprehensiveData = (project) => {
    // 1. Design & Sales
    const designTask = designTasks.find(
      (dt) =>
        dt.projectName.toLowerCase().includes(project.name.toLowerCase()) ||
        project.name.toLowerCase().includes(dt.projectName.toLowerCase())
    );

    // 2. Tender
    const tender = tenders.find(
      (t) =>
        t.project.toLowerCase().includes(project.name.toLowerCase()) ||
        project.name.toLowerCase().includes(t.project.toLowerCase()) ||
        (t.note && project.brand && t.note.toLowerCase().includes(project.brand.toLowerCase()))
    );

    // 3. Logistics / Shipments
    const relatedShipment = shipments.find(
      (s) =>
        s.projects.some(
          (p) =>
            p.toLowerCase().includes(project.name.toLowerCase()) ||
            project.name.toLowerCase().includes(p.toLowerCase())
        ) ||
        (project.contractCode && s.poCode && project.contractCode.includes(s.poCode))
    );

    // 4. Checklist
    const checklist = checklists.find((c) => c.projectId === project.id);

    // 5. Tech Schedule tasks (HN or HCM)
    const allTasks = [
      ...schedule.HCM.flatMap((d) => d.tasks.map((t) => ({ ...t, day: d.day, date: d.date, region: "HCM" }))),
      ...schedule.HN.flatMap((d) => d.tasks.map((t) => ({ ...t, day: d.day, date: d.date, region: "HN" }))),
    ];
    const techTask = allTasks.find(
      (t) =>
        t.site.toLowerCase().includes(project.name.toLowerCase()) ||
        project.name.toLowerCase().includes(t.site.toLowerCase()) ||
        (project.contractCode && t.content && t.content.includes(project.contractCode))
    );

    let health = "green";
    let bottleneckMessage = "Tiến độ bình thường";

    if (relatedShipment && relatedShipment.shortageStatus !== "normal") {
      health = "orange";
      bottleneckMessage =
        relatedShipment.shortageStatus === "vendor_shortage"
          ? "Hãng xuất thiếu phụ kiện"
          : "Nội bộ order thiếu (Đang đặt bù)";
    } else if (checklist && checklist.status === "warning") {
      health = "orange";
      bottleneckMessage = "Checklist công trình còn thiếu linh kiện";
    } else if (checklist && checklist.status === "missing") {
      health = "red";
      bottleneckMessage = "Chưa đủ hàng để bàn giao lắp đặt";
    } else if (project.marketingReady) {
      health = "pink";
      bottleneckMessage = "Mặt bằng chuẩn bị bàn giao - Chờ Marketing chụp";
    } else if (project.stage === "installation") {
      health = "cyan";
      bottleneckMessage = "Đang tiến hành lắp đặt máy";
    }

    return {
      designTask,
      tender,
      relatedShipment,
      checklist,
      techTask,
      health,
      bottleneckMessage,
    };
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const data = getProjectComprehensiveData(project);

    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.contractCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (data.relatedShipment && data.relatedShipment.poCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRegion = regionFilter === "all" || project.region === regionFilter;

    const isCompleted = isProjectCompleted(project);

    let matchesDept = true;
    if (departmentFilter === "completed") {
      matchesDept = isCompleted;
    } else if (departmentFilter === "in_progress") {
      matchesDept = !isCompleted;
    } else if (departmentFilter === "marketing_ready") {
      matchesDept = project.marketingReady;
    } else if (departmentFilter === "installation") {
      matchesDept = project.stage === "installation";
    } else if (departmentFilter === "shortage") {
      matchesDept =
        (data.relatedShipment && data.relatedShipment.shortageStatus !== "normal") ||
        (data.checklist && data.checklist.status !== "ready");
    } else if (departmentFilter === "shipping") {
      matchesDept =
        data.relatedShipment &&
        (data.relatedShipment.status === "shipping" || data.relatedShipment.status === "customs");
    } else if (departmentFilter === "maintenance") {
      matchesDept = Boolean(data.techTask) || project.stage === "maintenance";
    } else if (departmentFilter === "design") {
      matchesDept = Boolean(data.designTask) || project.stage === "design";
    } else if (departmentFilter === "vip") {
      matchesDept = Boolean(project.isVip);
    } else if (departmentFilter === "signal") {
      matchesDept = Boolean(project.signalSale);
    }

    let matchesStatus = true;
    if (statusFilter === "completed") {
      matchesStatus = isCompleted;
    } else if (statusFilter === "in_progress") {
      matchesStatus = !isCompleted;
    }

    return matchesSearch && matchesRegion && matchesDept && matchesStatus;
  });

  // Reusable & structured expanded drawer for project deep dive
  const renderProjectExpandedDrawer = (project, data, isCompleted, colSpan) => {
    const contractValue =
      project.hubspotDeal?.amount ||
      data.tender?.valueBeforeVat ||
      project.totalContractValue ||
      0;

    return (
      <tr className="bg-slate-50/80 border-b border-slate-200">
        <td colSpan={colSpan} className="p-4 sm:p-5">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
            {/* Header info & Fast actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    HỒ SƠ ĐIỀU HÀNH DỰ ÁN
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {project.contractCode}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  {project.name} • <span className="text-slate-500 font-normal">{project.address}</span>
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onOpenChecklist(project.id)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Mở Checklist BOM Đúng/Đủ</span>
                </button>
                <button
                  onClick={() => onNavigateTab("logistics")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs flex items-center gap-1.5 border border-slate-200 transition font-medium cursor-pointer"
                >
                  <Ship className="w-4 h-4 text-blue-600" />
                  <span>Tra Cứu PO & Kho</span>
                </button>
                <button
                  onClick={() => onNavigateTab("projects", { id: project.id })}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs flex items-center gap-1.5 border border-blue-200 transition font-bold cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Trang Chi Tiết</span>
                </button>
              </div>
            </div>

            {/* Completed Project Verification Ribbon */}
            {isCompleted && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-2xs">
                <div className="flex items-start sm:items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5 sm:mt-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-black text-emerald-950 text-xs">
                      ✓ DỰ ÁN ĐÃ BÀN GIAO CHÍNH THỨC & 100% NGHIỆM THU ĐẠT
                    </div>
                    <p className="text-emerald-800 text-[11px] mt-0.5">
                      Biên bản bàn giao & nghiệm thu (BBGH/NT) đã hoàn tất ký 3 bên (Attivo - Chủ đầu tư - Tổng thầu). Ngày bàn giao: <strong>{formatDate(project.handoverDate || project.endDate)}</strong>. Đưa vào vận hành và duy trì bảo hành định kỳ SLA 24/7.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white text-[11px] font-black rounded-lg shrink-0 self-start sm:self-auto shadow-2xs">
                  ✓ HOÀN THÀNH 100%
                </span>
              </div>
            )}

            {/* 4 Clean Strategic Section Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Card 1: Khách Hàng, Thương Mại & HubSpot */}
              <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-blue-800 font-bold border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-600" /> 1. Khách Hàng & HĐ
                  </span>
                  <span className="font-mono text-slate-900 font-bold">
                    {contractValue ? formatShortCurrency(contractValue) : "—"}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-600 text-[11px]">
                    Sale: <strong className="text-slate-900">{project.dealOwner || project.leadSale || "KDDA"}</strong>
                  </div>
                  <div className="text-slate-600 text-[11px] truncate" title={project.customer}>
                    CĐT: <span className="font-medium text-slate-800">{project.customer}</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Giá trị: <strong className="font-mono text-slate-900">{contractValue ? formatCurrency(contractValue) : "Chưa chốt"}</strong>
                  </div>
                  {project.hubspotDeal && (
                    <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 truncate max-w-[130px]">HubSpot: {project.hubspotDeal.stage}</span>
                      <a
                        href={project.hubspotDeal.hubspotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-700 hover:text-orange-900 font-bold text-[10px] flex items-center gap-0.5"
                      >
                        <Link2 className="w-3 h-3" /> CRM
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Thiết Kế 2D/3D & Hồ Sơ DMS (Lý) */}
              <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-purple-800 font-bold border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-purple-600" /> 2. Thiết Kế & DMS
                  </span>
                  <span className="text-purple-700 font-bold">{data.designTask?.progressPercent || 100}%</span>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-600 text-[11px]">
                    KTS: <strong className="text-slate-900">{project.designer2D || "Lý"}</strong> (2D CAD & 3D Render)
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Tiến độ: 2D {data.designTask?.stage2D === "completed" ? "✓ Xong" : "Đang vẽ"} • 3D {data.designTask?.stage3D === "completed" ? "✓ Xong" : "Render"}
                  </div>
                  <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">DMS: {project.dmsDocuments?.length || 0} files</span>
                    <button
                      onClick={() => onNavigateTab("dms")}
                      className="text-blue-700 hover:text-blue-900 font-bold text-[10px] flex items-center gap-0.5"
                    >
                      <FolderOpen className="w-3 h-3" /> Mở Kho DMS
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: Hàng Hóa & Kho Vận PO */}
              <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-blue-800 font-bold border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Ship className="w-4 h-4 text-blue-600" /> 3. Hàng Hóa & Kho PO
                  </span>
                  <span className="text-slate-700 font-bold">
                    {data.relatedShipment?.warehouse ? `Kho ${data.relatedShipment.warehouse}` : "Tại kho"}
                  </span>
                </div>
                <div className="space-y-1">
                  {data.relatedShipment ? (
                    <>
                      <div className="text-slate-600 text-[11px]">
                        PO: <strong className="font-mono text-slate-900">{data.relatedShipment.poCode}</strong> ({data.relatedShipment.brand})
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        ETA: <strong className="text-slate-900">{formatDate(data.relatedShipment.eta)}</strong> ({data.relatedShipment.method})
                      </div>
                      {data.relatedShipment.shortageStatus !== "normal" ? (
                        <div className="text-[10px] font-bold text-amber-800 bg-amber-50 p-1 rounded border border-amber-200">
                          ⚠️ {data.relatedShipment.shortageDetail || "Hãng xuất thiếu linh kiện"}
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-700 font-semibold">✓ Đơn hàng đầy đủ & đúng lịch</div>
                      )}
                    </>
                  ) : (
                    <div className="text-slate-500 text-[11px] py-1">
                      Thiết bị đã sẵn sàng tại kho công ty.
                    </div>
                  )}
                </div>
              </div>

              {/* Card 4: Kỹ Thuật, Hiện Trường & Nghiệm Thu */}
              <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-cyan-900 font-bold border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5">
                    <ClipboardCheck className="w-4 h-4 text-cyan-700" /> 4. Hiện Trường & NT
                  </span>
                  <span className="text-cyan-800 font-bold">
                    {isCompleted ? "100% Đạt" : data.checklist?.status === "ready" ? "✓ Đủ BOM" : "Đang kiểm đếm"}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-600 text-[11px]">
                    KTV: <strong className="text-slate-900">{project.deliveryTicket?.assignedTech || project.assignedTech || "Đội KTV"}</strong>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Bàn giao: <strong>{formatDate(project.handoverDate || project.endDate)}</strong>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    BBGH/NT: <span className="font-semibold text-slate-800">{isCompleted ? "Đã ký 3 bên" : "Chờ nghiệm thu site"}</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Bảo hành: <span className="font-semibold text-emerald-700">Tem QR Active (SLA 24/7)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-5 w-full">
      {/* Executive Command Header (Premium SaaS Page Header) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Tiến Độ Dự Án
              </h1>
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/80 tabular-nums">
                {projects.length} Dự Án
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi chu trình thực thi: Thiết kế 2D/3D • Báo giá • Nhập kho • Lắp đặt & Bàn giao
            </p>
          </div>
        </div>

        {/* Quick Navigation Shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => onNavigateTab("gantt")}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition cursor-pointer border border-slate-200/90 shadow-2xs hover:text-slate-900"
          >
            <CalendarRange className="w-3.5 h-3.5 text-slate-500" /> Biểu Đồ Gantt
          </button>
          <button
            onClick={() => onNavigateTab("flow")}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition cursor-pointer border border-slate-200/90 shadow-2xs hover:text-slate-900"
          >
            <GitCommit className="w-3.5 h-3.5 text-slate-500" /> Chu Trình 9 Bước
          </button>
          <button
            onClick={() => onNavigateTab("dms")}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition cursor-pointer border border-slate-200/90 shadow-2xs hover:text-slate-900"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-500" /> Kho DMS
          </button>
          <button
            onClick={() => onNavigateTab("hubspot")}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition cursor-pointer border border-slate-200/90 shadow-2xs hover:text-slate-900"
          >
            <Link2 className="w-3.5 h-3.5 text-slate-500" /> HubSpot CRM
          </button>
          <button
            onClick={() => onNavigateTab("finance")}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs tabular-nums"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Thu Tiền: 2.457 Tỷ
          </button>
        </div>
      </div>

      {/* Today's Operational Hotspot Summary (Subtle SaaS Status Ticker) */}
      <div className="bg-white border border-slate-200/90 py-2 px-3.5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-md font-semibold text-[11px] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Hôm nay
          </span>
          <p className="text-slate-600 text-xs truncate">
            <span className="font-semibold text-slate-800">Tiêu điểm vận hành:</span> Lắp đặt ISH KOMPAN (HCM) • Thay màn hình Hilton (HN) • Pick hàng Skelcore • Thu tiền tuần 2.457 Tỷ
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowTodayHotspots(!showTodayHotspots)}
            className="text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition cursor-pointer flex items-center gap-1"
          >
            <span>{showTodayHotspots ? "Thu gọn" : "Chi tiết 4 mảng"}</span>
            {showTodayHotspots ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onNavigateTab("calendar")}
            className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 px-2.5 py-1 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200/70 rounded-lg transition cursor-pointer flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Lịch Vận Hành</span>
          </button>
        </div>
      </div>

      {/* Expanded Hotspots when toggled */}
      {showTodayHotspots && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
              <Ship className="w-3.5 h-3.5 text-blue-600" /> Hậu Cần Kho
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Chuẩn bị pick hàng Skelcore (23/10) & 5 PO mới ULS-AT2634 kho Đông Anh.
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
              <Wrench className="w-3.5 h-3.5 text-cyan-600" /> Kỹ Thuật HCM
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Lắp đặt ISH KOMPAN Playground Xuân Thủy (Ngày 4) & bảo trì Unity Fitness.
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
              <Wrench className="w-3.5 h-3.5 text-indigo-600" /> Kỹ Thuật HN
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Thay màn hình Precor PVS Hilton Garden Inn & bảo trì Pacific Palace TRM895.
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Tài Chính & Thu Tiền
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Thu tiền tuần đạt 2.457 Tỷ VNĐ ($94,518 USD) từ Atelier, Light House, KS Hợp Thành.
            </p>
          </div>
        </div>
      )}


      {/* Cross-Department KPI Cards (Linear/Stripe Metric Strip) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* 1. Design & Sales */}
        <div
          onClick={() => setDepartmentFilter(departmentFilter === "design" ? "all" : "design")}
          className={`p-3.5 rounded-xl border cursor-pointer transition ${
            departmentFilter === "design"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-medium mb-2">
            <span className={`flex items-center gap-1.5 ${departmentFilter === "design" ? "text-slate-300" : "text-slate-500"}`}>
              <Palette className="w-3.5 h-3.5 text-purple-500" /> 1. Thiết Kế
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${departmentFilter === "design" ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"}`}>
              {designTasks.length}
            </span>
          </div>
          <div className={`text-base font-bold tracking-tight tabular-nums ${departmentFilter === "design" ? "text-white" : "text-slate-900"}`}>
            {designTasks.filter((t) => t.progressPercent === 100).length}/{designTasks.length} <span className="text-xs font-normal opacity-75">hoàn tất</span>
          </div>
          <p className={`text-[11px] mt-0.5 ${departmentFilter === "design" ? "text-slate-400" : "text-slate-400"}`}>Layout 2D & Render 3D</p>
        </div>

        {/* 2. Tender */}
        <div
          onClick={() => onNavigateTab("tender")}
          className="p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 cursor-pointer transition shadow-2xs"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-2">
            <span className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> 2. Tender & HĐ
            </span>
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums">
              {tenders.length}
            </span>
          </div>
          <div className="text-base font-bold tracking-tight text-slate-900 truncate tabular-nums">
            {formatShortCurrency(
              tenders
                .filter((t) => t.status === "New")
                .reduce((s, t) => s + (t.valueBeforeVat || 0), 0)
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Báo giá & Ký hợp đồng</p>
        </div>

        {/* 3. Logistics & Nhập Kho */}
        <div
          onClick={() => setDepartmentFilter(departmentFilter === "shipping" ? "all" : "shipping")}
          className={`p-3.5 rounded-xl border cursor-pointer transition ${
            departmentFilter === "shipping"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-medium mb-2">
            <span className={`flex items-center gap-1.5 ${departmentFilter === "shipping" ? "text-slate-300" : "text-slate-500"}`}>
              <Ship className="w-3.5 h-3.5 text-blue-500" /> 3. Nhập Kho
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${departmentFilter === "shipping" ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"}`}>
              {shipments.length} PO
            </span>
          </div>
          <div className={`text-base font-bold tracking-tight tabular-nums ${departmentFilter === "shipping" ? "text-white" : "text-slate-900"}`}>
            {shipments.filter((s) => s.status === "shipping" || s.status === "customs").length} <span className="text-xs font-normal opacity-75">đang về</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Kho DA (HN) & Kho BD</p>
        </div>

        {/* 4. Mặt Bằng & Marketing */}
        <div
          onClick={() =>
            setDepartmentFilter(departmentFilter === "marketing_ready" ? "all" : "marketing_ready")
          }
          className={`p-3.5 rounded-xl border cursor-pointer transition ${
            departmentFilter === "marketing_ready"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-medium mb-2">
            <span className={`flex items-center gap-1.5 ${departmentFilter === "marketing_ready" ? "text-slate-300" : "text-slate-500"}`}>
              <Camera className="w-3.5 h-3.5 text-pink-500" /> 4. Marketing
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${departmentFilter === "marketing_ready" ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"}`}>
              {projects.filter((p) => p.marketingReady).length}
            </span>
          </div>
          <div className={`text-base font-bold tracking-tight tabular-nums ${departmentFilter === "marketing_ready" ? "text-white" : "text-slate-900"}`}>
            {projects.filter((p) => p.marketingReady).length} <span className="text-xs font-normal opacity-75">mặt bằng</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Sẵn sàng quay chụp</p>
        </div>

        {/* 5. Lắp Đặt & Checklist */}
        <div
          onClick={() =>
            setDepartmentFilter(departmentFilter === "installation" ? "all" : "installation")
          }
          className={`p-3.5 rounded-xl border cursor-pointer transition ${
            departmentFilter === "installation"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-medium mb-2">
            <span className={`flex items-center gap-1.5 ${departmentFilter === "installation" ? "text-slate-300" : "text-slate-500"}`}>
              <ClipboardCheck className="w-3.5 h-3.5 text-cyan-500" /> 5. Lắp Đặt
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${departmentFilter === "installation" ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"}`}>
              {projects.filter((p) => p.stage === "installation").length}
            </span>
          </div>
          <div className={`text-base font-bold tracking-tight tabular-nums ${departmentFilter === "installation" ? "text-white" : "text-slate-900"}`}>
            {projects.filter((p) => p.stage === "installation").length} <span className="text-xs font-normal opacity-75">công trình</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Kiểm đếm BOM đúng/đủ</p>
        </div>

        {/* 6. Kỹ Thuật & Bảo Trì */}
        <div
          onClick={() =>
            setDepartmentFilter(departmentFilter === "maintenance" ? "all" : "maintenance")
          }
          className={`p-3.5 rounded-xl border cursor-pointer transition ${
            departmentFilter === "maintenance"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-medium mb-2">
            <span className={`flex items-center gap-1.5 ${departmentFilter === "maintenance" ? "text-slate-300" : "text-slate-500"}`}>
              <Wrench className="w-3.5 h-3.5 text-indigo-500" /> 6. Kỹ Thuật
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${departmentFilter === "maintenance" ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"}`}>
              {schedule.HCM.reduce((s, d) => s + d.tasks.length, 0) +
                schedule.HN.reduce((s, d) => s + d.tasks.length, 0)}
            </span>
          </div>
          <div className={`text-base font-bold tracking-tight tabular-nums ${departmentFilter === "maintenance" ? "text-white" : "text-slate-900"}`}>
            {schedule.HCM.reduce((s, d) => s + d.tasks.length, 0) +
              schedule.HN.reduce((s, d) => s + d.tasks.length, 0)} <span className="text-xs font-normal opacity-75">ca trực</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Lịch tuần HN & HCM</p>
        </div>
      </div>

      {/* Filter and View Control Bar */}
      <div className="py-2 px-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm nhanh theo tên dự án, khách hàng, mã hợp đồng, mã PO nhập kho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50/70 border border-slate-200/80 rounded-lg text-xs md:text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition"
          />
        </div>

        {/* Department bottleneck selector & View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Toggle Pills */}
          <div className="inline-flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/70 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer tabular-nums ${
                statusFilter === "all"
                  ? "bg-white shadow-2xs text-slate-900 font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Tất Cả ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("in_progress")}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 tabular-nums ${
                statusFilter === "in_progress"
                  ? "bg-white shadow-2xs text-indigo-600 font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="w-3 h-3" />
              Đang Làm ({inProgressProjectsCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 tabular-nums ${
                statusFilter === "completed"
                  ? "bg-white shadow-2xs text-emerald-600 font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Đã Xong ({completedProjectsCount})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/70 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setIsCompactView(true)}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                isCompactView ? "bg-white shadow-2xs text-slate-900 font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Thu Gọn
            </button>
            <button
              type="button"
              onClick={() => setIsCompactView(false)}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                !isCompactView ? "bg-white shadow-2xs text-slate-900 font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Đầy Đủ
            </button>
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
          >
            <option value="all">Tất cả Phòng Ban & Hạng Mục</option>
            <option value="in_progress">Dự án đang triển khai ({inProgressProjectsCount})</option>
            <option value="completed">Dự án đã xong / Hoàn thành ({completedProjectsCount})</option>
            <option value="vip">Khách Hàng VIP Key Account (Score ≥ 8.0)</option>
            <option value="signal">Tín Hiệu Săn Đón Từ Thị Trường (SignalSale)</option>
            <option value="marketing_ready">Mặt bằng chuẩn bị bàn giao (Marketing quay chụp)</option>
            <option value="installation">Đang lắp đặt (Cần kiểm đếm hàng)</option>
            <option value="shortage">Có vấn đề thiếu hàng (Hãng thiếu / Order thiếu)</option>
            <option value="shipping">Hàng đang về 2 kho (DA / BD)</option>
            <option value="design">Đang thiết kế 2D / 3D</option>
            <option value="maintenance">Hợp đồng dịch vụ & Lịch kỹ thuật</option>
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
          >
            <option value="all">Tất cả Khu vực</option>
            <option value="HCM">Miền Nam (HCM / Tây Ninh / BD)</option>
            <option value="HN">Miền Bắc (Hà Nội / Hải Phòng)</option>
          </select>
        </div>
      </div>

      {/* Status Filter Banner / Guidance Note */}
      {statusFilter === "completed" && (
        <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5 sm:mt-0">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <div>
              <div className="font-black text-emerald-950 text-sm">
                DỰ ÁN ĐÃ XONG / HOÀN THÀNH BÀN GIAO ({filteredProjects.length} công trình)
              </div>
              <p className="text-emerald-800 text-xs mt-0.5">
                Toàn bộ thiết bị đã lắp đặt hoàn tất, nghiệm thu kỹ thuật 100% đạt, Biên bản Bàn giao & Nghiệm thu (BBGH/NT) đã ký 3 bên (Attivo - Chủ đầu tư - Tổng thầu), mặt bằng đã bàn giao đưa vào vận hành và chuyển hồ sơ sang chế độ <strong>Bảo Hành Định Kỳ (SLA 24/7)</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className="px-3.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            Xem Tất Cả ({projects.length})
          </button>
        </div>
      )}

      {statusFilter === "in_progress" && (
        <div className="bg-blue-50 border border-blue-300 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-950 shadow-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5 sm:mt-0">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <div className="font-black text-blue-950 text-sm">
                DỰ ÁN ĐANG TRIỂN KHAI ({filteredProjects.length} công trình)
              </div>
              <p className="text-blue-800 text-xs mt-0.5">
                Các dự án đang chạy thực tế theo chu trình 9 bước (từ Khảo sát mặt bằng, Thiết kế 2D/3D, Báo giá & Ký HĐ, Đơn hàng PO về 2 kho DA/BD, Lắp đặt & Nghiệm thu).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className="px-3.5 py-1.5 bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            Xem Tất Cả ({projects.length})
          </button>
        </div>
      )}


      {/* THE MASTER MATRIX TABLE */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          {isCompactView ? (
            /* CHẾ ĐỘ TINH GỌN (FOCUS MODE - EXECUTIVE & DAILY OPS) */
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10.5px]">
                  <th className="py-3 px-4 min-w-[270px]">Dự Án / Khách Hàng / Sale</th>
                  <th className="py-3 px-3 min-w-[170px] text-center">Tiến Độ & Giai Đoạn</th>
                  <th className="py-3 px-4 min-w-[260px]">Tình Trạng Hàng & Điểm Nghẽn</th>
                  <th className="py-3 px-4 min-w-[210px]">Bàn Giao & Nghiệm Thu</th>
                  <th className="py-3 px-3 w-28 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredProjects.map((project) => {
                  const data = getProjectComprehensiveData(project);
                  const isExpanded = expandedProjectId === project.id;
                  const isCompleted = isProjectCompleted(project);
                  const stageBadge = getStageBadge(project, data, isCompleted);
                  const progressVal = isCompleted
                    ? 100
                    : (project.progress ?? project.checklistProgress ?? (project.stage === "installation" ? 75 : project.stage === "shipping" ? 50 : 35));
                  const whBadge = data.relatedShipment ? getWarehouseBadge(data.relatedShipment.warehouse) : null;
                  const shortage = data.relatedShipment ? getShortageBadge(data.relatedShipment.shortageStatus) : null;

                  return (
                    <React.Fragment key={project.id}>
                      <tr
                        onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                        className={`hover:bg-slate-50/70 transition cursor-pointer ${
                          isExpanded ? "bg-slate-50/90" : ""
                        }`}
                      >
                        {/* Cột 1: Dự án / Khách Hàng / Sale */}
                        <td className="py-3.5 px-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-900 text-[13px] hover:text-indigo-600 transition">
                                {project.name}
                              </span>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const link = getShareableLink("projects", { id: project.id });
                                  const ok = await copyToClipboard(link);
                                  if (ok && showToast) {
                                    showToast(`Đã sao chép link dự án: ${project.name}`);
                                  }
                                }}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                                title="Sao chép link trực tiếp"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onNavigateTab) {
                                    onNavigateTab("projects", { id: project.id });
                                  } else {
                                    window.location.hash = `#projects?id=${project.id}`;
                                  }
                                }}
                                className="p-1 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                                title="Mở trang chi tiết dự án"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate mt-0.5" title={project.customer}>
                              {project.customer}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap mt-1.5 text-[11px]">
                              <span className="font-mono font-medium text-slate-700 bg-slate-100/80 px-1.5 py-0.2 rounded border border-slate-200/80 text-[10px]">
                                {project.contractCode}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-100/80 border border-slate-200/80 text-[10px] font-medium text-slate-600">
                                {project.region}
                              </span>
                              {project.leadScore !== undefined && (
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold inline-flex items-center gap-0.5 border tabular-nums ${
                                  project.leadScore >= 8.5
                                    ? "bg-amber-50/80 text-amber-800 border-amber-200/80"
                                    : project.leadScore >= 8.0
                                    ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/80"
                                    : "bg-slate-100/80 text-slate-600 border-slate-200/80"
                                }`}>
                                  <span>{project.leadScore}/10</span>
                                  {project.isVip && <span className="text-[9px] px-1 bg-amber-200/70 text-amber-900 rounded font-bold ml-0.5">VIP</span>}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                                <span className="text-slate-300">•</span>
                                <span>Sale: <strong className="text-slate-800 font-medium">{project.leadSale || project.dealOwner || project.hubspotDeal?.owner || "Phụ trách KDDA"}</strong></span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Cột 2: Tiến Độ & Giai Đoạn */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="w-full max-w-[155px] mx-auto space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-medium tabular-nums">
                              <span className="text-slate-400">Tiến độ</span>
                              <span className={isCompleted ? "text-emerald-600 font-semibold" : "text-slate-800 font-semibold"}>{progressVal}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isCompleted ? "bg-emerald-500" : progressVal >= 75 ? "bg-cyan-500" : "bg-indigo-500"
                                }`}
                                style={{ width: `${progressVal}%` }}
                              />
                            </div>
                            <div>
                              <span className={`inline-flex items-center gap-1.5 text-[10.5px] px-2 py-0.5 rounded-full border ${stageBadge.style}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${stageBadge.dot || "bg-slate-400"}`}></span>
                                {stageBadge.label}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Cột 3: Tình Trạng Hàng & Điểm Nghẽn */}
                        <td className="py-3.5 px-4">
                          {isCompleted ? (
                            <div className="inline-block px-2.5 py-1.5 rounded-lg text-xs bg-emerald-50/70 text-emerald-800 border border-emerald-200/70">
                              <div className="text-xs font-semibold text-emerald-900">100% Đã Bàn Giao Thiết Bị</div>
                              <div className="text-[10px] text-emerald-600">Biên bản BBGH/NT ký 3 bên</div>
                            </div>
                          ) : shortage?.alert ? (
                            <div className="space-y-1">
                              <div className="text-[11px] font-semibold text-rose-700 bg-rose-50/80 px-2 py-1 rounded-md border border-rose-200/80 inline-block">
                                <span>{shortage.tag}</span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                {data.relatedShipment?.shortageDetail || "Nội bộ order thiếu linh kiện, đang đặt bù"}
                              </p>
                            </div>
                          ) : data.relatedShipment ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-slate-900 text-xs">
                                  {data.relatedShipment.brand}
                                </span>
                                <span className="font-mono text-xs font-medium text-indigo-600">
                                  {data.relatedShipment.poCode}
                                </span>
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${whBadge?.bg}`}>
                                  {whBadge?.short}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                <span>ETA: <strong className="text-slate-800 font-medium tabular-nums">{formatDate(data.relatedShipment.eta)}</strong> ({data.relatedShipment.method})</span>
                              </div>
                            </div>
                          ) : project.stage === "installation" ? (
                            <div className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-50/80 text-cyan-800 border border-cyan-200/80">
                              <span>Đang thi công lắp đặt tại site</span>
                            </div>
                          ) : data.designTask ? (
                            <div className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50/80 text-purple-800 border border-purple-200/80">
                              <span>Bản vẽ 2D/3D (KTS: {project.designer2D || "Lý"})</span>
                            </div>
                          ) : (
                            <div className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50/80 text-emerald-700 border border-emerald-200/80">
                              <span>Hàng sẵn sàng tại kho</span>
                            </div>
                          )}
                        </td>

                        {/* Cột 4: Bàn Giao & Nghiệm Thu */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="text-xs text-slate-600 tabular-nums">
                              {isCompleted ? (
                                <span className="font-semibold text-emerald-700">
                                  Đã bàn giao: {formatDate(project.handoverDate || project.endDate)}
                                </span>
                              ) : project.handoverDate ? (
                                <span>
                                  Bàn giao: <strong className="text-slate-900 font-medium">{formatDate(project.handoverDate)}</strong>
                                </span>
                              ) : (
                                <span className="text-slate-400">Đang chuẩn bị mặt bằng</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              KTV: <strong className="text-slate-700 font-medium">{project.deliveryTicket?.assignedTech || project.assignedTech || "Đội KTV"}</strong>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenChecklist(project.id);
                              }}
                              className={`mt-1 px-2 py-0.5 rounded-md text-[10px] font-medium border transition inline-flex items-center gap-1 cursor-pointer ${
                                isCompleted || data.checklist?.status === "ready"
                                  ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/80"
                                  : "bg-amber-50/80 text-amber-700 border-amber-200/80 hover:bg-amber-100/80"
                              }`}
                              title="Mở hồ sơ kiểm đếm BOM hàng hóa"
                            >
                              <span>{isCompleted ? "✓ Đủ 100% BOM" : data.checklist?.status === "ready" ? "✓ Đủ 100% BOM" : "Kiểm đếm BOM"}</span>
                            </button>
                          </div>
                        </td>

                        {/* Cột 5: Thao Tác */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedProjectId(isExpanded ? null : project.id);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1 cursor-pointer ${
                                isExpanded
                                  ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs"
                              }`}
                              title={isExpanded ? "Thu gọn chi tiết" : "Xem toàn bộ hồ sơ 4 mảng"}
                            >
                              <span>{isExpanded ? "Đóng" : "Chi tiết"}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDED VIEW IN FOCUS MODE */}
                      {isExpanded && renderProjectExpandedDrawer(project, data, isCompleted, 5)}
                    </React.Fragment>
                  );
                })}

                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Không tìm thấy dự án nào theo bộ lọc đã chọn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            /* CHẾ ĐỘ ĐẦY ĐỦ (FULL 8-COLUMN OPERATIONS MATRIX) */
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 min-w-[240px] max-w-[270px]">Dự Án / Khách Hàng / Sale</th>
                  <th className="py-3.5 px-3 min-w-[150px] text-center">1. Thiết Kế 2D/3D</th>
                  <th className="py-3.5 px-3 min-w-[170px] text-center">2. Tender & HĐ</th>
                  <th className="py-3.5 px-4 min-w-[200px]">3. Nhập Kho & PO (Kho DA/BD)</th>
                  <th className="py-3.5 px-3 min-w-[180px] text-center">4. Mặt Bằng & Marketing</th>
                  <th className="py-3.5 px-3 min-w-[190px] text-center">5. Lắp Đặt & Checklist</th>
                  <th className="py-3.5 px-4 min-w-[200px]">6. Kỹ Thuật & Bảo Trì</th>
                  <th className="py-3.5 px-3 w-16 text-center">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredProjects.map((project) => {
                  const data = getProjectComprehensiveData(project);
                  const isExpanded = expandedProjectId === project.id;
                  const isCompleted = isProjectCompleted(project);
                  const whBadge = data.relatedShipment ? getWarehouseBadge(data.relatedShipment.warehouse) : null;
                  const shortage = data.relatedShipment ? getShortageBadge(data.relatedShipment.shortageStatus) : null;

                  return (
                    <React.Fragment key={project.id}>
                      <tr
                        onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                        className={`hover:bg-slate-50/80 transition cursor-pointer ${
                          isExpanded ? "bg-blue-50/30" : ""
                        } ${
                          isCompleted
                            ? "border-l-4 border-l-emerald-500 bg-emerald-50/15"
                            : project.marketingReady
                            ? "border-l-4 border-l-pink-500"
                            : project.stage === "installation"
                            ? "border-l-4 border-l-cyan-500"
                            : ""
                        }`}
                      >
                        {/* Cột 0: Project Info & Lead Sale */}
                        <td className="py-3.5 px-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm hover:text-blue-600 transition">
                                {project.name}
                              </span>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const link = getShareableLink("projects", { id: project.id });
                                  const ok = await copyToClipboard(link);
                                  if (ok && showToast) {
                                    showToast(`Đã sao chép link dự án: ${project.name}`);
                                  }
                                }}
                                className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                                title="Sao chép link trực tiếp tới dự án"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onNavigateTab) {
                                    onNavigateTab("projects", { id: project.id });
                                  } else {
                                    window.location.hash = `#projects?id=${project.id}`;
                                  }
                                }}
                                className="p-1 rounded hover:bg-blue-100 text-slate-400 hover:text-blue-700 transition cursor-pointer"
                                title="Mở trang chi tiết dự án"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate" title={project.customer}>
                              {project.customer}
                            </span>

                            <div className="flex items-center gap-1.5 flex-wrap mt-1 text-[11px]">
                              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                {project.contractCode}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600">
                                {project.region}
                              </span>
                              {project.leadScore !== undefined && (
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold inline-flex items-center gap-0.5 border ${
                                  project.leadScore >= 8.5
                                    ? "bg-amber-50 text-amber-900 border-amber-300"
                                    : project.leadScore >= 8.0
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : "bg-slate-100 text-slate-700 border-slate-200"
                                }`}>
                                  <span>{project.leadScore}/10</span>
                                  {project.isVip && <span className="text-[9px] px-1 bg-amber-200 text-amber-900 rounded font-black ml-0.5">VIP</span>}
                                </span>
                              )}
                            </div>

                            {/* Trạng thái Hoàn thành / Bàn giao nếu isCompleted */}
                            {isCompleted && (
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                                  <span>✓ ĐÃ XONG / HOÀN THÀNH</span>
                                </span>
                              </div>
                            )}

                            {/* Chuyên viên KDDA (Sale Owner) */}
                            <div className="mt-1.5">
                              <span title="Chuyên viên Kinh Doanh Dự Án phụ trách" className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                <span>Sale: <strong className="text-slate-900 font-bold">{project.leadSale || project.dealOwner || project.hubspotDeal?.owner || "Phụ trách KDDA"}</strong></span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Cột 1: Thiết Kế 2D/3D */}
                        <td className="py-3 px-3 text-center">
                          {isCompleted ? (
                            <div className="inline-flex flex-col items-center space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ✓ 100% Hoàn Công
                              </span>
                              <span className="text-[11px] text-slate-700 font-medium">
                                KTS: <strong className="text-slate-900">{project.designer2D || "Lý"}</strong>
                              </span>
                              <span className="text-[10px] text-emerald-700 font-semibold">Đã lưu trữ hồ sơ</span>
                            </div>
                          ) : data.designTask ? (
                            <div className="inline-flex flex-col items-center space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  data.designTask.progressPercent === 100
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-purple-50 text-purple-700 border border-purple-200"
                                }`}
                              >
                                {data.designTask.progressPercent === 100
                                  ? "✓ 100% Hoàn Tất"
                                  : `Tiến độ: ${data.designTask.progressPercent}%`}
                              </span>
                              <span className="text-[11px] text-slate-700 font-medium">
                                KTS: <strong className="text-slate-900">{data.designTask.designer3D || data.designTask.designer2D || project.designer2D || "Lý"}</strong>
                              </span>
                              <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-slate-500">
                                <span>2D: {data.designTask.stage2D === "completed" ? "✓ Xong" : "Đang vẽ"}</span>
                                <span>•</span>
                                <span>3D: {data.designTask.stage3D === "completed" ? "✓ Xong" : "Render"}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                ✓ Layout Đã Chốt
                              </span>
                              <span className="text-[10px] text-slate-500">
                                KTS: {project.designer2D || "Lý"}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Cột 2: Tender & HĐ (HubSpot Deal & Giá trị HĐ & DMS) */}
                        <td className="py-3 px-3 text-center">
                          {(() => {
                            const contractValue = project.hubspotDeal?.amount || data.tender?.valueBeforeVat || project.totalContractValue || 0;
                            return (
                              <div className="inline-flex flex-col items-center space-y-1">
                                <div className="font-mono font-black text-slate-900 text-xs">
                                  {contractValue ? formatCurrency(contractValue) : "Chưa chốt giá"}
                                </div>

                                {isCompleted ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    Closed won • Thanh lý HĐ
                                  </span>
                                ) : project.hubspotDeal ? (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      project.hubspotDeal.stage === "Closed won"
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                    }`}
                                    title={`HubSpot Deal: ${project.hubspotDeal.dealName} (${project.hubspotDeal.dealId})`}
                                  >
                                    HubSpot: {project.hubspotDeal.stage}
                                  </span>
                                ) : data.tender ? (
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      data.tender.type === "Contract"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-blue-50 text-blue-700 border border-blue-200"
                                    }`}
                                  >
                                    {data.tender.type === "Contract" ? "Đã Ký HĐ" : "Báo Giá"}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">Hợp đồng dự án</span>
                                )}

                                {project.dmsDocuments && project.dmsDocuments.length > 0 && (
                                  <span
                                    className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                                    title={`${project.dmsDocuments.length} hồ sơ tài liệu lưu trữ trên Attivo DMS`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onNavigateTab) onNavigateTab("dms");
                                    }}
                                  >
                                    DMS: {project.dmsDocuments.length} files
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        {/* Cột 3: Nhập Kho & PO (Kho DA/BD) */}
                        <td className="py-3 px-4">
                          {isCompleted ? (
                            <div className="inline-block px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <div className="text-xs font-bold text-emerald-900">100% Đã Xuất Kho</div>
                              <div className="text-[10px] text-emerald-700 font-medium">Lắp đặt hoàn thiện tại site</div>
                            </div>
                          ) : data.relatedShipment ? (
                            (() => {
                              const lead = estimateShipmentLeadTime(data.relatedShipment);
                              return (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-slate-900 text-xs">
                                      {data.relatedShipment.brand}
                                    </span>
                                    <span className="font-mono text-xs font-bold text-blue-700">
                                      {data.relatedShipment.poCode}
                                    </span>
                                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${whBadge?.bg}`}>
                                      {whBadge?.short}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-slate-600">
                                    <span>ETA: <strong className="text-slate-900">{formatDate(data.relatedShipment.eta)}</strong> ({data.relatedShipment.method})</span>
                                  </div>

                                  {shortage?.alert ? (
                                    <div className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 inline-block">
                                      <span>{shortage.tag}</span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 font-medium block">
                                      Lead: ~{lead.totalLeadDays} ngày (Đúng & đủ)
                                    </span>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            <div className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span>Hàng sẵn tại kho</span>
                            </div>
                          )}
                        </td>

                        {/* Cột 4: Mặt Bằng & Marketing (Kênh Lead, Contact Owner, Video) */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex flex-col items-center space-y-1">
                            {isCompleted ? (
                              <div className="inline-flex flex-col items-center p-1.5 px-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                                <span className="font-black text-[10px] tracking-wide text-emerald-700 uppercase">
                                  ĐÃ BÀN GIAO CHÍNH THỨC
                                </span>
                                <span className="text-[10px] font-bold text-emerald-900 mt-0.5">
                                  Ngày: {formatDate(project.handoverDate || project.endDate)}
                                </span>
                                <span className="text-[9px] text-emerald-700 font-medium mt-0.5">CĐT đưa vào vận hành</span>
                              </div>
                            ) : project.marketingReady ? (
                              <div className="inline-flex flex-col items-center p-1.5 px-2.5 rounded-xl bg-pink-100 text-pink-800 border border-pink-300 shadow-2xs">
                                <span className="font-black text-[10px] tracking-wide text-pink-700 uppercase">
                                  SẴN SÀNG QUAY
                                </span>
                                <span className="text-[10px] font-bold text-pink-900 mt-0.5">
                                  Bàn giao: {formatDate(project.handoverDate)}
                                </span>
                              </div>
                            ) : project.handoverDate ? (
                              <div className="text-center">
                                <span className="text-[11px] font-semibold text-slate-700 block">
                                  Bàn giao MB: {formatDate(project.handoverDate)}
                                </span>
                                <span className="text-[10px] text-slate-400">Chờ chuẩn bị mặt bằng</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">Đang khảo sát MB</span>
                            )}

                            <div className="flex items-center justify-center gap-1 flex-wrap pt-0.5">
                              <span
                                className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[140px]"
                                title={project.signalSale?.source || project.hubspotContact?.channel || "Nguồn Lead"}
                              >
                                {project.signalSale ? project.signalSale.source.split('+')[0].trim() : (project.hubspotContact?.channel || "Direct / Mkt")}
                              </span>
                              {(project.contactOwner?.includes("Marketing") || project.hubspotContact?.source?.includes("Marketing") || project.signalSale) && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-purple-100 text-purple-700 font-bold border border-purple-200">
                                  Mkt Lead
                                </span>
                              )}
                            </div>

                            <span
                              className="text-[10px] text-slate-500 block truncate max-w-[150px]"
                              title={`Contact Owner: ${project.contactOwner || project.hubspotContact?.contactOwner || "Marketing Attivo"}`}
                            >
                              Contact: <strong className="text-slate-700">{project.contactOwner || project.hubspotContact?.name || "Marketing"}</strong>
                            </span>
                          </div>
                        </td>

                        {/* Cột 5: Lắp Đặt & Checklist (Vé Giao Hàng & KTV Lắp Đặt) */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex flex-col items-center space-y-1 w-full max-w-[190px] mx-auto">
                            {isCompleted ? (
                              <>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  ✓ 100% Nghiệm Thu Đạt
                                </span>
                                <div className="text-[10px] text-emerald-800 font-semibold text-center leading-tight">
                                  BBGH/NT đã ký 3 bên
                                </div>
                                <div className="text-[10px] text-slate-600 font-medium">
                                  KTV: <strong className="text-slate-800">{project.deliveryTicket?.assignedTech || project.assignedTech || "Đội KTV"}</strong>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenChecklist(project.id);
                                  }}
                                  className="w-full px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                                  title="Xem hồ sơ kiểm đếm BOM"
                                >
                                  Xem Checklist BOM
                                </button>
                              </>
                            ) : (
                              <>
                                {project.deliveryTicket ? (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 max-w-full truncate"
                                    title={`Vé Giao Hàng & Lắp Đặt #${project.deliveryTicket.ticketId}: ${project.deliveryTicket.subject}`}
                                  >
                                    <span className="truncate">Vé Giao: #{project.deliveryTicket.ticketId}</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium">Kế hoạch giao hàng</span>
                                )}

                                <div
                                  className="text-[10px] text-slate-600 font-medium truncate max-w-full"
                                  title={`KTV phụ trách: ${project.deliveryTicket?.assignedTech || project.assignedTech || "Đội KTV Kỹ thuật"}`}
                                >
                                  KTV: <strong className="text-slate-800">{project.deliveryTicket?.assignedTech || project.assignedTech || "Đội KTV"}</strong>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenChecklist(project.id);
                                  }}
                                  className={`w-full px-2 py-1 rounded-lg text-[10px] font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                                    data.checklist?.status === "ready"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                      : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                                  }`}
                                  title="Mở bảng kiểm đếm chi tiết BOM lắp đặt"
                                >
                                  <span>{data.checklist?.status === "ready" ? "✓ Đủ 100% BOM" : "Kiểm đếm BOM"}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Cột 6: Kỹ Thuật & Bảo Trì (Kỹ thuật tuần, Tickets & SLA) */}
                        <td className="py-3 px-4">
                          <div className="space-y-1.5">
                            {isCompleted ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Bảo Hành Active (SLA 24/7)
                                </span>
                                <div className="text-[10px] text-slate-600 font-medium">
                                  Thời hạn: 12 - 36 tháng
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  Lịch bảo trì định kỳ quý
                                </div>
                              </div>
                            ) : data.techTask ? (
                              <div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 mb-0.5">
                                  {data.techTask.day} • {data.techTask.region}
                                </span>
                                <p className="text-slate-800 text-xs font-semibold truncate" title={data.techTask.content || data.techTask.site}>
                                  {data.techTask.content || data.techTask.site.split("|")[0].trim()}
                                </p>
                                <span className="text-[10px] text-slate-500 block truncate">KTV: {data.techTask.tech}</span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200">
                                <span>Theo dõi định kỳ</span>
                              </span>
                            )}

                            {project.hubspotTickets && project.hubspotTickets.length > 0 && (
                              (() => {
                                const t = project.hubspotTickets[0];
                                const ticketSla = estimateTicketCompletion(t);
                                return (
                                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap">
                                    <a
                                      href={t.hubspotUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                                      title={`HubSpot Ticket #${t.ticketId}: ${t.subject}`}
                                    >
                                      <span>{project.hubspotTickets.length} Ticket</span>
                                    </a>
                                    <span className="text-[10px] font-bold text-blue-700 inline-flex items-center gap-0.5" title={`Est Time: ${ticketSla.estHoursFormatted} (${ticketSla.slaDescription})`}>
                                      <span>{ticketSla.estHoursFormatted}</span>
                                    </span>
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        </td>

                        {/* Cột 7: Nút mở rộng Drawer Chi Tiết */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedProjectId(isExpanded ? null : project.id);
                            }}
                            className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center mx-auto ${
                              isExpanded
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                            title={isExpanded ? "Thu gọn" : "Xem chi tiết dự án"}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* EXPANDED VIEW IN FULL MATRIX */}
                      {isExpanded && renderProjectExpandedDrawer(project, data, isCompleted, 8)}
                    </React.Fragment>
                  );
                })}

                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Không tìm thấy dự án nào theo bộ lọc đã chọn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
