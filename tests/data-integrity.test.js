// Relational invariants for seed data. Prefer these over hard-coded counts so
// adding a real project/PO does not break the suite.
import { describe, it, expect } from 'vitest'
import {
  initialShipments,
  initialProjects,
  initialInstallationChecklists,
  initialWeeklySchedule,
  initialTenders,
  initialDesignSalesTasks,
  initialFinanceCollections,
  initialDmsDocuments,
  initialHubspotTickets,
  initialHubspotContacts,
  wbrExecutiveSummary,
} from '../src/data/initialData.js'
import { initialUsers, initialRoles, MODULE_DEFINITIONS } from '../src/data/initialUsers.js'
import { ATTIVO_PIPELINES, HUBSPOT_OWNERS } from '../src/utils/hubspotService.js'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const isValidDate = (s) => ISO_DATE.test(s) && !Number.isNaN(Date.parse(s))

const duplicates = (values) => values.filter((v, i) => values.indexOf(v) !== i)

const PROJECT_STAGES = ['design', 'ordering', 'site_prep', 'handover_ready', 'installation', 'accepted', 'maintenance']
const SHIPMENT_STATUSES = ['ordering', 'manufacturing', 'shipping', 'customs', 'in_warehouse', 'dispatched']
const SHORTAGE_STATUSES = ['normal', 'vendor_shortage', 'order_shortage']
const REGIONS = ['HCM', 'HN']

describe('unique identifiers', () => {
  it.each([
    ['projects.id', initialProjects.map((p) => p.id)],
    ['projects.contractCode', initialProjects.map((p) => p.contractCode).filter(Boolean)],
    ['shipments.id', initialShipments.map((s) => s.id)],
    ['checklists.projectId', initialInstallationChecklists.map((c) => c.projectId)],
    ['checklist items.id', initialInstallationChecklists.flatMap((c) => c.items.map((i) => i.id))],
    ['tenders.id', initialTenders.map((t) => t.id)],
    ['designTasks.id', initialDesignSalesTasks.map((t) => t.id)],
    ['collections.id', initialFinanceCollections.map((c) => c.id)],
    ['dms.id', initialDmsDocuments.map((d) => d.id)],
    ['tickets.ticketId', initialHubspotTickets.map((t) => t.ticketId)],
    ['contacts.contactId', initialHubspotContacts.map((c) => c.contactId)],
    ['users.id', initialUsers.map((u) => u.id)],
    ['users.email', initialUsers.map((u) => u.email.toLowerCase())],
    ['roles.id', initialRoles.map((r) => r.id)],
    ['modules.id', MODULE_DEFINITIONS.map((m) => m.id)],
    ['schedule task.id', Object.values(initialWeeklySchedule).flatMap((days) => days.flatMap((d) => d.tasks.map((t) => t.id)))],
  ])('%s has no duplicates', (_, values) => {
    expect(duplicates(values)).toEqual([])
  })
})

describe('projects', () => {
  it.each(initialProjects.map((p) => [p.id, p]))('%s has valid core fields', (_, p) => {
    expect(p.id).toMatch(/^PRJ-\d{3}$/)
    expect(p.name).toBeTruthy()
    expect(p.customer).toBeTruthy()
    expect(PROJECT_STAGES).toContain(p.stage)
    expect(REGIONS).toContain(p.region)
  })

  it.each(initialProjects.map((p) => [p.id, p]))('%s links to a consistent HubSpot deal', (_, p) => {
    const deal = p.hubspotDeal
    expect(deal.dealId).toMatch(/^\d+$/)
    expect(deal.amount).toBeGreaterThanOrEqual(0)
    const stage = ATTIVO_PIPELINES.DEAL_PIPELINE.stages.find((s) => s.id === deal.stageId)
    expect(stage, `unknown stageId ${deal.stageId}`).toBeDefined()
    expect(deal.stage).toBe(stage.label)
    if (deal.hubspotUrl) expect(deal.hubspotUrl).toContain(`/record/0-3/${deal.dealId}`)
    expect(p.hubspotContact.contactId).toMatch(/^\d+$/)
  })
})

describe('shipments', () => {
  it.each(initialShipments.map((s) => [s.poCode, s]))('%s has valid enums and dates', (_, s) => {
    expect(['DA', 'BD']).toContain(s.warehouse)
    expect(['Sea', 'Air']).toContain(s.method)
    expect(SHIPMENT_STATUSES).toContain(s.status)
    expect(SHORTAGE_STATUSES).toContain(s.shortageStatus)
    expect(isValidDate(s.poDate)).toBe(true)
    if (isValidDate(s.eta)) expect(s.eta >= s.poDate).toBe(true)
    expect(Array.isArray(s.projects) && s.projects.length > 0).toBe(true)
  })

  it('every shortage carries an explanation', () => {
    const missing = initialShipments
      .filter((s) => s.shortageStatus !== 'normal' && !s.shortageDetail)
      .map((s) => s.poCode)
    expect(missing).toEqual([])
  })
})

describe('installation checklists', () => {
  const projectsById = new Map(initialProjects.map((p) => [p.id, p]))

  it.each(initialInstallationChecklists.map((c) => [c.projectId, c]))('%s points to an existing project', (_, c) => {
    const project = projectsById.get(c.projectId)
    expect(project).toBeDefined()
    expect(c.projectName).toBe(project.name)
  })

  it.each(initialInstallationChecklists.map((c) => [c.projectId, c]))('%s item statuses match quantities', (_, c) => {
    for (const item of c.items) {
      expect(item.receivedQty, item.id).toBeLessThanOrEqual(item.orderedQty)
      const expected = item.receivedQty >= item.orderedQty ? 'pass' : 'shortage'
      expect(item.status, item.id).toBe(expected)
    }
  })

  it.each(initialInstallationChecklists.map((c) => [c.projectId, c]))('%s overall status reflects its items', (_, c) => {
    const received = c.items.reduce((a, i) => a + i.receivedQty, 0)
    const allPass = c.items.every((i) => i.status === 'pass')
    const expected = allPass ? 'ready' : received === 0 ? 'missing' : 'warning'
    expect(c.status).toBe(expected)
  })
})

describe('users & RBAC', () => {
  const roleIds = new Set(initialRoles.map((r) => r.id))
  const moduleIds = MODULE_DEFINITIONS.map((m) => m.id)

  it('every user has an existing role', () => {
    const orphans = initialUsers.filter((u) => !roleIds.has(u.roleId)).map((u) => u.id)
    expect(orphans).toEqual([])
  })

  it('every user HubSpot owner id is a known owner', () => {
    const unknown = initialUsers
      .filter((u) => u.hubspotOwnerId && !HUBSPOT_OWNERS[u.hubspotOwnerId])
      .map((u) => u.id)
    expect(unknown).toEqual([])
  })

  it('at least one active admin exists', () => {
    expect(initialUsers.some((u) => u.roleId === 'admin' && u.status === 'active')).toBe(true)
  })

  it.each(initialRoles.map((r) => [r.id, r]))('role %s defines a valid permission for every module', (_, r) => {
    expect(Object.keys(r.permissions).sort()).toEqual([...moduleIds].sort())
    for (const level of Object.values(r.permissions)) {
      expect(['full', 'view', 'none']).toContain(level)
    }
  })

  it('admin has full access everywhere', () => {
    const admin = initialRoles.find((r) => r.id === 'admin')
    expect(Object.values(admin.permissions).every((p) => p === 'full')).toBe(true)
  })
})

describe('HubSpot tickets', () => {
  const techStageIds = ATTIVO_PIPELINES.TECHNICAL_TICKETS.stages.map((s) => s.id)

  it.each(initialHubspotTickets.map((t) => [t.ticketId, t]))('%s uses a known technical stage', (_, t) => {
    expect(t.pipelineId).toBe(ATTIVO_PIPELINES.TECHNICAL_TICKETS.id)
    expect(techStageIds).toContain(t.stageId)
    expect(['LOW', 'MEDIUM', 'HIGH']).toContain(t.priority)
    expect(isValidDate(t.createdDate)).toBe(true)
  })
})

describe('other modules', () => {
  it('design task progress stays within 0..100', () => {
    for (const t of initialDesignSalesTasks) {
      expect(t.progressPercent, t.id).toBeGreaterThanOrEqual(0)
      expect(t.progressPercent, t.id).toBeLessThanOrEqual(100)
    }
  })

  it('collections have positive amounts and valid dates', () => {
    for (const c of initialFinanceCollections) {
      expect(c.amount, c.id).toBeGreaterThan(0)
      expect(isValidDate(c.date), c.id).toBe(true)
    }
  })

  it('DMS documents do not expire before they are created', () => {
    for (const d of initialDmsDocuments) {
      expect(isValidDate(d.createdAt), d.id).toBe(true)
      if (d.expiredDate) expect(d.expiredDate >= d.createdAt, d.id).toBe(true)
    }
  })
})

describe('WBR summary is derived from source data', () => {
  it('PO count and warehouse split match shipments', () => {
    expect(wbrExecutiveSummary.logisticsTotalPOs).toBe(initialShipments.length)
    expect(wbrExecutiveSummary.warehouseDistribution).toEqual({
      DA: initialShipments.filter((s) => s.warehouse === 'DA').length,
      BD: initialShipments.filter((s) => s.warehouse === 'BD').length,
    })
  })

  it('technical task counts match the weekly schedule', () => {
    const count = (region) => initialWeeklySchedule[region].reduce((a, d) => a + d.tasks.length, 0)
    const { HCM, HN, total } = wbrExecutiveSummary.techWeeklyTasksCount
    expect(HCM).toBe(count('HCM'))
    expect(HN).toBe(count('HN'))
    expect(total).toBe(HCM + HN)
  })

  it('collection total matches collected entries and USD conversion', () => {
    const collected = initialFinanceCollections
      .filter((c) => c.status === 'collected')
      .reduce((a, c) => a + c.amount, 0)
    expect(wbrExecutiveSummary.totalCollectionVND).toBe(collected)
    expect(wbrExecutiveSummary.totalCollectionUSD).toBeCloseTo(
      wbrExecutiveSummary.totalCollectionVND / wbrExecutiveSummary.exchangeRateUSD,
      1,
    )
  })
})
