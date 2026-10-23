import React, { useState, useEffect } from "react";
import {
  Ship,
  Plane,
  Anchor,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Warehouse,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Building,
  Edit2,
  Eye,
  FileText,
  Share2,
  Check,
  Copy,
  Link2,
  FolderGit2,
  ClipboardCheck,
  UserCheck,
  ExternalLink,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  formatDate,
  getWarehouseBadge,
  getShipmentStatusBadge,
  getShortageBadge,
  formatCurrency,
} from "../utils/formatters";
import { getShareableLink, copyToClipboard, buildHash } from "../utils/navigation";
import { estimateShipmentLeadTime } from "../utils/slaEstimator";
import TaskShareReminderModal from "./TaskShareReminderModal";

export default function LogisticsHub({
  shipments,
  setShipments,
  projects = [],
  checklists = [],
  selectedPoId,
  selectedProjectId,
  onNavigateTab,
  showToast,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterShortage, setFilterShortage] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProject, setFilterProject] = useState(selectedProjectId || "all");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderItem, setReminderItem] = useState(null);
  const [drawerCopied, setDrawerCopied] = useState(false);

  // Sync selectedProjectId prop from route
  useEffect(() => {
    if (selectedProjectId) {
      setFilterProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Helper to resolve linked projects & their checklists for any shipment
  const getLinkedProjectsAndChecklistsForPo = (shipment) => {
    if (!shipment) return [];
    const pIds = shipment.projectIds || [];
    const pNames = (shipment.projects || []).map((p) => String(p).toLowerCase());

    const matchedProjects = (projects || []).filter((p) => {
      if (pIds.includes(p.id)) return true;
      const nameLower = String(p.name || "").toLowerCase();
      const idLower = String(p.id || "").toLowerCase();
      const custLower = String(p.customer || "").toLowerCase();
      return pNames.some(
        (pn) =>
          pn.includes(idLower) ||
          pn.includes(nameLower) ||
          nameLower.includes(pn) ||
          (custLower && pn.includes(custLower))
      );
    });

    return matchedProjects.map((p) => {
      const chk = (checklists || []).find((c) => c.projectId === p.id);
      const items = chk?.items || [];
      const passedCount = items.filter((i) => i.status === "pass" || i.status === "passed").length;
      const totalCount = items.length;
      const progressPct = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
      return {
        project: p,
        checklist: chk,
        passedCount,
        totalCount,
        progressPct,
        assignedTech: p.assignedTech || "Lương Nguyễn Tuấn Anh & Bùi Hoàng Thái Châu",
      };
    });
  };

  useEffect(() => {
    if (selectedPoId && shipments) {
      const found = shipments.find(
        (s) => s.id === selectedPoId || s.poCode === selectedPoId
      );
      if (found) {
        setSelectedShipment(found);
      }
    }
  }, [selectedPoId, shipments]);

  const openShipmentModal = (s) => {
    setSelectedShipment(s);
    if (typeof window !== "undefined") {
      window.location.hash = buildHash("logistics", { po: s.id });
    }
  };

  const closeShipmentModal = () => {
    setSelectedShipment(null);
    if (typeof window !== "undefined" && window.location.hash.includes("po=")) {
      window.location.hash = "#logistics";
    }
  };

  const handleCopyPoLink = async (s, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    const link = getShareableLink("logistics", { po: s.id });
    const ok = await copyToClipboard(link);
    if (ok) {
      if (showToast) showToast(`Đã sao chép link lô hàng PO: ${s.poCode}`);
    }
  };

  const handleSharePo = (s, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    setReminderItem({
      id: s.id,
      title: `PO ${s.poCode} (${s.brand}) - Kho ${s.warehouse === "BD" ? "Bình Dương" : "Đông Anh"}`,
      type: "logistics",
      assignee: "Phòng Logistics Attivo",
      deadline: s.eta ? `ETA: ${formatDate(s.eta)}` : "Trong tháng",
      status: s.statusNote || s.status,
      notes: `Dự án: ${(s.projects || []).join(", ")}. Tình trạng thiếu: ${s.shortageDetail || "Không thiếu hàng"}`,
      shareUrl: getShareableLink("logistics", { po: s.id }),
    });
    setShowReminderModal(true);
  };

  // New Shipment Form State
  const [newShipment, setNewShipment] = useState({
    brand: "Precor",
    poCode: "",
    selectedProjectIds: [],
    projectsText: "",
    poDate: new Date().toISOString().split("T")[0],
    eta: "",
    warehouse: "BD",
    method: "Sea",
    status: "ordering",
    statusNote: "Mới tạo đơn hàng PO",
    shortageStatus: "normal",
    shortageDetail: "",
    containers: "1x40HQ",
  });

  const filteredShipments = shipments.filter((item) => {
    const matchesSearch =
      item.poCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.projects.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.statusNote && item.statusNote.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesWarehouse = filterWarehouse === "all" || item.warehouse === filterWarehouse;
    const matchesMethod = filterMethod === "all" || item.method === filterMethod;
    const matchesShortage =
      filterShortage === "all" ||
      (filterShortage === "has_issue" && item.shortageStatus !== "normal") ||
      item.shortageStatus === filterShortage;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;

    const matchesProject = (() => {
      if (filterProject === "all") return true;
      if (item.projectIds && item.projectIds.includes(filterProject)) return true;
      const linked = getLinkedProjectsAndChecklistsForPo(item);
      return linked.some((l) => l.project.id === filterProject);
    })();

    return matchesSearch && matchesWarehouse && matchesMethod && matchesShortage && matchesStatus && matchesProject;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newShipment.poCode || !newShipment.brand) return;

    const projectList = newShipment.projectsText
      ? newShipment.projectsText.split(",").map((p) => p.trim()).filter(Boolean)
      : ["Dự án Tổng Hợp"];

    const created = {
      id: `SHIP-${Date.now().toString().slice(-4)}`,
      brand: newShipment.brand,
      poCode: newShipment.poCode,
      projectIds: newShipment.selectedProjectIds || [],
      projects: projectList,
      poDate: newShipment.poDate,
      eta: newShipment.eta || "TBU",
      warehouse: newShipment.warehouse,
      method: newShipment.method,
      status: newShipment.status,
      statusNote: newShipment.statusNote,
      shortageStatus: newShipment.shortageStatus,
      shortageDetail: newShipment.shortageDetail,
      containers: newShipment.containers,
      estimatedCost: 1000000000,
      itemsCount: 50,
    };

    setShipments([created, ...shipments]);
    setShowAddModal(false);
    setNewShipment({
      brand: "Precor",
      poCode: "",
      selectedProjectIds: [],
      projectsText: "",
      poDate: new Date().toISOString().split("T")[0],
      eta: "",
      warehouse: "BD",
      method: "Sea",
      status: "ordering",
      statusNote: "Mới tạo đơn hàng PO",
      shortageStatus: "normal",
      shortageDetail: "",
      containers: "1x40HQ",
    });
  };

  const handleUpdateStatus = (id, newStatus, newNote) => {
    setShipments(
      shipments.map((s) =>
        s.id === id
          ? {
              ...s,
              status: newStatus,
              statusNote: newNote || s.statusNote,
            }
          : s
      )
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white py-3 px-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">
            Vận Chuyển & Kho
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {filteredShipments.length} PO
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm transition shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo PO Mới</span>
          </button>
        </div>
      </div>

      {/* Shortage Risk Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Hãng Giao Thiếu (Vendor Shortage)
          </div>
          <p className="text-xs text-rose-950 leading-relaxed">
            PO <strong className="text-rose-900">ULS-AT2627-28-30 (Ziva)</strong>: Hãng báo thiếu 4 bộ rack giá để tạ Urethane - Đã yêu cầu chuyển phát Air bù về kho Bình Dương.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
          <div className="flex items-center gap-2 text-orange-800 font-bold text-xs uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5 text-orange-600" />
            Nội Bộ Đặt Bù (Internal Shortage)
          </div>
          <p className="text-xs text-orange-950 leading-relaxed">
            PO <strong className="text-orange-900">ULS-AT2625-26-30 (Ziva)</strong>: Chứa lô 12 cặp dumbbell đặt bù cho <strong className="text-orange-900">Vietcombank</strong> - Hàng đã về kho Đông Anh ngày 05/10.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="py-2.5 px-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã PO (ULS-AT...), hãng (Precor, Ziva...), dự án ghép, ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Dự Án ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.name}
              </option>
            ))}
          </select>

          <select
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Kho Nhận</option>
            <option value="DA">Kho Đông Anh (Hà Nội)</option>
            <option value="BD">Kho Bình Dương</option>
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Vận chuyển</option>
            <option value="Sea">Đi Tàu (Sea Freight)</option>
            <option value="Air">Đi Bay (Air Freight)</option>
          </select>

          <select
            value={filterShortage}
            onChange={(e) => setFilterShortage(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Trạng thái Hàng (Đủ/Thiếu)</option>
            <option value="has_issue">Có cảnh báo lệch hàng</option>
            <option value="vendor_shortage">Hãng giao thiếu</option>
            <option value="order_shortage">Order thiếu (Đặt bù)</option>
            <option value="normal">Đúng & Đủ</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Mọi trạng thái tiến độ</option>
            <option value="ordering">Đang đặt hàng</option>
            <option value="manufacturing">Đang sản xuất</option>
            <option value="shipping">Đang vận chuyển</option>
            <option value="customs">Đang hải quan</option>
            <option value="in_warehouse">Đã về kho (Nhập kho)</option>
          </select>
        </div>
      </div>

      {/* Active Project Filter Banner */}
      {filterProject !== "all" && (
        <div className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 font-semibold shadow-2xs">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-blue-600" />
            <span>
              Đang lọc các lô hàng PO cấp cho dự án:{" "}
              <strong>{projects.find((p) => p.id === filterProject)?.name || filterProject}</strong> ({filterProject})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFilterProject("all")}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
          >
            ✕ Xem tất cả PO
          </button>
        </div>
      )}

      {/* Main Shipments Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Hãng (Shipment)</th>
                <th className="py-3.5 px-4">Mã PO</th>
                <th className="py-3.5 px-4">Dự Án Ghép & Checklist Lắp Đặt</th>
                <th className="py-3.5 px-4">PO Date</th>
                <th className="py-3.5 px-4">ETA & Phương Thức</th>
                <th className="py-3.5 px-4 text-center">Est Time Hoàn Thành</th>
                <th className="py-3.5 px-4">Kho Nhận</th>
                <th className="py-3.5 px-4">Kiểm Soát Đúng/Thiếu</th>
                <th className="py-3.5 px-4">Trạng Thái & Ghi Chú</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredShipments.map((item) => {
                const wh = getWarehouseBadge(item.warehouse);
                const st = getShipmentStatusBadge(item.status);
                const shortage = getShortageBadge(item.shortageStatus);
                const linkedList = getLinkedProjectsAndChecklistsForPo(item);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition cursor-pointer"
                    onClick={() => openShipmentModal(item)}
                  >
                    {/* Brand */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs">
                        {item.brand}
                      </span>
                    </td>

                    {/* PO Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {item.poCode}
                    </td>

                    {/* Consolidated Projects & Checklist */}
                    <td className="py-3.5 px-4 max-w-sm">
                      {linkedList.length > 0 ? (
                        <div className="space-y-1.5">
                          {linkedList.map(({ project: p, checklist: chk, passedCount, totalCount, progressPct }) => (
                            <div key={p.id} className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateTab("projects", { id: p.id });
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold transition cursor-pointer"
                                title={`Mở hồ sơ dự án ${p.name}`}
                              >
                                <FolderGit2 className="w-3 h-3 text-blue-600" />
                                <span>{p.name}</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateTab("checklist", { project: p.id });
                                }}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                                  chk?.status === "ready"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                    : chk?.status === "warning"
                                    ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                                    : "bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100"
                                }`}
                                title="Mở checklist nghiệm thu lắp đặt của dự án này"
                              >
                                <ClipboardCheck className="w-3 h-3 text-cyan-700" />
                                <span>{totalCount > 0 ? `Checklist: ${passedCount}/${totalCount} Đạt (${progressPct}%)` : "Mở Checklist"}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {item.projects.map((proj, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                            >
                              {proj}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* PO Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                      {formatDate(item.poDate)}
                    </td>

                    {/* ETA & Method */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        {item.method === "Sea" ? (
                          <span className="flex items-center gap-1 text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded text-[11px] border border-sky-200">
                            <Anchor className="w-3 h-3" /> SEA
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] border border-indigo-200">
                            <Plane className="w-3 h-3" /> AIR
                          </span>
                        )}
                        <span className="text-xs">{formatDate(item.eta)}</span>
                      </div>
                    </td>

                    {/* Est Time Hoàn Thành */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      {(() => {
                        const lead = estimateShipmentLeadTime(item);
                        return (
                          <div className="inline-flex flex-col items-center">
                            <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-600" />
                              {lead.estHandoverDate ? formatDate(lead.estHandoverDate) : `${lead.totalLeadDays} ngày`}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Lead: ~{lead.totalLeadDays} ngày (+{lead.customsClearanceDays + lead.siteDeliveryDays}d kho/giao)
                            </span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Warehouse */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${wh.bg}`}>
                        {wh.short}
                      </span>
                    </td>

                    {/* Shortage Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${shortage.bg}`}
                        >
                          {item.shortageStatus !== "normal" && <AlertTriangle className="w-3 h-3" />}
                          {shortage.tag}
                        </span>
                        {item.shortageDetail && (
                          <p className="text-[11px] text-amber-800 max-w-xs truncate" title={item.shortageDetail}>
                            {item.shortageDetail}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status & Note */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs border font-medium mb-1 ${st.bg}`}>
                        {st.label}
                      </span>
                      <p className="text-xs text-slate-500 truncate" title={item.statusNote}>
                        {item.statusNote}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => handleCopyPoLink(item, e)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Sao chép liên kết PO"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleSharePo(item, e)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                          title="Nhắc việc / Gửi Zalo, Email"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openShipmentModal(item);
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                          title="Xem chi tiết & Cập nhật"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredShipments.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Details & Update Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  PO CHI TIẾT
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {selectedShipment.brand} - {selectedShipment.poCode}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dự án ghép: <strong className="text-slate-800">{selectedShipment.projects.join(", ")}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const link = getShareableLink("logistics", { po: selectedShipment.id });
                    const ok = await copyToClipboard(link);
                    if (ok) {
                      setDrawerCopied(true);
                      setTimeout(() => setDrawerCopied(false), 2000);
                      if (showToast) showToast(`Đã sao chép link lô hàng: ${selectedShipment.poCode}`);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    drawerCopied
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                  title="Sao chép link trực tiếp tới đơn hàng này"
                >
                  {drawerCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{drawerCopied ? "Đã chép link" : "Sao chép link"}</span>
                </button>
                <button
                  onClick={() => handleSharePo(selectedShipment)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                  title="Gửi thông báo Zalo hoặc Email"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Nhắc việc</span>
                </button>
                <button
                  onClick={closeShipmentModal}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Ngày Lên PO</span>
                <span className="font-bold text-slate-800 mt-1 block">{formatDate(selectedShipment.poDate)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">ETA Dự Kiến</span>
                <span className="font-bold text-sky-700 mt-1 block">{formatDate(selectedShipment.eta)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Kho Nhận Hàng</span>
                <span className="font-bold text-emerald-700 mt-1 block">
                  {getWarehouseBadge(selectedShipment.warehouse).name}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Phương Thức</span>
                <span className="font-bold text-indigo-700 mt-1 block">
                  {selectedShipment.method === "Sea" ? "Đường Biển (Sea)" : "Đường Hàng Không (Air)"}
                </span>
              </div>
            </div>

            {/* Est Time & Lead Time Milestone Card */}
            {(() => {
              const lead = estimateShipmentLeadTime(selectedShipment);
              return (
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Ước Tính Tiến Độ & Thời Gian Hoàn Thành (Lead Time / SLA Vận Chuyển)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                      Tổng Lead Time: ~{lead.totalLeadDays} ngày
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">1. SX & Vận chuyển cảng</span>
                      <strong className="text-slate-800 block mt-0.5">{lead.transitDays} ngày</strong>
                      <span className="text-[10px] text-slate-400">Đến ETA: {formatDate(selectedShipment.eta)}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">2. Hải quan & Về kho</span>
                      <strong className="text-slate-800 block mt-0.5">+{lead.customsClearanceDays} ngày làm việc</strong>
                      <span className="text-[10px] text-slate-400">Kho {selectedShipment.warehouse} nhận hàng</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">3. Giao dự án & Lắp đặt</span>
                      <strong className="text-emerald-700 block mt-0.5">+{lead.siteDeliveryDays} ngày bàn giao</strong>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        Hoàn thành: {lead.estHandoverDate ? formatDate(lead.estHandoverDate) : "Đang cập nhật"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Shortage section */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Tình Trạng Hàng Hóa Đối Chiếu</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getShortageBadge(selectedShipment.shortageStatus).bg}`}>
                  {getShortageBadge(selectedShipment.shortageStatus).label}
                </span>
              </div>
              {selectedShipment.shortageDetail ? (
                <p className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  {selectedShipment.shortageDetail}
                </p>
              ) : (
                <p className="text-xs text-slate-500">Không có phản ánh thiếu hàng. Hàng hóa khớp đúng theo packing list.</p>
              )}
            </div>

            {/* Linked Projects & Checklist card */}
            {(() => {
              const linked = getLinkedProjectsAndChecklistsForPo(selectedShipment);
              return (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FolderGit2 className="w-4 h-4 text-indigo-600" />
                      Chuỗi Liên Kết: Dự Án Nhận Hàng & Checklist Lắp Đặt Hiện Trường ({linked.length})
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Kho vận ↔ Dự án ↔ KTV</span>
                  </div>

                  {linked.length === 0 ? (
                    <div className="text-xs text-slate-500 italic bg-white p-3 rounded-lg border border-dashed border-slate-200">
                      Chưa gắn mã dự án trực tiếp. PO đang được chỉ định theo tên lô: {selectedShipment.projects?.join(", ") || "Hàng kho dự phòng"}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {linked.map(({ project: p, checklist: chk }) => {
                        const totalItems = chk?.items?.length || 0;
                        const passedItems = chk?.items?.filter((i) => i.status === "pass" || i.status === "passed")?.length || 0;
                        const isDone = totalItems > 0 && passedItems === totalItems;
                        return (
                          <div
                            key={p.id}
                            className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-300 transition shadow-2xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded text-[11px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {p.id}
                                </span>
                                <strong className="text-xs text-slate-900">{p.name}</strong>
                                <span className="text-[10px] text-slate-500">({p.customer || p.location || "TP.HCM"})</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
                                <span>Tiến độ: <strong className="text-slate-800 font-bold">{p.progress ?? p.checklistProgress ?? 0}%</strong></span>
                                <span>•</span>
                                <span>Giai đoạn: <strong className="text-slate-800 font-semibold">{p.stage || "Lắp đặt"}</strong></span>
                                <span>•</span>
                                <span>KTV phụ trách: <strong className="text-slate-800 font-semibold">{p.assignedTech || p.techLead || "Đội KTV ATV"}</strong></span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {chk ? (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                      isDone
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}
                                  >
                                    Checklist: {passedItems}/{totalItems} Đạt
                                  </span>
                                  <a
                                    href={`#checklist?project=${p.id}`}
                                    onClick={closeShipmentModal}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition"
                                  >
                                    <ClipboardCheck className="w-3.5 h-3.5" /> Mở Checklist
                                  </a>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Chưa tạo checklist</span>
                              )}
                              <a
                                href={`#projects?id=${p.id}`}
                                onClick={closeShipmentModal}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Xem Dự Án
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Fast status changer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Cập nhật nhanh trạng thái tiến độ:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: "ordering", label: "Đang đặt hàng" },
                  { key: "manufacturing", label: "Đang sản xuất" },
                  { key: "shipping", label: "Đang trên biển/bay" },
                  { key: "customs", label: "Đang làm hải quan" },
                  { key: "in_warehouse", label: "Đã nhập kho" },
                  { key: "dispatched", label: "Đã xuất công trình" },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => {
                      handleUpdateStatus(selectedShipment.id, st.key);
                      setSelectedShipment({ ...selectedShipment, status: st.key });
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      selectedShipment.status === st.key
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={closeShipmentModal}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add PO Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Tạo Đơn Hàng Mới (PO)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Hãng / Nhà sản xuất *</label>
                  <select
                    value={newShipment.brand}
                    onChange={(e) => setNewShipment({ ...newShipment, brand: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Precor">Precor (USA)</option>
                    <option value="Ziva">Ziva (Phụ kiện/Tạ)</option>
                    <option value="Merrithew">Merrithew (Pilates)</option>
                    <option value="Skelcore">Skelcore (USA)</option>
                    <option value="KOMPAN">KOMPAN (Đan Mạch)</option>
                    <option value="Vita">Vita</option>
                    <option value="Paviflex">Paviflex (Sàn Tây Ban Nha)</option>
                    <option value="Eleiko">Eleiko (Thụy Điển)</option>
                    <option value="Jrace">Jrace (Sàn Silicon PU)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Mã PO *</label>
                  <input
                    type="text"
                    placeholder="VD: ULS-AT2640"
                    required
                    value={newShipment.poCode}
                    onChange={(e) => setNewShipment({ ...newShipment, poCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">
                  Dự án nhận hàng liên kết (Chọn dự án hoặc nhập tay)
                </label>
                <div className="space-y-1.5">
                  <select
                    onChange={(e) => {
                      const pid = e.target.value;
                      if (!pid) return;
                      const selectedPrj = (projects || []).find((p) => p.id === pid);
                      if (!selectedPrj) return;
                      const currentSelectedIds = newShipment.selectedProjectIds || [];
                      if (!currentSelectedIds.includes(pid)) {
                        const nextIds = [...currentSelectedIds, pid];
                        const nextText = [
                          ...(newShipment.projectsText ? newShipment.projectsText.split(",").map((s) => s.trim()).filter(Boolean) : []),
                          selectedPrj.name,
                        ].join(", ");
                        setNewShipment({
                          ...newShipment,
                          selectedProjectIds: nextIds,
                          projectsText: nextText,
                        });
                      }
                      e.target.value = "";
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="">-- Chọn nhanh dự án liên kết --</option>
                    {(projects || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} - {p.name} ({p.customer || "Khách hàng"})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="VD: Grab Vietnam, Vietcombank bù, S3.45 Fulton"
                    value={newShipment.projectsText}
                    onChange={(e) => setNewShipment({ ...newShipment, projectsText: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                  {(newShipment.selectedProjectIds || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {newShipment.selectedProjectIds.map((pid) => {
                        const prj = (projects || []).find((p) => p.id === pid);
                        return (
                          <span
                            key={pid}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold"
                          >
                            <span>{pid}: {prj?.name || pid}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const nextIds = newShipment.selectedProjectIds.filter((id) => id !== pid);
                                setNewShipment({
                                  ...newShipment,
                                  selectedProjectIds: nextIds,
                                });
                              }}
                              className="text-indigo-400 hover:text-indigo-700 font-bold ml-0.5"
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">PO Date</label>
                  <input
                    type="date"
                    value={newShipment.poDate}
                    onChange={(e) => setNewShipment({ ...newShipment, poDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">ETA Dự Kiến Về Kho</label>
                  <input
                    type="date"
                    value={newShipment.eta}
                    onChange={(e) => setNewShipment({ ...newShipment, eta: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Kho Nhận Hàng *</label>
                  <select
                    value={newShipment.warehouse}
                    onChange={(e) => setNewShipment({ ...newShipment, warehouse: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="DA">Kho Đông Anh (Hà Nội)</option>
                    <option value="BD">Kho Bình Dương</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Hình thức vận chuyển *</label>
                  <select
                    value={newShipment.method}
                    onChange={(e) => setNewShipment({ ...newShipment, method: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Sea">Tàu Biển (Sea Freight)</option>
                    <option value="Air">Hàng Không (Air Freight)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Tình trạng lệch hàng</label>
                  <select
                    value={newShipment.shortageStatus}
                    onChange={(e) => setNewShipment({ ...newShipment, shortageStatus: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="normal">Đúng & Đủ</option>
                    <option value="vendor_shortage">Hãng giao thiếu</option>
                    <option value="order_shortage">Order thiếu (Đặt bù)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Quy mô Container / Kiện</label>
                  <input
                    type="text"
                    placeholder="VD: 1x40HQ hoặc Air Cargo 4 Pallets"
                    value={newShipment.containers}
                    onChange={(e) => setNewShipment({ ...newShipment, containers: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              {newShipment.shortageStatus !== "normal" && (
                <div>
                  <label className="text-amber-800 block mb-1 font-bold">
                    Chi tiết linh kiện / mặt hàng thiếu & giải pháp bù:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ghi rõ số lượng máy/phụ kiện bị thiếu, dự kiến bù bằng Air hay đơn tiếp..."
                    value={newShipment.shortageDetail}
                    onChange={(e) => setNewShipment({ ...newShipment, shortageDetail: e.target.value })}
                    className="w-full p-2.5 bg-amber-50/50 border border-amber-300 rounded-xl text-slate-900"
                  />
                </div>
              )}

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
                  Tạo Đơn Hàng PO
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
