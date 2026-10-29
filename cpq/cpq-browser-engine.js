/**
 * Attivo CPQ Browser Engine & GitHub Pages Static Adapter
 * Enables the complete CPQ quotation, product catalog, pipeline deals,
 * margin guardrails, and print preview to run 100% in-browser on GitHub Pages.
 */

(function () {
  const isStaticHost = 
    window.location.protocol === 'file:' || 
    window.location.hostname.includes('github.io') ||
    window.location.port !== '8788';

  // Determine base path for data assets
  const scriptTag = document.currentScript;
  let basePath = './';
  if (scriptTag && scriptTag.src) {
    const url = new URL(scriptTag.src);
    basePath = url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1);
  }

  // In-memory cache
  let _config = null;
  let _products = null;
  let _deals = null;
  let _quotes = null;
  let _overview = null;
  let _reports = null;

  async function loadInitialData() {
    try {
      const [cfgRes, prodRes, dealsRes, quotesRes, ovRes, repRes] = await Promise.all([
        fetch(basePath + 'data/config.json').then(r => r.json()).catch(() => null),
        fetch(basePath + 'data/products.json').then(r => r.json()).catch(() => []),
        fetch(basePath + 'data/deals.json').then(r => r.json()).catch(() => ({ deals: [] })),
        fetch(basePath + 'data/quotes.json').then(r => r.json()).catch(() => ({ quotes: [] })),
        fetch(basePath + 'data/catalog_overview.json').then(r => r.json()).catch(() => null),
        fetch(basePath + 'data/sales_reports.json').then(r => r.json()).catch(() => ({ sales_reports: [] }))
      ]);

      _config = cfgRes;
      _products = prodRes || [];

      // Fix relative image URLs for GitHub Pages
      if (window.location.hostname.includes('github.io') || window.location.protocol === 'file:') {
        if (_products) {
          _products.forEach(p => {
            if (p.image_url && p.image_url.startsWith('/')) {
              p.image_url = p.image_url.substring(1);
            }
          });
        }
      }

      _overview = ovRes;
      _reports = repRes ? repRes.sales_reports : [];

      // Load deals from localStorage or seed
      const savedDeals = localStorage.getItem('attivo_cpq_deals');
      if (savedDeals) {
        _deals = JSON.parse(savedDeals);
      } else {
        _deals = dealsRes ? dealsRes.deals : [];
        localStorage.setItem('attivo_cpq_deals', JSON.stringify(_deals));
      }

      // Load quotes from localStorage or seed
      const savedQuotes = localStorage.getItem('attivo_cpq_quotes');
      if (savedQuotes) {
        _quotes = JSON.parse(savedQuotes);
      } else {
        _quotes = quotesRes ? quotesRes.quotes : [];
        localStorage.setItem('attivo_cpq_quotes', JSON.stringify(_quotes));
      }
    } catch (e) {
      console.warn('[CPQ Engine] Error loading static bundle:', e);
    }
  }

  const initialLoadPromise = loadInitialData();

  // Pure JavaScript CPQ Pricing Engine
  function calculateQuoteJS(body) {
    const items = body.items || [];
    const customerRole = body.customer_role || 'sales_exec';
    const deliveryProvince = body.delivery_province || 'Hà Nội';
    const siteCondition = body.site_condition || 'ground_or_freight_elevator';
    const globalDiscountPct = parseFloat(body.global_discount_pct) || 0;
    const allocateFreightToProducts = body.allocate_freight_to_products !== false;
    const currency = body.currency || 'VND';
    const fxUsdToVnd = 26500.0;

    const discountLimits = (_config && _config.discount_role_limits) || {
      sale_exec: 5.0,
      sales_manager: 10.0,
      director: 15.0,
      bod: 100.0
    };
    const maxDiscountAllowed = discountLimits[customerRole] ?? 5.0;

    // 1. Calculate Base Items
    let subtotalUndiscounted = 0.0;
    let subtotalBeforeVat = 0.0;
    let totalCogs = 0.0;
    let maxItemDiscount = 0.0;
    let hasRoleViolation = false;
    const roleViolations = [];

    const calculatedItems = [];

    items.forEach((item, index) => {
      const qty = parseInt(item.quantity) || 1;
      const basePrice = parseFloat(item.base_price) || 0.0;
      const cogs = parseFloat(item.cogs) || (basePrice * 0.58);
      const allowDiscount = item.allow_discount !== false && item.allow_discount !== 0;

      let discountPct = parseFloat(item.discount_pct) || 0.0;
      if (!allowDiscount && discountPct > 0) {
        discountPct = 0.0;
      }
      if (globalDiscountPct > 0 && allowDiscount && discountPct === 0) {
        discountPct = globalDiscountPct;
      }

      if (discountPct > maxDiscountAllowed) {
        hasRoleViolation = true;
        roleViolations.push(`Mã ${item.sku || ('#' + (index + 1))}: Chiết khấu ${discountPct}% vượt hạn mức ${maxDiscountAllowed}% của vai trò.`);
      }
      if (discountPct > maxItemDiscount) {
        maxItemDiscount = discountPct;
      }

      const unitSellingPrice = Math.round(basePrice * (1.0 - discountPct / 100.0));
      const lineTotal = unitSellingPrice * qty;
      const lineCogs = cogs * qty;
      const lineProfit = lineTotal - lineCogs;
      const lineMargin = lineTotal > 0 ? (lineProfit / lineTotal) * 100.0 : 0.0;

      subtotalUndiscounted += basePrice * qty;
      subtotalBeforeVat += lineTotal;
      totalCogs += lineCogs;

      calculatedItems.push({
        ...item,
        quantity: qty,
        base_price: basePrice,
        cogs: cogs,
        discount_pct: discountPct,
        unit_price: unitSellingPrice,
        unit_freight: 0.0,
        unit_selling_price: unitSellingPrice,
        line_total: lineTotal,
        line_cogs: lineCogs,
        gross_profit: lineProfit,
        gross_margin_pct: Math.round(lineMargin * 10) / 10,
        vat_rate: String(item.vat_rate || '10')
      });
    });

    // 2. Freight & Logistics Calculation
    const provRouting = (_config && _config.province_routing) || {};
    const destConfig = provRouting[deliveryProvince] || {
      zone: 'zone_1_local',
      warehouse: 'hanoi',
      base_truck: 3500000.0
    };
    const baseTruckCost = destConfig.base_truck || 3500000.0;

    const siteConfigs = (_config && _config.site_rigging_conditions) || {};
    const riggingConfig = siteConfigs[siteCondition] || { price: 0.0, cogs: 0.0 };
    const riggingCost = riggingConfig.price || 0.0;
    const totalFreightCost = baseTruckCost + riggingCost;

    // Freight Allocation
    if (allocateFreightToProducts && calculatedItems.length > 0) {
      const totalQty = calculatedItems.reduce((acc, i) => acc + i.quantity, 0);
      let allocatedSum = 0;
      calculatedItems.forEach((ci, idx) => {
        let perUnitFreight = 0;
        if (totalQty > 0) {
          if (idx === calculatedItems.length - 1) {
            perUnitFreight = Math.round((totalFreightCost - allocatedSum) / ci.quantity);
          } else {
            const share = totalFreightCost * (ci.quantity / totalQty);
            perUnitFreight = Math.round(share / ci.quantity);
            allocatedSum += perUnitFreight * ci.quantity;
          }
        }
        ci.unit_freight = perUnitFreight;
        ci.unit_selling_price = ci.unit_price + perUnitFreight;
        ci.line_total = ci.unit_selling_price * ci.quantity;
      });
      subtotalBeforeVat = calculatedItems.reduce((acc, i) => acc + i.line_total, 0);
    }

    // 3. VAT Calculation Grouped
    const vatGroups = { '0': 0.0, '8': 0.0, '10': 0.0 };
    calculatedItems.forEach(ci => {
      const rate = ci.vat_rate === '0' ? '0' : (ci.vat_rate === '8' ? '8' : '10');
      vatGroups[rate] += ci.line_total;
    });

    const vatAmount0 = 0.0;
    const vatAmount8 = Math.round(vatGroups['8'] * 0.08);
    const vatAmount10 = Math.round(vatGroups['10'] * 0.10);
    const totalVat = vatAmount0 + vatAmount8 + vatAmount10;
    const grandTotal = subtotalBeforeVat + totalVat + (allocateFreightToProducts ? 0 : totalFreightCost);

    // 4. Gross Margin Analysis
    const totalProfit = subtotalBeforeVat - totalCogs;
    const overallMarginPct = subtotalBeforeVat > 0 ? (totalProfit / subtotalBeforeVat) * 100.0 : 0.0;
    const marginThreshold = (_config && _config.margin_guardrail_threshold) || 22.0;
    const marginGuardrailPass = overallMarginPct >= marginThreshold;

    const totalDiscountAmount = Math.max(0, subtotalUndiscounted - subtotalBeforeVat);
    const subtotalAfterDiscount = subtotalBeforeVat;

    return {
      subtotal_before_discount: subtotalUndiscounted,
      item_discount_total: totalDiscountAmount,
      invoice_discount_total: 0,
      total_discount_amount: totalDiscountAmount,
      subtotal_after_discount: subtotalAfterDiscount,
      tax_amount: totalVat,
      grand_total: grandTotal,
      domestic_shipping_fee: allocateFreightToProducts ? 0 : totalFreightCost,
      installation_service_fee: 0,
      total_cogs: totalCogs,
      gross_profit: totalProfit,
      gross_margin_pct: Math.round(overallMarginPct * 10) / 10,
      margin_guardrail_pass: marginGuardrailPass,
      margin_warning: marginGuardrailPass ? null : "Biên độ Gross Margin thấp hơn ngưỡng an toàn. Báo giá cần phê duyệt cấp cao.",
      items: calculatedItems,
      totals: {
        subtotal_undiscounted: subtotalUndiscounted,
        subtotal_before_vat: subtotalBeforeVat,
        vat_breakdown: {
          taxable_0: vatGroups['0'],
          vat_0: vatAmount0,
          taxable_8: vatGroups['8'],
          vat_8: vatAmount8,
          taxable_10: vatGroups['10'],
          vat_10: vatAmount10
        },
        total_vat: totalVat,
        freight_cost: totalFreightCost,
        freight_allocated_in_price: allocateFreightToProducts,
        grand_total: grandTotal,
        total_cogs: totalCogs,
        gross_profit: totalProfit,
        gross_margin_pct: Math.round(overallMarginPct * 10) / 10
      },
      freight_info: {
        delivery_province: deliveryProvince,
        zone: destConfig.zone,
        warehouse: destConfig.warehouse,
        base_truck_cost: baseTruckCost,
        site_condition: siteCondition,
        rigging_cost: riggingCost,
        total_freight_cost: totalFreightCost,
        allocated_to_unit_prices: allocateFreightToProducts
      },
      margin_info: {
        guardrail_threshold_pct: marginThreshold,
        gross_margin_pct: Math.round(overallMarginPct * 10) / 10,
        pass: marginGuardrailPass,
        warning: marginGuardrailPass ? null : `Biên độ Gross Margin (${overallMarginPct.toFixed(1)}%) thấp hơn ngưỡng an toàn ${marginThreshold}%. Báo giá cần phê duyệt cấp cao.`
      },
      role_info: {
        customer_role: customerRole,
        max_discount_allowed: maxDiscountAllowed,
        pass: !hasRoleViolation,
        violations: roleViolations
      }
    };
  }

  // Intercept window.fetch
  const originalFetch = window.fetch;
  window.fetch = async function (resource, init) {
    let url = typeof resource === 'string' ? resource : (resource.url || '');
    
    // Normalize URL
    if (url.startsWith('/api/') || url.includes('/api/')) {
      await initialLoadPromise;
      
      const parsed = new URL(url, window.location.origin);
      const pathname = parsed.pathname.replace(/^.*\/api\//, '/api/');
      const searchParams = parsed.searchParams;
      const method = (init && init.method ? init.method : 'GET').toUpperCase();

      // Try local server first if running on localhost:8788
      if (!isStaticHost) {
        try {
          const res = await originalFetch(resource, init);
          if (res.ok || res.status !== 404) return res;
        } catch (e) {
          // Fall back to client-side handler
        }
      }

      // 1. /api/config
      if (pathname === '/api/config') {
        return new Response(JSON.stringify(_config || {}), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 2. /api/deals
      if (pathname === '/api/deals') {
        if (method === 'GET') {
          return new Response(JSON.stringify({ deals: _deals || [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        if (method === 'POST') {
          const body = init && init.body ? JSON.parse(init.body) : {};
          const newDeal = {
            id: Date.now(),
            deal_name: body.deal_name || 'Dự án mới',
            customer_name: body.customer_name || 'Khách hàng',
            segment: body.segment || 'commercial',
            pipeline_stage: body.pipeline_stage || 'opportunity',
            probability_pct: body.probability_pct || 50,
            sales_rep: body.sales_rep || 'Nguyễn Văn Nam',
            updated_at: new Date().toISOString()
          };
          _deals.unshift(newDeal);
          localStorage.setItem('attivo_cpq_deals', JSON.stringify(_deals));
          return new Response(JSON.stringify({ success: true, deal: newDeal }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 3. /api/products
      if (pathname === '/api/products') {
        const query = (searchParams.get('q') || searchParams.get('query') || '').trim().toLowerCase();
        const brand = (searchParams.get('brand_main') || searchParams.get('brand') || '').trim();
        const category = (searchParams.get('category') || '').trim();
        const itemGroup = (searchParams.get('item_group') || '').trim();
        const itemNature = (searchParams.get('item_nature') || '').trim();
        const stockStatus = searchParams.get('stock_status') || 'all';
        const inStockParam = searchParams.get('in_stock');
        const onlyPriced = searchParams.get('only_priced') === '1';
        const sort = searchParams.get('sort') || '';
        const page = parseInt(searchParams.get('page')) || 1;
        const pageSize = parseInt(searchParams.get('page_size')) || 50;

        let filtered = _products || [];
        if (onlyPriced && !query) {
          filtered = filtered.filter(p => p.base_price > 0);
        }
        if (brand && brand !== 'all') {
          const bLower = brand.toLowerCase();
          filtered = filtered.filter(p => 
            (p.brand_main && p.brand_main.toLowerCase() === bLower) || 
            (p.brand && p.brand.toLowerCase() === bLower)
          );
        }
        if (category && category !== 'all') {
          filtered = filtered.filter(p => p.category === category);
        }
        if (itemGroup && itemGroup !== 'all') {
          filtered = filtered.filter(p => p.item_group === itemGroup);
        }
        if (itemNature && itemNature !== 'all') {
          filtered = filtered.filter(p => p.item_nature === itemNature);
        }
        if (inStockParam === '1' || stockStatus === 'in_stock') {
          filtered = filtered.filter(p => (p.available_qty || p.stock_qty || 0) > 0);
        } else if (stockStatus === 'out_of_stock') {
          filtered = filtered.filter(p => (p.available_qty || p.stock_qty || 0) <= 0);
        }
        if (query) {
          filtered = filtered.filter(p => 
            (p.sku && p.sku.toLowerCase().includes(query)) ||
            (p.name && p.name.toLowerCase().includes(query)) ||
            (p.name_en && p.name_en.toLowerCase().includes(query)) ||
            (p.brand && p.brand.toLowerCase().includes(query)) ||
            (p.brand_main && p.brand_main.toLowerCase().includes(query)) ||
            (p.item_group && p.item_group.toLowerCase().includes(query)) ||
            (p.specs && p.specs.toLowerCase().includes(query)) ||
            (p.specs_en && p.specs_en.toLowerCase().includes(query))
          );
        }

        // Sorting
        if (sort === 'price_desc') {
          filtered.sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
        } else if (sort === 'price_asc') {
          filtered.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
        } else if (sort === 'sku_asc') {
          filtered.sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));
        } else if (sort === 'stock_desc') {
          filtered.sort((a, b) => ((b.available_qty || b.stock_qty || 0) - (a.available_qty || a.stock_qty || 0)));
        }

        const total = filtered.length;
        const totalPages = Math.ceil(total / pageSize) || 1;
        const start = (page - 1) * pageSize;
        const paginated = filtered.slice(start, start + pageSize);

        return new Response(JSON.stringify({
          total,
          page,
          page_size: pageSize,
          total_pages: totalPages,
          products: paginated
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 4. /api/products/:id
      const prodMatch = pathname.match(/^\/api\/products\/(\d+)$/);
      if (prodMatch) {
        const prodId = parseInt(prodMatch[1]);
        const prod = (_products || []).find(p => p.id === prodId);
        if (prod) {
          return new Response(JSON.stringify(prod), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ error: 'Product not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 5. /api/catalog/overview
      if (pathname === '/api/catalog/overview') {
        return new Response(JSON.stringify(_overview || {}), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 6. /api/reports/sales
      if (pathname === '/api/reports/sales') {
        return new Response(JSON.stringify({ sales_reports: _reports || [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 7. /api/quotes/calculate
      if (pathname === '/api/quotes/calculate') {
        const body = init && init.body ? JSON.parse(init.body) : {};
        const calculated = calculateQuoteJS(body);
        return new Response(JSON.stringify(calculated), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 8. /api/quotes
      if (pathname === '/api/quotes') {
        if (method === 'GET') {
          return new Response(JSON.stringify({ quotes: _quotes || [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        if (method === 'POST') {
          const body = init && init.body ? JSON.parse(init.body) : {};
          const quoteId = Date.now();
          const quoteCode = body.quote_code || `ATV-QT-${new Date().getFullYear()}-${String(quoteId).slice(-4)}`;
          
          const newQuote = {
            id: quoteId,
            quote_code: quoteCode,
            deal_id: body.deal_id,
            version: (body.version || 1),
            customer_name: body.customer_name || 'Khách hàng thương mại',
            sales_rep: body.sales_rep || 'Nguyễn Văn Nam',
            customer_role: body.customer_role || 'sales_exec',
            delivery_province: body.delivery_province || 'Hà Nội',
            site_condition: body.site_condition || 'ground_or_freight_elevator',
            currency: body.currency || 'VND',
            status: 'draft',
            total_amount: body.total_amount || 0,
            gross_margin_pct: body.gross_margin_pct || 25,
            items: body.items || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          _quotes.unshift(newQuote);
          localStorage.setItem('attivo_cpq_quotes', JSON.stringify(_quotes));

          return new Response(JSON.stringify({
            success: true,
            quote_id: quoteId,
            quote_code: quoteCode,
            version: newQuote.version
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 9. /api/quotes/:id
      const quoteMatch = pathname.match(/^\/api\/quotes\/(\d+)$/);
      if (quoteMatch) {
        const qId = parseInt(quoteMatch[1]);
        const q = (_quotes || []).find(x => x.id === qId);
        if (q) {
          return new Response(JSON.stringify(q), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ error: 'Quote not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 10. /api/quotes/:id/action
      const actionMatch = pathname.match(/^\/api\/quotes\/(\d+)\/action$/);
      if (actionMatch) {
        const qId = parseInt(actionMatch[1]);
        const body = init && init.body ? JSON.parse(init.body) : {};
        const qIndex = (_quotes || []).findIndex(x => x.id === qId);
        if (qIndex >= 0) {
          if (body.action === 'approve') {
            _quotes[qIndex].status = 'approved';
          } else if (body.action === 'reject') {
            _quotes[qIndex].status = 'rejected';
          } else if (body.action === 'duplicate') {
            const copy = JSON.parse(JSON.stringify(_quotes[qIndex]));
            copy.id = Date.now();
            copy.quote_code += '-COPY';
            copy.status = 'draft';
            _quotes.unshift(copy);
          }
          localStorage.setItem('attivo_cpq_quotes', JSON.stringify(_quotes));
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 11. /api/quotes/export-excel
      if (pathname === '/api/quotes/export-excel') {
        const body = init && init.body ? JSON.parse(init.body) : {};
        const items = body.items || [];
        let csv = '\uFEFFMã SKU,Tên sản phẩm,ĐVT,Số lượng,Đơn giá (VNĐ),Thuế VAT,Thành tiền (VNĐ)\n';
        items.forEach(it => {
          csv += `"${it.sku || ''}","${(it.name || '').replace(/"/g, '""')}","${it.unit || 'Bộ'}",${it.quantity || 1},${it.unit_price || 0},"${it.vat_rate || 10}%",${it.line_total || 0}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        return new Response(blob, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="Bao_Gia_Attivo.csv"'
          }
        });
      }
    }

    return originalFetch(resource, init);
  };

  console.log('[Attivo CPQ] Browser Engine & Static Adapter initialized successfully.');
})();
