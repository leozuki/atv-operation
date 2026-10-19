import React, { useState, useMemo } from "react";
import {
  Palette,
  Search,
  Plus,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  FileImage,
  LayoutGrid,
  Columns3,
  List,
  Users,
} from "lucide-react";
import { formatDate } from "../utils/formatters";

export default function DesignSalesProgress({ tasks, setTasks }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "kanban" | "table"
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTask, setNewTask] = useState({
    projectName: "",
    client: "",
    region: "HCM",
    leadSale: "Hoài Trịnh",
    designer2D: "Hoàng Long",
    designer3D: "Thu Thảo",
    stage2D: "in_progress",
    stage3D: "pending",
    type2DCount: 1,
    type3DCount: 0,
    statusType: "New",
    progressPercent: 50,
    dueDate: "",
    taskDetail: "",
    notes: "",
  });

  const getStageBadge = (stage) => {
    switch (stage) {
      case "pending":
        return { label: "Chưa Bắt Đầu", bg: "bg-slate-100 text-slate-600 border-slate-200" };
      case "in_progress":
        return { label: "Đang Thực Hiện", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "review":
        return { label: "Chờ Khách Duyệt", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      case "completed":
        return { label: "Đã Chốt Duyệt", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      default:
        return { label: stage, bg: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  const total2D = tasks.reduce((acc, t) => acc + (t.type2DCount || 0), 0);
  const total3D = tasks.reduce((acc, t) => acc + (t.type3DCount || 0), 0);
  const newDealsCount = tasks.filter((t) => t.statusType === "New").length;
  const reDealsCount = tasks.filter((t) => t.statusType === "Re").length;

  // Zoho Resource Utilization for 2D/3D Designers
  const designerWorkload = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      [
        { name: t.designer2D, role: "2D Layout", count: t.type2DCount || 1 },
        { name: t.designer3D, role: "3D Render", count: t.type3DCount || 0 },
      ].forEach((d) => {
        if (!d.name || d.name === "—" || d.name.includes("Chưa")) return;
        if (!map[d.name]) {
          map[d.name] = { name: d.name, role: d.role, projects: 0, drawings: 0, active: 0 };
        }
        map[d.name].projects += 1;
        map[d.name].drawings += d.count;
        if (t.progressPercent < 100) map[d.name].active += 1;
      });
    });
    return Object.values(map).sort((a, b) => b.projects - a.projects);
  }, [tasks]);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.leadSale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.designer2D.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.designer3D.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage =
      filterStage === "all" || t.stage2D === filterStage || t.stage3D === filterStage;

    const matchesRegion =
      filterRegion === "all" || t.region === filterRegion;

    return matchesSearch && matchesStage && matchesRegion;
  });


  const handleUpdateProgress = (taskId, newPercent) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              progressPercent: newPercent,
              stage3D: newPercent === 100 ? "completed" : t.stage3D,
              stage2D: newPercent >= 50 ? "completed" : t.stage2D,
            }
          : t
      )
    );
  };

  const handleAddTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTask.projectName) return;

    const created = {
      id: `DST-${Date.now().toString().slice(-3)}`,
      ...newTask,
      progressPercent: Number(newTask.progressPercent) || 0,
    };

    setTasks([created, ...tasks]);
    setShowAddModal(false);
    setNewTask({
      projectName: "",
      client: "",
      leadSale: "Hoài Trịnh",
      designer2D: "Hoàng Long",
      designer3D: "Thu Thảo",
      stage2D: "in_progress",
      stage3D: "pending",
      progressPercent: 50,
      dueDate: "",
      taskDetail: "",
      notes: "",
    });
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">
            Thiết Kế 2D/3D
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm transition shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Task Thiết Kế Mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar from Slide 07 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Mặt Bằng 2D</span>
            <div className="text-xl font-black text-purple-700 mt-0.5">{total2D} Bản vẽ</div>
            <div className="text-[10px] text-slate-400">HCM: 8 · HN: 5 · Cam: 1</div>
          </div>
          <span className="p-2 rounded-lg bg-purple-50 text-purple-600 font-bold text-xs">2D</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Render 3D</span>
            <div className="text-xl font-black text-indigo-700 mt-0.5">{total3D} Không gian</div>
            <div className="text-[10px] text-slate-400">HCM: 1 · Sing: 1 · Malay: 2</div>
          </div>
          <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">3D</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Dự Án Mới (New)</span>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{newDealsCount} Dự án</div>
            <div className="text-[10px] text-emerald-600 font-medium">Layout ban đầu</div>
          </div>
          <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs">NEW</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Chỉnh Sửa (Revise)</span>
            <div className="text-xl font-black text-amber-600 mt-0.5">{reDealsCount} Dự án</div>
            <div className="text-[10px] text-amber-600 font-medium">Khách yêu cầu sửa</div>
          </div>
          <span className="p-2 rounded-lg bg-amber-50 text-amber-600 font-bold text-xs">RE</span>
        </div>
      </div>

      {/* Zoho-inspired Resource Utilization Bar (Tải Trọng Đội Thiết Kế) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <Users className="w-4 h-4 text-purple-600" /> Phân Bổ Tải Trọng Nhân Sự Thiết Kế (Resource Utilization)
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Định mức chuẩn: 6 dự án / tuần</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {designerWorkload.map((d) => {
            const utilPct = Math.min(100, Math.round((d.projects / 6) * 100));
            const isHigh = utilPct >= 85;
            return (
              <div key={d.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate">{d.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isHigh ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {utilPct}% tải
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isHigh ? "bg-rose-500" : "bg-purple-600"}`}
                    style={{ width: `${utilPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{d.projects} dự án ({d.active} đang chạy)</span>
                  <strong className="text-slate-700">{d.drawings} bản vẽ</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo dự án, khách hàng, tên sale hoặc designer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Thị Trường</option>
            <option value="HCM">TP. Hồ Chí Minh (HCM)</option>
            <option value="HN">Hà Nội & Miền Bắc (HN)</option>
            <option value="Cambodia">Campuchia</option>
            <option value="Singapore">Singapore</option>
            <option value="Malaysia">Malaysia</option>
          </select>

          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Tiến Độ</option>
            <option value="in_progress">Đang Thiết Kế</option>
            <option value="review">Chờ Khách Duyệt</option>
            <option value="completed">Đã Chốt Duyệt 100%</option>
          </select>

          {/* View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                viewMode === "grid" ? "bg-white text-purple-700 shadow-2xs" : "text-slate-600"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Thẻ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                viewMode === "kanban" ? "bg-white text-purple-700 shadow-2xs" : "text-slate-600"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                viewMode === "table" ? "bg-white text-purple-700 shadow-2xs" : "text-slate-600"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Bảng</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Design Tasks Cards */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((t) => {
            const badge2D = getStageBadge(t.stage2D);
            const badge3D = getStageBadge(t.stage3D);

            return (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-slate-900">{t.projectName}</span>
                      {t.statusType && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                            t.statusType === "New"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {t.statusType}
                        </span>
                      )}
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200 shrink-0">
                      {t.region || "HCM"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                    <span>{t.client}</span>
                    {(t.type2DCount > 0 || t.type3DCount > 0) && (
                      <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        {t.type2DCount > 0 ? `${t.type2DCount} Layout 2D` : ""}{" "}
                        {t.type3DCount > 0 ? `${t.type3DCount} Render 3D` : ""}
                      </span>
                    )}
                  </div>

                  {/* Team assignments */}
                  <div className="grid grid-cols-3 gap-2 mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Sale Phụ Trách:</span>
                      <strong className="text-slate-900 mt-0.5 block truncate">{t.leadSale}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Designer 2D:</span>
                      <strong className="text-cyan-800 mt-0.5 block truncate">{t.designer2D}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Designer 3D:</span>
                      <strong className="text-purple-800 mt-0.5 block truncate">{t.designer3D}</strong>
                    </div>
                  </div>


                  {/* Stages Status */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Layout 2D:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge2D.bg}`}>
                        {badge2D.label}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Render 3D:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge3D.bg}`}>
                        {badge3D.label}
                      </span>
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="text-slate-800">
                      <strong className="text-slate-500">Nhiệm vụ: </strong>
                      {t.taskDetail}
                    </div>
                    {t.notes && (
                      <div className="text-amber-800 text-[11px] font-medium">
                        <strong>Lưu ý: </strong>
                        {t.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Slider */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Tiến độ hoàn thành:</span>
                    <span className="font-bold text-slate-900">{t.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${
                        t.progressPercent === 100
                          ? "bg-emerald-600"
                          : t.progressPercent > 50
                          ? "bg-blue-600"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${t.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => handleUpdateProgress(t.id, pct)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition ${
                          t.progressPercent === pct
                            ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Kanban 2D/3D Board */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: "in_progress", title: "Đang Dựng Layout / 3D (< 75%)", bg: "bg-blue-50 border-blue-200 text-blue-800", filterFn: (t) => t.progressPercent < 75 },
            { key: "review", title: "Chờ Khách Duyệt (75% - 95%)", bg: "bg-amber-50 border-amber-200 text-amber-800", filterFn: (t) => t.progressPercent >= 75 && t.progressPercent < 100 },
            { key: "completed", title: "Đã Chốt Duyệt (100%)", bg: "bg-emerald-50 border-emerald-200 text-emerald-800", filterFn: (t) => t.progressPercent === 100 },
          ].map((col) => {
            const colItems = filteredTasks.filter(col.filterFn);
            return (
              <div key={col.key} className="bg-slate-100/80 rounded-2xl border border-slate-200 p-3 space-y-2.5">
                <div className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between ${col.bg}`}>
                  <span>{col.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[11px] font-black">{colItems.length}</span>
                </div>
                <div className="space-y-2.5">
                  {colItems.map((t) => (
                    <div key={t.id} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{t.projectName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600">{t.region}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Sale: <strong>{t.leadSale}</strong> · 2D: <strong>{t.designer2D}</strong>
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-purple-700">
                          {t.type2DCount || 0} 2D · {t.type3DCount || 0} 3D
                        </span>
                        <div className="flex gap-1">
                          {[50, 75, 100].map((pct) => (
                            <button
                              key={pct}
                              onClick={() => handleUpdateProgress(t.id, pct)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                t.progressPercent === pct
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: Compact Table */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Dự Án</th>
                  <th className="py-3 px-3">Thị Trường</th>
                  <th className="py-3 px-3">Loại</th>
                  <th className="py-3 px-3">Khối Lượng</th>
                  <th className="py-3 px-3">Sale / Designer</th>
                  <th className="py-3 px-3">Tiến Độ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{t.projectName}</td>
                    <td className="py-2.5 px-3">{t.region}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.statusType === "New" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {t.statusType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-purple-700">
                      {t.type2DCount || 0} 2D · {t.type3DCount || 0} 3D
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      Sale: <strong>{t.leadSale}</strong> / KTS: <strong>{t.designer2D}</strong>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-blue-700">{t.progressPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Thêm Yêu Cầu Thiết Kế 2D/3D Mới
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-bold">Tên Dự Án *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Go gym (Cambodia) New Layout"
                  value={newTask.projectName}
                  onChange={(e) => setNewTask({ ...newTask, projectName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Khách Hàng / Đối tác</label>
                <input
                  type="text"
                  placeholder="VD: Anh Thành - ĐH HCM"
                  value={newTask.client}
                  onChange={(e) => setNewTask({ ...newTask, client: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Sale phụ trách</label>
                  <input
                    type="text"
                    value={newTask.leadSale}
                    onChange={(e) => setNewTask({ ...newTask, leadSale: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Designer 2D</label>
                  <input
                    type="text"
                    value={newTask.designer2D}
                    onChange={(e) => setNewTask({ ...newTask, designer2D: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Designer 3D</label>
                  <input
                    type="text"
                    value={newTask.designer3D}
                    onChange={(e) => setNewTask({ ...newTask, designer3D: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Trạng thái 2D</label>
                  <select
                    value={newTask.stage2D}
                    onChange={(e) => setNewTask({ ...newTask, stage2D: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="in_progress">Đang dựng layout 2D</option>
                    <option value="review">Chờ khách duyệt</option>
                    <option value="completed">Đã chốt layout 2D</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Trạng thái 3D</label>
                  <select
                    value={newTask.stage3D}
                    onChange={(e) => setNewTask({ ...newTask, stage3D: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="pending">Chưa bắt đầu</option>
                    <option value="in_progress">Đang render 3D</option>
                    <option value="review">Chờ duyệt phối cảnh</option>
                    <option value="completed">Đã chốt phối cảnh 3D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Hạn Chót (Due Date)</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Tiến độ ước tính (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newTask.progressPercent}
                    onChange={(e) => setNewTask({ ...newTask, progressPercent: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Nội dung chi tiết task</label>
                <textarea
                  rows={2}
                  placeholder="Khảo sát, bóc tách DWG, dựng phối cảnh khu cardio, phòng reformer..."
                  value={newTask.taskDetail}
                  onChange={(e) => setNewTask({ ...newTask, taskDetail: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400"
                />
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
                  Lưu Task Thiết Kế
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
