import React, { useState, useMemo } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Mail,
  Send,
  ExternalLink,
  MessageCircle,
  User,
  Calendar,
  AlertCircle,
  Link as LinkIcon,
  CheckCircle2,
  Bot,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import { initialUsers } from "../data/initialUsers";
import { copyToClipboard } from "../utils/navigation";
import { getTelegramConfig, sendTelegramBotMessage } from "../utils/telegramBotService";

export default function TaskShareReminderModal({
  isOpen,
  onClose,
  title = "Chi tiết công việc",
  id = "",
  type = "task", // "project" | "design" | "maintenance" | "logistics" | "tender" | "checklist"
  assignee = "",
  deadline = "",
  status = "",
  notes = "",
  shareUrl = "",
  showToast,
}) {
  const [activeChannel, setActiveChannel] = useState("telegram"); // "telegram" | "zalo" | "email"
  const [copiedType, setCopiedType] = useState(null); // "link" | "telegram" | "zalo" | "email" | null
  const [customRecipient, setCustomRecipient] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);
  const [telegramSendResult, setTelegramSendResult] = useState(null);

  const telegramConfig = useMemo(() => getTelegramConfig(), []);

  // Auto-resolve user info from initialUsers
  const matchedUser = useMemo(() => {
    if (!assignee) return null;
    const cleanAssignee = assignee.toLowerCase();
    return (
      initialUsers.find(
        (u) =>
          u.name.toLowerCase().includes(cleanAssignee) ||
          cleanAssignee.includes(u.name.toLowerCase())
      ) || null
    );
  }, [assignee]);

  const recipientName = customRecipient || matchedUser?.name || assignee || "Đồng đội Attivo";
  const recipientPhone = customPhone || matchedUser?.phone || "";
  const recipientEmail = customEmail || matchedUser?.email || "";

  // Format Telegram message
  const telegramMessage = useMemo(() => {
    const typeLabel =
      type === "project"
        ? "DỰ ÁN"
        : type === "design"
        ? "THIẾT KẾ 2D/3D"
        : type === "maintenance"
        ? "BẢO TRÌ & KỸ THUẬT"
        : type === "logistics"
        ? "LÔ HÀNG VẬN CHUYỂN"
        : type === "tender"
        ? "BÁO GIÁ & HỢP ĐỒNG"
        : "CÔNG VIỆC";

    return `🤖 [ATTIVO ERP - NHẮC VIỆC ${typeLabel}]
📌 Tiêu đề: ${title}
🆔 Mã: ${id || "N/A"}
👤 Phụ trách: ${recipientName}
⏰ Hạn xử lý: ${deadline || "Trong tuần này"}
⚡ Trạng thái: ${status || "Đang xử lý"}
${notes ? `📝 Ghi chú: ${notes}\n` : ""}
👉 Nhắn cho bot: "Bắt đầu ${id}" kèm ảnh khi check-in, và "Kết thúc ${id}" khi nghiệm thu.
🔗 Link ERP: ${shareUrl}`;
  }, [title, id, type, recipientName, deadline, status, notes, shareUrl]);

  // Format Zalo message text
  const zaloMessage = useMemo(() => {
    const typeLabel =
      type === "project"
        ? "DỰ ÁN"
        : type === "design"
        ? "THIẾT KẾ 2D/3D"
        : type === "maintenance"
        ? "BẢO TRÌ & KỸ THUẬT"
        : type === "logistics"
        ? "LÔ HÀNG VẬN CHUYỂN"
        : type === "tender"
        ? "BÁO GIÁ & HỢP ĐỒNG"
        : "CÔNG VIỆC";

    return `[ATTIVO ERP - NHẮC VIỆC ${typeLabel}]
📌 Tiêu đề: ${title}
🆔 Mã: ${id || "N/A"}
👤 Phụ trách: ${recipientName}
⏰ Hạn xử lý: ${deadline || "Trong tuần này"}
⚡ Trạng thái: ${status || "Đang xử lý"}
${notes ? `📝 Lưu ý: ${notes}\n` : ""}
👉 Xem và cập nhật tiến độ trực tiếp tại link:
${shareUrl}`;
  }, [title, id, type, recipientName, deadline, status, notes, shareUrl]);

  // Format Email subject & body
  const emailSubject = useMemo(() => {
    return `[Attivo ERP] Nhắc việc: ${title} (${id || "Chi tiết"})`;
  }, [title, id]);

  const emailBody = useMemo(() => {
    return `Kính gửi ${recipientName},

Hệ thống Quản lý Vận hành Attivo ERP xin gửi thông báo nhắc việc đến bạn:

- Tên hạng mục: ${title}
- Mã công việc / Dự án: ${id || "N/A"}
- Hạn xử lý: ${deadline || "Trong tuần"}
- Trạng thái hiện tại: ${status || "Đang xử lý"}
${notes ? `- Ghi chú / Yêu cầu: ${notes}\n` : ""}
Vui lòng truy cập đường dẫn dưới đây để kiểm tra thông tin và cập nhật tiến độ công việc:
${shareUrl}

Trân trọng,
Attivo International Operations Team`;
  }, [recipientName, title, id, deadline, status, notes, shareUrl]);

  // Mailto link
  const mailtoHref = useMemo(() => {
    const to = recipientEmail ? encodeURIComponent(recipientEmail) : "";
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(emailBody);
    return `mailto:${to}?subject=${subject}&body=${body}`;
  }, [recipientEmail, emailSubject, emailBody]);

  // Zalo direct chat link
  const zaloHref = useMemo(() => {
    if (!recipientPhone) return "https://zalo.me";
    const cleanPhone = recipientPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("84")
      ? cleanPhone
      : cleanPhone.startsWith("0")
      ? "84" + cleanPhone.slice(1)
      : cleanPhone;
    return `https://zalo.me/${formattedPhone}`;
  }, [recipientPhone]);

  // Telegram direct web link
  const telegramHref = useMemo(() => {
    return `https://web.telegram.org/k/#@${telegramConfig.botUsername || "AttivoOperationBot"}`;
  }, [telegramConfig]);

  const handleCopy = async (text, typeKey) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedType(typeKey);
      setTimeout(() => setCopiedType(null), 3000);
      if (showToast) showToast("Đã sao chép nội dung vào Clipboard!");
    }
  };

  const handleSendTelegramApi = async () => {
    setIsSendingTelegram(true);
    setTelegramSendResult(null);
    const res = await sendTelegramBotMessage(telegramMessage);
    setIsSendingTelegram(false);
    if (res.success) {
      setTelegramSendResult({ ok: true, msg: "Đã gửi thông báo nhắc việc tới Telegram Group/Channel!" });
      if (showToast) showToast("Đã gửi tin nhắn tới Telegram Bot thành công!");
    } else {
      setTelegramSendResult({
        ok: false,
        msg: res.error || "Chưa cấu hình Telegram Bot Token trong Cài đặt.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 via-blue-800 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Nhắc Việc Telegram & Đồng Bộ</h3>
                {id && (
                  <span className="px-2 py-0.5 bg-white/20 text-white border border-white/30 rounded text-xs font-mono font-bold">
                    {id}
                  </span>
                )}
              </div>
              <p className="text-xs text-sky-100 line-clamp-1 mt-0.5">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Link bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3.5 flex items-center gap-2 text-xs">
          <LinkIcon className="w-4 h-4 text-sky-600 shrink-0" />
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-mono select-all focus:outline-hidden"
          />
          <button
            onClick={() => handleCopy(shareUrl, "link")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all shadow-xs ${
              copiedType === "link"
                ? "bg-emerald-600 text-white"
                : "bg-sky-600 hover:bg-sky-700 text-white"
            }`}
          >
            {copiedType === "link" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Đã chép!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Sao chép link
              </>
            )}
          </button>
        </div>

        {/* Recipient summary */}
        <div className="p-4 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-500">Phụ trách:</span>
            <span className="font-bold text-slate-900 truncate">
              {recipientName}
              {matchedUser?.department ? ` (${matchedUser.department})` : ""}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-500">Hạn xử lý:</span>
            <span className="font-bold text-amber-700">{deadline || "Trong tuần này"}</span>
          </div>
        </div>

        {/* Channels Tab Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveChannel("telegram")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeChannel === "telegram"
                ? "bg-white text-sky-700 border-sky-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <Bot className="w-4 h-4 text-sky-600" />
            Telegram Bot (@{telegramConfig.botUsername})
          </button>

          <button
            onClick={() => setActiveChannel("zalo")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeChannel === "zalo"
                ? "bg-white text-blue-700 border-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <MessageCircle className="w-4 h-4 text-blue-600" />
            Zalo Chat
          </button>

          <button
            onClick={() => setActiveChannel("email")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeChannel === "email"
                ? "bg-white text-indigo-700 border-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <Mail className="w-4 h-4 text-indigo-600" />
            Email (mailto)
          </button>
        </div>

        {/* Channel Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* TELEGRAM TAB */}
          {activeChannel === "telegram" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Nội dung lệnh Bot Telegram:
                </span>
                <span className="text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  @{telegramConfig.botUsername}
                </span>
              </div>

              <textarea
                readOnly
                value={telegramMessage}
                rows={8}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-sans leading-relaxed focus:outline-hidden"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                <button
                  onClick={() => handleCopy(telegramMessage, "telegram")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                    copiedType === "telegram"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 hover:bg-slate-900 text-white"
                  }`}
                >
                  {copiedType === "telegram" ? (
                    <>
                      <Check className="w-4 h-4" />
                      Đã chép nội dung Telegram!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Sao chép nội dung
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendTelegramApi}
                    disabled={isSendingTelegram}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                    title="Gửi trực tiếp vào Telegram Group qua Bot API"
                  >
                    {isSendingTelegram ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Gửi qua Bot API</span>
                  </button>

                  <a
                    href={telegramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Smartphone className="w-4 h-4" />
                    Mở Telegram Web K
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                </div>
              </div>

              {telegramSendResult && (
                <div
                  className={`p-3 rounded-2xl text-xs font-semibold border ${
                    telegramSendResult.ok
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-900 border-amber-200"
                  }`}
                >
                  {telegramSendResult.msg}
                </div>
              )}
            </div>
          )}

          {/* ZALO TAB */}
          {activeChannel === "zalo" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Nội dung định dạng sẵn gửi Zalo:
                </span>
                {recipientPhone && (
                  <span className="text-slate-500 font-mono">
                    SĐT Zalo: <strong className="text-slate-800">{recipientPhone}</strong>
                  </span>
                )}
              </div>

              <textarea
                readOnly
                value={zaloMessage}
                rows={8}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-sans leading-relaxed focus:outline-hidden"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                <button
                  onClick={() => handleCopy(zaloMessage, "zalo")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                    copiedType === "zalo"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 hover:bg-slate-900 text-white"
                  }`}
                >
                  {copiedType === "zalo" ? (
                    <>
                      <Check className="w-4 h-4" />
                      Đã chép nội dung Zalo!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Sao chép nội dung Zalo
                    </>
                  )}
                </button>

                <a
                  href={zaloHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Mở Zalo Chat ngay
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>
          )}

          {/* EMAIL TAB */}
          {activeChannel === "email" && (
            <div className="space-y-3.5">
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Người nhận: </span>
                  <strong className="text-slate-800">
                    {recipientEmail || "Chưa có email (sẽ chọn khi mở mail client)"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Tiêu đề: </span>
                  <span className="font-semibold text-slate-800">{emailSubject}</span>
                </div>
              </div>

              <textarea
                readOnly
                value={emailBody}
                rows={8}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-sans leading-relaxed focus:outline-hidden"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                <button
                  onClick={() => handleCopy(emailBody, "email")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                    copiedType === "email"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 hover:bg-slate-900 text-white"
                  }`}
                >
                  {copiedType === "email" ? (
                    <>
                      <Check className="w-4 h-4" />
                      Đã chép nội dung Email!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Sao chép nội dung Email
                    </>
                  )}
                </button>

                <a
                  href={mailtoHref}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Gửi Email ngay (mailto)
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="bg-slate-50 border-t border-slate-200 p-3.5 px-5 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Liên kết chứa ID độc lập, người nhận mở ra sẽ tới thẳng công việc này.</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
