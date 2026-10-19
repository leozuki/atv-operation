import { describe, it, expect } from "vitest";
import {
  HUBSPOT_TICKET_CATEGORIES,
  estimateTicketCompletion,
  estimateShipmentLeadTime,
} from "../src/utils/slaEstimator";

describe("slaEstimator Engine", () => {
  it("defines all 5 canonical ticket categories with SLA and benchmark info", () => {
    const keys = Object.keys(HUBSPOT_TICKET_CATEGORIES);
    expect(keys).toEqual([
      "PREVENTIVE_MAINTENANCE",
      "EMERGENCY_REPAIR",
      "PARTS_REPLACEMENT",
      "NEW_INSTALLATION",
      "WAREHOUSE_RECEIVING",
    ]);

    for (const key of keys) {
      const cat = HUBSPOT_TICKET_CATEGORIES[key];
      expect(cat.avgHours).toBeGreaterThan(0);
      expect(cat.rangeText).toBeTruthy();
      expect(cat.slaDays).toBeGreaterThan(0);
      expect(cat.benchmarkNote).toBeTruthy();
      expect(cat.milestones.length).toBeGreaterThan(0);
    }
  });

  it("accurately classifies emergency repair / breakdown tickets", () => {
    const t1 = { subject: "HCM | LAB Gym - Kiểm tra Air Bike ko lên nguồn" };
    const est1 = estimateTicketCompletion(t1);
    expect(est1.categoryKey).toBe("EMERGENCY_REPAIR");
    expect(est1.estHours).toBe(3.0);
    expect(est1.estHoursFormatted).toBe("3h 0m");

    const t2 = { subject: "HCM | P7 Vinhomes | MCB P7 mất nguồn" };
    const est2 = estimateTicketCompletion(t2);
    expect(est2.categoryKey).toBe("EMERGENCY_REPAIR");
  });

  it("accurately classifies preventive maintenance tickets", () => {
    const t = { subject: "Tây Ninh | Cana Pilates SM định kì lần 1/4 | ATVE25135" };
    const est = estimateTicketCompletion(t);
    expect(est.categoryKey).toBe("PREVENTIVE_MAINTENANCE");
    expect(est.estHours).toBe(3.5);
    expect(est.estHoursFormatted).toBe("3h 30m");
  });

  it("accurately classifies parts replacement & upholstery tickets", () => {
    const t = { subject: "HN| Elite Nguyễn Chí Thanh| Bọc da ghế, đệm máy khối" };
    const est = estimateTicketCompletion(t);
    expect(est.categoryKey).toBe("PARTS_REPLACEMENT");
    expect(est.estHours).toBe(12.0);
  });

  it("accurately classifies installation & delivery tickets", () => {
    const t = { subject: "HCM ATVESG26053 Dragon Prime Eleiko delivery" };
    const est = estimateTicketCompletion(t);
    expect(est.categoryKey).toBe("NEW_INSTALLATION");
    expect(est.estHours).toBe(24.0);
  });

  it("accurately classifies warehouse receiving & de-stuffing tickets", () => {
    const t = { subject: "KHO DA | Nhận hàng Ziva - Vietcombank, Grab, Clubhouse Fulton" };
    const est = estimateTicketCompletion(t);
    expect(est.categoryKey).toBe("WAREHOUSE_RECEIVING");
    expect(est.estHours).toBe(8.0);
  });

  it("calculates shipment lead time estimates according to brand and route", () => {
    const precorSea = { brand: "Precor", method: "Sea", eta: "2026-10-25" };
    const estPrecor = estimateShipmentLeadTime(precorSea);
    expect(estPrecor.transitDays).toBe(65);
    expect(estPrecor.customsDays).toBe(4);
    expect(estPrecor.warehouseToSiteDays).toBe(2);
    expect(estPrecor.estHandoverDate).toBe("2026-10-31");

    const zivaSea = { brand: "Ziva", method: "Sea", poDate: "2026-10-06" };
    const estZiva = estimateShipmentLeadTime(zivaSea);
    expect(estZiva.transitDays).toBe(35);
    expect(estZiva.totalLeadTimeDays).toBe(41);
  });
});
