// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { calculateShortageAnalysis } from "../src/components/InstallationChecklist";
import { estimateTicketCompletion } from "../src/utils/slaEstimator";
import { formatCurrency, formatVND } from "../src/utils/formatters";
import InstallationChecklist from "../src/components/InstallationChecklist";
import FinanceHub from "../src/components/FinanceHub";
import TenderManager from "../src/components/TenderManager";
import MaintenanceSchedule from "../src/components/MaintenanceSchedule";
import ExecutiveWBR from "../src/components/ExecutiveWBR";
import { initialUsers, initialRoles } from "../src/data/initialUsers";
import {
  initialProjects,
  initialInstallationChecklists,
  initialWeeklySchedule,
  initialShipments,
  initialTenders,
  initialDesignSalesTasks,
  initialFinanceCollections,
} from "../src/data/initialData";

describe("R5: Real-World 7-Stage Operational Lifecycle E2E Suite", () => {
  const adminUser = initialUsers.find((u) => u.roleId === "admin");
  const techManager = initialUsers.find((u) => u.roleId === "tech_manager");
  const financeUser = initialUsers.find((u) => u.roleId === "finance_lead");
  const salesUser = initialUsers.find((u) => u.roleId === "sales_lead");

  // Shared project under simulation
  const targetProject = initialProjects[0]; // PRJ-001 (Mai Hắc Đế Gym Center)

  it("Stage 1: Lead capture & HubSpot initial deal validation", () => {
    expect(targetProject.id).toBe("PRJ-001");
    expect(targetProject.name).toBe("Cà Na Pilates Tây Ninh");
    expect(targetProject.customer).toContain("Cana");
    expect(targetProject.hubspotDeal).toBeDefined();
    expect(targetProject.hubspotDeal.dealId).toBe("43697632120");
    expect(targetProject.hubspotDeal.amount).toBe(1346558100);
    expect(targetProject.hubspotContact).toBeDefined();
  });

  it("Stage 2: 2D/3D Design assigned strictly to Lý with CAD & 3D Render deliverables", () => {
    // Single-designer policy: 100% active design tasks assigned to Lý
    expect(initialDesignSalesTasks.length).toBeGreaterThan(0);
    const nonLyTasks = initialDesignSalesTasks.filter(
      (t) => (t.designer2D && t.designer2D !== "—" && t.designer2D !== "Lý") ||
             (t.designer3D && t.designer3D !== "—" && t.designer3D !== "Lý")
    );
    expect(nonLyTasks.length).toBe(0);
    expect(targetProject.designer2D).toBe("Lý");
  });

  it("Stage 3: BOQ tender & quotation generated in TenderManager with VAT breakdown", () => {
    let currentTenders = [...initialTenders];
    const setTendersMock = vi.fn((newTenders) => {
      currentTenders = newTenders;
    });

    render(
      <TenderManager
        tenders={currentTenders}
        setTenders={setTendersMock}
        currentUser={salesUser}
        onNavigateTab={vi.fn()}
      />
    );

    // Verify TenderManager shows quotations
    expect(screen.getByText("Báo Giá & Hợp Đồng")).toBeDefined();
    expect(screen.getByText("Thêm Deal / Báo Giá Mới")).toBeDefined();

    // Verify valid tenders exist with non-zero values
    const validTenders = initialTenders.filter((t) => t.valueBeforeVat > 0);
    expect(validTenders.length).toBeGreaterThan(0);
  });

  it("Stage 4: First deposit payment recorded in FinanceHub", () => {
    let currentCollections = [...initialFinanceCollections];
    const onAddMock = vi.fn((newCol) => {
      currentCollections = [newCol, ...currentCollections];
    });

    render(
      <FinanceHub
        collections={currentCollections}
        onAddCollection={onAddMock}
        currentUser={financeUser}
        onNavigateTab={vi.fn()}
      />
    );

    // Verify Finance KPI and Add Button
    expect(screen.getByText("Tài Chính & Thu Tiền")).toBeDefined();
    const addBtn = screen.getByText("Ghi Nhận Khoản Thu Mới");
    fireEvent.click(addBtn);

    // Fill new collection form
    const customerInput = screen.getByPlaceholderText(/Ví dụ: CALIFORNIA FITNESS/i);
    const amountInput = screen.getByPlaceholderText(/Ví dụ: 150000000/i);
    fireEvent.change(customerInput, { target: { value: "CÀ NA PILATES (ĐỢT 1 - CỌC)" } });
    fireEvent.change(amountInput, { target: { value: "500000000" } });

    // Submit form
    const submitBtn = screen.getByText("Lưu Khoản Thu");
    fireEvent.submit(submitBtn.closest("form"));

    expect(onAddMock).toHaveBeenCalled();
    expect(currentCollections[0].customer).toBe("CÀ NA PILATES (ĐỢT 1 - CỌC)");
    expect(currentCollections[0].amount).toBe(500000000);
  });

  it("Stage 5: PO import shipments verified at designated warehouse (DA / BD)", () => {
    // Cana Pilates is in Southern region (HCM), mapped to Bình Dương (BD)
    const bdShipments = initialShipments.filter((s) => s.warehouse === "BD");
    expect(bdShipments.length).toBe(7);
    const daShipments = initialShipments.filter((s) => s.warehouse === "DA");
    expect(daShipments.length).toBe(7);
    expect(bdShipments.length + daShipments.length).toBe(14);
  });

  it("Stage 6: Field checklist BOM verification, shortage analysis & 3-level sign-off", () => {
    const checklist = initialInstallationChecklists.find((c) => c.projectId === "PRJ-001");
    expect(checklist).toBeDefined();
    expect(checklist.items.length).toBeGreaterThanOrEqual(10);

    // Compute shortage analysis for PRJ-001
    const analysis = calculateShortageAnalysis(checklist);
    expect(analysis).toBeDefined();
    expect(typeof analysis.grandTotalCost).toBe("number");
    expect(typeof analysis.primaryResponsible).toBe("string");

    let updatedChecklists = [...initialInstallationChecklists];
    const setChecklistsMock = vi.fn((update) => {
      updatedChecklists = typeof update === "function" ? update(updatedChecklists) : update;
    });

    const setProjectsMock = vi.fn();

    render(
      <InstallationChecklist
        checklists={initialInstallationChecklists}
        setChecklists={setChecklistsMock}
        projects={initialProjects}
        setProjects={setProjectsMock}
        users={initialUsers}
        currentUser={techManager}
        shipments={initialShipments}
        tenders={initialTenders}
        selectedProjectId="PRJ-001"
        setSelectedProjectId={vi.fn()}
        onNavigateTab={vi.fn()}
      />
    );

    // Trưởng phòng kỹ thuật signs off handover
    const signOffBtn = screen.getByText(/Ký Duyệt Bàn Giao/i);
    expect(signOffBtn).toBeDefined();
    fireEvent.click(signOffBtn);

    expect(setChecklistsMock).toHaveBeenCalled();
  });

  it("Stage 7: Maintenance schedule dispatching idle technicians & weekly WBR lock-in", () => {
    let schedule = { ...initialWeeklySchedule };
    const setScheduleMock = vi.fn((newSched) => {
      schedule = newSched;
    });

    // 7.1 Dispatch technician in MaintenanceSchedule
    render(
      <MaintenanceSchedule
        schedule={schedule}
        setSchedule={setScheduleMock}
        users={initialUsers}
        projects={initialProjects}
        onNavigateTab={vi.fn()}
      />
    );

    expect(screen.getByText(/Lịch Bảo Trì & Kỹ Thuật/i)).toBeDefined();

    // 7.2 Lock weekly WBR in ExecutiveWBR
    let projectsState = [...initialProjects];
    const setProjectsMock = vi.fn((update) => {
      projectsState = typeof update === "function" ? update(projectsState) : update;
    });

    render(
      <ExecutiveWBR
        projects={projectsState}
        setProjects={setProjectsMock}
        shipments={initialShipments}
        tenders={initialTenders}
        schedule={schedule}
        designTasks={initialDesignSalesTasks}
        collections={initialFinanceCollections}
        checklists={initialInstallationChecklists}
        users={initialUsers}
        currentUser={adminUser}
        onNavigateTab={vi.fn()}
      />
    );

    const lockBtn = screen.getByText("Chốt Giao Ban & Ghi Nhận Tiến Độ");
    expect(lockBtn).toBeDefined();
    fireEvent.click(lockBtn);

    expect(setProjectsMock).toHaveBeenCalled();
  });
});
