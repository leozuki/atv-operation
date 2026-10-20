export const formatCurrency = (val) => {
  if (val === undefined || val === null || isNaN(val) || val === 0) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
};

export const formatVND = formatCurrency;


export const formatShortCurrency = (val) => {
  if (!val || isNaN(val)) return "0 ₫";
  if (val >= 1000000000) {
    return `${Number((val / 1000000000).toFixed(2))} Tỷ`;
  }
  if (val >= 1000000) {
    return `${Number((val / 1000000).toFixed(1))} Tr`;
  }
  return formatCurrency(val);
};

export const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "TBU") return "TBU (Chờ xác nhận)";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const getTodayFormatted = () => {
  const now = new Date();
  return now.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getTodayISO = () => {
  return new Date().toISOString().slice(0, 10);
};

export const getWarehouseBadge = (wh) => {
  if (wh === "DA") {
    return {
      code: "DA",
      name: "Kho Đông Anh (Hà Nội)",
      short: "Kho HN (Đông Anh)",
      bg: "bg-blue-50 text-blue-700 border-blue-200 font-semibold",
    };
  }
  if (wh === "BD") {
    return {
      code: "BD",
      name: "Kho Bình Dương",
      short: "Kho Bình Dương",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
    };
  }
  return {
    code: wh,
    name: `Kho ${wh}`,
    short: `Kho ${wh}`,
    bg: "bg-slate-100 text-slate-700 border-slate-300 font-semibold",
  };
};

export const getShipmentStatusBadge = (status) => {
  switch (status) {
    case "ordering":
      return { label: "Đang đặt hàng", bg: "bg-slate-100 text-slate-700 border-slate-300" };
    case "manufacturing":
      return { label: "Đang sản xuất", bg: "bg-amber-50 text-amber-800 border-amber-300" };
    case "shipping":
      return { label: "Đang vận chuyển", bg: "bg-sky-50 text-sky-800 border-sky-300" };
    case "customs":
      return { label: "Đang làm hải quan", bg: "bg-purple-50 text-purple-800 border-purple-300" };
    case "in_warehouse":
      return { label: "Đã về kho (Nhập kho)", bg: "bg-emerald-50 text-emerald-800 border-emerald-300" };
    case "dispatched":
      return { label: "Đã xuất kho lắp đặt", bg: "bg-teal-50 text-teal-800 border-teal-300" };
    default:
      return { label: status, bg: "bg-slate-100 text-slate-700 border-slate-300" };
  }
};

export const getShortageBadge = (shortageStatus) => {
  switch (shortageStatus) {
    case "vendor_shortage":
      return {
        label: "HÃNG GIAO THIẾU",
        tag: "Hãng thiếu",
        desc: "Nhà máy đối tác đóng hàng thiếu linh kiện / phụ kiện",
        bg: "bg-rose-50 text-rose-700 border-rose-300 font-bold",
        alert: true,
      };
    case "order_shortage":
      return {
        label: "ORDER THIẾU (ĐẶT BÙ)",
        tag: "Order thiếu",
        desc: "Đơn trước nội bộ lên thiếu thiết bị, cần nhập lô bù",
        bg: "bg-orange-50 text-orange-700 border-orange-300 font-bold",
        alert: true,
      };
    default:
      return {
        label: "ĐÚNG & ĐỦ",
        tag: "Đầy đủ",
        desc: "Hàng về khớp 100% so với đơn hàng và packing list",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium",
        alert: false,
      };
  }
};

export const getProjectStageBadge = (stage) => {
  switch (stage) {
    case "design":
      return { label: "Thiết kế 2D/3D", bg: "bg-purple-50 text-purple-700 border-purple-200" };
    case "ordering":
      return { label: "Đang nhập thiết bị", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    case "site_prep":
      return { label: "Chuẩn bị mặt bằng", bg: "bg-amber-50 text-amber-800 border-amber-200" };
    case "handover_ready":
      return { label: "Bàn giao mặt bằng (Marketing)", bg: "bg-pink-50 text-pink-700 border-pink-300 font-bold", isMarketing: true };
    case "installation":
      return { label: "Đang lắp đặt máy", bg: "bg-cyan-50 text-cyan-800 border-cyan-300 font-bold", isInstall: true };
    case "accepted":
      return { label: "Đã nghiệm thu", bg: "bg-teal-50 text-teal-700 border-teal-200" };
    case "maintenance":
      return { label: "Hợp đồng bảo trì", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    default:
      return { label: stage, bg: "bg-slate-100 text-slate-700 border-slate-300" };
  }
};
