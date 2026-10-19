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
  RotateCcw,
  Menu,
  X,
  Presentation,
  DollarSign,
  Calendar,
  GitCommit,
  FolderOpen,
  Link2,
  Users,
  ShieldCheck,
  CalendarRange,
  Plus,
  Bot,
  CheckCircle2,
} from "lucide-react";


export default function Sidebar({
  activeTab,
  setActiveTab,
  onTabChange,
  shipments = [],
  setShipments,
  projects = [],
  setProjects,
  tenders = [],
  collections = [],
  setCollections,
  schedule,
  setSchedule,
  dmsDocuments = [],
  hubspotTickets: _hubspotTickets = [],
  users = [],
  currentUser,
  setCurrentUser,
  onResetData,
  alertCount,
  dynamicCounts,
  notifications = [],
  setNotifications,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickType, setQuickType] = useState("project"); // "project" | "shipment" | "tech" | "collection"
  const [quickForm, setQuickForm] = useState({
    title: "",
    customer: "",
    region: "HCM",
    amount: "",
    poCode: "",
    brand: "Precor",
    day: "Thứ 2 (Monday)",
    tech: "Lương Nguyễn Tuấn Anh",
  });

  const handleTabSelect = (tabId) => {
    if (setActiveTab) setActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
    setMobileOpen(false);
  };

  const handleQuickAddSubmit = (e) => {
    e.preventDefault();
    if (!quickForm.title.trim()) return;

    if (quickType === "project" && setProjects) {
      const newPrj = {
        id: `PRJ-${Date.now().toString().slice(-3)}`,
        name: quickForm.title.trim(),
        customer: quickForm.customer || "Khách hàng mới",
        contact: "Đang cập nhật",
        address: quickForm.region === "HCM" ? "TP. Hồ Chí Minh" : "Hà Nội",
        brand: quickForm.brand || "Precor",
        type: "Commercial Gym / Studio",
        region: quickForm.region,
        contractCode: `ATVE26-${Date.now().toString().slice(-3)}`,
        stage: "site_prep",
        handoverDate: "2026-10-25",
        installationDate: "2026-10-28",
        marketingReady: false,
        leadSale: currentUser?.name || "Hoài Trịnh",
        dealOwner: currentUser?.name || "Hoài Trịnh",
        contactOwner: "Marketing Attivo",
        assignedTech: quickForm.region === "HCM" ? "Đội KTV HCM" : "Đội KTV HN",
        checklistComplete: false,
        checklistProgress: 0,
      };
      setProjects([newPrj, ...projects]);
      handleTabSelect("projects");
    } else if (quickType === "shipment" && setShipments) {
      const newPo = {
        id: `SHP-${Date.now().toString().slice(-3)}`,
        poCode: quickForm.poCode || `ULS-AT26-${Date.now().toString().slice(-2)}`,
        brand: quickForm.brand || "Precor",
        description: quickForm.title.trim(),
        warehouse: quickForm.region === "HCM" ? "BD" : "DA",
        eta: "2026-10-20",
        status: "in_transit",
        shortageStatus: "none",
        shortageDetail: "Đủ kiện tiêu chuẩn",
        assignedProject: quickForm.customer || "Nhập kho dự phòng",
      };
      setShipments([newPo, ...shipments]);
      handleTabSelect("logistics");
    } else if (quickType === "tech" && setSchedule && schedule) {
      const reg = quickForm.region === "HN" ? "HN" : "HCM";
      const taskToAdd = {
        id: `TK-${reg}-${Date.now().toString().slice(-4)}`,
        site: quickForm.customer || quickForm.title.trim(),
        type: "maintenance",
        content: quickForm.title.trim(),
        tech: quickForm.tech || "Đội Kỹ Thuật",
        status: "pending",
        priority: "high",
      };
      const updated = {
        ...schedule,
        [reg]: (schedule[reg] || []).map((d, idx) =>
          d.day === quickForm.day || idx === 0
            ? { ...d, tasks: [...d.tasks, taskToAdd] }
            : d
        ),
      };
      setSchedule(updated);
      handleTabSelect("maintenance");
    } else if (quickType === "collection" && setCollections) {
      const vnd = Number(quickForm.amount) || 50000000;
      const newCol = {
        id: `FIN-${Date.now().toString().slice(-3)}`,
        bank: "TCB",
        customer: quickForm.customer || quickForm.title.trim(),
        project: quickForm.title.trim(),
        content: `Thu tiền nhanh: ${quickForm.title.trim()}`,
        amountVND: vnd,
        amountUSD: Number((vnd / 26000).toFixed(2)),
        date: "2026-10-19",
        status: "confirmed",
        pic: currentUser?.name || "Hoài Trịnh",
      };
      setCollections([newCol, ...collections]);
      handleTabSelect("finance");
    }

    setShowQuickAdd(false);
    setQuickForm({
      title: "",
      customer: "",
      region: "HCM",
      amount: "",
      poCode: "",
      brand: "Precor",
      day: "Thứ 2 (Monday)",
      tech: "Lương Nguyễn Tuấn Anh",
    });
  };

  const marketingReadyDeals = projects.filter((p) => p.marketingReady);
  const shortageShipments = shipments.filter(
    (s) => s.shortageStatus === "vendor_shortage" || s.shortageStatus === "order_shortage"
  );
  const completedNotifications = notifications.filter(
    (n) => n.type === "project_completed" || n.type === "chat_completed"
  );
  const unreadCompleted = completedNotifications.filter((n) => !n.read);
  const totalAlerts =
    marketingReadyDeals.length + shortageShipments.length + unreadCompleted.length;

  const daCount = shipments.filter((s) => s.warehouse === "DA").length;
  const bdCount = shipments.filter((s) => s.warehouse === "BD").length;

  const navGroups = [
    {
      title: "Điều hành & Tiến độ",
      items: [
        {
          id: "matrix",
          label: "Tiến Độ Tổng Thể",
          icon: LayoutDashboard,
        },
        {
          id: "gantt",
          label: "Biểu Đồ Gantt",
          icon: CalendarRange,
          badge: "Gantt",
          badgeColor: "bg-blue-100 text-blue-800 font-bold",
        },
        {
          id: "wbr",
          label: "Giao Ban Tuần",
          icon: Presentation,
          badge: "19/10",
          badgeColor: "bg-indigo-100 text-indigo-700 font-bold",
        },
        {
          id: "calendar",
          label: "Lịch Vận Hành",
          icon: Calendar,
          badge: "Tháng 10",
          badgeColor: "bg-blue-100 text-blue-800 font-bold",
        },
      ],
    },
    {
      title: "Kinh doanh & Dự án",
      items: [
        {
          id: "projects",
          label: "Danh Sách Dự Án",
          icon: FolderGit2,
          alertCount: alertCount !== undefined ? alertCount : marketingReadyDeals.length,
        },
        {
          id: "tender",
          label: "Báo Giá & Hợp Đồng",
          icon: FileSpreadsheet,
          badge: dynamicCounts?.tenders !== undefined ? dynamicCounts.tenders : tenders.length,
          badgeColor: "bg-emerald-100 text-emerald-800 font-bold",
        },
        {
          id: "design",
          label: "Thiết Kế 2D/3D",
          icon: Palette,
        },
        {
          id: "finance",
          label: "Thu Tiền",
          icon: DollarSign,
          badge: (dynamicCounts?.collections !== undefined ? dynamicCounts.collections : collections.length)
            ? `${dynamicCounts?.collections !== undefined ? dynamicCounts.collections : collections.length} món`
            : "8 món",
          badgeColor: "bg-emerald-100 text-emerald-800 font-bold",
        },
      ],
    },
    {
      title: "Kho Vận & Kỹ thuật",
      items: [
        {
          id: "logistics",
          label: "Vận Chuyển & Kho",
          icon: Ship,
          badge: dynamicCounts?.shipments !== undefined ? dynamicCounts.shipments : shipments.length,
          badgeColor: "bg-blue-100 text-blue-700 font-bold",
        },
        {
          id: "checklist",
          label: "Checklist Lắp Đặt",
          icon: ClipboardCheck,
        },
        {
          id: "maintenance",
          label: "Lịch Bảo Trì & Kỹ Thuật",
          icon: Wrench,
        },
      ],
    },
    {
      title: "Hệ Thống",
      items: [
        {
          id: "hubspot",
          label: "HubSpot CRM 360°",
          icon: Link2,
          badge: "API v3",
          badgeColor: "bg-orange-100 text-orange-800 font-bold",
        },
        {
          id: "dms",
          label: "Kho Tài Liệu DMS",
          icon: FolderOpen,
          badge: (dynamicCounts?.dmsDocuments !== undefined ? dynamicCounts.dmsDocuments : dmsDocuments.length)
            ? `${dynamicCounts?.dmsDocuments !== undefined ? dynamicCounts.dmsDocuments : dmsDocuments.length}`
            : "18",
          badgeColor: "bg-blue-100 text-blue-800 font-bold",
        },
        {
          id: "users",
          label: "Phân Quyền & Nhân Sự",
          icon: Users,
          badge: (dynamicCounts?.users !== undefined ? dynamicCounts.users : users.length)
            ? `${dynamicCounts?.users !== undefined ? dynamicCounts.users : users.length}`
            : "10",
          badgeColor: "bg-purple-100 text-purple-800 font-bold",
        },
        {
          id: "flow",
          label: "Quy Trình Nghiệp Vụ",
          icon: GitCommit,
          badge: "9 Bước",
          badgeColor: "bg-cyan-100 text-cyan-800 font-bold",
        },
        {
          id: "telegram",
          label: "Bot Báo Cáo (Telegram & Zalo)",
          icon: Bot,
          badge: "2 Kênh",
          badgeColor: "bg-emerald-100 text-emerald-800 font-bold",
        },
      ],
    },
  ];



  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-white text-slate-700 shadow-md border border-slate-200"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        />
      )}

      {/* Left Sidebar Column */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo & Brand Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-xl">
                A
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                    ATTIVO
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 uppercase">
                    ERP OPS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Hệ Thống Điều Hành Vận Hành</p>
              </div>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
                title="Cảnh báo vận hành"
              >
                <Bell className="w-4 h-4" />
                {totalAlerts > 0 && (
                  <span className="absolute 1 top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <>
                  {/* Backdrop to close on outside click */}
                  <div
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px]"
                    onClick={() => setShowNotifications(false)}
                  />

                  {/* Notification Popover Panel */}
                  <div className="fixed top-4 left-4 right-4 sm:right-auto sm:left-[296px] sm:w-[380px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 text-xs flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-rose-50 text-rose-600">
                          <Bell className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">Cảnh Báo & Tiến Độ Vận Hành</span>
                          <span className="text-[11px] text-slate-400 font-medium">{totalAlerts} việc cần chú ý</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCompleted.length > 0 && (
                          <button
                            onClick={() => {
                              if (setNotifications) {
                                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                              }
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold px-2 py-0.5 rounded bg-blue-50 border border-blue-200 cursor-pointer transition"
                            title="Đánh dấu tất cả thông báo hoàn thành đã đọc"
                          >
                            Đã đọc
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                          title="Đóng"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 space-y-2.5 overflow-y-auto max-h-[calc(85vh-100px)]">
                      {totalAlerts === 0 ? (
                        <div className="py-8 text-center text-slate-400">
                          <Bell className="w-8 h-8 mx-auto opacity-30 mb-2" />
                          <p className="text-xs font-medium">Không có cảnh báo mới nào.</p>
                        </div>
                      ) : (
                        <>
                          {/* Completed Project / KTV Chat Notifications */}
                          {completedNotifications.map((noti) => (
                            <div
                              key={noti.id}
                              onClick={() => {
                                if (noti.actionTab) {
                                  handleTabSelect(noti.actionTab);
                                } else {
                                  handleTabSelect("projects");
                                }
                                if (setNotifications) {
                                  setNotifications((prev) =>
                                    prev.map((n) => (n.id === noti.id ? { ...n, read: true } : n))
                                  );
                                }
                                setShowNotifications(false);
                              }}
                              className={`p-3 rounded-xl border cursor-pointer transition group ${
                                noti.read
                                  ? "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
                                  : "bg-emerald-50/90 border-emerald-300 hover:bg-emerald-100/90 shadow-xs"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-emerald-800 flex items-center gap-1.5 text-[11px]">
                                  <Bot className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="line-clamp-1">{noti.title}</span>
                                </span>
                                <span className="text-[10px] text-emerald-700 font-medium group-hover:underline shrink-0 ml-1">
                                  Xem dự án →
                                </span>
                              </div>
                              <p className="font-bold text-slate-900 mt-1">{noti.projectName}</p>
                              <p className="text-slate-700 text-[11px] mt-0.5 leading-relaxed">
                                {noti.content}
                              </p>
                              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-emerald-200/50 text-[10px] text-slate-500">
                                <span className="flex items-center gap-1 font-medium text-emerald-700">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>{noti.technician || "KTV Hiện Trường"}</span>
                                </span>
                                <span className="text-slate-400 font-medium">{noti.timeFormatted || "Hôm nay"}</span>
                              </div>
                            </div>
                          ))}
                          {marketingReadyDeals.map((d) => (
                            <div
                              key={d.id}
                              onClick={() => {
                                handleTabSelect("projects");
                                setShowNotifications(false);
                              }}
                              className="p-3 rounded-xl bg-pink-50/70 border border-pink-200/80 cursor-pointer hover:bg-pink-100/80 transition group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-pink-700 flex items-center gap-1.5 text-[11px]">
                                  <Camera className="w-3.5 h-3.5" /> Bàn Giao MB (Marketing)
                                </span>
                                <span className="text-[10px] text-pink-600 font-medium group-hover:underline">Xem dự án →</span>
                              </div>
                              <p className="font-bold text-slate-900 mt-1">{d.name}</p>
                              {d.marketingNote && (
                                <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                                  {d.marketingNote}
                                </p>
                              )}
                            </div>
                          ))}

                          {shortageShipments.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => {
                                handleTabSelect("logistics");
                                setShowNotifications(false);
                              }}
                              className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 cursor-pointer hover:bg-amber-100/80 transition group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-800 flex items-center gap-1.5 text-[11px]">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Lệch Hàng: {s.brand} ({s.poCode})
                                </span>
                                <span className="text-[10px] text-amber-700 font-medium group-hover:underline">Xem kho →</span>
                              </div>
                              <p className="text-slate-700 text-[11px] mt-1 leading-relaxed">
                                {s.shortageDetail}
                              </p>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Zoho-inspired Universal Quick-Add Button */}
          <div className="px-4 pt-3 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setShowQuickAdd(true)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Tạo nhanh Dự án / PO / Lịch KTV / Khoản thu tiền từ bất kỳ đâu"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Nhanh Toàn Cục (Quick Add)</span>
            </button>
          </div>

          {/* Quick Warehouses Indicator Card */}
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Tình Trạng 2 Kho Nhập Hàng
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                onClick={() => handleTabSelect("logistics")}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-1 text-blue-700 font-bold text-[11px]">
                  <Warehouse className="w-3.5 h-3.5" /> Kho Hà Nội
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Đông Anh: <strong>{daCount} PO</strong></div>
              </div>

              <div
                onClick={() => handleTabSelect("logistics")}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 transition cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                  <Warehouse className="w-3.5 h-3.5" /> Kho Bình Dương
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Kho BD: <strong>{bdCount} PO</strong></div>
              </div>
            </div>
          </div>

          {/* Nav Items List */}
          <nav className="p-3 space-y-2.5 flex-1">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabSelect(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition group ${
                        isActive
                          ? "bg-blue-600 text-white font-bold shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1 rounded-md shrink-0 transition ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-1.5">
                        {item.alertCount && item.alertCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500 text-white shadow-xs animate-pulse">
                            {item.alertCount}
                          </span>
                        ) : null}
                        {item.badge ? (
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                              isActive
                                ? "bg-white/20 text-white"
                                : item.badgeColor || "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Current User Card */}
          {currentUser && (
            <div className="p-3 mx-3 mb-2 rounded-2xl bg-purple-50/70 border border-purple-200/80 shadow-xs">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-xl object-cover border border-purple-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-purple-700 font-medium truncate">
                    {currentUser.title}
                  </div>
                </div>
                <button
                  onClick={() => handleTabSelect("users")}
                  className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition"
                  title="Chỉnh sửa hồ sơ cá nhân & Phân quyền"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </div>

              {/* Quick switch user */}
              <div className="mt-2 pt-2 border-t border-purple-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Đổi vai trò:</span>
                <select
                  value={currentUser.id}
                  onChange={(e) => {
                    const u = users.find((x) => x.id === e.target.value);
                    if (u && setCurrentUser) setCurrentUser(u);
                  }}
                  className="bg-white border border-purple-200 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-slate-700 focus:outline-none max-w-[130px] truncate"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title.split("(")[0].trim()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Footer Reset & System Status */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 space-y-2">
            <button
              onClick={onResetData}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              title="Đặt lại dữ liệu ban đầu từ tài liệu Attivo"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Khôi Phục Dữ Liệu Gốc</span>
            </button>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Attivo ERP v2.0 Light</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Universal Quick-Create Modal (Zoho Global '+' Action) */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Plus className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-black text-slate-900">
                  Tạo Nhanh Toàn Cục (Universal Quick Add)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Entity Type Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { id: "project", label: "Dự Án Mới", icon: FolderGit2 },
                { id: "shipment", label: "Lô Hàng PO", icon: Ship },
                { id: "tech", label: "Lịch KTV", icon: Wrench },
                { id: "collection", label: "Thu Tiền", icon: DollarSign },
              ].map((t) => {
                const TIcon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setQuickType(t.id)}
                    className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition ${
                      quickType === t.id
                        ? "bg-white text-blue-700 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <TIcon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleQuickAddSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {quickType === "project"
                    ? "Tên Dự Án *"
                    : quickType === "shipment"
                    ? "Mô Tả Lô Hàng / Thiết Bị *"
                    : quickType === "tech"
                    ? "Nội Dung Công Việc Kỹ Thuật *"
                    : "Nội Dung Khoản Thu / Dự Án *"}
                </label>
                <input
                  type="text"
                  required
                  value={quickForm.title}
                  onChange={(e) => setQuickForm({ ...quickForm, title: e.target.value })}
                  placeholder={
                    quickType === "project"
                      ? "VD: Sala Private Gym Q2"
                      : quickType === "shipment"
                      ? "VD: Cont Precor Cardio 12 máy"
                      : quickType === "tech"
                      ? "VD: Bảo trì định kỳ & kiểm tra cáp"
                      : "VD: Thanh toán đợt 2 HĐ Precor"
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Khách Hàng / Điểm Điểm
                  </label>
                  <input
                    type="text"
                    value={quickForm.customer}
                    onChange={(e) => setQuickForm({ ...quickForm, customer: e.target.value })}
                    placeholder="VD: CĐT Sala / RMIT..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khu Vực / Kho</label>
                  <select
                    value={quickForm.region}
                    onChange={(e) => setQuickForm({ ...quickForm, region: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="HCM">Miền Nam (HCM / Kho BD)</option>
                    <option value="HN">Miền Bắc (HN / Kho ĐA)</option>
                  </select>
                </div>
              </div>

              {quickType === "shipment" && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mã PO</label>
                    <input
                      type="text"
                      value={quickForm.poCode}
                      onChange={(e) => setQuickForm({ ...quickForm, poCode: e.target.value })}
                      placeholder="VD: ULS-AT2635"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hãng</label>
                    <input
                      type="text"
                      value={quickForm.brand}
                      onChange={(e) => setQuickForm({ ...quickForm, brand: e.target.value })}
                      placeholder="Precor / Merrithew..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    />
                  </div>
                </div>
              )}

              {quickType === "tech" && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Thứ trong tuần</label>
                    <select
                      value={quickForm.day}
                      onChange={(e) => setQuickForm({ ...quickForm, day: e.target.value })}
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
                    <label className="block font-bold text-slate-700 mb-1">KTV Phụ Trách</label>
                    <input
                      type="text"
                      value={quickForm.tech}
                      onChange={(e) => setQuickForm({ ...quickForm, tech: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    />
                  </div>
                </div>
              )}

              {quickType === "collection" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Tiền Thu (VNĐ)</label>
                  <input
                    type="number"
                    value={quickForm.amount}
                    onChange={(e) => setQuickForm({ ...quickForm, amount: e.target.value })}
                    placeholder="VD: 150000000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Tạo & Mở Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
