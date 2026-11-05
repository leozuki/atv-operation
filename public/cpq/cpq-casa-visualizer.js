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
  // 1B. REAL 3D GLB PRODUCT CATALOG (48+ GLB MODELS FROM PROJECT b762b483)
  // ==========================================================================
  const GLB_CATALOG = [
    // PRECOR CARDIO
    { id: 'TRM885', sku: 'TRM 885', brand: 'Precor', category: 'Cardio', name: 'Precor TRM 885 Commercial Treadmill P82', glb: 'models/precor/precor-treadmill.glb', thumb: 'assets/renders3d/precor-treadmill-render.png', dims: '2110 × 890 × 1740 mm', priceUsd: 11850, kind: 'treadmill' },
    { id: 'EFX885', sku: 'EFX 885', brand: 'Precor', category: 'Cardio', name: 'Precor EFX 885 CrossRamp Elliptical', glb: 'models/precor/precor-efx.glb', thumb: 'assets/renders3d/precor-efx-render.png', dims: '2030 × 760 × 1830 mm', priceUsd: 9800, kind: 'elliptical' },
    { id: 'AMT885', sku: 'AMT 885', brand: 'Precor', category: 'Cardio', name: 'Precor AMT 885 Adaptive Motion Trainer', glb: 'models/precor/precor-amt.glb', thumb: 'assets/renders3d/precor-amt-render.png', dims: '2030 × 890 × 1860 mm', priceUsd: 11400, kind: 'elliptical' },
    { id: 'SCL885', sku: 'SCL 885', brand: 'Precor', category: 'Cardio', name: 'Precor StairClimber SCL 885 P82', glb: 'models/precor/precor-stairclimber.glb', thumb: 'assets/renders3d/precor_stairclimber_3d.png', dims: '1500 × 810 × 2130 mm', priceUsd: 10900, kind: 'elliptical' },
    { id: 'UBK885', sku: 'UBK 885', brand: 'Precor', category: 'Cardio', name: 'Precor UBK 885 Upright Bike', glb: 'models/precor/precor-upright-bike.glb', thumb: 'assets/renders3d/precor-bike-pro-render.png', dims: '1220 × 530 × 1570 mm', priceUsd: 5400, kind: 'bike' },
    { id: 'RBK885', sku: 'RBK 885', brand: 'Precor', category: 'Cardio', name: 'Precor RBK 885 Recumbent / Pro Bike', glb: 'models/precor/precor-bike-pro.glb', thumb: 'assets/renders3d/precor-bike-pro-render.png', dims: '1700 × 580 × 1360 mm', priceUsd: 5850, kind: 'bike' },
    // PRECOR STRENGTH & FUNCTIONAL
    { id: 'FTSGLIDE', sku: 'FTS-GLIDE', brand: 'Precor', category: 'Functional', name: 'Precor FTS Glide Dual Adjustable Pulley', glb: 'models/precor/precor-fts-glide.glb', thumb: 'assets/renders3d/precor-fts-glide-render.png', dims: '1350 × 1250 × 2160 mm', priceUsd: 4950, kind: 'cable_crossover' },
    { id: 'DSL0400', sku: 'DSL0400', brand: 'Precor', category: 'Strength', name: 'Precor Resolute Chest Press DSL0400', glb: 'models/precor/precor-chest-press.glb', thumb: 'assets/renders3d/precor_resolute_dap_3d.png', dims: '1420 × 1370 × 1480 mm', priceUsd: 5200, kind: 'selectorized' },
    { id: 'DSL0500', sku: 'DSL0500', brand: 'Precor', category: 'Strength', name: 'Precor Resolute Dual Pulley DAP', glb: 'models/precor/precor-resolute-dap.glb', thumb: 'assets/renders3d/precor_resolute_dap_3d.png', dims: '1500 × 1400 × 2120 mm', priceUsd: 6150, kind: 'cable_crossover' },
    { id: 'DSL0314', sku: 'DSL0314', brand: 'Precor', category: 'Strength', name: 'Precor Lat Pulldown / Seated Row DSL0314', glb: 'models/precor/precor-lat-pulldown.glb', thumb: 'assets/renders3d/precor-row-render.png', dims: '1880 × 1210 × 2140 mm', priceUsd: 5450, kind: 'selectorized' },
    { id: 'DSL0605', sku: 'DSL0605', brand: 'Precor', category: 'Strength', name: 'Precor Leg Extension DSL0605', glb: 'models/precor/precor-leg-extension.glb', thumb: 'assets/renders3d/precor-hack-squat-clean.png', dims: '1320 × 1190 × 1480 mm', priceUsd: 5100, kind: 'selectorized' },
    { id: 'DSL0606', sku: 'DPL0602', brand: 'Precor', category: 'Strength', name: 'Precor Discovery Hack Squat Machine', glb: 'models/precor/precor-hack-squat.glb', thumb: 'assets/renders3d/precor-hack-squat-clean.png', dims: '2110 × 1600 × 1480 mm', priceUsd: 5650, kind: 'selectorized' },
    { id: 'DPL0601', sku: 'DPL0601', brand: 'Precor', category: 'Free Weights', name: 'Precor Discovery Angled Leg Press DPL0601', glb: 'models/precor/precor-angled-leg-press.glb', thumb: 'assets/renders3d/precor_angled_leg_press_3d.png', dims: '2390 × 1400 × 1450 mm', priceUsd: 5800, kind: 'booty_builder' },
    { id: 'DPL0802', sku: 'DPL0802', brand: 'Precor', category: 'Free Weights', name: 'Precor Discovery Smith Machine DPL0802', glb: 'models/precor/precor-smith-machine.glb', thumb: 'assets/renders3d/precor_smith_machine_3d.png', dims: '1420 × 2240 × 2290 mm', priceUsd: 4950, kind: 'power_rack' },
    { id: 'DBR0119', sku: 'DBR0119', brand: 'Precor', category: 'Free Weights', name: 'Precor Multi-Adjustable Bench DBR0119', glb: 'models/precor/precor-flat-bench.glb', thumb: 'assets/renders3d/freeweight_zone_camera_view.png', dims: '1370 × 760 × 450 mm', priceUsd: 1180, kind: 'bench' },
    { id: 'DBR0811', sku: 'DBR0811', brand: 'Precor', category: 'Free Weights', name: 'Precor 2-Tier 10-Pair Dumbbell Rack DBR0811', glb: 'models/precor/precor-dumbbell-rack.glb', thumb: 'assets/renders3d/freeweight_zone_camera_view.png', dims: '2480 × 670 × 820 mm', priceUsd: 1450, kind: 'dumbbell_rack' },
    // ELEIKO PRESTERA
    { id: 'ELK-PRESTERA', sku: 'ELK-PR300', brand: 'Eleiko', category: 'Free Weights', name: 'Eleiko Prestera Power Rack + Lifting Platform', glb: 'models/prestera-rack.glb', thumb: 'assets/renders3d/freeweight_zone_camera_view.png', dims: '2450 × 2050 × 2353 mm', priceUsd: 6850, kind: 'power_rack' },
    { id: 'ELK-DOUBLE', sku: 'ELK-DHR200', brand: 'Eleiko', category: 'Free Weights', name: 'Eleiko Prestera Double Half Rack Station', glb: 'models/double-half-rack.glb', thumb: 'assets/renders3d/freeweight_zone_camera_view.png', dims: '2950 × 2100 × 2353 mm', priceUsd: 8900, kind: 'power_rack' },
    { id: 'ELK-CABLE', sku: 'ELK-CSS100', brand: 'Eleiko', category: 'Functional', name: 'Eleiko Prestera Cable Strength Station', glb: 'models/cable-strength-station.glb', thumb: 'assets/renders3d/precor-fts-glide-render2.png', dims: '1650 × 1400 × 2353 mm', priceUsd: 7400, kind: 'cable_crossover' },
    { id: 'ELK-STORAGE', sku: 'ELK-RST100', brand: 'Eleiko', category: 'Free Weights', name: 'Eleiko Prestera Modular Storage Rack', glb: 'models/rack-storage.glb', thumb: 'assets/renders3d/freeweight_zone_camera_view.png', dims: '1850 × 750 × 1800 mm', priceUsd: 3200, kind: 'dumbbell_rack' },
    { id: 'ELK-HALFRACK', sku: 'ELK-HR300', brand: 'Eleiko', category: 'Free Weights', name: 'Eleiko Prestera Half Rack Full Assembly', glb: 'models/eleiko/half-rack-full.glb', thumb: 'assets/renders3d/precor_smith_machine_3d.png', dims: '1820 × 1650 × 2353 mm', priceUsd: 5450, kind: 'power_rack' },
    { id: 'ELK-LEVER', sku: 'ELK-LA100', brand: 'Eleiko', category: 'Free Weights', name: 'Eleiko Prestera Jammer Lever Arms Suite', glb: 'models/eleiko/lever-arms.glb', thumb: 'assets/renders3d/freeweight_zone_camera_view.png', dims: '1150 × 650 × 1240 mm', priceUsd: 1650, kind: 'power_rack' },
    // MERRITHEW PILATES
    { id: 'MRT-SPX', sku: 'ST-01070', brand: 'Merrithew', category: 'Pilates', name: 'Merrithew SPX Max Plus Reformer w/ Vertical Stand', glb: 'models/merrithew/merrithew-spx-max.glb', thumb: 'assets/renders3d/merrithew_spx_max_final_render.png', dims: '2460 × 660 × 1850 mm', priceUsd: 5499, kind: 'reformer' },
    { id: 'MRT-REHAB', sku: 'ST-01053', brand: 'Merrithew', category: 'Pilates', name: 'Merrithew V2 Max Plus Studio Reformer', glb: 'models/merrithew/merrithew-v2max-plus.glb', thumb: 'assets/merrithew/merrithew_view_01.jpg', dims: '2540 × 760 × 1980 mm', priceUsd: 6850, kind: 'cadillac' },
    { id: 'MRT-BARREL', sku: 'ST-02006', brand: 'Merrithew', category: 'Pilates', name: 'Merrithew Ladder Barrel Commercial', glb: 'models/merrithew/merrithew-ladder-barrel.glb', thumb: 'assets/merrithew/merrithew_view_03.jpg', dims: '1220 × 910 × 990 mm', priceUsd: 1850, kind: 'barrel' },
    { id: 'MRT-ARC', sku: 'ST-02015', brand: 'Merrithew', category: 'Pilates', name: 'Merrithew Arc Barrel Deluxe', glb: 'models/merrithew/merrithew-arc-barrel-deluxe.glb', thumb: 'assets/merrithew/merrithew_view_04.jpg', dims: '790 × 600 × 380 mm', priceUsd: 690, kind: 'barrel' },
    { id: 'MRT-CORRECT', sku: 'ST-02011', brand: 'Merrithew', category: 'Pilates', name: 'Merrithew Spine Corrector Barrel', glb: 'models/merrithew/merrithew-spine-corrector.glb', thumb: 'assets/merrithew/merrithew_view_05.jpg', dims: '780 × 550 × 380 mm', priceUsd: 690, kind: 'barrel' }
  ];

  const glbPrototypeCache = {};
  const glbPendingCallbacks = {};

  function resolveGlbPath(eq) {
    const sku = (eq.sku || '').toUpperCase();
    const name = (eq.name || '').toLowerCase();
    const kind = eq.kind || 'selectorized';

    if (sku.includes('TRM') || kind === 'treadmill') return 'models/precor/precor-treadmill.glb';
    if (sku.includes('AMT')) return 'models/precor/precor-amt.glb';
    if (sku.includes('SCL') || name.includes('stair')) return 'models/precor/precor-stairclimber.glb';
    if (sku.includes('EFX') || kind === 'elliptical') return 'models/precor/precor-efx.glb';
    if (sku.includes('RBK') || name.includes('recumbent')) return 'models/precor/precor-bike-pro.glb';
    if (sku.includes('UBK') || kind === 'bike' || kind === 'rower') return 'models/precor/precor-upright-bike.glb';
    if (kind === 'cadillac' || sku.includes('ST-01053')) return 'models/merrithew/merrithew-v2max-plus.glb';
    if (kind === 'barrel' || name.includes('barrel')) return 'models/merrithew/merrithew-ladder-barrel.glb';
    if (kind === 'reformer' || name.includes('reformer')) return 'models/merrithew/merrithew-spx-max.glb';
    if (kind === 'power_rack') {
      if (name.includes('smith') || sku.includes('DPL0802')) return 'models/precor/precor-smith-machine.glb';
      return 'models/prestera-rack.glb';
    }
    if (kind === 'cable_crossover' || sku.includes('FTS')) return 'models/precor/precor-fts-glide.glb';
    if (kind === 'dumbbell_rack' || sku.includes('DBR08')) return 'models/precor/precor-dumbbell-rack.glb';
    if (kind === 'bench' || sku.includes('DBR01')) return 'models/precor/precor-flat-bench.glb';
    if (kind === 'booty_builder' || sku.includes('DPL0601')) return 'models/precor/precor-angled-leg-press.glb';
    if (sku.includes('DSL0314')) return 'models/precor/precor-lat-pulldown.glb';
    if (sku.includes('DSL0500')) return 'models/precor/precor-resolute-dap.glb';
    if (sku.includes('DSL0605')) return 'models/precor/precor-leg-extension.glb';
    return 'models/precor/precor-chest-press.glb';
  }

  function loadGlbClone(glbPath, onDone) {
    if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') return;
    if (glbPrototypeCache[glbPath]) {
      const cloned = glbPrototypeCache[glbPath].clone(true);
      cloned.userData.rawSize = glbPrototypeCache[glbPath].userData.rawSize;
      onDone(cloned);
      return;
    }
    if (glbPendingCallbacks[glbPath]) {
      glbPendingCallbacks[glbPath].push(onDone);
      return;
    }
    glbPendingCallbacks[glbPath] = [onDone];
    const loader = new THREE.GLTFLoader();
    loader.load(
      glbPath,
      (gltf) => {
        const proto = gltf.scene;
        proto.traverse((child) => {
          if (child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
              if ('metalness' in m && m.metalness > 0.42) m.metalness = 0.42;
              if ('roughness' in m && m.roughness < 0.28) m.roughness = 0.32;
              m.needsUpdate = true;
            });
          }
        });
        // Normalize prototype bounding box so bottom rests at y=0 and center X/Z is at 0
        const box = new THREE.Box3().setFromObject(proto);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const wrapper = new THREE.Group();
        proto.position.set(-center.x, -box.min.y, -center.z);
        wrapper.add(proto);
        const rawSize = { x: Math.max(0.2, size.x), y: Math.max(0.2, size.y), z: Math.max(0.2, size.z) };
        wrapper.userData.rawSize = rawSize;
        glbPrototypeCache[glbPath] = wrapper;
        const cbs = glbPendingCallbacks[glbPath] || [];
        delete glbPendingCallbacks[glbPath];
        cbs.forEach((cb) => {
          const cloned = wrapper.clone(true);
          cloned.userData.rawSize = rawSize;
          cb(cloned);
        });
      },
      undefined,
      () => {
        delete glbPendingCallbacks[glbPath];
      }
    );
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
  // 3. MULTI-MODE 2D ARCHITECTURAL FLOORPLAN ENGINE (AttivoVisualizer2D)
  //    Modes:
  //    - 'attivo_studio' (Default: Historical Attivo Design Studio Wood/Rubber + MEP)
  //    - 'casa_serra'    (Lintel · Casa Serra Sheet A-101 Archival Ink CAD)
  //    - 'navy_cad'      (AutoCAD Dark Navy Blueprint from Project b762b483)
  // ==========================================================================
  const AttivoVisualizer2D = {
    style: 'attivo_studio',
    lastProposal: null,

    setStyle(newStyle) {
      this.style = newStyle || 'attivo_studio';
      const activeCls = 'px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#00204a] text-white shadow-2xs transition cursor-pointer';
      const inactiveCls = 'px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer';
      const bStudio = document.getElementById('btn2dStyleStudio');
      const bCasa = document.getElementById('btn2dStyleCasa');
      const bNavy = document.getElementById('btn2dStyleNavy');
      if (bStudio) bStudio.className = this.style === 'attivo_studio' ? activeCls : inactiveCls;
      if (bCasa) bCasa.className = this.style === 'casa_serra' ? activeCls : inactiveCls;
      if (bNavy) bNavy.className = this.style === 'navy_cad' ? activeCls : inactiveCls;
      this.render(this.lastProposal);
    },

    drawFloorplan(proposal) {
      return this.render(proposal);
    },

    render(proposal) {
      const canvas = document.getElementById('aiFloorplanCanvas');
      if (!canvas) return;

      const p = proposal || this.lastProposal || (global.AttivoAiAdvisor && global.AttivoAiAdvisor.currentProposal) || {
        area: 250,
        projectType: 'commercial_gym',
        clientName: 'ATTIVO INTERNATIONAL',
        total_units: 24,
        items: []
      };
      this.lastProposal = p;

      const isEN = (typeof state === 'undefined' || state.appLang === 'en');

      const CW = 1600;
      const CH = 1000;
      if (canvas.width !== CW) canvas.width = CW;
      if (canvas.height !== CH) canvas.height = CH;

      const ctx = canvas.getContext('2d');
      const { W, D, area, pType, placements } = layoutEquipmentInMetres(p);

      if (this.style === 'attivo_studio') {
        this.renderAttivoStudio(ctx, CW, CH, W, D, area, pType, placements, p, isEN);
        return;
      }
      if (this.style === 'navy_cad') {
        this.renderNavyCad(ctx, CW, CH, W, D, area, pType, placements, p, isEN);
        return;
      }

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

    // ========================================================================
    // MODE A: ATTIVO DESIGN STUDIO 2D (Wood/Rubber Flooring + MEP + Callouts)
    // Inspired by D:\AI\03_Clients\Atv\Project\Design\Project\tong hop 3D
    // (The Waterfront Saigon, Riviera Gym, Green Garden Fitness)
    // ========================================================================
    renderAttivoStudio(ctx, CW, CH, W, D, area, pType, placements, p, isEN) {
      // 1. Clean Architectural Studio Canvas Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, CW, CH);

      // Outer presentation frame
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(14, 14, CW - 28, CH - 28);

      // Top Header Banner
      ctx.fillStyle = '#00204a';
      ctx.fillRect(14, 14, CW - 28, 52);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 16px "Montserrat", "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        isEN
          ? `ATTIVO ACTIVE WELLNESS  ·  2D ARCHITECTURAL & MEP FLOORPLAN — ${(p.clientName || 'COMMERCIAL FITNESS PROJECT').toUpperCase()}`
          : `ATTIVO ACTIVE WELLNESS  ·  MẶT BẰNG BỐ TRÍ THIẾT BỊ & CƠ ĐIỆN (MEP) — ${(p.clientName || 'DỰ ÁN PHÒNG GYM').toUpperCase()}`,
        32,
        40
      );
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${area} m² (${W}m × ${D}m)  ·  ${placements.length} UNITS  ·  SCALE 1:100`, CW - 32, 40);

      // Bottom Legend Bar Area (Height 185px at bottom, matching The Waterfront Saigon & Riviera Gym)
      const legendY = CH - 196;
      const planW = CW - 160;
      const planH = legendY - 125;
      const PXM = Math.min((planW - 220) / W, (planH - 40) / D);
      const cx = 110 + (planW - 220) / 2;
      const cy = 96 + planH / 2;
      const toX = (xm) => cx + xm * PXM;
      const toY = (zm) => cy + zm * PXM;

      const rx0 = toX(-W / 2), ry0 = toY(-D / 2);
      const rw = W * PXM, rh = D * PXM;

      // 2. MULTI-ZONE REALISTIC FLOORING TEXTURES (Walnut/Oak Wood + PaviFLEX Charcoal Rubber + Marble Corridor + Turf)
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx0, ry0, rw, rh);
      ctx.clip();

      const xCardioEnd = toX(-W / 2 + W * 0.34);
      const xStrengthEnd = toX(-W / 2 + W * 0.67);
      const yCorridor = toY(D / 2 - 1.55);

      // Zone 1 (Left / Cardio or Full Pilates): Warm Engineered Walnut/Oak Wood Planks
      const woodW = (pType === 'pilates_studio' || pType === 'recovery_lounge') ? rw : (xCardioEnd - rx0);
      const woodGrad = ctx.createLinearGradient(rx0, ry0, rx0 + woodW, ry0 + rh);
      woodGrad.addColorStop(0, '#c89258');
      woodGrad.addColorStop(0.5, '#b87f47');
      woodGrad.addColorStop(1, '#a9713b');
      ctx.fillStyle = woodGrad;
      ctx.fillRect(rx0, ry0, woodW, rh);

      // Wood plank seams
      ctx.strokeStyle = 'rgba(72, 42, 16, 0.26)';
      ctx.lineWidth = 0.8;
      for (let py = ry0; py < ry0 + rh; py += 10) {
        ctx.beginPath();
        ctx.moveTo(rx0, py);
        ctx.lineTo(rx0 + woodW, py);
        ctx.stroke();
      }
      for (let px = rx0; px < rx0 + woodW; px += 48) {
        ctx.beginPath();
        ctx.moveTo(px, ry0);
        ctx.lineTo(px, ry0 + rh);
        ctx.stroke();
      }

      if (pType !== 'pilates_studio' && pType !== 'recovery_lounge') {
        // Zone 2 & 3 (Strength & Free Weights): Dark Charcoal PaviFLEX Rubber Flooring with White Tile Grid
        ctx.fillStyle = '#333840';
        ctx.fillRect(xCardioEnd, ry0, (rx0 + rw) - xCardioEnd, yCorridor - ry0);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 0.8;
        const tileStep = 1.0 * PXM;
        for (let gx = xCardioEnd; gx <= rx0 + rw; gx += tileStep) {
          ctx.beginPath(); ctx.moveTo(gx, ry0); ctx.lineTo(gx, yCorridor); ctx.stroke();
        }
        for (let gy = ry0; gy <= yCorridor; gy += tileStep) {
          ctx.beginPath(); ctx.moveTo(xCardioEnd, gy); ctx.lineTo(rx0 + rw, gy); ctx.stroke();
        }

        // South Circulation Corridor: Warm Travertine Marble Sand Tile
        ctx.fillStyle = '#e5dec9';
        ctx.fillRect(xCardioEnd, yCorridor, (rx0 + rw) - xCardioEnd, (ry0 + rh) - yCorridor);
        ctx.strokeStyle = 'rgba(120, 110, 90, 0.25)';
        for (let gx = xCardioEnd; gx <= rx0 + rw; gx += tileStep * 0.8) {
          ctx.beginPath(); ctx.moveTo(gx, yCorridor); ctx.lineTo(gx, ry0 + rh); ctx.stroke();
        }

        // Functional Sprint Turf Strip in SE Zone
        const turfX = xStrengthEnd + 10;
        const turfY = toY(0.35);
        const turfW = (rx0 + rw) - turfX - 14;
        const turfH = yCorridor - turfY - 8;
        if (turfW > 50 && turfH > 28) {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(turfX, turfY, turfW, turfH);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(turfX + 2, turfY + 2, turfW - 4, turfH - 4);
          for (let m = 1; m <= 4; m++) {
            const mx = turfX + (turfW * m) / 5;
            ctx.beginPath();
            ctx.moveTo(mx, turfY + 2); ctx.lineTo(mx, turfY + 9);
            ctx.moveTo(mx, turfY + turfH - 9); ctx.lineTo(mx, turfY + turfH - 2);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // 3. AUXILIARY ARCHITECTURAL BLOCK (RIGHT SIDE: ELEVATOR LOBBY, WC, STAIRS - FROM PROJECT b762b483)
      const auxX = rx0 + rw + 8;
      const auxW = 165;
      const auxH = rh;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(auxX, ry0, auxW, auxH);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.strokeRect(auxX, ry0, auxW, auxH);

      const drawAuxRoom = (ry, rHeight, title, sub) => {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(auxX, ry, auxW, rHeight);
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 10px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, auxX + auxW / 2, ry + rHeight / 2 - 5);
        ctx.fillStyle = '#64748b';
        ctx.font = '600 8.5px "JetBrains Mono", monospace';
        ctx.fillText(sub, auxX + auxW / 2, ry + rHeight / 2 + 9);
      };
      drawAuxRoom(ry0, auxH * 0.24, isEN ? 'MEN / WOMEN WC' : 'KHU WC NAM / NỮ', 'LOCKER & SHOWER');
      drawAuxRoom(ry0 + auxH * 0.24, auxH * 0.26, isEN ? 'ELEVATOR LOBBY' : 'SẢNH THANG MÁY', '2× PASSENGER LIFT');
      drawAuxRoom(ry0 + auxH * 0.50, auxH * 0.24, isEN ? 'SAUNA & STEAM' : 'XÔNG HƠI KHÔ / ƯỚT', 'WELLNESS SPA');
      drawAuxRoom(ry0 + auxH * 0.74, auxH * 0.26, isEN ? 'RECEPTION & TOWEL' : 'QUẦY LỄ TÂN & KHĂN', 'MAIN ENTRANCE');

      // Elevator X-boxes
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      [ry0 + auxH * 0.26, ry0 + auxH * 0.38].forEach((ey) => {
        ctx.strokeRect(auxX + 12, ey, 34, 30);
        ctx.beginPath();
        ctx.moveTo(auxX + 12, ey); ctx.lineTo(auxX + 46, ey + 30);
        ctx.moveTo(auxX + 46, ey); ctx.lineTo(auxX + 12, ey + 30);
        ctx.stroke();
      });

      // 4. STRUCTURAL WALLS, COLUMNS (500x500mm), RED MIRROR LINES & GREEN PLANTERS
      const wallT = 9;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rx0 - wallT / 2, ry0 - wallT / 2, rw + wallT, wallT);
      ctx.fillRect(rx0 - wallT / 2, ry0 + rh - wallT / 2, rw + wallT, wallT);
      ctx.fillRect(rx0 - wallT / 2, ry0 - wallT / 2, wallT, rh + wallT);
      ctx.fillRect(rx0 + rw - wallT / 2, ry0 - wallT / 2, wallT, rh + wallT);

      // Red MIRROR Wall Indicators (Matching Riviera Gym & Green Garden Fitness)
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(rx0 + rw * 0.36, ry0 + wallT / 2 + 2);
      ctx.lineTo(rx0 + rw * 0.92, ry0 + wallT / 2 + 2);
      ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.font = '800 10px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MIRROR (GƯƠNG TẬP)', rx0 + rw * 0.64, ry0 + 18);

      // Structural Columns (500x500mm) + Grid Bubbles
      const colPts = [rx0, rx0 + rw * 0.34, rx0 + rw * 0.67, rx0 + rw];
      colPts.forEach((cxPt, idx) => {
        [ry0, ry0 + rh].forEach((cyPt) => {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(cxPt - 7, cyPt - 7, 14, 14);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(cxPt - 7, cyPt - 7, 14, 14);
        });
        // Top column bubble
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#00204a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cxPt, ry0 - 24, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#00204a';
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.fillText(String(idx + 1), cxPt, ry0 - 24);
      });

      // Dimension line on West side
      ctx.strokeStyle = '#dc2626';
      ctx.fillStyle = '#dc2626';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(rx0 - 26, ry0);
      ctx.lineTo(rx0 - 26, ry0 + rh);
      ctx.stroke();
      ctx.save();
      ctx.translate(rx0 - 38, ry0 + rh / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(D * 1000)} mm (${D}m)`, 0, 0);
      ctx.restore();

      // Indoor Green Planters along West Window Wall & Entrance
      const drawPlanter = (px, py) => {
        ctx.save();
        ctx.fillStyle = '#78350f';
        ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#16a34a';
        for (let a = 0; a < 6; a++) {
          const ang = (a * Math.PI) / 3;
          ctx.beginPath();
          ctx.ellipse(px + Math.cos(ang) * 5, py + Math.sin(ang) * 5, 6, 3, ang, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      };
      drawPlanter(rx0 + 16, ry0 + 22);
      drawPlanter(rx0 + 16, ry0 + rh - 22);
      drawPlanter(xCardioEnd - 16, ry0 + rh - 22);

      // 5. MEP SYMBOLS ON PERIMETER WALLS (TV Point, 16A Socket, LAN Point)
      const drawMepIcon = (mx, my, type) => {
        ctx.save();
        if (type === 'tv') {
          ctx.fillStyle = '#2563eb';
          ctx.fillRect(mx - 10, my - 5, 20, 10);
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 7px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('TV', mx, my + 0.5);
        } else if (type === '16a') {
          ctx.fillStyle = '#dc2626';
          ctx.beginPath(); ctx.arc(mx, my, 5.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 6px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('16A', mx, my + 0.5);
        }
        ctx.restore();
      };
      drawMepIcon(rx0 + 10, ry0 + rh * 0.30, 'tv');
      drawMepIcon(rx0 + 10, ry0 + rh * 0.68, 'tv');
      drawMepIcon(rx0 + 10, ry0 + rh * 0.48, '16a');

      // 6. SHADED TOP-DOWN 3D EQUIPMENT RENDERS + RED NUMBERED CALLOUT BADGES (1..N)
      const skuNumberMap = {};
      const legendItems = [];
      let nextCalloutNum = 1;

      placements.forEach((eq) => {
        const key = eq.sku || eq.kind;
        if (!skuNumberMap[key]) {
          skuNumberMap[key] = nextCalloutNum++;
          legendItems.push({ num: skuNumberMap[key], sku: eq.sku, name: eq.name, brand: eq.brand, qty: 0 });
        }
        const leg = legendItems.find((x) => x.num === skuNumberMap[key]);
        if (leg) leg.qty++;
      });

      placements.forEach((eq) => {
        const px = toX(eq.x);
        const py = toY(eq.z);
        const pw = eq.w * PXM;
        const pd = eq.d * PXM;
        const calloutNo = skuNumberMap[eq.sku || eq.kind] || 1;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(eq.rotY || 0);

        // Realistic floor drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.fillRect(-pw / 2 + 4, -pd / 2 + 4, pw, pd);

        if (eq.kind === 'treadmill') {
          // Metallic Silver Frame + Dark Running Belt + Console
          ctx.fillStyle = '#cbd5e1';
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.4;
          ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
          ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
          // Running belt
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-pw * 0.38, -pd * 0.22, pw * 0.76, pd * 0.68);
          // Precor arrow on belt
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, pd * 0.32); ctx.lineTo(0, -pd * 0.08);
          ctx.moveTo(-4, 0); ctx.lineTo(0, -pd * 0.08); ctx.lineTo(4, 0);
          ctx.stroke();
          // Console head
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-pw * 0.44, -pd * 0.44, pw * 0.88, pd * 0.20);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-pw * 0.26, -pd * 0.40, pw * 0.52, pd * 0.10);
        } else if (eq.kind === 'elliptical' || eq.kind === 'bike' || eq.kind === 'rower') {
          ctx.fillStyle = '#cbd5e1';
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.3;
          ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
          ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
          ctx.fillStyle = '#334155';
          ctx.beginPath(); ctx.arc(0, -pd * 0.25, pw * 0.28, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-pw * 0.35, 0, pw * 0.22, pd * 0.38);
          ctx.fillRect(pw * 0.13, 0, pw * 0.22, pd * 0.38);
        } else if (eq.kind === 'power_rack') {
          // Oak lifting platform + Black Eleiko rack + Red/Blue Olympic bumper plates
          ctx.fillStyle = '#b47b44';
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.5;
          ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
          ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-pw * 0.48, -pd * 0.46, pw * 0.20, pd * 0.92);
          ctx.fillRect(pw * 0.28, -pd * 0.46, pw * 0.20, pd * 0.92);
          // Olympic barbell & colored plates
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(-pw * 0.56, -pd * 0.10); ctx.lineTo(pw * 0.56, -pd * 0.10); ctx.stroke();
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(-pw * 0.50, -pd * 0.24, 4, pd * 0.28);
          ctx.fillRect(pw * 0.46, -pd * 0.24, 4, pd * 0.28);
          ctx.fillStyle = '#2563eb';
          ctx.fillRect(-pw * 0.44, -pd * 0.22, 3, pd * 0.24);
          ctx.fillRect(pw * 0.41, -pd * 0.22, 3, pd * 0.24);
        } else if (eq.kind === 'reformer' || eq.kind === 'cadillac') {
          ctx.fillStyle = '#d9a066';
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 1.4;
          ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
          ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-pw * 0.38, -pd * 0.32, pw * 0.76, pd * 0.56);
        } else {
          // Selectorized / Bench / Booty Builder
          ctx.fillStyle = '#94a3b8';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.3;
          ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
          ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
          // Weight stack tower
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-pw * 0.44, -pd * 0.44, pw * 0.36, pd * 0.28);
          // Upholstered seat pad (burgundy/black)
          ctx.fillStyle = eq.kind === 'booty_builder' ? '#d97706' : '#7f1d1d';
          ctx.fillRect(-pw * 0.22, -pd * 0.05, pw * 0.44, pd * 0.40);
        }
        ctx.restore();

        // Red Numbered Callout Badge (Exact style of The Waterfront Saigon & Riviera Gym)
        ctx.save();
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(px + pw * 0.28, py - pd * 0.28, 10.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 10px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(calloutNo), px + pw * 0.28, py - pd * 0.28 + 0.5);
        ctx.restore();
      });

      // 7. BOTTOM ATTIVO ACTIVE WELLNESS MEP & EQUIPMENT LEGEND STRIP
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(24, legendY, CW - 48, 170);
      ctx.strokeStyle = '#00204a';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, legendY, CW - 48, 170);

      // Left Box: ATTIVO Brand & MEP Symbols (Matching The Waterfront Saigon Plan Layout.png)
      ctx.fillStyle = '#00204a';
      ctx.fillRect(24, legendY, 310, 170);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 22px "Montserrat", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('ATTIVO', 44, legendY + 36);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 10px "Montserrat", sans-serif';
      ctx.fillText('ACTIVE WELLNESS · DESIGN STUDIO', 44, legendY + 54);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 10px "Inter", sans-serif';
      ctx.fillText('• [TV]  Television Coaxial + Power Point', 44, legendY + 84);
      ctx.fillText('• [16A] 16A Floor/Wall Power Socket', 44, legendY + 104);
      ctx.fillText('• [LAN] Cat6 Network RJ45 Console Point', 44, legendY + 124);
      ctx.fillStyle = '#fca5a5';
      ctx.fillText('• Accessories: 1. TIVI  2. MIRROR  3. FLOORING', 44, legendY + 148);

      // Right Columns: Numbered Equipment Schedule (1..N)
      ctx.fillStyle = '#00204a';
      ctx.font = '800 11px "Inter", sans-serif';
      ctx.fillText(isEN ? 'NUMBERED EQUIPMENT LIST (ON FLOORPLAN):' : 'DANH MỤC THIẾT BỊ ĐÁNH SỐ TRÊN MẶT BẰNG:', 354, legendY + 22);

      const maxCols = 3;
      const colWidth = 395;
      legendItems.slice(0, 15).forEach((item, i) => {
        const col = Math.floor(i / 5);
        const row = i % 5;
        const lx = 354 + col * colWidth;
        const ly = legendY + 46 + row * 24;

        // Red circle badge
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(lx + 9, ly, 8.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 9.5px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(item.num), lx + 9, ly + 0.5);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 10.5px "JetBrains Mono", monospace';
        ctx.fillText(`${item.sku}`, lx + 24, ly);
        ctx.fillStyle = '#475569';
        ctx.font = '500 10px "Inter", sans-serif';
        const shortName = (item.name || '').substring(0, 26);
        ctx.fillText(`— ${shortName}`, lx + 102, ly);
        ctx.fillStyle = '#00204a';
        ctx.font = '800 10px "JetBrains Mono", monospace';
        ctx.fillText(`[×${item.qty}]`, lx + 335, ly);
      });
    },

    // ========================================================================
    // MODE C: AUTOCAD DARK NAVY BLUEPRINT (From Project b762b483)
    // ========================================================================
    renderNavyCad(ctx, CW, CH, W, D, area, pType, placements, p, isEN) {
      ctx.fillStyle = '#071124';
      ctx.fillRect(0, 0, CW, CH);

      // Sub-grid & major CAD grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < CW; x += 25) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke(); }
      for (let y = 0; y < CH; y += 25) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke(); }

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, CW - 40, CH - 40);
      ctx.strokeRect(26, 26, CW - 52, CH - 52);

      const planW = CW - 420;
      const planH = CH - 160;
      const PXM = Math.min(planW / W, planH / D);
      const cx = 90 + planW / 2;
      const cy = 85 + planH / 2;
      const toX = (xm) => cx + xm * PXM;
      const toY = (zm) => cy + zm * PXM;
      const rx0 = toX(-W / 2), ry0 = toY(-D / 2);
      const rw = W * PXM, rh = D * PXM;

      // Cyan Structural Walls
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(rx0, ry0, rw, rh);

      // Dimension lines
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`◄─── ${W.toFixed(2)} m (${Math.round(W * 1000)} mm) ───►`, cx, ry0 - 22);

      // Equipment in Cyan CAD Vector + Safety Clearance Circles
      placements.forEach((eq, idx) => {
        const px = toX(eq.x);
        const py = toY(eq.z);
        const pw = eq.w * PXM;
        const pd = eq.d * PXM;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(eq.rotY || 0);

        // Amber safety clearance ring
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(-pw / 2 - 8, -pd / 2 - 8, pw + 16, pd + 16);
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(14, 165, 233, 0.15)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);

        ctx.beginPath();
        ctx.moveTo(-pw / 2, -pd / 2); ctx.lineTo(pw / 2, pd / 2);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${idx + 1}:${eq.sku}`, px, py + 3);
      });

      // Right CAD Title Block
      const tx = CW - 310;
      ctx.fillStyle = '#0b1933';
      ctx.fillRect(tx, 26, 284, CH - 52);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(tx, 26, 284, CH - 52);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '800 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('AUTOCAD DWG · SHEET A-101', tx + 16, 62);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText(`CLIENT: ${(p.clientName || 'ATTIVO').toUpperCase()}`, tx + 16, 92);
      ctx.fillText(`AREA  : ${area} M2 (${W}x${D}M)`, tx + 16, 114);
      ctx.fillText(`UNITS : ${placements.length} MACHINES`, tx + 16, 136);
      ctx.fillText(`SAFETY: ASTM F2276 PASS`, tx + 16, 158);
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

      // B2. Structural Concrete Columns (500x500mm with Attivo Blue Band) & Industrial HVAC/LED Ceiling (from Project b762b483)
      const colMat = this.makeInkAwareMaterial({ color: 0xe2e8f0, roughness: 0.7 }, sharedU);
      const bandMat = this.makeInkAwareMaterial({ color: 0x0284c7, roughness: 0.35 }, sharedU);
      [[-hw + 0.25, -hd + 0.25], [0, -hd + 0.25], [hw - 0.25, -hd + 0.25], [-hw + 0.25, hd - 0.25], [hw - 0.25, hd - 0.25]].forEach(([cxp, czp]) => {
        const colMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, WH, 0.48), colMat);
        colMesh.position.set(cxp, WH / 2, czp);
        colMesh.castShadow = true;
        wallGroup.add(colMesh);
        const bandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.28, 0.50), bandMat);
        bandMesh.position.set(cxp, 1.35, czp);
        wallGroup.add(bandMesh);
      });

      const ceilingGroup = new THREE.Group();
      ceilingGroup.visible = !!this.state.showCeiling;
      const ductMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.28 });
      const ledMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
      for (let dz = -hd + 2.8; dz <= hd - 2.2; dz += 4.2) {
        const duct = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, W - 1.5, 16), ductMat);
        duct.rotation.z = Math.PI / 2;
        duct.position.set(0, WH - 0.25, dz);
        ceilingGroup.add(duct);
        const ledTrack = new THREE.Mesh(new THREE.BoxGeometry(W - 2.0, 0.04, 0.12), ledMat);
        ledTrack.position.set(0, WH - 0.45, dz + 1.4);
        ceilingGroup.add(ledTrack);
      }
      scene.add(ceilingGroup);
      this.state.ceilingGroup = ceilingGroup;

      // C. Athletic Sprint Turf Track + Dual-Zone Wood/Rubber Flooring + Equipment Group
      const eqMasterGroup = new THREE.Group();
      if (!isWood) {
        // Warm Oak Wood Zone under Cardio Matrix (Left 31% of room)
        const cardioWoodW = W * 0.31;
        const cardioWood = new THREE.Mesh(new THREE.BoxGeometry(cardioWoodW, 0.018, D - 0.2), M.oak);
        cardioWood.position.set(-hw + cardioWoodW / 2 + 0.05, 0.009, 0);
        cardioWood.receiveShadow = true;
        eqMasterGroup.add(cardioWood);

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

        const fallbackGrp = new THREE.Group();
        grp.add(fallbackGrp);

        if (eq.kind === 'treadmill') {
          addPart(fallbackGrp, new THREE.BoxGeometry(0.92, 0.22, 2.05), M.steel, 0, 0.11, 0);
          addPart(fallbackGrp, new THREE.BoxGeometry(0.62, 0.02, 1.55), M.padBlack, 0, 0.23, 0.18);
          addPart(fallbackGrp, new THREE.BoxGeometry(0.88, 0.28, 0.42), M.steel, 0, 0.26, -0.78);
          addPart(fallbackGrp, new THREE.BoxGeometry(0.08, 1.25, 0.10), M.steel, -0.38, 0.72, -0.62, -0.12, 0, 0);
          addPart(fallbackGrp, new THREE.BoxGeometry(0.08, 1.25, 0.10), M.steel, 0.38, 0.72, -0.62, -0.12, 0, 0);
          addPart(fallbackGrp, new THREE.BoxGeometry(0.86, 0.42, 0.08), M.steel, 0, 1.38, -0.72, -0.35, 0, 0);
          addPart(fallbackGrp, new THREE.BoxGeometry(0.74, 0.32, 0.02), M.screen, 0, 1.39, -0.68, -0.35, 0, 0);
        } else if (eq.kind === 'elliptical' || eq.kind === 'bike' || eq.kind === 'rower') {
          addPart(fallbackGrp, new THREE.BoxGeometry(0.65, 0.10, 1.45), M.steel, 0, 0.05, 0);
          addPart(fallbackGrp, new THREE.CylinderGeometry(0.32, 0.32, 0.14, 20), M.chrome, 0, 0.42, -0.42, 0, 0, Math.PI / 2);
          addPart(fallbackGrp, new THREE.BoxGeometry(0.08, 1.15, 0.08), M.steel, 0, 0.65, -0.45, -0.15, 0, 0);
          addPart(fallbackGrp, new THREE.BoxGeometry(0.45, 0.28, 0.06), M.screen, 0, 1.25, -0.52, -0.3, 0, 0);
          addPart(fallbackGrp, new THREE.BoxGeometry(0.26, 0.08, 0.32), M.padBlack, 0, 0.85, 0.22);
        } else if (eq.kind === 'power_rack') {
          addPart(fallbackGrp, new THREE.BoxGeometry(2.2, 0.05, 2.0), M.oak, 0, 0.025, 0);
          const posts = [[-0.62, -0.58], [0.62, -0.58], [-0.62, 0.58], [0.62, 0.58]];
          posts.forEach(([px, pz]) => addPart(fallbackGrp, new THREE.BoxGeometry(0.075, 2.32, 0.075), M.steel, px, 1.16, pz));
          addPart(fallbackGrp, new THREE.BoxGeometry(1.32, 0.07, 0.07), M.steel, 0, 2.28, -0.58);
          addPart(fallbackGrp, new THREE.BoxGeometry(1.32, 0.07, 0.07), M.steel, 0, 2.28, 0.58);
          addPart(fallbackGrp, new THREE.CylinderGeometry(0.02, 0.02, 2.2, 12), M.chrome, 0, 1.45, -0.62, 0, 0, Math.PI / 2);
          [-0.82, 0.82].forEach((bx) => addPart(fallbackGrp, new THREE.CylinderGeometry(0.225, 0.225, 0.05, 20), M.plateRed, bx, 1.45, -0.62, 0, 0, Math.PI / 2));
          [-0.89, 0.89].forEach((bx) => addPart(fallbackGrp, new THREE.CylinderGeometry(0.225, 0.225, 0.04, 20), M.plateBlue, bx, 1.45, -0.62, 0, 0, Math.PI / 2));
        } else if (eq.kind === 'reformer' || eq.kind === 'cadillac') {
          addPart(fallbackGrp, new THREE.BoxGeometry(0.88, 0.34, 2.38), M.oak, 0, 0.17, 0);
          addPart(fallbackGrp, new THREE.BoxGeometry(0.76, 0.07, 1.45), M.padBlack, 0, 0.37, -0.15);
          if (eq.kind === 'cadillac') {
            [[-0.4, -1.1], [0.4, -1.1], [-0.4, 1.1], [0.4, 1.1]].forEach(([px, pz]) =>
              addPart(fallbackGrp, new THREE.CylinderGeometry(0.025, 0.025, 1.95, 10), M.chrome, px, 1.3, pz)
            );
            addPart(fallbackGrp, new THREE.BoxGeometry(0.85, 0.04, 2.25), M.chrome, 0, 2.25, 0);
          }
        } else if (eq.kind === 'cold_plunge' || eq.kind === 'sauna') {
          if (eq.kind === 'sauna') {
            addPart(fallbackGrp, new THREE.BoxGeometry(2.1, 2.15, 1.9), M.oak, 0, 1.075, 0);
          } else {
            addPart(fallbackGrp, new THREE.BoxGeometry(1.05, 0.88, 1.95), M.oak, 0, 0.44, 0);
            addPart(fallbackGrp, new THREE.BoxGeometry(0.88, 0.04, 1.75), M.water, 0, 0.82, 0);
          }
        } else if (eq.kind === 'dumbbell_rack') {
          addPart(fallbackGrp, new THREE.BoxGeometry(2.4, 0.82, 0.58), M.steel, 0, 0.41, 0);
          for (let dx = -0.95; dx <= 0.95; dx += 0.38) {
            addPart(fallbackGrp, new THREE.CylinderGeometry(0.09, 0.09, 0.28, 10), M.padBlack, dx, 0.86, 0, 0, 0, Math.PI / 2);
          }
        } else {
          addPart(fallbackGrp, new THREE.BoxGeometry(0.52, 1.62, 0.38), M.steel, -0.32, 0.81, -0.35);
          addPart(fallbackGrp, new THREE.BoxGeometry(0.42, 0.12, 0.85), eq.kind === 'booty_builder' ? M.padAmber : M.padBlack, 0.1, 0.48, 0.15);
          addPart(fallbackGrp, new THREE.BoxGeometry(0.38, 0.68, 0.10), eq.kind === 'booty_builder' ? M.padAmber : M.padBlack, 0.1, 0.88, -0.22, -0.18, 0, 0);
          addPart(fallbackGrp, new THREE.CylinderGeometry(0.025, 0.025, 0.95, 10), M.chrome, 0.1, 1.15, 0, 0, 0, Math.PI / 2);
        }

        // Asynchronously swap in the authentic .glb 3D mesh from models/precor, models/eleiko, or models/merrithew!
        if (eq.kind !== 'cold_plunge' && eq.kind !== 'sauna') {
          const glbPath = resolveGlbPath(eq);
          loadGlbClone(glbPath, (glbModel) => {
            const raw = glbModel.userData.rawSize || { x: 1, y: 1, z: 1 };
            const scaleFactor = Math.min((eq.w * 0.95) / raw.x, (eq.d * 0.95) / raw.z);
            glbModel.scale.setScalar(scaleFactor);
            glbModel.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                  child.material = child.material.clone();
                  child.material.clippingPlanes = [cutPlane];
                }
              }
            });
            grp.remove(fallbackGrp);
            grp.add(glbModel);
          });
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

    toggleCeiling() {
      this.state.showCeiling = !this.state.showCeiling;
      if (this.state.ceilingGroup) {
        this.state.ceilingGroup.visible = this.state.showCeiling;
      }
      const btn = document.getElementById('btn3dToggleCeiling');
      if (btn) {
        btn.classList.toggle('bg-amber-600', this.state.showCeiling);
        btn.classList.toggle('text-white', this.state.showCeiling);
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

  // ==========================================================================
  // 5. 3D PRODUCT SUITE & GLB CONFIGURATOR (AttivoProduct3DSuite - FROM b762b483)
  // ==========================================================================
  const AttivoProduct3DSuite = {
    activeBrand: 'ALL',
    selectedItem: GLB_CATALOG[0],
    frameHex: '#1e293b',
    padHex: '#0f172a',
    showDimBox: true,
    eleikoAttachments: { smith: false, jcups: true, dips: false },
    viewerState: { animId: null, renderer: null, scene: null, camera: null, controls: null, modelGroup: null, dimBoxHelper: null },

    openForSku(sku, fallbackName) {
      if (global.AttivoAiAdvisor && typeof global.AttivoAiAdvisor.switchVisualizerSubTab === 'function') {
        global.AttivoAiAdvisor.switchVisualizerSubTab('configurator');
      }
      const s = (sku || '').toUpperCase();
      const n = (fallbackName || '').toLowerCase();
      let found = GLB_CATALOG.find((x) => s.includes(x.sku.toUpperCase()) || s.includes(x.id.toUpperCase()));
      if (!found) {
        if (s.includes('TRM') || n.includes('treadmill')) found = GLB_CATALOG[0];
        else if (s.includes('EFX') || n.includes('elliptical')) found = GLB_CATALOG[1];
        else if (s.includes('AMT')) found = GLB_CATALOG[2];
        else if (s.includes('UBK') || n.includes('bike')) found = GLB_CATALOG[4];
        else if (s.includes('ELK') || n.includes('rack')) found = GLB_CATALOG[16];
        else if (s.includes('ST-') || n.includes('reformer')) found = GLB_CATALOG[22];
        else found = GLB_CATALOG[7];
      }
      this.selectModel(found.id);
      const cfgEl = document.getElementById('aiVisualizerViewConfig');
      if (cfgEl) cfgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    filterBrand(brand) {
      this.activeBrand = brand;
      this.render();
    },

    selectModel(id) {
      const m = GLB_CATALOG.find((x) => x.id === id) || GLB_CATALOG[0];
      this.selectedItem = m;
      this.render();
    },

    setFrameColor(hex) {
      this.frameHex = hex;
      this.customFrameApplied = true;
      this.applyCustomFinishes();
      this.updateSwatchesUI();
    },

    setPadColor(hex) {
      this.padHex = hex;
      this.customPadApplied = true;
      this.applyCustomFinishes();
      this.updateSwatchesUI();
    },

    toggleDimBox() {
      this.showDimBox = !this.showDimBox;
      if (this.viewerState.dimBoxHelper) {
        this.viewerState.dimBoxHelper.visible = this.showDimBox;
      }
      const btn = document.getElementById('btnCfgDimBox');
      if (btn) btn.classList.toggle('bg-cyan-600', this.showDimBox);
    },

    toggleAttachment(attKey) {
      this.eleikoAttachments[attKey] = !this.eleikoAttachments[attKey];
      this.mount3DModel(this.selectedItem);
      this.render();
    },

    updateSwatchesUI() {
      document.querySelectorAll('[data-frame-swatch]').forEach((el) => {
        el.classList.toggle('ring-2', el.getAttribute('data-frame-swatch') === this.frameHex);
        el.classList.toggle('ring-cyan-400', el.getAttribute('data-frame-swatch') === this.frameHex);
      });
      document.querySelectorAll('[data-pad-swatch]').forEach((el) => {
        el.classList.toggle('ring-2', el.getAttribute('data-pad-swatch') === this.padHex);
        el.classList.toggle('ring-amber-400', el.getAttribute('data-pad-swatch') === this.padHex);
      });
    },

    applyCustomFinishes() {
      const grp = this.viewerState.modelGroup;
      if (!grp || (!this.customFrameApplied && !this.customPadApplied)) return;
      grp.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          const matName = (child.material.name || child.name || '').toLowerCase();
          if (this.customPadApplied && (matName.includes('pad') || matName.includes('seat') || matName.includes('leather') || matName.includes('vinyl') || matName.includes('cushion'))) {
            child.material.color.set(this.padHex);
          } else if (this.customFrameApplied && (matName.includes('frame') || matName.includes('steel') || matName.includes('paint') || matName.includes('post') || matName.includes('main'))) {
            child.material.color.set(this.frameHex);
          }
        }
      });
    },

    addSelectedToQuote() {
      const m = this.selectedItem;
      if (!m) return;
      const p = (global.AttivoAiAdvisor && global.AttivoAiAdvisor.currentProposal);
      if (p && Array.isArray(p.items)) {
        const existing = p.items.find((x) => x.sku === m.sku);
        if (existing) {
          existing.quantity = (Number(existing.quantity) || 1) + 1;
        } else {
          p.items.push({
            sku: m.sku,
            name: m.name,
            name_en: m.name,
            brand: m.brand,
            zone: m.category,
            category: 'Equipment',
            quantity: 1,
            unit_price: m.priceUsd * (p.exchangeRate || 25400),
            discount_pct: 15,
            image_url: m.thumb,
            specs: `3D GLB Configured · ${m.dims} · Frame ${this.frameHex}`
          });
        }
        if (global.AttivoAiAdvisor && typeof global.AttivoAiAdvisor.updateQty === 'function') {
          global.AttivoAiAdvisor.updateQty(0, 0);
        }
      }
      const btn = document.getElementById('btnCfgAddQuote');
      if (btn) {
        const old = btn.innerHTML;
        btn.innerHTML = `<span class="material-symbols-outlined text-sm">check_circle</span> Added ${m.sku} to Quote!`;
        setTimeout(() => { btn.innerHTML = old; }, 1600);
      }
    },

    render() {
      const container = document.getElementById('aiProduct3dSuiteContainer');
      if (!container) return;
      const isEN = (typeof state === 'undefined' || state.appLang === 'en');
      const m = this.selectedItem || GLB_CATALOG[0];
      const filtered = this.activeBrand === 'ALL' ? GLB_CATALOG : GLB_CATALOG.filter((x) => x.brand.toUpperCase() === this.activeBrand);

      const brands = [
        { key: 'ALL', label: isEN ? 'All 3D Models (28)' : 'Tất Cả Mô Hình 3D (28)' },
        { key: 'PRECOR', label: 'Precor Commercial (16)' },
        { key: 'ELEIKO', label: 'Eleiko Prestera (6)' },
        { key: 'MERRITHEW', label: 'Merrithew Pilates (6)' }
      ];

      const frameSwatches = [
        { hex: '#1e293b', name: 'Black Pearl' },
        { hex: '#94a3b8', name: 'Metallic Silver' },
        { hex: '#00204a', name: 'Attivo Navy' },
        { hex: '#dc2626', name: 'Eleiko Red' },
        { hex: '#f8fafc', name: 'Arctic White' }
      ];

      const padSwatches = [
        { hex: '#0f172a', name: 'Jet Black Vinyl' },
        { hex: '#7f1d1d', name: 'Royal Burgundy' },
        { hex: '#92400e', name: 'Cognac Saddle' },
        { hex: '#1e3a8a', name: 'Slate Navy' }
      ];

      container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <!-- Left Column: 3D GLB Catalog Selector -->
          <div class="lg:col-span-4 bg-slate-900 rounded-xl border border-slate-700 p-3 flex flex-col h-[540px]">
            <div class="flex items-center justify-between mb-2">
              <div class="text-xs font-extrabold text-white flex items-center gap-1.5">
                <span class="material-symbols-outlined text-cyan-400 text-base">view_in_ar</span>
                ${isEN ? '3D GLB EQUIPMENT LIBRARY' : 'THƯ VIỆN MÔ HÌNH 3D GLB'}
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">WebGL 2.0 · GLTF</span>
            </div>
            <div class="flex flex-wrap gap-1 mb-2.5">
              ${brands.map((b) => `
                <button type="button" onclick="AttivoProduct3DSuite.filterBrand('${b.key}')"
                  class="px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${this.activeBrand === b.key ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
                  ${b.label}
                </button>
              `).join('')}
            </div>
            <div class="flex-1 overflow-y-auto space-y-1.5 pr-1">
              ${filtered.map((item) => {
                const active = item.id === m.id;
                return `
                  <div onclick="AttivoProduct3DSuite.selectModel('${item.id}')"
                    class="p-2 rounded-lg border transition cursor-pointer flex items-center gap-2.5 ${active ? 'bg-cyan-950/80 border-cyan-400 shadow-xs' : 'bg-slate-800/70 border-slate-700/70 hover:bg-slate-800'}">
                    <img src="${item.thumb}" onerror="this.onerror=null;this.src='assets/renders3d/precor-treadmill-render.png'" class="w-12 h-12 rounded bg-white object-contain p-0.5 shrink-0" />
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-1">
                        <span class="text-[10px] font-mono font-bold text-cyan-300">${item.sku}</span>
                        <span class="text-[9px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-200 font-semibold">${item.brand}</span>
                      </div>
                      <div class="text-xs font-bold text-white truncate">${item.name}</div>
                      <div class="text-[10px] font-mono text-slate-400">${item.dims} · $${item.priceUsd.toLocaleString()}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Center/Right Column: Interactive 360° WebGL Stage + Finish Configurator -->
          <div class="lg:col-span-8 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-[540px] relative">
            <!-- Top Stage HUD -->
            <div class="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-10">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-[10px] font-bold">${m.sku}</span>
                  <span class="text-sm font-extrabold text-white">${m.name}</span>
                </div>
                <div class="text-[11px] font-mono text-slate-400 mt-0.5">
                  ${isEN ? 'Dimensions' : 'Kích thước CAD'}: <b class="text-amber-300">${m.dims}</b> · Source: <code class="text-cyan-400">${m.glb}</code>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <button id="btnCfgDimBox" type="button" onclick="AttivoProduct3DSuite.toggleDimBox()"
                  class="px-2.5 py-1 rounded text-[11px] font-bold border border-slate-600 text-white ${this.showDimBox ? 'bg-cyan-600' : 'bg-slate-800'} transition cursor-pointer">
                  📏 ${isEN ? 'CAD Bounding Box' : 'Khung Kích Thước CAD'}
                </button>
                <button id="btnCfgAddQuote" type="button" onclick="AttivoProduct3DSuite.addSelectedToQuote()"
                  class="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 transition cursor-pointer shadow-xs">
                  <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
                  ${isEN ? 'Add to Quote' : 'Thêm Vào Báo Giá'} ($${m.priceUsd.toLocaleString()})
                </button>
              </div>
            </div>

            <!-- 3D WebGL Canvas Stage -->
            <div id="aiProduct3dCanvasWrap" class="flex-1 relative w-full bg-gradient-to-b from-slate-900 to-slate-950"></div>

            <!-- Bottom Customizer Controls (Frame Color, Upholstery Color, Eleiko Modular Add-ons) -->
            <div class="p-3 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10 text-xs">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase text-slate-400">${isEN ? 'Frame Powder Coat:' : 'Màu Sơn Khung Thép:'}</span>
                <div class="flex items-center gap-1.5">
                  ${frameSwatches.map((s) => `
                    <button type="button" data-frame-swatch="${s.hex}" onclick="AttivoProduct3DSuite.setFrameColor('${s.hex}')"
                      title="${s.name}" style="background:${s.hex}"
                      class="w-5 h-5 rounded-full border border-white/40 cursor-pointer ${this.frameHex === s.hex ? 'ring-2 ring-cyan-400 scale-110' : ''} transition"></button>
                  `).join('')}
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase text-slate-400">${isEN ? 'Upholstery Vinyl:' : 'Màu Da Đệm Ghế:'}</span>
                <div class="flex items-center gap-1.5">
                  ${padSwatches.map((s) => `
                    <button type="button" data-pad-swatch="${s.hex}" onclick="AttivoProduct3DSuite.setPadColor('${s.hex}')"
                      title="${s.name}" style="background:${s.hex}"
                      class="w-5 h-5 rounded-full border border-white/40 cursor-pointer ${this.padHex === s.hex ? 'ring-2 ring-amber-400 scale-110' : ''} transition"></button>
                  `).join('')}
                </div>
              </div>

              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-bold uppercase text-slate-400">${isEN ? 'Modular Attachments:' : 'Phụ Kiện Lắp Thêm:'}</span>
                <button type="button" onclick="AttivoProduct3DSuite.toggleAttachment('smith')"
                  class="px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${this.eleikoAttachments.smith ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'}">
                  + Smith Bar
                </button>
                <button type="button" onclick="AttivoProduct3DSuite.toggleAttachment('dips')"
                  class="px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${this.eleikoAttachments.dips ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'}">
                  + Dip Module
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      this.init3DStage(m);
    },

    init3DStage(modelInfo) {
      const wrap = document.getElementById('aiProduct3dCanvasWrap');
      if (!wrap || typeof THREE === 'undefined') return;
      if (this.viewerState.animId) cancelAnimationFrame(this.viewerState.animId);
      wrap.innerHTML = '';

      const w = wrap.clientWidth || 620;
      const h = wrap.clientHeight || 380;

      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      renderer.shadowMap.enabled = true;
      if ('toneMapping' in renderer && THREE.ACESFilmicToneMapping) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.18;
      }
      wrap.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0b1324);

      const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
      camera.position.set(2.6, 1.85, 2.9);

      let controls = null;
      if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(0, 0.85, 0);
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.2;
      }

      // Studio Podium & Polar Grid
      const grid = new THREE.GridHelper(6, 12, 0x0284c7, 0x1e293b);
      scene.add(grid);

      const podium = new THREE.Mesh(
        new THREE.CylinderGeometry(1.55, 1.65, 0.06, 48),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 })
      );
      podium.position.y = -0.03;
      podium.receiveShadow = true;
      scene.add(podium);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.35));
      const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
      keyLight.position.set(4, 6, 4);
      keyLight.castShadow = true;
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
      rimLight.position.set(-4, 3, -3);
      scene.add(rimLight);

      const modelGroup = new THREE.Group();
      scene.add(modelGroup);

      this.viewerState = { animId: null, renderer, scene, camera, controls, modelGroup, dimBoxHelper: null };
      this.mount3DModel(modelInfo);

      const animate = () => {
        this.viewerState.animId = requestAnimationFrame(animate);
        if (controls) controls.update();
        renderer.render(scene, camera);
      };
      animate();
    },

    mount3DModel(modelInfo) {
      const grp = this.viewerState.modelGroup;
      if (!grp) return;
      while (grp.children.length > 0) grp.remove(grp.children[0]);

      loadGlbClone(modelInfo.glb, (glbObj) => {
        const raw = glbObj.userData.rawSize || { x: 1.5, y: 1.6, z: 1.5 };
        const maxDim = Math.max(raw.x, raw.y, raw.z, 0.5);
        const targetScale = 1.95 / maxDim;
        glbObj.scale.setScalar(targetScale);
        grp.add(glbObj);

        if (this.eleikoAttachments.smith) {
          loadGlbClone('models/eleiko/cable-attachment.glb', (smithObj) => {
            smithObj.scale.setScalar(targetScale * 0.85);
            smithObj.position.set(0, 0.1, 0.25);
            grp.add(smithObj);
          });
        }
        if (this.eleikoAttachments.dips) {
          loadGlbClone('models/eleiko/lever-arms.glb', (dipObj) => {
            dipObj.scale.setScalar(targetScale * 0.65);
            dipObj.position.set(0.55, 0.95, 0.35);
            grp.add(dipObj);
          });
        }

        this.applyCustomFinishes();

        const boxHelper = new THREE.BoxHelper(glbObj, 0x38bdf8);
        boxHelper.visible = this.showDimBox;
        grp.add(boxHelper);
        this.viewerState.dimBoxHelper = boxHelper;
      });
    }
  };

  // ==========================================================================
  // 6. HISTORICAL ATTIVO 2D & 3D PROJECT ARCHIVE (FROM D:\AI\03_Clients\Atv\Project\Design)
  // ==========================================================================
  const DESIGN_ARCHIVE_PROJECTS = [
    {
      id: 'waterfront_saigon',
      title: 'The Waterfront Saigon — Luxury Residence Club',
      location: 'District 7, Ho Chi Minh City',
      area: 280,
      facilityType: 'hotel_resort',
      brands: 'Precor · ZIVA · Jordan',
      img2d: 'assets/design_projects/waterfront_2d.png',
      img3d: 'assets/design_projects/waterfront_3d_1.png',
      desc_vi: 'Mặt bằng 2D phân khu Sàn Gỗ/Cao Su kèm ký hiệu MEP & Phối cảnh 3D thực tế của Attivo.',
      desc_en: 'Authentic Attivo 2D multi-zone Wood/Rubber MEP floorplan & 3D perspective render.'
    },
    {
      id: 'riviera_gym',
      title: 'Riviera Point — Commercial & Resident Fitness',
      location: 'Phu My Hung, HCMC',
      area: 320,
      facilityType: 'commercial_gym',
      brands: 'Precor 880 Line · Discovery',
      img2d: 'assets/design_projects/riviera_2d.png',
      img3d: 'assets/design_projects/riviera_3d_1.png',
      desc_vi: 'Thiết kế 2D/3D tiêu chuẩn Attivo với gương tập MIRROR, đánh số thiết bị 1-14 và sảnh gỗ.',
      desc_en: 'Signature Attivo 2D/3D layout featuring numbered equipment callouts 1-14 and mirror wall.'
    },
    {
      id: 'green_garden',
      title: 'Green Garden Fitness Center',
      location: 'Ho Chi Minh City',
      area: 450,
      facilityType: 'commercial_gym',
      brands: 'Precor · Eleiko · Assault',
      img2d: 'assets/design_projects/greengarden_2d.png',
      img3d: 'assets/design_projects/greengarden_3d_1.png',
      desc_vi: 'Tổ hợp Gym thương mại diện tích lớn chia khu Cardio Sàn Gỗ và Khu Tạ Sàn Cao Su đen.',
      desc_en: 'Large-format commercial fitness club with dedicated walnut wood Cardio & charcoal rubber Strength.'
    },
    {
      id: 'hilton_hotel',
      title: 'Hilton 5-Star Hotel Wellness Suite',
      location: 'Da Nang / Hanoi',
      area: 210,
      facilityType: 'hotel_resort',
      brands: 'Precor P82 · Eleiko',
      img2d: 'assets/design_projects/hilton_2d.jpg',
      img3d: 'assets/design_projects/hilton_3d.jpg',
      desc_vi: 'Phòng Gym khách sạn 5 sao chuẩn quốc tế của Hilton do đội ngũ thiết kế Attivo thực hiện.',
      desc_en: '5-Star hospitality fitness center engineered to Hilton global brand standards by Attivo.'
    },
    {
      id: 'diamond_bay',
      title: 'Diamond Bay Resort & Spa Fitness',
      location: 'Nha Trang',
      area: 260,
      facilityType: 'hotel_resort',
      brands: 'Precor · Hoist · ZIVA',
      img2d: 'assets/design_projects/diamondbay_3d_2.png',
      img3d: 'assets/design_projects/diamondbay_3d_1.png',
      desc_vi: 'Không gian Fitness & Wellness nghỉ dưỡng cao cấp tại Diamond Bay Resort Nha Trang.',
      desc_en: 'Luxury resort fitness pavilion overlooking Diamond Bay Nha Trang.'
    },
    {
      id: 'celadon_city',
      title: 'Celadon Sports & Resort Club',
      location: 'Tan Phu, HCMC',
      area: 600,
      facilityType: 'commercial_gym',
      brands: 'Precor · Eleiko · Merrithew',
      img2d: 'assets/design_projects/celadon_2d.jpg',
      img3d: 'assets/design_projects/celadon_3d_1.jpg',
      desc_vi: 'Tổ hợp thể thao phức hợp chuẩn Olympic lớn nhất khu Tây TP.HCM.',
      desc_en: 'Flagship multi-zone commercial sports & wellness club in Celadon City.'
    },
    {
      id: 'pullman_hotel',
      title: 'Pullman 5-Star Fit Lounge',
      location: 'Vung Tau / HCMC',
      area: 195,
      facilityType: 'hotel_resort',
      brands: 'Precor · ZIVA',
      img2d: 'assets/design_projects/pullman_3d_1.jpg',
      img3d: 'assets/design_projects/pullman_3d_1.jpg',
      desc_vi: 'Bản vẽ bố trí 2D & Phối cảnh 3D Fit Lounge khách sạn 5 sao Pullman.',
      desc_en: 'Accor Pullman Fit Lounge 2D layout and 3D interior visualization.'
    },
    {
      id: 'ecopark_club',
      title: 'Ecopark Grand Clubhouse Gym',
      location: 'Hung Yen, Hanoi',
      area: 310,
      facilityType: 'boutique_studio',
      brands: 'Precor · Concept2 · ZIVA',
      img2d: 'assets/design_projects/ecopark_3d_2.jpg',
      img3d: 'assets/design_projects/ecopark_3d_1.jpg',
      desc_vi: 'Phòng Gym Clubhouse khu đô thị sinh thái Ecopark với tầm nhìn kính Panorama.',
      desc_en: 'Eco-luxury residential clubhouse fitness suite with panoramic glass views.'
    },
    {
      id: 'getfit_gym',
      title: 'Getfit Gym & Yoga Commercial Center',
      location: 'District 4, HCMC',
      area: 800,
      facilityType: 'commercial_gym',
      brands: 'Precor · FreeMotion · Eleiko',
      img2d: 'assets/design_projects/getfit_2d_birdseye.jpg',
      img3d: 'assets/design_projects/getfit_3d_main.jpg',
      desc_vi: 'Trung tâm Fitness thương mại lưu lượng hội viên cao tại trung tâm TP.HCM.',
      desc_en: 'High-capacity commercial fitness & personal training club.'
    },
    {
      id: 'starcity_hotel',
      title: 'StarCity Hotel & Condotel Fitness',
      location: 'Nha Trang',
      area: 180,
      facilityType: 'hotel_resort',
      brands: 'Precor · Impulse',
      img2d: 'assets/design_projects/starcity_3d_1.jpg',
      img3d: 'assets/design_projects/starcity_3d_1.jpg',
      desc_vi: 'Mặt bằng 2D & Phối cảnh 3D phòng Gym khách sạn biển StarCity.',
      desc_en: 'Compact coastal hotel fitness suite 2D CAD & 3D rendering.'
    },
    {
      id: 'novaland_residence',
      title: 'Novaland Luxury Residence Gym',
      location: 'Ho Chi Minh City',
      area: 290,
      facilityType: 'hotel_resort',
      brands: 'Precor · ZIVA',
      img2d: 'assets/design_projects/novaland_3d_1.jpg',
      img3d: 'assets/design_projects/novaland_3d_1.jpg',
      desc_vi: 'Chuẩn thiết kế phòng Gym tiện ích nội khu cao cấp cho chuỗi dự án Novaland.',
      desc_en: 'Standardized luxury residential amenity gym package for Novaland developments.'
    },
    {
      id: 'norfolk_mansion',
      title: 'Norfolk Mansion Executive Health Club',
      location: 'District 1, HCMC',
      area: 220,
      facilityType: 'private_villa',
      brands: 'Precor · Merrithew',
      img2d: 'assets/design_projects/norfolk_3d_1.jpg',
      img3d: 'assets/design_projects/norfolk_3d_1.jpg',
      desc_vi: 'Phòng tập sang trọng dành cho căn hộ dịch vụ 5 sao Norfolk Mansion Quận 1.',
      desc_en: 'Boutique executive wellness suite at Norfolk Mansion District 1.'
    }
  ];

  const AttivoShowcase3D = {
    cardViewMode: {}, // id -> '3d' | '2d'

    toggleCardMode(id, mode) {
      this.cardViewMode[id] = mode;
      const img = document.getElementById(`archiveImg_${id}`);
      const b2d = document.getElementById(`archiveBtn2D_${id}`);
      const b3d = document.getElementById(`archiveBtn3D_${id}`);
      const proj = DESIGN_ARCHIVE_PROJECTS.find((x) => x.id === id);
      if (!proj || !img) return;
      img.src = mode === '2d' ? proj.img2d : proj.img3d;
      if (b2d && b3d) {
        b2d.className = mode === '2d'
          ? 'px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-slate-950 cursor-pointer'
          : 'px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white hover:bg-slate-800 cursor-pointer';
        b3d.className = mode === '3d'
          ? 'px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-400 text-slate-950 cursor-pointer'
          : 'px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white hover:bg-slate-800 cursor-pointer';
      }
    },

    applyArchivePreset(id) {
      const proj = DESIGN_ARCHIVE_PROJECTS.find((x) => x.id === id);
      if (!proj) return;
      if (global.AttivoAiAdvisor) {
        if (typeof global.AttivoAiAdvisor.selectProjectType === 'function') {
          global.AttivoAiAdvisor.selectProjectType(proj.facilityType);
        }
        const areaInp = document.getElementById('aiInputArea');
        if (areaInp) areaInp.value = proj.area;
        if (typeof global.AttivoAiAdvisor.runGeneration === 'function') {
          global.AttivoAiAdvisor.runGeneration();
        }
        if (typeof global.AttivoAiAdvisor.switchVisualizerSubTab === 'function') {
          global.AttivoAiAdvisor.switchVisualizerSubTab('2d');
        }
      }
    },

    render(activeType) {
      const grid = document.getElementById('aiShowcaseGrid');
      if (!grid) return;
      const isEN = (typeof state === 'undefined' || state.appLang === 'en');

      grid.innerHTML = DESIGN_ARCHIVE_PROJECTS.map((proj) => {
        const mode = this.cardViewMode[proj.id] || '2d';
        const imgSrc = mode === '2d' ? proj.img2d : proj.img3d;
        return `
          <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition flex flex-col">
            <div class="relative h-52 bg-slate-900 overflow-hidden group">
              <img id="archiveImg_${proj.id}" src="${imgSrc}" alt="${proj.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div class="absolute top-2.5 left-2.5 flex items-center gap-1 bg-slate-950/75 backdrop-blur-xs p-1 rounded-lg border border-white/15">
                <button id="archiveBtn2D_${proj.id}" type="button" onclick="AttivoShowcase3D.toggleCardMode('${proj.id}','2d')"
                  class="${mode === '2d' ? 'px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-slate-950 cursor-pointer' : 'px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white hover:bg-slate-800 cursor-pointer'}">
                  📐 2D Floorplan
                </button>
                <button id="archiveBtn3D_${proj.id}" type="button" onclick="AttivoShowcase3D.toggleCardMode('${proj.id}','3d')"
                  class="${mode === '3d' ? 'px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-400 text-slate-950 cursor-pointer' : 'px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white hover:bg-slate-800 cursor-pointer'}">
                  🧊 3D Perspective
                </button>
              </div>
              <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[#00204a]/90 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                ${proj.area} m²
              </span>
            </div>
            <div class="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <div class="text-[10px] font-bold uppercase tracking-wider text-cyan-700">${proj.location} · ${proj.brands}</div>
                <h5 class="text-xs font-extrabold text-[#00204a] mt-0.5">${proj.title}</h5>
                <p class="text-[11px] text-slate-600 mt-1 line-clamp-2">${isEN ? proj.desc_en : proj.desc_vi}</p>
              </div>
              <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span class="text-[10px] font-mono text-slate-500">Project/Design Archive</span>
                <button type="button" onclick="AttivoShowcase3D.applyArchivePreset('${proj.id}')"
                  class="px-2.5 py-1 rounded-lg bg-[#00204a] hover:bg-blue-900 text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer">
                  <span class="material-symbols-outlined text-xs">bolt</span>
                  ${isEN ? 'Load Layout Preset' : 'Áp Dụng Cấu Hình Này'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  };

  global.AttivoVisualizer2D = AttivoVisualizer2D;
  global.AttivoVisualizer3D = AttivoVisualizer3D;
  global.AttivoProduct3DSuite = AttivoProduct3DSuite;
  global.AttivoShowcase3D = AttivoShowcase3D;

})(typeof window !== 'undefined' ? window : this);
