import React, { useState } from "react";
import { formatVND, formatDate } from "../utils/formatters";
import { initialWeeklySchedule } from "../data/initialData";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Wrench,
  Ship,
  Camera,
  ClipboardCheck,
  Palette,
  DollarSign,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Plus,
  FileText,
} from "lucide-react";

export default function OperationsCalendar({
  projects = [],
  shipments = [],
  schedule = { HCM: [], HN: [] },
  designTasks = [],
  collections = [],
  tenders = [],
  checklists = [],
  onNavigateTab,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9, 1)); // October 2026
  const [selectedDate, setSelectedDate] = useState("2026-10-19"); // Default Today: Oct 19, 2026
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [viewMode, setViewMode] = useState("week"); // 'week' or 'month'

  const safeSchedule =
    schedule &&
    ((schedule.HCM && schedule.HCM.length > 0) || (schedule.HN && schedule.HN.length > 0))
      ? schedule
      : initialWeeklySchedule;

  // Aggregate all events across all departments into date-keyed objects
  const allEvents = [];

  // 1. Technical Field Schedule (HCM & HN)
  safeSchedule.HCM?.forEach((day) => {
    day.tasks?.forEach((t) => {
      allEvents.push({
        id: t.id,
        date: day.date,
        time: "08:30 - 17:30",
        type: "tech",
        typeLabel: "Kỹ Thuật Hiện Trường",
        dept: "HCM",
        title: `${t.site}`,
        detail: t.content,
        assignee: t.tech,
        status: t.status,
        color: "bg-amber-50 text-amber-900 border-amber-200",
        badgeBg: "bg-amber-100 text-amber-800",
        icon: Wrench,
      });
    });
  });

  safeSchedule.HN?.forEach((day) => {
    day.tasks?.forEach((t) => {
      allEvents.push({
        id: t.id,
        date: day.date,
        time: "08:30 - 17:30",
        type: "tech",
        typeLabel: "Kỹ Thuật Hiện Trường",
        dept: "HN",
        title: `${t.site}`,
        detail: t.content,
        assignee: t.tech,
        status: t.status,
        color: "bg-orange-50 text-orange-900 border-orange-200",
        badgeBg: "bg-orange-100 text-orange-800",
        icon: Wrench,
      });
    });
  });

  // 2. Logistics PO Arrivals / ETAs
  shipments.forEach((s) => {
    if (s.eta && s.eta !== "TBU") {
      allEvents.push({
        id: s.id,
        date: s.eta,
        time: s.method === "Air" ? "Hàng Air" : "Hàng Tàu Biển",
        type: "logistics",
        typeLabel: `Nhập Kho ${s.warehouse === "DA" ? "Đông Anh (DA)" : "Bình Dương (BD)"}`,
        dept: s.warehouse,
        title: `PO ${s.poCode} (${s.brand})`,
        detail: `Dự án: ${s.projects?.join(", ")}. ${s.statusNote || ""}`,
        shortage: s.shortageStatus !== "normal",
        shortageDetail: s.shortageDetail,
        status: s.status,
        color: "bg-blue-50 text-blue-900 border-blue-200",
        badgeBg: "bg-blue-100 text-blue-800",
        icon: Ship,
      });
    }
  });

  // 3. Projects: Handover (Marketing) & Installation
  projects.forEach((p) => {
    if (p.handoverDate) {
      allEvents.push({
        id: `${p.id}-handover`,
        date: p.handoverDate,
        time: "Toàn ngày",
        type: "marketing",
        typeLabel: "Bàn Giao Mặt Bằng (Marketing)",
        dept: p.region,
        title: `Bàn Giao: ${p.name}`,
        detail: p.marketingNote || `Mặt bằng sẵn sàng để marketing quay chụp review máy ${p.brand}`,
        assignee: p.contact || "Sale & Marketing",
        status: p.marketingReady ? "ready" : "pending",
        color: "bg-pink-50 text-pink-900 border-pink-200",
        badgeBg: "bg-pink-100 text-pink-800",
        icon: Camera,
      });
    }

    if (p.installationDate) {
      allEvents.push({
        id: `${p.id}-install`,
        date: p.installationDate,
        time: "Giao lắp",
        type: "installation",
        typeLabel: "Lắp Đặt Thiết Bị",
        dept: p.region,
        title: `Lắp Máy: ${p.name}`,
        detail: `KTV phụ trách: ${p.assignedTech}. Tiến độ checklist BOM: ${p.checklistProgress}%`,
        assignee: p.assignedTech,
        status: p.stage,
        color: "bg-cyan-50 text-cyan-900 border-cyan-200",
        badgeBg: "bg-cyan-100 text-cyan-800",
        icon: ClipboardCheck,
      });
    }
  });

  // 4. Design Deadlines
  designTasks.forEach((d) => {
    if (d.dueDate) {
      allEvents.push({
        id: d.id,
        date: d.dueDate,
        time: "Hạn chốt",
        type: "design",
        typeLabel: "Hạn Bản Vẽ Thiết Kế",
        dept: d.region,
        title: `Duyệt Layout: ${d.projectName}`,
        detail: `${d.taskDetail} (Designer: ${d.designer2D} / ${d.designer3D})`,
        assignee: d.leadSale,
        status: d.progressPercent === 100 ? "completed" : "in_progress",
        color: "bg-purple-50 text-purple-900 border-purple-200",
        badgeBg: "bg-purple-100 text-purple-800",
        icon: Palette,
      });
    }
  });

  // 5. Finance Collections (Collection week)
  collections.forEach((c) => {
    if (c.date) {
      allEvents.push({
        id: c.id,
        date: c.date,
        time: "Nổi tài khoản",
        type: "finance",
        typeLabel: "Thu Tiền Khách Hàng",
        dept: "Finance",
        title: `Thu: ${c.customer}`,
        detail: `${formatVND(c.amount)} - ${c.dealType} (${c.paymentMethod})`,
        assignee: "Kế toán",
        status: "collected",
        color: "bg-emerald-50 text-emerald-900 border-emerald-200",
        badgeBg: "bg-emerald-100 text-emerald-800",
        icon: DollarSign,
      });
    }
  });

  // 6. Tender Submissions & Contract Deadlines
  tenders.forEach((t) => {
    const deadlineDate = t.validUntil || t.deadline || t.submissionDate || "2026-10-25";
    if (deadlineDate && deadlineDate !== "TBU") {
      allEvents.push({
        id: t.id,
        date: deadlineDate,
        time: "Hạn hợp đồng / thầu",
        type: "tender",
        typeLabel: `Báo Giá / Hợp Đồng (${t.type})`,
        dept: "Sales",
        title: `HĐ/Thầu: ${t.project}`,
        detail: `Giá trị: ${formatVND(t.valueBeforeVat || 0)} - Trạng thái: ${t.status}`,
        assignee: t.creator || "Sales Lead",
        status: t.status,
        color: "bg-indigo-50 text-indigo-900 border-indigo-200",
        badgeBg: "bg-indigo-100 text-indigo-800",
        icon: FileText,
      });
    }
  });

  // 7. Checklist Inspection Dates
  checklists.forEach((c) => {
    if (c.inspectionDate) {
      allEvents.push({
        id: `chk-${c.projectId}`,
        date: c.inspectionDate,
        time: "Kiểm đếm BOM",
        type: "checklist",
        typeLabel: "Kiểm Đếm Vật Tư Lắp Đặt",
        dept: c.projectId?.includes("HN") ? "HN" : "HCM",
        title: `Kiểm Đếm: ${c.projectName}`,
        detail: `KTV: ${c.verifier} - Trạng thái: ${c.status === "ready" ? "Đủ hàng 100%" : "Cần lưu ý/thiếu"}`,
        assignee: c.verifier,
        status: c.status,
        color: "bg-teal-50 text-teal-900 border-teal-200",
        badgeBg: "bg-teal-100 text-teal-800",
        icon: ClipboardCheck,
      });
    }
  });

  // Filter events
  const filteredEvents = allEvents.filter((ev) => {
    if (departmentFilter === "all") return true;
    return ev.type === departmentFilter;
  });

  // Helper for generating calendar grid for October 2026
  // Oct 1 2026 is Thursday (day 4 in 0-indexed Sun=0, or day 3 in Mon=0)
  const daysInMonth = 31;
  const startDayOfWeek = 4; // Thursday: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // We align with Monday as first column (Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6)
  const mondayOffset = (startDayOfWeek + 6) % 7; // Thursday = index 3

  const calendarDays = [];
  // Leading empty days from prev month (September)
  for (let i = 0; i < mondayOffset; i++) {
    const prevDateNum = 30 - mondayOffset + i + 1;
    calendarDays.push({
      dateStr: `2026-09-${prevDateNum < 10 ? "0" + prevDateNum : prevDateNum}`,
      dayNum: prevDateNum,
      isCurrentMonth: false,
    });
  }

  // Current month days (October 2026)
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = d < 10 ? `0${d}` : `${d}`;
    calendarDays.push({
      dateStr: `2026-10-${dStr}`,
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Trailing days for November
  const remainingCells = 35 - calendarDays.length > 0 ? 35 - calendarDays.length : 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    const dStr = d < 10 ? `0${d}` : `${d}`;
    calendarDays.push({
      dateStr: `2026-11-${dStr}`,
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // Week days for current active week (Oct 19 - Oct 25, 2026)
  const weekDays = [
    { dateStr: "2026-10-19", dayNum: 19, dayLabel: "Thứ 2", isToday: true },
    { dateStr: "2026-10-20", dayNum: 20, dayLabel: "Thứ 3", isToday: false },
    { dateStr: "2026-10-21", dayNum: 21, dayLabel: "Thứ 4", isToday: false },
    { dateStr: "2026-10-22", dayNum: 22, dayLabel: "Thứ 5", isToday: false },
    { dateStr: "2026-10-23", dayNum: 23, dayLabel: "Thứ 6", isToday: false },
    { dateStr: "2026-10-24", dayNum: 24, dayLabel: "Thứ 7", isToday: false, isWeekend: true },
    { dateStr: "2026-10-25", dayNum: 25, dayLabel: "Chủ Nhật", isToday: false, isWeekend: true },
  ];

  // Events for selected date
  const selectedDateEvents = filteredEvents.filter((e) => e.date === selectedDate);

  const getEventsForDate = (dateStr) => {
    return filteredEvents.filter((e) => e.date === dateStr);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white py-3 px-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <CalendarIcon className="w-4 h-4" />
          </span>
          <h1 className="text-lg md:text-xl font-bold text-slate-900">
            Lịch Vận Hành
          </h1>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Tháng 10/2026
          </span>
        </div>

        {/* Quick Month Control & Today Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSelectedDate("2026-10-19")}
            className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition"
          >
            Hôm Nay (19/10)
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === "week" ? "bg-white shadow-xs text-blue-600 font-extrabold" : "hover:text-slate-900"
              }`}
            >
              Xem Tuần
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === "month" ? "bg-white shadow-xs text-blue-600 font-extrabold" : "hover:text-slate-900"
              }`}
            >
              Xem Tháng
            </button>
          </div>
        </div>
      </div>

      {/* Department Filter Bar */}
      <div className="bg-white py-2.5 px-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc Phân Hệ:
          </span>

          <button
            onClick={() => setDepartmentFilter("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              departmentFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất Cả ({allEvents.length})
          </button>

          <button
            onClick={() => setDepartmentFilter("tech")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              departmentFilter === "tech"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" /> Kỹ Thuật 2 Miền (
            {allEvents.filter((e) => e.type === "tech").length})
          </button>

          <button
            onClick={() => setDepartmentFilter("logistics")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              departmentFilter === "logistics"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
            }`}
          >
            <Ship className="w-3.5 h-3.5" /> Tàu / Air Về Kho (
            {allEvents.filter((e) => e.type === "logistics").length})
          </button>

          <button
            onClick={() => setDepartmentFilter("marketing")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              departmentFilter === "marketing"
                ? "bg-pink-600 text-white shadow-xs"
                : "bg-pink-50 text-pink-800 hover:bg-pink-100 border border-pink-200"
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Bàn Giao MB (Marketing) (
            {allEvents.filter((e) => e.type === "marketing").length})
          </button>

          <button
            onClick={() => setDepartmentFilter("installation")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              departmentFilter === "installation"
                ? "bg-cyan-600 text-white shadow-xs"
                : "bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200"
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" /> Lắp Đặt Máy (
            {allEvents.filter((e) => e.type === "installation").length})
          </button>

          <button
            onClick={() => setDepartmentFilter("finance")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              departmentFilter === "finance"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Tiền Về (
            {allEvents.filter((e) => e.type === "finance").length})
          </button>

          <button
            onClick={() => setDepartmentFilter("tender")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              departmentFilter === "tender"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Báo Giá / HĐ (
            {allEvents.filter((e) => e.type === "tender").length})
          </button>

          <button
            onClick={() => setDepartmentFilter("checklist")}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              departmentFilter === "checklist"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200"
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" /> Kiểm Đếm BOM (
            {allEvents.filter((e) => e.type === "checklist").length})
          </button>
        </div>

        <div className="text-slate-400 font-medium">
          Đang chọn ngày: <strong className="text-slate-900">{formatDate(selectedDate)}</strong>
        </div>
      </div>

      {/* Main Calendar Section (Left: Grid/Week, Right: Daily Agenda Drawer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Left View (8 Cols): Conditional Week View or Month Grid */}
        {viewMode === "week" ? (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            {/* Week View Header Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-800">
                  Lịch Tuần Vận Hành: 19/10/2026 - 25/10/2026
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  Tuần 43
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Tổng cộng: <strong className="text-slate-900">{weekDays.reduce((acc, d) => acc + getEventsForDate(d.dateStr).length, 0)} đầu việc</strong>
              </div>
            </div>

            {/* 7 Columns Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-100 min-h-[580px] p-2 gap-2 xl:gap-0 bg-slate-50/50">
              {weekDays.map((day) => {
                const dayEvents = getEventsForDate(day.dateStr);
                const isSelected = day.dateStr === selectedDate;
                return (
                  <div
                    key={day.dateStr}
                    onClick={() => setSelectedDate(day.dateStr)}
                    className={`p-2 rounded-xl transition cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? "bg-blue-50/90 ring-2 ring-blue-500 shadow-xs"
                        : day.isToday
                        ? "bg-amber-50/70 border border-amber-200"
                        : "bg-white border border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    {/* Day Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <div>
                        <span className={`text-[11px] font-bold block ${day.isWeekend ? "text-rose-600" : "text-slate-800"}`}>
                          {day.dayLabel}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {day.dateStr.slice(8, 10)}/10
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {day.isToday && (
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black">
                            Nay
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {dayEvents.length}
                        </span>
                      </div>
                    </div>

                    {/* Day Tasks List */}
                    <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[500px]">
                      {dayEvents.length === 0 ? (
                        <div className="text-[10px] text-slate-400 text-center py-6 italic">
                          Trống lịch
                        </div>
                      ) : (
                        dayEvents.map((ev, eIdx) => {
                          const Icon = ev.icon || CalendarIcon;
                          return (
                            <div
                              key={ev.id || eIdx}
                              className={`p-1.5 rounded-lg border text-[10px] space-y-1 ${ev.color} transition hover:shadow-2xs`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-extrabold uppercase text-[8px] tracking-wider opacity-80 flex items-center gap-0.5">
                                  <Icon className="w-2.5 h-2.5 shrink-0" />
                                  {ev.dept || ev.typeLabel.split(" ")[0]}
                                </span>
                                <span className="text-[8px] font-semibold opacity-70">
                                  {ev.time}
                                </span>
                              </div>
                              <div className="font-bold text-slate-900 line-clamp-2 leading-tight">
                                {ev.title}
                              </div>
                              <div className="text-[9px] text-slate-600 line-clamp-2 leading-tight opacity-90">
                                {ev.detail}
                              </div>
                              {ev.assignee && (
                                <div className="text-[8px] text-slate-500 font-medium truncate pt-0.5 border-t border-slate-200/50">
                                  {ev.assignee}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Calendar Grid View (8 Cols) */
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <div>Thứ 2</div>
              <div>Thứ 3</div>
              <div>Thứ 4</div>
              <div>Thứ 5</div>
              <div>Thứ 6</div>
              <div className="text-blue-600">Thứ 7</div>
              <div className="text-rose-600">Chủ Nhật</div>
            </div>

            {/* Month Grid Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
              {calendarDays.map((cell, idx) => {
                const dayEvents = getEventsForDate(cell.dateStr);
                const isSelected = cell.dateStr === selectedDate;
                const isToday = cell.dateStr === "2026-10-19";

                // Limit displayed pills on small view
                const visibleEvents = dayEvents.slice(0, 3);
                const extraCount = dayEvents.length - visibleEvents.length;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`min-h-[105px] p-1.5 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-50/70 ring-2 ring-inset ring-blue-500"
                        : isToday
                        ? "bg-amber-50/40"
                        : cell.isCurrentMonth
                        ? "bg-white hover:bg-slate-50/80"
                        : "bg-slate-50/40 text-slate-300"
                    }`}
                  >
                    {/* Date Number Header */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          isToday
                            ? "bg-blue-600 text-white shadow-xs font-extrabold"
                            : isSelected
                            ? "bg-blue-100 text-blue-800"
                            : cell.isCurrentMonth
                            ? "text-slate-800"
                            : "text-slate-400"
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-400">
                          {dayEvents.length} việc
                        </span>
                      )}
                    </div>

                    {/* Event Badges List */}
                    <div className="space-y-1 overflow-hidden flex-1">
                      {visibleEvents.map((ev, eIdx) => {
                        const Icon = ev.icon || CalendarIcon;
                        return (
                          <div
                            key={ev.id || eIdx}
                            title={`${ev.typeLabel}: ${ev.title} - ${ev.detail}`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border truncate flex items-center gap-1 ${ev.color}`}
                          >
                            <Icon className="w-2.5 h-2.5 shrink-0 opacity-70" />
                            <span className="truncate">{ev.title}</span>
                          </div>
                        );
                      })}

                      {extraCount > 0 && (
                        <div className="text-[10px] text-slate-500 font-bold pl-1">
                          +{extraCount} đầu việc khác...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Date Agenda Details Drawer (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                Lịch Chi Tiết Theo Ngày
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
                <span>{formatDate(selectedDate)}</span>
                {selectedDate === "2026-10-19" && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    Hôm Nay
                  </span>
                )}
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
              {selectedDateEvents.length} đầu việc
            </span>
          </div>

          {/* Agenda Event Cards */}
          {selectedDateEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CalendarIcon className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs">Không có lịch trình nào vào ngày này.</p>
              <button
                onClick={() => setSelectedDate("2026-10-19")}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                Quay về ngày hôm nay (19/10)
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {selectedDateEvents.map((ev, idx) => {
                const Icon = ev.icon || CalendarIcon;
                return (
                  <div
                    key={ev.id || idx}
                    className={`p-3.5 rounded-xl border transition shadow-2xs space-y-2 ${ev.color}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`p-1.5 rounded-lg ${ev.badgeBg}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                            {ev.typeLabel}
                          </span>
                          <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">
                            {ev.title}
                          </h4>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/80 border border-slate-200 shrink-0">
                        {ev.dept || ev.time}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{ev.detail}</p>

                    {ev.shortage && (
                      <div className="p-2 rounded-lg bg-red-100/80 border border-red-200 text-[11px] font-bold text-red-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>Cảnh báo: {ev.shortageDetail}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 text-slate-500">
                      <span>Phụ trách: <strong>{ev.assignee || "Bộ phận vận hành"}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          if (ev.type === "tech") onNavigateTab("maintenance", { task: ev.id });
                          else if (ev.type === "logistics") onNavigateTab("logistics", { po: ev.id });
                          else if (ev.type === "tender") onNavigateTab("tender", { tender: ev.id });
                          else if (ev.type === "design") onNavigateTab("design", { task: ev.id });
                          else if (ev.type === "finance") onNavigateTab("finance");
                          else if (ev.type === "checklist") onNavigateTab("checklist");
                          else onNavigateTab("projects");
                        }}
                        className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 bg-white/80 hover:bg-white px-2 py-0.5 rounded border border-slate-200 transition cursor-pointer"
                      >
                        <span>Xem chi tiết</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Action Navigation */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateTab("schedule")}
              className="font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
            >
              <Wrench className="w-3.5 h-3.5" /> Lịch Kỹ Thuật Đầy Đủ
            </button>
            <button
              onClick={() => onNavigateTab("logistics")}
              className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <Ship className="w-3.5 h-3.5" /> Bảng 10 PO Kho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
