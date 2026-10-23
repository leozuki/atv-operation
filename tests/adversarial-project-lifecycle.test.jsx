// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { calculateShortageAnalysis } from "../src/components/InstallationChecklist";
import InstallationChecklist from "../src/components/InstallationChecklist";
import FinanceHub from "../src/components/FinanceHub";
import TenderManager from "../src/components/TenderManager";
import MaintenanceSchedule from "../src/components/MaintenanceSchedule";
import ExecutiveWBR from "../src/components/ExecutiveWBR";
import ProjectsTracker from "../src/components/ProjectsTracker";
import { formatCurrency, formatVND } from "../src/utils/formatters";
import { initialUsers, initialRoles } from "../src/data/initialUsers";

describe("Real-World Adversarial Project Lifecycle: Marketing -> Sale -> Quote -> Finance -> Logistics -> Install -> Handover", () => {
  const adminUser = initialUsers.find((u) => u.roleId === "admin");
  const salesUser = initialUsers.find((u) => u.roleId === "sales_lead");
  const financeUser = initialUsers.find((u) => u.roleId === "finance_lead");
  const techManager = initialUsers.find((u) => u.roleId === "tech_manager");
  const fieldTech = initialUsers.find((u) => u.roleId === "warehouse_tech") || {
    id: "USR-003",
    name: "Lương Nguyễn Tuấn Anh",
    roleId: "warehouse_tech",
  };

  // State under simulation across the complete lifecycle
  let simulatedProject = {
    id: "PRJ-OLYMPIA-01",
    name: "Olympia Fitness Club Saigon",
    customer: "Olympia Fitness & Yoga Co., Ltd",
    contact: "Mr. Hoàng Nam (0903 888 999)",
    address: "Khu Đô Thị Sala, TP. Thủ Đức, TP. Hồ Chí Minh",
    brand: "Precor",
    type: "Commercial Gym / Luxury Club",
    region: "HCM",
    contractCode: "ATVE26-OLYMPIA",
    stage: "sales_lead",
    handoverDate: "2026-10-30",
    installationDate: "2026-10-25",
    marketingReady: false,
    leadSale: "Hoài Trịnh",
    dealOwner: "Hoài Trịnh",
    contactOwner: "Marketing Attivo",
    assignedTech: "Đội KTV HCM (Lương Tuấn Anh & Trường Tiến)",
    checklistComplete: false,
    checklistProgress: 0,
    progress: 10,
    hubspotDeal: {
      dealId: "48921049182",
      amount: 850000000,
      stage: "appointmentscheduled",
      owner: "Hoài Trịnh",
    },
    hubspotContact: {
      contactId: "28910481920",
      firstname: "Long",
      lastname: "Hoàng",
      phone: "0903888999",
      contactOwner: "Marketing Attivo",
    },
  };

  let simulatedTenders = [];
  let simulatedCollections = [];
  let simulatedShipments = [];
  let simulatedChecklist = null;
  let simulatedSchedule = { HCM: [], HN: [] };

  // =========================================================================
  // GIAI ĐOẠN 1: MARKETING -> SALES LEAD HANDOVER
  // =========================================================================
  it("Giai đoạn 1: Marketing thu thập Lead, gắn thẻ Lead Hot, bàn giao cho Sales Lead", () => {
    expect(simulatedProject.contactOwner).toBe("Marketing Attivo");
    expect(simulatedProject.dealOwner).toBe("Hoài Trịnh");
    expect(simulatedProject.hubspotDeal.amount).toBe(850000000);
    expect(simulatedProject.hubspotContact.phone).toBe("0903888999");
    expect(simulatedProject.region).toBe("HCM");

    // Sales accepts lead and advances stage to design & quotation
    simulatedProject.stage = "quotation_sent";
    simulatedProject.progress = 25;
    expect(simulatedProject.stage).toBe("quotation_sent");
  });

  // =========================================================================
  // GIAI ĐOẠN 2: SALES -> THIẾT KẾ 2D/3D (LÝ) -> LẬP BÁO GIÁ QUOTE / TENDER
  // =========================================================================
  it("Giai đoạn 2: Bàn giao thiết kế 2D/3D cho Lý và lập báo giá BOQ / Tender", () => {
    // 2.1 Bàn giao thiết kế layout cho Designer Lý
    const designTask = {
      id: "DSN-OLYMPIA-01",
      projectName: simulatedProject.name,
      dealId: simulatedProject.hubspotDeal.dealId,
      designer2D: "Lý",
      designer3D: "Lý",
      status: "Done",
      cadFile: "Olympia_Sala_Layout_Rev3.dwg",
      renderFolder: "DMS/Olympia/3D_Renders/",
    };

    expect(designTask.designer2D).toBe("Lý");
    expect(designTask.designer3D).toBe("Lý");
    expect(designTask.status).toBe("Done");

    // 2.2 Sales lập hồ sơ Báo Giá & Hợp Đồng trong TenderManager
    const newTender = {
      id: "TND-OLYMPIA-01",
      project: simulatedProject.name,
      note: "Gói thiết bị Precor Cardio & Strength cao cấp",
      type: "Contract",
      subType: "Hợp đồng trọn gói thiết bị",
      valueBeforeVat: 850000000,
      vatRate: 0.1,
      vatAmount: 85000000,
      totalContractValue: 935000000,
      status: "Won",
    };
    simulatedTenders.push(newTender);

    render(
      <TenderManager
        tenders={simulatedTenders}
        setTenders={(t) => { simulatedTenders = t; }}
        currentUser={salesUser}
        onNavigateTab={vi.fn()}
      />
    );

    expect(screen.getByText("Báo Giá & Hợp Đồng")).toBeDefined();
    expect(screen.getByText(simulatedProject.name)).toBeDefined();
    expect(simulatedTenders[0].valueBeforeVat).toBe(850000000);
  });

  // =========================================================================
  // GIAI ĐOẠN 3: KẾ TOÁN & ĐẶT CỌC ĐỢT 1 (TÌNH HUỐNG: CHƯA THU ĐỦ TIỀN)
  // =========================================================================
  it("Giai đoạn 3: Khách đặt cọc Đợt 1 (300tr) -> Cảnh báo công nợ 'Chưa thu đủ tiền' kích hoạt", () => {
    // Khách hàng mới cọc đợt 1: 300,000,000 VNĐ / Tổng 850,000,000 VNĐ
    const depositCollection = {
      id: "COL-OLYMPIA-01",
      customer: simulatedProject.name,
      project: simulatedProject.id,
      amount: 300000000,
      date: "2026-10-21",
      dealType: "Đặt cọc đợt 1 hợp đồng thiết bị Precor",
      paymentMethod: "Chuyển khoản VCB",
      status: "collected",
      notes: "Đã nổi tiền Vietcombank",
    };
    simulatedCollections.push(depositCollection);

    // Render FinanceHub
    render(
      <FinanceHub
        collections={simulatedCollections}
        onAddCollection={(col) => { simulatedCollections.push(col); }}
        currentUser={financeUser}
        onNavigateTab={vi.fn()}
      />
    );

    expect(screen.getByText("Tài Chính & Thu Tiền")).toBeDefined();
    expect(screen.getAllByText("300.000.000 ₫").length).toBeGreaterThan(0);

    // Verify Debt calculation: Hợp đồng 850tr, Đã thu 300tr, Còn nợ 550tr (64.7%)
    const totalCollected = simulatedCollections.reduce((s, c) => s + c.amount, 0);
    const unpaidDebt = simulatedTenders[0].valueBeforeVat - totalCollected;
    expect(unpaidDebt).toBe(550000000);
  });

  // =========================================================================
  // GIAI ĐOẠN 4: KHO VẬN & SỰ CỐ 'HÃNG ORDER THIẾU' (VENDOR SHORTAGE)
  // =========================================================================
  it("Giai đoạn 4: Lô hàng PO nhập kho Bình Dương phát hiện Hãng đóng thiếu phụ kiện (Vendor Shortage)", () => {
    // 4.1 Lô hàng PO nhập về kho Bình Dương
    const poShipment = {
      id: "SHP-OLYMPIA-01",
      poCode: "ULS-AT2699",
      brand: "Precor",
      description: "Cont Precor Cardio & Giàn tạ Olympia",
      warehouse: "BD",
      eta: "2026-10-22",
      status: "arrived_port",
      shortageStatus: "vendor_shortage",
      shortageDetail: "Hãng Precor quên đóng 1 thùng phụ tùng cáp FTS Glide",
      assignedProject: simulatedProject.name,
    };
    simulatedShipments.push(poShipment);

    expect(poShipment.warehouse).toBe("BD");
    expect(poShipment.shortageStatus).toBe("vendor_shortage");

    // 4.2 Thiết lập Installation Checklist ban đầu với sự cố Hãng thiếu hàng
    simulatedChecklist = {
      projectId: simulatedProject.id,
      projectName: simulatedProject.name,
      contractCode: simulatedProject.contractCode,
      verifier: "Lương Nguyễn Tuấn Anh",
      inspectionDate: "2026-10-23",
      status: "warning",
      items: [
        // Tiêu chuẩn SOP bắt buộc 1: Đặt xe bốc dỡ
        {
          id: "CHK-01",
          name: "Đặt xe cẩu tự hành và xe nâng bốc dỡ tầng hầm",
          category: "site_prep",
          sopDeliverable: "Đặt xe",
          orderedQty: 1,
          receivedQty: 1,
          status: "pass",
          note: "Đã bố trí xe cẩu 5 tấn và bửng nâng",
        },
        // Tiêu chuẩn SOP bắt buộc 2: Chứng chỉ CO/CQ
        {
          id: "CHK-02",
          name: "Hồ sơ chứng nhận nguồn gốc xuất xứ CO/CQ từ hãng Precor USA",
          category: "site_prep",
          sopDeliverable: "COCQ",
          orderedQty: 1,
          receivedQty: 1,
          status: "pass",
          note: "CO Form E và CQ test xuất xưởng đầy đủ",
        },
        // Thiết bị BOM 1: Máy chạy bộ
        {
          id: "CHK-03",
          name: "Máy chạy bộ Precor TRM 885 Premium Treadmill",
          category: "equipment_bom",
          orderedQty: 4,
          receivedQty: 4,
          status: "pass",
          note: "Đủ 4 kiện nguyên thùng pallet",
        },
        // Thiết bị BOM 2: Sự cố HÃNG ORDER THIẾU
        {
          id: "CHK-04",
          name: "Giàn kéo cáp đa năng Precor FTS Glide (Thiếu thùng cáp & chốt tạ)",
          category: "equipment_bom",
          orderedQty: 2,
          receivedQty: 1, // HÃNG THIẾU 1 KIỆN
          status: "missing",
          note: "Hãng Precor USA đóng thiếu 1 thùng linh kiện cáp phụ kiện theo Packing List",
        },
        // Thiết bị BOM 3: Sự cố KHO SHIP THIẾU
        {
          id: "CHK-05",
          name: "Tạ đĩa bọc cao su Precor Urethane Olympic Discs (Thiếu cặp 25kg)",
          category: "equipment_bom",
          orderedQty: 10,
          receivedQty: 8, // KHO XUẤT THIẾU 2 ĐĨA
          status: "missing",
          note: "Kho Bình Dương bốc sót 2 tạ đĩa 25kg khi điều xe tải nội bộ",
        },
        // Tiêu chuẩn SOP bắt buộc 3: Biên bản giao nhận BBGH/NT
        {
          id: "CHK-06",
          name: "Biên bản giao nhận thiết bị 3 bên và nghiệm thu lắp đặt",
          category: "handover",
          sopDeliverable: "BBGH/NT",
          orderedQty: 1,
          receivedQty: 0,
          status: "fail",
          note: "Chờ bù hàng và lắp ráp hoàn tất",
        },
        // Tiêu chuẩn SOP bắt buộc 4: Biên bản bàn giao bảo hành
        {
          id: "CHK-07",
          name: "Hồ sơ bảo hành thiết bị 24 tháng chính hãng",
          category: "handover",
          sopDeliverable: "Bảo hành",
          orderedQty: 1,
          receivedQty: 0,
          status: "fail",
          note: "Kích hoạt sau khi ký nghiệm thu",
        },
      ],
    };

    // 4.3 Tính toán Shortage Analysis & RACI
    const analysis = calculateShortageAnalysis(simulatedChecklist);
    expect(analysis.hasShortage).toBe(true);
    const bomShortages = analysis.items.filter((i) => i.category === "equipment_bom");
    expect(bomShortages.length).toBe(2);

    // Hãng thiếu cáp FTS Glide -> Trách nhiệm Vendor (Air hỏa tốc)
    const vendorItem = analysis.items.find((i) => i.id === "CHK-04");
    expect(vendorItem.causeCode).toBe("vendor");
    expect(vendorItem.responsible).toContain("Hãng");
    expect(vendorItem.shippingMethod).toContain("Air");

    // Kho ship thiếu tạ đĩa -> Trách nhiệm Kho nội bộ (OpEx xe tải)
    const warehouseItem = analysis.items.find((i) => i.id === "CHK-05");
    expect(warehouseItem.causeCode).toBe("warehouse");
    expect(warehouseItem.responsible).toContain("Kho Vận");
    expect(warehouseItem.shippingCost).toBeGreaterThan(0);
  });

  // =========================================================================
  // GIAI ĐOẠN 5: KIỂM HÀNG TRƯỚC LẮP ĐẶT & CẢNH BÁO CÔNG NỢ TRONG CHECKLIST
  // =========================================================================
  it("Giai đoạn 5: Mở Installation Checklist hiển thị cảnh báo chưa thu đủ tiền & chi phí bù hàng", () => {
    const onNavigateTabMock = vi.fn();

    render(
      <InstallationChecklist
        checklists={[simulatedChecklist]}
        setChecklists={vi.fn()}
        projects={[simulatedProject]}
        setProjects={vi.fn()}
        users={initialUsers}
        currentUser={fieldTech}
        shipments={simulatedShipments}
        tenders={simulatedTenders}
        collections={simulatedCollections}
        selectedProjectId={simulatedProject.id}
        setSelectedProjectId={vi.fn()}
        onNavigateTab={onNavigateTabMock}
      />
    );

    // 5.1 Cảnh báo tài chính / công nợ chưa thu đủ tiền hiển thị rõ ràng
    expect(screen.getByText(/CẢNH BÁO KẾ TOÁN: DỰ ÁN CHƯA THU ĐỦ 100% GIÁ TRỊ HỢP ĐỒNG/i)).toBeDefined();
    expect(screen.getByText(/Còn thiếu 550.000.000 ₫/i)).toBeDefined();

    // Nút chuyển nhanh sang Sổ Thu Tiền
    const goToFinanceBtn = screen.getByText(/Xem Sổ Thu Tiền/i);
    expect(goToFinanceBtn).toBeDefined();
    fireEvent.click(goToFinanceBtn);
    expect(onNavigateTabMock).toHaveBeenCalledWith("finance");

    // 5.2 Dự toán phí bù hàng hiển thị
    expect(screen.getByText(/Dự Toán Phí Bù Hàng/i)).toBeDefined();
    expect(screen.getByText(/Quản Lý Kho Khi Ship Bù/i)).toBeDefined();

    // 5.3 KTV hiện trường không thể ký duyệt cấp Quản lý (RBAC Clean UI)
    expect(screen.queryByText("Ký Duyệt Bàn Giao (Sign Off)")).toBeNull();
  });

  // =========================================================================
  // GIAI ĐOẠN 6: SHIP BÙ HOÀN TẤT & KÝ DUYỆT 3 CẤP (KTV -> THỦ KHO -> TRƯỞNG PHÒNG)
  // =========================================================================
  it("Giai đoạn 6: Ship bù hoàn tất, 100% BOM đạt chuẩn & Trưởng phòng Kỹ thuật ký duyệt 3 cấp", () => {
    // 6.1 Giải quyết hàng thiếu: Tạm xuất Buffer Stock cho FTS Glide và xe tải chở bù 2 tạ đĩa
    simulatedChecklist.items = simulatedChecklist.items.map((it) => ({
      ...it,
      receivedQty: it.orderedQty,
      status: "pass",
      note: "Đã kiểm đếm đủ phụ tùng sau khi ship bù khẩn cấp",
    }));
    // Ban Giám Đốc phê duyệt bảo lãnh bàn giao khi dự án còn công nợ đợt 2 (BOD Waiver)
    simulatedChecklist.bodWaiverApproved = true;

    const setChecklistsMock = vi.fn();
    const setProjectsMock = vi.fn();

    render(
      <InstallationChecklist
        checklists={[simulatedChecklist]}
        setChecklists={setChecklistsMock}
        projects={[simulatedProject]}
        setProjects={setProjectsMock}
        users={initialUsers}
        currentUser={techManager} // Trưởng phòng Kỹ thuật đăng nhập
        shipments={simulatedShipments}
        tenders={simulatedTenders}
        collections={simulatedCollections}
        selectedProjectId={simulatedProject.id}
        setSelectedProjectId={vi.fn()}
        onNavigateTab={vi.fn()}
      />
    );

    // Nút Ký duyệt xuất hiện cho Tech Manager
    const signOffBtn = screen.getByText(/Ký Duyệt Bàn Giao/i);
    expect(signOffBtn).toBeDefined();
    fireEvent.click(signOffBtn);

    expect(setChecklistsMock).toHaveBeenCalled();
    const updatedChecklistResult = setChecklistsMock.mock.calls[0][0][0];
    expect(updatedChecklistResult.status).toBe("ready");
    expect(updatedChecklistResult.signOff.manager.signed).toBe(true);

    // Sync status sang dự án
    simulatedProject.checklistComplete = true;
    simulatedProject.checklistProgress = 100;
    simulatedProject.stage = "handover_pending";
    simulatedProject.progress = 85;
  });

  // =========================================================================
  // GIAI ĐOẠN 7: THU NỐT TIỀN, BÀN GIAO MARKETING, LẬP LỊCH BẢO TRÌ & BÁO CÁO WBR
  // =========================================================================
  it("Giai đoạn 7: Kế toán thu nốt 550tr, bàn giao mặt bằng Marketing, lập lịch bảo trì và chốt WBR", () => {
    // 7.1 Kế toán thu nốt đợt cuối: 550,000,000 VNĐ
    const finalCollection = {
      id: "COL-OLYMPIA-02",
      customer: simulatedProject.name,
      project: simulatedProject.id,
      amount: 550000000,
      date: "2026-10-25",
      dealType: "Thanh toán đợt cuối sau nghiệm thu kỹ thuật bàn giao",
      paymentMethod: "Chuyển khoản VCB",
      status: "collected",
      notes: "Đã thu đủ 100% hợp đồng 850tr",
    };
    simulatedCollections.push(finalCollection);

    const totalCollected = simulatedCollections.reduce((s, c) => s + c.amount, 0);
    expect(totalCollected).toBe(850000000); // 100% dòng tiền hoàn tất

    // 7.2 Bàn giao mặt bằng cho Marketing quay chụp flycam
    simulatedProject.marketingReady = true;
    simulatedProject.marketingNote = "Mặt bằng phòng gym hoàn thiện 100%, sẵn sàng quay phim flycam và chụp bộ ảnh máy Precor";
    expect(simulatedProject.marketingReady).toBe(true);

    // 7.3 Lập lịch bảo trì kỹ thuật định kỳ trong MaintenanceSchedule
    render(
      <MaintenanceSchedule
        schedule={simulatedSchedule}
        setSchedule={(s) => { simulatedSchedule = s; }}
        users={initialUsers}
        projects={[simulatedProject]}
        onNavigateTab={vi.fn()}
      />
    );
    expect(screen.getByText(/Lịch Bảo Trì & Kỹ Thuật/i)).toBeDefined();

    // 7.4 Ban Giám Đốc chốt biên bản giao ban tuần trong ExecutiveWBR
    simulatedProject.stage = "completed";
    simulatedProject.progress = 100;

    let updatedProjects = [simulatedProject];
    const setProjectsMock = vi.fn((update) => {
      updatedProjects = typeof update === "function" ? update(updatedProjects) : update;
    });

    render(
      <ExecutiveWBR
        projects={updatedProjects}
        setProjects={setProjectsMock}
        shipments={simulatedShipments}
        tenders={simulatedTenders}
        schedule={simulatedSchedule}
        designTasks={[]}
        collections={simulatedCollections}
        checklists={[simulatedChecklist]}
        users={initialUsers}
        currentUser={adminUser}
        onNavigateTab={vi.fn()}
      />
    );

    const wbrLockBtn = screen.getByText("Chốt Giao Ban & Ghi Nhận Tiến Độ");
    expect(wbrLockBtn).toBeDefined();
    fireEvent.click(wbrLockBtn);

    expect(setProjectsMock).toHaveBeenCalled();
  });
});
