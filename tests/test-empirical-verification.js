import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function runTests() {
  console.log('=== EMPIRICAL CHALLENGER ADVERSARIAL TEST SUITE ===\n');
  let failures = [];
  let successes = [];

  function assert(condition, message) {
    if (condition) {
      successes.push(message);
      console.log(`[PASS] ${message}`);
    } else {
      failures.push(message);
      console.error(`[FAIL] ${message}`);
    }
  }

  // ==========================================
  // SECTION 1: DATA INTEGRITY CHECKS
  // ==========================================
  console.log('--- 1. DATA INTEGRITY ---');
  const initialDataPath = path.join(projectRoot, 'src', 'data', 'initialData.js');
  const initialUsersPath = path.join(projectRoot, 'src', 'data', 'initialUsers.js');
  const hubspotServicePath = path.join(projectRoot, 'src', 'utils', 'hubspotService.js');

  const {
    initialShipments,
    initialProjects,
    initialInstallationChecklists,
    initialWeeklySchedule,
    initialTenders,
    initialDesignSalesTasks,
    initialFinanceCollections,
    initialDmsDocuments,
    initialHubspotTickets,
    initialHubspotContacts
  } = await import(`file://${initialDataPath.replace(/\\/g, '/')}`);

  const { initialUsers, initialRoles, MODULE_DEFINITIONS } = await import(`file://${initialUsersPath.replace(/\\/g, '/')}`);
  const { HUBSPOT_PORTAL_ID } = await import(`file://${hubspotServicePath.replace(/\\/g, '/')}`);

  // 1.1 Projects Integrity (8 Projects)
  assert(Array.isArray(initialProjects), 'initialProjects is an array');
  assert(initialProjects.length === 8, `initialProjects has exactly 8 projects (actual: ${initialProjects.length})`);
  const projectIds = initialProjects.map(p => p.id);
  const expectedProjectIds = ['PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005', 'PRJ-006', 'PRJ-007', 'PRJ-008'];
  assert(
    JSON.stringify(projectIds) === JSON.stringify(expectedProjectIds),
    `Project IDs sequence strictly matches PRJ-001 through PRJ-008: ${projectIds.join(', ')}`
  );

  for (const p of initialProjects) {
    assert(p.name && p.customer && p.stage, `Project ${p.id} has name, customer, stage`);
    assert(p.hubspotDeal && p.hubspotDeal.dealId && p.hubspotDeal.dealName && p.hubspotDeal.amount !== undefined, `Project ${p.id} has valid HubSpot deal with amount (${p.hubspotDeal?.amount?.toLocaleString()} VND)`);
    assert(p.hubspotContact && p.hubspotContact.contactId, `Project ${p.id} has valid HubSpot contact (${p.hubspotContact?.contactId})`);
  }

  // 1.2 Shipments Integrity (14 PO shipments: 7 DA, 7 BD - Week 12 Oct)
  assert(Array.isArray(initialShipments), 'initialShipments is an array');
  assert(initialShipments.length === 14, `initialShipments has exactly 14 shipments (actual: ${initialShipments.length})`);

  const daShipments = initialShipments.filter(s => s.warehouse === 'DA');
  const bdShipments = initialShipments.filter(s => s.warehouse === 'BD');
  assert(daShipments.length === 7, `Đông Anh (DA) shipments count is 7 (actual: ${daShipments.length})`);
  assert(bdShipments.length === 7, `Bình Dương (BD) shipments count is 7 (actual: ${bdShipments.length})`);
  assert(
    daShipments.length + bdShipments.length === 14,
    `Warehouse partition DA (7) + BD (7) equals total 14 shipments`
  );

  const actualShipmentCodes = initialShipments.map(s => s.poCode);
  const expectedShipmentCodes = [
    'ULS-AT2606',
    'ME-AT2602',
    'ULS-AT2627-28-30',
    'ULS-AT2629',
    'ULS-AT2633',
    'ULS-AT2631',
    'ULS-AT2632',
    'ULS-AT2634',
    'ME-AT2603'
  ];
  assert(
    expectedShipmentCodes.every(code => actualShipmentCodes.includes(code)),
    `All core PO codes verified in initialShipments: ${actualShipmentCodes.join(', ')}`
  );

  // 1.3 HubSpot Sync Integrity
  assert(HUBSPOT_PORTAL_ID === '19642405', `HubSpot Portal ID is 19642405 (actual: ${HUBSPOT_PORTAL_ID})`);
  assert(Array.isArray(initialHubspotTickets) && initialHubspotTickets.length === 11, `initialHubspotTickets has 11 tickets (actual: ${initialHubspotTickets.length})`);
  assert(Array.isArray(initialHubspotContacts) && initialHubspotContacts.length === 8, `initialHubspotContacts has 8 contacts (actual: ${initialHubspotContacts.length})`);

  // 1.4 Users & Roles Integrity
  assert(Array.isArray(initialUsers) && initialUsers.length >= 10, `initialUsers count >= 10 (actual: ${initialUsers.length})`);
  const activeUsers = initialUsers.filter(u => u.status === 'active');
  assert(activeUsers.length === initialUsers.length, `All ${initialUsers.length} users are active (100% active status)`);

  assert(Array.isArray(initialRoles) && initialRoles.length >= 7, `initialRoles count >= 7 (actual: ${initialRoles.length})`);
  const roleIds = initialRoles.map(r => r.id);
  assert(
    ['admin', 'ops_manager', 'tech_manager', 'sales_lead', 'design_lead', 'marketing_lead', 'finance_lead', 'warehouse_tech'].every(r => roleIds.includes(r)),
    `Core business roles present: ${roleIds.join(', ')}`
  );

  // 1.5 Module Definitions
  assert(Array.isArray(MODULE_DEFINITIONS), 'MODULE_DEFINITIONS is an array');
  assert(MODULE_DEFINITIONS.length >= 15, `MODULE_DEFINITIONS covers >= 15 modules (actual: ${MODULE_DEFINITIONS.length})`);

  // ==========================================
  // SECTION 2: SIDEBAR 4-GROUP & SUB-LABEL CHECKS
  // ==========================================
  console.log('\n--- 2. SIDEBAR STRUCTURE & SUB-LABEL ELIMINATION ---');
  const sidebarContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'Sidebar.jsx'), 'utf-8');

  // Verify the 4 business groups
  const expectedGroups = [
    'Điều hành & Tiến độ',
    'Kinh doanh & Dự án',
    'Kho Vận & Kỹ thuật',
    'Hệ Thống'
  ];
  for (const group of expectedGroups) {
    assert(sidebarContent.includes(`"${group}"`) || sidebarContent.includes(`'${group}'`), `Sidebar has group: "${group}"`);
  }

  // Canonical 15 Tab IDs
  const canonical15Tabs = [
    'matrix',
    'gantt',
    'wbr',
    'calendar',
    'projects',
    'tender',
    'design',
    'finance',
    'logistics',
    'checklist',
    'maintenance',
    'hubspot',
    'dms',
    'users',
    'flow'
  ];

  // Verify each tab exists in Sidebar
  for (const tab of canonical15Tabs) {
    const hasTab = sidebarContent.includes(`id: "${tab}"`) || sidebarContent.includes(`id: '${tab}'`);
    assert(hasTab, `Sidebar nav item includes canonical id: "${tab}"`);
  }

  // Verify no subLabel property in Sidebar.jsx nav items
  const subLabelMatches = sidebarContent.match(/subLabel\s*:/g) || [];
  assert(
    subLabelMatches.length === 0,
    `Zero subLabel properties in Sidebar.jsx (actual: ${subLabelMatches.length})`
  );

  // Verify callback invocation: handleTabSelect calls both setActiveTab and onTabChange
  assert(sidebarContent.includes('if (setActiveTab) setActiveTab(tabId);'), 'Sidebar calls setActiveTab');
  assert(sidebarContent.includes('if (onTabChange) onTabChange(tabId);'), 'Sidebar calls onTabChange');

  // ==========================================
  // SECTION 3: APP.JSX ROUTING & ALIAS MAPPINGS
  // ==========================================
  console.log('\n--- 3. APP.JSX ROUTING & ALIAS RESOLUTION ---');
  const appContent = fs.readFileSync(path.join(projectRoot, 'src', 'App.jsx'), 'utf-8');

  // Check activeTab conditions for all 15 tabs
  for (const tab of canonical15Tabs) {
    const hasTabBranch = appContent.includes(`activeTab === "${tab}"`) || appContent.includes(`activeTab === '${tab}'`);
    assert(hasTabBranch, `App.jsx routes activeTab === "${tab}"`);
  }

  // Check alias mappings: design_sales -> design, schedule -> maintenance
  const hasDesignSalesAlias = appContent.includes('tab === "design_sales"') && appContent.includes('setActiveTab("design")');
  assert(hasDesignSalesAlias, 'App.jsx handles alias "design_sales" -> "design"');

  const hasScheduleAlias = appContent.includes('tab === "schedule"') && appContent.includes('setActiveTab("maintenance")');
  assert(hasScheduleAlias, 'App.jsx handles alias "schedule" -> "maintenance"');

  // ==========================================
  // SECTION 4: DRAWERS & INTERACTIVE CONTROLS
  // ==========================================
  console.log('\n--- 4. DRAWERS & INTERACTIVE CONTROLS ---');

  // 4.1 MasterOperationsMatrix
  const matrixContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'MasterOperationsMatrix.jsx'), 'utf-8');
  assert(matrixContent.includes('searchTerm') && matrixContent.includes('setSearchTerm'), 'MasterOperationsMatrix: search filter exists');
  assert(matrixContent.includes('regionFilter') && matrixContent.includes('setRegionFilter'), 'MasterOperationsMatrix: region filter exists');
  assert(matrixContent.includes('expandedProjectId') && matrixContent.includes('setExpandedProjectId'), 'MasterOperationsMatrix: expandable project detail drawer/accordion exists');
  assert(matrixContent.includes('onOpenChecklist'), 'MasterOperationsMatrix: onOpenChecklist link exists');

  // 4.2 ProjectGanttChart
  const ganttContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'ProjectGanttChart.jsx'), 'utf-8');
  assert(ganttContent.includes('searchTerm') && ganttContent.includes('setSearchTerm'), 'ProjectGanttChart: search filter exists');
  assert(ganttContent.includes('regionFilter') && ganttContent.includes('setRegionFilter'), 'ProjectGanttChart: region filter exists');
  assert(ganttContent.includes('selectedProject') && ganttContent.includes('setSelectedProject'), 'ProjectGanttChart: project detail drawer exists');
  assert(ganttContent.includes('timelineScale') && ganttContent.includes('setTimelineScale'), 'ProjectGanttChart: timeline scale selector exists');

  // 4.3 LogisticsHub
  const logisticsContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'LogisticsHub.jsx'), 'utf-8');
  assert(logisticsContent.includes('search') || logisticsContent.includes('Search'), 'LogisticsHub: search filter exists');
  assert(logisticsContent.includes('warehouseFilter') || logisticsContent.includes('activeWarehouse') || logisticsContent.includes('filterWarehouse') || logisticsContent.includes('selectedWarehouse') || logisticsContent.includes('whFilter') || logisticsContent.includes('DA') && logisticsContent.includes('BD'), 'LogisticsHub: warehouse filtering (DA / BD) exists');
  assert(logisticsContent.includes('selectedShipment') || logisticsContent.includes('selectedPo') || logisticsContent.includes('editingPo') || logisticsContent.includes('modal'), 'LogisticsHub: shipment detail drawer/modal exists');

  // 4.4 ProjectsTracker
  const trackerContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'ProjectsTracker.jsx'), 'utf-8');
  assert(trackerContent.includes('searchTerm') && trackerContent.includes('setSearchTerm'), 'ProjectsTracker: search filter exists');
  assert(trackerContent.includes('filterRegion') && trackerContent.includes('setFilterRegion'), 'ProjectsTracker: region filter exists');
  assert(trackerContent.includes('filterStage') && trackerContent.includes('setFilterStage'), 'ProjectsTracker: stage filter exists');
  assert(trackerContent.includes('selectedProject') && trackerContent.includes('setSelectedProject'), 'ProjectsTracker: project detail drawer exists');
  assert(trackerContent.includes('showAddModal') && trackerContent.includes('setShowAddModal'), 'ProjectsTracker: add project modal exists');

  // 4.5 InstallationChecklist
  const checklistContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'InstallationChecklist.jsx'), 'utf-8');
  assert(checklistContent.includes('selectedProjectId') && checklistContent.includes('setSelectedProjectId'), 'InstallationChecklist: project selector exists');
  assert(checklistContent.includes('handleUpdateItemStatus'), 'InstallationChecklist: item status toggle handler exists');

  // 4.6 MaintenanceSchedule
  const scheduleContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'MaintenanceSchedule.jsx'), 'utf-8');
  assert(scheduleContent.includes('activeRegion') && scheduleContent.includes('setActiveRegion'), 'MaintenanceSchedule: region selector exists');
  assert(scheduleContent.includes('showAddTaskModal') && scheduleContent.includes('setShowAddTaskModal'), 'MaintenanceSchedule: add task modal exists');

  // 4.7 TenderManager
  const tenderContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'TenderManager.jsx'), 'utf-8');
  assert(tenderContent.includes('searchTerm') && tenderContent.includes('setSearchTerm'), 'TenderManager: search filter exists');
  assert(tenderContent.includes('filterType') && tenderContent.includes('filterStatus'), 'TenderManager: type/status filters exist');
  assert(tenderContent.includes('showAddModal') && tenderContent.includes('setShowAddModal'), 'TenderManager: add deal modal exists');

  // 4.8 DesignSalesProgress
  const designContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'DesignSalesProgress.jsx'), 'utf-8');
  assert(designContent.includes('searchTerm') && designContent.includes('setSearchTerm'), 'DesignSalesProgress: search filter exists');
  assert(designContent.includes('filterStage') && designContent.includes('filterRegion'), 'DesignSalesProgress: stage & region filters exist');
  assert(designContent.includes('showAddModal') && designContent.includes('setShowAddModal'), 'DesignSalesProgress: add task modal exists');

  // 4.9 FinanceHub
  const financeContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'FinanceHub.jsx'), 'utf-8');
  assert(financeContent.includes('searchTerm') && financeContent.includes('setSearchTerm'), 'FinanceHub: search filter exists');
  assert(financeContent.includes('selectedBank') && financeContent.includes('setSelectedBank'), 'FinanceHub: bank filter exists');
  assert(financeContent.includes('showAddModal') && financeContent.includes('setShowAddModal'), 'FinanceHub: add collection modal exists');

  // 4.10 DMSHub
  const dmsContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'DMSHub.jsx'), 'utf-8');
  assert(dmsContent.includes('searchTerm') && dmsContent.includes('setSearchTerm'), 'DMSHub: search filter exists');
  assert(dmsContent.includes('selectedCategory') && dmsContent.includes('selectedDepartment'), 'DMSHub: category & dept filters exist');
  assert(dmsContent.includes('selectedDocForPreview') && dmsContent.includes('setSelectedDocForPreview'), 'DMSHub: preview document modal exists');
  assert(dmsContent.includes('showUploadModal') && dmsContent.includes('setShowUploadModal'), 'DMSHub: upload modal exists');

  // 4.11 UserManager
  const userMgrContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'UserManager.jsx'), 'utf-8');
  assert(userMgrContent.includes('searchTerm') && userMgrContent.includes('setSearchTerm'), 'UserManager: search filter exists');
  assert(userMgrContent.includes('filterDept') && userMgrContent.includes('filterRole') && userMgrContent.includes('filterRegion'), 'UserManager: dept, role, region filters exist');
  assert(userMgrContent.includes('editingUser') && userMgrContent.includes('setEditingUser'), 'UserManager: edit user modal exists');
  assert(userMgrContent.includes('showAddModal') && userMgrContent.includes('setShowAddModal'), 'UserManager: add user modal exists');

  // 4.12 HubspotIntegrationHub
  const hubspotContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'HubspotIntegrationHub.jsx'), 'utf-8');
  assert(hubspotContent.includes('searchTerm') && hubspotContent.includes('setSearchTerm'), 'HubspotIntegrationHub: search exists');
  assert(hubspotContent.includes('subTab') && hubspotContent.includes('setSubTab'), 'HubspotIntegrationHub: subTab switching exists');
  assert(hubspotContent.includes('selectedStage') && hubspotContent.includes('selectedOwner'), 'HubspotIntegrationHub: stage & owner filters exist');

  // 4.13 OperationalFlowHub
  const flowContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'OperationalFlowHub.jsx'), 'utf-8');
  assert(flowContent.includes('viewMode') && flowContent.includes('setViewMode'), 'OperationalFlowHub: viewMode switcher exists');
  assert(flowContent.includes('activeStep') && flowContent.includes('setActiveStep'), 'OperationalFlowHub: activeStep navigation exists');
  assert(flowContent.includes('searchProjectTerm') && flowContent.includes('setSearchProjectTerm'), 'OperationalFlowHub: project search exists');

  // 4.14 ExecutiveWBR
  const wbrContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'ExecutiveWBR.jsx'), 'utf-8');
  assert(wbrContent.includes('activeSlideTab') && wbrContent.includes('setActiveSlideTab'), 'ExecutiveWBR: slide tab switcher exists');

  // 4.15 OperationsCalendar
  const calContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'OperationsCalendar.jsx'), 'utf-8');
  assert(calContent.includes('departmentFilter') && calContent.includes('setDepartmentFilter'), 'OperationsCalendar: dept filter exists');
  assert(calContent.includes('viewMode') && calContent.includes('setViewMode'), 'OperationsCalendar: month/week viewMode switcher exists');
  assert(calContent.includes('selectedDate') && calContent.includes('setSelectedDate'), 'OperationsCalendar: date selection exists');

  console.log('\n==========================================');
  console.log(`TOTAL PASSED ASSERTIONS: ${successes.length}`);
  console.log(`TOTAL FAILED ASSERTIONS: ${failures.length}`);
  console.log('==========================================');

  if (failures.length > 0) {
    console.error('\nFAILED ASSERTIONS:');
    failures.forEach(f => console.error(` - ${f}`));
    process.exit(1);
  } else {
    console.log('\nALL EMPIRICAL ASSERTIONS PASSED WITH ZERO FAILURES!');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
