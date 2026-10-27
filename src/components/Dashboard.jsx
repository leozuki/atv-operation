import React from "react";
import {
  Ship,
  Camera,
  ClipboardCheck,
  AlertTriangle,
  FileSpreadsheet,
  Wrench,
  Warehouse,
  ArrowRight,
  Plane,
  Anchor,
  Sparkles,
} from "lucide-react";
import {
  formatShortCurrency,
  formatDate,
  getWarehouseBadge,
  getShortageBadge,
} from "../utils/formatters";

export default function Dashboard({
  shipments,
  projects,
  tenders,
  weeklySchedule,
  onNavigate,
}) {
  const inTransitCount = shipments.filter(
    (s) => s.status === "shipping" || s.status === "customs"
  ).length;

  const daShipments = shipments.filter((s) => s.warehouse === "DA");
  const bdShipments = shipments.filter((s) => s.warehouse === "BD");

  const marketingDeals = projects.filter((p) => p.marketingReady);
  const installingDeals = projects.filter((p) => p.stage === "installation");

  const shortageDeals = shipments.filter(
    (s) => s.shortageStatus === "vendor_shortage" || s.shortageStatus === "order_shortage"
  );

  const newQuotations = tenders.filter((t) => t.type === "Quotation" && t.status === "New");
  const totalNewQuotationsVal = newQuotations.reduce((sum, t) => sum + (t.valueBeforeVat || 0), 0);

  const newContracts = tenders.filter((t) => t.type === "Contract" && t.status === "New");
  const totalNewContractsVal = newContracts.reduce((sum, t) => sum + (t.valueBeforeVat || 0), 0);

  const hcmTasksTotal = weeklySchedule.HCM.reduce((acc, d) => acc + d.tasks.length, 0);
  const hnTasksTotal = weeklySchedule.HN.reduce((acc, d) => acc + d.tasks.length, 0);

  return (
    <div className="space-y-6 w-full">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-white">
              Dashboard Vận Hành
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate("matrix")}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs md:text-sm transition shadow-sm hover:bg-blue-50 flex items-center gap-2"
            >
              <span>Xem Ma Trận Tiến Độ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate("logistics")}
              className="px-4 py-2.5 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white font-medium text-xs md:text-sm transition border border-white/20 flex items-center gap-2"
            >
              <Ship className="w-4 h-4" />
              <span>Đơn Hàng Về</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Card 1: Logistics / In transit */}
        <div
          onClick={() => onNavigate("logistics")}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đang Về (Air/Sea)</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700 group-hover:bg-sky-100 transition">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{inTransitCount}</span>
            <span className="text-xs text-slate-500 font-medium">lô hàng</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>DA (HN): <strong>{daShipments.length}</strong></span>
            <span>BD: <strong>{bdShipments.length}</strong></span>
          </div>
        </div>

        {/* Card 2: Marketing Handover Ready */}
        <div
          onClick={() => onNavigate("projects")}
          className="p-4 rounded-2xl bg-white border border-pink-200 hover:border-pink-400 cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-pink-700 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> Bàn Giao MB
            </span>
            <div className="p-2 rounded-xl bg-pink-50 text-pink-700 group-hover:bg-pink-100 transition">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-pink-700">{marketingDeals.length}</span>
            <span className="text-xs text-slate-500 font-medium">deal sẵn sàng</span>
          </div>
          <p className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-pink-700 font-semibold truncate">
            {marketingDeals[0]?.name || "Chưa có deal"}
          </p>
        </div>

        {/* Card 3: Installation & Checklist */}
        <div
          onClick={() => onNavigate("checklist")}
          className="p-4 rounded-2xl bg-white border border-cyan-200 hover:border-cyan-400 cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-800">Đang Lắp Đặt</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-800 group-hover:bg-cyan-100 transition">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{installingDeals.length}</span>
            <span className="text-xs text-slate-500 font-medium">công trình</span>
          </div>
          <p className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            Checklist kiểm đếm hàng hóa
          </p>
        </div>

        {/* Card 4: Shortage Alerts */}
        <div
          onClick={() => onNavigate("logistics")}
          className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs group ${
            shortageDeals.length > 0
              ? "bg-amber-50/50 border-amber-300 hover:border-amber-400"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Lệch / Thiếu Hàng</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900">{shortageDeals.length}</span>
            <span className="text-xs text-slate-500 font-medium">vấn đề cần bù</span>
          </div>
          <p className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-amber-800 font-semibold truncate">
            Hãng thiếu: 1 | Order thiếu: 1
          </p>
        </div>

        {/* Card 5: Tenders & Contracts */}
        <div
          onClick={() => onNavigate("tender")}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tender Tuần Mới</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg font-black text-emerald-700">
              {formatShortCurrency(totalNewQuotationsVal + totalNewContractsVal)}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Báo giá: <strong>{newQuotations.length}</strong></span>
            <span>HĐ: <strong>{newContracts.length}</strong></span>
          </div>
        </div>

        {/* Card 6: Tech Schedule */}
        <div
          onClick={() => onNavigate("maintenance")}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kỹ Thuật 2 Miền</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100 transition">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{hcmTasksTotal + hnTasksTotal}</span>
            <span className="text-xs text-slate-500 font-medium">tasks tuần</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>HN: <strong>{hnTasksTotal}</strong></span>
            <span>HCM: <strong>{hcmTasksTotal}</strong></span>
          </div>
        </div>
      </div>

      {/* Row 2: Marketing & Logistics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL A: Marketing Readiness - Bàn giao mặt bằng */}
        <div className="p-5 rounded-2xl bg-white border border-pink-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-pink-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-pink-100 text-pink-700">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  Chuẩn Bị Bàn Giao Mặt Bằng ➔ Kích Hoạt Marketing
                  <span className="px-2 py-0.5 rounded-full text-xs bg-pink-500 text-white font-bold">
                    {marketingDeals.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Thông báo cho team Marketing chuẩn bị thợ ảnh, máy quay, kịch bản quay review
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("projects")}
              className="text-xs text-pink-700 hover:text-pink-800 font-bold flex items-center gap-1"
            >
              Tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {marketingDeals.map((deal) => (
              <div
                key={deal.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-pink-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800">
                      {deal.type}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{deal.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{deal.address}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Dự kiến bàn giao</span>
                    <span className="text-xs font-bold text-pink-700 bg-pink-100 px-2 py-1 rounded-md border border-pink-200 inline-block mt-0.5">
                      {formatDate(deal.handoverDate)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-pink-50 border border-pink-200 text-xs text-pink-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-pink-800">Ghi chú Marketing: </strong>
                    {deal.marketingNote}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Sale: <strong className="text-slate-700">{deal.leadSale}</strong></span>
                  <span>Brand: <strong className="text-slate-700">{deal.brand}</strong></span>
                  <span>Kỹ thuật: <strong className="text-slate-700">{deal.assignedTech}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL B: Đơn Hàng Sắp Về 2 Kho & Cảnh Báo Lệch Hàng */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Warehouse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Cập Nhật Hàng Về 2 Kho & Bù Thiếu
                </h3>
                <p className="text-xs text-slate-500">
                  Kho Đông Anh (Hà Nội) & Kho Bình Dương | Đơn ghép dự án
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("logistics")}
              className="text-xs text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              Chi tiết PO <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {shipments.slice(0, 4).map((s) => {
              const wh = getWarehouseBadge(s.warehouse);
              const shortage = getShortageBadge(s.shortageStatus);
              return (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{s.brand}</span>
                        <span className="text-xs px-2 py-0.5 rounded font-mono bg-white text-slate-700 border border-slate-200 font-semibold">
                          {s.poCode}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${wh.bg}`}>
                          {wh.short}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        <span className="text-slate-400">Dự án ghép: </span>
                        {s.projects.join(" • ")}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-xs font-bold text-slate-800">
                        {s.method === "Sea" ? (
                          <Anchor className="w-3.5 h-3.5 text-sky-600" />
                        ) : (
                          <Plane className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                        <span>ETA: {formatDate(s.eta)}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">PO: {formatDate(s.poDate)}</span>
                    </div>
                  </div>

                  {s.shortageStatus !== "normal" && (
                    <div className={`mt-2 p-2 rounded-lg text-xs border ${shortage.bg} flex items-start gap-1.5`}>
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <div>
                        <strong>{shortage.label}: </strong>
                        {s.shortageDetail}
                      </div>
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Trạng thái: <strong className="text-slate-800">{s.statusNote}</strong></span>
                    <span>Quy mô: <strong>{s.containers}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
