
function translateProductName(name) {
  if (!name) return '';
  let n = name;
  const dict = [
    [/Máy Chạy Bộ Thương Mại/gi, 'Commercial Treadmill'],
    [/Máy Chạy Bộ/gi, 'Treadmill'],
    [/Xe Đạp Tập Thể Dục Thẳng Đứng/gi, 'Upright Stationary Bike'],
    [/Xe Đạp Đua Chuyên Nghiệp/gi, 'Indoor Cycling Bike'],
    [/Xe Đạp Tập/gi, 'Exercise Bike'],
    [/Máy Tập Toàn Thân Elliptical/gi, 'Elliptical Cross Trainer'],
    [/Máy Tập Toàn Thân/gi, 'Elliptical Trainer'],
    [/Máy Chèo Thuyền Thể Thao Trong Nhà/gi, 'Indoor Rowing Machine'],
    [/Máy Chèo Thuyền/gi, 'Rowing Machine'],
    [/Máy Đẩy Ngực Độc Lập/gi, 'Independent Plate Loaded Chest Press'],
    [/Máy Đẩy Ngực/gi, 'Chest Press'],
    [/Máy Kéo Xô \/ Ép Ngực Đa Năng/gi, 'Lat Pulldown / Chest Press Dual Machine'],
    [/Máy Ép Chân Nghiêng 45 Độ/gi, '45-Degree Incline Leg Press'],
    [/Khung Cáp Kép Đa Năng/gi, 'Dual Adjustable Pulley Functional Trainer'],
    [/Ghế Tập Đa Năng Điều Chỉnh Độ Dốc/gi, 'Multi-Adjustable Workout Bench'],
    [/Ghế Tập Đa Năng/gi, 'Adjustable Bench'],
    [/Khung Gánh Tạ Pro Power Rack/gi, 'Pro Power Rack & Rig Station'],
    [/Khung Gánh Tạ/gi, 'Power Rack'],
    [/Bộ Tạ Tay Urethane Đẳng Cấp/gi, 'Premium Commercial Urethane Dumbbell Set'],
    [/Bộ Tạ Tay/gi, 'Dumbbell Set'],
    [/Bộ Tạ Đĩa Thi Đấu Olympic Bumper Plates/gi, 'Olympic Bumper Plates Competition Set'],
    [/Bộ Tạ Đĩa/gi, 'Weight Plates Set'],
    [/Sàn Gỗ Thể Thao Giảm Chấn Cao Cấp/gi, 'Shock-Absorbing Sports & Gym Rubber Flooring'],
    [/Sàn Cao Su Thể Thao/gi, 'Sports Rubber Flooring Tiles'],
    [/Gạch Cao Su Chuyên Dụng Khu Tạ Nặng/gi, 'Heavy-Duty Weightlifting Rubber Gym Tile'],
    [/Gạch Cao Su Chuyên Dụng/gi, 'Heavy-Duty Rubber Gym Tile']
  ];
  dict.forEach(([pat, rep]) => { n = n.replace(pat, rep); });
  return n;
}

function translateGymSpecs(specs) {
  if (!specs) return '';
  let s = specs;
  const dict = [
    [/Kích thước \(D x R x C\)/gi, 'Dimensions (L x W x H)'],
    [/Kích thước \(DxRxC\)/gi, 'Dimensions (L x W x H)'],
    [/Kích thước/gi, 'Dimensions'],
    [/Trọng lượng người dùng tối đa/gi, 'Max User Weight'],
    [/Trọng lượng sản phẩm/gi, 'Product Weight'],
    [/Trọng lượng chồng tạ/gi, 'Weight Stack'],
    [/Trọng lượng tạ/gi, 'Weight Stack'],
    [/Chồng tạ/gi, 'Weight Stack'],
    [/Trọng lượng/gi, 'Weight'],
    [/Chiều cao bước lên/gi, 'Step-up Height'],
    [/Chiều cao ghế/gi, 'Seat Height'],
    [/Bảng điều khiển LED/gi, 'LED Console'],
    [/Bảng điều khiển/gi, 'Console Display'],
    [/Màu sắc: Đen ngọc trai/gi, 'Color: Black Pearl'],
    [/Màu sắc/gi, 'Color'],
    [/Mức độ kháng cự/gi, 'Resistance Levels'],
    [/Góc dốc/gi, 'Ramp Incline Angle'],
    [/Tổng số bài tập/gi, 'Total Workouts'],
    [/Công suất: Tự cung cấp năng lượng/gi, 'Power: Self-powered'],
    [/Khung thép 11 gauge \(3\.0 mm\)/gi, 'Heavy-duty 11-gauge (3.0mm) structural steel frame'],
    [/Khung thép dày 3mm 3” x 3” \(75 x 75mm\)/gi, 'Heavy-duty 3mm 3” x 3” (75 x 75mm) structural steel frame'],
    [/Khung thép/gi, 'Steel frame'],
    [/Lớp phủ sơn tĩnh điện bền/gi, 'Durable electrostatic powder coat finish'],
    [/Lớp phủ sơn tĩnh điện/gi, 'Powder coat finish'],
    [/Sơn tĩnh điện/gi, 'Powder coat finish'],
    [/Tay lái thẳng đứng được đệm hoàn toàn và điều chỉnh ghế đơn giản để có sự thoải mái khi lái xe vượt trội/gi, 'Fully cushioned upright handlebar and simple seat adjustment for superior riding comfort'],
    [/Tay lái thẳng đứng/gi, 'Upright ergonomically cushioned handlebar'],
    [/Dễ bảo trì/gi, 'Low maintenance commercial grade design'],
    [/Hai chồng tạ với tỷ lệ nâng là 2:1/gi, 'Dual weight stacks with 2:1 smooth lifting ratio'],
    [/Điều chỉnh ròng rọc thân thiện với người dùng cung cấp 33 vị trí bắt đầu/gi, 'User-friendly pulley adjustment with 33 starting positions'],
    [/Bảng hướng dẫn cung cấp hướng dẫn tập thể dục/gi, 'Instructional placard demonstrates target muscles and proper form'],
    [/Chuyển động phân kỳ hội tụ chuẩn sinh cơ học, tay nắm xoay tự nhiên/gi, 'Biomechanical diverging/converging motion path with natural rotating grips'],
    [/Lớp phủ bề mặt bằng cao su polyurethane cao cấp/gi, 'Premium polyurethane high-impact rubber coating'],
    [/Tay cầm mạ crôm/gi, 'Precision-knurled hard chrome-plated handle'],
    [/Đáy ghế có thể điều chỉnh \(0 - 40°\) & lưng ghế \(-10 - 80°\)/gi, 'Adjustable seat angle (0-40°) & multi-position backrest (-10° to 80°)'],
    [/Bánh xe và tay cầm tích hợp để dễ dàng di chuyển/gi, 'Integrated transport wheels and ergonomic grab handle'],
    [/Lỗ cắt bằng laser \(khoảng cách 50mm\) và hệ thống đánh số/gi, 'Laser-cut 50mm spaced holes with precision numbered positioning'],
    [/Phải được bắt bu lông vào sàn/gi, 'Floor bolt-down required for maximum safety stability'],
    [/Hai tay vịn an toàn bên trong \(lớp phủ bảo vệ bằng nhựa UMHW\)/gi, 'Dual internal safety spotter arms (UHMW plastic protective liners)'],
    [/Hai tay vịn an toàn bên trong/gi, 'Dual internal safety spotter arms'],
    [/Thanh kéo xà đơn & xà ngang/gi, 'Multi-grip pull-up and chin-up bar attachment'],
    [/bàn đạp ở điểm thấp nhất/gi, 'pedal at lowest point'],
    [/Tiêu chuẩn: Chân trước bằng nhôm, chân sau bằng thép/gi, 'Standard: Aluminum front legs, steel rear legs'],
    [/Nâng cao: Chân trước và sau bằng thép/gi, 'Advanced: All steel reinforced legs'],
    [/Nylon chắc chắn\. Có thể xoay để cất giữ và điều chỉnh chiều cao màn hình\./gi, 'Heavy-duty reinforced nylon. Pivots for compact storage and screen height adjustment.'],
    [/Thiết kế đã được chứng minh là đáng tin cậy và giá cả phải chăng/gi, 'Proven reliability and cost-effective commercial durability'],
    [/độ/gi, 'deg'],
    [/dặm\/giờ/gi, 'mph'],
    [/Phần cứng phủ kẽm 24mm/gi, '24mm Grade 8.8 zinc-coated structural hardware'],
    [/Tám trụ lưu trữ tấm chắn mạ crôm/gi, 'Eight chrome-plated Olympic weight storage pegs'],
    [/Một cặp J-Cup/gi, 'One pair of heavy-duty J-Cups with nylon liners'],
    [/Tăng dần 2/gi, '2kg incremental jumps'],
    [/Cách âm chống rung chấn thả tạ 200kg, chống mài mòn cao/gi, 'Acoustic shock absorption for 200kg drops, high abrasion resistance'],
    [/Chuyển động phân kỳ hội tụ chuẩn sinh cơ học, tay nắm xoay tự nhiên/gi, 'Biomechanical diverging/converging motion path with natural rotating grips']
  ];
  dict.forEach(([pat, rep]) => { s = s.replace(pat, rep); });
  return s;
}

function translateProposalZone(z, isEN) {
  if (!isEN || !z) return z;
  const map = {
    'Cardio': 'Cardio Zone',
    'Sức Mạnh (Strength)': 'Strength Zone',
    'Strength': 'Strength Zone',
    'Tạ Tự Do (Free Weights)': 'Free Weights Zone',
    'Free Weights': 'Free Weights Zone',
    'Khu Chuyên Biệt Mông Đùi (Glute Hub)': 'Glute Hub Zone',
    'Glute Hub': 'Glute Hub Zone',
    'Khu Huấn Luyện Thể Lực (Functional)': 'Functional Athletic Zone',
    'Functional': 'Functional Athletic Zone',
    'Pilates Reformer': 'Pilates Reformer Zone',
    'Sàn Thể Thao (Flooring)': 'Sports Flooring Zone',
    'Flooring': 'Sports Flooring Zone',
    'Phục Hồi & Trị Liệu': 'Recovery & Biohacking Zone'
  };
  return map[z] || z;
}
/**
 * =========================================================================
 * ATTIVO CPQ — AI QUOTATION ADVISOR & 2D/3D SPACE VISUALIZER ENGINE
 * =========================================================================
 * Full-featured AI assistant for Attivo International:
 * 1. AI Chat Advisor (Natural language consultation, product Q&A, automatic quote & layout generation)
 * 2. 5-Factor Quick Preset Generator (Brand, Facility Type, Area, Budget, Region)
 * 3. Space-Balanced Multi-Zone Allocation matching 7,898 authentic SKUs
 * 4. 2D Interactive CAD Floorplan Canvas (Scaled walls, 5 zones, safety clearances, tooltips, PNG export)
 * 5. 3D Interactive Room Walkthrough (Three.js WebGL, rubber flooring, lighting, 3D equipment models, 360° orbit)
 * 6. 3D Architectural Photorealistic Render Demo Showcase
 * 7. 1-Click Product Detail Integration (Click any product/SKU to open detail view & inventory reservation)
 * 8. Comprehensive Bilingual Support (Tiếng Việt / English)
 * =========================================================================
 */

(function(global) {
  'use strict';

  // Global State for AI Advisor & Visualizer
  const aiState = {
    currency: 'VND',
    exchangeRate: 26000,
    brand: 'all',
    projectType: 'commercial_gym',
    area: 250,
    budget: 2500000000,
    region: 'south',
    rigging: 'ground',
    currentProposal: null,
    activeMode: 'chat', // 'chat' | 'preset' | 'visualizer'
    visualizerSubTab: '2d', // '2d' | '3d' | 'showcase'
    chatHistory: [],
    canvas2D: null,
    threeScene: null,
    threeRenderer: null,
    threeCamera: null,
    threeControls: null
  };

  const PROJECT_TYPES = {
    commercial_gym: {
      name: 'Phòng Gym Thương Mại Cao Cấp (Commercial Pro)',
      name_en: 'Commercial Pro Fitness Center',
      desc: 'Phòng gym kinh doanh chuyên nghiệp, tối ưu luồng tập luyện, độ bền cao 24/7.',
      desc_en: 'Commercial pro gym facility, optimized workout flow, heavy-duty 24/7 durability.',
      icon: 'fitness_center',
      defaultArea: 350,
      defaultBudgetVND: 3500000000,
      recommendedBrands: ['precor', 'ziva', 'watson', 'topflor']
    },
    villa_gym: {
      name: 'Private Luxury Villa & Penthouse VIP',
      name_en: 'Private Luxury Villa & Penthouse VIP',
      desc: 'Không gian tập luyện gia đình thượng lưu, thiết bị thẩm mỹ đỉnh cao, êm ái tuyệt đối.',
      desc_en: 'Ultra-luxury residential home gym, refined aesthetics, whisper-quiet operation.',
      icon: 'villa',
      defaultArea: 80,
      defaultBudgetVND: 1200000000,
      recommendedBrands: ['precor', 'watson', 'ziva']
    },
    hotel_resort: {
      name: 'Khách Sạn & Resort Wellness 5 Sao',
      name_en: '5-Star Hotel & Wellness Resort Gym',
      desc: 'Thiết kế sang trọng, màn hình giải trí P94 Touchscreen, đạt chuẩn thương hiệu quốc tế.',
      desc_en: 'Luxury hospitality design, P94 Touchscreen entertainment, international brand standard.',
      icon: 'hotel',
      defaultArea: 150,
      defaultBudgetVND: 2200000000,
      recommendedBrands: ['precor', 'ziva']
    },
    corporate_gym: {
      name: 'Phòng Tập Doanh Nghiệp (Corporate Fitness)',
      name_en: 'Corporate Fitness & Wellness Center',
      desc: 'Tăng cường sức khỏe và gắn kết nhân viên, trang thiết bị đa năng, thân thiện người mới.',
      desc_en: 'Promotes workplace wellness and team cohesion, versatile and beginner-friendly equipment.',
      icon: 'corporate_fare',
      defaultArea: 100,
      defaultBudgetVND: 950000000,
      recommendedBrands: ['circle', 'ziva', 'precor']
    },
    pilates_studio: {
      name: 'Studio Pilates Reformer Chuyên Nghiệp',
      name_en: 'Professional Pilates Reformer Studio',
      desc: 'Hệ thống Reformer, Cadillac Merrithew Canada cao cấp cho studio chuyên sâu.',
      desc_en: 'Merrithew Canada premium Reformers & Cadillacs for clinical and boutique studios.',
      icon: 'self_improvement',
      defaultArea: 120,
      defaultBudgetVND: 1800000000,
      recommendedBrands: ['merrithew']
    },
    glute_hub: {
      name: 'Khu Chuyên Biệt Mông Đùi VIP (Glute Hub)',
      name_en: 'Glute Hub & Hip Thrust Specialty Zone',
      desc: 'Trọng tâm phát triển vòng 3 chuẩn form với Booty Builder Nauy & Watson UK.',
      desc_en: 'Dedicated glute hyper-training with Booty Builder Norway & Watson UK biomechanics.',
      icon: 'sports_gymnastics',
      defaultArea: 120,
      defaultBudgetVND: 1600000000,
      recommendedBrands: ['bootybuilder', 'watson', 'ziva']
    },
    functional_zone: {
      name: 'Khu Huấn Luyện Thể Lực Functional & Calisthenics',
      name_en: 'Functional Training & Calisthenics Hub',
      desc: 'Khung Rig ZIVA, sàn cỏ Topflor Turf, tạ ấm, bóng ném, thiết bị huấn luyện tốc độ cao.',
      desc_en: 'ZIVA modular rigs, Topflor athletic turf, kettlebells, medicine balls and speed drills.',
      icon: 'sports_kabaddi',
      defaultArea: 100,
      defaultBudgetVND: 800000000,
      recommendedBrands: ['ziva', 'eleiko', 'topflor']
    },
    recovery_lounge: {
      name: 'Biohacking & Recovery Lounge VIP',
      name_en: 'Biohacking & VIP Recovery Lounge',
      desc: 'Bể ngâm lạnh Skelcore Cold Plunge, xông hơi hồng ngoại và nén khí phục hồi cơ bắp.',
      desc_en: 'Skelcore cold plunge, infrared sauna, and pneumatic compression recovery therapy.',
      icon: 'spa',
      defaultArea: 60,
      defaultBudgetVND: 850000000,
      recommendedBrands: ['skelcore']
    }
  };

  

  function generateAiQuotePackage(params, productCatalog) {
    const {
      brand = 'all',
      projectType = 'commercial_gym',
      area = 250,
      budget = 2500000000,
      currency = 'VND',
      exchangeRate = 25450,
      region = 'north',
      siteCondition = 'ground',
      tier = 'auto'
    } = params;

    const actualCatalog = (productCatalog && productCatalog.length)
      ? productCatalog
      : (typeof window !== 'undefined' && Array.isArray(window.__CPQ_PRODUCTS__) && window.__CPQ_PRODUCTS__.length)
        ? window.__CPQ_PRODUCTS__
        : (typeof window !== 'undefined' && window.state && Array.isArray(window.state.products) && window.state.products.length)
          ? window.state.products
          : (typeof state !== 'undefined' && Array.isArray(state.products) && state.products.length)
            ? state.products
            : [];
    const pool = actualCatalog.filter(p => {
      const bp = parseFloat(p.base_price) || 0;
      if (bp <= 0) return false;
      const txt = `${p.sku || ''} ${p.name || ''} ${p.sub_group || ''} ${p.quote_category || ''}`.toUpperCase();
      if (/INSTALLATION KIT|CABLE ASSY|SPARE PART|LINH KIỆN|PHỤ TÙNG|SCREW|BOLT|WASHER|DECAL|HARNESS|PCBA|SENSOR|BELT|DECK|ROLLER/.test(txt)) return false;
      if ((p.category === 'cardio' || p.category === 'strength') && bp < 12000000) return false;
      return true;
    });
    const budgetVND = currency === 'USD' ? budget * exchangeRate : budget;
    const safeArea = Math.max(25, area);
    const budgetPerSqm = budgetVND / safeArea;

    // Automatic budget tier detection
    let budgetGrade = 'standard';
    if (tier === 'smart' || (tier === 'auto' && budgetPerSqm < 7500000)) {
      budgetGrade = 'economy';
    } else if (tier === 'luxury' || (tier === 'auto' && budgetPerSqm > 14000000)) {
      budgetGrade = 'luxury';
    }

    // Picker function with priority scoring
    function pickBest(cat, keywords = [], brandPref = null, maxUnitPrice = Infinity) {
      let filtered = pool.filter(p => {
        if (cat && p.category !== cat) return false;
        const bp = parseFloat(p.base_price) || 0;
        if (bp > maxUnitPrice) return false;
        if (brandPref && brandPref !== 'all') {
          const b = (p.brand_main || p.brand || '').toLowerCase();
          if (!b.includes(brandPref.toLowerCase())) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        filtered = pool.filter(p => (!cat || p.category === cat) && (parseFloat(p.base_price) || 0) <= maxUnitPrice);
      }
      if (filtered.length === 0) {
        filtered = pool.filter(p => !cat || p.category === cat);
      }

      if (keywords.length > 0) {
        const exactMatch = filtered.find(p => {
          const text = `${p.sku} ${p.name}`.toLowerCase();
          return keywords.every(kw => text.includes(kw.toLowerCase()));
        });
        if (exactMatch) return exactMatch;

        const partialMatch = filtered.find(p => {
          const text = `${p.sku} ${p.name}`.toLowerCase();
          return keywords.some(kw => text.includes(kw.toLowerCase()));
        });
        if (partialMatch) return partialMatch;
      }

      // Sort by price strategy based on grade
      if (budgetGrade === 'economy') {
        filtered.sort((a, b) => (parseFloat(a.base_price) || 0) - (parseFloat(b.base_price) || 0));
      } else {
        filtered.sort((a, b) => (parseFloat(b.base_price) || 0) - (parseFloat(a.base_price) || 0));
      }

      return filtered[0] || null;
    }

    // Capacity & unit ratios
    let maxMachineUnits = Math.max(3, Math.floor(safeArea / (budgetGrade === 'economy' ? 12 : 10)));
    if (projectType === 'villa_gym') maxMachineUnits = Math.min(8, Math.max(3, Math.floor(safeArea / 12)));

    // Target zone budgets
    const targetCardioBudget = budgetVND * 0.32;
    const targetStrengthBudget = budgetVND * 0.34;
    const targetFreeWeightBudget = budgetVND * 0.20;

    const targetCardioUnits = Math.max(1, Math.min(10, Math.floor(maxMachineUnits * 0.35)));
    const maxCardioUnitPrice = (targetCardioBudget / targetCardioUnits) * 1.35;

    // Brand mapping
    let cardioBrand = (brand === 'all') ? (budgetGrade === 'economy' ? 'Circle' : 'Precor') : brand;
    let strengthBrand = (brand === 'all') ? (budgetGrade === 'luxury' ? 'Watson' : 'Precor') : brand;
    let freeWeightBrand = (brand === 'all') ? (budgetGrade === 'luxury' ? 'Eleiko' : 'Ziva') : brand;

    if (brand === 'watson') {
      strengthBrand = 'Watson';
      freeWeightBrand = 'Watson';
      cardioBrand = 'Precor';
    } else if (brand === 'bootybuilder') {
      strengthBrand = 'Booty';
      cardioBrand = 'Precor';
    } else if (brand === 'eleiko') {
      strengthBrand = 'Eleiko';
      freeWeightBrand = 'Eleiko';
      cardioBrand = 'Precor';
    } else if (brand === 'merrithew') {
      strengthBrand = 'Merrithew';
      freeWeightBrand = 'Ziva';
    }

    const items = [];
    function addItem(prod, qty, zone, defaultDiscount = 8) {
      if (!prod || qty <= 0) return;
      const basePrice = parseFloat(prod.base_price) || 0;
      const nEn = prod.name_en || translateProductName(prod.name);
      const sEn = prod.specs_en || translateGymSpecs(prod.specs);
      items.push({
        product_id: prod.id,
        sku: prod.sku,
        name: prod.name,
        name_en: nEn,
        brand: prod.brand_main || prod.brand || 'Attivo',
        category: prod.category || 'equipment',
        zone,
        unit: prod.unit || 'Bộ',
        quantity: qty,
        base_unit_price: basePrice,
        discount_pct: defaultDiscount,
        unit_price: Math.round(basePrice * (1 - defaultDiscount / 100)),
        image_url: prod.image || prod.image_url || 'assets/extracted/evn_r08_c07_2.png',
        specs: prod.specs || 'Thiết bị cao cấp chính hãng do Attivo International phân phối.',
        specs_en: sEn || 'Premium commercial fitness equipment distributed by Attivo International.',
        cogs: parseFloat(prod.cogs || prod.unit_cogs) || (basePrice * 0.55),
        vat_rate: '10'
      });
    }

    // --- ZONE GENERATION LOGIC ---
    if (projectType === 'pilates_studio') {
      const reformer = pickBest('equipment', ['reformer'], 'Merrithew') || pickBest('equipment', ['spx', 'v2 max']);
      const cadillac = pickBest('equipment', ['cadillac', 'trapeze', 'plus'], 'Merrithew') || pickBest('equipment', ['plus']);
      const barrel = pickBest('equipment', ['ladder', 'barrel'], 'Merrithew') || pickBest('equipment', ['barrel']);
      const spine = pickBest('equipment', ['spine', 'arc', 'corrector'], 'Merrithew');
      const mat = pickBest('accessories', ['mat'], 'Merrithew');

      const refCount = Math.max(2, Math.min(8, Math.floor(safeArea / 22)));
      if (reformer) addItem(reformer, refCount, 'Pilates Reformer Core', 8);
      if (cadillac) addItem(cadillac, 1, 'Cadillac / Trapeze Studio', 5);
      if (barrel) addItem(barrel, 1, 'Ladder Barrel Posture', 8);
      if (spine) addItem(spine, Math.min(4, Math.max(1, Math.floor(refCount / 2))), 'Spine & Arc Correctors', 10);
      if (mat) addItem(mat, refCount, 'Pilates Props & Mats', 10);
    } else if (projectType === 'recovery_lounge') {
      const plunge = pickBest('equipment', ['plunge', 'cold'], 'Skelcore') || pickBest('equipment', ['plunge']);
      const sauna = pickBest('equipment', ['sauna'], 'Skelcore') || pickBest('equipment', ['sauna']);
      const boots = pickBest('accessories', ['compression', 'boot'], 'Skelcore');
      if (plunge) addItem(plunge, Math.max(1, Math.floor(safeArea / 40)), 'Cryotherapy & Cold Plunge', 8);
      if (sauna) addItem(sauna, 1, 'Infrared Sauna Cabin', 8);
      if (boots) addItem(boots, 2, 'Air Compression Recovery', 10);
    } else {
      // 1. CARDIO ZONE
      const numTreadmills = projectType === 'villa_gym' ? 1 : Math.max(1, Math.floor(targetCardioUnits * 0.6));
      const numBikes = projectType === 'villa_gym' ? 1 : Math.max(1, Math.floor(targetCardioUnits * 0.4));

      const treadmill = pickBest('equipment', ['trm', 'treadmill'], cardioBrand, maxCardioUnitPrice) || pickBest('equipment', ['treadmill'], null, maxCardioUnitPrice);
      const bike = pickBest('equipment', ['bike', 'ubk', 'rbk'], cardioBrand, maxCardioUnitPrice * 0.7) || pickBest('equipment', ['bike']);
      const rower = (safeArea >= 120 && projectType !== 'villa_gym' && projectType !== 'glute_hub') ? pickBest('equipment', ['rower', 'rowerg']) : null;
      const elliptical = (safeArea >= 150 && projectType !== 'villa_gym' && projectType !== 'glute_hub') ? pickBest('equipment', ['efx', 'elliptical'], cardioBrand, maxCardioUnitPrice) : null;

      if (treadmill) addItem(treadmill, numTreadmills, 'Cardio Zone', 8);
      if (bike) addItem(bike, numBikes, 'Cardio Zone', 8);
      if (elliptical) addItem(elliptical, 1, 'Cardio Zone', 8);
      if (rower) addItem(rower, 1, 'Cardio Zone', 5);

      // 2. STRENGTH SELECTORIZED & SPECIALTY ZONE
      if (projectType === 'glute_hub') {
        const hipThrust = pickBest('equipment', ['hip', 'thrust'], 'Booty') || pickBest('equipment', ['thrust']) || pickBest('equipment', ['booty']);
        const v8 = pickBest('equipment', ['v8', 'platinum'], 'Booty') || pickBest('equipment', ['belt', 'squat']);
        const standingGlute = pickBest('equipment', ['standing', 'glute'], 'Booty') || pickBest('equipment', ['abductor']);
        const hackSquat = pickBest('equipment', ['hack', 'squat', 'pendulum'], 'Precor') || pickBest('equipment', ['squat']);
        if (hipThrust) addItem(hipThrust, 2, 'Glute Hub Target', 8);
        if (v8) addItem(v8, 1, 'Glute Hub Target', 8);
        if (standingGlute) addItem(standingGlute, 1, 'Glute Hub Target', 8);
        if (hackSquat) addItem(hackSquat, 1, 'Squat & Lower Body Power', 8);
      } else {
        const chestPress = pickBest('equipment', ['chest', 'press'], strengthBrand);
        const latPull = pickBest('equipment', ['pulldown', 'lat'], strengthBrand);
        const legExt = pickBest('equipment', ['leg', 'extension'], strengthBrand);
        const functionalTrainer = pickBest('equipment', ['fts', 'glide', 'functional', 'cable'], strengthBrand);

        if (chestPress) addItem(chestPress, 1, 'Strength Selectorized', 8);
        if (latPull) addItem(latPull, 1, 'Strength Selectorized', 8);
        if (legExt && (safeArea >= 90 || projectType === 'commercial_gym')) addItem(legExt, 1, 'Strength Selectorized', 8);
        if (functionalTrainer) addItem(functionalTrainer, 1, 'Dual Cable Functional Trainer', 8);
      }

      // 3. FREE WEIGHTS & BENCHES ZONE
      const fidBench = pickBest('equipment', ['fid', 'bench'], freeWeightBrand) || pickBest('equipment', ['bench'], freeWeightBrand);
      const powerRack = (projectType === 'villa_gym') ? null : (pickBest('equipment', ['rack', 'power', 'prestera'], freeWeightBrand) || pickBest('equipment', ['rack']));
      const dbSet = pickBest('accessories', ['dumbbell', 'set'], freeWeightBrand) || pickBest('accessories', ['dumbbell']);
      const discSet = (projectType === 'villa_gym') ? null : (pickBest('accessories', ['disc', 'bumper'], freeWeightBrand) || pickBest('accessories', ['disc']));

      const numBenches = projectType === 'villa_gym' ? 1 : Math.max(1, Math.floor(safeArea / 90));
      if (fidBench) addItem(fidBench, numBenches, 'Free Weights & Benches', 10);
      if (powerRack) addItem(powerRack, 1, 'Heavy Duty Racks', 8);
      if (dbSet) addItem(dbSet, 1, 'Dumbbell Sets & Racks', 10);
      if (discSet) addItem(discSet, 2, 'Olympic Weight Plates', 10);

      // 4. FUNCTIONAL ACCESSORIES
      const mat = pickBest('accessories', ['mat', 'yoga'], 'Ziva');
      const kettlebell = pickBest('accessories', ['kettlebell'], 'Ziva');
      if (mat) addItem(mat, projectType === 'villa_gym' ? 2 : Math.min(8, Math.floor(safeArea / 30)), 'Functional Accessories', 15);
      if (kettlebell) addItem(kettlebell, projectType === 'villa_gym' ? 2 : 4, 'Functional Accessories', 15);

      // 5. FLOORING & ACOUSTICS
      const flooring = pickBest('flooring', ['rubber', 'tile'], 'Topflor') || pickBest('flooring', ['rubber']);
      if (flooring) {
        const tileUnits = Math.round(safeArea * 0.85);
        addItem(flooring, tileUnits, 'Flooring & Acoustics', 15);
      }
    }

    // --- FINANCIAL CALCULATIONS ---
    let totalListPrice = 0;
    let totalDiscountedPrice = 0;
    let totalCogs = 0;

    const zoneTotals = {
      cardio: 0,
      strength: 0,
      freeWeights: 0,
      functional: 0,
      flooring: 0
    };

    items.forEach(it => {
      const lineList = it.base_unit_price * it.quantity;
      const lineNet = it.unit_price * it.quantity;
      const lineCogs = (it.cogs || it.base_unit_price * 0.55) * it.quantity;

      totalListPrice += lineList;
      totalDiscountedPrice += lineNet;
      totalCogs += lineCogs;

      const zName = (it.zone || '').toLowerCase();
      if (zName.includes('cardio')) zoneTotals.cardio += lineNet;
      else if (zName.includes('strength') || zName.includes('glute')) zoneTotals.strength += lineNet;
      else if (zName.includes('free') || zName.includes('rack') || zName.includes('bench')) zoneTotals.freeWeights += lineNet;
      else if (zName.includes('floor')) zoneTotals.flooring += lineNet;
      else zoneTotals.functional += lineNet;
    });

    // Shipping & Delivery Rate
    let shippingRate = 1.5;
    if (region === 'central') shippingRate = 3.0;
    if (region === 'island') shippingRate = 5.0;
    if (siteCondition === 'stairs') shippingRate += 2.0;

    const shippingAmount = Math.round(totalDiscountedPrice * (shippingRate / 100));
    const subtotalBeforeTax = totalDiscountedPrice + shippingAmount;
    const vatAmount = Math.round(subtotalBeforeTax * 0.1);
    const grandTotalVND = subtotalBeforeTax + vatAmount;

    const grossProfit = subtotalBeforeTax - totalCogs;
    const grossMarginPct = subtotalBeforeTax > 0 ? Math.round((grossProfit / subtotalBeforeTax) * 1000) / 10 : 42.0;
    const discountPct = totalListPrice > 0 ? Math.round((1 - totalDiscountedPrice / totalListPrice) * 1000) / 10 : 8.0;

    const machineCount = items.reduce((s, x) => s + (x.category !== 'flooring' ? x.quantity : 0), 0);

    const proposal = {
      title: `Gói Thiết Bị ${PROJECT_TYPES[projectType]?.name || 'Phòng Tập Thể Thao'} — ${safeArea}m²`,
      projectType,
      facilityType: projectType,
      brand,
      area: safeArea,
      area_m2: safeArea,
      total_units: machineCount,
      total_skus: items.length,
      density: (safeArea / Math.max(1, machineCount)).toFixed(1),
      space_density_m2_per_unit: (safeArea / Math.max(1, machineCount)).toFixed(1),
      capacity: Math.max(2, Math.floor(safeArea / 6.5)),
      peak_member_capacity: Math.max(2, Math.floor(safeArea / 6.5)),
      budget_grade: budgetGrade,
      budget_vnd: budgetVND,
      budget_display: currency === 'USD' ? Math.round(budgetVND / exchangeRate) : budgetVND,
      grand_total_vnd: grandTotalVND,
      grand_total_usd: Math.round((grandTotalVND / exchangeRate) * 100) / 100,
      list_price_total: totalListPrice,
      discount_pct: discountPct,
      discount_amount: totalListPrice - totalDiscountedPrice,
      shipping_rate: shippingRate,
      shipping_amount: shippingAmount,
      vat_amount: vatAmount,
      gross_margin_pct: grossMarginPct,
      budget_utilization_pct: Math.round((grandTotalVND / budgetVND) * 1000) / 10,
      currency,
      exchangeRate,
      zoneTotals,
      items
    };

    aiState.currentProposal = proposal;
    return proposal;
  }

  // --- RENDER CONTROLLER ---

  // =========================================================================
  // RENDER AI PROPOSAL DASHBOARD (WITH CLICKABLE PRODUCT DETAIL LINKS)
  // =========================================================================
  function renderAiProposalDashboard(proposal) {
    if (!proposal) return;
    aiState.currentProposal = proposal;

    const isUSD = (aiState.currency === 'USD');
    const isEN = (typeof state !== 'undefined' && state.appLang === 'en');
    const currSym = isUSD ? '$' : 'đ';

    const dash = document.getElementById('aiProposalDashboard');
    if (dash) dash.classList.remove('hidden');

    // Title & Status Badge
    const titleEl = document.getElementById('aiProposalTitle');
    if (titleEl) titleEl.innerText = isEN ? (proposal.title_en || ('Commercial Pro Fitness Package — ' + (proposal.area_m2 || 250) + 'm²')) : proposal.title;
    const badgeEl = document.getElementById('lblAiBadgeStatus');
    if (badgeEl) badgeEl.innerText = isEN ? 'OPTIMALLY ALLOCATED' : 'Đã Phân Bổ Tối Ưu';
    const fitEl = document.getElementById('aiKpiBudgetFit');
    if (fitEl) fitEl.innerText = isEN ? '100% budget match' : '100% khớp ngân sách';
    const pdfBtnEl = document.getElementById('lblAiPrintPdfTop');
    if (pdfBtnEl) pdfBtnEl.innerText = isEN ? 'Print PDF' : 'In PDF';

    // KPI Cards
    const kpiTotal = document.getElementById('aiKpiGrandTotal');
    const kpiUnits = document.getElementById('aiKpiTotalUnits');
    const kpiSkus = document.getElementById('aiKpiSkus');
    const kpiDensity = document.getElementById('aiKpiDensity');
    const kpiCapacity = document.getElementById('aiKpiCapacity');
    const kpiMargin = document.getElementById('aiKpiMargin');
    const kpiFit = document.getElementById('aiKpiBudgetFit');

    const totalFmt = isUSD 
      ? `$${proposal.grand_total_usd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      : `${proposal.grand_total_vnd.toLocaleString('vi-VN')} đ`;

    if (kpiTotal) kpiTotal.innerText = totalFmt;
    if (kpiUnits) kpiUnits.innerText = isEN ? `${proposal.total_units} units` : `${proposal.total_units} thiết bị`;
    if (kpiSkus) kpiSkus.innerText = isEN ? `(${proposal.items.length} SKUs)` : `(${proposal.items.length} mã SKU)`;
    if (kpiDensity) kpiDensity.innerText = `${proposal.space_density_m2_per_unit} m²/${isEN ? 'unit' : 'máy'}`;
    if (kpiCapacity) kpiCapacity.innerText = isEN ? `~${proposal.peak_member_capacity} members` : `~${proposal.peak_member_capacity} hội viên`;
    if (kpiMargin) kpiMargin.innerText = `${proposal.gross_margin_pct}%`;
    if (kpiFit) kpiFit.innerText = isEN ? `Budget fit: ${proposal.budget_utilization_pct}%` : `Khớp ngân sách: ${proposal.budget_utilization_pct}%`;

    // Zone Distribution Progress Bar
    const totalNet = proposal.items.reduce((s, x) => s + (x.unit_price * x.quantity), 0) || 1;
    const pCardio = Math.round((proposal.zoneTotals.cardio / totalNet) * 100);
    const pStrength = Math.round((proposal.zoneTotals.strength / totalNet) * 100);
    const pFree = Math.round((proposal.zoneTotals.freeWeights / totalNet) * 100);
    const pFunc = Math.round((proposal.zoneTotals.functional / totalNet) * 100);
    const pFloor = Math.max(0, 100 - pCardio - pStrength - pFree - pFunc);

    const bCardio = document.getElementById('aiZoneBarCardio');
    const bStrength = document.getElementById('aiZoneBarStrength');
    const bFree = document.getElementById('aiZoneBarFree');
    const bFunc = document.getElementById('aiZoneBarFunc');
    const bFloor = document.getElementById('aiZoneBarFloor');

    if (bCardio) { bCardio.style.width = pCardio + '%'; bCardio.innerText = `Cardio ${pCardio}%`; }
    if (bStrength) { bStrength.style.width = pStrength + '%'; bStrength.innerText = `Strength ${pStrength}%`; }
    if (bFree) { bFree.style.width = pFree + '%'; bFree.innerText = `Free Weights ${pFree}%`; }
    if (bFunc) { bFunc.style.width = pFunc + '%'; bFunc.innerText = `Func ${pFunc}%`; }
    if (bFloor) { bFloor.style.width = pFloor + '%'; bFloor.innerText = `Floor ${pFloor}%`; }

    // Table rows with DIRECT CLICKABLE LINKS TO PRODUCT DETAIL
    const tbody = document.getElementById('aiQuoteItemsTbody');
    if (tbody) {
      tbody.innerHTML = '';
      proposal.items.forEach((it, idx) => {
        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50 transition border-b border-slate-200 text-xs";

        const lineTotal = it.unit_price * it.quantity;
        const displayUnit = isUSD ? Math.round((it.unit_price / proposal.exchangeRate) * 100) / 100 : it.unit_price;
        const displayTotal = isUSD ? Math.round((lineTotal / proposal.exchangeRate) * 100) / 100 : lineTotal;

        const safeSku = (it.sku || '').replace(/'/g, "\\'");
        const safeName = (it.name || '').replace(/'/g, "\\'");
        const dispName = isEN ? translateProductName(it.name_en || it.name) : it.name;
        const dispSpecs = isEN ? translateGymSpecs(it.specs_en || it.specs || '') : (it.specs || '');
        const dispZone = translateProposalZone(it.zone, isEN);

        row.innerHTML = `
          <td class="py-2.5 px-3 text-center font-bold text-slate-500">${idx + 1}</td>
          <td class="py-2.5 px-2 text-center">
            <img 
              src="${it.image_url}" 
              alt="${it.name}" 
              onclick="showProductDetailView('${safeSku}')"
              class="w-12 h-10 object-contain mx-auto rounded border border-slate-200 bg-white p-0.5 shadow-2xs cursor-pointer hover:border-cyan-500 hover:scale-105 transition" 
              onerror="this.src='assets/extracted/evn_r08_c07_2.png'" 
              title="${isEN ? 'Click to view product details & inventory' : 'Bấm xem chi tiết sản phẩm & tồn kho'}"
            />
          </td>
          <td class="py-2.5 px-3 font-mono font-bold text-[#00204a]">
            <a 
              href="javascript:void(0)" 
              onclick="showProductDetailView('${safeSku}')" 
              class="text-cyan-700 hover:text-cyan-900 hover:underline inline-flex items-center gap-1 group" 
              title="${isEN ? 'Click to view product details' : 'Bấm xem chi tiết mã này'}"
            >
              <span>${it.sku}</span>
              <span class="material-symbols-outlined text-[13px] opacity-70 group-hover:opacity-100 transition-opacity">open_in_new</span>
            </a>
          </td>
          <td class="py-2.5 px-3">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">${it.brand}</span>
          </td>
          <td class="py-2.5 px-3">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">${dispZone}</span>
          </td>
          <td class="py-2.5 px-3">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span 
                class="font-bold text-slate-900 hover:text-cyan-800 cursor-pointer" 
                onclick="showProductDetailView('${safeSku}')"
                title="${isEN ? 'View full specifications & features' : 'Xem thông số kỹ thuật & tính năng'}"
              >${dispName}</span>
              <button 
                type="button"
                onclick="showProductDetailView('${safeSku}')"
                class="text-[10px] text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-1.5 py-0.5 rounded font-semibold inline-flex items-center gap-0.5 transition"
              >
                <span class="material-symbols-outlined text-[11px]">info</span>
                ${isEN ? 'Detail' : 'Chi tiết'}
              </button>
            </div>
            <div class="text-[11px] text-slate-500 line-clamp-1">${dispSpecs}</div>
          </td>
          <td class="py-2.5 px-3 text-center">
            <div class="inline-flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
              <button onclick="AttivoAiAdvisor.updateQty(${idx}, -1)" type="button" class="px-2 py-1 hover:bg-slate-100 text-slate-600 font-bold transition">−</button>
              <span class="px-2.5 py-1 text-xs font-bold text-[#00204a] bg-slate-50 min-w-[28px] text-center">${it.quantity}</span>
              <button onclick="AttivoAiAdvisor.updateQty(${idx}, 1)" type="button" class="px-2 py-1 hover:bg-slate-100 text-slate-600 font-bold transition">+</button>
            </div>
          </td>
          <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
            ${isUSD ? `$${displayUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${displayUnit.toLocaleString('vi-VN')} đ`}
          </td>
          <td class="py-2.5 px-3 text-center">
            <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900">${it.discount_pct}%</span>
          </td>
          <td class="py-2.5 px-3 text-right font-mono font-extrabold text-[#00204a]">
            ${isUSD ? `$${displayTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${displayTotal.toLocaleString('vi-VN')} đ`}
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    // Trigger 2D Floorplan & 3D Room Visualizer
    if (global.AttivoVisualizer2D && typeof global.AttivoVisualizer2D.render === 'function') {
      global.AttivoVisualizer2D.render(proposal);
    }
    if (global.AttivoVisualizer3D && typeof global.AttivoVisualizer3D.render === 'function') {
      global.AttivoVisualizer3D.render(proposal);
    }
    if (global.AttivoShowcase3D && typeof global.AttivoShowcase3D.render === 'function') {
      global.AttivoShowcase3D.render(proposal.facilityType);
    }
  }

  function updateProposalItemQty(index, delta) {
    if (!aiState.currentProposal || !aiState.currentProposal.items[index]) return;
    const it = aiState.currentProposal.items[index];
    const newQty = Math.max(0, it.quantity + delta);
    if (newQty === 0) {
      if (!confirm(`Xóa thiết bị ${it.sku} khỏi danh mục đề xuất?`)) return;
      aiState.currentProposal.items.splice(index, 1);
    } else {
      it.quantity = newQty;
    }

    // Recalculate totals
    let totalList = 0;
    let totalNet = 0;
    aiState.currentProposal.items.forEach(it => {
      totalList += it.base_unit_price * it.quantity;
      totalNet += it.unit_price * it.quantity;
    });

    const shippingAmt = Math.round(totalNet * (aiState.currentProposal.shipping_rate / 100));
    const subtotal = totalNet + shippingAmt;
    const vat = Math.round(subtotal * 0.1);
    const grand = subtotal + vat;

    aiState.currentProposal.list_price_total = totalList;
    aiState.currentProposal.shipping_amount = shippingAmt;
    aiState.currentProposal.vat_amount = vat;
    aiState.currentProposal.grand_total_vnd = grand;
    aiState.currentProposal.grand_total_usd = Math.round((grand / aiState.currentProposal.exchangeRate) * 100) / 100;
    aiState.currentProposal.budget_utilization_pct = Math.round((grand / aiState.currentProposal.budget_vnd) * 1000) / 10;
    aiState.currentProposal.total_units = aiState.currentProposal.items.reduce((s, x) => s + (x.category !== 'flooring' ? x.quantity : 0), 0);

    renderAiProposalDashboard(aiState.currentProposal);
  }

  function applyAiProposalToBuilder() {
    if (!aiState.currentProposal || !aiState.currentProposal.items.length) {
      alert("Chưa có đề xuất báo giá nào được tạo!");
      return;
    }

    if (typeof state === 'undefined') {
      alert("Lỗi kết nối với trạng thái bảng soạn thảo CPQ!");
      return;
    }

    const isEN = (state.appLang === 'en');
    const msg = isEN 
      ? `Apply this AI Proposal (${aiState.currentProposal.items.length} items) into the Main Quotation Builder?`
      : `Áp dụng gói đề xuất AI (${aiState.currentProposal.items.length} hạng mục) vào bảng Soạn Thảo Báo Giá chính?`;

    if (!confirm(msg)) return;

    // Overwrite quoteItems with AI proposal items
    state.quoteItems = aiState.currentProposal.items.map(it => ({
      row_type: 'product',
      product_id: it.product_id,
      sku: it.sku,
      name: it.name,
      name_en: it.name,
      brand: it.brand,
      category: it.category,
      unit: it.unit,
      quantity: it.quantity,
      price_tier: '1',
      base_unit_price: it.base_unit_price,
      shipping_per_unit: 0,
      unit_price: it.unit_price,
      base_price: it.base_unit_price,
      price_tier_2: Math.round(it.base_unit_price * 0.95),
      price_tier_3: Math.round(it.base_unit_price * 0.90),
      fixed_price: 0,
      unit_cogs: it.cogs,
      unit_est_warehouse_cost: 0,
      discount_pct: it.discount_pct,
      vat_rate: '10',
      warranty_period: '24 tháng',
      allow_discount: 1,
      image_url: it.image_url,
      specs: it.specs
    }));

    // Update quote title
    const quoteTitle = document.getElementById('quoteTitleInput');
    if (quoteTitle) quoteTitle.value = aiState.currentProposal.title;

    // Recalculate quote & render builder items
    if (typeof renderQuoteItems === 'function') renderQuoteItems();
    if (typeof recalculateQuote === 'function') recalculateQuote();

    // Navigate to builder
    if (typeof switchTab === 'function') switchTab('builder');
    if (typeof navigateTo === 'function') navigateTo('builder');

    alert(isEN 
      ? "✨ Successfully loaded entire AI Equipment Package into Quotation Builder!" 
      : "✨ Đã nạp thành công toàn bộ gói thiết bị AI vào Bảng Soạn Thảo Báo Giá!");
  }

  async function exportAiProposalExcel() {
    if (!aiState.currentProposal) {
      alert("Vui lòng tạo gói báo giá trước khi xuất Excel!");
      return;
    }

    const payload = {
      quote_code: `ATV-AI-${Date.now().toString().slice(-6)}`,
      deal_name: aiState.currentProposal.title,
      customer_name: 'Quý Khách Hàng / Đối Tác',
      customer_address: `${aiState.area}m² — Khu vực ${aiState.region.toUpperCase()}`,
      created_at: new Date().toISOString(),
      currency: aiState.currency,
      exchange_rate: aiState.exchangeRate,
      items: aiState.currentProposal.items
    };

        if (typeof AttivoExcel !== 'undefined' && AttivoExcel.downloadAttivoQuoteExcel) {
      try {
        await AttivoExcel.downloadAttivoQuoteExcel(payload);
      } catch (err) {
        console.error("Excel generation error:", err);
        alert("Lỗi xuất Excel: " + err.message);
      }
    } else if (typeof exportAttivoQuotationExcel === 'function') {
      try {
        await exportAttivoQuotationExcel(payload);
      } catch (err) {
        console.error("Excel generation error:", err);
        alert("Lỗi xuất Excel: " + err.message);
      }
    } else {
      alert("Trình xuất file Excel đang khởi tạo, vui lòng thử lại sau 2 giây!");
    }
  }

  function previewAiProposalPdf() {
    applyAiProposalToBuilder();
    setTimeout(() => {
      if (typeof previewPrintQuote === 'function') {
        previewPrintQuote();
      }
    }, 200);
  }

  function setAreaPreset(val) {
    aiState.area = Number(val);
    const inp = document.getElementById('aiAreaInput');
    const rng = document.getElementById('aiAreaRange');
    if (inp) inp.value = val;
    if (rng) rng.value = val;
  }

  function setBudgetPreset(val) {
    aiState.budget = Number(val);
    const inp = document.getElementById('aiBudgetInput');
    const rng = document.getElementById('aiBudgetRange');
    if (inp) inp.value = Number(val).toLocaleString('vi-VN');
    if (rng) rng.value = val;
  }

  function runAiProposalGeneration() {
    // Read current form inputs
    const brand = document.getElementById('aiBrandSelect')?.value || 'all';
    const projectType = document.getElementById('aiProjectTypeSelect')?.value || 'commercial_gym';
    const area = Number(document.getElementById('aiAreaInput')?.value) || 250;
    const rawBudget = document.getElementById('aiBudgetInput')?.value || '2500000000';
    const budget = Number(rawBudget.replace(/[^0-9]/g, '')) || 2500000000;
    const region = document.getElementById('aiRegionSelect')?.value || 'south';
    const rigging = document.getElementById('aiRiggingSelect')?.value || 'ground';

    aiState.brand = brand;
    aiState.projectType = projectType;
    aiState.area = area;
    aiState.budget = budget;
    aiState.region = region;
    aiState.rigging = rigging;

    const proposal = generateAiQuotePackage({
      brand,
      projectType,
      area,
      budget,
      region,
      rigging
    });

    renderAiProposalDashboard(proposal);

    // Scroll smoothly to dashboard
    const dash = document.getElementById('aiProposalDashboard');
    if (dash) dash.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // =========================================================================
  // MODULE: ATTIVO AI CHAT ADVISOR (HỎI ĐÁP SẢN PHẨM & TỰ ĐỘNG LÊN BÁO GIÁ)
  // =========================================================================
  const AttivoAiChat = {
    init() {
      const container = document.getElementById('aiChatMessages');
      if (!container || aiState.chatHistory.length > 0) return;

      const isEN = (typeof state !== 'undefined' && state.appLang === 'en');
      const welcomeMsg = isEN
        ? "Hello! I am **Attivo AI Senior Advisor**. How can I help you today? You can ask me technical specifications of any fitness equipment (Precor, Watson, ZIVA, Booty Builder, Woodway, Merrithew, Topflor) or simply share your gym project details (e.g. *Commercial gym 300m² in Da Nang, budget 3.5 billion VND*) and I will automatically generate a tailored equipment quote and 2D/3D floor layout for you!"
        : "Xin chào! Tôi là **Trợ lý AI Cấp Cao Attivo International**. Bạn có thể hỏi tôi chi tiết thông số kỹ thuật của bất kỳ dòng máy nào (Precor, Watson, ZIVA, Booty Builder, Woodway, Merrithew, Topflor) hoặc gửi thông tin dự án (ví dụ: *Gym thương mại 300m² tại Đà Nẵng, ngân sách 3.5 tỷ*) để tôi tự động phân bổ danh mục thiết bị và dựng bản vẽ sơ đồ mặt bằng 2D/3D ngay lập tức!";

      this.appendMessage('ai', welcomeMsg);
    },

    appendMessage(sender, text, cardData, actions) {
      const container = document.getElementById('aiChatMessages');
      if (!container) return;

      const isEN = (typeof state !== 'undefined' && state.appLang === 'en');
      const timeStr = new Date().toLocaleTimeString(isEN ? 'en-US' : 'vi-VN', { hour: '2-digit', minute: '2-digit' });

      aiState.chatHistory.push({ sender, text, cardData, actions, time: timeStr });

      const msgDiv = document.createElement('div');
      msgDiv.className = `flex gap-3 ${sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`;

      if (sender === 'ai') {
        let cardHtml = '';
        if (cardData) {
          cardHtml = `
            <div class="mt-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
              <img src="${cardData.image_url}" alt="${cardData.name}" class="w-16 h-16 object-contain rounded-lg border border-slate-100 p-1 flex-shrink-0" onerror="this.src='assets/extracted/evn_r08_c07_2.png'" />
              <div class="flex-1 min-w-0 text-left">
                <div class="flex items-center gap-1.5">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00204a] text-white">${cardData.brand}</span>
                  <span class="font-mono font-bold text-xs text-slate-700">${cardData.sku}</span>
                </div>
                <div class="font-bold text-xs text-slate-900 mt-1 truncate">${cardData.name}</div>
                <div class="text-[11px] text-emerald-700 font-extrabold mt-0.5">${Number(cardData.price).toLocaleString('vi-VN')} đ</div>
              </div>
              <button onclick="showProductDetailView('${cardData.sku}')" type="button" class="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-extrabold flex items-center gap-1 transition flex-shrink-0">
                <span class="material-symbols-outlined text-sm">visibility</span>
                <span>${isEN ? 'View Details' : 'Xem Chi Tiết'}</span>
              </button>
            </div>
          `;
        }

        let actionBtns = '';
        if (actions && actions.length > 0) {
          actionBtns = `
            <div class="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-200/60">
              ${actions.map(act => `
                <button onclick="${act.onClick}" type="button" class="px-3 py-1.5 rounded-xl ${act.btnClass || 'bg-slate-800 text-white'} text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:scale-102 transition">
                  <span class="material-symbols-outlined text-sm">${act.icon || 'bolt'}</span>
                  <span>${act.label}</span>
                </button>
              `).join('')}
            </div>
          `;
        }

        msgDiv.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00204a] to-cyan-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <span class="material-symbols-outlined text-base">auto_awesome</span>
          </div>
          <div class="max-w-[85%] sm:max-w-[78%] bg-slate-50 text-slate-800 border border-slate-200/80 rounded-2xl rounded-tl-none p-4 shadow-sm text-xs sm:text-sm leading-relaxed">
            <div class="markdown-body space-y-2">${this.formatMarkdown(text)}</div>
            ${cardHtml}
            ${actionBtns}
            <span class="text-[10px] text-slate-400 block text-right mt-1.5">${timeStr}</span>
          </div>
        `;
      } else {
        msgDiv.innerHTML = `
          <div class="max-w-[85%] sm:max-w-[75%] bg-[#00204a] text-white rounded-2xl rounded-tr-none p-3.5 shadow-sm text-xs sm:text-sm leading-relaxed">
            <p>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            <span class="text-[10px] text-cyan-200/80 block text-right mt-1">${timeStr}</span>
          </div>
          <div class="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
            U
          </div>
        `;
      }

      container.appendChild(msgDiv);
      container.scrollTop = container.scrollHeight;
    },

    formatMarkdown(text) {
      if (!text) return '';
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');
    },

    sendUserMessage() {
      const input = document.getElementById('aiChatInput');
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      this.processMessage(text);
    },

    sendPresetPrompt(promptText) {
      this.processMessage(promptText);
    },

    processMessage(text) {
      this.appendMessage('user', text);
      const isEN = (typeof state !== 'undefined' && state.appLang === 'en');

      // Processing animation / delay
      setTimeout(() => {
        const lower = text.toLowerCase();

        // 1. Check if user is asking for Quote / Setup / Space layout
        const hasArea = lower.match(/(\d+)\s*(m2|m²|mét vuông|met vuong|sqm)/);
        const usdMatch = lower.match(/\$?\s*(\d+([.,]\d+)?)\s*(k|\$|usd)/);
        const vndMatch = lower.match(/(\d+([.,]\d+)?)\s*(tỷ|ty|tr|triệu|trieu|billion|million)/);
        const hasGymKeywords = /báo giá|setup|phòng gym|gym|layout|mặt bằng|quote|villa|resort|hotel|commercial|pilates|reformer|booty|glute|fitness|tạ|weights|free weight|thao dien|danang|đà nẵng|hà nội/i.test(lower);

        if (hasArea || usdMatch || vndMatch || hasGymKeywords) {
          // Detect project type & brand preferences first
          let projectType = 'commercial_gym';
          let brand = 'all';
          let defaultArea = 250;
          let defaultBudget = 2500000000;

          if (lower.includes('pilates') || lower.includes('reformer')) {
            projectType = 'pilates_studio';
            brand = 'merrithew';
            defaultArea = 120;
            defaultBudget = 1800000000;
          } else if (lower.includes('booty') || lower.includes('glute') || lower.includes('mông đùi')) {
            projectType = 'glute_hub';
            brand = 'bootybuilder';
            defaultArea = 100;
            defaultBudget = 1600000000;
          } else if (lower.includes('villa') || lower.includes('penthouse') || lower.includes('nhà riêng') || lower.includes('thao dien')) {
            projectType = 'villa_gym';
            brand = lower.includes('watson') ? 'watson' : 'precor';
            defaultArea = 120;
            defaultBudget = 1200000000;
          } else if (lower.includes('resort') || lower.includes('khách sạn') || lower.includes('hotel')) {
            projectType = 'hotel_resort';
            defaultArea = 180;
            defaultBudget = 2500000000;
          } else if (lower.includes('doanh nghiệp') || lower.includes('corporate')) {
            projectType = 'corporate_gym';
            defaultArea = 100;
            defaultBudget = 950000000;
          } else if (lower.includes('free weight') || lower.includes('ziva') || lower.includes('eleiko')) {
            brand = lower.includes('eleiko') ? 'eleiko' : 'ziva';
            defaultArea = 60;
            defaultBudget = 800000000;
          }

          if (lower.includes('precor')) brand = 'precor';
          else if (lower.includes('watson')) brand = 'watson';
          else if (lower.includes('ziva')) brand = 'ziva';
          else if (lower.includes('booty')) brand = 'bootybuilder';
          else if (lower.includes('woodway')) brand = 'woodway';
          else if (lower.includes('merrithew')) brand = 'merrithew';
          else if (lower.includes('eleiko')) brand = 'eleiko';

          let area = hasArea ? parseInt(hasArea[1], 10) : defaultArea;
          let budget = defaultBudget;

          if (usdMatch) {
            const num = parseFloat(usdMatch[1].replace(',', '.'));
            const mult = (usdMatch[3] === 'k' || lower.includes('k')) ? 1000 : 1;
            budget = Math.round(num * mult * 25450);
          } else if (vndMatch) {
            const num = parseFloat(vndMatch[1].replace(',', '.'));
            const unit = vndMatch[3];
            if (unit.includes('tỷ') || unit.includes('ty') || unit.includes('billion')) budget = Math.round(num * 1000000000);
            else if (unit.includes('tr') || unit.includes('triệu') || unit.includes('million')) budget = Math.round(num * 1000000);
          }

          let region = 'south';
          if (lower.includes('đà nẵng') || lower.includes('danang') || lower.includes('miền trung') || lower.includes('huế') || lower.includes('nha trang')) region = 'central';
          else if (lower.includes('hà nội') || lower.includes('hanoi') || lower.includes('miền bắc') || lower.includes('hải phòng') || lower.includes('quảng ninh')) region = 'north';
          else if (lower.includes('phú quốc') || lower.includes('đảo')) region = 'island';

          // Sync with state & UI inputs
          aiState.area = area;
          aiState.budget = budget;
          aiState.projectType = projectType;
          aiState.brand = brand;
          const elAreaInp = document.getElementById('aiAreaInput');
          const elAreaRng = document.getElementById('aiAreaRange');
          const elBudgInp = document.getElementById('aiBudgetInput');
          const elBudgRng = document.getElementById('aiBudgetRange');
          if (elAreaInp) elAreaInp.value = area;
          if (elAreaRng) elAreaRng.value = area;
          if (elBudgInp) elBudgInp.value = budget.toLocaleString('vi-VN');
          if (elBudgRng) elBudgRng.value = budget;

          // Generate quote package
          const proposal = generateAiQuotePackage({
            brand,
            projectType,
            area,
            budget,
            region,
            rigging: 'ground'
          });

          renderAiProposalDashboard(proposal);

          const responseText = isEN
            ? `I have analyzed your project requirement (${area}m² ${projectType.replace('_', ' ').toUpperCase()} in ${region.toUpperCase()} with budget ~${(budget/1000000000).toFixed(1)}B VND):\n\n` +
              `• **Optimal Scale**: ${proposal.total_units} machines across 5 ergonomic functional zones.\n` +
              `• **Space Density**: ${proposal.space_density_m2_per_unit} m²/unit (Perfect Attivo standard).\n` +
              `• **Peak Member Capacity**: ~${proposal.peak_member_capacity} simultaneous users.\n` +
              `• **Total Investment**: ${proposal.grand_total_vnd.toLocaleString('vi-VN')} VND (Includes VAT & localized shipping).\n\n` +
              `I have also automatically generated your **2D Floorplan CAD Layout** and **3D Space Walkthrough**. You can inspect or apply them below:`
            : `Tôi đã phân tích và lập phương án bố trí thiết bị tối ưu cho dự án của bạn (${area}m² mô hình ${projectType.replace('_', ' ').toUpperCase()} tại khu vực ${region.toUpperCase()} với ngân sách ~${(budget/1000000000).toFixed(1)} Tỷ):\n\n` +
              `• **Quy mô thiết bị**: ${proposal.total_units} thiết bị chủ lực phân bổ khoa học qua 5 phân khu.\n` +
              `• **Mật độ không gian**: ${proposal.space_density_m2_per_unit} m²/máy (Đạt chuẩn an toàn quốc tế Attivo 8-12 m²).\n` +
              `• **Sức chứa giờ cao điểm**: ~${proposal.peak_member_capacity} hội viên tập luyện cùng lúc.\n` +
              `• **Tổng mức đầu tư**: ${proposal.grand_total_vnd.toLocaleString('vi-VN')} đ (Đã gồm chiết khấu, VAT 10% & phí vận chuyển).\n\n` +
              `Hệ thống đã tự động dựng **Sơ Đồ Mặt Bằng 2D** và **Mô Hình 3D Xoay 360°** tương ứng. Bạn có thể kiểm tra ngay:`;

          const actions = [
            {
              label: isEN ? 'Apply to CPQ Builder' : 'Nạp Vào Báo Giá CPQ',
              icon: 'input',
              btnClass: 'bg-[#00204a] text-white hover:bg-blue-900',
              onClick: 'AttivoAiAdvisor.applyToBuilder()'
            },
            {
              label: isEN ? 'View 2D Floorplan' : 'Xem Bản Vẽ 2D',
              icon: 'architecture',
              btnClass: 'bg-cyan-700 text-white hover:bg-cyan-600',
              onClick: 'AttivoAiAdvisor.switchVisualizerSubTab(\'2d\'); document.getElementById(\'aiVisualizerSection\')?.scrollIntoView({behavior:\'smooth\'});'
            },
            {
              label: isEN ? 'View 3D Walkthrough' : 'Xem Mô Hình 3D',
              icon: 'view_in_ar',
              btnClass: 'bg-emerald-700 text-white hover:bg-emerald-600',
              onClick: 'AttivoAiAdvisor.switchVisualizerSubTab(\'3d\'); document.getElementById(\'aiVisualizerSection\')?.scrollIntoView({behavior:\'smooth\'});'
            },
            {
              label: isEN ? 'Export Excel (.xlsx)' : 'Xuất File Excel',
              icon: 'table_view',
              btnClass: 'bg-slate-700 text-white hover:bg-slate-600',
              onClick: 'AttivoAiAdvisor.exportExcel()'
            }
          ];

          this.appendMessage('ai', responseText, null, actions);
          return;
        }

        // 2. Check if user is asking about a specific Product / SKU / Feature
        let matchedProd = null;
        const queryTerm = lower.replace(/(thông số|tính năng|giá|máy|tìm|xem|mua|hỏi về|tính năng)/g, '').trim();

        if (Array.isArray(window.__CPQ_PRODUCTS__)) {
          matchedProd = window.__CPQ_PRODUCTS__.find(p => 
            p.sku && (lower.includes(p.sku.toLowerCase()) || queryTerm.includes(p.sku.toLowerCase())) ||
            p.name && (lower.includes(p.name.toLowerCase()) || queryTerm.includes(p.name.toLowerCase()))
          );
        }

        // Fallback search in catalog if not found
        if (!matchedProd) {
          if (lower.includes('trm 885') || lower.includes('trm885')) {
            matchedProd = {
              sku: 'PRC-TRM885',
              brand: 'Precor',
              name: 'Máy Chạy Bộ Thương Mại Precor TRM 885 Màn Hình Cảm Ứng P82',
              price: 368000000,
              image_url: 'https://attivointl.com/wp-content/uploads/2026/03/Precor-Treadmills.webp',
              specs: 'Động cơ AC 4.0HP đỉnh 8.0HP, tốc độ 0.8-25.5 km/h, độ dốc -3% đến 15%, công nghệ đệm hấp thụ chấn IFT™ & GFX™ bảo vệ khớp gối, màn hình cảm ứng 15.6 inch P82 kết nối Preva Network.'
            };
          } else if (lower.includes('trm 731') || lower.includes('trm731')) {
            matchedProd = {
              sku: 'PRC-TRM731',
              brand: 'Precor',
              name: 'Máy Chạy Bộ Thương Mại Precor TRM 731 Console P31',
              price: 268000000,
              image_url: 'https://attivointl.com/wp-content/uploads/2026/03/Precor-Treadmills.webp',
              specs: 'Dòng máy chạy chuyên nghiệp Series 700, động cơ 3.0HP tiết kiệm điện, bảng điều khiển LED P31 trực quan, công nghệ IFT và GFX giảm chấn cao cấp.'
            };
          } else if (lower.includes('booty builder') || lower.includes('hip thrust')) {
            matchedProd = {
              sku: 'BB-PLATINUM',
              brand: 'Booty Builder',
              name: 'Máy Đẩy Hông Chuyên Nghiệp Booty Builder Platinum V4',
              price: 185000000,
              image_url: 'https://attivointl.com/wp-content/uploads/2026/03/booty_builder_platinum_v4.png',
              specs: 'Thiết bị Hip Thrust độc quyền từ Na Uy, đai an toàn chịu lực 500kg, tích hợp cọc gắn dây kháng lực Bands, cô lập tối đa cơ mông lớn không gây đau lưng dưới.'
            };
          } else if (lower.includes('ziva') || lower.includes('tạ đơn') || lower.includes('dumbbell')) {
            matchedProd = {
              sku: 'ZIVA-SL-HEX-SET',
              brand: 'ZIVA',
              name: 'Bộ Tạ Tay Cao Su ZIVA SL Urethane Hex Dumbbell (2.5kg - 50kg)',
              price: 185000000,
              image_url: 'https://attivointl.com/wp-content/uploads/2026/03/ziva_dumbbell_set_luxury.png',
              specs: 'Urethane đúc nguyên khối chống va đập vỡ vụn, tay cầm thép mạ Chrome vân kim cương chống trượt, độ bền trên 10 năm trong môi trường gym thương mại.'
            };
          } else if (lower.includes('topflor') || lower.includes('sàn cao su') || lower.includes('flooring')) {
            matchedProd = {
              sku: 'TOPFLOR-RUBBER-20',
              brand: 'Topflor',
              name: 'Gạch Cao Su Giảm Chấn Chuyên Dụng Topflor High-Impact 20mm',
              price: 680000,
              image_url: 'https://attivointl.com/wp-content/uploads/2026/03/topflor_rubber_tiles_gym.png',
              specs: 'Độ dày 20mm chống chấn tiếng ồn thả tạ nặng, bề mặt hạt EPDM mịn chống trơn trượt, kích thước 50x50cm đạt chuẩn an toàn phòng cháy và môi trường.'
            };
          }
        }

        if (matchedProd) {
          const detailMsg = isEN
            ? `Here is the technical overview of **${matchedProd.name}** (${matchedProd.sku}):\n\n` +
              `• **Brand**: ${matchedProd.brand}\n` +
              `• **Highlight Specs**: ${matchedProd.specs || 'Genuine Attivo imported line.'}\n` +
              `• **Target Zone**: Commercial Gym, Hotel Resort, Luxury Private Gym.\n` +
              `• **Official Warranty**: 24 months genuine warranty + periodic maintenance by Attivo International engineers.\n\n` +
              `Click the button below to view full 3D CAD dimensions, technical manual, and reserve warehouse inventory:`
            : `Thông tin kỹ thuật chi tiết của thiết bị **${matchedProd.name}** (Mã SKU: ${matchedProd.sku}):\n\n` +
              `• **Thương hiệu**: ${matchedProd.brand} (Nhập khẩu chính hãng độc quyền)\n` +
              `• **Tính năng nổi bật**: ${matchedProd.specs || 'Dòng thiết bị cao cấp đạt chuẩn cơ sinh học quốc tế.'}\n` +
              `• **Phù hợp cho**: Gym thương mại 24/7, Biệt thự VIP, Khách sạn 5 sao, Studio Pilates.\n` +
              `• **Chế độ bảo hành**: 24 tháng chính hãng + bảo dưỡng định kỳ tận nơi bởi kỹ sư Attivo International.\n\n` +
              `Bạn có thể bấm vào thẻ bên dưới để xem toàn bộ thông số kích thước, hướng dẫn sử dụng và kiểm tra tồn kho giữ chỗ:`;

          const card = {
            sku: matchedProd.sku,
            brand: matchedProd.brand,
            name: matchedProd.name,
            price: matchedProd.price || matchedProd.base_price || 0,
            image_url: matchedProd.image_url || matchedProd.image || 'assets/extracted/evn_r08_c07_2.png'
          };

          this.appendMessage('ai', detailMsg, card, [
            {
              label: isEN ? 'View Product Details' : 'Xem Chi Tiết & Tồn Kho',
              icon: 'open_in_new',
              btnClass: 'bg-cyan-700 text-white hover:bg-cyan-600',
              onClick: `showProductDetailView('${matchedProd.sku}')`
            }
          ]);
          return;
        }

        // 3. Fallback General Fitness Consultation
        const generalMsg = isEN
          ? "Thank you for contacting Attivo! As a specialized luxury fitness distributor, we can help you with:\n\n" +
            "1. **Full Turnkey Quotations**: Provide your floor area (e.g. 200m²), target budget, and city.\n" +
            "2. **Product Inquiries**: Ask about any SKU or brand (Precor, Watson, ZIVA, Booty Builder, Woodway, Merrithew, Topflor).\n" +
            "3. **Floorplan & 3D Visualizer**: Generate 2D CAD layouts and interactive 3D rooms to present to your clients!"
          : "Cảm ơn bạn đã nhắn tin cho Attivo International! Là đơn vị tư vấn và phân phối thiết bị thể thao cao cấp hàng đầu Việt Nam, tôi có thể hỗ trợ bạn ngay:\n\n" +
            "1. **Lên Báo Giá Trọn Gói**: Nhập diện tích sàn (VD: 250m²), ngân sách dự kiến, và tỉnh thành lắp đặt.\n" +
            "2. **Tra Cứu Thiết Bị**: Hỏi về bất kỳ dòng máy nào của Precor, Watson, ZIVA, Booty Builder, Woodway, Merrithew, Topflor.\n" +
            "3. **Bản Vẽ 2D & Phối Cảnh 3D**: Tự động sinh sơ đồ mặt bằng và không gian 3D để bạn gửi khách hàng chốt deal nhanh!";

        this.appendMessage('ai', generalMsg);
      }, 400);
    }
  };

  // =========================================================================
// =========================================================================
  // MODULE: ATTIVO 2D ARCHITECTURAL FLOORPLAN CAD ENGINE (PRO STANDARD)
  // =========================================================================
  const AttivoVisualizer2D = {
    drawFloorplan(proposal) { return this.render(proposal); },
    render(proposal) {
      const canvas = document.getElementById('aiFloorplanCanvas');
      if (!canvas) return;

      const p = proposal || aiState.currentProposal;
      if (!p) return;

      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const isEN = (typeof state !== 'undefined' && state.appLang === 'en');

      // 1. Clear & Architectural Blueprint Grid Background
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // 500mm / 1000mm Metric Architectural CAD Grid
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // 2. Room Dimensions & Outer Structural Wall
      const margin = 38;
      const roomW = w - margin * 2;
      const roomH = h - margin * 2 - 38; // reserve bottom 38px for CAD Title Block

      // Heavy Structural Outer Walls (Black Slate 0f172a)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.strokeRect(margin, margin, roomW, roomH);

      // Inner structural cavity line (double wall CAD standard)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(margin + 5, margin + 5, roomW - 10, roomH - 10);

      // 3. Architectural Title Block (Khung tên bản vẽ chuẩn CAD)
      const tbY = margin + roomH + 8;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(margin, tbY, roomW, 30);
      ctx.strokeStyle = '#00204a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(margin, tbY, roomW, 30);

      // Dividers inside title block
      ctx.beginPath();
      ctx.moveTo(margin + roomW * 0.28, tbY); ctx.lineTo(margin + roomW * 0.28, tbY + 30);
      ctx.moveTo(margin + roomW * 0.58, tbY); ctx.lineTo(margin + roomW * 0.58, tbY + 30);
      ctx.moveTo(margin + roomW * 0.82, tbY); ctx.lineTo(margin + roomW * 0.82, tbY + 30);
      ctx.stroke();

      ctx.fillStyle = '#00204a';
      ctx.font = 'bold 9px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(isEN ? 'ATTIVO INTERNATIONAL ARCHITECTURAL CAD' : 'BẢN VẼ BỐ TRÍ MẶT BẰNG ATTIVO CPQ', margin + 8, tbY + 13);
      ctx.fillStyle = '#64748b';
      ctx.font = '700 8px monospace';
      ctx.fillText(isEN ? `PROJECT: ${p.clientName || 'COMMERCIAL FITNESS FACILITY'}` : `DỰ ÁN: ${p.clientName || 'PHÒNG GYM CHUYÊN NGHIỆP'}`, margin + 8, tbY + 24);

      ctx.fillStyle = '#00204a';
      ctx.font = 'bold 9px Montserrat, sans-serif';
      ctx.fillText(isEN ? `TYPE: ${(p.projectTypeName_en || p.projectType || 'COMMERCIAL').toUpperCase()}` : `LOẠI: ${(p.projectTypeName || p.projectType || 'THƯƠNG MẠI').toUpperCase()}`, margin + roomW * 0.28 + 8, tbY + 13);
      ctx.fillStyle = '#64748b';
      ctx.font = '700 8px monospace';
      ctx.fillText(isEN ? `FLOOR AREA: ${p.area} M² • SCALE 1:50 METRIC` : `DIỆN TÍCH: ${p.area} M² • TỶ LỆ 1:50 CHUẨN`, margin + roomW * 0.28 + 8, tbY + 24);

      ctx.fillStyle = '#00204a';
      ctx.font = 'bold 9px Montserrat, sans-serif';
      ctx.fillText(isEN ? 'BIOMECHANICAL COMPLIANCE' : 'TIÊU CHUẨN AN TOÀN QUỐC TẾ', margin + roomW * 0.58 + 8, tbY + 13);
      ctx.fillStyle = '#059669';
      ctx.font = '700 8px Montserrat, sans-serif';
      ctx.fillText(isEN ? '✓ CORRIDORS ≥ 1,500MM • SPACING ≥ 500MM' : '✓ HÀNH LANG ≥ 1.500MM • KHOẢNG CÁCH ≥ 500MM', margin + roomW * 0.58 + 8, tbY + 24);

      ctx.fillStyle = '#0284c7';
      ctx.font = '800 9px monospace';
      ctx.fillText(isEN ? 'REV 2.6 [APPROVED]' : 'BẢN VẼ: REV 2.6', margin + roomW * 0.82 + 8, tbY + 19);

      // 4. Exterior Dimension Strings (Đường gióng kích thước CAD)
      ctx.strokeStyle = '#64748b';
      ctx.fillStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.font = 'bold 10px Montserrat, monospace';
      ctx.textAlign = 'center';

      // Top Wall Dimension
      const roomLengthM = Math.round(Math.sqrt(p.area * 1.6) * 10) / 10;
      const roomWidthM = Math.round((p.area / roomLengthM) * 10) / 10;
      const lengthMm = Math.round(roomLengthM * 1000);
      const widthMm = Math.round(roomWidthM * 1000);

      // Dimension line top
      ctx.beginPath();
      ctx.moveTo(margin, margin - 15); ctx.lineTo(margin + roomW, margin - 15);
      ctx.moveTo(margin, margin - 20); ctx.lineTo(margin, margin - 10);
      ctx.moveTo(margin + roomW, margin - 20); ctx.lineTo(margin + roomW, margin - 10);
      ctx.stroke();
      ctx.fillText(isEN ? `${lengthMm.toLocaleString()} mm (${roomLengthM} m)` : `${lengthMm.toLocaleString()} mm (${roomLengthM} m)`, margin + roomW / 2, margin - 18);

      // Dimension line left
      ctx.save();
      ctx.translate(margin - 16, margin + roomH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(-roomH / 2, 0); ctx.lineTo(roomH / 2, 0);
      ctx.moveTo(-roomH / 2, -5); ctx.lineTo(-roomH / 2, 5);
      ctx.moveTo(roomH / 2, -5); ctx.lineTo(roomH / 2, 5);
      ctx.stroke();
      ctx.fillText(isEN ? `${widthMm.toLocaleString()} mm (${roomWidthM} m)` : `${widthMm.toLocaleString()} mm (${roomWidthM} m)`, 0, -5);
      ctx.restore();

      // 5. Architectural Doors & Windows (Cửa ra vào & Cửa kính)
      // Glass Curtain Wall on Top (Light cyan with mullions)
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(margin + 40, margin - 4, roomW * 0.45, 8);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(margin + 40, margin - 4, roomW * 0.45, 8);
      ctx.fillStyle = '#0284c7';
      ctx.font = '800 8px Montserrat, sans-serif';
      ctx.fillText(isEN ? 'CURTAIN WALL GLAZING (EXTERIOR SCENIC VIEW)' : 'VÁCH KÍNH CƯỜNG LỰC NGOẠI CẢNH', margin + 40 + (roomW * 0.45) / 2, margin - 8);

      // Entrance Door on Bottom Right with 90° Swing Arc (Cửa mở quay 90 độ)
      const doorX = margin + roomW - 90;
      const doorY = margin + roomH;
      const doorWidth = 55;
      // Opening
      ctx.clearRect(doorX - 2, doorY - 3, doorWidth + 4, 6);
      // Door leaf (Cánh cửa)
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(doorX, doorY); ctx.lineTo(doorX, doorY - doorWidth); ctx.stroke();
      // Swing arc (Đường cong góc mở cửa)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.arc(doorX, doorY, doorWidth, -Math.PI / 2, 0, false); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#059669';
      ctx.font = '800 8px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(isEN ? 'MAIN ENTRANCE (2,000mm)' : 'CỬA VÀO CHÍNH (2.000mm)', doorX - 60, doorY - 8);

      // 6. DYNAMIC EQUIPMENT LAYOUT BASED ON proposal.items
      this.drawDynamicEquipment(ctx, margin, margin, roomW, roomH, p, isEN);
    },

    drawDynamicEquipment(ctx, ox, oy, rw, rh, p, isEN) {
      const items = p.items || [];
      const pType = p.projectType || 'commercial_gym';

      if (pType === 'pilates_studio') {
        this.drawPilatesLayout(ctx, ox, oy, rw, rh, items, isEN);
      } else if (pType === 'recovery_lounge') {
        this.drawRecoveryLayout(ctx, ox, oy, rw, rh, items, isEN);
      } else {
        this.drawFitnessFacilityLayout(ctx, ox, oy, rw, rh, items, isEN, pType);
      }
    },

    drawFitnessFacilityLayout(ctx, ox, oy, rw, rh, items, isEN, pType) {
      // 1. Define 4 Ergonomic Zones based on Room Dimensions
      const cardioW = rw * 0.30;
      const strengthW = rw * 0.36;
      const freeW = rw * 0.34;

      // Zone 1: Cardio Zone (Left alongside Glass Wall)
      ctx.fillStyle = 'rgba(2, 132, 199, 0.04)';
      ctx.fillRect(ox + 8, oy + 8, cardioW - 16, rh - 16);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(ox + 8, oy + 8, cardioW - 16, rh - 16);
      ctx.setLineDash([]);
      ctx.fillStyle = '#0284c7';
      ctx.font = '800 9px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(isEN ? 'ZONE 1: CARDIO MATRIX (CURTAIN WALL VIEW)' : 'PHÂN KHU 1: CARDIO MATRIX (HƯỚNG KÍNH NGOẠI CẢNH)', ox + 14, oy + 22);

      // Zone 2: Strength & Selectorized (Center Upper)
      const stH = rh * 0.52;
      ctx.fillStyle = 'rgba(30, 58, 138, 0.04)';
      ctx.fillRect(ox + cardioW, oy + 8, strengthW - 12, stH);
      ctx.strokeStyle = '#1e3a8a';
      ctx.strokeRect(ox + cardioW, oy + 8, strengthW - 12, stH);
      ctx.fillStyle = '#1e3a8a';
      ctx.fillText(isEN ? 'ZONE 2: SELECTORIZED & PIN-LOADED' : 'PHÂN KHU 2: THIẾT BỊ KHỐI TẠ (PIN-LOADED)', ox + cardioW + 8, oy + 22);

      // Zone 3: Free Weights & Racks (Right Upper - 20mm Rubber Floor)
      ctx.fillStyle = 'rgba(217, 119, 6, 0.05)';
      ctx.fillRect(ox + cardioW + strengthW, oy + 8, freeW - 8, stH);
      ctx.strokeStyle = '#d97706';
      ctx.strokeRect(ox + cardioW + strengthW, oy + 8, freeW - 8, stH);
      ctx.fillStyle = '#d97706';
      ctx.fillText(isEN ? 'ZONE 3: FREE WEIGHTS (20MM RUBBER FLOOR)' : 'PHÂN KHU 3: TẠ TỰ DO (SÀN CAO SU 20MM)', ox + cardioW + strengthW + 8, oy + 22);

      // Zone 4: Functional Turf & Glute Hub (Lower Center & Right)
      const lowH = rh - stH - 24;
      const lowY = oy + stH + 16;
      ctx.fillStyle = 'rgba(5, 150, 105, 0.06)';
      ctx.fillRect(ox + cardioW, lowY, rw - cardioW - 8, lowH);
      ctx.strokeStyle = '#059669';
      ctx.strokeRect(ox + cardioW, lowY, rw - cardioW - 8, lowH);
      ctx.fillStyle = '#059669';
      ctx.fillText(isEN ? 'ZONE 4: FUNCTIONAL ATHLETIC TURF & GLUTE HUB' : 'PHÂN KHU 4: CỎ THỂ LỰC FUNCTIONAL & GLUTE HUB', ox + cardioW + 8, lowY + 16);

      // Main Circulation Corridor Line (Hành lang đi lại chính 1.500mm)
      const corX = ox + cardioW - 8;
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(corX, oy + 12);
      ctx.lineTo(corX, oy + rh - 12);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.save();
      ctx.translate(corX + 12, oy + rh / 2);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#0284c7';
      ctx.font = '800 8.5px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isEN ? 'MAIN CIRCULATION AISLE (1,500MM CLEAR WALKWAY)' : 'HÀNH LANG LƯU THÔNG CHÍNH (RỘNG 1.500MM)', 0, 0);
      ctx.restore();

      // DYNAMIC PLACEMENT OF ACTUAL ITEMS FROM proposal.items
      let cardioY = oy + 36;
      let strengthX = ox + cardioW + 12;
      let strengthY = oy + 36;
      let freeX = ox + cardioW + strengthW + 12;
      let freeY = oy + 36;
      let funcX = ox + cardioW + 14;
      let funcY = lowY + 28;

      items.forEach((it, idx) => {
        const sku = it.sku || '';
        const name = (it.name || '').toLowerCase();
        const cat = it.category || '';
        const zone = it.zone || '';
        const qty = it.quantity || 1;

        // CARDIO PLACEMENT
        if (zone.includes('Cardio') || cat === 'equipment' && (name.includes('chạy bộ') || name.includes('treadmill') || name.includes('bike') || name.includes('đạp') || name.includes('elliptical') || name.includes('rower') || name.includes('chèo'))) {
          const isTread = name.includes('treadmill') || name.includes('chạy') || sku.includes('TRM');
          const isBike = name.includes('bike') || name.includes('đạp') || sku.includes('UBK') || sku.includes('RBK');
          const isRow = name.includes('rower') || name.includes('chèo') || sku.includes('ROW');

          for (let q = 0; q < Math.min(qty, 4); q++) {
            if (cardioY + 50 > oy + rh - 20) break;
            if (isTread) {
              this.drawCadTreadmill(ctx, ox + 22, cardioY, 68, 38, it, idx + 1, isEN);
              cardioY += 52;
            } else if (isBike) {
              this.drawCadBike(ctx, ox + 26, cardioY, 56, 32, it, idx + 1, isEN);
              cardioY += 44;
            } else if (isRow) {
              this.drawCadRower(ctx, ox + 20, cardioY, 74, 30, it, idx + 1, isEN);
              cardioY += 46;
            } else {
              this.drawCadElliptical(ctx, ox + 22, cardioY, 68, 36, it, idx + 1, isEN);
              cardioY += 50;
            }
          }
        }
        // STRENGTH SELECTORIZED
        else if (zone.includes('Strength') || name.includes('press') || name.includes('pulldown') || name.includes('cable') || name.includes('kéo') || name.includes('ép')) {
          for (let q = 0; q < Math.min(qty, 2); q++) {
            if (strengthX + 75 > ox + cardioW + strengthW - 14) {
              strengthX = ox + cardioW + 12;
              strengthY += 62;
            }
            if (strengthY + 55 < lowY) {
              this.drawCadSelectorized(ctx, strengthX, strengthY, 70, 52, it, idx + 1, isEN);
              strengthX += 78;
            }
          }
        }
        // FREE WEIGHTS & RACKS
        else if (zone.includes('Free') || name.includes('rack') || name.includes('bench') || name.includes('dumbbell') || name.includes('tạ') || name.includes('gánh') || name.includes('ghế')) {
          const isRack = name.includes('rack') || name.includes('gánh');
          const isBench = name.includes('bench') || name.includes('ghế');
          const isDb = name.includes('dumbbell') || name.includes('bộ tạ tay');

          for (let q = 0; q < Math.min(qty, 2); q++) {
            if (isRack) {
              this.drawCadPowerRack(ctx, freeX, freeY, 65, 58, it, idx + 1, isEN);
              freeX += 72;
            } else if (isBench) {
              if (freeX + 60 > ox + rw - 14) { freeX = ox + cardioW + strengthW + 12; freeY += 60; }
              this.drawCadBench(ctx, freeX, freeY, 56, 46, it, idx + 1, isEN);
              freeX += 64;
            } else if (isDb) {
              this.drawCadDumbbellRack(ctx, ox + cardioW + strengthW + 12, oy + stH - 32, freeW - 32, 24, it, idx + 1, isEN);
            }
          }
        }
        // GLUTE & FUNCTIONAL ZONE
        else {
          if (funcX + 110 < ox + rw - 14) {
            this.drawCadSpecialist(ctx, funcX, funcY, 95, 48, it, idx + 1, isEN);
            funcX += 105;
          }
        }
      });

      // Athletic sprint track marking on Zone 4 turf
      this.drawTurfSprintLanes(ctx, ox + cardioW + 10, lowY + lowH - 30, rw - cardioW - 28, 22, isEN);
    },

    drawPilatesLayout(ctx, ox, oy, rw, rh, items, isEN) {
      // Canadian Maple Hardwood Floor (Warm amber pattern)
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(ox + 8, oy + 8, rw - 16, rh - 16);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.strokeRect(ox + 8, oy + 8, rw - 16, rh - 16);

      ctx.fillStyle = '#92400e';
      ctx.font = '800 10px Montserrat, sans-serif';
      ctx.fillText(isEN ? 'MERRITHEW PILATES CLINICAL & BOUTIQUE STUDIO (SPRING RESISTANCE)' : 'STUDIO PILATES CHUYÊN NGHIỆP MERRITHEW CANADA', ox + 16, oy + 24);

      let refX = ox + 30;
      let refY = oy + 45;
      items.forEach((it, idx) => {
        const name = (it.name || '').toLowerCase();
        const qty = it.quantity || 1;
        const isCadillac = name.includes('cadillac') || name.includes('trapeze');

        for (let q = 0; q < Math.min(qty, 6); q++) {
          if (isCadillac) {
            this.drawCadCadillac(ctx, ox + rw - 110, oy + 45, 90, 60, it, idx + 1, isEN);
          } else {
            if (refX + 75 > ox + rw - 130) { refX = ox + 30; refY += 75; }
            this.drawCadReformer(ctx, refX, refY, 70, 48, it, idx + 1, isEN);
            refX += 82;
          }
        }
      });
    },

    drawRecoveryLayout(ctx, ox, oy, rw, rh, items, isEN) {
      // Slate Spa Ambient Layout
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(ox + 8, oy + 8, rw - 16, rh - 16);
      ctx.fillStyle = '#0369a1';
      ctx.font = '800 10px Montserrat, sans-serif';
      ctx.fillText(isEN ? 'BIOHACKING & VIP RECOVERY LOUNGE (COLD PLUNGE & INFRARED)' : 'KHU PHỤC HỒI & BIOHACKING SKELCORE VIP', ox + 16, oy + 24);

      let rx = ox + 30;
      items.forEach((it, idx) => {
        const name = (it.name || '').toLowerCase();
        const isSauna = name.includes('sauna') || name.includes('xông');
        if (isSauna) {
          this.drawCadSaunaCabin(ctx, ox + rw - 140, oy + 45, 110, 80, it, idx + 1, isEN);
        } else {
          this.drawCadColdPlunge(ctx, rx, oy + 50, 85, 60, it, idx + 1, isEN);
          rx += 105;
        }
      });
    },

    // --- ACCREDITED 2D CAD FITMENT SYMBOLS ---
    drawCadTreadmill(ctx, x, y, w, h, it, num, isEN) {
      // Rear Safety Clearance Zone (Vùng an toàn thoát hiểm ≥ 1,500mm)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(x, y + h, w, 22);
      // Diagonal warning hatch lines
      for (let hx = x + 4; hx < x + w; hx += 8) {
        ctx.beginPath(); ctx.moveTo(hx, y + h); ctx.lineTo(hx - 6, y + h + 22); ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle = '#d97706';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('1,500mm CLEAR', x + w / 2, y + h + 14);

      // Outer Deck Frame
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);

      // Running Belt with Center Stride Line
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 8, y + 4, w - 16, h - 8);
      ctx.strokeStyle = '#475569';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(x + 8, y + h / 2); ctx.lineTo(x + w - 8, y + h / 2); ctx.stroke();
      ctx.setLineDash([]);

      // Dual Handrail uprights & Console head (Hộp màn hình cảm ứng)
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + w - 10, y + 6, 8, h - 12);
      ctx.strokeStyle = '#0369a1';
      ctx.strokeRect(x + w - 10, y + 6, 8, h - 12);

      // Number badge & Model label
      this.drawBadge(ctx, x + 10, y + 10, num);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(it.sku || 'TRM 885', x + 18, y + 12);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 7px monospace';
      ctx.fillText('2170×940 mm', x + 18, y + 23);
    },

    drawCadBike(ctx, x, y, w, h, it, num, isEN) {
      // Oval stabilization base
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill(); ctx.stroke();

      // Front Flywheel circle
      ctx.fillStyle = '#0284c7';
      ctx.beginPath(); ctx.arc(x + w - 14, y + h / 2, 9, 0, Math.PI * 2); ctx.fill();

      // Pedals left & right
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + w / 2 - 2, y + 2, 4, 6);
      ctx.fillRect(x + w / 2 - 2, y + h - 8, 4, 6);

      // Saddle seat
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.roundRect(x + 8, y + h / 2 - 6, 12, 12, 4); ctx.fill();

      // Handlebars
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w - 6, y + 8); ctx.lineTo(x + w - 14, y + h / 2); ctx.lineTo(x + w - 6, y + h - 8);
      ctx.stroke();

      this.drawBadge(ctx, x + 8, y + 8, num);
      ctx.fillStyle = '#00204a';
      ctx.font = 'bold 7.5px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(it.sku || 'BIKE', x + 18, y + 10);
    },

    drawCadElliptical(ctx, x, y, w, h, it, num, isEN) {
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);

      // Dual footplate pedals
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 10, y + 5, 26, 10);
      ctx.fillRect(x + 10, y + h - 15, 26, 10);

      // Front flywheel and linkage arms
      ctx.fillStyle = '#0284c7';
      ctx.beginPath(); ctx.arc(x + w - 12, y + h / 2, 10, 0, Math.PI * 2); ctx.fill();

      this.drawBadge(ctx, x + 6, y + 6, num);
      ctx.fillStyle = '#00204a';
      ctx.font = 'bold 7.5px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(it.sku || 'EFX', x + 16, y + 10);
    },

    drawCadRower(ctx, x, y, w, h, it, num, isEN) {
      // Long Monorail
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#00204a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x + 10, y + h / 2 - 3, w - 24, 6); // monorail beam

      // Sliding seat
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 22, y + h / 2 - 8, 14, 16);

      // Flywheel cage on right
      ctx.fillStyle = '#00204a';
      ctx.beginPath(); ctx.arc(x + w - 12, y + h / 2, 12, 0, Math.PI * 2); ctx.fill();

      this.drawBadge(ctx, x + 6, y + 6, num);
      ctx.fillStyle = '#00204a';
      ctx.font = 'bold 7.5px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(it.sku || 'ROWER', x + 16, y + 10);
    },

    drawCadSelectorized(ctx, x, y, w, h, it, num, isEN) {
      // Operating envelope (vùng an toàn chuyển động cần xoay)
      ctx.strokeStyle = 'rgba(30, 58, 138, 0.25)';
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(x - 4, y - 4, w + 8, h + 8);
      ctx.setLineDash([]);

      // Machine Base
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);

      // Weight Stack Tower on Top/Side (Khối tạ có các vạch chia lá tạ)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, w, 14);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      for (let sx = x + 4; sx < x + w - 4; sx += 6) {
        ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx, y + 14); ctx.stroke();
      }

      // Seat Cushion
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath(); ctx.roundRect(x + w / 2 - 12, y + 20, 24, 22, 4); ctx.fill();

      // Lever Press Arms
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 24); ctx.lineTo(x + w / 2 - 14, y + 28);
      ctx.moveTo(x + w - 8, y + 24); ctx.lineTo(x + w / 2 + 14, y + 28);
      ctx.stroke();

      this.drawBadge(ctx, x + 6, y + 18, num);
      ctx.fillStyle = '#00204a';
      ctx.font = 'bold 7.5px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(it.sku || 'CHEST PRESS', x + 16, y + 22);
      ctx.fillStyle = '#64748b';
      ctx.font = '600 6.5px monospace';
      ctx.fillText(it.brand || 'Precor', x + 16, y + 30);
    },

    drawCadPowerRack(ctx, x, y, w, h, it, num, isEN) {
      // 4 Heavy Upright Columns (75x75mm Steel Posts)
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Upright corners
      ctx.fillStyle = '#d97706';
      const sz = 8;
      ctx.fillRect(x, y, sz, sz);
      ctx.fillRect(x + w - sz, y, sz, sz);
      ctx.fillRect(x, y + h - sz, sz, sz);
      ctx.fillRect(x + w - sz, y + h - sz, sz, sz);

      // Full 2,200mm Olympic Barbell across J-Cups
      const barY = y + h / 2;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x - 10, barY); ctx.lineTo(x + w + 10, barY); ctx.stroke();

      // Colored Olympic Bumper Plates on Sleeves
      ctx.fillStyle = '#dc2626'; // Red 25kg
      ctx.fillRect(x - 12, barY - 8, 4, 16);
      ctx.fillRect(x + w + 8, barY - 8, 4, 16);
      ctx.fillStyle = '#2563eb'; // Blue 20kg
      ctx.fillRect(x - 16, barY - 7, 3, 14);
      ctx.fillRect(x + w + 13, barY - 7, 3, 14);

      this.drawBadge(ctx, x + 6, y + 8, num);
      ctx.fillStyle = '#00204a';
      ctx.font = 'bold 8px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(it.sku || 'POWER RACK', x + 16, y + 12);
      ctx.fillStyle = '#d97706';
      ctx.font = '600 7px monospace';
      ctx.fillText('2.2M OLYMPIC BAR', x + 16, y + 22);
    },

    drawCadBench(ctx, x, y, w, h, it, num, isEN) {
      // Padded Incline Bench Pad
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill(); ctx.stroke();

      // Backrest Pad
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.roundRect(x + w / 2 - 10, y + 6, 20, 26, 3); ctx.fill();
      // Seat Pad
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.roundRect(x + w / 2 - 9, y + 34, 18, 10, 2); ctx.fill();

      this.drawBadge(ctx, x + 4, y + 6, num);
      ctx.fillStyle = '#00204a';
      ctx.font = 'bold 7px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(it.sku || 'FID BENCH', x + 14, y + 10);
    },

    drawCadDumbbellRack(ctx, x, y, w, h, it, num, isEN) {
      // Long Angled Double Tier Storage Shelf
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);

      // Row of Hexagonal Dumbbells pairs
      ctx.fillStyle = '#e2e8f0';
      for (let dx = x + 16; dx < x + w - 16; dx += 18) {
        // Dumbbell bells left and right
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(dx - 5, y + 4, 3, 6);
        ctx.fillRect(dx + 2, y + 4, 3, 6);
        ctx.fillRect(dx - 5, y + h - 10, 3, 6);
        ctx.fillRect(dx + 2, y + h - 10, 3, 6);
        // Handle bar
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(dx - 2, y + 7); ctx.lineTo(dx + 2, y + 7);
        ctx.moveTo(dx - 2, y + h - 7); ctx.lineTo(dx + 2, y + h - 7);
        ctx.stroke();
      }

      this.drawBadge(ctx, x + 4, y + 4, num);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7.5px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(isEN ? 'COMMERCIAL DUMBBELL SADDLE RACK' : 'GIÁ TẠ ĐÔI CAO CẤP', x + 14, y + 8);
    },

    drawCadSpecialist(ctx, x, y, w, h, it, num, isEN) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = '#059669';
      ctx.fillRect(x, y, w, 4);

      this.drawBadge(ctx, x + 6, y + 8, num);
      ctx.fillStyle = '#00204a';
      ctx.font = 'bold 8px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(it.sku || 'GLUTE / SPECIALIST', x + 16, y + 12);
      ctx.fillStyle = '#64748b';
      ctx.font = '600 7px monospace';
      ctx.fillText(it.brand || 'Booty Builder', x + 16, y + 22);
    },

    drawCadReformer(ctx, x, y, w, h, it, num, isEN) {
      // Canadian Maple Wood Outer Frame
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);

      // Sliding Carriage (Padded leather bed)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.fillRect(x + 16, y + 6, 34, h - 12);
      ctx.strokeRect(x + 16, y + 6, 34, h - 12);

      // Shoulder Rests
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 18, y + 8, 6, 8);
      ctx.fillRect(x + 18, y + h - 16, 6, 8);

      // Tubular Chrome Footbar
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x + w - 6, y + 4); ctx.lineTo(x + w - 6, y + h - 4); ctx.stroke();

      this.drawBadge(ctx, x + 4, y + 6, num);
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 7.5px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(it.sku || 'REFORMER', x + 14, y + 10);
    },

    drawCadCadillac(ctx, x, y, w, h, it, num, isEN) {
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Canopy Chrome Posts
      ctx.fillStyle = '#64748b';
      [x + 4, x + w - 8].forEach(px => {
        [y + 4, y + h - 8].forEach(py => {
          ctx.fillRect(px, py, 4, 4);
        });
      });

      this.drawBadge(ctx, x + 6, y + 6, num);
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 8px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(it.sku || 'CADILLAC TRAPEZE', x + 16, y + 10);
    },

    drawCadColdPlunge(ctx, x, y, w, h, it, num, isEN) {
      // Insulated Tub Shell
      ctx.fillStyle = '#f0f9ff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill(); ctx.stroke();

      // Cold Water Pool (Deep Cyan)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath(); ctx.roundRect(x + 8, y + 8, w - 28, h - 16, 8); ctx.fill();

      // Chiller Unit Box
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + w - 16, y + 10, 12, h - 20);

      this.drawBadge(ctx, x + 6, y + 6, num);
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 8px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(it.sku || 'COLD PLUNGE', x + 16, y + 10);
      ctx.fillStyle = '#0284c7';
      ctx.font = '600 7px monospace';
      ctx.fillText('3°C THERAPY', x + 16, y + 20);
    },

    drawCadSaunaCabin(ctx, x, y, w, h, it, num, isEN) {
      // Western Red Cedar Wood Planks
      ctx.fillStyle = '#fed7aa';
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Wood Slat lines
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1;
      for (let sy = y + 8; sy < y + h; sy += 8) {
        ctx.beginPath(); ctx.moveTo(x, sy); ctx.lineTo(x + w, sy); ctx.stroke();
      }

      this.drawBadge(ctx, x + 6, y + 6, num);
      ctx.fillStyle = '#9a3412';
      ctx.font = 'bold 8px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(it.sku || 'INFRARED SAUNA', x + 16, y + 10);
    },

    drawTurfSprintLanes(ctx, x, y, w, h, isEN) {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);

      // Yardage markers
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      const step = w / 5;
      for (let i = 1; i <= 4; i++) {
        const mx = x + step * i;
        ctx.beginPath(); ctx.moveTo(mx, y); ctx.lineTo(mx, y + h); ctx.stroke();
        ctx.fillText(i + 'M', mx - step / 2, y + h / 2 + 3);
      }
      ctx.fillText('5M SPRINT TRACK', x + w - step / 2, y + h / 2 + 3);
    },

    drawBadge(ctx, bx, by, num) {
      ctx.fillStyle = '#00204a';
      ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(num), bx, by + 2.5);
    },

    exportPNG() {
      const canvas = document.getElementById('aiFloorplanCanvas');
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `Attivo-CAD-Floorplan-${Date.now().toString().slice(-4)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  // =========================================================================
  // MODULE: ATTIVO 3D DYNAMIC WEBGL WALKTHROUGH (THREE.JS HIGH-END ENGINE)
  // =========================================================================
  const AttivoVisualizer3D = {
    draw3D(proposal) { return this.render(proposal); },
    render(proposal) {
      const container = document.getElementById('ai3dContainer');
      if (!container) return;

      if (typeof THREE === 'undefined') {
        const isEN = (typeof state !== 'undefined' && state.appLang === 'en');
        container.innerHTML = `
          <div class="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-slate-900 rounded-2xl text-white">
            <span class="material-symbols-outlined text-4xl text-amber-400 mb-2">view_in_ar</span>
            <p class="text-sm font-bold">${isEN ? 'Connecting Three.js WebGL Engine...' : 'Mô hình 3D WebGL đang kết nối Three.js...'}</p>
            <p class="text-xs text-slate-400 mt-1">${isEN ? 'Loading 360° interactive spatial rendering' : 'Đang tải tài nguyên hiển thị phòng tập 3D tương tác xoay 360°'}</p>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      const p = proposal || aiState.currentProposal;
      const isEN = (typeof state !== 'undefined' && state.appLang === 'en');
      const items = (p && p.items && p.items.length) ? p.items : [];

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a); // Luxury Slate 900 Dark

      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
      camera.position.set(16, 13, 18);

      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(w, h);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      aiState.threeScene = scene;
      aiState.threeRenderer = renderer;
      aiState.threeCamera = camera;

      // OrbitControls
      let controls = null;
      if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2.1;
        controls.minDistance = 6;
        controls.maxDistance = 60;
        controls.target.set(0, 1.5, 0);
        aiState.threeControls = controls;
      }

      // Studio Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      const mainSpot = new THREE.DirectionalLight(0xffffff, 0.85);
      mainSpot.position.set(12, 22, 16);
      mainSpot.castShadow = true;
      mainSpot.shadow.mapSize.width = 1024;
      mainSpot.shadow.mapSize.height = 1024;
      scene.add(mainSpot);

      const warmAccent = new THREE.PointLight(0xf59e0b, 0.9, 30);
      warmAccent.position.set(-6, 8, -6);
      scene.add(warmAccent);

      // Floor (Topflor Acoustic Interlocking Rubber Tiles or Canadian Maple Wood)
      const pType = p ? p.projectType : 'commercial_gym';
      const isWoodFloor = pType === 'pilates_studio';
      const floorGeo = new THREE.PlaneGeometry(26, 18);
      const floorMat = new THREE.MeshStandardMaterial({
        color: isWoodFloor ? 0x92400e : 0x1e293b,
        roughness: isWoodFloor ? 0.4 : 0.85,
        metalness: isWoodFloor ? 0.2 : 0.05
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      // Floor grid lines
      const grid = new THREE.GridHelper(26, 26, isWoodFloor ? 0xb45309 : 0x0284c7, 0x334155);
      grid.position.y = 0.01;
      scene.add(grid);

      // Back Mirror Wall (Gương vách phản chiếu)
      const mirrorGeo = new THREE.PlaneGeometry(22, 5.5);
      const mirrorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.08, metalness: 0.92 });
      const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
      mirror.position.set(0, 2.75, -8.95);
      scene.add(mirror);

      const backWallGeo = new THREE.PlaneGeometry(26, 6.5);
      const backWallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
      const backWall = new THREE.Mesh(backWallGeo, backWallMat);
      backWall.position.set(0, 3.25, -9);
      scene.add(backWall);

      // Left Glass Curtain Wall (Cửa kính nhìn ra ngoại cảnh)
      const leftWallGeo = new THREE.PlaneGeometry(18, 6.5);
      const leftWallMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.22 });
      const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
      leftWall.position.set(-13, 3.25, 0);
      leftWall.rotation.y = Math.PI / 2;
      scene.add(leftWall);

      // 3D EQUIPMENT BUILDER HELPERS
      function add3DTreadmill(x, z, sku, name) {
        const grp = new THREE.Group();
        // Deck
        const deck = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.28, 2.4), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
        deck.position.y = 0.14; deck.castShadow = true; deck.receiveShadow = true; grp.add(deck);
        // Belt
        const belt = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 2.2), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 }));
        belt.position.y = 0.29; grp.add(belt);
        // Dual Posts
        const postMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.12), postMat); p1.position.set(-0.5, 0.7, 0.8); grp.add(p1);
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.12), postMat); p2.position.set(0.5, 0.7, 0.8); grp.add(p2);
        // Handrails
        const rail = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.08, 1.1), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 }));
        rail.position.set(0, 1.35, 0.35); grp.add(rail);
        // Touchscreen Console with Blue Backlight
        const con = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 0.1), new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.6 }));
        con.position.set(0, 1.45, 0.85); con.rotation.x = -Math.PI / 8; grp.add(con);

        grp.position.set(x, 0, z);
        scene.add(grp);
      }

      function add3DBike(x, z, sku, name) {
        const grp = new THREE.Group();
        // Flywheel
        const fly = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 24), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9 }));
        fly.rotation.z = Math.PI / 2; fly.position.set(0, 0.5, 0.5); fly.castShadow = true; grp.add(fly);
        // Frame
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.9), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5 }));
        frame.position.set(0, 0.65, 0); frame.rotation.x = -Math.PI / 6; grp.add(frame);
        // Saddle seat
        const sad = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.35), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 }));
        sad.position.set(0, 1.05, -0.25); grp.add(sad);
        // Handlebars
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 0.35), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 }));
        bar.position.set(0, 1.15, 0.45); grp.add(bar);

        grp.position.set(x, 0, z);
        scene.add(grp);
      }

      function add3DSelectorized(x, z, sku, name, accentColor) {
        const grp = new THREE.Group();
        // Weight Stack Tower
        const tow = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.95, 0.65), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 }));
        tow.position.set(0, 0.975, 0); tow.castShadow = true; grp.add(tow);
        // Weight stack slot line
        const slot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.5, 0.02), new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.4 }));
        slot.position.set(0, 1.0, 0.33); grp.add(slot);
        // Contoured Seat
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.65), new THREE.MeshStandardMaterial({ color: accentColor || 0x1d4ed8 }));
        seat.position.set(0, 0.5, 0.7); grp.add(seat);
        // Backrest
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.75, 0.1), new THREE.MeshStandardMaterial({ color: accentColor || 0x1d4ed8 }));
        back.position.set(0, 0.9, 0.42); grp.add(back);
        // Chrome Press Arms
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 12), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
        arm.rotation.z = Math.PI / 2; arm.position.set(0, 1.25, 0.65); grp.add(arm);

        grp.position.set(x, 0, z);
        scene.add(grp);
      }

      function add3DPowerRack(x, z, sku, name) {
        const grp = new THREE.Group();
        const postMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 });
        // 4 Upright Pillars
        [-0.7, 0.7].forEach(rx => {
          [-0.6, 0.6].forEach(rz => {
            const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.12), postMat);
            p.position.set(rx, 1.2, rz); p.castShadow = true; grp.add(p);
          });
        });
        // Top Crossbeams
        const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.1), postMat); b1.position.set(0, 2.35, -0.6); grp.add(b1);
        const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.1), postMat); b2.position.set(0, 2.35, 0.6); grp.add(b2);
        // Olympic Barbell (2.2m chrome bar)
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.3, 16), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95 }));
        bar.rotation.z = Math.PI / 2; bar.position.set(0, 1.1, 0); grp.add(bar);
        // Competition Bumper Plates (Red 25kg & Blue 20kg)
        [-0.95, 0.95].forEach(bx => {
          const redPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
          redPlate.rotation.z = Math.PI / 2; redPlate.position.set(bx, 1.1, 0); grp.add(redPlate);
          const bluePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 24), new THREE.MeshStandardMaterial({ color: 0x2563eb }));
          bluePlate.rotation.z = Math.PI / 2; bluePlate.position.set(bx + (bx > 0 ? 0.08 : -0.08), 1.1, 0); grp.add(bluePlate);
        });

        grp.position.set(x, 0, z);
        scene.add(grp);
      }

      function add3DBench(x, z, sku, name) {
        const grp = new THREE.Group();
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 1.2), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }));
        frame.position.y = 0.22; grp.add(frame);
        // Incline Padded Back
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.85), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 }));
        back.position.set(0, 0.48, 0.15); back.rotation.x = -Math.PI / 9; grp.add(back);
        // Seat pad
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.32), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 }));
        seat.position.set(0, 0.45, -0.35); grp.add(seat);

        grp.position.set(x, 0, z);
        scene.add(grp);
      }

      function add3DDumbbellRack(x, z) {
        const grp = new THREE.Group();
        // 2-tier rack frame
        const rackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
        const tray1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 0.45), rackMat);
        tray1.position.set(0, 0.65, 0); tray1.rotation.x = -Math.PI / 12; grp.add(tray1);
        const tray2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 0.45), rackMat);
        tray2.position.set(0, 0.35, 0.12); tray2.rotation.x = -Math.PI / 12; grp.add(tray2);
        // Rows of chrome & urethane dumbbells
        for (let dx = -1.3; dx <= 1.3; dx += 0.38) {
          const dbMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
          const db1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.28, 12), dbMat);
          db1.rotation.x = Math.PI / 2; db1.position.set(dx, 0.72, 0); grp.add(db1);
          const db2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.26, 12), dbMat);
          db2.rotation.x = Math.PI / 2; db2.position.set(dx, 0.42, 0.12); grp.add(db2);
        }

        grp.position.set(x, 0, z);
        scene.add(grp);
      }

      function add3DReformer(x, z, sku, name) {
        const grp = new THREE.Group();
        // Maple wood frame
        const woodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.38, 2.5), woodMat);
        frame.position.y = 0.19; frame.castShadow = true; grp.add(frame);
        // White leather padded carriage
        const car = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 1.2), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }));
        car.position.set(0, 0.42, 0.1); grp.add(car);
        // Chrome tubular footbar
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.95, 16), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
        bar.rotation.z = Math.PI / 2; bar.position.set(0, 0.65, 1.15); grp.add(bar);

        grp.position.set(x, 0, z);
        scene.add(grp);
      }

      function add3DColdPlunge(x, z, sku, name) {
        const grp = new THREE.Group();
        // Tub body
        const tub = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.85, 2.0), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 }));
        tub.position.y = 0.425; tub.castShadow = true; grp.add(tub);
        // Cold water shader
        const water = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.02, 1.7), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75, roughness: 0.1 }));
        water.position.y = 0.78; grp.add(water);

        grp.position.set(x, 0, z);
        scene.add(grp);
      }

      function add3DTurfTrack(x, z, lengthM) {
        const turfGeo = new THREE.PlaneGeometry(3.5, lengthM || 12);
        const turfMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.9 });
        const turf = new THREE.Mesh(turfGeo, turfMat);
        turf.rotation.x = -Math.PI / 2; turf.position.set(x, 0.02, z);
        turf.receiveShadow = true;
        scene.add(turf);
      }

      // DYNAMIC OBJECT POPULATION FROM proposal.items
      if (pType === 'pilates_studio') {
        let px = -6;
        items.forEach((it, idx) => {
          for (let q = 0; q < Math.min(it.quantity || 1, 4); q++) {
            if (px > 8) break;
            add3DReformer(px, 1.5, it.sku, it.name);
            px += 3.6;
          }
        });
      } else if (pType === 'recovery_lounge') {
        let px = -5;
        items.forEach((it, idx) => {
          for (let q = 0; q < Math.min(it.quantity || 1, 3); q++) {
            add3DColdPlunge(px, 0, it.sku, it.name);
            px += 4.5;
          }
        });
      } else {
        // COMMERCIAL / VILLA FITNESS
        let treadZ = -5.5;
        let stX = -1;
        let stZ = -5.5;
        let rackX = 7;

        items.forEach((it, idx) => {
          const name = (it.name || '').toLowerCase();
          const sku = it.sku || '';
          const zone = it.zone || '';
          const qty = it.quantity || 1;

          if (zone.includes('Cardio') || name.includes('treadmill') || name.includes('chạy') || name.includes('bike') || name.includes('đạp') || name.includes('elliptical') || name.includes('rower')) {
            const isTread = name.includes('treadmill') || name.includes('chạy') || sku.includes('TRM');
            const isBike = name.includes('bike') || name.includes('đạp') || sku.includes('UBK');

            for (let q = 0; q < Math.min(qty, 4); q++) {
              if (treadZ > 6) break;
              if (isTread) {
                add3DTreadmill(-8.5, treadZ, it.sku, it.name);
                treadZ += 3.4;
              } else if (isBike) {
                add3DBike(-5.5, treadZ - 1.5, it.sku, it.name);
              }
            }
          } else if (zone.includes('Strength') || name.includes('press') || name.includes('pulldown') || name.includes('kéo') || name.includes('ép')) {
            for (let q = 0; q < Math.min(qty, 2); q++) {
              if (stZ > 4) { stZ = -5.5; stX += 3.2; }
              add3DSelectorized(stX, stZ, it.sku, it.name, 0x1d4ed8);
              stZ += 3.6;
            }
          } else if (zone.includes('Free') || name.includes('rack') || name.includes('bench') || name.includes('gánh') || name.includes('tạ')) {
            const isRack = name.includes('rack') || name.includes('gánh');
            const isBench = name.includes('bench') || name.includes('ghế');

            for (let q = 0; q < Math.min(qty, 2); q++) {
              if (isRack) {
                add3DPowerRack(rackX, -5.5, it.sku, it.name);
              } else if (isBench) {
                add3DBench(rackX, -1.8, it.sku, it.name);
              }
            }
          }
        });

        // Add 3D Dumbbell Rack along right back perimeter
        add3DDumbbellRack(rackX - 1.5, -7.2);

        // Add 3D Athletic Sprint Turf Track on right side
        add3DTurfTrack(2.5, 2.5, 11);
      }

      // Render Loop
      let animId;
      function animate() {
        animId = requestAnimationFrame(animate);
        if (controls) controls.update();
        renderer.render(scene, camera);
      }
      animate();

      // Clean up previous animation loop on re-render
      if (aiState.threeAnimId) cancelAnimationFrame(aiState.threeAnimId);
      aiState.threeAnimId = animId;

      window.addEventListener('resize', () => {
        if (!container || !renderer || !camera) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      });
    },

    setCameraView(viewName) {
      if (!aiState.threeCamera) return;
      const cam = aiState.threeCamera;
      const ctrl = aiState.threeControls;

      if (viewName === 'perspective') {
        cam.position.set(16, 13, 18);
        if (ctrl) ctrl.target.set(0, 1.5, 0);
      } else if (viewName === 'entrance') {
        cam.position.set(9, 2.4, 12);
        if (ctrl) ctrl.target.set(-4, 1.5, -2);
      } else if (viewName === 'topdown') {
        cam.position.set(0, 28, 0.1);
        if (ctrl) ctrl.target.set(0, 0, 0);
      }
    },

    captureScreenshot() {
      if (!aiState.threeRenderer) return;
      const link = document.createElement('a');
      link.download = `Attivo-3D-Walkthrough-${Date.now().toString().slice(-4)}.png`;
      link.href = aiState.threeRenderer.domElement.toDataURL('image/png');
      link.click();
    }
  };

    // =========================================================================
  // MODULE: ATTIVO 3D PHOTOREALISTIC RENDER SHOWCASE
  // =========================================================================
  const AttivoShowcase3D = {
    renders: {
      commercial_gym: [
        { 
          title: 'Phòng Gym Thương Mại Cao Cấp — Phân Khu Cardio Precor', 
          title_en: 'Commercial Pro Fitness Center — Precor Cardio Zone',
          url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80', 
          desc: 'Hệ thống máy chạy bộ Precor TRM 885 kết nối Preva Network, sàn cao su Topflor chống ồn.',
          desc_en: 'Precor TRM 885 network-connected commercial treadmills with Topflor acoustic rubber flooring.'
        },
        { 
          title: 'Khu Vực Tạ Tự Do & Benches ZIVA Fitness', 
          title_en: 'Free Weights & Benches Zone — ZIVA Fitness',
          url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80', 
          desc: 'Dàn tạ đơn ZIVA Urethane Hex, giá để tạ 3 tầng, gương vách kịch trần đèn ray LED.',
          desc_en: 'ZIVA Urethane commercial hex dumbbells, 3-tier saddles rack, full-height architectural mirrors.'
        },
        { 
          title: 'Khu Chuyên Biệt Mông Đùi Glute Hub (Booty Builder)', 
          title_en: 'Dedicated Glute Hub — Booty Builder Norway',
          url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80', 
          desc: 'Booty Builder Platinum V4 & Standing Abductor nhập khẩu Na Uy.',
          desc_en: 'Official Booty Builder Platinum V4 & Standing Abductor imported directly from Norway.'
        }
      ],
      villa_gym: [
        { 
          title: 'Private Luxury Villa Gym — View Sân Vườn Biệt Thự', 
          title_en: 'Private Luxury Villa Gym — Scenic Garden View',
          url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80', 
          desc: 'Không gian tập riêng tư đẳng cấp với Watson UK Plate Loaded và Woodway Treadmill.',
          desc_en: 'Bespoke residential gym featuring Watson UK custom plate loaded gear and Woodway treadmill.'
        },
        { 
          title: 'Penthouse Wellness & Cardio Lounge', 
          title_en: 'VIP Penthouse Wellness & Cardio Lounge',
          url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80', 
          desc: 'Sàn gỗ tự nhiên kết hợp thảm tập stretching và máy phân tích cơ thể InBody/Evolt.',
          desc_en: 'Engineered hardwood flooring with dedicated stretching zone and Evolt 360 body composition.'
        }
      ],
      hotel_resort: [
        { 
          title: 'Resort 5 Sao Wellness Fitness Center', 
          title_en: '5-Star Resort Wellness Fitness Center',
          url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80', 
          desc: 'Tiêu chuẩn quốc tế InterContinental / JW Marriott với trang thiết bị Precor Experience Series.',
          desc_en: 'International luxury brand standard (InterContinental / JW Marriott) with Precor Experience Series.'
        }
      ],
      pilates_studio: [
        { 
          title: 'Merrithew Pilates Reformer Studio VIP', 
          title_en: 'Professional Merrithew Pilates Reformer Studio',
          url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80', 
          desc: 'Hệ thống Merrithew V2 Max Plus Reformers Canada, ánh sáng tự nhiên dịu nhẹ.',
          desc_en: 'Merrithew V2 Max Plus Reformers Canada system, soft ambient natural illumination.'
        }
      ]
    },

    render(projectType) {
      const container = document.getElementById('aiShowcaseContainer');
      if (!container) return;

      const pType = projectType || aiState.projectType || 'commercial_gym';
      const items = this.renders[pType] || this.renders['commercial_gym'];

      const isEN = (typeof state !== 'undefined' && state.appLang === 'en');
      container.innerHTML = items.map((it, idx) => `
        <div class="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-lg transition">
          <div class="h-48 overflow-hidden bg-slate-100">
            <img 
              src="${it.url}" 
              alt="${isEN ? (it.title_en || it.title) : it.title}" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              onerror="this.src='https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80'"
            />
          </div>
          <div class="p-4 space-y-1.5">
            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">${isEN ? 'Sample 3D Render' : '3D Render Mẫu'}</span>
            <h4 class="font-bold text-sm text-[#00204a] line-clamp-1">${isEN ? (it.title_en || it.title) : it.title}</h4>
            <p class="text-xs text-slate-500 line-clamp-2">${isEN ? (it.desc_en || it.desc) : it.desc}</p>
          </div>
        </div>
      `).join('');
    }
  };

  // Switch between Visualizer sub-tabs (2D vs 3D vs Showcase)
  function switchVisualizerSubTab(subTab) {
    aiState.visualizerSubTab = subTab;
    const v2d = document.getElementById('aiVisualizerView2D');
    const v3d = document.getElementById('aiVisualizerView3D');
    const vSc = document.getElementById('aiVisualizerViewShowcase');

    const btn2d = document.getElementById('btnSubTab2D');
    const btn3d = document.getElementById('btnSubTab3D');
    const btnSc = document.getElementById('btnSubTabShowcase');

    if (v2d) v2d.classList.toggle('hidden', subTab !== '2d');
    if (v3d) v3d.classList.toggle('hidden', subTab !== '3d');
    if (vSc) vSc.classList.toggle('hidden', subTab !== 'showcase');

    const activeBtnCls = "px-4 py-2 rounded-xl text-xs font-bold bg-[#00204a] text-white shadow-xs flex items-center gap-1.5 transition";
    const inactiveBtnCls = "px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-[#00204a] border border-slate-300 flex items-center gap-1.5 transition";

    if (btn2d) btn2d.className = (subTab === '2d') ? activeBtnCls : inactiveBtnCls;
    if (btn3d) btn3d.className = (subTab === '3d') ? activeBtnCls : inactiveBtnCls;
    if (btnSc) btnSc.className = (subTab === 'showcase') ? activeBtnCls : inactiveBtnCls;

    const prop = (typeof state !== 'undefined' && state.activeTab === 'builder' && typeof getBuilderProposal === 'function')
      ? getBuilderProposal()
      : (aiState.currentProposal || null);

    if (subTab === '2d') {
      (global.AttivoVisualizer2D || AttivoVisualizer2D).render(prop);
    } else if (subTab === '3d') {
      (global.AttivoVisualizer3D || AttivoVisualizer3D).render(prop);
    } else if (subTab === 'showcase') {
      (global.AttivoShowcase3D || AttivoShowcase3D).render(prop ? (prop.facilityType || prop.projectType) : aiState.projectType);
    }
  }

  // Switch between main top tabs (Chat vs 5-Factor Presets)
  function switchAiMode(mode) {
    aiState.activeMode = mode;
    const chatPanel = document.getElementById('aiChatPanel');
    const presetPanel = document.getElementById('aiPresetPanel');
    const btnChat = document.getElementById('aiModeTab_chat');
    const btnPreset = document.getElementById('aiModeTab_preset');

    if (chatPanel) chatPanel.classList.toggle('hidden', mode !== 'chat');
    if (presetPanel) presetPanel.classList.toggle('hidden', mode !== 'preset');

    const activeCls = "px-5 py-2.5 rounded-2xl text-xs font-extrabold bg-[#00204a] text-white shadow-md flex items-center gap-2 transition";
    const inactiveCls = "px-5 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 text-slate-600 hover:text-[#00204a] hover:bg-slate-200 flex items-center gap-2 transition";

    if (btnChat) btnChat.className = (mode === 'chat') ? activeCls : inactiveCls;
    if (btnPreset) btnPreset.className = (mode === 'preset') ? activeCls : inactiveCls;

    if (mode === 'chat') {
      AttivoAiChat.init();
    }
  }

  function initAiAdvisorEvents() {
    // Sliders synchronization
    const areaInp = document.getElementById('aiAreaInput');
    const areaRng = document.getElementById('aiAreaRange');
    if (areaInp && areaRng) {
      areaRng.addEventListener('input', e => { areaInp.value = e.target.value; aiState.area = Number(e.target.value); });
      areaInp.addEventListener('input', e => { areaRng.value = e.target.value; aiState.area = Number(e.target.value); });
    }

    const budgInp = document.getElementById('aiBudgetInput');
    const budgRng = document.getElementById('aiBudgetRange');
    if (budgInp && budgRng) {
      budgRng.addEventListener('input', e => {
        const val = Number(e.target.value);
        budgInp.value = val.toLocaleString('vi-VN');
        aiState.budget = val;
      });
      budgInp.addEventListener('input', e => {
        const val = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
        budgRng.value = val;
        aiState.budget = val;
      });
    }

    // Chat enter key
    const chatInput = document.getElementById('aiChatInput');
    if (chatInput) {
      chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          AttivoAiChat.sendUserMessage();
        }
      });
    }

    // Auto initialize chat
    AttivoAiChat.init();

    // Default generate preview proposal if empty
    if (!aiState.currentProposal) {
      runAiProposalGeneration();
    }
  }

  // Export to global window
  global.AttivoAiAdvisor = {
    generateAiQuotePackage,
    runGeneration: runAiProposalGeneration,
    updateQty: updateProposalItemQty,
    applyToBuilder: applyAiProposalToBuilder,
    exportExcel: exportAiProposalExcel,
    previewPdf: previewAiProposalPdf,
    setAreaPreset,
    setBudgetPreset,
    initEvents: initAiAdvisorEvents,
    switchMode: switchAiMode,
    switchVisualizerSubTab,
    renderAiProposalDashboard,
    get currentProposal() { return aiState.currentProposal; },
    set currentProposal(v) { aiState.currentProposal = v; },
    getState: () => aiState
  };

  global.AttivoAiChat = AttivoAiChat;
  global.AttivoVisualizer2D = AttivoVisualizer2D;
  global.AttivoVisualizer3D = AttivoVisualizer3D;
  global.AttivoShowcase3D = AttivoShowcase3D;

})(typeof window !== 'undefined' ? window : this);
