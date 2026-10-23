import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { parseHash, buildHash, normalizeTab } from "./utils/navigation";
import Sidebar from "./components/Sidebar";
import MasterOperationsMatrix from "./components/MasterOperationsMatrix";
import ProjectGanttChart from "./components/ProjectGanttChart";
import ExecutiveWBR from "./components/ExecutiveWBR";
import OperationsCalendar from "./components/OperationsCalendar";
import Dashboard from "./components/Dashboard";

import LogisticsHub from "./components/LogisticsHub";
import FinanceHub from "./components/FinanceHub";
import ProjectsTracker from "./components/ProjectsTracker";
import InstallationChecklist from "./components/InstallationChecklist";
import MaintenanceSchedule from "./components/MaintenanceSchedule";
import TenderManager from "./components/TenderManager";
import DesignSalesProgress from "./components/DesignSalesProgress";

import DMSHub from "./components/DMSHub";
import HubspotIntegrationHub from "./components/HubspotIntegrationHub";
import OperationalFlowHub from "./components/OperationalFlowHub";
import UserManager from "./components/UserManager";
import TelegramBotHub from "./components/TelegramBotHub";
import RoleWorkspaceBar from "./components/RoleWorkspaceBar";
import FieldWorkLogModal from "./components/FieldWorkLogModal";
import MobileBottomNav from "./components/MobileBottomNav";
import DedicatedMobileApp from "./components/DedicatedMobileApp";

import { initialUsers, initialRoles } from "./data/initialUsers";

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
  initialNotifications,
  initialFieldWorkLogs,
} from "./data/initialData";

// Corrupted localStorage must not crash the whole app; fall back to seed data.
function readStoredJSON(key, fallback) {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;
  try {
    return JSON.parse(saved) ?? fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const initialRoute = parseHash(typeof window !== "undefined" ? window.location.hash : "");
  const [activeTab, setActiveTabState] = useState(initialRoute.tab);
  const [routeParams, setRouteParams] = useState(initialRoute.params);
  const [selectedProjectIdForChecklist, setSelectedProjectIdForChecklist] = useState(
    initialRoute.params?.project || initialRoute.params?.id || "PRJ-001"
  );
  const [toastMessage, setToastMessage] = useState(null);
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dedicated Mobile App mode state: defaults to true on phones < 768px (excluding JSDOM test suite)
  const [isMobileMode, setIsMobileMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("atv_dedicated_mobile_mode");
      if (saved !== null) return saved === "true";
      const isJsdom = typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.includes("jsdom");
      return !isJsdom && window.innerWidth < 768;
    }
    return false;
  });

  const toggleMobileMode = (val) => {
    setIsMobileMode(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("atv_dedicated_mobile_mode", String(val));
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const navigate = (tab, params = {}) => {
    const cleanTab = normalizeTab(tab);
    setActiveTabState(cleanTab);
    setRouteParams(params);
    const newHash = buildHash(cleanTab, params);
    if (typeof window !== "undefined" && window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
  };

  const setActiveTab = (tab) => {
    if (tab === "design_sales") {
      setActiveTab("design");
      return;
    }
    if (tab === "schedule") {
      setActiveTab("maintenance");
      return;
    }
    navigate(tab, {});
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!window.location.hash) {
        window.location.hash = buildHash(initialRoute.tab, initialRoute.params);
      }
      const handleHashChange = () => {
        const { tab, params } = parseHash(window.location.hash);
        setActiveTabState(tab);
        setRouteParams(params);
        if (params.project || params.id) {
          setSelectedProjectIdForChecklist(params.project || params.id);
        }
      };
      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }
  }, []);

  // Week 19/10/2026 data version check to invalidate outdated week cache
  const CURRENT_DATA_WEEK = "2026-10-19-v5";
  try {
    const storedWeek = localStorage.getItem("atv_data_week");
    if (storedWeek && storedWeek !== CURRENT_DATA_WEEK) {
      localStorage.removeItem("atv_shipments");
      localStorage.removeItem("atv_schedule");
      localStorage.removeItem("atv_collections");
      localStorage.removeItem("atv_designtasks");
      localStorage.removeItem("atv_projects");
      localStorage.removeItem("atv_checklists");
      localStorage.removeItem("atv_tenders");
    }
    if (storedWeek !== CURRENT_DATA_WEEK) {
      localStorage.setItem("atv_data_week", CURRENT_DATA_WEEK);
    }
  } catch (e) {}

  // LocalStorage state management
  const [shipments, setShipments] = useState(() => {
    const saved = localStorage.getItem("atv_shipments");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 14) return parsed;
      } catch (e) {}
    }
    return initialShipments;
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("atv_projects");
    if (!saved) return initialProjects;
    try {
      const parsed = JSON.parse(saved);
      const parsedIds = new Set(parsed.map((p) => p.id));
      const missingInitial = initialProjects.filter((ip) => !parsedIds.has(ip.id));
      const updatedExisting = parsed.map((p) => {
        const init = initialProjects.find((ip) => ip.id === p.id);
        if (!init) return p;
        // Check if stored deal has an old mock ID or wrong format
        const isMockDeal = !p.hubspotDeal?.dealId || p.hubspotDeal.dealId === "9482710431" || String(p.hubspotDeal.dealId).length < 11 || (p.hubspotDeal?.owner && p.hubspotDeal.owner.includes("Marketing"));
        const isMockContact = !p.hubspotContact?.contactId || String(p.hubspotContact.contactId).length < 10 || (p.hubspotContact?.contactOwner && p.hubspotContact.contactOwner.includes("Marketing") && !p.hubspotContact.contactOwner.includes("Attivo")) || p.hubspotContact?.contactOwner === "Hanna Tạ";
        const hasMockTickets = !p.hubspotTickets || p.hubspotTickets.some(t => String(t.ticketId || t.id).startsWith("TKT-") || String(t.ticketId || t.id).length < 11);
        const isMockStaff = !p.deliveryTicket || !p.dealOwner || ["Lê Mỹ Huyền", "Nguyễn Văn Dũng", "Phạm Quốc Tuấn", "Ban Giám Đốc", "Nguyễn Văn Hùng"].includes(p.leadSale) || ["Nguyễn Văn Hùng"].includes(p.dealOwner) || (p.dealOwner && p.dealOwner.includes("Marketing")) || (p.contactOwner && p.contactOwner.includes("Marketing") && !p.contactOwner.includes("Attivo")) || p.contactOwner === "Hanna Tạ";
        return {
          ...init,
          ...p,
          designer2D: p.designer2D === "Hoàng Long" || !p.designer2D ? "Lý" : init.designer2D || "Lý",
          designer3D: p.designer3D === "Thu Thảo" || !p.designer3D ? "Lý" : init.designer3D || "Lý",
          leadSale: p.leadSale === "Nguyễn Văn Hùng" || isMockStaff ? init.leadSale : p.leadSale,
          dealOwner: p.dealOwner === "Nguyễn Văn Hùng" || isMockStaff ? init.dealOwner : p.dealOwner,
          handoverDate: init.handoverDate || p.handoverDate,
          marketingReady: init.marketingReady !== undefined ? init.marketingReady : p.marketingReady,
          marketingNote: init.marketingNote || p.marketingNote,
          leadScore: init.leadScore !== undefined ? init.leadScore : p.leadScore,
          isVip: init.isVip !== undefined ? init.isVip : p.isVip,
          vipReason: init.vipReason || p.vipReason,
          rfmSegment: init.rfmSegment || p.rfmSegment,
          signalSale: init.signalSale || p.signalSale,
          contactOwner: init.contactOwner || p.contactOwner,
          deliveryTicket: init.deliveryTicket || p.deliveryTicket,
          assignedTech: isMockStaff ? init.assignedTech : (p.assignedTech || init.assignedTech),
          hubspotDeal: isMockDeal || p.hubspotDeal?.owner === "Nguyễn Văn Hùng" ? init.hubspotDeal : (p.hubspotDeal || init.hubspotDeal),
          hubspotContact: isMockContact ? init.hubspotContact : (p.hubspotContact || init.hubspotContact),
          hubspotTickets: hasMockTickets ? init.hubspotTickets : (p.hubspotTickets || init.hubspotTickets),
          dmsDocuments: p.dmsDocuments || init.dmsDocuments,
        };
      });
      const combined = [...updatedExisting, ...missingInitial];
      try {
        localStorage.setItem("atv_projects", JSON.stringify(combined));
      } catch (e) {}
      return combined;
    } catch {
      return initialProjects;
    }
  });

  const [checklists, setChecklists] = useState(() => {
    return readStoredJSON("atv_checklists", initialInstallationChecklists);
  });

  const [fieldWorkLogs, setFieldWorkLogs] = useState(() => {
    const stored = readStoredJSON("atv_field_work_logs", initialFieldWorkLogs);
    if (Array.isArray(stored) && stored.length > 0) {
      // Ensure any new initial seed logs are present
      const storedIds = new Set(stored.map((l) => l.id));
      const missingInitial = initialFieldWorkLogs.filter((il) => !storedIds.has(il.id));
      return [...stored, ...missingInitial];
    }
    return initialFieldWorkLogs;
  });

  useEffect(() => {
    try {
      localStorage.setItem("atv_field_work_logs", JSON.stringify(fieldWorkLogs));
    } catch (e) {}
  }, [fieldWorkLogs]);

  const [dmsDocuments, setDmsDocuments] = useState(() => {
    const saved = localStorage.getItem("atv_dms_docs");
    if (!saved) return initialDmsDocuments;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialDmsDocuments;
    } catch {
      return initialDmsDocuments;
    }
  });

  const [hubspotTickets, setHubspotTickets] = useState(() => {
    const saved = localStorage.getItem("atv_hubspot_tickets");
    if (!saved) return initialHubspotTickets;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasMock = parsed.some(t => String(t.ticketId || t.id).startsWith("TKT-") || String(t.ticketId || t.id).length < 11);
        if (hasMock) return initialHubspotTickets;
        return parsed;
      }
      return initialHubspotTickets;
    } catch {
      return initialHubspotTickets;
    }
  });

  const [hubspotContacts, setHubspotContacts] = useState(() => {
    const saved = localStorage.getItem("atv_hubspot_contacts");
    if (!saved) return initialHubspotContacts;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasMock = parsed.some(c => String(c.contactId || c.id).length < 10 || c.owner?.includes("Marketing)") || c.owner === "Hanna Tạ");
        if (hasMock) return initialHubspotContacts;
        return parsed;
      }
      return initialHubspotContacts;
    } catch {
      return initialHubspotContacts;
    }
  });

  const [collections, setCollections] = useState(() => {
    const saved = localStorage.getItem("atv_collections");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const parsedIds = new Set(parsed.map((c) => c.id));
          const missing = initialFinanceCollections.filter((ic) => !parsedIds.has(ic.id));
          const merged = [...parsed, ...missing];
          try {
            localStorage.setItem("atv_collections", JSON.stringify(merged));
          } catch (e) {}
          return merged;
        }
      } catch (e) {}
    }
    return initialFinanceCollections;
  });

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem("atv_schedule");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.HCM?.[0]?.tasks?.[0]?.content?.includes("ISH")) return parsed;
      } catch (e) {}
    }
    return initialWeeklySchedule;
  });

  const [tenders, setTenders] = useState(() => {
    const stored = readStoredJSON("atv_tenders", initialTenders);
    if (Array.isArray(stored)) {
      const storedMap = new Map(stored.map((t) => [t.id, t]));
      const updated = initialTenders.map((it) => {
        const exist = storedMap.get(it.id);
        if (!exist) return it;
        return {
          ...exist,
          projectId: exist.projectId || it.projectId,
          contractCode: exist.contractCode || it.contractCode,
          note: exist.note || it.note,
          type: exist.type || it.type,
          valueBeforeVat: exist.valueBeforeVat !== undefined ? exist.valueBeforeVat : it.valueBeforeVat,
        };
      });
      const initIds = new Set(initialTenders.map((it) => it.id));
      const userCustom = stored.filter((t) => !initIds.has(t.id));
      const result = [...updated, ...userCustom];
      try {
        localStorage.setItem("atv_tenders", JSON.stringify(result));
      } catch (e) {}
      return result;
    }
    return initialTenders;
  });

  const [designTasks, setDesignTasks] = useState(() => {
    const saved = localStorage.getItem("atv_designtasks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const parsedIds = new Set(parsed.map((t) => t.id));
          const missing = initialDesignSalesTasks.filter((it) => !parsedIds.has(it.id));
          const merged = [...parsed, ...missing];
          try {
            localStorage.setItem("atv_designtasks", JSON.stringify(merged));
          } catch (e) {}
          return merged;
        }
      } catch (e) {}
    }
    return initialDesignSalesTasks;
  });


  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("atv_users");
    if (!saved) return initialUsers;
    try {
      const parsed = JSON.parse(saved);
      const hasDeactivatedOrMock = parsed.some(
        (u) =>
          u.name === "Thảo Vũ" ||
          (u.id === "USR-005" && !u.name?.includes("Sơn")) ||
          (u.id === "USR-004" && u.roleId !== "sales_lead") ||
          u.name === "Nguyễn Hoàng Nam" ||
          u.name === "Vũ Bích Ngọc" ||
          u.name === "Duyen Nguyen" ||
          u.name === "Quang Nguyễn" ||
          u.name === "Trang Tender Nguyen" ||
          u.name === "Thuy Dzung" ||
          u.name?.toLowerCase().includes("rajan") ||
          u.hubspotOwnerId === "90300189" ||
          u.hubspotOwnerId === "472995694" ||
          u.hubspotOwnerId === "1335377212" ||
          u.hubspotOwnerId === "1835791357" ||
          u.hubspotOwnerId === "254471861" ||
          u.hubspotOwnerId === "414376834" ||
          u.hubspotOwnerId === "90301297"
      );
      if (hasDeactivatedOrMock) {
        localStorage.setItem("atv_users", JSON.stringify(initialUsers));
        return initialUsers;
      }
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialUsers;
    } catch {
      return initialUsers;
    }
  });

  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem("atv_roles");
    if (!saved) return initialRoles;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialRoles;
    } catch {
      return initialRoles;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("atv_current_user");
    if (!saved) return initialUsers[0];
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.name === "Nguyễn Hoàng Nam" || !parsed?.id) return initialUsers[0];
      return parsed;
    } catch {
      return initialUsers[0];
    }
  });

  const [notifications, setNotifications] = useState(() => {
    return readStoredJSON("atv_notifications", initialNotifications);
  });

  // Route Guard: auto-redirect if currentUser's role has permission 'none' for activeTab
  useEffect(() => {
    if (!currentUser || !currentUser.roleId) return;
    const currentRole = (roles && roles.length > 0 ? roles : initialRoles).find(
      (r) => r.id === currentUser.roleId
    ) || initialRoles.find((r) => r.id === currentUser.roleId);
    if (!currentRole || currentRole.id === "admin") return;

    const tabPerm = currentRole.permissions?.[activeTab];
    if (tabPerm === "none") {
      const canonicalTabs = [
        "matrix", "gantt", "projects", "logistics", "checklist", "maintenance",
        "calendar", "dms", "hubspot", "flow", "tender", "design", "finance", "wbr", "users"
      ];
      const fallback = canonicalTabs.find((t) => currentRole.permissions?.[t] && currentRole.permissions[t] !== "none") || "matrix";
      navigate(fallback);
      showToast(`🔒 Bạn không có quyền truy cập mục "${activeTab}". Đã chuyển về "${fallback}".`);
    }
  }, [currentUser, activeTab, roles]);

  // Real-time synchronization with Telegram bot daemon for completed project notifications
  useEffect(() => {
    let isMounted = true;
    const fetchLatestNotifications = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/notifications", {
          signal: AbortSignal.timeout(2500),
        });
        if (!res.ok) return;
        const serverNotifs = await res.json();
        if (Array.isArray(serverNotifs) && serverNotifs.length > 0 && isMounted) {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const newItems = serverNotifs.filter((n) => !existingIds.has(n.id));
            if (newItems.length > 0) {
              const latest = newItems[0];
              showToast(`🔔 [Thông Báo]: ${latest.title}`);
              return [...newItems, ...prev];
            }
            return prev;
          });
        }
      } catch (e) {
        // Backend daemon may be offline or in production environment, silently ignore
      }
    };

    fetchLatestNotifications();
    const interval = setInterval(fetchLatestNotifications, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("atv_notifications", JSON.stringify(notifications));
  }, [notifications]);


  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("atv_shipments", JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem("atv_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("atv_checklists", JSON.stringify(checklists));
  }, [checklists]);

  useEffect(() => {
    localStorage.setItem("atv_schedule", JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem("atv_tenders", JSON.stringify(tenders));
  }, [tenders]);

  useEffect(() => {
    localStorage.setItem("atv_designtasks", JSON.stringify(designTasks));
  }, [designTasks]);

  useEffect(() => {
    localStorage.setItem("atv_collections", JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem("atv_dms_docs", JSON.stringify(dmsDocuments));
  }, [dmsDocuments]);

  useEffect(() => {
    localStorage.setItem("atv_hubspot_tickets", JSON.stringify(hubspotTickets));
  }, [hubspotTickets]);

  useEffect(() => {
    localStorage.setItem("atv_hubspot_contacts", JSON.stringify(hubspotContacts));
  }, [hubspotContacts]);

  useEffect(() => {
    localStorage.setItem("atv_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("atv_roles", JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem("atv_current_user", JSON.stringify(currentUser));
  }, [currentUser]);

  const handleResetData = () => {
    if (window.confirm("Bạn có chắc chắn muốn đặt lại dữ liệu mẫu ban đầu của Attivo (bao gồm HubSpot, DMS & Phân quyền User)?")) {
      setShipments(initialShipments);
      setProjects(initialProjects);
      setChecklists(initialInstallationChecklists);
      setSchedule(initialWeeklySchedule);
      setTenders(initialTenders);
      setDesignTasks(initialDesignSalesTasks);
      setCollections(initialFinanceCollections);
      setDmsDocuments(initialDmsDocuments);
      setHubspotTickets(initialHubspotTickets);
      setHubspotContacts(initialHubspotContacts);
      setUsers(initialUsers);
      setRoles(initialRoles);
      setCurrentUser(initialUsers[0]);
      localStorage.setItem("atv_tenders", JSON.stringify(initialTenders));
      localStorage.setItem("atv_shipments", JSON.stringify(initialShipments));
      localStorage.setItem("atv_projects", JSON.stringify(initialProjects));
      localStorage.setItem("atv_checklists", JSON.stringify(initialInstallationChecklists));
      localStorage.setItem("atv_schedule", JSON.stringify(initialWeeklySchedule));
      localStorage.setItem("atv_designtasks", JSON.stringify(initialDesignSalesTasks));
      localStorage.setItem("atv_collections", JSON.stringify(initialFinanceCollections));
      localStorage.setItem("atv_dms_docs", JSON.stringify(initialDmsDocuments));
      localStorage.setItem("atv_hubspot_tickets", JSON.stringify(initialHubspotTickets));
      localStorage.setItem("atv_hubspot_contacts", JSON.stringify(initialHubspotContacts));
      localStorage.setItem("atv_users", JSON.stringify(initialUsers));
      localStorage.setItem("atv_roles", JSON.stringify(initialRoles));
      localStorage.setItem("atv_current_user", JSON.stringify(initialUsers[0]));
      setNotifications(initialNotifications);
      localStorage.setItem("atv_notifications", JSON.stringify(initialNotifications));
    }
  };

  const navigateToChecklist = (projectId) => {
    setSelectedProjectIdForChecklist(projectId);
    navigate("checklist", { project: projectId });
  };

  // Dedicated Mobile App Rendering
  if (isMobileMode) {
    return (
      <DedicatedMobileApp
        projects={projects}
        setProjects={setProjects}
        checklists={checklists}
        setChecklists={setChecklists}
        shipments={shipments}
        collections={collections}
        setCollections={setCollections}
        schedule={schedule}
        setSchedule={setSchedule}
        tenders={tenders}
        setTenders={setTenders}
        dmsDocuments={dmsDocuments}
        setDmsDocuments={setDmsDocuments}
        users={users}
        setUsers={setUsers}
        roles={roles}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        hubspotTickets={hubspotTickets}
        setHubspotTickets={setHubspotTickets}
        hubspotContacts={hubspotContacts}
        setHubspotContacts={setHubspotContacts}
        notifications={notifications}
        onSwitchToDesktop={() => toggleMobileMode(false)}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Left Sidebar Column */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shipments={shipments}
        setShipments={setShipments}
        projects={projects}
        setProjects={setProjects}
        tenders={tenders}
        collections={collections}
        setCollections={setCollections}
        schedule={schedule}
        setSchedule={setSchedule}
        dmsDocuments={dmsDocuments}
        hubspotTickets={hubspotTickets}
        users={users}
        roles={roles}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        notifications={notifications}
        setNotifications={setNotifications}
        onResetData={handleResetData}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Full-Width Content Area */}
      <div className="flex-1 min-w-0 lg:ml-72 flex flex-col min-h-screen">
        <header className="px-3 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-0">
          <RoleWorkspaceBar
            activeTab={activeTab}
            onNavigateTab={navigate}
            projects={projects}
            checklists={checklists}
            tenders={tenders}
            collections={collections}
            shipments={shipments}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            users={users}
            onOpenChecklist={navigateToChecklist}
            onOpenLogTime={() => setShowQuickLogModal(true)}
            onSwitchToMobile={() => toggleMobileMode(true)}
            showToast={showToast}
          />
        </header>

        <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-6">
          {activeTab === "matrix" && (
            <MasterOperationsMatrix
              projects={projects}
              setProjects={setProjects}
              shipments={shipments}
              checklists={checklists}
              schedule={schedule}
              tenders={tenders}
              designTasks={designTasks}
              selectedProjectId={routeParams.id || routeParams.project}
              onNavigateTab={navigate}
              onOpenChecklist={navigateToChecklist}
              showToast={showToast}
            />
          )}

          {activeTab === "gantt" && (
            <ProjectGanttChart
              projects={projects}
              setProjects={setProjects}
              shipments={shipments}
              checklists={checklists}
              hubspotTickets={hubspotTickets}
              dmsDocuments={dmsDocuments}
              schedule={schedule}
              tenders={tenders}
              selectedProjectId={routeParams.id || routeParams.project}
              onOpenChecklist={navigateToChecklist}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "flow" && (
            <OperationalFlowHub
              projects={projects}
              setProjects={setProjects}
              shipments={shipments}
              tenders={tenders}
              checklists={checklists}
              hubspotTickets={hubspotTickets}
              dmsDocuments={dmsDocuments}
              designTasks={designTasks}
              collections={collections}
              schedule={schedule}
              users={users}
              onNavigateTab={navigate}
              onOpenChecklist={navigateToChecklist}
              showToast={showToast}
            />
          )}

          {activeTab === "dms" && (
            <DMSHub
              dmsDocuments={dmsDocuments}
              setDmsDocuments={setDmsDocuments}
              projects={projects}
              selectedDocId={routeParams.doc || routeParams.id}
              onOpenProjectDetail={(id) => navigate("projects", { id })}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "hubspot" && (
            <HubspotIntegrationHub
              projects={projects}
              setProjects={setProjects}
              shipments={shipments}
              tenders={tenders}
              collections={collections}
              schedule={schedule}
              hubspotTickets={hubspotTickets}
              setHubspotTickets={setHubspotTickets}
              hubspotContacts={hubspotContacts}
              setHubspotContacts={setHubspotContacts}
              selectedId={routeParams.id || routeParams.deal || routeParams.ticket}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "users" && (
            <UserManager
              users={users}
              setUsers={setUsers}
              roles={roles}
              setRoles={setRoles}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "wbr" && (
            <ExecutiveWBR
              projects={projects}
              setProjects={setProjects}
              shipments={shipments}
              tenders={tenders}
              schedule={schedule}
              designTasks={designTasks}
              collections={collections}
              checklists={checklists}
              users={users}
              currentUser={currentUser}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "calendar" && (
            <OperationsCalendar
              projects={projects}
              shipments={shipments}
              schedule={schedule}
              designTasks={designTasks}
              collections={collections}
              tenders={tenders}
              checklists={checklists}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "dashboard" && (
            <Dashboard
              shipments={shipments}
              projects={projects}
              tenders={tenders}
              weeklySchedule={schedule}
              onNavigate={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "logistics" && (
            <LogisticsHub
              shipments={shipments}
              setShipments={setShipments}
              projects={projects}
              checklists={checklists}
              selectedPoId={routeParams.po || routeParams.id}
              selectedProjectId={routeParams.project}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "finance" && (
            <FinanceHub
              collections={collections}
              setCollections={setCollections}
              onAddCollection={(newCol) => setCollections([newCol, ...collections])}
              projects={projects}
              setProjects={setProjects}
              tenders={tenders}
              selectedProjectId={routeParams.project || routeParams.id}
              currentUser={currentUser}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "projects" && (
            <ProjectsTracker
              projects={projects}
              setProjects={setProjects}
              selectedProjectId={routeParams.id || routeParams.project}
              onNavigateToChecklist={navigateToChecklist}
              onNavigateTab={navigate}
              tenders={tenders}
              setTenders={setTenders}
              designTasks={designTasks}
              setDesignTasks={setDesignTasks}
              collections={collections}
              setCollections={setCollections}
              shipments={shipments}
              checklists={checklists}
              users={users}
              showToast={showToast}
            />
          )}

          {activeTab === "checklist" && (
            <InstallationChecklist
              checklists={checklists}
              setChecklists={setChecklists}
              projects={projects}
              setProjects={setProjects}
              users={users}
              currentUser={currentUser}
              shipments={shipments}
              tenders={tenders}
              collections={collections}
              schedule={schedule}
              setSchedule={setSchedule}
              fieldWorkLogs={fieldWorkLogs}
              setFieldWorkLogs={setFieldWorkLogs}
              initialView={routeParams.view || "checklist"}
              selectedProjectId={routeParams.project || routeParams.id || selectedProjectIdForChecklist}
              setSelectedProjectId={(id) => {
                setSelectedProjectIdForChecklist(id);
                navigate("checklist", { project: id });
              }}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "maintenance" && (
            <MaintenanceSchedule
              schedule={schedule}
              setSchedule={setSchedule}
              selectedTaskId={routeParams.task || routeParams.id}
              users={users}
              projects={projects}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "tender" && (
            <TenderManager
              tenders={tenders}
              setTenders={setTenders}
              projects={projects}
              setProjects={setProjects}
              selectedTenderId={routeParams.tender || routeParams.id}
              currentUser={currentUser}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "design" && (
            <DesignSalesProgress
              tasks={designTasks}
              setTasks={setDesignTasks}
              projects={projects}
              setProjects={setProjects}
              selectedTaskId={routeParams.task || routeParams.id}
              selectedProjectId={routeParams.project}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "telegram" && (
            <TelegramBotHub
              projects={projects}
              setProjects={setProjects}
              checklists={checklists}
              setChecklists={setChecklists}
              schedule={schedule}
              setSchedule={setSchedule}
              shipments={shipments}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}
        </main>

        {/* Quick Tech Field Work Log Modal */}
        {showQuickLogModal && (
          <FieldWorkLogModal
            isOpen={showQuickLogModal}
            onClose={() => setShowQuickLogModal(false)}
            project={projects.find((p) => p.id === "PRJ-001") || projects[0]}
            checklist={checklists.find((c) => c.projectId === "PRJ-001") || checklists[0]}
            onSaveLog={(log) => {
              setFieldWorkLogs((prev) => [log, ...(prev || [])]);
            }}
            showToast={showToast}
          />
        )}

        {/* Floating Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs md:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-2 fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Mobile Fixed Bottom Navigation Bar (Thumb-friendly for 50 field & remote users) */}
        <MobileBottomNav
          activeTab={activeTab}
          onNavigateTab={navigate}
          currentUser={currentUser}
          onToggleMenu={() => setMobileMenuOpen((prev) => !prev)}
          alertCount={shipments.filter((s) => s.shortageStatus !== "normal").length}
        />

        {/* Clean Light Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 mb-16 lg:mb-0">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">ATTIVO OPERATIONS ERP</span>
              <span className="text-slate-300">•</span>
              <span>Hệ thống điều phối vận hành, kho vận & kỹ thuật toàn diện</span>
            </div>
            <span className="text-slate-400">© 2026 Attivo International</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
