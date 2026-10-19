import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatVND,
  formatShortCurrency,
  formatDate,
  getWarehouseBadge,
  getShipmentStatusBadge,
  getShortageBadge,
  getProjectStageBadge,
} from '../src/utils/formatters.js'

// Intl inserts non-breaking spaces; normalize so assertions stay readable.
const norm = (s) => s.replace(/ | /g, ' ')

describe('formatCurrency', () => {
  it('formats VND with dot thousand separators', () => {
    expect(norm(formatCurrency(1346558100))).toBe('1.346.558.100 ₫')
  })

  it.each([undefined, null, NaN, 0, 'abc'])('returns "0 ₫" for %s', (val) => {
    expect(formatCurrency(val)).toBe('0 ₫')
  })

  it('keeps the sign for negative amounts', () => {
    expect(norm(formatCurrency(-5000000))).toBe('-5.000.000 ₫')
  })

  it('formatVND is an alias of formatCurrency', () => {
    expect(formatVND).toBe(formatCurrency)
  })
})

describe('formatShortCurrency', () => {
  it.each([
    [1000000000, '1 Tỷ'],
    [1500000000, '1.5 Tỷ'],
    [2000000000, '2 Tỷ'],
    [10675000000, '10.68 Tỷ'],
    [1000000, '1 Tr'],
    [1250000, '1.3 Tr'],
  ])('%d -> %s', (val, expected) => {
    expect(formatShortCurrency(val)).toBe(expected)
  })

  it('falls back to full currency below one million', () => {
    expect(norm(formatShortCurrency(500000))).toBe('500.000 ₫')
  })

  it.each([0, null, undefined, NaN])('returns "0 ₫" for %s', (val) => {
    expect(formatShortCurrency(val)).toBe('0 ₫')
  })
})

describe('formatDate', () => {
  it('converts ISO date to dd/mm/yyyy', () => {
    expect(formatDate('2026-10-05')).toBe('05/10/2026')
  })

  it.each(['', null, undefined, 'TBU'])('treats %s as pending confirmation', (val) => {
    expect(formatDate(val)).toBe('TBU (Chờ xác nhận)')
  })

  it('returns non-ISO strings untouched', () => {
    expect(formatDate('05/10/2026')).toBe('05/10/2026')
  })

  it('does not throw on non-string input', () => {
    expect(formatDate(20261005)).toBe(20261005)
  })
})

describe('badges', () => {
  it('maps both warehouses and a generic fallback', () => {
    expect(getWarehouseBadge('DA').name).toBe('Kho Đông Anh (Hà Nội)')
    expect(getWarehouseBadge('BD').name).toBe('Kho Bình Dương')
    expect(getWarehouseBadge('DN')).toMatchObject({ code: 'DN', name: 'Kho DN' })
  })

  it.each(['ordering', 'manufacturing', 'shipping', 'customs', 'in_warehouse', 'dispatched'])(
    'shipment status "%s" has a Vietnamese label',
    (status) => {
      expect(getShipmentStatusBadge(status).label).not.toBe(status)
    },
  )

  it('unknown shipment status falls back to raw value', () => {
    expect(getShipmentStatusBadge('lost_at_sea').label).toBe('lost_at_sea')
  })

  it('only shortage statuses raise an alert', () => {
    expect(getShortageBadge('vendor_shortage').alert).toBe(true)
    expect(getShortageBadge('order_shortage').alert).toBe(true)
    expect(getShortageBadge('normal').alert).toBe(false)
    expect(getShortageBadge(undefined).alert).toBe(false)
  })

  it('flags marketing and installation stages', () => {
    expect(getProjectStageBadge('handover_ready').isMarketing).toBe(true)
    expect(getProjectStageBadge('installation').isInstall).toBe(true)
    expect(getProjectStageBadge('design').isMarketing).toBeUndefined()
  })
})
