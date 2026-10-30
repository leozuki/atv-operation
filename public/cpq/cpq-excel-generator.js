/**
 * Attivo International — CPQ Excel (.xlsx) Quotation Exporter
 * Generates official, multi-sheet, beautifully formatted .xlsx spreadsheets
 * using SheetJS (xlsx.full.min.js).
 * 
 * Features:
 * - 100% Genuine OpenXML .xlsx binary workbook (No CSV tricks, zero corruption dialogs)
 * - Sheet 1: "Bao_Gia_Attivo" (Official Customer-facing Quotation)
 * - Sheet 2: "Dieu_Khoan_Bao_Hanh" (Standard Terms & Warranty Policies)
 * - Formatted column widths, number separators, VAT breakdown, and Vietnamese currency words
 * - Compatible with Microsoft Excel 2013-2024, Office 365, Google Sheets, LibreOffice & Mobile
 */

(function (global) {
  'use strict';

  // Helper: Convert number to Vietnamese words (e.g. 150000000 -> Một trăm năm mươi triệu đồng chẵn)
  function numberToVietnameseWords(num) {
    if (!num || isNaN(num) || num <= 0) return 'Không đồng';
    num = Math.round(num);

    const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
    const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

    function readGroupThree(n, showZeroHundred) {
      const h = Math.floor(n / 100);
      const t = Math.floor((n % 100) / 10);
      const u = n % 10;
      let res = '';

      if (h > 0 || showZeroHundred) {
        res += digits[h] + ' trăm ';
      }

      if (t > 1) {
        res += digits[t] + ' mươi ';
        if (u === 1) res += 'mốt ';
        else if (u === 5) res += 'lăm ';
        else if (u > 0) res += digits[u] + ' ';
      } else if (t === 1) {
        res += 'mười ';
        if (u === 5) res += 'lăm ';
        else if (u > 0) res += digits[u] + ' ';
      } else if (t === 0 && u > 0) {
        if (h > 0 || showZeroHundred) res += 'lẻ ' + digits[u] + ' ';
        else res += digits[u] + ' ';
      }

      return res.trim();
    }

    let sNum = String(num);
    const groups = [];
    while (sNum.length > 0) {
      groups.push(parseInt(sNum.slice(-3), 10));
      sNum = sNum.slice(0, -3);
    }

    let result = '';
    for (let i = groups.length - 1; i >= 0; i--) {
      const g = groups[i];
      if (g > 0) {
        const showZeroHundred = (i < groups.length - 1);
        const gText = readGroupThree(g, showZeroHundred);
        result += gText + ' ' + units[i] + ' ';
      }
    }

    result = result.trim();
    if (!result) return 'Không đồng';

    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1) + ' đồng chẵn.';
    return result.replace(/\s+/g, ' ');
  }

  // Format number with commas for display
  function fmtNum(n) {
    if (n === null || n === undefined || isNaN(n)) return '0';
    return Math.round(Number(n)).toLocaleString('vi-VN');
  }

  // Build the complete Attivo Quotation Workbook
  function buildAttivoQuoteWorkbook(payload) {
    const XLSX = global.XLSX || (typeof require !== 'undefined' ? require('./assets/vendor/xlsx.full.min.js') : null);
    if (!XLSX) {
      throw new Error('SheetJS (XLSX) library is not loaded!');
    }

    const lang = (payload.language || 'vi').toLowerCase();
    const isEn = lang === 'en';

    // 1. EXTRACT DATA
    const quoteCode = payload.quote_code || `ATV-Q${new Date().toISOString().slice(2,10).replace(/-/g,'')}`;
    const quoteDate = payload.quote_date || new Date().toISOString().slice(0, 10);
    const validUntil = payload.valid_until || '';
    const clientName = payload.client_name || (isEn ? 'Valued Customer' : 'Quý Khách Hàng');
    const clientAddress = payload.client_address || (isEn ? 'Vietnam' : 'Việt Nam');
    const clientPhone = payload.client_phone || '';
    const clientTaxId = payload.customer_tax_id || '';
    const dealName = payload.deal_name || (isEn ? 'Fitness Equipment Project' : 'Dự Án Trang Thiết Bị Thể Thao Attivo');

    const salesName = payload.created_by_name || 'Phạm Đình Thắng';
    const salesPhone = payload.sales_rep_phone || '0982 992 246';
    const salesRole = payload.created_by_role || 'Senior Sales Manager';
    const approverName = payload.approver_name || 'Phạm Thị Thu Thủy';
    const approverTitle = payload.approver_title || (isEn ? 'Sales Director' : 'Giám Đốc Kinh Doanh / Sales Director');

    const rawItems = (payload.items || []).filter(it => it.row_type !== 'note');

    // 2. SHEET 1: BAO GIA ATTIVO (QUOTATION)
    const quoteRows = [];

    // Row 1-4: Company Header
    quoteRows.push(['CÔNG TY CỔ PHẦN THIẾT BỊ QUỐC TẾ ATTIVO']);
    quoteRows.push(['ATTIVO INTERNATIONAL EQUIPMENT JOINT STOCK COMPANY']);
    quoteRows.push(['Trụ sở chính: TT4-06 Khu Đô Thị Nam Cường, P. Cổ Nhuế 1, Q. Bắc Từ Liêm, TP. Hà Nội']);
    quoteRows.push(['Chi nhánh HCM: Sarimi B2-00.09, Khu Đô Thị Sala, 72 Nguyễn Cơ Thạch, TP. Thủ Đức, TP. HCM']);
    quoteRows.push(['Hotline CSKH: 1900 636 330 | Website: attivointl.com | Email: info@attivointl.com']);
    quoteRows.push([]); // Spacer row 6

    // Row 7: Title
    quoteRows.push([isEn ? 'OFFICIAL COMMERCIAL QUOTATION' : 'BẢNG BÁO GIÁ THIẾT BỊ VÀ DỊCH VỤ CHÍNH HÃNG']);
    quoteRows.push([isEn ? `Project: ${dealName}` : `Dự án: ${dealName}`]);
    quoteRows.push([]); // Spacer row 9

    // Row 10-14: Meta Info (2 Columns Block)
    quoteRows.push([
      isEn ? 'CUSTOMER INFORMATION:' : 'THÔNG TIN KHÁCH HÀNG:', '', '', '', '', '',
      isEn ? 'QUOTATION DETAILS:' : 'THÔNG TIN BÁO GIÁ:', '', '', '', '', '', ''
    ]);
    quoteRows.push([
      isEn ? 'Client Name / Đơn vị:' : 'Đơn vị / Khách hàng:', clientName, '', '', '', '',
      isEn ? 'Quote No. / Mã báo giá:' : 'Mã số báo giá:', quoteCode, '', '', '', '', ''
    ]);
    quoteRows.push([
      isEn ? 'Address / Địa chỉ:' : 'Địa chỉ bàn giao:', clientAddress, '', '', '', '',
      isEn ? 'Date / Ngày báo giá:' : 'Ngày báo giá:', quoteDate, '', '', '', '', ''
    ]);
    quoteRows.push([
      isEn ? 'Contact / Người liên hệ:' : 'Người liên hệ & SĐT:', clientPhone, '', '', '', '',
      isEn ? 'Validity / Hiệu lực:' : 'Thời hạn hiệu lực:', validUntil || (isEn ? '30 days from issued date' : '30 ngày kể từ ngày lập'), '', '', '', '', ''
    ]);
    quoteRows.push([
      isEn ? 'Tax ID / Mã số thuế:' : 'Mã số thuế:', clientTaxId, '', '', '', '',
      isEn ? 'Sales Rep / Đại diện KD:' : 'Đại diện kinh doanh:', `${salesName} (${salesPhone}) - ${salesRole}`, '', '', '', '', ''
    ]);
    quoteRows.push([]); // Spacer row 15

    // Row 16: Table Headers
    const headers = [
      isEn ? 'No.' : 'STT',
      isEn ? 'SKU Code' : 'Mã SKU',
      isEn ? 'Brand' : 'Thương Hiệu',
      isEn ? 'Item Description' : 'Tên Thiết Bị / Dịch Vụ',
      isEn ? 'Specifications & Features' : 'Thông Số Kỹ Thuật & Xuất Xứ',
      isEn ? 'Unit' : 'ĐVT',
      isEn ? 'Qty' : 'Số Lượng',
      isEn ? 'List Price (VND)' : 'Đơn Giá Niêm Yết (VNĐ)',
      isEn ? 'Discount %' : 'Chiết Khấu (%)',
      isEn ? 'Net Unit Price (VND)' : 'Đơn Giá Sau CK (VNĐ)',
      isEn ? 'VAT %' : 'VAT (%)',
      isEn ? 'VAT Amount (VND)' : 'Tiền Thuế VAT (VNĐ)',
      isEn ? 'Line Total (VND)' : 'Thành Tiền Chưa VAT (VNĐ)'
    ];
    quoteRows.push(headers);

    // Row 17+: Product Rows
    let subtotalUndiscounted = 0;
    let totalItemDiscount = 0;
    let subtotalAfterDiscount = 0;
    let totalVat = 0;

    rawItems.forEach((it, idx) => {
      const qty = Math.max(1, Number(it.quantity || 1));
      const listPrice = Number(it.base_unit_price || it.unit_price || it.base_price || 0);
      const discPct = Number(it.discount_pct || 0);
      const netUnitPrice = Math.round(listPrice * (1 - discPct / 100));
      const vatPct = Number(String(it.vat_rate || 10).replace('%', ''));
      const lineTotal = qty * netUnitPrice;
      const vatAmt = Math.round(lineTotal * (vatPct / 100));

      subtotalUndiscounted += (qty * listPrice);
      totalItemDiscount += ((qty * listPrice) - lineTotal);
      subtotalAfterDiscount += lineTotal;
      totalVat += vatAmt;

      const pName = isEn ? (it.name_en || it.name) : it.name;
      const pSpecs = isEn ? (it.specs_en || it.specs || '') : (it.specs || '');

      quoteRows.push([
        idx + 1,
        it.sku || '',
        it.brand || '',
        pName || '',
        pSpecs || '',
        it.unit || (isEn ? 'Pcs' : 'Bộ'),
        qty,
        listPrice,
        discPct > 0 ? `${discPct}%` : '0%',
        netUnitPrice,
        `${vatPct}%`,
        vatAmt,
        lineTotal
      ]);
    });

    quoteRows.push([]); // Spacer row after items

    // Additional commercial fees
    const invoiceDiscPct = Number(payload.invoice_discount_pct || 0);
    const invoiceDiscAmt = Number(payload.invoice_discount_amount || 0);
    const totalAdditionalDisc = invoiceDiscAmt > 0 ? invoiceDiscAmt : Math.round(subtotalAfterDiscount * (invoiceDiscPct / 100));
    
    const shippingFee = Number(payload.custom_shipping_fee || 0);
    const installFee = Number(payload.custom_install_fee || 0);

    const finalSubtotal = Math.max(0, subtotalAfterDiscount - totalAdditionalDisc);
    const grandTotal = finalSubtotal + totalVat + shippingFee + installFee;

    // Financial Summary Block
    quoteRows.push(['', '', '', '', '', '', '', '', '', '', '', isEn ? 'Subtotal (Before Disc.):' : 'Tổng tiền hàng trước chiết khấu:', subtotalUndiscounted]);
    if (totalItemDiscount > 0) {
      quoteRows.push(['', '', '', '', '', '', '', '', '', '', '', isEn ? 'Product Discounts:' : 'Chiết khấu theo dòng sản phẩm:', -totalItemDiscount]);
    }
    if (totalAdditionalDisc > 0) {
      quoteRows.push(['', '', '', '', '', '', '', '', '', '', '', isEn ? 'Invoice Extra Discount:' : 'Chiết khấu bổ sung toàn đơn hàng:', -totalAdditionalDisc]);
    }
    quoteRows.push(['', '', '', '', '', '', '', '', '', '', '', isEn ? 'Subtotal Excl. VAT:' : 'Tổng tiền hàng sau chiết khấu (Chưa VAT):', finalSubtotal]);
    
    if (shippingFee > 0) {
      quoteRows.push(['', '', '', '', '', '', '', '', '', '', '', isEn ? 'Domestic Shipping Fee:' : 'Phí vận chuyển & bốc dỡ nội địa:', shippingFee]);
    }
    if (installFee > 0) {
      quoteRows.push(['', '', '', '', '', '', '', '', '', '', '', isEn ? 'Installation & Calibration:' : 'Phí lắp đặt & chuyển giao kỹ thuật:', installFee]);
    }

    quoteRows.push(['', '', '', '', '', '', '', '', '', '', '', isEn ? 'Total VAT / Thuế GTGT:' : 'Tổng tiền thuế GTGT (VAT):', totalVat]);
    quoteRows.push(['', '', '', '', '', '', '', '', '', '', '', isEn ? 'GRAND TOTAL (INCL. VAT):' : 'TỔNG CỘNG THANH TOÁN (ĐÃ GỒM VAT):', grandTotal]);
    
    // Amount in Words
    const words = numberToVietnameseWords(grandTotal);
    quoteRows.push([]);
    quoteRows.push([isEn ? 'Amount in words:' : 'Số tiền viết bằng chữ:', words, '', '', '', '', '', '', '', '', '', '', '']);
    quoteRows.push([]); // Spacer

    // Signatures Block
    quoteRows.push([
      isEn ? 'CUSTOMER REPRESENTATIVE' : 'ĐẠI DIỆN KHÁCH HÀNG', '', '', '',
      isEn ? 'SALES REPRESENTATIVE' : 'ĐẠI DIỆN KINH DOANH', '', '', '',
      isEn ? 'SALES DIRECTOR APPROVAL' : 'GIÁM ĐỐC KINH DOANH DUYỆT', '', '', '', ''
    ]);
    quoteRows.push([
      isEn ? '(Signature & Stamp)' : '(Ký, ghi rõ họ tên & đóng dấu)', '', '', '',
      isEn ? '(Signed)' : '(Ký & ghi rõ họ tên)', '', '', '',
      isEn ? '(Approved)' : '(Phê duyệt)', '', '', '', ''
    ]);
    quoteRows.push([]);
    quoteRows.push([]);
    quoteRows.push([]);
    quoteRows.push([
      '', '', '', '',
      `${salesName}`, '', '', '',
      `${approverName}`, '', '', '', ''
    ]);
    quoteRows.push([
      '', '', '', '',
      `${salesRole}`, '', '', '',
      `${approverTitle}`, '', '', '', ''
    ]);

    // Build worksheet 1
    const wsQuote = XLSX.utils.aoa_to_sheet(quoteRows);

    // Set column widths
    wsQuote['!cols'] = [
      { wch: 6 },   // A: STT
      { wch: 18 },  // B: SKU
      { wch: 18 },  // C: Brand
      { wch: 34 },  // D: Name
      { wch: 45 },  // E: Specs
      { wch: 8 },   // F: Unit
      { wch: 9 },   // G: Qty
      { wch: 18 },  // H: List Price
      { wch: 12 },  // I: Disc %
      { wch: 18 },  // J: Net Price
      { wch: 9 },   // K: VAT %
      { wch: 16 },  // L: VAT Amt
      { wch: 22 }   // M: Line Total
    ];

    // Set merged headers
    wsQuote['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }, // Company title 1
      { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } }, // Company title 2
      { s: { r: 2, c: 0 }, e: { r: 2, c: 12 } }, // Address 1
      { s: { r: 3, c: 0 }, e: { r: 3, c: 12 } }, // Address 2
      { s: { r: 4, c: 0 }, e: { r: 4, c: 12 } }, // Hotline
      { s: { r: 6, c: 0 }, e: { r: 6, c: 12 } }, // Quote Title
      { s: { r: 7, c: 0 }, e: { r: 7, c: 12 } }  // Deal Title
    ];

    // 3. SHEET 2: DIEU KHOAN & BAO HANH (TERMS & POLICIES)
    const termsRows = [
      ['ĐIỀU KHOẢN THƯƠNG MẠI & CHÍNH SÁCH BẢO HÀNH CHÍNH HÃNG'],
      ['ATTIVO INTERNATIONAL COMMERCIAL TERMS & WARRANTY POLICIES'],
      [],
      ['1. HIỆU LỰC BÁO GIÁ (VALIDITY):'],
      ['Bảng báo giá có hiệu lực trong vòng 30 ngày kể từ ngày ban hành. Hết thời hạn trên, đơn giá có thể thay đổi tùy thuộc vào tỷ giá hối đoái và chính sách giá mới nhất từ các nhà sản xuất.'],
      [],
      ['2. ĐIỀU KIỆN & TIẾN ĐỘ GIAO HÀNG (DELIVERY TERMS):'],
      ['- Hàng hóa có sẵn tại kho Việt Nam: Bàn giao và lắp đặt trong vòng 03 - 05 ngày làm việc kể từ ngày nhận đủ tiền tạm ứng.'],
      ['- Hàng hóa nhập khẩu chính ngạch: Bàn giao trong vòng 30 - 60 ngày làm việc kể từ ngày hợp đồng có hiệu lực và nhận đủ tiền đặt cọc.'],
      ['- Địa điểm giao hàng: Tại mặt bằng công trình của Bên Mua, đã bao gồm chi phí vận chuyển, bốc dỡ vào đúng vị trí lắp đặt theo bản vẽ thiết kế 2D/3D đã thống nhất.'],
      [],
      ['3. PHƯƠNG THỨC THANH TOÁN (PAYMENT TERMS):'],
      ['- Đợt 1: Tạm ứng 50% tổng giá trị hợp đồng ngay sau khi hai bên ký kết hợp đồng thương mại.'],
      ['- Đợt 2: Thanh toán 50% còn lại trước khi giao hàng hoặc theo thỏa thuận tiến độ nghiệm thu hoàn tất bàn giao.'],
      ['- Hình thức thanh toán: Chuyển khoản ngân hàng vào tài khoản pháp nhân Công ty Cổ phần Thiết bị Quốc tế Attivo.'],
      [],
      ['4. CHÍNH SÁCH BẢO HÀNH CHÍNH HÃNG (WARRANTY POLICIES):'],
      ['- Thiết bị Cardio (Precor, Woodway): Khung sườn bảo hành 07 - 10 năm; Động cơ và bo mạch công suất bảo hành 03 - 05 năm; Băng tải và phụ tùng cơ học bảo hành 12 - 24 tháng.'],
      ['- Thiết bị Sức mạnh (Precor Strength, Watson, Eleiko): Khung thép chịu lực bảo hành trọn đời / 10 năm; Dây cáp, đệm mút và ròng rọc bảo hành 12 - 24 tháng.'],
      ['- Thiết bị Tạ tự do & Phụ kiện (Ziva, Eleiko): Đĩa tạ, tạ tay urethane, đòn tạ thi đấu bảo hành chính hãng từ 12 tháng đến 05 năm theo tiêu chuẩn từng phân hạng.'],
      ['- Giường tập Pilates Merrithew: Khung và lò xo chuyên dụng bảo hành 24 tháng; Dây đai và phụ kiện nệm bọc bảo hành 12 tháng.'],
      ['- Máy quét cơ thể Evolt 360: Thân máy và cảm biến đa tần số bảo hành 24 tháng kèm tài khoản phần mềm phân tích Evolt Insights.'],
      [],
      ['5. DỊCH VỤ BẢO TRÌ & HỖ TRỢ KỸ THUẬT (AFTER-SALES & MAINTENANCE):'],
      ['- Dịch vụ bảo trì định kỳ: Đội ngũ kỹ sư Attivo thực hiện kiểm tra, cân chỉnh, bôi trơn và bảo dưỡng định kỳ 03 tháng/lần miễn phí trong 12 tháng đầu tiên.'],
      ['- Cam kết thời gian phản ứng: Tiếp nhận sự cố 24/7 qua Hotline 1900 636 330. Kỹ sư có mặt xử lý trong vòng 04 - 08 giờ tại Hà Nội & TP. HCM; trong vòng 24 - 48 giờ tại các tỉnh thành khác.'],
      ['- Cam kết phụ tùng thay thế: 100% linh kiện thay thế chính hãng OEM, lưu kho sẵn sàng ít nhất 05 - 10 năm kể từ ngày bàn giao thiết bị.'],
      [],
      ['6. CHỨNG TỪ XUẤT XỨ & HÓA ĐƠN VAT (CERTIFICATES & INVOICE):'],
      ['Hàng hóa được cung cấp đầy đủ Hóa đơn Giá trị gia tăng (VAT) điện tử hợp pháp, Giấy chứng nhận xuất xứ (C/O) và Giấy chứng nhận chất lượng (C/Q) do nhà sản xuất phát hành.'],
      [],
      ['ĐẠI DIỆN ATTIVO INTERNATIONAL EQUIPMENT JSC'],
      ['Phòng Dịch Vụ Khách Hàng & Quản Lý Dự Án CPQ']
    ];

    const wsTerms = XLSX.utils.aoa_to_sheet(termsRows);
    wsTerms['!cols'] = [{ wch: 110 }];

    // 4. CREATE WORKBOOK & APPEND SHEETS
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsQuote, isEn ? 'Quotation' : 'Bao_Gia_Attivo');
    XLSX.utils.book_append_sheet(wb, wsTerms, isEn ? 'Terms_and_Warranty' : 'Dieu_Khoan_Bao_Hanh');

    return wb;
  }

  // Generate binary XLSX buffer (Uint8Array)
  function generateAttivoQuoteXLSXBytes(payload) {
    const XLSX = global.XLSX || (typeof require !== 'undefined' ? require('./assets/vendor/xlsx.full.min.js') : null);
    if (!XLSX) throw new Error('SheetJS is not loaded');
    const wb = buildAttivoQuoteWorkbook(payload);
    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  }

  // Trigger direct browser download of the genuine .xlsx file
  function downloadAttivoQuoteExcel(payload) {
    const XLSX = global.XLSX;
    if (!XLSX) {
      alert('Đang tải thư viện xử lý Excel, vui lòng thử lại sau 2 giây.');
      return;
    }
    try {
      const wb = buildAttivoQuoteWorkbook(payload);
      const quoteCode = payload.quote_code || `ATV-Q${new Date().toISOString().slice(2,10).replace(/-/g,'')}`;
      const lang = (payload.language || 'vi').toUpperCase();
      const filename = `${quoteCode}_${lang}.xlsx`;
      
      XLSX.writeFile(wb, filename);
      console.log(`[Attivo CPQ] Successfully exported genuine Excel: ${filename}`);
      return true;
    } catch (err) {
      console.error('[Attivo CPQ] Excel export error:', err);
      alert('Lỗi khi xuất file Excel: ' + err.message);
      return false;
    }
  }

  // Export functions to global window/module
  const AttivoExcel = {
    buildAttivoQuoteWorkbook,
    generateAttivoQuoteXLSXBytes,
    downloadAttivoQuoteExcel,
    numberToVietnameseWords
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AttivoExcel;
  } else {
    global.AttivoExcel = AttivoExcel;
  }
})(typeof window !== 'undefined' ? window : this);
