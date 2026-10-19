// src/components/ProjectGanttChart.jsx
// Biểu đồ Gantt (Gantt Chart Timeline) theo dõi tiến độ toàn diện các dự án Attivo International
// Tích hợp đối soát 3 bên (Deal Owner, Contact Owner, KTV/Giao Hàng), HubSpot CRM, DMS và Logistics

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Target,
  UserCheck,
  Truck,
  Ship,
  Camera,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Filter,
  Search,
  Maximize2,
  Minimize2,
  FolderOpen,
  Link2,
  Layers,
  Sparkles,
  ArrowRight,
  Activity,
  CalendarDays,
  CalendarRange,
  Flag,
  Wrench,
  Palette,
  FileSpreadsheet,
  X,
  ExternalLink,
  MessageSquare,
  Send,
  AtSign,
} from "lucide-react";

// Định dạng tiền tệ
function formatCurrency(val) {
  if (!val) return "0 đ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
}

function formatShortCurrency(val) {
  if (!val) return "0 đ";
  if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} Tỷ`;
  if (val >= 1000000) return `${(val / 1000000).toFixed(0)} Tr`;
  return formatCurrency(val);
}

// Bảng màu & nhãn cho các giai đoạn dự án
export const STAGE_CONFIG = {
  pre_tender: {
    label: "Tender & Dự Toán",
    color: "bg-amber-500 text-white",
    barColor: "from-amber-400 to-amber-600",
    border: "border-amber-400",
    bgLight: "bg-amber-50 text-amber-800 border-amber-200",
    icon: FileSpreadsheet,
  },
  design: {
    label: "Thiết Kế 2D/3D",
    color: "bg-purple-600 text-white",
    barColor: "from-purple-500 to-indigo-600",
    border: "border-purple-400",
    bgLight: "bg-purple-50 text-purple-800 border-purple-200",
    icon: Palette,
  },
  ordering: {
    label: "Đang Nhập Thiết Bị",
    color: "bg-blue-600 text-white",
    barColor: "from-blue-500 to-cyan-600",
    border: "border-blue-400",
    bgLight: "bg-blue-50 text-blue-800 border-blue-200",
    icon: Ship,
  },
  site_prep: {
    label: "Chuẩn Bị Mặt Bằng",
    color: "bg-sky-600 text-white",
    barColor: "from-sky-400 to-blue-600",
    border: "border-sky-400",
    bgLight: "bg-sky-50 text-sky-800 border-sky-200",
    icon: Layers,
  },
  handover_ready: {
    label: "Bàn Giao MB (Marketing)",
    color: "bg-pink-600 text-white",
    barColor: "from-pink-500 to-rose-600",
    border: "border-pink-400",
    bgLight: "bg-pink-50 text-pink-800 border-pink-200",
    icon: Camera,
  },
  installation: {
    label: "Đang Lắp Đặt Máy",
    color: "bg-cyan-600 text-white",
    barColor: "from-cyan-500 to-teal-600",
    border: "border-cyan-400",
    bgLight: "bg-cyan-50 text-cyan-800 border-cyan-200",
    icon: ClipboardCheck,
  },
  accepted: {
    label: "Nghiệm Thu Bàn Giao",
    color: "bg-emerald-600 text-white",
    barColor: "from-emerald-500 to-teal-700",
    border: "border-emerald-400",
    bgLight: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  maintenance: {
    label: "Hợp Đồng Bảo Trì",
    color: "bg-indigo-600 text-white",
    barColor: "from-indigo-500 to-purple-700",
    border: "border-indigo-400",
    bgLight: "bg-indigo-50 text-indigo-800 border-indigo-200",
    icon: Wrench,
  },
};

// Dữ liệu mở rộng các mốc tiến độ chuẩn hóa cho từng dự án
export function getProjectGanttMilestones(project) {
  // Mốc thời gian mặc định chi tiết từng dự án (có thể đối chiếu với PO và HubSpot)
  const defaultMilestones = {
    "PRJ-001": {
      startDate: "2026-07-16",
      endDate: "2026-10-15",
      phases: [
        { name: "Thiết Kế 2D/3D", start: "2026-07-16", end: "2026-08-15", status: "completed", progress: 100, color: "bg-purple-500" },
        { name: "Nhập Khẩu Cont Merrithew", start: "2026-08-16", end: "2026-09-25", status: "completed", progress: 100, color: "bg-blue-500" },
        { name: "Nghiệm Thu Sàn Gỗ & MB", start: "2026-09-26", end: "2026-10-04", status: "completed", progress: 100, color: "bg-pink-500" },
        { name: "Lắp Đặt 6 Máy Reformer", start: "2026-10-05", end: "2026-10-10", status: "in_progress", progress: 85, color: "bg-cyan-500" },
        { name: "Marketing Chụp Ảnh & Khai Trương", start: "2026-10-10", end: "2026-10-12", status: "planned", progress: 0, color: "bg-pink-600" },
        { name: "Bảo Trì Định Kỳ Lần 1/4", start: "2026-10-13", end: "2026-10-15", status: "planned", progress: 0, color: "bg-indigo-500" },
      ],
      keyEvents: [
        { date: "2026-10-05", label: "Cont hàng về kho ĐA", type: "ship" },
        { date: "2026-10-07", label: "KTV Võ Văn Kiệt bắt đầu lắp", type: "tech" },
        { date: "2026-10-12", label: "Media Flycam & Bàn giao", type: "camera" },
      ],
    },
    "PRJ-002": {
      startDate: "2026-09-10",
      endDate: "2026-10-14",
      phases: [
        { name: "Thương Thảo & HĐ Savills", start: "2026-09-10", end: "2026-09-22", status: "completed", progress: 100, color: "bg-amber-500" },
        { name: "Xuất Kho Precor TRM631 BD", start: "2026-09-23", end: "2026-09-30", status: "completed", progress: 100, color: "bg-blue-500" },
        { name: "Bàn Giao MB Sàn Gỗ PMH", start: "2026-10-01", end: "2026-10-05", status: "completed", progress: 100, color: "bg-sky-500" },
        { name: "Lắp Đặt & Cân Chỉnh Wifi", start: "2026-10-06", end: "2026-10-08", status: "in_progress", progress: 100, color: "bg-cyan-500" },
        { name: "Quay Video Review Máy VIP", start: "2026-10-09", end: "2026-10-10", status: "planned", progress: 0, color: "bg-pink-500" },
        { name: "Bảo Dưỡng Định Kỳ 2/6", start: "2026-10-11", end: "2026-10-14", status: "planned", progress: 0, color: "bg-indigo-500" },
      ],
      keyEvents: [
        { date: "2026-10-04", label: "Biên bản nghiệm thu mặt bằng", type: "doc" },
        { date: "2026-10-06", label: "KTV Thắng lắp máy", type: "tech" },
        { date: "2026-10-10", label: "Marketing review", type: "camera" },
      ],
    },
    "PRJ-003": {
      startDate: "2026-08-25",
      endDate: "2026-10-12",
      phases: [
        { name: "Thiết Kế Gym Grab HQ", start: "2026-08-25", end: "2026-09-08", status: "completed", progress: 100, color: "bg-purple-500" },
        { name: "Cọc 220 Triệu & PO Hãng", start: "2026-09-09", end: "2026-09-18", status: "completed", progress: 100, color: "bg-amber-500" },
        { name: "Cont Tạ Ziva ULS-AT2625 Về Kho", start: "2026-09-19", end: "2026-10-05", status: "completed", progress: 100, color: "bg-blue-500" },
        { name: "Giao Giàn FTS & Đổi Adidas", start: "2026-10-06", end: "2026-10-09", status: "in_progress", progress: 90, color: "bg-cyan-500" },
        { name: "Nghiệm Thu Toàn Bộ 32 Mã", start: "2026-10-09", end: "2026-10-12", status: "planned", progress: 0, color: "bg-emerald-500" },
      ],
      keyEvents: [
        { date: "2026-10-05", label: "Nhận cont Ziva kho ĐA", type: "ship" },
        { date: "2026-10-09", label: "Giao hàng Mapletree Q7", type: "tech" },
      ],
    },
    "PRJ-004": {
      startDate: "2026-08-15",
      endDate: "2026-10-28",
      phases: [
        { name: "Thiết Kế 2D/3D Phối Cảnh", start: "2026-08-15", end: "2026-09-01", status: "completed", progress: 100, color: "bg-purple-500" },
        { name: "Tàu Precor ULS-AT2609-30 Về", start: "2026-09-02", end: "2026-10-08", status: "completed", progress: 100, color: "bg-blue-500" },
        { name: "Bàn Giao MB & Photoshoot", start: "2026-10-09", end: "2026-10-15", status: "in_progress", progress: 60, color: "bg-pink-500" },
        { name: "KTV Lắp Máy Chạy & Elip", start: "2026-10-18", end: "2026-10-24", status: "planned", progress: 0, color: "bg-cyan-500" },
        { name: "Bàn Giao Đưa Vào Vận Hành", start: "2026-10-25", end: "2026-10-28", status: "planned", progress: 0, color: "bg-emerald-500" },
      ],
      keyEvents: [
        { date: "2026-10-08", label: "ETA cont Precor về Hải Phòng", type: "ship" },
        { date: "2026-10-15", label: "Bàn giao MB (Marketing chụp)", type: "camera" },
        { date: "2026-10-18", label: "KTV Đông Anh vào lắp", type: "tech" },
      ],
    },
    "PRJ-005": {
      startDate: "2026-06-15",
      endDate: "2026-10-20",
      phases: [
        { name: "HĐMB Flamingo & Nhập Hàng", start: "2026-06-15", end: "2026-07-25", status: "completed", progress: 100, color: "bg-amber-500" },
        { name: "Lắp Đặt 14 Máy Gym 5 Sao", start: "2026-08-01", end: "2026-08-10", status: "completed", progress: 100, color: "bg-cyan-500" },
        { name: "Nghiệm Thu Đưa Vào Sử Dụng", start: "2026-08-11", end: "2026-08-15", status: "completed", progress: 100, color: "bg-emerald-500" },
        { name: "Đợt Bảo Dưỡng Thay Thảm TRM600", start: "2026-10-05", end: "2026-10-10", status: "in_progress", progress: 100, color: "bg-indigo-600" },
      ],
      keyEvents: [
        { date: "2026-08-15", label: "Bàn giao resort 5 sao", type: "flag" },
        { date: "2026-10-05", label: "Đội KTV ra đảo Cát Bà", type: "tech" },
      ],
    },
    "PRJ-006": {
      startDate: "2026-01-05",
      endDate: "2026-10-25",
      phases: [
        { name: "Ký HĐ Bảo Trì Vinhomes", start: "2026-01-05", end: "2026-01-10", status: "completed", progress: 100, color: "bg-amber-500" },
        { name: "Bảo Trì Định Kỳ Đợt 1", start: "2026-04-05", end: "2026-04-12", status: "completed", progress: 100, color: "bg-indigo-400" },
        { name: "Bảo Trì Định Kỳ Đợt 2", start: "2026-07-10", end: "2026-07-18", status: "completed", progress: 100, color: "bg-indigo-400" },
        { name: "Bảo Trì Lần 1/3 (2026-2027) L6&C3", start: "2026-10-04", end: "2026-10-15", status: "in_progress", progress: 100, color: "bg-indigo-600" },
      ],
      keyEvents: [
        { date: "2026-10-04", label: "Kiểm tra 12 máy chạy L6 & C3", type: "tech" },
      ],
    },
    "PRJ-007": {
      startDate: "2026-09-01",
      endDate: "2026-11-10",
      phases: [
        { name: "Concept 3D Flagship Showroom", start: "2026-09-01", end: "2026-09-20", status: "completed", progress: 100, color: "bg-purple-500" },
        { name: "Cont ULS-AT2606 Skelcore Về BD", start: "2026-09-21", end: "2026-10-15", status: "completed", progress: 100, color: "bg-blue-500" },
        { name: "Chuẩn Bị Sàn & Kệ Trưng Bày", start: "2026-10-16", end: "2026-10-25", status: "in_progress", progress: 40, color: "bg-sky-500" },
        { name: "Lắp Đặt Dàn Rack & Phụ Kiện", start: "2026-10-26", end: "2026-10-28", status: "planned", progress: 0, color: "bg-cyan-500" },
        { name: "Media Launch & Khai Trương", start: "2026-10-29", end: "2026-11-05", status: "planned", progress: 0, color: "bg-pink-600" },
      ],
      keyEvents: [
        { date: "2026-10-25", label: "Xong mặt bằng showroom", type: "flag" },
        { date: "2026-10-28", label: "Lắp dàn rack hoàn thiện", type: "tech" },
        { date: "2026-11-01", label: "Chiến dịch ra mắt Skelcore", type: "camera" },
      ],
    },
    "PRJ-008": {
      startDate: "2026-09-15",
      endDate: "2026-12-25",
      phases: [
        { name: "Khảo Sát & Thiết Kế 2D/3D Mega Gym", start: "2026-09-15", end: "2026-10-15", status: "in_progress", progress: 20, color: "bg-purple-500" },
        { name: "Thương Thảo HĐ Ngoại Thương CĐT", start: "2026-10-16", end: "2026-10-31", status: "planned", progress: 0, color: "bg-amber-500" },
        { name: "Vận Chuyển Quốc Tế Mộc Bài", start: "2026-11-01", end: "2026-11-25", status: "planned", progress: 0, color: "bg-blue-500" },
        { name: "Bàn Giao MB Phnom Penh", start: "2026-11-26", end: "2026-12-01", status: "planned", progress: 0, color: "bg-sky-500" },
        { name: "KTV Lắp Đặt Tại Cambodia", start: "2026-12-02", end: "2026-12-15", status: "planned", progress: 0, color: "bg-cyan-500" },
      ],
      keyEvents: [
        { date: "2026-10-15", label: "Chốt duyệt phương án 3D", type: "doc" },
        { date: "2026-12-01", label: "Mặt bằng Phnom Penh sẵn sàng", type: "flag" },
        { date: "2026-12-10", label: "Đoàn KTV quốc tế sang lắp", type: "tech" },
      ],
    },
  };

  if (defaultMilestones[project.id]) {
    return defaultMilestones[project.id];
  }

  // Fallback cho các dự án pipeline khác
  const start = project.hubspotDeal?.closeDate || "2026-09-01";
  const end = project.handoverDate || "2026-11-30";
  return {
    startDate: start,
    endDate: end,
    phases: [
      { name: "Chuẩn Bị & Báo Giá", start: start, end: "2026-10-15", status: "in_progress", progress: 50, color: "bg-amber-500" },
      { name: "Nhập Hàng & MB", start: "2026-10-16", end: end, status: "planned", progress: 0, color: "bg-blue-500" },
    ],
    keyEvents: [
      { date: end, label: "Dự kiến bàn giao", type: "flag" },
    ],
  };
}

export default function ProjectGanttChart({
  projects = [],
  setProjects,
  shipments = [],
  checklists = [],
  hubspotTickets = [],
  dmsDocuments = [],
  onOpenChecklist,
  onNavigateTab,
}) {
  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [marketingOnly, setMarketingOnly] = useState(false);
  const [showBaseline, setShowBaseline] = useState(true);
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [timelineScale, setTimelineScale] = useState("october"); // "october" (theo ngày), "q4" (theo tuần), "halfyear" (theo tháng)
  const [selectedProject, setSelectedProject] = useState(null);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedProject || !setProjects) return;
    const existing = selectedProject.activityComments || [];
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

  // Mốc hôm nay
  const TODAY_STR = "2026-10-12";
  const TODAY_DATE = new Date("2026-10-12T00:00:00Z");

  // Định nghĩa trục thời gian theo các chế độ
  const timelineColumns = useMemo(() => {
    if (timelineScale === "october") {
      // 31 ngày của Tháng 10/2026
      const days = [];
      for (let i = 1; i <= 31; i++) {
        const dayStr = i < 10 ? `0${i}` : `${i}`;
        const dateStr = `2026-10-${dayStr}`;
        const dateObj = new Date(`2026-10-${dayStr}T00:00:00Z`);
        const dayOfWeek = dateObj.getDay(); // 0 = CN, 6 = T7
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isToday = dateStr === TODAY_STR;
        days.push({
          id: dateStr,
          label: `${dayStr}`,
          subLabel: dayOfWeek === 0 ? "CN" : `T${dayOfWeek + 1}`,
          isWeekend,
          isToday,
          dateStr,
        });
      }
      return {
        type: "days",
        columns: days,
        title: "Tháng 10 / 2026 (Theo Ngày)",
        startDate: "2026-10-01",
        endDate: "2026-10-31",
        totalUnits: 31,
      };
    } else if (timelineScale === "q4") {
      // Q4 2026: 13 tuần từ tuần 40 đến tuần 52
      const weeks = [
        { id: "W40", label: "Tuần 40", month: "T10", start: "2026-09-28", end: "2026-10-04", isCurrent: false },
        { id: "W41", label: "Tuần 41", month: "T10", start: "2026-10-05", end: "2026-10-11", isCurrent: false },
        { id: "W42", label: "Tuần 42", month: "T10", start: "2026-10-12", end: "2026-10-18", isCurrent: true },
        { id: "W43", label: "Tuần 43", month: "T10", start: "2026-10-19", end: "2026-10-25", isCurrent: false },
        { id: "W44", label: "Tuần 44", month: "T10/11", start: "2026-10-26", end: "2026-11-01", isCurrent: false },
        { id: "W45", label: "Tuần 45", month: "T11", start: "2026-11-02", end: "2026-11-08", isCurrent: false },
        { id: "W46", label: "Tuần 46", month: "T11", start: "2026-11-09", end: "2026-11-15", isCurrent: false },
        { id: "W47", label: "Tuần 47", month: "T11", start: "2026-11-16", end: "2026-11-22", isCurrent: false },
        { id: "W48", label: "Tuần 48", month: "T11", start: "2026-11-23", end: "2026-11-29", isCurrent: false },
        { id: "W49", label: "Tuần 49", month: "T12", start: "2026-11-30", end: "2026-12-06", isCurrent: false },
        { id: "W50", label: "Tuần 50", month: "T12", start: "2026-12-07", end: "2026-12-13", isCurrent: false },
        { id: "W51", label: "Tuần 51", month: "T12", start: "2026-12-14", end: "2026-12-20", isCurrent: false },
        { id: "W52", label: "Tuần 52", month: "T12", start: "2026-12-21", end: "2026-12-31", isCurrent: false },
      ];
      return {
        type: "weeks",
        columns: weeks,
        title: "Quý 4 / 2026 (T10 - T11 - T12)",
        startDate: "2026-09-28",
        endDate: "2026-12-31",
        totalUnits: weeks.length,
      };
    } else {
      // 6 Tháng: T8/26 đến T01/27
      const months = [
        { id: "M08", label: "Tháng 8/26", start: "2026-08-01", end: "2026-08-31", isCurrent: false },
        { id: "M09", label: "Tháng 9/26", start: "2026-09-01", end: "2026-09-30", isCurrent: false },
        { id: "M10", label: "Tháng 10/26", start: "2026-10-01", end: "2026-10-31", isCurrent: true },
        { id: "M11", label: "Tháng 11/26", start: "2026-11-01", end: "2026-11-30", isCurrent: false },
        { id: "M12", label: "Tháng 12/26", start: "2026-12-01", end: "2026-12-31", isCurrent: false },
        { id: "M01", label: "Tháng 01/27", start: "2027-01-01", end: "2027-01-31", isCurrent: false },
      ];
      return {
        type: "months",
        columns: months,
        title: "Toàn Diện 6 Tháng (08/2026 - 01/2027)",
        startDate: "2026-08-01",
        endDate: "2027-01-31",
        totalUnits: months.length,
      };
    }
  }, [timelineScale]);

  // Danh sách chủ sở hữu (Deal Owners)
  const availableOwners = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      const owner = p.dealOwner || p.leadSale;
      if (owner) set.add(owner);
    });
    return Array.from(set);
  }, [projects]);

  // Lọc danh sách dự án
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contractCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.dealOwner && p.dealOwner.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRegion = regionFilter === "all" || p.region === regionFilter;
      const matchStage = stageFilter === "all" || p.stage === stageFilter;
      const matchOwner = ownerFilter === "all" || p.dealOwner === ownerFilter || p.leadSale === ownerFilter;
      const matchMarketing = !marketingOnly || p.marketingReady;

      return matchSearch && matchRegion && matchStage && matchOwner && matchMarketing;
    });
  }, [projects, searchTerm, regionFilter, stageFilter, ownerFilter, marketingOnly]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = projects.length;
    const installing = projects.filter((p) => p.stage === "installation").length;
    const mktReady = projects.filter((p) => p.marketingReady).length;
    const sitePrep = projects.filter((p) => p.stage === "site_prep" || p.stage === "handover_ready").length;
    const maintenance = projects.filter((p) => p.stage === "maintenance").length;
    return { total, installing, mktReady, sitePrep, maintenance };
  }, [projects]);

  // Tính vị trí phần trăm trên thanh Gantt dựa vào khoảng ngày
  const calculateBarPosition = (startDateStr, endDateStr) => {
    const startWindow = new Date(`${timelineColumns.startDate}T00:00:00Z`).getTime();
    const endWindow = new Date(`${timelineColumns.endDate}T23:59:59Z`).getTime();
    const totalWindowMs = endWindow - startWindow;

    const barStart = Math.max(startWindow, new Date(`${startDateStr}T00:00:00Z`).getTime());
    const barEnd = Math.min(endWindow, new Date(`${endDateStr}T23:59:59Z`).getTime());

    if (barEnd < startWindow || barStart > endWindow) {
      return null; // Nằm ngoài phạm vi hiển thị
    }

    const leftPercent = ((barStart - startWindow) / totalWindowMs) * 100;
    const widthPercent = Math.max(2.5, ((barEnd - barStart) / totalWindowMs) * 100);

    return {
      left: `${Math.max(0, leftPercent).toFixed(2)}%`,
      width: `${Math.min(100 - leftPercent, widthPercent).toFixed(2)}%`,
    };
  };

  // Tính vị trí vạch Hôm Nay (12/10/2026)
  const todayPositionPercent = useMemo(() => {
    const startWindow = new Date(`${timelineColumns.startDate}T00:00:00Z`).getTime();
    const endWindow = new Date(`${timelineColumns.endDate}T23:59:59Z`).getTime();
    const todayTime = new Date(`${TODAY_STR}T12:00:00Z`).getTime();

    if (todayTime < startWindow || todayTime > endWindow) return null;
    return (((todayTime - startWindow) / (endWindow - startWindow)) * 100).toFixed(2);
  }, [timelineColumns]);

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & KPI SUMMARY */}
      <div className="py-3 px-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-blue-400" />
              <span>Biểu Đồ Gantt</span>
            </h1>
            <span className="text-xs text-emerald-300 font-medium flex items-center gap-1 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <Clock className="w-3 h-3 text-emerald-400" />
              12/10/2026
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-center">
              <span className="text-[11px] text-slate-300 font-medium mr-1.5">Đang Chạy:</span>
              <span className="text-sm font-black text-cyan-300">{stats.total} Dự Án</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-center">
              <span className="text-[11px] text-slate-300 font-medium mr-1.5">Đang Lắp:</span>
              <span className="text-sm font-black text-emerald-400">{stats.installing} Điểm</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-center flex items-center">
              <span className="text-[11px] text-slate-300 font-medium mr-1.5">Sẵn Sàng Media:</span>
              <span className="text-sm font-black text-pink-400 flex items-center gap-1">
                <Camera className="w-3 h-3" />
                {stats.mktReady}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-center">
              <span className="text-[11px] text-slate-300 font-medium mr-1.5">Bảo Trì:</span>
              <span className="text-sm font-black text-amber-300">{stats.maintenance} Dự Án</span>
            </div>
          </div>
        </div>

        {/* Timeline Zoom & Scale Switcher + Zoho Baseline / Critical Path Toggles */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/10 text-xs">
            <span className="text-[11px] text-slate-400 px-2 font-semibold">Tầm nhìn:</span>
            <button
              onClick={() => setTimelineScale("october")}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                timelineScale === "october"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Tháng 10 (Theo Ngày)</span>
            </button>
            <button
              onClick={() => setTimelineScale("q4")}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                timelineScale === "q4"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Quý 4/2026 (Theo Tuần)</span>
            </button>
            <button
              onClick={() => setTimelineScale("halfyear")}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                timelineScale === "halfyear"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Toàn Diện 6 Tháng</span>
            </button>
          </div>

          {/* Zoho Baseline & Critical Path + Marketing Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBaseline(!showBaseline)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                showBaseline
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                  : "bg-white/10 hover:bg-white/15 text-amber-300 border-white/10"
              }`}
              title="So sánh Đường cơ sở (Kế hoạch ban đầu vs Tiến độ thực tế)"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Đường Cơ Sở (Baseline)</span>
            </button>

            <button
              onClick={() => setShowCriticalPath(!showCriticalPath)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                showCriticalPath
                  ? "bg-rose-600 text-white border-rose-500 shadow-sm"
                  : "bg-white/10 hover:bg-white/15 text-rose-300 border-white/10"
              }`}
              title="Đánh dấu các dự án nằm trên Đường găng (Critical Path)"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Đường Găng (Critical Path)</span>
            </button>

            <button
              onClick={() => setMarketingOnly(!marketingOnly)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                marketingOnly
                  ? "bg-pink-600 text-white border-pink-500 shadow-md"
                  : "bg-white/10 hover:bg-white/15 text-pink-300 border-white/10"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Marketing ({stats.mktReady})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <div className="py-2.5 px-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên dự án (Cà Na, Chateau Villa, Fulton...), khách hàng, mã HĐ hoặc Sale phụ trách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Lọc Khu vực */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Khu vực</option>
            <option value="HCM">Miền Nam (HCM / Tây Ninh / BD)</option>
            <option value="HN">Miền Bắc (Hà Nội / Hải Phòng)</option>
          </select>

          {/* Lọc Giai đoạn */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Giai đoạn</option>
            <option value="installation">🔧 Đang lắp đặt máy</option>
            <option value="handover_ready">📸 Bàn giao mặt bằng (Marketing)</option>
            <option value="site_prep">🏗️ Chuẩn bị mặt bằng</option>
            <option value="design">🎨 Thiết kế 2D/3D</option>
            <option value="maintenance">🛠️ Hợp đồng bảo trì</option>
          </select>

          {/* Lọc Theo Deal Owner */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả Sale Leads</option>
            {availableOwners.map((owner) => (
              <option key={owner} value={owner}>
                🎯 {owner}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. GANTT CHART BOARD CONTAINER */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Top Legend Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> Chú Giải Tiến Độ:
            </span>
            <span className="inline-flex items-center gap-1 text-slate-700">
              <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block"></span> 1. Thiết Kế
            </span>
            <span className="inline-flex items-center gap-1 text-slate-700">
              <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span> 2. Tàu Hàng Về Kho
            </span>
            <span className="inline-flex items-center gap-1 text-slate-700">
              <span className="w-2.5 h-2.5 rounded bg-pink-500 inline-block"></span> 3. Bàn Giao MB (Media)
            </span>
            <span className="inline-flex items-center gap-1 text-slate-700">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500 inline-block"></span> 4. Lắp Đặt Hiện Trường
            </span>
            <span className="inline-flex items-center gap-1 text-slate-700">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> 5. Nghiệm Thu
            </span>
            <span className="inline-flex items-center gap-1 text-slate-700">
              <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block"></span> 6. Bảo Trì Định Kỳ
            </span>
          </div>

          <div className="flex items-center gap-3">
            {showBaseline && (
              <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                <span className="w-4 h-1.5 rounded bg-amber-300 border border-dashed border-amber-600 inline-block"></span>
                Thanh nét đứt: Baseline kế hoạch gốc
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Vạch Đỏ: Hôm nay (12/10)
            </span>
          </div>
        </div>

        {/* The Gantt Board: Left Frozen Project Column + Right Scrollable Timeline Canvas */}
        <div className="overflow-x-auto relative">
          <div className="min-w-[1100px]">
            {/* TIMELINE HEADER ROW */}
            <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-bold text-slate-700 sticky top-0 z-20">
              {/* Left Column Header */}
              <div className="w-[320px] shrink-0 p-3.5 border-r border-slate-200 bg-slate-100 flex items-center justify-between">
                <span className="uppercase text-[11px] text-slate-600">Dự Án / Chủ Sở Hữu</span>
                <span className="text-[10px] text-slate-400 font-normal">{filteredProjects.length} Hồ Sơ</span>
              </div>

              {/* Right Timeline Header Columns */}
              <div className="flex-1 flex relative">
                {timelineColumns.columns.map((col, idx) => (
                  <div
                    key={col.id}
                    className={`flex-1 text-center py-2 px-1 border-r border-slate-200/80 last:border-r-0 transition ${
                      col.isToday
                        ? "bg-rose-50 font-black text-rose-700 ring-2 ring-rose-400 z-10"
                        : col.isWeekend
                        ? "bg-slate-200/50 text-slate-500 font-normal"
                        : "text-slate-700"
                    }`}
                  >
                    <div className="text-[11px] leading-tight">{col.label}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{col.subLabel || col.month || ""}</div>
                  </div>
                ))}

                {/* Vertical "Today" Marker Line across Header */}
                {todayPositionPercent && (
                  <div
                    className="absolute top-0 bottom-0 pointer-events-none z-30"
                    style={{ left: `${todayPositionPercent}%` }}
                  >
                    <div className="w-0.5 h-full bg-rose-500"></div>
                  </div>
                )}
              </div>
            </div>

            {/* PROJECT ROWS LIST */}
            <div className="divide-y divide-slate-200 relative">
              {/* Vertical "Today" Marker Line across All Rows */}
              {todayPositionPercent && (
                <div
                  className="absolute top-0 bottom-0 pointer-events-none z-10"
                  style={{ left: `calc(320px + (100% - 320px) * ${todayPositionPercent} / 100)` }}
                >
                  <div className="w-0.5 h-full border-r-2 border-dashed border-rose-500/80 shadow-sm relative">
                    <span className="absolute -top-1 -left-8 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black shadow-xs tracking-wider">
                      HÔM NAY
                    </span>
                  </div>
                </div>
              )}

              {filteredProjects.map((project) => {
                const stageCfg = STAGE_CONFIG[project.stage] || STAGE_CONFIG.pre_tender;
                const ganttData = getProjectGanttMilestones(project);
                const overallPos = calculateBarPosition(ganttData.startDate, ganttData.endDate);
                const isCritical = project.stage === "installation" || project.stage === "handover_ready" || project.isVip;
                const isMarketingContact =
                  project.contactOwner?.includes("Marketing") ||
                  project.hubspotContact?.source?.includes("Marketing") ||
                  project.hubspotContact?.channel?.includes("Facebook") ||
                  project.hubspotContact?.channel?.includes("Website") ||
                  project.hubspotContact?.channel?.includes("Hotline");

                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`flex hover:bg-blue-50/40 transition cursor-pointer group relative ${
                      showCriticalPath && isCritical ? "bg-rose-50/30" : ""
                    }`}
                  >
                    {/* Left Sticky Column: Project Info */}
                    <div className="w-[320px] shrink-0 p-3.5 border-r border-slate-200 bg-white group-hover:bg-blue-50/40 transition flex flex-col justify-between">
                      <div>
                        {/* Title and Badges */}
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="font-bold text-slate-900 text-xs block group-hover:text-blue-600 transition line-clamp-1">
                            {project.name}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {showCriticalPath && isCritical && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-600 text-white">
                                CRITICAL
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                              {project.region}
                            </span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {project.customer}
                        </div>

                        {/* Tripartite Ownership Badges */}
                        <div className="flex flex-col gap-0.5 mt-1.5 text-[10px]">
                          <div className="flex items-center gap-1 text-slate-700">
                            <Target className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span>Deal: <strong className="text-slate-900">{project.leadSale || project.dealOwner}</strong></span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-600">
                            <UserCheck className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                            <span>Contact: <strong className="text-slate-800">{project.contactOwner}</strong></span>
                            {isMarketingContact ? (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-purple-100 text-purple-700 font-bold border border-purple-200">Mkt</span>
                            ) : (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">Sale</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 truncate">
                            <Truck className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                            <span className="truncate">KTV: <strong className="text-slate-700 truncate">{project.assignedTech}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Stage & Progress info */}
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${stageCfg.bgLight}`}>
                          {stageCfg.label}
                        </span>
                        <span className="font-mono font-bold text-slate-700">
                          {project.stage === "installation" ? `${project.checklistProgress || 85}% BOM` : project.handoverDate ? `BG: ${project.handoverDate.split("-").slice(1).join("/")}` : "Theo dõi"}
                        </span>
                      </div>
                    </div>

                    {/* Right Timeline Canvas: Gantt Bar Area */}
                    <div className="flex-1 p-3 flex items-center relative overflow-hidden bg-slate-50/30">
                      {/* Grid background lines matching header columns */}
                      <div className="absolute inset-0 flex pointer-events-none opacity-40">
                        {timelineColumns.columns.map((col) => (
                          <div
                            key={col.id}
                            className={`flex-1 border-r border-slate-200 ${col.isWeekend ? "bg-slate-200/20" : ""}`}
                          ></div>
                        ))}
                      </div>

                      {/* Gantt Bar & Sub-Phases */}
                      {overallPos ? (
                        <div
                          className="relative flex flex-col gap-1 z-0"
                          style={{ left: overallPos.left, width: overallPos.width }}
                        >
                          <div
                            className={`h-9 rounded-xl relative shadow-xs border overflow-hidden flex items-center bg-white ${
                              showCriticalPath && isCritical
                                ? "border-rose-500 ring-2 ring-rose-300"
                                : "border-slate-300/80"
                            }`}
                            title={`${project.name}: ${ganttData.startDate} ➔ ${ganttData.endDate}`}
                          >
                            {/* Sub-phases rendered as contiguous blocks */}
                            {ganttData.phases.map((phase, pIdx) => {
                              const phasePos = calculateBarPosition(phase.start, phase.end);
                              if (!phasePos) return null;
                              return (
                                <div
                                  key={pIdx}
                                  className={`h-full flex items-center justify-center px-1 text-[9px] font-bold text-white transition hover:brightness-110 relative group/phase border-r border-white/20 last:border-r-0 ${phase.color}`}
                                  style={{
                                    width: `${(100 / ganttData.phases.length).toFixed(1)}%`,
                                  }}
                                  title={`${phase.name} (${phase.start} ➔ ${phase.end}) - Hoàn thành ${phase.progress}%`}
                                >
                                  <span className="truncate drop-shadow-xs">{phase.name}</span>
                                  {phase.progress > 0 && phase.progress < 100 && (
                                    <span className="ml-1 text-[8px] bg-black/20 px-1 rounded">
                                      {phase.progress}%
                                    </span>
                                  )}
                                </div>
                              );
                            })}

                            {/* Key Event Badges over the bar */}
                            {project.marketingReady && (
                              <span
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-pink-600 text-white shadow-md animate-pulse"
                                title="Mặt bằng sẵn sàng Marketing quay chụp flycam!"
                              >
                                <Camera className="w-3 h-3" />
                              </span>
                            )}

                            {project.stage === "installation" && (
                              <span
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-cyan-700 text-white shadow-xs"
                                title={`Đang lắp đặt máy: ${project.checklistProgress || 85}%`}
                              >
                                <ClipboardCheck className="w-3 h-3" />
                              </span>
                            )}
                          </div>

                          {/* Zoho-inspired Baseline Ghost Bar (Kế hoạch gốc vs Thực tế) */}
                          {showBaseline && (
                            <div
                              className="h-2 rounded-full bg-amber-200/80 border border-dashed border-amber-500 flex items-center justify-end pr-1.5"
                              title={`Baseline kế hoạch gốc: ${ganttData.startDate} ➔ ${ganttData.endDate} (Đúng tiến độ SLA)`}
                            >
                              <span className="text-[8px] font-bold text-amber-900 leading-none">
                                Baseline SLA: Đúng hạn
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic px-4">
                          Lịch trình nằm ngoài phạm vi hiển thị hiện tại
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. DETAIL DRAWER / MODAL FOR SELECTED PROJECT */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  TIẾN ĐỘ GANTT CHI TIẾT
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{selectedProject.name}</h3>
                <p className="text-xs text-slate-500">{selectedProject.address}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tripartite Ownership Header */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-orange-50/70 border border-slate-200">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" /> Nhân sự phụ trách dự án:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
                    <Target className="w-3 h-3" /> 1. Deal Owner
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedProject.dealOwner || selectedProject.leadSale}</div>
                  <div className="text-[10px] text-slate-500">Sales Lead phụ trách deal</div>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-blue-700 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> 2. Contact Owner
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedProject.contactOwner}</div>
                  <div className="text-[10px] text-slate-500">
                    {selectedProject.contactOwner?.includes("Marketing") ? "Nguồn Marketing Lead" : "Sale Tự Tạo"}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-amber-700 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> 3. Vé Giao & KTV
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedProject.assignedTech}</div>
                  <div className="text-[10px] text-slate-500">
                    {selectedProject.deliveryTicket ? `Vé #${selectedProject.deliveryTicket.ticketId}` : "Đội kỹ thuật"}
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones Timeline Steps in Detail */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" /> Các Chặng Tiến Độ Thực Tế (Phases):
                </span>
                <span className="text-[11px] text-slate-500">
                  {selectedProject.handoverDate ? `Hạn bàn giao: ${selectedProject.handoverDate}` : ""}
                </span>
              </div>

              <div className="space-y-2">
                {getProjectGanttMilestones(selectedProject).phases.map((ph, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${ph.color}`}></span>
                      <span className="font-bold text-slate-800">{ph.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px] font-mono">
                        {ph.start} ➔ {ph.end}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ph.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : ph.status === "in_progress"
                            ? "bg-blue-100 text-blue-800 animate-pulse"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ph.status === "completed" ? "Đã xong" : ph.status === "in_progress" ? `${ph.progress}% Đang chạy` : "Kế hoạch"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contextual Activity Feed & @Mentions inside Gantt Modal */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" /> Nhật Ký Phối Hợp & Tag Nhanh (@Mentions)
                </span>
                <span className="text-[10px] text-slate-400">
                  {(selectedProject.activityComments || []).length} ghi chú
                </span>
              </div>
              {(selectedProject.activityComments || []).length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {(selectedProject.activityComments || []).map((c) => (
                    <div key={c.id} className="p-2 rounded-lg bg-white border border-slate-200 text-xs">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <strong className="text-slate-800">{c.author}</strong>
                        <span>{c.time}</span>
                      </div>
                      <p className="text-slate-700 mt-0.5">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1.5 flex-wrap">
                {["@Hoài Trịnh", "@Trần Hữu Thắng", "@Marketing", "@Kho ĐA/BD"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCommentText((prev) => `${prev ? prev + " " : ""}${tag} `)}
                    className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 font-semibold"
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
                  placeholder="Ghi chú tiến độ Gantt hoặc @tag nhân sự..."
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> Gửi
                </button>
              </form>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {selectedProject.stage === "installation" && (
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      if (onOpenChecklist) onOpenChecklist(selectedProject.id);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Mở Checklist Đúng/Đủ BOM</span>
                  </button>
                )}

                {selectedProject.hubspotDeal?.hubspotUrl && (
                  <a
                    href={selectedProject.hubspotDeal.hubspotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Link2 className="w-4 h-4" />
                    <span>Xem Deal HubSpot</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
