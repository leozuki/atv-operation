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
    roomW: 20,
    roomD: 13,
    area: 250,
    placements: [],
    selectedId: null,
    nextUid: 1
  };

  function getProposalSignature(proposal) {
    if (!proposal) return 'default';
    const itemsSig = (proposal.items || []).map(it => `${it.sku}:${it.quantity}`).join('|');
    return `${proposal.area_m2 || 250}_${proposal.facilityType || 'hotel'}_${itemsSig}`;
  }

  function buildInitialPlacements(proposal) {
    const area = Math.max(60, Number((proposal && proposal.area_m2) || 250));
    const roomW = Math.round(Math.sqrt(area * 1.55) * 10) / 10;
    const roomD = Math.round((area / roomW) * 10) / 10;
    layoutState.area = area;
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
          if (['flooring', 'accessories', 'service', 'spare_parts'].includes(it.category)) return false;
          const txt = `${it.sku || ''} ${it.name || ''}`.toUpperCase();
          if (/INSTALLATION|KIT|CABLE ASSY|BOLT|SCREW|VALVE|HARNESS|DECAL|COVER|BOARD|SENSOR|BELT|DECK|ROLLER|SPRING|STRAP|MAT|BALL|DUMBBELL PAIR|PLATE/.test(txt)) return false;
          return true;
        })
      : [];

    const rawItems = filteredProposalItems.length >= 6 ? filteredProposalItems : defaultMachines;

    const expanded = [];
    rawItems.forEach(it => {
      if (it.category === 'flooring' || it.category === 'accessories' || it.category === 'service') return;
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
    const cardioList = capped.filter(e => ['treadmill', 'elliptical', 'amt', 'stairclimber', 'bike', 'airbike', 'rower'].includes(e.kind));
    const pilatesList = capped.filter(e => ['reformer', 'cadillac', 'barrel'].includes(e.kind));
    const strengthList = capped.filter(e => ['selectorized', 'lat_pulldown', 'seated_row', 'leg_extension', 'cable_crossover', 'smith_machine', 'leg_press', 'hack_squat', 'booty_builder'].includes(e.kind));
    const freeList = capped.filter(e => ['power_rack', 'half_rack', 'double_rack', 'bench', 'dumbbell_rack'].includes(e.kind));

    const placements = [];
    const halfW = roomW / 2;
    const halfD = roomD / 2;

    // 1. Cardio Zone: East/South Curtain Glass Perimeter (Top-Right & Right edge)
    let cx = -halfW * 0.10;
    const topZ = -halfD + 1.55;
    cardioList.forEach((eq, idx) => {
      if (idx < 7 && cx + eq.w / 2 < halfW - 1.1) {
        placements.push({
          ...eq,
          zone: 'cardio',
          x: Number((cx + eq.w / 2).toFixed(2)),
          z: Number(topZ.toFixed(2)),
          rotY: Math.PI // Facing North glass window
        });
        cx += eq.w + 0.52;
      } else {
        const row2Idx = idx - 7;
        placements.push({
          ...eq,
          zone: 'cardio',
          x: Number((halfW - 1.55).toFixed(2)),
          z: Number((-halfD + 3.6 + row2Idx * 1.45).toFixed(2)),
          rotY: Math.PI / 2 // Facing East glass window
        });
      }
    });

    // 2. Selectorized Strength Zone: Center bay (organized in 2 clean architectural columns)
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

    // 3. Free Weights & Eleiko Prestera Racks: Bottom-Left Charcoal Rubber Zone
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

    // 4. Pilates Studio Zone (if present)
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

    layoutState.placements = placements;
    layoutState.selectedId = placements.length ? placements[0].uid : null;
    updateSelectedHudLabel();
  }

  function ensureLayoutInitialized(proposal) {
    const sig = getProposalSignature(proposal);
    if (proposal) layoutState.proposal = proposal;
    if (layoutState.proposalKey !== sig || layoutState.placements.length === 0) {
      layoutState.proposalKey = sig;
      buildInitialPlacements(proposal || layoutState.proposal);
    }
  }

  function getSelectedEquipment() {
    return layoutState.placements.find(p => p.uid === layoutState.selectedId) || null;
  }

  function updateSelectedHudLabel() {
    const el2d = document.getElementById('cad2dSelectedLabel');
    const el3d = document.getElementById('cad3dSelectedLabel');
    const sel = getSelectedEquipment();
    const deg = sel ? Math.round(((sel.rotY * 180) / Math.PI) % 360) : 0;
    const text = sel
      ? `Selected: [${sel.sku}] ${sel.name} • Size: ${Math.round(sel.w * 1000)}×${Math.round(sel.d * 1000)}mm • Pos: X=${Math.round(sel.x * 1000)}mm, Z=${Math.round(sel.z * 1000)}mm • Rot: ${deg}°`
      : 'Click any equipment symbol on the 2D drawing to Drag / Move / Rotate / Duplicate / Delete';
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

    resetLayout() {
      buildInitialPlacements(layoutState.proposal);
      this.draw();
      AttivoVisualizer3D.rebuildEquipmentMeshes();
    },

    rotateSelected(deg) { rotateSelectedEquipment(deg); },
    duplicateSelected() { duplicateSelectedEquipment(); },
    deleteSelected() { deleteSelectedEquipment(); },

    render(proposal) {
      ensureLayoutInitialized(proposal);
      this.bindCanvasEvents();
      this.draw();
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
        const hit = hitTestEquipment(mx, mz);
        if (hit) {
          layoutState.selectedId = hit.uid;
          this.isDragging = true;
          this.dragOffsetX = mx - hit.x;
          this.dragOffsetZ = mz - hit.z;
          updateSelectedHudLabel();
          this.draw();
        } else {
          layoutState.selectedId = null;
          updateSelectedHudLabel();
          this.draw();
        }
      });

      canvas.addEventListener('mousemove', (evt) => {
        const { mx, mz } = getCanvasMouseMeters(evt);
        if (this.isDragging && layoutState.selectedId) {
          const sel = getSelectedEquipment();
          if (sel) {
            const halfW = layoutState.roomW / 2 - sel.w / 2 - 0.25;
            const halfD = layoutState.roomD / 2 - sel.d / 2 - 0.25;
            // Snap to 50mm (0.05m) CAD grid
            const nx = Math.round(((mx - this.dragOffsetX) * 20)) / 20;
            const nz = Math.round(((mz - this.dragOffsetZ) * 20)) / 20;
            sel.x = Number(Math.max(-halfW, Math.min(halfW, nx)).toFixed(2));
            sel.z = Number(Math.max(-halfD, Math.min(halfD, nz)).toFixed(2));
            this.draw();
            syncBothViewsAfterEdit('2d');
          }
        } else {
          const hover = hitTestEquipment(mx, mz);
          canvas.style.cursor = hover ? 'move' : 'default';
        }
      });

      const stopDrag = () => {
        if (this.isDragging) {
          this.isDragging = false;
          syncBothViewsAfterEdit('2d');
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

      // 3. Flooring Zones (Engineered Oak Wood + Charcoal Rubber + Functional Sprint Turf)
      if (style === 'attivo_studio') {
        // Warm Engineered Wood Base (Cardio & Circulation)
        ctx.fillStyle = '#e7c8a0';
        ctx.fillRect(ox, oy, rPxW, rPxH);

        // Wood plank lines
        ctx.strokeStyle = 'rgba(146, 98, 52, 0.18)';
        ctx.lineWidth = 0.6;
        for (let py = oy + 8; py < oy + rPxH; py += 9) {
          ctx.beginPath();
          ctx.moveTo(ox, py);
          ctx.lineTo(ox + rPxW, py);
          ctx.stroke();
        }

        // Charcoal PaviFLEX Rubber Zone (Free Weights & Selectorized Strength)
        const rubX = ox;
        const rubY = oy + rPxH * 0.36;
        const rubW = rPxW * 0.74;
        const rubH = rPxH * 0.64;
        ctx.fillStyle = '#262930';
        ctx.fillRect(rubX, rubY, rubW, rubH);

        // 1000x1000mm Rubber Tile Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.6;
        for (let gx = rubX; gx <= rubX + rubW; gx += ppm) {
          ctx.beginPath(); ctx.moveTo(gx, rubY); ctx.lineTo(gx, rubY + rubH); ctx.stroke();
        }
        for (let gy = rubY; gy <= rubY + rubH; gy += ppm) {
          ctx.beginPath(); ctx.moveTo(rubX, gy); ctx.lineTo(rubX + rubW, gy); ctx.stroke();
        }

        // Functional Sprint Turf Track (Right-side strip)
        const turfW = Math.min(2.1 * ppm, rPxW * 0.13);
        const turfX = ox + rPxW * 0.75;
        const turfY = oy + rPxH * 0.36;
        const turfH = rPxH * 0.60;
        ctx.fillStyle = '#15803d';
        ctx.fillRect(turfX, turfY, turfW, turfH);
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 1;
        ctx.strokeRect(turfX + 3, turfY + 3, turfW - 6, turfH - 6);
        for (let ty = turfY + ppm; ty < turfY + turfH - 6; ty += ppm) {
          ctx.beginPath();
          ctx.moveTo(turfX + 4, ty);
          ctx.lineTo(turfX + 12, ty);
          ctx.moveTo(turfX + turfW - 12, ty);
          ctx.lineTo(turfX + turfW - 4, ty);
          ctx.stroke();
        }
      } else if (isCasa) {
        ctx.fillStyle = '#fbfaf6';
        ctx.fillRect(ox, oy, rPxW, rPxH);
        // Subtle 1m architectural hatch
        ctx.strokeStyle = 'rgba(15,23,42,0.08)';
        ctx.lineWidth = 0.5;
        for (let gx = ox; gx <= ox + rPxW; gx += ppm) {
          ctx.beginPath(); ctx.moveTo(gx, oy); ctx.lineTo(gx, oy + rPxH); ctx.stroke();
        }
        for (let gy = oy; gy <= oy + rPxH; gy += ppm) {
          ctx.beginPath(); ctx.moveTo(ox, gy); ctx.lineTo(ox + rPxW, gy); ctx.stroke();
        }
      } else {
        ctx.fillStyle = '#0a192f';
        ctx.fillRect(ox, oy, rPxW, rPxH);
        ctx.strokeStyle = 'rgba(56,189,248,0.12)';
        ctx.lineWidth = 0.5;
        for (let gx = ox; gx <= ox + rPxW; gx += ppm) {
          ctx.beginPath(); ctx.moveTo(gx, oy); ctx.lineTo(gx, oy + rPxH); ctx.stroke();
        }
        for (let gy = oy; gy <= oy + rPxH; gy += ppm) {
          ctx.beginPath(); ctx.moveTo(ox, gy); ctx.lineTo(ox + rPxW, gy); ctx.stroke();
        }
      }

      // 4. Auxiliary Core Block (Top-Left: WC Nam/Nữ, Locker, 2 Elevators, Reception Entry)
      const auxW = rPxW * 0.32;
      const auxH = rPxH * 0.30;
      ctx.save();
      ctx.fillStyle = isNavy ? '#0f2744' : '#f1f5f9';
      ctx.strokeStyle = isNavy ? '#38bdf8' : '#1e293b';
      ctx.lineWidth = 2;
      ctx.fillRect(ox, oy, auxW, auxH);
      ctx.strokeRect(ox, oy, auxW, auxH);

      // Sub-partitions inside Auxiliary Core (WC, Locker, 2 Elevator Shafts with X-diagonals)
      const elvW = auxW * 0.26;
      const elvH = auxH * 0.52;
      ctx.lineWidth = 1.2;
      // Elevator 1 & 2 with standard AutoCAD X-cross
      for (let e = 0; e < 2; e++) {
        const ex = ox + auxW - elvW * (e + 1);
        const ey = oy;
        ctx.strokeRect(ex, ey, elvW, elvH);
        ctx.beginPath();
        ctx.moveTo(ex, ey); ctx.lineTo(ex + elvW, ey + elvH);
        ctx.moveTo(ex + elvW, ey); ctx.lineTo(ex, ey + elvH);
        ctx.stroke();
      }
      // Locker / WC partition
      ctx.beginPath();
      ctx.moveTo(ox + auxW * 0.48, oy);
      ctx.lineTo(ox + auxW * 0.48, oy + auxH);
      ctx.stroke();

      ctx.fillStyle = isNavy ? '#93c5fd' : '#334155';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LOCKER / WC', ox + auxW * 0.24, oy + auxH * 0.48);
      ctx.fillText('ELEVATOR LOBBY', ox + auxW * 0.74, oy + auxH * 0.78);

      // Double Swing Entrance Door Arc at bottom of Auxiliary Block
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

      // 5. Perimeter Poché Structural Walls + Curtain Glass Windows + 500x500mm Concrete Columns
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

      // 4 Internal Structural Columns (500x500mm)
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

      // 6. Zone Watermark Labels
      ctx.save();
      ctx.font = '800 10px Montserrat, sans-serif';
      ctx.fillStyle = isNavy ? 'rgba(148,163,184,0.45)' : 'rgba(15,23,42,0.45)';
      ctx.fillText('ZONE A — CARDIO & CURTAIN GLASS VIEW', ox + rPxW * 0.42, oy + 18);
      ctx.fillStyle = style === 'attivo_studio' ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.45)';
      ctx.fillText('ZONE B — SELECTORIZED STRENGTH', ox + rPxW * 0.38, oy + rPxH * 0.42);
      ctx.fillText('ZONE C — ELEIKO FREE WEIGHTS & RACKS', ox + 14, oy + rPxH - 12);
      ctx.restore();

      // 7. Draw All Equipment Items with Detailed Authentic AutoCAD Symbols
      layoutState.placements.forEach((eq, idx) => {
        const ex = cx + eq.x * ppm;
        const ey = cy + eq.z * ppm;
        const pw = eq.w * ppm;
        const pd = eq.d * ppm;
        const isSelected = (eq.uid === layoutState.selectedId);

        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate(eq.rotY || 0);

        // Safety Clearance Halo (dashed ISO safety envelope)
        const clr = (eq.clearance || 0.5) * ppm;
        ctx.strokeStyle = isSelected
          ? '#06b6d4'
          : (style === 'attivo_studio' ? 'rgba(251,191,36,0.32)' : 'rgba(2,132,199,0.25)');
        ctx.lineWidth = isSelected ? 1.5 : 0.8;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(-pw / 2 - clr * 0.35, -pd / 2 - clr * 0.35, pw + clr * 0.7, pd + clr * 0.7);
        ctx.setLineDash([]);

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

      // 8. Architectural Dimension Lines (in mm)
      this.drawDimensionLine(ctx, ox, oy + rPxH + 34, ox + rPxW, oy + rPxH + 34, `${Math.round(roomW * 1000)} mm`, isNavy);
      this.drawDimensionLine(ctx, ox + rPxW + 34, oy, ox + rPxW + 34, oy + rPxH, `${Math.round(roomD * 1000)} mm`, isNavy, true);

      // 9. Right-Side ISO Architectural Title Block & Equipment Schedule
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
      const a = document.createElement('a');
      a.download = `Attivo_2D_AutoCAD_Floorplan_${Date.now()}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
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

    buildArchitecturalGymRoom() {
      while (this.roomGroup.children.length) this.roomGroup.remove(this.roomGroup.children[0]);
      while (this.ceilingGroup.children.length) this.ceilingGroup.remove(this.ceilingGroup.children[0]);
      this.wallGroups = [];

      const W = layoutState.roomW;
      const D = layoutState.roomD;
      const H = 4.2;

      // 1. Dual-Zone Flooring (from b762b483 apply_architectural_upgrade.py)
      const woodMat = new THREE.MeshStandardMaterial({ map: this.makeWoodFloorTexture(), roughness: 0.42, metalness: 0.05 });
      const woodMesh = new THREE.Mesh(new THREE.PlaneGeometry(W, D), woodMat);
      woodMesh.rotation.x = -Math.PI / 2;
      woodMesh.receiveShadow = true;
      this.roomGroup.add(woodMesh);

      // Charcoal PaviFLEX Rubber Zone (Strength + Free-Weights)
      const rubW = W * 0.72;
      const rubD = D * 0.62;
      const rubMat = new THREE.MeshStandardMaterial({ map: this.makeRubberFloorTexture(), roughness: 0.78, metalness: 0.05 });
      const rubMesh = new THREE.Mesh(new THREE.PlaneGeometry(rubW, rubD), rubMat);
      rubMesh.rotation.x = -Math.PI / 2;
      rubMesh.position.set(-W * 0.14, 0.006, D * 0.18);
      rubMesh.receiveShadow = true;
      this.roomGroup.add(rubMesh);

      // Emerald Sprint Turf Strip
      const turfW = 2.0;
      const turfD = D * 0.58;
      const turfMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85, metalness: 0.02 });
      const turfMesh = new THREE.Mesh(new THREE.PlaneGeometry(turfW, turfD), turfMat);
      turfMesh.rotation.x = -Math.PI / 2;
      turfMesh.position.set(W * 0.28, 0.009, D * 0.18);
      turfMesh.receiveShadow = true;
      this.roomGroup.add(turfMesh);

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

      // 3. Auxiliary Core Block (Top-Left: Locker / WC / Elevator Lobby + Double Glass Entrance Doors)
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

      // 4. Four Structural 500x500mm Concrete Columns with Attivo Navy Accent Band (`#00204a`)
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

      // 5. Wall Mirrors on West Free-Weight Wall & Decorative Planters + Swiss Balls (from b762b483)
      const mirrorMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.08, metalness: 0.85 });
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.1, D * 0.52), mirrorMat);
      mirror.position.set(-W / 2 + 0.12, 1.45, D * 0.16);
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
      this.renderer.render(this.scene, this.camera);
      const a = document.createElement('a');
      a.download = `Attivo_3D_Space_Walkthrough_${Date.now()}.png`;
      a.href = this.renderer.domElement.toDataURL('image/png');
      a.click();
    }
  };

  // ============================================================================
  // 5. POPULATED 3D SHOWCASE & PROJECT ARCHIVE (`#aiShowcaseContainer` FIXED!)
  // ============================================================================
  const ARCHIVE_PROJECTS = [
    {
      id: 'suite-3d-full',
      title: 'Attivo Commercial Multi-Zone 3D Architectural Suite',
      segment: '3D Studio Perspective Render',
      year: '2026',
      area: '320 m²',
      brands: 'Eleiko Prestera • Precor 885 • Merrithew',
      img3d: 'assets/renders3d/pascal_architecture_suite_full_view.png',
      img2d: 'assets/design_projects/waterfront_2d.png',
      desc: 'Full 3D architectural perspective featuring dual-zone engineered oak + charcoal rubber flooring, Eleiko Prestera racks, and Precor cardio.'
    },
    {
      id: 'dark-luxury-3d',
      title: 'Attivo Dark Luxury Commercial Fitness Club 3D',
      segment: 'Commercial Fitness Club',
      year: '2026',
      area: '450 m²',
      brands: 'Precor Resolute • Eleiko Prestera • Assault',
      img3d: 'assets/renders3d/custom_multizone_dark_luxury.png',
      img2d: 'assets/design_projects/celadon_2d.jpg',
      desc: 'High-contrast dark luxury athletic club with custom linear LED ceiling baffles, sprint turf track, and Eleiko lifting platforms.'
    },
    {
      id: 'freeweight-3d-cam',
      title: 'Eleiko Prestera Free-Weight & Strength Zone 3D',
      segment: 'High-Performance Strength',
      year: '2026',
      area: '180 m²',
      brands: 'Eleiko Prestera • Precor Discovery',
      img3d: 'assets/renders3d/freeweight_zone_camera_view.png',
      img2d: 'assets/design_projects/getfit_2d.jpg',
      desc: 'Eye-level camera view of the Eleiko Prestera Power Rack & Half Rack strength bay with integrated lifting platforms.'
    },
    {
      id: 'arch-perspective-3d',
      title: 'Hospitality & Residential Wellness Center 3D',
      segment: '5-Star Hotel & Residence',
      year: '2025',
      area: '260 m²',
      brands: 'Precor 885 Line • Hoist • Merrithew',
      img3d: 'assets/renders3d/gym_3d_architectural_perspective.png',
      img2d: 'assets/design_projects/riviera_2d.png',
      desc: 'Warm architectural wood and curtain-glass wellness center designed for luxury residential towers and 5-star hotels.'
    },
    {
      id: 'waterfront-saigon',
      title: 'The Waterfront Saigon — Luxury Residence Gym',
      segment: 'Luxury Residential',
      year: 'Project Archive',
      area: '240 m²',
      brands: 'Precor Cardio & Selectorized • Free Weights',
      img3d: 'assets/design_projects/waterfront_3d.jpg',
      img2d: 'assets/design_projects/waterfront_2d.png',
      desc: 'Completed Attivo 2D AutoCAD layout & 3D interior perspective for The Waterfront Saigon residential clubhouse.'
    },
    {
      id: 'riviera-point',
      title: 'Keppel Land Riviera Point — Clubhouse Fitness',
      segment: 'Luxury Residential',
      year: 'Project Archive',
      area: '280 m²',
      brands: 'Precor TRM/EFX • Multi-Station Strength',
      img3d: 'assets/design_projects/riviera_3d.jpg',
      img2d: 'assets/design_projects/riviera_2d.png',
      desc: 'Panoramic glass-wall cardio bay and central selectorized strength island for Riviera Point.'
    },
    {
      id: 'hilton-hotel',
      title: 'Hilton 5-Star Hotel — Executive Fitness Center',
      segment: '5-Star Hotel & Resort',
      year: 'Project Archive',
      area: '210 m²',
      brands: 'Precor 880 Line • Discovery Strength',
      img3d: 'assets/design_projects/hilton_3d.jpg',
      img2d: 'assets/design_projects/hilton_2d.jpg',
      desc: 'Hospitality-grade acoustic flooring, wood-slat feature walls, and Precor P82 touchscreen cardio lineup.'
    },
    {
      id: 'diamond-bay',
      title: 'Diamond Bay Resort & Spa — Wellness Pavilion',
      segment: '5-Star Hotel & Resort',
      year: 'Project Archive',
      area: '260 m²',
      brands: 'Precor Commercial • Functional Zone',
      img3d: 'assets/design_projects/diamond_bay_3d.jpg',
      img2d: 'assets/design_projects/diamond_bay_2d.jpg',
      desc: 'Resort fitness pavilion with 360-degree garden views, timber ceiling trusses, and full Precor commercial suite.'
    },
    {
      id: 'celadon-sports',
      title: 'Celadon Sports & Resort Club — Main Gym Floor',
      segment: 'Commercial Sports Club',
      year: 'Project Archive',
      area: '650 m²',
      brands: 'Precor • Eleiko • Functional Turf',
      img3d: 'assets/design_projects/celadon_3d.jpg',
      img2d: 'assets/design_projects/celadon_2d.jpg',
      desc: 'Large-scale commercial sports club with dedicated cardio theater, selectorized circuit, and free-weight lifting zone.'
    },
    {
      id: 'pullman-hotel',
      title: 'Pullman 5-Star Hotel — Fit Lounge',
      segment: '5-Star Hotel & Resort',
      year: 'Project Archive',
      area: '195 m²',
      brands: 'Precor Cardio • FTS Glide • Dumbbells',
      img3d: 'assets/design_projects/pullman_3d.jpg',
      img2d: 'assets/design_projects/pullman_2d.jpg',
      desc: 'Signature Pullman Fit Lounge with vibrant lighting, zoned rubber/wood flooring, and ergonomic circulation.'
    },
    {
      id: 'ecopark-club',
      title: 'Ecopark Grand Clubhouse — Fitness & Studio',
      segment: 'Luxury Residential',
      year: 'Project Archive',
      area: '310 m²',
      brands: 'Precor • Free Weights • Group Studio',
      img3d: 'assets/design_projects/ecopark_3d.jpg',
      img2d: 'assets/design_projects/ecopark_2d.jpg',
      desc: 'Eco-luxury residential fitness center combining indoor-outdoor daylighting with commercial strength & cardio.'
    },
    {
      id: 'novaland-residence',
      title: 'Novaland Luxury Tower — Sky Gym & Wellness',
      segment: 'Luxury Residential',
      year: 'Project Archive',
      area: '230 m²',
      brands: 'Precor TRM/EFX • Selectorized Duals',
      img3d: 'assets/design_projects/novaland_3d.jpg',
      img2d: 'assets/design_projects/novaland_2d.jpg',
      desc: 'High-rise sky gym layout optimized for structural column spans and high-traffic evening resident peak hours.'
    }
  ];

  const AttivoShowcase3D = {
    viewModeByCard: {},

    render() {
      // Fix: Target `#aiShowcaseContainer` (used in index.html) or fallback `#aiShowcaseGrid`
      const container = document.getElementById('aiShowcaseContainer') || document.getElementById('aiShowcaseGrid');
      if (!container) return;

      container.innerHTML = ARCHIVE_PROJECTS.map((proj) => {
        const mode = this.viewModeByCard[proj.id] || '3d';
        const activeImg = mode === '2d' ? proj.img2d : proj.img3d;
        return `
          <div class="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
            <div class="relative h-56 bg-slate-900 overflow-hidden">
              <img
                id="showcaseImg_${proj.id}"
                src="${activeImg}"
                alt="${proj.title}"
                onclick="AttivoShowcase3D.openLightbox('${proj.id}')"
                class="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-500"
              />
              <div class="absolute top-3 left-3 flex items-center gap-1.5">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#00204a]/90 text-white backdrop-blur-xs">
                  ${proj.segment}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/90 text-white">
                  ${proj.area}
                </span>
              </div>
              <div class="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-900/85 p-1 rounded-xl border border-slate-700 backdrop-blur-xs">
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
              </div>
            </div>
            <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div class="text-[11px] font-bold text-cyan-700">${proj.brands}</div>
                <h4 class="font-heading font-extrabold text-sm text-[#00204a] mt-0.5">${proj.title}</h4>
                <p class="text-xs text-slate-500 mt-1 line-clamp-2">${proj.desc}</p>
              </div>
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span class="text-slate-400 font-semibold">${proj.year}</span>
                <button
                  type="button"
                  onclick="AttivoShowcase3D.openLightbox('${proj.id}')"
                  class="font-bold text-[#00204a] hover:text-cyan-700 inline-flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-sm">zoom_in</span>
                  <span>Inspect Full HD</span>
                </button>
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

    openLightbox(projId) {
      const proj = ARCHIVE_PROJECTS.find(p => p.id === projId);
      if (!proj) return;
      const mode = this.viewModeByCard[projId] || '3d';
      const src = mode === '2d' ? proj.img2d : proj.img3d;

      let modal = document.getElementById('attivoShowcaseLightbox');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'attivoShowcaseLightbox';
        modal.className = 'fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4';
        document.body.appendChild(modal);
      }
      modal.classList.remove('hidden');
      modal.innerHTML = `
        <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 text-white">
            <div>
              <span class="text-xs font-bold text-cyan-400 uppercase">${proj.segment} • ${proj.area}</span>
              <h3 class="text-lg font-extrabold">${proj.title}</h3>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" onclick="document.getElementById('attivoLightboxImg').src='${proj.img3d}'" class="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold">3D Perspective</button>
              <button type="button" onclick="document.getElementById('attivoLightboxImg').src='${proj.img2d}'" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold">2D AutoCAD Layout</button>
              <button type="button" onclick="document.getElementById('attivoShowcaseLightbox').classList.add('hidden')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">✕ Close</button>
            </div>
          </div>
          <div class="p-4 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-auto">
            <img id="attivoLightboxImg" src="${src}" alt="${proj.title}" class="max-h-[70vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      `;
    }
  };

  // Export & Auto-Initialize
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
