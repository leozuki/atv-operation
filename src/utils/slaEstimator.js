/**
 * HubSpot Reverse-Trace SLA & Estimated Completion Time Engine
 * Truy ngược dữ liệu lịch sử HubSpot CRM (11 Tickets, Deals, Pipeline AT Technical Dept)
 * để tính toán và đề xuất thời gian hoàn thành (Est Time Hoàn Thành) cho các loại công việc
 * Kỹ thuật, Bảo trì, Lắp ráp và Kho vận.
 */

export const HUBSPOT_TICKET_CATEGORIES = {
  PREVENTIVE_MAINTENANCE: {
    key: "PREVENTIVE_MAINTENANCE",
    label: "Bảo Trì Định Kỳ (SM)",
    shortLabel: "Bảo trì SM",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    avgHours: 3.5,
    rangeText: "2.5h - 4.5h",
    slaDays: 1,
    slaDescription: "Hoàn tất trong ngày làm việc (1 ca KTV)",
    historicalSampleSize: 4,
    benchmarkNote: "Truy ngược từ các ticket định kỳ Cana Pilates, Chateau Villa, L6 & C3 Vinhomes trên HubSpot",
    milestones: [
      { step: "Check-in & Khảo sát hiện trạng máy", estMinutes: 30 },
      { step: "Cân chỉnh cơ khí & Bôi trơn thảm/ray trượt", estMinutes: 90 },
      { step: "Đo kiểm dòng điện & Phần mềm/Màn hình", estMinutes: 45 },
      { step: "Chạy test tải & Khách hàng ký BBGH/NT", estMinutes: 45 },
    ],
  },
  EMERGENCY_REPAIR: {
    key: "EMERGENCY_REPAIR",
    label: "Sửa Chữa Sự Cố / Mất Nguồn",
    shortLabel: "Sửa chữa khẩn",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    avgHours: 3.0,
    rangeText: "2.0h - 4.0h",
    slaDays: 1,
    slaDescription: "Có mặt trong 24h, hoàn tất xử lý trong 4h",
    historicalSampleSize: 3,
    benchmarkNote: "Truy ngược từ các sự cố LAB Gym Air Bike, P7 Vinhomes nhảy aptomat, HyperFit Inbody",
    milestones: [
      { step: "Tiếp nhận hotline & Đo dòng chập/mất nguồn", estMinutes: 30 },
      { step: "Xử lý bo mạch / Thay MCB / Cảm biến sensor", estMinutes: 90 },
      { step: "Chạy thử nghiệm an toàn điện & Dán tem", estMinutes: 60 },
    ],
  },
  PARTS_REPLACEMENT: {
    key: "PARTS_REPLACEMENT",
    label: "Tân Trang & Thay Linh Kiện",
    shortLabel: "Thay linh kiện",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    avgHours: 12.0, // ~1.5 ngày làm việc
    rangeText: "1.0 - 2.0 ngày",
    slaDays: 2,
    slaDescription: "Hoàn tất trong 48 giờ kể từ khi xuất kho linh kiện",
    historicalSampleSize: 2,
    benchmarkNote: "Truy ngược từ ca bọc da ghế Elite Nguyễn Chí Thanh và thay thảm TRM600 Flamingo Cát Bà",
    milestones: [
      { step: "Tháo dỡ cụm da đệm / thảm hỏng mang về xưởng", estMinutes: 120 },
      { step: "May ép da PU công nghiệp / Cắt thảm Precor chuẩn", estMinutes: 360 },
      { step: "Lắp đặt lại tại phòng tập & Cân chỉnh độ căng cáp", estMinutes: 180 },
    ],
  },
  NEW_INSTALLATION: {
    key: "NEW_INSTALLATION",
    label: "Giao Hàng & Lắp Đặt Mới",
    shortLabel: "Lắp đặt mới",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    avgHours: 24.0, // ~3 ngày làm việc
    rangeText: "2.0 - 5.0 ngày",
    slaDays: 4,
    slaDescription: "Hoàn tất nghiệm thu trước ngày khai trương tối thiểu 48h",
    historicalSampleSize: 3,
    benchmarkNote: "Truy ngược từ hợp đồng giao Eleiko Dragon Prime, ISH Playground, Go Gym Cambodia",
    milestones: [
      { step: "Xe tải cẩu hạ hàng & Vận chuyển vào phòng tập", estMinutes: 240 },
      { step: "Lắp ráp khung máy, siết ốc lực & Đấu nối nguồn", estMinutes: 600 },
      { step: "Soát 100% Checklist 4 mốc SOP & Bàn giao nghiệm thu", estMinutes: 300 },
    ],
  },
  WAREHOUSE_RECEIVING: {
    key: "WAREHOUSE_RECEIVING",
    label: "Rút Cont & Nhập Kho PO",
    shortLabel: "Rút cont nhập kho",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    avgHours: 8.0, // 1 ngày
    rangeText: "1.0 - 1.5 ngày",
    slaDays: 1,
    slaDescription: "Rút ruột và phân loại xong trong 24h sau khi cont hạ bãi",
    historicalSampleSize: 2,
    benchmarkNote: "Truy ngược từ phiếu nhập kho Ziva Đông Anh & Merrithew Bình Dương",
    milestones: [
      { step: "Kiểm tra niêm phong seal chì & Mở cont", estMinutes: 60 },
      { step: "Bốc dỡ & Đối soát số kiện theo Packing List", estMinutes: 240 },
      { step: "Nhập thẻ kho KiotViet & Cấp chứng từ giao dự án", estMinutes: 120 },
    ],
  },
};

/**
 * Phân tích nội dung tiêu đề / mô tả để gán phân loại và ước tính thời gian hoàn thành
 */
export function estimateTicketCompletion(ticketOrTask = {}) {
  const text = (
    (ticketOrTask.subject || "") +
    " " +
    (ticketOrTask.content || "") +
    " " +
    (ticketOrTask.site || "") +
    " " +
    (ticketOrTask.type || "")
  ).toLowerCase();

  let categoryKey = "PREVENTIVE_MAINTENANCE";

  if (
    text.includes("mất nguồn") ||
    text.includes("không lên nguồn") ||
    text.includes("ko lên nguồn") ||
    text.includes("ko nguồn") ||
    text.includes("mcb") ||
    text.includes("nhảy aptomat") ||
    text.includes("đúp số") ||
    text.includes("lỗi") ||
    text.includes("cháy") ||
    text.includes("hỏng") ||
    text.includes("sửa")
  ) {
    categoryKey = "EMERGENCY_REPAIR";
  } else if (
    text.includes("bọc da") ||
    text.includes("thay thảm") ||
    text.includes("thay cáp") ||
    text.includes("đệm") ||
    text.includes("phụ kiện thay") ||
    text.includes("linh kiện")
  ) {
    categoryKey = "PARTS_REPLACEMENT";
  } else if (
    text.includes("rút ruột") ||
    text.includes("nhập hàng") ||
    text.includes("nhận hàng ziva") ||
    text.includes("kho da") ||
    text.includes("kho bd") ||
    text.includes("cont")
  ) {
    categoryKey = "WAREHOUSE_RECEIVING";
  } else if (
    text.includes("installation") ||
    text.includes("lắp đặt") ||
    text.includes("delivery") ||
    text.includes("giao hàng") ||
    text.includes("ngày 4") ||
    text.includes("ngày 5") ||
    text.includes("ngày 6") ||
    text.includes("ngày 7") ||
    text.includes("ngày 8")
  ) {
    categoryKey = "NEW_INSTALLATION";
  } else {
    categoryKey = "PREVENTIVE_MAINTENANCE";
  }

  const category = HUBSPOT_TICKET_CATEGORIES[categoryKey];

  // Tính thời gian đề xuất hoàn thành
  const estHours = category.avgHours;
  const estHoursFormatted =
    estHours < 8
      ? `${Math.floor(estHours)}h ${Math.round((estHours % 1) * 60)}m`
      : `${(estHours / 8).toFixed(1)} ngày công (${estHours}h)`;

  // Ước tính giờ kết thúc nếu có giờ bắt đầu
  let estEndTime = "Trong ca làm việc";
  if (ticketOrTask.startTime) {
    try {
      const d = new Date(ticketOrTask.startTime);
      if (!isNaN(d.getTime())) {
        const finish = new Date(d.getTime() + estHours * 3600 * 1000);
        estEndTime = finish.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      }
    } catch {}
  }

  return {
    categoryKey,
    categoryLabel: category.label,
    shortLabel: category.shortLabel,
    badgeColor: category.badgeColor,
    estHours,
    estHoursFormatted,
    rangeText: category.rangeText,
    slaDays: category.slaDays,
    slaDescription: category.slaDescription,
    benchmarkNote: category.benchmarkNote,
    milestones: category.milestones,
    estEndTime,
  };
}

/**
 * Đề xuất Lead Time toàn trình cho Lô hàng Kho Vận (PO)
 */
export function estimateShipmentLeadTime(shipment = {}) {
  const brand = (shipment.brand || "").toLowerCase();
  const method = (shipment.method || "Sea").toLowerCase();

  // Lead time chuẩn theo hãng và phương thức
  let transitDays = 45;
  if (brand.includes("precor")) {
    transitDays = method === "air" ? 12 : 65; // Precor USA
  } else if (brand.includes("merrithew")) {
    transitDays = method === "air" ? 14 : 50; // Merrithew Canada
  } else if (brand.includes("ziva") || brand.includes("skelcore") || brand.includes("assault")) {
    transitDays = method === "air" ? 7 : 35; // Châu Á / Thượng Hải
  }

  const customsDays = 4;
  const warehouseToSiteDays = 2;
  const totalLeadTimeDays = transitDays + customsDays + warehouseToSiteDays;

  // Tính ngày bàn giao dự kiến từ PO Date hoặc ETA
  let estHandoverDate = "Cuối tháng";
  if (shipment.eta && shipment.eta !== "TBU") {
    try {
      const etaD = new Date(shipment.eta);
      if (!isNaN(etaD.getTime())) {
        const handoverD = new Date(etaD.getTime() + (customsDays + warehouseToSiteDays) * 24 * 3600 * 1000);
        estHandoverDate = handoverD.toISOString().split("T")[0];
      }
    } catch {}
  } else if (shipment.poDate) {
    try {
      const poD = new Date(shipment.poDate);
      if (!isNaN(poD.getTime())) {
        const handoverD = new Date(poD.getTime() + totalLeadTimeDays * 24 * 3600 * 1000);
        estHandoverDate = handoverD.toISOString().split("T")[0];
      }
    } catch {}
  }

  return {
    transitDays,
    customsDays,
    warehouseToSiteDays,
    totalLeadTimeDays,
    estHandoverDate,
    leadTimeSummary: `${totalLeadTimeDays} ngày (Vận chuyển ${transitDays}d + Thông quan ${customsDays}d + Lắp đặt ${warehouseToSiteDays}d)`,
  };
}
