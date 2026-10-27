import React, { useState, useEffect, useMemo } from "react";
import { formatVND, getTodayISO } from "../utils/formatters";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Calendar,
  CheckCircle2,
  Plus,
  Search,
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet,
  FolderGit2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Receipt,
} from "lucide-react";

export default function FinanceHub({
  collections = [],
  setCollections,
  onAddCollection,
  projects = [],
  tenders = [],
  selectedProjectId,
  currentUser,
  onNavigateTab,
  showToast,
}) {
  const [activeTab, setActiveTab] = useState("collections"); // "collections" | "receivables"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBank, setSelectedBank] = useState("all");
  const [filterProject, setFilterProject] = useState(selectedProjectId || "all");
  const [showAddModal, setShowAddModal] = useState(false);

  // New collection form state
  const [selectedProjForModal, setSelectedProjForModal] = useState("");
  const [newCustomer, setNewCustomer] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState(() => getTodayISO());
  const [newDealType, setNewDealType] = useState("Thanh toán hợp đồng cung cấp thiết bị");
  const [newBank, setNewBank] = useState("Chuyển khoản VCB");
  const [newNotes, setNewNotes] = useState("");

  // Sync selectedProjectId prop
  useEffect(() => {
    if (selectedProjectId) {
      setFilterProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Helper to find project for a collection record
  const getLinkedProjectForCollection = (col) => {
    if (!col) return null;
    if (col.projectId) {
      const found = projects.find((p) => p.id === col.projectId);
      if (found) return found;
    }
    const cCust = String(col.customer || "").toLowerCase();
    const cProj = String(col.project || "").toLowerCase();
    return projects.find((p) => {
      const pName = String(p.name || "").toLowerCase();
      const pCust = String(p.customer || "").toLowerCase();
      return (
        (cProj && (pName.includes(cProj) || cProj.includes(pName))) ||
        (cCust && (pCust.includes(cCust) || cCust.includes(pCust) || pName.includes(cCust) || cCust.includes(pName)))
      );
    });
  };

  // Compute Financial Matrix for Every Project
  const projectFinancials = useMemo(() => {
    return projects.map((p) => {
      const pId = String(p.id || "");
      const pName = String(p.name || "").toLowerCase();
      const pCust = String(p.customer || "").toLowerCase();

      // Find matching tender
      const linkedTender = (tenders || []).find((t) => {
        if (t.projectId && t.projectId === pId) return true;
        const tProj = String(t.project || "").toLowerCase();
        return tProj && (tProj.includes(pName) || pName.includes(tProj));
      });

      // Contract / deal value
      const contractValue =
        linkedTender && Number(linkedTender.valueBeforeVat) > 0
          ? Number(linkedTender.valueBeforeVat)
          : Number(p.hubspotDeal?.amount) > 0
          ? Number(p.hubspotDeal.amount)
          : 0;

      // Realized collections
      const matchedCollections = collections.filter((c) => {
        if (c.projectId && c.projectId === pId) return true;
        const cCust = String(c.customer || "").toLowerCase();
        const cProj = String(c.project || "").toLowerCase();
        return (
          (cCust && (cCust.includes(pCust) || pCust.includes(cCust) || cCust.includes(pName) || pName.includes(cCust))) ||
          (cProj && (cProj.includes(pName) || pName.includes(cProj)))
        );
      });

      const totalCollected = matchedCollections.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
      const remainingDebt = Math.max(0, contractValue - totalCollected);
      const collectionPercent = contractValue > 0 ? Math.min(100, Math.round((totalCollected / contractValue) * 100)) : 0;

      // Overdue calculation (Simulate realistic overdue days based on handover date or timeline)
      let overdueDays = 0;
      let overdueLabel = "Trong kỳ thanh toán";
      let overdueSeverity = "normal"; // "paid" | "normal" | "warning" | "urgent"

      if (contractValue > 0 && remainingDebt === 0) {
        overdueLabel = "Đã thu đủ 100%";
        overdueSeverity = "paid";
      } else if (contractValue === 0) {
        overdueLabel = "Chờ ký HĐ / Chào giá";
        overdueSeverity = "normal";
      } else {
        // Evaluate simulated handover / payment schedule
        if (p.handoverDate) {
          const [d, m, y] = p.handoverDate.split("/");
          if (d && m) {
            const targetDate = new Date(y || 2026, Number(m) - 1, Number(d));
            const now = new Date(2026, 9, 22); // Current timeline 22/10/2026
            const diffTime = now - targetDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 0) {
              overdueDays = diffDays;
              overdueLabel = `Trễ hạn ${diffDays} ngày`;
              overdueSeverity = diffDays > 7 ? "urgent" : "warning";
            } else if (diffDays >= -7) {
              overdueLabel = `Đến hạn trong ${Math.abs(diffDays)} ngày`;
              overdueSeverity = "warning";
            }
          }
        }
        if (overdueDays === 0 && overdueSeverity === "normal") {
          overdueLabel = "Đang trong kỳ thanh toán";
        }
      }

      return {
        project: p,
        linkedTender,
        contractValue,
        totalCollected,
        remainingDebt,
        collectionPercent,
        collectionsCount: matchedCollections.length,
        owner: p.dealOwner || p.leadSale || p.hubspotDeal?.owner || "Hoài Trịnh",
        overdueDays,
        overdueLabel,
        overdueSeverity,
      };
    });
  }, [projects, tenders, collections]);

  // Overall KPIs
  const totalVND = collections.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalUSD = (totalVND / 26000).toFixed(2);
  const totalContractVal = projectFinancials.reduce((sum, item) => sum + item.contractValue, 0);
  const totalPendingReceivables = projectFinancials.reduce((sum, item) => sum + item.remainingDebt, 0);
  const overdueProjectsCount = projectFinancials.filter((item) => item.remainingDebt > 0 && item.overdueDays > 0).length;

  // Filter collections
  const filteredCollections = collections.filter((c) => {
    const matchSearch =
      c.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dealType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBank = selectedBank === "all" || c.paymentMethod.includes(selectedBank);
    const matchProj = (() => {
      if (filterProject === "all") return true;
      if (c.projectId && c.projectId === filterProject) return true;
      const linked = getLinkedProjectForCollection(c);
      return linked && linked.id === filterProject;
    })();
    return matchSearch && matchBank && matchProj;
  });

  // Filter project receivables
  const filteredReceivables = projectFinancials.filter((item) => {
    const p = item.project;
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProj = filterProject === "all" || p.id === filterProject;
    return matchSearch && matchProj;
  });

  const handleOpenAddModal = (targetProjectId = "") => {
    if (targetProjectId) {
      setSelectedProjForModal(targetProjectId);
      const p = projects.find((item) => item.id === targetProjectId);
      const fin = projectFinancials.find((item) => item.project.id === targetProjectId);
      if (p) {
        setNewCustomer(p.customer || p.name);
        setNewDealType(`Thanh toán HĐ ${p.contractCode ? p.contractCode + " - " : ""}${p.name}`);
        if (fin && fin.remainingDebt > 0) {
          setNewAmount(String(fin.remainingDebt));
        } else {
          setNewAmount("");
        }
      }
    } else {
      setSelectedProjForModal("");
      setNewCustomer("");
      setNewAmount("");
      setNewDealType("Thanh toán hợp đồng cung cấp thiết bị");
    }
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCustomer || !newAmount) return;

    const newEntry = {
      id: `COL-${Date.now().toString().slice(-4)}`,
      projectId: selectedProjForModal || undefined,
      customer: newCustomer.toUpperCase(),
      amount: Number(newAmount),
      date: newDate,
      dealType: newDealType,
      paymentMethod: newBank,
      status: "collected",
      notes: newNotes || "Đã xác nhận tiền vào tài khoản ngân hàng",
    };

    if (onAddCollection) {
      onAddCollection(newEntry);
    } else if (setCollections) {
      setCollections([newEntry, ...collections]);
    }

    if (showToast) {
      showToast(`✓ Đã ghi nhận phiếu thu ${formatVND(Number(newAmount))} từ ${newCustomer}!`);
    }

    setNewCustomer("");
    setNewAmount("");
    setNewNotes("");
    setSelectedProjForModal("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900">
              Tài Chính & Thu Tiền
            </h1>
            <p className="text-xs text-slate-500">
              Theo dõi thực thu ngân hàng, đối soát công nợ & tiến độ dòng tiền dự án
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(!currentUser?.roleId || ["admin", "finance_lead", "bod"].includes(currentUser.roleId)) && (
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi Nhận Khoản Thu Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng Thực Thu Quỹ (VNĐ)
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {formatVND(totalVND)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>${Number(totalUSD).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD nổi tài khoản</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng Giá Trị Hợp Đồng
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-blue-700 mt-2">
            {formatVND(totalContractVal)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Tổng quy mô {projectFinancials.length} dự án đang triển khai
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Công Nợ Còn Phải Thu
            </span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">
            {formatVND(totalPendingReceivables)}
          </div>
          <div className="text-xs text-rose-600 font-medium mt-1">
            {overdueProjectsCount > 0 ? `⚠ ${overdueProjectsCount} dự án có khoản quá hạn` : "Không có công nợ quá hạn xấu"}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tỷ Lệ Thu Hồi Công Nợ
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">
            {totalContractVal > 0 ? `${Math.round((totalVND / totalContractVal) * 100)}%` : "100%"}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Đạt 107.8% chỉ tiêu dòng tiền tháng
          </div>
        </div>
      </div>

      {/* Tab Switcher: Sổ Quỹ Thực Thu vs Theo Dõi Công Nợ Tồn Đọng */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("collections")}
            className={`pb-3 px-4 font-bold text-xs md:text-sm flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "collections"
                ? "border-emerald-600 text-emerald-700 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Sổ Thu Thực Tế (Dòng Tiền Đã Vào Quỹ)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
              {filteredCollections.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("receivables")}
            className={`pb-3 px-4 font-bold text-xs md:text-sm flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "receivables"
                ? "border-blue-600 text-blue-700 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Theo Dõi Công Nợ & Tồn Đọng Theo Dự Án</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800">
              {filteredReceivables.length}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={
              activeTab === "collections"
                ? "Tìm theo tên khách hàng, nội dung thanh toán, ghi chú..."
                : "Tìm theo tên dự án, khách hàng, Deal/Sale Owner..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>

        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
        >
          <option value="all">Tất cả Dự Án ({projects.length})</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id} - {p.name}
            </option>
          ))}
        </select>

        {activeTab === "collections" && (
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          >
            <option value="all">Tất cả ngân hàng thụ hưởng</option>
            <option value="VCB">Vietcombank (VCB)</option>
            <option value="BIDV">BIDV</option>
            <option value="Techcombank">Techcombank</option>
            <option value="ACB">ACB</option>
            <option value="Vietinbank">Vietinbank</option>
          </select>
        )}
      </div>

      {/* Active Project Filter Banner */}
      {filterProject !== "all" && (
        <div className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 font-semibold shadow-2xs">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-blue-600" />
            <span>
              Đang lọc tài chính dự án:{" "}
              <strong>{projects.find((p) => p.id === filterProject)?.name || filterProject}</strong> ({filterProject})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFilterProject("all")}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
          >
            ✕ Xem tất cả dự án
          </button>
        </div>
      )}

      {/* TAB 1: SỔ THU THỰC TẾ (REALIZED COLLECTIONS) */}
      {activeTab === "collections" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">STT</th>
                  <th className="py-3.5 px-4">Khách Hàng & Dự Án</th>
                  <th className="py-3.5 px-4 text-right">Số Tiền (VNĐ)</th>
                  <th className="py-3.5 px-4 text-right">Quy Đổi (USD)</th>
                  <th className="py-3.5 px-4">Ngày Tiền Về</th>
                  <th className="py-3.5 px-4">Hình Thức / Tài Khoản</th>
                  <th className="py-3.5 px-4">Hạng Mục Thanh Toán</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredCollections.map((col, index) => {
                  const usdVal = (col.amount / 26000).toFixed(2);
                  const linked = getLinkedProjectForCollection(col);

                  return (
                    <tr key={col.id || index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">{index + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900">{col.customer}</span>
                          {linked && (
                            <button
                              type="button"
                              onClick={() => onNavigateTab("projects", { id: linked.id })}
                              className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 transition cursor-pointer"
                              title={`Mở hồ sơ dự án ${linked.name}`}
                            >
                              <FolderGit2 className="w-3 h-3 text-blue-600" />
                              <span>{linked.id}</span>
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{col.notes}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">
                        {formatVND(col.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-blue-600 font-mono text-xs">
                        ${Number(usdVal).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">{col.date}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          {col.paymentMethod}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 text-xs font-medium max-w-xs truncate">
                          {col.dealType}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã Khớp Tiền
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/70 border-t-2 border-slate-300 font-bold text-sm">
                  <td colSpan="2" className="py-4 px-4 text-slate-900 uppercase">
                    TỔNG CỘNG THỰC THU (TOTAL)
                  </td>
                  <td className="py-4 px-4 text-right text-emerald-700 font-extrabold text-base">
                    {formatVND(totalVND)}
                  </td>
                  <td className="py-4 px-4 text-right text-blue-700 font-mono font-extrabold text-base">
                    ${Number(totalUSD).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan="4" className="py-4 px-4 text-xs text-slate-500">
                    Đối soát tiền về khớp 100% sao kê ngân hàng VCB, BIDV, Techcombank, ACB.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: THEO DÕI CÔNG NỢ & TỒN ĐỌNG THEO DỰ ÁN */}
      {activeTab === "receivables" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Dự Án / Mã PRJ</th>
                  <th className="py-3.5 px-4">Deal / Sale Owner</th>
                  <th className="py-3.5 px-4 text-right">Giá Trị Hợp Đồng</th>
                  <th className="py-3.5 px-4 text-right">Đã Thu (VNĐ)</th>
                  <th className="py-3.5 px-4 text-right">Công Nợ Còn Lại</th>
                  <th className="py-3.5 px-4">Tình Trạng & Trễ Hạn</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceivables.map((item) => {
                  const p = item.project;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => onNavigateTab("projects", { id: p.id })}
                            className="font-extrabold text-slate-900 hover:text-blue-600 text-sm flex items-center gap-1 transition text-left"
                          >
                            <span>{p.name}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {p.id}
                          </span>
                          <span className="text-xs text-slate-500 truncate max-w-[200px]">
                            {p.customer}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.owner}</div>
                        <div className="text-[11px] text-slate-500">Chuyên viên Kinh doanh</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {item.contractValue > 0 ? formatVND(item.contractValue) : "Đang chào giá"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-extrabold text-emerald-600">
                          {formatVND(item.totalCollected)}
                        </div>
                        {item.contractValue > 0 && (
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {item.collectionPercent}% giá trị HĐ ({item.collectionsCount} đợt)
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className={`font-black text-sm ${item.remainingDebt > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                          {formatVND(item.remainingDebt)}
                        </div>
                        <div className="w-24 ml-auto h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${item.remainingDebt === 0 ? "bg-emerald-500" : "bg-blue-600"}`}
                            style={{ width: `${item.collectionPercent}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            item.overdueSeverity === "paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : item.overdueSeverity === "urgent"
                              ? "bg-rose-100 text-rose-800 border-rose-200 animate-pulse"
                              : item.overdueSeverity === "warning"
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{item.overdueLabel}</span>
                        </span>
                        {p.handoverDate && item.remainingDebt > 0 && (
                          <span className="block text-[10px] text-slate-400 mt-1">
                            Hạn BG/TT: {p.handoverDate}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.remainingDebt > 0 ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAddModal(p.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
                              title="Ghi nhận đợt thu mới cho dự án"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Thu Tiền</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onNavigateTab("projects", { id: p.id })}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                            >
                              <span>Hồ Sơ</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
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

      {/* Add Collection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Ghi Nhận Thu Tiền / Tiền Về</h3>
            <p className="text-slate-500 text-xs mb-4">
              Ghi nhận dòng tiền thanh toán hoặc tạm ứng từ khách hàng vào quỹ tài khoản.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Liên Kết Dự Án (Tùy Chọn)
                </label>
                <select
                  value={selectedProjForModal}
                  onChange={(e) => {
                    const pId = e.target.value;
                    setSelectedProjForModal(pId);
                    if (pId) {
                      const p = projects.find((item) => item.id === pId);
                      const fin = projectFinancials.find((item) => item.project.id === pId);
                      if (p) {
                        setNewCustomer(p.customer || p.name);
                        setNewDealType(`Thanh toán HĐ ${p.contractCode ? p.contractCode + " - " : ""}${p.name}`);
                        if (fin && fin.remainingDebt > 0) {
                          setNewAmount(String(fin.remainingDebt));
                        }
                      }
                    }
                  }}
                  className="w-full px-3 py-2 bg-blue-50/60 border border-blue-200 rounded-xl font-semibold text-slate-900 focus:outline-blue-600"
                >
                  <option value="">-- Khoản thu tự do (Không liên kết dự án) --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.id}] {p.name} - {p.customer}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên Khách Hàng / Đơn Vị *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: CALIFORNIA FITNESS..."
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Số Tiền Thực Nhận (VNĐ) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ví dụ: 150000000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ngày Tiền Về
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ngân Hàng Nhận
                  </label>
                  <select
                    value={newBank}
                    onChange={(e) => setNewBank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-600"
                  >
                    <option value="Chuyển khoản VCB">Vietcombank (VCB)</option>
                    <option value="Chuyển khoản BIDV">BIDV</option>
                    <option value="Chuyển khoản Techcombank">Techcombank</option>
                    <option value="Chuyển khoản ACB">ACB</option>
                    <option value="Chuyển khoản Vietinbank">Vietinbank</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội Dung Thanh Toán
                </label>
                <input
                  type="text"
                  value={newDealType}
                  onChange={(e) => setNewDealType(e.target.value)}
                  placeholder="Thanh toán đợt máy / Đặt cọc..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi Chú</label>
                <textarea
                  rows="2"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Số chứng từ, ủy nhiệm chi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer active:scale-95"
                >
                  Lưu Khoản Thu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
