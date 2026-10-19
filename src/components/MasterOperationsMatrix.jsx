import React, { useState } from "react";
import {
  FolderGit2,
  Ship,
  Camera,
  ClipboardCheck,
  Wrench,
  FileSpreadsheet,
  Palette,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Warehouse,
  ArrowRight,
  Sparkles,
  Plane,
  Anchor,
  User,
  Info,
  Layers,
  SlidersHorizontal,
  GitCommit,
  FolderOpen,
  Link2,
  ExternalLink,
  FileText,
  ShieldCheck,
  Truck,
  Target,
  UserCheck,
  CalendarRange,
  Star,
  Radio,
  Copy,
} from "lucide-react";
import {
  formatDate,
  formatCurrency,
  formatShortCurrency,
  getWarehouseBadge,
  getShortageBadge,
  getShipmentStatusBadge,
} from "../utils/formatters";
import { getShareableLink, copyToClipboard } from "../utils/navigation";
import { estimateShipmentLeadTime, estimateTicketCompletion } from "../utils/slaEstimator";

export default function MasterOperationsMatrix({
  projects,
  setProjects,
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
  const [expandedProjectId, setExpandedProjectId] = useState("PRJ-001");
  const [isCompactView, setIsCompactView] = useState(true);

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

    let matchesDept = true;
    if (departmentFilter === "marketing_ready") {
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

    return matchesSearch && matchesRegion && matchesDept;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Executive Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white py-3 px-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
          <h1 className="text-lg md:text-xl font-bold text-slate-900">
            Tiến Độ Dự Án
          </h1>
        </div>

        {/* Quick Legend / Badges & Flow / DMS / HubSpot Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => onNavigateTab("gantt")}
            className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <CalendarRange className="w-3.5 h-3.5" /> Biểu Đồ Gantt
          </button>
          <button
            onClick={() => onNavigateTab("flow")}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <GitCommit className="w-3.5 h-3.5" /> Chu Trình 9 Bước
          </button>
          <button
            onClick={() => onNavigateTab("dms")}
            className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" /> Kho Tài Liệu DMS
          </button>
          <button
            onClick={() => onNavigateTab("hubspot")}
            className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" /> HubSpot CRM
          </button>
          <button
            onClick={() => onNavigateTab("calendar")}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" /> Lịch Tháng 10
          </button>
          <button
            onClick={() => onNavigateTab("finance")}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            Thu Tiền: 2.457 Tỷ
          </button>
        </div>
      </div>

      {/* Today's Operational Hotspot Banner (Overview Priority) */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 p-3 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-2.5">
          <span className="px-2.5 py-1 bg-amber-500 text-white rounded-lg font-black text-xs uppercase tracking-wider shrink-0 mt-0.5">
            Hôm Nay 19/10
          </span>
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-950 flex items-center gap-2">
              <span>Nhiệm vụ trọng tâm hôm nay:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-slate-700">
              <div className="bg-white/90 p-2 rounded-lg border border-amber-200">
                🚢 <strong>Hậu cần Kho:</strong> Chuẩn bị pick hàng Skelcore (23/10) & 5 PO mới ULS-AT2634 kho DA.
              </div>
              <div className="bg-white/90 p-2 rounded-lg border border-amber-200">
                🔧 <strong>Kỹ Thuật HCM:</strong> Lắp đặt ISH KOMPAN Playground Xuân Thủy (Ngày 4) & bảo trì Unity Fitness.
              </div>
              <div className="bg-white/90 p-2 rounded-lg border border-amber-200">
                🔧 <strong>Kỹ Thuật HN:</strong> Thay màn hình Precor PVS Hilton Garden Inn & bảo trì Pacific Palace TRM895.
              </div>
              <div className="bg-white/90 p-2 rounded-lg border border-amber-200">
                💰 <strong>Tài Chính:</strong> Thu tiền tuần đạt 2.457 Tỷ VNĐ ($94,518 USD) từ Atelier, Light House, KS Hợp Thành.
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab("calendar")}
          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 self-start lg:self-auto shrink-0 bg-white px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs hover:bg-amber-100 transition cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          Xem Toàn Bộ Lịch <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>


      {/* Cross-Department KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Design & Sales */}
        <div
          onClick={() => setDepartmentFilter(departmentFilter === "design" ? "all" : "design")}
          className={`p-3.5 rounded-2xl border cursor-pointer transition shadow-xs ${
            departmentFilter === "design"
              ? "bg-purple-50 border-purple-400 ring-2 ring-purple-400/30"
              : "bg-white border-slate-200 hover:border-purple-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-purple-700 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" /> 1. Thiết Kế
            </span>
            <span className="bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-bold">
              {designTasks.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Layout 2D & Render 3D</p>
          <div className="mt-2 text-xs font-bold text-slate-800">
            {designTasks.filter((t) => t.progressPercent === 100).length}/{designTasks.length} hoàn tất
          </div>
        </div>

        {/* 2. Tender */}
        <div
          onClick={() => onNavigateTab("tender")}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 cursor-pointer transition shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-1">
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5" /> 2. Tender & HĐ
            </span>
            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
              {tenders.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Báo giá & Ký hợp đồng</p>
          <div className="mt-2 text-xs font-bold text-emerald-700 truncate">
            {formatShortCurrency(
              tenders
                .filter((t) => t.status === "New")
                .reduce((s, t) => s + (t.valueBeforeVat || 0), 0)
            )}
          </div>
        </div>

        {/* 3. Logistics & Nhập Kho */}
        <div
          onClick={() => setDepartmentFilter(departmentFilter === "shipping" ? "all" : "shipping")}
          className={`p-3.5 rounded-2xl border cursor-pointer transition shadow-xs ${
            departmentFilter === "shipping"
              ? "bg-blue-50 border-blue-400 ring-2 ring-blue-400/30"
              : "bg-white border-slate-200 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-blue-700 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Ship className="w-3.5 h-3.5" /> 3. Nhập Kho
            </span>
            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-bold">
              {shipments.length} PO
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Kho DA (HN) & Kho BD</p>
          <div className="mt-2 text-xs font-bold text-slate-800">
            {shipments.filter((s) => s.status === "shipping" || s.status === "customs").length} đang trên đường
          </div>
        </div>

        {/* 4. Mặt Bằng & Marketing */}
        <div
          onClick={() =>
            setDepartmentFilter(departmentFilter === "marketing_ready" ? "all" : "marketing_ready")
          }
          className={`p-3.5 rounded-2xl border cursor-pointer transition shadow-xs ${
            departmentFilter === "marketing_ready"
              ? "bg-pink-50 border-pink-400 ring-2 ring-pink-400/30"
              : "bg-white border-slate-200 hover:border-pink-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-pink-700 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> 4. Marketing
            </span>
            <span className="bg-pink-100 text-pink-800 px-1.5 py-0.2 rounded-full font-bold">
              {projects.filter((p) => p.marketingReady).length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Bàn giao MB quay chụp</p>
          <div className="mt-2 text-xs font-bold text-pink-600">
            Cần lên lịch máy quay
          </div>
        </div>

        {/* 5. Lắp Đặt & Checklist */}
        <div
          onClick={() =>
            setDepartmentFilter(departmentFilter === "installation" ? "all" : "installation")
          }
          className={`p-3.5 rounded-2xl border cursor-pointer transition shadow-xs ${
            departmentFilter === "installation"
              ? "bg-cyan-50 border-cyan-400 ring-2 ring-cyan-400/30"
              : "bg-white border-slate-200 hover:border-cyan-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-cyan-800 font-bold mb-1">
            <span className="flex items-center gap-1">
              <ClipboardCheck className="w-3.5 h-3.5" /> 5. Lắp Đặt
            </span>
            <span className="bg-cyan-100 text-cyan-800 px-1.5 py-0.2 rounded-full font-bold">
              {projects.filter((p) => p.stage === "installation").length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Kiểm đếm BOM hàng hóa</p>
          <div className="mt-2 text-xs font-bold text-cyan-800">
            Kiểm tra đúng & đủ
          </div>
        </div>

        {/* 6. Kỹ Thuật & Bảo Trì */}
        <div
          onClick={() =>
            setDepartmentFilter(departmentFilter === "maintenance" ? "all" : "maintenance")
          }
          className={`p-3.5 rounded-2xl border cursor-pointer transition shadow-xs ${
            departmentFilter === "maintenance"
              ? "bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400/30"
              : "bg-white border-slate-200 hover:border-indigo-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-indigo-700 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5" /> 6. Kỹ Thuật
            </span>
            <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full font-bold">
              {schedule.HCM.reduce((s, d) => s + d.tasks.length, 0) +
                schedule.HN.reduce((s, d) => s + d.tasks.length, 0)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Plan HN & Plan HCM</p>
          <div className="mt-2 text-xs font-bold text-indigo-700">
            Lịch tuần 2 miền
          </div>
        </div>
      </div>

      {/* Filter and View Control Bar */}
      <div className="py-2.5 px-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm nhanh theo tên dự án, khách hàng, mã hợp đồng, mã PO nhập kho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        {/* Department bottleneck selector & View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <button
              onClick={() => setIsCompactView(true)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                isCompactView ? "bg-white shadow-xs text-blue-600 font-extrabold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Thu Gọn (Dễ Nhìn)
            </button>
            <button
              onClick={() => setIsCompactView(false)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                !isCompactView ? "bg-white shadow-xs text-blue-600 font-extrabold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Đầy Đủ (Toàn Diện)
            </button>
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Phòng Ban & Hạng Mục</option>
            <option value="vip">⭐ Khách Hàng VIP Key Account (Score ≥ 8.0)</option>
            <option value="signal">📡 Tín Hiệu Săn Đón Từ Thị Trường (SignalSale)</option>
            <option value="marketing_ready">📸 Mặt bằng chuẩn bị bàn giao (Marketing quay chụp)</option>
            <option value="installation">🔧 Đang lắp đặt (Cần kiểm đếm hàng)</option>
            <option value="shortage">⚠️ Có vấn đề thiếu hàng (Hãng thiếu / Order thiếu)</option>
            <option value="shipping">🚢 Hàng đang về 2 kho (DA / BD)</option>
            <option value="design">🎨 Đang thiết kế 2D / 3D</option>
            <option value="maintenance">🛠️ Hợp đồng dịch vụ & Lịch kỹ thuật</option>
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Khu vực</option>
            <option value="HCM">Miền Nam (HCM / Tây Ninh / BD)</option>
            <option value="HN">Miền Bắc (Hà Nội / Hải Phòng)</option>
          </select>
        </div>
      </div>


      {/* THE MASTER MATRIX TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
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
                const whBadge = data.relatedShipment ? getWarehouseBadge(data.relatedShipment.warehouse) : null;
                const shortage = data.relatedShipment ? getShortageBadge(data.relatedShipment.shortageStatus) : null;

                return (
                  <React.Fragment key={project.id}>
                    <tr
                      onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        isExpanded ? "bg-blue-50/30" : ""
                      } ${
                        project.marketingReady
                          ? "border-l-4 border-l-pink-500"
                          : project.stage === "installation"
                          ? "border-l-4 border-l-cyan-500"
                          : ""
                      }`}
                    >
                      {/* Cột 0: Project Info & Lead Sale */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0">
                            {project.marketingReady ? (
                              <span className="p-1.5 rounded-lg bg-pink-100 text-pink-700 block" title="Sẵn sàng quay chụp">
                                <Camera className="w-4 h-4" />
                              </span>
                            ) : project.stage === "installation" ? (
                              <span className="p-1.5 rounded-lg bg-cyan-100 text-cyan-800 block" title="Đang lắp đặt">
                                <ClipboardCheck className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600 block">
                                <FolderGit2 className="w-4 h-4" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
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
                                className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
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
                                className="p-1 rounded hover:bg-blue-100 text-slate-400 hover:text-blue-700 transition"
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
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold flex items-center gap-0.5 border ${
                                  project.leadScore >= 8.5
                                    ? "bg-amber-50 text-amber-900 border-amber-300"
                                    : project.leadScore >= 8.0
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : "bg-slate-100 text-slate-700 border-slate-200"
                                }`}>
                                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />
                                  <span>{project.leadScore}/10</span>
                                  {project.isVip && <span className="text-[9px] px-1 bg-amber-200 text-amber-900 rounded font-black ml-0.5">VIP</span>}
                                </span>
                              )}
                            </div>

                            {/* Chuyên viên KDDA (Sale Owner) */}
                            <div className="mt-1.5">
                              <span title="Chuyên viên Kinh Doanh Dự Án phụ trách" className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                <Target className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>Sale: <strong className="text-slate-900 font-bold">{project.leadSale || project.dealOwner || project.hubspotDeal?.owner || "Phụ trách KDDA"}</strong></span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cột 1: Thiết Kế 2D/3D */}
                      <td className="py-3 px-3 text-center">
                        {data.designTask ? (
                          <div className="inline-flex flex-col items-center space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                data.designTask.progressPercent === 100
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-purple-50 text-purple-700 border border-purple-200"
                              }`}
                            >
                              <Palette className="w-3 h-3" />
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
                              {/* Giá trị HĐ / Báo giá */}
                              <div className="font-mono font-black text-slate-900 text-xs">
                                {contractValue ? formatCurrency(contractValue) : "Chưa chốt giá"}
                              </div>

                              {/* Trạng thái Deal trên HubSpot */}
                              {project.hubspotDeal ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    project.hubspotDeal.stage === "Closed won"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                                  }`}
                                  title={`HubSpot Deal: ${project.hubspotDeal.dealName} (${project.hubspotDeal.dealId})`}
                                >
                                  <Link2 className="w-2.5 h-2.5" />
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

                              {/* DMS Documents */}
                              {project.dmsDocuments && project.dmsDocuments.length > 0 && (
                                <span
                                  className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                                  title={`${project.dmsDocuments.length} hồ sơ tài liệu lưu trữ trên Attivo DMS`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onNavigateTab) onNavigateTab("dms");
                                  }}
                                >
                                  <FolderOpen className="w-2.5 h-2.5" />
                                  DMS: {project.dmsDocuments.length} files
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Cột 3: Nhập Kho & PO (Kho DA/BD) */}
                      <td className="py-3 px-4">
                        {data.relatedShipment ? (
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

                                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                  {data.relatedShipment.method === "Sea" ? (
                                    <Anchor className="w-3 h-3 text-sky-600 shrink-0" />
                                  ) : (
                                    <Plane className="w-3 h-3 text-indigo-600 shrink-0" />
                                  )}
                                  <span>ETA: <strong className="text-slate-900">{formatDate(data.relatedShipment.eta)}</strong></span>
                                </div>

                                {shortage?.alert ? (
                                  <div className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                                    <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
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
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Hàng sẵn tại kho</span>
                          </div>
                        )}
                      </td>

                      {/* Cột 4: Mặt Bằng & Marketing (Kênh Lead, Contact Owner, Video) */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center space-y-1">
                          {/* Trạng thái Mặt Bằng & Video/Ảnh */}
                          {project.marketingReady ? (
                            <div className="inline-flex flex-col items-center p-1.5 px-2.5 rounded-xl bg-pink-100 text-pink-800 border border-pink-300 shadow-2xs">
                              <span className="flex items-center gap-1 font-black text-[10px] tracking-wide text-pink-700 uppercase">
                                <Camera className="w-3.5 h-3.5 text-pink-600 animate-pulse" /> SẴN SÀNG QUAY
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

                          {/* Kênh Nguồn Lead */}
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

                          {/* Contact Owner */}
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
                          {/* Vé Giao Hàng */}
                          {project.deliveryTicket ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 max-w-full truncate"
                              title={`Vé Giao Hàng & Lắp Đặt #${project.deliveryTicket.ticketId}: ${project.deliveryTicket.subject}`}
                            >
                              <Truck className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">Vé Giao: #{project.deliveryTicket.ticketId}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Kế hoạch giao hàng</span>
                          )}

                          {/* Kỹ Thuật Viên Phụ Trách Lắp Đặt */}
                          <div
                            className="text-[10px] text-slate-600 font-medium truncate max-w-full"
                            title={`KTV phụ trách: ${project.deliveryTicket?.assignedTech || project.assignedTech || "Đội KTV Kỹ thuật"}`}
                          >
                            KTV: <strong className="text-slate-800">{project.deliveryTicket?.assignedTech || project.assignedTech || "Đội KTV"}</strong>
                          </div>

                          {/* BOM Checklist Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenChecklist(project.id);
                            }}
                            className={`w-full px-2 py-1 rounded-lg text-[10px] font-bold border transition flex items-center justify-center gap-1 ${
                              data.checklist?.status === "ready"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                            }`}
                            title="Mở bảng kiểm đếm chi tiết BOM lắp đặt"
                          >
                            <ClipboardCheck className="w-3 h-3 shrink-0" />
                            <span>{data.checklist?.status === "ready" ? "✓ Đủ 100% BOM" : "Kiểm đếm BOM"}</span>
                          </button>
                        </div>
                      </td>

                      {/* Cột 6: Kỹ Thuật & Bảo Trì (Kỹ thuật tuần, Tickets & SLA) */}
                      <td className="py-3 px-4">
                        <div className="space-y-1.5">
                          {/* Lịch kỹ thuật trong tuần */}
                          {data.techTask ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 mb-0.5">
                                <Wrench className="w-2.5 h-2.5 text-indigo-600" />
                                {data.techTask.day} • {data.techTask.region}
                              </span>
                              <p className="text-slate-800 text-xs font-semibold truncate" title={data.techTask.content || data.techTask.site}>
                                {data.techTask.content || data.techTask.site.split("|")[0].trim()}
                              </p>
                              <span className="text-[10px] text-slate-500 block truncate">KTV: {data.techTask.tech}</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200">
                              <Wrench className="w-3 h-3 text-slate-400" />
                              <span>Theo dõi định kỳ</span>
                            </span>
                          )}

                          {/* HubSpot Tickets Dịch Vụ */}
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
                                    <Wrench className="w-2.5 h-2.5 text-amber-600" />
                                    <span>{project.hubspotTickets.length} Ticket</span>
                                  </a>
                                  <span className="text-[10px] font-bold text-blue-700 flex items-center gap-0.5" title={`Est Time: ${ticketSla.estHoursFormatted} (${ticketSla.slaDescription})`}>
                                    <Clock className="w-2.5 h-2.5 text-blue-600" />
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

                    {/* EXPANDED VIEW FOR THIS PROJECT */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70 border-b border-slate-200">
                        <td colSpan={8} className="p-5">
                          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
                            {/* Expanded Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                              <div>
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  HỒ SƠ ĐIỀU HÀNH DỰ ÁN
                                </span>
                                <h3 className="text-lg font-black text-slate-900 mt-1">
                                  {project.name} • <span className="text-slate-500 font-normal">{project.address}</span>
                                </h3>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onOpenChecklist(project.id)}
                                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
                                >
                                  <ClipboardCheck className="w-4 h-4" />
                                  <span>Mở Checklist Đúng/Đủ Hàng</span>
                                </button>
                                <button
                                  onClick={() => onNavigateTab("logistics")}
                                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs flex items-center gap-1.5 border border-slate-200 transition font-medium"
                                >
                                  <Ship className="w-4 h-4 text-blue-600" />
                                  <span>Tra Cứu PO & Kho</span>
                                </button>
                              </div>
                            </div>

                            {/* Tripartite Ownership Cross-reference Header */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-orange-50/70 border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                                  <UserCheck className="w-4 h-4 text-blue-600" /> Đối Soát Nhân Sự Phụ Trách (HubSpot CRM & Ticket Giao Hàng)
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                                  ✓ Khớp 100% Hồ Sơ Hoạt Động
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10px] uppercase">
                                    <Target className="w-3.5 h-3.5" /> 1. Phụ Trách Dự Án
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="font-bold text-slate-900 text-xs">
                                      {project.dealOwner || project.leadSale || project.hubspotDeal?.owner}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                      Chuyên viên Kinh doanh Dự án
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-500 block mt-0.5">
                                    HubSpot Deal: #{project.hubspotDeal?.dealId || "—"} ({project.hubspotDeal?.stage || "Mới"})
                                  </span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                                  <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[10px] uppercase">
                                    <UserCheck className="w-3.5 h-3.5" /> 2. Contact Owner
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="font-bold text-slate-900 text-xs">
                                      {project.contactOwner || project.hubspotContact?.contactOwner || "Marketing Attivo"}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                      (project.contactOwner?.includes("Marketing") || project.hubspotContact?.source?.includes("Marketing") || project.hubspotContact?.channel?.includes("Facebook") || project.hubspotContact?.channel?.includes("Website") || project.hubspotContact?.channel?.includes("Hotline"))
                                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    }`}>
                                      {(project.contactOwner?.includes("Marketing") || project.hubspotContact?.source?.includes("Marketing") || project.hubspotContact?.channel?.includes("Facebook") || project.hubspotContact?.channel?.includes("Website") || project.hubspotContact?.channel?.includes("Hotline"))
                                        ? "Nguồn Marketing Lead"
                                        : "Sale Tự Tạo"}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-500 block mt-0.5">
                                    Khách: {project.hubspotContact?.name || project.contact} ({project.hubspotContact?.channel || "Direct"})
                                  </span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                                  <div className="flex items-center gap-1.5 text-amber-700 font-bold text-[10px] uppercase">
                                    <Truck className="w-3.5 h-3.5" /> 3. Vé Giao Hàng & KTV Lắp Đặt
                                  </div>
                                  <span className="font-bold text-slate-900 block mt-1 text-xs">
                                    {project.deliveryTicket?.ticketOwner || project.assignedTech}
                                  </span>
                                  <span className="text-[11px] text-slate-500 block mt-0.5">
                                    {project.deliveryTicket ? `Vé #${project.deliveryTicket.ticketId} (${project.deliveryTicket.status})` : project.assignedTech}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* 6 Department Cards in Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              {/* 1. Design & Sales Box */}
                              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between text-purple-700 font-bold border-b border-slate-200/80 pb-2">
                                  <span className="flex items-center gap-1.5">
                                    <Palette className="w-4 h-4" /> 1. Thiết Kế & Sales
                                  </span>
                                  <span>{data.designTask?.progressPercent || 100}%</span>
                                </div>
                                <p className="text-slate-700">
                                  Sale: <strong className="text-slate-900">{project.leadSale}</strong> • 2D: <strong className="text-cyan-800">{project.designer2D}</strong> • 3D: <strong className="text-purple-800">{project.designer3D}</strong>
                                </p>
                                <p className="text-slate-600 text-[11px]">
                                  {data.designTask?.taskDetail || "Mặt bằng 2D và render 3D đã được chủ đầu tư chốt duyệt."}
                                </p>
                              </div>

                              {/* 2. Tender & Commercial Box */}
                              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between text-emerald-700 font-bold border-b border-slate-200/80 pb-2">
                                  <span className="flex items-center gap-1.5">
                                    <FileSpreadsheet className="w-4 h-4" /> 2. Báo Giá & Hợp Đồng
                                  </span>
                                  <span>{data.tender?.type || "Contract"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Giá trị trước VAT:</span>
                                  <span className="font-bold text-slate-900 font-mono">
                                    {formatCurrency(data.tender?.valueBeforeVat || 0)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-500">Trạng thái:</span>
                                  <span className="font-semibold text-emerald-700">
                                    {data.tender?.subType || "Hợp đồng trọn gói"}
                                  </span>
                                </div>
                              </div>

                              {/* 3. Logistics & Warehouse Box */}
                              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between text-blue-700 font-bold border-b border-slate-200/80 pb-2">
                                  <span className="flex items-center gap-1.5">
                                    <Ship className="w-4 h-4" /> 3. Nhập Kho & Vận Chuyển
                                  </span>
                                  <span>{data.relatedShipment?.warehouse ? `Kho ${data.relatedShipment.warehouse}` : "Tại kho"}</span>
                                </div>
                                {data.relatedShipment ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Mã PO / Hãng:</span>
                                      <span className="font-mono text-slate-900 font-semibold">
                                        {data.relatedShipment.poCode} ({data.relatedShipment.brand})
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">ETA / Vận chuyển:</span>
                                      <span className="text-sky-700 font-medium">
                                        {formatDate(data.relatedShipment.eta)} ({data.relatedShipment.method})
                                      </span>
                                    </div>
                                    {data.relatedShipment.shortageStatus !== "normal" && (
                                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                                        ⚠️ {data.relatedShipment.shortageDetail}
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-slate-500">Thiết bị đã nhập kho hoàn thiện.</p>
                                )}
                              </div>

                              {/* 4. Site & Marketing Box */}
                              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between text-pink-700 font-bold border-b border-slate-200/80 pb-2">
                                  <span className="flex items-center gap-1.5">
                                    <Camera className="w-4 h-4" /> 4. Mặt Bằng & Marketing
                                  </span>
                                  <span>{project.marketingReady ? "Sẵn Sàng" : "Chưa Bật"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Ngày bàn giao MB:</span>
                                  <span className="text-pink-700 font-bold">{formatDate(project.handoverDate)}</span>
                                </div>
                                <p className="text-[11px] text-pink-800 bg-pink-50 p-2 rounded border border-pink-200">
                                  {project.marketingNote || "Chờ hoàn thiện sàn và gương để kích hoạt máy quay."}
                                </p>
                              </div>

                              {/* 5. Installation & Checklist Box */}
                              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between text-cyan-800 font-bold border-b border-slate-200/80 pb-2">
                                  <span className="flex items-center gap-1.5">
                                    <ClipboardCheck className="w-4 h-4" /> 5. Lắp Đặt & BOM Hàng
                                  </span>
                                  <span>{data.checklist?.status === "ready" ? "100% Đủ" : "Kiểm tra"}</span>
                                </div>
                                <p className="text-slate-700">
                                  KTV kiểm đếm: <strong className="text-slate-900">{data.checklist?.verifier || project.assignedTech}</strong>
                                </p>
                                <p className="text-[11px] text-cyan-900 bg-cyan-50 p-2 rounded border border-cyan-200">
                                  {data.checklist?.summary || "Đang tiến hành lắp ráp theo đúng quy chuẩn an toàn Attivo."}
                                </p>
                              </div>

                              {/* 6. Technical & Maintenance Box */}
                              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between text-indigo-700 font-bold border-b border-slate-200/80 pb-2">
                                  <span className="flex items-center gap-1.5">
                                    <Wrench className="w-4 h-4" /> 6. Kỹ Thuật Hiện Trường
                                  </span>
                                  <span>Khu vực {project.region}</span>
                                </div>
                                <p className="text-slate-700">
                                  Nhân sự: <strong className="text-slate-900">{project.assignedTech}</strong>
                                </p>
                                <p className="text-[11px] text-slate-600">
                                  {data.techTask?.content || "Hợp đồng dịch vụ bảo trì định kỳ theo thỏa thuận."}
                                </p>
                              </div>

                              {/* 7. HubSpot CRM Deal & Contact Box */}
                              <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200 space-y-2">
                                <div className="flex items-center justify-between text-orange-800 font-bold border-b border-orange-200 pb-2">
                                  <span className="flex items-center gap-1.5">
                                    <Link2 className="w-4 h-4 text-orange-600" /> 7. HubSpot CRM
                                  </span>
                                  <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-bold">
                                    {project.hubspotDeal?.stage || "Attivo Pipeline"}
                                  </span>
                                </div>
                                {project.hubspotDeal ? (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Deal:</span>
                                      <span className="font-semibold text-slate-900 truncate max-w-[170px]" title={project.hubspotDeal.dealName}>
                                        {project.hubspotDeal.dealName}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Giá trị:</span>
                                      <span className="font-mono font-bold text-slate-900">
                                        {formatCurrency(project.hubspotDeal.amount)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                      <span className="text-slate-500">Khách & Kênh:</span>
                                      <span className="font-medium text-slate-700">
                                        {project.hubspotContact?.name || project.contact} ({project.hubspotContact?.channel || "Direct"})
                                      </span>
                                    </div>
                                    <div className="pt-1 flex items-center justify-between gap-2">
                                      <span className="text-[10px] text-slate-500">
                                        Owner: <strong>{project.hubspotDeal.owner}</strong>
                                      </span>
                                      <a
                                        href={project.hubspotDeal.hubspotUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 hover:text-orange-900 hover:underline"
                                      >
                                        <ExternalLink className="w-3 h-3" /> Mở HubSpot
                                      </a>
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-slate-500">Chưa liên kết Deal CRM</p>
                                )}
                              </div>

                              {/* 8. Attivo DMS Documents Box */}
                              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                                <div className="flex items-center justify-between text-blue-800 font-bold border-b border-blue-200 pb-2">
                                  <span className="flex items-center gap-1.5">
                                    <FolderOpen className="w-4 h-4 text-blue-600" /> 8. Hồ Sơ DMS ({project.dmsDocuments?.length || 0})
                                  </span>
                                  <button
                                    onClick={() => onNavigateTab("dms")}
                                    className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold hover:bg-blue-200 transition"
                                  >
                                    Xem Kho DMS
                                  </button>
                                </div>
                                {project.dmsDocuments && project.dmsDocuments.length > 0 ? (
                                  <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                                    {project.dmsDocuments.map((doc) => (
                                      <div key={doc.id} className="p-1.5 bg-white rounded-lg border border-blue-100 flex items-center justify-between gap-1 text-[11px]">
                                        <span className="font-semibold text-slate-800 truncate" title={doc.name}>
                                          {doc.name}
                                        </span>
                                        <a
                                          href={doc.fileUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-blue-600 hover:text-blue-800 shrink-0 font-bold text-[10px]"
                                        >
                                          Drive
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-slate-500">Chưa có hồ sơ đính kèm trong DMS</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
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
        </div>
      </div>
    </div>
  );
}
