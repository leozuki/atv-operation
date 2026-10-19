import React, { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  FolderOpen,
  Plus,
  ExternalLink,
  ShieldCheck,
  Building,
  Tag,
  Calendar,
  User,
  HardDrive,
  FileCheck2,
  X,
  FileCode,
  Layers,
  ArrowUpDown,
  History,
} from "lucide-react";
import { formatShortCurrency } from "../utils/formatters";

export default function DMSHub({
  dmsDocuments = [],
  setDmsDocuments,
  projects = [],
  onOpenProjectDetail,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedDocForPreview, setSelectedDocForPreview] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  // Form state for new upload
  const [newDocForm, setNewDocForm] = useState({
    name: "",
    category: "Hợp đồng",
    department: "Sales",
    project: "",
    vendor: "Precor",
    description: "",
    tags: "",
    summary: "",
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const total = dmsDocuments.length;
    const approved = dmsDocuments.filter((d) => d.approval === "Approved").length;
    const contracts = dmsDocuments.filter((d) => d.category === "Hợp đồng").length;
    const handovers = dmsDocuments.filter(
      (d) => d.category === "Biên bản bàn giao mặt bằng" || d.category === "Biên bản nghiệm thu"
    ).length;
    const pos = dmsDocuments.filter((d) => d.category === "Đơn đặt hàng / PO" || d.category.includes("CO/CQ")).length;
    const drawings = dmsDocuments.filter((d) => d.category === "Bản vẽ kỹ thuật").length;

    return { total, approved, contracts, handovers, pos, drawings };
  }, [dmsDocuments]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(dmsDocuments.map((d) => d.category));
    return Array.from(set);
  }, [dmsDocuments]);

  // Departments list
  const departments = useMemo(() => {
    const set = new Set(dmsDocuments.map((d) => d.department));
    return Array.from(set);
  }, [dmsDocuments]);

  // Projects list
  const projectList = useMemo(() => {
    const set = new Set(dmsDocuments.map((d) => d.project).filter(Boolean));
    return Array.from(set);
  }, [dmsDocuments]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return dmsDocuments.filter((doc) => {
      const matchSearch =
        searchTerm === "" ||
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.tags && doc.tags.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.summary && doc.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.project && doc.project.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDept = selectedDepartment === "all" || doc.department === selectedDepartment;
      const matchCat = selectedCategory === "all" || doc.category === selectedCategory;
      const matchPrj = selectedProject === "all" || doc.project === selectedProject;

      return matchSearch && matchDept && matchCat && matchPrj;
    });
  }, [dmsDocuments, searchTerm, selectedDepartment, selectedCategory, selectedProject]);

  const handleSimulateGeminiSummarize = () => {
    if (!newDocForm.name) {
      alert("Vui lòng nhập tên tài liệu trước khi yêu cầu AI tóm tắt!");
      return;
    }
    const autoSummary = `[Gemini AI trích xuất] Tài liệu "${newDocForm.name}" thuộc dự án "${newDocForm.project || "Chung"}" do phòng ${newDocForm.department} quản lý. Các cam kết kỹ thuật và thời hạn pháp lý cần đối soát trước khi ký duyệt bàn giao.`;
    const autoTags = `${newDocForm.category}, ${newDocForm.department}, ${newDocForm.vendor || "Attivo"}`;
    setNewDocForm((prev) => ({
      ...prev,
      summary: autoSummary,
      tags: autoTags,
    }));
  };

  const handleSaveNewDoc = (e) => {
    e.preventDefault();
    if (!newDocForm.name) return;

    const newDocId = `DMS-2610${Math.floor(10 + Math.random() * 90)}`;
    const newDoc = {
      id: newDocId,
      name: newDocForm.name,
      category: newDocForm.category,
      department: newDocForm.department,
      project: newDocForm.project || "Dự án chung",
      vendor: newDocForm.vendor || "Nội bộ",
      status: "Completed",
      approval: "Approved",
      createdBy: "admin@attivointl.com",
      createdAt: new Date().toISOString().split("T")[0],
      fileUrl: "https://drive.google.com/file/d/sample/view",
      fileId: `DRV-${Math.floor(100000 + Math.random() * 900000)}`,
      fileSize: "2.5 MB",
      tags: newDocForm.tags || "DMS, Tài liệu mới",
      summary: newDocForm.summary || "Tài liệu lưu trữ mới tải lên hệ thống Attivo DMS.",
    };

    if (setDmsDocuments) {
      setDmsDocuments([newDoc, ...dmsDocuments]);
    }
    setShowUploadModal(false);
    setNewDocForm({
      name: "",
      category: "Hợp đồng",
      department: "Sales",
      project: "",
      vendor: "Precor",
      description: "",
      tags: "",
      summary: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-cyan-300" />
            <h1 className="text-lg md:text-xl font-bold text-white">Kho Tài Liệu DMS</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-800 font-semibold rounded-xl text-sm shadow hover:bg-blue-50 transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-blue-700" />
              Tải Lên Hồ Sơ Mới
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-blue-200">Tổng tài liệu</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
            <div className="text-[11px] text-cyan-300 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 100% Lưu trữ an toàn
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-blue-200">Hợp đồng kinh tế</div>
            <div className="text-2xl font-bold mt-1 text-emerald-300">{stats.contracts}</div>
            <div className="text-[11px] text-blue-100 mt-0.5">Đã ký kết & đóng dấu</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-blue-200">BB Bàn giao & Nghiệm thu</div>
            <div className="text-2xl font-bold mt-1 text-amber-300">{stats.handovers}</div>
            <div className="text-[11px] text-blue-100 mt-0.5">Mặt bằng & Kỹ thuật</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-blue-200">Bản vẽ 2D / 3D</div>
            <div className="text-2xl font-bold mt-1 text-purple-300">{stats.drawings}</div>
            <div className="text-[11px] text-blue-100 mt-0.5">AutoCAD & Render</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-blue-200">PO & Hồ sơ CO/CQ</div>
            <div className="text-2xl font-bold mt-1 text-sky-300">{stats.pos}</div>
            <div className="text-[11px] text-blue-100 mt-0.5">Hải quan & Cảng</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-blue-200">Đã phê duyệt (Approved)</div>
            <div className="text-2xl font-bold mt-1 text-teal-300">{stats.approved}</div>
            <div className="text-[11px] text-teal-200 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Hiệu lực 100%
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu theo tên, mã DMS, từ khóa, tag hoặc AI summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <span className="text-xs font-medium text-slate-500">Hiển thị:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  viewMode === "grid" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Dạng Thẻ
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  viewMode === "table" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Dạng Bảng
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Phòng ban quản lý
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả phòng ban ({departments.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Danh mục hồ sơ
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả danh mục ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Dự án liên kết
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả dự án ({projectList.length})</option>
              {projectList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Document List Header Info */}
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-semibold text-slate-700">
          Kết quả tìm kiếm: <span className="text-blue-600 font-bold">{filteredDocs.length}</span> tài liệu
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Tích hợp Gemini AI Abstract Summary
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Header Tag & ID */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {doc.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        doc.category === "Hợp đồng"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : doc.category.includes("bàn giao") || doc.category.includes("nghiệm thu")
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : doc.category === "Bản vẽ kỹ thuật"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : doc.category.includes("PO") || doc.category.includes("CO/CQ")
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {doc.category}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {doc.department}
                    </span>
                  </div>
                </div>

                {/* Document Name */}
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition line-clamp-2 mb-2">
                  {doc.name}
                </h3>

                {/* Project & Vendor Info */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-3.5">
                  {doc.project && (
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate">{doc.project}</span>
                    </div>
                  )}
                  {doc.vendor && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Hãng / Đối tác: <strong className="text-slate-700">{doc.vendor}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {doc.createdAt}
                    </span>
                    {doc.fileSize && <span>Dung lượng: {doc.fileSize}</span>}
                  </div>
                </div>

                {/* Gemini AI Summary Card */}
                {doc.summary && (
                  <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-100/80 rounded-xl p-3 mb-4 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-700 text-[11px] uppercase tracking-wider mb-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      Tóm tắt trích xuất AI Gemini
                    </div>
                    <p className="line-clamp-3 leading-relaxed text-slate-600 text-[11px]">
                      {doc.summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-[11px] font-semibold text-emerald-700">Đã Phê Duyệt</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedDocForPreview(doc)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Xem trước
                  </button>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Mở Drive
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Mã DMS</th>
                  <th className="py-3 px-4">Tên tài liệu / Hồ sơ</th>
                  <th className="py-3 px-4">Danh mục</th>
                  <th className="py-3 px-4">Phòng ban</th>
                  <th className="py-3 px-4">Dự án</th>
                  <th className="py-3 px-4">Hãng</th>
                  <th className="py-3 px-4">Ngày lưu</th>
                  <th className="py-3 px-4">Tóm tắt Gemini AI</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{doc.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs truncate">
                      {doc.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 border border-slate-200">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-blue-700">{doc.department}</td>
                    <td className="py-3 px-4 font-medium text-slate-700 max-w-[180px] truncate">
                      {doc.project || "-"}
                    </td>
                    <td className="py-3 px-4">{doc.vendor || "-"}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{doc.createdAt}</td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {doc.summary || "-"}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedDocForPreview(doc)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-semibold text-xs transition mr-1"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Preview Document Details & Audit Log */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {selectedDocForPreview.id}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedDocForPreview.approval}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-800">{selectedDocForPreview.name}</h2>
              </div>
              <button
                onClick={() => setSelectedDocForPreview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* AI Gemini Summary Highlight */}
              <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700 text-xs uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Bản Tóm Tắt Trích Xuất AI Gemini
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-sans">
                  {selectedDocForPreview.summary}
                </p>
                {selectedDocForPreview.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-indigo-100/60">
                    {selectedDocForPreview.tags.split(",").map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white/80 text-indigo-700 text-[11px] rounded-md font-medium border border-indigo-200/50"
                      >
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 mb-1">Dự án liên kết</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedDocForPreview.project || "Chung"}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 mb-1">Hãng / Nhà cung cấp</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedDocForPreview.vendor || "Nội bộ"}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 mb-1">Phòng ban tạo hồ sơ</div>
                  <div className="font-bold text-blue-700 text-sm">{selectedDocForPreview.department}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 mb-1">Người tải lên (Email)</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedDocForPreview.createdBy}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 mb-1">Ngày tải lên</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedDocForPreview.createdAt}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 mb-1">Dung lượng file</div>
                  <div className="font-bold text-slate-800 text-sm">{selectedDocForPreview.fileSize || "1.8 MB"}</div>
                </div>
              </div>

              {/* Audit Log Box */}
              <div className="border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  Lịch sử Audit Trail hệ thống
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Được tạo bởi: {selectedDocForPreview.createdBy}</span>
                    <span>{selectedDocForPreview.createdAt} 08:30:00</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Phê duyệt bởi: System Admin (admin@attivo.com)</span>
                    <span>{selectedDocForPreview.createdAt} 09:15:00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setSelectedDocForPreview(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-medium transition"
              >
                Đóng
              </button>
              <a
                href={selectedDocForPreview.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow transition"
              >
                <Download className="w-4 h-4" /> Mở Trên Google Drive
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload New Document */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Tải Lên Hồ Sơ Mới Vào DMS</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lưu trữ tập trung và kích hoạt phân tích trích xuất nội dung bằng AI Gemini.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewDoc} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên tài liệu / Văn bản <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: HĐMB-2026-Precor-Vincom.pdf"
                  value={newDocForm.name}
                  onChange={(e) => setNewDocForm({ ...newDocForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Danh mục tài liệu</label>
                  <select
                    value={newDocForm.category}
                    onChange={(e) => setNewDocForm({ ...newDocForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Hợp đồng">Hợp đồng</option>
                    <option value="Báo giá">Báo giá / BOQ</option>
                    <option value="Biên bản bàn giao mặt bằng">Biên bản bàn giao mặt bằng</option>
                    <option value="Biên bản nghiệm thu">Biên bản nghiệm thu</option>
                    <option value="Bản vẽ kỹ thuật">Bản vẽ kỹ thuật</option>
                    <option value="Đơn đặt hàng / PO">Đơn đặt hàng / PO</option>
                    <option value="Hồ sơ CO/CQ hải quan">Hồ sơ CO/CQ hải quan</option>
                    <option value="Phiếu thu / chi">Phiếu thu / chi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phòng ban phụ trách</label>
                  <select
                    value={newDocForm.department}
                    onChange={(e) => setNewDocForm({ ...newDocForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Sales">Sales (Kinh doanh)</option>
                    <option value="Technical">Technical (Kỹ thuật)</option>
                    <option value="Logistics">Logistics (Vận chuyển)</option>
                    <option value="Finance">Finance (Tài chính - Kế toán)</option>
                    <option value="Legal">Legal (Pháp lý)</option>
                    <option value="Marketing">Marketing (Truyền thông)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dự án liên kết</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Cà Na Pilates Tây Ninh"
                    value={newDocForm.project}
                    onChange={(e) => setNewDocForm({ ...newDocForm, project: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hãng / Nhà cung cấp</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Precor, Merrithew, Ziva"
                    value={newDocForm.vendor}
                    onChange={(e) => setNewDocForm({ ...newDocForm, vendor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Gemini AI helper button */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-700 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Trợ lý Gemini AI
                  </span>
                  <button
                    type="button"
                    onClick={handleSimulateGeminiSummarize}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold transition"
                  >
                    Tự động tóm tắt & sinh Tag
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Nội dung tóm tắt do Gemini AI trích xuất hoặc nhập tay..."
                  value={newDocForm.summary}
                  onChange={(e) => setNewDocForm({ ...newDocForm, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tags phân loại</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hợp đồng, Precor, Tây Ninh"
                  value={newDocForm.tags}
                  onChange={(e) => setNewDocForm({ ...newDocForm, tags: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  Lưu Vào DMS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
