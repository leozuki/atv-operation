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
  FolderGit2,
  ExternalLink,
  ArrowRight,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
} from "lucide-react";
import { formatCurrency, formatShortCurrency } from "../utils/formatters";
import { getShareableLink, copyToClipboard, findMatchedProject } from "../utils/navigation";
import TaskShareReminderModal from "./TaskShareReminderModal";

export default function TenderManager({
  tenders = [],
  setTenders,
  projects = [],
  setProjects,
  selectedTenderId,
  currentUser,
  onNavigateTab,
  showToast,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLinked, setFilterLinked] = useState("all"); // "all" | "linked" | "unlinked"
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderItem, setReminderItem] = useState(null);

  // Modal mode: "new" (tạo mới dự án & báo giá) or "existing" (chọn từ dự án đã có)
  const [dealCreationMode, setDealCreationMode] = useState("existing");
  const [autoCreateProject, setAutoCreateProject] = useState(true);

  const [newDeal, setNewDeal] = useState({
    projectId: "",
    project: "",
    customer: "",
    note: "",
    type: "Quotation",
    valueBeforeVat: "",
    status: "New",
    subType: "Báo giá thiết bị",
    region: "HCM",
    contractCode: "",
  });

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

  const newQuotations = tenders.filter((t) => t.type === "Quotation" && t.status === "New");
  const totalNewQuotationsVal = newQuotations.reduce((sum, t) => sum + (t.valueBeforeVat || 0), 0);

  const reviseQuotations = tenders.filter((t) => t.type === "Quotation" && t.status === "Revise");
  const totalReviseQuotationsVal = reviseQuotations.reduce((sum, t) => sum + (t.valueBeforeVat || 0), 0);

  const newContracts = tenders.filter((t) => t.type === "Contract" && t.status === "New");
  const totalNewContractsVal = newContracts.reduce((sum, t) => sum + (t.valueBeforeVat || 0), 0);

  const otherDeals = tenders.filter((t) => t.type === "Other");

  // Filtered tenders with linked project checking
  const filteredTenders = tenders.filter((t) => {
    const matched = findMatchedProject(t, projects);
    const matchesSearch =
      (t.project && t.project.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.subType && t.subType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (matched && matched.name && matched.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (matched && matched.id && matched.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === "all" || t.type === filterType;
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    const matchesLinked =
      filterLinked === "all" ||
      (filterLinked === "linked" && Boolean(matched)) ||
      (filterLinked === "unlinked" && !matched);

    return matchesSearch && matchesType && matchesStatus && matchesLinked;
  });

  // Action: Tự động tạo Hồ sơ Dự Án mới từ 1 hàng Báo Giá / Hợp Đồng chưa có Dự Án
  const handleCreateProjectFromTender = (t) => {
    if (!setProjects) return;

    // Clean name from code prefix if any
    const rawName = t.project || "Dự án mới";
    const cleanName = rawName.replace(/^[A-Z0-9_-]+\s*[-:]\s*/i, "").trim() || rawName;
    const isHN =
      rawName.includes("HN") ||
      rawName.includes("Hà Nội") ||
      rawName.includes("Hải Phòng") ||
      rawName.includes("Quảng Ninh") ||
      rawName.includes("Bắc Ninh");
    const region = isHN ? "HN" : "HCM";
    const newId = `PRJ-${Date.now().toString().slice(-3)}`;
    const contractCode = t.contractCode || (t.type === "Contract" ? `ATV-${Date.now().toString().slice(-4)}` : "");

    const createdProject = {
      id: newId,
      name: cleanName,
      customer: cleanName,
      contact: `Đại diện ${cleanName}`,
      address: isHN ? "Khu vực Miền Bắc" : "Khu vực Miền Nam",
      brand: t.note || "Precor",
      type: t.subType || (t.type === "Contract" ? "Phòng tập Gym cao cấp" : "Phòng tập Pilates"),
      region: region,
      contractCode: contractCode,
      stage: t.type === "Contract" ? "ordering" : "design",
      handoverDate: "",
      installationDate: "",
      marketingReady: false,
      marketingNote: "",
      leadSale: currentUser?.name || "Hoài Trịnh",
      dealOwner: currentUser?.name || "Hoài Trịnh",
      contactOwner: currentUser?.name || "Hoài Trịnh",
      assignedTech: isHN ? "Đội KTV Hà Nội" : "Đội KTV HCM",
      checklistComplete: false,
      checklistProgress: 0,
      designer2D: "Lý",
      designer3D: "Lý",
      hubspotDeal: {
        id: `DEAL-${Date.now().toString().slice(-4)}`,
        dealname: t.project,
        amount: t.valueBeforeVat || 0,
        dealstage: t.type === "Contract" ? "contractsent" : "presentationscheduled",
        dealOwner: currentUser?.name || "Hoài Trịnh",
        pipeline: "default",
      },
    };

    // Update projects list
    setProjects((prev) => [createdProject, ...prev]);

    // Update tender record to establish direct link
    if (setTenders) {
      setTenders((prev) =>
        prev.map((item) =>
          item.id === t.id
            ? { ...item, projectId: newId, contractCode: contractCode || item.contractCode }
            : item
        )
      );
    }

    if (showToast) {
      showToast(`✓ Đã tạo thành công Hồ Sơ Dự Án [${newId}] ${createdProject.name}!`);
    }

    // Automatically navigate to the newly created project profile
    if (onNavigateTab) {
      onNavigateTab("projects", { id: newId });
    }
  };

  // Submit modal tạo Báo Giá / Hợp Đồng mới
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newDeal.project.trim()) return;

    let linkedProjectId = newDeal.projectId || null;
    let contractCode = newDeal.contractCode || "";

    // Nếu chọn chế độ tạo dự án mới và có tích checkbox autoCreateProject
    if (dealCreationMode === "new" && autoCreateProject && !linkedProjectId && setProjects) {
      const rawName = newDeal.project.trim();
      const cleanName = rawName.replace(/^[A-Z0-9_-]+\s*[-:]\s*/i, "").trim() || rawName;
      const isHN =
        newDeal.region === "HN" ||
        rawName.includes("HN") ||
        rawName.includes("Hà Nội") ||
        rawName.includes("Hải Phòng");
      const region = isHN ? "HN" : "HCM";
      linkedProjectId = `PRJ-${Date.now().toString().slice(-3)}`;
      contractCode = contractCode || (newDeal.type === "Contract" ? `ATV-${Date.now().toString().slice(-4)}` : "");

      const created = {
        id: linkedProjectId,
        name: cleanName,
        customer: newDeal.customer.trim() || cleanName,
        contact: `Đại diện ${newDeal.customer.trim() || cleanName}`,
        address: isHN ? "Khu vực Miền Bắc" : "Khu vực Miền Nam",
        brand: newDeal.note.trim() || "Precor",
        type: newDeal.subType || "Phòng tập Gym / Pilates",
        region: region,
        contractCode: contractCode,
        stage: newDeal.type === "Contract" ? "ordering" : "design",
        handoverDate: "",
        installationDate: "",
        marketingReady: false,
        marketingNote: "",
        leadSale: currentUser?.name || "Hoài Trịnh",
        dealOwner: currentUser?.name || "Hoài Trịnh",
        contactOwner: currentUser?.name || "Hoài Trịnh",
        assignedTech: isHN ? "Đội KTV Hà Nội" : "Đội KTV HCM",
        checklistComplete: false,
        checklistProgress: 0,
        designer2D: "Lý",
        designer3D: "Lý",
        hubspotDeal: {
          id: `DEAL-${Date.now().toString().slice(-4)}`,
          dealname: newDeal.project,
          amount: Number(newDeal.valueBeforeVat) || 0,
          dealstage: newDeal.type === "Contract" ? "contractsent" : "presentationscheduled",
          dealOwner: currentUser?.name || "Hoài Trịnh",
          pipeline: "default",
        },
      };

      setProjects((prev) => [created, ...prev]);
    }

    const dealToAdd = {
      id: Date.now(),
      projectId: linkedProjectId,
      contractCode: contractCode,
      project: newDeal.project,
      note: newDeal.note,
      type: newDeal.type,
      valueBeforeVat: Number(newDeal.valueBeforeVat) || 0,
      status: newDeal.status || "New",
      subType: newDeal.subType,
    };

    setTenders((prev) => [dealToAdd, ...(prev || [])]);
    setShowAddModal(false);

    if (showToast) {
      if (linkedProjectId && dealCreationMode === "new") {
        showToast(`✓ Đã tạo Deal mới và tự động tạo Hồ Sơ Dự Án [${linkedProjectId}]!`);
      } else {
        showToast(`✓ Đã lưu Báo giá/Hợp đồng liên kết với Dự Án thành công!`);
      }
    }

    // Reset Form
    setNewDeal({
      projectId: "",
      project: "",
      customer: "",
      note: "",
      type: "Quotation",
      valueBeforeVat: "",
      status: "New",
      subType: "Báo giá thiết bị",
      region: "HCM",
      contractCode: "",
    });
    setDealCreationMode("existing");
    setAutoCreateProject(true);
  };

  // Chọn dự án có sẵn từ dropdown
  const handleSelectExistingProject = (projId) => {
    if (!projId) {
      setNewDeal({
        ...newDeal,
        projectId: "",
        project: "",
        customer: "",
        note: "",
        contractCode: "",
      });
      return;
    }
    const p = projects.find((item) => item.id === projId);
    if (!p) return;

    setNewDeal({
      ...newDeal,
      projectId: p.id,
      project: `${p.contractCode ? p.contractCode + " - " : ""}${p.name}`,
      customer: p.customer || p.name,
      note: p.brand || "",
      contractCode: p.contractCode || "",
      subType: p.type || "Báo giá thiết bị",
      type: p.contractCode ? "Contract" : "Quotation",
      valueBeforeVat: p.hubspotDeal?.amount || newDeal.valueBeforeVat || "",
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Báo Giá & Hợp Đồng
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              Đồng bộ 2 chiều với Dự Án
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Liên kết trực tiếp từng gói thầu với Hồ sơ Dự Án • Tự động tạo Dự Án mới khi có Báo giá / Hợp đồng
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(!currentUser?.roleId || ["admin", "sales_lead", "finance_lead", "sales_rep"].includes(currentUser.roleId)) && (
            <button
              onClick={() => {
                setShowAddModal(true);
                setDealCreationMode("existing");
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
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
              Báo Giá Mới (Quotations)
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
              Hợp Đồng Ký (Contracts)
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
            placeholder="Tìm dự án, mã PRJ, hợp đồng, hãng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={filterLinked}
            onChange={(e) => setFilterLinked(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Liên Kết Dự Án</option>
            <option value="linked">✓ Đã có Dự Án ({tenders.filter((t) => findMatchedProject(t, projects)).length})</option>
            <option value="unlinked">⚠ Chưa tạo Dự Án ({tenders.filter((t) => !findMatchedProject(t, projects)).length})</option>
          </select>

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
                <th className="py-3.5 px-4 min-w-[260px]">Dự Án & Hồ Sơ Liên Kết</th>
                <th className="py-3.5 px-4">Ghi Chú Hãng (Note)</th>
                <th className="py-3.5 px-4">Loại (Type)</th>
                <th className="py-3.5 px-4 text-right">Giá Trị Trước VAT (VNĐ)</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-center w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredTenders.map((t) => {
                const isContract = t.type === "Contract";
                const isQuotation = t.type === "Quotation";
                const isSelected = String(selectedTenderId) === String(t.id);
                const matchedProject = findMatchedProject(t, projects);

                return (
                  <tr
                    key={t.id}
                    id={`tender-${t.id}`}
                    className={`hover:bg-slate-50 transition ${
                      isSelected
                        ? "ring-2 ring-blue-500 bg-blue-50/60"
                        : t.status === "New" && isContract
                        ? "bg-emerald-50/30"
                        : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                      {t.id}
                    </td>

                    {/* Dự Án (Project) Column with Bidirectional Link & Create Action */}
                    <td className="py-3.5 px-4">
                      {matchedProject ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onNavigateTab("projects", { id: matchedProject.id })}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-[11px] border border-blue-200 transition group cursor-pointer shadow-2xs"
                              title={`Click để mở trang hồ sơ dự án: ${matchedProject.name}`}
                            >
                              <FolderGit2 className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition" />
                              <span>{matchedProject.id}</span>
                              <ExternalLink className="w-3 h-3 text-blue-500 opacity-70 group-hover:opacity-100" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onNavigateTab("projects", { id: matchedProject.id })}
                              className="font-bold text-slate-900 hover:text-blue-600 text-left cursor-pointer transition flex items-center gap-1"
                              title={`Mở hồ sơ dự án ${matchedProject.name}`}
                            >
                              <span className="truncate max-w-[220px]">{t.project}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Khớp: {matchedProject.name}</span>
                            </span>
                            {t.subType && (
                              <span className="text-slate-500 font-medium truncate max-w-[180px]">
                                • {t.subType}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="truncate max-w-[240px]">{t.project}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                              <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                              Chưa có Hồ Sơ Dự Án
                            </span>

                            {setProjects && (
                              <button
                                type="button"
                                onClick={() => handleCreateProjectFromTender(t)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs active:scale-95"
                                title="Tự động tạo hồ sơ Dự Án mới từ gói Báo giá này"
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ Tự tạo Dự Án</span>
                              </button>
                            )}
                          </div>

                          {t.subType && (
                            <span className="block text-[11px] text-slate-500 font-medium">
                              {t.subType}
                            </span>
                          )}
                        </div>
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
                      <div className="flex items-center justify-center gap-1.5">
                        {matchedProject ? (
                          <button
                            type="button"
                            onClick={() => onNavigateTab("projects", { id: matchedProject.id })}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition cursor-pointer"
                            title={`Mở trang Dự Án ${matchedProject.name}`}
                          >
                            <FolderGit2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCreateProjectFromTender(t)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                            title="Tạo Hồ Sơ Dự Án mới từ Báo giá này"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={async () => {
                            const link = getShareableLink("tender", { tender: t.id });
                            const ok = await copyToClipboard(link);
                            if (ok && showToast) {
                              showToast(`Đã sao chép link báo giá: ${t.project}`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="Sao chép link báo giá này"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
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
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
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

      {/* Add Deal Modal with Bidirectional Auto-Creation */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" /> Thêm Báo Giá / Hợp Đồng Mới
                </h3>
                <p className="text-xs text-slate-500">
                  Liên kết với dự án có sẵn hoặc tự động tạo dự án mới
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mode selection tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setDealCreationMode("existing");
                }}
                className={`py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  dealCreationMode === "existing"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Gắn vào Dự Án có sẵn</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDealCreationMode("new");
                  setNewDeal({
                    ...newDeal,
                    projectId: "",
                  });
                }}
                className={`py-2 px-3 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  dealCreationMode === "new"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Tạo Deal / Dự Án Mới</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              {/* Option A: Select from existing projects */}
              {dealCreationMode === "existing" ? (
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">
                    Chọn Dự Án Đang Có Trong Hệ Thống *
                  </label>
                  <select
                    required
                    value={newDeal.projectId}
                    onChange={(e) => handleSelectExistingProject(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-blue-600"
                  >
                    <option value="">-- Bấm để chọn Dự Án --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} • {p.name} {p.contractCode ? `(${p.contractCode})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Option B: Create new project input */
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">
                      Tên Dự Án (Project) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Cà Na Pilates Tây Ninh / Winx Fitness..."
                      value={newDeal.project}
                      onChange={(e) => setNewDeal({ ...newDeal, project: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 block mb-1 font-bold">Tên Khách Hàng</label>
                      <input
                        type="text"
                        placeholder="VD: Lê Mỹ Huyền / Hùng Duy Group"
                        value={newDeal.customer}
                        onChange={(e) => setNewDeal({ ...newDeal, customer: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 block mb-1 font-bold">Khu Vực Phân Vùng</label>
                      <select
                        value={newDeal.region}
                        onChange={(e) => setNewDeal({ ...newDeal, region: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                      >
                        <option value="HCM">Miền Nam (HCM)</option>
                        <option value="HN">Miền Bắc (HN)</option>
                      </select>
                    </div>
                  </div>

                  {/* Auto-create project checkbox */}
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCreateProject}
                      onChange={(e) => setAutoCreateProject(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-bold text-blue-900 block">
                        Đồng thời tự động tạo hồ sơ Dự Án mới
                      </span>
                      <span className="text-[11px] text-blue-700 block">
                        Tự động sinh mã PRJ, kích hoạt quy trình thiết kế 2D/3D và liên kết gói báo giá này
                      </span>
                    </div>
                  </label>
                </div>
              )}

              {/* Common Fields */}
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
                    placeholder="VD: 925925926"
                    value={newDeal.valueBeforeVat}
                    onChange={(e) => setNewDeal({ ...newDeal, valueBeforeVat: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Trạng Thái (Status)</label>
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

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Hạng Mục Chi Tiết (Sub-type)</label>
                <input
                  type="text"
                  placeholder="VD: Báo giá thiết bị pilates SPX Max / Gym cao cấp"
                  value={newDeal.subType}
                  onChange={(e) => setNewDeal({ ...newDeal, subType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-sm cursor-pointer"
                >
                  Lưu Báo Giá & Liên Kết
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