import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  Camera,
  ClipboardCheck,
  Search,
  Plus,
  Calendar,
  User,
  MapPin,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Layers,
  Wrench,
  Tag,
  ExternalLink,
  Link2,
  Truck,
  Target,
  UserCheck,
  Star,
  Radio,
  LayoutGrid,
  Columns3,
  List,
  MessageSquare,
  Send,
  AtSign,
  Share2,
  Check,
  Copy,
  FileText,
  Palette,
  DollarSign,
  Ship,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import {
  formatDate,
  getProjectStageBadge,
  formatCurrency,
} from "../utils/formatters";
import { getShareableLink, copyToClipboard, buildHash } from "../utils/navigation";
import TaskShareReminderModal from "./TaskShareReminderModal";

const KANBAN_COLUMNS = [
  { key: "design", label: "Thiết kế 2D/3D", headerBg: "bg-purple-50 border-purple-200 text-purple-800", dot: "bg-purple-500" },
  { key: "site_prep", label: "Chuẩn bị MB / Nhập hàng", headerBg: "bg-sky-50 border-sky-200 text-sky-800", dot: "bg-sky-500", matchStages: ["site_prep", "ordering"] },
  { key: "handover_ready", label: "Bàn giao MB (Media)", headerBg: "bg-pink-50 border-pink-200 text-pink-800", dot: "bg-pink-500" },
  { key: "installation", label: "Đang lắp đặt máy", headerBg: "bg-cyan-50 border-cyan-200 text-cyan-800", dot: "bg-cyan-500" },
  { key: "maintenance", label: "Nghiệm thu & Bảo trì", headerBg: "bg-emerald-50 border-emerald-200 text-emerald-800", dot: "bg-emerald-500", matchStages: ["accepted", "maintenance"] },
];

const DEFAULT_ACTIVITY_LOGS = {
  "PRJ-001": [
    { id: "c1", author: "Lương Nguyễn Tuấn Anh (KTV)", role: "KTV HCM", time: "10/10 14:30", text: "@Hoai Trinh Đã lắp xong 6 máy Reformer Merrithew, sàn gỗ sạch sẽ sẵn sàng chụp hình." },
    { id: "c2", author: "Hoai Trinh", role: "Chuyên viên Kinh doanh Dự án", time: "11/10 09:15", text: "@Marketing Đã bật cờ Marketing Ready, khách đồng ý cho quay flycam sáng T2." },
  ],
  "PRJ-002": [
    { id: "c3", author: "Lương Nguyễn Tuấn Anh", role: "Lead KTV", time: "08/10 16:20", text: "@Hoai Trinh Đã cân chỉnh xong máy chạy Precor TRM631 và kết nối Wifi khu Villa." },
  ],
  "PRJ-004": [
    { id: "c4", author: "Sơn Nguyễn", role: "Phụ trách Dự án", time: "11/10 11:00", text: "@Kho ĐA Cont Precor ULS-AT2609-30 đã về kho, chuẩn bị xuất đi Hải Phòng ngày 18/10." },
  ],
};

export default function ProjectsTracker({
  projects,
  setProjects,
  onNavigateToChecklist,
  selectedProjectId,
  onNavigateTab,
  tenders = [],
  designTasks = [],
  collections = [],
  shipments = [],
  checklists = [],
  showToast,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [marketingOnly, setMarketingOnly] = useState(false);
  const [filterVip, setFilterVip] = useState("all"); // "all" | "vip" | "signal"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "kanban" | "table"
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [commentText, setCommentText] = useState("");

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderItem, setReminderItem] = useState(null);
  const [drawerCopied, setDrawerCopied] = useState(false);

  // Cross-functional linked data retriever (Links Projects to Tenders, Design, Finance, Logistics, Checklist)
  const getLinkedProjectData = (p) => {
    if (!p) return {};
    const pName = String(p.name || "").toLowerCase();
    const pCust = String(p.customer || "").toLowerCase();
    const pContract = String(p.contractCode || "").toLowerCase();

    // 1. Tender / Contract
    const linkedTender = (tenders || []).find((t) => {
      const tProj = String(t.project || "").toLowerCase();
      const tCode = String(t.contractCode || t.id || "").toLowerCase();
      const tNote = String(t.note || "").toLowerCase();
      const pBrand = String(p.brand || "").toLowerCase();
      return (
        (tProj && (tProj.includes(pName) || pName.includes(tProj))) ||
        (pContract && tCode && (pContract.includes(tCode) || tCode.includes(pContract))) ||
        (pBrand && tNote && tNote.includes(pBrand))
      );
    });

    // 2. Design 2D/3D
    const linkedDesign = (designTasks || []).find((d) => {
      const dProj = String(d.projectName || "").toLowerCase();
      return dProj && (dProj.includes(pName) || pName.includes(dProj));
    });

    // 3. Finance Collection
    const linkedCollections = (collections || []).filter((c) => {
      const cCust = String(c.customer || "").toLowerCase();
      const cProj = String(c.project || "").toLowerCase();
      return (
        (cCust && (cCust.includes(pCust) || pCust.includes(cCust) || cCust.includes(pName) || pName.includes(cCust))) ||
        (cProj && (cProj.includes(pName) || pName.includes(cProj)))
      );
    });
    const totalCollected = linkedCollections.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

    // 4. Logistics / Shipment PO
    const linkedShipment = (shipments || []).find((s) => {
      const hasMatch = (s.projects || []).some((sp) => {
        const spLower = String(sp || "").toLowerCase();
        return spLower.includes(pName) || pName.includes(spLower);
      });
      return hasMatch || (pContract && s.poCode && pContract.includes(String(s.poCode).toLowerCase()));
    });

    // 5. Checklist
    const linkedChecklist = (checklists || []).find((c) => c && c.projectId === p.id);

    return {
      linkedTender,
      linkedDesign,
      linkedCollections,
      totalCollected,
      linkedShipment,
      linkedChecklist,
    };
  };

  useEffect(() => {
    if (selectedProjectId && projects) {
      const found = projects.find((p) => p.id === selectedProjectId);
      if (found) {
        setSelectedProject(found);
      }
    }
  }, [selectedProjectId, projects]);

  const openProjectModal = (p) => {
    setSelectedProject(p);
    if (typeof window !== "undefined") {
      window.location.hash = buildHash("projects", { id: p.id });
    }
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    if (typeof window !== "undefined" && window.location.hash.includes("id=")) {
      window.location.hash = "#projects";
    }
  };

  const handleShareProject = (p, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    setReminderItem({
      id: p.id,
      title: p.name,
      type: "project",
      assignee: p.dealOwner || p.leadSale || p.assignedTech,
      deadline: p.handoverDate,
      status: p.stage,
      notes: p.marketingNote || "",
      shareUrl: getShareableLink("projects", { id: p.id }),
    });
    setShowReminderModal(true);
  };

  const handleCopyProjectLink = async (p, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    const link = getShareableLink("projects", { id: p.id });
    const ok = await copyToClipboard(link);
    if (ok && showToast) {
      showToast(`Đã sao chép liên kết dự án: ${p.name}`);
    }
  };

  // New Project Form State
  const [newProject, setNewProject] = useState({
    name: "",
    customer: "",
    contact: "",
    address: "",
    brand: "Precor",
    type: "Pilates Studio / Phòng tập Pilates",
    region: "HCM",
    contractCode: "",
    stage: "site_prep",
    handoverDate: "",
    installationDate: "",
    marketingReady: false,
    marketingNote: "",
    leadSale: "Hoài Trịnh",
    dealOwner: "Hoài Trịnh",
    contactOwner: "Hoài Trịnh",
    assignedTech: "Đội KTV HCM",
  });

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contractCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion = filterRegion === "all" || p.region === filterRegion;
    const matchesStage = filterStage === "all" || p.stage === filterStage;
    const matchesMarketing = !marketingOnly || p.marketingReady;
    const matchesVip =
      filterVip === "all" ||
      (filterVip === "vip" && Boolean(p.isVip)) ||
      (filterVip === "signal" && Boolean(p.signalSale));

    return matchesSearch && matchesRegion && matchesStage && matchesMarketing && matchesVip;
  });

  const handleToggleMarketing = (id, e) => {
    e.stopPropagation();
    setProjects(
      projects.map((p) =>
        p.id === id ? { ...p, marketingReady: !p.marketingReady } : p
      )
    );
  };

  const handleUpdateStage = (id, newStage) => {
    setProjects(
      projects.map((p) =>
        p.id === id ? { ...p, stage: newStage } : p
      )
    );
    if (selectedProject && selectedProject.id === id) {
      setSelectedProject({ ...selectedProject, stage: newStage });
    }
  };

  const getProjectComments = (proj) => {
    if (!proj) return [];
    return proj.activityComments || DEFAULT_ACTIVITY_LOGS[proj.id] || [];
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedProject) return;
    const existing = getProjectComments(selectedProject);
    const newEntry = {
      id: `cmt-${Date.now()}`,
      author: selectedProject.dealOwner || selectedProject.leadSale || "Điều phối viên",
      role: "Attivo Ops",
      time: "Vừa xong",
      text: commentText.trim(),
    };
    const updatedComments = [...existing, newEntry];
    setProjects(
      projects.map((p) =>
        p.id === selectedProject.id ? { ...p, activityComments: updatedComments } : p
      )
    );
    setSelectedProject({ ...selectedProject, activityComments: updatedComments });
    setCommentText("");
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newProject.name) return;

    const created = {
      id: `PRJ-${Date.now().toString().slice(-3)}`,
      ...newProject,
      checklistComplete: false,
      checklistProgress: 0,
      designer2D: "Hoàng Long",
      designer3D: "Thu Thảo",
    };

    setProjects([created, ...projects]);
    setShowAddModal(false);
    setNewProject({
      name: "",
      customer: "",
      contact: "",
      address: "",
      brand: "Precor",
      type: "Pilates Studio / Phòng tập Pilates",
      region: "HCM",
      contractCode: "",
      stage: "site_prep",
      handoverDate: "",
      installationDate: "",
      marketingReady: false,
      marketingNote: "",
      leadSale: "Hoài Trịnh",
      dealOwner: "Hoài Trịnh",
      contactOwner: "Hoài Trịnh",
      assignedTech: "Đội KTV HCM",
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">
            Danh Sách Dự Án
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {filteredProjects.length} Dự án
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterVip(filterVip === "vip" ? "all" : "vip")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
              filterVip === "vip"
                ? "bg-amber-500 border-amber-500 text-white shadow-xs"
                : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>VIP Leads ({projects.filter((p) => p.isVip).length})</span>
          </button>

          <button
            onClick={() => setFilterVip(filterVip === "signal" ? "all" : "signal")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
              filterVip === "signal"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Radar Signal ({projects.filter((p) => p.signalSale).length})</span>
          </button>

          <button
            onClick={() => setMarketingOnly(!marketingOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
              marketingOnly
                ? "bg-pink-600 border-pink-600 text-white shadow-xs"
                : "bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Marketing ({projects.filter((p) => p.marketingReady).length})</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Dự Án</span>
          </button>
        </div>
      </div>

      {/* Marketing Action Spotlight Banner */}
      <div className="p-4.5 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-white border border-pink-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-pink-100 text-pink-700">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                Quy Trình Bàn Giao Mặt Bằng & Marketing Quay Chụp
                <span className="px-2 py-0.5 rounded-full text-xs bg-pink-600 text-white font-bold">
                  {projects.filter((p) => p.marketingReady).length} Deal Sẵn Sàng
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-3xl leading-relaxed">
                Khi kỹ thuật & chủ đầu tư hoàn thiện vệ sinh mặt bằng / sàn phòng tập, hãy bật nhãn <strong>[Marketing Ready]</strong> để team Truyền thông chuẩn bị máy quay, flycam và mẫu tập đến ghi hình showroom/phòng gym hoàn thiện!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên dự án (Cà Na, Chateau Villa, Fulton...), khách hàng, địa chỉ, hợp đồng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Khu vực</option>
            <option value="HCM">Miền Nam (HCM / Tây Ninh / BD)</option>
            <option value="HN">Miền Bắc (Hà Nội / Hải Phòng)</option>
          </select>

          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Giai đoạn</option>
            <option value="site_prep">Chuẩn bị mặt bằng</option>
            <option value="handover_ready">Bàn giao mặt bằng (Marketing)</option>
            <option value="installation">Đang lắp đặt máy</option>
            <option value="maintenance">Hợp đồng bảo trì</option>
            <option value="design">Thiết kế 2D/3D</option>
          </select>

          {/* Zoho-inspired Multi-View Switcher: Grid / Kanban / Table */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === "grid"
                  ? "bg-white text-blue-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Dạng thẻ chi tiết"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Thẻ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === "kanban"
                  ? "bg-white text-blue-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Bảng Kanban theo giai đoạn"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === "table"
                  ? "bg-white text-blue-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Bảng danh sách gọn"
            >
              <List className="w-3.5 h-3.5" />
              <span>Bảng</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Projects Grid */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => {
            const stageBadge = getProjectStageBadge(p.stage);
            return (
              <div
                key={p.id}
                onClick={() => openProjectModal(p)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs relative group bg-white ${
                  p.marketingReady
                    ? "border-pink-300 ring-2 ring-pink-100 hover:border-pink-400"
                    : p.stage === "installation"
                    ? "border-cyan-300 ring-2 ring-cyan-100 hover:border-cyan-400"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Header tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${stageBadge.bg}`}>
                      {stageBadge.label}
                    </span>

                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {p.region === "HCM" ? "Miền Nam" : "Miền Bắc"}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-base group-hover:text-blue-600 transition">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{p.customer}</p>

                  {/* BigData Lead Score & SignalSale Origin */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {p.leadScore !== undefined && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                          p.leadScore >= 8.5
                            ? "bg-amber-50 text-amber-900 border-amber-200"
                            : p.leadScore >= 8.0
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span>{p.leadScore}/10</span>
                        {p.isVip && <span className="px-1 rounded text-[9px] bg-amber-200 text-amber-900 font-black">VIP</span>}
                      </span>
                    )}
                    {p.signalSale && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 truncate max-w-[180px]"
                        title={`${p.signalSale.source}: ${p.signalSale.keyword}`}
                      >
                        <Radio className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{p.signalSale.source.split('+')[0].trim()}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{p.address}</span>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Hợp đồng / Mã:</span>
                      <span className="font-mono font-bold text-slate-800">{p.contractCode}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Hãng máy chính:</span>
                      <span className="font-bold text-slate-900">{p.brand}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Ngày bàn giao MB:</span>
                      <span className="font-bold text-pink-700">{formatDate(p.handoverDate)}</span>
                    </div>
                  </div>

                  {/* Marketing Callout Box */}
                  {p.marketingReady && (
                    <div className="mt-3 p-3 rounded-xl bg-pink-50 border border-pink-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-pink-700">
                        <Camera className="w-4 h-4" />
                        <span>SẴN SÀNG QUAY CHỤP MARKETING</span>
                      </div>
                      <p className="text-pink-900 text-[11px] leading-relaxed">
                        {p.marketingNote || "Mặt bằng đã sẵn sàng, liên hệ Marketing xếp lịch máy quay!"}
                      </p>
                    </div>
                  )}

                  {/* Installation Checklist Banner if in installation */}
                  {p.stage === "installation" && (
                    <div className="mt-3 p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-cyan-900 block">Checklist Vật Tư Lắp Đặt</span>
                        <span className="text-[11px] text-cyan-700">
                          {p.checklistComplete ? "Đã kiểm đủ 100%" : `Đã kiểm tra ${p.checklistProgress}%`}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToChecklist(p.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Kiểm Hàng</span>
                      </button>
                    </div>
                  )}

                  {/* Operational Linkage Quick Badges */}
                  {(() => {
                    const linked = getLinkedProjectData(p);
                    return (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block w-full mb-0.5">
                          Liên Kết Nghiệp Vụ:
                        </span>
                        {/* 1. Tender */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateTab("tender", linked.linkedTender ? { tender: linked.linkedTender.id } : {});
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 transition"
                          title="Mở Báo Giá & Hợp Đồng"
                        >
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>{linked.linkedTender ? `HĐ: ${formatCurrency(linked.linkedTender.valueBeforeVat || 0)}` : "HĐ/Báo giá"}</span>
                        </button>

                        {/* 2. Design */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateTab("design", linked.linkedDesign ? { task: linked.linkedDesign.id } : {});
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold border border-purple-200 transition"
                          title="Mở Thiết Kế 2D/3D (Lý)"
                        >
                          <Palette className="w-3 h-3 text-purple-600" />
                          <span>{linked.linkedDesign ? `2D/3D (${linked.linkedDesign.designer2D || 'Lý'})` : "Bản vẽ 2D/3D"}</span>
                        </button>

                        {/* 3. Finance */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateTab("finance", { project: p.id });
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 transition"
                          title="Mở Tài Chính & Thu Tiền"
                        >
                          <DollarSign className="w-3 h-3 text-emerald-600" />
                          <span>{linked.totalCollected > 0 ? `Thu: ${formatCurrency(linked.totalCollected)}` : "Thu tiền"}</span>
                        </button>

                        {/* 4. Logistics */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateTab("logistics", linked.linkedShipment ? { po: linked.linkedShipment.poCode } : {});
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-semibold border border-cyan-200 transition"
                          title="Mở Vận Chuyển & Kho"
                        >
                          <Ship className="w-3 h-3 text-cyan-600" />
                          <span>{linked.linkedShipment ? `PO ${linked.linkedShipment.poCode} (${linked.linkedShipment.warehouse})` : "Lô PO kho"}</span>
                        </button>

                        {/* 5. Checklist */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToChecklist(p.id);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold border border-amber-200 transition"
                          title="Mở Checklist Vật Tư Lắp Đặt"
                        >
                          <ClipboardCheck className="w-3 h-3 text-amber-600" />
                          <span>{linked.linkedChecklist ? `BOM ${linked.linkedChecklist.items?.filter(i => i.status === 'pass').length || 0}/${linked.linkedChecklist.items?.length || 0}` : "Checklist BOM"}</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Bottom footer with Tripartite Ownership */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span title="Deal / Sale Owner (Sale phụ trách trực tiếp)" className="inline-flex items-center gap-1 text-[11px] text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        <Target className="w-3 h-3 text-emerald-600" />
                        <span>Deal: <strong className="text-slate-900">{p.leadSale || p.dealOwner || p.hubspotDeal?.owner}</strong></span>
                      </span>
                      <span title="Contact Owner (Người tạo/sở hữu contact)" className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        <UserCheck className="w-3 h-3 text-blue-600" />
                        <span>Contact: <strong className="text-slate-800">{p.contactOwner || p.hubspotContact?.contactOwner || "Marketing Attivo"}</strong></span>
                        {(p.contactOwner?.includes("Marketing") || p.hubspotContact?.source?.includes("Marketing") || p.hubspotContact?.channel?.includes("Facebook") || p.hubspotContact?.channel?.includes("Website") || p.hubspotContact?.channel?.includes("Hotline")) ? (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-purple-100 text-purple-700 font-bold border border-purple-200">Mkt Lead</span>
                        ) : (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">Sale tạo</span>
                        )}
                      </span>
                      <span title="KTV / Vé Giao Hàng" className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        <Truck className="w-3 h-3 text-amber-600" />
                        <span>KTV/Giao: <strong className="text-slate-800">{p.deliveryTicket?.assignedTech || p.assignedTech}</strong></span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleCopyProjectLink(p, e)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 border border-slate-200 transition"
                        title="Sao chép liên kết dự án"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleShareProject(p, e)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
                        title="Nhắc việc qua Zalo / Email"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleToggleMarketing(p.id, e)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                          p.marketingReady
                            ? "bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                        title="Bật/Tắt trạng thái báo Marketing quay chụp"
                      >
                        {p.marketingReady ? "✓ Đã Báo Media" : "+ Báo Media"}
                      </button>
                    </div>
                  </div>
                  {p.deliveryTicket && (
                    <div className="flex items-center justify-between bg-emerald-50/70 px-2.5 py-1.5 rounded-lg border border-emerald-200/80 text-[11px]">
                      <span className="inline-flex items-center gap-1.5 font-medium truncate text-emerald-900">
                        <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold">Vé giao hàng: #{p.deliveryTicket.ticketId}</span>
                        <span className="text-emerald-700 truncate">({p.deliveryTicket.status})</span>
                      </span>
                      <span className="text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        KTV: {p.deliveryTicket.ticketOwner}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Kanban Board (Zoho Board Style) */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3.5 overflow-x-auto pb-2">
          {KANBAN_COLUMNS.map((col, colIdx) => {
            const colProjects = filteredProjects.filter((p) =>
              col.matchStages ? col.matchStages.includes(p.stage) : p.stage === col.key
            );
            return (
              <div
                key={col.key}
                className="bg-slate-100/80 rounded-2xl border border-slate-200 p-3 flex flex-col min-h-[420px]"
              >
                <div className={`px-3 py-2 rounded-xl border font-bold text-xs flex items-center justify-between mb-3 ${col.headerBg}`}>
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${col.dot}`} />
                    <span className="truncate">{col.label}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/80 text-[11px] font-black">
                    {colProjects.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => openProjectModal(p)}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 shadow-2xs cursor-pointer transition space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {p.contractCode || p.id}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleCopyProjectLink(p, e)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition"
                            title="Sao chép link"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleShareProject(p, e)}
                            className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"
                            title="Nhắc việc Zalo/Email"
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                            {p.region}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 leading-snug">
                          {p.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{p.customer}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1.5 border-t border-slate-100">
                        <span className="truncate">
                          Sale: <strong>{p.leadSale || p.dealOwner}</strong>
                        </span>
                        {p.marketingReady && (
                          <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 font-bold flex items-center gap-0.5">
                            <Camera className="w-2.5 h-2.5" /> Media
                          </span>
                        )}
                      </div>

                      {/* Quick Stage Move Buttons */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        {colIdx > 0 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStage(p.id, KANBAN_COLUMNS[colIdx - 1].key);
                            }}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold"
                            title={`Lùi về: ${KANBAN_COLUMNS[colIdx - 1].label}`}
                          >
                            ← Lùi
                          </button>
                        ) : <span />}

                        {colIdx < KANBAN_COLUMNS.length - 1 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStage(p.id, KANBAN_COLUMNS[colIdx + 1].key);
                            }}
                            className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold"
                            title={`Chuyển sang: ${KANBAN_COLUMNS[colIdx + 1].label}`}
                          >
                            Chuyển bước →
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  {colProjects.length === 0 && (
                    <div className="py-10 text-center text-[11px] text-slate-400 italic">
                      Trống
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: Compact List Table (Zoho List Style) */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Dự Án / Khách Hàng</th>
                  <th className="py-3 px-3">Khu Vực</th>
                  <th className="py-3 px-3">Giai Đoạn</th>
                  <th className="py-3 px-3">Hãng / Mã HĐ</th>
                  <th className="py-3 px-3">Liên Kết 5 Phân Hệ</th>
                  <th className="py-3 px-3">Deal & Contact Owner</th>
                  <th className="py-3 px-3">KTV Phụ Trách</th>
                  <th className="py-3 px-3">Bàn Giao MB</th>
                  <th className="py-3 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProjects.map((p) => {
                  const stageBadge = getProjectStageBadge(p.stage);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => openProjectModal(p)}
                      className="hover:bg-blue-50/40 cursor-pointer transition"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {p.isVip && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-100 text-amber-800 font-black border border-amber-200">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{p.customer}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {p.region}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${stageBadge.bg}`}>
                          {stageBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{p.brand}</div>
                        <div className="text-[11px] font-mono text-slate-500">{p.contractCode}</div>
                      </td>
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const linked = getLinkedProjectData(p);
                          return (
                            <div className="flex items-center gap-1 flex-wrap max-w-[210px]">
                              <button
                                type="button"
                                onClick={() => onNavigateTab("tender", linked.linkedTender ? { tender: linked.linkedTender.id } : {})}
                                className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[10px] border border-blue-200 transition cursor-pointer"
                                title="Báo Giá / Hợp Đồng"
                              >
                                HĐ
                              </button>
                              <button
                                type="button"
                                onClick={() => onNavigateTab("design", linked.linkedDesign ? { task: linked.linkedDesign.id } : {})}
                                className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-[10px] border border-purple-200 transition cursor-pointer"
                                title="Thiết Kế 2D/3D (Lý)"
                              >
                                2D/3D
                              </button>
                              <button
                                type="button"
                                onClick={() => onNavigateTab("finance", { project: p.id })}
                                className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-[10px] border border-emerald-200 transition cursor-pointer"
                                title="Tài Chính Thu Tiền"
                              >
                                Thu tiền
                              </button>
                              <button
                                type="button"
                                onClick={() => onNavigateTab("logistics", linked.linkedShipment ? { po: linked.linkedShipment.poCode } : {})}
                                className="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-800 hover:bg-cyan-100 font-bold text-[10px] border border-cyan-200 transition cursor-pointer"
                                title="Vận Chuyển PO Kho"
                              >
                                PO Kho
                              </button>
                              <button
                                type="button"
                                onClick={() => onNavigateToChecklist(p.id)}
                                className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold text-[10px] border border-amber-200 transition cursor-pointer"
                                title="Checklist Lắp Đặt"
                              >
                                BOM
                              </button>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-800">
                          Deal: <strong>{p.leadSale || p.dealOwner}</strong>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Contact: {p.contactOwner}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {p.deliveryTicket?.assignedTech || p.assignedTech}
                      </td>
                      <td className="py-3 px-3 font-bold text-pink-700">
                        {formatDate(p.handoverDate)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleCopyProjectLink(p, e)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 transition"
                            title="Sao chép link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleShareProject(p, e)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                            title="Nhắc việc Zalo/Email"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleToggleMarketing(p.id, e)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                              p.marketingReady
                                ? "bg-pink-100 text-pink-800 border-pink-300"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {p.marketingReady ? "✓ Media Ready" : "+ Báo Media"}
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
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    CHI TIẾT DỰ ÁN
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-mono font-bold">
                    {selectedProject.id}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">{selectedProject.name}</h3>
                <p className="text-xs text-slate-500">{selectedProject.address}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    const link = getShareableLink("projects", { id: selectedProject.id });
                    const ok = await copyToClipboard(link);
                    if (ok) {
                      setDrawerCopied(true);
                      setTimeout(() => setDrawerCopied(false), 2500);
                      if (showToast) showToast(`Đã sao chép liên kết dự án ${selectedProject.name}!`);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    drawerCopied
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                  title="Sao chép liên kết trực tiếp tới dự án này"
                >
                  {drawerCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã chép link!</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Sao chép link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleShareProject(selectedProject)}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                  title="Gửi nhắc việc qua Telegram Bot, Zalo hoặc Email"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Nhắc việc (Telegram / Zalo)</span>
                </button>

                <button
                  onClick={closeProjectModal}
                  className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg hover:bg-slate-100 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Khách hàng / Liên hệ</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedProject.customer}</span>
                <span className="text-slate-600 block mt-1">{selectedProject.contact}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Kỹ thuật & Phân vùng</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedProject.assignedTech}</span>
                <span className="text-slate-600 block mt-1">Khu vực: {selectedProject.region}</span>
              </div>
            </div>

            {/* Stage Progress Selector */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Chuyển Giai Đoạn Dự Án:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { key: "design", label: "1. Thiết kế 2D/3D" },
                  { key: "ordering", label: "2. Đang nhập thiết bị" },
                  { key: "site_prep", label: "3. Chuẩn bị mặt bằng" },
                  { key: "handover_ready", label: "4. Bàn giao MB (Marketing)" },
                  { key: "installation", label: "5. Đang lắp đặt" },
                  { key: "accepted", label: "6. Nghiệm thu bàn giao" },
                  { key: "maintenance", label: "7. Hợp đồng bảo trì" },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => handleUpdateStage(selectedProject.id, st.key)}
                    className={`py-2 px-3 rounded-lg border font-bold transition ${
                      selectedProject.stage === st.key
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Marketing Note input */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-pink-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-pink-600" /> Kế Hoạch Quay Chụp Marketing:
                </label>
                <button
                  onClick={() => {
                    const updated = !selectedProject.marketingReady;
                    handleToggleMarketing(selectedProject.id, { stopPropagation: () => {} });
                    setSelectedProject({ ...selectedProject, marketingReady: updated });
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                    selectedProject.marketingReady
                      ? "bg-pink-600 text-white border-pink-600"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  {selectedProject.marketingReady ? "ĐANG BẬT BÁO MARKETING" : "CHƯA BẬT BÁO"}
                </button>
              </div>
              <textarea
                rows={2}
                value={selectedProject.marketingNote || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedProject({ ...selectedProject, marketingNote: val });
                  setProjects(
                    projects.map((p) =>
                      p.id === selectedProject.id ? { ...p, marketingNote: val } : p
                    )
                  );
                }}
                placeholder="Nhập ghi chú cho team Marketing: Góc quay đẹp, ngày hoàn thiện ánh sáng/sàn, thiết bị nổi bật cần review..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Tripartite Ownership Cross-reference Header in Modal */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-orange-50/70 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <UserCheck className="w-4 h-4 text-blue-600" /> Đối Soát Nhân Sự Phụ Trách (HubSpot CRM & Giao Hàng)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  ✓ Chuẩn Hóa Phân Quyền
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-1 text-emerald-700 font-bold text-[10px] uppercase">
                    <Target className="w-3.5 h-3.5" /> 1. Deal / Sale Owner
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-slate-900 text-xs">
                      {selectedProject.dealOwner || selectedProject.leadSale || selectedProject.hubspotDeal?.owner}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-100 text-blue-700 border border-blue-200">
                      Chuyên viên Kinh doanh Dự án
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    HubSpot Deal: #{selectedProject.hubspotDeal?.dealId || "—"}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-1 text-blue-700 font-bold text-[10px] uppercase">
                    <UserCheck className="w-3.5 h-3.5" /> 2. Contact Owner
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-slate-900 text-xs">
                      {selectedProject.contactOwner || selectedProject.hubspotContact?.contactOwner || "Marketing Attivo"}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      (selectedProject.contactOwner?.includes("Marketing") || selectedProject.hubspotContact?.source?.includes("Marketing") || selectedProject.hubspotContact?.channel?.includes("Facebook") || selectedProject.hubspotContact?.channel?.includes("Website") || selectedProject.hubspotContact?.channel?.includes("Hotline"))
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}>
                      {(selectedProject.contactOwner?.includes("Marketing") || selectedProject.hubspotContact?.source?.includes("Marketing") || selectedProject.hubspotContact?.channel?.includes("Facebook") || selectedProject.hubspotContact?.channel?.includes("Website") || selectedProject.hubspotContact?.channel?.includes("Hotline"))
                        ? "Nguồn Marketing Lead"
                        : "Sale Tự Tạo"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Khách: {selectedProject.hubspotContact?.name || selectedProject.contact}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-1 text-amber-700 font-bold text-[10px] uppercase">
                    <Truck className="w-3.5 h-3.5" /> 3. Vé Giao Hàng & KTV Lắp Đặt
                  </div>
                  <span className="font-bold text-slate-900 block mt-1 text-xs">
                    {selectedProject.deliveryTicket?.ticketOwner || selectedProject.assignedTech}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {selectedProject.deliveryTicket ? `Vé #${selectedProject.deliveryTicket.ticketId} (${selectedProject.deliveryTicket.status})` : selectedProject.assignedTech}
                  </span>
                </div>
              </div>
            </div>

            {/* Cross-Department Operations Linkage (Báo Giá/HĐ, Thiết Kế, Thu Tiền, Kho Vận, Checklist) */}
            {(() => {
              const modalLinked = getLinkedProjectData(selectedProject);
              return (
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Layers className="w-4 h-4 text-blue-600" /> Chuỗi Liên Kết Nghiệp Vụ Khép Kín (5 Phân Hệ Vận Hành)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      Đồng Bộ 100%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
                    {/* 1. Tender / Contract */}
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-blue-700 font-bold text-[10px] uppercase">
                          <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> 1. Báo Giá / HĐ</span>
                        </div>
                        <div className="font-bold text-slate-900 mt-1 text-xs truncate">
                          {modalLinked.linkedTender ? `${modalLinked.linkedTender.id} (${modalLinked.linkedTender.type})` : (selectedProject.contractCode || "Chưa có HĐ")}
                        </div>
                        <div className="text-blue-800 font-extrabold text-sm mt-0.5">
                          {modalLinked.linkedTender ? formatCurrency(modalLinked.linkedTender.valueBeforeVat || 0) : "Đang chào giá"}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Trạng thái: <strong>{modalLinked.linkedTender?.status || "Chờ ký"}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          closeProjectModal();
                          onNavigateTab("tender", modalLinked.linkedTender ? { tender: modalLinked.linkedTender.id } : {});
                        }}
                        className="mt-2.5 w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <span>Mở Báo Giá/HĐ</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 2. Design 2D/3D */}
                    <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-purple-700 font-bold text-[10px] uppercase">
                          <span className="flex items-center gap-1"><Palette className="w-3.5 h-3.5" /> 2. Bản Vẽ 2D/3D</span>
                        </div>
                        <div className="font-bold text-slate-900 mt-1 text-xs truncate">
                          {modalLinked.linkedDesign ? modalLinked.linkedDesign.taskDetail : `Bản vẽ dự án ${selectedProject.name}`}
                        </div>
                        <div className="text-purple-800 font-extrabold text-sm mt-0.5">
                          {modalLinked.linkedDesign ? `${modalLinked.linkedDesign.type2DCount || 1} 2D · ${modalLinked.linkedDesign.type3DCount || 1} 3D` : "1 Bản vẽ layout"}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Phụ trách: <strong>Designer {modalLinked.linkedDesign?.designer2D || selectedProject.designer2D || "Lý"}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          closeProjectModal();
                          onNavigateTab("design", modalLinked.linkedDesign ? { task: modalLinked.linkedDesign.id } : {});
                        }}
                        className="mt-2.5 w-full py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <span>Mở Bản Vẽ 2D/3D</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 3. Finance Collections */}
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-emerald-700 font-bold text-[10px] uppercase">
                          <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> 3. Tài Chính Thu Tiền</span>
                        </div>
                        <div className="font-bold text-slate-900 mt-1 text-xs truncate">
                          {selectedProject.customer}
                        </div>
                        <div className="text-emerald-700 font-extrabold text-sm mt-0.5">
                          {modalLinked.totalCollected > 0 ? formatCurrency(modalLinked.totalCollected) : "Chưa phát sinh thu"}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Số phiếu thu: <strong>{modalLinked.linkedCollections.length} đợt</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          closeProjectModal();
                          onNavigateTab("finance", { project: selectedProject.id });
                        }}
                        className="mt-2.5 w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <span>Mở Sổ Thu Tiền</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 4. Logistics & Shipments */}
                    <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-cyan-800 font-bold text-[10px] uppercase">
                          <span className="flex items-center gap-1"><Ship className="w-3.5 h-3.5" /> 4. Vận Chuyển Kho</span>
                        </div>
                        <div className="font-bold text-slate-900 mt-1 text-xs truncate">
                          {modalLinked.linkedShipment ? `PO ${modalLinked.linkedShipment.poCode} (${modalLinked.linkedShipment.brand})` : `PO Lô Hàng ${selectedProject.brand}`}
                        </div>
                        <div className="text-cyan-800 font-extrabold text-sm mt-0.5">
                          {modalLinked.linkedShipment ? `Kho ${modalLinked.linkedShipment.warehouse === 'DA' ? 'Đông Anh' : 'Bình Dương'}` : "Đang điều phối"}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Trạng thái: <strong>{modalLinked.linkedShipment?.statusNote || "Đang xử lý"}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          closeProjectModal();
                          onNavigateTab("logistics", modalLinked.linkedShipment ? { po: modalLinked.linkedShipment.poCode } : {});
                        }}
                        className="mt-2.5 w-full py-1.5 px-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <span>Mở Lô Hàng Kho</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 5. Checklist Lắp Đặt */}
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-amber-800 font-bold text-[10px] uppercase">
                          <span className="flex items-center gap-1"><ClipboardCheck className="w-3.5 h-3.5" /> 5. Checklist BOM</span>
                        </div>
                        <div className="font-bold text-slate-900 mt-1 text-xs truncate">
                          {modalLinked.linkedChecklist ? `Kiểm: ${modalLinked.linkedChecklist.verifier || selectedProject.assignedTech}` : "Checklist linh kiện"}
                        </div>
                        <div className="text-amber-900 font-extrabold text-sm mt-0.5">
                          {modalLinked.linkedChecklist ? `${modalLinked.linkedChecklist.items?.filter(i => i.status === 'pass').length || 0}/${modalLinked.linkedChecklist.items?.length || 0} Đạt` : `${selectedProject.checklistProgress || 0}% Đạt`}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Đánh giá: <strong>{modalLinked.linkedChecklist?.status === 'ready' ? "Đủ điều kiện" : "Cần lưu ý/thiếu"}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          closeProjectModal();
                          onNavigateToChecklist(selectedProject.id);
                        }}
                        className="mt-2.5 w-full py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <span>Mở Checklist</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* BigData Lead Scoring & SignalSale Radar Section */}
            {(selectedProject.leadScore !== undefined || selectedProject.signalSale) && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/70 via-indigo-50/50 to-white border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-amber-100 text-amber-800">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
                    </span>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                      Đánh Giá Tiềm Năng (BigData) & Radar Tín Hiệu (SignalSale)
                    </span>
                  </div>
                  {selectedProject.isVip && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-xs">
                      ⭐ VIP KEY ACCOUNT
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  {/* BigData Score */}
                  <div className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs">
                    <span className="text-[11px] text-slate-400 block font-semibold">Điểm Tiềm Năng (RFM Score):</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-black text-amber-700">
                        {selectedProject.leadScore}/10
                      </span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${((selectedProject.leadScore || 0) / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Phân khúc: <strong>{selectedProject.rfmSegment || "Tiêu Chuẩn"}</strong>
                    </span>
                  </div>

                  {/* VIP Reason */}
                  <div className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs md:col-span-2">
                    <span className="text-[11px] text-slate-400 block font-semibold">Đánh Giá & Phân Loại:</span>
                    <p className="font-semibold text-slate-800 text-xs mt-1">
                      {selectedProject.vipReason || "Dự án khách hàng chuẩn quy mô Attivo"}
                    </p>
                    {selectedProject.signalSale && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-indigo-700 font-bold flex items-center gap-1 truncate pr-2">
                          <Radio className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate">Nguồn: {selectedProject.signalSale.source}</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shrink-0">
                          Intent: {selectedProject.signalSale.intentScore}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* HubSpot CRM 360 Integration Info */}
            {selectedProject.hubspotDeal && (
              <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-orange-100 text-orange-700">
                      <Link2 className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-orange-950 uppercase tracking-wider">
                      HubSpot Deal & Tickets Liên Kết
                    </span>
                  </div>
                  <a
                    href={selectedProject.hubspotDeal.hubspotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold border border-orange-200 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Mở HubSpot
                  </a>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-orange-100">
                    <span className="text-[11px] text-slate-400 block">Mã Deal HubSpot:</span>
                    <span className="font-mono font-bold text-slate-700 block mt-0.5">
                      #{selectedProject.hubspotDeal.dealId}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-orange-100">
                    <span className="text-[11px] text-slate-400 block">Doanh số:</span>
                    <span className="font-bold text-emerald-700 block mt-0.5">
                      {formatCurrency(selectedProject.hubspotDeal.amount)}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-orange-100">
                    <span className="text-[11px] text-slate-400 block">Giai đoạn:</span>
                    <span className="font-bold text-blue-700 block mt-0.5">
                      {selectedProject.hubspotDeal.stage}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-orange-100">
                    <span className="text-[11px] text-slate-400 block">Nguồn Lead:</span>
                    <span className={`font-bold block mt-0.5 ${selectedProject.hubspotDeal.source === "Marketing" ? "text-emerald-700" : "text-slate-700"}`}>
                      {selectedProject.hubspotDeal.source === "Marketing" ? "Marketing Lead" : "Sales Direct"}
                    </span>
                  </div>
                </div>

                {selectedProject.hubspotTickets && selectedProject.hubspotTickets.length > 0 && (
                  <div className="pt-2 border-t border-orange-200/60">
                    <span className="text-[11px] font-bold text-orange-900 block mb-1.5">
                      Vé Kỹ Thuật (AT Technical Dept):
                    </span>
                    <div className="space-y-1.5">
                      {selectedProject.hubspotTickets.map((t) => (
                        <div
                          key={t.ticketId}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-orange-100 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              #{t.ticketId}
                            </span>
                            <span className="font-semibold text-slate-800 truncate">{t.subject}</span>
                          </div>
                          <a
                            href={t.hubspotUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-800 shrink-0"
                          >
                            Chi tiết <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Zoho-inspired Contextual Activity Feed & @Mentions */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-blue-600" /> Nhật Ký Phối Hợp & Bình Luận (@Mentions)
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {getProjectComments(selectedProject).length} trao đổi
                </span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {getProjectComments(selectedProject).length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-2 text-center">
                    Chưa có ghi chú trao đổi nào. Tag @Sale, @KTV hoặc @Marketing để phối hợp nhanh.
                  </div>
                ) : (
                  getProjectComments(selectedProject).map((c) => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{c.author}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold">
                            {c.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{c.time}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Quick @Mention Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5 font-semibold">
                  <AtSign className="w-3 h-3" /> Tag nhanh:
                </span>
                {["@Hoài Trịnh", "@Tuấn Anh (KTV)", "@Marketing", "@Kho ĐA/BD"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCommentText((prev) => `${prev ? prev + " " : ""}${tag} `)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 font-semibold transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Nhập cập nhật tiến độ hoặc @tag bộ phận liên quan..."
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi</span>
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {selectedProject.stage === "installation" ? (
                <button
                  onClick={() => {
                    const id = selectedProject.id;
                    closeProjectModal();
                    onNavigateToChecklist(id);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <ClipboardCheck className="w-4 h-4" /> Mở Checklist Vật Tư Dự Án Này
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={closeProjectModal}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Khởi Tạo Dự Án Mới
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
                <label className="text-slate-700 block mb-1 font-bold">Tên Dự Án *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Cà Na Pilates Tây Ninh"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Khách Hàng / Đơn vị</label>
                  <input
                    type="text"
                    placeholder="VD: Mr. Vũ - Hung Duy Group"
                    value={newProject.customer}
                    onChange={(e) => setNewProject({ ...newProject, customer: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    placeholder="VD: 0327794884"
                    value={newProject.contact}
                    onChange={(e) => setNewProject({ ...newProject, contact: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Địa chỉ công trình</label>
                <input
                  type="text"
                  placeholder="Số nhà, đường, phường, quận/tỉnh..."
                  value={newProject.address}
                  onChange={(e) => setNewProject({ ...newProject, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Khu vực</label>
                  <select
                    value={newProject.region}
                    onChange={(e) => setNewProject({ ...newProject, region: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="HCM">Miền Nam (HCM)</option>
                    <option value="HN">Miền Bắc (HN)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Hãng máy chính</label>
                  <input
                    type="text"
                    placeholder="Precor, Merrithew..."
                    value={newProject.brand}
                    onChange={(e) => setNewProject({ ...newProject, brand: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Mã Hợp Đồng / PO</label>
                  <input
                    type="text"
                    placeholder="VD: ATVE25135"
                    value={newProject.contractCode}
                    onChange={(e) => setNewProject({ ...newProject, contractCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Giai đoạn hiện tại</label>
                  <select
                    value={newProject.stage}
                    onChange={(e) => setNewProject({ ...newProject, stage: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="design">Thiết kế 2D/3D</option>
                    <option value="ordering">Đang nhập thiết bị</option>
                    <option value="site_prep">Chuẩn bị mặt bằng</option>
                    <option value="handover_ready">Bàn giao MB (Marketing)</option>
                    <option value="installation">Đang lắp đặt máy</option>
                    <option value="maintenance">Hợp đồng bảo trì</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Ngày bàn giao MB dự kiến</label>
                  <input
                    type="date"
                    value={newProject.handoverDate}
                    onChange={(e) => setNewProject({ ...newProject, handoverDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-pink-50 border border-pink-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="mktCheck"
                    checked={newProject.marketingReady}
                    onChange={(e) => setNewProject({ ...newProject, marketingReady: e.target.checked })}
                    className="rounded text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="mktCheck" className="text-xs font-bold text-pink-800">
                    Bật cảnh báo cho team Marketing chuẩn bị quay chụp ngay
                  </label>
                </div>
                {newProject.marketingReady && (
                  <input
                    type="text"
                    placeholder="Ghi chú nội dung quay chụp cho marketing..."
                    value={newProject.marketingNote}
                    onChange={(e) => setNewProject({ ...newProject, marketingNote: e.target.value })}
                    className="w-full p-2 bg-white border border-pink-300 rounded-lg text-xs text-slate-900"
                  />
                )}
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
                  Lưu Dự Án
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share and Remind Modal (Zalo / Email / Link) */}
      {reminderItem && (
        <TaskShareReminderModal
          isOpen={showReminderModal}
          onClose={() => {
            setShowReminderModal(false);
            setReminderItem(null);
          }}
          title={reminderItem.title}
          id={reminderItem.id}
          type={reminderItem.type}
          assignee={reminderItem.assignee}
          deadline={reminderItem.deadline}
          status={reminderItem.status}
          notes={reminderItem.notes}
          shareUrl={reminderItem.shareUrl}
        />
      )}
    </div>
  );
}
