import { describe, it, expect } from "vitest";
import {
  parseTelegramMessage,
  getTelegramConfig,
  saveTelegramConfig,
  initialFieldWorkLogs,
} from "../src/utils/telegramBotService";
import {
  initialProjects,
  initialChecklists,
  initialSchedule,
  initialShipments,
} from "../src/data/initialData";

const mockContext = {
  projects: initialProjects,
  checklists: initialChecklists,
  schedule: initialSchedule,
  shipments: initialShipments,
};

describe("Telegram Bot Service & NLP Engine", () => {
  it("initialFieldWorkLogs contains verified initial records", () => {
    expect(Array.isArray(initialFieldWorkLogs)).toBe(true);
    expect(initialFieldWorkLogs.length).toBeGreaterThanOrEqual(3);
    expect(initialFieldWorkLogs[0].checklistVerified).toBe(true);
    expect(initialFieldWorkLogs[0].durationMinutes).toBeGreaterThan(0);
  });

  it("identifies project by ID or Vietnamese name (Project Dossier NLP)", () => {
    const res1 = parseTelegramMessage("Cana Tây Ninh", null, mockContext);
    expect(res1.intent).toBe("QUERY_PROJECT");
    expect(res1.projectId).toBe("PRJ-001");
    expect(res1.reply).toContain("Pilates");

    const res2 = parseTelegramMessage("PRJ-002", null, mockContext);
    expect(res2.intent).toBe("QUERY_PROJECT");
    expect(res2.projectId).toBe("PRJ-002");
    expect(res2.reply).toContain("Chateau Villa");

    const res3 = parseTelegramMessage("Dự án Grab", null, mockContext);
    expect(res3.intent).toBe("QUERY_PROJECT");
    expect(res3.projectId).toBe("PRJ-003");
  });

  it("handles START_TASK check-in intent and attaches before-photo", () => {
    const photo = "https://example.com/before.jpg";
    const res = parseTelegramMessage("Bắt đầu bảo trì máy chạy bộ Cana Tây Ninh PRJ-001", photo, mockContext);
    expect(res.intent).toBe("LOG_TIME_START");
    expect(res.actionData?.action).toBe("START_TASK");
    expect(res.actionData?.projectId).toBe("PRJ-001");
    expect(res.actionData?.beforePhoto).toBe(photo);
    expect(res.reply).toContain("CHECK-IN BẮT ĐẦU THÀNH CÔNG");
    expect(res.reply).toContain("QUY ĐỊNH BẮT BUỘC");
  });

  it("handles CHECKLIST verification intent", () => {
    const res = parseTelegramMessage("Đã kiểm tra xong tất cả checklist PRJ-001", null, mockContext);
    expect(res.intent).toBe("CHECKLIST_UPDATE");
    expect(res.actionData?.action).toBe("VERIFY_ALL_CHECKLIST");
    expect(res.actionData?.projectId).toBe("PRJ-001");
    expect(res.reply).toContain("ĐÃ XÁC NHẬN HOÀN THÀNH CHECKLIST");
  });

  it("strictly enforces 100% checklist barrier when attempting to FINISH_TASK without full checklist", () => {
    const uncompletedChecklists = [
      {
        projectId: "PRJ-TEST",
        items: [
          { id: "1", title: "Kiểm tra điện 3 pha", status: "passed" },
          { id: "2", title: "Cân chỉnh dây cáp", status: "pending" },
        ],
      },
    ];

    const ctx = {
      ...mockContext,
      projects: [{ id: "PRJ-TEST", name: "Dự Án Test Barrier", stage: "installation" }],
      checklists: uncompletedChecklists,
    };

    const res = parseTelegramMessage("Kết thúc ca làm PRJ-TEST", null, ctx);
    expect(res.intent).toBe("LOG_TIME_FINISH");
    expect(res.reply).toContain("CHƯA THỂ KẾT THÚC CA");
    expect(res.reply).toContain("Cân chỉnh dây cáp");
  });

  it("allows FINISH_TASK when 100% checklist is completed", () => {
    const completedChecklists = [
      {
        projectId: "PRJ-COMPLETED",
        items: [
          { id: "1", title: "Item 1", status: "passed" },
          { id: "2", title: "Item 2", status: "passed" },
        ],
      },
    ];

    const ctx = {
      ...mockContext,
      projects: [{ id: "PRJ-COMPLETED", name: "Dự Án Đã Hoàn Thành", stage: "maintenance" }],
      checklists: completedChecklists,
    };

    const afterPhoto = "https://example.com/after.jpg";
    const res = parseTelegramMessage("Kết thúc bàn giao PRJ-COMPLETED", afterPhoto, ctx);
    expect(res.intent).toBe("LOG_TIME_FINISH");
    expect(res.actionData?.action).toBe("FINISH_TASK");
    expect(res.actionData?.projectId).toBe("PRJ-COMPLETED");
    expect(res.reply).toContain("NGHIỆM THU & KẾT THÚC CA THÀNH CÔNG");
  });

  it("detects shortage warning messages and alerts operations", () => {
    const res = parseTelegramMessage("Báo thiếu 2 đĩa tạ 10kg Ziva tại công trình Cana", null, mockContext);
    expect(res.intent).toBe("REPORT_SHORTAGE");
    expect(res.reply).toContain("CẢNH BÁO THIẾU HÀNG / SỰ CỐ");
  });

  it("looks up PO and warehouse status", () => {
    const res = parseTelegramMessage("Tra cứu đơn hàng PO ULS-AT2634", null, mockContext);
    expect(res.intent).toBe("QUERY_PO");
    expect(res.reply).toContain("THÔNG TIN ĐƠN HÀNG");
    expect(res.reply).toContain("ULS-AT2634");
  });

  it("handles fallback helpdesk intent for unrecognized text", () => {
    const res = parseTelegramMessage("Thời tiết hôm nay thế nào?", null, mockContext);
    expect(res.intent).toBe("UNKNOWN");
    expect(res.reply).toContain("Attivo Operations Telegram Bot");
  });

  it("getTelegramConfig returns default config if nothing stored", () => {
    const cfg = getTelegramConfig();
    expect(cfg.botUsername).toBe("AttivoOperationBot");
  });
});
