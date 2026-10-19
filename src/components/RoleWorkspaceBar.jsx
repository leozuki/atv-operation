import React, { useState } from "react";
import {
  Briefcase,
  Wrench,
  DollarSign,
  Crown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";

export default function RoleWorkspaceBar({
  activeTab,
  onNavigateTab,
  projects = [],
  checklists = [],
  tenders = [],
  collections = [],
  shipments = [],
  onOpenLogTime,
  onOpenChecklist,
}) {
  const [selectedRole, setSelectedRole] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("atv_active_role_perspective") || "tech";
    }
    return "tech";
  });
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("atv_active_role_perspective", role);
    }
  };

  const roleMeta = {
    boss: {
      id: "boss",
      title: "Sếp (Ban Giám Đốc)",
      badge: "CEO & Ban Lãnh Đạo",
      avatar: "👔",
      color: "from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/30 text-white",
      tabColor: "bg-slate-900 text-white border-slate-900 shadow-sm",
      inactiveColor: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
      headline: "Bức tranh điều hành toàn cảnh & Điểm nghẽn cần chỉ đạo",
      kpis: [
        { label: "Doanh thu dự kiến", val: "4.88 Tỷ", color: "text-emerald-400" },
        { label: "Đã thu tiền mặt", val: "2.76 Tỷ (56.6%)", color: "text-cyan-400" },
        { label: "Điểm nghẽn cần gỡ", val: "3 Vấn đề", color: "text-amber-400" },
        { label: "Tiến độ 8 dự án", val: "3 Đang Lắp Ráp", color: "text-white" },
      ],
      mustDos: [
        {
          priority: "urgent",
          tag: "Thông Quan Cảng",
          desc: "Cont ULS-AT2609 cập cảng Hải Phòng cần chỉ đạo nộp thuế và chuyển về kho Đông Anh phục vụ Clubhouse Fulton.",
        },
        {
          priority: "important",
          tag: "Chỉ Đạo Bàn Giao",
          desc: "Hôm nay 19/10 bàn giao Cà Na Pilates Tây Ninh và ngày mai 20/10 bàn giao Chateau Villa Phú Mỹ Hưng.",
        },
        {
          priority: "decision",
          tag: "Phê Duyệt PO & Báo Giá",
          desc: "Rà soát phê duyệt gói báo giá Park City CH03 1.5 tỷ và duyệt tiến độ đặt cọc PO cont Skelcore kho Bình Dương.",
        },
      ],
      quickActions: [
        { label: "Giao Ban Tuần (WBR)", tab: "wbr", icon: Sparkles },
        { label: "Tiến Độ Tổng Thể (Matrix)", tab: "matrix", icon: Layers },
        { label: "Biểu Đồ Gantt Dự Án", tab: "gantt", icon: Calendar },
        { label: "Tài Chính & Thu Tiền", tab: "finance", icon: DollarSign },
      ],
    },
    sale: {
      id: "sale",
      title: "Sale (Kinh Doanh Dự Án)",
      badge: "Chuyên Viên Kinh Doanh",
      avatar: "💼",
      color: "from-cyan-950 via-slate-900 to-cyan-950 border-cyan-500/30 text-white",
      tabColor: "bg-cyan-800 text-white border-cyan-800 shadow-sm",
      inactiveColor: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
      headline: "Báo giá, Thiết kế 2D/3D của Lý & Chăm sóc khách hàng hôm nay",
      kpis: [
        { label: "Deal đang mở", val: "6 Báo Giá", color: "text-cyan-400" },
        { label: "Task 2D/3D (Lý)", val: "15 Bản Vẽ", color: "text-indigo-400" },
        { label: "Khách bàn giao", val: "Cà Na & Chateau", color: "text-emerald-400" },
        { label: "Tổng giá trị Pipeline", val: "3.75 Tỷ", color: "text-amber-400" },
      ],
      mustDos: [
        {
          priority: "urgent",
          tag: "Bàn Giao Hôm Nay",
          desc: "Liên hệ Mr. Vũ (Cà Na Tây Ninh) hỗ trợ ký BBGH/NT ngày 19/10 và báo Mr. Vinh (Chateau Villa) đón KTV ngày mai 20/10.",
        },
        {
          priority: "important",
          tag: "Rà Soát Bản Vẽ 2D/3D",
          desc: "Làm việc với Designer Lý kiểm tra 15 bản vẽ layout máy (Park City, KTG Waiki Đà Lạt, Go Gym) gửi khách duyệt.",
        },
        {
          priority: "normal",
          tag: "Đốc Thúc Cọc",
          desc: "Theo dõi khoản cọc đợt 2 của Grab HQ Gym và ký hợp đồng nguyên tắc xuất khẩu Go Gym Campuchia.",
        },
      ],
      quickActions: [
        { label: "Báo Giá & Hợp Đồng", tab: "tender", icon: FileText },
        { label: "Thiết Kế 2D/3D (Lý)", tab: "design", icon: Layers },
        { label: "HubSpot CRM 360°", tab: "hubspot", icon: Users },
        { label: "Danh Sách Dự Án", tab: "projects", icon: Briefcase },
      ],
    },
    tech: {
      id: "tech",
      title: "Kỹ Thuật (KTV Hiện Trường)",
      badge: "Kỹ Thuật & Nghiệm Thu",
      avatar: "🔧",
      color: "from-sky-950 via-slate-900 to-sky-950 border-sky-500/30 text-white",
      tabColor: "bg-sky-700 text-white border-sky-700 shadow-sm",
      inactiveColor: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
      headline: "Công việc hôm nay 19/10, Checklist 4 chốt chặn SOP & Log Time",
      kpis: [
        { label: "Ca làm hôm nay", val: "3 Công Trình", color: "text-sky-400" },
        { label: "Checklist kiểm định", val: "8 Dự Án Đầy Đủ", color: "text-emerald-400" },
        { label: "Chốt chặn SOP", val: "4 Tiêu Chí Bắt Buộc", color: "text-amber-400" },
        { label: "Hàng kho BD & DA", val: "14 Lô Hàng PO", color: "text-white" },
      ],
      mustDos: [
        {
          priority: "urgent",
          tag: "Bàn Giao Hôm Nay (19/10)",
          desc: "KTV Tuấn Anh & Thái Châu: Bàn giao Cà Na Tây Ninh! Kiểm tra ray trượt SPX Max, dán tem QR bảo hành và ký BBGH/NT 3 bên.",
        },
        {
          priority: "important",
          tag: "Cân Chỉnh TRM631 (20/10)",
          desc: "KTV Tuấn Anh & Trường Tiến: Cân chỉnh độ căng thảm Precor TRM631, tra silicon, test tải 45p tại biệt thự Chateau Villa.",
        },
        {
          priority: "normal",
          tag: "Lịch Tuần & Kho",
          desc: "Theo dõi cont Hải Phòng về kho Đông Anh; chuẩn bị nhận giàn FTS giao Grab HQ vào Thứ 6 (23/10).",
        },
      ],
      quickActions: [
        { label: "Checklist Lắp Đặt 8 Dự Án", tab: "checklist", icon: ShieldCheck },
        { label: "Lịch Bảo Trì & Kỹ Thuật", tab: "maintenance", icon: Calendar },
        { label: "Vận Chuyển & Kho PO", tab: "logistics", icon: Truck },
        { label: "Ghi Giờ Làm (Log Time)", action: "logTime", icon: Clock },
      ],
    },
    accountant: {
      id: "accountant",
      title: "Kế Toán (Tài Chính & Kho)",
      badge: "Kế Toán & Pháp Lý SOP",
      avatar: "💰",
      color: "from-purple-950 via-slate-900 to-purple-950 border-purple-500/30 text-white",
      tabColor: "bg-purple-800 text-white border-purple-800 shadow-sm",
      inactiveColor: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
      headline: "Dòng tiền thu về, Thu hồi BBGH/NT ký 3 bên & Đối soát PO Kho KiotViet",
      kpis: [
        { label: "Công nợ cần thu", val: "2.12 Tỷ", color: "text-rose-400" },
        { label: "BBGH/NT cần thu hồi", val: "Cà Na & Chateau", color: "text-amber-400" },
        { label: "PO Kho đối soát", val: "7 DA / 7 BD", color: "text-purple-400" },
        { label: "Hóa đơn VAT chờ xuất", val: "2 Hợp Đồng", color: "text-emerald-400" },
      ],
      mustDos: [
        {
          priority: "urgent",
          tag: "Thu Hồi BBGH/NT 3 Bên",
          desc: "Đốc thúc KTV lấy chữ ký Khách hàng trên Biên bản giao hàng & nghiệm thu Cà Na Tây Ninh để xuất hóa đơn VAT và thu nốt 10%.",
        },
        {
          priority: "important",
          tag: "Thu Tiền Đợt Giao Hàng",
          desc: "Xác nhận phiếu chuyển tiền của Savills PMH (Chateau Villa 450tr) và Grab HQ trước khi KTV tiến hành nghiệm thu.",
        },
        {
          priority: "normal",
          tag: "Đối Soát Kho & Thuế",
          desc: "Đối chiếu phiếu xuất kho KiotViet cho 14 PO và chuẩn bị chứng từ nộp thuế thông quan cont ULS-AT2609 cảng Hải Phòng.",
        },
      ],
      quickActions: [
        { label: "Tài Chính & Thu Tiền", tab: "finance", icon: DollarSign },
        { label: "Vận Chuyển & Kho PO", tab: "logistics", icon: Truck },
        { label: "Kho Tài Liệu DMS (HĐ/BBGH)", tab: "dms", icon: FileText },
        { label: "Báo Giá & Hợp Đồng", tab: "tender", icon: Briefcase },
      ],
    },
  };

  const current = roleMeta[selectedRole] || roleMeta.tech;

  return (
    <div className="mb-6 w-full space-y-3">
      {/* Role Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 px-2 py-1 bg-slate-100 rounded-lg">
            Góc Nhìn Nghiệp Vụ:
          </span>
          <span className="text-xs text-slate-500 hidden md:inline">
            Chọn vai trò để hệ thống hướng dẫn chính xác công việc cần làm:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {Object.values(roleMeta).map((r) => {
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleSelectRole(r.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-2 ${
                  isSelected ? r.tabColor : r.inactiveColor
                }`}
              >
                <span>{r.avatar}</span>
                <span>{r.title}</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition ml-1"
            title={isExpanded ? "Thu gọn bàn làm việc" : "Mở rộng bàn làm việc"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Role Workspace Panel */}
      {isExpanded && (
        <div className={`rounded-2xl border bg-gradient-to-r p-5 shadow-sm transition-all duration-300 ${current.color}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{current.avatar}</span>
                <h3 className="text-base md:text-lg font-black tracking-tight text-white">
                  {current.title} — {current.badge}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white/90 border border-white/20">
                  Hôm nay: 19/10/2026
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1 font-medium">
                🎯 {current.headline}
              </p>
            </div>

            {/* Quick KPI Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {current.kpis.map((kpi, idx) => (
                <div key={idx} className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-center">
                  <div className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">{kpi.label}</div>
                  <div className={`text-xs font-black mt-0.5 ${kpi.color}`}>{kpi.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Center: 3 Tasks & Quick Action Shortcuts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 items-start">
            {/* 3 Must-Do Items */}
            <div className="lg:col-span-8 space-y-2.5">
              <div className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Việc Cần Xử Lý Trọng Tâm Trong Ngày (19/10/2026):</span>
              </div>
              <div className="space-y-2">
                {current.mustDos.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/10 border border-white/10 text-xs flex items-start gap-3 hover:bg-white/15 transition"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 mt-0.5 ${
                        item.priority === "urgent"
                          ? "bg-rose-500/30 text-rose-300 border border-rose-400/40"
                          : item.priority === "important"
                          ? "bg-amber-500/30 text-amber-300 border border-amber-400/40"
                          : "bg-cyan-500/30 text-cyan-300 border border-cyan-400/40"
                      }`}
                    >
                      {item.tag}
                    </span>
                    <p className="text-white/90 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="lg:col-span-4 bg-white/10 p-3.5 rounded-xl border border-white/10 space-y-2.5">
              <div className="text-[11px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lối Tắt Hành Động Nhanh:</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {current.quickActions.map((qa, idx) => {
                  const Icon = qa.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (qa.action === "logTime" && onOpenLogTime) {
                          onOpenLogTime();
                        } else if (qa.tab && onNavigateTab) {
                          onNavigateTab(qa.tab);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-bold text-xs flex items-center justify-between border border-white/15 transition shadow-xs group"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
                        <span>{qa.label}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
