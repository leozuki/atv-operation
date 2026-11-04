import React, { useState, useMemo } from "react";
import {
  Briefcase,
  DollarSign,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Truck,
  Users,
  UserCheck,
} from "lucide-react";
import { getTodayFormatted } from "../utils/formatters";

export default function RoleWorkspaceBar({
  _activeTab,
  onNavigateTab,
  _projects = [],
  _checklists = [],
  _tenders = [],
  _collections = [],
  _shipments = [],
  currentUser,
  setCurrentUser,
  users = [],
  onOpenLogTime,
  _onOpenChecklist,
  onSwitchToMobile,
  showToast,
  lang = "en",
  onChangeLang,
}) {
  const todayStr = getTodayFormatted();

  const [selectedRole, setSelectedRole] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("atv_active_role_perspective") || "tech";
    }
    return "tech";
  });

  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("atv_role_bar_expanded") === "true";
    }
    return false; // Mặc định thu gọn tinh tế, không chiếm màn hình
  });

  const handleToggleExpanded = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("atv_role_bar_expanded", String(next));
      }
      return next;
    });
  };

  const handleSelectRole = (roleKey) => {
    setSelectedRole(roleKey);
    if (typeof window !== "undefined") {
      localStorage.setItem("atv_active_role_perspective", roleKey);
    }

    if (setCurrentUser && users && users.length > 0) {
      let targetUser = null;
      let roleDesc = "";
      if (roleKey === "boss") {
        targetUser = users.find((u) => u.roleId === "admin" || u.roleId === "director" || u.id === "USR-001");
        roleDesc = "Sếp / Ban Giám Đốc (Xem toàn quyền, duyệt 3 cấp & bảo lãnh nợ BOD)";
      } else if (roleKey === "sale") {
        targetUser = users.find((u) => u.roleId === "sales_lead" || u.id === "USR-002");
        roleDesc = "Kinh Doanh (Quản lý Deal, Báo giá BOQ, Thiết kế 2D/3D & CRM)";
      } else if (roleKey === "tech") {
        targetUser = users.find((u) => u.roleId === "field_tech" || u.id === "USR-004");
        roleDesc = "Kỹ Thuật Viên (Checklist lắp đặt, Lịch bảo trì, Log time hiện trường)";
      } else if (roleKey === "accountant") {
        targetUser = users.find((u) => u.roleId === "accountant" || u.id === "USR-003");
        roleDesc = "Kế Toán (Sổ thu tiền, Công nợ, Hóa đơn VAT & Đối soát PO kho)";
      }

      if (targetUser) {
        setCurrentUser(targetUser);
        if (showToast) {
          showToast(`✓ Đã chuyển góc nhìn nghiệp vụ: ${targetUser.name} - ${roleDesc}`);
        }
      }
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
          desc: "Đốc thúc tiến độ bàn giao Cà Na Pilates Tây Ninh và hoàn tất nghiệm thu Chateau Villa Phú Mỹ Hưng.",
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
          desc: "Liên hệ Mr. Vũ (Cà Na Tây Ninh) hỗ trợ ký BBGH/NT và báo Mr. Vinh (Chateau Villa) đón KTV hoàn tất bàn giao.",
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
      headline: "Công việc hôm nay, Checklist 4 chốt chặn SOP & Log Time hiện trường",
      kpis: [
        { label: "Ca làm hôm nay", val: "3 Công Trình", color: "text-sky-400" },
        { label: "Checklist kiểm định", val: "8 Dự Án Đầy Đủ", color: "text-emerald-400" },
        { label: "Chốt chặn SOP", val: "4 Tiêu Chí Bắt Buộc", color: "text-amber-400" },
        { label: "Hàng kho BD & DA", val: "14 Lô Hàng PO", color: "text-white" },
      ],
      mustDos: [
        {
          priority: "urgent",
          tag: "Nhiệm Vụ Bàn Giao",
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
        { label: "Báo Cáo Khối Lượng & Giờ Làm KTV", tab: "checklist", params: { view: "report" }, icon: UserCheck },
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

  const derivedRole = useMemo(() => {
    if (!currentUser?.roleId) return selectedRole;
    if (["admin", "director", "ops_manager"].includes(currentUser.roleId)) return "boss";
    if (["sales_lead", "sales_rep"].includes(currentUser.roleId)) return "sale";
    if (["field_tech", "tech_lead", "tech_manager"].includes(currentUser.roleId)) return "tech";
    if (["accountant", "cfo"].includes(currentUser.roleId)) return "accountant";
    return selectedRole;
  }, [currentUser?.roleId, selectedRole]);

  const activeRole = derivedRole || selectedRole || "tech";
  const current = roleMeta[activeRole] || roleMeta.tech;

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-2.5">
      {/* Role Selector Top Command Bar (Premium SaaS Segmented Control) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-medium text-slate-400 shrink-0 hidden md:inline">
            Không gian làm việc:
          </span>
          <div className="inline-flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg border border-slate-200/70 flex-wrap">
            {Object.values(roleMeta).map((r) => {
              const isSelected = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelectRole(r.id)}
                  className={`px-2.5 py-1 rounded-md text-xs transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900 font-medium border border-transparent"
                  }`}
                >
                  <span className="text-xs opacity-90">{r.avatar}</span>
                  <span>{r.title.split(" (")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {!isExpanded && (
            <span className="text-xs text-slate-500 hidden xl:inline truncate max-w-md" title={current.headline}>
              {current.headline}
            </span>
          )}

          <button
            onClick={handleToggleExpanded}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer border ${
              isExpanded
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs"
            }`}
            title={isExpanded ? "Thu gọn bảng việc trọng tâm" : "Xem chi tiết việc cần làm & KPI của vai trò này"}
          >
            <span className="text-[11px]">{isExpanded ? "Thu gọn" : "Tiêu điểm vai trò"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {onSwitchToMobile && (
            <button
              onClick={onSwitchToMobile}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-200/90 shadow-2xs active:scale-95"
              title="Chuyển sang giao diện Mobile App chuyên biệt"
            >
              <span className="text-xs">📱</span>
              <span className="text-[11px] hidden sm:inline">Mobile View</span>
            </button>
          )}

          {onChangeLang && (
            <div className="inline-flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80 text-[11px] font-semibold">
              <button
                onClick={() => onChangeLang("en")}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  lang === "en"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => onChangeLang("vi")}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  lang === "vi"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Chuyển sang Tiếng Việt"
              >
                VI
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Role Workspace Panel (Refined SaaS Light Drawer when expanded) */}
      {isExpanded && (
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all duration-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3.5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{current.avatar}</span>
                <h3 className="text-sm md:text-base font-bold tracking-tight text-slate-900">
                  {current.title} — <span className="text-slate-500 font-medium">{current.badge}</span>
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/80">
                  Hôm nay: {todayStr}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {current.headline}
              </p>
            </div>

            {/* Quick KPI Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {current.kpis.map((kpi, idx) => (
                <div key={idx} className="px-3 py-2 rounded-lg bg-slate-50/90 border border-slate-200/70">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{kpi.label}</div>
                  <div className="text-xs font-bold mt-0.5 text-slate-900 tabular-nums">{kpi.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Center: 3 Tasks & Quick Action Shortcuts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3.5 items-start">
            {/* 3 Must-Do Items */}
            <div className="lg:col-span-8 space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Việc Cần Xử Lý Trọng Tâm ({todayStr})</span>
              </div>
              <div className="space-y-1.5">
                {current.mustDos.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-200/70 text-xs flex items-start gap-2.5 hover:bg-slate-50 transition"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 mt-0.5 ${
                        item.priority === "urgent"
                          ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                          : item.priority === "important"
                          ? "bg-amber-50 text-amber-700 border border-amber-200/80"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200/80"
                      }`}
                    >
                      {item.tag}
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="lg:col-span-4 bg-slate-50/70 p-3 rounded-lg border border-slate-200/70 space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                <span>Lối Tắt Nghiệp Vụ</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {current.quickActions.map((qa, idx) => {
                  const Icon = qa.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (qa.action === "logTime" && onOpenLogTime) {
                          onOpenLogTime();
                        } else if (qa.tab && onNavigateTab) {
                          onNavigateTab(qa.tab, qa.params);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium text-xs flex items-center justify-between border border-slate-200/80 transition shadow-2xs group cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        <span>{qa.label}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
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
