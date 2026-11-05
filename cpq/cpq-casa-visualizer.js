/**
 * ============================================================================
 * ATTIVO INTERNATIONAL — CASA SERRA / LINTEL ARCHITECTURAL 2D & 3D ENGINE
 * ============================================================================
 * Inspired by Sam1983Aing/casa-serra & casa-larga + Unity URP Post-Processing:
 *  1. RectSolid CSG Watertight Solid Modeler (walls + openings + true edges
 *     + solid black architectural poché section caps)
 *  2. inkAware Custom GLSL Shader (blends Paper-and-Ink Blueprint with PBR 3D,
 *     computes analytical Room Ambient Occlusion & ACES Filmic grading)
 *  3. Floor-Embedded 3D & 2D Architectural Sheet (dimension strings with 45°
 *     ticks, door swings, 1.2m floor joint grid, center axis line, North arrow,
 *     metric scale bar, and Sheet A-101 Title Block)
 *  4. Telephoto 2° Overhead Blueprint -> Rising Walls -> Axonometric Cutaway ->
 *     50° Eye-Level Interior Walkthrough Camera Rig + OrbitControls
 *  5. 100% Dynamic Equipment Generation from CPQ Proposal Items
 * ============================================================================
 */
(function (global) {
  'use strict';

  const PAPER_HEX = '#f1eee6';
  const INK_HEX = '#17171a';
  const DIM_HEX = '#4a4842';
  const CLEARANCE_AMBER = '#b45309';

  const CUT_PLAN = 1.20;
  const CUT_OPEN = 5.60;
  const GROUND_Y = -0.16;
  const BASE_Y = -0.15;

  // ==========================================================================
  // 1. RECTSOLID: WATERTIGHT CSG SOLID MODELER FOR ARCHITECTURAL WALLS
  // ==========================================================================
  const R4 = (v) => Math.round(v * 1e4) / 1e4;

  class RectSolid {
    constructor() {
      this.ops = [];
    }
    add(x0, y0, z0, x1, y1, z1) {
      this.ops.push([
        1,
        R4(Math.min(x0, x1)), R4(Math.min(y0, y1)), R4(Math.min(z0, z1)),
        R4(Math.max(x0, x1)), R4(Math.max(y0, y1)), R4(Math.max(z0, z1))
      ]);
      return this;
    }
    sub(x0, y0, z0, x1, y1, z1) {
      this.ops.push([
        0,
        R4(Math.min(x0, x1)), R4(Math.min(y0, y1)), R4(Math.min(z0, z1)),
        R4(Math.max(x0, x1)), R4(Math.max(y0, y1)), R4(Math.max(z0, z1))
      ]);
      return this;
    }
    build(faceKey) {
      const uniq = (arr) => [...new Set(arr)].sort((a, b) => a - b);
      const xs = uniq(this.ops.flatMap((o) => [o[1], o[4]]));
      const ys = uniq(this.ops.flatMap((o) => [o[2], o[5]]));
      const zs = uniq(this.ops.flatMap((o) => [o[3], o[6]]));
      const ix = new Map(xs.map((v, i) => [v, i]));
      const iy = new Map(ys.map((v, i) => [v, i]));
      const iz = new Map(zs.map((v, i) => [v, i]));
      const nx = xs.length - 1, ny = ys.length - 1, nz = zs.length - 1;
      const occ = new Uint8Array(nx * ny * nz);
      const id = (i, j, k) => i + nx * (j + ny * k);

      for (const o of this.ops) {
        const i0 = ix.get(o[1]), i1 = ix.get(o[4]);
        const j0 = iy.get(o[2]), j1 = iy.get(o[5]);
        const k0 = iz.get(o[3]), k1 = iz.get(o[6]);
        for (let k = k0; k < k1; k++)
          for (let j = j0; j < j1; j++)
            for (let i = i0; i < i1; i++)
              occ[id(i, j, k)] = o[0];
      }
      const at = (i, j, k) => (i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz ? 0 : occ[id(i, j, k)]);

      const buckets = {};
      const bucket = (key) => (buckets[key] ??= { p: [], n: [], uv: [], idx: [] });
      const quad = (key, a, b, c, d, n) => {
        const B = bucket(key);
        const base = B.p.length / 3;
        for (const v of [a, b, c, d]) {
          B.p.push(v[0], v[1], v[2]);
          B.n.push(n[0], n[1], n[2]);
          if (n[0] !== 0) B.uv.push(v[2], v[1]);
          else if (n[1] !== 0) B.uv.push(v[0], v[2]);
          else B.uv.push(v[0], v[1]);
        }
        B.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
      };

      for (let k = 0; k < nz; k++) {
        for (let j = 0; j < ny; j++) {
          for (let i = 0; i < nx; i++) {
            if (!occ[id(i, j, k)]) continue;
            const x0 = xs[i], x1 = xs[i + 1], y0 = ys[j], y1 = ys[j + 1], z0 = zs[k], z1 = zs[k + 1];
            const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
            if (!at(i + 1, j, k)) quad(faceKey(x1, cy, cz, 1, 0, 0), [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]);
            if (!at(i - 1, j, k)) quad(faceKey(x0, cy, cz, -1, 0, 0), [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]);
            if (!at(i, j + 1, k)) quad(faceKey(cx, y1, cz, 0, 1, 0), [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0]);
            if (!at(i, j - 1, k)) quad(faceKey(cx, y0, cz, 0, -1, 0), [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]);
            if (!at(i, j, k + 1)) quad(faceKey(cx, cy, z1, 0, 0, 1), [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]);
            if (!at(i, j, k - 1)) quad(faceKey(cx, cy, z0, 0, 0, -1), [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]);
          }
        }
      }

      const geos = {};
      const edges = [];
      for (const key in buckets) {
        const B = buckets[key];
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3));
        g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
        g.setIndex(B.idx);
        geos[key] = g;

        const eg = new THREE.EdgesGeometry(g, 25);
        const ep = eg.attributes.position;
        for (let m = 0; m < ep.count; m++) {
          edges.push(ep.getX(m), ep.getY(m), ep.getZ(m));
        }
      }
      return { geos, edges };
    }
  }

  // ==========================================================================
  // 2. EQUIPMENT CLASSIFIER (MAPS CPQ SKUS -> ARCHITECTURAL SYMBOLS & 3D MESHES)
  // ==========================================================================
  function classifyProposalEquipment(proposal) {
    const items = (proposal && Array.isArray(proposal.items)) ? proposal.items : [];
    const pType = (proposal && (proposal.projectType || proposal.facilityType)) || 'commercial_gym';

    const list = [];
    items.forEach((it) => {
      const cat = (it.category || '').toLowerCase();
      if (cat === 'flooring' || cat === 'service') return;

      const sku = (it.sku || '').toUpperCase();
      const name = (it.name || '').toLowerCase();
      const zone = (it.zone || '').toLowerCase();
      const qty = Math.max(1, Math.min(Number(it.quantity) || 1, 8));

      let kind = 'selectorized';
      if (pType === 'pilates_studio' || name.includes('reformer') || sku.includes('MRT') || name.includes('pilates')) {
        if (name.includes('cadillac') || name.includes('trapeze') || sku.includes('ST-01003')) kind = 'cadillac';
        else if (name.includes('barrel') || name.includes('chair')) kind = 'barrel';
        else kind = 'reformer';
      } else if (pType === 'recovery_lounge' || name.includes('plunge') || name.includes('sauna')) {
        if (name.includes('sauna')) kind = 'sauna';
        else if (name.includes('plunge') || name.includes('tub') || name.includes('ice')) kind = 'cold_plunge';
        else kind = 'reformer';
      } else if (sku.includes('TRM') || name.includes('treadmill') || name.includes('chạy bộ') || name.includes('slat')) {
        kind = 'treadmill';
      } else if (sku.includes('EFX') || sku.includes('AMT') || name.includes('elliptical') || name.includes('trượt tuyết')) {
        kind = 'elliptical';
      } else if (sku.includes('UBK') || sku.includes('RBK') || sku.includes('SBK') || name.includes('bike') || name.includes('xe đạp')) {
        kind = 'bike';
      } else if (sku.includes('ROW') || name.includes('row') || name.includes('chèo')) {
        kind = 'rower';
      } else if (name.includes('booty') || name.includes('hip thrust') || name.includes('glute') || sku.includes('BB-')) {
        kind = 'booty_builder';
      } else if (name.includes('rack') || name.includes('cage') || name.includes('smith') || name.includes('khung gánh')) {
        kind = 'power_rack';
      } else if (name.includes('dumbbell') || name.includes('tạ tay') || name.includes('kettlebell') || name.includes('urethane')) {
        kind = 'dumbbell_rack';
      } else if (name.includes('bench') || name.includes('ghế')) {
        kind = 'bench';
      } else if (name.includes('cable') || name.includes('functional') || name.includes('fts') || name.includes('dap') || name.includes('vai đôi')) {
        kind = 'cable_crossover';
      } else if (zone.includes('cardio')) {
        kind = 'bike';
      } else if (zone.includes('free')) {
        kind = 'power_rack';
      }

      for (let q = 0; q < qty; q++) {
        list.push({
          kind,
          sku: it.sku || 'ATT-PRO',
          brand: it.brand || 'Precor',
          name: it.name || 'Commercial Equipment',
          unitIndex: q + 1,
          totalQty: qty
        });
      }
    });

    if (list.length === 0) {
      return [
        { kind: 'treadmill', sku: 'TRM 885', brand: 'Precor' },
        { kind: 'treadmill', sku: 'TRM 885', brand: 'Precor' },
        { kind: 'treadmill', sku: 'TRM 885', brand: 'Precor' },
        { kind: 'treadmill', sku: 'TRM 885', brand: 'Precor' },
        { kind: 'elliptical', sku: 'EFX 885', brand: 'Precor' },
        { kind: 'elliptical', sku: 'EFX 885', brand: 'Precor' },
        { kind: 'bike', sku: 'UBK 885', brand: 'Precor' },
        { kind: 'bike', sku: 'UBK 885', brand: 'Precor' },
        { kind: 'rower', sku: 'RowERG', brand: 'Concept2' },
        { kind: 'selectorized', sku: 'DSL0204', brand: 'Precor' },
        { kind: 'selectorized', sku: 'DSL0314', brand: 'Precor' },
        { kind: 'selectorized', sku: 'DSL0605', brand: 'Precor' },
        { kind: 'selectorized', sku: 'DSL0714', brand: 'Precor' },
        { kind: 'cable_crossover', sku: 'FTS-GLIDE', brand: 'Precor' },
        { kind: 'power_rack', sku: 'ELK-PR300', brand: 'Eleiko' },
        { kind: 'power_rack', sku: 'ELK-PR300', brand: 'Eleiko' },
        { kind: 'bench', sku: 'DBR-0119', brand: 'Precor' },
        { kind: 'bench', sku: 'DBR-0119', brand: 'Precor' },
        { kind: 'dumbbell_rack', sku: 'ZVO-DBR10', brand: 'ZIVA' },
        { kind: 'booty_builder', sku: 'BB-PLAT-V4', brand: 'Booty Builder' },
        { kind: 'booty_builder', sku: 'BB-STAND', brand: 'Booty Builder' }
      ];
    }
    return list;
  }

  function layoutEquipmentInMetres(proposal) {
    const area = Math.max(60, Math.min(Number(proposal?.area || proposal?.area_m2) || 250, 1200));
    const pType = (proposal && (proposal.projectType || proposal.facilityType)) || 'commercial_gym';
    const aspect = 1.55;
    const W = Math.round(Math.sqrt(area * aspect) * 10) / 10;
    const D = Math.round((area / W) * 10) / 10;
    const list = classifyProposalEquipment(proposal);
    const placements = [];

    const xLeft = -W / 2 + 1.45;
    const xCardioEnd = -W / 2 + W * 0.31;
    const xStrengthEnd = -W / 2 + W * 0.66;
    const xRight = W / 2 - 1.25;
    const zBack = -D / 2 + 2.05; // Leaves clean top margin for architectural zone titles
    const zFront = D / 2 - 1.75;

    if (pType === 'pilates_studio') {
      const reformers = list.filter((x) => x.kind === 'reformer');
      const others = list.filter((x) => x.kind !== 'reformer');
      let rx = -W / 2 + 2.4;
      let rz = -D / 4 + 0.3;
      reformers.slice(0, 8).forEach((item) => {
        placements.push({ ...item, x: rx, z: rz, rotY: 0, w: 0.95, d: 2.45 });
        rx += 2.15;
        if (rx > W / 2 - 2.2) {
          rx = -W / 2 + 2.4;
          rz += 3.2;
        }
      });
      let ox = -W / 2 + 2.8;
      others.slice(0, 4).forEach((item) => {
        placements.push({ ...item, x: ox, z: D / 4 + 0.5, rotY: Math.PI / 2, w: 1.05, d: 2.35 });
        ox += 3.2;
      });
    } else if (pType === 'recovery_lounge') {
      let cx = -W / 2 + 2.6;
      list.slice(0, 6).forEach((item, idx) => {
        const isSauna = item.kind === 'sauna';
        placements.push({
          ...item,
          x: cx,
          z: idx % 2 === 0 ? -D / 4 + 0.5 : D / 4 - 0.5,
          rotY: 0,
          w: isSauna ? 2.2 : 1.15,
          d: isSauna ? 2.0 : 2.1
        });
        cx += 3.1;
      });
    } else {
      const treadmills = list.filter((x) => x.kind === 'treadmill');
      const cardioOther = list.filter((x) => ['elliptical', 'bike', 'rower'].includes(x.kind));
      const strength = list.filter((x) => ['selectorized', 'cable_crossover'].includes(x.kind));
      const racks = list.filter((x) => x.kind === 'power_rack');
      const benches = list.filter((x) => x.kind === 'bench');
      const dbracks = list.filter((x) => x.kind === 'dumbbell_rack');
      const booty = list.filter((x) => x.kind === 'booty_builder');

      // 1. Treadmills along West Glass Wall
      let tz = zBack + 0.1;
      treadmills.slice(0, 5).forEach((item) => {
        if (tz <= zFront) {
          placements.push({ ...item, x: xLeft + 0.65, z: tz, rotY: -Math.PI / 2, w: 0.96, d: 2.15 });
          tz += 1.72;
        }
      });

      // 2. Bikes / Ellipticals / Rowers in second Cardio column
      let cz = zBack + 0.2;
      cardioOther.slice(0, 5).forEach((item) => {
        if (cz <= zFront) {
          placements.push({ ...item, x: xLeft + 3.45, z: cz, rotY: -Math.PI / 2, w: 0.78, d: 1.65 });
          cz += 1.68;
        }
      });

      // 3. Selectorized Strength in Center-North Zone
      let sx = xCardioEnd + 1.35;
      let sz = zBack + 0.3;
      strength.slice(0, 6).forEach((item) => {
        placements.push({ ...item, x: sx, z: sz, rotY: 0, w: 1.25, d: 1.55 });
        sx += 2.2;
        if (sx > xStrengthEnd - 0.9) {
          sx = xCardioEnd + 1.35;
          sz += 2.35;
        }
      });

      // 4. Power Racks & Benches in North-East Free Weights Zone
      let rx = xStrengthEnd + 1.55;
      racks.slice(0, 2).forEach((item) => {
        if (rx <= xRight - 0.4) {
          placements.push({ ...item, x: rx, z: zBack + 0.55, rotY: 0, w: 1.65, d: 1.85 });
          rx += 2.65;
        }
      });

      let bx = xStrengthEnd + 1.55;
      benches.slice(0, 2).forEach((item) => {
        if (bx <= xRight - 0.4) {
          placements.push({ ...item, x: bx, z: zBack + 3.05, rotY: 0, w: 0.75, d: 1.42 });
          bx += 2.35;
        }
      });

      // Dumbbell Rack along East Perimeter Wall
      const dbItem = dbracks[0] || { kind: 'dumbbell_rack', sku: 'ZVO-DBR', brand: 'ZIVA' };
      placements.push({ ...dbItem, x: W / 2 - 0.68, z: -D * 0.12, rotY: -Math.PI / 2, w: 2.4, d: 0.62 });

      // 5. Booty Builder / Glute Hub in South-Center
      let gx = xCardioEnd + 1.55;
      booty.slice(0, 3).forEach((item) => {
        placements.push({ ...item, x: gx, z: D / 2 - 2.35, rotY: Math.PI, w: 1.2, d: 1.65 });
        gx += 2.15;
      });
    }

    return { W, D, area, pType, placements };
  }

  // ==========================================================================
  // 3. CASA SERRA 2D ARCHITECTURAL SHEET A-101 RENDERER (AttivoVisualizer2D)
  // ==========================================================================
  const AttivoVisualizer2D = {
    drawFloorplan(proposal) {
      return this.render(proposal);
    },

    render(proposal) {
      const canvas = document.getElementById('aiFloorplanCanvas');
      if (!canvas) return;

      const p = proposal || (global.AttivoAiAdvisor && global.AttivoAiAdvisor.currentProposal) || {
        area: 250,
        projectType: 'commercial_gym',
        clientName: 'ATTIVO INTERNATIONAL',
        total_units: 24,
        items: []
      };

      const isEN = (typeof state === 'undefined' || state.appLang === 'en');

      const CW = 1600;
      const CH = 1000;
      if (canvas.width !== CW) canvas.width = CW;
      if (canvas.height !== CH) canvas.height = CH;

      const ctx = canvas.getContext('2d');
      const { W, D, area, pType, placements } = layoutEquipmentInMetres(p);

      // 1. ARCHIVAL PAPER SHEET BACKGROUND & FIBER TEXTURE
      ctx.fillStyle = PAPER_HEX;
      ctx.fillRect(0, 0, CW, CH);

      ctx.strokeStyle = 'rgba(23, 23, 26, 0.022)';
      ctx.lineWidth = 1;
      for (let y = 0; y < CH; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CW, y);
        ctx.stroke();
      }

      // 2. DOUBLE ARCHITECTURAL BORDER FRAME (CASA SERRA SHEET A-101)
      const B_OUT = 24;
      const B_IN = 32;
      ctx.strokeStyle = INK_HEX;
      ctx.lineWidth = 2.2;
      ctx.strokeRect(B_OUT, B_OUT, CW - B_OUT * 2, CH - B_OUT * 2);
      ctx.lineWidth = 0.9;
      ctx.strokeRect(B_IN, B_IN, CW - B_IN * 2, CH - B_IN * 2);

      ctx.font = '600 10px "JetBrains Mono", "IBM Plex Mono", monospace';
      ctx.fillStyle = DIM_HEX;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cols = ['1', '2', '3', '4', '5', '6', '7', '8'];
      cols.forEach((c, i) => {
        const x = B_IN + ((CW - B_IN * 2) * (i + 0.5)) / cols.length;
        ctx.fillText(c, x, (B_OUT + B_IN) / 2);
        ctx.fillText(c, x, CH - (B_OUT + B_IN) / 2);
      });
      const rows = ['A', 'B', 'C', 'D', 'E'];
      rows.forEach((r, i) => {
        const y = B_IN + ((CH - B_IN * 2) * (i + 0.5)) / rows.length;
        ctx.fillText(r, (B_OUT + B_IN) / 2, y);
        ctx.fillText(r, CW - (B_OUT + B_IN) / 2, y);
      });

      // 3. COMPUTE SCALE (PIXELS PER METRE) & PLAN ORIGIN
      const planAreaW = CW - 440 - 140;
      const planAreaH = CH - 220;
      const PXM = Math.min(planAreaW / W, planAreaH / D);
      const cx = 115 + planAreaW / 2;
      const cy = 115 + planAreaH / 2;

      const toX = (xm) => cx + xm * PXM;
      const toY = (zm) => cy + zm * PXM;

      const rx0 = toX(-W / 2), ry0 = toY(-D / 2);
      const rw = W * PXM, rh = D * PXM;

      // 4. 1.20M ARCHITECTURAL FLOOR JOINT GRID & ZONE HATCHING
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx0, ry0, rw, rh);
      ctx.clip();

      ctx.fillStyle = '#f7f5ef';
      ctx.fillRect(rx0, ry0, rw, rh);

      ctx.strokeStyle = '#dedad0';
      ctx.lineWidth = 0.75;
      for (let xm = -W / 2; xm <= W / 2; xm += 1.2) {
        const px = toX(xm);
        ctx.beginPath(); ctx.moveTo(px, ry0); ctx.lineTo(px, ry0 + rh); ctx.stroke();
      }
      for (let zm = -D / 2; zm <= D / 2; zm += 1.2) {
        const py = toY(zm);
        ctx.beginPath(); ctx.moveTo(rx0, py); ctx.lineTo(rx0 + rw, py); ctx.stroke();
      }

      if (pType !== 'pilates_studio' && pType !== 'recovery_lounge') {
        const xCardio = toX(-W / 2 + W * 0.31);
        const xStrength = toX(-W / 2 + W * 0.66);
        const yMid = toY(0.2);

        // Free weights acoustic rubber diagonal cross-hatch in NE quadrant
        ctx.strokeStyle = 'rgba(23, 23, 26, 0.045)';
        ctx.lineWidth = 0.8;
        for (let d = -200; d < 600; d += 12) {
          ctx.beginPath();
          ctx.moveTo(xStrength + d, ry0);
          ctx.lineTo(xStrength + d - 180, yMid);
          ctx.stroke();
        }

        // Athletic Sprint Turf Track in SE quadrant
        const turfX0 = xStrength + 14;
        const turfY0 = yMid + 42;
        const turfW = (rx0 + rw) - turfX0 - 18;
        const turfH = (ry0 + rh) - turfY0 - 44;
        if (turfW > 60 && turfH > 36) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.07)';
          ctx.fillRect(turfX0, turfY0, turfW, turfH);
          ctx.strokeStyle = INK_HEX;
          ctx.lineWidth = 1.1;
          ctx.strokeRect(turfX0, turfY0, turfW, turfH);
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(turfX0, turfY0 + turfH / 2);
          ctx.lineTo(turfX0 + turfW, turfY0 + turfH / 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = '600 8px "JetBrains Mono", monospace';
          ctx.fillStyle = INK_HEX;
          const hashes = 5;
          for (let h = 1; h < hashes; h++) {
            const hx = turfX0 + (turfW * h) / hashes;
            ctx.beginPath();
            ctx.moveTo(hx, turfY0); ctx.lineTo(hx, turfY0 + 8);
            ctx.moveTo(hx, turfY0 + turfH - 8); ctx.lineTo(hx, turfY0 + turfH);
            ctx.stroke();
            ctx.fillText(`${h * 3}M`, hx, turfY0 + turfH / 2 - 7);
          }
        }

        ctx.strokeStyle = '#8c877e';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(xCardio, ry0); ctx.lineTo(xCardio, ry0 + rh - 55);
        ctx.moveTo(xStrength, ry0); ctx.lineTo(xStrength, ry0 + rh - 55);
        ctx.moveTo(xCardio, yMid); ctx.lineTo(rx0 + rw, yMid);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();

      // 5. CENTER AXIS SPINE LINE
      ctx.save();
      ctx.strokeStyle = '#6e6a63';
      ctx.lineWidth = 0.85;
      ctx.setLineDash([14, 5, 3, 5]);
      ctx.beginPath();
      ctx.moveTo(rx0 - 28, cy); ctx.lineTo(rx0 + rw + 28, cy);
      ctx.moveTo(cx, ry0 - 28); ctx.lineTo(cx, ry0 + rh + 28);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 6. SOLID BLACK CUT-SECTION STRUCTURAL WALLS (CUT AT +1.20m)
      const wallThick = Math.max(8, Math.round(0.30 * PXM));
      ctx.fillStyle = INK_HEX;
      ctx.fillRect(rx0 - wallThick / 2, ry0 - wallThick / 2, rw + wallThick, wallThick);
      ctx.fillRect(rx0 - wallThick / 2, ry0 + rh - wallThick / 2, rw + wallThick, wallThick);
      ctx.fillRect(rx0 - wallThick / 2, ry0 - wallThick / 2, wallThick, rh + wallThick);
      ctx.fillRect(rx0 + rw - wallThick / 2, ry0 - wallThick / 2, wallThick, rh + wallThick);

      const drawWindowCutout = (x, y, w, h, vertical) => {
        ctx.fillStyle = PAPER_HEX;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = INK_HEX;
        ctx.lineWidth = 1.1;
        ctx.strokeRect(x, y, w, h);
        ctx.beginPath();
        if (vertical) {
          ctx.moveTo(x + w * 0.38, y); ctx.lineTo(x + w * 0.38, y + h);
          ctx.moveTo(x + w * 0.62, y); ctx.lineTo(x + w * 0.62, y + h);
          for (let my = y + 2.4 * PXM; my < y + h - 10; my += 2.4 * PXM) {
            ctx.fillStyle = INK_HEX;
            ctx.fillRect(x, my - 2, w, 4);
          }
        } else {
          ctx.moveTo(x, y + h * 0.38); ctx.lineTo(x + w, y + h * 0.38);
          ctx.moveTo(x, y + h * 0.62); ctx.lineTo(x + w, y + h * 0.62);
          for (let mx = x + 2.4 * PXM; mx < x + w - 10; mx += 2.4 * PXM) {
            ctx.fillStyle = INK_HEX;
            ctx.fillRect(mx - 2, y, 4, h);
          }
        }
        ctx.stroke();
      };

      drawWindowCutout(rx0 - wallThick / 2, ry0 + rh * 0.12, wallThick, rh * 0.76, true);
      drawWindowCutout(rx0 + rw * 0.15, ry0 - wallThick / 2, rw * 0.28, wallThick, false);

      // 7. MAIN ENTRANCE PIVOT DOOR & 90° ARCHITECTURAL SWING ARC
      const doorW = 2.0 * PXM;
      const doorX = toX(-W / 2 + W * 0.31);
      const doorY = ry0 + rh;
      ctx.fillStyle = PAPER_HEX;
      ctx.fillRect(doorX - 2, doorY - wallThick / 2 - 2, doorW + 4, wallThick + 4);
      ctx.strokeStyle = INK_HEX;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(doorX, doorY - wallThick / 2); ctx.lineTo(doorX, doorY + wallThick / 2);
      ctx.moveTo(doorX + doorW, doorY - wallThick / 2); ctx.lineTo(doorX + doorW, doorY + wallThick / 2);
      ctx.stroke();

      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(doorX, doorY);
      ctx.lineTo(doorX, doorY - doorW * 0.85);
      ctx.stroke();
      ctx.lineWidth = 0.9;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(doorX, doorY, doorW * 0.85, -Math.PI / 2, 0, false);
      ctx.stroke();
      ctx.setLineDash([]);

      // 8. ARCHITECTURAL DIMENSION STRINGS WITH 45° TICK MARKS
      const drawDimString = (axis, posPx, ticksMetres, witnessFromPx, sideSign) => {
        const T = 5;
        const p0 = (axis === 'x' ? toX(ticksMetres[0]) : toY(ticksMetres[0]));
        const p1 = (axis === 'x' ? toX(ticksMetres[ticksMetres.length - 1]) : toY(ticksMetres[ticksMetres.length - 1]));

        ctx.strokeStyle = INK_HEX;
        ctx.fillStyle = INK_HEX;
        ctx.lineWidth = 0.95;

        if (axis === 'x') {
          ctx.beginPath();
          ctx.moveTo(p0 - 8, posPx);
          ctx.lineTo(p1 + 8, posPx);
          ctx.stroke();

          ticksMetres.forEach((tm) => {
            const px = toX(tm);
            ctx.lineWidth = 1.35;
            ctx.beginPath();
            ctx.moveTo(px - T, posPx - T);
            ctx.lineTo(px + T, posPx + T);
            ctx.stroke();
            if (witnessFromPx !== null) {
              ctx.lineWidth = 0.65;
              ctx.strokeStyle = '#6e6a63';
              ctx.beginPath();
              ctx.moveTo(px, witnessFromPx);
              ctx.lineTo(px, posPx + sideSign * 6);
              ctx.stroke();
              ctx.strokeStyle = INK_HEX;
            }
          });

          for (let i = 0; i < ticksMetres.length - 1; i++) {
            const spanM = ticksMetres[i + 1] - ticksMetres[i];
            const midPx = (toX(ticksMetres[i]) + toX(ticksMetres[i + 1])) / 2;
            ctx.font = '600 10.5px "JetBrains Mono", "IBM Plex Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const label = `${spanM.toFixed(2)} m (${Math.round(spanM * 1000)} mm)`;
            const tw = ctx.measureText(label).width + 10;
            ctx.fillStyle = PAPER_HEX;
            ctx.fillRect(midPx - tw / 2, posPx - 8, tw, 16);
            ctx.fillStyle = INK_HEX;
            ctx.fillText(label, midPx, posPx);
          }
        } else {
          ctx.beginPath();
          ctx.moveTo(posPx, p0 - 8);
          ctx.lineTo(posPx, p1 + 8);
          ctx.stroke();

          ticksMetres.forEach((tm) => {
            const py = toY(tm);
            ctx.lineWidth = 1.35;
            ctx.beginPath();
            ctx.moveTo(posPx - T, py - T);
            ctx.lineTo(posPx + T, py + T);
            ctx.stroke();
            if (witnessFromPx !== null) {
              ctx.lineWidth = 0.65;
              ctx.strokeStyle = '#6e6a63';
              ctx.beginPath();
              ctx.moveTo(witnessFromPx, py);
              ctx.lineTo(posPx + sideSign * 6, py);
              ctx.stroke();
              ctx.strokeStyle = INK_HEX;
            }
          });

          for (let i = 0; i < ticksMetres.length - 1; i++) {
            const spanM = ticksMetres[i + 1] - ticksMetres[i];
            const midPy = (toY(ticksMetres[i]) + toY(ticksMetres[i + 1])) / 2;
            ctx.save();
            ctx.translate(posPx, midPy);
            ctx.rotate(-Math.PI / 2);
            ctx.font = '600 10.5px "JetBrains Mono", "IBM Plex Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const label = `${spanM.toFixed(2)} m (${Math.round(spanM * 1000)} mm)`;
            const tw = ctx.measureText(label).width + 10;
            ctx.fillStyle = PAPER_HEX;
            ctx.fillRect(-tw / 2, -8, tw, 16);
            ctx.fillStyle = INK_HEX;
            ctx.fillText(label, 0, 0);
            ctx.restore();
          }
        }
      };

      const z1X = R4(-W / 2 + W * 0.31);
      const z2X = R4(-W / 2 + W * 0.66);
      drawDimString('x', ry0 - 30, [-W / 2, z1X, z2X, W / 2], ry0 - wallThick / 2 - 4, -1);
      drawDimString('x', ry0 - 58, [-W / 2, W / 2], ry0 - 34, -1);

      drawDimString('y', rx0 - 32, [-D / 2, 0.2, D / 2], rx0 - wallThick / 2 - 4, -1);
      drawDimString('y', rx0 - 60, [-D / 2, D / 2], rx0 - 36, -1);

      // 9. ZONE ARCHITECTURAL LABELS (WITH OPAQUE PAPER PILL BACKGROUND)
      const drawZoneStamp = (xm, zm, code, title, wM, dM) => {
        const px = toX(xm);
        const py = toY(zm);
        ctx.save();
        ctx.textAlign = 'center';
        const line1 = `${code} · ${title}`;
        const line2 = `${wM.toFixed(2)} × ${dM.toFixed(2)} m  ·  ${(wM * dM).toFixed(1)} m²`;
        ctx.font = '700 10px "JetBrains Mono", "IBM Plex Mono", monospace';
        const w1 = ctx.measureText(line1).width;
        const boxW = Math.max(w1, 140) + 12;
        ctx.fillStyle = 'rgba(247, 245, 239, 0.92)';
        ctx.fillRect(px - boxW / 2, py - 18, boxW, 28);
        ctx.fillStyle = INK_HEX;
        ctx.fillText(line1, px, py - 8);
        ctx.font = '500 9px "JetBrains Mono", monospace';
        ctx.fillStyle = DIM_HEX;
        ctx.fillText(line2, px, py + 5);
        ctx.restore();
      };

      if (pType === 'pilates_studio') {
        drawZoneStamp(0, -D * 0.41, 'Z-01', isEN ? 'REFORMER PILATES MATRIX' : 'KHU GIƯỜNG TẬP REFORMER', W * 0.9, D * 0.55);
        drawZoneStamp(0, D * 0.08, 'Z-02', isEN ? 'CADILLAC & BARREL CORE' : 'KHU CADILLAC & THÙNG TẬP', W * 0.9, D * 0.45);
      } else if (pType === 'recovery_lounge') {
        drawZoneStamp(0, -D * 0.41, 'Z-01', isEN ? 'CRYOTHERAPY COLD PLUNGE BAY' : 'KHU BỒN NGÂM LẠNH CRYO', W * 0.9, D * 0.5);
        drawZoneStamp(0, D * 0.08, 'Z-02', isEN ? 'INFRARED SAUNA & COMPRESSION' : 'XÔNG HỒNG NGOẠI & NÉN KHÍ', W * 0.9, D * 0.5);
      } else {
        drawZoneStamp(-W / 2 + W * 0.155, -D / 2 + 0.55, 'Z-01', isEN ? 'CARDIO MATRIX' : 'KHU CARDIO', W * 0.31, D);
        drawZoneStamp(-W / 2 + W * 0.485, -D / 2 + 0.55, 'Z-02', isEN ? 'SELECTORIZED STRENGTH' : 'KHU TẠ KHỐI', W * 0.35, D * 0.52);
        drawZoneStamp(-W / 2 + W * 0.83, -D / 2 + 0.55, 'Z-03', isEN ? 'FREE WEIGHTS (20MM RUBBER)' : 'KHU TẠ TỰ DO', W * 0.34, D * 0.52);
        drawZoneStamp(-W / 2 + W * 0.485, 0.72, 'Z-04', isEN ? 'GLUTE & CORE HUB' : 'KHU MÔNG ĐÙI', W * 0.35, D * 0.48);
        drawZoneStamp(-W / 2 + W * 0.83, 0.72, 'Z-05', isEN ? 'SPRINT TURF TRACK' : 'THẢM CỎ FUNCTIONAL', W * 0.34, D * 0.48);
      }

      const walkY = toY(D / 2 - 0.85);
      ctx.save();
      ctx.strokeStyle = 'rgba(180, 83, 9, 0.45)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(rx0 + 20, walkY - 0.65 * PXM);
      ctx.lineTo(rx0 + rw - 20, walkY - 0.65 * PXM);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = CLEARANCE_AMBER;
      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        isEN ? '↔ MAIN CIRCULATION CORRIDOR (CLEARANCE ≥ 1,500 MM)' : '↔ HÀNH LANG LƯU THÔNG CHÍNH (RỘNG ≥ 1.500 MM)',
        rx0 + 28,
        walkY + 0.30 * PXM
      );
      ctx.restore();

      // 10. PRECISION ARCHITECTURAL CAD EQUIPMENT SYMBOLS
      placements.forEach((eq) => {
        const px = toX(eq.x);
        const py = toY(eq.z);
        const pw = eq.w * PXM;
        const pd = eq.d * PXM;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(eq.rotY || 0);

        ctx.strokeStyle = INK_HEX;
        ctx.fillStyle = PAPER_HEX;
        ctx.lineWidth = 1.25;

        if (eq.kind === 'treadmill') {
          const bufD = 1.15 * PXM;
          ctx.save();
          ctx.strokeStyle = 'rgba(180, 83, 9, 0.55)';
          ctx.lineWidth = 0.8;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(-pw / 2, pd / 2, pw, bufD);
          ctx.setLineDash([]);
          ctx.restore();

          ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
          ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
          ctx.fillStyle = '#e4e0d5';
          ctx.fillRect(-pw / 2 + 2, -pd / 2 + 2, pw - 4, pd * 0.22);
          ctx.strokeRect(-pw / 2 + 2, -pd / 2 + 2, pw - 4, pd * 0.22);
          ctx.fillStyle = '#eae6dc';
          ctx.fillRect(-pw * 0.36, -pd * 0.24, pw * 0.72, pd * 0.70);
          ctx.strokeRect(-pw * 0.36, -pd * 0.24, pw * 0.72, pd * 0.70);
          ctx.beginPath();
          ctx.moveTo(0, pd * 0.32); ctx.lineTo(0, -pd * 0.12);
          ctx.moveTo(-4, -pd * 0.04); ctx.lineTo(0, -pd * 0.12); ctx.lineTo(4, -pd * 0.04);
          ctx.stroke();
          ctx.fillStyle = INK_HEX;
          ctx.fillRect(-pw * 0.42, -pd * 0.30, pw * 0.84, pd * 0.10);
        } else if (eq.kind === 'elliptical' || eq.kind === 'bike' || eq.kind === 'rower') {
          ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
          ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
          ctx.beginPath();
          ctx.arc(0, -pd * 0.26, pw * 0.28, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeRect(-pw * 0.34, -pd * 0.05, pw * 0.22, pd * 0.42);
          ctx.strokeRect(pw * 0.12, -pd * 0.05, pw * 0.22, pd * 0.42);
          ctx.beginPath();
          ctx.moveTo(-pw * 0.4, -pd * 0.32); ctx.lineTo(pw * 0.4, -pd * 0.32);
          ctx.stroke();
        } else if (eq.kind === 'power_rack') {
          ctx.fillStyle = '#e9e4d8';
          ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
          ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
          ctx.fillStyle = PAPER_HEX;
          ctx.fillRect(-pw * 0.28, -pd / 2 + 3, pw * 0.56, pd - 6);
          ctx.strokeRect(-pw * 0.28, -pd / 2 + 3, pw * 0.56, pd - 6);
          ctx.fillStyle = INK_HEX;
          const post = 5;
          [[-pw * 0.34, -pd * 0.38], [pw * 0.34 - post, -pd * 0.38], [-pw * 0.34, pd * 0.15], [pw * 0.34 - post, pd * 0.15]].forEach(([ux, uy]) => {
            ctx.fillRect(ux, uy, post, post);
          });
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(-pw * 0.58, -pd * 0.12);
          ctx.lineTo(pw * 0.58, -pd * 0.12);
          ctx.stroke();
          [-pw * 0.48, -pw * 0.43, pw * 0.43, pw * 0.48].forEach((bx) => {
            ctx.fillRect(bx - 1.5, -pd * 0.26, 3, pd * 0.28);
          });
        } else if (eq.kind === 'reformer' || eq.kind === 'cadillac') {
          ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
          ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
          ctx.fillStyle = '#e5e0d4';
          ctx.fillRect(-pw * 0.40, -pd * 0.32, pw * 0.80, pd * 0.58);
          ctx.strokeRect(-pw * 0.40, -pd * 0.32, pw * 0.80, pd * 0.58);
          ctx.strokeRect(-pw * 0.16, -pd * 0.44, pw * 0.32, pd * 0.10);
          ctx.fillStyle = INK_HEX;
          ctx.fillRect(-pw * 0.28, -pd * 0.30, pw * 0.12, pd * 0.06);
          ctx.fillRect(pw * 0.16, -pd * 0.30, pw * 0.12, pd * 0.06);
          ctx.lineWidth = 0.8;
          for (let s = -2; s <= 2; s++) {
            ctx.beginPath();
            ctx.moveTo(s * (pw * 0.12), pd * 0.26);
            ctx.lineTo(s * (pw * 0.12), pd * 0.44);
            ctx.stroke();
          }
        } else if (eq.kind === 'cold_plunge' || eq.kind === 'sauna') {
          ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
          ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
          ctx.strokeRect(-pw * 0.38, -pd * 0.38, pw * 0.76, pd * 0.76);
          for (let wy = -pd * 0.25; wy <= pd * 0.25; wy += 7) {
            ctx.beginPath();
            ctx.moveTo(-pw * 0.25, wy);
            ctx.lineTo(pw * 0.25, wy);
            ctx.stroke();
          }
        } else if (eq.kind === 'dumbbell_rack') {
          ctx.fillStyle = '#e2ddd1';
          ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
          ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
          ctx.fillStyle = INK_HEX;
          for (let dx = -pw * 0.42; dx <= pw * 0.42; dx += pw * 0.12) {
            ctx.fillRect(dx - 2, -pd * 0.32, 4, pd * 0.64);
          }
        } else {
          ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
          ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
          ctx.fillStyle = INK_HEX;
          ctx.fillRect(-pw * 0.42, -pd * 0.42, pw * 0.32, pd * 0.26);
          ctx.fillStyle = '#e4e0d5';
          ctx.fillRect(-pw * 0.22, -pd * 0.05, pw * 0.44, pd * 0.38);
          ctx.strokeRect(-pw * 0.22, -pd * 0.05, pw * 0.44, pd * 0.38);
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.arc(0, pd * 0.12, pw * 0.42, -Math.PI * 0.75, -Math.PI * 0.25);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();

        ctx.save();
        ctx.font = '700 8.5px "JetBrains Mono", "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const tag = (eq.sku || '').substring(0, 11);
        const tw = ctx.measureText(tag).width + 6;
        ctx.fillStyle = 'rgba(241, 238, 230, 0.90)';
        ctx.fillRect(px - tw / 2, py - 5, tw, 11);
        ctx.fillStyle = INK_HEX;
        ctx.fillText(tag, px, py + 0.5);
        ctx.restore();
      });

      // 11. CASA SERRA ARCHITECTURAL TITLE BLOCK (RIGHT PANEL)
      const tbX = CW - 388;
      const tbY = B_IN + 14;
      const tbW = 342;
      const tbH = CH - (B_IN + 14) * 2;

      ctx.fillStyle = PAPER_HEX;
      ctx.fillRect(tbX, tbY, tbW, tbH);
      ctx.strokeStyle = INK_HEX;
      ctx.lineWidth = 2.0;
      ctx.strokeRect(tbX, tbY, tbW, tbH);

      const drawRule = (y) => {
        ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(tbX, y); ctx.lineTo(tbX + tbW, y); ctx.stroke();
      };
      const metaLabel = (txt, x, y) => {
        ctx.fillStyle = '#6e6a63';
        ctx.font = '600 9.5px "JetBrains Mono", "IBM Plex Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(txt, x, y);
      };
      const metaValue = (txt, x, y, size = 13, bold = true) => {
        ctx.fillStyle = INK_HEX;
        ctx.font = `${bold ? '700' : '500'} ${size}px "JetBrains Mono", "IBM Plex Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(txt, x, y);
      };

      metaLabel(isEN ? 'ARCHITECTURAL ENGINEERING' : 'ĐƠN VỊ THIẾT KẾ & CUNG ỨNG', tbX + 16, tbY + 24);
      ctx.fillStyle = INK_HEX;
      ctx.font = '700 22px Georgia, "Instrument Serif", serif';
      ctx.fillText('Attivo · Lintel CAD', tbX + 16, tbY + 52);
      metaValue(isEN ? 'Commercial Fitness Space Planning' : 'Quy Hoạch Không Gian Gym Chuẩn Quốc Tế', tbX + 16, tbY + 72, 10.5, false);
      drawRule(tbY + 88);

      metaLabel(isEN ? 'PROJECT / CLIENT' : 'DỰ ÁN / KHÁCH HÀNG', tbX + 16, tbY + 110);
      metaValue((p.clientName || 'ATTIVO COMMERCIAL PROJECT').toUpperCase().substring(0, 26), tbX + 16, tbY + 130, 13, true);
      metaLabel(isEN ? 'DRAWING TITLE' : 'TÊN BẢN VẼ', tbX + 16, tbY + 158);
      const typeMap = {
        commercial_gym: isEN ? 'GROUND FLOOR BIOMECHANICAL PLAN' : 'MẶT BẰNG BỐ TRÍ GYM THƯƠNG MẠI',
        hotel_resort: isEN ? '5-STAR HOTEL WELLNESS FLOOR PLAN' : 'MẶT BẰNG FITNESS RESORT 5 SAO',
        private_villa: isEN ? 'PRIVATE VILLA GYM SUITE PLAN' : 'MẶT BẰNG PHÒNG GYM BIỆT THỰ',
        boutique_studio: isEN ? 'BOUTIQUE PT STUDIO FLOOR PLAN' : 'MẶT BẰNG BOUTIQUE PT STUDIO',
        pilates_studio: isEN ? 'REFORMER PILATES STUDIO PLAN' : 'MẶT BẰNG STUDIO PILATES REFORMER',
        recovery_lounge: isEN ? 'BIOHACKING & RECOVERY LOUNGE PLAN' : 'MẶT BẰNG RECOVERY & BIOHACKING'
      };
      metaValue(typeMap[pType] || 'ARCHITECTURAL FLOOR PLAN', tbX + 16, tbY + 178, 12, true);
      drawRule(tbY + 196);

      const colMid = tbX + tbW * 0.52;
      ctx.beginPath(); ctx.moveTo(colMid, tbY + 196); ctx.lineTo(colMid, tbY + 320); ctx.stroke();
      drawRule(tbY + 258);
      drawRule(tbY + 320);

      metaLabel(isEN ? 'FLOOR AREA' : 'DIỆN TÍCH SÀN', tbX + 16, tbY + 216);
      metaValue(`${area} m² (${W}×${D}m)`, tbX + 16, tbY + 240, 13.5, true);
      metaLabel(isEN ? 'SECTION CUT' : 'CAO ĐỘ MẶT CẮT', colMid + 14, tbY + 216);
      metaValue('+1.20 m (ISO)', colMid + 14, tbY + 240, 13.5, true);

      metaLabel(isEN ? 'TOTAL UNITS' : 'TỔNG THIẾT BỊ', tbX + 16, tbY + 278);
      metaValue(`${placements.length} UNITS`, tbX + 16, tbY + 302, 13.5, true);
      metaLabel(isEN ? 'SHEET / SCALE' : 'KÝ HIỆU / TỶ LỆ', colMid + 14, tbY + 278);
      metaValue('A-101 · 1:100', colMid + 14, tbY + 302, 13.5, true);

      metaLabel(isEN ? 'EQUIPMENT SCHEDULE (ON SHEET)' : 'BẢNG KÊ THIẾT BỊ TRÊN BẢN VẼ', tbX + 16, tbY + 344);
      const summaryMap = {};
      placements.forEach((eq) => {
        const k = eq.sku || eq.kind;
        if (!summaryMap[k]) summaryMap[k] = { sku: eq.sku, brand: eq.brand, count: 0 };
        summaryMap[k].count++;
      });
      const schedRows = Object.values(summaryMap).slice(0, 11);
      let sy = tbY + 368;
      schedRows.forEach((r, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? 'rgba(23,23,26,0.035)' : 'transparent';
        ctx.fillRect(tbX + 12, sy - 12, tbW - 24, 20);
        ctx.fillStyle = INK_HEX;
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${String(idx + 1).padStart(2, '0')}. ${r.sku}`, tbX + 18, sy);
        ctx.fillStyle = DIM_HEX;
        ctx.font = '500 9.5px "JetBrains Mono", monospace';
        ctx.fillText(r.brand, tbX + 165, sy);
        ctx.fillStyle = INK_HEX;
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`×${r.count}`, tbX + tbW - 18, sy);
        sy += 21;
      });

      drawRule(tbY + tbH - 185);

      metaLabel(isEN ? 'BIOMECHANICAL CLEARANCE AUDIT' : 'KIỂM ĐỊNH KHOẢNG CÁCH AN TOÀN', tbX + 16, tbY + tbH - 163);
      ctx.fillStyle = '#065f46';
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(isEN ? '✓ REAR TREADMILL ESCAPE ≥ 1,500 MM' : '✓ ĐUÔI MÁY CHẠY BỘ ≥ 1.500 MM', tbX + 16, tbY + tbH - 142);
      ctx.fillText(isEN ? '✓ MAIN WALKWAY CORRIDOR ≥ 1,500 MM' : '✓ HÀNH LANG LƯU THÔNG ≥ 1.500 MM', tbX + 16, tbY + tbH - 124);
      ctx.fillText(isEN ? '✓ LATERAL MACHINE SPACING ≥ 500 MM' : '✓ KHOẢNG CÁCH GIỮA MÁY ≥ 500 MM', tbX + 16, tbY + tbH - 106);

      drawRule(tbY + tbH - 88);

      const nCx = tbX + 46;
      const nCy = tbY + tbH - 44;
      const nR = 22;
      ctx.strokeStyle = INK_HEX;
      ctx.fillStyle = INK_HEX;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(nCx, nCy, nR, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(nCx, nCy + nR * 1.15); ctx.lineTo(nCx, nCy - nR * 1.15); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(nCx, nCy - nR * 1.15);
      ctx.lineTo(nCx - 8, nCy);
      ctx.lineTo(nCx, nCy);
      ctx.closePath();
      ctx.fill();
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillText('N', nCx + 10, nCy - 10);

      const sbX = tbX + 98;
      const sbY = tbY + tbH - 42;
      metaLabel(isEN ? 'GRAPHIC SCALE (METRES)' : 'THƯỚC TỶ LỆ ĐỒ HỌA (MÉT)', sbX, sbY - 16);
      const barUnitPx = Math.min(48, Math.max(26, Math.round(PXM)));
      ctx.lineWidth = 1.4;
      ctx.strokeRect(sbX, sbY, barUnitPx * 4, 9);
      for (let i = 0; i < 4; i++) {
        if (i % 2 === 0) {
          ctx.fillRect(sbX + i * barUnitPx, sbY, barUnitPx, 9);
        }
        ctx.font = '600 9.5px "JetBrains Mono", monospace';
        ctx.fillText(`${i}m`, sbX + i * barUnitPx - 2, sbY + 22);
      }
      ctx.fillText('4m', sbX + 4 * barUnitPx - 6, sbY + 22);
    },

    exportPNG() {
      const canvas = document.getElementById('aiFloorplanCanvas');
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `Attivo_Architectural_Sheet_A101_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  // ==========================================================================
  // 4. CASA SERRA 3D UNIFIED ENGINE (BLUEPRINT SHEET -> RISING WALLS -> 3D WALK)
  // ==========================================================================
  const AttivoVisualizer3D = {
    state: {
      progress: 0.52,
      playing: false,
      animId: null,
      orbitActive: false,
      cutPlane: null,
      shaderUniforms: null,
      camera: null,
      renderer: null,
      scene: null,
      controls: null,
      wallGroup: null,
      doorGroup: null,
      roomDims: { W: 20, D: 13 }
    },

    draw3D(proposal) {
      return this.render(proposal);
    },

    makeProceduralTextures(maxAniso) {
      const makeTex = (w, h, drawFn) => {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        drawFn(c.getContext('2d'), w, h);
        const t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = maxAniso || 4;
        return t;
      };

      const oakTex = makeTex(512, 512, (g, w, h) => {
        g.fillStyle = '#b98b56';
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 400; i++) {
          g.fillStyle = i % 2 === 0 ? 'rgba(130, 88, 42, 0.14)' : 'rgba(215, 175, 125, 0.12)';
          g.fillRect(Math.random() * w, 0, 1 + Math.random() * 3, h);
        }
        g.strokeStyle = 'rgba(70, 45, 20, 0.35)';
        g.lineWidth = 2;
        for (let x = 0; x < w; x += 64) {
          g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke();
        }
      });
      oakTex.repeat.set(4, 4);

      const rubberTex = makeTex(512, 512, (g, w, h) => {
        g.fillStyle = '#24272c';
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 2200; i++) {
          const r = Math.random();
          g.fillStyle = r < 0.7 ? 'rgba(255,255,255,0.08)' : r < 0.9 ? 'rgba(56,189,248,0.14)' : 'rgba(245,158,11,0.12)';
          g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
        }
        g.strokeStyle = 'rgba(15, 17, 20, 0.65)';
        g.lineWidth = 2;
        g.strokeRect(0, 0, w / 2, h / 2);
        g.strokeRect(w / 2, h / 2, w / 2, h / 2);
      });
      rubberTex.repeat.set(8, 6);

      const plasterTex = makeTex(512, 512, (g, w, h) => {
        g.fillStyle = '#ece8df';
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 900; i++) {
          g.fillStyle = i % 2 === 0 ? 'rgba(210, 202, 188, 0.16)' : 'rgba(255, 252, 245, 0.16)';
          g.fillRect(Math.random() * w, Math.random() * h, 18 + Math.random() * 40, 12 + Math.random() * 30);
        }
      });
      plasterTex.repeat.set(3, 2);

      return { oakTex, rubberTex, plasterTex };
    },

    // Build True 3D Floor-Embedded Architectural Annotations (Casa Larga sheet.js)
    build3DSheetOverlay(W, D, p, isEN, maxAniso) {
      const grp = new THREE.Group();
      const segs = [];
      const addSeg = (x0, z0, x1, z1, y = 0.015) => {
        segs.push(x0, y, z0, x1, y, z1);
      };

      const hw = W / 2, hd = D / 2;

      // 1. 1.20m Floor Joint Grid Lines in 3D
      const gridSegs = [];
      for (let x = -hw + 1.2; x < hw - 0.1; x += 1.2) {
        gridSegs.push(x, 0.012, -hd, x, 0.012, hd);
      }
      for (let z = -hd + 1.2; z < hd - 0.1; z += 1.2) {
        gridSegs.push(-hw, 0.012, z, hw, 0.012, z);
      }
      const gridGeo = new THREE.BufferGeometry();
      gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridSegs, 3));
      grp.add(new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.35 })));

      // 2. Exterior Dimension Strings with 45° Architectural Ticks on the Archival Paper
      const addDim3D = (axis, pos, ticks, witnessFrom) => {
        const T = 0.25;
        const Y = 0.02;
        if (axis === 'x') {
          addSeg(ticks[0] - 0.4, pos, ticks[ticks.length - 1] + 0.4, pos, Y);
          ticks.forEach((tx) => {
            addSeg(tx - T, pos - T, tx + T, pos + T, Y);
            addSeg(tx, witnessFrom, tx, pos - 0.2, Y);
          });
          for (let i = 0; i < ticks.length - 1; i++) {
            const d = ticks[i + 1] - ticks[i];
            addTextPlane(`${d.toFixed(2)} m`, (ticks[i] + ticks[i + 1]) / 2, pos - 0.55, Y, 0, 0.36);
          }
        } else {
          addSeg(pos, ticks[0] - 0.4, pos, ticks[ticks.length - 1] + 0.4, Y);
          ticks.forEach((tz) => {
            addSeg(pos - T, tz - T, pos + T, tz + T, Y);
            addSeg(witnessFrom, tz, pos - 0.2, tz, Y);
          });
          for (let i = 0; i < ticks.length - 1; i++) {
            const d = ticks[i + 1] - ticks[i];
            addTextPlane(`${d.toFixed(2)} m`, pos - 0.55, (ticks[i] + ticks[i + 1]) / 2, Y, Math.PI / 2, 0.36);
          }
        }
      };

      const addTextPlane = (text, x, z, y = 0.02, rotZ = 0, capM = 0.42, subText = '') => {
        const PXM = 120;
        const c = document.createElement('canvas');
        const g = c.getContext('2d');
        const fontPx = Math.round(capM * PXM);
        g.font = `700 ${fontPx}px "JetBrains Mono", "IBM Plex Mono", monospace`;
        const w1 = g.measureText(text).width;
        let w2 = 0;
        if (subText) {
          g.font = `500 ${Math.round(fontPx * 0.72)}px "JetBrains Mono", monospace`;
          w2 = g.measureText(subText).width;
        }
        c.width = Math.ceil(Math.max(w1, w2) + 28);
        c.height = subText ? Math.ceil(fontPx * 2.4) : Math.ceil(fontPx * 1.5);

        g.fillStyle = 'rgba(241, 238, 230, 0.88)';
        g.fillRect(0, 0, c.width, c.height);
        g.strokeStyle = INK_HEX;
        g.lineWidth = 2;
        g.strokeRect(1, 1, c.width - 2, c.height - 2);

        g.fillStyle = INK_HEX;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.font = `700 ${fontPx}px "JetBrains Mono", "IBM Plex Mono", monospace`;
        g.fillText(text, c.width / 2, subText ? c.height * 0.36 : c.height * 0.5);
        if (subText) {
          g.fillStyle = DIM_HEX;
          g.font = `600 ${Math.round(fontPx * 0.70)}px "JetBrains Mono", monospace`;
          g.fillText(subText, c.width / 2, c.height * 0.74);
        }

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = maxAniso || 4;
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(c.width / PXM, c.height / PXM),
          new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
        );
        mesh.rotation.set(-Math.PI / 2, 0, rotZ);
        mesh.position.set(x, y, z);
        grp.add(mesh);
      };

      const z1X = R4(-hw + W * 0.31);
      const z2X = R4(-hw + W * 0.66);
      addDim3D('x', -hd - 1.35, [-hw, z1X, z2X, hw], -hd - 0.4);
      addDim3D('x', -hd - 2.65, [-hw, hw], -hd - 1.6);
      addDim3D('z', -hw - 1.35, [-hd, hd], -hw - 0.4);

      // 3. Door Swing Arc in 3D at South Entrance
      const doorX = -hw + W * 0.31;
      const doorZ = hd;
      const arcR = 1.75;
      for (let i = 0; i < 18; i++) {
        const a0 = (-Math.PI / 2) + (Math.PI / 2) * (i / 18);
        const a1 = (-Math.PI / 2) + (Math.PI / 2) * ((i + 1) / 18);
        addSeg(doorX + Math.cos(a0) * arcR, doorZ + Math.sin(a0) * arcR, doorX + Math.cos(a1) * arcR, doorZ + Math.sin(a1) * arcR, 0.02);
      }

      // 4. Zone Floor Stamps in 3D
      addTextPlane('Z-01 · CARDIO MATRIX', -hw + W * 0.155, -hd + 0.85, 0.022, 0, 0.34, `${(W * 0.31).toFixed(1)} × ${D.toFixed(1)} m`);
      addTextPlane('Z-02 · SELECTORIZED', -hw + W * 0.485, -hd + 0.85, 0.022, 0, 0.34, `${(W * 0.35).toFixed(1)} × ${(D * 0.52).toFixed(1)} m`);
      addTextPlane('Z-03 · FREE WEIGHTS', -hw + W * 0.83, -hd + 0.85, 0.022, 0, 0.34, `20MM SHOCK RUBBER`);

      // Double Architectural Border around 3D Sheet
      const bx0 = -hw - 4.2, bx1 = hw + 4.2, bz0 = -hd - 4.0, bz1 = hd + 3.2;
      [0, 0.18].forEach((k) => {
        addSeg(bx0 + k, bz0 + k, bx1 - k, bz0 + k, 0.01);
        addSeg(bx1 - k, bz0 + k, bx1 - k, bz1 - k, 0.01);
        addSeg(bx1 - k, bz1 - k, bx0 + k, bz1 - k, 0.01);
        addSeg(bx0 + k, bz1 - k, bx0 + k, bz0 + k, 0.01);
      });

      const segGeo = new THREE.BufferGeometry();
      segGeo.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
      grp.add(new THREE.LineSegments(segGeo, new THREE.LineBasicMaterial({ color: new THREE.Color(INK_HEX) })));

      return grp;
    },

    makeInkAwareMaterial(baseProps, sharedU, { backInk = false, glass = false } = {}) {
      const mat = new THREE.MeshStandardMaterial({
        ...baseProps,
        side: THREE.DoubleSide,
        clippingPlanes: [sharedU.cutPlane],
        polygonOffset: !glass,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
      });

      const ownU = {
        uBackInk: { value: backInk ? 1.0 : 0.0 },
        uGlass: { value: glass ? 1.0 : 0.0 }
      };

      mat.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, sharedU.uniforms, ownU);
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', `#include <common>\nvarying vec3 vWp;\nvarying vec3 vWn;`)
          .replace('#include <fog_vertex>', `#include <fog_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWn = normalize(mat3(modelMatrix) * objectNormal);`);

        sh.fragmentShader = sh.fragmentShader
          .replace(
            '#include <common>',
            `#include <common>
            varying vec3 vWp;
            varying vec3 vWn;
            uniform vec3 uPaper;
            uniform vec3 uInkCol;
            uniform vec4 uRoomBounds;
            uniform float uSweepX;
            uniform float uInkBlend;
            uniform float uBackInk;
            uniform float uGlass;
            
            float calcRoomAO(vec3 p, vec3 nn) {
              vec4 b = uRoomBounds;
              float R = 1.25;
              float occ = 0.0;
              occ += (1.0 - abs(nn.x)) * (exp(-max(p.x - b.x, 0.0) / R) + exp(-max(b.z - p.x, 0.0) / R));
              occ += (1.0 - abs(nn.z)) * (exp(-max(p.z - b.y, 0.0) / R) + exp(-max(b.w - p.z, 0.0) / R));
              occ += (1.0 - abs(nn.y)) * exp(-max(p.y, 0.0) / 0.9);
              return clamp(1.0 - 0.24 * occ, 0.42, 1.0);
            }`
          )
          .replace(
            '#include <aomap_fragment>',
            `#include <aomap_fragment>
            {
              vec3 nnA = normalize(vWn) * (gl_FrontFacing ? 1.0 : -1.0);
              float rao = calcRoomAO(vWp, nnA);
              reflectedLight.indirectDiffuse *= rao;
              reflectedLight.directDiffuse *= mix(1.0, rao, 0.35);
            }`
          )
          .replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
            {
              vec3 nnI = normalize(vWn) * (gl_FrontFacing ? 1.0 : -1.0);
              float sweepFactor = smoothstep(uSweepX - 2.2, uSweepX + 1.2, vWp.x + vWp.z * 0.35);
              float ink = clamp(max(uInkBlend, sweepFactor), 0.0, 1.0);
              if (uGlass > 0.5) {
                gl_FragColor.a *= (1.0 - ink * 0.85);
              } else if (uBackInk > 0.5 && !gl_FrontFacing) {
                gl_FragColor.rgb = uInkCol;
              } else {
                vec3 wash = uPaper * (1.0 - 0.055 * (abs(nnI.x) + 0.6 * abs(nnI.z)));
                gl_FragColor.rgb = mix(gl_FragColor.rgb, wash, ink);
              }
            }`
          );
      };
      mat.customProgramCacheKey = () => `casa-ink-${backInk ? 'B' : ''}-${glass ? 'G' : ''}`;
      return mat;
    },

    render(proposal) {
      const container = document.getElementById('ai3dContainer');
      if (!container) return;

      const isEN = (typeof state === 'undefined' || state.appLang === 'en');
      if (typeof THREE === 'undefined') {
        container.innerHTML = `<div class="p-8 text-center text-white">${isEN ? 'Loading Three.js WebGL Engine...' : 'Đang tải động cơ WebGL 3D...'}</div>`;
        return;
      }

      if (this.state.animId) cancelAnimationFrame(this.state.animId);
      container.innerHTML = '';

      const p = proposal || (global.AttivoAiAdvisor && global.AttivoAiAdvisor.currentProposal) || {
        area: 250,
        projectType: 'commercial_gym',
        clientName: 'ATTIVO INTERNATIONAL',
        items: []
      };

      const { W, D, area, pType, placements } = layoutEquipmentInMetres(p);
      this.state.roomDims = { W, D };

      const cw = container.clientWidth || 960;
      const ch = container.clientHeight || 540;

      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(cw, ch);
      renderer.localClippingEnabled = true;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if ('toneMapping' in renderer && THREE.ACESFilmicToneMapping) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
      }
      container.appendChild(renderer.domElement);

      // Mount Casa Serra Interactive HUD & Scrubber Overlay
      const hudOverlay = document.createElement('div');
      hudOverlay.className = 'absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/90 via-slate-900/75 to-transparent text-white flex flex-col gap-2 pointer-events-auto select-none';
      hudOverlay.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
          <div class="flex items-center gap-1.5 flex-wrap">
            <button id="btnCasaPlayMorph" type="button" class="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold flex items-center gap-1 shadow-xs transition cursor-pointer">
              <span class="material-symbols-outlined text-sm" id="icoCasaPlay">play_arrow</span>
              <span id="lblCasaPlay">${isEN ? 'Play Casa Serra Walk' : 'Chạy Chuyển Cảnh 2D → 3D'}</span>
            </button>
            <button onclick="AttivoVisualizer3D.setStop(0.0)" type="button" class="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-600 transition cursor-pointer">
              01 · ${isEN ? '2D Blueprint (+1.2m)' : 'Bản Vẽ 2D (+1.2m)'}
            </button>
            <button onclick="AttivoVisualizer3D.setStop(0.28)" type="button" class="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-600 transition cursor-pointer">
              02 · ${isEN ? 'Walls Rising' : 'Tường Mọc Lên'}
            </button>
            <button onclick="AttivoVisualizer3D.setStop(0.55)" type="button" class="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/50 transition cursor-pointer">
              03 · ${isEN ? 'Axonometric Cutaway' : 'Phối Cảnh Cắt Lớp'}
            </button>
            <button onclick="AttivoVisualizer3D.setStop(0.95)" type="button" class="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border border-emerald-500/50 transition cursor-pointer">
              04 · ${isEN ? 'Interior Walk' : 'Đi Bộ Trong Phòng'}
            </button>
          </div>
          <div class="flex items-center gap-3 text-[10px] text-slate-300 bg-slate-900/90 px-2.5 py-1 rounded border border-slate-700">
            <span>LENS: <b id="hudCasaLens" class="text-amber-400">35.0°</b></span>
            <span>CUT: <b id="hudCasaCut" class="text-cyan-400">+1.85 m</b></span>
            <span>MODE: <b id="hudCasaMode" class="text-emerald-400">PBR + CAD</b></span>
          </div>
        </div>
        <div class="flex items-center gap-3 px-1">
          <span class="text-[10px] font-mono text-slate-300 uppercase tracking-wider">${isEN ? 'Sheet A-101 (2D)' : 'Bản Vẽ 2D'}</span>
          <input id="rngCasaScrub" type="range" min="0" max="100" value="55" class="flex-1 accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer" />
          <span class="text-[10px] font-mono text-amber-300 uppercase tracking-wider">${isEN ? 'Eye-Level 3D Walk' : 'Đi Bộ 3D'}</span>
        </div>
      `;
      container.appendChild(hudOverlay);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(PAPER_HEX);

      const camera = new THREE.PerspectiveCamera(35, cw / ch, 0.1, 2000);
      const cutPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 5.6);

      const sharedU = {
        cutPlane,
        uniforms: {
          uPaper: { value: new THREE.Color(PAPER_HEX) },
          uInkCol: { value: new THREE.Color(INK_HEX) },
          uRoomBounds: { value: new THREE.Vector4(-W / 2, -D / 2, W / 2, D / 2) },
          uSweepX: { value: W },
          uInkBlend: { value: 0.0 }
        }
      };

      this.state.scene = scene;
      this.state.camera = camera;
      this.state.renderer = renderer;
      this.state.cutPlane = cutPlane;
      this.state.shaderUniforms = sharedU.uniforms;

      let controls = null;
      if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.maxPolarAngle = Math.PI / 2.02;
        controls.minDistance = 2.5;
        controls.maxDistance = 400;
        controls.addEventListener('start', () => {
          this.state.orbitActive = true;
          this.state.playing = false;
        });
        this.state.controls = controls;
      }

      // Archival Paper Ground Plane + 3D Sheet Overlay (Dimension Strings, 45° Ticks, Zone Stamps)
      const paperGround = new THREE.Mesh(
        new THREE.PlaneGeometry(500, 500),
        new THREE.MeshBasicMaterial({ color: PAPER_HEX })
      );
      paperGround.rotation.x = -Math.PI / 2;
      paperGround.position.y = GROUND_Y;
      scene.add(paperGround);

      const sheetOverlay3D = this.build3DSheetOverlay(W, D, p, isEN, renderer.capabilities.getMaxAnisotropy());
      scene.add(sheetOverlay3D);

      const texs = this.makeProceduralTextures(renderer.capabilities.getMaxAnisotropy());
      const isWood = (pType === 'pilates_studio' || pType === 'recovery_lounge');

      const M = {
        poche: new THREE.MeshBasicMaterial({ color: new THREE.Color(INK_HEX) }), // Solid Architectural Black Cut-Wall Cap
        wall: this.makeInkAwareMaterial({ map: texs.plasterTex, color: 0xf4f0e6, roughness: 0.92 }, sharedU, { backInk: true }),
        oak: this.makeInkAwareMaterial({ map: texs.oakTex, color: 0xd4a373, roughness: 0.65 }, sharedU, { backInk: true }),
        floor: this.makeInkAwareMaterial({
          map: isWood ? texs.oakTex : texs.rubberTex,
          color: isWood ? 0xc89666 : 0xffffff,
          roughness: isWood ? 0.55 : 0.85
        }, sharedU, { backInk: true }),
        turf: this.makeInkAwareMaterial({ color: 0x059669, roughness: 0.9 }, sharedU),
        steel: this.makeInkAwareMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.78 }, sharedU),
        chrome: this.makeInkAwareMaterial({ color: 0xe2e8f0, roughness: 0.18, metalness: 0.92 }, sharedU),
        padBlack: this.makeInkAwareMaterial({ color: 0x0f172a, roughness: 0.55 }, sharedU),
        padAmber: this.makeInkAwareMaterial({ color: 0xd97706, roughness: 0.5 }, sharedU),
        screen: this.makeInkAwareMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.75, roughness: 0.2 }, sharedU),
        plateRed: this.makeInkAwareMaterial({ color: 0xdc2626, roughness: 0.4 }, sharedU),
        plateBlue: this.makeInkAwareMaterial({ color: 0x2563eb, roughness: 0.4 }, sharedU),
        water: this.makeInkAwareMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.1 }, sharedU),
        glass: this.makeInkAwareMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.24, roughness: 0.08 }, sharedU, { glass: true }),
        mirror: this.makeInkAwareMaterial({ color: 0xcbd5e1, roughness: 0.06, metalness: 0.94 }, sharedU)
      };

      const inkLineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(INK_HEX),
        clippingPlanes: [cutPlane]
      });

      const WT = 0.32; // 320mm structural wall thickness
      const WH = 3.40; // 3.40m wall height
      const hw = W / 2, hd = D / 2;

      // A. Floor Slab (Always at y = 0)
      const floorSlab = new THREE.Mesh(new THREE.BoxGeometry(W + WT * 2, 0.15, D + WT * 2), M.floor);
      floorSlab.position.set(0, -0.075, 0);
      floorSlab.receiveShadow = true;
      scene.add(floorSlab);

      // B. Watertight Structural Walls via RectSolid (With Solid Black Poché Top Section Cap!)
      const S = new RectSolid();
      S.add(-hw - WT, 0, -hd - WT, hw + WT, WH, -hd); // North wall
      S.add(-hw - WT, 0, hd, hw + WT, WH, hd + WT);   // South wall
      S.add(-hw - WT, 0, -hd, -hw, WH, hd);           // West wall
      S.add(hw, 0, -hd, hw + WT, WH, hd);             // East wall

      if (!isWood) {
        S.add(-hw + W * 0.66 - 0.10, 0, -hd, -hw + W * 0.66 + 0.10, WH * 0.82, -0.4);
      }

      // Window & Door Boolean Cutouts
      S.sub(-hw - WT - 0.1, 0.55, -hd + D * 0.12, -hw + 0.1, 2.95, hd - D * 0.12);
      S.sub(-hw + W * 0.15, 0.85, -hd - WT - 0.1, -hw + W * 0.43, 2.85, -hd + 0.1);
      const doorX0 = -hw + W * 0.31;
      S.sub(doorX0, 0, hd - 0.1, doorX0 + 2.0, 2.55, hd + WT + 0.1);

      const shell = S.build((cx, cy, cz, nx, ny, nz) => {
        // Top horizontal cut surface of every wall is painted SOLID ARCHITECTURAL BLACK POCHÉ!
        if (ny > 0.7 && cy > 0.2) return 'poche';
        if (Math.abs(nx) > 0.5 && cx > hw - 0.1) return 'oak';
        return 'wall';
      });

      const wallGroup = new THREE.Group();
      for (const k in shell.geos) {
        const m = new THREE.Mesh(shell.geos[k], M[k] || M.wall);
        m.castShadow = true;
        m.receiveShadow = true;
        wallGroup.add(m);
      }
      const edgeGeo = new THREE.BufferGeometry();
      edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(shell.edges, 3));
      wallGroup.add(new THREE.LineSegments(edgeGeo, inkLineMat));

      const glassPane = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.4, D * 0.76), M.glass);
      glassPane.position.set(-hw - WT / 2, 1.75, 0);
      wallGroup.add(glassPane);

      const mirrorPane = new THREE.Mesh(new THREE.BoxGeometry(W * 0.45, 2.1, 0.03), M.mirror);
      mirrorPane.position.set(hw * 0.35, 1.45, -hd + 0.02);
      wallGroup.add(mirrorPane);

      const doorGroup = new THREE.Group();
      doorGroup.position.set(doorX0, 0, hd + WT / 2);
      const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.85, 2.5, 0.06), M.oak);
      doorLeaf.position.set(0.925, 1.25, 0);
      doorLeaf.castShadow = true;
      doorGroup.add(doorLeaf);
      wallGroup.add(doorGroup);

      scene.add(wallGroup);
      this.state.wallGroup = wallGroup;
      this.state.doorGroup = doorGroup;

      // C. Athletic Sprint Turf Track + Equipment Group
      const eqMasterGroup = new THREE.Group();
      if (!isWood) {
        const turfW = W * 0.30;
        const turfD = D * 0.32;
        const turfMesh = new THREE.Mesh(new THREE.BoxGeometry(turfW, 0.025, turfD), M.turf);
        turfMesh.position.set(hw - turfW / 2 - 0.8, 0.015, hd - turfD / 2 - 1.2);
        turfMesh.receiveShadow = true;
        eqMasterGroup.add(turfMesh);
      }

      const addPart = (grp, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        if (rx || ry || rz) m.rotation.set(rx, ry, rz);
        m.castShadow = true;
        m.receiveShadow = true;
        grp.add(m);

        const eg = new THREE.EdgesGeometry(geo, 28);
        const lines = new THREE.LineSegments(eg, inkLineMat);
        lines.position.copy(m.position);
        lines.rotation.copy(m.rotation);
        grp.add(lines);
      };

      const contactMat = new THREE.MeshBasicMaterial({
        color: 0x17171a,
        transparent: true,
        opacity: 0.22,
        depthWrite: false
      });

      placements.forEach((eq) => {
        const grp = new THREE.Group();
        grp.position.set(eq.x, 0, eq.z);
        grp.rotation.y = eq.rotY || 0;

        const cShadow = new THREE.Mesh(new THREE.PlaneGeometry(eq.w * 1.08, eq.d * 1.08), contactMat);
        cShadow.rotation.x = -Math.PI / 2;
        cShadow.position.y = 0.012;
        grp.add(cShadow);

        if (eq.kind === 'treadmill') {
          addPart(grp, new THREE.BoxGeometry(0.92, 0.22, 2.05), M.steel, 0, 0.11, 0);
          addPart(grp, new THREE.BoxGeometry(0.62, 0.02, 1.55), M.padBlack, 0, 0.23, 0.18);
          addPart(grp, new THREE.BoxGeometry(0.88, 0.28, 0.42), M.steel, 0, 0.26, -0.78);
          addPart(grp, new THREE.BoxGeometry(0.08, 1.25, 0.10), M.steel, -0.38, 0.72, -0.62, -0.12, 0, 0);
          addPart(grp, new THREE.BoxGeometry(0.08, 1.25, 0.10), M.steel, 0.38, 0.72, -0.62, -0.12, 0, 0);
          addPart(grp, new THREE.BoxGeometry(0.86, 0.42, 0.08), M.steel, 0, 1.38, -0.72, -0.35, 0, 0);
          addPart(grp, new THREE.BoxGeometry(0.74, 0.32, 0.02), M.screen, 0, 1.39, -0.68, -0.35, 0, 0);
        } else if (eq.kind === 'elliptical' || eq.kind === 'bike' || eq.kind === 'rower') {
          addPart(grp, new THREE.BoxGeometry(0.65, 0.10, 1.45), M.steel, 0, 0.05, 0);
          addPart(grp, new THREE.CylinderGeometry(0.32, 0.32, 0.14, 20), M.chrome, 0, 0.42, -0.42, 0, 0, Math.PI / 2);
          addPart(grp, new THREE.BoxGeometry(0.08, 1.15, 0.08), M.steel, 0, 0.65, -0.45, -0.15, 0, 0);
          addPart(grp, new THREE.BoxGeometry(0.45, 0.28, 0.06), M.screen, 0, 1.25, -0.52, -0.3, 0, 0);
          addPart(grp, new THREE.BoxGeometry(0.26, 0.08, 0.32), M.padBlack, 0, 0.85, 0.22);
        } else if (eq.kind === 'power_rack') {
          addPart(grp, new THREE.BoxGeometry(2.2, 0.05, 2.0), M.oak, 0, 0.025, 0);
          const posts = [[-0.62, -0.58], [0.62, -0.58], [-0.62, 0.58], [0.62, 0.58]];
          posts.forEach(([px, pz]) => addPart(grp, new THREE.BoxGeometry(0.075, 2.32, 0.075), M.steel, px, 1.16, pz));
          addPart(grp, new THREE.BoxGeometry(1.32, 0.07, 0.07), M.steel, 0, 2.28, -0.58);
          addPart(grp, new THREE.BoxGeometry(1.32, 0.07, 0.07), M.steel, 0, 2.28, 0.58);
          addPart(grp, new THREE.CylinderGeometry(0.02, 0.02, 2.2, 12), M.chrome, 0, 1.45, -0.62, 0, 0, Math.PI / 2);
          [-0.82, 0.82].forEach((bx) => addPart(grp, new THREE.CylinderGeometry(0.225, 0.225, 0.05, 20), M.plateRed, bx, 1.45, -0.62, 0, 0, Math.PI / 2));
          [-0.89, 0.89].forEach((bx) => addPart(grp, new THREE.CylinderGeometry(0.225, 0.225, 0.04, 20), M.plateBlue, bx, 1.45, -0.62, 0, 0, Math.PI / 2));
        } else if (eq.kind === 'reformer' || eq.kind === 'cadillac') {
          addPart(grp, new THREE.BoxGeometry(0.88, 0.34, 2.38), M.oak, 0, 0.17, 0);
          addPart(grp, new THREE.BoxGeometry(0.76, 0.07, 1.45), M.padBlack, 0, 0.37, -0.15);
          if (eq.kind === 'cadillac') {
            [[-0.4, -1.1], [0.4, -1.1], [-0.4, 1.1], [0.4, 1.1]].forEach(([px, pz]) =>
              addPart(grp, new THREE.CylinderGeometry(0.025, 0.025, 1.95, 10), M.chrome, px, 1.3, pz)
            );
            addPart(grp, new THREE.BoxGeometry(0.85, 0.04, 2.25), M.chrome, 0, 2.25, 0);
          }
        } else if (eq.kind === 'cold_plunge' || eq.kind === 'sauna') {
          if (eq.kind === 'sauna') {
            addPart(grp, new THREE.BoxGeometry(2.1, 2.15, 1.9), M.oak, 0, 1.075, 0);
          } else {
            addPart(grp, new THREE.BoxGeometry(1.05, 0.88, 1.95), M.oak, 0, 0.44, 0);
            addPart(grp, new THREE.BoxGeometry(0.88, 0.04, 1.75), M.water, 0, 0.82, 0);
          }
        } else if (eq.kind === 'dumbbell_rack') {
          addPart(grp, new THREE.BoxGeometry(2.4, 0.82, 0.58), M.steel, 0, 0.41, 0);
          for (let dx = -0.95; dx <= 0.95; dx += 0.38) {
            addPart(grp, new THREE.CylinderGeometry(0.09, 0.09, 0.28, 10), M.padBlack, dx, 0.86, 0, 0, 0, Math.PI / 2);
          }
        } else {
          addPart(grp, new THREE.BoxGeometry(0.52, 1.62, 0.38), M.steel, -0.32, 0.81, -0.35);
          addPart(grp, new THREE.BoxGeometry(0.42, 0.12, 0.85), eq.kind === 'booty_builder' ? M.padAmber : M.padBlack, 0.1, 0.48, 0.15);
          addPart(grp, new THREE.BoxGeometry(0.38, 0.68, 0.10), eq.kind === 'booty_builder' ? M.padAmber : M.padBlack, 0.1, 0.88, -0.22, -0.18, 0, 0);
          addPart(grp, new THREE.CylinderGeometry(0.025, 0.025, 0.95, 10), M.chrome, 0.1, 1.15, 0, 0, 0, Math.PI / 2);
        }

        eqMasterGroup.add(grp);
      });

      scene.add(eqMasterGroup);

      // Lighting
      const sun = new THREE.DirectionalLight(0xffe0b2, 2.2);
      sun.position.set(-28, 36, 26);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 4, far: 110 });
      sun.shadow.bias = -0.0004;
      scene.add(sun);

      scene.add(new THREE.HemisphereLight(0xf1f5f9, 0xd6cfc2, 0.95));

      const warmBounce = new THREE.PointLight(0xffd3a6, 1.2, 25);
      warmBounce.position.set(0, 2.4, 0);
      scene.add(warmBounce);

      // Casa Serra Camera Rig & Wall Elevation Growth
      const lerp = (a, b, t) => a + (b - a) * t;
      const smooth = (t) => {
        const c = Math.max(0, Math.min(1, t));
        return c * c * (3 - 2 * c);
      };

      const applyCasaRig = (s) => {
        this.state.progress = s;
        const rng = document.getElementById('rngCasaScrub');
        if (rng && document.activeElement !== rng) rng.value = Math.round(s * 100);

        // 1. Dynamic Wall Section Cut Height (Casa Serra Rising Walls):
        //    At s=0 (Blueprint): walls are cut low (0.12m) with solid black Poché tops
        //    At s=0.28..0.60 (Rising & Cutaway): walls are at 1.45m..1.85m so you see inside clearly!
        //    At s=0.65..1.00 (Interior Walk): walls rise to full 3.40m ceiling height!
        let wallScaleY = 0.04;
        if (s <= 0.60) {
          wallScaleY = lerp(0.04, 0.54, smooth(s / 0.60));
        } else {
          wallScaleY = lerp(0.54, 1.0, smooth((s - 0.60) / 0.35));
        }
        if (this.state.wallGroup) {
          this.state.wallGroup.scale.y = wallScaleY;
        }
        const effectiveCutM = (wallScaleY * WH);

        // 2. Ink-to-PBR Sweep & Blend: pure Blueprint Ink at s=0 -> full PBR by s=0.45
        const inkBlend = s < 0.06 ? 1.0 : s < 0.36 ? 1.0 - smooth((s - 0.06) / 0.30) : 0.0;
        sharedU.uniforms.uInkBlend.value = inkBlend;
        sharedU.uniforms.uSweepX.value = lerp(-W, W * 1.4, smooth(Math.max(0, (s - 0.06) / 0.42)));

        // 3. Door swing
        if (this.state.doorGroup) {
          this.state.doorGroup.rotation.y = -smooth((s - 0.52) / 0.30) * (Math.PI * 0.48);
        }

        // 4. Camera position & FOV (2° Telephoto Overhead Sheet -> 34° Rising Axonometric -> 52° Eye-Level Walk)
        if (!this.state.orbitActive) {
          let fov, cxPos, cyPos, czPos, txPos, tyPos, tzPos;
          if (s <= 0.35) {
            const t = smooth(s / 0.35);
            fov = lerp(2.2, 30, t);
            const dist = (D * 1.65) / (2 * Math.tan((fov * Math.PI) / 360));
            const elev = lerp(89.8, 44, t) * (Math.PI / 180);
            txPos = 0;
            tyPos = lerp(0, 0.6, t);
            tzPos = lerp(-0.4, 0, t);
            cxPos = txPos - Math.sin(t * 0.38) * dist * Math.cos(elev);
            cyPos = tyPos + dist * Math.sin(elev);
            czPos = tzPos + Math.cos(t * 0.38) * dist * Math.cos(elev);
          } else if (s <= 0.68) {
            const t = smooth((s - 0.35) / 0.33);
            fov = lerp(30, 42, t);
            cxPos = lerp(-W * 0.42, -W * 0.22, t);
            cyPos = lerp(17.5, 11.5, t);
            czPos = lerp(D * 1.28, D * 1.05, t);
            txPos = lerp(0, 0.5, t);
            tyPos = lerp(0.6, 0.9, t);
            tzPos = lerp(0, -0.5, t);
          } else {
            const t = smooth((s - 0.68) / 0.32);
            fov = lerp(42, 54, t);
            cxPos = lerp(-W * 0.22, 0.0, t);
            cyPos = lerp(11.5, 1.68, t);
            czPos = lerp(D * 1.05, D * 0.32, t);
            txPos = lerp(0.5, 0.5, t);
            tyPos = lerp(0.9, 1.38, t);
            tzPos = lerp(-0.5, -D * 0.35, t);
          }

          camera.fov = fov;
          camera.near = Math.max(0.1, cyPos > 40 ? cyPos * 0.4 : 0.15);
          camera.far = cyPos > 40 ? cyPos * 2.2 + 200 : 500;
          camera.position.set(cxPos, cyPos, czPos);
          camera.lookAt(txPos, tyPos, tzPos);
          camera.updateProjectionMatrix();
          if (controls) controls.target.set(txPos, tyPos, tzPos);
        }

        const elLens = document.getElementById('hudCasaLens');
        const elCut = document.getElementById('hudCasaCut');
        const elMode = document.getElementById('hudCasaMode');
        if (elLens) elLens.innerText = `${camera.fov.toFixed(1)}°`;
        if (elCut) elCut.innerText = wallScaleY >= 0.98 ? 'FULL 3.4m' : `+${effectiveCutM.toFixed(2)} m`;
        if (elMode) elMode.innerText = inkBlend > 0.7 ? 'INK SHEET' : inkBlend > 0.15 ? 'SWEEP MORPH' : 'PBR + CAD';
      };

      this.applyCasaRig = applyCasaRig;
      applyCasaRig(this.state.progress);

      const rng = document.getElementById('rngCasaScrub');
      if (rng) {
        rng.addEventListener('input', (e) => {
          this.state.orbitActive = false;
          this.state.playing = false;
          applyCasaRig(Number(e.target.value) / 100);
        });
      }

      const btnPlay = document.getElementById('btnCasaPlayMorph');
      if (btnPlay) {
        btnPlay.addEventListener('click', () => {
          this.state.orbitActive = false;
          this.state.playing = !this.state.playing;
          if (this.state.playing && this.state.progress >= 0.98) {
            this.state.progress = 0.0;
          }
          const ico = document.getElementById('icoCasaPlay');
          if (ico) ico.innerText = this.state.playing ? 'pause' : 'play_arrow';
        });
      }

      const animate = () => {
        this.state.animId = requestAnimationFrame(animate);
        if (this.state.playing) {
          let next = this.state.progress + 0.0028;
          if (next >= 1.0) {
            next = 1.0;
            this.state.playing = false;
            const ico = document.getElementById('icoCasaPlay');
            if (ico) ico.innerText = 'play_arrow';
          }
          applyCasaRig(next);
        } else if (controls && this.state.orbitActive) {
          controls.update();
        }
        renderer.render(scene, camera);
      };
      animate();
    },

    setStop(targetS) {
      this.state.orbitActive = false;
      this.state.playing = false;
      const startS = this.state.progress || 0;
      const startTime = performance.now();
      const dur = 650;
      const step = (now) => {
        const t = Math.min(1, (now - startTime) / dur);
        const ease = t * t * (3 - 2 * t);
        if (this.applyCasaRig) this.applyCasaRig(startS + (targetS - startS) * ease);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },

    setCameraView(viewName) {
      if (viewName === 'topdown') {
        this.setStop(0.0);
      } else if (viewName === 'perspective') {
        this.setStop(0.55);
      } else if (viewName === 'entrance') {
        this.setStop(0.95);
      }
    },

    captureScreenshot() {
      const r = this.state.renderer;
      if (!r) return;
      const link = document.createElement('a');
      link.download = `Attivo_CasaSerra_3D_${Date.now()}.png`;
      link.href = r.domElement.toDataURL('image/png');
      link.click();
    }
  };

  global.AttivoVisualizer2D = AttivoVisualizer2D;
  global.AttivoVisualizer3D = AttivoVisualizer3D;

})(typeof window !== 'undefined' ? window : this);
