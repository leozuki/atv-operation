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
  const CURRENT_DATA_WEEK = "2026-10-19";
  try {
    const storedWeek = localStorage.getItem("atv_data_week");
    if (storedWeek !== CURRENT_DATA_WEEK) {
      localStorage.removeItem("atv_shipments");
      localStorage.removeItem("atv_schedule");
      localStorage.removeItem("atv_collections");
      localStorage.removeItem("atv_designtasks");
      localStorage.removeItem("atv_projects");
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
      return parsed.map((p) => {
        const init = initialProjects.find((ip) => ip.id === p.id);
        if (!init) return p;
        // Check if stored deal has an old mock ID or wrong format
        const isMockDeal = !p.hubspotDeal?.dealId || p.hubspotDeal.dealId === "9482710431" || String(p.hubspotDeal.dealId).length < 11 || (p.hubspotDeal?.owner && p.hubspotDeal.owner.includes("Marketing"));
        const isMockContact = !p.hubspotContact?.contactId || String(p.hubspotContact.contactId).length < 10 || (p.hubspotContact?.contactOwner && p.hubspotContact.contactOwner.includes("Marketing") && !p.hubspotContact.contactOwner.includes("Attivo")) || p.hubspotContact?.contactOwner === "Hanna Tạ";
        const hasMockTickets = !p.hubspotTickets || p.hubspotTickets.some(t => String(t.ticketId || t.id).startsWith("TKT-") || String(t.ticketId || t.id).length < 11);
        const isMockStaff = !p.deliveryTicket || !p.dealOwner || ["Lê Mỹ Huyền", "Nguyễn Văn Dũng", "Phạm Quốc Tuấn", "Ban Giám Đốc"].includes(p.leadSale) || (p.dealOwner && p.dealOwner.includes("Marketing")) || (p.contactOwner && p.contactOwner.includes("Marketing") && !p.contactOwner.includes("Attivo")) || p.contactOwner === "Hanna Tạ";
        return {
          ...init,
          ...p,
          leadScore: init.leadScore !== undefined ? init.leadScore : p.leadScore,
          isVip: init.isVip !== undefined ? init.isVip : p.isVip,
          vipReason: init.vipReason || p.vipReason,
          rfmSegment: init.rfmSegment || p.rfmSegment,
          signalSale: init.signalSale || p.signalSale,
          leadSale: init.leadSale || p.leadSale,
          dealOwner: init.dealOwner || p.dealOwner,
          contactOwner: init.contactOwner || p.contactOwner,
          deliveryTicket: init.deliveryTicket || p.deliveryTicket,
          assignedTech: isMockStaff ? init.assignedTech : (p.assignedTech || init.assignedTech),
          hubspotDeal: isMockDeal ? init.hubspotDeal : (p.hubspotDeal || init.hubspotDeal),
          hubspotContact: isMockContact ? init.hubspotContact : (p.hubspotContact || init.hubspotContact),
          hubspotTickets: hasMockTickets ? init.hubspotTickets : (p.hubspotTickets || init.hubspotTickets),
          dmsDocuments: p.dmsDocuments || init.dmsDocuments,
        };
      });
    } catch {
      return initialProjects;
    }
  });

  const [checklists, setChecklists] = useState(() => {
    return readStoredJSON("atv_checklists", initialInstallationChecklists);
  });

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
        if (Array.isArray(parsed) && parsed.some(c => c.customer === "COOLER MASTER" || c.customer === "SHILLA")) return parsed;
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
    return readStoredJSON("atv_tenders", initialTenders);
  });

  const [designTasks, setDesignTasks] = useState(() => {
    const saved = localStorage.getItem("atv_designtasks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 15 && parsed.some(t => t.projectName?.includes("PMH H14-3") || t.projectName?.includes("Mai Hắc Đế"))) {
          return parsed;
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
      localStorage.clear();
    }
  };

  const navigateToChecklist = (projectId) => {
    setSelectedProjectIdForChecklist(projectId);
    navigate("checklist", { project: projectId });
  };

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
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onResetData={handleResetData}
      />

      {/* Main Full-Width Content Area */}
      <div className="flex-1 min-w-0 lg:ml-72 flex flex-col min-h-screen">
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
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
              shipments={shipments}
              tenders={tenders}
              schedule={schedule}
              designTasks={designTasks}
              collections={collections}
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
              selectedPoId={routeParams.po || routeParams.id}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "finance" && (
            <FinanceHub
              collections={collections}
              onAddCollection={(newCol) => setCollections([newCol, ...collections])}
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
              showToast={showToast}
            />
          )}

          {activeTab === "checklist" && (
            <InstallationChecklist
              checklists={checklists}
              setChecklists={setChecklists}
              projects={projects}
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
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "tender" && (
            <TenderManager
              tenders={tenders}
              setTenders={setTenders}
              selectedTenderId={routeParams.tender || routeParams.id}
              onNavigateTab={navigate}
              showToast={showToast}
            />
          )}

          {activeTab === "design" && (
            <DesignSalesProgress
              tasks={designTasks}
              setTasks={setDesignTasks}
              selectedTaskId={routeParams.task || routeParams.id}
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

        {/* Floating Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs md:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-2 fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Clean Light Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500">
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
