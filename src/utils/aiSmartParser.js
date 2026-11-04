// ============================================================================
// ATTIVO AI SMART INTAKE & CROSS-MODULE AUTO-ALLOCATION ENGINE
// Parses free-form Vietnamese or English project briefs, meeting notes, or Zalo
// messages and automatically prepares linked records across all ERP modules:
// Projects, Tenders (BOQ), Design 2D/3D, Finance, Logistics PO, Tech Schedule,
// and Installation Checklists.
// ============================================================================

const REAL_SALES = [
  { name: "Khánh Nguyễn", keywords: ["khánh nguyễn", "khanh nguyen", "khánh", "khanh"] },
  { name: "Hoài Trịnh", keywords: ["hoài trịnh", "hoai trinh", "ms hoài", "ms. hoai", "hoài", "hoai"] },
  { name: "Vy Nguyễn", keywords: ["vy nguyễn", "vy nguyen", "vy"] },
  { name: "Linh Nguyễn", keywords: ["linh nguyễn", "linh nguyen", "linh"] },
  { name: "Sơn Nguyễn", keywords: ["sơn nguyễn", "son nguyen", "sơn", "son"] },
  { name: "Nam Văn", keywords: ["nam văn", "nam van"] },
  { name: "Bình Nguyễn", keywords: ["bình nguyễn", "binh nguyen"] },
  { name: "Nga Nguyễn", keywords: ["nga nguyễn", "nga nguyen"] },
];

const REAL_TECHS = [
  { name: "Lương Nguyễn Tuấn Anh", short: "Tuấn Anh", region: "HCM", keywords: ["tuấn anh", "tuan anh", "lương nguyễn tuấn anh"] },
  { name: "Bùi Hoàng Thái Châu", short: "Thái Châu", region: "HCM", keywords: ["thái châu", "thai chau", "bùi hoàng thái châu"] },
  { name: "Lý Trường Tiến", short: "Lý Tiến", region: "HCM", keywords: ["trường tiến", "truong tien", "lý tiến", "ly tien", "lý trường tiến"] },
  { name: "Lê Minh Mẫn", short: "Minh Mẫn", region: "HCM", keywords: ["minh mẫn", "minh man", "lê minh mẫn"] },
  { name: "Anh Chu Việt", short: "Anh Chu Việt", region: "HN", keywords: ["anh chu việt", "anh chu viet", "chu việt", "chu viet"] },
  { name: "Tuân Bùi Duy", short: "Tuân Bùi Duy", region: "HN", keywords: ["tuân bùi duy", "tuan bui duy", "tuân duy", "tuan duy"] },
  { name: "Lại Thế Hải", short: "Lại Thế Hải", region: "HN", keywords: ["lại thế hải", "lai the hai", "thế hải"] },
];

const BRANDS = [
  "Precor",
  "Merrithew",
  "Ziva",
  "Skelcore",
  "Eleiko",
  "Woodway",
  "Assault",
  "Concept2",
  "Hoist",
  "Paviflex",
  "Adidas",
  "Inbody",
];

const HN_KEYWORDS = [
  "hà nội", "hanoi", "hn", "đông anh", "dong anh", "hải phòng", "hai phong",
  "cát bà", "cat ba", "quảng ninh", "hạ long", "tây hồ", "tay ho", "cầu giấy",
  "cau giay", "hoàn kiếm", "đống đa", "ba đình", "thanh xuân", "long biên",
  "hưng yên", "bắc ninh", "vĩnh phúc", "sapa", "lào cai", "miền bắc", "northern",
];

const HCM_KEYWORDS = [
  "hcm", "tp.hcm", "hồ chí minh", "sài gòn", "saigon", "quận 1", "quận 2", "quận 3",
  "quận 7", "thảo điền", "thao dien", "phú mỹ hưng", "phu my hung", "thủ đức", "thu duc",
  "bình dương", "binh duong", "tây ninh", "tay ninh", "đà lạt", "da lat", "nha trang",
  "đà nẵng", "da nang", "phú quốc", "phu quoc", "vũng tàu", "cát lái", "cat lai",
  "mộc bài", "moc bai", "campuchia", "cambodia", "phnom penh", "miền nam", "southern",
];

/**
 * Parse Vietnamese / English currency strings like "2.4 tỷ", "850 triệu", "450tr", "1,250,000,000", "925.9M"
 */
export function parseCurrencyAmounts(text) {
  if (!text) return [];
  const results = [];

  // Match "X tỷ Y triệu" e.g. "1 tỷ 250 triệu"
  const tyTrieuRegex = /(\d+(?:[.,]\d+)?)\s*tỷ\s*(\d+(?:[.,]\d+)?)\s*(?:triệu|tr\b)/gi;
  let m;
  while ((m = tyTrieuRegex.exec(text)) !== null) {
    const ty = parseFloat(m[1].replace(",", "."));
    const tr = parseFloat(m[2].replace(",", "."));
    const val = Math.round((ty * 1_000_000_000) + (tr * 1_000_000));
    results.push({ raw: m[0], value: val, index: m.index });
  }

  // Match "X tỷ" / "X.XXB"
  const tyRegex = /(\d+(?:[.,]\d+)?)\s*(?:tỷ|tỉ|b\s*vnd|billion)/gi;
  while ((m = tyRegex.exec(text)) !== null) {
    const num = parseFloat(m[1].replace(",", "."));
    const val = Math.round(num * 1_000_000_000);
    if (!results.some((r) => Math.abs(r.index - m.index) < 5)) {
      results.push({ raw: m[0], value: val, index: m.index });
    }
  }

  // Match "X triệu" / "X tr" / "XM VND"
  const trieuRegex = /(\d+(?:[.,]\d+)?)\s*(?:triệu|tr\b|m\s*vnd|million)/gi;
  while ((m = trieuRegex.exec(text)) !== null) {
    const num = parseFloat(m[1].replace(",", "."));
    const val = Math.round(num * 1_000_000);
    if (!results.some((r) => Math.abs(r.index - m.index) < 8)) {
      results.push({ raw: m[0], value: val, index: m.index });
    }
  }

  return results.sort((a, b) => a.index - b.index);
}

/**
 * Find if the text refers to an existing project in `projects`
 */
export function findMatchingProject(text, projects = []) {
  if (!text || !projects.length) return null;
  const lower = text.toLowerCase();

  // Check explicit PRJ-XXX code first
  const prjCodeMatch = text.match(/\b(PRJ-\d{3})\b/i);
  if (prjCodeMatch) {
    const code = prjCodeMatch[1].toUpperCase();
    const byCode = projects.find((p) => p.id.toUpperCase() === code);
    if (byCode) return byCode;
  }

  // If text explicitly says "Dự án mới" / "New project" / "Tạo dự án", treat as new project unless an exact ID is given
  if (/(?:dự án mới|tạo dự án mới|khởi tạo dự án|new project|create project)/i.test(text)) {
    return null;
  }

  // Score existing projects by name/customer/contractCode keyword overlap
  let bestMatch = null;
  let bestScore = 0;

  const aliases = {
    "PRJ-001": ["cà na", "ca na", "cana", "tây ninh", "hùng duy"],
    "PRJ-002": ["chateau", "savills", "lê quốc vinh", "mr. vinh"],
    "PRJ-003": ["grab", "mapletree"],
    "PRJ-004": ["fulton", "fullton", "chùa vua"],
    "PRJ-005": ["flamingo", "cát bà", "cat ba"],
    "PRJ-006": ["vinhomes", "park 7", "l6 vinhomes"],
    "PRJ-007": ["skelcore flagship", "showroom skelcore"],
    "PRJ-008": ["go gym", "gogym", "campuchia", "cambodia"],
    "PRJ-009": ["park city", "anh tùng", "ch03"],
    "PRJ-010": ["prive", "đất xanh", "dat xanh"],
    "PRJ-011": ["ocean breath", "thảo điền"],
    "PRJ-012": ["waiki", "ktg", "đà lạt"],
    "PRJ-013": ["công viên", "hồ thiên nga"],
    "PRJ-016": ["đh quốc gia", "đhqg", "anh thành đh", "đh hcm"],
    "PRJ-019": ["dũng nguyễn", "mr. dũng"],
    "PRJ-020": ["2f nguyễn thành ý", "nguyễn thành ý"],
  };

  for (const p of projects) {
    let score = 0;
    const pName = (p.name || "").toLowerCase();
    if (pName && lower.includes(pName)) score += 10;

    const pAliases = aliases[p.id] || [];
    for (const alias of pAliases) {
      if (lower.includes(alias)) score += 6;
    }

    if (p.contractCode && lower.includes(p.contractCode.toLowerCase())) {
      score += 8;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = p;
    }
  }

  return bestScore >= 6 ? bestMatch : null;
}

/**
 * Main AI Smart Intake Parser
 * Returns a complete structured allocation plan across all ERP modules.
 */
export function parseSmartInput(rawText, { projects = [], currentUser = null } = {}) {
  const text = (rawText || "").trim();
  if (!text) return null;

  const lower = text.toLowerCase();
  const matchedProject = findMatchingProject(text, projects);
  const isNewProject = !matchedProject;

  // 1. Detect Region (HCM vs HN)
  let region = matchedProject?.region || "HCM";
  const hnHits = HN_KEYWORDS.filter((k) => lower.includes(k)).length;
  const hcmHits = HCM_KEYWORDS.filter((k) => lower.includes(k)).length;
  if (hnHits > hcmHits) region = "HN";
  else if (hcmHits > hnHits) region = "HCM";

  // 2. Detect Brands
  const detectedBrands = BRANDS.filter((b) => lower.includes(b.toLowerCase()));
  const brandStr =
    detectedBrands.length > 0
      ? detectedBrands.join(" / ")
      : matchedProject?.brand || "Precor / Ziva";

  // 3. Detect Sales Owner
  let leadSale = matchedProject?.leadSale || currentUser?.name || "Khánh Nguyễn";
  if (!REAL_SALES.some((s) => s.name === leadSale)) {
    leadSale = "Khánh Nguyễn";
  }
  for (const s of REAL_SALES) {
    if (s.keywords.some((kw) => lower.includes(kw))) {
      leadSale = s.name;
      break;
    }
  }

  // 4. Detect Technicians
  const matchedTechs = REAL_TECHS.filter((t) =>
    t.keywords.some((kw) => lower.includes(kw))
  );
  const defaultTechs =
    region === "HN"
      ? "Anh Chu Việt, Tuân Bùi Duy"
      : "Lương Nguyễn Tuấn Anh, Bùi Hoàng Thái Châu";
  const assignedTech =
    matchedTechs.length > 0
      ? matchedTechs.map((t) => t.name).join(", ")
      : matchedProject?.assignedTech || defaultTechs;

  // 5. Detect Phone & Contact / Customer
  const phoneMatch = text.match(/(0\d{9}|\+84\d{9})/);
  const phone = phoneMatch ? phoneMatch[1] : "";

  let customerName = matchedProject?.customer || "";
  if (!customerName) {
    const custPatterns = [
      /(?:khách hàng|chủ đầu tư|cđt|client|customer|contact)\s*[:\-]?\s*([A-ZÀ-Ỹa-zà-ỹ0-9\s.&()-]{3,40}?)(?=[,.;\n]|sđt|điện thoại|tại|địa chỉ|gói|trị giá|giá trị|$)/i,
      /\b((?:Mr\.|Ms\.|Mrs\.|Anh|Chị)\s+[A-ZÀ-Ỹ][a-zà-ỹ]+(?:\s+[A-ZÀ-Ỹ][a-zà-ỹ]+){0,2})/i,
    ];
    for (const pat of custPatterns) {
      const m = text.match(pat);
      if (m && m[1]) {
        customerName = m[1].trim();
        break;
      }
    }
  }
  if (!customerName) customerName = "Chủ Đầu Tư Dự Án";

  // 6. Extract Project Name (if new project)
  let projectName = matchedProject?.name || "";
  if (!projectName) {
    const namePatterns = [
      /(?:dự án mới|dự án|tên dự án|project|공장)\s*[:\-]?\s*([^\n,.;]{4,55})/i,
      /^([^\n,.;:]{5,50}?)(?=\s*[-–—,:]|\s+tại\s+|\s+khách\s+)/i,
    ];
    for (const pat of namePatterns) {
      const m = text.match(pat);
      if (m && m[1]) {
        projectName = m[1]
          .replace(/^(mới|new)\s*[:\-]?\s*/i, "")
          .trim();
        break;
      }
    }
    if (!projectName) {
      projectName = text.split(/[.,;\n]/)[0].slice(0, 48).trim() || "Dự Án Gym & Fitness Mới";
    }
  }

  // 7. Extract Address
  let address = matchedProject?.address || "";
  if (!address) {
    const addrMatch = text.match(/(?:địa chỉ|tại|ở|location|address)\s*[:\-]?\s*([^\n.;]{5,65})/i);
    if (addrMatch && addrMatch[1]) {
      address = addrMatch[1].split(/,\s*(?:khách|cđt|gói|trị giá|cọc|sđt)/i)[0].trim();
    } else {
      address = region === "HN" ? "Hà Nội" : "TP. Hồ Chí Minh";
    }
  }

  // 8. Parse Monetary Values (Contract Value vs Deposit / Collection)
  const amounts = parseCurrencyAmounts(text);
  let contractValue = matchedProject?.totalValue || 0;
  let collectionAmount = 0;

  // Check if specific amount is preceded by "trị giá/hợp đồng/gói" vs "cọc/thu/chuyển khoản/thanh toán"
  for (const item of amounts) {
    const precedingContext = text.slice(Math.max(0, item.index - 42), item.index).toLowerCase();
    if (/(?:trị giá|giá trị|hợp đồng|báo giá|boq|gói|tổng|value|contract|quote)/i.test(precedingContext)) {
      if (!contractValue || isNewProject) contractValue = item.value;
    } else if (/(?:cọc|đặt cọc|thu|chuyển khoản|thanh toán|unc|đợt 1|đợt 2|đợt 3|deposit|paid|collected)/i.test(precedingContext)) {
      if (!collectionAmount) collectionAmount = item.value;
    }
  }

  // Fallback assignment if amounts exist
  if (amounts.length >= 2 && (!contractValue || !collectionAmount)) {
    const sortedDesc = [...amounts].sort((a, b) => b.value - a.value);
    if (!contractValue) contractValue = sortedDesc[0].value;
    if (!collectionAmount) collectionAmount = sortedDesc[1].value;
  } else if (amounts.length === 1) {
    const onlyVal = amounts[0].value;
    const hasPayWords = /(?:đã cọc|vừa cọc|chuyển khoản|thu tiền|thanh toán đợt|nhận cọc|unc)/i.test(lower);
    if (hasPayWords && !isNewProject) {
      collectionAmount = onlyVal;
    } else if (isNewProject) {
      contractValue = onlyVal;
      // Check percentage deposit e.g. "cọc 30%"
      const pctMatch = text.match(/cọc\s*(?:đợt\s*\d\s*)?(\d{1,2})\s*%/i);
      if (pctMatch) {
        collectionAmount = Math.round((contractValue * Number(pctMatch[1])) / 100);
      }
    } else {
      collectionAmount = onlyVal;
    }
  } else if (isNewProject && contractValue > 0 && !collectionAmount) {
    const pctMatch = text.match(/cọc\s*(?:đợt\s*\d\s*)?(\d{1,2})\s*%/i);
    if (pctMatch) {
      collectionAmount = Math.round((contractValue * Number(pctMatch[1])) / 100);
    }
  }

  if (isNewProject && !contractValue) {
    contractValue = 1_250_000_000; // Default 1.25B VND for new commercial project if unspecified
  }

  // 9. Detect Stage & Progress
  let stage = matchedProject?.stage || "site_prep";
  let progressDelta = 0;
  let marketingReady = matchedProject?.marketingReady || false;

  if (/(?:bàn giao|nghiệm thu xong|hoàn thành 100%|handover|completed)/i.test(lower)) {
    stage = "accepted";
    progressDelta = 15;
  } else if (/(?:đang lắp|lắp đặt|thi công lắp|installation)/i.test(lower)) {
    stage = "installation";
    progressDelta = 10;
  } else if (/(?:mặt bằng|khảo sát|site prep|quay flycam|marketing ready)/i.test(lower)) {
    if (isNewProject) stage = "site_prep";
    progressDelta = 5;
  } else if (/(?:đã ký hđ|ký hợp đồng|đã cọc|chốt deal|closed won)/i.test(lower)) {
    stage = "site_prep";
    progressDelta = 10;
  }

  if (/(?:marketing|flycam|quay chụp|chụp ảnh|media)/i.test(lower)) {
    marketingReady = true;
  }

  // 10. Determine Which Downstream Modules Should Be Allocated
  const allocations = [];

  // Module 1: Project (Create New OR Update Existing + Add Note)
  allocations.push({
    module: "projects",
    moduleLabel: isNewProject ? "Danh Sách Dự Án & Tiến Độ Tổng Thể" : "Cập Nhật Dự Án & Ghi Chú Tiến Độ",
    actionType: isNewProject ? "create" : "update",
    badge: isNewProject ? "Khởi tạo Dự án mới" : `Cập nhật ${matchedProject.id}`,
    summary: isNewProject
      ? `${projectName} • CĐT: ${customerName} • Khu vực: ${region} • Sale: ${leadSale}`
      : `${matchedProject.name} (${matchedProject.id}) • Ghi nhận Note vận hành & đồng bộ trạng thái`,
    enabled: true,
  });

  // Module 2: Tender / BOQ Quotation
  const hasTenderIntent =
    isNewProject ||
    /(?:báo giá|boq|hợp đồng|hđ|thầu|tender|quote|contract|trị giá)/i.test(lower);
  if (hasTenderIntent && contractValue > 0) {
    const valueBeforeVat = Math.round(contractValue / 1.08);
    const vatAmount = contractValue - valueBeforeVat;
    allocations.push({
      module: "tender",
      moduleLabel: "Báo Giá & Hợp Đồng (BOQ / Tender)",
      actionType: "create",
      badge: "Tự động tạo BOQ & HĐ",
      summary: `Gói thiết bị ${brandStr} • Tổng: ${(contractValue / 1e9).toFixed(2)} Tỷ VNĐ (Trước VAT: ${(valueBeforeVat / 1e9).toFixed(2)} Tỷ)`,
      data: {
        value: contractValue,
        valueBeforeVat,
        vatAmount,
        brand: brandStr,
        status: /(?:đã ký|đã cọc|chốt)/i.test(lower) ? "Hoàn thành" : "Đang làm",
      },
      enabled: true,
    });
  }

  // Module 3: Design 2D/3D (Designer Lý)
  const hasDesignIntent =
    isNewProject ||
    /(?:2d|3d|layout|bản vẽ|thiết kế|phối cảnh|render|cad|dwg|lý\b)/i.test(lower);
  if (hasDesignIntent) {
    allocations.push({
      module: "design",
      moduleLabel: "Thiết Kế 2D/3D (Giao Designer Lý)",
      actionType: "create",
      badge: "Giao việc Designer Lý",
      summary: `Bố trí Layout 2D CAD & Phối cảnh 3D (${brandStr}) • Sale: ${leadSale} • Designer: Lý`,
      data: {
        designer2D: "Lý",
        designer3D: "Lý",
        sale: leadSale,
        status: /(?:xong 2d|duyệt 2d|chốt 3d)/i.test(lower) ? "Hoàn thành" : "Đang vẽ 2D/3D",
      },
      enabled: true,
    });
  }

  // Module 4: Finance & Collections
  const hasFinanceIntent =
    collectionAmount > 0 ||
    /(?:thu tiền|đặt cọc|chuyển khoản|thanh toán|unc|công nợ)/i.test(lower);
  if (hasFinanceIntent) {
    const finalColAmount = collectionAmount || Math.round(contractValue * 0.3);
    const bankMatch = text.match(/\b(TCB|VCB|MB|ACB|VPB|BIDV|Techcombank|Vietcombank)\b/i);
    const bank = bankMatch ? bankMatch[1].toUpperCase() : "TCB";
    allocations.push({
      module: "finance",
      moduleLabel: "Tài Chính & Sổ Thu Tiền (Finance Hub)",
      actionType: "create",
      badge: "Ghi sổ thu tiền / Cọc",
      summary: `Khoản thu: ${(finalColAmount / 1e6).toFixed(1)} Triệu VNĐ • Ngân hàng: ${bank} • Đối soát: Kế toán La Cẩn`,
      data: {
        amount: finalColAmount,
        bank,
        type: /(?:đợt 2)/i.test(lower)
          ? "Thanh toán đợt 2"
          : /(?:đợt 3|nghiệm thu|cuối)/i.test(lower)
          ? "Thanh toán nghiệm thu (10%)"
          : "Tạm ứng / Cọc đợt 1 (30%)",
      },
      enabled: true,
    });
  }

  // Module 5: Logistics & Warehouse PO
  const hasLogisticsIntent =
    /(?:po\b|cont|container|nhập kho|xuất kho|hải quan|cảng|thiếu hàng|linh kiện|kho bình dương|kho đông anh|kho bd|kho đa|uls-at|me-at)/i.test(lower);
  if (hasLogisticsIntent) {
    const poMatch = text.match(/\b((?:ULS|ME|PO)-?[A-Z0-9-]+)\b/i);
    const poCode = poMatch ? poMatch[1].toUpperCase() : `ULS-AT26-${String(Date.now()).slice(-2)}`;
    const warehouse = region === "HN" ? "Đông Anh (HN)" : "Bình Dương (HCM)";
    const isShortage = /(?:thiếu|sót|shortage|bù|vỡ|móp|lỗi)/i.test(lower);
    allocations.push({
      module: "logistics",
      moduleLabel: "Vận Chuyển & Kho Vận (Logistics PO)",
      actionType: "create",
      badge: isShortage ? "Cảnh báo Kho / Thiếu hàng" : `Lô hàng PO (${warehouse})`,
      summary: `Mã PO: ${poCode} (${brandStr}) • Kho: ${warehouse}${isShortage ? " • Gắn cờ cảnh báo thiếu linh kiện" : ""}`,
      data: {
        poCode,
        warehouse: region === "HN" ? "DA" : "BD",
        warehouseLabel: warehouse,
        isShortage,
      },
      enabled: true,
    });
  }

  // Module 6: Field Tech Schedule & Installation Checklist
  const hasTechIntent =
    isNewProject ||
    matchedTechs.length > 0 ||
    /(?:ktv|kỹ thuật|lắp đặt|bảo trì|bảo dưỡng|khảo sát|cân chỉnh|kiểm tra|thứ 2|thứ 3|thứ 4|thứ 5|thứ 6|thứ 7|hôm nay|ngày mai)/i.test(lower);
  if (hasTechIntent) {
    let dayLabel = "Thứ 2 (19/10)";
    if (/thứ\s*3|t3|ngày mai|20\/10/i.test(lower)) dayLabel = "Thứ 3 (20/10)";
    else if (/thứ\s*4|t4|21\/10/i.test(lower)) dayLabel = "Thứ 4 (21/10)";
    else if (/thứ\s*5|t5|22\/10/i.test(lower)) dayLabel = "Thứ 5 (22/10)";
    else if (/thứ\s*6|t6|23\/10/i.test(lower)) dayLabel = "Thứ 6 (23/10)";
    else if (/thứ\s*7|t7|24\/10/i.test(lower)) dayLabel = "Thứ 7 (24/10)";

    allocations.push({
      module: "maintenance",
      moduleLabel: "Lịch Kỹ Thuật & Checklist Lắp Đặt",
      actionType: "create",
      badge: `Điều phối KTV (${region})`,
      summary: `Phân công: ${assignedTech} • Lịch: ${dayLabel}${isNewProject ? " • Khởi tạo 8 hạng mục Checklist SOP" : ""}`,
      data: {
        tech: assignedTech,
        dayLabel,
        region,
      },
      enabled: true,
    });
  }

  return {
    rawText: text,
    isNewProject,
    matchedProject,
    projectName,
    customerName,
    phone,
    address,
    region,
    brand: brandStr,
    leadSale,
    assignedTech,
    contractValue,
    collectionAmount,
    stage,
    progressDelta,
    marketingReady,
    allocations,
  };
}
