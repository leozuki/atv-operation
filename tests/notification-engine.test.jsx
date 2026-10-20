// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../src/components/Sidebar";
import { initialUsers, initialRoles } from "../src/data/initialUsers";
import {
  initialShipments,
  initialProjects,
  initialInstallationChecklists,
  initialWeeklySchedule,
  initialTenders,
  initialFinanceCollections,
  initialDmsDocuments,
  initialNotifications,
} from "../src/data/initialData";

describe("R3: Notification Engine Suite", () => {
  const adminUser = initialUsers.find((u) => u.roleId === "admin");
  const techUser = initialUsers.find((u) => u.roleId === "warehouse_tech") || {
    id: "USR-TECH",
    name: "KTV",
    roleId: "warehouse_tech",
  };
  const marketingUser = initialUsers.find((u) => u.roleId === "marketing_lead") || {
    id: "USR-MKT",
    name: "Marketing",
    roleId: "marketing_lead",
  };

  it("calculates total alerts and displays badge count for admin", () => {
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
        users={initialUsers}
        roles={initialRoles}
        currentUser={adminUser}
        notifications={initialNotifications}
      />
    );

    // Notification bell icon button exists with title
    const bellBtn = screen.getByTitle("Cảnh báo vận hành");
    expect(bellBtn).toBeDefined();

    // Verify there is an alert badge
    const badge = bellBtn.querySelector("span");
    expect(badge).toBeDefined();
    expect(Number(badge.textContent)).toBeGreaterThan(0);
  });

  it("filters notification types according to user role (Tech vs Marketing)", () => {
    const testShipmentsWithShortage = [
      ...initialShipments,
      {
        id: "SHP-SHORTAGE-01",
        poCode: "ULS-SHORTAGE",
        brand: "Precor",
        shortageStatus: "vendor_shortage",
        shortageDetail: "Thiếu 2 thùng phụ kiện ốc vít",
        warehouse: "DA",
      },
    ];

    // 1. Render as techUser: should show shortage items and completed projects, but NOT marketing deals
    const { unmount } = render(
      <Sidebar
        activeTab="matrix"
        setActiveTab={vi.fn()}
        onTabChange={vi.fn()}
        shipments={testShipmentsWithShortage}
        projects={initialProjects}
        tenders={initialTenders}
        collections={initialFinanceCollections}
        schedule={initialWeeklySchedule}
        dmsDocuments={initialDmsDocuments}
        users={initialUsers}
        roles={initialRoles}
        currentUser={techUser}
        notifications={initialNotifications}
      />
    );

    // Open notification popover
    const bellBtn = screen.getByTitle("Cảnh báo vận hành");
    fireEvent.click(bellBtn);

    // Tech must see warehouse shortages
    expect(screen.queryByText(/Lệch Hàng:/i)).not.toBeNull();
    // Tech must NOT see marketing MB handover alerts
    expect(screen.queryByText(/Bàn Giao MB \(Marketing\)/i)).toBeNull();

    unmount();

    // 2. Render as marketingUser: should see marketing deals, but NOT warehouse shortages
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
        users={initialUsers}
        roles={initialRoles}
        currentUser={marketingUser}
        notifications={initialNotifications}
      />
    );

    const mktBellBtn = screen.getByTitle("Cảnh báo vận hành");
    fireEvent.click(mktBellBtn);

    // Marketing must see marketing MB handover alerts
    expect(screen.queryAllByText(/Bàn Giao MB \(Marketing\)/i).length).toBeGreaterThan(0);
    // Marketing must NOT see warehouse shortages
    expect(screen.queryByText(/Lệch Hàng:/i)).toBeNull();
  });

  it("allows marking all completed notifications as read", () => {
    const setNotificationsMock = vi.fn();
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
        users={initialUsers}
        roles={initialRoles}
        currentUser={adminUser}
        notifications={initialNotifications}
        setNotifications={setNotificationsMock}
      />
    );

    // Open popover
    fireEvent.click(screen.getByTitle("Cảnh báo vận hành"));

    // Click "Đã đọc" button
    const markReadBtn = screen.getByText("Đã đọc");
    fireEvent.click(markReadBtn);

    expect(setNotificationsMock).toHaveBeenCalled();
    const updateFn = setNotificationsMock.mock.calls[0][0];
    const updated = updateFn(initialNotifications);
    expect(updated.every((n) => n.read === true)).toBe(true);
  });

  it("navigates to target tab and marks notification as read when clicked", () => {
    const setActiveTabMock = vi.fn();
    const onTabChangeMock = vi.fn();
    const setNotificationsMock = vi.fn();

    render(
      <Sidebar
        activeTab="matrix"
        setActiveTab={setActiveTabMock}
        onTabChange={onTabChangeMock}
        shipments={initialShipments}
        projects={initialProjects}
        tenders={initialTenders}
        collections={initialFinanceCollections}
        schedule={initialWeeklySchedule}
        dmsDocuments={initialDmsDocuments}
        users={initialUsers}
        roles={initialRoles}
        currentUser={adminUser}
        notifications={initialNotifications}
        setNotifications={setNotificationsMock}
      />
    );

    // Open popover
    fireEvent.click(screen.getByTitle("Cảnh báo vận hành"));

    // Find first notification item
    const notiItem = screen.getByText("KTV Báo Cáo Hoàn Thành Cân Chỉnh Máy Chạy");
    expect(notiItem).toBeDefined();

    // Click notification item
    fireEvent.click(notiItem.closest("div"));

    // Check tab navigation invoked
    expect(setActiveTabMock).toHaveBeenCalled();
    expect(onTabChangeMock).toHaveBeenCalled();
    // Check notifications updated
    expect(setNotificationsMock).toHaveBeenCalled();
  });
});
