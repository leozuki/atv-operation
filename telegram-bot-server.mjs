// Standalone Autonomous Telegram Bot Server for Attivo ERP
// Full support for Long Polling, Inline Keyboards, Callback Queries, Photo Evidence, 100% Checklist Verification, and Time Logging.
// Run with: node telegram-bot-server.mjs (or npm run bot)

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path for shared state
const DB_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DB_DIR, "telegram-bot-db.json");

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Default Bot Configuration
const DEFAULT_CONFIG = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || "",
  botUsername: "AttivoOperationBot",
  chatId: process.env.TELEGRAM_CHAT_ID || "",
  erpBaseUrl: "https://leozuki.github.io/atv-operation",
};

// Load or initialize DB state
function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    } catch (e) {
      console.error("[DB] Error reading DB, using default:", e.message);
    }
  }

  const initialDb = {
    config: DEFAULT_CONFIG,
    activeSessions: {}, // userId -> { projectId, taskId, startTime, beforePhoto, beforeFileId }
    fieldWorkLogs: [
      {
        id: "LOG-20261019-01",
        taskId: "TK-HCM-1",
        projectId: "PRJ-001",
        projectName: "Cana Pilates (Tây Ninh)",
        technician: "Trần Hữu Thắng",
        startTime: "2026-10-19T08:30:00",
        finishTime: "2026-10-19T11:15:00",
        durationFormatted: "2 giờ 45 phút",
        durationMinutes: 165,
        status: "completed",
        checklistVerified: true,
        completedChecklistItems: 5,
        totalChecklistItems: 5,
        notes: "Đã hiệu chỉnh độ căng băng tải, tra mỡ trục con lăn, vệ sinh bo mạch nguồn và test chạy tải 45 phút êm ái.",
      },
    ],
    projectsChecklists: {
      "PRJ-001": [
        { id: "c1", title: "Kiểm tra nguồn điện 3 pha & aptomat chống giật", checked: true },
        { id: "c2", title: "Cân chỉnh thảm chạy & tra silicon trục con lăn", checked: true },
        { id: "c3", title: "Kiểm tra cơ cấu khung máy và ốc siết chân đế", checked: true },
        { id: "c4", title: "Vệ sinh bo mạch inverter & cảm biến nhịp tim", checked: true },
        { id: "c5", title: "Chạy thử tải thực tế 30 phút, kiểm tra độ ồn", checked: true },
      ],
      "PRJ-002": [
        { id: "c1", title: "Khảo sát mặt bằng & đường dây cấp nguồn biệt thự", checked: true },
        { id: "c2", title: "Lắp đặt dàn máy Selectorized theo bản vẽ 2D/3D", checked: true },
        { id: "c3", title: "Cân chỉnh dây cáp ròng rọc chịu lực 1000kg", checked: false },
        { id: "c4", title: "Lau dầu dưỡng đệm da ghế mút đúc PU cao cấp", checked: false },
      ],
      "PRJ-003": [
        { id: "c1", title: "Kiểm đếm phụ kiện tạ Ziva & thảm Paviflex", checked: true },
        { id: "c2", title: "Lắp đặt giá để tạ Dumbbell 2 tầng chắc chắn", checked: true },
        { id: "c3", title: "Test đồng hồ hiển thị calo & nhịp tim máy cardio", checked: true },
      ],
      "PRJ-004": [
        { id: "c1", title: "Kiểm tra sàn cao su chống ồn khu Free Weight", checked: true },
        { id: "c2", title: "Bọc lại da ghế 6 máy khối selectorized", checked: true },
        { id: "c3", title: "Vệ sinh máy khối & dán decal hướng dẫn bài tập", checked: true },
        { id: "c4", title: "Kiểm tra độ rung lắc máy chạy bộ ở tốc độ 18km/h", checked: true },
      ],
    },
  };

  saveDb(initialDb);
  return initialDb;
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("[DB] Error writing DB:", e.message);
  }
}

let db = loadDb();

// -------------------------------------------------------------
// TELEGRAM BOT API CLIENT
// -------------------------------------------------------------
async function telegramApi(method, payload = {}) {
  const token = db.config.botToken;
  if (!token) {
    throw new Error("Chưa có TELEGRAM_BOT_TOKEN! Vui lòng cấu hình token.");
  }

  const url = `https://api.telegram.org/bot${token}/${method}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!json.ok) {
    throw new Error(`Telegram API Error: ${json.description || "Unknown error"}`);
  }
  return json.result;
}

// Send formatted message with inline keyboard
async function sendMessage(chatId, text, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    disable_web_page_preview: false,
  };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  return telegramApi("sendMessage", payload);
}

// Edit existing message text & markup (for smooth inline button clicks)
async function editMessageText(chatId, messageId, text, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "Markdown",
  };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  return telegramApi("editMessageText", payload);
}

// Answer callback query (removes loading spinner on button)
async function answerCallbackQuery(callbackQueryId, text = null, showAlert = false) {
  const payload = { callback_query_id: callbackQueryId };
  if (text) {
    payload.text = text;
    payload.show_alert = showAlert;
  }
  return telegramApi("answerCallbackQuery", payload);
}

// -------------------------------------------------------------
// MENU GENERATORS
// -------------------------------------------------------------
function getMainMenuMarkup() {
  return {
    inline_keyboard: [
      [
        { text: "🏢 Tra Cứu Dự Án", callback_data: "menu_projects" },
        { text: "📦 Tra Cứu PO Nhập Kho", callback_data: "menu_pos" },
      ],
      [
        { text: "⏱️ Bắt Đầu Ca (Check-in)", callback_data: "menu_start_prompt" },
        { text: "📋 Kiểm Tra Checklist", callback_data: "menu_checklist_prompt" },
      ],
      [
        { text: "✅ Kết Thúc & Nghiệm Thu", callback_data: "menu_finish_prompt" },
        { text: "📊 Nhật Ký Giờ Làm", callback_data: "menu_worklogs" },
      ],
      [
        { text: "🌐 Mở Attivo ERP (Trực Tuyến)", url: db.config.erpBaseUrl || "https://leozuki.github.io/atv-operation/" },
      ],
    ],
  };
}

const PROJECTS_DATA = [
  { id: "PRJ-001", name: "Cana Pilates (Tây Ninh)", client: "Hung Duy Group", tech: "Trần Hữu Thắng", value: "1,346,558,100 đ", phone: "0327794884", stage: "Bảo trì & Lắp đặt" },
  { id: "PRJ-002", name: "Chateau Villa Phú Mỹ Hưng", client: "Savills Vietnam", tech: "Lê Văn Tuấn", value: "741,078,000 đ", phone: "0896206010", stage: "Đang lắp đặt" },
  { id: "PRJ-003", name: "Grab Vietnam Gym", client: "Grab Vietnam Limited", tech: "KTV HCM", value: "220,000,000 đ", phone: "0908877665", stage: "Bàn giao mặt bằng" },
  { id: "PRJ-004", name: "Clubhouse Fulton (Park City)", client: "BQL Fulton Hà Nội", tech: "Anh Chu Việt", value: "1,500,000,000 đ", phone: "0912345678", stage: "Đang lắp đặt" },
  { id: "PRJ-005", name: "Flamingo Cát Bà Resort", client: "Flamingo Holding Group", tech: "Quang Nguyễn", value: "33,077,202 đ", phone: "0987654321", stage: "Bảo dưỡng định kỳ" },
  { id: "PRJ-006", name: "Vinhomes Central Park L6 & C3", client: "Ban Quản Trị Vinhomes", tech: "Đội Bảo Trì HCM", value: "9,015,300 đ", phone: "0903332211", stage: "Xử lý nguồn điện" },
  { id: "PRJ-007", name: "Optimum Hospitality (ISH)", client: "Optimum Hospitality", tech: "Nam Văn", value: "450,000,000 đ", phone: "0934567890", stage: "Đang đặt hàng" },
  { id: "PRJ-008", name: "Go Gym Cambodia", client: "Go Gym Co., Ltd", tech: "KTV Quốc tế", value: "799,000,000 đ", phone: "+85523888999", stage: "Tender báo giá" },
];

function getProjectsListMarkup(actionPrefix = "view_prj") {
  const buttons = PROJECTS_DATA.map((p) => [
    { text: `${p.id}: ${p.name.slice(0, 26)}`, callback_data: `${actionPrefix}:${p.id}` },
  ]);
  buttons.push([{ text: "« Quay lại Menu chính", callback_data: "menu_main" }]);
  return { inline_keyboard: buttons };
}

function getProjectDetailMarkup(projectId) {
  return {
    inline_keyboard: [
      [
        { text: "⏱️ Bắt Đầu Ca (Check-in)", callback_data: `start_task:${projectId}` },
        { text: "📋 Xem Checklist", callback_data: `view_chk:${projectId}` },
      ],
      [
        { text: "✅ Kết Thúc & Nghiệm Thu", callback_data: `finish_task:${projectId}` },
      ],
      [
        { text: "🔗 Mở Trang Dự Án Trên ERP", url: `${db.config.erpBaseUrl}/#projects?id=${projectId}` },
      ],
      [
        { text: "« Chọn dự án khác", callback_data: "menu_projects" },
        { text: "« Menu chính", callback_data: "menu_main" },
      ],
    ],
  };
}

function getChecklistMarkup(projectId) {
  const items = db.projectsChecklists[projectId] || [
    { id: "c1", title: "Kiểm tra nguồn điện & aptomat", checked: false },
    { id: "c2", title: "Kiểm tra cơ cấu cơ khí và ốc siết", checked: false },
    { id: "c3", title: "Chạy thử máy 30 phút", checked: false },
  ];

  const total = items.length;
  const passed = items.filter((i) => i.checked).length;
  const isAllDone = total > 0 && passed === total;

  const buttons = items.map((item, idx) => [
    {
      text: `${item.checked ? "✅ [ĐẠT]" : "⬜ [CHƯA]"} ${item.title.slice(0, 30)}`,
      callback_data: `toggle_chk:${projectId}:${idx}`,
    },
  ]);

  if (!isAllDone) {
    buttons.push([
      { text: "⚡ Đánh dấu đạt 100% tất cả", callback_data: `check_all:${projectId}` },
    ]);
  }

  buttons.push([
    { text: "✅ Nghiệm Thu & Kết Thúc Ca", callback_data: `finish_task:${projectId}` },
  ]);
  buttons.push([
    { text: `« Về dự án ${projectId}`, callback_data: `view_prj:${projectId}` },
  ]);

  return {
    markup: { inline_keyboard: buttons },
    total,
    passed,
    isAllDone,
    percentage: Math.round((passed / total) * 100),
  };
}

// -------------------------------------------------------------
// EVENT HANDLERS
// -------------------------------------------------------------

// Handle /start and text messages
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.first_name || msg.from.username || "Nhân sự Attivo";
  const text = msg.text ? msg.text.trim() : "";
  const caption = msg.caption ? msg.caption.trim() : "";
  const combinedText = (text + " " + caption).trim();
  const lower = combinedText.toLowerCase();

  console.log(`[MSG] From ${userName} (${userId}): "${combinedText}" (Photo: ${!!msg.photo})`);

  // Handle Photo Evidence
  if (msg.photo && msg.photo.length > 0) {
    const highestPhoto = msg.photo[msg.photo.length - 1];
    const fileId = highestPhoto.file_id;

    // Check if user has an active ca
    const active = db.activeSessions[userId];
    if (active) {
      if (!active.beforePhoto) {
        // Save as beforePhoto
        active.beforePhoto = fileId;
        active.beforeTime = new Date().toISOString();
        saveDb(db);

        const prj = PROJECTS_DATA.find((p) => p.id === active.projectId);
        await sendMessage(
          chatId,
          `📸 **[ĐÃ LƯU ẢNH HIỆN TRẠNG BẮT ĐẦU]**\n\n` +
            `🏢 **Dự án**: ${prj?.name || active.projectId}\n` +
            `👤 **KTV**: ${userName}\n` +
            `⏰ **Thời gian**: ${new Date().toLocaleTimeString("vi-VN")}\n\n` +
            `⚠️ **BƯỚC TIẾP THEO BẮT BUỘC**:\n` +
            `Bạn phải kiểm tra và xác nhận **100% Checklist** của công trình trước khi kết thúc ca!\n\n` +
            `Bấm nút dưới đây để xem và tích các hạng mục:`,
          {
            inline_keyboard: [
              [{ text: "📋 Mở Bảng Checklist Dự Án", callback_data: `view_chk:${active.projectId}` }],
            ],
          }
        );
        return;
      } else {
        // User sends second photo -> Photo after
        const chkStatus = getChecklistMarkup(active.projectId);
        if (!chkStatus.isAllDone) {
          await sendMessage(
            chatId,
            `⛔ **CHƯA THỂ KẾT THÚC CA LÀM!**\n\n` +
              `Hệ thống đã nhận ảnh của bạn, nhưng dự án **${active.projectId}** vẫn còn hạng mục checklist chưa được kiểm tra (${chkStatus.passed}/${chkStatus.total} đạt - ${chkStatus.percentage}%).\n\n` +
              `👉 **Quy định**: Phải kiểm tra và tích đủ 100% checklist trước khi nghiệm thu!`,
            {
              inline_keyboard: [
                [{ text: "📋 Kiểm tra & Tích đủ Checklist", callback_data: `view_chk:${active.projectId}` }],
              ],
            }
          );
          return;
        }

        // Checklist 100% -> Complete Ca!
        const start = new Date(active.startTime);
        const finish = new Date();
        const diffMs = finish - start;
        const diffMins = Math.max(30, Math.floor(diffMs / (1000 * 60)));
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        const durationFormatted = `${hours > 0 ? `${hours} giờ ` : ""}${mins} phút`;

        const prj = PROJECTS_DATA.find((p) => p.id === active.projectId);
        const newLog = {
          id: `LOG-${Date.now().toString().slice(-6)}`,
          taskId: active.taskId || "TK-FIELD",
          projectId: active.projectId,
          projectName: prj?.name || active.projectId,
          technician: userName,
          startTime: active.startTime,
          finishTime: finish.toISOString(),
          durationMinutes: diffMins,
          durationFormatted,
          status: "completed",
          checklistVerified: true,
          totalChecklistItems: chkStatus.total,
          completedChecklistItems: chkStatus.passed,
          beforePhotoFileId: active.beforePhoto,
          afterPhotoFileId: fileId,
          notes: caption || "Bảo trì thiết bị hoàn tất, nghiệm thu bàn giao qua Telegram Bot.",
        };

        db.fieldWorkLogs.unshift(newLog);
        delete db.activeSessions[userId];
        saveDb(db);

        await sendMessage(
          chatId,
          `🎉 **[BIÊN BẢN NGHIỆM THU CA LÀM THÀNH CÔNG]**\n\n` +
            `🏢 **Dự án**: ${newLog.projectName} (${newLog.projectId})\n` +
            `👤 **Kỹ thuật viên**: ${userName}\n` +
            `⏱️ **Tổng thời gian làm việc (Log Time)**: **${durationFormatted}**\n` +
            `📋 **Checklist kỹ thuật**: ✅ 100% (${chkStatus.total}/${chkStatus.total} hạng mục ĐẠT)\n` +
            `📸 **Bằng chứng ảnh**: Đã lưu đủ ảnh Trước & Sau nghiệm thu\n` +
            `📝 **Ghi chú**: ${newLog.notes}\n\n` +
            `🛡️ Dữ liệu đã đồng bộ tức thì vào hệ thống Attivo ERP!`,
          {
            inline_keyboard: [
              [{ text: "🌐 Xem Hồ Sơ Trên ERP", url: `${db.config.erpBaseUrl}/#projects?id=${newLog.projectId}` }],
              [{ text: "« Về Menu chính", callback_data: "menu_main" }],
            ],
          }
        );
        return;
      }
    } else {
      await sendMessage(
        chatId,
        `📸 Đã nhận ảnh từ bạn. Để liên kết ảnh này với dự án, vui lòng chọn dự án bắt đầu ca:`,
        getProjectsListMarkup("start_task")
      );
      return;
    }
  }

  // Handle Commands
  if (text === "/start" || text === "/help" || lower === "menu") {
    await sendMessage(
      chatId,
      `👋 **Kính chào ${userName}!**\n\n` +
        `Tôi là **Attivo Operations Telegram Bot (@${db.config.botUsername})**.\n\n` +
        `🤖 **Các tính năng tự động**:\n` +
        `1. **Tra cứu dự án**: Nhắn tên hoặc mã (VD: \`Cana Tây Ninh\`, \`PRJ-001\`, \`Grab\`).\n` +
        `2. **Log Time KTV**: Bắt đầu ca > Chụp ảnh check-in > Tích 100% checklist > Chụp ảnh nghiệm thu kết thúc.\n` +
        `3. **Tra cứu PO**: Nhắn mã PO (VD: \`PO ULS-AT2634\`).\n\n` +
        `👇 Vui lòng chọn một tùy chọn dưới đây để thao tác nhanh:`,
      getMainMenuMarkup()
    );
    return;
  }

  if (text === "/duan" || text === "/project" || lower === "dự án") {
    await sendMessage(chatId, `🏢 **DANH SÁCH 8 CÔNG TRÌNH DỰ ÁN ATTIVO:**\n\nChọn một dự án để xem chi tiết hoặc thực hiện ca làm:`, getProjectsListMarkup("view_prj"));
    return;
  }

  // Check if text refers to a project
  const prjMatch = PROJECTS_DATA.find(
    (p) =>
      lower.includes(p.id.toLowerCase()) ||
      lower.includes(p.name.toLowerCase()) ||
      lower.includes(p.client.toLowerCase()) ||
      (lower.includes("cana") && p.id === "PRJ-001") ||
      (lower.includes("chateau") && p.id === "PRJ-002") ||
      (lower.includes("grab") && p.id === "PRJ-003") ||
      (lower.includes("fulton") && p.id === "PRJ-004") ||
      (lower.includes("cát bà") && p.id === "PRJ-005") ||
      (lower.includes("vinhomes") && p.id === "PRJ-006") ||
      (lower.includes("optimum") && p.id === "PRJ-007") ||
      (lower.includes("cambodia") && p.id === "PRJ-008")
  );

  if (prjMatch) {
    // If text has "bắt đầu"
    if (lower.includes("bắt đầu") || lower.includes("bat dau") || lower.includes("check-in")) {
      db.activeSessions[userId] = {
        projectId: prjMatch.id,
        taskId: `TK-${Date.now().toString().slice(-4)}`,
        startTime: new Date().toISOString(),
        technician: userName,
      };
      saveDb(db);

      await sendMessage(
        chatId,
        `⏱️ **[ĐÃ CHECK-IN MỞ CA: ${prjMatch.name}]**\n\n` +
          `👤 **KTV**: ${userName}\n` +
          `⏰ **Giờ bắt đầu**: ${new Date().toLocaleTimeString("vi-VN")}\n\n` +
          `📸 **BƯỚC 1**: Vui lòng chụp và gửi ngay **1 ảnh hiện trạng ban đầu** của máy/mặt bằng vào đây!\n\n` +
          `📋 **BƯỚC 2**: Kiểm tra và tích đủ 100% checklist theo link bên dưới trước khi kết thúc:`,
        {
          inline_keyboard: [
            [{ text: "📋 Kiểm tra Checklist Dự Án", callback_data: `view_chk:${prjMatch.id}` }],
          ],
        }
      );
      return;
    }

    // Default: Display project dossier
    const chk = getChecklistMarkup(prjMatch.id);
    await sendMessage(
      chatId,
      `🏢 **[HỒ SƠ CÔNG TRÌNH: ${prjMatch.name}]**\n\n` +
        `🆔 **Mã dự án**: \`${prjMatch.id}\`\n` +
        `👥 **Khách hàng**: ${prjMatch.client}\n` +
        `📞 **Điện thoại**: ${prjMatch.phone}\n` +
        `💰 **Giá trị hợp đồng**: ${prjMatch.value}\n` +
        `⚙️ **Giai đoạn**: ${prjMatch.stage}\n` +
        `👤 **KTV phụ trách**: ${prjMatch.tech}\n` +
        `📋 **Tiến độ Checklist**: ${chk.passed}/${chk.total} Đạt (${chk.percentage}%)\n\n` +
        `Chọn hành động bên dưới:`,
      getProjectDetailMarkup(prjMatch.id)
    );
    return;
  }

  // Handle PO queries
  if (lower.includes("po") || lower.includes("đơn hàng") || clean.includes("ULS-") || clean.includes("ME-")) {
    await sendMessage(
      chatId,
      `📦 **[TRA CỨU ĐƠN HÀNG PO NHẬP KHO]**\n\n` +
        `• **ULS-AT2634** (Precor/Ziva/Eleiko/Concept2) ➔ Kho Đông Anh (HN), ETA: 20/10/2026\n` +
        `• **ULS-AT2633** (Precor/Ziva) ➔ Kho Bình Dương, ETA: 20/10/2026\n` +
        `• **ULS-AT2629** (Vita) ➔ Kho Đông Anh, ETA: 20/10/2026\n` +
        `• **ME-AT2602** (Merrithew) ➔ Đã cập kho Bình Dương 15/10/2026\n\n` +
        `🔗 Chi tiết tại ERP: ${db.config.erpBaseUrl}/#logistics`,
      {
        inline_keyboard: [
          [{ text: "🌐 Xem Tab Kho Vận ERP", url: `${db.config.erpBaseUrl}/#logistics` }],
          [{ text: "« Menu chính", callback_data: "menu_main" }],
        ],
      }
    );
    return;
  }

  // Fallback
  await sendMessage(
    chatId,
    `🤖 Tôi đã nhận tin nhắn: "${text}".\n\nBạn có thể nhắn tên dự án (VD: \`Cana Tây Ninh\`, \`PRJ-001\`) để tra cứu thông tin hoặc chọn menu dưới:`,
    getMainMenuMarkup()
  );
}

// Handle Callback Queries (Button clicks in Telegram)
async function handleCallbackQuery(cq) {
  const callbackId = cq.id;
  const chatId = cq.message.chat.id;
  const messageId = cq.message.message_id;
  const userId = cq.from.id;
  const userName = cq.from.first_name || cq.from.username || "Kỹ thuật viên";
  const data = cq.data || "";

  console.log(`[CALLBACK] From ${userName}: data="${data}"`);

  // Main menu
  if (data === "menu_main") {
    await answerCallbackQuery(callbackId);
    await editMessageText(chatId, messageId, `🤖 **ATTIVO OPERATIONS BOT (@${db.config.botUsername})**\n\nVui lòng chọn chức năng:`, getMainMenuMarkup());
    return;
  }

  if (data === "menu_projects") {
    await answerCallbackQuery(callbackId);
    await editMessageText(chatId, messageId, `🏢 **DANH SÁCH 8 CÔNG TRÌNH DỰ ÁN ATTIVO:**\n\nChọn một dự án để xem hồ sơ và bắt đầu ca:`, getProjectsListMarkup("view_prj"));
    return;
  }

  if (data === "menu_start_prompt") {
    await answerCallbackQuery(callbackId);
    await editMessageText(chatId, messageId, `⏱️ **BẮT ĐẦU CA LÀM (CHECK-IN HIỆN TRƯỜNG):**\n\nChọn dự án bạn đang có mặt để mở ca và chụp ảnh hiện trạng:`, getProjectsListMarkup("start_task"));
    return;
  }

  if (data === "menu_checklist_prompt") {
    await answerCallbackQuery(callbackId);
    await editMessageText(chatId, messageId, `📋 **KIỂM TRA CHECKLIST KỸ THUẬT (BẮT BUỘC 100%):**\n\nChọn dự án để xem hoặc đánh dấu các hạng mục đạt chuẩn:`, getProjectsListMarkup("view_chk"));
    return;
  }

  if (data === "menu_finish_prompt") {
    await answerCallbackQuery(callbackId);
    await editMessageText(chatId, messageId, `✅ **NGHIỆM THU & KẾT THÚC CA LÀM:**\n\nChọn dự án bạn vừa hoàn thành công việc:`, getProjectsListMarkup("finish_task"));
    return;
  }

  if (data === "menu_worklogs") {
    await answerCallbackQuery(callbackId);
    const logsText = db.fieldWorkLogs
      .slice(0, 5)
      .map(
        (l) =>
          `• **${l.projectName}** (${l.durationFormatted})\n  KTV: ${l.technician} • Checklist: ${l.completedChecklistItems}/${l.totalChecklistItems} Đạt`
      )
      .join("\n\n");

    await editMessageText(
      chatId,
      messageId,
      `📊 **NHẬT KÝ CA LÀM GẦN NHẤT:**\n\n${logsText || "Chưa có log mới."}\n\n🔗 Xem toàn bộ trên ERP: ${db.config.erpBaseUrl}/#telegram`,
      {
        inline_keyboard: [
          [{ text: "🌐 Xem Tất Cả Trên ERP", url: `${db.config.erpBaseUrl}/#telegram` }],
          [{ text: "« Menu chính", callback_data: "menu_main" }],
        ],
      }
    );
    return;
  }

  if (data === "menu_pos") {
    await answerCallbackQuery(callbackId);
    await editMessageText(
      chatId,
      messageId,
      `📦 **TIẾN ĐỘ ĐƠN HÀNG PO NHẬP KHO (TUẦN 19/10/2026):**\n\n` +
        `• **ULS-AT2634** (Precor/Ziva/Eleiko): Kho Đông Anh (HN), ETA: 20/10\n` +
        `• **ULS-AT2633** (Precor/Ziva): Kho Bình Dương, ETA: 20/10\n` +
        `• **ULS-AT2629** (Vita): Kho Đông Anh, ETA: 20/10\n` +
        `• **ME-AT2602** (Merrithew): Đã cập kho Bình Dương 15/10 hoàn tất`,
      {
        inline_keyboard: [
          [{ text: "🌐 Mở Tab Vận Chuyển ERP", url: `${db.config.erpBaseUrl}/#logistics` }],
          [{ text: "« Menu chính", callback_data: "menu_main" }],
        ],
      }
    );
    return;
  }

  // View Project Detail
  if (data.startsWith("view_prj:")) {
    const prjId = data.split(":")[1];
    const prj = PROJECTS_DATA.find((p) => p.id === prjId);
    if (!prj) {
      await answerCallbackQuery(callbackId, "Dự án không tồn tại!", true);
      return;
    }

    const chk = getChecklistMarkup(prjId);
    await answerCallbackQuery(callbackId);
    await editMessageText(
      chatId,
      messageId,
      `🏢 **[HỒ SƠ CÔNG TRÌNH: ${prj.name}]**\n\n` +
        `🆔 **Mã dự án**: \`${prj.id}\`\n` +
        `👥 **Khách hàng**: ${prj.client}\n` +
        `📞 **Điện thoại**: ${prj.phone}\n` +
        `💰 **Giá trị hợp đồng**: ${prj.value}\n` +
        `⚙️ **Giai đoạn**: ${prj.stage}\n` +
        `👤 **KTV phụ trách**: ${prj.tech}\n` +
        `📋 **Checklist**: ${chk.passed}/${chk.total} Đạt (${chk.percentage}%)\n\n` +
        `Chọn hành động bên dưới:`,
      getProjectDetailMarkup(prjId)
    );
    return;
  }

  // Start Task (Check-in)
  if (data.startsWith("start_task:")) {
    const prjId = data.split(":")[1];
    const prj = PROJECTS_DATA.find((p) => p.id === prjId);

    db.activeSessions[userId] = {
      projectId: prjId,
      taskId: `TK-${Date.now().toString().slice(-4)}`,
      startTime: new Date().toISOString(),
      technician: userName,
      beforePhoto: null,
    };
    saveDb(db);

    await answerCallbackQuery(callbackId, "Đã mở ca làm việc thành công!");
    await editMessageText(
      chatId,
      messageId,
      `⏱️ **[ĐÃ CHECK-IN MỞ CA: ${prj?.name || prjId}]**\n\n` +
        `👤 **KTV**: ${userName}\n` +
        `⏰ **Giờ bắt đầu**: ${new Date().toLocaleTimeString("vi-VN")}\n\n` +
        `📸 **YÊU CẦU 1**: Chụp và gửi **1 ảnh hiện trạng ban đầu** (máy/mặt bằng) vào khung chat này!\n\n` +
        `📋 **YÊU CẦU 2**: Toàn bộ checklist phải được kiểm tra và tích đủ 100% trước khi kết thúc ca.`,
      {
        inline_keyboard: [
          [{ text: "📋 Kiểm tra Checklist Ngay", callback_data: `view_chk:${prjId}` }],
          [{ text: "« Về menu chính", callback_data: "menu_main" }],
        ],
      }
    );
    return;
  }

  // View Checklist
  if (data.startsWith("view_chk:")) {
    const prjId = data.split(":")[1];
    const prj = PROJECTS_DATA.find((p) => p.id === prjId);
    const chk = getChecklistMarkup(prjId);

    await answerCallbackQuery(callbackId);
    await editMessageText(
      chatId,
      messageId,
      `📋 **[CHECKLIST KỸ THUẬT: ${prj?.name || prjId}]**\n\n` +
        `Tiến độ: **${chk.passed}/${chk.total} Đạt (${chk.percentage}%)**\n` +
        `${chk.isAllDone ? "🎉 **ĐÃ ĐẠT 100% ĐIỀU KIỆN NGHIỆM THU!**" : "⚠️ **Bắt buộc tích đủ 100% trước khi kết thúc ca.**"}\n\n` +
        `Bấm vào từng dòng dưới để đánh dấu đạt:`,
      chk.markup
    );
    return;
  }

  // Toggle single checklist item
  if (data.startsWith("toggle_chk:")) {
    const [, prjId, itemIdxStr] = data.split(":");
    const idx = parseInt(itemIdxStr, 10);
    const items = db.projectsChecklists[prjId];
    if (items && items[idx]) {
      items[idx].checked = !items[idx].checked;
      saveDb(db);
    }

    const prj = PROJECTS_DATA.find((p) => p.id === prjId);
    const chk = getChecklistMarkup(prjId);
    await answerCallbackQuery(callbackId, `Đã cập nhật mục ${idx + 1}`);
    await editMessageText(
      chatId,
      messageId,
      `📋 **[CHECKLIST KỸ THUẬT: ${prj?.name || prjId}]**\n\n` +
        `Tiến độ: **${chk.passed}/${chk.total} Đạt (${chk.percentage}%)**\n` +
        `${chk.isAllDone ? "🎉 **ĐÃ ĐẠT 100% ĐIỀU KIỆN NGHIỆM THU!**" : "⚠️ **Bắt buộc tích đủ 100% trước khi kết thúc ca.**"}\n\n` +
        `Bấm vào từng dòng dưới để đánh dấu đạt:`,
      chk.markup
    );
    return;
  }

  // Check all checklist items
  if (data.startsWith("check_all:")) {
    const prjId = data.split(":")[1];
    const items = db.projectsChecklists[prjId];
    if (items) {
      items.forEach((i) => (i.checked = true));
      saveDb(db);
    }

    const prj = PROJECTS_DATA.find((p) => p.id === prjId);
    const chk = getChecklistMarkup(prjId);
    await answerCallbackQuery(callbackId, "Đã xác nhận đạt 100% checklist!");
    await editMessageText(
      chatId,
      messageId,
      `🎉 **[ĐÃ XÁC NHẬN ĐẠT 100% CHECKLIST: ${prj?.name || prjId}]**\n\n` +
        `Tất cả ${chk.total}/${chk.total} hạng mục kỹ thuật đã được nghiệm thu đạt chuẩn!\n\n` +
        `Bây giờ KTV hãy chụp và gửi **Ảnh nghiệm thu hoàn thành** vào chat để kết thúc ca và tính tổng giờ làm.`,
      {
        inline_keyboard: [
          [{ text: "✅ Kết Thúc Ca Làm Việc", callback_data: `finish_task:${prjId}` }],
          [{ text: `« Xem lại checklist`, callback_data: `view_chk:${prjId}` }],
        ],
      }
    );
    return;
  }

  // Finish Task
  if (data.startsWith("finish_task:")) {
    const prjId = data.split(":")[1];
    const chk = getChecklistMarkup(prjId);

    // Validate 100% checklist
    if (!chk.isAllDone) {
      await answerCallbackQuery(
        callbackId,
        `⛔ Chưa đủ 100% checklist! Còn ${chk.total - chk.passed} mục chưa kiểm tra.`,
        true
      );
      return;
    }

    // Prompt user to send photo
    await answerCallbackQuery(callbackId);
    await editMessageText(
      chatId,
      messageId,
      `📸 **[BƯỚC CUỐI: GỬI ẢNH NGHIỆM THU HOÀN THÀNH]**\n\n` +
        `Checklist dự án **${prjId}** đã đạt chuẩn 100%!\n\n` +
        `👉 Kỹ thuật viên hãy **chụp và gửi 1 ảnh nghiệm thu thực tế** (máy móc hoạt động, bàn giao cho khách) vào khung chat này để hoàn tất ca và tính tổng giờ làm việc.`,
      {
        inline_keyboard: [
          [{ text: "« Quay lại", callback_data: `view_prj:${prjId}` }],
        ],
      }
    );
    return;
  }
}

// -------------------------------------------------------------
// LONG POLLING LOOP
// -------------------------------------------------------------
let isPolling = false;
let pollingOffset = 0;

async function runPollingLoop() {
  if (isPolling) return;
  isPolling = true;
  console.log(`[BOT] Starting Telegram Long Polling loop for @${db.config.botUsername}...`);

  while (isPolling) {
    if (!db.config.botToken) {
      console.log("[BOT] No botToken found. Sleeping 5s. Set token in data/telegram-bot-db.json or TELEGRAM_BOT_TOKEN");
      await new Promise((r) => setTimeout(r, 5000));
      db = loadDb();
      continue;
    }

    try {
      const url = `https://api.telegram.org/bot${db.config.botToken}/getUpdates?offset=${pollingOffset}&timeout=20`;
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      const json = await res.json();

      if (json.ok && Array.isArray(json.result)) {
        for (const update of json.result) {
          pollingOffset = update.update_id + 1;

          if (update.message) {
            await handleMessage(update.message);
          } else if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
          }
        }
      } else if (!json.ok) {
        console.error("[BOT] Polling error response:", json.description);
        await new Promise((r) => setTimeout(r, 5000));
      }
    } catch (err) {
      if (err.name !== "TimeoutError") {
        console.error("[BOT] Polling network error:", err.message);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

// -------------------------------------------------------------
// EMBEDDED HTTP SERVER (PORT 3001)
// -------------------------------------------------------------
const HTTP_PORT = process.env.PORT || 3001;

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health check & status
  if (url.pathname === "/health" || url.pathname === "/api/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "online",
        botUsername: db.config.botUsername,
        hasToken: !!db.config.botToken,
        activeSessions: Object.keys(db.activeSessions).length,
        totalLogs: db.fieldWorkLogs.length,
        uptime: process.uptime(),
      })
    );
    return;
  }

  // Get or update config
  if (url.pathname === "/api/config") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(db.config));
      return;
    }
    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const newCfg = JSON.parse(body);
          db.config = { ...db.config, ...newCfg };
          saveDb(db);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, config: db.config }));
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
      return;
    }
  }

  // Get field work logs
  if (url.pathname === "/api/logs") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(db.fieldWorkLogs));
    return;
  }

  // Send message via bot
  if (url.pathname === "/api/send" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { text, chatId, replyMarkup } = JSON.parse(body);
        const targetChat = chatId || db.config.chatId;
        const result = await sendMessage(targetChat, text, replyMarkup);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, result }));
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // Webhook receiver
  if (url.pathname === "/webhook" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const update = JSON.parse(body);
        if (update.message) await handleMessage(update.message);
        if (update.callback_query) await handleCallbackQuery(update.callback_query);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(HTTP_PORT, () => {
  console.log(`=======================================================`);
  console.log(`🤖 ATTIVO TELEGRAM BOT DAEMON RUNNING ON PORT ${HTTP_PORT}`);
  console.log(`👉 Webhook URL: http://localhost:${HTTP_PORT}/webhook`);
  console.log(`👉 API Status:  http://localhost:${HTTP_PORT}/api/status`);
  console.log(`=======================================================`);
});

// Run long polling in background
runPollingLoop();
