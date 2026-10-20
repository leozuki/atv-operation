import React from "react";
import {
  ClipboardCheck,
  Calendar,
  FolderGit2,
  Ship,
  Menu,
  FileText,
  Target,
  Palette,
  DollarSign,
  LayoutDashboard,
  Presentation,
  AlertTriangle,
} from "lucide-react";

export default function MobileBottomNav({
  activeTab,
  onNavigateTab,
  currentUser,
  onToggleMenu,
  alertCount = 0,
}) {
  const roleId = currentUser?.roleId || "field_tech";

  // Determine top 4 quick tabs based on current user role
  let navItems = [];

  if (["admin", "director", "ops_manager"].includes(roleId)) {
    // Sếp / Quản trị
    navItems = [
      { id: "matrix", label: "Tiến Độ", icon: LayoutDashboard },
      { id: "wbr", label: "Giao Ban", icon: Presentation },
      { id: "projects", label: "Dự Án", icon: FolderGit2 },
      { id: "finance", label: "Thu Tiền", icon: DollarSign },
    ];
  } else if (["sales_lead", "sales_rep"].includes(roleId)) {
    // Sale
    navItems = [
      { id: "projects", label: "Dự Án", icon: FolderGit2 },
      { id: "tender", label: "Báo Giá", icon: FileText },
      { id: "hubspot", label: "HubSpot", icon: Target },
      { id: "design", label: "Thiết Kế", icon: Palette },
    ];
  } else if (["accountant", "cfo"].includes(roleId)) {
    // Kế toán
    navItems = [
      { id: "finance", label: "Thu Tiền", icon: DollarSign },
      { id: "tender", label: "Hợp Đồng", icon: FileText },
      { id: "projects", label: "Dự Án", icon: FolderGit2 },
      { id: "logistics", label: "Kho PO", icon: Ship },
    ];
  } else {
    // Kỹ thuật viên (Default)
    navItems = [
      { id: "checklist", label: "Checklist", icon: ClipboardCheck, badge: alertCount },
      { id: "maintenance", label: "Lịch Việc", icon: Calendar },
      { id: "projects", label: "Dự Án", icon: FolderGit2 },
      { id: "logistics", label: "Kho PO", icon: Ship },
    ];
  }

  return (
    <nav
      aria-label="Thanh điều hướng di động"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-2 py-1.5 flex items-center justify-around safe-bottom"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigateTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition relative min-h-[48px] active:scale-95 ${
              isActive
                ? "text-blue-600 font-extrabold"
                : "text-slate-600 hover:text-slate-900 font-medium"
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-600 stroke-[2.4]" : "text-slate-500"}`} />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
            )}
          </button>
        );
      })}

      {/* Menu Drawer Toggle Button */}
      <button
        type="button"
        onClick={onToggleMenu}
        className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-slate-600 hover:text-slate-900 font-medium transition min-h-[48px] active:scale-95"
      >
        <Menu className="w-5 h-5 text-slate-500" />
        <span className="text-[10px] tracking-tight mt-0.5">Thêm</span>
      </button>
    </nav>
  );
}
