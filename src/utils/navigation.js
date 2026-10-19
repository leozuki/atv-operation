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
  "dashboard",
];

// Normalize tab aliases
export function normalizeTab(tab) {
  if (!tab) return "matrix";
  const clean = tab.toLowerCase().replace(/^[#/]+/, "");
  if (clean === "design_sales") return "design";
  if (clean === "schedule") return "maintenance";
  if (clean === "crm") return "hubspot";
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
  } catch (e) {
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
  } catch (err) {
    return false;
  }
}
