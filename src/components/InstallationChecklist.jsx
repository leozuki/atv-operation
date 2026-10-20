import React, { useState, useMemo } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Package,
  Wrench,
  Search,
  Check,
  RefreshCw,
  FileText,
  Clock,
  Truck,
  ShieldCheck,
  FileCheck,
  Zap,
  Layers,
  DollarSign,
  Warehouse,
  Boxes,
  HelpCircle,
  X,
  FileSpreadsheet,
  AlertOctagon,
  ArrowUpRight,
  ArrowRight,
  UserCheck,
  Tag,
  ShieldAlert,
} from "lucide-react";
import { formatDate, formatVND } from "../utils/formatters";
import FieldWorkLogModal from "./FieldWorkLogModal";

// Helper function to estimate shortage compensation shipping and RACI responsibility
export function calculateShortageAnalysis(checklist) {
  if (!checklist || !checklist.items) {
    return {
      items: [],
      hasShortage: false,
      totalMissingItems: 0,
      totalShippingCost: 0,
      totalLaborCost: 0,
      grandTotalCost: 0,
      primaryResponsible: "Không phát sinh",
      primaryResponsibleCode: "none",
    };
  }

  const shortageItems = checklist.items
    .filter((it) => it.status === "shortage" || (it.orderedQty > (it.receivedQty || 0)))
    .map((it) => {
      const ordered = it.orderedQty || 1;
      const received = it.receivedQty || 0;
      const missingQty = Math.max(1, ordered - received);
      const noteLower = (it.note || "").toLowerCase();
      const nameLower = (it.name || "").toLowerCase();

      let cause = "Kho xuất thiếu khi bốc hàng";
      let causeCode = "warehouse";
      let responsible = "Phòng Kho Vận (Nội Bộ)";
      let responsibleRule = "Kho bốc sót linh kiện phụ kiện khi xuất bến -> Chịu cước xe tải bốc bù nội địa (OpEx Logistics).";
      let shippingMethod = "Xe tải trung chuyển nội bộ";
      let shippingCost = 850000;
      let laborCost = 400000;
      let warehouseAction = "Kiểm kê lại kệ kho, tạm xuất từ Kho Đệm Phụ Tùng (Buffer Stock) để bàn giao ngay.";

      if (
        noteLower.includes("sai model") ||
        noteLower.includes("sai điện áp") ||
        noteLower.includes("110v") ||
        noteLower.includes("sai màu") ||
        noteLower.includes("mismatch")
      ) {
        cause = "Sai quy cách / Điện áp 110V (Spec Mismatch)";
        causeCode = "spec_mismatch";
        responsible = "Hãng Sản Xuất & Kỹ Thuật Đấu Thầu";
        responsibleRule =
          "Hãng giao sai điện áp/sai màu đệm -> Hãng cấp biến áp 3kVA (3.500.000 VNĐ) & bọc da tạm; khiếu nại bồi hoàn linh kiện zin.";
        shippingMethod = "Chuyển phát nhanh bồi hoàn & Biến áp chuyển nguồn";
        shippingCost = 3500000;
        laborCost = 500000;
        warehouseAction = "Lưu kho khu vực cách ly (Quarantine Zone), dán tem Red Tag RMA tra soát với Hãng.";
      } else if (
        noteLower.includes("móp") ||
        noteLower.includes("vỡ") ||
        noteLower.includes("trầy xước") ||
        noteLower.includes("hư hỏng vận chuyển") ||
        noteLower.includes("va đập") ||
        noteLower.includes("damage")
      ) {
        cause = "Hư hỏng do vận chuyển trung chuyển (Transit Damage)";
        causeCode = "transport_damage";
        responsible = "Đơn Vị Vận Tải (Chành xe/Nhà xe)";
        responsibleRule =
          "Biên bản hiện trường phạt cước nhà xe; xử lý sơn dặm tĩnh điện hoặc thay ốp nhựa bảo vệ từ Buffer Stock.";
        shippingMethod = "Xe tải chuyển linh kiện thay thế & Bút sơn dặm";
        shippingCost = 1200000;
        laborCost = 400000;
        warehouseAction = "Chuyển phụ tùng móp méo về Quarantine Zone dán tem Red Tag, lập hồ sơ bảo hiểm vận tải.";
      } else if (
        noteLower.includes("công trường") ||
        noteLower.includes("mất") ||
        noteLower.includes("thất lạc") ||
        noteLower.includes("dọn rác") ||
        noteLower.includes("site lost")
      ) {
        cause = "Thất lạc tại công trình (Site Loss)";
        causeCode = "site_missing";
        responsible = "Đội Kỹ Thuật Hiện Trường";
        responsibleRule =
          "Thất lạc linh kiện tại mặt bằng -> Trừ KPI Đội trưởng; xuất kho đệm phụ tùng (Buffer Stock) thay thế ngay.";
        shippingMethod = "Xe máy / Xe bán tải giao khẩn cấp hiện trường";
        shippingCost = 650000;
        laborCost = 200000;
        warehouseAction = "Xuất khẩn cấp từ Buffer Stock Đông Anh/Bình Dương; lập biên bản kiểm điểm hiện trường.";
      } else if (
        noteLower.includes("hãng") ||
        noteLower.includes("air bù") ||
        noteLower.includes("canada") ||
        noteLower.includes("precor usa")
      ) {
        cause = "Hãng giao thiếu (Vendor Shortage)";
        causeCode = "vendor";
        responsible = "Hãng Sản Xuất (Vendor)";
        responsibleRule =
          "Hãng giao thiếu kiện theo Packing List -> Chịu 100% cước Air Cargo quốc tế hoặc trừ Credit Note PO tiếp theo.";
        shippingMethod = "Chuyển phát nhanh Air hỏa tốc (Vendor)";
        shippingCost = 450000 * Math.min(missingQty, 3);
        laborCost = 0;
        warehouseAction =
          "Tạm mượn linh kiện từ Kho Đệm Phụ Tùng (Buffer Stock); khi hàng Air của hãng về sẽ nhập hoàn nguyên.";
      } else if (
        noteLower.includes("tàu") ||
        noteLower.includes("cảng") ||
        noteLower.includes("thông quan") ||
        noteLower.includes("hải quan") ||
        noteLower.includes("kẹt cảng")
      ) {
        cause = "Chậm thông quan cảng biển (Transit / Customs)";
        causeCode = "customs";
        responsible = "Chuỗi Cung Ứng & Điều Phối Ops";
        responsibleRule =
          "Tàu trễ cảng Hải Phòng / Cát Lái -> Lùi lịch hẹn với khách hàng 48h-72h, không để KTV đến hiện trường trắng.";
        shippingMethod = "Đoàn xe tải bửng nâng / Container chuyên dụng";
        shippingCost = 2500000;
        laborCost = 800000;
        warehouseAction =
          "Chuẩn bị sẵn ô Staging tại kho Đông Anh/Bình Dương để rút ruột và bốc xe ưu tiên khi cont hạ bãi.";
      } else if (
        noteLower.includes("xuất khẩu") ||
        noteLower.includes("mộc bài") ||
        noteLower.includes("campuchia")
      ) {
        cause = "Thủ tục xuất khẩu liên vận (Export Transit)";
        causeCode = "export";
        responsible = "Đội Dự Án Quốc Tế & Đối Tác Vận Tải";
        responsibleRule =
          "Chờ tờ khai hải quan Mộc Bài -> Nhà xe liên vận điều phối xe container chuyên tuyến Phnom Penh.";
        shippingMethod = "Xe container liên vận Việt Nam - Campuchia";
        shippingCost = 4500000;
        laborCost = 1500000;
        warehouseAction =
          "Lưu kho khu vực Hàng Xuất Khẩu tại Bình Dương, kiểm tra niêm phong kiện gỗ trước khi kẹp chì hải quan.";
      } else if (
        nameLower.includes("máy") ||
        nameLower.includes("rack") ||
        nameLower.includes("reformer") ||
        nameLower.includes("elip") ||
        nameLower.includes("tạ đĩa") ||
        nameLower.includes("fts")
      ) {
        shippingMethod = "Xe tải bửng nâng 2.5T - 3.5T";
        shippingCost = 1800000;
        laborCost = 600000;
      }

      return {
        id: it.id,
        name: it.name,
        category: it.category,
        orderedQty: ordered,
        receivedQty: received,
        missingQty,
        unit: it.unit || "Bộ",
        note: it.note,
        cause,
        causeCode,
        responsible,
        responsibleRule,
        shippingMethod,
        shippingCost,
        laborCost,
        totalCost: shippingCost + laborCost,
        warehouseAction,
      };
    });

  const totalShippingCost = shortageItems.reduce((acc, it) => acc + it.shippingCost, 0);
  const totalLaborCost = shortageItems.reduce((acc, it) => acc + it.laborCost, 0);
  const grandTotalCost = totalShippingCost + totalLaborCost;

  let primaryResponsible = "Không phát sinh";
  let primaryResponsibleCode = "none";
  if (shortageItems.length > 0) {
    const hasVendor = shortageItems.some((i) => i.causeCode === "vendor");
    const hasWarehouse = shortageItems.some((i) => i.causeCode === "warehouse");
    const hasCustoms = shortageItems.some((i) => i.causeCode === "customs");
    const hasExport = shortageItems.some((i) => i.causeCode === "export");
    const hasSpecMismatch = shortageItems.some((i) => i.causeCode === "spec_mismatch");
    const hasTransportDamage = shortageItems.some((i) => i.causeCode === "transport_damage");
    const hasSiteMissing = shortageItems.some((i) => i.causeCode === "site_missing");

    if (hasVendor && hasWarehouse) {
      primaryResponsible = "Hãng Sản Xuất & Kho Vận Nội Bộ";
      primaryResponsibleCode = "split";
    } else if (hasVendor) {
      primaryResponsible = "Hãng Sản Xuất (Vendor Claim)";
      primaryResponsibleCode = "vendor";
    } else if (hasWarehouse) {
      primaryResponsible = "Phòng Kho Vận (Nội Bộ)";
      primaryResponsibleCode = "warehouse";
    } else if (hasSpecMismatch) {
      primaryResponsible = "Hãng Sản Xuất & Kỹ Thuật Đấu Thầu";
      primaryResponsibleCode = "spec_mismatch";
    } else if (hasTransportDamage) {
      primaryResponsible = "Đơn Vị Vận Tải (Chành xe)";
      primaryResponsibleCode = "transport_damage";
    } else if (hasSiteMissing) {
      primaryResponsible = "Đội Kỹ Thuật Hiện Trường";
      primaryResponsibleCode = "site_missing";
    } else if (hasCustoms) {
      primaryResponsible = "Điều Phối Chuỗi Cung Ứng";
      primaryResponsibleCode = "customs";
    } else if (hasExport) {
      primaryResponsible = "Dự Án Xuất Khẩu";
      primaryResponsibleCode = "export";
    }
  }

  return {
    items: shortageItems,
    hasShortage: shortageItems.length > 0,
    totalMissingItems: shortageItems.length,
    totalShippingCost,
    totalLaborCost,
    grandTotalCost,
    primaryResponsible,
    primaryResponsibleCode,
  };
}

const siteReadinessLabels = {
  ceilingHeight: {
    title: "Chiều cao trần tĩnh (Clearance)",
    desc: "Trần tĩnh ≥ Chiều cao máy + 60cm (Tránh cấn dầm/ống gió HVAC)",
    rec: "Smith Machine / StairClimber yêu cầu trần tối thiểu 2.8m - 3.2m",
  },
  elevatorAccess: {
    title: "Kích thước cửa & thang máy tải",
    desc: "Cửa ≥ 1.1m, thang máy chịu tải lọt thùng hoặc đã có PA rã khung/xe cẩu",
    rec: "Khung Leg Press / Cáp đôi cồng kềnh cần phương án rã khung theo manual",
  },
  electricalGround: {
    title: "Ổ cắm tiếp địa & CB chịu tải",
    desc: "Dây tiếp địa R < 4Ω chống tê giật; CB loại D-Curve chịu dòng khởi động inrush",
    rec: "Tách line riêng cho cụm máy chạy bộ (Treadmill) tránh nhảy aptomat tổng",
  },
  floorAcoustic: {
    title: "Tải trọng sàn & Giảm chấn tiêu âm",
    desc: "Sàn chịu lực ≥ 500kg/m²; cao su giảm chấn ≥ 50mm tại khu Free Weight / Deadlift",
    rec: "Triệt tiêu tiếng ồn rung chấn truyền xuống tầng dưới",
  },
  dustCleaned: {
    title: "Vệ sinh công nghiệp sạch bụi",
    desc: "Mặt bằng sạch 100% bụi thạch cao/xi măng; không chồng chéo thợ ướt",
    rec: "Bụi mịn thạch cao bám vào bo mạch và bạc đạn sẽ gây cháy máy sau 7 ngày",
  },
};

export default function InstallationChecklist({
  checklists,
  setChecklists,
  projects,
  setProjects,
  users = [],
  currentUser,
  shipments = [],
  tenders = [],
  collections = [],
  schedule = { HN: [], HCM: [] },
  setSchedule,
  selectedProjectId,
  setSelectedProjectId,
  onNavigateTab,
  showToast,
}) {
  const [showFieldLogModal, setShowFieldLogModal] = useState(false);
  const [showShortageModal, setShowShortageModal] = useState(false);
  const [shortageModalTab, setShortageModalTab] = useState("costs"); // 'costs' | 'warehouse'
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const currentProjectId = selectedProjectId || checklists[0]?.projectId;
  const currentChecklist =
    checklists.find((c) => c.projectId === currentProjectId) || checklists[0];

  const projectObj = projects?.find((p) => p.id === currentProjectId);
  const tenderObj = tenders?.find(
    (t) =>
      t.project?.includes(currentProjectId) ||
      (projectObj && t.project?.includes(projectObj.name)) ||
      (projectObj && t.project?.includes(projectObj.customer))
  );
  const projectValue = tenderObj?.valueBeforeVat || projectObj?.hubspotDeal?.amount || 0;

  const linkedCollections = (collections || []).filter((c) => {
    const cCust = String(c.customer || "").toLowerCase();
    const cProj = String(c.project || "").toLowerCase();
    const pName = String(projectObj?.name || "").toLowerCase();
    const pCust = String(projectObj?.customer || "").toLowerCase();
    const pId = String(currentProjectId || "").toLowerCase();
    return (
      (pId && (cCust.includes(pId) || cProj.includes(pId))) ||
      (pName && (cCust.includes(pName) || cProj.includes(pName))) ||
      (pCust && (cCust.includes(pCust) || cProj.includes(pCust)))
    );
  });

  const totalCollected = linkedCollections.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const unpaidBalance = projectValue > 0 ? Math.max(0, projectValue - totalCollected) : 0;
  const paymentRatio = projectValue > 0 ? totalCollected / projectValue : totalCollected > 0 ? 1 : 0;
  const hasFinanceData = collections && collections.length > 0;
  const isPaymentPending = hasFinanceData && unpaidBalance > 0 && paymentRatio < 0.95;

  const bodWaiverApproved = !!currentChecklist?.bodWaiverApproved;

  const handleToggleBodWaiver = () => {
    if (!currentChecklist) return;
    const nextVal = !bodWaiverApproved;
    const updatedChecklists = checklists.map((c) =>
      c.projectId === currentChecklist.projectId
        ? { ...c, bodWaiverApproved: nextVal }
        : c
    );
    setChecklists(updatedChecklists);
    if (showToast) {
      showToast(nextVal ? "✓ Đã kích hoạt Bảo Lãnh Bàn Giao Từ Ban Giám Đốc (BOD)" : "Đã hủy bảo lãnh BOD");
    }
  };

  const defaultSiteReadiness = {
    ceilingHeight: true,
    elevatorAccess: true,
    electricalGround: true,
    floorAcoustic: true,
    dustCleaned: true,
  };
  const siteReadiness = currentChecklist?.siteReadiness || defaultSiteReadiness;
  const siteReadinessKeys = Object.keys(siteReadiness);
  const passedSiteReadinessCount = siteReadinessKeys.filter((k) => siteReadiness[k]).length;
  const isSiteReadinessPassed = passedSiteReadinessCount === siteReadinessKeys.length;

  const handleToggleSiteReadiness = (key) => {
    if (!currentChecklist) return;
    const updated = {
      ...siteReadiness,
      [key]: !siteReadiness[key],
    };
    const updatedChecklists = checklists.map((c) =>
      c.projectId === currentChecklist.projectId
        ? { ...c, siteReadiness: updated }
        : c
    );
    setChecklists(updatedChecklists);
    if (showToast) {
      showToast(`Đã cập nhật tiêu chuẩn: ${siteReadinessLabels[key]?.title || key}`);
    }
  };

  const handleSetAllSiteReadinessPassed = () => {
    if (!currentChecklist) return;
    const allPassed = {
      ceilingHeight: true,
      elevatorAccess: true,
      electricalGround: true,
      floorAcoustic: true,
      dustCleaned: true,
    };
    const updatedChecklists = checklists.map((c) =>
      c.projectId === currentChecklist.projectId
        ? { ...c, siteReadiness: allPassed }
        : c
    );
    setChecklists(updatedChecklists);
    if (showToast) {
      showToast("✓ Đã xác nhận 100% tiêu chuẩn mặt bằng đạt chuẩn!");
    }
  };

  const handleCreatePostLaunchAudit = () => {
    if (!currentChecklist) return;
    const region =
      currentChecklist.projectId?.includes("HN") ||
      currentChecklist.projectName?.includes("Hải Phòng")
        ? "HN"
        : "HCM";
    const postLaunchDate = new Date();
    postLaunchDate.setDate(postLaunchDate.getDate() + 14);
    const dateStr = postLaunchDate.toISOString().slice(0, 10);

    const newTask = {
      id: `TSK-POSTLAUNCH-${Date.now().toString().slice(-4)}`,
      title: `[Khám 14 Ngày] Kiểm tra máy sau khai trương - ${currentChecklist.projectName}`,
      project: currentChecklist.projectName,
      projectId: currentChecklist.projectId,
      client: currentChecklist.customer || currentChecklist.projectName,
      assignee: currentChecklist.verifier || "Lương Nguyễn Tuấn Anh",
      team: [currentChecklist.verifier || "Lương Nguyễn Tuấn Anh"],
      date: dateStr,
      status: "scheduled",
      priority: "high",
      type: "Bảo dưỡng định kỳ",
      notes:
        "Khám sức khỏe máy sau 14 ngày khai trương: Cân chỉnh đai thảm chạy bộ (quarter-turn), siết lực bu lông khung bằng cần torque, tra dầu silicon bàn chạy, đo dòng ampe tủ điện.",
    };

    if (setSchedule) {
      setSchedule((prev) => ({
        ...prev,
        [region]: [newTask, ...(prev?.[region] || [])],
      }));
    }

    const updatedChecklists = checklists.map((c) =>
      c.projectId === currentChecklist.projectId
        ? { ...c, postLaunchAuditCreated: true, postLaunchAuditDate: dateStr }
        : c
    );
    setChecklists(updatedChecklists);

    if (showToast) {
      showToast(
        `✓ Đã lên lịch khám sức khỏe máy 14 ngày sau khai trương (${dateStr}) cho ${currentChecklist.projectName}!`
      );
    }
  };

  const [newItem, setNewItem] = useState({
    name: "",
    category: "equipment_bom",
    sopDeliverable: "",
    orderedQty: 1,
    receivedQty: 1,
    unit: "Bộ",
    status: "pass",
    note: "",
  });

  const handleUpdateItemStatus = (itemId, status) => {
    if (!currentChecklist) return;
    const updatedItems = currentChecklist.items.map((item) => {
      if (item.id !== itemId) return item;
      const newReceived = status === "pass" ? item.orderedQty : Math.min(item.receivedQty, Math.max(0, item.orderedQty - 1));
      return {
        ...item,
        status,
        receivedQty: newReceived,
      };
    });

    const hasShortage = updatedItems.some((it) => it.status === "shortage");
    const allReceivedZero = updatedItems.every((it) => (it.receivedQty || 0) === 0);
    const newStatus = allReceivedZero ? "missing" : hasShortage ? "warning" : "ready";

    const updatedChecklists = checklists.map((c) =>
      c.projectId === currentChecklist.projectId
        ? {
            ...c,
            items: updatedItems,
            status: newStatus,
          }
        : c
    );
    setChecklists(updatedChecklists);

    // Propagate checklist progress to the corresponding project in projects state
    if (setProjects && projects) {
      setProjects((prevProjects) =>
        prevProjects.map((p) => {
          if (p.id === currentChecklist.projectId) {
            const passedCount = updatedItems.filter((i) => i.status === "pass").length;
            const progressPct = Math.round((passedCount / updatedItems.length) * 100);
            const isAllComplete = passedCount === updatedItems.length;
            return {
              ...p,
              checklistProgress: progressPct,
              checklistComplete: isAllComplete,
              progress: isAllComplete ? Math.max(p.progress || 80, 95) : p.progress,
            };
          }
          return p;
        })
      );
    }

    if (showToast) {
      showToast(`Đã cập nhật trạng thái: ${status === "pass" ? "ĐẠT" : "THIẾU / CẦN XỬ LÝ"} (Đã đồng bộ tiến độ dự án)`);
    }
  };

  // Sign-off verification handler (KTV hiện trường, Thủ kho, Quản lý kỹ thuật)
  const handleSignOffConfirmation = (roleKey) => {
    if (!currentChecklist) return;

    if (roleKey === "manager" && isPaymentPending && !bodWaiverApproved) {
      if (showToast) {
        showToast("❌ Chặn ký duyệt bàn giao: Dự án chưa thu đủ tiền. Cần kích hoạt Bảo Lãnh Bàn Giao Từ Ban Giám Đốc (BOD)!");
      }
      return;
    }

    const nowStr = new Date().toLocaleDateString("vi-VN") + " " + new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
    const currentSignOff = currentChecklist.signOff || {
      tech: { name: currentChecklist.verifier || "Lương Nguyễn Tuấn Anh", signed: true, date: currentChecklist.inspectionDate || "19/10/2026", role: "KTV Trưởng Hiện Trường" },
      warehouse: { name: "Quốc Việt Phạm (Kho BD)", signed: true, date: "19/10/2026 09:30", role: "Thủ Kho Phụ Trách" },
      manager: { name: "Trung Tech Mgr", signed: currentChecklist.status === "ready", date: currentChecklist.status === "ready" ? "19/10/2026 14:00" : null, role: "Trưởng Phòng Kỹ Thuật" },
    };

    const updatedSignOff = {
      ...currentSignOff,
      [roleKey]: {
        ...currentSignOff[roleKey],
        signed: true,
        date: nowStr,
        name: currentUser?.name || currentSignOff[roleKey]?.name || "Kỹ Thuật Trưởng",
        bodWaiver: isPaymentPending && bodWaiverApproved ? "Được BOD bảo lãnh công nợ" : undefined,
      },
    };

    const updatedChecklists = checklists.map((c) =>
      c.projectId === currentChecklist.projectId
        ? {
            ...c,
            signOff: updatedSignOff,
            status: "ready", // Approved
          }
        : c
    );
    setChecklists(updatedChecklists);

    if (setProjects && projects) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === currentChecklist.projectId
            ? {
                ...p,
                checklistComplete: true,
                checklistProgress: 100,
                progress: Math.max(p.progress || 85, 95),
              }
            : p
        )
      );
    }

    if (showToast) {
      showToast(`✓ Đã ký duyệt xác nhận bàn giao: ${updatedSignOff[roleKey].name} (${updatedSignOff[roleKey].role})`);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !currentChecklist) return;

    const ordered = Number(newItem.orderedQty) || 1;
    const received = Number(newItem.receivedQty) || 0;
    const itemToAdd = {
      id: `CK-${Date.now().toString().slice(-4)}`,
      name: newItem.name,
      category: newItem.category || "equipment_bom",
      sopDeliverable: newItem.sopDeliverable || undefined,
      orderedQty: ordered,
      receivedQty: Math.min(received, ordered),
      unit: newItem.unit || "Bộ",
      status: received < ordered ? "shortage" : "pass",
      note: newItem.note,
    };

    const updatedItems = [...currentChecklist.items, itemToAdd];
    const hasShortage = updatedItems.some((it) => it.status === "shortage");
    const allReceivedZero = updatedItems.every((it) => (it.receivedQty || 0) === 0);
    const newStatus = allReceivedZero ? "missing" : hasShortage ? "warning" : "ready";

    setChecklists(
      checklists.map((c) =>
        c.projectId === currentChecklist.projectId
          ? {
              ...c,
              items: updatedItems,
              status: newStatus,
            }
          : c
      )
    );

    setNewItem({
      name: "",
      category: "equipment_bom",
      sopDeliverable: "",
      orderedQty: 1,
      receivedQty: 1,
      unit: "Bộ",
      status: "pass",
      note: "",
    });

    if (showToast) {
      showToast("Đã bổ sung hạng mục checklist mới thành công!");
    }
  };

  // SOP 4 Deliverables Status Calculation
  const sopStatus = useMemo(() => {
    if (!currentChecklist?.items) {
      return { truck: "pending", cocq: "pending", bbgh: "pending", warranty: "pending" };
    }
    const findStatus = (keyword) => {
      const it = currentChecklist.items.find(
        (i) =>
          i.sopDeliverable === keyword ||
          (i.name && i.name.toLowerCase().includes(keyword.toLowerCase()))
      );
      if (!it) return "pending";
      return it.status === "pass" ? "pass" : "shortage";
    };

    return {
      truck: findStatus("Đặt xe"),
      cocq: findStatus("COCQ"),
      bbgh: findStatus("BBGH/NT"),
      warranty: findStatus("Bảo hành"),
    };
  }, [currentChecklist]);

  // Filter items by category and search
  const filteredItems = useMemo(() => {
    if (!currentChecklist?.items) return [];
    return currentChecklist.items.filter((item) => {
      const matchCategory =
        activeCategory === "all" ||
        item.category === activeCategory ||
        (activeCategory === "sop_docs" && item.sopDeliverable);

      const matchSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchCategory && matchSearch;
    });
  }, [currentChecklist, activeCategory, searchTerm]);

  const stats = useMemo(() => {
    if (!currentChecklist?.items) return { total: 0, pass: 0, shortage: 0, rate: 0 };
    const total = currentChecklist.items.length;
    const pass = currentChecklist.items.filter((i) => i.status === "pass").length;
    const shortage = total - pass;
    const rate = total > 0 ? Math.round((pass / total) * 100) : 0;
    return { total, pass, shortage, rate };
  }, [currentChecklist]);

  const shortageAnalysis = useMemo(
    () => calculateShortageAnalysis(currentChecklist),
    [currentChecklist]
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800">
            <ClipboardCheck className="w-5 h-5 text-cyan-700" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Checklist Lắp Đặt Thiết Bị
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chuẩn hóa theo SOP Logistics Attivo: 4 chốt chặn bắt buộc (Đặt xe, COCQ, BBGH/NT, Bảo hành) & Kiểm định BOM
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {shortageAnalysis.hasShortage && (
            <button
              type="button"
              onClick={() => {
                setShortageModalTab("costs");
                setShowShortageModal(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition"
              title="Ước tính chi phí vận chuyển bù và phân định trách nhiệm RACI"
            >
              <DollarSign className="w-4 h-4" />
              <span>Dự Toán Phí Bù Hàng ({formatVND(shortageAnalysis.grandTotalCost)})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setShortageModalTab("warehouse");
              setShowShortageModal(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            title="Quy trình quản lý hàng tại kho khi có ship bù & hàng cũ"
          >
            <Warehouse className="w-4 h-4 text-amber-400" />
            <span>Quản Lý Kho Khi Ship Bù</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFieldLogModal(true)}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
            title="Ghi nhận giờ làm KTV & Chụp ảnh nghiệm thu (Telegram Bot)"
          >
            <Clock className="w-4 h-4" />
            <span>Log Time KTV</span>
          </button>
        </div>
      </div>

      {/* Project Selector Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 mr-2">Chọn Dự Án Lắp Đặt (8 Dự Án):</span>
        {checklists.map((c) => {
          const isSelected = c.projectId === currentProjectId;
          return (
            <button
              key={c.projectId}
              onClick={() => setSelectedProjectId(c.projectId)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-2 ${
                isSelected
                  ? "bg-cyan-700 border-cyan-700 text-white shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{c.projectName}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  c.status === "ready"
                    ? "bg-emerald-400"
                    : c.status === "warning"
                    ? "bg-amber-400"
                    : "bg-rose-500"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Main Checklist View */}
      {currentChecklist && (
        <div className="space-y-4">
          {/* Financial Debt & Payment Status Alert */}
          {isPaymentPending && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0 mt-0.5 shadow-xs">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-amber-900 flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase tracking-wide">Cảnh Báo Kế Toán: Dự Án Chưa Thu Đủ 100% Giá Trị Hợp Đồng</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[10px]">
                      Còn thiếu {formatVND(unpaidBalance)} (Đã thu: {Math.round(paymentRatio * 100)}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Khuyến cáo an toàn công nợ: Kỹ thuật viên &amp; Thủ kho cần kiểm tra xác nhận bảo lãnh thanh toán từ Kế toán / Ban Giám Đốc trước khi bàn giao chìa khóa &amp; ký biên bản nghiệm thu đưa vào vận hành.
                  </p>
                </div>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab("finance")}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Xem Sổ Thu Tiền &rarr;</span>
                </button>
              )}
            </div>
          )}

          {/* Pre-Installation Site Readiness Gate (Khảo Sát Hiện Trường & Chặn Lỗi Kỹ Thuật Mặt Bằng) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`p-2 rounded-xl text-white font-bold shrink-0 ${isSiteReadinessPassed ? "bg-emerald-600" : "bg-amber-600"}`}>
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                    <span>Khảo Sát Hiện Trường &amp; Tiêu Chuẩn Mặt Bằng Trước Lắp Đặt</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      isSiteReadinessPassed
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}>
                      {isSiteReadinessPassed ? "✓ MẶT BẰNG ĐẠT CHUẨN 5/5" : `CẦN XỬ LÝ (${5 - passedSiteReadinessCount}/5 CHƯA ĐẠT)`}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Chốt chặn kỹ thuật: Ngăn ngừa rủi ro đụng trần, kẹt thang máy, sập điện và bụi thạch cao làm cháy motor máy.
                  </p>
                </div>
              </div>

              {!isSiteReadinessPassed && (
                <button
                  type="button"
                  onClick={handleSetAllSiteReadinessPassed}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition flex items-center gap-1 shrink-0 cursor-pointer border border-slate-300"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xác Nhận Đạt Chuẩn 5/5</span>
                </button>
              )}
            </div>

            {/* 5 Criteria Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
              {siteReadinessKeys.map((key) => {
                const isPassed = !!siteReadiness[key];
                const info = siteReadinessLabels[key];
                return (
                  <div
                    key={key}
                    onClick={() => handleToggleSiteReadiness(key)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between select-none ${
                      isPassed
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:bg-emerald-100/60"
                        : "bg-rose-50/80 border-rose-200 text-rose-950 hover:bg-rose-100/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {isPassed ? "✓ Đạt Chuẩn" : "⚠️ Cần Xử Lý"}
                        </span>
                        <input
                          type="checkbox"
                          checked={isPassed}
                          onChange={() => {}}
                          className={`rounded ${isPassed ? "text-emerald-600" : "text-rose-600"}`}
                        />
                      </div>
                      <div className="font-extrabold text-xs text-slate-900 leading-tight">
                        {info.title}
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                        {info.desc}
                      </p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[9px] text-slate-500 italic">
                      {info.rec}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">{currentChecklist.projectName}</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    HĐ: {currentChecklist.contractCode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {currentChecklist.projectId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Kỹ thuật viên kiểm tra: <strong className="text-slate-800">{currentChecklist.verifier}</strong> • Ngày kiểm đếm: {formatDate(currentChecklist.inspectionDate)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Tỷ lệ đạt chuẩn:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base font-black text-cyan-800">{stats.rate}%</span>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                        currentChecklist.status === "ready"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : currentChecklist.status === "warning"
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-rose-50 text-rose-800 border-rose-300"
                      }`}
                    >
                      {currentChecklist.status === "ready" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {currentChecklist.status === "warning" && <AlertTriangle className="w-3.5 h-3.5" />}
                      {currentChecklist.status === "missing" && <XCircle className="w-3.5 h-3.5" />}
                      {currentChecklist.status === "ready"
                        ? "ĐÃ ĐỦ ĐIỀU KIỆN BÀN GIAO"
                        : currentChecklist.status === "warning"
                        ? "CẦN LƯU Ý / THIẾU HÀNG"
                        : "CHƯA ĐỦ HÀNG ĐỂ LẮP"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Mandatory Deliverables from Logistics SOP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div
                className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                  sopStatus.truck === "pass"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
              >
                <div className="p-2 rounded-lg bg-white/80 shadow-2xs">
                  <Truck className={`w-4 h-4 ${sopStatus.truck === "pass" ? "text-emerald-700" : "text-amber-700"}`} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chốt Chặn 1</div>
                  <div className="text-xs font-black">Đặt Xe Vận Tải</div>
                  <span className={`text-[10px] font-bold ${sopStatus.truck === "pass" ? "text-emerald-700" : "text-amber-700"}`}>
                    {sopStatus.truck === "pass" ? "✓ Đã Duyệt Xe" : "⏳ Chờ Điều Phối"}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                  sopStatus.cocq === "pass"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
              >
                <div className="p-2 rounded-lg bg-white/80 shadow-2xs">
                  <FileCheck className={`w-4 h-4 ${sopStatus.cocq === "pass" ? "text-emerald-700" : "text-amber-700"}`} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chốt Chặn 2</div>
                  <div className="text-xs font-black">Hồ Sơ COCQ</div>
                  <span className={`text-[10px] font-bold ${sopStatus.cocq === "pass" ? "text-emerald-700" : "text-amber-700"}`}>
                    {sopStatus.cocq === "pass" ? "✓ Đầy Đủ CO/CQ" : "⏳ Đang Chờ Bản Gốc"}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                  sopStatus.bbgh === "pass"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
              >
                <div className="p-2 rounded-lg bg-white/80 shadow-2xs">
                  <ClipboardCheck className={`w-4 h-4 ${sopStatus.bbgh === "pass" ? "text-emerald-700" : "text-amber-700"}`} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chốt Chặn 3</div>
                  <div className="text-xs font-black">BBGH / Nghiệm Thu</div>
                  <span className={`text-[10px] font-bold ${sopStatus.bbgh === "pass" ? "text-emerald-700" : "text-amber-700"}`}>
                    {sopStatus.bbgh === "pass" ? "✓ Ký 3 Bên" : "⏳ Chờ Khách Ký"}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                  sopStatus.warranty === "pass"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
              >
                <div className="p-2 rounded-lg bg-white/80 shadow-2xs">
                  <ShieldCheck className={`w-4 h-4 ${sopStatus.warranty === "pass" ? "text-emerald-700" : "text-amber-700"}`} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chốt Chặn 4</div>
                  <div className="text-xs font-black">Tem & Sổ Bảo Hành</div>
                  <span className={`text-[10px] font-bold ${sopStatus.warranty === "pass" ? "text-emerald-700" : "text-amber-700"}`}>
                    {sopStatus.warranty === "pass" ? "✓ Đã Dán Tem & HDSD" : "⏳ Chưa Xuất Tem"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-900 flex items-start gap-2">
              <FileText className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-800">Ghi chú đối chiếu kho & kỹ thuật: </strong>
                {currentChecklist.summary}
              </div>
            </div>

            {/* 3-Level Sign-off & Verification Box: Ai confirm là chính xác */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Xác Nhận & Phê Duyệt 3 Cấp (Sign-Off & Verification)
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  currentChecklist.status === "ready"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}>
                  {currentChecklist.status === "ready" ? "✓ ĐÃ KÝ DUYỆT BÀN GIAO" : "⏳ CHỜ PHÊ DUYỆT 3 CẤP"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* 1. Field Tech */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">1. KTV Kiểm Đếm Hiện Trường</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-700">✓ Đã Ký</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs mt-1">
                    {currentChecklist.signOff?.tech?.name || currentChecklist.verifier || "Lương Nguyễn Tuấn Anh"}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Ngày ký: {currentChecklist.signOff?.tech?.date || formatDate(currentChecklist.inspectionDate)}
                  </div>
                  <p className="text-[10px] text-slate-600 italic mt-0.5">
                    "Đã khui thùng và kiểm đếm đủ số lượng linh kiện tại công trình."
                  </p>
                </div>

                {/* 2. Warehouse Dispatcher */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">2. Thủ Kho Phụ Trách</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-700">✓ Đã Đối Chiếu</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs mt-1">
                    {currentChecklist.signOff?.warehouse?.name || (currentChecklist.projectId.includes("HN") || currentChecklist.projectName.includes("Hải Phòng") ? "Nguyễn Minh Tâm (Kho ĐA)" : "Quốc Việt Phạm (Kho BD)")}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Đối chiếu: Phiếu xuất kho &amp; Packing List Hãng
                  </div>
                  <p className="text-[10px] text-slate-600 italic mt-0.5">
                    "Khớp số lượng xuất bến theo PO và phiếu giao nhận."
                  </p>
                </div>

                {/* 3. Tech Manager / Lead Approver */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50/50 to-white border border-blue-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-700 uppercase">3. Trưởng Phòng Kỹ Thuật</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      currentChecklist.status === "ready"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {currentChecklist.status === "ready" ? "✓ Đã Phê Duyệt" : "Chờ Ký Duyệt"}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs mt-1">
                    {currentChecklist.signOff?.manager?.name || "Trung Tech Mgr"}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Phê duyệt: {currentChecklist.signOff?.manager?.date || (currentChecklist.status === "ready" ? "19/10/2026 14:00" : "Đang chờ")}
                  </div>

                  {/* Payment Debt Guard with BOD Waiver Override */}
                  {isPaymentPending && (
                    <div className="mt-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-amber-900 uppercase">Chặn Công Nợ:</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${bodWaiverApproved ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                          {bodWaiverApproved ? "✓ ĐÃ CÓ BẢO LÃNH BOD" : "CHẶN KÝ BÀN GIAO"}
                        </span>
                      </div>
                      <label className="flex items-start gap-1.5 text-[10px] text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bodWaiverApproved}
                          onChange={handleToggleBodWaiver}
                          className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>Bảo Lãnh Bàn Giao Từ Ban Giám Đốc (BOD Waiver)</span>
                      </label>
                    </div>
                  )}

                  {(!currentUser?.roleId || ["admin", "ops_manager", "tech_manager"].includes(currentUser.roleId)) && (
                    <button
                      type="button"
                      disabled={isPaymentPending && !bodWaiverApproved}
                      onClick={() => handleSignOffConfirmation("manager")}
                      className={`w-full mt-1.5 py-1 px-2 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 transition shadow-xs ${
                        isPaymentPending && !bodWaiverApproved
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : currentChecklist.status === "ready"
                          ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                          : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                      }`}
                      title={isPaymentPending && !bodWaiverApproved ? "Dự án còn nợ tiền. Cần kích hoạt bảo lãnh BOD để ký." : "Ký phê duyệt bàn giao"}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>
                        {isPaymentPending && !bodWaiverApproved
                          ? "Chặn Ký: Chưa Đủ Tiền (Cần BOD)"
                          : currentChecklist.status === "ready"
                          ? "Đã Ký Duyệt Bàn Giao"
                          : "Ký Duyệt Bàn Giao (Sign Off)"}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Day-14 Post-Launch Audit Action */}
              {currentChecklist.status === "ready" && (
                <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-600 text-white font-bold shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="font-extrabold text-emerald-950 block">
                        Khám Sức Khỏe Máy 14 Ngày Sau Khai Trương (Day-14 Post-Launch Audit)
                      </span>
                      <span className="text-[11px] text-emerald-800">
                        {currentChecklist.postLaunchAuditCreated
                          ? `✓ Đã lên lịch vào ngày ${currentChecklist.postLaunchAuditDate}: Cân chỉnh thảm chạy, siết lực bu lông & tra dầu silicon.`
                          : "Quy chuẩn SOP: KTV quay lại kiểm tra căn chỉnh thảm máy chạy bộ và siết lại toàn bộ ốc tạ sau 14 ngày vận hành thực tế."}
                      </span>
                    </div>
                  </div>
                  {!currentChecklist.postLaunchAuditCreated && (
                    <button
                      type="button"
                      onClick={handleCreatePostLaunchAudit}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tạo Lịch Khám 14 Ngày</span>
                    </button>
                  )}
                  {onNavigateTab && currentChecklist.postLaunchAuditCreated && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab("maintenance")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs shrink-0 transition flex items-center gap-1.5 cursor-pointer border border-emerald-300"
                    >
                      <span>Xem Lịch Bảo Trì &rarr;</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Shortage & Reship Cost Estimator Card */}
          {shortageAnalysis.hasShortage && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border-2 border-amber-300 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
                    <AlertOctagon className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                      Cảnh Báo Thiếu Hàng & Dự Toán Chi Phí Phát Sinh ({shortageAnalysis.totalMissingItems} Hạng Mục)
                    </h4>
                    <p className="text-[11px] text-amber-900/80">
                      Phát hiện chênh lệch giữa BOM đặt hàng và thực tế bốc hàng tại kho / hiện trường.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShortageModalTab("costs");
                      setShowShortageModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <span>Chi Tiết Bù Hàng & RACI</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShortageModalTab("warehouse");
                      setShowShortageModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <Warehouse className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quy Trình Kho (RMA)</span>
                  </button>
                </div>
              </div>

              {/* 4 Metric Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Cước Vận Chuyển Bù:</span>
                  <span className="text-sm font-black text-amber-800 mt-0.5 block">
                    {formatVND(shortageAnalysis.totalShippingCost)}
                  </span>
                  <span className="text-[10px] text-slate-500">Air hỏa tốc / Xe tải bửng nâng</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Nhân Công KTV Lần 2:</span>
                  <span className="text-sm font-black text-rose-700 mt-0.5 block">
                    {formatVND(shortageAnalysis.totalLaborCost)}
                  </span>
                  <span className="text-[10px] text-slate-500">Per diem & công nhật phát sinh</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Tổng Thiệt Hại Dự Kiến:</span>
                  <span className="text-sm font-black text-rose-900 mt-0.5 block">
                    {formatVND(shortageAnalysis.grandTotalCost)}
                  </span>
                  <span className="text-[10px] text-slate-500">Chi phí phát sinh thực tế</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Bên Chịu Trách Nhiệm:</span>
                  <span className="text-xs font-black text-indigo-900 mt-0.5 block line-clamp-1">
                    {shortageAnalysis.primaryResponsible}
                  </span>
                  <span className="text-[10px] text-indigo-700 font-semibold">Theo quy chế bồi hoàn RACI</span>
                </div>
              </div>
            </div>
          )}

          {/* Filtering Bar: Category Tabs & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              {[
                { id: "all", label: `Tất Cả (${currentChecklist.items.length})` },
                { id: "sop_docs", label: "Hồ Sơ SOP (4 Chốt Chặn)" },
                { id: "site_prep", label: "Khảo Sát & Nguồn Điện" },
                { id: "equipment_bom", label: "Thiết Bị BOM" },
                { id: "technical", label: "Cân Chỉnh Kỹ Thuật" },
                { id: "handover", label: "Vận Hành & Bàn Giao" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    activeCategory === tab.id
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm hạng mục / linh kiện..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-cyan-700"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Tên Hạng Mục / Tiêu Chí Kiểm Định</th>
                    <th className="py-3.5 px-4 text-center">Phân Loại</th>
                    <th className="py-3.5 px-4 text-center">SL Yêu Cầu</th>
                    <th className="py-3.5 px-4 text-center">SL Thực Tế</th>
                    <th className="py-3.5 px-4 text-center">ĐVT</th>
                    <th className="py-3.5 px-4">Đánh Giá Kỹ Thuật</th>
                    <th className="py-3.5 px-4">Ghi Chú Chi Tiết</th>
                    <th className="py-3.5 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredItems.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{it.name}</span>
                          {it.sopDeliverable && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {it.sopDeliverable}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          {it.category === "sop_docs"
                            ? "Hồ Sơ SOP"
                            : it.category === "site_prep"
                            ? "Khảo Sát"
                            : it.category === "technical"
                            ? "Cân Chỉnh"
                            : it.category === "handover"
                            ? "Bàn Giao"
                            : "Thiết Bị BOM"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                        {it.orderedQty}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-cyan-800">
                        {it.receivedQty}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                        {it.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        {it.status === "pass" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ĐẠT CHUẨN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-3.5 h-3.5" /> THIẾU / CẦN XỬ LÝ
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">
                        {it.note || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleUpdateItemStatus(it.id, "pass")}
                            className={`p-1.5 rounded-lg border transition ${
                              it.status === "pass"
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "bg-white border-slate-200 text-slate-500 hover:text-emerald-700"
                            }`}
                            title="Đánh dấu Đạt"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleUpdateItemStatus(it.id, "shortage")}
                            className={`p-1.5 rounded-lg border transition ${
                              it.status === "shortage"
                                ? "bg-rose-600 border-rose-600 text-white"
                                : "bg-white border-slate-200 text-slate-500 hover:text-rose-700"
                            }`}
                            title="Đánh dấu Thiếu / Cần lưu ý"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        Không tìm thấy hạng mục nào trong bộ lọc hiện tại.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Item Row Form */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" /> Bổ Sung Hạng Mục Kiểm Tra Vào Checklist:
            </h4>
            <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
              <input
                type="text"
                placeholder="Tên máy / tiêu chí / phụ kiện..."
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="sm:col-span-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                required
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="sm:col-span-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="equipment_bom">Thiết Bị BOM</option>
                <option value="sop_docs">Hồ Sơ SOP</option>
                <option value="site_prep">Khảo Sát Mặt Bằng</option>
                <option value="technical">Cân Chỉnh Kỹ Thuật</option>
                <option value="handover">Bàn Giao & Vận Hành</option>
              </select>
              <select
                value={newItem.sopDeliverable}
                onChange={(e) => setNewItem({ ...newItem, sopDeliverable: e.target.value })}
                className="sm:col-span-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="">(Không thuộc SOP)</option>
                <option value="Đặt xe">Đặt xe</option>
                <option value="COCQ">COCQ</option>
                <option value="BBGH/NT">BBGH/NT</option>
                <option value="Bảo hành">Bảo hành</option>
              </select>
              <input
                type="number"
                placeholder="SL Yêu Cầu"
                value={newItem.orderedQty}
                onChange={(e) => setNewItem({ ...newItem, orderedQty: e.target.value })}
                className="sm:col-span-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                min={1}
              />
              <input
                type="number"
                placeholder="SL Thực Tế"
                value={newItem.receivedQty}
                onChange={(e) => setNewItem({ ...newItem, receivedQty: e.target.value })}
                className="sm:col-span-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                min={0}
              />
              <input
                type="text"
                placeholder="ĐVT"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="sm:col-span-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
              <button
                type="submit"
                className="sm:col-span-1 p-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl transition"
              >
                + Thêm
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Field Work Log Modal (Log Time & Photo Evidence) */}
      <FieldWorkLogModal
        isOpen={showFieldLogModal}
        onClose={() => setShowFieldLogModal(false)}
        project={projects?.find((p) => p.id === currentProjectId)}
        checklist={currentChecklist}
        onSaveLog={(log) => {
          if (showToast) {
            showToast(`Đã lưu Log Time hiện trường: ${log.durationFormatted}`);
          }
        }}
        onUpdateChecklist={(updated) => {
          setChecklists((prev) =>
            prev.map((c) => (c.projectId === updated.projectId ? updated : c))
          );
        }}
        showToast={showToast}
      />

      {/* Shortage Resolution & Warehouse Management Modal */}
      {showShortageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-xs">
                  <Boxes className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm md:text-base font-black flex items-center gap-2">
                    <span>Xử Lý Thiếu Hàng & Quản Lý Kho Bù Hàng</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-300 border border-amber-400/40">
                      {currentChecklist.projectName}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Hợp đồng: <strong>{currentChecklist.contractCode}</strong> • Phân định trách nhiệm tài chính & quy trình kho bãi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowShortageModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-5 pt-3 border-b border-slate-200 bg-slate-50 flex items-center gap-4 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setShortageModalTab("costs")}
                className={`pb-2.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  shortageModalTab === "costs"
                    ? "border-amber-600 text-amber-900 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Bảng Chi Phí Ship Bù & Trách Nhiệm RACI ({shortageAnalysis.items.length})</span>
              </button>
              <button
                onClick={() => setShortageModalTab("warehouse")}
                className={`pb-2.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  shortageModalTab === "warehouse"
                    ? "border-amber-600 text-amber-900 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Warehouse className="w-4 h-4" />
                <span>Quy Trình Quản Lý Kho & Buffer Stock</span>
              </button>
              <button
                onClick={() => setShortageModalTab("quarantine")}
                className={`pb-2.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  shortageModalTab === "quarantine"
                    ? "border-amber-600 text-amber-900 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Khu Cách Ly Hàng Lỗi & Tem Đỏ Red Tag RMA</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {shortageModalTab === "costs" ? (
                <div className="space-y-4">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-[10px] uppercase font-bold text-amber-800 block">Số Hạng Mục Thiếu:</span>
                      <span className="text-lg font-black text-amber-950 mt-1 block">
                        {shortageAnalysis.totalMissingItems} linh kiện / tiêu chí
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                      <span className="text-[10px] uppercase font-bold text-orange-800 block">Cước Vận Chuyển Bù:</span>
                      <span className="text-lg font-black text-orange-950 mt-1 block">
                        {formatVND(shortageAnalysis.totalShippingCost)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-[10px] uppercase font-bold text-rose-800 block">Công Nhật KTV Lần 2:</span>
                      <span className="text-lg font-black text-rose-950 mt-1 block">
                        {formatVND(shortageAnalysis.totalLaborCost)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                      <span className="text-[10px] uppercase font-bold text-indigo-800 block">Tổng Thiệt Hại Bồi Hoàn:</span>
                      <span className="text-lg font-black text-indigo-950 mt-1 block">
                        {formatVND(shortageAnalysis.grandTotalCost)}
                      </span>
                    </div>
                  </div>

                  {/* Shortage Items Detailed Table */}
                  {shortageAnalysis.items.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                      <p className="text-sm font-bold text-slate-700">Dự án này không có thiếu hụt linh kiện!</p>
                      <p className="text-xs">Tất cả thiết bị và phụ kiện BOM đã được kiểm đếm đạt chuẩn 100%.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                            <th className="py-2.5 px-3">Linh Kiện Thiếu</th>
                            <th className="py-2.5 px-3 text-center">SL Thiếu</th>
                            <th className="py-2.5 px-3">Bản Chất / Nguyên Nhân</th>
                            <th className="py-2.5 px-3">Phương Án Ship Bù & Cước Phí</th>
                            <th className="py-2.5 px-3">Bên Chịu Trách Nhiệm (RACI)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                          {shortageAnalysis.items.map((it) => (
                            <tr key={it.id} className="hover:bg-slate-50 transition">
                              <td className="py-3 px-3">
                                <div className="font-extrabold text-slate-900">{it.name}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5 italic">{it.note || "—"}</div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                  {it.missingQty} {it.unit}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                    it.causeCode === "vendor"
                                      ? "bg-purple-100 text-purple-900 border border-purple-200"
                                      : it.causeCode === "warehouse"
                                      ? "bg-amber-100 text-amber-900 border border-amber-200"
                                      : "bg-blue-100 text-blue-900 border border-blue-200"
                                  }`}
                                >
                                  {it.cause}
                                </span>
                              </td>
                              <td className="py-3 px-3 space-y-0.5">
                                <div className="font-bold text-slate-800">{it.shippingMethod}</div>
                                <div className="text-[10px] text-slate-600">
                                  Cước xe: <strong>{formatVND(it.shippingCost)}</strong>
                                  {it.laborCost > 0 && ` • Công KTV: ${formatVND(it.laborCost)}`}
                                </div>
                              </td>
                              <td className="py-3 px-3 max-w-xs space-y-1">
                                <div className="font-extrabold text-indigo-900 flex items-center gap-1">
                                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>{it.responsible}</span>
                                </div>
                                <p className="text-[10px] text-slate-600 leading-tight">
                                  {it.responsibleRule}
                                </p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Chargeback & Policy Rules Card */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>Quy Chế Phân Định Trách Nhiệm & Bồi Hoàn Tài Chính (Attivo SOP):</span>
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] text-slate-700">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <strong className="text-purple-800 block mb-0.5">1. Hãng Sản Xuất (Vendor):</strong>
                        Hãng đóng thiếu theo Packing List quốc tế $\rightarrow$ Bộ phận Mua hàng lập Ticket Claim, hãng chịu 100% cước Air bù hỏa tốc hoặc trừ Credit Note PO tiếp theo.
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <strong className="text-amber-800 block mb-0.5">2. Phòng Kho Vận (Logistics):</strong>
                        Cont về kho đã đủ nhưng thủ kho bốc thiếu lên xe tải ra công trình $\rightarrow$ Chi phí xe tải bốc bù hạch toán vào OpEx hao phí kho vận và đánh giá KPI thủ kho.
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <strong className="text-blue-800 block mb-0.5">3. Đơn Vị Xe Tải (Carrier):</strong>
                        Đơn vị vận tải làm rơi rớt, rách vỡ hoặc thất lạc kiện hàng trong hành trình $\rightarrow$ Giữ tiền cước chuyến hoặc yêu cầu bồi thường theo Biên bản giao nhận.
                      </div>
                    </div>
                  </div>
                </div>
              ) : shortageModalTab === "warehouse" ? (
                /* Tab 2: Warehouse Inventory & Buffer Stock SOP */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                    <Warehouse className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-blue-800">Quy Chuẩn Quản Lý Kho Bãi Khi Ship Bù (SOP 3 Bước):</strong>
                      <p className="mt-0.5 text-[11px] text-blue-900/80">
                        Quy định cách ứng phó tại chỗ để không gián đoạn lễ khai trương của khách và quy chuẩn lưu trữ, thẩm định, cách ly hàng cũ/hàng lỗi tại kho Đông Anh & Bình Dương.
                      </p>
                    </div>
                  </div>

                  {/* 3 Step Cards */}
                  <div className="space-y-3">
                    {/* Step 1 */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-300 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                            1
                          </span>
                          <h4 className="font-extrabold text-xs text-slate-900">
                            Cơ Chế Mượn Kho Đệm Phụ Tùng (Buffer Spare Parts Borrowing & Restock)
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Ứng Phó Khẩn Cấp
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-8">
                        • <strong>Tạm Xuất Lắp Trước:</strong> Khi hiện trường thiếu hàng cần gấp cho lễ khai trương, KTV được phép lập phiếu đề xuất tạm xuất linh kiện tương đương từ <strong>Kho Đệm Phụ Tùng (Buffer Spare Parts)</strong> đặt sẵn tại kho Bình Dương hoặc Đông Anh.<br />
                        • <strong>Hạch Toán Thẻ Kho:</strong> Xuất phiếu <em>&ldquo;Tạm xuất công trình {currentChecklist.projectId}&rdquo;</em> để KTV mang đi lắp ráp ngay trong ngày.<br />
                        • <strong>Nhập Hoàn Nguyên (Restock Return):</strong> Khi lô hàng ship bù từ hãng hoặc nhà xe về đến kho, thủ kho lập biên bản kiểm nhận và nhập hoàn trả vào Kho Đệm để bù lại mức tồn kho an toàn ban đầu.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-rose-300 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                            2
                          </span>
                          <h4 className="font-extrabold text-xs text-slate-900">
                            Khu Vực Cách Ly Hàng Cũ / Hàng Lỗi (Quarantine Zone & Red Tag RMA)
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                          Tuyệt Đối Không Lẫn Hàng
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-8">
                        • <strong>Cách Ly Vật Lý:</strong> Toàn bộ hàng cũ, phụ tùng tháo từ công trình hoặc linh kiện bị méo móp, lỗi kỹ thuật thu hồi về kho được chuyển thẳng vào <strong>Khu Vực Cách Ly (Quarantine Zone)</strong> riêng biệt.<br />
                        • <strong>Dán Nhãn Đỏ (Red Tag RMA):</strong> Dán tem nhãn cảnh báo đỏ ghi rõ: <em>Mã Dự Án ({currentChecklist.projectId}) • Ngày Thu Hồi • Hiện Trạng Hư Hỏng • KTV Bàn Giao</em>.<br />
                        • <strong>Khóa Xuất Kho Số:</strong> Hệ thống ERP tự động khóa không cho phép phân bổ các mã hàng trong Quarantine Zone vào các đơn hàng thương mại mới.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                            3
                          </span>
                          <h4 className="font-extrabold text-xs text-slate-900">
                            Quy Trình Định Đoạt & Xử Lý Hàng Cũ 3 Hướng (Triage & Disposition Protocol)
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Định Đoạt Sau 7 Ngày
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs pl-8">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <strong className="text-emerald-800 block text-[11px] mb-1">Hướng A: Tái Chế / Sửa Chữa (Refurbish)</strong>
                          <p className="text-[11px] text-slate-600 leading-normal">
                            Linh kiện cơ khí còn tốt được KTV bảo dưỡng, thay mỡ, làm sạch và chuyển thành phụ tùng dự phòng phục vụ bảo trì định kỳ.
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <strong className="text-purple-800 block text-[11px] mb-1">Hướng B: Xuất Trả Hãng (Return to Vendor)</strong>
                          <p className="text-[11px] text-slate-600 leading-normal">
                            Bo mạch điện tử, motor Precor/Merrithew bị lỗi kỹ thuật được đóng kiện gửi trả hãng đối tác theo hợp đồng bảo hành quốc tế.
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <strong className="text-rose-800 block text-[11px] mb-1">Hướng C: Tiêu Hủy / Xuất Bỏ (Scrap)</strong>
                          <p className="text-[11px] text-slate-600 leading-normal">
                            Linh kiện gãy nứt không thể phục hồi $\rightarrow$ Hội đồng kho + Kế toán lập Biên bản hủy và hạch toán giảm trừ tài sản.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Tab 3: Quarantine Zone & Red Tag RMA Hub */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-rose-900 font-extrabold">
                        Khu Vực Cách Ly Hàng Lỗi &amp; Tem Đỏ Red Tag RMA (Quarantine Isolation Hub):
                      </strong>
                      <p className="mt-0.5 text-[11px] text-rose-900/80 leading-relaxed">
                        Toàn bộ linh kiện bị móp méo, trầy xước trong vận tải, giao sai thông số kỹ thuật (110V vs 220V) hoặc hư hỏng sau tháo dỡ tại công trình được tập kết về phân khu cách ly riêng tại kho Bình Dương / Đông Anh. <strong>Tuyệt đối không cấp phát vào đơn hàng mới.</strong>
                      </p>
                    </div>
                  </div>

                  {/* Quarantine Items Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                          <th className="py-2.5 px-3">Mã Red Tag RMA</th>
                          <th className="py-2.5 px-3">Linh Kiện / Thiết Bị Lỗi</th>
                          <th className="py-2.5 px-3">Tình Trạng Hư Hỏng</th>
                          <th className="py-2.5 px-3">Khu Vực Lưu Kho</th>
                          <th className="py-2.5 px-3">Hướng Định Đoạt (Disposition)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {shortageAnalysis.items.map((it, idx) => (
                          <tr key={it.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-100 text-rose-900 border border-rose-300">
                                RMA-{currentChecklist.projectId?.slice(-3) || "01"}-{String(idx + 1).padStart(2, "0")}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-extrabold text-slate-900">{it.name}</div>
                              <div className="text-[10px] text-slate-500">SL thu hồi: {it.missingQty} {it.unit}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-[11px] text-rose-800 font-bold">
                                {it.causeCode === "spec_mismatch"
                                  ? "Sai quy cách / Cần biến áp chuyển nguồn"
                                  : it.causeCode === "transport_damage"
                                  ? "Móp méo / Trầy xước do va đập vận chuyển"
                                  : it.causeCode === "vendor"
                                  ? "Hãng đóng thiếu / Chờ Air Cargo gửi bù"
                                  : "Lỗi kiểm kê kho / Cần thẩm định lại"}
                              </span>
                              <div className="text-[10px] text-slate-500 italic mt-0.5">{it.note || "Đang dán tem Red Tag"}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {currentChecklist.projectId?.includes("HN") ? "Kệ Z-01 Kho Đông Anh" : "Kệ Q-04 Kho Bình Dương"}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                  {it.causeCode === "vendor" || it.causeCode === "spec_mismatch"
                                    ? "Hướng B: Xuất Trả Hãng (RMA)"
                                    : "Hướng A: Sửa Chữa / Dự Phòng (Refurbish)"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {shortageAnalysis.items.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                              Hiện tại không có linh kiện nào trong phân khu cách ly cho dự án này.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Disposition Protocol Explanation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                      <strong className="text-purple-900 block text-xs font-bold mb-1">
                        Hướng A: Sửa Chữa &amp; Làm Mới (Refurbish)
                      </strong>
                      <p className="text-[11px] text-purple-950/80 leading-relaxed">
                        Linh kiện cơ khí còn tốt được xưởng ATV phục hồi lớp sơn tĩnh điện, thay mỡ bảo dưỡng và lưu vào Kho Phụ Tùng Bảo Trì dự phòng.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                      <strong className="text-indigo-900 block text-xs font-bold mb-1">
                        Hướng B: Xuất Trả Hãng Đối Tác (RMA Vendor)
                      </strong>
                      <p className="text-[11px] text-indigo-950/80 leading-relaxed">
                        Bo mạch điện tử, motor Precor/Merrithew lỗi sản xuất được đóng pallet gỗ bảo vệ và mở tờ khai tái xuất trả nhà sản xuất.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                      <strong className="text-slate-800 block text-xs font-bold mb-1">
                        Hướng C: Hủy Bỏ Giảm Trừ (Scrap Asset)
                      </strong>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Linh kiện gãy vỡ biến dạng hoàn toàn $\rightarrow$ Hội đồng kho và Kế toán lập biên bản tiêu hủy hạch toán vào chi phí rủi ro chuỗi cung ứng.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-slate-500 font-medium hidden sm:block">
                Áp dụng chuẩn mực <strong>SOP Logistics & Quản Trị Chuỗi Cung Ứng Attivo International</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (showToast) {
                      showToast(`Đã xuất Lệnh Ship Bù & Yêu cầu bồi hoàn cho ${currentChecklist.projectName}!`);
                    }
                    setShowShortageModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Xuất Lệnh Ship Bù & Claim</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowShortageModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
