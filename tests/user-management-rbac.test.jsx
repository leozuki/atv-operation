// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import UserManager from "../src/components/UserManager";
import Sidebar from "../src/components/Sidebar";
import InstallationChecklist from "../src/components/InstallationChecklist";
import ExecutiveWBR from "../src/components/ExecutiveWBR";
import FinanceHub from "../src/components/FinanceHub";
import TenderManager from "../src/components/TenderManager";
import { initialUsers, initialRoles } from "../src/data/initialUsers";
import {
  initialShipments,
  initialProjects,
  initialInstallationChecklists,
  initialWeeklySchedule,
  initialTenders,
  initialDesignSalesTasks,
  initialFinanceCollections,
  initialDmsDocuments,
} from "../src/data/initialData";

describe("R1 & R2: User Management & RBAC Suite", () => {
  let mockUsers;
  let mockRoles;

  beforeEach(() => {
    mockUsers = [...initialUsers];
    mockRoles = [...initialRoles];
  });

  describe("R1: UserManager Operations", () => {
    it("renders user list, stats, and search filters", () => {
      render(
        <UserManager
          users={mockUsers}
          setUsers={vi.fn()}
          roles={mockRoles}
          setRoles={vi.fn()}
          currentUser={mockUsers[0]}
          setCurrentUser={vi.fn()}
          onNavigateTab={vi.fn()}
        />
      );

      // Verify header and user stats
      expect(screen.getByText("Phân Quyền & Nhân Sự")).toBeDefined();
      expect(screen.getByPlaceholderText(/Tìm nhân sự theo tên/i)).toBeDefined();

      // Search for specific active user
      const searchInput = screen.getByPlaceholderText(/Tìm nhân sự theo tên/i);
      fireEvent.change(searchInput, { target: { value: "Dominic" } });
      expect(screen.getByText("Dominic Pham")).toBeDefined();
    });

    it("can create a new user and add to state", () => {
      const setUsersMock = vi.fn();
      render(
        <UserManager
          users={mockUsers}
          setUsers={setUsersMock}
          roles={mockRoles}
          setRoles={vi.fn()}
          currentUser={mockUsers[0]}
          setCurrentUser={vi.fn()}
          onNavigateTab={vi.fn()}
        />
      );

      // Open Add User Modal
      const addBtn = screen.getByText("Thêm Nhân Sự Mới");
      fireEvent.click(addBtn);

      // Verify modal is open
      expect(screen.getByText("Thêm Nhân Sự Mới Vào Attivo ERP")).toBeDefined();

      // Fill in form fields
      const nameInput = screen.getByPlaceholderText("Nguyễn Văn A");
      const emailInput = screen.getByPlaceholderText("user@attivointl.com");
      fireEvent.change(nameInput, { target: { value: "Nguyễn Văn Kỹ Thuật" } });
      fireEvent.change(emailInput, { target: { value: "kythuat.moi@attivointl.com" } });

      // Submit form
      const submitBtn = screen.getByText("Tạo Tài Khoản");
      fireEvent.submit(submitBtn.closest("form"));

      expect(setUsersMock).toHaveBeenCalled();
    });

    it("can switch current logged-in user profile", () => {
      const setCurrentUserMock = vi.fn();
      render(
        <UserManager
          users={mockUsers}
          setUsers={vi.fn()}
          roles={mockRoles}
          setRoles={vi.fn()}
          currentUser={mockUsers[0]}
          setCurrentUser={setCurrentUserMock}
          onNavigateTab={vi.fn()}
        />
      );

      // Switch to a tech user via "Đăng nhập thử phiên làm việc..."
      const switchBtns = screen.getAllByTitle(/Đăng nhập thử phiên làm việc/i);
      expect(switchBtns.length).toBeGreaterThan(0);
      fireEvent.click(switchBtns[1]);

      expect(setCurrentUserMock).toHaveBeenCalled();
    });

    it("can toggle user status between active and locked", () => {
      const setUsersMock = vi.fn();
      render(
        <UserManager
          users={mockUsers}
          setUsers={setUsersMock}
          roles={mockRoles}
          setRoles={vi.fn()}
          currentUser={mockUsers[0]}
          setCurrentUser={vi.fn()}
          onNavigateTab={vi.fn()}
        />
      );

      const lockBtns = screen.getAllByTitle(/Bấm để khóa \/ mở khóa/i);
      expect(lockBtns.length).toBeGreaterThan(0);
      fireEvent.click(lockBtns[0]);

      expect(setUsersMock).toHaveBeenCalled();
    });
  });

  describe("R2: Role-Based Clean UI - Sidebar Tab Masking", () => {
    it("renders all 15 navigation tabs when logged in as admin", () => {
      const adminUser = mockUsers.find((u) => u.roleId === "admin");
      render(
        <Sidebar
          activeTab="matrix"
          setActiveTab={vi.fn()}
          onTabChange={vi.fn()}
          shipments={initialShipments}
          projects={initialProjects}
          tenders={initialTenders}
          collections={initialFinanceCollections}
          schedule={initialWeeklySchedule}
          dmsDocuments={initialDmsDocuments}
          users={mockUsers}
          roles={mockRoles}
          currentUser={adminUser}
        />
      );

      // Admin must see all key business modules
      expect(screen.getByText("Tiến Độ Tổng Thể")).toBeDefined();
      expect(screen.getByText("Biểu Đồ Gantt")).toBeDefined();
      expect(screen.getByText("Giao Ban Tuần")).toBeDefined();
      expect(screen.getByText("Lịch Vận Hành")).toBeDefined();
      expect(screen.getByText("Danh Sách Dự Án")).toBeDefined();
      expect(screen.getByText("Báo Giá & Hợp Đồng")).toBeDefined();
      expect(screen.getByText("Thiết Kế 2D/3D")).toBeDefined();
      expect(screen.getByText("Thu Tiền")).toBeDefined();
      expect(screen.getByText("Vận Chuyển & Kho")).toBeDefined();
      expect(screen.getByText("Checklist Lắp Đặt")).toBeDefined();
      expect(screen.getByText("Lịch Bảo Trì & Kỹ Thuật")).toBeDefined();
      expect(screen.getByText("HubSpot CRM 360°")).toBeDefined();
      expect(screen.getByText("Kho Tài Liệu DMS")).toBeDefined();
      expect(screen.getByText("Phân Quyền & Nhân Sự")).toBeDefined();
      expect(screen.getByText("Quy Trình Nghiệp Vụ")).toBeDefined();
    });

    it("completely hides unauthorized tabs for warehouse_tech role", () => {
      const techUser = mockUsers.find((u) => u.roleId === "warehouse_tech") || {
        id: "USR-TECH",
        name: "KTV Lắp Đặt",
        roleId: "warehouse_tech",
      };

      render(
        <Sidebar
          activeTab="checklist"
          setActiveTab={vi.fn()}
          onTabChange={vi.fn()}
          shipments={initialShipments}
          projects={initialProjects}
          tenders={initialTenders}
          collections={initialFinanceCollections}
          schedule={initialWeeklySchedule}
          dmsDocuments={initialDmsDocuments}
          users={mockUsers}
          roles={mockRoles}
          currentUser={techUser}
        />
      );

      // KTV allowed tabs MUST be present
      expect(screen.getByText("Checklist Lắp Đặt")).toBeDefined();
      expect(screen.getByText("Lịch Bảo Trì & Kỹ Thuật")).toBeDefined();
      expect(screen.getByText("Vận Chuyển & Kho")).toBeDefined();

      // KTV unauthorized tabs MUST be completely hidden from the DOM
      expect(screen.queryByText("Báo Giá & Hợp Đồng")).toBeNull();
      expect(screen.queryByText("Thu Tiền")).toBeNull();
      expect(screen.queryByText("Thiết Kế 2D/3D")).toBeNull();
      expect(screen.queryByText("Giao Ban Tuần")).toBeNull();
      expect(screen.queryByText("Phân Quyền & Nhân Sự")).toBeNull();
    });

    it("completely hides unauthorized tabs for design_lead role", () => {
      const designUser = mockUsers.find((u) => u.roleId === "design_lead") || {
        id: "USR-DESIGN",
        name: "Lý Designer",
        roleId: "design_lead",
      };

      render(
        <Sidebar
          activeTab="design"
          setActiveTab={vi.fn()}
          onTabChange={vi.fn()}
          shipments={initialShipments}
          projects={initialProjects}
          tenders={initialTenders}
          collections={initialFinanceCollections}
          schedule={initialWeeklySchedule}
          dmsDocuments={initialDmsDocuments}
          users={mockUsers}
          roles={mockRoles}
          currentUser={designUser}
        />
      );

      // Designer allowed tabs
      expect(screen.getByText("Thiết Kế 2D/3D")).toBeDefined();
      expect(screen.getByText("Kho Tài Liệu DMS")).toBeDefined();

      // Designer unauthorized tabs hidden
      expect(screen.queryByText("Thu Tiền")).toBeNull();
      expect(screen.queryByText("Vận Chuyển & Kho")).toBeNull();
      expect(screen.queryByText("Checklist Lắp Đặt")).toBeNull();
      expect(screen.queryByText("Lịch Bảo Trì & Kỹ Thuật")).toBeNull();
      expect(screen.queryByText("Giao Ban Tuần")).toBeNull();
      expect(screen.queryByText("Phân Quyền & Nhân Sự")).toBeNull();
    });
  });

  describe("R2: Sensitive Action Button Masking", () => {
    it("InstallationChecklist: hides Manager Sign Off button for field technician and sales", () => {
      const techUser = { id: "USR-TECH", name: "Trường Tiến", roleId: "warehouse_tech" };
      const { rerender } = render(
        <InstallationChecklist
          checklists={initialInstallationChecklists}
          setChecklists={vi.fn()}
          projects={initialProjects}
          setProjects={vi.fn()}
          users={mockUsers}
          currentUser={techUser}
          shipments={initialShipments}
          tenders={initialTenders}
          selectedProjectId="PRJ-001"
          setSelectedProjectId={vi.fn()}
          onNavigateTab={vi.fn()}
        />
      );

      // Field tech must NOT see the manager sign-off button
      expect(screen.queryByText("Ký Duyệt Bàn Giao (Sign Off)")).toBeNull();

      // Admin or tech_manager MUST see the manager sign-off button
      const adminUser = { id: "USR-001", name: "Dominic Pham", roleId: "admin" };
      rerender(
        <InstallationChecklist
          checklists={initialInstallationChecklists}
          setChecklists={vi.fn()}
          projects={initialProjects}
          setProjects={vi.fn()}
          users={mockUsers}
          currentUser={adminUser}
          shipments={initialShipments}
          tenders={initialTenders}
          selectedProjectId="PRJ-001"
          setSelectedProjectId={vi.fn()}
          onNavigateTab={vi.fn()}
        />
      );

      expect(screen.getByText("Ký Duyệt Bàn Giao (Sign Off)")).toBeDefined();
    });

    it("ExecutiveWBR: hides weekly sync lock button for unauthorized roles", () => {
      const salesUser = { id: "USR-SALES", name: "Sale Rep", roleId: "sales_lead" };
      const { rerender } = render(
        <ExecutiveWBR
          projects={initialProjects}
          setProjects={vi.fn()}
          shipments={initialShipments}
          tenders={initialTenders}
          schedule={initialWeeklySchedule}
          designTasks={initialDesignSalesTasks}
          collections={initialFinanceCollections}
          checklists={initialInstallationChecklists}
          users={mockUsers}
          currentUser={salesUser}
          onNavigateTab={vi.fn()}
        />
      );

      // Sales cannot lock weekly WBR
      expect(screen.queryByText("Chốt Giao Ban & Ghi Nhận Tiến Độ")).toBeNull();

      // Admin or ops_manager can lock weekly WBR
      const opsManager = { id: "USR-OPS", name: "Ops Lead", roleId: "ops_manager" };
      rerender(
        <ExecutiveWBR
          projects={initialProjects}
          setProjects={vi.fn()}
          shipments={initialShipments}
          tenders={initialTenders}
          schedule={initialWeeklySchedule}
          designTasks={initialDesignSalesTasks}
          collections={initialFinanceCollections}
          checklists={initialInstallationChecklists}
          users={mockUsers}
          currentUser={opsManager}
          onNavigateTab={vi.fn()}
        />
      );

      expect(screen.getByText("Chốt Giao Ban & Ghi Nhận Tiến Độ")).toBeDefined();
    });

    it("FinanceHub: hides Add Collection button for warehouse_tech", () => {
      const techUser = { id: "USR-TECH", name: "KTV", roleId: "warehouse_tech" };
      const { rerender } = render(
        <FinanceHub
          collections={initialFinanceCollections}
          onAddCollection={vi.fn()}
          currentUser={techUser}
          onNavigateTab={vi.fn()}
        />
      );

      // KTV cannot add collections
      expect(screen.queryByText("Ghi Nhận Khoản Thu Mới")).toBeNull();

      // Finance lead or admin can add collections
      const financeUser = { id: "USR-FIN", name: "Kế toán", roleId: "finance_lead" };
      rerender(
        <FinanceHub
          collections={initialFinanceCollections}
          onAddCollection={vi.fn()}
          currentUser={financeUser}
          onNavigateTab={vi.fn()}
        />
      );

      expect(screen.getByText("Ghi Nhận Khoản Thu Mới")).toBeDefined();
    });

    it("TenderManager: hides Add Deal button for warehouse_tech", () => {
      const techUser = { id: "USR-TECH", name: "KTV", roleId: "warehouse_tech" };
      const { rerender } = render(
        <TenderManager
          tenders={initialTenders}
          setTenders={vi.fn()}
          currentUser={techUser}
          onNavigateTab={vi.fn()}
        />
      );

      // KTV cannot add tenders
      expect(screen.queryByText("Thêm Deal / Báo Giá Mới")).toBeNull();

      // Sales lead can add tenders
      const salesUser = { id: "USR-SALES", name: "Sales", roleId: "sales_lead" };
      rerender(
        <TenderManager
          tenders={initialTenders}
          setTenders={vi.fn()}
          currentUser={salesUser}
          onNavigateTab={vi.fn()}
        />
      );

      expect(screen.getByText("Thêm Deal / Báo Giá Mới")).toBeDefined();
    });
  });
});
