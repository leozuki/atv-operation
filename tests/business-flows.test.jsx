// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import InstallationChecklist from '../src/components/InstallationChecklist.jsx'
import MaintenanceSchedule from '../src/components/MaintenanceSchedule.jsx'
import ExecutiveWBR from '../src/components/ExecutiveWBR.jsx'
import ProjectsTracker from '../src/components/ProjectsTracker.jsx'
import OperationalFlowHub from '../src/components/OperationalFlowHub.jsx'
import OperationsCalendar from '../src/components/OperationsCalendar.jsx'
import { initialUsers, initialRoles } from '../src/data/initialUsers.js'
import {
  initialProjects,
  initialInstallationChecklists,
  initialWeeklySchedule,
  initialShipments,
  initialTenders,
  initialDesignSalesTasks,
  initialFinanceCollections,
} from '../src/data/initialData.js'
import {
  HUBSPOT_TICKET_CATEGORIES,
  estimateTicketCompletion,
  estimateShipmentLeadTime,
} from '../src/utils/slaEstimator.js'

describe('End-to-End Business Flows Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // FLOW 1: Checklist Lắp Đặt, Tính Chi Phí Thiếu Hàng & Ký Duyệt 3 Cấp
  describe('Flow 1: Installation Checklist, Missing Parts Costing & 3-Level Sign-Off', () => {
    it('updates item status, calculates shortage, and syncs progress to projects state', () => {
      const setChecklists = vi.fn()
      const setProjects = vi.fn()
      const showToast = vi.fn()

      const { container } = render(
        <InstallationChecklist
          checklists={initialInstallationChecklists}
          setChecklists={setChecklists}
          projects={initialProjects}
          setProjects={setProjects}
          users={initialUsers}
          currentUser={initialUsers[0]}
          shipments={initialShipments}
          tenders={initialTenders}
          selectedProjectId="PRJ-001"
          setSelectedProjectId={vi.fn()}
          showToast={showToast}
        />
      )

      // Find status select buttons or toggles
      const passButtons = screen.getAllByRole('button', { name: /ĐẠT|CHỜ|THIẾU/i })
      expect(passButtons.length).toBeGreaterThan(0)

      // Verify sign-off section exists
      expect(screen.getByText(/Xác Nhận & Phê Duyệt 3 Cấp/i)).toBeInTheDocument()
      expect(screen.getByText(/1\. KTV Kiểm Đếm Hiện Trường/i)).toBeInTheDocument()
      expect(screen.getByText(/2\. Thủ Kho Phụ Trách/i)).toBeInTheDocument()
      expect(screen.getByText(/3\. Trưởng Phòng Kỹ Thuật/i)).toBeInTheDocument()

      // Click sign off button for Manager
      const signOffBtn = screen.getByRole('button', { name: /Ký Duyệt Bàn Giao/i })
      expect(signOffBtn).toBeInTheDocument()
      fireEvent.click(signOffBtn)

      // Verify setChecklists was called to record sign-off
      expect(setChecklists).toHaveBeenCalled()
      // Verify setProjects was called to update project status
      expect(setProjects).toHaveBeenCalled()
      // Verify toast notified user
      expect(showToast).toHaveBeenCalled()
    })
  })

  // FLOW 2: Lịch Bảo Trì & Điều Động Kỹ Thuật Viên Đang Trống Lịch (Idle Tech Roster)
  describe('Flow 2: Maintenance Schedule & Dispatching Idle Technicians', () => {
    it('identifies unassigned idle technicians and allows quick task dispatch', () => {
      const setSchedule = vi.fn()
      const showToast = vi.fn()

      render(
        <MaintenanceSchedule
          schedule={initialWeeklySchedule}
          setSchedule={setSchedule}
          users={initialUsers}
          projects={initialProjects}
          showToast={showToast}
        />
      )

      // Verify idle tech banner/table renders
      expect(screen.getByText(/Nhân Sự Kỹ Thuật Đang Trống Lịch/i)).toBeInTheDocument()

      // Verify regional toggle works (HN <-> HCM)
      const hnBtn = screen.getByRole('button', { name: /Plan HN/i })
      const hcmBtn = screen.getByRole('button', { name: /Plan HCM/i })
      expect(hnBtn).toBeInTheDocument()
      expect(hcmBtn).toBeInTheDocument()

      fireEvent.click(hcmBtn)
      expect(screen.getByText(/Tải Trọng Đội Kỹ Thuật \(Miền Nam\)/i)).toBeInTheDocument()

      // Click quick assign button (+ Gán ca) on an idle tech
      const quickAssignButtons = screen.getAllByRole('button', { name: /\+ Gán Ca Nhanh|\+ Gán ca/i })
      expect(quickAssignButtons.length).toBeGreaterThan(0)
      fireEvent.click(quickAssignButtons[0])

      // Verify Add Task modal appears
      expect(screen.getByText(/Thêm Lịch Kỹ Thuật/i)).toBeInTheDocument()
    })
  })

  // FLOW 3: Giao Ban Tuần (WBR) Chốt Tiến Độ & Đồng Bộ Dự Án
  describe('Flow 3: Executive WBR Weekly Progress Review & Lock-in', () => {
    it('aggregates department metrics and locks in weekly progress into projects', () => {
      const setProjects = vi.fn()
      const onNavigateTab = vi.fn()
      const showToast = vi.fn()

      render(
        <ExecutiveWBR
          projects={initialProjects}
          setProjects={setProjects}
          shipments={initialShipments}
          tenders={initialTenders}
          collections={initialFinanceCollections}
          schedule={initialWeeklySchedule}
          designTasks={initialDesignSalesTasks}
          checklists={initialInstallationChecklists}
          users={initialUsers}
          onNavigateTab={onNavigateTab}
          showToast={showToast}
        />
      )

      // Check header
      expect(screen.getByText(/Giao Ban Tuần \(WBR\)/i)).toBeInTheDocument()

      // Check 2-column comparative review
      expect(screen.getByText(/Báo Cáo Đã Hoàn Thành Tuần Trước/i)).toBeInTheDocument()
      expect(screen.getByText(/Kế Hoạch Trọng Tâm & Điểm Nghẽn Tuần Này/i)).toBeInTheDocument()

      // Click "Chốt Giao Ban & Ghi Nhận Tiến Độ"
      const finalizeBtn = screen.getByRole('button', { name: /Chốt Giao Ban & Ghi Nhận Tiến Độ/i })
      expect(finalizeBtn).toBeInTheDocument()
      fireEvent.click(finalizeBtn)

      // Verify setProjects updated with new progress
      expect(setProjects).toHaveBeenCalled()
      expect(showToast).toHaveBeenCalled()
    })
  })

  // FLOW 4: Liên Kết Đa Chiều 5 Phân Hệ Trong ProjectsTracker
  describe('Flow 4: Cross-Module 5-Way Linkage in ProjectsTracker', () => {
    it('renders linkage badges and opens detail modal with all 5 operational streams', () => {
      const onNavigateTab = vi.fn()
      const onNavigateToChecklist = vi.fn()

      render(
        <ProjectsTracker
          projects={initialProjects}
          setProjects={vi.fn()}
          tenders={initialTenders}
          designTasks={initialDesignSalesTasks}
          collections={initialFinanceCollections}
          shipments={initialShipments}
          checklists={initialInstallationChecklists}
          onNavigateTab={onNavigateTab}
          onNavigateToChecklist={onNavigateToChecklist}
        />
      )

      // Check table view toggle
      const tableToggleBtn = screen.getByTitle(/Bảng danh sách gọn/i)
      expect(tableToggleBtn).toBeInTheDocument()
      fireEvent.click(tableToggleBtn)

      // Verify "Liên Kết 5 Phân Hệ" column is rendered
      expect(screen.getByText(/Liên Kết 5 Phân Hệ/i)).toBeInTheDocument()

      // Click on first project to open detail modal
      const firstProjectRow = screen.getAllByText(initialProjects[0].name)[0]
      fireEvent.click(firstProjectRow)

      // Verify closed-loop 5 operational systems block appears
      expect(screen.getByText(/Chuỗi Liên Kết Nghiệp Vụ Khép Kín/i)).toBeInTheDocument()
      expect(screen.getByText(/1\. Báo Giá \/ HĐ/i)).toBeInTheDocument()
      expect(screen.getByText(/2\. Bản Vẽ 2D\/3D/i)).toBeInTheDocument()
      expect(screen.getByText(/3\. Tài Chính Thu Tiền/i)).toBeInTheDocument()
      expect(screen.getByText(/4\. Vận Chuyển Kho/i)).toBeInTheDocument()
      expect(screen.getByText(/5\. Checklist BOM/i)).toBeInTheDocument()
    })
  })

  // FLOW 5: Quy Trình Nghiệp Vụ (OperationalFlowHub) 4 Pha & 9 Trạm SOP
  describe('Flow 5: Operational Flow Hub SOP Execution & Phase Navigation', () => {
    it('allows navigation across 4 macro phases and 9 operational stations', () => {
      const onNavigateTab = vi.fn()

      render(
        <OperationalFlowHub
          projects={initialProjects}
          setProjects={vi.fn()}
          shipments={initialShipments}
          tenders={initialTenders}
          checklists={initialInstallationChecklists}
          designTasks={initialDesignSalesTasks}
          collections={initialFinanceCollections}
          schedule={initialWeeklySchedule}
          users={initialUsers}
          onNavigateTab={onNavigateTab}
        />
      )

      // Verify view mode switcher works
      expect(screen.getByText(/1\. Bảng Kanban 9 Bước/i)).toBeInTheDocument()
      expect(screen.getByText(/2\. Chi Tiết Các Bước & Phân Quyền/i)).toBeInTheDocument()
      expect(screen.getByText(/3\. Cảnh Báo Cần Xử Lý/i)).toBeInTheDocument()

      // Switch to Deepdive view
      const deepdiveTab = screen.getByText(/2\. Chi Tiết Các Bước & Phân Quyền/i)
      fireEvent.click(deepdiveTab)

      // Verify SOP steps navigation buttons
      expect(screen.getByText(/1\. Lead & Contact/i)).toBeInTheDocument()
      expect(screen.getByText(/4\. Tender & Báo Giá/i)).toBeInTheDocument()
      expect(screen.getByText(/8\. Lắp Đặt & BBNT/i)).toBeInTheDocument()
    })
  })

  // FLOW 6: Lịch Vận Hành Tổng Hợp Sự Kiện Đa Phân Hệ (OperationsCalendar)
  describe('Flow 6: Cross-Module Event Aggregation in OperationsCalendar', () => {
    it('aggregates schedule, shipments, tenders, and checklists into a unified agenda', () => {
      const onNavigateTab = vi.fn()

      render(
        <OperationsCalendar
          projects={initialProjects}
          shipments={initialShipments}
          schedule={initialWeeklySchedule}
          designTasks={initialDesignSalesTasks}
          collections={initialFinanceCollections}
          tenders={initialTenders}
          checklists={initialInstallationChecklists}
          onNavigateTab={onNavigateTab}
        />
      )

      // Verify calendar renders
      expect(screen.getByText(/Lịch Vận Hành/i)).toBeInTheDocument()

      // Verify department filters exist
      expect(screen.getByRole('button', { name: /Tất Cả/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Kỹ Thuật 2 Miền/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Tàu \/ Air Về Kho/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Báo Giá \/ HĐ/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Kiểm Đếm BOM/i })).toBeInTheDocument()
    })
  })

  // FLOW 7: HubSpot Ticket SLA Estimation & Alert Formatting
  describe('Flow 7: Ticket SLA Estimation & Notification Dispatch', () => {
    it('calculates proper resolution SLA based on ticket type and severity', () => {
      const emergencyRepairTicket = {
        subject: 'HCM | LAB Gym - Kiểm tra Air Bike ko lên nguồn',
      }
      const estimate = estimateTicketCompletion(emergencyRepairTicket)
      expect(estimate.categoryKey).toBe('EMERGENCY_REPAIR')
      expect(estimate.estHours).toBe(3.0)
      expect(estimate.estHoursFormatted).toBe('3h 0m')
      expect(estimate.slaDays).toBe(1)

      const leadTime = estimateShipmentLeadTime({ brand: 'Precor', method: 'Air' })
      expect(leadTime.totalLeadTimeDays).toBeGreaterThan(0)
      expect(leadTime.leadTimeSummary).toBeDefined()
    })
  })
})
