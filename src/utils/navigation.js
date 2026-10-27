// Utility functions for Hash Routing, Deep Linking, and Sharing across Attivo ERP

export const VALID_TABS = [
  "matrix",
  "gantt",
  "wbr",
  "calendar",
  "projects",
  "tender",
  "design",
  "finance",
  "logistics",
  "checklist",
  "maintenance",
  "hubspot",
  "dms",
  "users",
  "flow",
  "telegram",
  "dashboard",
];

// Normalize tab aliases
export function normalizeTab(tab) {
  if (!tab) return "matrix";
  const clean = tab.toLowerCase().replace(/^[#/]+/, "");
  if (clean === "design_sales") return "design";
  if (clean === "schedule") return "maintenance";
  if (clean === "crm") return "hubspot";
  if (clean === "bot" || clean === "telegram_bot") return "telegram";
  if (VALID_TABS.includes(clean)) return clean;
  return "matrix";
}

/**
 * Parse window.location.hash into tab and query params
 * Example: "#projects?id=PRJ-001" -> { tab: "projects", params: { id: "PRJ-001" } }
 * Example: "#/design?task=DST-02" -> { tab: "design", params: { task: "DST-02" } }
 */
export function parseHash(hashString) {
  const hash = hashString || (typeof window !== "undefined" ? window.location.hash : "");
  if (!hash || hash === "#" || hash === "#/") {
    return { tab: "matrix", params: {} };
  }

  // Remove leading # and #/
  const raw = hash.replace(/^#[/]?/, "");
  const [tabPart, queryPart] = raw.split("?");

  const tab = normalizeTab(tabPart);
  const params = {};

  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    for (const [key, val] of searchParams.entries()) {
      params[key] = val;
    }
  }

  return { tab, params };
}

/**
 * Build hash string from tab and query params
 * Example: buildHash("projects", { id: "PRJ-001" }) -> "#projects?id=PRJ-001"
 */
export function buildHash(tab, params = {}) {
  const cleanTab = normalizeTab(tab);
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      searchParams.set(key, val);
    }
  });

  const query = searchParams.toString();
  return query ? `#${cleanTab}?${query}` : `#${cleanTab}`;
}

/**
 * Get full absolute shareable URL for a given tab and entity params
 */
export function getShareableLink(tab, params = {}) {
  if (typeof window === "undefined") return "";
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}${buildHash(tab, params)}`;
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Find matched Project for a given Tender
 */
export function findMatchedProject(tender, projects = []) {
  if (!tender || !projects || projects.length === 0) return null;
  const tProjId = String(tender.projectId || "").trim();
  const tContract = String(tender.contractCode || "").toLowerCase().trim();
  const tName = String(tender.project || "").toLowerCase().trim();

  // 1. Direct projectId
  if (tProjId) {
    const p = projects.find((proj) => String(proj.id) === tProjId);
    if (p) return p;
  }

  // 2. Direct contractCode match (>= 3 chars)
  if (tContract && tContract.length >= 3) {
    const p = projects.find((proj) => {
      const pc = String(proj.contractCode || "").toLowerCase().trim();
      return pc && (pc === tContract || pc.includes(tContract) || tContract.includes(pc));
    });
    if (p) return p;
  }

  // 3. Project name & tokens
  if (tName) {
    // Exact or substring match with project ID
    const byId = projects.find((proj) => {
      const pid = String(proj.id || "").toLowerCase();
      return pid && tName.includes(pid);
    });
    if (byId) return byId;

    // Substring match with project name or contract code in project
    const byName = projects.find((proj) => {
      const pn = String(proj.name || "").toLowerCase().trim();
      const pc = String(proj.contractCode || "").toLowerCase().trim();
      if (pn && (tName.includes(pn) || pn.includes(tName))) return true;
      if (pc && pc.length >= 4 && tName.includes(pc)) return true;
      return false;
    });
    if (byName) return byName;

    // Token match (at least 2 matching words >= 3 chars)
    const byTokens = projects.find((proj) => {
      const pn = String(proj.name || "").toLowerCase().trim();
      const pTokens = pn.split(/[\s,()/-]+/).filter((w) => w.length >= 3);
      if (pTokens.length >= 2) {
        const matches = pTokens.filter((token) => tName.includes(token)).length;
        if (matches >= 2) return true;
      }
      return false;
    });
    if (byTokens) return byTokens;
  }

  return null;
}

/**
 * Find matched Tender for a given Project
 */
export function findMatchedTender(project, tenders = []) {
  if (!project || !tenders || tenders.length === 0) return null;
  const pId = String(project.id || "").trim();
  const pContract = String(project.contractCode || "").toLowerCase().trim();
  const pName = String(project.name || "").toLowerCase().trim();

  // 1. Direct projectId match
  const byId = tenders.find((t) => String(t.projectId || "").trim() === pId);
  if (byId) return byId;

  // 2. Direct contractCode match
  if (pContract && pContract.length >= 3) {
    const byContract = tenders.find((t) => {
      const tc = String(t.contractCode || "").toLowerCase().trim();
      return tc && (tc === pContract || tc.includes(pContract) || pContract.includes(tc));
    });
    if (byContract) return byContract;
  }

  // 3. Name match
  if (pName) {
    const byName = tenders.find((t) => {
      const tp = String(t.project || "").toLowerCase().trim();
      if (!tp) return false;
      if (tp.includes(pName) || pName.includes(tp)) return true;
      const pTokens = pName.split(/[\s,()/-]+/).filter((w) => w.length >= 3);
      if (pTokens.length >= 2) {
        const matches = pTokens.filter((w) => tp.includes(w)).length;
        if (matches >= 2) return true;
      }
      return false;
    });
    if (byName) return byName;
  }

  return null;
}
