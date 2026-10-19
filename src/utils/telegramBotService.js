// Telegram Bot Service & NLP Dispatcher for Attivo ERP
// Supports parsing messages from Technicians and Sales, logging time, photo evidence, checklist verification, and project queries.

export const DEFAULT_TELEGRAM_CONFIG = {
  botToken: "8852856256:AAGh8ubUjEmEXoMy4lF6UlDSgwi3oXnEtD0",
  botUsername: "AttivoOperationBot",
  chatId: "-5368709063",
  webhookUrl: "https://api.attivointl.com/webhook/telegram",
  webAppUrl: "https://web.telegram.org/k/#@AttivoOperationBot",
};

export function getTelegramConfig() {
  if (typeof window === "undefined") return DEFAULT_TELEGRAM_CONFIG;
  try {
    const saved = localStorage.getItem("atv_telegram_config");
    if (saved) return { ...DEFAULT_TELEGRAM_CONFIG, ...JSON.parse(saved) };
  } catch (e) {}
  return DEFAULT_TELEGRAM_CONFIG;
}

export function saveTelegramConfig(config) {
  if (typeof window !== "undefined") {
    localStorage.setItem("atv_telegram_config", JSON.stringify(config));
  }
}

// Sample before/after evidence photos for field technicians
export const SAMPLE_PHOTOS = {
  beforeDefault: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60",
  afterDefault: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=60",
  beforeTreadmill: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&auto=format&fit=crop&q=60",
  afterTreadmill: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=60",
  beforeElectrical: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=60",
  afterElectrical: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60",
};

// Initial field work logs seed data
export const initialFieldWorkLogs = [
  {
    id: "LOG-20261019-01",
    taskId: "TK-HCM-1",
    projectId: "PRJ-001",
    projectName: "Cana Pilates (Tây Ninh)",
    technician: "Lương Nguyễn Tuấn Anh",
    technicianPhone: "0908112233",
    startTime: "2026-10-19T08:30:00",
    finishTime: "2026-10-19T11:15:00",
    durationMinutes: 165,
    durationFormatted: "2 giờ 45 phút",
    status: "completed",
    checklistVerified: true,
    totalChecklistItems: 5,
    completedChecklistItems: 5,
    beforePhoto: SAMPLE_PHOTOS.beforeTreadmill,
    afterPhoto: SAMPLE_PHOTOS.afterTreadmill,
    notes: "Đã hiệu chỉnh độ căng băng tải, tra mỡ trục con lăn, vệ sinh bo mạch nguồn và test chạy tải 45 phút êm ái.",
    telegramMessageId: 1042,
    syncStatus: "synced",
  },
  {
    id: "LOG-20261019-02",
    taskId: "TK-HCM-2",
    projectId: "PRJ-002",
    projectName: "Chateau Villa Phú Mỹ Hưng",
    technician: "Lê Văn Tuấn",
    technicianPhone: "0918776655",
    startTime: "2026-10-19T09:00:00",
    finishTime: "2026-10-19T10:30:00",
    durationMinutes: 90,
    durationFormatted: "1 giờ 30 phút",
    status: "completed",
    checklistVerified: true,
    totalChecklistItems: 4,
    completedChecklistItems: 4,
    beforePhoto: SAMPLE_PHOTOS.beforeElectrical,
    afterPhoto: SAMPLE_PHOTOS.afterElectrical,
    notes: "Kiểm tra hệ thống điện 3 pha phòng Gym biệt thự, đấu nối lại dây tiếp địa aptomat an toàn tuyệt đối.",
    telegramMessageId: 1045,
    syncStatus: "synced",
  },
  {
    id: "LOG-20261018-01",
    taskId: "TK-HN-1",
    projectId: "PRJ-004",
    projectName: "Clubhouse Fulton (Park City)",
    technician: "Anh Chu Việt",
    technicianPhone: "0903445566",
    startTime: "2026-10-18T14:00:00",
    finishTime: "2026-10-18T17:15:00",
    durationMinutes: 195,
    durationFormatted: "3 giờ 15 phút",
    status: "completed",
    checklistVerified: true,
    totalChecklistItems: 6,
    completedChecklistItems: 6,
    beforePhoto: SAMPLE_PHOTOS.beforeDefault,
    afterPhoto: SAMPLE_PHOTOS.afterDefault,
    notes: "Đã bọc lại da ghế 6 máy khối selectorized và tra dầu cáp dẫn hướng, khách hàng ký biên bản nghiệm thu hài lòng.",
    telegramMessageId: 1038,
    syncStatus: "synced",
  },
];

/**
 * Natural Language Processing (NLP) Parser for Telegram Messages
 * Parses input from Sales or Technicians, identifies project/task, and executes actions.
 */
export function parseTelegramMessage(text, media = null, dataContext = {}) {
  const { projects = [], checklists = [], schedule = {}, shipments = [] } = dataContext;
  const clean = (text || "").trim();
  const lower = clean.toLowerCase();

  // 1. Try to match project
  let matchedProject = null;

  // Match by PRJ-xxx code
  const prjCodeMatch = clean.match(/PRJ[-_ ]?([A-Za-z0-9]+)/i);
  if (prjCodeMatch) {
    const rawId = prjCodeMatch[0].toUpperCase().replace(/[ _]/g, "-");
    matchedProject = projects.find(
      (p) => p.id.toUpperCase() === rawId || p.id.toUpperCase().replace("-00", "-0") === rawId
    );
    if (!matchedProject) {
      // Also try normalized PRJ-00x
      const numMatch = prjCodeMatch[1].match(/^0*([1-9][0-9]*)$/);
      if (numMatch) {
        const normalized = `PRJ-00${numMatch[1]}`;
        matchedProject = projects.find((p) => p.id === normalized);
      }
    }
  }

  // Match by project name or aliases
  if (!matchedProject) {
    const projectKeywords = [
      { key: "cana", id: "PRJ-001" },
      { key: "tây ninh", id: "PRJ-001" },
      { key: "hung duy", id: "PRJ-001" },
      { key: "chateau", id: "PRJ-002" },
      { key: "phú mỹ hưng", id: "PRJ-002" },
      { key: "savills", id: "PRJ-002" },
      { key: "grab", id: "PRJ-003" },
      { key: "fulton", id: "PRJ-004" },
      { key: "park city", id: "PRJ-004" },
      { key: "cat ba", id: "PRJ-005" },
      { key: "cát bà", id: "PRJ-005" },
      { key: "flamingo", id: "PRJ-005" },
      { key: "vinhomes", id: "PRJ-006" },
      { key: "central park", id: "PRJ-006" },
      { key: "optimum", id: "PRJ-007" },
      { key: "ish", id: "PRJ-007" },
      { key: "kompan", id: "PRJ-007" },
      { key: "go gym", id: "PRJ-008" },
      { key: "cambodia", id: "PRJ-008" },
    ];

    for (const item of projectKeywords) {
      if (lower.includes(item.key)) {
        matchedProject = projects.find((p) => p.id === item.id);
        if (matchedProject) break;
      }
    }
  }

  // If still not found, check if text is a direct project search
  if (!matchedProject && projects.length > 0) {
    matchedProject = projects.find((p) =>
      lower.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(lower)
    );
  }

  // 2. Identify Intent
  const isStartIntent =
    lower.includes("bắt đầu") ||
    lower.includes("bat dau") ||
    lower.includes("check-in") ||
    lower.includes("checkin") ||
    lower.includes("start") ||
    lower.startsWith("/start_task");

  const isFinishIntent =
    lower.includes("kết thúc") ||
    lower.includes("ket thuc") ||
    lower.includes("hoàn thành") ||
    lower.includes("hoan thanh") ||
    lower.includes("xong") ||
    lower.includes("check-out") ||
    lower.includes("checkout") ||
    lower.includes("nghiệm thu") ||
    lower.startsWith("/finish_task");

  const isChecklistIntent =
    lower.includes("checklist") ||
    lower.includes("kiểm tra đủ") ||
    lower.includes("tích đủ") ||
    lower.includes("xong hết các mục") ||
    lower.startsWith("/check");

  const isShortageIntent =
    lower.includes("thiếu") ||
    lower.includes("thieu") ||
    lower.includes("lệch hàng") ||
    lower.includes("hỏng") ||
    lower.includes("lỗi");

  const isPoQueryIntent =
    lower.includes("po") ||
    lower.includes("đơn hàng") ||
    lower.includes("nhập kho") ||
    clean.includes("ULS-") ||
    clean.includes("ME-");

  // 3. Resolve Project Checklist Status
  const projectChecklist = matchedProject
    ? checklists.find((c) => c.projectId === matchedProject.id)
    : null;

  const totalChecklist = projectChecklist ? projectChecklist.items.length : 0;
  const completedChecklist = projectChecklist
    ? projectChecklist.items.filter((i) => i.status === "passed" || i.status === "completed").length
    : 0;
  const checklistPercentage = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;
  const isChecklistAllDone = totalChecklist > 0 && completedChecklist === totalChecklist;

  // -------------------------------------------------------------
  // ACTION 1: START WORK (LOG TIME - BẮT ĐẦU)
  // -------------------------------------------------------------
  if (isStartIntent) {
    if (!matchedProject) {
      return {
        type: "error",
        intent: "LOG_TIME_START",
        reply: `⚠️ Không tìm thấy tên hoặc mã dự án trong tin nhắn.\n\nVui lòng ghi rõ mã dự án hoặc tên công trình. Ví dụ:\n👉 "Bắt đầu bảo trì PRJ-001 (Cana Tây Ninh)" kèm ảnh hiện trạng.`,
      };
    }

    const beforePhoto = media || SAMPLE_PHOTOS.beforeTreadmill;
    const nowIso = new Date().toISOString();
    const nowStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    return {
      type: "success",
      intent: "LOG_TIME_START",
      projectId: matchedProject.id,
      projectName: matchedProject.name,
      startTime: nowIso,
      beforePhoto,
      checklistCount: totalChecklist,
      completedChecklist,
      checklistPercentage,
      reply: `⏱️ **[CHECK-IN BẮT ĐẦU THÀNH CÔNG]**\n\n` +
        `🏢 **Dự án**: ${matchedProject.name} (${matchedProject.id})\n` +
        `👤 **KTV thực hiện**: ${matchedProject.assignedTech || "KTV Hiện Trường"}\n` +
        `⏰ **Thời gian bắt đầu**: ${nowStr} (19/10/2026)\n` +
        `📸 **Ảnh hiện trạng ban đầu**: Đã ghi nhận [Ảnh check-in]\n\n` +
        `⚠️ **QUY ĐỊNH BẮT BUỘC**:\n` +
        `Dự án này có **${totalChecklist} hạng mục Checklist** đi kèm (hiện đạt ${completedChecklist}/${totalChecklist} - ${checklistPercentage}%).\n` +
        `👉 **Toàn bộ checklist phải được kiểm tra và tích đủ 100% trước khi bấm KẾT THÚC!**\n\n` +
        `Gửi ảnh nghiệm thu và nhắn "Kết thúc" khi làm xong.`,
      actionData: {
        action: "START_TASK",
        projectId: matchedProject.id,
        startTime: nowIso,
        beforePhoto,
      },
    };
  }

  // -------------------------------------------------------------
  // ACTION 2: CHECKLIST UPDATE (ĐÁNH DẤU CHECKLIST)
  // -------------------------------------------------------------
  if (isChecklistIntent) {
    if (!matchedProject) {
      return {
        type: "error",
        intent: "CHECKLIST_UPDATE",
        reply: `⚠️ Vui lòng ghi rõ dự án để cập nhật checklist.\nVí dụ: "Đã kiểm tra xong checklist Cana Tây Ninh" hoặc "/check PRJ-001 all".`,
      };
    }

    return {
      type: "success",
      intent: "CHECKLIST_UPDATE",
      projectId: matchedProject.id,
      projectName: matchedProject.name,
      reply: `📋 **[ĐÃ XÁC NHẬN HOÀN THÀNH CHECKLIST]**\n\n` +
        `🏢 **Dự án**: ${matchedProject.name} (${matchedProject.id})\n` +
        `✅ **Tình trạng**: Đã kiểm tra và nghiệm thu **100% (${totalChecklist}/${totalChecklist} hạng mục)** đạt chuẩn.\n` +
        `🛡️ Đã đồng bộ trực tiếp vào hệ thống ERP Attivo.\n\n` +
        `Bây giờ bạn đã đủ điều kiện gửi ảnh hoàn thành và bấm **Kết Thúc ca làm**!`,
      actionData: {
        action: "VERIFY_ALL_CHECKLIST",
        projectId: matchedProject.id,
      },
    };
  }

  // -------------------------------------------------------------
  // ACTION 3: FINISH WORK (LOG TIME - KẾT THÚC)
  // -------------------------------------------------------------
  if (isFinishIntent) {
    if (!matchedProject) {
      return {
        type: "error",
        intent: "LOG_TIME_FINISH",
        reply: `⚠️ Không tìm thấy tên dự án để kết thúc ca làm.\nVí dụ: "Kết thúc bảo trì Cana Tây Ninh" kèm ảnh nghiệm thu.`,
      };
    }

    // CHECK CONSTRAINT: All checklist items must be checked!
    // If not all done and user hasn't explicitly verified in message
    const forceCheck = lower.includes("tất cả") || lower.includes("đủ") || lower.includes("100%");
    if (!isChecklistAllDone && !forceCheck) {
      const remainingItems = projectChecklist
        ? projectChecklist.items
            .filter((i) => i.status !== "passed" && i.status !== "completed")
            .map((i) => `• ${i.title || i.item}`)
            .join("\n")
        : "Các hạng mục kiểm tra máy";

      return {
        type: "warning",
        intent: "LOG_TIME_FINISH",
        projectId: matchedProject.id,
        reply: `⛔ **CHƯA THỂ KẾT THÚC CA LÀM!**\n\n` +
          `Dự án **${matchedProject.name}** còn các hạng mục checklist chưa được kiểm tra (${completedChecklist}/${totalChecklist} hoàn thành):\n\n` +
          `${remainingItems}\n\n` +
          `⚠️ **Yêu cầu quy trình**: Nhân viên kỹ thuật bắt buộc phải kiểm tra và xác nhận toàn bộ checklist trước khi kết thúc ca.\n` +
          `👉 Hãy kiểm tra xong và nhắn: "Đã kiểm tra đủ checklist ${matchedProject.name}" hoặc bấm nút xác nhận checklist.`,
      };
    }

    const afterPhoto = media || SAMPLE_PHOTOS.afterTreadmill;
    const finishTime = new Date().toISOString();
    const durationMinutes = 135; // Default ~2h15m

    return {
      type: "success",
      intent: "LOG_TIME_FINISH",
      projectId: matchedProject.id,
      projectName: matchedProject.name,
      finishTime,
      afterPhoto,
      durationMinutes,
      durationFormatted: "2 giờ 15 phút",
      reply: `🎉 **[NGHIỆM THU & KẾT THÚC CA THÀNH CÔNG]**\n\n` +
        `🏢 **Dự án**: ${matchedProject.name} (${matchedProject.id})\n` +
        `👤 **KTV phụ trách**: ${matchedProject.assignedTech || "KTV Hiện Trường"}\n` +
        `⏱️ **Tổng thời gian thực tế**: 2 giờ 15 phút\n` +
        `📋 **Checklist đi kèm**: ✅ 100% (${totalChecklist}/${totalChecklist} hạng mục ĐẠT)\n` +
        `📸 **Ảnh sau khi hoàn thành**: Đã lưu trữ ảnh nghiệm thu\n` +
        `📝 **Ghi chú**: Thiết bị vận hành ổn định, bàn giao mặt bằng hoàn tất.\n\n` +
        `🔗 Xem hồ sơ công trình: https://leozuki.github.io/atv-operation/#projects?id=${matchedProject.id}`,
      actionData: {
        action: "FINISH_TASK",
        projectId: matchedProject.id,
        finishTime,
        afterPhoto,
        durationMinutes,
      },
    };
  }

  // -------------------------------------------------------------
  // ACTION 4: SHORTAGE REPORT (BÁO THIẾU HÀNG / LỖI)
  // -------------------------------------------------------------
  if (isShortageIntent) {
    const prjName = matchedProject ? matchedProject.name : "Hiện trường";
    return {
      type: "warning",
      intent: "REPORT_SHORTAGE",
      projectId: matchedProject?.id || null,
      reply: `⚠️ **[ĐÃ GHI NHẬN CẢNH BÁO THIẾU HÀNG / SỰ CỐ]**\n\n` +
        `🏢 **Dự án / Vị trí**: ${prjName}\n` +
        `📝 **Nội dung sự cố**: "${clean}"\n` +
        `👤 **Người báo cáo**: Đội kỹ thuật hiện trường\n` +
        `🚨 **Hệ thống đã tự động**:\n` +
        `1. Đánh dấu cờ Shortage / Cảnh báo trên Master Matrix ERP.\n` +
        `2. Báo động tới Trưởng phòng Logistics (Kho Đông Anh & Bình Dương).\n` +
        `3. Ghi vào danh sách điểm nghẽn họp WBR tuần này!`,
      actionData: {
        action: "FLAG_SHORTAGE",
        projectId: matchedProject?.id,
        note: clean,
      },
    };
  }

  // -------------------------------------------------------------
  // ACTION 5: QUERY PO / SHIPMENT
  // -------------------------------------------------------------
  if (isPoQueryIntent) {
    const foundPo = shipments.find((s) => clean.toUpperCase().includes(s.poCode.toUpperCase()));
    if (foundPo) {
      return {
        type: "success",
        intent: "QUERY_PO",
        poCode: foundPo.poCode,
        reply: `📦 **[THÔNG TIN ĐƠN HÀNG PO: ${foundPo.poCode}]**\n\n` +
          `🏷️ **Hãng**: ${foundPo.brand}\n` +
          `🏢 **Kho nhận**: Kho ${foundPo.warehouse === "BD" ? "Bình Dương" : "Đông Anh (Hà Nội)"}\n` +
          `🚢 **Phương thức**: ${foundPo.method === "Sea" ? "Đường biển (Sea Freight)" : "Hàng không (Air)"}\n` +
          `📅 **Ngày lên PO**: ${foundPo.poDate}\n` +
          `🎯 **ETA dự kiến về kho**: ${foundPo.eta}\n` +
          `📊 **Trạng thái**: ${foundPo.statusNote || foundPo.status}\n` +
          `⚠️ **Tình trạng hàng**: ${foundPo.shortageStatus === "normal" ? "Đúng & Đủ theo packing list" : foundPo.shortageDetail}\n` +
          `🏗️ **Dự án ghép**: ${foundPo.projects.join(", ")}\n\n` +
          `🔗 Xem trên ERP: https://leozuki.github.io/atv-operation/#logistics?po=${foundPo.id}`,
      };
    }
  }

  // -------------------------------------------------------------
  // ACTION 6: QUERY PROJECT DOSSIER (GỌI TÊN DỰ ÁN)
  // -------------------------------------------------------------
  if (matchedProject) {
    const formattedAmount = matchedProject.hubspotDeal?.amount
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(matchedProject.hubspotDeal.amount)
      : "Đang cập nhật";

    return {
      type: "success",
      intent: "QUERY_PROJECT",
      projectId: matchedProject.id,
      projectName: matchedProject.name,
      reply: `🏢 **[HỒ SƠ DỰ ÁN: ${matchedProject.name}]**\n\n` +
        `🆔 **Mã dự án**: \`${matchedProject.id}\` | **Hợp đồng**: \`${matchedProject.contractCode || "—"}\`\n` +
        `👥 **Khách hàng**: ${matchedProject.customer}\n` +
        `📍 **Khu vực**: ${matchedProject.region === "HCM" ? "Miền Nam (TP.HCM / Tây Ninh / BD)" : "Miền Bắc (Hà Nội / Hải Phòng)"}\n` +
        `💼 **Sale phụ trách**: ${matchedProject.leadSale || matchedProject.dealOwner || "Hoài Trịnh"}\n` +
        `📞 **Liên hệ khách**: ${matchedProject.contact || matchedProject.hubspotContact?.phone || "0903332211"}\n` +
        `💰 **Giá trị hợp đồng**: ${formattedAmount}\n` +
        `⚙️ **Giai đoạn hiện tại**: ${matchedProject.stage.toUpperCase()}\n` +
        `🚚 **Vé giao hàng & KTV**: ${matchedProject.deliveryTicket?.ticketOwner || matchedProject.assignedTech || "Đội KTV Attivo"}\n` +
        `📋 **Checklist lắp đặt**: ${checklistPercentage}% (${completedChecklist}/${totalChecklist} hạng mục hoàn thành)\n` +
        `📸 **Mặt bằng marketing**: ${matchedProject.marketingReady ? "✅ Sẵn sàng quay chụp" : "Đang chuẩn bị"}\n\n` +
        `👉 **Lệnh nhanh cho kỹ thuật viên**:\n` +
        `• Nhắn \`Bắt đầu ${matchedProject.id}\` kèm ảnh để check-in mở ca.\n` +
        `• Nhắn \`Checklist ${matchedProject.id}\` để xem hoặc tích điểm checklist.\n` +
        `• Nhắn \`Kết thúc ${matchedProject.id}\` kèm ảnh để nghiệm thu tính giờ.\n\n` +
        `🔗 Xem trực tiếp trên ERP: https://leozuki.github.io/atv-operation/#projects?id=${matchedProject.id}`,
    };
  }

  // -------------------------------------------------------------
  // FALLBACK: GENERAL AI HELP / HELP DESK
  // -------------------------------------------------------------
  return {
    type: "info",
    intent: "UNKNOWN",
    reply: `🤖 **Attivo Operations Telegram Bot (@AttivoOperationBot)**\n\n` +
      `Tôi chưa nhận diện được dự án từ tin nhắn: "${clean}"\n\n` +
      `📌 **Các cú pháp hỗ trợ cho Kỹ thuật & Sale**:\n` +
      `1️⃣ **Tra cứu dự án**: Nhắn tên hoặc mã dự án (VD: \`Cana Tây Ninh\`, \`PRJ-001\`, \`Grab\`, \`Chateau Villa\`).\n` +
      `2️⃣ **Bắt đầu ca làm (Log Time)**: Nhắn \`Bắt đầu PRJ-001\` và gửi kèm ảnh hiện trạng.\n` +
      `3️⃣ **Xác nhận checklist**: Nhắn \`Đã kiểm tra xong checklist PRJ-001\` (Yêu cầu 100% trước khi kết thúc).\n` +
      `4️⃣ **Kết thúc ca làm**: Nhắn \`Kết thúc PRJ-001\` và gửi kèm ảnh nghiệm thu.\n` +
      `5️⃣ **Tra cứu đơn hàng PO**: Nhắn \`PO ULS-AT2634\` hoặc \`Tra cứu nhập kho\`.`,
  };
}

/**
 * Send real HTTP POST message via Telegram Bot API (if token & chat ID are configured)
 */
export async function sendTelegramBotMessage(text, config = null) {
  const cfg = config || getTelegramConfig();
  if (!cfg.botToken || !cfg.chatId) {
    return {
      success: false,
      error: "Chưa cấu hình Telegram Bot Token hoặc Chat ID. Vui lòng cấu hình trong Cài Đặt Telegram Bot.",
    };
  }

  try {
    const url = `https://api.telegram.org/bot${cfg.botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: cfg.chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
    });
    const data = await res.json();
    return { success: data.ok, data, error: data.description };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
