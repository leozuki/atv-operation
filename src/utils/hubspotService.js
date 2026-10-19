// src/utils/hubspotService.js
// Integration module with HubSpot CRM (Inherited & optimized from 015e0b8d-a65b-4f31-b4bb-fe81f9f29d20)

export const HUBSPOT_PORTAL_ID = "19642405";

// Pipeline IDs & Stages from real Attivo HubSpot Portal
export const ATTIVO_PIPELINES = {
  DEAL_PIPELINE: {
    id: "default",
    label: "Attivo Pipeline",
    stages: [
      { id: "101276229", label: "Meeting & Presentation", order: 0, color: "bg-blue-100 text-blue-700 border-blue-300" },
      { id: "101276230", label: "Layout/ Proposal", order: 1, color: "bg-purple-100 text-purple-700 border-purple-300" },
      { id: "appointmentscheduled", label: "Quotation", order: 2, color: "bg-amber-100 text-amber-700 border-amber-300" },
      { id: "14304361", label: "Contract Signing", order: 3, color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
      { id: "14304362", label: "Deposited", order: 4, color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
      { id: "closedwon", label: "Closed won", order: 5, color: "bg-teal-100 text-teal-800 border-teal-300" },
      { id: "closedlost", label: "Closed lost", order: 6, color: "bg-rose-100 text-rose-700 border-rose-300" },
    ],
  },
  TECHNICAL_TICKETS: {
    id: "49270822",
    label: "AT Technical Dept",
    stages: [
      { id: "101410822", label: "Service Request - Plan (Dịch vụ yêu cầu - Kế hoạch)", step: 1 },
      { id: "101410823", label: "Assign - Confirm Time & Date (Sắp xếp Kỹ thuật)", step: 2 },
      { id: "101410824", label: "OTW - Queue (Đang di chuyển - Chờ đợi)", step: 3 },
      { id: "101410825", label: "Offline - Services Performed (Đang thực hiện)", step: 4 },
      { id: "101328132", label: "Signed - Done (Xác nhận đã xong)", step: 5 },
      { id: "1311470709", label: "ReAssign-Overdue (Quá hạn)", step: 6 },
    ],
  },
  PARTS_CLAIM_TICKETS: {
    id: "92339554",
    label: "AT CS Parts Claim - Order",
  },
  TENDER_TICKETS: {
    id: "46806317",
    label: "TENDER",
    stages: [
      "Request",
      "Calculation & Draft",
      "Logistic check",
      "Accounting check",
      "Technical check",
      "Manufacturer check",
      "Send Sales Draft & Discuss margin",
      "Finalize -> Send Sales",
    ],
  },
  LOGISTICS_TICKETS: {
    id: "46968759",
    label: "AT Purchasing & Logistics Dept",
    stages: [
      "Purchasing or Shipping Plan",
      "Stock check & Prepare Goods",
      "Optimal Final Plan",
      "Purchasing or Shipping Process",
      "Signed - Done",
    ],
  },
};

// Owner mapping from owners-map.json & live portal settings (HubSpot Portal 19642405)
export const HUBSPOT_OWNERS = {
  // Active Attivo International Personnel (HubSpot Portal 19642405)
  "24038245": { name: "Rajan Nalliah", email: "rajan@attivointl.com", role: "Managing Director" },
  "24007107": { name: "Dominic Pham", email: "dominiclong@attivointl.com", role: "Operations Director" },
  "25529467": { name: "Trung Tech Mgr", email: "cstech@attivointl.com", role: "Technical Head" },
  "90300189": { name: "Trung Tech Mgr", email: "cstech@attivointl.com", role: "Technical Manager" },
  "53366560": { name: "Phuong Thao Nguyen", email: "thao@attivointl.com", role: "Sales Lead" },
  "472995694": { name: "Phuong Thao Nguyen", email: "thao@attivointl.com", role: "Sales Lead" },
  "74552464": { name: "Leo Nguyen", email: "son.nm@attivointl.com", role: "Trưởng Nhóm Marketing & Media" },
  "86248749": { name: "Thảo Vũ", email: "thao.vt@attivointl.com", role: "Quản Lý Quan Hệ Khách Hàng CRM" },
  "78050163": { name: "Marketing Attivo", email: "marketing@attivointl.com", role: "Marketing Lead / Team" },
  "70627258": { name: "Hoai Trinh", email: "hoai@attivointl.com", role: "Sales Lead Miền Nam" },
  "1335377212": { name: "Hoai Trinh", email: "hoai@attivointl.com", role: "Sales Lead Miền Nam" },
  "74514657": { name: "Khánh Nguyễn", email: "khanhnguyen@attivointl.com", role: "Sales Lead Miền Bắc" },
  "1835791357": { name: "Khánh Nguyễn", email: "khanhnguyen@attivointl.com", role: "Sales Lead Miền Bắc" },
  "25529520": { name: "Lương Nguyễn Tuấn Anh", email: "lee@attivointl.com", role: "Kỹ Thuật & Dịch Vụ Bảo Trì HCM" },
  "90301297": { name: "Lương Nguyễn Tuấn Anh", email: "lee@attivointl.com", role: "Kỹ Thuật & Dịch Vụ Bảo Trì HCM" },
  "47939270": { name: "Vy Nguyen Tien", email: "vy@attivointl.com", role: "Sales Lead Miền Bắc" },
  "254471861": { name: "Vy Nguyen Tien", email: "vy@attivointl.com", role: "Sales Lead Miền Bắc" },
  "68481310": { name: "Nam Van", email: "nam@attivointl.com", role: "Sales Lead Miền Bắc" },
  "1776900477": { name: "Nam Van", email: "nam@attivointl.com", role: "Sales Lead Miền Bắc" },
  "60077224": { name: "Linh Nguyen", email: "linhnh@attivointl.com", role: "Sales Pilates Merrithew" },
  "518761142": { name: "Linh Nguyen", email: "linhnh@attivointl.com", role: "Sales & CS" },
  "83718257": { name: "LAM NGUYEN", email: "lam@attivointl.com", role: "Sales Phụ Kiện Fitness" },
  "95841211": { name: "Anh Chu Viet", email: "anh.cv@attivointl.com", role: "Kỹ Thuật Viên Lắp Đặt HN" },
  "98633949": { name: "Tuân Bùi Duy", email: "tuan.bd@attivointl.com", role: "Kỹ Thuật Viên Lắp Đặt HN" },
  "25529458": { name: "Designer Lý Lý", email: "design@attivointl.com", role: "Lead Designer 2D/3D" },
  "51581848": { name: "Lai the Hai", email: "cstech4@attivointl.com", role: "Kỹ Thuật Viên Lắp Đặt HN" },
  "51645172": { name: "Lý Trường Tiến", email: "tienlt@attivointl.com", role: "Kỹ Thuật Viên Lắp Đặt HCM" },
  "51645173": { name: "Bùi Hoàng Thái Châu", email: "chaubht@attivointl.com", role: "Kỹ Thuật Viên Hiện Trường HCM" },
  "51645171": { name: "Nguyễn Ngọc Việt", email: "vietnn@attivointl.com", role: "Kỹ Thuật Viên Hiện Trường HCM" },
  "56649055": { name: "Lê Minh Mẫn", email: "man@attivointl.com", role: "Kỹ Thuật Viên Hiện Trường HCM" },
  "60577130": { name: "Nguyễn Minh Tâm", email: "warehouse@attivointl.com", role: "Thủ Kho Đông Anh (HN)" },
  "71609395": { name: "Quốc Việt Phạm", email: "warehouse.hcm@attivointl.com", role: "Thủ Kho Bình Dương (HCM)" },
  "60414615": { name: "La Can", email: "accounts@attivointl.com", role: "Kế Toán Trưởng & Collections" },
  "92510192": { name: "s.s sebastian", email: "cambodia@attivointl.com", role: "Giám Đốc Chi Nhánh Cambodia" },
  "96241632": { name: "Hanna Tạ", email: "hanna.ta@attivointl.com", role: "Sales VIP" },
};

/** Get direct link to HubSpot record */
export function getHubspotRecordUrl(type, id) {
  if (!id) return "#";
  const typeMap = {
    contact: "0-1",
    deal: "0-3",
    ticket: "0-5",
    company: "0-2",
  };
  const objType = typeMap[type] || "0-3";
  return `https://app.hubspot.com/contacts/${HUBSPOT_PORTAL_ID}/record/${objType}/${id}`;
}

export function getOwnerName(id) {
  if (!id) return "Chưa phân công";
  return HUBSPOT_OWNERS[String(id)]?.name || `Owner ${id}`;
}

export function getDealStageLabel(stageId) {
  const map = {
    "101276229": "Meeting & Presentation",
    "101276230": "Layout/ Proposal",
    "appointmentscheduled": "Quotation",
    "14304361": "Contract Signing",
    "14304362": "Deposited",
    "closedwon": "Closed won",
    "closedlost": "Closed lost",
  };
  return map[stageId] || stageId;
}

export function getTicketStageLabel(stageId) {
  const map = {
    "101410822": "Service Request - Plan (Kế hoạch)",
    "101410823": "Assign - Confirm Time & Date (Sắp xếp KTV)",
    "101410824": "OTW - Queue (Đang di chuyển)",
    "101410825": "Offline - Services Performed (Đang thực hiện)",
    "101328132": "Signed - Done (Đã hoàn tất & Ký)",
    "1311470709": "ReAssign-Overdue (Quá hạn)",
  };
  return map[stageId] || stageId;
}

/** Check if deal originates from Marketing (SOP from 015e0b8d-a65b-4f31-b4bb-fe81f9f29d20) */
export function isMarketingDeal(deal) {
  if (!deal) return false;
  if (deal.source === "Marketing") return true;
  const ownerId = String(deal.ownerId || deal.hubspot_owner_id || "");
  const marketingOwnerIds = ["86248749", "78050163", "472995694"];
  if (marketingOwnerIds.includes(ownerId)) return true;
  if (deal.contactOwner?.includes("Marketing") || deal.contactOwner?.includes("thao.vt") || deal.contactOwner?.includes("thao@")) return true;
  const channel = (deal.contactChannel || "").toLowerCase();
  const mktChannels = ["facebook", "website", "instagram", "tiktok", "google_paid", "hotline", "event", "voucher"];
  return mktChannels.some((m) => channel.includes(m));
}

// ===== LIVE FETCH METHODS VIA PROXY WITH RATE LIMIT RETRY =====

async function safeHubspotPost(url, body, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 429) {
        // Rate limited, wait 1200ms before retrying
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          continue;
        }
      }
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        // Client errors (bad token, bad request) will not succeed on retry.
        err.retryable = res.status === 429 || res.status >= 500;
        throw err;
      }
      return await res.json();
    } catch (err) {
      if (attempt >= retries || err.retryable === false) throw err;
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
}

export async function fetchHubspotLiveDeals(limit = 40) {
  try {
    const data = await safeHubspotPost("/api/hubspot/crm/v3/objects/deals/search", {
      filterGroups: [{
        filters: [{ propertyName: "pipeline", operator: "EQ", value: "default" }]
      }],
      sorts: [{ propertyName: "hs_lastmodifieddate", direction: "DESCENDING" }],
      properties: ["dealname", "amount", "dealstage", "pipeline", "hubspot_owner_id", "createdate", "hs_lastmodifieddate", "closedate"],
      limit,
    });
    if (!data || !data.results) return [];
    return data.results.map((d) => {
      const p = d.properties;
      const stageLabel = getDealStageLabel(p.dealstage);
      const ownerName = getOwnerName(p.hubspot_owner_id);
      const isMkt = isMarketingDeal({ ...p, ownerId: p.hubspot_owner_id });
      return {
        id: d.id,
        dealId: d.id,
        dealName: p.dealname || "Chưa có tên",
        amount: Number(p.amount) || 0,
        stage: stageLabel,
        stageId: p.dealstage,
        owner: ownerName,
        ownerId: p.hubspot_owner_id,
        source: isMkt ? "Marketing" : "Sales Direct",
        isMarketing: isMkt,
        pipeline: "Attivo Pipeline",
        createdAt: p.createdate,
        lastModified: p.hs_lastmodifieddate,
        hubspotUrl: getHubspotRecordUrl("deal", d.id),
      };
    });
  } catch (err) {
    console.warn("[HubSpot Live] Could not fetch live deals:", err.message);
    return null;
  }
}

export async function fetchHubspotLiveTickets(limit = 30) {
  try {
    const data = await safeHubspotPost("/api/hubspot/crm/v3/objects/tickets/search", {
      filterGroups: [{
        filters: [{ propertyName: "hs_pipeline", operator: "EQ", value: "49270822" }]
      }],
      sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
      properties: ["subject", "hs_ticket_priority", "hs_pipeline_stage", "hs_pipeline", "hubspot_owner_id", "createdate", "content"],
      limit,
    });
    if (!data || !data.results) return [];
    return data.results.map((t) => {
      const p = t.properties;
      const stageName = getTicketStageLabel(p.hs_pipeline_stage);
      const assignedTo = getOwnerName(p.hubspot_owner_id);
      return {
        ticketId: t.id,
        id: t.id,
        subject: p.subject || "Yêu cầu kỹ thuật",
        facility: p.subject?.split("|")[1]?.trim() || "Cơ sở Attivo",
        pipeline: "AT Technical Dept",
        pipelineId: "49270822",
        stage: stageName,
        stageId: p.hs_pipeline_stage,
        assignedTo,
        ownerId: p.hubspot_owner_id,
        priority: p.hs_ticket_priority || "MEDIUM",
        createdDate: p.createdate ? p.createdate.slice(0, 10) : "",
        notes: p.content || "",
        hubspotUrl: getHubspotRecordUrl("ticket", t.id),
      };
    });
  } catch (err) {
    console.warn("[HubSpot Live] Could not fetch live tickets:", err.message);
    return null;
  }
}

export async function fetchHubspotLiveContacts(limit = 30) {
  try {
    const data = await safeHubspotPost("/api/hubspot/crm/v3/objects/contacts/search", {
      filterGroups: [{
        filters: [{ propertyName: "sales_division", operator: "EQ", value: "Attivo" }]
      }],
      sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
      properties: ["firstname", "lastname", "email", "phone", "company", "contact_channel", "hubspot_owner_id", "sales_division", "lifecyclestage"],
      limit,
    });
    if (!data || !data.results) return [];
    return data.results.map((c) => {
      const p = c.properties;
      const name = [p.firstname, p.lastname].filter(Boolean).join(" ") || "Khách hàng";
      const channel = p.contact_channel || "Direct";
      const isMkt = isMarketingDeal({ contactChannel: channel, ownerId: p.hubspot_owner_id });
      return {
        contactId: c.id,
        id: c.id,
        name,
        email: p.email || "",
        phone: p.phone || "",
        company: p.company || "Cá nhân / Doanh nghiệp",
        channel,
        isMarketing: isMkt,
        owner: getOwnerName(p.hubspot_owner_id),
        hubspotUrl: getHubspotRecordUrl("contact", c.id),
      };
    });
  } catch (err) {
    console.warn("[HubSpot Live] Could not fetch live contacts:", err.message);
    return null;
  }
}

