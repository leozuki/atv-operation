import React, { useState } from "react";
import { formatVND, getTodayFormatted } from "../utils/formatters";
import {
  Presentation,
  CheckCircle2,
  Calendar,
  Layers,
  Wrench,
  Ship,
  DollarSign,
  Palette,
  FileText,
  AlertTriangle,
  Camera,
  Globe2,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { HUBSPOT_DASHBOARD_URLS } from "../utils/hubspotService";

export default function ExecutiveWBR({
  projects,
  setProjects,
  shipments,
  tenders,
  schedule,
  designTasks,
  collections,
  checklists = [],
  users = [],
  currentUser,
  onNavigateTab,
  showToast,
}) {
  const [activeSlideTab, setActiveSlideTab] = useState("all");

  const totalTenderValue = tenders.reduce(
    (acc, curr) => acc + (Number(curr.valueBeforeVat) || 0),
    0
  );
  const totalCollections = collections.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );
  const totalUSD = (totalCollections / 26000).toFixed(2);

  // Design summary
  const total2D = designTasks.reduce((sum, item) => sum + (item.type2DCount || 0), 0);
  const total3D = designTasks.reduce((sum, item) => sum + (item.type3DCount || 0), 0);

  // Tech tasks summary
  const hcmTasks = schedule.HCM?.flatMap((d) => d.tasks) || [];
  const hnTasks = schedule.HN?.flatMap((d) => d.tasks) || [];
  const completedTechTasks = [...hcmTasks, ...hnTasks].filter((t) => t.status === "completed");
  const inProgressTechTasks = [...hcmTasks, ...hnTasks].filter((t) => t.status !== "completed");

  const handleConfirmWeeklySync = () => {
    if (setProjects && projects) {
      setProjects((prevProjects) =>
        prevProjects.map((p) => {
          const isFinished = p.stage === "accepted" || p.stage === "maintenance";
          const newProgress = isFinished ? 100 : Math.min(95, (p.progress || 70) + 5);
          const todayStr = getTodayFormatted();
          return {
            ...p,
            progress: newProgress,
            lastWbrSync: todayStr,
            wbrNote: `Đã rà soát & chốt biên bản giao ban (${todayStr}) (Tiến độ được ghi nhận)`,
          };
        })
      );
    }
    if (showToast) {
      const todayStr = getTodayFormatted();
      showToast(`✓ Đã chốt giao ban (${todayStr}) và ghi nhận tiến độ cập nhật vào Tiến Độ Tổng Thể!`);
    }
  };

  const todayStr = getTodayFormatted();

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-4 px-5 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Presentation className="w-5 h-5 text-blue-400" />
              <span>Giao Ban Tuần (WBR)</span>
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {todayStr}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {(!currentUser?.roleId || ["admin", "ops_manager"].includes(currentUser.roleId)) && (
              <button
                onClick={handleConfirmWeeklySync}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                title="Chốt biên bản giao ban tuần và ghi nhận tăng % tiến độ vào Tiến Độ Tổng Thể"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Chốt Giao Ban & Ghi Nhận Tiến Độ</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab("matrix")}
              className="px-3.5 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Xem Tiến Độ Tổng Thể</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 5 Department Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Finance Collection */}
        <div
          onClick={() => onNavigateTab("finance")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            <span>08. Tài Chính Thu Tiền</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-emerald-600 mt-2">
            {formatVND(totalCollections)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <strong>${Number(totalUSD).toLocaleString()} USD</strong> · {collections.length} khách hàng
          </div>
        </div>

        {/* Metric 2: Tender Pipeline */}
        <div
          onClick={() => onNavigateTab("tender")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            <span>05. Báo Giá & Hợp Đồng</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-blue-600 mt-2">
            {formatVND(totalTenderValue)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {tenders.length} gói thầu ({tenders.filter(t => t.type === 'Contract').length} HĐ chính thức)
          </div>
        </div>

        {/* Metric 3: Creative 2D/3D */}
        <div
          onClick={() => onNavigateTab("design_sales")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            <span>03. Creative 2D & 3D</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Palette className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-purple-600 mt-2">
            {total2D} Mặt Bằng 2D · {total3D} Render 3D
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {designTasks.length} dự án (VN, Cam, Sing, Malay)
          </div>
        </div>

        {/* Metric 4: Logistics */}
        <div
          onClick={() => onNavigateTab("logistics")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-300 hover:shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            <span>06. Hậu Cần & Nhập Kho</span>
            <span className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg">
              <Ship className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-cyan-700 mt-2">
            {shipments.length} Lô PO Quốc Tế
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Kho DA: {shipments.filter(s => s.warehouse === 'DA').length} PO · Kho BD: {shipments.filter(s => s.warehouse === 'BD').length} PO
          </div>
        </div>

        {/* Metric 5: Technical Field Ops */}
        <div
          onClick={() => onNavigateTab("schedule")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            <span>04. Kỹ Thuật 2 Miền</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-amber-600 mt-2">
            {hcmTasks.length + hnTasks.length} Nhiệm Vụ Tuần
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Plan HCM: {hcmTasks.length} việc · Plan HN: {hnTasks.length} việc
          </div>
        </div>
      </div>

      {/* Operational Direction Spotlight */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 py-2.5 px-4 rounded-xl border border-blue-200/70 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-800">
          <Zap className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-bold">Định Hướng Vận Hành:</span>
          <span className="text-slate-600 hidden sm:inline">Quy tụ dữ liệu liên phòng ban trên hệ thống tập trung, hạn chế phân tán file và tối ưu thời gian xử lý.</span>
        </div>
        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-semibold rounded-md shrink-0 text-[11px]">
          Mục tiêu vận hành
        </span>
      </div>

      {/* HubSpot Live Cross-Department BI Hub (Direct Links to 5 Dashboards) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                HubSpot BI & Báo Cáo 5 Phòng Ban (Portal 19642405)
              </h3>
              <p className="text-[11px] text-slate-500">
                Đối soát chéo dữ liệu vận hành nội bộ Attivo với 5 hệ thống báo cáo chính thức trên HubSpot CRM
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab("hubspot")}
            className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs flex items-center gap-1 border border-orange-200 transition active:scale-95 shrink-0"
          >
            <span>Mở Trung Tâm HubSpot CRM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Department Live Link Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          {Object.entries(HUBSPOT_DASHBOARD_URLS).map(([key, db]) => (
            <div
              key={key}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-orange-300 transition-all flex flex-col justify-between space-y-2 text-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${db.color}`}>
                    {db.badge}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">#{db.id}</span>
                </div>
                <h5 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                  {db.name}
                </h5>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{db.desc}</p>
              </div>

              <a
                href={db.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-1 px-2 rounded-lg bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-orange-700 font-bold text-[10px] flex items-center justify-center gap-1 transition active:scale-95"
              >
                <span>Mở Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Comparative Review: Last Week Accomplishments vs This Week Plan & Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Column 1: Đã hoàn thành tuần trước */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1. Báo Cáo Đã Hoàn Thành Tuần Trước (Reported)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              ✓ Đạt Chuẩn Nghiệm Thu
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <span className="font-bold text-emerald-950 block">Kỹ thuật & Hiện trường ({completedTechTasks.length} ca hoàn tất):</span>
              <p className="text-[11px] text-emerald-900 mt-0.5">
                Hoàn thành lắp đặt 6 máy Reformer Cà Na Tây Ninh, bảo dưỡng Pacific Palace, cân chỉnh máy chạy Nam Ô.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200">
              <span className="font-bold text-blue-950 block">Kho vận & Hậu cần (Lô hàng đã cập bến):</span>
              <p className="text-[11px] text-blue-900 mt-0.5">
                PO ME-AT2602 (Merrithew 1x20GP) nhập kho Bình Dương 15/10, PO ULS-AT2609-30 về kho Đông Anh.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200">
              <span className="font-bold text-purple-950 block">Thiết kế & Báo giá:</span>
              <p className="text-[11px] text-purple-900 mt-0.5">
                Duyệt layout 2D Go Gym Cambodia, chốt phối cảnh 3D Skelcore Flagship, ký kết 4 HĐ dự án.
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: Kế hoạch & Điểm nghẽn tuần này */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> 2. Kế Hoạch Trọng Tâm & Điểm Nghẽn Tuần Này
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
              Đang Điều Phối
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200">
              <span className="font-bold text-amber-950 block">Điểm nghẽn thiếu hàng / Cần bồi hoàn:</span>
              <p className="text-[11px] text-amber-900 mt-0.5">
                Cà Na thiếu 2 lò xo Merrithew (chờ Air hãng) + 4 gối đệm kho BD bốc bù xe tải trong ngày.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-50/60 border border-cyan-200">
              <span className="font-bold text-cyan-950 block">Hiện trường lắp máy & Bàn giao:</span>
              <p className="text-[11px] text-cyan-900 mt-0.5">
                Đợt thi công ISH KOMPAN Xuân Thủy (Ngày 6, 7, 8) và chuẩn bị nghiệm thu Fulton Hải Phòng.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-pink-50/60 border border-pink-200">
              <span className="font-bold text-pink-950 block">Media & Marketing:</span>
              <p className="text-[11px] text-pink-900 mt-0.5">
                Bàn giao mặt bằng Cà Na Tây Ninh ngày 19/10 cho Marketing chụp ảnh review máy Merrithew.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Slide Breakdown Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs corresponding to Slide Agenda */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveSlideTab("all")}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeSlideTab === "all"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                : "hover:text-slate-900"
            }`}
          >
            Tất Cả 8 Phân Hệ
          </button>
          <button
            onClick={() => setActiveSlideTab("creative")}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeSlideTab === "creative"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                : "hover:text-slate-900"
            }`}
          >
            03. Creative & Designer (12 Dự Án)
          </button>
          <button
            onClick={() => setActiveSlideTab("technical")}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeSlideTab === "technical"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                : "hover:text-slate-900"
            }`}
          >
            04. Kỹ Thuật (Plan HCM & HN)
          </button>
          <button
            onClick={() => setActiveSlideTab("tender")}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeSlideTab === "tender"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                : "hover:text-slate-900"
            }`}
          >
            05. Tender & Báo Giá (14.53 Tỷ)
          </button>
          <button
            onClick={() => setActiveSlideTab("logistics")}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeSlideTab === "logistics"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                : "hover:text-slate-900"
            }`}
          >
            06. Logistics & Nhập Kho (10 PO)
          </button>
          <button
            onClick={() => setActiveSlideTab("finance")}
            className={`px-3 py-2 rounded-xl transition-all ${
              activeSlideTab === "finance"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                : "hover:text-slate-900"
            }`}
          >
            08. Tài Chính Thu Tiền (1.078 Tỷ)
          </button>
        </div>

        {/* Tab 1: Creative & Designer Details */}
        {(activeSlideTab === "all" || activeSlideTab === "creative") && (
          <div className="p-6 border-b border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  03 & 07. Sáng Tạo & Thiết Kế (Creative Weekly Review)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng hợp 12 dự án tuần 3-4 tháng 9 trên 5 thị trường: HCM (8 layout 2D), HN (5 layout 2D), Campuchia (1 layout 2D), Singapore (1 render 3D) và Malaysia (2 render 3D).
                </p>
              </div>
              <button
                onClick={() => onNavigateTab("design_sales")}
                className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 self-start sm:self-auto"
              >
                Mở Phân Hệ Thiết Kế <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {designTasks.map((t, idx) => (
                <div
                  key={t.id || idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-200 transition-all text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 line-clamp-1">{t.projectName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        t.statusType === "New"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {t.statusType || "New"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500">
                    <div>
                      Khu vực: <strong className="text-slate-800">{t.region}</strong>
                    </div>
                    <div>
                      Sales: <strong className="text-slate-800">{t.leadSale}</strong>
                    </div>
                    <div>
                      2D Layouts:{" "}
                      <strong className="text-purple-700">{t.type2DCount || 0} bản</strong>
                    </div>
                    <div>
                      3D Renders:{" "}
                      <strong className="text-indigo-700">{t.type3DCount || 0} bản</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2">{t.taskDetail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Technical Weekly Schedule */}
        {(activeSlideTab === "all" || activeSlideTab === "technical") && (
          <div className="p-6 border-b border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-600" />
                  04. Lịch Trình Kỹ Thuật Hiện Trường (Technical Weekly Review)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kế hoạch tuần điều phối kỹ thuật viên tại 2 miền (Plan HCM: 8 nhiệm vụ, Plan HN: 7 nhiệm vụ).
                </p>
              </div>
              <button
                onClick={() => onNavigateTab("schedule")}
                className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1 self-start sm:self-auto"
              >
                Mở Lịch Kỹ Thuật Đầy Đủ <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Plan HCM */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Plan HCM (Miền Nam) - 8 Nhiệm Vụ
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Thứ 2 - Thứ 6
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {schedule.HCM?.map((day, dIdx) => (
                    <div key={dIdx} className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div className="font-semibold text-slate-800 mb-1 flex items-center justify-between text-[11px]">
                        <span>{day.day}</span>
                        <span className="text-slate-400 font-mono">{day.date}</span>
                      </div>
                      <div className="space-y-1">
                        {day.tasks.map((task, tIdx) => (
                          <div key={tIdx} className="text-slate-600 pl-2 border-l-2 border-slate-300">
                            <span className="font-medium text-slate-800">{task.site}:</span>{" "}
                            {task.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan HN */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Plan HN (Miền Bắc) - 7 Nhiệm Vụ
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    Thứ 2 - Thứ 6
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {schedule.HN?.map((day, dIdx) => (
                    <div key={dIdx} className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                      <div className="font-semibold text-slate-800 mb-1 flex items-center justify-between text-[11px]">
                        <span>{day.day}</span>
                        <span className="text-slate-400 font-mono">{day.date}</span>
                      </div>
                      <div className="space-y-1">
                        {day.tasks.map((task, tIdx) => (
                          <div key={tIdx} className="text-slate-600 pl-2 border-l-2 border-slate-300">
                            <span className="font-medium text-slate-800">{task.site}:</span>{" "}
                            {task.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Tender & Báo Giá */}
        {(activeSlideTab === "all" || activeSlideTab === "tender") && (
          <div className="p-6 border-b border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  05. Đấu Thầu & Hợp Đồng (Tender Weekly Review - Week 4 Sep)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng 21 gói thầu / báo giá với giá trị trước VAT đạt <strong>14.53 Tỷ VNĐ</strong>.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab("tender")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
              >
                Mở Phân Hệ Tender <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[11px] font-bold uppercase text-emerald-800">
                  Hợp Đồng Ký Mới (3 Deals)
                </span>
                <div className="text-lg font-extrabold text-emerald-700 mt-1">
                  3.85 Tỷ VNĐ
                </div>
                <div className="text-emerald-600 text-[11px] mt-0.5">
                  Lapis SG, Lê Mỹ Huyền (SPX max), 2F Nguyễn Thành Ý
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-[11px] font-bold uppercase text-blue-800">
                  Báo Giá Mới (8 Deals)
                </span>
                <div className="text-lg font-extrabold text-blue-700 mt-1">
                  10.67 Tỷ VNĐ
                </div>
                <div className="text-blue-600 text-[11px] mt-0.5">
                  Go Gym Cambodia (9.08 tỷ), M Gallery Hotel (902 tr)...
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-[11px] font-bold uppercase text-amber-800">
                  Báo Giá Revise & Khác (10 Deals)
                </span>
                <div className="text-lg font-extrabold text-amber-700 mt-1">
                  10.88 Tỷ VNĐ
                </div>
                <div className="text-amber-600 text-[11px] mt-0.5">
                  Winx (3.78 tỷ), Anh Thành ĐH (7.10 tỷ) & 8 hồ sơ BOQ
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Logistics & Nhập Kho */}
        {(activeSlideTab === "all" || activeSlideTab === "logistics") && (
          <div className="p-6 border-b border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Ship className="w-5 h-5 text-cyan-600" />
                  06. Hậu Cần & Nhập Kho Quốc Tế (Logistic Weekly Review)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  10 lô PO nhập khẩu thiết bị, phân bổ 4 PO về Kho Đông Anh (DA) và 6 PO về Kho Bình Dương (BD).
                </p>
              </div>
              <button
                onClick={() => onNavigateTab("logistics")}
                className="text-xs font-semibold text-cyan-600 hover:text-cyan-800 flex items-center gap-1 self-start sm:self-auto"
              >
                Mở Quản Trị Logistics <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-red-700 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  Điểm Nóng 1: Hãng Giao Thiếu (Vendor Shortage)
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>PO ULS-AT2627-28-30 (Ziva):</strong> Hãng báo thiếu 4 bộ giá để tạ Urethane. Đã chốt phương án gửi Air bù về kho Bình Dương kịp ngày bàn giao dự án Tru by Hilton!
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-blue-800 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  Điểm Nóng 2: Lô Đặt Hàng Mới 06/10 (Precor, Assault, Concept2, Ziva, Eleiko)
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>PO ULS-AT2634:</strong> Đã hoàn tất lên 5 đơn đặt hàng mới ngày 06/10 cho SAPA TB Thể Thao và BĐS Phan Anh về kho Đông Anh.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Tài Chính Dòng Tiền (Slide 08/15) */}
        {(activeSlideTab === "all" || activeSlideTab === "finance") && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  08. Thu Hồi Công Nợ & Tiền Về (Collection from 05 Oct to 10 Oct, 2026)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng thu thực tế nổi tài khoản: <strong>{formatVND(totalCollections)}</strong> (tương đương <strong>${Number(totalUSD).toLocaleString()} USD</strong>) từ {collections.length} đối tác khách hàng.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab("finance")}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto"
              >
                Mở Chi Tiết Thu Tiền <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <th className="py-2.5 px-3">Khách Hàng (Customer)</th>
                    <th className="py-2.5 px-3 text-right">Số Tiền (VNĐ)</th>
                    <th className="py-2.5 px-3">Ngày Tiền Về</th>
                    <th className="py-2.5 px-3">Tài Khoản / Phương Thức</th>
                    <th className="py-2.5 px-3">Hạng Mục Thanh Toán</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {collections.map((col, cIdx) => (
                    <tr key={col.id || cIdx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{col.customer}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-600">
                        {formatVND(col.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{col.date}</td>
                      <td className="py-2.5 px-3 text-slate-600">{col.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-slate-700">{col.dealType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
