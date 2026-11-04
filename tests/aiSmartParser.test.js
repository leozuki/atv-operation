import { describe, it, expect } from "vitest";
import {
  parseSmartInput,
  parseCurrencyAmounts,
  findMatchingProject,
} from "../src/utils/aiSmartParser";
import { initialProjects } from "../src/data/initialData";

describe("AI Smart Intake & Multi-Module Auto-Allocation Engine", () => {
  it("accurately parses Vietnamese currency amounts (tỷ, triệu)", () => {
    const res = parseCurrencyAmounts("Gói máy Precor trị giá 2.4 tỷ, đã chuyển khoản cọc 720 triệu qua TCB");
    expect(res.length).toBe(2);
    expect(res[0].value).toBe(2400000000);
    expect(res[1].value).toBe(720000000);
  });

  it("identifies existing projects from natural language notes (Cà Na, Fulton, Go Gym)", () => {
    const cana = findMatchingProject(
      "Cà Na Pilates Tây Ninh: Mr. Vũ vừa chuyển khoản thêm 180 triệu",
      initialProjects
    );
    expect(cana?.id).toBe("PRJ-001");

    const fulton = findMatchingProject(
      "Clubhouse Fulton (PRJ-004): Lô hàng PO ULS-AT2609 đã về kho Đông Anh",
      initialProjects
    );
    expect(fulton?.id).toBe("PRJ-004");
  });

  it("builds a complete 6-module allocation plan for a new project brief", () => {
    const brief =
      "Dự án mới: Sala Signature Gym Quận 2, khách hàng Mr. Hoàng (0909123456), địa chỉ 10 Mai Chí Thọ Quận 2 TP.HCM. Gói thiết bị Precor & Merrithew trị giá 2.4 tỷ, khách vừa chuyển khoản cọc đợt 1 720 triệu qua TCB. Giao Designer Lý lên bản vẽ 2D/3D, Sale Khánh Nguyễn phụ trách, đặt PO ULS-AT2688 về kho Bình Dương và cử KTV Tuấn Anh khảo sát Thứ 5.";
    const plan = parseSmartInput(brief, { projects: initialProjects });

    expect(plan.isNewProject).toBe(true);
    expect(plan.projectName).toContain("Sala Signature Gym");
    expect(plan.region).toBe("HCM");
    expect(plan.brand).toContain("Precor");
    expect(plan.brand).toContain("Merrithew");
    expect(plan.leadSale).toBe("Khánh Nguyễn");
    expect(plan.assignedTech).toContain("Lương Nguyễn Tuấn Anh");
    expect(plan.contractValue).toBe(2400000000);
    expect(plan.collectionAmount).toBe(720000000);

    const modules = plan.allocations.map((a) => a.module);
    expect(modules).toEqual([
      "projects",
      "tender",
      "design",
      "finance",
      "logistics",
      "maintenance",
    ]);
  });

  it("builds targeted downstream allocations for an existing project note", () => {
    const note =
      "Cà Na Pilates Tây Ninh (PRJ-001): Mr. Vũ vừa chuyển khoản thanh toán thêm 180 triệu qua VCB. Mặt bằng đã sạch đẹp, bật cờ báo Marketing chụp ảnh flycam và cử KTV Tuấn Anh, Thái Châu xuống lắp bổ sung 2 bộ lò xo SPX Max vào Thứ 3.";
    const plan = parseSmartInput(note, { projects: initialProjects });

    expect(plan.isNewProject).toBe(false);
    expect(plan.matchedProject?.id).toBe("PRJ-001");
    expect(plan.collectionAmount).toBe(180000000);
    expect(plan.marketingReady).toBe(true);

    const modules = plan.allocations.map((a) => a.module);
    expect(modules).toContain("projects");
    expect(modules).toContain("finance");
    expect(modules).toContain("maintenance");
  });
});
