// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react'
import App from '../src/App.jsx'
import { initialTenders } from '../src/data/initialData.js'

// Sidebar label -> heading the tab is expected to render.
const TABS = [
  ['Tiến Độ Tổng Thể', 'Tiến Độ Dự Án'],
  ['Biểu Đồ Gantt', 'Biểu Đồ Gantt'],
  ['Giao Ban Tuần', 'Giao Ban Tuần (WBR)'],
  ['Lịch Vận Hành', 'Lịch Vận Hành'],
  ['Danh Sách Dự Án', 'Danh Sách Dự Án'],
  ['Báo Giá & Hợp Đồng', 'Báo Giá & Hợp Đồng'],
  ['Thiết Kế 2D/3D', 'Thiết Kế 2D/3D'],
  ['Thu Tiền', 'Tài Chính & Thu Tiền'],
  ['Vận Chuyển & Kho', 'Vận Chuyển & Kho'],
  ['Checklist Lắp Đặt', 'Checklist Lắp Đặt Thiết Bị'],
  ['Lịch Bảo Trì & Kỹ Thuật', 'Lịch Bảo Trì & Kỹ Thuật'],
  ['HubSpot CRM 360°', 'HubSpot CRM'],
  ['Kho Tài Liệu DMS', 'Kho Tài Liệu DMS'],
  ['Phân Quyền & Nhân Sự', 'Phân Quyền & Nhân Sự'],
  ['Quy Trình Nghiệp Vụ', 'Quy Trình Nghiệp Vụ'],
]

const sidebar = () => within(document.querySelector('aside'))
const openTab = (label) => fireEvent.click(sidebar().getByText(label).closest('button'))
const mainHeading = () => document.querySelector('main').querySelector('h1,h2,h3')?.textContent.trim()
const storedTenders = () => JSON.parse(localStorage.getItem('atv_tenders'))

const CUSTOM_TENDER = { id: 999, project: 'ZZ Test Tender', note: '', type: 'Quotation', valueBeforeVat: 1000000, status: 'New' }

let consoleErrors
beforeEach(() => {
  // HubSpot tab auto-syncs on mount; keep tests offline and deterministic.
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ results: [] }) }))
  consoleErrors = []
  vi.spyOn(console, 'error').mockImplementation((...args) => consoleErrors.push(args.map(String).join(' ')))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('navigation', () => {
  it('opens the operations matrix by default', () => {
    render(<App />)
    expect(mainHeading()).toBe('Tiến Độ Dự Án')
  })

  it.each(TABS)('sidebar "%s" renders "%s" without console errors', (label, heading) => {
    render(<App />)
    openTab(label)
    expect(mainHeading()).toBe(heading)
    expect(consoleErrors).toEqual([])
  })

  it('can visit every tab in sequence on one mounted app', () => {
    render(<App />)
    for (const [label, heading] of TABS) {
      openTab(label)
      expect(mainHeading(), label).toBe(heading)
    }
    expect(consoleErrors).toEqual([])
  })
})

describe('localStorage persistence', () => {
  it('writes seed data to storage on first load', () => {
    render(<App />)
    expect(storedTenders()).toEqual(initialTenders)
  })

  it('restores previously saved data', () => {
    localStorage.setItem('atv_tenders', JSON.stringify([...initialTenders, CUSTOM_TENDER]))
    render(<App />)
    openTab('Báo Giá & Hợp Đồng')
    expect(screen.getAllByText('ZZ Test Tender').length).toBeGreaterThan(0)
  })

  it.each(['atv_shipments', 'atv_checklists', 'atv_schedule', 'atv_tenders', 'atv_projects', 'atv_users'])(
    'falls back to seed data when %s is corrupted',
    (key) => {
      localStorage.setItem(key, '{not valid json')
      expect(() => render(<App />)).not.toThrow()
      for (const [label, heading] of TABS) {
        openTab(label)
        expect(mainHeading(), label).toBe(heading)
      }
    },
  )
})

describe('reset to seed data', () => {
  beforeEach(() => {
    localStorage.setItem('atv_tenders', JSON.stringify([...initialTenders, CUSTOM_TENDER]))
  })

  it('restores seed data when confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    fireEvent.click(sidebar().getByText('Khôi Phục Dữ Liệu Gốc'))

    expect(window.confirm).toHaveBeenCalledOnce()
    expect(storedTenders()).toEqual(initialTenders)
    openTab('Báo Giá & Hợp Đồng')
    expect(screen.queryByText('ZZ Test Tender')).toBeNull()
  })

  it('keeps user data when cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<App />)
    fireEvent.click(sidebar().getByText('Khôi Phục Dữ Liệu Gốc'))

    expect(storedTenders()).toContainEqual(CUSTOM_TENDER)
  })
})
