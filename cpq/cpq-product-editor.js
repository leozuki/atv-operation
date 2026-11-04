/**
 * Attivo International CPQ — Product Editor & Audit Trail Module
 * Handles product modifications, permission validation, diff calculation,
 * and immutable per-product audit logging.
 */

(function (global) {
  'use strict';

  const STORAGE_KEY_AUDIT_LOGS = 'attivo_cpq_product_audit_logs';

  // Seed realistic historical audit trail for core flagship products
  const DEFAULT_AUDIT_LOGS = [
    {
      id: 'log_init_001',
      sku: 'PRC-TRM885',
      product_id: 1,
      timestamp: '2026-10-15T09:30:00Z',
      formatted_time: '15/10/2026 16:30',
      user_id: 'user_hellen',
      user_name: 'Ms. Phạm Thu Thủy (Hellen)',
      user_role: 'director',
      role_title: 'Giám Đốc Kinh Doanh (Sales Director)',
      reason: 'Cập nhật bảng giá niêm yết quý 4/2026 theo thông báo từ Precor USA & bổ sung màn hình P82 15 inch',
      diff: [
        { field: 'base_price', label: 'Đơn giá niêm yết (VNĐ)', old_val: '252,000,000 đ', new_val: '263,889,000 đ' },
        { field: 'cogs', label: 'Giá vốn nhập khẩu COGS', old_val: '158,000,000 đ', new_val: '165,000,000 đ' },
        { field: 'warranty_period', label: 'Bảo hành chính hãng', old_val: '12 tháng', new_val: '24 tháng chính hãng' }
      ]
    },
    {
      id: 'log_init_002',
      sku: 'PRC-TRM885',
      product_id: 1,
      timestamp: '2026-10-28T14:15:00Z',
      formatted_time: '28/10/2026 14:15',
      user_id: 'user_hoai',
      user_name: 'Ms. Trịnh Thu Hoài',
      user_role: 'sales_manager',
      role_title: 'Trưởng Phòng Kinh Doanh TP.HCM',
      reason: 'Bổ sung thông số kỹ thuật song ngữ (Specs EN/VI) chuẩn bị cho dự án Khách sạn & Resort 5 sao',
      diff: [
        { field: 'name_en', label: 'Tên tiếng Anh (EN)', old_val: 'Precor Treadmill TRM 885', new_val: 'Commercial Treadmill Precor TRM 885 (P82 15-inch Touchscreen Console)' },
        { field: 'specs_en', label: 'Thông số kỹ thuật EN', old_val: '—', new_val: 'LED Console: 6 Numeric Windows + Dot-Matrix Window, Slikdeck Pre-waxed Deck...' }
      ]
    },
    {
      id: 'log_init_003',
      sku: 'ELK-PRESTERA-RACK',
      product_id: 4,
      timestamp: '2026-10-20T10:00:00Z',
      formatted_time: '20/10/2026 10:00',
      user_id: 'user_khanh',
      user_name: 'Mr. Nguyễn Trọng Khánh',
      user_role: 'sales_manager',
      role_title: 'Trưởng Phòng Dự Án Hà Nội',
      reason: 'Đồng bộ giá theo hợp đồng phân phối Eleiko Thụy Điển 2026-2027',
      diff: [
        { field: 'base_price', label: 'Đơn giá niêm yết (VNĐ)', old_val: '185,000,000 đ', new_val: '198,500,000 đ' },
        { field: 'origin', label: 'Xuất xứ', old_val: 'Thụy Điển', new_val: 'Thụy Điển (Sweden)' }
      ]
    }
  ];

  class ProductEditorManager {
    constructor() {
      this.auditLogs = this.loadAuditLogs();
    }

    loadAuditLogs() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('[ProductEditor] Failed to load audit logs from localStorage:', e);
      }
      this.saveAuditLogs(DEFAULT_AUDIT_LOGS);
      return [...DEFAULT_AUDIT_LOGS];
    }

    saveAuditLogs(logs) {
      this.auditLogs = logs;
      try {
        localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(logs));
      } catch (e) {
        console.warn('[ProductEditor] Could not save audit logs:', e);
      }
    }

    getAuditLogsForProduct(skuOrId) {
      if (!skuOrId) return [];
      const clean = String(skuOrId).trim().toLowerCase();
      return this.auditLogs.filter(log => 
        String(log.product_id).toLowerCase() === clean || 
        String(log.sku || '').trim().toLowerCase() === clean
      ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    addAuditLog(entry) {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const formatted_time = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const log = {
        id: 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        sku: entry.sku,
        product_id: entry.product_id || entry.id,
        timestamp: now.toISOString(),
        formatted_time,
        user_id: entry.user_id,
        user_name: entry.user_name,
        user_role: entry.user_role,
        role_title: entry.role_title,
        reason: entry.reason || 'Cập nhật thông số sản phẩm',
        diff: entry.diff || []
      };

      this.auditLogs.unshift(log);
      this.saveAuditLogs(this.auditLogs);
      return log;
    }

    // Check permission to edit products
    canEdit() {
      if (typeof global.AttivoAuth !== 'undefined' && global.AttivoAuth.canEditProducts) {
        return global.AttivoAuth.canEditProducts();
      }
      if (global.state && global.state.userRole) {
        return ['bod', 'director', 'sales_manager'].includes(global.state.userRole);
      }
      return false;
    }

    // Open Edit Modal with Auth barrier check
    openEditModal(prodOrSku) {
      if (!this.canEdit()) {
        const u = (global.AttivoAuth && global.AttivoAuth.currentUser) || { name: 'Người dùng', role: 'sale_exec' };
        const isEN = (global.state && global.state.appLang === 'en');
        const roleTitle = (global.AttivoAuth && global.AttivoAuth.getRoleTitleVi) ? global.AttivoAuth.getRoleTitleVi(u.role) : u.role;
        
        const msg = isEN
          ? `⛔ ACCESS DENIED\n\nYou are signed in as: ${u.name} (${u.role.toUpperCase()})\n\nOnly Sales Director (Ms. Hellen), Sales Managers (Ms. Hoai, Mr. Khanh), or BOD / CEO have permission to edit product specifications and pricing.\n\nPlease switch to a Director or Manager account in the top-right profile menu to test editing.`
          : `⛔ TỪ CHỐI TRUY CẬP — PHÂN QUYỀN CPQ\n\nBạn đang đăng nhập với tài khoản: ${u.name}\nVai trò hiện tại: ${roleTitle}\n\nChỉ có Giám Đốc Kinh Doanh (Ms. Hellen), Trưởng Phòng (Ms. Hoài, Mr. Khánh) hoặc Ban Tổng Giám Đốc (BOD/CEO) mới có quyền sửa thông số và bảng giá sản phẩm.\n\nVui lòng bấm vào Avatar góc phải trên để chuyển sang tài khoản Sếp (Hellen hoặc BOD) để thử tính năng này.`;
        
        alert(msg);
        return false;
      }

      // If authorized, resolve product and populate modal
      let prod = null;
      if (prodOrSku && typeof prodOrSku === 'object') {
        prod = prodOrSku;
      } else if (prodOrSku) {
        const clean = String(prodOrSku).trim().toLowerCase();
        if (global.state && Array.isArray(global.state.products)) {
          prod = global.state.products.find(p => String(p.id) === clean || String(p.sku || '').trim().toLowerCase() === clean);
        }
        if (!prod && Array.isArray(global.__CPQ_PRODUCTS__)) {
          prod = global.__CPQ_PRODUCTS__.find(p => String(p.id) === clean || String(p.sku || '').trim().toLowerCase() === clean);
        }
      }

      if (typeof global.openProductEditorModal === 'function') {
        global.openProductEditorModal(prod);
      }
      return true;
    }

    // Compute diff between old and new product objects
    computeDiff(oldProd, newProd) {
      const fieldLabels = {
        name: { vi: 'Tên tiếng Việt', en: 'Product Name (VI)' },
        name_en: { vi: 'Tên tiếng Anh', en: 'Product Name (EN)' },
        sku: { vi: 'Mã SKU Attivo', en: 'Attivo SKU' },
        mfr_sku: { vi: 'Mã Model Hãng', en: 'Manufacturer Model' },
        brand_main: { vi: 'Thương hiệu', en: 'Brand' },
        category: { vi: 'Phân loại CPQ', en: 'Category' },
        unit: { vi: 'Đơn vị tính', en: 'Unit' },
        origin: { vi: 'Xuất xứ', en: 'Origin' },
        base_price: { vi: 'Đơn giá niêm yết (VNĐ)', en: 'List Price (VND)', isCurrency: true },
        price_tier_2: { vi: 'Đơn giá 2 / Dự án (VNĐ)', en: 'Tier 2 Price (VND)', isCurrency: true },
        price_tier_3: { vi: 'Đơn giá 3 (VNĐ)', en: 'Tier 3 Price (VND)', isCurrency: true },
        cogs: { vi: 'Giá vốn nhập khẩu COGS', en: 'Import COGS', isCurrency: true },
        est_warehouse_cost: { vi: 'Giá vào kho Landed', en: 'Landed Warehouse Cost', isCurrency: true },
        price_usd: { vi: 'Đơn giá bán USD ($)', en: 'List Price USD ($)', isUsd: true },
        cost_usd: { vi: 'Giá vốn FOB USD ($)', en: 'FOB Cost USD ($)', isUsd: true },
        stock_qty: { vi: 'Tồn kho khả dụng', en: 'Stock Quantity' },
        warranty_period: { vi: 'Thời hạn bảo hành', en: 'Warranty Period' },
        vat_rate: { vi: 'Thuế suất VAT (%)', en: 'VAT Rate (%)' },
        image_url: { vi: 'Hình ảnh thiết bị', en: 'Image URL' },
        specs: { vi: 'Thông số kỹ thuật (VI)', en: 'Specifications (VI)' },
        specs_en: { vi: 'Thông số kỹ thuật (EN)', en: 'Specifications (EN)' }
      };

      const diff = [];
      const isEN = (global.state && global.state.appLang === 'en');

      for (const [key, meta] of Object.entries(fieldLabels)) {
        let oldV = oldProd ? oldProd[key] : undefined;
        let newV = newProd ? newProd[key] : undefined;

        // Normalize values for comparison
        if (meta.isCurrency || meta.isUsd || typeof oldV === 'number' || typeof newV === 'number') {
          const numOld = parseFloat(oldV) || 0;
          const numNew = parseFloat(newV) || 0;
          if (Math.abs(numOld - numNew) > 0.001) {
            const formatVal = (num) => {
              if (meta.isUsd) return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              if (meta.isCurrency) return num.toLocaleString('vi-VN') + ' đ';
              return num.toLocaleString();
            };
            diff.push({
              field: key,
              label: isEN ? meta.en : meta.vi,
              old_val: formatVal(numOld),
              new_val: formatVal(numNew)
            });
          }
        } else {
          const strOld = String(oldV || '').trim();
          const strNew = String(newV || '').trim();
          if (strOld !== strNew && (strOld || strNew)) {
            const truncate = (s) => (s.length > 60 ? s.substring(0, 57) + '...' : s);
            diff.push({
              field: key,
              label: isEN ? meta.en : meta.vi,
              old_val: strOld ? truncate(strOld) : '—',
              new_val: strNew ? truncate(strNew) : '—'
            });
          }
        }
      }

      return diff;
    }

    // Render Product Audit Trail Section in Product Detail View
    renderProductAuditTrail(skuOrId) {
      const container = document.getElementById('detailAuditTrailSection');
      const badge = document.getElementById('detailAuditCountBadge');
      if (!container) return;

      const logs = this.getAuditLogsForProduct(skuOrId);
      const isEN = (global.state && global.state.appLang === 'en');

      if (badge) {
        badge.innerText = isEN ? `${logs.length} revisions` : `${logs.length} lần sửa đổi`;
      }

      if (logs.length === 0) {
        container.innerHTML = `
          <div class="py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500">
            <span class="material-symbols-outlined text-3xl text-slate-300 block mb-1">history</span>
            <p class="text-xs font-medium">${isEN ? 'No edit history recorded for this SKU yet. Any price or spec changes by Directors or Managers will be logged here.' : 'Chưa có lịch sử chỉnh sửa nào được ghi nhận cho mã hàng này. Mọi thay đổi về giá hoặc thông số kỹ thuật bởi Sếp/Quản lý sẽ được tự động lưu vết tại đây.'}</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-[19px] before:w-0.5 before:bg-slate-200">
          ${logs.map(log => {
            const roleBadgeClass = log.user_role === 'bod' 
              ? 'bg-amber-100 text-amber-800 border-amber-300' 
              : (log.user_role === 'director' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-cyan-100 text-cyan-800 border-cyan-300');

            return `
              <div class="relative pl-10">
                <!-- Timeline Dot -->
                <div class="absolute left-3 top-2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-xs"></div>

                <div class="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-2 transition">
                  <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-md bg-[#00204a] text-white font-bold text-[10px] flex items-center justify-center">
                        ${(log.user_name || 'U').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()}
                      </div>
                      <span class="font-bold text-xs text-[#00204a]">${log.user_name}</span>
                      <span class="text-[10px] px-2 py-0.5 rounded-full font-bold border ${roleBadgeClass}">
                        ${log.role_title || log.user_role}
                      </span>
                    </div>
                    <div class="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <span class="material-symbols-outlined text-xs">schedule</span>
                      <span>${log.formatted_time}</span>
                    </div>
                  </div>

                  <!-- Edit Reason Callout -->
                  <div class="bg-white rounded-lg p-2.5 border border-slate-200 text-xs">
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      ${isEN ? 'Edit Reason / Justification:' : 'Lý Do Chỉnh Sửa & Cập Nhật:'}
                    </div>
                    <div class="text-slate-800 font-medium italic">
                      "${log.reason || (isEN ? 'Updated product details' : 'Cập nhật thông số')}"
                    </div>
                  </div>

                  <!-- Field Diffs -->
                  ${log.diff && log.diff.length > 0 ? `
                    <div class="space-y-1 pt-1">
                      <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        ${isEN ? 'Changed Fields & Values:' : 'Chi Tiết Thay Đổi Giá & Thông Số:'}
                      </div>
                      <div class="grid grid-cols-1 gap-1.5 text-xs">
                        ${log.diff.map(d => `
                          <div class="flex flex-wrap items-center justify-between gap-1 p-1.5 rounded-lg bg-white border border-slate-200 text-[11px]">
                            <span class="font-semibold text-slate-700 min-w-[140px]">${d.label}:</span>
                            <div class="flex items-center gap-1.5 font-mono">
                              <span class="text-rose-600 line-through bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">${d.old_val}</span>
                              <span class="text-slate-400 text-xs">➔</span>
                              <span class="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">${d.new_val}</span>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  const editorInstance = new ProductEditorManager();
  global.AttivoProductEditor = editorInstance;

})(typeof window !== 'undefined' ? window : this);
