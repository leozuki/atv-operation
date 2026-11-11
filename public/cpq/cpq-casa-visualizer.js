/**
 * ATTIVO INTERNATIONAL — INTERACTIVE 2D AUTOCAD FLOORPLAN & 3D GLB ROOM PLANNER ENGINE (v4.0)
 * ============================================================================================
 * Built from:
 *  1. Authentic 3D Room Planner Engine (`b762b483-4075-424e-8576-faca14df81e1`):
 *     - 100% Real `.glb` 3D models (`models/precor/*.glb`, `models/eleiko/*.glb`, `models/merrithew/*.glb`, `models/*.glb`)
 *     - Architectural Dual-Zone Flooring (Engineered Oak Wood + PaviFLEX Rubber + Sprint Turf + 1m CAD Grid)
 *     - Auxiliary Core Block (WC/Locker/Elevator) with Double Glass Entrance Doors, Curtain Glass Facades,
 *       500x500mm Structural Columns with Attivo Blue Band, Mirrors, Potted Plants & Stretching Zone
 *     - Smart Cutaway Walls (`updateWallCutaways`) + Interactive 3D Click/Drag/Rotate/Duplicate/Delete
 *  2. Authentic Interactive 2D AutoCAD Floorplan (`D:\AI\03_Clients\Atv\Project\Design\`):
 *     - Multi-part vector AutoCAD equipment symbols matching Precor/Eleiko/Merrithew CAD blocks
 *     - Full interactive 2D manipulation: Click to Select, Drag & Drop to Move, Rotate (-45/+45/90 or [R]),
 *       Duplicate, Delete ([Delete]), synced bi-directionally with the 3D Room Planner!
 *  3. Populated 3D Showcase & Archive (`#aiShowcaseContainer`):
 *     - 12 historical Attivo 2D CAD + 3D Perspective projects (`assets/design_projects/`) + 4 Studio 3D Renders (`assets/renders3d/`)
 */

(function (global) {
  'use strict';

  function isAppEnglish() {
    return typeof global.state !== 'undefined' && global.state && global.state.appLang === 'en';
  }

  // ============================================================================
  // 1. REAL .GLB 3D MODEL CATALOG & EQUIPMENT SPECIFICATIONS
  // ============================================================================
  const GLB_CATALOG = {
    treadmill:       { glb: 'models/precor/precor-treadmill.glb',          w: 0.94, d: 2.11, h: 1.58, clearance: 0.60, label: 'Precor TRM 885 Treadmill' },
    elliptical:      { glb: 'models/precor/precor-efx.glb',                w: 0.78, d: 2.08, h: 1.72, clearance: 0.50, label: 'Precor EFX 885 CrossRamp' },
    amt:             { glb: 'models/precor/precor-amt.glb',                w: 0.89, d: 2.03, h: 1.75, clearance: 0.50, label: 'Precor AMT 885 Open Stride' },
    stairclimber:    { glb: 'models/precor/precor-stairclimber.glb',       w: 0.89, d: 1.50, h: 2.13, clearance: 0.50, label: 'Precor SCL 885 StairClimber' },
    bike:            { glb: 'models/precor/precor-upright-bike.glb',       w: 0.61, d: 1.25, h: 1.47, clearance: 0.45, label: 'Precor UBK/RBK 885 Bike' },
    airbike:         { glb: 'models/precor/precor-airbike.glb',            w: 0.66, d: 1.32, h: 1.35, clearance: 0.45, label: 'Assault / Precor AirBike' },
    rower:           { glb: 'models/precor/precor-row.glb',                w: 0.62, d: 2.42, h: 1.06, clearance: 0.45, label: 'Concept2 / Precor RowErg' },
    selectorized:    { glb: 'models/precor/precor-chest-press.glb',        w: 1.35, d: 1.48, h: 1.65, clearance: 0.55, label: 'Precor Resolute Selectorized' },
    lat_pulldown:    { glb: 'models/precor/precor-lat-pulldown.glb',       w: 1.22, d: 1.55, h: 2.12, clearance: 0.55, label: 'Precor Resolute Lat Pulldown' },
    seated_row:      { glb: 'models/precor/precor-seated-row.glb',         w: 1.25, d: 1.52, h: 1.65, clearance: 0.55, label: 'Precor Resolute Seated Row' },
    leg_extension:   { glb: 'models/precor/precor-leg-extension.glb',      w: 1.28, d: 1.42, h: 1.58, clearance: 0.55, label: 'Precor Resolute Leg Extension' },
    cable_crossover: { glb: 'models/precor/precor-fts-glide.glb',          w: 1.65, d: 1.25, h: 2.16, clearance: 0.70, label: 'Precor FTS Glide / Resolute DAP' },
    power_rack:      { glb: 'models/prestera-rack.glb',                    w: 1.85, d: 2.15, h: 2.38, clearance: 0.75, label: 'Eleiko Prestera Power Rack + Platform' },
    half_rack:       { glb: 'models/eleiko/half-rack-full.glb',            w: 1.75, d: 1.85, h: 2.35, clearance: 0.70, label: 'Eleiko Prestera Half Rack Suite' },
    double_rack:     { glb: 'models/double-half-rack.glb',                 w: 1.95, d: 2.60, h: 2.38, clearance: 0.80, label: 'Eleiko Prestera Double Half Rack' },
    smith_machine:   { glb: 'models/precor/precor-smith-machine.glb',      w: 2.05, d: 1.42, h: 2.28, clearance: 0.65, label: 'Precor Discovery Smith Machine' },
    leg_press:       { glb: 'models/precor/precor-angled-leg-press.glb',   w: 1.52, d: 2.32, h: 1.58, clearance: 0.65, label: 'Precor Discovery Angled Leg Press' },
    hack_squat:      { glb: 'models/precor/precor-hack-squat.glb',         w: 1.50, d: 2.25, h: 1.58, clearance: 0.65, label: 'Precor Discovery Hack Squat' },
    bench:           { glb: 'models/precor/precor-olympic-flat-bench.glb', w: 1.28, d: 1.65, h: 1.25, clearance: 0.50, label: 'Precor Olympic / Adjustable Bench' },
    dumbbell_rack:   { glb: 'models/precor/precor-dumbbell-rack.glb',      w: 2.32, d: 0.72, h: 0.88, clearance: 0.60, label: 'Precor 2-Tier 10-Pair Dumbbell Rack' },
    booty_builder:   { glb: 'models/precor/precor-belt-squat.glb',         w: 1.38, d: 1.72, h: 1.28, clearance: 0.55, label: 'Booty Builder Platinum / Belt Squat' },
    reformer:        { glb: 'models/merrithew/merrithew-spx-max.glb',      w: 0.76, d: 2.48, h: 0.68, clearance: 0.55, label: 'Merrithew V2 Max / SPX Reformer' },
    cadillac:        { glb: 'models/merrithew/merrithew-v2max-plus.glb',   w: 0.84, d: 2.58, h: 2.08, clearance: 0.65, label: 'Merrithew V2 Max Plus Rehab Tower' },
    barrel:          { glb: 'models/merrithew/merrithew-ladder-barrel.glb',w: 0.68, d: 1.22, h: 0.98, clearance: 0.45, label: 'Merrithew Ladder Barrel / Spine Corrector' }
  };

  function classifyEquipment(item) {
    const text = `${item.sku || ''} ${item.name || ''} ${item.brand || ''} ${item.category || ''}`.toUpperCase();
    if (/REFORMER|SPX|MERRITHEW.*MAX/.test(text) && !/PLUS|TOWER|CADILLAC/.test(text)) return 'reformer';
    if (/CADILLAC|TRAPEZE|V2.*PLUS|TOWER/.test(text)) return 'cadillac';
    if (/BARREL|SPINE|CHAIR|PILATES/.test(text)) return 'barrel';
    if (/TRM|TREADMILL|CHẠY BỘ|AIRRUNNER/.test(text)) return 'treadmill';
    if (/AMT|OPEN STRIDE/.test(text)) return 'amt';
    if (/EFX|ELLIPTICAL|TRƯỢT TUYẾT/.test(text)) return 'elliptical';
    if (/SCL|STAIR|CLIMBER|LEO CẦU THANG/.test(text)) return 'stairclimber';
    if (/AIRBIKE|ASSAULT/.test(text)) return 'airbike';
    if (/UBK|RBK|BIKE|XE ĐẠP|SPIN|ICG/.test(text)) return 'bike';
    if (/ROW|CHÈO THUYỀN|SKI/.test(text)) return 'rower';
    if (/PRESTERA.*DOUBLE|DOUBLE.*RACK/.test(text)) return 'double_rack';
    if (/HALF.*RACK|HR/.test(text)) return 'half_rack';
    if (/PRESTERA|POWER RACK|SQUAT RACK|RACK|CAGE|PR300|DPL0802/.test(text)) return 'power_rack';
    if (/SMITH/.test(text)) return 'smith_machine';
    if (/HACK SQUAT|PENDULUM/.test(text)) return 'hack_squat';
    if (/LEG PRESS|ĐẠP ĐÙI/.test(text)) return 'leg_press';
    if (/DAP|FTS|CABLE|CROSSOVER|PULLEY|FUNCTIONAL/.test(text)) return 'cable_crossover';
    if (/DUMBBELL|TẠ TAY|DBR|RACK.*TẠ/.test(text)) return 'dumbbell_rack';
    if (/BOOTY|HIP THRUST|GLUTE|BELT SQUAT/.test(text)) return 'booty_builder';
    if (/LAT PULLDOWN|PULLDOWN|KÉO XÔ/.test(text)) return 'lat_pulldown';
    if (/SEATED ROW|LOW ROW/.test(text)) return 'seated_row';
    if (/LEG EXTENSION|LEG CURL|ĐÁ ĐÙI/.test(text)) return 'leg_extension';
    if (/BENCH|GHẾ TẠ|OPT|DBR0/.test(text)) return 'bench';
    return 'selectorized';
  }

  function resolveGlbPath(item, kind) {
    const sku = (item.sku || '').toUpperCase();
    const name = (item.name || '').toUpperCase();
    if (sku.includes('TRM') || name.includes('TREADMILL')) return 'models/precor/precor-treadmill.glb';
    if (sku.includes('AMT') || name.includes('AMT')) return 'models/precor/precor-amt.glb';
    if (sku.includes('EFX') || name.includes('ELLIPTICAL')) return 'models/precor/precor-efx.glb';
    if (sku.includes('SCL') || name.includes('STAIR')) return 'models/precor/precor-stairclimber.glb';
    if (sku.includes('RBK')) return 'models/precor/precor-bike-comm.glb';
    if (sku.includes('UBK') || name.includes('BIKE')) return 'models/precor/precor-upright-bike.glb';
    if (name.includes('ROW')) return 'models/precor/precor-row.glb';
    if (sku.includes('FTS') || name.includes('FTS')) return 'models/precor/precor-fts-glide.glb';
    if (sku.includes('DAP') || name.includes('DUAL ADJUSTABLE')) return 'models/precor/precor-resolute-dap.glb';
    if (name.includes('LAT PULL')) return 'models/precor/precor-lat-pulldown.glb';
    if (name.includes('SEATED ROW')) return 'models/precor/precor-seated-row.glb';
    if (name.includes('LEG EXT') || name.includes('LEG CURL')) return 'models/precor/precor-leg-extension.glb';
    if (name.includes('LEG PRESS')) return 'models/precor/precor-angled-leg-press.glb';
    if (name.includes('HACK SQUAT')) return 'models/precor/precor-hack-squat.glb';
    if (name.includes('SMITH')) return 'models/precor/precor-smith-machine.glb';
    if (name.includes('DUMBBELL')) return 'models/precor/precor-dumbbell-rack.glb';
    if (name.includes('BENCH')) return 'models/precor/precor-olympic-flat-bench.glb';
    if (name.includes('DOUBLE') && name.includes('RACK')) return 'models/double-half-rack.glb';
    if (name.includes('HALF RACK')) return 'models/eleiko/half-rack-full.glb';
    if (name.includes('PRESTERA') || name.includes('POWER RACK')) return 'models/prestera-rack.glb';
    if (name.includes('PLUS') || name.includes('CADILLAC')) return 'models/merrithew/merrithew-v2max-plus.glb';
    if (name.includes('BARREL')) return 'models/merrithew/merrithew-ladder-barrel.glb';
    if (name.includes('REFORMER') || name.includes('MERRITHEW')) return 'models/merrithew/merrithew-spx-max.glb';
    return (GLB_CATALOG[kind] && GLB_CATALOG[kind].glb) || 'models/precor/precor-chest-press.glb';
  }

  // ============================================================================
  // 2. SHARED BI-DIRECTIONAL LAYOUT STATE (2D CAD <-> 3D ROOM PLANNER)
  // ============================================================================
  const layoutState = {
    proposalKey: null,
    proposal: null,
    projectType: 'commercial_gym',
    roomW: 20,
    roomD: 13,
    area: 250,
    placements: [],
    selectedId: null,
    nextUid: 1,
    flooringZones: [],
    selectedFloorZoneId: null,
    activeTool: 'select', // 'select' | 'ruler'
    layers: {
      flooring: true,
      equipment: true,
      dimensions: true,
      clearance: true,
      grid: true
    },
    rulerPoints: []
  };

  function buildDefaultFlooringZones(pType, roomW, roomD) {
    const zones = [];
    let nextFid = 1;
    if (pType === 'pilates_studio') {
      // 1. Sàn Gỗ Maple Toàn Studio
      zones.push({
        id: `fz-${nextFid++}`,
        type: 'wood',
        name: 'Sàn Gỗ Sồi Tự Nhiên (Studio Oak Wood)',
        x: 0,
        z: 0,
        w: Number(roomW.toFixed(2)),
        d: Number(roomD.toFixed(2)),
        color: '#debf93'
      });
      // 2. Vùng Pulastic Apparatus Cushioning Zone
      const pW = Number((roomW * 0.45).toFixed(2));
      const pD = Number((roomD * 0.70).toFixed(2));
      zones.push({
        id: `fz-${nextFid++}`,
        type: 'pulastic',
        name: 'Sàn Đàn Hồi Pulastic Đa Năng (Apparatus Zone)',
        x: Number((roomW / 2 - pW / 2 - 0.4).toFixed(2)),
        z: 0,
        w: pW,
        d: pD,
        color: '#0284c7'
      });
    } else if (pType === 'villa_gym') {
      // 1. Sàn Gỗ Parquet Sang Trọng
      zones.push({
        id: `fz-${nextFid++}`,
        type: 'wood',
        name: 'Sàn Gỗ Parquet Cao Cấp (Cardio & Entrance)',
        x: 0,
        z: 0,
        w: Number(roomW.toFixed(2)),
        d: Number(roomD.toFixed(2)),
        color: '#debf93'
      });
      // 2. Thảm Cao Su PaviFLEX Free Weights Corner
      const rubW = Number((roomW * 0.48).toFixed(2));
      const rubD = Number((roomD * 0.52).toFixed(2));
      zones.push({
        id: `fz-${nextFid++}`,
        type: 'rubber',
        name: 'Thảm Cao Su Chống Va Đập PaviFLEX 15mm',
        x: Number((roomW / 2 - rubW / 2 - 0.3).toFixed(2)),
        z: Number((roomD / 2 - rubD / 2 - 0.3).toFixed(2)),
        w: rubW,
        d: rubD,
        color: '#262930'
      });
    } else if (pType === 'glute_hub') {
      // 1. Thảm Cao Su Toàn Sàn
      zones.push({
        id: `fz-${nextFid++}`,
        type: 'rubber',
        name: 'Thảm Cao Su PaviFLEX Heavy-Duty 20mm',
        x: 0,
        z: 0,
        w: Number(roomW.toFixed(2)),
        d: Number(roomD.toFixed(2)),
        color: '#262930'
      });
      // 2. Cỏ Sprint Track Dọc Tường
      const turfW = Number(Math.min(2.2, roomW * 0.16).toFixed(2));
      const turfD = Number((roomD * 0.88).toFixed(2));
      zones.push({
        id: `fz-${nextFid++}`,
        type: 'turf',
        name: 'Cỏ Nhân Tạo Sled & Lunge Sprint Track',
        x: Number((roomW / 2 - turfW / 2 - 0.4).toFixed(2)),
        z: 0,
        w: turfW,
        d: turfD,
        color: '#15803d'
      });
    } else {
      // Commercial Gym / Hotel Resort: 4-Zone Professional Layout
      zones.push({
        id: `fz-${nextFid++}`,
        type: 'wood',
        name: 'Sàn Gỗ Sồi Kỹ Thuật (Cardio & Gallery)',
        x: 0,
        z: 0,
        w: Number(roomW.toFixed(2)),
        d: Number(roomD.toFixed(2)),
        color: '#debf93'
      });
      const rubW = Number((roomW * 0.68).toFixed(2));
      const rubD = Number((roomD * 0.62).toFixed(2));
      zones.push({
        id: `fz-${nextFid++}`,
        type: 'rubber',
        name: 'Thảm Cao Su Chống Rơi Tạ PaviFLEX 20mm (1000x1000mm)',
        x: Number((-roomW * 0.14).toFixed(2)),
        z: Number((roomD * 0.18).toFixed(2)),
        w: rubW,
        d: rubD,
        color: '#262930'
      });
      const turfW = Number(Math.min(2.2, roomW * 0.14).toFixed(2));
      const turfD = Number((roomD * 0.60).toFixed(2));
      zones.push({
        id: `fz-${nextFid++}`,
        type: 'turf',
        name: 'Đường Chạy Cỏ Sprint & Prowler Sled Track',
        x: Number((roomW * 0.28).toFixed(2)),
        z: Number((roomD * 0.18).toFixed(2)),
        w: turfW,
        d: turfD,
        color: '#15803d'
      });
      const pulW = Number((roomW * 0.22).toFixed(2));
      const pulD = Number((roomD * 0.32).toFixed(2));
      zones.push({
        id: `fz-${nextFid++}`,
        type: 'pulastic',
        name: 'Sàn Thể Thao Đa Năng Pulastic Polyurethane Seamless',
        x: Number((roomW * 0.36).toFixed(2)),
        z: Number((-roomD * 0.28).toFixed(2)),
        w: pulW,
        d: pulD,
        color: '#0284c7'
      });
    }
    return zones;
  }

  function getProposalSignature(proposal) {
    if (!proposal) return 'default';
    const area = proposal.area || proposal.area_m2 || 250;
    const pType = proposal.projectType || proposal.facilityType || 'commercial_gym';
    const brand = proposal.brand || 'all';
    const itemsSig = (proposal.items || []).map(it => `${it.sku}:${it.quantity}`).join('|');
    return `${area}_${pType}_${brand}_${itemsSig}`;
  }

  function buildInitialPlacements(proposal) {
    const area = Math.max(30, Number((proposal && (proposal.area || proposal.area_m2)) || 250));
    const pType = (proposal && (proposal.projectType || proposal.facilityType)) || 'commercial_gym';
    layoutState.area = area;
    layoutState.projectType = pType;

    // Dynamic room proportions based on project typology
    let roomW, roomD;
    if (pType === 'pilates_studio') {
      roomW = Math.round(Math.sqrt(area * 1.6) * 10) / 10;
      roomD = Math.round((area / roomW) * 10) / 10;
    } else if (pType === 'villa_gym') {
      roomW = Math.round(Math.sqrt(area * 1.3) * 10) / 10;
      roomD = Math.round((area / roomW) * 10) / 10;
    } else if (pType === 'glute_hub') {
      roomW = Math.round(Math.sqrt(area * 1.4) * 10) / 10;
      roomD = Math.round((area / roomW) * 10) / 10;
    } else {
      roomW = Math.round(Math.sqrt(area * 1.55) * 10) / 10;
      roomD = Math.round((area / roomW) * 10) / 10;
    }
    layoutState.roomW = roomW;
    layoutState.roomD = roomD;

    const defaultMachines = [
      { sku: 'TRM885', name: 'Precor TRM 885 Treadmill', brand: 'Precor', category: 'cardio', quantity: 4 },
      { sku: 'EFX885', name: 'Precor EFX 885 Elliptical', brand: 'Precor', category: 'cardio', quantity: 2 },
      { sku: 'UBK885', name: 'Precor UBK 885 Upright Bike', brand: 'Precor', category: 'cardio', quantity: 2 },
      { sku: 'ROW-ERG', name: 'Precor / Concept2 RowErg', brand: 'Precor', category: 'cardio', quantity: 1 },
      { sku: 'DSL0400', name: 'Precor Resolute Chest Press', brand: 'Precor', category: 'strength', quantity: 1 },
      { sku: 'DSL0314', name: 'Precor Resolute Lat Pulldown', brand: 'Precor', category: 'strength', quantity: 1 },
      { sku: 'DSL0505', name: 'Precor Resolute Leg Extension', brand: 'Precor', category: 'strength', quantity: 1 },
      { sku: 'FTS-GLIDE', name: 'Precor FTS Glide Functional Trainer', brand: 'Precor', category: 'strength', quantity: 1 },
      { sku: 'DPL0601', name: 'Precor Discovery Angled Leg Press', brand: 'Precor', category: 'strength', quantity: 1 },
      { sku: 'ELK-PRESTERA', name: 'Eleiko Prestera Power Rack + Platform', brand: 'Eleiko', category: 'free_weights', quantity: 2 },
      { sku: 'DBR-2T10', name: 'Precor 2-Tier 10-Pair Dumbbell Rack', brand: 'Precor', category: 'free_weights', quantity: 1 },
      { sku: 'OPT-BENCH', name: 'Precor Olympic Adjustable Bench', brand: 'Precor', category: 'free_weights', quantity: 2 }
    ];

    const filteredProposalItems = (proposal && Array.isArray(proposal.items))
      ? proposal.items.filter(it => {
          if (['flooring', 'service', 'spare_parts'].includes(it.category)) return false;
          const txt = `${it.sku || ''} ${it.name || ''}`.toUpperCase();
          if (/INSTALLATION|KIT|CABLE ASSY|BOLT|SCREW|VALVE|HARNESS|DECAL|COVER|BOARD|SENSOR|BELT|DECK|ROLLER|SPRING|STRAP|MAT|BALL|DUMBBELL PAIR|PLATE/.test(txt)) return false;
          return true;
        })
      : [];

    // Keep actual proposal machines (never discard specialized studios like Pilates or Villa Gym!)
    const rawItems = (filteredProposalItems.length > 0) ? filteredProposalItems : defaultMachines;

    const expanded = [];
    rawItems.forEach(it => {
      if (it.category === 'flooring' || it.category === 'service') return;
      const kind = classifyEquipment(it);
      const spec = GLB_CATALOG[kind] || GLB_CATALOG.selectorized;
      const qty = Math.min(8, Math.max(1, Number(it.quantity) || 1));
      for (let q = 0; q < qty; q++) {
        expanded.push({
          uid: `EQ-${layoutState.nextUid++}`,
          sku: it.sku || kind.toUpperCase(),
          name: it.name || spec.label,
          brand: it.brand || 'Precor',
          kind,
          glb: resolveGlbPath(it, kind),
          w: spec.w,
          d: spec.d,
          h: spec.h,
          clearance: spec.clearance
        });
      }
    });

    const capped = expanded.slice(0, 26);
    const placements = [];
    const halfW = roomW / 2;
    const halfD = roomD / 2;

    // =========================================================================
    // SPECIALIZED SPATIAL LAYOUT LOGIC BY PROJECT TYPOLOGY
    // =========================================================================

    if (pType === 'pilates_studio') {
      // 1. MERRITHEW PILATES STUDIO (Serene Boutique Studio Layout)
      const coreBeds = capped.filter(e => ['reformer', 'cadillac'].includes(e.kind));
      const barrels = capped.filter(e => ['barrel', 'spine'].includes(e.kind));
      const others = capped.filter(e => !['reformer', 'cadillac', 'barrel', 'spine'].includes(e.kind));

      // Reformers & V2 Max Plus arranged in elegant parallel studio rows
      const bedCount = coreBeds.length;
      const refCols = bedCount <= 3 ? 1 : (bedCount <= 8 ? 2 : 3);
      const refRows = Math.ceil(bedCount / refCols);
      const usableD = Math.max(3, roomD - 2.8);
      const rowSpacing = Math.min(2.8, usableD / Math.max(1, refRows));
      const colSpacing = Math.min(2.5, (roomW * 0.58) / Math.max(1, refCols));

      coreBeds.forEach((eq, idx) => {
        const col = idx % refCols;
        const row = Math.floor(idx / refCols);
        const cx = -roomW * 0.12 + (col - (refCols - 1) / 2) * colSpacing;
        const cz = -halfD + 1.4 + (row + 0.5) * rowSpacing;
        placements.push({
          ...eq,
          zone: 'pilates_reformer',
          x: Number(Math.max(-halfW + eq.w / 2 + 0.3, Math.min(halfW - eq.w / 2 - 0.3, cx)).toFixed(2)),
          z: Number(Math.max(-halfD + eq.d / 2 + 0.3, Math.min(halfD - eq.d / 2 - 0.3, cz)).toFixed(2)),
          rotY: 0 // Facing North mirrors
        });
      });

      // Ladder Barrel & Spine Corrector in East Posture Bay
      const bCount = barrels.length;
      const bSpacing = Math.min(2.2, (roomD - 2.5) / Math.max(1, bCount));
      barrels.forEach((eq, idx) => {
        const bz = -halfD + 1.5 + (idx + 0.5) * bSpacing;
        placements.push({
          ...eq,
          zone: 'pilates_barrel',
          x: Number((halfW - eq.w / 2 - 0.8).toFixed(2)),
          z: Number(Math.max(-halfD + eq.d / 2 + 0.3, Math.min(halfD - eq.d / 2 - 0.3, bz)).toFixed(2)),
          rotY: -Math.PI / 2
        });
      });

      others.forEach((eq, idx) => {
        placements.push({
          ...eq,
          zone: 'pilates_props',
          x: Number((halfW - eq.w / 2 - 0.8).toFixed(2)),
          z: Number((-halfD + 1.2 + idx * 1.5).toFixed(2)),
          rotY: 0
        });
      });

    } else if (pType === 'villa_gym') {
      // 2. LUXURY PRIVATE VILLA & PENTHOUSE VIP (Compact, Elegant, Residential Flow)
      const cardios = capped.filter(e => ['treadmill', 'elliptical', 'amt', 'bike', 'rower', 'airbike'].includes(e.kind));
      const functionals = capped.filter(e => ['cable_crossover', 'selectorized', 'lat_pulldown'].includes(e.kind));
      const freeWeights = capped.filter(e => ['bench', 'dumbbell_rack', 'power_rack', 'half_rack'].includes(e.kind));

      // Cardio facing North/East glass window panorama
      let cx = -halfW + 2.0;
      cardios.forEach((eq) => {
        placements.push({
          ...eq,
          zone: 'cardio',
          x: Number(cx.toFixed(2)),
          z: Number((-halfD + 1.45).toFixed(2)),
          rotY: Math.PI // Facing North window
        });
        cx += eq.w + 0.65;
      });

      // Dual Cable / Functional Trainer in Top-Right bay
      functionals.forEach((eq, idx) => {
        placements.push({
          ...eq,
          zone: 'functional',
          x: Number((halfW - 1.8).toFixed(2)),
          z: Number((-halfD + 1.8 + idx * 2.2).toFixed(2)),
          rotY: Math.PI / 4 // Angled corner orientation
        });
      });

      // Bench & Dumbbell Rack along West Mirrored Wall
      let fz = halfD - 1.6;
      freeWeights.forEach((eq) => {
        placements.push({
          ...eq,
          zone: 'free_weights',
          x: Number((-halfW + 1.5).toFixed(2)),
          z: Number(fz.toFixed(2)),
          rotY: eq.kind === 'dumbbell_rack' ? Math.PI / 2 : 0
        });
        fz -= eq.d + 0.8;
      });

    } else if (pType === 'glute_hub') {
      // 3. BOOTY BUILDER & GLUTE HYPERTROPHY HUB
      const glutes = capped.filter(e => ['booty_builder', 'hack_squat', 'leg_press'].includes(e.kind));
      const cardios = capped.filter(e => ['treadmill', 'stairclimber', 'bike'].includes(e.kind));
      const freeList = capped.filter(e => ['power_rack', 'half_rack', 'bench', 'dumbbell_rack'].includes(e.kind));
      const others = capped.filter(e => !glutes.includes(e) && !cardios.includes(e) && !freeList.includes(e));

      // Glute Hero Circuit in Center Rubber Zone
      const startX = -halfW * 0.15;
      const startZ = -halfD * 0.15;
      glutes.concat(others).forEach((eq, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        placements.push({
          ...eq,
          zone: 'glute_target',
          x: Number((startX + col * 2.6).toFixed(2)),
          z: Number((startZ + row * 2.4).toFixed(2)),
          rotY: col === 0 ? 0 : Math.PI
        });
      });

      // StairClimber & Cardio along window
      let cx = -halfW + 2.0;
      cardios.forEach((eq) => {
        placements.push({
          ...eq,
          zone: 'cardio',
          x: Number(cx.toFixed(2)),
          z: Number((-halfD + 1.5).toFixed(2)),
          rotY: Math.PI
        });
        cx += eq.w + 0.7;
      });

      // Free weights & Dumbbells along West rubber wall
      let fz = halfD - 1.6;
      freeList.forEach((eq) => {
        placements.push({
          ...eq,
          zone: 'free_weights',
          x: Number((-halfW + 1.6).toFixed(2)),
          z: Number(fz.toFixed(2)),
          rotY: 0
        });
        fz -= eq.d + 0.9;
      });

    } else {
      // 4. COMMERCIAL GYM & 5-STAR HOTEL RESORT (Standard Multi-Zone Layout)
      const cardioList = capped.filter(e => ['treadmill', 'elliptical', 'amt', 'stairclimber', 'bike', 'airbike', 'rower'].includes(e.kind));
      const pilatesList = capped.filter(e => ['reformer', 'cadillac', 'barrel'].includes(e.kind));
      const strengthList = capped.filter(e => ['selectorized', 'lat_pulldown', 'seated_row', 'leg_extension', 'cable_crossover', 'smith_machine', 'leg_press', 'hack_squat', 'booty_builder'].includes(e.kind));
      const freeList = capped.filter(e => ['power_rack', 'half_rack', 'double_rack', 'bench', 'dumbbell_rack'].includes(e.kind));

      // Cardio Zone along North curtain glass
      let cx = -halfW * 0.10;
      const topZ = -halfD + 1.55;
      cardioList.forEach((eq, idx) => {
        if (idx < 7 && cx + eq.w / 2 < halfW - 1.1) {
          placements.push({
            ...eq,
            zone: 'cardio',
            x: Number((cx + eq.w / 2).toFixed(2)),
            z: Number(topZ.toFixed(2)),
            rotY: Math.PI
          });
          cx += eq.w + 0.52;
        } else {
          const row2Idx = idx - 7;
          placements.push({
            ...eq,
            zone: 'cardio',
            x: Number((halfW - 1.55).toFixed(2)),
            z: Number((-halfD + 3.6 + row2Idx * 1.45).toFixed(2)),
            rotY: Math.PI / 2
          });
        }
      });

      // Selectorized Strength Zone in Center Bay
      const strStartX = -halfW * 0.12;
      const strStartZ = -halfD * 0.12;
      strengthList.forEach((eq, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        placements.push({
          ...eq,
          zone: 'strength',
          x: Number((strStartX + col * 2.55).toFixed(2)),
          z: Number((strStartZ + row * 2.35).toFixed(2)),
          rotY: col === 0 ? 0 : Math.PI
        });
      });

      // Free Weights in Bottom-Left Rubber Zone
      const fwStartX = -halfW + 2.25;
      const fwStartZ = halfD - 1.75;
      freeList.forEach((eq, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        placements.push({
          ...eq,
          zone: 'free_weights',
          x: Number((fwStartX + col * 2.55).toFixed(2)),
          z: Number((fwStartZ - row * 2.75).toFixed(2)),
          rotY: 0
        });
      });

      // Pilates Studio zone if present
      const pilStartX = -halfW + 2.2;
      const pilStartZ = -halfD * 0.08;
      pilatesList.forEach((eq, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        placements.push({
          ...eq,
          zone: 'pilates',
          x: Number((pilStartX + col * 1.65).toFixed(2)),
          z: Number((pilStartZ + row * 2.85).toFixed(2)),
          rotY: 0
        });
      });
    }

    // Strict boundary safety clamp: ensure every machine is within room walls
    placements.forEach(p => {
      const maxW = Math.max(0.5, halfW - (p.w || 1) / 2 - 0.25);
      const maxD = Math.max(0.5, halfD - (p.d || 1) / 2 - 0.25);
      p.x = Number(Math.max(-maxW, Math.min(maxW, p.x)).toFixed(2));
      p.z = Number(Math.max(-maxD, Math.min(maxD, p.z)).toFixed(2));
    });

    layoutState.placements = placements;
    layoutState.selectedId = placements.length ? placements[0].uid : null;
    layoutState.flooringZones = buildDefaultFlooringZones(pType, roomW, roomD);
    layoutState.selectedFloorZoneId = null;
    updateSelectedHudLabel();
    if (global.AttivoVisualizer2D && typeof global.AttivoVisualizer2D.updateFlooringSchedule === 'function') {
      global.AttivoVisualizer2D.updateFlooringSchedule();
    }
  }

  function ensureLayoutInitialized(proposal) {
    const p = proposal || (
      typeof window !== 'undefined' && window.state && window.state.activeTab === 'builder' && typeof window.getBuilderProposal === 'function'
        ? window.getBuilderProposal()
        : (typeof window !== 'undefined' && window.AttivoAiAdvisor && window.AttivoAiAdvisor.currentProposal) || null
    );
    const sig = getProposalSignature(p);
    if (p) layoutState.proposal = p;
    if (layoutState.proposalKey !== sig || layoutState.placements.length === 0) {
      layoutState.proposalKey = sig;
      buildInitialPlacements(p || layoutState.proposal);
    }
  }

  function getSelectedEquipment() {
    return layoutState.placements.find(p => p.uid === layoutState.selectedId) || null;
  }

  function getSelectedFloorZone() {
    return (layoutState.flooringZones || []).find(z => z.id === layoutState.selectedFloorZoneId) || null;
  }

  function updateSelectedHudLabel() {
    const el2d = document.getElementById('cad2dSelectedLabel');
    const el3d = document.getElementById('cad3dSelectedLabel');
    const fz = getSelectedFloorZone();
    if (fz) {
      const areaM2 = (fz.w * fz.d).toFixed(1);
      const text2d = `Đang chọn Vùng Sàn: [${fz.name}] • Kích thước: ${fz.w.toFixed(2)}m × ${fz.d.toFixed(2)}m (${areaM2} m²) • Vị trí: X=${fz.x.toFixed(2)}m, Z=${fz.z.toFixed(2)}m • Kéo 8 điểm neo để co giãn hoặc kéo thân để di chuyển`;
      if (el2d) el2d.textContent = text2d;
      if (el3d) el3d.textContent = `Vùng Sàn: ${fz.name} (${areaM2} m²)`;
      return;
    }
    const sel = getSelectedEquipment();
    const deg = sel ? Math.round(((sel.rotY * 180) / Math.PI) % 360) : 0;
    const text = sel
      ? `Selected: [${sel.sku}] ${sel.name} • Size: ${Math.round(sel.w * 1000)}×${Math.round(sel.d * 1000)}mm • Pos: X=${Math.round(sel.x * 1000)}mm, Z=${Math.round(sel.z * 1000)}mm • Rot: ${deg}°`
      : 'Click bất kỳ thiết bị để Di chuyển/Xoay/Nhân bản, hoặc click Vùng Sàn để chỉnh kích thước (kéo 8 điểm neo)';
    if (el2d) el2d.textContent = text;
    if (el3d) el3d.textContent = sel ? `${sel.sku} — ${sel.name} (${deg}°)` : 'Click any 3D machine to Select / Drag / Rotate';
  }

  function syncBothViewsAfterEdit(source) {
    updateSelectedHudLabel();
    if (source !== '2d' && global.AttivoVisualizer2D) {
      global.AttivoVisualizer2D.draw();
    }
    if (source !== '3d' && global.AttivoVisualizer3D) {
      global.AttivoVisualizer3D.syncTransformsFromState();
    }
  }

  function rotateSelectedEquipment(deltaDeg) {
    const sel = getSelectedEquipment();
    if (!sel) return;
    sel.rotY = (sel.rotY || 0) + (deltaDeg * Math.PI) / 180;
    AttivoVisualizer2D.draw();
    AttivoVisualizer3D.syncTransformsFromState();
    updateSelectedHudLabel();
  }

  function duplicateSelectedEquipment() {
    const sel = getSelectedEquipment();
    if (!sel) return;
    const clone = {
      ...sel,
      uid: `EQ-${layoutState.nextUid++}`,
      x: Number(Math.min(layoutState.roomW / 2 - 1.0, sel.x + 1.25).toFixed(2)),
      z: Number(Math.min(layoutState.roomD / 2 - 1.0, sel.z + 0.65).toFixed(2))
    };
    layoutState.placements.push(clone);
    layoutState.selectedId = clone.uid;
    AttivoVisualizer2D.draw();
    AttivoVisualizer3D.rebuildEquipmentMeshes();
    updateSelectedHudLabel();
  }

  function deleteSelectedEquipment() {
    if (!layoutState.selectedId) return;
    const idx = layoutState.placements.findIndex(p => p.uid === layoutState.selectedId);
    if (idx === -1) return;
    layoutState.placements.splice(idx, 1);
    layoutState.selectedId = layoutState.placements[0] ? layoutState.placements[0].uid : null;
    AttivoVisualizer2D.draw();
    AttivoVisualizer3D.rebuildEquipmentMeshes();
    updateSelectedHudLabel();
  }

  // ============================================================================
  // 3. DETAILED AUTOCAD 2D FLOORPLAN ENGINE (INTERACTIVE DRAG / ROTATE / EDIT)
  // ============================================================================
  const AttivoVisualizer2D = {
    currentStyle: 'attivo_studio', // 'attivo_studio' | 'casa_serra' | 'navy_cad'
    transformCache: null,
    isDragging: false,
    dragOffsetX: 0,
    dragOffsetZ: 0,
    eventsBound: false,

    setStyle(styleName) {
      this.currentStyle = styleName || 'attivo_studio';
      const styles = {
        attivo_studio: 'btn2dStyleStudio',
        casa_serra: 'btn2dStyleCasa',
        navy_cad: 'btn2dStyleNavy'
      };
      Object.entries(styles).forEach(([k, id]) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.className = (k === this.currentStyle)
          ? 'px-2.5 py-1.5 rounded-lg bg-[#00204a] text-white font-bold transition shadow-2xs'
          : 'px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition';
      });
      this.draw();
    },

    setActiveTool(toolName) {
      layoutState.activeTool = toolName || 'select';
      const btnSel = document.getElementById('cadToolSelect');
      const btnRul = document.getElementById('cadToolRuler');
      if (btnSel) {
        btnSel.className = (layoutState.activeTool === 'select')
          ? 'px-2.5 py-1 rounded-lg bg-[#00204a] text-white font-bold transition shadow-2xs flex items-center gap-1'
          : 'px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold transition flex items-center gap-1';
      }
      if (btnRul) {
        btnRul.className = (layoutState.activeTool === 'ruler')
          ? 'px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold transition shadow-2xs flex items-center gap-1'
          : 'px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold transition flex items-center gap-1';
      }
      if (layoutState.activeTool !== 'ruler') {
        layoutState.rulerPoints = [];
        this.rulerLivePoint = null;
      }
      this.draw();
    },

    toggleLayer(layerKey) {
      if (!layoutState.layers) layoutState.layers = {};
      layoutState.layers[layerKey] = !layoutState.layers[layerKey];
      const btnMap = {
        flooring:  { id: 'btnLayerFloor',     activeCls: 'bg-emerald-600 text-white', label: '✓ Sàn (Flooring)', offLabel: '✕ Sàn (Flooring)' },
        equipment: { id: 'btnLayerEq',        activeCls: 'bg-blue-700 text-white',    label: '✓ Thiết Bị',       offLabel: '✕ Thiết Bị' },
        dimensions:{ id: 'btnLayerDim',       activeCls: 'bg-cyan-700 text-white',    label: '✓ Kích Thước',     offLabel: '✕ Kích Thước' },
        clearance: { id: 'btnLayerClearance', activeCls: 'bg-amber-600 text-white',   label: '✓ Vùng An Toàn',   offLabel: '✕ Vùng An Toàn' },
        grid:      { id: 'btnLayerGrid',      activeCls: 'bg-indigo-700 text-white',  label: '✓ Trục Cột A-D/1-5', offLabel: '✕ Trục Cột A-D/1-5' }
      };
      const info = btnMap[layerKey];
      if (info) {
        const btn = document.getElementById(info.id);
        if (btn) {
          const isOn = layoutState.layers[layerKey];
          btn.className = isOn
            ? `px-2 py-0.5 rounded-md ${info.activeCls} font-bold text-[11px] transition shadow-2xs`
            : `px-2 py-0.5 rounded-md bg-slate-200 text-slate-500 font-bold text-[11px] transition line-through opacity-70`;
          btn.textContent = isOn ? info.label : info.offLabel;
        }
      }
      this.draw();
    },

    addFloorZone(type) {
      const roomW = layoutState.roomW || 20;
      const roomD = layoutState.roomD || 13;
      const defaultProps = {
        rubber:   { name: 'Thảm Cao Su Chống Rơi Tạ PaviFLEX 15-20mm', color: '#242830', w: Math.min(6.0, Number((roomW * 0.45).toFixed(1))), d: Math.min(5.0, Number((roomD * 0.5).toFixed(1))) },
        wood:     { name: 'Sàn Gỗ Sồi Tự Nhiên Chịu Ẩm (Oak Parquet)', color: '#debf93', w: Math.min(6.0, Number((roomW * 0.45).toFixed(1))), d: Math.min(5.0, Number((roomD * 0.5).toFixed(1))) },
        pulastic: { name: 'Sàn Thể Thao Đa Năng Pulastic Polyurethane', color: '#0284c7', w: Math.min(5.0, Number((roomW * 0.35).toFixed(1))), d: Math.min(4.5, Number((roomD * 0.45).toFixed(1))) },
        turf:     { name: 'Cỏ Sprint Track Kéo Đẩy Xe Tạ Có Vạch Mét', color: '#15803d', w: 2.0, d: Math.min(10.0, Number((roomD * 0.75).toFixed(1))) },
        tile:     { name: 'Gạch Men / Bê Tông Mài Hoàn Thiện', color: '#94a3b8', w: Math.min(4.0, Number((roomW * 0.3).toFixed(1))), d: Math.min(3.5, Number((roomD * 0.35).toFixed(1))) }
      };

      const p = defaultProps[type] || defaultProps.rubber;
      const newZone = {
        id: `fz-${Date.now().toString().slice(-5)}`,
        type,
        name: p.name,
        color: p.color,
        w: p.w,
        d: p.d,
        x: 0,
        z: 0
      };

      if (!layoutState.flooringZones) layoutState.flooringZones = [];
      layoutState.flooringZones.push(newZone);
      layoutState.selectedFloorZoneId = newZone.id;
      layoutState.selectedId = null;

      updateSelectedHudLabel();
      this.draw();
      this.updateFlooringSchedule();
      if (global.AttivoVisualizer3D && typeof global.AttivoVisualizer3D.rebuildRoomMeshes === 'function') {
        global.AttivoVisualizer3D.rebuildRoomMeshes();
      }
    },

    deleteSelectedFloorZone() {
      if (!layoutState.selectedFloorZoneId) {
        alert("Vui lòng click chọn một vùng sàn trên bản vẽ trước khi xóa!");
        return;
      }
      const idx = (layoutState.flooringZones || []).findIndex(z => z.id === layoutState.selectedFloorZoneId);
      if (idx !== -1) {
        layoutState.flooringZones.splice(idx, 1);
        layoutState.selectedFloorZoneId = null;
        updateSelectedHudLabel();
        this.draw();
        this.updateFlooringSchedule();
        if (global.AttivoVisualizer3D && typeof global.AttivoVisualizer3D.rebuildRoomMeshes === 'function') {
          global.AttivoVisualizer3D.rebuildRoomMeshes();
        }
      }
    },

    resetFloorZones() {
      layoutState.flooringZones = buildDefaultFlooringZones(layoutState.projectType, layoutState.roomW, layoutState.roomD);
      layoutState.selectedFloorZoneId = null;
      updateSelectedHudLabel();
      this.draw();
      this.updateFlooringSchedule();
      if (global.AttivoVisualizer3D && typeof global.AttivoVisualizer3D.rebuildRoomMeshes === 'function') {
        global.AttivoVisualizer3D.rebuildRoomMeshes();
      }
    },

    getFlooringSchedule() {
      const roomArea = layoutState.area || (layoutState.roomW * layoutState.roomD);
      const zones = layoutState.flooringZones || [];
      const grouped = {
        rubber:   { type: 'rubber',   name: 'Thảm Cao Su PaviFLEX (15-20mm)', area: 0, unitPrice: 850000,  color: '#242830', border: 'border-slate-500', text: 'text-slate-800' },
        wood:     { type: 'wood',     name: 'Sàn Gỗ Sồi Parquet Kháng Ẩm',    area: 0, unitPrice: 1250000, color: '#debf93', border: 'border-amber-400', text: 'text-amber-800' },
        pulastic: { type: 'pulastic', name: 'Sàn Thể Thao Pulastic Đa Năng',  area: 0, unitPrice: 1450000, color: '#0284c7', border: 'border-sky-400',   text: 'text-sky-800' },
        turf:     { type: 'turf',     name: 'Cỏ Sprint Track Vạch Cự Ly',    area: 0, unitPrice: 950000,  color: '#15803d', border: 'border-emerald-400', text: 'text-emerald-800' },
        tile:     { type: 'tile',     name: 'Gạch Men / Bê Tông Mài',        area: 0, unitPrice: 650000,  color: '#94a3b8', border: 'border-slate-300', text: 'text-slate-700' }
      };

      zones.forEach(z => {
        const a = z.w * z.d;
        if (grouped[z.type]) {
          grouped[z.type].area += a;
        }
      });

      const scheduleItems = Object.values(grouped).filter(g => g.area > 0);
      const totalFlooringArea = scheduleItems.reduce((acc, g) => acc + g.area, 0);

      return {
        roomArea: Number(roomArea.toFixed(1)),
        totalFlooringArea: Number(totalFlooringArea.toFixed(1)),
        coveragePct: Number(((totalFlooringArea / roomArea) * 100).toFixed(1)),
        items: scheduleItems.map(g => ({
          ...g,
          area: Number(g.area.toFixed(1)),
          pct: Number(((g.area / roomArea) * 100).toFixed(1)),
          totalCost: Math.round(g.area * g.unitPrice)
        }))
      };
    },

    updateFlooringSchedule() {
      const sch = this.getFlooringSchedule();
      const lblTotal = document.getElementById('lblFlooringTotalM2');
      if (lblTotal) {
        lblTotal.textContent = `${sch.roomArea} m² (Đã phủ: ${sch.totalFlooringArea} m² / ${sch.coveragePct}%)`;
      }
      const container = document.getElementById('flooringScheduleCards');
      if (!container) return;

      if (sch.items.length === 0) {
        container.innerHTML = `<div class="col-span-4 text-center py-2 text-slate-400 italic">Chưa có phân vùng sàn nào. Click các nút "+ Thảm Cao Su", "+ Sàn Gỗ", "+ Sàn Pulastic", "+ Cỏ Sprint Track" để tạo mới.</div>`;
        return;
      }

      container.innerHTML = sch.items.map(it => `
        <div class="p-2.5 rounded-xl border ${it.border} bg-white shadow-2xs flex flex-col justify-between">
          <div class="flex items-center justify-between gap-1 mb-1">
            <span class="font-bold ${it.text} text-[11px] truncate" title="${it.name}">${it.name}</span>
            <span class="w-3 h-3 rounded-full border border-slate-300 inline-block shrink-0" style="background-color: ${it.color};"></span>
          </div>
          <div class="flex items-baseline justify-between mt-1">
            <span class="font-extrabold text-sm text-[#00204a]">${it.area} m²</span>
            <span class="text-[11px] font-bold text-slate-500">${it.pct}% phòng</span>
          </div>
          <div class="text-[10px] text-slate-500 mt-1 flex justify-between border-t border-slate-100 pt-1">
            <span>Đơn giá: ${(it.unitPrice).toLocaleString()} đ/m²</span>
            <span class="font-bold text-[#00204a]">${(it.totalCost).toLocaleString()} đ</span>
          </div>
        </div>
      `).join('');
    },

    applyFlooringToQuote() {
      const sch = this.getFlooringSchedule();
      if (!sch.items.length) {
        alert("Chưa có phân vùng sàn nào trên bản vẽ! Vui lòng thêm các vùng sàn trước khi nạp vào báo giá.");
        return;
      }
      if (typeof window.state === 'undefined' || !Array.isArray(window.state.quoteItems)) {
        alert("Không tìm thấy dữ liệu bảng báo giá!");
        return;
      }

      // Remove existing auto-flooring items
      window.state.quoteItems = window.state.quoteItems.filter(it => it.category !== 'flooring');

      // Add itemized lines
      const skuMap = {
        rubber:   { sku: 'FLR-RUBBER-PAVIFLEX', name: 'Thảm cao su chống va đập PaviFLEX EPDM 15-20mm (1000x1000mm) khu tạ' },
        wood:     { sku: 'FLR-WOOD-OAK',        name: 'Sàn gỗ sồi tự nhiên kỹ thuật chịu lực chuyên dụng Cardio & Gallery' },
        pulastic: { sku: 'FLR-PULASTIC-SPORT',  name: 'Thi công sàn thể thao Pulastic Polyurethane Attivo Sport (Sàn không mối nối đa năng)' },
        turf:     { sku: 'FLR-TURF-SPRINT',     name: 'Thảm cỏ nhân tạo chuyên dụng Sprint Track kéo đẩy xe tạ có vạch chia cự ly mét' },
        tile:     { sku: 'FLR-CONCRETE-TILE',   name: 'Sàn gạch men chống trượt / Bê tông mài hoàn thiện sảnh' }
      };

      sch.items.forEach(it => {
        const meta = skuMap[it.type] || { sku: `FLR-${it.type.toUpperCase()}`, name: it.name };
        window.state.quoteItems.push({
          row_type: 'product',
          product_id: null,
          sku: meta.sku,
          name: meta.name,
          name_en: it.name,
          brand: 'Attivo Flooring',
          category: 'flooring',
          unit: 'm²',
          quantity: it.area,
          price_tier: '1',
          unit_price: it.unitPrice,
          base_unit_price: it.unitPrice,
          discount_pct: 0,
          discount_amount: 0,
          vat_rate: '10'
        });
      });

      if (typeof renderQuoteItems === 'function') renderQuoteItems();
      if (typeof recalculateQuote === 'function') recalculateQuote();

      alert(`✅ Đã nạp thành công ${sch.items.length} hạng mục sàn (${sch.totalFlooringArea} m²) vào Bảng Soạn Thảo Báo Giá CPQ!`);
    },

    resetLayout() {
      buildInitialPlacements(layoutState.proposal);
      this.draw();
      this.updateFlooringSchedule();
      AttivoVisualizer3D.rebuildEquipmentMeshes();
      if (typeof AttivoVisualizer3D.rebuildRoomMeshes === 'function') {
        AttivoVisualizer3D.rebuildRoomMeshes();
      }
    },

    rotateSelected(deg) { rotateSelectedEquipment(deg); },
    duplicateSelected() { duplicateSelectedEquipment(); },
    deleteSelected() { deleteSelectedEquipment(); },

    render(proposal) {
      ensureLayoutInitialized(proposal);
      this.bindCanvasEvents();
      this.draw();
      this.updateFlooringSchedule();
    },

    bindCanvasEvents() {
      if (this.eventsBound) return;
      const canvas = document.getElementById('aiFloorplanCanvas');
      if (!canvas) return;
      this.eventsBound = true;

      const getCanvasMouseMeters = (evt) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const px = (evt.clientX - rect.left) * scaleX;
        const py = (evt.clientY - rect.top) * scaleY;
        const tc = this.transformCache;
        if (!tc) return { px, py, mx: 0, mz: 0 };
        const mx = (px - tc.cx) / tc.ppm;
        const mz = (py - tc.cy) / tc.ppm;
        return { px, py, mx, mz };
      };

      const hitTestZoneHandles = (mx, mz) => {
        if (!layoutState.selectedFloorZoneId) return null;
        const zone = (layoutState.flooringZones || []).find(z => z.id === layoutState.selectedFloorZoneId);
        if (!zone) return null;
        const halfW = zone.w / 2;
        const halfD = zone.d / 2;
        const handles = {
          nw: { x: zone.x - halfW, z: zone.z - halfD },
          n:  { x: zone.x,         z: zone.z - halfD },
          ne: { x: zone.x + halfW, z: zone.z - halfD },
          e:  { x: zone.x + halfW, z: zone.z },
          se: { x: zone.x + halfW, z: zone.z + halfD },
          s:  { x: zone.x,         z: zone.z + halfD },
          sw: { x: zone.x - halfW, z: zone.z + halfD },
          w:  { x: zone.x - halfW, z: zone.z }
        };
        const handleThresholdM = 14 / (this.transformCache ? this.transformCache.ppm : 25);
        for (const [hName, hPos] of Object.entries(handles)) {
          const dist = Math.hypot(mx - hPos.x, mz - hPos.z);
          if (dist <= handleThresholdM) {
            return { handle: hName, zone };
          }
        }
        return null;
      };

      const hitTestFloorZone = (mx, mz) => {
        const zones = layoutState.flooringZones || [];
        for (let i = zones.length - 1; i >= 0; i--) {
          const z = zones[i];
          if (Math.abs(mx - z.x) <= z.w / 2 && Math.abs(mz - z.z) <= z.d / 2) {
            return z;
          }
        }
        return null;
      };

      const hitTestEquipment = (mx, mz) => {
        for (let i = layoutState.placements.length - 1; i >= 0; i--) {
          const eq = layoutState.placements[i];
          const dx = mx - eq.x;
          const dz = mz - eq.z;
          const cos = Math.cos(-(eq.rotY || 0));
          const sin = Math.sin(-(eq.rotY || 0));
          const lx = dx * cos - dz * sin;
          const lz = dx * sin + dz * cos;
          if (Math.abs(lx) <= eq.w / 2 + 0.22 && Math.abs(lz) <= eq.d / 2 + 0.22) {
            return eq;
          }
        }
        return null;
      };

      canvas.addEventListener('mousedown', (evt) => {
        const { mx, mz } = getCanvasMouseMeters(evt);

        // 1. CAD Ruler Tool
        if (layoutState.activeTool === 'ruler') {
          if (!layoutState.rulerPoints || layoutState.rulerPoints.length === 0 || layoutState.rulerPoints.length >= 2) {
            layoutState.rulerPoints = [{ x: mx, z: mz }];
          } else if (layoutState.rulerPoints.length === 1) {
            layoutState.rulerPoints.push({ x: mx, z: mz });
          }
          this.draw();
          return;
        }

        // 2. Check Resize Handles of Selected Floor Zone
        const handleHit = hitTestZoneHandles(mx, mz);
        if (handleHit) {
          this.isResizingZone = true;
          this.activeHandle = handleHit.handle;
          this.activeZone = handleHit.zone;
          return;
        }

        // 3. Equipment Selection (higher priority)
        const eqHit = hitTestEquipment(mx, mz);
        if (eqHit) {
          layoutState.selectedId = eqHit.uid;
          layoutState.selectedFloorZoneId = null;
          this.isDragging = true;
          this.dragOffsetX = mx - eqHit.x;
          this.dragOffsetZ = mz - eqHit.z;
          updateSelectedHudLabel();
          this.draw();
          return;
        }

        // 4. Floor Zone Selection
        const zoneHit = hitTestFloorZone(mx, mz);
        if (zoneHit) {
          layoutState.selectedFloorZoneId = zoneHit.id;
          layoutState.selectedId = null;
          this.isDraggingZone = true;
          this.dragOffsetZoneX = mx - zoneHit.x;
          this.dragOffsetZoneZ = mz - zoneHit.z;
          updateSelectedHudLabel();
          this.draw();
          return;
        }

        // 5. Clicked empty space
        layoutState.selectedId = null;
        layoutState.selectedFloorZoneId = null;
        updateSelectedHudLabel();
        this.draw();
      });

      canvas.addEventListener('mousemove', (evt) => {
        const { mx, mz } = getCanvasMouseMeters(evt);

        // CAD Ruler Live Preview
        if (layoutState.activeTool === 'ruler') {
          canvas.style.cursor = 'crosshair';
          if (layoutState.rulerPoints && layoutState.rulerPoints.length === 1) {
            this.rulerLivePoint = { x: mx, z: mz };
            this.draw();
          }
          return;
        }

        // Resizing Floor Zone
        if (this.isResizingZone && this.activeZone) {
          const z = this.activeZone;
          const h = this.activeHandle;
          const halfW = layoutState.roomW / 2;
          const halfD = layoutState.roomD / 2;
          
          if (h.includes('e')) {
            const left = z.x - z.w / 2;
            const newW = Math.max(1.0, Math.min(halfW - left, Math.round((mx - left) * 20) / 20));
            z.x = Number((left + newW / 2).toFixed(2));
            z.w = Number(newW.toFixed(2));
          } else if (h.includes('w')) {
            const right = z.x + z.w / 2;
            const newW = Math.max(1.0, Math.min(right - (-halfW), Math.round((right - mx) * 20) / 20));
            z.x = Number((right - newW / 2).toFixed(2));
            z.w = Number(newW.toFixed(2));
          }

          if (h.includes('s')) {
            const top = z.z - z.d / 2;
            const newD = Math.max(1.0, Math.min(halfD - top, Math.round((mz - top) * 20) / 20));
            z.z = Number((top + newD / 2).toFixed(2));
            z.d = Number(newD.toFixed(2));
          } else if (h.includes('n')) {
            const bottom = z.z + z.d / 2;
            const newD = Math.max(1.0, Math.min(bottom - (-halfD), Math.round((bottom - mz) * 20) / 20));
            z.z = Number((bottom - newD / 2).toFixed(2));
            z.d = Number(newD.toFixed(2));
          }

          updateSelectedHudLabel();
          this.draw();
          return;
        }

        // Dragging Floor Zone
        if (this.isDraggingZone && layoutState.selectedFloorZoneId) {
          const z = getSelectedFloorZone();
          if (z) {
            const maxW = layoutState.roomW / 2 - z.w / 2;
            const maxD = layoutState.roomD / 2 - z.d / 2;
            const nx = Math.round((mx - this.dragOffsetZoneX) * 20) / 20;
            const nz = Math.round((mz - this.dragOffsetZoneZ) * 20) / 20;
            z.x = Number(Math.max(-maxW, Math.min(maxW, nx)).toFixed(2));
            z.z = Number(Math.max(-maxD, Math.min(maxD, nz)).toFixed(2));
            updateSelectedHudLabel();
            this.draw();
          }
          return;
        }

        // Dragging Equipment
        if (this.isDragging && layoutState.selectedId) {
          const sel = getSelectedEquipment();
          if (sel) {
            const halfW = layoutState.roomW / 2 - sel.w / 2 - 0.25;
            const halfD = layoutState.roomD / 2 - sel.d / 2 - 0.25;
            const nx = Math.round(((mx - this.dragOffsetX) * 20)) / 20;
            const nz = Math.round(((mz - this.dragOffsetZ) * 20)) / 20;
            sel.x = Number(Math.max(-halfW, Math.min(halfW, nx)).toFixed(2));
            sel.z = Number(Math.max(-halfD, Math.min(halfD, nz)).toFixed(2));
            this.draw();
            syncBothViewsAfterEdit('2d');
          }
          return;
        }

        // Hover cursor handling
        const handleHit = hitTestZoneHandles(mx, mz);
        if (handleHit) {
          const h = handleHit.handle;
          if (h === 'nw' || h === 'se') canvas.style.cursor = 'nwse-resize';
          else if (h === 'ne' || h === 'sw') canvas.style.cursor = 'nesw-resize';
          else if (h === 'e' || h === 'w') canvas.style.cursor = 'ew-resize';
          else if (h === 'n' || h === 's') canvas.style.cursor = 'ns-resize';
        } else if (hitTestEquipment(mx, mz)) {
          canvas.style.cursor = 'move';
        } else if (hitTestFloorZone(mx, mz)) {
          canvas.style.cursor = 'pointer';
        } else {
          canvas.style.cursor = 'default';
        }
      });

      const stopDrag = () => {
        let redraw = false;
        if (this.isDragging) {
          this.isDragging = false;
          syncBothViewsAfterEdit('2d');
        }
        if (this.isDraggingZone || this.isResizingZone) {
          this.isDraggingZone = false;
          this.isResizingZone = false;
          this.activeHandle = null;
          this.activeZone = null;
          this.updateFlooringSchedule();
          if (global.AttivoVisualizer3D && typeof global.AttivoVisualizer3D.rebuildRoomMeshes === 'function') {
            global.AttivoVisualizer3D.rebuildRoomMeshes();
          }
          redraw = true;
        }
        if (redraw) {
          this.draw();
        }
      };
      canvas.addEventListener('mouseup', stopDrag);
      canvas.addEventListener('mouseleave', stopDrag);

      canvas.addEventListener('dblclick', (evt) => {
        const { mx, mz } = getCanvasMouseMeters(evt);
        const hit = hitTestEquipment(mx, mz);
        if (hit) {
          layoutState.selectedId = hit.uid;
          rotateSelectedEquipment(45);
        }
      });

      window.addEventListener('keydown', (evt) => {
        const v2d = document.getElementById('aiVisualizerView2D');
        if (!v2d || v2d.classList.contains('hidden')) return;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((evt.target && evt.target.tagName) || '')) return;
        if (evt.key === 'Escape') {
          if (layoutState.activeTool === 'ruler') {
            this.setActiveTool('select');
          }
          return;
        }
        if (layoutState.selectedFloorZoneId && (evt.key === 'Delete' || evt.key === 'Backspace')) {
          evt.preventDefault();
          this.deleteSelectedFloorZone();
          return;
        }
        const sel = getSelectedEquipment();
        if (!sel) return;
        if (evt.key === 'r' || evt.key === 'R') {
          evt.preventDefault();
          rotateSelectedEquipment(45);
        } else if (evt.key === 'Delete' || evt.key === 'Backspace') {
          evt.preventDefault();
          deleteSelectedEquipment();
        } else if (evt.key === 'ArrowLeft') {
          evt.preventDefault();
          sel.x = Number((sel.x - 0.1).toFixed(2));
          this.draw();
          syncBothViewsAfterEdit('2d');
        } else if (evt.key === 'ArrowRight') {
          evt.preventDefault();
          sel.x = Number((sel.x + 0.1).toFixed(2));
          this.draw();
          syncBothViewsAfterEdit('2d');
        } else if (evt.key === 'ArrowUp') {
          evt.preventDefault();
          sel.z = Number((sel.z - 0.1).toFixed(2));
          this.draw();
          syncBothViewsAfterEdit('2d');
        } else if (evt.key === 'ArrowDown') {
          evt.preventDefault();
          sel.z = Number((sel.z + 0.1).toFixed(2));
          this.draw();
          syncBothViewsAfterEdit('2d');
        }
      });
    },

    draw() {
      const canvas = document.getElementById('aiFloorplanCanvas');
      if (!canvas) return;
      const W = 1280;
      const H = 760;
      if (canvas.width !== W) canvas.width = W;
      if (canvas.height !== H) canvas.height = H;
      const ctx = canvas.getContext('2d');

      const style = this.currentStyle;
      const isNavy = style === 'navy_cad';
      const isCasa = style === 'casa_serra';

      const roomW = layoutState.roomW;
      const roomD = layoutState.roomD;
      const pType = layoutState.projectType || 'commercial_gym';

      // Sheet margins & viewport
      const drawAreaW = W - 330; // Right 300px for ISO Title Block & Equipment Schedule
      const drawAreaH = H - 110;
      const ppm = Math.min((drawAreaW - 120) / roomW, (drawAreaH - 90) / roomD);
      const rPxW = roomW * ppm;
      const rPxH = roomD * ppm;
      const ox = 78 + (drawAreaW - 120 - rPxW) / 2;
      const oy = 68 + (drawAreaH - 90 - rPxH) / 2;
      const cx = ox + rPxW / 2;
      const cy = oy + rPxH / 2;

      this.transformCache = { ox, oy, cx, cy, ppm, rPxW, rPxH };

      // 1. Sheet Background & Outer CAD Border
      ctx.fillStyle = isNavy ? '#071326' : (isCasa ? '#f6f4ee' : '#ffffff');
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = isNavy ? '#1e3a5f' : '#0f172a';
      ctx.lineWidth = 2.2;
      ctx.strokeRect(14, 14, W - 28, H - 28);
      ctx.lineWidth = 0.8;
      ctx.strokeRect(19, 19, W - 38, H - 38);

      // 2. Structural Column Grid Bubbles (1..6 Horizontal, A..D Vertical)
      if (layoutState.layers && layoutState.layers.grid) {
        const colsX = 5;
        const rowsZ = 3;
        ctx.save();
        for (let i = 0; i <= colsX; i++) {
          const gx = ox + (rPxW / colsX) * i;
          ctx.strokeStyle = isNavy ? 'rgba(56,189,248,0.16)' : 'rgba(148,163,184,0.32)';
          ctx.lineWidth = 0.75;
          ctx.setLineDash([7, 4]);
          ctx.beginPath();
          ctx.moveTo(gx, oy - 22);
          ctx.lineTo(gx, oy + rPxH + 18);
          ctx.stroke();
          ctx.setLineDash([]);

          // Grid Bubble
          ctx.fillStyle = isNavy ? '#0c213d' : '#ffffff';
          ctx.strokeStyle = isNavy ? '#38bdf8' : '#0f172a';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.arc(gx, oy - 32, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = isNavy ? '#38bdf8' : '#0f172a';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(i + 1), gx, oy - 32);
        }

        const rowLetters = ['A', 'B', 'C', 'D'];
        for (let j = 0; j <= rowsZ; j++) {
          const gy = oy + (rPxH / rowsZ) * j;
          ctx.strokeStyle = isNavy ? 'rgba(56,189,248,0.16)' : 'rgba(148,163,184,0.32)';
          ctx.lineWidth = 0.75;
          ctx.setLineDash([7, 4]);
          ctx.beginPath();
          ctx.moveTo(ox - 22, gy);
          ctx.lineTo(ox + rPxW + 18, gy);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = isNavy ? '#0c213d' : '#ffffff';
          ctx.strokeStyle = isNavy ? '#38bdf8' : '#0f172a';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.arc(ox - 34, gy, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = isNavy ? '#38bdf8' : '#0f172a';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(rowLetters[j] || 'E', ox - 34, gy);
        }
        ctx.restore();
      }

      // 3. Dynamic Flooring Zones (Layer: flooring)
      if (layoutState.layers && layoutState.layers.flooring) {
        // Concrete base screed slab across entire room
        ctx.fillStyle = isNavy ? '#0a192f' : '#f1f5f9';
        ctx.fillRect(ox, oy, rPxW, rPxH);

        const zones = (layoutState.flooringZones && layoutState.flooringZones.length > 0)
          ? layoutState.flooringZones
          : buildDefaultFlooringZones(pType, roomW, roomD);

        zones.forEach(zone => {
          const zPxX = cx + (zone.x - zone.w / 2) * ppm;
          const zPxY = cy + (zone.z - zone.d / 2) * ppm;
          const zPxW = zone.w * ppm;
          const zPxH = zone.d * ppm;
          const isSelected = (zone.id === layoutState.selectedFloorZoneId);

          ctx.save();
          if (zone.type === 'wood') {
            ctx.fillStyle = isNavy ? '#312316' : '#e6cbab';
            ctx.fillRect(zPxX, zPxY, zPxW, zPxH);
            // Wood plank lines
            ctx.strokeStyle = isNavy ? 'rgba(217,119,6,0.22)' : 'rgba(146,98,52,0.22)';
            ctx.lineWidth = 0.6;
            for (let py = zPxY + 8; py < zPxY + zPxH; py += 10) {
              ctx.beginPath(); ctx.moveTo(zPxX, py); ctx.lineTo(zPxX + zPxW, py); ctx.stroke();
            }
          } else if (zone.type === 'rubber') {
            ctx.fillStyle = isNavy ? '#101622' : '#23272f';
            ctx.fillRect(zPxX, zPxY, zPxW, zPxH);
            // 1000x1000mm Rubber Tile Grid
            ctx.strokeStyle = isNavy ? 'rgba(56,189,248,0.14)' : 'rgba(255,255,255,0.10)';
            ctx.lineWidth = 0.6;
            for (let gx = zPxX; gx <= zPxX + zPxW; gx += ppm) {
              ctx.beginPath(); ctx.moveTo(gx, zPxY); ctx.lineTo(gx, zPxY + zPxH); ctx.stroke();
            }
            for (let gy = zPxY; gy <= zPxY + zPxH; gy += ppm) {
              ctx.beginPath(); ctx.moveTo(zPxX, gy); ctx.lineTo(zPxX + zPxW, gy); ctx.stroke();
            }
          } else if (zone.type === 'turf') {
            ctx.fillStyle = isNavy ? '#064e3b' : '#15803d';
            ctx.fillRect(zPxX, zPxY, zPxW, zPxH);
            // Perimeter border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.4;
            ctx.strokeRect(zPxX + 2, zPxY + 2, zPxW - 4, zPxH - 4);
            // Yardage ticks every 1m
            for (let ty = zPxY + ppm; ty < zPxY + zPxH - 6; ty += ppm) {
              ctx.beginPath();
              ctx.moveTo(zPxX + 4, ty); ctx.lineTo(zPxX + 14, ty);
              ctx.moveTo(zPxX + zPxW - 14, ty); ctx.lineTo(zPxX + zPxW - 4, ty);
              ctx.stroke();
            }
          } else if (zone.type === 'pulastic') {
            ctx.fillStyle = isNavy ? '#0c3559' : '#0284c7';
            ctx.fillRect(zPxX, zPxY, zPxW, zPxH);
            // High performance court border transition line
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(zPxX + 2, zPxY + 2, zPxW - 4, zPxH - 4);
          } else {
            // Tile / Concrete
            ctx.fillStyle = isNavy ? '#1e293b' : '#cbd5e1';
            ctx.fillRect(zPxX, zPxY, zPxW, zPxH);
            ctx.strokeStyle = 'rgba(0,0,0,0.12)';
            ctx.lineWidth = 0.5;
            for (let gx = zPxX; gx <= zPxX + zPxW; gx += ppm * 0.6) {
              ctx.beginPath(); ctx.moveTo(gx, zPxY); ctx.lineTo(gx, zPxY + zPxH); ctx.stroke();
            }
          }

          // Zone Watermark Tag
          ctx.fillStyle = (zone.type === 'rubber' || zone.type === 'turf' || zone.type === 'pulastic') ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.72)';
          ctx.font = 'bold 9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${zone.name.toUpperCase()} • ${(zone.w * zone.d).toFixed(1)} m²`, zPxX + zPxW / 2, zPxY + 14);

          // If selected: draw highlighted boundary & 8 resize handles & dimension callouts
          if (isSelected) {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2.2;
            ctx.setLineDash([6, 3]);
            ctx.strokeRect(zPxX, zPxY, zPxW, zPxH);
            ctx.setLineDash([]);

            // 8 handles
            const hList = [
              [zPxX, zPxY],
              [zPxX + zPxW / 2, zPxY],
              [zPxX + zPxW, zPxY],
              [zPxX + zPxW, zPxY + zPxH / 2],
              [zPxX + zPxW, zPxY + zPxH],
              [zPxX + zPxW / 2, zPxY + zPxH],
              [zPxX, zPxY + zPxH],
              [zPxX, zPxY + zPxH / 2]
            ];
            hList.forEach(([hx, hy]) => {
              ctx.fillStyle = '#f59e0b';
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              ctx.fillRect(hx - 4, hy - 4, 8, 8);
              ctx.strokeRect(hx - 4, hy - 4, 8, 8);
            });

            // Dimension callout for selected zone
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 10px monospace';
            ctx.fillText(`${zone.w.toFixed(2)}m`, zPxX + zPxW / 2, zPxY - 6);
            ctx.fillText(`${zone.d.toFixed(2)}m`, zPxX + zPxW + 18, zPxY + zPxH / 2);
          }

          ctx.restore();
        });
      }

      // 4. Auxiliary Core Block / Entry Architecture
      if (pType === 'commercial_gym' || pType === 'hotel_resort') {
        // Commercial Elevator Core + Locker & WC
        const auxW = rPxW * 0.32;
        const auxH = rPxH * 0.30;
        ctx.save();
        ctx.fillStyle = isNavy ? '#0f2744' : '#f1f5f9';
        ctx.strokeStyle = isNavy ? '#38bdf8' : '#1e293b';
        ctx.lineWidth = 2;
        ctx.fillRect(ox, oy, auxW, auxH);
        ctx.strokeRect(ox, oy, auxW, auxH);

        const elvW = auxW * 0.26;
        const elvH = auxH * 0.52;
        ctx.lineWidth = 1.2;
        for (let e = 0; e < 2; e++) {
          const ex = ox + auxW - elvW * (e + 1);
          const ey = oy;
          ctx.strokeRect(ex, ey, elvW, elvH);
          ctx.beginPath();
          ctx.moveTo(ex, ey); ctx.lineTo(ex + elvW, ey + elvH);
          ctx.moveTo(ex + elvW, ey); ctx.lineTo(ex, ey + elvH);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(ox + auxW * 0.48, oy);
        ctx.lineTo(ox + auxW * 0.48, oy + auxH);
        ctx.stroke();

        ctx.fillStyle = isNavy ? '#93c5fd' : '#334155';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LOCKER / WC', ox + auxW * 0.24, oy + auxH * 0.48);
        ctx.fillText('ELEVATOR LOBBY', ox + auxW * 0.74, oy + auxH * 0.78);

        const doorX = ox + auxW * 0.62;
        const doorY = oy + auxH;
        const doorR = 0.9 * ppm;
        ctx.strokeStyle = isNavy ? '#38bdf8' : '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(doorX, doorY);
        ctx.lineTo(doorX, doorY + doorR);
        ctx.arc(doorX, doorY, doorR, Math.PI / 2, 0, true);
        ctx.stroke();
        ctx.restore();
      } else if (pType === 'pilates_studio') {
        // Boutique Pilates Reception & Tea Lounge + Changing Suite (No Elevators!)
        const auxW = rPxW * 0.28;
        const auxH = rPxH * 0.26;
        ctx.save();
        ctx.fillStyle = isNavy ? '#0f2744' : '#faf5ef';
        ctx.strokeStyle = isNavy ? '#38bdf8' : '#92400e';
        ctx.lineWidth = 1.6;
        ctx.fillRect(ox, oy, auxW, auxH);
        ctx.strokeRect(ox, oy, auxW, auxH);

        // Dividing partition
        ctx.beginPath();
        ctx.moveTo(ox + auxW * 0.52, oy);
        ctx.lineTo(ox + auxW * 0.52, oy + auxH);
        ctx.stroke();

        ctx.fillStyle = isNavy ? '#93c5fd' : '#78350f';
        ctx.font = 'bold 8.5px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('RECEPTION & TEA', ox + auxW * 0.26, oy + auxH * 0.50);
        ctx.fillText('CHANGING & MATS', ox + auxW * 0.76, oy + auxH * 0.50);

        // Boutique Glass Swing Door
        const doorX = ox + auxW * 0.52;
        const doorY = oy + auxH;
        const doorR = 0.85 * ppm;
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(doorX, doorY);
        ctx.lineTo(doorX, doorY + doorR);
        ctx.arc(doorX, doorY, doorR, Math.PI / 2, 0, true);
        ctx.stroke();
        ctx.restore();
      } else if (pType === 'villa_gym') {
        // Private Villa Entrance + Wellness / Towel Refresh Bar
        const barW = rPxW * 0.22;
        const barH = 0.9 * ppm;
        ctx.save();
        ctx.fillStyle = '#451a03';
        ctx.fillRect(ox, oy, barW, barH);
        ctx.fillStyle = '#fef3c7';
        ctx.font = 'bold 8.5px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('REFRESH BAR & TOWEL STATION', ox + barW / 2, oy + barH * 0.65);

        // Sliding Glass Patio Doors to Pool / Garden (North Wall)
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(ox + barW + 15, oy);
        ctx.lineTo(ox + rPxW - 15, oy);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 8.5px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GARDEN / POOL PATIO SLIDING GLASS', ox + barW + (rPxW - barW) / 2, oy - 8);
        ctx.restore();
      } else if (pType === 'glute_hub') {
        // Glute Hub Compact Check-in & Hydration Bar
        const auxW = rPxW * 0.24;
        const auxH = rPxH * 0.24;
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 1.5;
        ctx.fillRect(ox, oy, auxW, auxH);
        ctx.strokeRect(ox, oy, auxW, auxH);
        ctx.fillStyle = '#fda4af';
        ctx.font = 'bold 8.5px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CHECK-IN & HYDRATION', ox + auxW / 2, oy + auxH / 2);
        ctx.restore();
      }

      // 5. Perimeter Poché Structural Walls + Curtain Glass Windows + Concrete Columns
      const wallT = 8;
      ctx.fillStyle = isNavy ? '#38bdf8' : '#0f172a';
      // West & South solid walls
      ctx.fillRect(ox - wallT, oy - wallT, wallT, rPxH + wallT * 2);
      ctx.fillRect(ox - wallT, oy + rPxH, rPxW + wallT * 2, wallT);
      // North wall (left half solid, right half double-line curtain glass window)
      ctx.fillRect(ox - wallT, oy - wallT, rPxW * 0.35, wallT);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(ox + rPxW * 0.35, oy - 5, rPxW * 0.65, 5);
      // East wall (curtain glass facade)
      ctx.strokeRect(ox + rPxW, oy, 5, rPxH);

      // Internal Structural Columns (Only for large commercial gyms)
      const hasColumns = (pType === 'commercial_gym' || pType === 'hotel_resort') && layoutState.roomW >= 15;
      if (hasColumns) {
        const colSize = Math.max(10, 0.5 * ppm);
        const colCoords = [
          [ox + rPxW * 0.35, oy + rPxH * 0.35],
          [ox + rPxW * 0.68, oy + rPxH * 0.35],
          [ox + rPxW * 0.35, oy + rPxH * 0.70],
          [ox + rPxW * 0.68, oy + rPxH * 0.70]
        ];
        colCoords.forEach(([ccx, ccy]) => {
          ctx.fillStyle = isNavy ? '#e2e8f0' : '#0f172a';
          ctx.fillRect(ccx - colSize / 2, ccy - colSize / 2, colSize, colSize);
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(ccx - colSize, ccy); ctx.lineTo(ccx + colSize, ccy);
          ctx.moveTo(ccx, ccy - colSize); ctx.lineTo(ccx, ccy + colSize);
          ctx.stroke();
        });
      }

      // 6. Zone Watermark Labels (Tailored by Project Type)
      ctx.save();
      ctx.font = '800 10px Montserrat, sans-serif';
      if (pType === 'pilates_studio') {
        ctx.fillStyle = isNavy ? 'rgba(148,163,184,0.45)' : 'rgba(120,53,15,0.45)';
        ctx.fillText('ZONE 1 — REFORMER CORE & FLOW ALLEY', ox + rPxW * 0.32, oy + 20);
        ctx.fillText('ZONE 2 — CADILLAC & TRAPEZE REHAB', ox + rPxW * 0.38, oy + rPxH * 0.46);
        ctx.fillText('ZONE 3 — LADDER BARREL & SPINE BAY', ox + 14, oy + rPxH - 14);
      } else if (pType === 'villa_gym') {
        ctx.fillStyle = isNavy ? 'rgba(148,163,184,0.45)' : 'rgba(69,26,3,0.45)';
        ctx.fillText('ZONE 1 — CARDIO PANORAMA VIEW', ox + rPxW * 0.35, oy + 20);
        ctx.fillText('ZONE 2 — DUAL ADJUSTABLE PULLEY & MULTI-WORKOUT', ox + rPxW * 0.28, oy + rPxH * 0.46);
        ctx.fillText('ZONE 3 — FREE WEIGHTS & MAT STRETCHING', ox + 14, oy + rPxH - 14);
      } else if (pType === 'glute_hub') {
        ctx.fillStyle = 'rgba(244,63,94,0.55)';
        ctx.fillText('ZONE 1 — HIP THRUST & SPECIALTY ARENA', ox + rPxW * 0.32, oy + 20);
        ctx.fillText('ZONE 2 — SQUAT, HACK & LOWER HYPERTROPHY', ox + rPxW * 0.32, oy + rPxH * 0.46);
        ctx.fillText('ZONE 3 — DUMBBELLS & TURF SPRINT TRACK', ox + 14, oy + rPxH - 14);
      } else {
        ctx.fillStyle = isNavy ? 'rgba(148,163,184,0.45)' : 'rgba(15,23,42,0.45)';
        ctx.fillText('ZONE A — CARDIO & CURTAIN GLASS VIEW', ox + rPxW * 0.42, oy + 18);
        ctx.fillStyle = style === 'attivo_studio' ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.45)';
        ctx.fillText('ZONE B — SELECTORIZED STRENGTH', ox + rPxW * 0.38, oy + rPxH * 0.42);
        ctx.fillText('ZONE C — ELEIKO FREE WEIGHTS & RACKS', ox + 14, oy + rPxH - 12);
      }
      ctx.restore();

      // Empty Layout Watermark Note
      if (layoutState.placements.length === 0) {
        ctx.save();
        ctx.fillStyle = isNavy ? 'rgba(56,189,248,0.75)' : 'rgba(15,23,42,0.65)';
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📐 BÁO GIÁ ĐANG TRỐNG — THÊM MÃ HÀNG TỪ BẢNG HOẶC DÙNG AI ĐỂ TỰ ĐỘNG BỐ TRÍ', cx, cy);
        ctx.restore();
      }

      // 7. Draw All Equipment Items with Detailed Authentic AutoCAD Symbols (Layer: equipment)
      if (layoutState.layers && layoutState.layers.equipment) {
        layoutState.placements.forEach((eq, idx) => {
          const ex = cx + eq.x * ppm;
          const ey = cy + eq.z * ppm;
          const pw = eq.w * ppm;
          const pd = eq.d * ppm;
          const isSelected = (eq.uid === layoutState.selectedId);

          ctx.save();
          ctx.translate(ex, ey);
          ctx.rotate(eq.rotY || 0);

          // Safety Clearance Halo (dashed ISO safety envelope - Layer: clearance)
          if (layoutState.layers && layoutState.layers.clearance) {
            const clr = (eq.clearance || 0.5) * ppm;
            ctx.strokeStyle = isSelected
              ? '#06b6d4'
              : (style === 'attivo_studio' ? 'rgba(251,191,36,0.32)' : 'rgba(2,132,199,0.25)');
            ctx.lineWidth = isSelected ? 1.5 : 0.8;
            ctx.setLineDash([4, 3]);
            ctx.strokeRect(-pw / 2 - clr * 0.35, -pd / 2 - clr * 0.35, pw + clr * 0.7, pd + clr * 0.7);
            ctx.setLineDash([]);
          }

          // Detailed Multi-Part AutoCAD Vector Block
          this.drawDetailedCadSymbol(ctx, eq, pw, pd, isSelected, style);

          // Selection Handles & Rotation Stem if Selected
          if (isSelected) {
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 2;
            ctx.strokeRect(-pw / 2 - 4, -pd / 2 - 4, pw + 8, pd + 8);

            // 4 Corner CAD Grip Squares
            const grip = 5;
            ctx.fillStyle = '#06b6d4';
            [
              [-pw / 2 - 4, -pd / 2 - 4],
              [pw / 2 + 4, -pd / 2 - 4],
              [-pw / 2 - 4, pd / 2 + 4],
              [pw / 2 + 4, pd / 2 + 4]
            ].forEach(([gx, gy]) => {
              ctx.fillRect(gx - grip / 2, gy - grip / 2, grip, grip);
            });

            // Front Direction / Rotation Handle
            ctx.beginPath();
            ctx.moveTo(0, -pd / 2 - 4);
            ctx.lineTo(0, -pd / 2 - 16);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, -pd / 2 - 18, 4.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();

          // Equipment Callout Tag (`#1 TRM885`)
          ctx.save();
          const tagText = `${idx + 1}. ${(eq.sku || '').slice(0, 9)}`;
          ctx.font = 'bold 8.5px Inter, sans-serif';
          const tw = ctx.measureText(tagText).width + 8;
          ctx.fillStyle = isSelected ? '#0891b2' : 'rgba(15, 23, 42, 0.86)';
          ctx.fillRect(ex - tw / 2, ey - 7, tw, 13);
          ctx.strokeStyle = isSelected ? '#67e8f9' : '#cbd5e1';
          ctx.lineWidth = 0.7;
          ctx.strokeRect(ex - tw / 2, ey - 7, tw, 13);
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tagText, ex, ey - 0.5);
          ctx.restore();
        });
      }

      // 8. Architectural Dimension Lines (in mm - Layer: dimensions)
      if (layoutState.layers && layoutState.layers.dimensions) {
        this.drawDimensionLine(ctx, ox, oy + rPxH + 34, ox + rPxW, oy + rPxH + 34, `${Math.round(roomW * 1000)} mm`, isNavy);
        this.drawDimensionLine(ctx, ox + rPxW + 34, oy, ox + rPxW + 34, oy + rPxH, `${Math.round(roomD * 1000)} mm`, isNavy, true);
      }

      // 9. CAD Ruler Active Measurement Overlay
      const rPts = layoutState.rulerPoints || [];
      const livePt = this.rulerLivePoint;
      if (rPts.length > 0) {
        ctx.save();
        const p1 = rPts[0];
        const p2 = rPts.length >= 2 ? rPts[1] : livePt;
        if (p1 && p2) {
          const px1 = cx + p1.x * ppm;
          const py1 = cy + p1.z * ppm;
          const px2 = cx + p2.x * ppm;
          const py2 = cy + p2.z * ppm;

          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.2;
          ctx.setLineDash([5, 3]);
          ctx.beginPath();
          ctx.moveTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(px1, py1, 4.5, 0, Math.PI * 2);
          ctx.arc(px2, py2, 4.5, 0, Math.PI * 2);
          ctx.fill();

          const dxM = p2.x - p1.x;
          const dzM = p2.z - p1.z;
          const distM = Math.hypot(dxM, dzM);
          const distMm = Math.round(distM * 1000);
          const midX = (px1 + px2) / 2;
          const midY = (py1 + py2) / 2 - 12;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.3;
          const tagText = `📐 ${distM.toFixed(2)}m (${distMm.toLocaleString()} mm)`;
          ctx.font = 'bold 11px Inter, monospace';
          const txtW = ctx.measureText(tagText).width;
          ctx.fillRect(midX - txtW / 2 - 8, midY - 10, txtW + 16, 20);
          ctx.strokeRect(midX - txtW / 2 - 8, midY - 10, txtW + 16, 20);
          ctx.fillStyle = '#fbbf24';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tagText, midX, midY);
        }
        ctx.restore();
      }

      // 10. Right-Side ISO Architectural Title Block & Equipment Schedule
      this.drawTitleBlockAndSchedule(ctx, W, H, isNavy);
    },

    drawDetailedCadSymbol(ctx, eq, pw, pd, isSelected, style) {
      const kind = eq.kind;
      const strokeMain = isSelected ? '#00204a' : '#0f172a';
      const fillChassis = '#e2e8f0';
      const fillPad = eq.zone === 'cardio' ? '#1e293b' : (eq.zone === 'free_weights' ? '#991b1b' : '#1e3a8a');

      ctx.lineWidth = 1.25;
      ctx.strokeStyle = strokeMain;

      if (kind === 'treadmill') {
        // Outer frame & aluminum side rails
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
        // Side foot rails
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-pw / 2, -pd / 2 + pd * 0.22, pw * 0.14, pd * 0.74);
        ctx.fillRect(pw / 2 - pw * 0.14, -pd / 2 + pd * 0.22, pw * 0.14, pd * 0.74);
        // Running belt deck
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-pw * 0.34, -pd / 2 + pd * 0.24, pw * 0.68, pd * 0.70);
        // Belt direction arrows
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        for (let ay = -pd * 0.08; ay <= pd * 0.28; ay += pd * 0.18) {
          ctx.beginPath();
          ctx.moveTo(-pw * 0.14, ay + 4);
          ctx.lineTo(0, ay - 4);
          ctx.lineTo(pw * 0.14, ay + 4);
          ctx.stroke();
        }
        // Front motor hood
        ctx.fillStyle = '#94a3b8';
        ctx.strokeStyle = strokeMain;
        ctx.fillRect(-pw / 2 + 2, -pd / 2 + 2, pw - 4, pd * 0.21);
        ctx.strokeRect(-pw / 2 + 2, -pd / 2 + 2, pw - 4, pd * 0.21);
        // PVS Console & Handrails
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-pw * 0.36, -pd / 2 + pd * 0.14, pw * 0.72, pd * 0.12);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-pw * 0.22, -pd / 2 + pd * 0.16, pw * 0.44, pd * 0.07);
      } else if (kind === 'elliptical' || kind === 'amt') {
        // Base frame oval + rear/front drive housing
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-pw * 0.42, -pd / 2, pw * 0.84, pd);
        ctx.strokeRect(-pw * 0.42, -pd / 2, pw * 0.84, pd);
        // Flywheel shroud circle
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.ellipse(0, pd * 0.24, pw * 0.30, pd * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Dual Foot Pedals
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-pw * 0.36, -pd * 0.05, pw * 0.24, pd * 0.34);
        ctx.fillRect(pw * 0.12, -pd * 0.12, pw * 0.24, pd * 0.34);
        // Moving Arms & Front Console
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-pw * 0.28, -pd / 2 + 4, pw * 0.56, pd * 0.14);
        ctx.beginPath();
        ctx.moveTo(-pw * 0.44, -pd * 0.26); ctx.lineTo(pw * 0.44, -pd * 0.26);
        ctx.stroke();
      } else if (kind === 'stairclimber') {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
        // Revolving steps (5 steps)
        ctx.fillStyle = '#1e293b';
        const stepH = (pd * 0.68) / 5;
        for (let s = 0; s < 5; s++) {
          ctx.fillRect(-pw * 0.36, -pd * 0.22 + s * stepH, pw * 0.72, stepH - 2);
        }
        // Top console
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-pw * 0.28, -pd / 2 + 4, pw * 0.56, pd * 0.16);
      } else if (kind === 'bike' || kind === 'airbike') {
        // Stabilizer bars (front & rear T-feet)
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-pw * 0.46, -pd / 2, pw * 0.92, pd * 0.12);
        ctx.fillRect(-pw * 0.46, pd / 2 - pd * 0.12, pw * 0.92, pd * 0.12);
        // Main spine frame
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-pw * 0.18, -pd / 2, pw * 0.36, pd);
        ctx.strokeRect(-pw * 0.18, -pd / 2, pw * 0.36, pd);
        // Contoured Saddle
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(0, pd * 0.18, pw * 0.24, pd * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        // Pedals + Crank
        ctx.fillRect(-pw * 0.36, -pd * 0.06, pw * 0.16, pd * 0.10);
        ctx.fillRect(pw * 0.20, -pd * 0.06, pw * 0.16, pd * 0.10);
        // Front Console & Aero Handlebars
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-pw * 0.28, -pd / 2 + 4, pw * 0.56, pd * 0.16);
      } else if (kind === 'rower') {
        // Monorail beam
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-pw * 0.12, -pd / 2, pw * 0.24, pd);
        ctx.strokeRect(-pw * 0.12, -pd / 2, pw * 0.24, pd);
        // Front circular flywheel drum
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, -pd / 2 + pw * 0.42, pw * 0.40, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Sliding seat carriage
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-pw * 0.32, pd * 0.06, pw * 0.64, pd * 0.14);
      } else if (kind === 'power_rack' || kind === 'half_rack' || kind === 'double_rack') {
        // Integrated Lifting Platform (Oak center + Rubber wings)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-pw * 0.26, -pd / 2 + 2, pw * 0.52, pd - 4);
        ctx.strokeRect(-pw * 0.26, -pd / 2 + 2, pw * 0.52, pd - 4);

        // 4 Structural Laser-Cut Uprights (70x70mm)
        const up = Math.max(4, pw * 0.08);
        ctx.fillStyle = '#dc2626';
        [
          [-pw * 0.34, -pd * 0.36],
          [pw * 0.34 - up, -pd * 0.36],
          [-pw * 0.34, pd * 0.10],
          [pw * 0.34 - up, pd * 0.10]
        ].forEach(([ux, uy]) => {
          ctx.fillRect(ux, uy, up, up);
          ctx.strokeRect(ux, uy, up, up);
        });

        // 2.2m Olympic Barbell + Colored Competition Bumper Plates
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-pw * 0.54, -pd * 0.16, pw * 1.08, 3.5);
        // Bumper plates (Red 25kg, Blue 20kg, Yellow 15kg)
        const plateColors = ['#dc2626', '#2563eb', '#eab308'];
        plateColors.forEach((col, pi) => {
          ctx.fillStyle = col;
          ctx.fillRect(-pw * 0.48 + pi * 3.5, -pd * 0.26, 3, pd * 0.20);
          ctx.fillRect(pw * 0.45 - pi * 3.5, -pd * 0.26, 3, pd * 0.20);
        });

        // Adjustable Bench inside rack
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-pw * 0.12, -pd * 0.10, pw * 0.24, pd * 0.48);
      } else if (kind === 'cable_crossover') {
        // Wide angled DAP columns + overhead bridge
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-pw / 2, -pd * 0.22, pw, pd * 0.44);
        ctx.strokeRect(-pw / 2, -pd * 0.22, pw, pd * 0.44);
        // Left & Right Weight Stack Towers
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-pw / 2 + 2, -pd * 0.36, pw * 0.22, pd * 0.72);
        ctx.fillRect(pw / 2 - pw * 0.22 - 2, -pd * 0.36, pw * 0.22, pd * 0.72);
      } else if (kind === 'dumbbell_rack') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
        // 10 pairs of graduated dumbbells along the 2-tier tray
        ctx.fillStyle = '#e2e8f0';
        const pairs = 10;
        const stepX = (pw - 8) / pairs;
        for (let i = 0; i < pairs; i++) {
          const dx = -pw / 2 + 5 + i * stepX;
          ctx.fillRect(dx, -pd * 0.36, stepX * 0.65, pd * 0.72);
        }
      } else if (kind === 'reformer' || kind === 'cadillac' || kind === 'barrel') {
        // Maple Wood Frame Rails
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
        // Upholstered Pilates Carriage + Shoulder Blocks + 5 Springs
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-pw * 0.40, -pd * 0.34, pw * 0.80, pd * 0.58);
        // 5 Reformer Springs (Red/Blue/Yellow)
        const spColors = ['#dc2626', '#dc2626', '#2563eb', '#2563eb', '#eab308'];
        spColors.forEach((sc, si) => {
          ctx.strokeStyle = sc;
          ctx.lineWidth = 1.5;
          const sx = -pw * 0.24 + si * (pw * 0.12);
          ctx.beginPath();
          ctx.moveTo(sx, pd * 0.24);
          ctx.lineTo(sx, pd * 0.46);
          ctx.stroke();
        });
      } else {
        // Selectorized Station / Leg Press / Smith / Bench
        ctx.fillStyle = fillChassis;
        ctx.fillRect(-pw / 2, -pd / 2, pw, pd);
        ctx.strokeRect(-pw / 2, -pd / 2, pw, pd);
        // Weight stack tower (left/front shroud)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-pw / 2 + 3, -pd / 2 + 3, pw * 0.34, pd * 0.34);
        // Seat & Backrest Upholstered Pads
        ctx.fillStyle = fillPad;
        ctx.fillRect(-pw * 0.20, -pd * 0.08, pw * 0.44, pd * 0.44);
        ctx.strokeRect(-pw * 0.20, -pd * 0.08, pw * 0.44, pd * 0.44);
        // Converging Press Arms
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-pw * 0.36, -pd * 0.10);
        ctx.lineTo(-pw * 0.36, pd * 0.24);
        ctx.moveTo(pw * 0.36, -pd * 0.10);
        ctx.lineTo(pw * 0.36, pd * 0.24);
        ctx.stroke();
      }
    },

    drawDimensionLine(ctx, x1, y1, x2, y2, label, isNavy, vertical) {
      ctx.save();
      ctx.strokeStyle = isNavy ? '#38bdf8' : '#0f172a';
      ctx.fillStyle = isNavy ? '#38bdf8' : '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Architectural 45-degree ticks
      const tick = 5;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x1 - tick, y1 + tick); ctx.lineTo(x1 + tick, y1 - tick);
      ctx.moveTo(x2 - tick, y2 + tick); ctx.lineTo(x2 + tick, y2 - tick);
      ctx.stroke();

      ctx.font = 'bold 10px Inter, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (vertical) {
        ctx.translate((x1 + x2) / 2 + 12, (y1 + y2) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(label, 0, 0);
      } else {
        ctx.fillText(label, (x1 + x2) / 2, y1 - 9);
      }
      ctx.restore();
    },

    drawTitleBlockAndSchedule(ctx, W, H, isNavy) {
      const tbX = W - 295;
      const tbY = 24;
      const tbW = 271;
      const tbH = H - 48;

      ctx.save();
      ctx.fillStyle = isNavy ? '#0c1f38' : '#f8fafc';
      ctx.strokeStyle = isNavy ? '#38bdf8' : '#0f172a';
      ctx.lineWidth = 1.6;
      ctx.fillRect(tbX, tbY, tbW, tbH);
      ctx.strokeRect(tbX, tbY, tbW, tbH);

      // Header Banner
      ctx.fillStyle = '#00204a';
      ctx.fillRect(tbX, tbY, tbW, 54);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 13px Montserrat, sans-serif';
      ctx.fillText('ATTIVO INTERNATIONAL', tbX + 12, tbY + 22);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9.5px Inter, sans-serif';
      ctx.fillText('2D AUTOCAD EQUIPMENT SCHEDULE', tbX + 12, tbY + 40);

      // Project Metadata
      const metaY = tbY + 68;
      ctx.fillStyle = isNavy ? '#e2e8f0' : '#0f172a';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(`TOTAL AREA: ${layoutState.area} m² (${layoutState.roomW}m × ${layoutState.roomD}m)`, tbX + 12, metaY);
      ctx.fillText(`TOTAL UNITS: ${layoutState.placements.length} MACHINES`, tbX + 12, metaY + 16);
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('🖱️ Click & Drag any symbol to edit layout', tbX + 12, metaY + 32);

      // Divider
      ctx.strokeStyle = isNavy ? '#1e3a5f' : '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(tbX, metaY + 42);
      ctx.lineTo(tbX + tbW, metaY + 42);
      ctx.stroke();

      // Schedule List (Grouped by SKU)
      const grouped = {};
      layoutState.placements.forEach(p => {
        const key = p.sku || p.kind;
        if (!grouped[key]) grouped[key] = { sku: p.sku, name: p.name, qty: 0, w: p.w, d: p.d };
        grouped[key].qty++;
      });

      let rowY = metaY + 60;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillStyle = isNavy ? '#94a3b8' : '#475569';
      ctx.fillText('SKU / MODEL', tbX + 12, rowY);
      ctx.fillText('DIM (mm)', tbX + 162, rowY);
      ctx.fillText('QTY', tbX + 238, rowY);
      rowY += 10;

      Object.values(grouped).slice(0, 18).forEach((g) => {
        rowY += 20;
        if (rowY > tbY + tbH - 85) return;
        ctx.fillStyle = isNavy ? '#f8fafc' : '#0f172a';
        ctx.font = 'bold 9.5px Inter, sans-serif';
        ctx.fillText(`${(g.sku || '').slice(0, 10)}`, tbX + 12, rowY);
        ctx.font = '9px Inter, sans-serif';
        ctx.fillStyle = isNavy ? '#94a3b8' : '#475569';
        ctx.fillText(`${(g.name || '').slice(0, 16)}`, tbX + 68, rowY);
        ctx.fillText(`${Math.round(g.w * 1000)}×${Math.round(g.d * 1000)}`, tbX + 162, rowY);
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 9.5px Inter, sans-serif';
        ctx.fillText(`×${g.qty}`, tbX + 242, rowY);
      });

      // Sheet Stamp at Bottom
      const stampY = tbY + tbH - 64;
      ctx.fillStyle = isNavy ? '#081528' : '#f1f5f9';
      ctx.fillRect(tbX + 1, stampY, tbW - 2, 63);
      ctx.strokeStyle = isNavy ? '#1e3a5f' : '#cbd5e1';
      ctx.strokeRect(tbX + 1, stampY, tbW - 2, 63);

      ctx.fillStyle = isNavy ? '#38bdf8' : '#00204a';
      ctx.font = '800 11px Montserrat, sans-serif';
      ctx.fillText('DWG NO: A-101 (CAD & MEP)', tbX + 12, stampY + 22);
      ctx.fillStyle = isNavy ? '#94a3b8' : '#475569';
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText('SCALE: 1:100 @ A3 • UNIT: MM', tbX + 12, stampY + 38);
      ctx.fillText('STANDARD: EN-957 / ASTM F2276', tbX + 12, stampY + 52);
      ctx.restore();
    },

    exportPNG() {
      const canvas = document.getElementById('aiFloorplanCanvas');
      if (!canvas) return;
      try {
        const a = document.createElement('a');
        const projName = (layoutState.projectType || 'gym').toUpperCase();
        a.download = `Attivo_2D_AutoCAD_Floorplan_${projName}_${Date.now()}.png`;
        a.href = canvas.toDataURL('image/png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (typeof showToast === 'function') {
          showToast('✅ Đã tải sơ đồ 2D AutoCAD Floorplan (PNG)');
        }
      } catch (err) {
        console.error('2D export error:', err);
      }
    }
  };

  // ============================================================================
  // 4. 3D ROOM PLANNER ENGINE (`b762b483` ARCHITECTURAL ROOM + 100% REAL .GLB)
  // ============================================================================
  const AttivoVisualizer3D = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    roomGroup: null,
    equipmentGroup: null,
    ceilingGroup: null,
    wallGroups: [],
    meshByUid: new Map(),
    glbCache: new Map(),
    selectionRing: null,
    showCeiling: false,
    smartCutaway: true,
    isDragging3D: false,
    dragPlane: null,
    raycaster: null,
    mouse: null,
    animId: null,
    hudEl: null,

    initScene(container) {
      if (typeof THREE === 'undefined') return false;
      const w = container.clientWidth || 960;
      const h = container.clientHeight || 560;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x111827);

      this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 250);
      this.camera.position.set(16, 13.5, 17);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if (THREE.ACESFilmicToneMapping !== undefined) {
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.18;
      }

      container.innerHTML = '';
      container.appendChild(this.renderer.domElement);

      if (THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.07;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
        this.controls.target.set(0, 0.8, 0);
      }

      // Studio PBR Lighting (from b762b483 Room Planner)
      const hemi = new THREE.HemisphereLight(0xffffff, 0x334155, 0.95);
      hemi.position.set(0, 20, 0);
      this.scene.add(hemi);

      const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
      dirLight.position.set(14, 22, 16);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.camera.near = 1;
      dirLight.shadow.camera.far = 65;
      const d = 18;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
      this.scene.add(dirLight);

      const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.65);
      fillLight.position.set(-15, 14, -12);
      this.scene.add(fillLight);

      this.roomGroup = new THREE.Group();
      this.equipmentGroup = new THREE.Group();
      this.ceilingGroup = new THREE.Group();
      this.scene.add(this.roomGroup);
      this.scene.add(this.equipmentGroup);
      this.scene.add(this.ceilingGroup);

      // Glowing Cyan Selection Ring (from b762b483)
      const ringGeo = new THREE.RingGeometry(0.95, 1.12, 48);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
      this.selectionRing = new THREE.Mesh(ringGeo, ringMat);
      this.selectionRing.position.y = 0.025;
      this.selectionRing.visible = false;
      this.scene.add(this.selectionRing);

      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

      this.mountFloatingHud(container);
      this.bind3DInteractionEvents(this.renderer.domElement);

      const animate = () => {
        this.animId = requestAnimationFrame(animate);
        if (this.controls) this.controls.update();
        if (this.smartCutaway) this.updateWallCutaways();
        if (this.renderer && this.scene && this.camera) {
          this.renderer.render(this.scene, this.camera);
        }
      };
      animate();

      return true;
    },

    mountFloatingHud(container) {
      const hud = document.createElement('div');
      hud.className = 'absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white text-xs z-10 pointer-events-auto';
      hud.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold text-[10px] uppercase">b762b483 3D Room Planner</span>
          <span id="cad3dSelectedLabel" class="font-mono text-slate-200 font-semibold">Click any 3D machine to Select / Drag / Rotate</span>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" onclick="AttivoVisualizer2D.rotateSelected(-45)" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold transition">⟲ -45°</button>
          <button type="button" onclick="AttivoVisualizer2D.rotateSelected(45)" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold transition">⟳ +45°</button>
          <button type="button" onclick="AttivoVisualizer2D.rotateSelected(90)" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold transition">🔁 90°</button>
          <button type="button" onclick="AttivoVisualizer2D.duplicateSelected()" class="px-2.5 py-1 rounded-lg bg-cyan-700 hover:bg-cyan-600 font-bold transition">+ Nhân Bản</button>
          <button type="button" onclick="AttivoVisualizer2D.deleteSelected()" class="px-2.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-600 font-bold transition">🗑️ Xóa</button>
        </div>
      `;
      container.appendChild(hud);
      this.hudEl = hud;
      updateSelectedHudLabel();
    },

    bind3DInteractionEvents(domElement) {
      const updateMouse = (evt) => {
        const rect = domElement.getBoundingClientRect();
        this.mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
      };

      const findPickedEquipmentRoot = (obj) => {
        let cur = obj;
        while (cur && cur !== this.equipmentGroup) {
          if (cur.userData && cur.userData.uid) return cur;
          cur = cur.parent;
        }
        return null;
      };

      domElement.addEventListener('pointerdown', (evt) => {
        if (evt.button !== 0) return;
        updateMouse(evt);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hits = this.raycaster.intersectObjects(this.equipmentGroup.children, true);
        if (hits.length > 0) {
          const root = findPickedEquipmentRoot(hits[0].object);
          if (root && root.userData.uid) {
            layoutState.selectedId = root.userData.uid;
            this.isDragging3D = true;
            if (this.controls) this.controls.enabled = false;
            this.updateSelectionRing();
            updateSelectedHudLabel();
            AttivoVisualizer2D.draw();
          }
        }
      });

      domElement.addEventListener('pointermove', (evt) => {
        if (!this.isDragging3D || !layoutState.selectedId) return;
        updateMouse(evt);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersectPt = new THREE.Vector3();
        if (this.raycaster.ray.intersectPlane(this.dragPlane, intersectPt)) {
          const sel = getSelectedEquipment();
          if (sel) {
            const halfW = layoutState.roomW / 2 - sel.w / 2 - 0.25;
            const halfD = layoutState.roomD / 2 - sel.d / 2 - 0.25;
            sel.x = Number(Math.max(-halfW, Math.min(halfW, Math.round(intersectPt.x * 20) / 20)).toFixed(2));
            sel.z = Number(Math.max(-halfD, Math.min(halfD, Math.round(intersectPt.z * 20) / 20)).toFixed(2));
            this.syncTransformsFromState();
            syncBothViewsAfterEdit('3d');
          }
        }
      });

      const endDrag3D = () => {
        if (this.isDragging3D) {
          this.isDragging3D = false;
          if (this.controls) this.controls.enabled = true;
          syncBothViewsAfterEdit('3d');
        }
      };
      domElement.addEventListener('pointerup', endDrag3D);
      domElement.addEventListener('pointerleave', endDrag3D);
    },

    makeWoodFloorTexture() {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#c89d6c';
      ctx.fillRect(0, 0, 512, 512);
      const planks = 8;
      const ph = 512 / planks;
      for (let i = 0; i < planks; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(180,130,80,0.32)' : 'rgba(215,170,120,0.28)';
        ctx.fillRect(0, i * ph, 512, ph - 2);
        ctx.strokeStyle = 'rgba(90,55,25,0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, i * ph, 512, ph);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
      return tex;
    },

    makeRubberFloorTexture() {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#1e2024';
      ctx.fillRect(0, 0, 256, 256);
      // EPDM speckles
      for (let i = 0; i < 450; i++) {
        ctx.fillStyle = i % 3 === 0 ? 'rgba(148,163,184,0.18)' : 'rgba(71,85,105,0.22)';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(12, 8);
      return tex;
    },

    makePulasticTexture() {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      // Pulastic polyurethane sport blue
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 3000; i++) {
        const rx = Math.random() * 512;
        const ry = Math.random() * 512;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,32,74,0.08)';
        ctx.fillRect(rx, ry, 2, 2);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.40)';
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, 496, 496);
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      return tex;
    },

    makeTurfTexture() {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 4000; i++) {
        const rx = Math.random() * 512;
        const ry = Math.random() * 512;
        ctx.fillStyle = Math.random() > 0.4 ? 'rgba(34,197,94,0.35)' : 'rgba(20,83,45,0.45)';
        ctx.fillRect(rx, ry, 1, 3);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 12;
      ctx.strokeRect(10, 10, 492, 492);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(235, 30, 42, 24);
      ctx.fillRect(235, 455, 42, 24);
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 6);
      return tex;
    },

    makeTileTexture() {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, 128, 128);
      ctx.strokeRect(128, 0, 128, 128);
      ctx.strokeRect(0, 128, 128, 128);
      ctx.strokeRect(128, 128, 128, 128);
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(8, 8);
      return tex;
    },

    rebuildRoomMeshes() {
      this.buildArchitecturalGymRoom();
    },

    buildArchitecturalGymRoom() {
      while (this.roomGroup.children.length) this.roomGroup.remove(this.roomGroup.children[0]);
      while (this.ceilingGroup.children.length) this.ceilingGroup.remove(this.ceilingGroup.children[0]);
      this.wallGroups = [];

      const W = layoutState.roomW;
      const D = layoutState.roomD;
      const H = 4.2;
      const pType = layoutState.projectType || 'commercial_gym';

      // 1. Flooring Architecture: Concrete Base + Dynamic Flooring Zones (Layer: flooring)
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95, metalness: 0.05 });
      const baseMesh = new THREE.Mesh(new THREE.PlaneGeometry(W, D), baseMat);
      baseMesh.rotation.x = -Math.PI / 2;
      baseMesh.receiveShadow = true;
      this.roomGroup.add(baseMesh);

      const zones = (layoutState.flooringZones && layoutState.flooringZones.length > 0)
        ? layoutState.flooringZones
        : buildDefaultFlooringZones(pType, W, D);

      zones.forEach(z => {
        let mat;
        let yOffset = 0.005;
        if (z.type === 'wood') {
          mat = new THREE.MeshStandardMaterial({ map: this.makeWoodFloorTexture(), roughness: 0.38, metalness: 0.04 });
        } else if (z.type === 'rubber') {
          mat = new THREE.MeshStandardMaterial({ map: this.makeRubberFloorTexture(), roughness: 0.85, metalness: 0.05 });
          yOffset = 0.008;
        } else if (z.type === 'pulastic') {
          mat = new THREE.MeshStandardMaterial({ map: this.makePulasticTexture(), roughness: 0.52, metalness: 0.05 });
          yOffset = 0.006;
        } else if (z.type === 'turf') {
          mat = new THREE.MeshStandardMaterial({ map: this.makeTurfTexture(), roughness: 0.92, metalness: 0.02 });
          yOffset = 0.010;
        } else {
          mat = new THREE.MeshStandardMaterial({ map: this.makeTileTexture(), roughness: 0.40, metalness: 0.10 });
        }
        const fGeo = new THREE.PlaneGeometry(z.w, z.d);
        const fMesh = new THREE.Mesh(fGeo, mat);
        fMesh.rotation.x = -Math.PI / 2;
        fMesh.position.set(z.x, yOffset, z.z);
        fMesh.receiveShadow = true;
        this.roomGroup.add(fMesh);
      });

      // 2. Perimeter Walls with Smart Cutaway Support (`b762b483` updateWallCutaways)
      const addWallSegment = (w, h, d, x, y, z, normalVec, isGlass) => {
        const grp = new THREE.Group();
        grp.userData.normal = normalVec;
        const mat = isGlass
          ? new THREE.MeshPhysicalMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.28, roughness: 0.1, metalness: 0.1 })
          : new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.75, metalness: 0.05, transparent: true, opacity: 1.0 });
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = !isGlass;
        mesh.receiveShadow = true;
        grp.add(mesh);

        // Dark anthracite baseboard
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, transparent: true, opacity: 1.0 });
        const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.14, d + 0.02), baseMat);
        baseMesh.position.set(x, 0.07, z);
        grp.add(baseMesh);

        // If Curtain Glass Wall, add black aluminum mullions
        if (isGlass) {
          const mulMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.5 });
          const count = Math.max(3, Math.floor(Math.max(w, d) / 2.2));
          for (let i = 0; i <= count; i++) {
            const t = -0.5 + i / count;
            const mul = new THREE.Mesh(new THREE.BoxGeometry(w > d ? 0.06 : w + 0.04, h, d > w ? 0.06 : d + 0.04), mulMat);
            mul.position.set(w > d ? x + t * w : x, y, d > w ? z + t * d : z);
            grp.add(mul);
          }
        }

        this.roomGroup.add(grp);
        this.wallGroups.push(grp);
      };

      // North Wall (Back): Solid + Curtain Glass
      addWallSegment(W, H, 0.18, 0, H / 2, -D / 2, new THREE.Vector3(0, 0, 1), false);
      // West Wall (Left): Solid with Mirrors
      addWallSegment(0.18, H, D, -W / 2, H / 2, 0, new THREE.Vector3(1, 0, 0), false);
      // East Wall (Right): Curtain Glass Window Facade
      addWallSegment(0.14, H, D, W / 2, H / 2, 0, new THREE.Vector3(-1, 0, 0), true);
      // South Wall (Front): Smart Cutaway Wall
      addWallSegment(W, H, 0.16, 0, H / 2, D / 2, new THREE.Vector3(0, 0, -1), true);

      // 3. Auxiliary Core / Entry Architecture
      if (pType === 'commercial_gym' || pType === 'hotel_resort') {
        const auxW = W * 0.30;
        const auxD = D * 0.28;
        const auxH = 3.2;
        const auxMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 });
        const auxBox = new THREE.Mesh(new THREE.BoxGeometry(auxW, auxH, auxD), auxMat);
        auxBox.position.set(-W / 2 + auxW / 2, auxH / 2, -D / 2 + auxD / 2);
        auxBox.castShadow = true;
        auxBox.receiveShadow = true;
        this.roomGroup.add(auxBox);

        // Double Tempered Glass Entrance Doors on Auxiliary Block
        const doorMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, roughness: 0.1 });
        const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.35, 0.08), doorMat);
        doorMesh.position.set(-W / 2 + auxW * 0.62, 1.18, -D / 2 + auxD + 0.03);
        this.roomGroup.add(doorMesh);
      } else if (pType === 'pilates_studio') {
        // Boutique Pilates Reception & Tea Station
        const recepW = W * 0.25;
        const recepD = 1.2;
        const recepH = 1.1;
        const recepMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.4 });
        const recepDesk = new THREE.Mesh(new THREE.BoxGeometry(recepW, recepH, recepD), recepMat);
        recepDesk.position.set(-W / 2 + recepW / 2 + 0.5, recepH / 2, -D / 2 + recepD / 2 + 0.5);
        recepDesk.castShadow = true;
        recepDesk.receiveShadow = true;
        this.roomGroup.add(recepDesk);

        // Frosted Glass Screen Divider
        const screenMat = new THREE.MeshPhysicalMaterial({ color: 0xfef3c7, transparent: true, opacity: 0.55, roughness: 0.2 });
        const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(recepW + 0.4, 2.4, 0.08), screenMat);
        screenMesh.position.set(-W / 2 + recepW / 2 + 0.5, 1.2, -D / 2 + recepD + 0.6);
        this.roomGroup.add(screenMesh);
      } else if (pType === 'villa_gym') {
        // Private Credenza / Refresh Station
        const barW = 2.4;
        const barD = 0.6;
        const barH = 0.95;
        const barMat = new THREE.MeshStandardMaterial({ color: 0x3f1d0b, roughness: 0.35 });
        const barMesh = new THREE.Mesh(new THREE.BoxGeometry(barW, barH, barD), barMat);
        barMesh.position.set(-W / 2 + barW / 2 + 0.4, barH / 2, -D / 2 + barD / 2 + 0.3);
        barMesh.castShadow = true;
        this.roomGroup.add(barMesh);
      }

      // 4. Structural Columns (Only for large commercial spaces)
      if ((pType === 'commercial_gym' || pType === 'hotel_resort') && W >= 15) {
        const colPositions = [
          [-W * 0.16, -D * 0.15],
          [W * 0.18, -D * 0.15],
          [-W * 0.16, D * 0.20],
          [W * 0.18, D * 0.20]
        ];
        const colMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
        const bandMat = new THREE.MeshStandardMaterial({ color: 0x00204a, roughness: 0.35 });
        colPositions.forEach(([cx, cz]) => {
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.5, H, 0.5), colMat);
          col.position.set(cx, H / 2, cz);
          col.castShadow = true;
          col.receiveShadow = true;
          this.roomGroup.add(col);

          const band = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.35, 0.52), bandMat);
          band.position.set(cx, 1.35, cz);
          this.roomGroup.add(band);
        });
      }

      // 5. Wall Mirrors on West Wall & Decorative Elements
      const mirrorMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.08, metalness: 0.85 });
      const mirrorSpan = pType === 'pilates_studio' ? D * 0.82 : D * 0.52;
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.3, mirrorSpan), mirrorMat);
      mirror.position.set(-W / 2 + 0.12, 1.35, pType === 'pilates_studio' ? 0 : D * 0.16);
      this.roomGroup.add(mirror);

      // Swiss Exercise Balls (Red, Cyan, Amber) on Stretching Mat
      const ballColors = [0xdc2626, 0x0284c7, 0xd97706];
      ballColors.forEach((bc, bi) => {
        const r = 0.32 - bi * 0.03;
        const ball = new THREE.Mesh(
          new THREE.SphereGeometry(r, 24, 24),
          new THREE.MeshStandardMaterial({ color: bc, roughness: 0.35, metalness: 0.1 })
        );
        ball.position.set(W * 0.38, r, D * 0.32 - bi * 0.85);
        ball.castShadow = true;
        this.roomGroup.add(ball);
      });

      // 6. Industrial Exposed HVAC Ceiling Ducts & Linear LED Baffles (toggled by button)
      const ductMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.65 });
      for (let z = -D * 0.32; z <= D * 0.32; z += D * 0.64) {
        const duct = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, W * 0.88, 20), ductMat);
        duct.rotation.z = Math.PI / 2;
        duct.position.set(0, H - 0.35, z);
        this.ceilingGroup.add(duct);
      }
      const ledMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
      for (let x = -W * 0.35; x <= W * 0.35; x += W * 0.23) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, D * 0.78), ledMat);
        led.position.set(x, H - 0.55, 0);
        this.ceilingGroup.add(led);
      }
      this.ceilingGroup.visible = this.showCeiling;
    },

    updateWallCutaways() {
      if (!this.camera || !this.wallGroups.length) return;
      const camDir = new THREE.Vector3();
      this.camera.getWorldDirection(camDir);
      this.wallGroups.forEach(grp => {
        const n = grp.userData.normal;
        if (!n) return;
        const dot = camDir.dot(n);
        const isBlocking = dot > 0.18 && this.camera.position.y < 14;
        grp.children.forEach(ch => {
          if (ch.material) {
            ch.material.transparent = true;
            ch.material.opacity = isBlocking ? 0.08 : (ch.material.isMeshPhysicalMaterial ? 0.28 : 0.96);
          }
        });
      });
    },

    loadGlbModel(glbPath) {
      if (this.glbCache.has(glbPath)) {
        return Promise.resolve(this.glbCache.get(glbPath).clone(true));
      }
      return new Promise((resolve, reject) => {
        if (!THREE.GLTFLoader) {
          reject(new Error('GLTFLoader missing'));
          return;
        }
        const loader = new THREE.GLTFLoader();
        loader.load(
          glbPath,
          (gltf) => {
            const root = gltf.scene || (gltf.scenes && gltf.scenes[0]);
            if (!root) {
              reject(new Error('Empty GLB scene'));
              return;
            }
            root.traverse(node => {
              if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                const mats = Array.isArray(node.material) ? node.material : [node.material];
                mats.forEach(m => {
                  if (!m) return;
                  if (typeof m.metalness === 'number' && m.metalness > 0.45) m.metalness = 0.42;
                  if (typeof m.roughness === 'number' && m.roughness < 0.28) m.roughness = 0.32;
                  m.needsUpdate = true;
                });
              }
            });
            this.glbCache.set(glbPath, root);
            resolve(root.clone(true));
          },
          undefined,
          (err) => reject(err)
        );
      });
    },

    rebuildEquipmentMeshes() {
      if (!this.equipmentGroup) return;
      while (this.equipmentGroup.children.length) {
        this.equipmentGroup.remove(this.equipmentGroup.children[0]);
      }
      this.meshByUid.clear();

      layoutState.placements.forEach((eq) => {
        const holder = new THREE.Group();
        holder.userData.uid = eq.uid;
        holder.position.set(eq.x, 0, eq.z);
        holder.rotation.y = eq.rotY || 0;
        this.equipmentGroup.add(holder);
        this.meshByUid.set(eq.uid, holder);

        this.loadGlbModel(eq.glb).then((model) => {
          // Auto-normalize scale & center to floor y=0
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);

          if (size.x > 0.001 && size.y > 0.001 && size.z > 0.001) {
            const scaleX = eq.w / size.x;
            const scaleZ = eq.d / size.z;
            const scaleY = eq.h / size.y;
            const uniformScale = Math.min(scaleX, scaleZ, scaleY) * 0.96;
            model.scale.setScalar(uniformScale);

            const scaledBox = new THREE.Box3().setFromObject(model);
            const scaledCenter = new THREE.Vector3();
            scaledBox.getCenter(scaledCenter);
            model.position.x -= scaledCenter.x;
            model.position.z -= scaledCenter.z;
            model.position.y -= scaledBox.min.y;
          }
          holder.add(model);
        }).catch(() => {
          // Clean engineering fallback if offline
          const fallback = new THREE.Mesh(
            new THREE.BoxGeometry(eq.w * 0.85, eq.h * 0.75, eq.d * 0.85),
            new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.3 })
          );
          fallback.position.y = (eq.h * 0.75) / 2;
          fallback.castShadow = true;
          holder.add(fallback);
        });
      });

      this.updateSelectionRing();
    },

    syncTransformsFromState() {
      if (!this.equipmentGroup) return;
      layoutState.placements.forEach((eq) => {
        const holder = this.meshByUid.get(eq.uid);
        if (holder) {
          holder.position.set(eq.x, 0, eq.z);
          holder.rotation.y = eq.rotY || 0;
        }
      });
      this.updateSelectionRing();
    },

    updateSelectionRing() {
      if (!this.selectionRing) return;
      const sel = getSelectedEquipment();
      if (!sel) {
        this.selectionRing.visible = false;
        return;
      }
      this.selectionRing.visible = true;
      const radius = Math.max(sel.w, sel.d) * 0.58;
      this.selectionRing.scale.set(radius, 1, radius);
      this.selectionRing.position.set(sel.x, 0.025, sel.z);
    },

    render(proposal) {
      ensureLayoutInitialized(proposal);
      const container = document.getElementById('ai3dContainer');
      if (!container) return;

      if (!this.renderer || !container.contains(this.renderer.domElement)) {
        const ok = this.initScene(container);
        if (!ok) return;
      } else {
        const w = container.clientWidth || 960;
        const h = container.clientHeight || 560;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }

      this.buildArchitecturalGymRoom();
      this.rebuildEquipmentMeshes();
    },

    setCameraView(mode) {
      if (!this.camera || !this.controls) return;
      if (mode === 'topdown') {
        this.camera.position.set(0, 24, 0.01);
        this.controls.target.set(0, 0, 0);
      } else if (mode === 'entrance') {
        this.camera.position.set(-layoutState.roomW * 0.22, 1.68, -layoutState.roomD * 0.18);
        this.controls.target.set(2.5, 1.25, 2.5);
      } else {
        this.camera.position.set(16, 13.5, 17);
        this.controls.target.set(0, 0.8, 0);
      }
      this.controls.update();
    },

    toggleCutaway() {
      this.smartCutaway = !this.smartCutaway;
      const btn = document.getElementById('btnToggle3dCutaway');
      if (btn) {
        btn.textContent = `🧱 Smart Cutaway Walls: ${this.smartCutaway ? 'ON' : 'OFF'}`;
      }
      if (!this.smartCutaway) {
        this.wallGroups.forEach(grp => {
          grp.children.forEach(ch => {
            if (ch.material) ch.material.opacity = ch.material.isMeshPhysicalMaterial ? 0.28 : 1.0;
          });
        });
      }
    },

    toggleCeiling() {
      this.showCeiling = !this.showCeiling;
      if (this.ceilingGroup) this.ceilingGroup.visible = this.showCeiling;
    },

    captureScreenshot() {
      if (!this.renderer) return;
      try {
        this.renderer.render(this.scene, this.camera);
        const dataUrl = this.renderer.domElement.toDataURL('image/png');
        const a = document.createElement('a');
        const pType = (layoutState.projectType || 'Gym_3D').toUpperCase();
        a.download = `Attivo_3D_Space_Walkthrough_${pType}_${Date.now()}.png`;
        a.href = dataUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (typeof showToast === 'function') {
          showToast('📸 Đã tải ảnh phối cảnh 3D không gian (PNG)');
        }
      } catch (err) {
        console.error('3D screenshot error:', err);
      }
    }
  };

  // ============================================================================
  // 5. POPULATED 3D SHOWCASE & AUTHENTIC PROJECT ARCHIVE (D:\AI\03_Clients\Atv\Project\Design)
  // ============================================================================
  const ARCHIVE_PROJECTS = [
    {
      id: 'suite-3d-full',
      title: 'Attivo Commercial Multi-Zone 3D Architectural Suite',
      category: 'commercial',
      segment: '3D Studio Perspective Render',
      year: '2026 Studio Render',
      area: '320 m²',
      brands: 'Eleiko Prestera • Precor 885 • Merrithew',
      img3d: 'assets/renders3d/pascal_architecture_suite_full_view.png',
      img2d: 'assets/design_projects/waterfront_2d.png',
      desc: 'Phối cảnh 3D kiến trúc chuyên nghiệp với phân khu sàn gỗ sồi + cao su EPDM, rack Eleiko Prestera và cụm cardio Precor.'
    },
    {
      id: 'dark-luxury-3d',
      title: 'Attivo Dark Luxury Commercial Fitness Club 3D',
      category: 'commercial',
      segment: 'Commercial Fitness Club',
      year: '2026 Studio Render',
      area: '450 m²',
      brands: 'Precor Resolute • Eleiko Prestera • Assault',
      img3d: 'assets/renders3d/custom_multizone_dark_luxury.png',
      img2d: 'assets/design_projects/celadon_2d.jpg',
      desc: 'Không gian tập luyện Dark Luxury tương phản cao, trần nan LED âm trần, làn cỏ sprint track và bục nâng tạ Eleiko Olympic.'
    },
    {
      id: 'freeweight-3d-cam',
      title: 'Eleiko Prestera Free-Weight & Strength Zone 3D',
      category: 'commercial',
      segment: 'High-Performance Strength',
      year: '2026 Studio Render',
      area: '180 m²',
      brands: 'Eleiko Prestera • Precor Discovery',
      img3d: 'assets/renders3d/freeweight_zone_camera_view.png',
      img2d: 'assets/design_projects/getfit_2d_birdseye.jpg',
      desc: 'Góc nhìn ngang tầm mắt khu vực tạ tự do với cụm giá đỡ tạ Eleiko Prestera Half Rack kết hợp bục nâng tạ liền sàn.'
    },
    {
      id: 'arch-perspective-3d',
      title: 'Hospitality & Residential Wellness Center 3D',
      category: 'hotel',
      segment: '5-Star Hotel & Residence',
      year: '2025 Studio Render',
      area: '260 m²',
      brands: 'Precor 885 Line • Hoist • Merrithew',
      img3d: 'assets/renders3d/gym_3d_architectural_perspective.png',
      img2d: 'assets/design_projects/riviera_2d.png',
      desc: 'Thiết kế sang trọng với nan gỗ tự nhiên và vách kính view tràn viền dành riêng cho các dự án khách sạn 5 sao và căn hộ hạng sang.'
    },
    {
      id: 'greengarden-club',
      title: 'Green Garden Fitness Club — Grand Gymnasium',
      category: 'commercial',
      segment: 'Commercial Fitness Club',
      year: 'Dự Án Đã Triển Khai',
      area: '850 m²',
      brands: 'Precor Experience • Eleiko • Functional Turf',
      img3d: 'assets/design_projects/greengarden_3d_1.png',
      img2d: 'assets/design_projects/greengarden_2d.png',
      desc: 'Bản vẽ mặt bằng 2D AutoCAD & phối cảnh không gian 3D thực tế của đại dự án Green Garden Fitness do Attivo cung ứng.'
    },
    {
      id: 'dothanh-hcmc',
      title: 'DoThanh Fitness Center — HCMC Prime Location',
      category: 'commercial',
      segment: 'Commercial Fitness Club',
      year: 'Dự Án Đã Triển Khai',
      area: '420 m²',
      brands: 'Precor Discovery • TRM Cardio Line',
      img3d: 'assets/design_projects/dothanh_3d_1.png',
      img2d: 'assets/design_projects/dothanh_2d.png',
      desc: 'Mặt bằng bố trí thiết bị 2D AutoCAD chính xác từng mm và phối cảnh không gian nội thất 3D dự án Đô Thành Gym.'
    },
    {
      id: 'ecopark-club',
      title: 'Ecopark Grand Clubhouse — Fitness & Studio',
      category: 'residence',
      segment: 'Luxury Residential',
      year: 'Dự Án Đã Triển Khai',
      area: '310 m²',
      brands: 'Precor • Free Weights • Group Studio',
      img3d: 'assets/design_projects/ecopark_3d_1.jpg',
      img2d: 'assets/design_projects/ecopark_2d.png',
      desc: 'Bản vẽ mặt bằng CAD tổng thể và phối cảnh 3D không gian phòng tập cao cấp khu đô thị sinh thái Ecopark Grand.'
    },
    {
      id: 'waterfront-saigon',
      title: 'The Waterfront Saigon — Luxury Residence Gym',
      category: 'residence',
      segment: 'Luxury Residential',
      year: 'Dự Án Đã Triển Khai',
      area: '240 m²',
      brands: 'Precor Cardio & Selectorized • Free Weights',
      img3d: 'assets/design_projects/waterfront_3d_1.png',
      img2d: 'assets/design_projects/waterfront_2d.png',
      desc: 'Bản vẽ 2D AutoCAD bố trí thiết bị và góc nhìn 3D thực tế phòng tập cư dân tòa nhà The Waterfront Saigon.'
    },
    {
      id: 'riviera-point',
      title: 'Keppel Land Riviera Point — Clubhouse Fitness',
      category: 'residence',
      segment: 'Luxury Residential',
      year: 'Dự Án Đã Triển Khai',
      area: '280 m²',
      brands: 'Precor TRM/EFX • Multi-Station Strength',
      img3d: 'assets/design_projects/riviera_3d_1.png',
      img2d: 'assets/design_projects/riviera_2d.png',
      desc: 'Khu cardio vách kính toàn cảnh và đảo máy kháng lực trung tâm dự án Riviera Point Keppel Land.'
    },
    {
      id: 'hilton-hotel',
      title: 'Hilton 5-Star Hotel — Executive Fitness Center',
      category: 'hotel',
      segment: '5-Star Hotel & Resort',
      year: 'Dự Án Đã Triển Khai',
      area: '210 m²',
      brands: 'Precor 880 Line • Discovery Strength',
      img3d: 'assets/design_projects/hilton_3d_1.jpg',
      img2d: 'assets/design_projects/hilton_2d.jpg',
      desc: 'Bản vẽ CAD và phối cảnh 3D phòng gym chuẩn khách sạn 5 sao quốc tế Hilton Opera Hanoi.'
    },
    {
      id: 'diamond-bay',
      title: 'Diamond Bay Resort & Spa — Wellness Pavilion',
      category: 'hotel',
      segment: '5-Star Hotel & Resort',
      year: 'Dự Án Đã Triển Khai',
      area: '260 m²',
      brands: 'Precor Commercial • Functional Zone',
      img3d: 'assets/design_projects/diamondbay_3d_1.png',
      img2d: 'assets/design_projects/diamondbay_3d_2.png',
      desc: 'Gian phòng tập mở view 360 độ vườn nhiệt đới resort Diamond Bay Spa & Golf Pavilion.'
    },
    {
      id: 'celadon-sports',
      title: 'Celadon Sports & Resort Club — Main Gym Floor',
      category: 'commercial',
      segment: 'Commercial Sports Club',
      year: 'Dự Án Đã Triển Khai',
      area: '650 m²',
      brands: 'Precor • Eleiko • Functional Turf',
      img3d: 'assets/design_projects/celadon_3d_1.jpg',
      img2d: 'assets/design_projects/celadon_2d.jpg',
      desc: 'Tổ hợp thể thao quy mô lớn Celadon Sports Club với khu máy chạy Precor và dàn tạ tự do Eleiko.'
    },
    {
      id: 'fhome-danang',
      title: 'FHome Da Nang — 5-Star Residential Sky Gym',
      category: 'residence',
      segment: 'Luxury Residential',
      year: 'Dự Án Đã Triển Khai',
      area: '340 m²',
      brands: 'Precor Commercial • Free Weights',
      img3d: 'assets/design_projects/fhome_3d_1.png',
      img2d: 'assets/design_projects/fhome_3d_2.png',
      desc: 'Phối cảnh 3D góc rộng và góc cận của phòng gym cao tầng dự án căn hộ cao cấp FHome Đà Nẵng.'
    },
    {
      id: 'starcity-hotel',
      title: 'StarCity Hotel & Residence — Executive Fitness',
      category: 'hotel',
      segment: '5-Star Hotel & Resort',
      year: 'Dự Án Đã Triển Khai',
      area: '220 m²',
      brands: 'Precor TRM • FTS Glide • Dual Cable',
      img3d: 'assets/design_projects/starcity_3d_1.jpg',
      img2d: 'assets/design_projects/starcity_3d_2.jpg',
      desc: 'Phối cảnh 3D phòng gym cao cấp khách sạn StarCity Hạ Long & Nha Trang.'
    },
    {
      id: 'pullman-hotel',
      title: 'Pullman 5-Star Hotel — Fit Lounge',
      category: 'hotel',
      segment: '5-Star Hotel & Resort',
      year: 'Dự Án Đã Triển Khai',
      area: '195 m²',
      brands: 'Precor Cardio • FTS Glide • Dumbbells',
      img3d: 'assets/design_projects/pullman_3d_1.jpg',
      img2d: 'assets/design_projects/waterfront_2d.png',
      desc: 'Signature Pullman Fit Lounge với ánh sáng nghệ thuật và luồng di chuyển tối ưu.'
    },
    {
      id: 'novaland-residence',
      title: 'Novaland Luxury Tower — Sky Gym & Wellness',
      category: 'residence',
      segment: 'Luxury Residential',
      year: 'Dự Án Đã Triển Khai',
      area: '230 m²',
      brands: 'Precor TRM/EFX • Selectorized Duals',
      img3d: 'assets/design_projects/novaland_3d_1.jpg',
      img2d: 'assets/design_projects/novaland_3d_2.jpg',
      desc: 'Sky gym căn hộ hạng sang Novaland tối ưu hóa nhịp cột kết cấu và giờ cao điểm cư dân.'
    },
    {
      id: 'bodybyjovie-hcmc',
      title: 'Body By Jovie — Boutique Performance Studio',
      category: 'studio',
      segment: 'Boutique Performance Studio',
      year: 'Dự Án Đã Triển Khai',
      area: '210 m²',
      brands: 'Precor • Eleiko Prestera • Dumbbells',
      img3d: 'assets/design_projects/bodybyjovie_3d_1.jpg',
      img2d: 'assets/design_projects/bodybyjovie_3d_2.jpg',
      desc: 'Studio huấn luyện thể hình cá nhân VIP Body by Jovie phong cách công nghiệp hiện đại.'
    },
    {
      id: 'berjaya-hanoi',
      title: 'Berjaya Hanoi International Hotel Fitness',
      category: 'hotel',
      segment: '5-Star Hotel & Resort',
      year: 'Dự Án Đã Triển Khai',
      area: '280 m²',
      brands: 'Precor 885 Line • Vitality Strength',
      img3d: 'assets/design_projects/berjaya_3d_1.jpg',
      img2d: 'assets/design_projects/berjaya_3d_2.jpg',
      desc: 'Khu tập luyện tiêu chuẩn quốc tế khách sạn 5 sao Berjaya Hanoi.'
    }
  ];

  const AttivoShowcase3D = {
    viewModeByCard: {},
    currentCategory: 'all',
    lightboxCurrentProjId: null,
    lightboxCurrentMode: '3d',

    setCategory(cat) {
      this.currentCategory = cat;
      this.render();
    },

    render(categoryParam) {
      if (categoryParam && typeof categoryParam === 'string' && ['commercial', 'hotel', 'residence', 'studio'].includes(categoryParam)) {
        this.currentCategory = categoryParam;
      }
      const container = document.getElementById('aiShowcaseContainer') || document.getElementById('aiShowcaseGrid');
      if (!container) return;

      const filtered = (this.currentCategory === 'all')
        ? ARCHIVE_PROJECTS
        : ARCHIVE_PROJECTS.filter(p => p.category === this.currentCategory);

      // Render filter tabs bar if not already present
      let filterBar = document.getElementById('aiShowcaseCategoryFilter');
      if (!filterBar) {
        filterBar = document.createElement('div');
        filterBar.id = 'aiShowcaseCategoryFilter';
        filterBar.className = 'flex flex-wrap items-center gap-2 pb-2';
        container.parentElement.insertBefore(filterBar, container);
      }

      const categories = [
        { id: 'all', label: 'Tất Cả Dự Án', count: ARCHIVE_PROJECTS.length, icon: 'grid_view' },
        { id: 'commercial', label: 'Commercial Gym Club', count: ARCHIVE_PROJECTS.filter(p => p.category === 'commercial').length, icon: 'fitness_center' },
        { id: 'hotel', label: 'Khách Sạn & Resort 5-Star', count: ARCHIVE_PROJECTS.filter(p => p.category === 'hotel').length, icon: 'hotel' },
        { id: 'residence', label: 'Căn Hộ & Biệt Thự Cao Cấp', count: ARCHIVE_PROJECTS.filter(p => p.category === 'residence').length, icon: 'apartment' },
        { id: 'studio', label: 'Boutique & Studio VIP', count: ARCHIVE_PROJECTS.filter(p => p.category === 'studio').length, icon: 'self_improvement' }
      ];

      filterBar.innerHTML = categories.map(c => {
        const isActive = this.currentCategory === c.id;
        return `
          <button
            type="button"
            onclick="AttivoShowcase3D.setCategory('${c.id}')"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${isActive ? 'bg-[#00204a] text-white ring-2 ring-cyan-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}"
          >
            <span class="material-symbols-outlined text-sm ${isActive ? 'text-cyan-400' : 'text-slate-500'}">${c.icon}</span>
            <span>${c.label}</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-300 text-slate-700'}">${c.count}</span>
          </button>
        `;
      }).join('');

      container.innerHTML = filtered.map((proj) => {
        const mode = this.viewModeByCard[proj.id] || '3d';
        const activeImg = mode === '2d' ? proj.img2d : proj.img3d;
        return `
          <div class="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
            <div class="relative h-60 bg-slate-900 overflow-hidden">
              <img
                id="showcaseImg_${proj.id}"
                src="${activeImg}"
                alt="${proj.title}"
                onerror="this.onerror=null;this.src='assets/renders3d/gym_3d_architectural_perspective.png';"
                onclick="AttivoShowcase3D.openLightbox('${proj.id}')"
                class="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-500"
              />
              <div class="absolute top-3 left-3 flex items-center gap-1.5">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#00204a]/90 text-white backdrop-blur-xs shadow">
                  ${proj.segment}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-slate-950 shadow">
                  ${proj.area}
                </span>
              </div>
              <div class="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-950/85 p-1 rounded-xl border border-slate-700 backdrop-blur-xs">
                <button
                  type="button"
                  onclick="AttivoShowcase3D.toggleCardView('${proj.id}', '3d')"
                  id="btnSc3d_${proj.id}"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${mode === '3d' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'}"
                >3D Render</button>
                <button
                  type="button"
                  onclick="AttivoShowcase3D.toggleCardView('${proj.id}', '2d')"
                  id="btnSc2d_${proj.id}"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${mode === '2d' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'}"
                >2D CAD</button>
                <button
                  type="button"
                  onclick="AttivoShowcase3D.downloadCardImage('${proj.id}')"
                  title="Tải ảnh đang hiển thị về máy tính"
                  class="p-1 rounded-lg bg-slate-800 hover:bg-emerald-600 text-white transition flex items-center justify-center"
                >
                  <span class="material-symbols-outlined text-sm">download</span>
                </button>
              </div>
            </div>
            <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div class="text-[11px] font-bold text-cyan-700 flex items-center gap-1">
                  <span class="material-symbols-outlined text-xs">verified</span>
                  <span>${proj.brands}</span>
                </div>
                <h4 class="font-heading font-extrabold text-sm text-[#00204a] mt-0.5">${proj.title}</h4>
                <p class="text-xs text-slate-500 mt-1 line-clamp-2">${proj.desc}</p>
              </div>
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span class="text-slate-400 font-semibold">${proj.year}</span>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    onclick="AttivoShowcase3D.downloadCardImage('${proj.id}')"
                    class="font-bold text-emerald-700 hover:text-emerald-600 inline-flex items-center gap-1"
                    title="Tải ảnh về máy"
                  >
                    <span class="material-symbols-outlined text-sm">download</span>
                    <span>Tải Về</span>
                  </button>
                  <button
                    type="button"
                    onclick="AttivoShowcase3D.openLightbox('${proj.id}')"
                    class="font-bold text-[#00204a] hover:text-cyan-700 inline-flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-sm">zoom_in</span>
                    <span>Xem Chi Tiết</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    },

    toggleCardView(projId, mode) {
      this.viewModeByCard[projId] = mode;
      const proj = ARCHIVE_PROJECTS.find(p => p.id === projId);
      if (!proj) return;
      const img = document.getElementById(`showcaseImg_${projId}`);
      if (img) img.src = mode === '2d' ? proj.img2d : proj.img3d;
      const b3d = document.getElementById(`btnSc3d_${projId}`);
      const b2d = document.getElementById(`btnSc2d_${projId}`);
      if (b3d) b3d.className = `px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${mode === '3d' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'}`;
      if (b2d) b2d.className = `px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${mode === '2d' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'}`;
    },

    downloadCardImage(projId) {
      const proj = ARCHIVE_PROJECTS.find(p => p.id === projId);
      if (!proj) return;
      const mode = this.viewModeByCard[projId] || '3d';
      const src = mode === '2d' ? proj.img2d : proj.img3d;
      const filename = `Attivo_${proj.id}_${mode.toUpperCase()}_${Date.now()}.${src.split('.').pop()}`;
      this.triggerDownload(src, filename);
    },

    triggerDownload(url, filename) {
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (typeof showToast === 'function') {
          showToast(`✅ Đã tải file: ${filename}`);
        }
      } catch (err) {
        console.error('Download error:', err);
      }
    },

    openLightbox(projId) {
      const proj = ARCHIVE_PROJECTS.find(p => p.id === projId);
      if (!proj) return;
      this.lightboxCurrentProjId = projId;
      this.lightboxCurrentMode = this.viewModeByCard[projId] || '3d';

      let modal = document.getElementById('attivoShowcaseLightbox');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'attivoShowcaseLightbox';
        modal.className = 'fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6';
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.add('hidden');
        });
        document.body.appendChild(modal);

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
          }
        });
      }

      this.updateLightboxContent(modal, proj);
      modal.classList.remove('hidden');
    },

    switchLightboxMode(mode) {
      this.lightboxCurrentMode = mode;
      const proj = ARCHIVE_PROJECTS.find(p => p.id === this.lightboxCurrentProjId);
      if (!proj) return;
      const modal = document.getElementById('attivoShowcaseLightbox');
      if (modal) this.updateLightboxContent(modal, proj);
    },

    updateLightboxContent(modal, proj) {
      const mode = this.lightboxCurrentMode;
      const src = mode === '2d' ? proj.img2d : proj.img3d;
      const is3D = mode === '3d';

      modal.innerHTML = `
        <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-6xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]" onclick="event.stopPropagation()">
          <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-800 text-white bg-slate-950">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-900 text-cyan-200 border border-cyan-700">${proj.segment}</span>
                <span class="text-xs font-bold text-slate-400">${proj.area} • ${proj.year}</span>
              </div>
              <h3 class="text-lg font-extrabold text-white mt-0.5">${proj.title}</h3>
              <p class="text-xs text-slate-400 mt-0.5">${proj.brands}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onclick="AttivoShowcase3D.switchLightboxMode('3d')"
                class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${is3D ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'}"
              >
                <span class="material-symbols-outlined text-sm">view_in_ar</span>
                <span>Phối Cảnh 3D</span>
              </button>
              <button
                type="button"
                onclick="AttivoShowcase3D.switchLightboxMode('2d')"
                class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${!is3D ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'}"
              >
                <span class="material-symbols-outlined text-sm">floor</span>
                <span>Mặt Bằng 2D CAD</span>
              </button>
              <button
                type="button"
                onclick="AttivoShowcase3D.downloadCurrentLightboxImage()"
                class="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition flex items-center gap-1.5"
                title="Tải ảnh gốc độ phân giải cao"
              >
                <span class="material-symbols-outlined text-sm">download</span>
                <span>Tải Ảnh Gốc HD</span>
              </button>
              <button
                type="button"
                onclick="document.getElementById('attivoShowcaseLightbox').classList.add('hidden')"
                class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
              >✕ Đóng</button>
            </div>
          </div>
          <div class="p-4 bg-slate-950 flex-1 flex items-center justify-center overflow-auto min-h-[350px] relative">
            <img
              id="attivoLightboxImg"
              src="${src}"
              alt="${proj.title}"
              onerror="this.onerror=null;this.src='assets/renders3d/gym_3d_architectural_perspective.png';"
              class="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl transition duration-300"
            />
          </div>
          <div class="px-6 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>${proj.desc}</span>
            <span class="font-mono text-[11px] text-cyan-400">Bản quyền thiết kế © Attivo International</span>
          </div>
        </div>
      `;
    },

    downloadCurrentLightboxImage() {
      const proj = ARCHIVE_PROJECTS.find(p => p.id === this.lightboxCurrentProjId);
      if (!proj) return;
      const mode = this.lightboxCurrentMode;
      const src = mode === '2d' ? proj.img2d : proj.img3d;
      const filename = `Attivo_HQ_${proj.id}_${mode.toUpperCase()}.${src.split('.').pop()}`;
      this.triggerDownload(src, filename);
    }
  };

  // Export & Auto-Initialize
  AttivoVisualizer2D.getLayoutState = () => layoutState;
  AttivoVisualizer3D.getLayoutState = () => layoutState;
  global.AttivoVisualizer2D = AttivoVisualizer2D;
  global.AttivoVisualizer3D = AttivoVisualizer3D;
  global.AttivoShowcase3D = AttivoShowcase3D;

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const proposal = (global.AttivoAiAdvisor && global.AttivoAiAdvisor.currentProposal) || null;
      AttivoVisualizer2D.render(proposal);
      AttivoShowcase3D.render();
    }, 350);
  });

})(typeof window !== 'undefined' ? window : this);
