import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  HUBSPOT_PORTAL_ID,
  HUBSPOT_OWNERS,
  getHubspotRecordUrl,
  getOwnerName,
  getDealStageLabel,
  getTicketStageLabel,
  isMarketingDeal,
  fetchHubspotLiveDeals,
  fetchHubspotLiveTickets,
  fetchHubspotLiveContacts,
} from '../src/utils/hubspotService.js'

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
})

describe('pure helpers', () => {
  it('builds record URLs per object type', () => {
    expect(getHubspotRecordUrl('deal', '123')).toBe(
      `https://app.hubspot.com/contacts/${HUBSPOT_PORTAL_ID}/record/0-3/123`,
    )
    expect(getHubspotRecordUrl('contact', '1')).toContain('/record/0-1/1')
    expect(getHubspotRecordUrl('ticket', '1')).toContain('/record/0-5/1')
    expect(getHubspotRecordUrl('unknown', '1')).toContain('/record/0-3/1')
    expect(getHubspotRecordUrl('deal', '')).toBe('#')
  })

  it('resolves owner names from string or number ids', () => {
    expect(getOwnerName('24007107')).toBe('Dominic Pham')
    expect(getOwnerName(24007107)).toBe('Dominic Pham')
    expect(getOwnerName('999')).toBe('Owner 999')
    expect(getOwnerName(null)).toBe('Chưa phân công')
  })

  it('maps stage ids and passes unknown ids through', () => {
    expect(getDealStageLabel('closedwon')).toBe('Closed won')
    expect(getDealStageLabel('xyz')).toBe('xyz')
    expect(getTicketStageLabel('101328132')).toMatch(/^Signed - Done/)
    expect(getTicketStageLabel('xyz')).toBe('xyz')
  })

  it('every owner entry has a name and an attivo email', () => {
    for (const [id, owner] of Object.entries(HUBSPOT_OWNERS)) {
      expect(owner.name, id).toBeTruthy()
      expect(owner.email, id).toMatch(/@attivointl\.com$/)
    }
  })
})

describe('isMarketingDeal', () => {
  it.each([
    [{ source: 'Marketing' }, true],
    [{ ownerId: '86248749' }, true],
    [{ hubspot_owner_id: 78050163 }, true],
    [{ contactOwner: 'Marketing Attivo' }, true],
    [{ contactChannel: 'Facebook_Chat' }, true],
    [{ contactChannel: 'Google_Paid Search' }, true],
    [{ contactChannel: 'Referral', ownerId: '24038245' }, false],
    [{}, false],
    [null, false],
  ])('%j -> %s', (deal, expected) => {
    expect(isMarketingDeal(deal)).toBe(expected)
  })
})

describe('live fetch via proxy', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('maps deals and POSTs to the proxy path without sending a token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        results: [
          {
            id: '42',
            properties: {
              dealname: 'Grab HQ',
              amount: '1500000000',
              dealstage: 'closedwon',
              hubspot_owner_id: '86248749',
            },
          },
          { id: '43', properties: { amount: null, dealstage: '14304361', hubspot_owner_id: '24038245' } },
        ],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const deals = await fetchHubspotLiveDeals(5)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/hubspot/crm/v3/objects/deals/search')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBeUndefined()
    expect(JSON.parse(init.body).limit).toBe(5)

    expect(deals[0]).toMatchObject({
      dealId: '42',
      dealName: 'Grab HQ',
      amount: 1500000000,
      stage: 'Closed won',
      owner: 'Thảo Vũ',
      source: 'Marketing',
      isMarketing: true,
    })
    expect(deals[1]).toMatchObject({ dealName: 'Chưa có tên', amount: 0, source: 'Sales Direct' })
  })

  it('maps tickets and extracts facility from subject', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          results: [
            {
              id: '7',
              properties: {
                subject: 'Tây Ninh | Cana Pilates | ATVE25135',
                hs_pipeline_stage: '101410822',
                createdate: '2026-10-04T08:00:00Z',
              },
            },
            { id: '8', properties: {} },
          ],
        }),
      ),
    )

    const [t1, t2] = await fetchHubspotLiveTickets()
    expect(t1).toMatchObject({ facility: 'Cana Pilates', createdDate: '2026-10-04', priority: 'MEDIUM' })
    expect(t2).toMatchObject({ subject: 'Yêu cầu kỹ thuật', facility: 'Cơ sở Attivo', createdDate: '' })
  })

  it('maps contacts and joins names', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          results: [
            { id: '1', properties: { firstname: 'Vũ', lastname: 'Nguyễn', contact_channel: 'Website' } },
            { id: '2', properties: {} },
          ],
        }),
      ),
    )

    const [c1, c2] = await fetchHubspotLiveContacts()
    expect(c1).toMatchObject({ name: 'Vũ Nguyễn', isMarketing: true })
    expect(c2).toMatchObject({ name: 'Khách hàng', channel: 'Direct', isMarketing: false })
  })

  it('returns [] when the response has no results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({})))
    expect(await fetchHubspotLiveDeals()).toEqual([])
  })

  it('retries after a 429 and succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 429))
      .mockResolvedValueOnce(jsonResponse({ results: [] }))
    vi.stubGlobal('fetch', fetchMock)

    const promise = fetchHubspotLiveDeals()
    await vi.advanceTimersByTimeAsync(1200)

    expect(await promise).toEqual([])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('returns null after exhausting retries on network failure', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'))
    vi.stubGlobal('fetch', fetchMock)

    const promise = fetchHubspotLiveTickets()
    await vi.advanceTimersByTimeAsync(5000)

    expect(await promise).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(console.warn).toHaveBeenCalled()
  })

  it('does not retry client errors such as 401', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, 401))
    vi.stubGlobal('fetch', fetchMock)

    expect(await fetchHubspotLiveContacts()).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries server errors such as 503', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 503))
      .mockResolvedValueOnce(jsonResponse({ results: [] }))
    vi.stubGlobal('fetch', fetchMock)

    const promise = fetchHubspotLiveContacts()
    await vi.advanceTimersByTimeAsync(800)

    expect(await promise).toEqual([])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
