import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Camera,
  Clock,
  ExternalLink,
  Bot,
  User,
  Settings,
  Check,
  RefreshCw,
  ShieldCheck,
  Copy,
  ChevronRight,
  Sparkles,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import {
  getTelegramConfig,
  saveTelegramConfig,
  getZaloConfig,
  saveZaloConfig,
  parseTelegramMessage,
  initialFieldWorkLogs,
  SAMPLE_PHOTOS,
  sendTelegramBotMessage,
  sendZaloBotMessage,
} from "../utils/telegramBotService";
import { copyToClipboard } from "../utils/navigation";

export default function TelegramBotHub({
  projects = [],
  setProjects,
  checklists = [],
  setChecklists,
  schedule = {},
  _setSchedule,
  shipments = [],
  onNavigateTab,
  showToast,
}) {
  const [activeTab, setActiveTab] = useState("simulator"); // "simulator" | "zalo" | "logs" | "settings"
  const [telegramConfig, setTelegramConfig] = useState(getTelegramConfig);
  const [zaloConfig, setZaloConfig] = useState(getZaloConfig);
  const [zaloTestChatId, setZaloTestChatId] = useState(() => getZaloConfig().chatId || "");
  const [zaloTestText, setZaloTestText] = useState(
    "🔔 [ATTIVO ERP - BÁO CÁO HIỆN TRƯỜNG]\n\nĐội Kỹ thuật thông báo: Dự án Cana Pilates (PRJ-001) đã hoàn tất nghiệm thu và kiểm tra đủ 100% checklist kỹ thuật."
  );
  const [zaloSendStatus, setZaloSendStatus] = useState(null);
  const [isSendingZalo, setIsSendingZalo] = useState(false);
  const [workLogs, setWorkLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("atv_field_work_logs");
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialFieldWorkLogs;
  });

  // Chat simulator state
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      time: "08:15",
      text: `👋 **Xin chào Đội Kỹ Thuật & Sales Attivo!**\n\nTôi là **Attivo Operations Bot (@AttivoOperationBot)**.\n\nNhắn tin bất kỳ lúc nào để:\n• 🔍 **Tra cứu dự án**: Nhắn tên hoặc mã (VD: \`Cana Tây Ninh\`, \`PRJ-001\`, \`Grab\`).\n• ⏱️ **Bắt đầu ca làm (Log Time)**: Nhắn \`Bắt đầu PRJ-001\` kèm ảnh check-in.\n• 📋 **Xác nhận Checklist**: Nhắn \`Checklist PRJ-001\` (Bắt buộc kiểm đủ 100%).\n• ✅ **Kết thúc ca & Nghiệm thu**: Nhắn \`Kết thúc PRJ-001\` kèm ảnh hoàn thành.\n• 📦 **Tra cứu đơn hàng**: Nhắn \`PO ULS-AT2634\`.`,
    },
    {
      id: 2,
      sender: "user",
      userName: "Lương Nguyễn Tuấn Anh (KTV HCM)",
      time: "08:30",
      text: "Bắt đầu bảo trì máy chạy bộ tại Cana Tây Ninh PRJ-001",
      photo: SAMPLE_PHOTOS.beforeTreadmill,
    },
    {
      id: 3,
      sender: "bot",
      time: "08:30",
      text: `⏱️ **[CHECK-IN BẮT ĐẦU THÀNH CÔNG]**\n\n🏢 **Dự án**: Cana Pilates (Tây Ninh) (PRJ-001)\n👤 **KTV thực hiện**: Lương Nguyễn Tuấn Anh\n⏰ **Thời gian bắt đầu**: 08:30 (19/10/2026)\n📸 **Ảnh hiện trạng ban đầu**: Đã lưu trữ [Ảnh check-in]\n\n⚠️ **QUY ĐỊNH BẮT BUỘC**:\nDự án này có **5 hạng mục Checklist** đi kèm.\n👉 **Toàn bộ checklist phải được kiểm tra và tích đủ 100% trước khi bấm KẾT THÚC!**`,
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [senderName, setSenderName] = useState("Lương Nguyễn Tuấn Anh (KTV)");
  const [testApiStatus, setTestApiStatus] = useState(null);
  const [isSendingApi, setIsSendingApi] = useState(false);
  const [previewPhotoModal, setPreviewPhotoModal] = useState(null);
  const chatBottomRef = useRef(null);

  const [serverStatus, setServerStatus] = useState({ online: false, checking: true, data: null });
  const [isBrowserPolling, setIsBrowserPolling] = useState(false);
  const [pollingOffset, setPollingOffset] = useState(0);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (activeTab === "simulator" && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  // Persist work logs
  useEffect(() => {
    localStorage.setItem("atv_field_work_logs", JSON.stringify(workLogs));
  }, [workLogs]);

  // Check Node Bot Daemon server status on port 3001
  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/status", { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setServerStatus({ online: true, checking: false, data });
          return;
        }
      } catch {}
      if (isMounted) setServerStatus({ online: false, checking: false, data: null });
    };

    checkServer();
    const interval = setInterval(checkServer, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // In-Browser Live Telegram Poller (Works on GitHub Pages without requiring a backend server)
  useEffect(() => {
    if (!isBrowserPolling || !telegramConfig.botToken) return;

    let active = true;
    let currentOffset = pollingOffset;

    const pollUpdates = async () => {
      if (!active) return;
      try {
        const res = await fetch(
          `https://api.telegram.org/bot${telegramConfig.botToken}/getUpdates?offset=${currentOffset}&timeout=5`,
          { signal: AbortSignal.timeout(10000) }
        );
        const data = await res.json();
        if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
          for (const update of data.result) {
            currentOffset = update.update_id + 1;
            setPollingOffset(currentOffset);

            if (update.message) {
              const fromUser =
                update.message.from?.first_name || update.message.from?.username || "Kỹ thuật viên";
              const text = update.message.text || update.message.caption || "";
              const photo = update.message.photo ? SAMPLE_PHOTOS.beforeTreadmill : null;

              // Append incoming user message
              const incomingMsg = {
                id: Date.now() + Math.random(),
                sender: "user",
                userName: `${fromUser} (Telegram Real)`,
                time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                text,
                photo,
              };
              setMessages((prev) => [...prev, incomingMsg]);

              // Process NLP & reply
              const result = parseTelegramMessage(text, photo, { projects, checklists, schedule, shipments });
              const botReply = {
                id: Date.now() + Math.random() + 1,
                sender: "bot",
                time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                text: result.reply,
              };
              setMessages((prev) => [...prev, botReply]);

              // Send response back to Telegram chat
              const targetChat = update.message.chat?.id || telegramConfig.chatId;
              if (targetChat) {
                await sendTelegramBotMessage(result.reply, { ...telegramConfig, chatId: targetChat });
              }
            }
          }
        }
      } catch {
        // Quiet catch for network errors
      }

      if (active) {
        setTimeout(pollUpdates, 3500);
      }
    };

    pollUpdates();
    return () => {
      active = false;
    };
  }, [isBrowserPolling, telegramConfig.botToken, pollingOffset, projects, checklists, schedule, shipments]);

  // Handle sending message in simulator
  const handleSendMessage = (e, quickText = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const textToSend = quickText || inputMessage;
    if (!textToSend.trim() && !selectedPhoto) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    const userMsg = {
      id: Date.now(),
      sender: "user",
      userName: senderName,
      time: timeStr,
      text: textToSend,
      photo: selectedPhoto,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    const photoAttached = selectedPhoto;
    setSelectedPhoto(null);

    // Process with NLP engine
    setTimeout(() => {
      const result = parseTelegramMessage(textToSend, photoAttached, {
        projects,
        checklists,
        schedule,
        shipments,
      });

      const botReply = {
        id: Date.now() + 1,
        sender: "bot",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        text: result.reply,
        type: result.type,
        actionData: result.actionData,
      };

      setMessages((prev) => [...prev, botReply]);

      // Execute data side-effects
      if (result.actionData) {
        // Log time start
        if (result.actionData.action === "START_TASK") {
          const prj = projects.find((p) => p.id === result.actionData.projectId);
          if (showToast) showToast(`Telegram Bot: KTV đã check-in bắt đầu tại ${prj?.name || "công trình"}`);
        }

        // Verify checklist
        if (result.actionData.action === "VERIFY_ALL_CHECKLIST") {
          if (setChecklists) {
            setChecklists((prev) =>
              prev.map((c) => {
                if (c.projectId === result.actionData.projectId) {
                  return {
                    ...c,
                    status: "completed",
                    progress: 100,
                    items: c.items.map((i) => ({ ...i, status: "passed" })),
                  };
                }
                return c;
              })
            );
          }
          if (showToast) showToast("Telegram Bot: Đã xác nhận đạt 100% checklist kỹ thuật!");
        }

        // Finish task
        if (result.actionData.action === "FINISH_TASK") {
          const prj = projects.find((p) => p.id === result.actionData.projectId);
          const newLog = {
            id: `LOG-${Date.now().toString().slice(-6)}`,
            taskId: `TK-${Date.now().toString().slice(-4)}`,
            projectId: result.actionData.projectId,
            projectName: prj?.name || "Dự án Attivo",
            technician: senderName.split("(")[0].trim(),
            technicianPhone: "0908112233",
            startTime: new Date(Date.now() - 135 * 60 * 1000).toISOString(),
            finishTime: result.actionData.finishTime,
            durationMinutes: result.actionData.durationMinutes,
            durationFormatted: "2 giờ 15 phút",
            status: "completed",
            checklistVerified: true,
            totalChecklistItems: 5,
            completedChecklistItems: 5,
            beforePhoto: SAMPLE_PHOTOS.beforeTreadmill,
            afterPhoto: result.actionData.afterPhoto || SAMPLE_PHOTOS.afterTreadmill,
            notes: "Thiết bị vận hành ổn định, bàn giao mặt bằng hoàn tất qua Telegram Bot.",
            telegramMessageId: Date.now(),
            syncStatus: "synced",
          };

          setWorkLogs((prev) => [newLog, ...prev]);

          if (showToast) {
            showToast(`Telegram Bot: Nghiệm thu thành công ca làm (2h 15m) tại ${prj?.name}`);
          }
        }
      }
    }, 450);
  };

  // Quick Action Buttons
  const quickActions = [
    { label: "🔍 Tra cứu: Cana Tây Ninh", text: "Cana Tây Ninh" },
    { label: "🔍 Tra cứu: Dự án Grab", text: "Dự án Grab PRJ-003" },
    { label: "⏱️ Bắt đầu ca (Check-in)", text: "Bắt đầu bảo trì PRJ-001 Cana Tây Ninh" },
    { label: "📋 Xác nhận đủ Checklist", text: "Đã kiểm tra xong tất cả checklist PRJ-001" },
    { label: "✅ Kết thúc ca (Nghiệm thu)", text: "Kết thúc bảo trì PRJ-001 Cana Tây Ninh, bàn giao khách hàng" },
    { label: "📦 Tra cứu PO: ULS-AT2634", text: "PO ULS-AT2634" },
    { label: "⚠️ Báo thiếu linh kiện", text: "Báo thiếu 2 đĩa tạ 10kg Ziva tại công trình Cana" },
  ];

  // Save Settings
  const handleSaveSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    saveTelegramConfig(telegramConfig);
    // If local Node daemon is running, sync config to daemon as well
    if (serverStatus.online) {
      try {
        await fetch("http://localhost:3001/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(telegramConfig),
        });
      } catch {}
    }
    if (showToast) showToast("Đã lưu cấu hình kết nối Telegram Bot!");
  };

  // Test real Telegram Bot API
  const handleTestRealTelegram = async () => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      alert("Vui lòng nhập Bot Token và Chat ID trước khi gửi thử nghiệm!");
      return;
    }

    setIsSendingApi(true);
    setTestApiStatus(null);

    const testText =
      `🔔 **[ATTIVO ERP - TEST TELEGRAM BOT]**\n\n` +
      `Hệ thống điều hành Attivo ERP đã kết nối thành công với Telegram Bot!\n` +
      `⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}\n` +
      `🌐 Web: https://leozuki.github.io/atv-operation/\n\n` +
      `Sẵn sàng nhận log time, ảnh hiện trường và cập nhật task từ Kỹ thuật & Sale.`;

    const res = await sendTelegramBotMessage(testText, telegramConfig);
    setIsSendingApi(false);

    if (res.success) {
      setTestApiStatus({ ok: true, msg: "Gửi tin nhắn thử nghiệm thành công tới Telegram thật!" });
      if (showToast) showToast("Đã gửi tin nhắn thật tới Telegram thành công!");
    } else {
      setTestApiStatus({ ok: false, msg: res.error || "Gửi thất bại. Vui lòng kiểm tra Token & Chat ID." });
    }
  };

  // Save Zalo Settings
  const handleSaveZaloSettings = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    saveZaloConfig(zaloConfig);
    if (showToast) showToast("Đã lưu cấu hình kết nối Zalo Bot!");
  };

  // Test real Zalo Bot HTTP API
  const handleTestRealZalo = async () => {
    if (!zaloConfig.botToken) {
      alert("Vui lòng nhập Zalo Bot Token trước khi gửi!");
      return;
    }
    setIsSendingZalo(true);
    setZaloSendStatus(null);
    const res = await sendZaloBotMessage(zaloTestText, {
      ...zaloConfig,
      chatId: zaloTestChatId || zaloConfig.chatId,
    });
    setIsSendingZalo(false);
    if (res.success) {
      setZaloSendStatus({ ok: true, msg: "Gửi tin nhắn thành công qua Zalo Bot HTTP API!" });
      if (showToast) showToast("Đã gửi tin nhắn qua Zalo Bot thành công!");
    } else {
      setZaloSendStatus({
        ok: false,
        msg: res.error || "Gửi thất bại. Vui lòng đảm bảo người nhận/nhóm đã nhắn tin cho bot trên Zalo để kích hoạt chat_id.",
      });
    }
  };

  // 1-Click Simulated Zalo Report directly into ERP
  const handleSimulateZaloReport = (projectName, projectId, techName = "Lương Nguyễn Tuấn Anh (KTV)") => {
    const newLog = {
      id: `LOG-ZL-${Date.now().toString().slice(-4)}`,
      projectId,
      projectName,
      techName: `${techName} (qua Zalo Bot)`,
      startTime: "08:00 (19/10/2026)",
      endTime: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      durationHours: 3.5,
      checklistComplete: true,
      photoBefore: SAMPLE_PHOTOS.beforeTreadmill,
      photoAfter: SAMPLE_PHOTOS.afterTreadmill,
      notes: `Đã nghiệm thu và bàn giao ${projectName}. Đạt 100% checklist kỹ thuật. Báo cáo tự động qua Zalo Bot (Bot Leo làm việc).`,
      source: "zalo_bot",
    };

    setWorkLogs((prev) => [newLog, ...prev]);

    if (setProjects && projects.length > 0) {
      setProjects((prevPrjs) =>
        prevPrjs.map((p) =>
          p.id === projectId
            ? { ...p, stage: "completed", checklistComplete: true, checklistProgress: 100 }
            : p
        )
      );
    }

    if (showToast) {
      showToast(`[ZALO BOT] KTV đã gửi báo cáo hoàn tất dự án ${projectName} lên hệ thống!`);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-blue-500/20">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-900">
                Bot Báo Cáo Đa Kênh: Telegram (@{telegramConfig.botUsername}) & Zalo ({zaloConfig.botName || "Bot Leo làm việc"})
              </h2>

              {/* Node Server Daemon Status */}
              {serverStatus.online ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5" title="Daemon Node.js đang chạy trên cổng 3001">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Daemon Port 3001: Telegram & Zalo Online
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium flex items-center gap-1.5" title="Chạy npm run bot để kích hoạt Daemon nền">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Bot Server: Sẵn sàng (npm run bot)
                </span>
              )}

              {/* In-Browser Poller Status */}
              {isBrowserPolling ? (
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                  Live Web Polling Đang Bật
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Đa Kênh Sẵn Sàng
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kỹ thuật & Sale nhắn tin vào Telegram hoặc Zalo: Tự động phân tích dự án, log time bắt đầu &gt; chụp ảnh hiện trạng &gt; xác nhận 100% checklist &gt; kết thúc ca và bắn thông báo lên ERP.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("zalo")}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Kênh Zalo Bot</span>
          </button>

          <a
            href="https://zalo.me/s/botcreator/"
            target="_blank"
            rel="noopener noreferrer"
            title="Quản lý Bot tại Zalo Bot Creator"
            className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
            <span>Zalo Bot Creator</span>
          </a>

          <a
            href="https://web.telegram.org/k/#@AttivoOperationBot"
            target="_blank"
            rel="noopener noreferrer"
            title="Dành cho người dùng Telegram"
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Telegram Web K</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "simulator"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Telegram Web Bot (@{telegramConfig.botUsername})</span>
        </button>

        <button
          onClick={() => setActiveTab("zalo")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "zalo"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Zalo Bot ({zaloConfig.botName || "Bot Leo làm việc"})</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "logs"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Nhật Ký Hiện Trường & Giờ Làm ({workLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "settings"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Cấu Hình Kết Nối Đa Kênh (Telegram & Zalo)</span>
        </button>
      </div>

      {/* TAB 1: TELEGRAM WEB SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="space-y-4">
          {/* Friendly Guidance Banner */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-sky-500 text-white shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-sky-900 block mb-0.5">
                💡 Trình Giả Lập Telegram Web K Nội Bộ Đã Sẵn Sàng 100% (Không Cần Tài Khoản Telegram Hay BotFather):
              </span>
              Bạn <strong>không cần tạo tài khoản hay đăng nhập Telegram</strong>. Ngay trong khung chat bên dưới, bạn có thể click trực tiếp các nút gợi ý nhanh như <strong>"⏱️ Bắt đầu ca (Check-in)"</strong>, <strong>"📋 Xác nhận đủ Checklist"</strong>, <strong>"✅ Kết thúc ca"</strong> để kiểm tra trọn vẹn luồng Log Time, gửi ảnh hiện trường và kiểm tra hàng rào 100% checklist kỹ thuật!
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Chat Window styled like web.telegram.org/k/ */}
            <div className="lg:col-span-2 bg-[#0e1621] rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[650px]">
            {/* Telegram Chat Header */}
            <div className="px-5 py-3.5 bg-[#17212b] border-b border-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-100">Attivo Operations Bot</h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">
                      bot
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-400">@{telegramConfig.botUsername} • Luôn trực tuyến</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                {/* Sender switcher */}
                <div className="flex items-center gap-1.5 bg-[#242f3d] px-2.5 py-1 rounded-xl border border-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-300" />
                  <select
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="bg-transparent text-[11px] font-bold text-slate-200 focus:outline-none"
                  >
                    <option value="Lương Nguyễn Tuấn Anh (KTV)" className="bg-slate-800 text-white">
                      Lương Nguyễn Tuấn Anh (KTV HCM)
                    </option>
                    <option value="Anh Chu Việt (KTV)" className="bg-slate-800 text-white">
                      Anh Chu Việt (KTV HN)
                    </option>
                    <option value="Hoài Trịnh (Sale)" className="bg-slate-800 text-white">
                      Hoài Trịnh (Chuyên viên KD Dự án)
                    </option>
                    <option value="Khánh Nguyễn (Sale)" className="bg-slate-800 text-white">
                      Khánh Nguyễn (Chuyên viên KD Dự án)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#0e1621] text-xs">
              {messages.map((m) => {
                const isBot = m.sender === "bot";
                return (
                  <div key={m.id} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 space-y-2.5 shadow-md ${
                        isBot
                          ? "bg-[#182533] text-slate-100 border border-slate-800"
                          : "bg-[#2b5278] text-white border border-[#3b6794]"
                      }`}
                    >
                      {/* Sender header */}
                      {!isBot && (
                        <div className="flex items-center justify-between text-[11px] text-sky-200 border-b border-sky-400/20 pb-1">
                          <span className="font-bold">{m.userName || "Kỹ thuật viên"}</span>
                          <span className="opacity-75">{m.time}</span>
                        </div>
                      )}

                      {/* Photo Attachment preview */}
                      {m.photo && (
                        <div className="rounded-xl overflow-hidden border border-white/10 relative group cursor-pointer"
                          onClick={() => setPreviewPhotoModal(m.photo)}
                        >
                          <img src={m.photo} alt="Đính kèm hiện trường" className="w-full h-44 object-cover" />
                          <div className="absolute bottom-1 right-1 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white font-bold backdrop-blur-xs">
                            🔍 Nhấp để phóng to
                          </div>
                        </div>
                      )}

                      {/* Message Text with simple Markdown formatting */}
                      <div className="whitespace-pre-line leading-relaxed font-sans">
                        {m.text}
                      </div>

                      {/* Bot Footer Timestamp */}
                      {isBot && (
                        <div className="text-[10px] text-slate-400 text-right pt-1 flex items-center justify-end gap-1">
                          <span>{m.time}</span>
                          <span className="text-sky-400">✓✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Selected Photo Bar if pending upload */}
            {selectedPhoto && (
              <div className="px-4 py-2 bg-[#17212b] border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={selectedPhoto} alt="Upload preview" className="w-8 h-8 rounded-lg object-cover border border-sky-500" />
                  <span className="text-[11px] text-sky-300 font-bold">Đã đính kèm ảnh hiện trường</span>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕ Hủy ảnh
                </button>
              </div>
            )}

            {/* Input Message Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#17212b] border-t border-slate-800 flex items-center gap-2">
              {/* Photo Attachment Picker */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    const photos = [
                      SAMPLE_PHOTOS.beforeTreadmill,
                      SAMPLE_PHOTOS.afterTreadmill,
                      SAMPLE_PHOTOS.beforeElectrical,
                      SAMPLE_PHOTOS.afterElectrical,
                      SAMPLE_PHOTOS.beforeDefault,
                    ];
                    const next = photos[Math.floor(Math.random() * photos.length)];
                    setSelectedPhoto(next);
                  }}
                  className="p-2.5 rounded-xl bg-[#242f3d] hover:bg-[#2b5278] text-slate-300 hover:text-white transition"
                  title="Chụp ảnh / Đính kèm hiện trường"
                >
                  <Camera className="w-4 h-4 text-sky-400" />
                </button>
              </div>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhắn tin cho Bot (VD: Bắt đầu Cana, Checklist PRJ-001, Kết thúc ca...)"
                className="flex-1 bg-[#242f3d] border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />

              <button
                type="submit"
                className="p-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white shadow-md transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Col: Quick Actions & Instructions */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Thao Tác Mẫu Nhanh (1-Click)
              </h3>
              <p className="text-[11px] text-slate-500">
                Nhấp vào bất kỳ lệnh nào dưới đây để kiểm tra cách Bot tự động phân tích và cập nhật vào hệ thống:
              </p>

              <div className="space-y-2">
                {quickActions.map((qa, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(null, qa.text)}
                    className="w-full text-left p-2.5 rounded-2xl bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-200 text-xs font-semibold text-slate-800 transition flex items-center justify-between group"
                  >
                    <span>{qa.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition" />
                  </button>
                ))}
              </div>
            </div>

            {/* Field Technician Rule Banner */}
            <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-black text-sm text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Quy Định Kỹ Thuật Hiện Trường</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-amber-800 list-disc list-inside">
                <li>
                  <strong>Bắt đầu ca</strong>: Bắt buộc check-in thời gian và gửi ảnh hiện trạng trước khi bảo trì/lắp đặt.
                </li>
                <li>
                  <strong>Kiểm tra Checklist</strong>: Toàn bộ danh mục checklist của dự án phải được kiểm tra và tích đủ 100%. Bot sẽ từ chối kết thúc nếu checklist còn bỏ sót.
                </li>
                <li>
                  <strong>Kết thúc ca</strong>: Chụp ảnh nghiệm thu sau khi hoàn thành để hệ thống tính toán số giờ làm việc (Log Time).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* TAB: ZALO BOT HUB */}
      {activeTab === "zalo" && (
        <div className="space-y-6">
          {/* Top Info Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-700 rounded-3xl p-6 text-white shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider">
                    Kênh Báo Cáo Zalo Bot
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-400 text-emerald-950 text-xs font-black flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-950 animate-pulse" />
                    Zalo HTTP API Online
                  </span>
                </div>
                <h3 className="text-2xl font-black">{zaloConfig.botName || "Bot Leo làm việc"}</h3>
                <p className="text-blue-100 text-xs max-w-2xl leading-relaxed">
                  Tích hợp Zalo Bot Creator HTTP API chính thức. Kỹ thuật viên &amp; Chuyên viên Kinh doanh dự án có thể báo cáo tiến độ, check-in, nghiệm thu công trình ngay trong nhóm chat Zalo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://zalo.me/s/botcreator/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs transition shadow-sm flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Quản Lý Trên Zalo Bot Creator</span>
                </a>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                <div className="text-blue-200 text-[11px]">Bot ID</div>
                <div className="font-mono font-bold text-white text-sm">{zaloConfig.botId || "3639363733199335155"}</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                <div className="text-blue-200 text-[11px]">Account Name</div>
                <div className="font-mono font-bold text-white text-sm">bot.MoDhOJoI</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                <div className="text-blue-200 text-[11px]">Quyền Thêm Vào Nhóm</div>
                <div className="font-bold text-emerald-300 text-sm">Cho phép (can_join_groups)</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                <div className="text-blue-200 text-[11px]">Daemon Polling</div>
                <div className="font-bold text-white text-sm">Cổng 3001 (Long Polling 25s)</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Col: Interactive Zalo API Sender */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  Gửi Tin Nhắn Thử Nghiệm Qua Zalo Bot HTTP API
                </h4>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  HTTP API v1
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Thử nghiệm gửi tin nhắn trực tiếp qua endpoint <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">https://bot-api.zaloplatforms.com/bot${"{token}"}/sendMessage</code>.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Chat ID người nhận / ID Nhóm Zalo</label>
                  <input
                    type="text"
                    placeholder="Nhập Chat ID hoặc để trống nếu đã bắt được từ tin nhắn Zalo"
                    value={zaloTestChatId}
                    onChange={(e) => setZaloTestChatId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 text-xs"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    💡 Mẹo: Khi KTV hoặc nhóm Zalo gửi tin nhắn đầu tiên đến Bot, Server sẽ tự động lưu lại Chat ID.
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Nội Dung Tin Nhắn</label>
                  <textarea
                    rows={4}
                    value={zaloTestText}
                    onChange={(e) => setZaloTestText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-slate-900 text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTestRealZalo}
                    disabled={isSendingZalo}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    {isSendingZalo ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Gửi Tin Nhắn Zalo Thật</span>
                  </button>
                </div>

                {zaloSendStatus && (
                  <div
                    className={`p-3 rounded-2xl text-xs font-semibold border ${
                      zaloSendStatus.ok
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {zaloSendStatus.msg}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: 1-Click Fast Simulation Directly into ERP */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Mô Phỏng KTV Báo Cáo Nghiệm Thu Từ Zalo Vào ERP
                </h4>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Tự Động Bắn Noti
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Bấm vào 1 trong các dự án dưới đây để kiểm tra quy trình: Tin nhắn từ Zalo tự động ghi nhận nhật ký hiện trường (Field Work Logs) và bắn chuông thông báo lên Trung Tâm Thông Báo ERP!
              </p>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleSimulateZaloReport("Cana Pilates (Tây Ninh)", "PRJ-001")}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 transition group flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs group-hover:text-blue-700">
                      Báo Cáo Nghiệm Thu Cana Pilates (PRJ-001)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      KTV: Lương Nguyễn Tuấn Anh • Đạt 100% Checklist (13/13 mục)
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateZaloReport("Grab Kitchen Bình Thạnh", "PRJ-002")}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 transition group flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs group-hover:text-blue-700">
                      Báo Cáo Hoàn Thành Grab Kitchen (PRJ-002)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      KTV: Lương Nguyễn Tuấn Anh • Đạt 100% Checklist (11/11 mục)
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateZaloReport("CitiGym Phổ Quang", "PRJ-003")}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 transition group flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs group-hover:text-blue-700">
                      Báo Cáo Nghiệm Thu CitiGym (PRJ-003)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      KTV: Lương Nguyễn Tuấn Anh • Đạt 100% Checklist (10/10 mục)
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
                </button>
              </div>

              {/* Bot Commands Guide */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 text-xs space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Cú Pháp Báo Cáo Trên Nhóm Chat Zalo Của Kỹ Thuật &amp; Sale
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <span className="font-bold text-blue-800 block">1. Check-in ca</span>
                    <code className="text-slate-700 font-mono text-[10px]">Bắt đầu PRJ-001</code>
                    <p className="text-slate-500 mt-1">Ghi nhận giờ bắt đầu &amp; gửi ảnh hiện trạng máy.</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <span className="font-bold text-blue-800 block">2. Soát Checklist</span>
                    <code className="text-slate-700 font-mono text-[10px]">Checklist PRJ-001</code>
                    <p className="text-slate-500 mt-1">Kiểm tra 4 mốc SOP và 100% danh mục thiết bị.</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <span className="font-bold text-blue-800 block">3. Nghiệm thu</span>
                    <code className="text-slate-700 font-mono text-[10px]">Hoàn thành PRJ-001</code>
                    <p className="text-slate-500 mt-1">Kết thúc ca, lưu Log Time và bắn thông báo ERP.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FIELD WORK LOGS */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Nhật Ký Hiện Trường & Tính Giờ Làm (Field Work Logs)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng hợp thời gian thực tế, ảnh check-in và ảnh nghiệm thu bàn giao của Kỹ thuật viên qua Telegram.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
              Tổng cộng: {workLogs.length} ca làm việc
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Mã Log</th>
                  <th className="py-3 px-4">Dự Án / Công Trình</th>
                  <th className="py-3 px-3">Kỹ Thuật Viên</th>
                  <th className="py-3 px-3">Thời Gian Bắt Đầu & Kết Thúc</th>
                  <th className="py-3 px-3 text-center">Giờ Làm (Duration)</th>
                  <th className="py-3 px-3 text-center">Checklist</th>
                  <th className="py-3 px-4 text-center">Bằng Chứng Ảnh (Trước / Sau)</th>
                  <th className="py-3 px-3 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {workLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {log.id}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{log.projectName}</span>
                        {log.source === "zalo_bot" ? (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[9px] border border-blue-200">
                            Zalo Bot
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[9px] border border-sky-200">
                            Telegram
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono font-normal">{log.projectId}</span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.technician}</div>
                      <div className="text-[11px] text-slate-500">{log.technicianPhone || "0908112233"}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                      <div>
                        Bắt đầu: <strong className="text-slate-800">{new Date(log.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</strong>
                      </div>
                      <div>
                        Kết thúc: <strong className="text-slate-800">{new Date(log.finishTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</strong>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-black border border-indigo-200 text-xs">
                        {log.durationFormatted}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        {log.completedChecklistItems}/{log.totalChecklistItems} Đạt (100%)
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {log.beforePhoto && (
                          <div
                            onClick={() => setPreviewPhotoModal(log.beforePhoto)}
                            className="cursor-pointer group relative"
                            title="Xem ảnh hiện trạng trước khi làm"
                          >
                            <img src={log.beforePhoto} alt="Trước" className="w-10 h-10 rounded-lg object-cover border border-slate-300 group-hover:scale-105 transition" />
                            <span className="absolute -top-1 -left-1 px-1 bg-amber-500 text-[8px] font-black text-white rounded">
                              TRƯỚC
                            </span>
                          </div>
                        )}
                        {log.afterPhoto && (
                          <div
                            onClick={() => setPreviewPhotoModal(log.afterPhoto)}
                            className="cursor-pointer group relative"
                            title="Xem ảnh nghiệm thu sau khi làm"
                          >
                            <img src={log.afterPhoto} alt="Sau" className="w-10 h-10 rounded-lg object-cover border border-slate-300 group-hover:scale-105 transition" />
                            <span className="absolute -top-1 -right-1 px-1 bg-emerald-600 text-[8px] font-black text-white rounded">
                              SAU
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (onNavigateTab) {
                            onNavigateTab("projects", { id: log.projectId });
                          } else {
                            window.location.hash = `#projects?id=${log.projectId}`;
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition"
                        title="Xem dự án trên ERP"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS MULTI-CHANNEL BOTS */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Telegram Settings Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-sky-600" /> Cấu Hình Kênh Telegram Bot
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  @{telegramConfig.botUsername}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Nhập Bot Token từ <strong>@BotFather</strong> và Chat ID của Group/Channel Attivo Operations để kích hoạt thông báo tự động.
              </p>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Telegram Bot Token (Từ @BotFather)</label>
                  <input
                    type="text"
                    placeholder="VD: 7891234567:AAH_XYZ1234567890abcdef"
                    value={telegramConfig.botToken}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Chat ID / Channel ID nhận thông báo</label>
                  <input
                    type="text"
                    placeholder="VD: -10023456789 hoặc ID cá nhân"
                    value={telegramConfig.chatId}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, chatId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Tên Bot Username</label>
                  <input
                    type="text"
                    value={telegramConfig.botUsername}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, botUsername: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm cursor-pointer"
                  >
                    Lưu Telegram
                  </button>
                  <button
                    type="button"
                    onClick={handleTestRealTelegram}
                    disabled={isSendingApi}
                    className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold border border-sky-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    {isSendingApi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Test gửi tin Telegram</span>
                  </button>
                </div>

                {testApiStatus && (
                  <div
                    className={`p-3 rounded-2xl text-xs font-semibold border ${
                      testApiStatus.ok ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}
                  >
                    {testApiStatus.msg}
                  </div>
                )}
              </form>
            </div>

            {/* Zalo Settings Form */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" /> Cấu Hình Kênh Zalo Bot
                </h3>
                <a
                  href="https://zalo.me/s/botcreator/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Zalo Bot Creator</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-500">
                Nhập Token tích hợp HTTP API từ <strong>Zalo Bot Creator</strong> để kích hoạt luồng nhận báo cáo và thông báo từ Zalo.
              </p>

              <form onSubmit={handleSaveZaloSettings} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Zalo Bot HTTP API Token</label>
                  <input
                    type="text"
                    placeholder="VD: 3639363733199335155:OxwqnlRMSnScyxyBZExKYyQPeVyyLvqFCKJDsDyJDSHiuBgThqfGnTsxwUMiFCRz"
                    value={zaloConfig.botToken}
                    onChange={(e) => setZaloConfig({ ...zaloConfig, botToken: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Bot ID</label>
                    <input
                      type="text"
                      value={zaloConfig.botId || "3639363733199335155"}
                      onChange={(e) => setZaloConfig({ ...zaloConfig, botId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Tên Hiển Thị Bot</label>
                    <input
                      type="text"
                      value={zaloConfig.botName || "Bot Leo làm việc"}
                      onChange={(e) => setZaloConfig({ ...zaloConfig, botName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Chat ID người nhận / ID Nhóm Zalo mặc định</label>
                  <input
                    type="text"
                    placeholder="Tự động bắt khi KTV nhắn tin đến bot"
                    value={zaloConfig.chatId || ""}
                    onChange={(e) => setZaloConfig({ ...zaloConfig, chatId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm cursor-pointer"
                  >
                    Lưu Zalo
                  </button>
                  <button
                    type="button"
                    onClick={handleTestRealZalo}
                    disabled={isSendingZalo}
                    className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    {isSendingZalo ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Test gửi tin Zalo</span>
                  </button>
                </div>

                {zaloSendStatus && (
                  <div
                    className={`p-3 rounded-2xl text-xs font-semibold border ${
                      zaloSendStatus.ok ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {zaloSendStatus.msg}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Guide & Daemon Server Control */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3 text-xs text-slate-700">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-sky-600" /> Hướng Dẫn Setup Bot Telegram & Zalo
              </h4>
              <div className="space-y-3">
                <div>
                  <strong className="text-slate-900 block mb-1">1. Đối với Telegram Bot:</strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Tìm <strong>@BotFather</strong>, gõ <code className="bg-white px-1 rounded">/newbot</code> để lấy Token.</li>
                    <li>Thêm <strong>@{telegramConfig.botUsername}</strong> vào nhóm dự án và cấp quyền gửi tin.</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-slate-900 block mb-1">2. Đối với Zalo Bot:</strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Truy cập <a href="https://zalo.me/s/botcreator/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">https://zalo.me/s/botcreator/</a>.</li>
                    <li>Sử dụng token HTTP API được cấp dán vào ô Cấu Hình Zalo bên trên.</li>
                    <li>Thêm <strong>Bot Leo làm việc</strong> vào nhóm Zalo dự án của KTV & Sale để báo cáo 24/7.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Standalone Daemon Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 text-xs shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Standalone Multi-Channel Bot Daemon
                </h4>
                {serverStatus.online ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online (Port 3001)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium">
                    Chưa kích hoạt daemon
                  </span>
                )}
              </div>

              <p className="text-slate-600 leading-relaxed">
                Daemon chạy đồng thời 2 luồng: Telegram Bot Long Polling và Zalo Bot HTTP Polling, tự động ghi nhận báo cáo và phát thông báo ERP.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>⚡ Chế độ 1: Web Live Poller</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Chạy trực tiếp trên trình duyệt web (kể cả GitHub Pages) mà không cần máy chủ Node.js.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!telegramConfig.botToken) {
                        alert("Vui lòng nhập Token trước khi bật!");
                        return;
                      }
                      setIsBrowserPolling((p) => !p);
                    }}
                    className={`mt-1 px-3 py-1.5 rounded-xl font-bold text-[11px] transition flex items-center gap-1.5 ${
                      isBrowserPolling
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-sky-600 text-white hover:bg-sky-700 shadow-sm"
                    }`}
                  >
                    <span>{isBrowserPolling ? "Đang bật (Click để dừng)" : "Bật Live Web Poller"}</span>
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>🤖 Chế độ 2: Node Daemon 24/7</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Chạy dịch vụ nền trên máy chủ công ty (Telegram & Zalo Long Polling + REST API port 3001).
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      copyToClipboard("npm run bot");
                      if (showToast) showToast("Đã copy lệnh: npm run bot");
                    }}
                    className="mt-1 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] transition flex items-center gap-1.5 font-mono cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy lệnh: npm run bot</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Zoom Modal */}
      {previewPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden p-2 shadow-2xl">
            <button
              onClick={() => setPreviewPhotoModal(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition"
            >
              ✕
            </button>
            <img src={previewPhotoModal} alt="Phóng to ảnh" className="w-full max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
