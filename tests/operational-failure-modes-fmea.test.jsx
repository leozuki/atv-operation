// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import InstallationChecklist, { calculateShortageAnalysis } from "../src/components/InstallationChecklist";
import { initialUsers } from "../src/data/initialUsers";

describe("Operational Failure Modes, FMEA & Recovery Mechanisms Suite", () => {
  // -------------------------------------------------------------------------
  // 1. Phân loại nguyên nhân sự cố & RACI tự động
  // -------------------------------------------------------------------------
  it("FMEA 1: calculateShortageAnalysis phân loại chính xác lỗi giao sai điện áp (spec_mismatch)", () => {
    const checklist = {
      items: [
        {
          id: "CK-110V",
          name: "Máy chạy bộ Precor TRM 885 (Điện áp 110V US Spec)",
          status: "shortage",
          orderedQty: 2,
          receivedQty: 0,
          note: "Hãng giao sai model điện áp 110V thay vì 220V VN",
        },
      ],
    };
    const res = calculateShortageAnalysis(checklist);
    expect(res.hasShortage).toBe(true);
    expect(res.primaryResponsibleCode).toBe("spec_mismatch");
    expect(res.items[0].shippingCost).toBe(3500000); // Chi phí biến áp cách ly & chuyển hàng
    expect(res.items[0].responsible).toContain("Hãng");
    expect(res.items[0].warehouseAction).toContain("Quarantine Zone");
  });

  it("FMEA 2: calculateShortageAnalysis phân loại sự cố va đập trầy xước trong vận chuyển (transport_damage)", () => {
    const checklist = {
      items: [
        {
          id: "CK-DMG",
          name: "Ốp nhựa bảo vệ máy đạp đùi Leg Press",
          status: "shortage",
          orderedQty: 1,
          receivedQty: 0,
          note: "Nhà xe chằng buộc làm móp méo va đập rách thùng",
        },
      ],
    };
    const res = calculateShortageAnalysis(checklist);
    expect(res.hasShortage).toBe(true);
    expect(res.primaryResponsibleCode).toBe("transport_damage");
    expect(res.items[0].responsible).toContain("Đơn Vị Vận Tải");
  });

  it("FMEA 3: calculateShortageAnalysis phân loại sự cố thất lạc linh kiện tại công trường (site_missing)", () => {
    const checklist = {
      items: [
        {
          id: "CK-LOST",
          name: "Chốt tạ nam châm Magnetic Selector Pin",
          status: "shortage",
          orderedQty: 4,
          receivedQty: 2,
          note: "Thất lạc tại công trường do dọn rác nhầm",
        },
      ],
    };
    const res = calculateShortageAnalysis(checklist);
    expect(res.hasShortage).toBe(true);
    expect(res.primaryResponsibleCode).toBe("site_missing");
    expect(res.items[0].responsible).toContain("Đội Kỹ Thuật Hiện Trường");
  });

  // -------------------------------------------------------------------------
  // 2. Pre-Installation Site Readiness Gate
  // -------------------------------------------------------------------------
  it("FMEA 4: Site Readiness Gate kiểm soát 5 tiêu chuẩn mặt bằng và cho phép toggle", () => {
    const mockChecklist = {
      projectId: "PRJ-FMEA-01",
      projectName: "Elite Fitness Center",
      contractCode: "HĐ-ELITE-01",
      status: "warning",
      siteReadiness: {
        ceilingHeight: false, // Chiều cao trần chưa đạt
        elevatorAccess: true,
        electricalGround: true,
        floorAcoustic: true,
        dustCleaned: false, // Chưa sạch bụi thạch cao
      },
      items: [
        { id: "1", name: "Máy tập", status: "pass", orderedQty: 1, receivedQty: 1 },
      ],
    };

    const setChecklistsMock = vi.fn();

    render(
      <InstallationChecklist
        checklists={[mockChecklist]}
        setChecklists={setChecklistsMock}
        projects={[]}
        users={initialUsers}
        currentUser={initialUsers[0]}
        selectedProjectId="PRJ-FMEA-01"
      />
    );

    // Kiểm tra hiển thị cảnh báo mặt bằng
    expect(screen.getByText(/CẦN XỬ LÝ \(2\/5 CHƯA ĐẠT\)/i)).toBeDefined();
    expect(screen.getByText(/Chiều cao trần tĩnh/i)).toBeDefined();
    expect(screen.getByText(/Vệ sinh công nghiệp sạch bụi/i)).toBeDefined();

    // Bấm nút "Xác Nhận Đạt Chuẩn 5/5"
    const passAllBtn = screen.getByText(/Xác Nhận Đạt Chuẩn 5\/5/i);
    fireEvent.click(passAllBtn);

    expect(setChecklistsMock).toHaveBeenCalled();
    const updated = setChecklistsMock.mock.calls[0][0][0];
    expect(updated.siteReadiness.ceilingHeight).toBe(true);
    expect(updated.siteReadiness.dustCleaned).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 3. Payment-Gated Sign-Off & BOD Debt Waiver
  // -------------------------------------------------------------------------
  it("FMEA 5: Chặn ký bàn giao khi chưa thu đủ tiền, và mở khóa khi có bảo lãnh BOD", () => {
    const mockChecklist = {
      projectId: "PRJ-FMEA-DEBT",
      projectName: "Mega Gym Hanoi",
      contractCode: "HĐ-MEGA-01",
      status: "warning",
      bodWaiverApproved: false, // Chưa có bảo lãnh BOD
      items: [
        { id: "1", name: "Thiết bị đầy đủ", status: "pass", orderedQty: 1, receivedQty: 1 },
      ],
    };

    const mockProject = {
      id: "PRJ-FMEA-DEBT",
      name: "Mega Gym Hanoi",
      contractValue: 500000000,
      hubspotDeal: { amount: 500000000 },
    };

    // Mới thu 200tr / 500tr (còn nợ 300tr)
    const mockCollections = [
      { id: "C-1", project: "Mega Gym Hanoi", amount: 200000000 },
    ];

    const setChecklistsMock = vi.fn();
    const showToastMock = vi.fn();

    const techMgrUser = initialUsers.find((u) => u.roleId === "tech_manager") || {
      id: "U-TM",
      name: "Trung Tech Mgr",
      roleId: "tech_manager",
    };

    const { rerender } = render(
      <InstallationChecklist
        checklists={[mockChecklist]}
        setChecklists={setChecklistsMock}
        projects={[mockProject]}
        users={initialUsers}
        currentUser={techMgrUser}
        collections={mockCollections}
        selectedProjectId="PRJ-FMEA-DEBT"
        showToast={showToastMock}
      />
    );

    // Nút ký duyệt bị chặn kèm nhãn cảnh báo
    expect(screen.getByText(/Chặn Ký: Chưa Đủ Tiền \(Cần BOD\)/i)).toBeDefined();

    // Rerender với BOD Waiver được kích hoạt
    const waivedChecklist = { ...mockChecklist, bodWaiverApproved: true };

    rerender(
      <InstallationChecklist
        checklists={[waivedChecklist]}
        setChecklists={setChecklistsMock}
        projects={[mockProject]}
        users={initialUsers}
        currentUser={techMgrUser}
        collections={mockCollections}
        selectedProjectId="PRJ-FMEA-DEBT"
        showToast={showToastMock}
      />
    );

    // Nút ký duyệt bây giờ đã sẵn sàng và được phép click
    const signOffBtn = screen.getByText(/Ký Duyệt Bàn Giao/i);
    expect(signOffBtn).toBeDefined();
    fireEvent.click(signOffBtn);

    expect(setChecklistsMock).toHaveBeenCalled();
    const approvedChecklist = setChecklistsMock.mock.calls[0][0][0];
    expect(approvedChecklist.status).toBe("ready");
    expect(approvedChecklist.signOff.manager.bodWaiver).toBe("Được BOD bảo lãnh công nợ");
  });

  // -------------------------------------------------------------------------
  // 4. Day-14 Post-Launch Audit Scheduler
  // -------------------------------------------------------------------------
  it("FMEA 6: Tự động lên lịch khám sức khỏe máy 14 ngày sau khai trương vào Maintenance Schedule", () => {
    const readyChecklist = {
      projectId: "PRJ-FMEA-READY",
      projectName: "Sunrise Fitness Da Nang",
      contractCode: "HĐ-SUNRISE-01",
      status: "ready", // Đã bàn giao xong
      verifier: "Lương Nguyễn Tuấn Anh",
      postLaunchAuditCreated: false,
      items: [
        { id: "1", name: "Máy chạy bộ", status: "pass", orderedQty: 2, receivedQty: 2 },
      ],
    };

    const setScheduleMock = vi.fn();
    const setChecklistsMock = vi.fn();

    render(
      <InstallationChecklist
        checklists={[readyChecklist]}
        setChecklists={setChecklistsMock}
        projects={[]}
        users={initialUsers}
        currentUser={initialUsers[0]}
        schedule={{ HN: [], HCM: [] }}
        setSchedule={setScheduleMock}
        selectedProjectId="PRJ-FMEA-READY"
      />
    );

    // Nút tạo lịch khám 14 ngày xuất hiện
    const createAuditBtn = screen.getByText(/Tạo Lịch Khám 14 Ngày/i);
    expect(createAuditBtn).toBeDefined();
    fireEvent.click(createAuditBtn);

    // Xác nhận task được thêm vào schedule
    expect(setScheduleMock).toHaveBeenCalled();
    const scheduleUpdate = setScheduleMock.mock.calls[0][0]({ HN: [], HCM: [] });
    const hcmTasks = scheduleUpdate.HCM;
    expect(hcmTasks.length).toBe(1);
    expect(hcmTasks[0].title).toContain("Khám 14 Ngày");
    expect(hcmTasks[0].notes).toContain("Cân chỉnh đai thảm chạy bộ");
  });

  // -------------------------------------------------------------------------
  // 5. Quarantine Zone & Red Tag RMA Hub Modal
  // -------------------------------------------------------------------------
  it("FMEA 7: Mở Modal Khu Vực Cách Ly Hàng Lỗi và hiển thị tem Red Tag RMA", () => {
    const shortageChecklist = {
      projectId: "PRJ-FMEA-QUARANTINE",
      projectName: "Saigon Crossfit Arena",
      contractCode: "HĐ-SGC-01",
      status: "warning",
      items: [
        {
          id: "CK-Q1",
          name: "Bo mạch điều khiển máy leo núi StairClimber",
          status: "shortage",
          orderedQty: 1,
          receivedQty: 0,
          note: "Hư hỏng bo mạch do nước mưa lọt vào vỏ thùng",
        },
      ],
    };

    render(
      <InstallationChecklist
        checklists={[shortageChecklist]}
        setChecklists={vi.fn()}
        projects={[]}
        users={initialUsers}
        currentUser={initialUsers[0]}
        selectedProjectId="PRJ-FMEA-QUARANTINE"
      />
    );

    // Mở modal quản lý kho khi ship bù
    const openModalBtn = screen.getByText(/Quản Lý Kho Khi Ship Bù/i);
    fireEvent.click(openModalBtn);

    // Chuyển sang Tab 3: Khu Cách Ly Hàng Lỗi & Tem Đỏ Red Tag RMA
    const quarantineTabBtn = screen.getByText(/Khu Cách Ly Hàng Lỗi & Tem Đỏ Red Tag RMA/i);
    fireEvent.click(quarantineTabBtn);

    // Kiểm tra hiển thị tem đỏ Red Tag RMA và hướng định đoạt
    expect(screen.getByText(/Khu Vực Cách Ly Hàng Lỗi & Tem Đỏ Red Tag RMA/i)).toBeDefined();
    expect(screen.getByText(/RMA-INE-01/i)).toBeDefined(); // RMA tag ID
    expect(screen.getByText(/Hướng A: Sửa Chữa & Làm Mới/i)).toBeDefined();
    expect(screen.getByText(/Hướng B: Xuất Trả Hãng Đối Tác/i)).toBeDefined();
    expect(screen.getByText(/Hướng C: Hủy Bỏ Giảm Trừ/i)).toBeDefined();
  });
});
