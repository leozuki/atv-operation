import React, { useState, useMemo } from "react";
import {
  Wrench,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Plus,
  AlertCircle,
  Sparkles,
  Truck,
  RotateCw,
  Search,
  Users,
} from "lucide-react";
import { formatDate } from "../utils/formatters";

export default function MaintenanceSchedule({ schedule, setSchedule }) {
  const [activeRegion, setActiveRegion] = useState("HCM");
  const [filterType, setFilterType] = useState("all");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  const [newTask, setNewTask] = useState({
    day: "Thứ 2 (Monday)",
    site: "",
    type: "maintenance",
    content: "",
    tech: "",
    priority: "medium",
  });

  const currentRegionDays = schedule[activeRegion] || [];

  // Zoho-inspired Resource Utilization for Technicians in activeRegion
  const techWorkload = useMemo(() => {
    const map = {};
    currentRegionDays.forEach((dayObj) => {
      dayObj.tasks.forEach((t) => {
        const names = (t.tech || "Đội Kỹ Thuật")
          .split(/[,&+]/)
          .map((s) => s.replace(/\(.*?\)/g, "").trim())
          .filter(Boolean);
        names.forEach((name) => {
          if (!map[name]) {
            map[name] = { name, total: 0, completed: 0, active: 0 };
          }
          map[name].total += 1;
          if (t.status === "completed") map[name].completed += 1;
          else map[name].active += 1;
        });
      });
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [currentRegionDays]);

  const handleUpdateTaskStatus = (dayName, taskId, newStatus) => {
    const updated = {
      ...schedule,
      [activeRegion]: schedule[activeRegion].map((d) => {
        if (d.day === dayName) {
          return {
            ...d,
            tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
          };
        }
        return d;
      }),
    };
    setSchedule(updated);
  };

  const handleAddTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTask.site || !newTask.content) return;

    const taskToAdd = {
      id: `TK-${activeRegion}-${Date.now().toString().slice(-4)}`,
      site: newTask.site,
      type: newTask.type,
      content: newTask.content,
      tech: newTask.tech || "Đội Kỹ Thuật",
      status: "pending",
      priority: newTask.priority,
    };

    const updated = {
      ...schedule,
      [activeRegion]: schedule[activeRegion].map((d) => {
        if (d.day === newTask.day) {
          return {
            ...d,
            tasks: [...d.tasks, taskToAdd],
          };
        }
        return d;
      }),
    };

    setSchedule(updated);
    setShowAddTaskModal(false);
    setNewTask({
      day: "Thứ 2 (Monday)",
      site: "",
      type: "maintenance",
      content: "",
      tech: "",
      priority: "medium",
    });
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "maintenance":
        return { label: "Bảo Trì Định Kỳ", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "repair":
        return { label: "Sửa Chữa / Linh Kiện", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      case "demo":
        return { label: "Demo Thiết Bị", bg: "bg-purple-50 text-purple-800 border-purple-200" };
      case "delivery":
        return { label: "Giao & Đổi Máy", bg: "bg-blue-50 text-blue-800 border-blue-200" };
      case "survey":
        return { label: "Khảo Sát Mặt Bằng", bg: "bg-cyan-50 text-cyan-800 border-cyan-200" };
      default:
        return { label: type, bg: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  const totalTasks = currentRegionDays.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedTasks = currentRegionDays.reduce(
    (acc, d) => acc + d.tasks.filter((t) => t.status === "completed").length,
    0
  );
  const maintenanceCycles = currentRegionDays.reduce(
    (acc, d) => acc + d.tasks.filter((t) => t.type === "maintenance").length,
    0
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">
            Lịch Bảo Trì & Kỹ Thuật
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm transition shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Lịch Công Tác</span>
          </button>
        </div>
      </div>

      {/* Region Switcher Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveRegion("HCM")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeRegion === "HCM"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>Plan HCM (Miền Nam)</span>
            <span className="text-[11px] px-2 py-0.2 bg-black/10 rounded-full">
              {schedule.HCM.reduce((acc, d) => acc + d.tasks.length, 0)} việc
            </span>
          </button>

          <button
            onClick={() => setActiveRegion("HN")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeRegion === "HN"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>Plan HN (Miền Bắc)</span>
            <span className="text-[11px] px-2 py-0.2 bg-black/10 rounded-full">
              {schedule.HN.reduce((acc, d) => acc + d.tasks.length, 0)} việc
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs px-3 text-slate-600 font-medium">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">Tất cả loại việc</option>
            <option value="maintenance">Bảo trì định kỳ</option>
            <option value="repair">Sửa chữa / Linh kiện</option>
            <option value="delivery">Giao & Lắp máy</option>
            <option value="survey">Khảo sát MB</option>
          </select>
          <span>
            Hoàn thành: <strong className="text-emerald-700">{completedTasks}/{totalTasks}</strong>
          </span>
          <span className="text-slate-300">•</span>
          <span>
            Bảo trì định kỳ: <strong className="text-blue-700">{maintenanceCycles}</strong> ca
          </span>
        </div>
      </div>

      {/* Zoho-inspired Technician Resource Utilization Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <Users className="w-4 h-4 text-blue-600" /> Tải Trọng Đội Kỹ Thuật ({activeRegion === "HCM" ? "Miền Nam" : "Miền Bắc"}) — Resource Utilization
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Định mức: 5 ca công tác / tuần</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {techWorkload.map((ktv) => {
            const utilPct = Math.min(100, Math.round((ktv.total / 5) * 100));
            const isOverloaded = utilPct >= 85;
            return (
              <div key={ktv.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate">{ktv.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isOverloaded ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                    {utilPct}% tải
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isOverloaded ? "bg-amber-500" : "bg-emerald-600"}`}
                    style={{ width: `${utilPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Tổng: <strong>{ktv.total} ca</strong></span>
                  <span className="text-emerald-700 font-semibold">✓ {ktv.completed} xong · {ktv.active} chờ</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Days Schedule Feed */}
      <div className="space-y-4">
        {currentRegionDays.map((dayObj) => {
          const tasks =
            filterType === "all"
              ? dayObj.tasks
              : dayObj.tasks.filter((t) => t.type === filterType);

          return (
            <div
              key={dayObj.day}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-blue-700">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      {dayObj.day}
                    </h3>
                    <p className="text-xs text-slate-500">Ngày: {formatDate(dayObj.date)}</p>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
                  {tasks.length} nhiệm vụ
                </span>
              </div>

              {/* Tasks List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasks.map((task) => {
                  const typeBadge = getTypeBadge(task.type);
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                        task.status === "completed"
                          ? "bg-slate-50 border-emerald-200 opacity-80"
                          : task.status === "in_progress"
                          ? "bg-blue-50/50 border-blue-300"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div>
                        {/* Task badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${typeBadge.bg}`}
                          >
                            {typeBadge.label}
                          </span>

                          <div className="flex items-center gap-1 text-[11px]">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-700 font-bold">{task.tech}</span>
                          </div>
                        </div>

                        {/* Site */}
                        <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{task.site}</span>
                        </h4>

                        {/* Content */}
                        <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                          {task.content}
                        </p>
                      </div>

                      {/* Action status */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          Trạng thái:{" "}
                          <strong
                            className={
                              task.status === "completed"
                                ? "text-emerald-700"
                                : task.status === "in_progress"
                                ? "text-blue-700"
                                : "text-amber-700"
                            }
                          >
                            {task.status === "completed"
                              ? "✓ Hoàn thành"
                              : task.status === "in_progress"
                              ? "⏳ Đang xử lý"
                              : "● Chưa thực hiện"}
                          </strong>
                        </span>

                        <button
                          onClick={() =>
                            handleUpdateTaskStatus(
                              dayObj.day,
                              task.id,
                              task.status === "completed" ? "pending" : "completed"
                            )
                          }
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition border ${
                            task.status === "completed"
                              ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                              : "bg-emerald-600 border-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {task.status === "completed" ? "Mở lại" : "Xong"}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {tasks.length === 0 && (
                  <div className="col-span-2 py-4 text-center text-xs text-slate-400 italic">
                    Không có lịch làm việc phát sinh cho ngày này.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Thêm Lịch Kỹ Thuật ({activeRegion === "HCM" ? "Miền Nam" : "Miền Bắc"})
              </h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Thứ trong tuần *</label>
                  <select
                    value={newTask.day}
                    onChange={(e) => setNewTask({ ...newTask, day: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Thứ 2 (Monday)">Thứ 2 (Monday)</option>
                    <option value="Thứ 3 (Tuesday)">Thứ 3 (Tuesday)</option>
                    <option value="Thứ 4 (Wednesday)">Thứ 4 (Wednesday)</option>
                    <option value="Thứ 5 (Thursday)">Thứ 5 (Thursday)</option>
                    <option value="Thứ 6 (Friday)">Thứ 6 (Friday)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Loại công việc *</label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="maintenance">Bảo Trì Định Kỳ (HĐ)</option>
                    <option value="repair">Sửa Chữa / Thay Linh Kiện</option>
                    <option value="demo">Demo Thiết Bị</option>
                    <option value="delivery">Giao & Đổi Máy</option>
                    <option value="survey">Khảo Sát Báo Giá</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Địa điểm / Khách hàng *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Flamingo Cát Bà hoặc RMIT hoặc Chateau Villa PMH"
                  value={newTask.site}
                  onChange={(e) => setNewTask({ ...newTask, site: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Nội dung công việc chi tiết *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="VD: Thay running belt PRECOR TRM600-18 (3 chiếc), bảo trì định kỳ lần 1/4..."
                  value={newTask.content}
                  onChange={(e) => setNewTask({ ...newTask, content: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Kỹ thuật viên phụ trách</label>
                <input
                  type="text"
                  placeholder="VD: Trần Hữu Thắng (Lead), Quốc Anh"
                  value={newTask.tech}
                  onChange={(e) => setNewTask({ ...newTask, tech: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-sm"
                >
                  Lưu Lịch Làm Việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
