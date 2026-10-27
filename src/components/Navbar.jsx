import React, { useState } from "react";
import {
  LayoutDashboard,
  Ship,
  FolderGit2,
  ClipboardCheck,
  Wrench,
  FileSpreadsheet,
  Palette,
  Bell,
  Warehouse,
  AlertTriangle,
  Camera,
  CheckCircle2,
} from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, shipments, projects, tenders }) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Marketing alerts: deals ready for site handover / photoshoot
  const marketingReadyDeals = projects.filter((p) => p.marketingReady);

  // Shortage alerts
  const shortageShipments = shipments.filter(
    (s) => s.shortageStatus === "vendor_shortage" || s.shortageStatus === "order_shortage"
  );

  const totalAlerts = marketingReadyDeals.length + shortageShipments.length;

  const navItems = [
    { id: "matrix", label: "Tiến Độ Tổng Thể (Master Matrix)", icon: LayoutDashboard, isMaster: true },
    { id: "dashboard", label: "Dashboard Ops", icon: LayoutDashboard },
    { id: "logistics", label: "Vận chuyển & PO", icon: Ship, badge: shipments.length },
    { id: "projects", label: "Dự án & Mặt bằng", icon: FolderGit2, alertCount: marketingReadyDeals.length },
    { id: "checklist", label: "Checklist Lắp đặt", icon: ClipboardCheck },
    { id: "maintenance", label: "Lịch Kỹ thuật & Bảo trì", icon: Wrench },
    { id: "tender", label: "Tender & Báo giá", icon: FileSpreadsheet, badge: tenders.length },
    { id: "design", label: "Tiến độ Sales & 2D/3D", icon: Palette },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with Branding, Warehouse status & Alert Bell */}
        <div className="flex items-center justify-between h-16 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <span className="text-white font-black text-xl tracking-wider">A</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">ATTIVO</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30 uppercase">
                  Operation ERP
                </span>
              </div>
              <p className="text-xs text-slate-400">Hệ thống Điều phối Vận hành, Nhập kho & Kỹ thuật</p>
            </div>
          </div>

          {/* Active Warehouses Indicator */}
          <div className="hidden md:flex items-center gap-4 bg-slate-800/60 px-3.5 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <div className="flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">Kho Hà Nội (Đông Anh):</span>
              <span className="font-semibold text-blue-300">
                {shipments.filter((s) => s.warehouse === "DA").length} PO
              </span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Kho Bình Dương:</span>
              <span className="font-semibold text-emerald-300">
                {shipments.filter((s) => s.warehouse === "BD").length} PO
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition border border-slate-700/60 focus:outline-none"
                title="Cảnh báo vận hành"
              >
                <Bell className="w-5 h-5" />
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900 animate-pulse">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" /> Cảnh Báo Vận Hành Mới Nhất
                    </span>
                    <span className="text-xs text-slate-400">{totalAlerts} thông báo</span>
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {/* Marketing Handover Alerts */}
                    {marketingReadyDeals.map((deal) => (
                      <div
                        key={deal.id}
                        onClick={() => {
                          setActiveTab("projects");
                          setShowNotifications(false);
                        }}
                        className="p-2.5 rounded-lg bg-pink-500/10 border border-pink-500/30 hover:bg-pink-500/20 cursor-pointer transition text-left"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-400">
                          <Camera className="w-3.5 h-3.5" />
                          <span>MẶT BẰNG SẴN SÀNG QUAY CHỤP MARKETING</span>
                        </div>
                        <p className="text-sm font-medium text-white mt-0.5">{deal.name}</p>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">{deal.marketingNote}</p>
                      </div>
                    ))}

                    {/* Shortage Alerts */}
                    {shortageShipments.map((ship) => (
                      <div
                        key={ship.id}
                        onClick={() => {
                          setActiveTab("logistics");
                          setShowNotifications(false);
                        }}
                        className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 cursor-pointer transition text-left"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>
                            {ship.shortageStatus === "vendor_shortage"
                              ? "CẢNH BÁO: HÃNG GIAO THIẾU"
                              : "CẢNH BÁO: ORDER THIẾU (ĐẶT BÙ)"}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-white mt-0.5">
                          {ship.brand} - PO: {ship.poCode}
                        </p>
                        <p className="text-xs text-slate-300 mt-1">{ship.shortageDetail}</p>
                      </div>
                    ))}

                    {totalAlerts === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-70" />
                        Mọi tiến độ vận hành đang diễn ra bình thường!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap relative ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {item.alertCount && item.alertCount > 0 ? (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-pink-500 text-white animate-pulse">
                    {item.alertCount}
                  </span>
                ) : null}
                {item.badge ? (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
