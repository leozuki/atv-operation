import React, { useState, useMemo, useEffect } from "react";
import {
  Link2,
  RefreshCw,
  ExternalLink,
  Users,
  Briefcase,
  Wrench,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  Phone,
  Mail,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Calendar,
  DollarSign,
  Tag,
  Flame,
  Check,
  Radio,
  Globe,
  Database,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import {
  HUBSPOT_PORTAL_ID,
  ATTIVO_PIPELINES,
  HUBSPOT_OWNERS,
  getHubspotRecordUrl,
  isMarketingDeal,
  fetchHubspotLiveDeals,
  fetchHubspotLiveTickets,
  fetchHubspotLiveContacts,
} from "../utils/hubspotService";
import { formatCurrency, formatShortCurrency } from "../utils/formatters";
import { estimateTicketCompletion, HUBSPOT_TICKET_CATEGORIES } from "../utils/slaEstimator";

export default function HubspotIntegrationHub({
  projects = [],
  setProjects,
  hubspotTickets = [],
  setHubspotTickets,
  hubspotContacts = [],
  setHubspotContacts,
}) {
  const [subTab, setSubTab] = useState("deals"); // "deals" | "tickets" | "contacts" | "pipelines"
  const [dealViewMode, setDealViewMode] = useState("mapped"); // "mapped" | "all_live"
  const [ticketViewMode, setTicketViewMode] = useState("mapped"); // "mapped" | "all_live"
  const [contactViewMode, setContactViewMode] = useState("mapped"); // "mapped" | "all_live"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedOwner, setSelectedOwner] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all"); // "all" | "Marketing" | "Sales Direct"
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(() => new Date().toLocaleString("vi-VN"));
  const [syncMessage, setSyncMessage] = useState(null);

  const [liveDeals, setLiveDeals] = useState([]);
  const [liveTickets, setLiveTickets] = useState([]);
  const [liveContacts, setLiveContacts] = useState([]);

  // Extract mapped deals from projects
  const mappedDeals = useMemo(() => {
    return projects
      .filter((p) => p.hubspotDeal)
      .map((p) => ({
        ...p.hubspotDeal,
        projectId: p.id,
        projectName: p.name,
        customer: p.customer,
        region: p.region,
        contactName: p.hubspotContact?.name || p.contact,
        contactEmail: p.hubspotContact?.email,
        contactPhone: p.hubspotContact?.phone,
        contactChannel: p.hubspotContact?.channel,
        contactCompany: p.hubspotContact?.company,
        stageClass: p.stage,
      }));
  }, [projects]);

  // Determine active deals dataset based on view mode
  const activeDeals = useMemo(() => {
    if (dealViewMode === "all_live" && liveDeals.length > 0) {
      return liveDeals;
    }
    return mappedDeals;
  }, [dealViewMode, liveDeals, mappedDeals]);

  // Statistics
  const dealStats = useMemo(() => {
    const list = dealViewMode === "all_live" && liveDeals.length > 0 ? liveDeals : mappedDeals;
    const totalDeals = list.length;
    const totalValue = list.reduce((acc, d) => acc + (d.amount || 0), 0);
    const mktDeals = list.filter((d) => isMarketingDeal(d));
    const salesDeals = list.filter((d) => !isMarketingDeal(d));
    const wonOrDeposited = list.filter(
      (d) => d.stage === "Closed won" || d.stage === "Deposited"
    );

    return {
      totalDeals,
      totalValue,
      mktCount: mktDeals.length,
      mktValue: mktDeals.reduce((acc, d) => acc + (d.amount || 0), 0),
      salesCount: salesDeals.length,
      salesValue: salesDeals.reduce((acc, d) => acc + (d.amount || 0), 0),
      wonCount: wonOrDeposited.length,
      wonValue: wonOrDeposited.reduce((acc, d) => acc + (d.amount || 0), 0),
    };
  }, [dealViewMode, liveDeals, mappedDeals]);

  // Active tickets dataset
  const activeTickets = useMemo(() => {
    if (ticketViewMode === "all_live" && liveTickets.length > 0) {
      return liveTickets;
    }
    return hubspotTickets;
  }, [ticketViewMode, liveTickets, hubspotTickets]);

  // Ticket statistics
  const ticketStats = useMemo(() => {
    const total = activeTickets.length;
    const urgent = activeTickets.filter((t) => t.priority === "HIGH").length;
    const completed = activeTickets.filter((t) => (t.stage || "").includes("Signed - Done")).length;
    const inProgress = total - completed;

    return { total, urgent, completed, inProgress };
  }, [activeTickets]);

  // Active contacts dataset
  const activeContacts = useMemo(() => {
    if (contactViewMode === "all_live" && liveContacts.length > 0) {
      return liveContacts;
    }
    return hubspotContacts;
  }, [contactViewMode, liveContacts, hubspotContacts]);

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return activeDeals.filter((d) => {
      const name = d.dealName || "";
      const projName = d.projectName || "";
      const owner = d.owner || "";
      const contact = d.contactName || "";

      const matchSearch =
        searchTerm === "" ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStage = selectedStage === "all" || d.stage === selectedStage;
      const matchOwner = selectedOwner === "all" || owner.includes(selectedOwner);
      const matchSource =
        selectedSource === "all" ||
        (selectedSource === "Marketing" && isMarketingDeal(d)) ||
        (selectedSource === "Sales Direct" && !isMarketingDeal(d));

      return matchSearch && matchStage && matchOwner && matchSource;
    });
  }, [activeDeals, searchTerm, selectedStage, selectedOwner, selectedSource]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return activeTickets.filter((t) => {
      const matchSearch =
        searchTerm === "" ||
        (t.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.facility || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.assignedTo || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [activeTickets, searchTerm]);

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    return activeContacts.filter((c) => {
      const matchSearch =
        searchTerm === "" ||
        (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [activeContacts, searchTerm]);

  // Live Sync trigger with real API calls
  const handleLiveSync = async () => {
    setIsSyncing(true);
    setSyncMessage("Đang gọi HubSpot API v3 trực tiếp qua cổng Reverse Proxy Attivo...");

    try {
      const fetchedDeals = await fetchHubspotLiveDeals(60);
      await new Promise((r) => setTimeout(r, 450));
      const fetchedTickets = await fetchHubspotLiveTickets(40);
      await new Promise((r) => setTimeout(r, 450));
      const fetchedContacts = await fetchHubspotLiveContacts(40);

      let dealsCount = 0;
      let ticketsCount = 0;
      let contactsCount = 0;

      if (fetchedDeals && fetchedDeals.length > 0) {
        setLiveDeals(fetchedDeals);
        dealsCount = fetchedDeals.length;

        // Automatically update projects if deal matches
        if (setProjects) {
          setProjects((prev) =>
            prev.map((proj) => {
              const matched = fetchedDeals.find(
                (d) =>
                  d.dealId === proj.hubspotDeal?.dealId ||
                  (d.dealName &&
                    proj.hubspotDeal?.dealName &&
                    d.dealName.toLowerCase() === proj.hubspotDeal.dealName.toLowerCase())
              );
              if (matched) {
                return {
                  ...proj,
                  hubspotDeal: {
                    ...proj.hubspotDeal,
                    dealId: matched.dealId,
                    dealName: matched.dealName,
                    amount: matched.amount || proj.hubspotDeal?.amount,
                    stage: matched.stage,
                    stageId: matched.stageId,
                    owner: matched.owner,
                    ownerId: matched.ownerId,
                    source: matched.source,
                    lastModified: matched.lastModified,
                    hubspotUrl: matched.hubspotUrl,
                  },
                };
              }
              return proj;
            })
          );
        }
      }

      if (fetchedTickets && fetchedTickets.length > 0) {
        setLiveTickets(fetchedTickets);
        ticketsCount = fetchedTickets.length;
        if (setHubspotTickets) {
          setHubspotTickets(fetchedTickets.slice(0, 15));
        }
      }

      if (fetchedContacts && fetchedContacts.length > 0) {
        setLiveContacts(fetchedContacts);
        contactsCount = fetchedContacts.length;
        if (setHubspotContacts) {
          setHubspotContacts(fetchedContacts.slice(0, 15));
        }
      }

      const now = new Date().toLocaleString("vi-VN");
      setLastSyncTime(now);
      setSyncMessage(
        `Đồng bộ hoàn tất từ HubSpot Portal ${HUBSPOT_PORTAL_ID}! Đã kết nối ${dealsCount} Deals, ${ticketsCount} Tickets, ${contactsCount} Contacts thực tế.`
      );
      setTimeout(() => setSyncMessage(null), 6000);
    } catch (err) {
      console.error("HubSpot live sync failed:", err);
      setSyncMessage("Lỗi kết nối API HubSpot: " + err.message);
      setTimeout(() => setSyncMessage(null), 6000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync on initial mount
  useEffect(() => {
    handleLiveSync();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 rounded-xl p-4 md:py-3.5 md:px-5 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-amber-200" />
            <h1 className="text-lg md:text-xl font-bold text-white">HubSpot CRM</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
              Portal {HUBSPOT_PORTAL_ID}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-orange-200">Lần đồng bộ gần nhất:</div>
              <div className="text-xs font-bold text-white">{lastSyncTime}</div>
            </div>
            <button
              onClick={handleLiveSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-orange-700 font-semibold rounded-xl text-sm shadow hover:bg-orange-50 transition active:scale-95 disabled:opacity-75"
            >
              <RefreshCw className={`w-4 h-4 text-orange-600 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Đang Đồng Bộ API..." : "Đồng Bộ HubSpot Ngay"}
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="mt-4 p-3 bg-white/20 backdrop-blur-md rounded-xl text-xs font-semibold text-white flex items-center gap-2 border border-white/30 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-orange-200">Tổng giá trị Deals ({dealViewMode === "all_live" ? "Live CRM" : "Dự Án"})</div>
            <div className="text-2xl font-bold mt-1 text-white">
              {formatShortCurrency(dealStats.totalValue)}
            </div>
            <div className="text-[11px] text-amber-200 mt-0.5">
              {dealStats.totalDeals} thương vụ trong pipeline
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-orange-200">Nguồn Lead Marketing</div>
            <div className="text-2xl font-bold mt-1 text-emerald-300">
              {formatShortCurrency(dealStats.mktValue)}
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5">
              {dealStats.mktCount} deals ({dealStats.totalDeals ? ((dealStats.mktCount / dealStats.totalDeals) * 100).toFixed(0) : 0}%)
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-orange-200">Nguồn Sales Direct</div>
            <div className="text-2xl font-bold mt-1 text-sky-300">
              {formatShortCurrency(dealStats.salesValue)}
            </div>
            <div className="text-[11px] text-sky-200 mt-0.5">
              {dealStats.salesCount} deals do Sales tự tìm
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-orange-200">Tickets Kỹ Thuật ({ticketViewMode === "all_live" ? "Live CRM" : "Dự Án"})</div>
            <div className="text-2xl font-bold mt-1 text-amber-300">
              {ticketStats.total} vé
            </div>
            <div className="text-[11px] text-amber-200 mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-300" /> {ticketStats.urgent} vé ưu tiên cao
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-2xl shadow-sm">
        <button
          onClick={() => setSubTab("deals")}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition ${
            subTab === "deals"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Deals & Pipeline Attivo ({activeDeals.length})
        </button>

        <button
          onClick={() => setSubTab("tickets")}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition ${
            subTab === "tickets"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Wrench className="w-4 h-4" />
          Service & Technical Tickets ({activeTickets.length})
        </button>

        <button
          onClick={() => setSubTab("contacts")}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition ${
            subTab === "contacts"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Contacts ({activeContacts.length})
        </button>

        <button
          onClick={() => setSubTab("pipelines")}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition ${
            subTab === "pipelines"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          Cấu Trúc Pipelines & Stage IDs
        </button>
      </div>

      {/* TAB 1: DEALS */}
      {subTab === "deals" && (
        <div className="space-y-4">
          {/* Sub Header: View Mode Switcher & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              {/* Dataset View Mode Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Chế độ xem Deals:</span>
                <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => setDealViewMode("mapped")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      dealViewMode === "mapped"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Dự Án Đã Map ({mappedDeals.length})
                  </button>
                  <button
                    onClick={() => setDealViewMode("all_live")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      dealViewMode === "all_live"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Toàn Bộ Deals Live HubSpot CRM ({liveDeals.length > 0 ? liveDeals.length : "Đang tải..."})
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1">
                <span>Trạng thái:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Kết nối API Live (HubSpot v3)
                </span>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm deal theo tên, dự án, sales owner hoặc tên khách..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-orange-500"
                >
                  <option value="all">Tất cả nguồn Deal</option>
                  <option value="Marketing">Chỉ Lead Marketing</option>
                  <option value="Sales Direct">Chỉ Sales Direct</option>
                </select>

                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-orange-500"
                >
                  <option value="all">Tất cả Stage ({ATTIVO_PIPELINES.DEAL_PIPELINE.stages.length})</option>
                  {ATTIVO_PIPELINES.DEAL_PIPELINE.stages.map((st) => (
                    <option key={st.id} value={st.label}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Deals Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Deal ID</th>
                    <th className="py-3 px-4">Tên Deal thương vụ</th>
                    {dealViewMode === "mapped" && <th className="py-3 px-4">Dự án liên kết</th>}
                    <th className="py-3 px-4">Giai đoạn (Stage)</th>
                    <th className="py-3 px-4">Nguồn Lead</th>
                    <th className="py-3 px-4">Sales Owner</th>
                    <th className="py-3 px-4 text-right">Giá trị (VND)</th>
                    <th className="py-3 px-4 text-center">HubSpot Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredDeals.length === 0 ? (
                    <tr>
                      <td colSpan={dealViewMode === "mapped" ? 8 : 7} className="py-8 text-center text-slate-400">
                        Không tìm thấy deals nào khớp với bộ lọc
                      </td>
                    </tr>
                  ) : (
                    filteredDeals.map((deal) => {
                      const isMkt = isMarketingDeal(deal);
                      return (
                        <tr key={deal.dealId || deal.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-500">
                            {deal.dealId || deal.id}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">
                            {deal.dealName}
                          </td>
                          {dealViewMode === "mapped" && (
                            <td className="py-3 px-4 font-semibold text-blue-700">
                              {deal.projectName}
                            </td>
                          )}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                deal.stage === "Closed won"
                                  ? "bg-teal-50 text-teal-800 border-teal-200"
                                  : deal.stage === "Deposited"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : deal.stage === "Contract Signing"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                              }`}
                            >
                              {deal.stage}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                isMkt
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : "bg-slate-100 text-slate-700 border border-slate-300"
                              }`}
                            >
                              {isMkt ? "Marketing Lead" : "Sales Direct"}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">{deal.owner}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                            {formatCurrency(deal.amount)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <a
                              href={deal.hubspotUrl || getHubspotRecordUrl("deal", deal.dealId || deal.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg text-xs font-semibold transition"
                            >
                              <ExternalLink className="w-3 h-3" /> Mở Deal
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TICKETS */}
      {subTab === "tickets" && (
        <div className="space-y-4">
          {/* Sub Header: View Mode Switcher */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Chế độ xem Tickets:</span>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setTicketViewMode("mapped")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    ticketViewMode === "mapped"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Tickets Dự Án ({hubspotTickets.length})
                </button>
                <button
                  onClick={() => setTicketViewMode("all_live")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    ticketViewMode === "all_live"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Toàn Bộ Tickets Live CRM ({liveTickets.length > 0 ? liveTickets.length : "Đang tải..."})
                </button>
              </div>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm ticket, cơ sở, kỹ thuật viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Historical HubSpot SLA Benchmark Overview */}
          <div className="bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-slate-50 border border-orange-200/80 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-600" />
                  Chuẩn Hóa SLA & Thời Gian Hoàn Thành (Truy Ngược Lịch Sử HubSpot CRM)
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Đề xuất thời gian hoàn thành (Est Time) dựa trên kết quả nghiệm thu thực tế của pipeline AT Technical Dept (Portal 19642405)
                </p>
              </div>
              <span className="text-[11px] font-bold text-orange-700 bg-orange-100/80 px-2.5 py-1 rounded-full border border-orange-200 self-start sm:self-auto">
                5 Nhóm Nghiệp Vụ Chuẩn
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {Object.entries(HUBSPOT_TICKET_CATEGORIES).map(([key, cat]) => (
                <div key={key} className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 truncate" title={cat.label}>
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-blue-700">{cat.estHours}h</span>
                    <span className="text-[10px] text-slate-400">({cat.minHours}-{cat.maxHours}h)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate" title={cat.slaDescription}>
                    {cat.slaDescription}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-slate-400">
                Không tìm thấy tickets nào khớp với từ khóa tìm kiếm
              </div>
            ) : (
              filteredTickets.map((t) => {
                const sla = estimateTicketCompletion(t);
                return (
                  <div
                    key={t.ticketId || t.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          #{t.ticketId || t.id}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            t.priority === "HIGH"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {t.priority === "HIGH" ? "Ưu tiên cao (HIGH)" : "Trung bình"}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-800 text-sm mb-1">{t.subject}</h3>

                      {/* Est Time & Category Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap my-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {sla.categoryLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-600" />
                          Est: {sla.estHoursFormatted}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          ({sla.slaDescription})
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-700 truncate">{t.facility}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>KTV phụ trách: <strong className="text-slate-800">{t.assignedTo}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3" /> Ngày yêu cầu: {t.createdDate}
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 line-clamp-2 mb-2">
                        {t.content || t.notes || "Yêu cầu kỹ thuật tiếp nhận qua hotline/HubSpot."}
                      </div>

                      {/* Estimated Milestones */}
                      {sla.milestones && (
                        <div className="mb-3 px-2.5 py-1.5 bg-blue-50/40 rounded-xl border border-blue-100 text-[11px]">
                          <span className="font-semibold text-slate-700 block text-[10px] mb-0.5">Tiến trình chuẩn:</span>
                          <div className="space-y-0.5 text-slate-600 text-[10px]">
                            {sla.milestones.map((m, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{m.name}</span>
                                <span className="font-medium text-slate-500">{m.estDuration}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-blue-700 px-2 py-0.5 bg-blue-50 rounded border border-blue-100 truncate max-w-[170px]">
                        {t.stage}
                      </span>
                      <a
                        href={t.hubspotUrl || getHubspotRecordUrl("ticket", t.ticketId || t.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold transition"
                      >
                        <ExternalLink className="w-3 h-3" /> Mở Vé
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CONTACTS */}
      {subTab === "contacts" && (
        <div className="space-y-4">
          {/* Sub Header: View Mode Switcher */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Chế độ xem Contacts:</span>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setContactViewMode("mapped")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    contactViewMode === "mapped"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Mapped Contacts ({hubspotContacts.length})
                </button>
                <button
                  onClick={() => setContactViewMode("all_live")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    contactViewMode === "all_live"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Toàn Bộ Contacts Live CRM ({liveContacts.length > 0 ? liveContacts.length : "Đang tải..."})
                </button>
              </div>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm khách hàng, số điện thoại, công ty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Contact ID</th>
                    <th className="py-3 px-4">Họ tên khách hàng</th>
                    <th className="py-3 px-4">Doanh nghiệp / Đơn vị</th>
                    <th className="py-3 px-4">Kênh liên hệ</th>
                    <th className="py-3 px-4">Phân loại nguồn</th>
                    <th className="py-3 px-4">Deal liên kết</th>
                    <th className="py-3 px-4 text-right">Giá trị deal</th>
                    <th className="py-3 px-4 text-center">HubSpot Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Không tìm thấy contact nào khớp với tìm kiếm
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((c) => (
                      <tr key={c.contactId || c.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-500">{c.contactId || c.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{c.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{c.phone || c.email || "Chưa cập nhật SĐT"}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">{c.company}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {c.channel || "Direct"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              c.isMarketing
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-slate-100 text-slate-700 border border-slate-300"
                            }`}
                          >
                            {c.isMarketing ? "Lead Marketing" : "Sales Direct"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800 max-w-xs truncate">
                          {c.associatedDeal || "Thương vụ Attivo"}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                          {c.dealAmount ? formatCurrency(c.dealAmount) : "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <a
                            href={c.hubspotUrl || getHubspotRecordUrl("contact", c.contactId || c.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg text-xs font-semibold transition"
                          >
                            <ExternalLink className="w-3 h-3" /> Mở Contact
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PIPELINES & STAGES */}
      {subTab === "pipelines" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Pipeline: Attivo Pipeline (ID: <code>default</code>)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Chuỗi các giai đoạn bán hàng của Attivo từ lúc gặp gỡ demo đến chốt đặt cọc và hoàn tất bàn giao.
            </p>
            <div className="space-y-2.5">
              {ATTIVO_PIPELINES.DEAL_PIPELINE.stages.map((st, idx) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{st.label}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    ID: {st.id}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              Pipeline: AT Technical Dept (ID: <code>49270822</code>)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Chuỗi xử lý yêu cầu kỹ thuật & bảo hành bảo trì máy móc thiết bị phòng gym cư dân & thương mại.
            </p>
            <div className="space-y-2.5">
              {ATTIVO_PIPELINES.TECHNICAL_TICKETS.stages.map((st, idx) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                      {st.step}
                    </span>
                    <span className="font-bold text-slate-800">{st.label}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    ID: {st.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
