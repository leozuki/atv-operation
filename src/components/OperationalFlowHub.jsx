import React, { useState, useMemo } from "react";
import {
  GitCommit,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Wrench,
  Ship,
  DollarSign,
  FileText,
  Users,
  Camera,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info,
  Calendar,
  Warehouse,
  Briefcase,
  AlertCircle,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
  Kanban,
  ListFilter,
  Check,
  FileSignature,
  PackageCheck,
  Truck,
  Eye,
  SlidersHorizontal,
  Activity,
  ArrowUpRight,
  UserCheck,
  Tag,
  CircleDot,
  Target,
} from "lucide-react";
import { formatShortCurrency, formatCurrency, formatDate } from "../utils/formatters";

export default function OperationalFlowHub({
  projects = [],
  setProjects,
  shipments = [],
  tenders = [],
  checklists = [],
  hubspotTickets = [],
  dmsDocuments = [],
  designTasks = [],
  collections = [],
  schedule = { HN: [], HCM: [] },
  users = [],
  onNavigateTab,
  onOpenChecklist,
}) {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" (Tổng quan 9 trạm), "deepdive" (Chi tiết SOP & RACI), "bottlenecks" (Điểm nghẽn & Rủi ro)
  const [activeStep, setActiveStep] = useState(1);
  const [selectedPhase, setSelectedPhase] = useState("all"); // "all", 1, 2, 3, 4
  const [searchProjectTerm, setSearchProjectTerm] = useState("");
  const [interactiveChecklist, setInteractiveChecklist] = useState({});

  // 4 Giai đoạn chiến lược (Macro Phases)
  const macroPhases = [
    {
      id: 1,
      name: "Phase I: Tư Vấn & Giải Pháp",
      subtitle: "Khảo sát & Thiết kế",
      steps: [1, 2, 3],
      color: "from-blue-600 to-indigo-600",
      lightColor: "bg-blue-50 text-blue-800 border-blue-200",
      description: "Tiếp nhận Lead, khảo sát thực địa mặt bằng và dựng giải pháp không gian Gym/Pilates 2D & 3D.",
    },
    {
      id: 2,
      name: "Phase II: Đấu Thầu & Chuỗi Cung Ứng",
      subtitle: "Hợp đồng & Mua hàng",
      steps: [4, 5, 6],
      color: "from-amber-600 to-emerald-600",
      lightColor: "bg-amber-50 text-amber-800 border-amber-200",
      description: "Lập dự toán BOQ, ký hợp đồng kinh tế, thu cọc đợt 1 và phát hành PO nhập khẩu tàu biển/hàng không.",
    },
    {
      id: 3,
      name: "Phase III: Mặt Bằng & Lắp Đặt",
      subtitle: "Mặt bằng & Lắp đặt",
      steps: [7, 8],
      color: "from-pink-600 to-cyan-600",
      lightColor: "bg-pink-50 text-pink-800 border-pink-200",
      description: "Ký nghiệm thu mặt bằng, Marketing quay chụp media, xuất kho ghép đơn và kiểm đếm Đúng & Đủ linh kiện.",
    },
    {
      id: 4,
      name: "Phase IV: Hậu Mãi & Vận Hành Trọn Đời",
      subtitle: "Bảo hành & Bảo trì",
      steps: [9],
      color: "from-emerald-600 to-teal-700",
      lightColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      description: "Lên lịch bảo trì định kỳ Master Calendar (1/4 - 1/6 tháng) và xử lý sự cố phát sinh qua HubSpot Tickets.",
    },
  ];

  // 9 Bước chi tiết SOP với RACI, tiêu chuẩn đầu vào/đầu ra và SLA
  const flowSteps = [
    {
      step: 1,
      phaseId: 1,
      name: "Tiếp Nhận Lead & Phân Loại Nhu Cầu",
      short: "1. Lead & Contact",
      icon: Users,
      sla: "Trong vòng 2 giờ",
      color: "from-blue-600 to-sky-600",
      accent: "text-blue-700 bg-blue-50 border-blue-200",
      dept: "Marketing & Sales",
      hubspotStage: "Lifecycle: Lead / MQL / SQL",
      dmsDocType: "Hồ sơ liên hệ khách hàng",
      desc: "Tiếp nhận thông tin khách hàng từ Hotline, Website, Facebook Paid Ads hoặc Sales Direct. Khởi tạo Contact trên HubSpot và phân quyền chăm sóc.",
      inputPrereq: "Nhu cầu mở phòng gym, studio pilates, homegym hoặc dự án khách sạn/resort.",
      outputDeliverable: "Contact được phân loại Lead Status rõ ràng, gán Owner phụ trách trên HubSpot.",
      raci: {
        responsible: "Phòng Marketing (Sơn Nguyễn Leo, Media Team)",
        accountable: "Dominic Pham (Operations Director)",
        consulted: "Sales Leads (Khánh Nguyễn, Hoài Trịnh, Nam Văn, Vy Nguyễn, Phương Thảo)",
        informed: "Khách hàng & Ban Giám Đốc",
      },
      sopChecklist: [
        "Kiểm tra trùng lặp Contact trên HubSpot CRM Portal 19642405",
        "Xác định phân khúc mục tiêu: Commercial Gym, Khách Sạn/Resort, Homegym, hay Pilates Studio",
        "Gán đúng Contact Owner (Sales Miền Bắc hoặc Sales Miền Nam)",
        "Thiết lập cuộc hẹn khảo sát sơ bộ diện tích và ngân sách dự kiến",
      ],
      associatedStages: ["pre_tender"],
    },
    {
      step: 2,
      phaseId: 1,
      name: "Mở Deal Pipeline & Khảo Sát Hiện Trạng",
      short: "2. Deal & Khảo Sát",
      icon: Briefcase,
      sla: "24 - 48 giờ",
      color: "from-indigo-600 to-blue-600",
      accent: "text-indigo-700 bg-indigo-50 border-indigo-200",
      dept: "Phòng Kinh Doanh (Sales)",
      hubspotStage: "Meeting & Presentation (ID: 101276229)",
      dmsDocType: "Biên bản khảo sát hiện trạng & Ảnh hiện trường",
      desc: "Mở Deal thương vụ trong Attivo Pipeline. Khảo sát thực địa, đo đạc kích thước sàn, kiểm tra trần, dầm, tải trọng và nguồn điện tại công trình.",
      inputPrereq: "Lead đã qualify đủ điều kiện ngân sách và mặt bằng sẵn sàng khảo sát.",
      outputDeliverable: "Bản vẽ tay hiện trạng, thông số kỹ thuật sàn/điện và Biên bản khảo sát tải lên DMS.",
      raci: {
        responsible: "Chuyên viên Sales (Khánh Nguyễn, Hoài Trịnh, Vy Nguyễn, Nam Văn)",
        accountable: "Sales Manager / Dominic Pham",
        consulted: "Mr. Trung (Kỹ thuật trưởng) & KTV Hiện trường",
        informed: "Chủ đầu tư / Ban Quản Lý Tòa Nhà",
      },
      sopChecklist: [
        "Tạo Deal trên HubSpot với giá trị ước tính và ngày Close Date dự kiến",
        "Khảo sát hiện trường: Đo đạc kích thước thông thủy, chiều cao dầm trần, thang hàng",
        "Kiểm tra công suất điện: Nguồn 3 pha cho máy chạy bộ commercial, 1 pha cho pilates/cardio nhẹ",
        "Xác định các dòng thương hiệu chủ đạo: Precor (USA), Merrithew (Canada), Ziva, Paviflex",
      ],
      associatedStages: ["pre_tender", "design"],
    },
    {
      step: 3,
      phaseId: 1,
      name: "Thiết Kế Concept Layout 2D & Phối Cảnh 3D",
      short: "3. Layout 2D/3D",
      icon: Layers,
      sla: "2D: 24h | 3D: 3-5 ngày",
      color: "from-purple-600 to-indigo-600",
      accent: "text-purple-700 bg-purple-50 border-purple-200",
      dept: "Bộ Phận Thiết Kế (Design Team)",
      hubspotStage: "Layout / Proposal (ID: 101276230)",
      dmsDocType: "Bản vẽ mặt bằng CAD (.dwg) & Bộ Render 3D (.pdf / .png)",
      desc: "Designer lên layout bố trí máy móc đảm bảo luồng giao thông an toàn và dựng phối cảnh 3D không gian phòng tập 12 góc view trực quan.",
      inputPrereq: "Biên bản khảo sát hiện trạng và danh mục thiết bị sơ bộ từ Sales.",
      outputDeliverable: "File bản vẽ CAD 2D hoàn chỉnh và Album render 3D chất lượng cao được lưu trên DMS.",
      raci: {
        responsible: "Designer Lý Lý & Team Thiết Kế",
        accountable: "Dominic Pham (Operations Director)",
        consulted: "Chuyên viên Sales & Mr. Trung (Kiểm tra khoảng cách an toàn thiết bị)",
        informed: "Khách hàng duyệt phương án",
      },
      sopChecklist: [
        "Bố trí layout 2D tuân thủ tiêu chuẩn khoảng cách thoát hiểm (an toàn máy chạy tối thiểu 1.5m phía sau)",
        "Phân khu chức năng: Cardio Zone, Strength Zone, Free Weight, Stretch & Recovery, Pilates Studio",
        "Render 3D với ánh sáng, màu sắc tường, sàn và gương theo nhận diện dự án",
        "Upload toàn bộ bản vẽ thiết kế lên Attivo DMS và tạo link chia sẻ trực tiếp",
      ],
      associatedStages: ["design"],
    },
    {
      step: 4,
      phaseId: 2,
      name: "Tender, Bóc Tách BOQ & Dự Toán Báo Giá",
      short: "4. Tender & Báo Giá",
      icon: FileText,
      sla: "48 giờ làm việc",
      color: "from-amber-600 to-orange-600",
      accent: "text-amber-800 bg-amber-50 border-amber-200",
      dept: "Phòng Kinh Doanh & Tender",
      hubspotStage: "Quotation Sent (ID: appointmentscheduled)",
      dmsDocType: "Hồ sơ dự thầu / Bảng bóc tách khối lượng BOQ & Báo giá",
      desc: "Bóc tách khối lượng thiết bị BOQ, tính toán giá vốn nhập khẩu CIF/FOB, thuế, chi phí vận chuyển, biên lợi nhuận và hoàn thiện hồ sơ chào giá.",
      inputPrereq: "Bản vẽ layout 2D đã được chủ đầu tư chốt danh mục thiết bị chính thức.",
      outputDeliverable: "Bảng BOQ chi tiết, Báo giá chính thức có dấu và Hồ sơ năng lực thầu trên DMS.",
      raci: {
        responsible: "Sales Leads & Bộ phận Tender",
        accountable: "Rajan Nalliah (Managing Director) & Dominic Pham",
        consulted: "Kế toán La Cẩn (Kiểm tra tỷ giá, chính sách thuế, margin)",
        informed: "Chủ đầu tư / Ban Đấu Thầu",
      },
      sopChecklist: [
        "Tra cứu bảng giá hãng mới nhất (Precor, Merrithew, Ziva, Eleiko, Skelcore)",
        "Tính toán chi phí logistics dự kiến (Sea Cargo 20GP/40HQ hoặc Air Express)",
        "Kiểm tra biên lợi nhuận tối thiểu (Margin SOP) trước khi trình Ban Giám Đốc",
        "Ký duyệt báo giá và gửi khách hàng qua email kèm hồ sơ năng lực dự án",
      ],
      associatedStages: ["pre_tender", "ordering"],
    },
    {
      step: 5,
      phaseId: 2,
      name: "Ký Hợp Đồng Kinh Tế & Thu Cọc Đợt 1 (Finance)",
      short: "5. Hợp Đồng & Cọc",
      icon: DollarSign,
      sla: "3 - 5 ngày thương thảo",
      color: "from-emerald-600 to-teal-600",
      accent: "text-emerald-700 bg-emerald-50 border-emerald-200",
      dept: "Kế Toán - Tài Chính & Pháp Chế",
      hubspotStage: "Contract Signed -> Deposited (Closed Won)",
      dmsDocType: "Hợp đồng kinh tế chính thức (Scan đóng dấu) & Ủy nhiệm chi cọc",
      desc: "Thống nhất các điều khoản thương mại, tiến độ giao hàng, bảo hành. Ký hợp đồng kinh tế và kế toán xác nhận nhận tiền cọc đợt 1 (30-50%).",
      inputPrereq: "Khách hàng duyệt báo giá thầu và đồng ý điều khoản dự thảo hợp đồng.",
      outputDeliverable: "Hợp đồng kinh tế 2 bên đã đóng dấu, phiếu thu/UNC cọc và Deal chuyển Closed Won.",
      raci: {
        responsible: "Kế toán La Cẩn & Chuyên viên Sales",
        accountable: "Rajan Nalliah (Ký hợp đồng đại diện pháp luật)",
        consulted: "Phòng Pháp chế & Logistics",
        informed: "Toàn bộ các phòng ban để khởi động chuỗi cung ứng",
      },
      sopChecklist: [
        "Rà soát điều khoản thanh toán: Đợt 1 (Cọc 30-50%), Đợt 2 (Trước khi giao hàng), Đợt 3 (Sau nghiệm thu)",
        "Ký kết hợp đồng kinh tế và scan lưu trữ bản chính vào Kho Tài Liệu DMS",
        "Kế toán kiểm tra tiền nổi vào tài khoản ngân hàng Attivo -> Cập nhật vào Finance Collections",
        "Cập nhật trạng thái Deal trên HubSpot sang 'Deposited' hoặc 'Closed Won'",
      ],
      associatedStages: ["ordering", "site_prep"],
    },
    {
      step: 6,
      phaseId: 2,
      name: "Mở PO Quốc Tế, Vận Chuyển & Nhập Kho 2 Miền",
      short: "6. PO Hãng & Tàu Về",
      icon: Ship,
      sla: "Sea: 25-45 ngày | Air: 7-10 ngày",
      color: "from-sky-600 to-blue-700",
      accent: "text-sky-700 bg-sky-50 border-sky-200",
      dept: "Phòng Logistics & Quản Lý Kho",
      hubspotStage: "PO Issued -> Customs Clearance -> In Warehouse",
      dmsDocType: "Purchase Order (PO), Packing List, Bill of Lading (B/L), CO/CQ",
      desc: "Phát hành PO chính thức gửi nhà máy đối tác nước ngoài. Theo dõi lịch tàu biển rời cảng, thủ tục hải quan Hải Phòng / Cát Lái và nhập kho Đông Anh / Bình Dương.",
      inputPrereq: "Đã thu đủ cọc đợt 1 và hợp đồng kinh tế đã có hiệu lực.",
      outputDeliverable: "Biên bản nhập kho, Packing List đối soát thực tế, chứng nhận xuất xứ CO/CQ.",
      raci: {
        responsible: "Dominic Pham (Điều phối Ops) & Quản lý kho (Minh Tâm - ĐA, Quốc Việt - BD)",
        accountable: "Dominic Pham (Operations Director)",
        consulted: "Kế toán La Cẩn (Mở LC / Thanh toán T/T quốc tế) & Sales",
        informed: "Mr. Trung (Kỹ thuật) để chuẩn bị nhân sự lắp máy",
      },
      sopChecklist: [
        "Phát hành PO gửi hãng (Precor, Merrithew, Ziva, Skelcore) kèm mã dự án",
        "Theo dõi tiến độ sản xuất tại nhà máy và nhận Booking tàu biển / Air Cargo",
        "Cập nhật ngày tàu về (ETA) Hải Phòng (cho kho Đông Anh) hoặc Cát Lái (cho kho Bình Dương)",
        "Làm thủ tục thông quan hải quan, kiểm tra chất lượng nhà nước và kiểm dịch",
        "Rút ruột cont nhập kho: Kiểm đếm đối chiếu Packing List, phân loại Đơn Hàng Ghép",
        "Phát hiện và gắn cờ: Hãng giao thiếu (Vendor Shortage) hay Đặt bù nội bộ (Order Shortage)",
      ],
      associatedStages: ["ordering"],
    },
    {
      step: 7,
      phaseId: 3,
      name: "Nghiệm Thu Mặt Bằng Thô & Kích Hoạt Marketing",
      short: "7. Mặt Bằng & MKT",
      icon: Camera,
      sla: "1 - 2 ngày trước lắp đặt",
      color: "from-pink-600 to-rose-600",
      accent: "text-pink-700 bg-pink-50 border-pink-200",
      dept: "Kỹ Thuật Hiện Trường & Marketing Media",
      hubspotStage: "Site Ready -> Marketing Triggered",
      dmsDocType: "Biên bản bàn giao mặt bằng thi công & Bộ tư liệu media gốc",
      desc: "Kỹ thuật nghiệm thu mặt bằng đạt chuẩn (sàn, gương, trần, nguồn điện). Ký biên bản nhận mặt bằng và kích hoạt Marketing đến quay chụp flycam/ảnh tư liệu trước khi lắp máy.",
      inputPrereq: "Chủ đầu tư hoàn thiện phần xây dựng thô và hàng trong kho đã sẵn sàng xuất.",
      outputDeliverable: "Biên bản bàn giao mặt bằng có chữ ký BQL tòa nhà; Clip/ảnh truyền thông mặt bằng.",
      raci: {
        responsible: "Mr. Trung & KTV Hiện trường (Kiểm tra MB) | Sơn Nguyễn Leo (Media Marketing)",
        accountable: "Dominic Pham (Operations Director)",
        consulted: "Chuyên viên Sales phụ trách dự án & BQL Công trình",
        informed: "Khách hàng & Đội Logistics vận chuyển",
      },
      sopChecklist: [
        "Kiểm tra độ phẳng và khả năng chịu lực của sàn (tránh rung chấn tạ nặng)",
        "Đo kiểm điện áp thực tế (220V/380V), tiếp địa chống giật, vị trí ổ cắm âm sàn",
        "Ký Biên bản bàn giao mặt bằng với Ban Quản Lý công trình -> Upload lên DMS",
        "Kích hoạt cờ marketingReady: Đội Marketing đem flycam, máy quay chụp mặt bằng chuẩn bị bàn giao",
      ],
      associatedStages: ["handover_ready"],
    },
    {
      step: 8,
      phaseId: 3,
      name: "Xuất Kho Ghép Đơn, Checklist Đúng & Đủ, Lắp Đặt",
      short: "8. Lắp Đặt & BBNT",
      icon: Wrench,
      sla: "1 - 3 ngày tùy quy mô dự án",
      color: "from-cyan-600 to-teal-700",
      accent: "text-cyan-700 bg-cyan-50 border-cyan-200",
      dept: "Phòng Kỹ Thuật (Tech Service Team)",
      hubspotStage: "Installation In Progress -> Handover & Sign BBNT",
      dmsDocType: "Checklist Đúng & Đủ theo BOM; Biên bản nghiệm thu kỹ thuật (BBNT)",
      desc: "Xuất hàng từ kho Đông Anh hoặc Bình Dương (đơn ghép đa dự án). KTV Trưởng kiểm đếm Checklist Đúng & Đủ linh kiện, lắp ráp, chạy thử tải, bàn giao và thu tiền đợt cuối.",
      inputPrereq: "Mặt bằng đã nghiệm thu đạt chuẩn và hàng đã kiểm đếm sẵn sàng xuất kho.",
      outputDeliverable: "Checklist Đúng & Đủ 100% đạt, Biên bản nghiệm thu kỹ thuật bàn giao chính thức.",
      raci: {
        responsible: "Mr. Trung (Kỹ thuật trưởng) & KTV Hiện trường (Anh Chu Việt, Tuân Bùi Duy)",
        accountable: "Dominic Pham (Operations Director)",
        consulted: "Thủ kho (Minh Tâm, Quốc Việt) & Sales phụ trách dự án",
        informed: "Kế toán La Cẩn (để phát hành hóa đơn VAT & thu tiền đợt cuối)",
      },
      sopChecklist: [
        "Xuất kho thiết bị theo lệnh xuất kho, vận chuyển xe tải tới chân công trình",
        "Mở thùng và thực hiện Checklist Kiểm Đếm Đúng & Đủ: Thân máy, motor, cáp, tạ, ốc vít, phụ kiện kèm theo",
        "Lắp ráp máy theo đúng hướng dẫn kỹ thuật của nhà sản xuất (Precor, Merrithew)",
        "Hiệu chỉnh cân bằng, bôi trơn dầu silicon, test màn hình console p82/p94, chạy thử tải tối đa",
        "Hướng dẫn vận hành cho HLV/BQL, bàn giao hồ sơ kỹ thuật và ký Biên bản Nghiệm Thu (BBNT)",
        "Kế toán thu nốt số tiền còn lại của hợp đồng (Đợt 3)",
      ],
      associatedStages: ["installation"],
    },
    {
      step: 9,
      phaseId: 4,
      name: "Bảo Trì Master Calendar & Xử Lý Service Tickets",
      short: "9. Bảo Trì & Ticket",
      icon: ShieldCheck,
      sla: "Định kỳ 1/4 - 1/6 tháng | Khẩn cấp: < 4 giờ",
      color: "from-emerald-700 to-green-800",
      accent: "text-emerald-800 bg-emerald-50 border-emerald-200",
      dept: "Phòng Bảo Hành - Bảo Trì Thiết Bị",
      hubspotStage: "AT Technical Dept (Pipeline 49270822)",
      dmsDocType: "Biên bản bảo dưỡng định kỳ; Phiếu kiểm tra kỹ thuật & Thay thế linh kiện",
      desc: "Thực hiện bảo trì bảo dưỡng định kỳ theo Master Operations Calendar. Tiếp nhận sự cố từ khách qua Hotline/HubSpot Ticket, xử lý tại chỗ và lưu hồ sơ bảo hành trọn đời.",
      inputPrereq: "Dự án đã nghiệm thu bàn giao và chuyển sang giai đoạn bảo hành hợp đồng.",
      outputDeliverable: "Biên bản bảo dưỡng có chữ ký xác nhận của khách, Ticket HubSpot đóng 'Signed - Done'.",
      raci: {
        responsible: "Mr. Trung (Kỹ thuật trưởng) & Đội KTV Hà Nội / TP.HCM",
        accountable: "Dominic Pham (Operations Director)",
        consulted: "Kế toán La Cẩn (theo dõi hợp đồng gia hạn bảo trì hàng năm)",
        informed: "Chủ đầu tư / Ban Quản Lý Phòng Gym",
      },
      sopChecklist: [
        "Lập lịch tuần Weekly Schedule cho KTV Miền Bắc và Miền Nam trên Master Calendar",
        "Kiểm tra định kỳ: Độ căng băng tải, tra mỡ bi bạc, kiểm tra dây cáp, vệ sinh bo mạch điện tử",
        "Tiếp nhận Ticket sự cố từ khách hàng qua HubSpot -> Gán ngay KTV khu vực",
        "Đến hiện trường trong vòng 2-4 giờ đối với sự cố ngưng máy nghiêm trọng",
        "Thay thế phụ tùng chính hãng (Precor, Merrithew) có phiếu xuất kho rõ ràng",
        "Khách hàng ký xác nhận biên bản kiểm tra -> Đóng Ticket trên HubSpot với trạng thái Signed - Done",
      ],
      associatedStages: ["maintenance", "accepted"],
    },
  ];

  // Helper mapping project stage to step
  const getProjectStep = (project) => {
    if (project.stepNumber) return project.stepNumber;
    switch (project.stage) {
      case "pre_tender":
        return 2;
      case "design":
        return 3;
      case "ordering":
        return 6;
      case "site_prep":
        return 7;
      case "handover_ready":
        return 7;
      case "installation":
        return 8;
      case "maintenance":
      case "accepted":
        return 9;
      default:
        return 1;
    }
  };

  // Extra real commercial pipeline deals from tenders, design & operations
  const extraDeals = useMemo(() => [
    {
      id: "PIPE-B1-01",
      name: "TT Huấn Luyện Thể Thao QG Sapa Lào Cai",
      customer: "Trung Tâm HL Thể Thao Quốc Gia",
      brand: "Precor & Eleiko",
      region: "HN",
      stage: "pre_tender",
      stepNumber: 1,
      saleLead: "Nam Văn",
      techLead: "Mr. Trung",
      dealValue: 850000000,
      marketingReady: false,
      contractCode: "ATV-SAPA-2026",
      notes: "Tiếp nhận Lead qua Hotline. Nhu cầu cung cấp giàn tạ Eleiko IPF và máy chạy Woodway cho VĐV thể thao quốc gia.",
    },
    {
      id: "PIPE-B1-02",
      name: "Duy Chinh Stott Pilates Studio Long Biên",
      customer: "Chị Duy Chinh",
      brand: "Merrithew",
      region: "HN",
      stage: "pre_tender",
      stepNumber: 1,
      saleLead: "Linh Nguyễn",
      techLead: "Mr. Trung",
      dealValue: 480000000,
      marketingReady: false,
      contractCode: "ATV-CHINH-26",
      notes: "Tư vấn cấu hình 6 máy SPX Max Reformer và Stability Chair cho studio pilates cao cấp tại Long Biên.",
    },
    {
      id: "PIPE-B2-01",
      name: "Park City Hà Nội - Biệt Thự CH03",
      customer: "Anh Tùng - Park City",
      brand: "Precor Commercial",
      region: "HN",
      stage: "pre_tender",
      stepNumber: 2,
      saleLead: "Khánh Nguyễn",
      techLead: "Anh Chu Việt",
      dealValue: 1650000000,
      marketingReady: false,
      contractCode: "ATV-PKC-CH03",
      notes: "Đang mở Deal trên HubSpot. Đã khảo sát hiện trường tầng hầm biệt thự, đo thông thủy trần 3.2m và điện 3 pha.",
    },
    {
      id: "PIPE-B2-02",
      name: "Học Viện Bóng Đá PVF New Phase",
      customer: "Học viện Bóng đá PVF",
      brand: "Precor & Woodway",
      region: "HN",
      stage: "pre_tender",
      stepNumber: 2,
      saleLead: "Nam Văn",
      techLead: "Tuân Bùi Duy",
      dealValue: 2400000000,
      marketingReady: false,
      contractCode: "ATV-PVF-2026",
      notes: "Khảo sát khu phục hồi thể lực và gym chuyên sâu cho cầu thủ trẻ, yêu cầu máy chạy Woodway Curve và máy kéo nén khí.",
    },
    {
      id: "PIPE-B2-03",
      name: "Bách Liên House - Homegym Cao Cấp",
      customer: "Gia đình Bách Liên",
      brand: "Precor & Ziva",
      region: "HN",
      stage: "pre_tender",
      stepNumber: 2,
      saleLead: "Vy Nguyễn",
      techLead: "Anh Chu Việt",
      dealValue: 620000000,
      marketingReady: false,
      contractCode: "ATV-BLH-2026",
      notes: "Khảo sát phòng gym tầng 5 pent-house, kiểm tra tải trọng sàn tối đa và phương án vận chuyển thang bộ.",
    },
    {
      id: "PIPE-B3-01",
      name: "Prive Đất Xanh (B4, B7, B9, B10-11)",
      customer: "Tập đoàn Đất Xanh",
      brand: "Precor & Ziva",
      region: "HCM",
      stage: "design",
      stepNumber: 3,
      saleLead: "Hoài Trịnh",
      techLead: "Mr. Trung",
      dealValue: 5600000000,
      marketingReady: false,
      contractCode: "ATV-DXG-2026",
      notes: "Designer Lý Lý đang lên layout 2D mặt bằng cho cụm 7 tháp chung cư cao cấp.",
    },
    {
      id: "PIPE-B3-02",
      name: "Ocean Breath Stott Pilates Studio",
      customer: "Ocean Breath Wellness",
      brand: "Merrithew",
      region: "HN",
      stage: "design",
      stepNumber: 3,
      saleLead: "Linh Nguyễn",
      techLead: "Mr. Trung",
      dealValue: 980000000,
      marketingReady: false,
      contractCode: "ATVEHN26012",
      notes: "Thiết kế layout 2D và render 3D không gian phòng tập với Vertical Frame và Mat Converter.",
    },
    {
      id: "PIPE-B4-01",
      name: "Dự Án Khách Sạn Lapis Hotel",
      customer: "Lapis Hotel Hanoi",
      brand: "Precor USA",
      region: "HN",
      stage: "pre_tender",
      stepNumber: 4,
      saleLead: "Vy Nguyễn",
      techLead: "Mr. Trung",
      dealValue: 2850000000,
      marketingReady: false,
      contractCode: "ATVEHN26085",
      notes: "Đang trình BOQ dự toán thầu và báo giá thiết bị cardio & tạ khối cho phòng gym khách sạn 4 sao phố cổ.",
    },
    {
      id: "PIPE-B4-02",
      name: "KTG Waiki Đà Lạt Wellness Retreat",
      customer: "KTG Group",
      brand: "Precor & Paviflex",
      region: "HCM",
      stage: "pre_tender",
      stepNumber: 4,
      saleLead: "Hoài Trịnh",
      techLead: "Mr. Trung",
      dealValue: 3400000000,
      marketingReady: false,
      contractCode: "ATV-KTG-2026",
      notes: "Đã nộp hồ sơ tender thầu toàn bộ thiết bị gym nghỉ dưỡng sinh thái Đà Lạt, chờ thương thảo lần cuối.",
    },
    {
      id: "PIPE-B4-03",
      name: "Capital Elite 18 Phạm Hùng",
      customer: "Capital Elite Fitness",
      brand: "Precor & Skelcore",
      region: "HN",
      stage: "pre_tender",
      stepNumber: 4,
      saleLead: "Khánh Nguyễn",
      techLead: "Anh Chu Việt",
      dealValue: 4200000000,
      marketingReady: false,
      contractCode: "ATV-CPE-2026",
      notes: "Lập hồ sơ thầu BOQ cho dự án thương mại tầng lửng tòa nhà 18 Phạm Hùng.",
    },
    {
      id: "PIPE-B4-04",
      name: "Phan Thiết Stadium Gym",
      customer: "BQL Sân Vận Động Phan Thiết",
      brand: "Ziva & ULS",
      region: "HCM",
      stage: "pre_tender",
      stepNumber: 4,
      saleLead: "Lâm Nguyễn",
      techLead: "Mr. Trung",
      dealValue: 1250000000,
      marketingReady: false,
      contractCode: "ATV-PT-T06",
      notes: "Thầu gói thiết bị tạ và ghế khán đài phòng tập VĐV Phan Thiết.",
    },
    {
      id: "PIPE-B5-01",
      name: "Dragon Prime Eleiko Training Gym",
      customer: "Dragon Prime Fitness",
      brand: "Eleiko & Ziva",
      region: "HCM",
      stage: "ordering",
      stepNumber: 5,
      saleLead: "Hoài Trịnh",
      techLead: "Mr. Trung",
      dealValue: 4100000000,
      marketingReady: false,
      contractCode: "ATVESG26053",
      notes: "Khách hàng đã ký hợp đồng kinh tế và chuyển khoản đặt cọc đợt 1 (1.64 tỷ VND). Kế toán La Cẩn đã xác nhận UNC.",
    },
    {
      id: "PIPE-B5-02",
      name: "Scenic Valley 1 - Thiết Bị Precor",
      customer: "BQT Scenic Valley 1",
      brand: "Precor",
      region: "HCM",
      stage: "ordering",
      stepNumber: 5,
      saleLead: "Hoài Trịnh",
      techLead: "Mr. Trung",
      dealValue: 1100000000,
      marketingReady: false,
      contractCode: "ATV-SCV1-2026",
      notes: "Hợp đồng đã ký đóng dấu trên DMS, chờ thông báo nộp cọc trước khi phát hành PO.",
    },
    {
      id: "PIPE-B6-01",
      name: "Cont 20 - Merrithew Promo 2026",
      customer: "Kho Attivo Bình Dương",
      brand: "Merrithew",
      region: "HCM",
      stage: "ordering",
      stepNumber: 6,
      saleLead: "Hoài Trịnh",
      techLead: "Mr. Trung",
      dealValue: 1420000000,
      marketingReady: false,
      contractCode: "ME-AT2602",
      notes: "PO ME-AT2602 đang làm thủ tục hải quan tại cảng Cát Lái, dự kiến về kho Bình Dương ngày 08/10.",
    },
    {
      id: "PIPE-B6-02",
      name: "Lô Hàng S3.45 + LP4 Precor Hải Phòng",
      customer: "Kho Attivo Đông Anh",
      brand: "Precor USA",
      region: "HN",
      stage: "ordering",
      stepNumber: 6,
      saleLead: "Khánh Nguyễn",
      techLead: "Anh Chu Việt",
      dealValue: 3200000000,
      marketingReady: false,
      contractCode: "ULS-AT2609-30",
      notes: "Tàu biển 2x40HQ cập cảng Hải Phòng ngày 07/10, chuyển xe cont về kho Đông Anh (Hà Nội).",
    },
    {
      id: "PIPE-B6-03",
      name: "Lô Tạ Ziva Đặt Bù Vietcombank & Grab",
      customer: "Kho Attivo Đông Anh",
      brand: "Ziva",
      region: "HN",
      stage: "ordering",
      stepNumber: 6,
      saleLead: "Khánh Nguyễn",
      techLead: "Anh Chu Việt",
      dealValue: 980000000,
      marketingReady: false,
      contractCode: "ULS-AT2625-26",
      notes: "Về kho Đông Anh ngày 05/10. Chứa 12 cặp tạ đặt bù cho Vietcombank do đơn trước hãng giao thiếu.",
    },
    {
      id: "PIPE-B7-01",
      name: "Trà Cổ Resort - Trung Chính Group",
      customer: "Tập đoàn Trung Chính",
      brand: "Precor & Skelcore",
      region: "HN",
      stage: "handover_ready",
      stepNumber: 7,
      saleLead: "Khánh Nguyễn",
      techLead: "Tuân Bùi Duy",
      dealValue: 2600000000,
      marketingReady: true,
      contractCode: "ATVEHN26066",
      notes: "Đã ký nghiệm thu mặt bằng thô. Sơn Nguyễn Leo & Media Marketing đang lên lịch quay chụp flycam tại hiện trường trước khi lắp máy.",
    },
    {
      id: "PIPE-B9-01",
      name: "Tru By Hilton (SOJO Hotel) - 7 Locations",
      customer: "Chuỗi Khách Sạn SOJO / Hilton",
      brand: "Precor & Ziva",
      region: "Toàn quốc",
      stage: "maintenance",
      stepNumber: 9,
      saleLead: "Hoài Trịnh",
      techLead: "Mr. Trung",
      dealValue: 1450000000,
      marketingReady: false,
      contractCode: "ATVM-TRU-2026",
      notes: "Hợp đồng bảo trì định kỳ 02 lần/năm cho 7 khách sạn: Hạ Long, Lạng Sơn, Đà Nẵng, Hậu Giang, Lào Cai, Hòa Bình, Tam Kỳ.",
    },
    {
      id: "PIPE-B9-02",
      name: "Elite Fitness Nguyễn Chí Thanh",
      customer: "Hệ thống Elite Fitness",
      brand: "Precor",
      region: "HN",
      stage: "maintenance",
      stepNumber: 9,
      saleLead: "Khánh Nguyễn",
      techLead: "Anh Chu Việt",
      dealValue: 480000000,
      marketingReady: false,
      contractCode: "ATVM-ELITE-NCT",
      notes: "KTV Anh Chu Việt đang xử lý ticket bọc da ghế và thay thế cáp máy kéo xô Pulldown.",
    },
    {
      id: "PIPE-B9-03",
      name: "Novotel Duy Tân Hà Nội",
      customer: "Khách sạn Novotel Duy Tân",
      brand: "Precor",
      region: "HN",
      stage: "maintenance",
      stepNumber: 9,
      saleLead: "Khánh Nguyễn",
      techLead: "Tuân Bùi Duy",
      dealValue: 360000000,
      marketingReady: false,
      contractCode: "ATVM-NOVOTEL-DT",
      notes: "Hợp đồng bảo dưỡng định kỳ 2 lần/năm, kiểm tra motor máy chạy TRM885 và bảo dưỡng máy Elip.",
    }
  ], []);

  // Combined master project pipeline
  const allMasterProjects = useMemo(() => {
    const list = [...projects];
    extraDeals.forEach((ed) => {
      const exists = list.some((p) => p.name.toLowerCase() === ed.name.toLowerCase() || (p.contractCode && p.contractCode === ed.contractCode));
      if (!exists) {
        list.push(ed);
      }
    });
    return list;
  }, [projects, extraDeals]);

  // Enhance projects with comprehensive cross-department data
  const enhancedProjects = useMemo(() => {
    return allMasterProjects.map((p) => {
      const stepNumber = getProjectStep(p);
      const stepInfo = flowSteps.find((s) => s.step === stepNumber) || flowSteps[0];

      // Related shipment (PO Hãng / Kho)
      const relatedShipment = shipments.find(
        (s) =>
          s.projects.some(
            (projName) =>
              projName.toLowerCase().includes(p.name.toLowerCase()) ||
              p.name.toLowerCase().includes(projName.toLowerCase())
          ) ||
          (p.contractCode && s.poCode && p.contractCode.includes(s.poCode))
      );

      // Related checklist
      const relatedChecklist = checklists.find((c) => c.projectId === p.id);

      // Related HubSpot Ticket
      const relatedTicket = hubspotTickets.find(
        (t) =>
          (t.subject && t.subject.toLowerCase().includes(p.name.toLowerCase())) ||
          (p.contractCode && t.subject && t.subject.includes(p.contractCode))
      );

      // Related Tender
      const relatedTender = tenders.find(
        (t) =>
          t.project.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(t.project.toLowerCase())
      );

      // Value estimation
      const dealValue = p.dealValue || p.hubspotDeal?.amount || relatedTender?.value || 0;

      // Bottleneck detection
      let bottleneck = null;
      if (relatedShipment && relatedShipment.shortageStatus !== "normal") {
        bottleneck = {
          type: "shortage",
          level: "high",
          title: "Cảnh Báo Thiếu Hàng Hãng / Đặt Bù",
          detail: relatedShipment.shortageDetail || "Đơn hàng có tình trạng thiếu thiết bị cần kiểm đếm",
        };
      } else if (relatedShipment && relatedShipment.status === "shipping" && p.stage === "installation") {
        bottleneck = {
          type: "logistics_delay",
          level: "critical",
          title: "Hàng Tàu Chưa Về Kho Nhưng Đã Đến Hạn Lắp",
          detail: `Tàu dự kiến về ${formatDate(relatedShipment.eta)}, kiểm tra điều phối kho ${relatedShipment.warehouse}`,
        };
      } else if (p.stage === "handover_ready" && !p.marketingReady) {
        bottleneck = {
          type: "marketing_delay",
          level: "medium",
          title: "Chưa Kích Hoạt Marketing Quay Chụp",
          detail: "Mặt bằng đã xong nhưng chưa điều phối media đến hiện trường quay flycam/ảnh tư liệu",
        };
      } else if (p.stage === "installation" && relatedChecklist && relatedChecklist.progress < 50) {
        bottleneck = {
          type: "installation_lag",
          level: "medium",
          title: "Tiến Độ Lắp Máy Chậm",
          detail: `Checklist Đúng & Đủ mới đạt ${relatedChecklist.progress}%, cần tăng cường KTV hiện trường`,
        };
      }

      const dealOwner = p.dealOwner || p.leadSale || p.saleLead || p.hubspotDeal?.owner || "Đang phân công";
      const contactOwner = p.contactOwner || p.hubspotContact?.contactOwner || p.hubspotContact?.owner || "Marketing Attivo";
      const techLead = p.deliveryTicket?.assignedTech || p.deliveryTicket?.ticketOwner || p.techLead || p.assignedTech || "Đội KTV";
      const deliveryTicket = p.deliveryTicket || (relatedTicket ? {
        ticketId: relatedTicket.ticketId,
        subject: relatedTicket.subject,
        ticketOwner: relatedTicket.assignedTo,
        status: relatedTicket.stage,
        hubspotUrl: relatedTicket.hubspotUrl,
      } : null);

      return {
        ...p,
        saleLead: dealOwner,
        dealOwner,
        contactOwner,
        techLead,
        deliveryTicket,
        stepNumber,
        stepInfo,
        relatedShipment,
        relatedChecklist,
        relatedTicket,
        relatedTender,
        dealValue,
        bottleneck,
      };
    });
  }, [projects, shipments, checklists, hubspotTickets, tenders]);

  // Filter projects by search
  const filteredProjects = useMemo(() => {
    return enhancedProjects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchProjectTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchProjectTerm.toLowerCase()) ||
        (p.saleLead && p.saleLead.toLowerCase().includes(searchProjectTerm.toLowerCase())) ||
        (p.region && p.region.toLowerCase().includes(searchProjectTerm.toLowerCase()));

      const matchPhase =
        selectedPhase === "all" ||
        (p.stepInfo && p.stepInfo.phaseId === Number(selectedPhase));

      return matchSearch && matchPhase;
    });
  }, [enhancedProjects, searchProjectTerm, selectedPhase]);

  // Aggregate metrics per step
  const stepMetrics = useMemo(() => {
    const map = {};
    flowSteps.forEach((s) => {
      const stepProjects = enhancedProjects.filter((p) => p.stepNumber === s.step);
      const totalVal = stepProjects.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
      const bottleneckCount = stepProjects.filter((p) => p.bottleneck).length;
      map[s.step] = {
        count: stepProjects.length,
        totalValue: totalVal,
        bottleneckCount,
        projects: stepProjects,
      };
    });
    return map;
  }, [enhancedProjects]);

  // Total summary metrics
  const totalPipelineValue = useMemo(() => {
    return enhancedProjects.reduce((acc, p) => acc + (p.dealValue || 0), 0);
  }, [enhancedProjects]);

  const totalBottlenecks = useMemo(() => {
    return enhancedProjects.filter((p) => p.bottleneck).length;
  }, [enhancedProjects]);

  // Current active step object
  const currentStepData = flowSteps.find((s) => s.step === activeStep) || flowSteps[0];
  const activeStepProjects = stepMetrics[activeStep]?.projects || [];

  // Toggle checklist checkbox
  const toggleSOPItem = (stepNum, itemIdx) => {
    const key = `${stepNum}-${itemIdx}`;
    setInteractiveChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Move project to next step handler
  const handleAdvanceProjectStep = (projectId) => {
    if (!setProjects) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        let nextStage = p.stage;
        if (p.stage === "pre_tender") nextStage = "design";
        else if (p.stage === "design") nextStage = "ordering";
        else if (p.stage === "ordering") nextStage = "handover_ready";
        else if (p.stage === "handover_ready") nextStage = "installation";
        else if (p.stage === "installation") nextStage = "maintenance";
        return { ...p, stage: nextStage };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP EXECUTIVE COMMAND HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-xl py-3.5 px-4 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white">
              Quy Trình Nghiệp Vụ
            </h1>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-center">
              <div className="text-[10px] text-slate-300 font-medium">Tổng Giá Trị Luồng</div>
              <div className="text-base font-black text-emerald-400 mt-0.5">
                {formatShortCurrency(totalPipelineValue)}
              </div>
              <div className="text-[9px] text-slate-400">{enhancedProjects.length} Dự án theo dõi</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-center">
              <div className="text-[10px] text-slate-300 font-medium">Nhân Sự Phụ Trách</div>
              <div className="text-base font-black text-cyan-300 mt-0.5">
                {users.length || 17} Active
              </div>
              <div className="text-[9px] text-slate-400">8 Vai trò RACI</div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-center">
              <div className="text-[10px] text-slate-300 font-medium">Cảnh Báo Cần Xử Lý</div>
              <div className="text-base font-black text-rose-400 mt-0.5 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 inline" />
                {totalBottlenecks}
              </div>
              <div className="text-[9px] text-slate-400">Cần xử lý ngay</div>
            </div>
          </div>
        </div>

        {/* View Mode Switcher & Phase Filter Tabs */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* 3 Main View Modes */}
          <div className="inline-flex p-1 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 self-start">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "kanban"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              1. Bảng Kanban 9 Bước
            </button>
            <button
              onClick={() => setViewMode("deepdive")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "deepdive"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              2. Chi Tiết Các Bước & Phân Quyền
            </button>
            <button
              onClick={() => setViewMode("bottlenecks")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "bottlenecks"
                  ? "bg-rose-600 text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              3. Cảnh Báo Cần Xử Lý ({totalBottlenecks})
            </button>
          </div>

          {/* Quick Module Jump Links */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
            <button
              onClick={() => onNavigateTab("dms")}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition font-medium flex items-center gap-1.5 shrink-0"
            >
              <FileText className="w-3 h-3 text-cyan-300" /> DMS Hub
            </button>
            <button
              onClick={() => onNavigateTab("hubspot")}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition font-medium flex items-center gap-1.5 shrink-0"
            >
              <Users className="w-3 h-3 text-orange-300" /> HubSpot CRM
            </button>
            <button
              onClick={() => onNavigateTab("logistics")}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition font-medium flex items-center gap-1.5 shrink-0"
            >
              <Ship className="w-3 h-3 text-sky-300" /> Kho Vận (DA/BD)
            </button>
            <button
              onClick={() => onNavigateTab("checklist")}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition font-medium flex items-center gap-1.5 shrink-0"
            >
              <FileCheck2 className="w-3 h-3 text-emerald-300" /> Checklist BOM
            </button>
          </div>
        </div>
      </div>

      {/* 2. MACRO PHASES BANNER (Bức tranh 4 Giai đoạn lớn) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {macroPhases.map((phase) => {
          const isSelected = selectedPhase === String(phase.id);
          const phaseProjects = enhancedProjects.filter(
            (p) => p.stepInfo && phase.steps.includes(p.stepInfo.step)
          );
          const phaseValue = phaseProjects.reduce((acc, p) => acc + (p.dealValue || 0), 0);

          return (
            <div
              key={phase.id}
              onClick={() => setSelectedPhase(isSelected ? "all" : String(phase.id))}
              className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${phase.lightColor}`}>
                  {phase.subtitle}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {phaseProjects.length} dự án
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{phase.name}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-relaxed">
                {phase.description}
              </p>
              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Giá trị giai đoạn:</span>
                <span className="font-bold text-blue-700">{formatShortCurrency(phaseValue)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. VIEW MODE 1: KANBAN SWIMLANES (TỔNG QUAN TOÀN BỘ 9 TRẠM) */}
      {viewMode === "kanban" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Toàn Cảnh 9 Bước Vận Hành (Kanban Flow):
              </span>
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-semibold">
                {filteredProjects.length} dự án đang hiển thị
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Tìm dự án, thương hiệu, sale..."
                  value={searchProjectTerm}
                  onChange={(e) => setSearchProjectTerm(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <ListFilter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              {selectedPhase !== "all" && (
                <button
                  onClick={() => setSelectedPhase("all")}
                  className="text-xs text-blue-600 hover:underline font-semibold shrink-0"
                >
                  Xóa lọc Phase
                </button>
              )}
            </div>
          </div>

          {/* 9 Horizontal Scrollable Swimlanes */}
          <div className="overflow-x-auto pb-4">
            <div className="inline-flex gap-3.5 min-w-full">
              {flowSteps.map((step) => {
                const Icon = step.icon;
                const metrics = stepMetrics[step.step] || { count: 0, totalValue: 0, projects: [] };
                const stepFilteredProjects = filteredProjects.filter((p) => p.stepNumber === step.step);

                return (
                  <div
                    key={step.step}
                    className="w-72 shrink-0 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col max-h-[620px]"
                  >
                    {/* Step Column Header */}
                    <div className="p-3 bg-white border-b border-slate-200 rounded-t-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {step.step}
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate" title={step.name}>
                            {step.short}
                          </span>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {stepFilteredProjects.length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="truncate max-w-[130px] font-medium" title={step.dept}>
                          {step.dept}
                        </span>
                        <span className="font-bold text-blue-700">
                          {formatShortCurrency(metrics.totalValue)}
                        </span>
                      </div>
                    </div>

                    {/* Step Projects Container */}
                    <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1">
                      {stepFilteredProjects.length > 0 ? (
                        stepFilteredProjects.map((p) => (
                          <div
                            key={p.id}
                            className={`p-3 bg-white rounded-xl border text-xs shadow-sm transition hover:shadow-md ${
                              p.bottleneck
                                ? "border-amber-300 ring-1 ring-amber-200"
                                : "border-slate-200 hover:border-blue-400"
                            }`}
                          >
                            {/* Project Header */}
                            <div className="flex items-start justify-between gap-1.5 mb-1.5">
                              <span className="font-bold text-slate-900 line-clamp-1">{p.name}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase shrink-0">
                                {p.region}
                              </span>
                            </div>

                            {/* Brand & Value */}
                            <div className="flex items-center justify-between text-[11px] text-slate-600 mb-2">
                              <span className="font-medium text-slate-500">{p.brand}</span>
                              <span className="font-bold text-emerald-700">
                                {p.dealValue ? formatShortCurrency(p.dealValue) : "Đang lập giá"}
                              </span>
                            </div>

                            {/* Personnel assigned - Tripartite Ownership */}
                            <div className="flex flex-col gap-1 text-[10px] text-slate-600 py-1.5 border-t border-slate-100 bg-slate-50/70 px-2 rounded-lg my-1">
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                  <Target className="w-2.5 h-2.5 text-emerald-600" />
                                  Deal: <strong>{p.dealOwner}</strong>
                                </span>
                                <span className="inline-flex items-center gap-1 text-slate-600">
                                  <UserCheck className="w-2.5 h-2.5 text-blue-600" />
                                  <span>{p.contactOwner}</span>
                                  {(p.contactOwner?.includes("Marketing") || p.hubspotContact?.source?.includes("Marketing") || p.hubspotContact?.channel?.includes("Facebook") || p.hubspotContact?.channel?.includes("Website") || p.hubspotContact?.channel?.includes("Hotline")) ? (
                                    <span className="text-[8px] px-1 py-0.2 rounded bg-purple-100 text-purple-700 font-bold border border-purple-200">Mkt</span>
                                  ) : (
                                    <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">Sale</span>
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-slate-500 pt-0.5 border-t border-slate-200/50">
                                <span className="inline-flex items-center gap-1 truncate">
                                  <Truck className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                  Giao/KTV: <strong className="text-slate-700 truncate">{p.techLead}</strong>
                                </span>
                                {p.deliveryTicket && (
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1 py-0.2 rounded shrink-0">
                                    #{p.deliveryTicket.ticketId}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Connected Department Badges */}
                            <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px]">
                              {p.relatedShipment && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold" title={`PO: ${p.relatedShipment.poCode} về kho ${p.relatedShipment.warehouse}`}>
                                  <Ship className="w-2.5 h-2.5" />
                                  {p.relatedShipment.warehouse === "BD" ? "Kho BD" : "Kho ĐA"} ({formatDate(p.relatedShipment.eta)})
                                </span>
                              )}

                              {p.relatedChecklist && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                                  <FileCheck2 className="w-2.5 h-2.5" />
                                  BOM: {p.relatedChecklist.progress}%
                                </span>
                              )}

                              {p.marketingReady && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 border border-pink-200 font-semibold">
                                  <Camera className="w-2.5 h-2.5" /> Ready
                                </span>
                              )}
                            </div>

                            {/* Bottleneck Alert */}
                            {p.bottleneck && (
                              <div className="mt-2 p-1.5 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-800 space-y-0.5">
                                <div className="font-bold flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                  {p.bottleneck.title}
                                </div>
                                <div className="text-slate-600 line-clamp-1">{p.bottleneck.detail}</div>
                              </div>
                            )}

                            {/* Card Actions */}
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                              <button
                                onClick={() => {
                                  setActiveStep(step.step);
                                  setViewMode("deepdive");
                                }}
                                className="text-[10px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5"
                              >
                                Chi tiết SOP <ChevronRight className="w-2.5 h-2.5" />
                              </button>

                              {step.step < 9 && (
                                <button
                                  onClick={() => handleAdvanceProjectStep(p.id)}
                                  className="text-[10px] bg-slate-100 hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded text-slate-700 font-semibold transition flex items-center gap-1"
                                  title="Chuyển dự án sang bước kế tiếp"
                                >
                                  Sang B.{step.step + 1} <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          Chưa có dự án nào tại bước này
                        </div>
                      )}
                    </div>

                    {/* Step Footer Quick Details button */}
                    <div className="p-2 bg-slate-100/70 border-t border-slate-200 rounded-b-xl text-center">
                      <button
                        onClick={() => {
                          setActiveStep(step.step);
                          setViewMode("deepdive");
                        }}
                        className="text-[11px] text-slate-700 hover:text-blue-700 font-bold transition inline-flex items-center gap-1"
                      >
                        Xem Tiêu Chuẩn SOP & RACI <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. VIEW MODE 2: CHI TIẾT TỪNG BƯỚC (DEEP-DIVE SOP, RACI & ACTION MATRIX) */}
      {viewMode === "deepdive" && (
        <div className="space-y-6">
          {/* Step Selector Horizontal Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Chọn bước quy trình để kiểm tra chi tiết (1 - 9):
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
              {flowSteps.map((s) => {
                const isSelected = activeStep === s.step;
                const metrics = stepMetrics[s.step];
                const Icon = s.icon;
                return (
                  <button
                    key={s.step}
                    onClick={() => setActiveStep(s.step)}
                    className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition relative ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/30 scale-102"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                        isSelected ? "bg-white text-blue-700" : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold line-clamp-1">{s.short}</span>
                    <span className={`text-[10px] mt-0.5 font-semibold ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                      {metrics?.count || 0} dự án
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Step Blueprint */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            {/* Step Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                  {currentStepData.step}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Bước {currentStepData.step} / 9
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${currentStepData.accent}`}>
                      {currentStepData.dept}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" /> SLA: {currentStepData.sla}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{currentStepData.name}</h2>
                  <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                    {currentStepData.desc}
                  </p>
                </div>
              </div>

              {/* Prev / Next navigation */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-40"
                >
                  Bước trước
                </button>
                <button
                  disabled={activeStep === 9}
                  onClick={() => setActiveStep((p) => Math.min(9, p + 1))}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition disabled:opacity-40"
                >
                  Bước tiếp theo
                </button>
              </div>
            </div>

            {/* 4 Detailed Technical Specification Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Block 1: Đầu Vào & Đầu Ra (Inputs / Outputs) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  Điều Kiện Kích Hoạt & Sản Phẩm Bàn Giao
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Điều Kiện Đầu Vào (Input Prereq):</span>
                    <span className="text-slate-700 font-medium leading-relaxed block mt-0.5">
                      {currentStepData.inputPrereq}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase block">Sản Phẩm Đầu Ra (Definition of Done):</span>
                    <span className="text-slate-700 font-medium leading-relaxed block mt-0.5">
                      {currentStepData.outputDeliverable}
                    </span>
                  </div>
                </div>
              </div>

              {/* Block 2: Ma Trận Phân Quyền RACI */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Ma Trận Trách Nhiệm RACI (17 Nhân Sự)
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-1.5 bg-white rounded-md border border-slate-200 flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded bg-blue-100 text-blue-700 font-black text-[10px] flex items-center justify-center shrink-0">R</span>
                    <div className="text-[11px] leading-tight">
                      <span className="text-slate-400 font-semibold block text-[10px]">Thực Thi Chính:</span>
                      <strong className="text-slate-800">{currentStepData.raci.responsible}</strong>
                    </div>
                  </div>
                  <div className="p-1.5 bg-white rounded-md border border-slate-200 flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded bg-rose-100 text-rose-700 font-black text-[10px] flex items-center justify-center shrink-0">A</span>
                    <div className="text-[11px] leading-tight">
                      <span className="text-slate-400 font-semibold block text-[10px]">Phê Duyệt Cuối:</span>
                      <strong className="text-slate-800">{currentStepData.raci.accountable}</strong>
                    </div>
                  </div>
                  <div className="p-1.5 bg-white rounded-md border border-slate-200 flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded bg-amber-100 text-amber-700 font-black text-[10px] flex items-center justify-center shrink-0">C</span>
                    <div className="text-[11px] leading-tight">
                      <span className="text-slate-400 font-semibold block text-[10px]">Tham Vấn:</span>
                      <span className="text-slate-700">{currentStepData.raci.consulted}</span>
                    </div>
                  </div>
                  <div className="p-1.5 bg-white rounded-md border border-slate-200 flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded bg-slate-100 text-slate-700 font-black text-[10px] flex items-center justify-center shrink-0">I</span>
                    <div className="text-[11px] leading-tight">
                      <span className="text-slate-400 font-semibold block text-[10px]">Thông Báo:</span>
                      <span className="text-slate-700">{currentStepData.raci.informed}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Block 3: Kết Nối HubSpot & DMS */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Điểm Tích Hợp HubSpot & DMS
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-blue-200">
                    <span className="text-[10px] text-slate-400 font-semibold block">Giai Đoạn HubSpot CRM:</span>
                    <span className="font-bold text-orange-600 text-[11px] block mt-0.5">
                      {currentStepData.hubspotStage}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-blue-200">
                    <span className="text-[10px] text-slate-400 font-semibold block">Hồ Sơ Tài Liệu DMS:</span>
                    <span className="font-bold text-indigo-700 text-[11px] block mt-0.5">
                      {currentStepData.dmsDocType}
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigateTab("dms")}
                    className="w-full text-center py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-[11px] transition"
                  >
                    Mở Kho Hồ Sơ DMS Liên Quan
                  </button>
                </div>
              </div>

              {/* Block 4: SOP Execution Checklist (Có thể tick kiểm tra) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Quy Chuẩn Kiểm Soát SOP (Tick kiểm)
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {currentStepData.sopChecklist.map((item, idx) => {
                    const isChecked = !!interactiveChecklist[`${currentStepData.step}-${idx}`];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleSOPItem(currentStepData.step, idx)}
                        className={`p-2 rounded-lg border text-[11px] cursor-pointer transition flex items-start gap-2 ${
                          isChecked
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                            isChecked
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span className={isChecked ? "line-through text-slate-500" : ""}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active Projects Table At This Step */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  Hồ Sơ Dự Án Đang Dừng Tại Bước Này ({activeStepProjects.length})
                </div>
                <span className="text-xs text-slate-500">
                  Tổng giá trị: <strong>{formatShortCurrency(stepMetrics[activeStep]?.totalValue || 0)}</strong>
                </span>
              </div>

              {activeStepProjects.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Mã & Tên Dự Án</th>
                        <th className="py-2.5 px-3">Thương Hiệu & Vùng</th>
                        <th className="py-2.5 px-3">Giá Trị Hợp Đồng</th>
                        <th className="py-2.5 px-3">Nhân Sự Phụ Trách</th>
                        <th className="py-2.5 px-3">Tình Trạng Kho / Kỹ Thuật</th>
                        <th className="py-2.5 px-3 text-right">Thao Tác Nghiệp Vụ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeStepProjects.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {p.contractCode || p.id} • Deal ID: {p.hubspotDeal?.dealId || "Chưa gán"}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-700">{p.brand}</span>
                            <span className="text-slate-400 ml-1">({p.region})</span>
                          </td>
                          <td className="py-3 px-3 font-bold text-emerald-700">
                            {p.dealValue ? formatCurrency(p.dealValue) : "Đang lập dự toán"}
                          </td>
                          <td className="py-3 px-3">
                            <div className="space-y-0.5 text-xs">
                              <div className="inline-flex items-center gap-1 text-slate-800">
                                <Target className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>Deal: <strong className="text-slate-900">{p.dealOwner}</strong></span>
                              </div>
                              <div className="text-slate-600 text-[11px] flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-blue-600 shrink-0" />
                                <span>Contact: <strong className="text-slate-800">{p.contactOwner}</strong></span>
                                {(p.contactOwner?.includes("Marketing") || p.hubspotContact?.source?.includes("Marketing") || p.hubspotContact?.channel?.includes("Facebook") || p.hubspotContact?.channel?.includes("Website") || p.hubspotContact?.channel?.includes("Hotline")) ? (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-purple-100 text-purple-700 font-bold border border-purple-200">Mkt Lead</span>
                                ) : (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">Sale tạo</span>
                                )}
                              </div>
                              <div className="text-slate-500 text-[11px] flex items-center gap-1">
                                <Truck className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Giao/KTV: <strong className="text-slate-700">{p.techLead}</strong></span>
                              </div>
                              {p.deliveryTicket && (
                                <div className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1 mt-0.5">
                                  <Truck className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>Vé #{p.deliveryTicket.ticketId} ({p.deliveryTicket.status})</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {p.bottleneck ? (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                {p.bottleneck.title}
                              </div>
                            ) : p.relatedShipment ? (
                              <div className="text-[11px] text-slate-600">
                                PO: <span className="font-semibold">{p.relatedShipment.poCode}</span> ({p.relatedShipment.warehouse})
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Bình thường</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5">
                            {activeStep < 9 && (
                              <button
                                onClick={() => handleAdvanceProjectStep(p.id)}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-[11px] transition inline-flex items-center gap-1"
                              >
                                Chuyển Bước {activeStep + 1} <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onNavigateTab("dms")}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] transition"
                            >
                              DMS
                            </button>
                            {onOpenChecklist && (
                              <button
                                onClick={() => onOpenChecklist(p.id)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-semibold text-[11px] transition"
                              >
                                BOM
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                  Hiện không có dự án nào đang dừng tại Bước {activeStep} ({currentStepData.name}).
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. VIEW MODE 3: ĐIỂM NGHẼN & RỦI RO (BOTTLENECK RADAR) */}
      {viewMode === "bottlenecks" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                Bảng Kiểm Soát Rủi Ro & Điểm Nghẽn
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Các dự án gặp cảnh báo về logistics tàu biển, thiếu hàng phụ tùng, trễ mặt bằng thô hoặc nghiệm thu BOM.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {totalBottlenecks} Điểm nghẽn cần tháo gỡ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enhancedProjects
              .filter((p) => p.bottleneck)
              .map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                        Bước {p.stepNumber}: {p.stepInfo.short}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{p.name}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Thương hiệu: <strong>{p.brand}</strong> • Khu vực: <strong>{p.region}</strong>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 shrink-0">
                      {p.dealValue ? formatShortCurrency(p.dealValue) : "Đang lập giá"}
                    </span>
                  </div>

                  {/* Bottleneck message box */}
                  <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs space-y-1">
                    <div className="font-bold text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      {p.bottleneck.title}
                    </div>
                    <div className="text-slate-600 leading-relaxed">{p.bottleneck.detail}</div>
                  </div>

                  {/* Action Solution & Responsible staff */}
                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                    <div className="text-slate-700 text-[11px] flex items-center gap-2 flex-wrap">
                      <span>Deal: <strong className="text-slate-900">{p.dealOwner}</strong></span>
                      <span>•</span>
                      <span>Contact: <strong className="text-slate-800">{p.contactOwner}</strong></span>
                      <span>•</span>
                      <span>KTV: <strong className="text-slate-800">{p.techLead}</strong></span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveStep(p.stepNumber);
                        setViewMode("deepdive");
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-[11px] transition"
                    >
                      Xem SOP & Xử Lý
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
