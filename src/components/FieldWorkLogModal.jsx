import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Clock,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Upload,
  User,
  MapPin,
  Calendar,
  Send,
  ShieldCheck,
  Check,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { SAMPLE_PHOTOS } from "../utils/telegramBotService";

export default function FieldWorkLogModal({
  isOpen,
  onClose,
  project,
  task,
  checklist,
  onSaveLog,
  onUpdateChecklist,
  showToast,
}) {
  const [step, setStep] = useState(1); // 1: Bắt đầu | 2: Checklist | 3: Kết thúc
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [beforePhoto, setBeforePhoto] = useState(SAMPLE_PHOTOS.beforeTreadmill);
  const [afterPhoto, setAfterPhoto] = useState(SAMPLE_PHOTOS.afterTreadmill);
  const [technicianName, setTechnicianName] = useState(
    task?.assignedTech || project?.assignedTech || "Trần Hữu Thắng"
  );
  const [technicianPhone, setTechnicianPhone] = useState("0908112233");
  const [notes, setNotes] = useState("");
  const [checkedItems, setCheckedItems] = useState({});

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const nowStr = now.toISOString().slice(0, 16);
      setStartTime(nowStr);
      setFinishTime(nowStr);
      setNotes(task?.content || "Thực hiện bảo dưỡng, kiểm tra thông số kỹ thuật và nghiệm thu vận hành.");

      // Initialize checked items from checklist
      const initialChecked = {};
      if (checklist && checklist.items) {
        checklist.items.forEach((item, idx) => {
          initialChecked[item.id || idx] = item.status === "passed" || item.status === "completed";
        });
      }
      setCheckedItems(initialChecked);
      setStep(1);
    }
  }, [isOpen, task, checklist]);

  const checklistItems = useMemo(() => {
    if (checklist && Array.isArray(checklist.items) && checklist.items.length > 0) {
      return checklist.items;
    }
    // Fallback default standard checklist items for gym equipment
    return [
      { id: "chk-1", title: "Kiểm tra hệ thống nguồn điện, aptomat và dây tiếp địa" },
      { id: "chk-2", title: "Kiểm tra cơ cấu cơ khí, độ căng băng tải hoặc cáp dẫn hướng" },
      { id: "chk-3", title: "Vệ sinh bảng mạch điều khiển, sensor cảm ứng và motor" },
      { id: "chk-4", title: "Tra dầu mỡ chịu nhiệt các khớp quay, trục con lăn tiêu chuẩn" },
      { id: "chk-5", title: "Test tải thực tế 30-45 phút, đo tiếng ồn & dòng tải Ampe" },
    ];
  }, [checklist]);

  const totalItemsCount = checklistItems.length;
  const completedItemsCount = Object.values(checkedItems).filter(Boolean).length;
  const isAllChecklistDone = totalItemsCount > 0 && completedItemsCount === totalItemsCount;
  const checklistPercent = totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0;

  // Toggle single checklist item
  const handleToggleItem = (itemId) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Mark all checklist items as done
  const handleMarkAllDone = () => {
    const allDone = {};
    checklistItems.forEach((i, idx) => {
      allDone[i.id || idx] = true;
    });
    setCheckedItems(allDone);
    if (showToast) showToast("Đã xác nhận đạt 100% tất cả hạng mục checklist!");
  };

  // Duration calculation
  const calculatedDuration = useMemo(() => {
    if (!startTime || !finishTime) return "2 giờ 15 phút";
    const start = new Date(startTime);
    const finish = new Date(finishTime);
    const diffMs = finish - start;
    if (diffMs <= 0) return "1 giờ 30 phút";
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours > 0 ? `${hours} giờ ` : ""}${mins} phút`;
  }, [startTime, finishTime]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isAllChecklistDone) {
      alert("⚠️ QUY ĐỊNH BẮT BUỘC:\nToàn bộ các hạng mục Checklist đi kèm phải được kiểm tra và tích đủ 100% trước khi nghiệm thu kết thúc!");
      setStep(2);
      return;
    }

    const logEntry = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      taskId: task?.id || "TK-FIELD-LOG",
      projectId: project?.id || checklist?.projectId || "PRJ-001",
      projectName: project?.name || task?.site || checklist?.projectName || "Công trình Attivo",
      technician: technicianName,
      technicianPhone,
      startTime,
      finishTime,
      durationFormatted: calculatedDuration,
      status: "completed",
      checklistVerified: true,
      totalChecklistItems: totalItemsCount,
      completedChecklistItems: completedItemsCount,
      beforePhoto,
      afterPhoto,
      notes,
      createdAt: new Date().toISOString(),
      syncStatus: "synced_telegram",
    };

    if (onSaveLog) {
      onSaveLog(logEntry);
    }

    if (onUpdateChecklist && checklist) {
      const updatedItems = checklistItems.map((item, idx) => ({
        ...item,
        status: checkedItems[item.id || idx] ? "passed" : item.status,
      }));
      onUpdateChecklist({
        ...checklist,
        items: updatedItems,
        status: "completed",
        progress: 100,
      });
    }

    if (showToast) {
      showToast(`Đã lưu Log Time KTV & gửi nghiệm thu Telegram: ${calculatedDuration}`);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-sm">
              <Clock className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  KTV Field Log Time
                </span>
                <span className="text-xs text-sky-100 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Chuẩn quy trình 3 bước
                </span>
              </div>
              <h3 className="text-lg font-black mt-0.5 text-white">
                {project?.name || task?.site || "Ghi Nhận Giờ Làm & Nghiệm Thu Hiện Trường"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-bold text-center">
          <button
            onClick={() => setStep(1)}
            className={`py-3 px-2 flex items-center justify-center gap-2 transition ${
              step === 1
                ? "bg-white text-blue-600 border-b-2 border-b-blue-600 font-black shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] flex items-center justify-center font-bold">
              1
            </span>
            <span>Bắt đầu (Ảnh check-in)</span>
          </button>

          <button
            onClick={() => setStep(2)}
            className={`py-3 px-2 flex items-center justify-center gap-2 transition ${
              step === 2
                ? "bg-white text-blue-600 border-b-2 border-b-blue-600 font-black shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
              isAllChecklistDone ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}>
              {isAllChecklistDone ? "✓" : "2"}
            </span>
            <span>Checklist ({completedItemsCount}/{totalItemsCount})</span>
          </button>

          <button
            onClick={() => setStep(3)}
            className={`py-3 px-2 flex items-center justify-center gap-2 transition ${
              step === 3
                ? "bg-white text-blue-600 border-b-2 border-b-blue-600 font-black shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] flex items-center justify-center font-bold">
              3
            </span>
            <span>Kết thúc (Ảnh nghiệm thu)</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* STEP 1: BẮT ĐẦU */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 text-sky-900 flex items-start gap-3">
                <Camera className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Bước 1: Check-in & Chụp ảnh hiện trạng</h4>
                  <p className="text-[11px] text-sky-700 mt-0.5">
                    Kỹ thuật viên bắt đầu làm việc tại công trình cần ghi nhận thời gian bắt đầu và chụp ảnh hiện trạng thiết bị/mặt bằng trước khi can thiệp kỹ thuật.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Họ tên Kỹ thuật viên *</label>
                  <input
                    type="text"
                    required
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    placeholder="VD: Trần Hữu Thắng"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Số điện thoại liên hệ</label>
                  <input
                    type="tel"
                    value={technicianPhone}
                    onChange={(e) => setTechnicianPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    placeholder="VD: 0908112233"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Thời gian bắt đầu ca làm *</label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              {/* Photo Upload / Selection */}
              <div>
                <label className="text-slate-700 block mb-1.5 font-bold flex items-center justify-between">
                  <span>Ảnh Hiện Trạng Ban Đầu (Trước khi làm) *</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">✓ Đã chụp / chọn</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Máy chạy bộ / Cardio", url: SAMPLE_PHOTOS.beforeTreadmill },
                    { label: "Bảng mạch điện / Nguồn", url: SAMPLE_PHOTOS.beforeElectrical },
                    { label: "Toàn cảnh phòng Gym", url: SAMPLE_PHOTOS.beforeDefault },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBeforePhoto(p.url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition text-left group ${
                        beforePhoto === p.url ? "border-blue-600 shadow-sm" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-24 object-cover" />
                      <div className="p-1.5 bg-white text-[10px] font-bold text-slate-700 truncate">
                        {p.label}
                      </div>
                      {beforePhoto === p.url && (
                        <span className="absolute top-1.5 right-1.5 p-1 bg-blue-600 text-white rounded-full">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-2 shadow-sm"
                >
                  <span>Tiếp tục: Kiểm tra Checklist</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CHECKLIST BẮT BUỘC */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Bước 2: Kiểm tra bắt buộc 100% Checklist</h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Toàn bộ {totalItemsCount} tiêu chí kỹ thuật phải được kiểm tra thực tế và xác nhận ĐẠT. Không cho phép kết thúc ca nếu còn hạng mục bỏ sót!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleMarkAllDone}
                  className="px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold text-xs shrink-0 transition"
                >
                  Xác nhận đạt tất cả
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700">Tiến độ kiểm đếm checklist:</span>
                  <span className={isAllChecklistDone ? "text-emerald-700" : "text-amber-700"}>
                    {completedItemsCount}/{totalItemsCount} hạng mục ({checklistPercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isAllChecklistDone ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${checklistPercent}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items List */}
              <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50 max-h-72 overflow-y-auto">
                {checklistItems.map((item, idx) => {
                  const itemId = item.id || idx;
                  const isChecked = !!checkedItems[itemId];

                  return (
                    <div
                      key={itemId}
                      onClick={() => handleToggleItem(itemId)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? "bg-white border-emerald-300 shadow-xs"
                          : "bg-white/80 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                            isChecked
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-xs font-semibold ${isChecked ? "text-slate-900" : "text-slate-700"}`}>
                          {item.title || item.item}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isChecked ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isChecked ? "ĐẠT CHUẨN" : "CHƯA KIỂM"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  ← Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAllChecklistDone) {
                      alert("Vui lòng tích đủ toàn bộ checklist trước khi sang bước nghiệm thu kết thúc!");
                      return;
                    }
                    setStep(3);
                  }}
                  className={`px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-sm ${
                    isAllChecklistDone
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <span>Tiếp tục: Nghiệm thu kết thúc</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: KẾT THÚC & NGHIỆM THU */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Bước 3: Chụp ảnh nghiệm thu & Hoàn thành ca</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Checklist đã đạt 100%. Kỹ thuật viên chụp ảnh hiện trường sau khi xử lý hoàn tất để nghiệm thu bàn giao và tính toán tổng số giờ làm.
                  </p>
                </div>
              </div>

              {/* Time Calculation Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Thời gian kết thúc ca *</span>
                  <input
                    type="datetime-local"
                    required
                    value={finishTime}
                    onChange={(e) => setFinishTime(e.target.value)}
                    className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  />
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex flex-col justify-center">
                  <span className="text-indigo-700 block text-[11px] font-bold">Tổng giờ làm việc thực tế:</span>
                  <span className="text-xl font-black text-indigo-900 mt-0.5">{calculatedDuration}</span>
                </div>
              </div>

              {/* After Photo Upload */}
              <div>
                <label className="text-slate-700 block mb-1.5 font-bold flex items-center justify-between">
                  <span>Ảnh Nghiệm Thu (Sau khi hoàn thành) *</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">✓ Đã chụp / chọn</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Máy chạy bộ sau bảo dưỡng", url: SAMPLE_PHOTOS.afterTreadmill },
                    { label: "Bảng điện hoàn chỉnh", url: SAMPLE_PHOTOS.afterElectrical },
                    { label: "Phòng gym hoàn thiện", url: SAMPLE_PHOTOS.afterDefault },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAfterPhoto(p.url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition text-left group ${
                        afterPhoto === p.url ? "border-emerald-600 shadow-sm" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-24 object-cover" />
                      <div className="p-1.5 bg-white text-[10px] font-bold text-slate-700 truncate">
                        {p.label}
                      </div>
                      {afterPhoto === p.url && (
                        <span className="absolute top-1.5 right-1.5 p-1 bg-emerald-600 text-white rounded-full">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Ghi chú kết quả & nghiệm thu:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  placeholder="Ghi rõ chi tiết linh kiện đã thay, kết quả kiểm tra hoặc ý kiến khách hàng..."
                />
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  ← Quay lại
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs md:text-sm shadow-md transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Hoàn Tất & Gửi Báo Cáo Telegram</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
