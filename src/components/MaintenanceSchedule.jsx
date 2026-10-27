import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Plus,
  Users,
  Share2,
  Check,
  Copy,
} from "lucide-react";
import { formatDate } from "../utils/formatters";
import { getShareableLink, copyToClipboard } from "../utils/navigation";
import { estimateTicketCompletion, HUBSPOT_TICKET_CATEGORIES } from "../utils/slaEstimator";
import TaskShareReminderModal from "./TaskShareReminderModal";
import FieldWorkLogModal from "./FieldWorkLogModal";

export default function MaintenanceSchedule({
  schedule,
  setSchedule,
  selectedTaskId,
  users = [],
  showToast,
}) {
  const [activeRegion, setActiveRegion] = useState("HCM");
  const [filterType, setFilterType] = useState("all");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderItem, setReminderItem] = useState(null);
  const [copiedTaskId, setCopiedTaskId] = useState(null);
  const [showFieldLogModal, setShowFieldLogModal] = useState(false);
  const [fieldLogItem, setFieldLogItem] = useState(null);
  const [showSlaBenchmark, setShowSlaBenchmark] = useState(false);

  const handleOpenFieldLog = (task, day) => {
    setFieldLogItem({ ...task, day });
    setShowFieldLogModal(true);
  };

  // If selectedTaskId is passed via URL, find which region it belongs to and scroll
  useEffect(() => {
    if (selectedTaskId && schedule) {
      const isInHN = (schedule.HN || []).some((d) =>
        d.tasks.some((t) => t.id === selectedTaskId)
      );
      if (isInHN && activeRegion !== "HN") {
        setActiveRegion("HN");
      }
      setTimeout(() => {
        const el = document.getElementById(`maint-${selectedTaskId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
    }
  }, [selectedTaskId, schedule]);

  const handleCopyTaskLink = async (task, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    const link = getShareableLink("maintenance", { task: task.id });
    const ok = await copyToClipboard(link);
    if (ok) {
      setCopiedTaskId(task.id);
      setTimeout(() => setCopiedTaskId(null), 2500);
      if (showToast) showToast(`Đã sao chép liên kết ca bảo trì: ${task.site}`);
    }
  };

  const handleShareTask = (task, dayName, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    setReminderItem({
      id: task.id,
      title: `${task.site} - ${task.content}`,
      type: "maintenance",
      assignee: task.tech,
      deadline: dayName || "Trong tuần",
      status: task.status === "completed" ? "Đã xong" : "Chưa hoàn thành",
      notes: `Địa điểm: ${task.site}. Nội dung: ${task.content}`,
      shareUrl: getShareableLink("maintenance", { task: task.id }),
    });
    setShowReminderModal(true);
  };

  const [newTask, setNewTask] = useState({
    day: "Thứ 2 (Monday)",
    site: "",
    type: "maintenance",
    content: "",
    tech: "",
    priority: "medium",
  });

  const currentRegionDays = schedule[activeRegion] || [];

  // Technicians from users who belong to activeRegion
  const allRegionTechs = useMemo(() => {
    return users.filter((u) => {
      const isTechRole = u.roleId === "warehouse_tech" || u.roleId === "tech_manager" || (u.department && u.department.includes("Kỹ Thuật"));
      if (!isTechRole) return false;
      if (activeRegion === "HCM") {
        return u.region === "Miền Nam" || u.region === "Toàn quốc";
      } else {
        return u.region === "Miền Bắc" || u.region === "Toàn quốc";
      }
    });
  }, [users, activeRegion]);

  // Zoho-inspired Resource Utilization for Technicians & Idle Roster in activeRegion
  const { techWorkload, idleTechs } = useMemo(() => {
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

    const activeTechList = Object.values(map).sort((a, b) => b.total - a.total);
    const assignedNames = new Set(Object.keys(map).map((n) => n.toLowerCase()));

    // Technicians roster with default fallbacks
    const defaultRegionStaff = activeRegion === "HCM"
      ? [
          { name: "Trung Tech Mgr", title: "Kỹ Thuật Trưởng Toàn Quốc", phone: "0912 345 678", role: "Trưởng Phòng" },
          { name: "Lương Nguyễn Tuấn Anh", title: "Kỹ Thuật & Quản Lý Dịch Vụ HCM", phone: "0902 334 455", role: "Trưởng Kỹ Thuật HCM" },
          { name: "Lý Trường Tiến", title: "KTV Cơ Điện & Lắp Máy HCM", phone: "0909 333 444", role: "KTV Hiện Trường" },
          { name: "Bùi Hoàng Thái Châu", title: "KTV Thiết Bị Thể Thao HCM", phone: "0938 111 222", role: "KTV Hiện Trường" },
        ]
      : [
          { name: "Anh Chu Viet", title: "KTV Lắp Đặt & Bảo Trì Hà Nội", phone: "0983 222 333", role: "KTV Hiện Trường" },
          { name: "Tuân Bùi Duy", title: "KTV Lắp Đặt & Bảo Trì Hà Nội", phone: "0974 556 778", role: "KTV Hiện Trường" },
          { name: "Lai the Hai", title: "KTV Lắp Đặt & Bảo Trì HN", phone: "0912 345 678", role: "KTV Hiện Trường" },
        ];

    const unassigned = [];
    allRegionTechs.forEach((u) => {
      const match = Array.from(assignedNames).some((n) => u.name.toLowerCase().includes(n) || n.includes(u.name.toLowerCase()));
      if (!match) {
        unassigned.push({
          name: u.name,
          title: u.title,
          phone: u.phone,
          role: u.roleId === "tech_manager" ? "Kỹ Thuật Trưởng" : "KTV Hiện Trường",
          avatar: u.avatar,
        });
      }
    });

    defaultRegionStaff.forEach((s) => {
      const matchAssigned = Array.from(assignedNames).some((n) => s.name.toLowerCase().includes(n) || n.includes(s.name.toLowerCase()));
      const matchUnassigned = unassigned.some((u) => u.name.toLowerCase().includes(s.name.toLowerCase()));
      if (!matchAssigned && !matchUnassigned) {
        unassigned.push(s);
      }
    });

    return { techWorkload: activeTechList, idleTechs: unassigned };
  }, [currentRegionDays, allRegionTechs, activeRegion]);

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

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowSlaBenchmark(!showSlaBenchmark)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 cursor-pointer ${
              showSlaBenchmark
                ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }`}
            title="Xem bảng đề xuất thời gian hoàn thành truy ngược từ HubSpot CRM"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{showSlaBenchmark ? "Ẩn Đề Xuất Est Time" : "Đề Xuất Est Time (HubSpot SLA)"}</span>
          </button>

          <button
            onClick={() => setShowAddTaskModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Lịch Công Tác</span>
          </button>
        </div>
      </div>

      {/* HubSpot Reverse-Trace SLA Benchmark Banner */}
      {showSlaBenchmark && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md border border-indigo-900/50 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  HubSpot Reverse-Trace
                </span>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Đề Xuất Thời Gian Hoàn Thành Tiêu Chuẩn (Truy Ngược Từ 11 Vé HubSpot CRM)
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Dữ liệu được trích xuất từ lịch sử xử lý thực tế của pipeline Kỹ Thuật (AT Technical Dept) giúp đội KTV &amp; Quản trị cam kết thời gian chính xác với khách hàng:
              </p>
            </div>
            <button
              onClick={() => setShowSlaBenchmark(false)}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold self-start cursor-pointer"
            >
              Đóng bảng
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {Object.values(HUBSPOT_TICKET_CATEGORIES).map((cat) => (
              <div key={cat.key} className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-amber-300 text-xs">{cat.label}</div>
                  <div className="text-xl font-black text-white mt-1">
                    {cat.avgHours < 8 ? `${cat.avgHours}h` : `${(cat.avgHours / 8).toFixed(1)} ngày`}
                  </div>
                  <div className="text-[11px] text-slate-300">Biên độ: <strong>{cat.rangeText}</strong></div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-semibold">{cat.slaDescription}</div>
                </div>
                <div className="text-[10px] text-slate-400 pt-2 border-t border-white/10 line-clamp-2" title={cat.benchmarkNote}>
                  {cat.benchmarkNote}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

        {/* Available / Idle Technicians section */}
        {idleTechs && idleTechs.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Nhân Sự Kỹ Thuật Đang Trống Lịch ({idleTechs.length} KTV sẵn sàng điều phối)
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Chưa gán ca tuần này</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {idleTechs.map((ktv) => (
                <div key={ktv.name} className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs flex items-center justify-between gap-2 shadow-2xs">
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 truncate">{ktv.name}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-emerald-100 text-emerald-700">Trống ca</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{ktv.title || ktv.role}</div>
                    {ktv.phone && <div className="text-[10px] text-emerald-800 font-mono">{ktv.phone}</div>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTask((prev) => ({ ...prev, tech: ktv.name }));
                      setShowAddTaskModal(true);
                    }}
                    className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shrink-0 transition shadow-2xs cursor-pointer"
                    title="Gán việc ngay cho KTV này"
                  >
                    + Gán ca
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
                  const sla = estimateTicketCompletion(task);
                  return (
                    <div
                      key={task.id}
                      id={`maint-${task.id}`}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                        selectedTaskId === task.id
                          ? "ring-4 ring-blue-400 border-blue-500 shadow-md"
                          : task.status === "completed"
                          ? "bg-slate-50 border-emerald-200 opacity-80"
                          : task.status === "in_progress"
                          ? "bg-blue-50/50 border-blue-300"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div>
                        {/* Task badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${typeBadge.bg}`}
                            >
                              {typeBadge.label}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {task.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px]">
                            <button
                              type="button"
                              onClick={(e) => handleCopyTaskLink(task, e)}
                              className={`p-1 rounded border transition ${
                                copiedTaskId === task.id
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-blue-600"
                              }`}
                              title="Sao chép liên kết ca bảo trì"
                            >
                              {copiedTaskId === task.id ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleShareTask(task, dayObj.day, e)}
                              className="p-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 transition"
                              title="Nhắc việc Zalo / Email"
                            >
                              <Share2 className="w-3 h-3" />
                            </button>
                            <div className="flex items-center gap-1 text-[11px]">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-slate-700 font-bold">{task.tech}</span>
                            </div>
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

                        {/* Est Completion Time from HubSpot Benchmark */}
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-semibold text-slate-600">Est Time hoàn thành:</span>
                            <span className="font-black text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md border border-blue-200 text-[11px]">
                              ⏱️ {task.estTime || sla.estHoursFormatted}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${sla.badgeColor}`} title={sla.benchmarkNote}>
                            {sla.shortLabel} • {sla.slaDescription}
                          </span>
                        </div>
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

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenFieldLog(task, dayObj.day)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition flex items-center gap-1"
                            title="Log Time KTV & Chụp ảnh nghiệm thu (Telegram)"
                          >
                            <Clock className="w-3 h-3 text-sky-600" />
                            <span>Log Time</span>
                          </button>
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
                  placeholder="VD: Lương Nguyễn Tuấn Anh (Lead), Lý Trường Tiến"
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

      {/* Share and Remind Modal (Telegram / Zalo / Email / Link) */}
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
          showToast={showToast}
        />
      )}

      {/* Field Work Log Modal (Log Time & Photo Evidence) */}
      <FieldWorkLogModal
        isOpen={showFieldLogModal}
        onClose={() => {
          setShowFieldLogModal(false);
          setFieldLogItem(null);
        }}
        task={fieldLogItem}
        onSaveLog={(newLog) => {
          if (fieldLogItem && fieldLogItem.day) {
            handleUpdateTaskStatus(fieldLogItem.day, fieldLogItem.id, "completed");
          }
          if (showToast) {
            showToast(`Đã lưu Log Time hiện trường: ${newLog.durationFormatted}`);
          }
        }}
        showToast={showToast}
      />
    </div>
  );
}
