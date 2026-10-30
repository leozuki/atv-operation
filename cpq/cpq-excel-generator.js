/**
 * Attivo International — CPQ Excel (.xlsx) Quotation Exporter
 * Generates official, multi-sheet, beautifully formatted .xlsx spreadsheets
 * with dynamic Excel calculation formulas, embedded logos, and product photos using ExcelJS.
 *
 * Success Criteria & Architecture:
 * - 100% Genuine OpenXML .xlsx binary workbook
 * - Dynamic formulas for Net Price (=I10*(1-J10)), VAT (=N10*L10), Line Total (=K10*G10),
 *   Subtotal (=SUM(...)), Total VAT (=SUM(...)), and Grand Total (=Subtotal + VAT - Discount + Shipping)
 * - Embeds product photos in Column F (row height 75pt) with CORS bypass & WEBP->PNG conversion
 * - Embeds Attivo International Logo (A1:D3) and Partner Brands Banner (K1:N3)
 * - Authentic Attivo Navy styling (#00204A), zebra striping (#F8FAFC), thin borders (#CBD5E1)
 * - Sheet 1: "Bao_Gia_Attivo" (Official Commercial Quotation)
 * - Sheet 2: "Dieu_Khoan_Bao_Hanh" (Standard Terms & Warranty Policies)
 * - Full fallback to SheetJS (XLSX) if ExcelJS is not available
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
    return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng chẵn.';
  }

  // Helper: Fetch image URL, bypass CORS, convert WEBP->PNG, and return RAW base64
  async function fetchImageAsRawBase64(url) {
    if (!url) return null;
    try {
      let fetchUrl = String(url).trim();

      // If remote URL (e.g. attivointl.com), route through weserv to bypass CORS & convert WEBP to PNG
      if (fetchUrl.startsWith('http://') || fetchUrl.startsWith('https://')) {
        const cleanRemote = fetchUrl.replace(/^https?:\/\//, '');
        fetchUrl = `https://images.weserv.nl/?url=${encodeURIComponent(cleanRemote)}&w=220&output=png`;
      } else {
        // Local relative paths
        if (fetchUrl.startsWith('/')) {
          fetchUrl = fetchUrl.substring(1);
        }
      }

      // If SVG -> render to canvas PNG
      if (fetchUrl.toLowerCase().includes('.svg')) {
        return await convertSvgUrlToRawBase64(fetchUrl);
      }

      const res = await fetch(fetchUrl);
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const resStr = reader.result || '';
          // Strip data URI scheme to leave pure Base64
          const rawBase64 = resStr.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
          resolve(rawBase64);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('[CPQ Excel] Image fetch warning for', url, e);
      return null;
    }
  }

  // Convert SVG image to PNG raw base64 for Excel embedding
  async function convertSvgUrlToRawBase64(svgUrl, width = 160, height = 120) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png');
          const rawBase64 = dataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
          resolve(rawBase64);
        } catch (err) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = svgUrl;
    });
  }

  /**
   * Primary Exporter using ExcelJS with dynamic formulas and embedded photos
   */
  async function exportQuoteWithExcelJS(quoteData, fileName = 'Bao_Gia_Attivo.xlsx') {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Attivo International CPQ System';
    wb.lastModifiedBy = 'Attivo Sales Automation';
    wb.created = new Date();
    wb.modified = new Date();

    // -------------------------------------------------------------
    // SHEET 1: BAO GIA ATTIVO
    // -------------------------------------------------------------
    const ws = wb.addWorksheet('Bao_Gia_Attivo', {
      views: [{ showGridLines: true }],
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
    });

    // 14 Columns: A to N
    ws.columns = [
      { key: 'stt', width: 6 },        // A: STT
      { key: 'sku', width: 16 },       // B: Mã SKU
      { key: 'brand', width: 16 },     // C: Thương hiệu
      { key: 'name', width: 28 },      // D: Tên sản phẩm
      { key: 'specs', width: 44 },     // E: Thông số kỹ thuật
      { key: 'photo', width: 18 },     // F: Hình ảnh (Photo)
      { key: 'qty', width: 8 },        // G: Số lượng
      { key: 'unit', width: 9 },       // H: ĐVT
      { key: 'list_price', width: 17 },// I: Giá niêm yết
      { key: 'discount', width: 11 },  // J: Chiết khấu %
      { key: 'net_price', width: 17 }, // K: Đơn giá sau CK (Formula)
      { key: 'vat_pct', width: 10 },   // L: Thuế VAT
      { key: 'vat_amt', width: 16 },   // M: Tiền VAT (Formula)
      { key: 'total', width: 20 }      // N: Thành tiền trước VAT (Formula)
    ];

    // Color tokens
    const NAVY_HEX = '00204A';
    const SLATE_BORDER = 'CBD5E1';
    const SUBHEADER_FILL = 'F1F5F9';
    const ZEBRA_FILL = 'F8FAFC';

    const thinBorder = {
      top: { style: 'thin', color: { argb: SLATE_BORDER } },
      left: { style: 'thin', color: { argb: SLATE_BORDER } },
      bottom: { style: 'thin', color: { argb: SLATE_BORDER } },
      right: { style: 'thin', color: { argb: SLATE_BORDER } }
    };

    // Row 1 - 3 Heights
    ws.getRow(1).height = 28;
    ws.getRow(2).height = 24;
    ws.getRow(3).height = 22;

    // Company Title & Contacts
    ws.mergeCells('D1:J1');
    const compCell = ws.getCell('D1');
    compCell.value = 'CÔNG TY TNHH ATTIVO INTERNATIONAL (VIETNAM)';
    compCell.font = { name: 'Arial', size: 13, bold: true, color: { argb: NAVY_HEX } };
    compCell.alignment = { vertical: 'middle' };

    ws.mergeCells('D2:J2');
    const addrCell = ws.getCell('D2');
    addrCell.value = 'Trụ sở: Tòa nhà Detech, Số 8 Tôn Thất Thuyết, Cầu Giấy, Hà Nội | VP HCM: Tầng 3, 85 Cách Mạng Tháng 8, Q.1';
    addrCell.font = { name: 'Arial', size: 9, color: { argb: '475569' } };
    addrCell.alignment = { vertical: 'middle', wrapText: true };

    ws.mergeCells('D3:J3');
    const repName = quoteData.sales_rep || quoteData.created_by_name || 'Nguyễn Văn Nam (0973 323 065)';
    const hotCell = ws.getCell('D3');
    hotCell.value = `Hotline: 1900 636 330  |  Website: www.attivointl.com  |  Phụ trách báo giá: ${repName}`;
    hotCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: NAVY_HEX } };
    hotCell.alignment = { vertical: 'middle' };

    // Fetch and Embed Logos
    try {
      const logoRaw = await fetchImageAsRawBase64('assets/extracted/evn_r01_c01_0.png');
      if (logoRaw) {
        const logoId = wb.addImage({
          base64: logoRaw,
          extension: 'png'
        });
        ws.addImage(logoId, {
          tl: { col: 0, row: 0 },
          ext: { width: 155, height: 72 },
          editAs: 'undefined'
        });
      }

      const bannerRaw = await fetchImageAsRawBase64('assets/extracted/quote_r01_c09_1.png');
      if (bannerRaw) {
        const bannerId = wb.addImage({
          base64: bannerRaw,
          extension: 'png'
        });
        ws.addImage(bannerId, {
          tl: { col: 10, row: 0 },
          ext: { width: 230, height: 68 },
          editAs: 'undefined'
        });
      }
    } catch (err) {
      console.warn('[CPQ Excel] Logo embedding warning:', err);
    }

    // Row 4: Blank spacing
    ws.getRow(4).height = 10;

    // Row 5: Title
    ws.getRow(5).height = 28;
    ws.mergeCells('A5:N5');
    const titleCell = ws.getCell('A5');
    titleCell.value = 'BẢNG BÁO GIÁ THIẾT BỊ & DỊCH VỤ CHÍNH HÃNG';
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: NAVY_HEX } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SUBHEADER_FILL } };

    // Customer & Quote Meta (Rows 6-8)
    const clientName = quoteData.customer_name || quoteData.client_name || 'Quý Khách Hàng / Đối Tác';
    const dealName = quoteData.deal_name || quoteData.project_name || 'Dự án thể thao & phòng tập Attivo';
    const clientAddr = quoteData.customer_address || quoteData.client_address || 'Việt Nam';
    const quoteCode = quoteData.quote_code || 'ATV-QUOTE-' + Date.now();
    const quoteDate = quoteData.created_at ? quoteData.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const validUntil = quoteData.valid_until ? quoteData.valid_until.slice(0, 10) : '';

    ws.getRow(6).height = 20;
    ws.getCell('A6').value = 'Kính gửi:';
    ws.getCell('A6').font = { name: 'Arial', size: 10, bold: true };
    ws.mergeCells('B6:H6');
    ws.getCell('B6').value = clientName;
    ws.getCell('B6').font = { name: 'Arial', size: 10, bold: true, color: { argb: NAVY_HEX } };

    ws.getCell('I6').value = 'Số báo giá:';
    ws.getCell('I6').font = { name: 'Arial', size: 10, bold: true };
    ws.mergeCells('J6:N6');
    ws.getCell('J6').value = quoteCode;
    ws.getCell('J6').font = { name: 'Arial', size: 10, bold: true, color: { argb: NAVY_HEX } };

    ws.getRow(7).height = 20;
    ws.getCell('A7').value = 'Dự án:';
    ws.getCell('A7').font = { name: 'Arial', size: 10, bold: true };
    ws.mergeCells('B7:H7');
    ws.getCell('B7').value = dealName;
    ws.getCell('B7').font = { name: 'Arial', size: 10 };

    ws.getCell('I7').value = 'Ngày báo giá:';
    ws.getCell('I7').font = { name: 'Arial', size: 10, bold: true };
    ws.mergeCells('J7:N7');
    ws.getCell('J7').value = quoteDate;
    ws.getCell('J7').font = { name: 'Arial', size: 10 };

    ws.getRow(8).height = 20;
    ws.getCell('A8').value = 'Địa chỉ:';
    ws.getCell('A8').font = { name: 'Arial', size: 10, bold: true };
    ws.mergeCells('B8:H8');
    ws.getCell('B8').value = clientAddr;
    ws.getCell('B8').font = { name: 'Arial', size: 10 };

    ws.getCell('I8').value = 'Hiệu lực:';
    ws.getCell('I8').font = { name: 'Arial', size: 10, bold: true };
    ws.mergeCells('J8:N8');
    ws.getCell('J8').value = validUntil || '30 ngày kể từ ngày phát hành';
    ws.getCell('J8').font = { name: 'Arial', size: 10 };

    // Row 9: Table Header
    ws.getRow(9).height = 32;
    const headers = [
      'STT',
      'Mã SKU',
      'Thương hiệu',
      'Tên sản phẩm',
      'Thông số & Tính năng nổi bật',
      'Hình ảnh (Photo)',
      'Số lượng',
      'ĐVT',
      'Đơn giá niêm yết (VNĐ)',
      'Chiết khấu (%)',
      'Đơn giá sau CK (VNĐ)',
      'Thuế VAT (%)',
      'Tiền VAT (VNĐ)',
      'Thành tiền trước VAT (VNĐ)'
    ];

    headers.forEach((h, idx) => {
      const cell = ws.getCell(9, idx + 1);
      cell.value = h;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_HEX } };
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder;
    });

    // Items population
    const items = quoteData.items || [];
    const startRow = 10;
    let currentRow = startRow;

    let subtotalExclVat = 0;
    let totalVat = 0;

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const r = ws.getRow(currentRow);
      r.height = 75; // 75pt for photo

      const isEven = (i % 2 === 1);
      const rowFill = isEven ? { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA_FILL } } : null;

      const qty = parseFloat(it.quantity || it.qty) || 1;
      const listPrice = parseFloat(it.base_price || it.unit_price) || 0;
      const discPct = parseFloat(it.discount_pct) || 0;
      const netPrice = parseFloat(it.final_unit_price || it.unit_price) || (listPrice * (1 - discPct / 100));
      const vatRate = parseFloat(it.vat_rate) || 10;
      const lineTotal = parseFloat(it.line_total || it.total_price) || (netPrice * qty);
      const lineVat = (lineTotal * vatRate) / 100;

      subtotalExclVat += lineTotal;
      totalVat += lineVat;

      // Col A: STT
      const cA = ws.getCell(`A${currentRow}`);
      cA.value = i + 1;
      cA.alignment = { horizontal: 'center', vertical: 'middle' };

      // Col B: SKU
      const cB = ws.getCell(`B${currentRow}`);
      cB.value = it.sku || '';
      cB.font = { name: 'Arial', size: 9, bold: true, color: { argb: NAVY_HEX } };
      cB.alignment = { horizontal: 'center', vertical: 'middle' };

      // Col C: Brand
      const cC = ws.getCell(`C${currentRow}`);
      cC.value = it.brand || it.brand_main || 'Attivo';
      cC.alignment = { horizontal: 'center', vertical: 'middle' };

      // Col D: Product Name
      const cD = ws.getCell(`D${currentRow}`);
      cD.value = it.name || '';
      cD.font = { name: 'Arial', size: 10, bold: true };
      cD.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

      // Col E: Specs
      const cE = ws.getCell(`E${currentRow}`);
      cE.value = it.specs || it.description || 'Sản phẩm chính hãng do Attivo International phân phối độc quyền.';
      cE.font = { name: 'Arial', size: 9, color: { argb: '334155' } };
      cE.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

      // Col F: Photo placeholder & Image embedding
      const cF = ws.getCell(`F${currentRow}`);
      cF.value = '';
      cF.alignment = { horizontal: 'center', vertical: 'middle' };

      // Embed product image in Col F
      if (it.image_url) {
        try {
          const imgRaw = await fetchImageAsRawBase64(it.image_url);
          if (imgRaw) {
            // WeServ output is always PNG
            const imgId = wb.addImage({
              base64: imgRaw,
              extension: 'png'
            });
            // Col F is index 5 (0-based), Row is currentRow - 1 (0-based)
            ws.addImage(imgId, {
              tl: { col: 5, row: currentRow - 1 },
              ext: { width: 95, height: 70 },
              editAs: 'oneCell'
            });
          }
        } catch (e) {
          console.warn('[CPQ Excel] Product image error for row', currentRow, e);
        }
      }

      // Col G: Qty
      const cG = ws.getCell(`G${currentRow}`);
      cG.value = qty;
      cG.numFmt = '#,##0';
      cG.alignment = { horizontal: 'center', vertical: 'middle' };

      // Col H: Unit
      const cH = ws.getCell(`H${currentRow}`);
      cH.value = it.unit || 'Bộ';
      cH.alignment = { horizontal: 'center', vertical: 'middle' };

      // Col I: List Price
      const cI = ws.getCell(`I${currentRow}`);
      cI.value = listPrice;
      cI.numFmt = '#,##0';
      cI.alignment = { horizontal: 'right', vertical: 'middle' };

      // Col J: Discount %
      const cJ = ws.getCell(`J${currentRow}`);
      cJ.value = discPct / 100;
      cJ.numFmt = '0.0%';
      cJ.alignment = { horizontal: 'center', vertical: 'middle' };

      // Col K: Net Price (DYNAMIC FORMULA: =I*(1-J))
      const cK = ws.getCell(`K${currentRow}`);
      cK.value = {
        formula: `I${currentRow}*(1-J${currentRow})`,
        result: netPrice
      };
      cK.numFmt = '#,##0';
      cK.font = { name: 'Arial', size: 10, bold: true };
      cK.alignment = { horizontal: 'right', vertical: 'middle' };

      // Col L: VAT Rate
      const cL = ws.getCell(`L${currentRow}`);
      cL.value = vatRate / 100;
      cL.numFmt = '0%';
      cL.alignment = { horizontal: 'center', vertical: 'middle' };

      // Col M: VAT Amount (DYNAMIC FORMULA: =N*L)
      const cM = ws.getCell(`M${currentRow}`);
      cM.value = {
        formula: `N${currentRow}*L${currentRow}`,
        result: lineVat
      };
      cM.numFmt = '#,##0';
      cM.alignment = { horizontal: 'right', vertical: 'middle' };

      // Col N: Line Total (DYNAMIC FORMULA: =K*G)
      const cN = ws.getCell(`N${currentRow}`);
      cN.value = {
        formula: `K${currentRow}*G${currentRow}`,
        result: lineTotal
      };
      cN.numFmt = '#,##0';
      cN.font = { name: 'Arial', size: 10, bold: true, color: { argb: NAVY_HEX } };
      cN.alignment = { horizontal: 'right', vertical: 'middle' };

      // Apply borders & row zebra
      for (let col = 1; col <= 14; col++) {
        const cell = ws.getCell(currentRow, col);
        cell.border = thinBorder;
        if (rowFill) cell.fill = rowFill;
      }

      currentRow++;
    }

    const endItemRow = currentRow - 1;

    // -------------------------------------------------------------
    // SUMMARY SECTION WITH DYNAMIC EXCEL FORMULAS
    // -------------------------------------------------------------
    const globalDiscount = parseFloat(quoteData.global_discount_amount) || 0;
    const shippingFee = parseFloat(quoteData.shipping_fee) || 0;
    const installationFee = parseFloat(quoteData.installation_fee) || 0;

    // Summary Row 1: Tổng cộng tiền hàng trước thuế (=SUM(N10:N{end}))
    const subtotalRowIdx = currentRow;
    ws.getRow(subtotalRowIdx).height = 24;
    ws.mergeCells(`A${subtotalRowIdx}:M${subtotalRowIdx}`);
    const sumLbl1 = ws.getCell(`A${subtotalRowIdx}`);
    sumLbl1.value = 'TỔNG CỘNG TIỀN HÀNG TRƯỚC THUẾ (SUBTOTAL EXCL. VAT):';
    sumLbl1.font = { name: 'Arial', size: 10, bold: true };
    sumLbl1.alignment = { horizontal: 'right', vertical: 'middle' };
    const sumVal1 = ws.getCell(`N${subtotalRowIdx}`);
    sumVal1.value = {
      formula: `SUM(N${startRow}:N${endItemRow})`,
      result: subtotalExclVat
    };
    sumVal1.numFmt = '#,##0';
    sumVal1.font = { name: 'Arial', size: 10, bold: true };
    sumVal1.alignment = { horizontal: 'right', vertical: 'middle' };
    sumLbl1.border = thinBorder;
    sumVal1.border = thinBorder;
    currentRow++;

    let discountRowIdx = null;
    if (globalDiscount > 0) {
      discountRowIdx = currentRow;
      ws.getRow(discountRowIdx).height = 22;
      ws.mergeCells(`A${discountRowIdx}:M${discountRowIdx}`);
      const discLbl = ws.getCell(`A${discountRowIdx}`);
      discLbl.value = 'CHIẾT KHẤU ĐẶC BIỆT DỰ ÁN (GLOBAL PROJECT DISCOUNT):';
      discLbl.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'B45309' } };
      discLbl.alignment = { horizontal: 'right', vertical: 'middle' };
      const discVal = ws.getCell(`N${discountRowIdx}`);
      discVal.value = -globalDiscount;
      discVal.numFmt = '#,##0';
      discVal.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'B45309' } };
      discVal.alignment = { horizontal: 'right', vertical: 'middle' };
      discLbl.border = thinBorder;
      discVal.border = thinBorder;
      currentRow++;
    }

    let shippingRowIdx = null;
    if (shippingFee > 0 || installationFee > 0) {
      shippingRowIdx = currentRow;
      ws.getRow(shippingRowIdx).height = 22;
      ws.mergeCells(`A${shippingRowIdx}:M${shippingRowIdx}`);
      const shipLbl = ws.getCell(`A${shippingRowIdx}`);
      shipLbl.value = 'PHÍ VẬN CHUYỂN, BỐC XẾP & LẮP ĐẶT HOÀN THIỆN:';
      shipLbl.font = { name: 'Arial', size: 10, bold: true };
      shipLbl.alignment = { horizontal: 'right', vertical: 'middle' };
      const shipVal = ws.getCell(`N${shippingRowIdx}`);
      shipVal.value = shippingFee + installationFee;
      shipVal.numFmt = '#,##0';
      shipVal.font = { name: 'Arial', size: 10 };
      shipVal.alignment = { horizontal: 'right', vertical: 'middle' };
      shipLbl.border = thinBorder;
      shipVal.border = thinBorder;
      currentRow++;
    }

    // Summary Row: Thuế VAT (=SUM(M10:M{end}))
    const vatRowIdx = currentRow;
    ws.getRow(vatRowIdx).height = 22;
    ws.mergeCells(`A${vatRowIdx}:M${vatRowIdx}`);
    const vatLbl = ws.getCell(`A${vatRowIdx}`);
    vatLbl.value = 'THUẾ GIÁ TRỊ GIA TĂNG (VAT):';
    vatLbl.font = { name: 'Arial', size: 10, bold: true };
    vatLbl.alignment = { horizontal: 'right', vertical: 'middle' };
    const vatVal = ws.getCell(`N${vatRowIdx}`);
    vatVal.value = {
      formula: `SUM(M${startRow}:M${endItemRow})`,
      result: totalVat
    };
    vatVal.numFmt = '#,##0';
    vatVal.font = { name: 'Arial', size: 10 };
    vatVal.alignment = { horizontal: 'right', vertical: 'middle' };
    vatLbl.border = thinBorder;
    vatVal.border = thinBorder;
    currentRow++;

    // Summary Row: TỔNG CỘNG THANH TOÁN (GRAND TOTAL) with Formula
    const grandRowIdx = currentRow;
    ws.getRow(grandRowIdx).height = 30;
    ws.mergeCells(`A${grandRowIdx}:M${grandRowIdx}`);
    const grandLbl = ws.getCell(`A${grandRowIdx}`);
    grandLbl.value = 'TỔNG CỘNG THANH TOÁN (GRAND TOTAL INCL. VAT):';
    grandLbl.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    grandLbl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_HEX } };
    grandLbl.alignment = { horizontal: 'right', vertical: 'middle' };

    // Build formula: Subtotal + VAT (+ shipping) (+ discount)
    let grandFormula = `N${subtotalRowIdx}+N${vatRowIdx}`;
    if (discountRowIdx) grandFormula += `+N${discountRowIdx}`; // discount is already negative
    if (shippingRowIdx) grandFormula += `+N${shippingRowIdx}`;

    const grandTotal = parseFloat(quoteData.grand_total) || (subtotalExclVat - globalDiscount + shippingFee + installationFee + totalVat);

    const grandVal = ws.getCell(`N${grandRowIdx}`);
    grandVal.value = {
      formula: grandFormula,
      result: grandTotal
    };
    grandVal.numFmt = '#,##0';
    grandVal.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFF' } };
    grandVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_HEX } };
    grandVal.alignment = { horizontal: 'right', vertical: 'middle' };

    grandLbl.border = thinBorder;
    grandVal.border = thinBorder;
    currentRow++;

    // Row: Amount in words
    ws.getRow(currentRow).height = 26;
    ws.mergeCells(`A${currentRow}:N${currentRow}`);
    const wordsCell = ws.getCell(`A${currentRow}`);
    wordsCell.value = `Số tiền viết bằng chữ: ${numberToVietnameseWords(grandTotal)}`;
    wordsCell.font = { name: 'Arial', size: 10, italic: true, bold: true, color: { argb: NAVY_HEX } };
    wordsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } }; // Soft amber fill
    wordsCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    wordsCell.border = thinBorder;
    currentRow += 2;

    // Signature Block (2 columns)
    ws.getRow(currentRow).height = 22;
    ws.mergeCells(`B${currentRow}:E${currentRow}`);
    const sigLeftLbl = ws.getCell(`B${currentRow}`);
    sigLeftLbl.value = 'ĐẠI DIỆN KHÁCH HÀNG / CLIENT';
    sigLeftLbl.font = { name: 'Arial', size: 10, bold: true, color: { argb: NAVY_HEX } };
    sigLeftLbl.alignment = { horizontal: 'center', vertical: 'middle' };

    ws.mergeCells(`J${currentRow}:N${currentRow}`);
    const sigRightLbl = ws.getCell(`J${currentRow}`);
    sigRightLbl.value = 'ĐẠI DIỆN ATTIVO INTERNATIONAL';
    sigRightLbl.font = { name: 'Arial', size: 10, bold: true, color: { argb: NAVY_HEX } };
    sigRightLbl.alignment = { horizontal: 'center', vertical: 'middle' };
    currentRow++;

    ws.getRow(currentRow).height = 18;
    ws.mergeCells(`B${currentRow}:E${currentRow}`);
    ws.getCell(`B${currentRow}`).value = '(Ký, ghi rõ họ tên & đóng dấu)';
    ws.getCell(`B${currentRow}`).font = { name: 'Arial', size: 9, italic: true, color: { argb: '64748B' } };
    ws.getCell(`B${currentRow}`).alignment = { horizontal: 'center' };

    ws.mergeCells(`J${currentRow}:N${currentRow}`);
    ws.getCell(`J${currentRow}`).value = '(Ký, ghi rõ họ tên & đóng dấu)';
    ws.getCell(`J${currentRow}`).font = { name: 'Arial', size: 9, italic: true, color: { argb: '64748B' } };
    ws.getCell(`J${currentRow}`).alignment = { horizontal: 'center' };

    currentRow += 5; // Spacing for physical signature

    ws.getRow(currentRow).height = 22;
    ws.mergeCells(`J${currentRow}:N${currentRow}`);
    const signerCell = ws.getCell(`J${currentRow}`);
    signerCell.value = 'Bà Phạm Thị Thu Thủy — Giám Đốc Kinh Doanh';
    signerCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: NAVY_HEX } };
    signerCell.alignment = { horizontal: 'center' };

    // -------------------------------------------------------------
    // SHEET 2: DIEU KHOAN & BAO HANH (STANDARD TERMS)
    // -------------------------------------------------------------
    const ws2 = wb.addWorksheet('Dieu_Khoan_Bao_Hanh', {
      views: [{ showGridLines: true }]
    });

    ws2.columns = [
      { key: 'colA', width: 6 },
      { key: 'colB', width: 30 },
      { key: 'colC', width: 85 }
    ];

    ws2.getRow(1).height = 28;
    ws2.mergeCells('A1:C1');
    const termTitle = ws2.getCell('A1');
    termTitle.value = 'ĐIỀU KHOẢN THƯƠNG MẠI & CHÍNH SÁCH BẢO HÀNH CHÍNH HÃNG';
    termTitle.font = { name: 'Arial', size: 13, bold: true, color: { argb: NAVY_HEX } };
    termTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    termTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SUBHEADER_FILL } };

    const terms = [
      { stt: 1, title: 'Hiệu lực báo giá', content: 'Báo giá có giá trị trong vòng 30 ngày kể từ ngày phát hành. Sau thời gian này, đơn giá có thể điều chỉnh tùy theo tỷ giá ngoại tệ và biểu phí hải quan.' },
      { stt: 2, title: 'Đồng tiền thanh toán', content: 'Đồng Việt Nam (VNĐ). Nếu thanh toán bằng ngoại tệ (USD/EUR), áp dụng theo tỷ giá bán ra của Vietcombank tại thời điểm thanh toán.' },
      { stt: 3, title: 'Phương thức thanh toán', content: 'Đợt 1: Tạm ứng 40% ngay sau khi ký hợp đồng để đặt hàng từ hãng.\nĐợt 2: Thanh toán 40% khi hàng về đến cảng/kho của Attivo tại Việt Nam.\nĐợt 3: Thanh toán 20% còn lại trong vòng 07 ngày sau khi nghiệm thu, bàn giao hoàn thiện.' },
      { stt: 4, title: 'Thời gian giao hàng', content: 'Hàng có sẵn trong kho: Giao trong vòng 03 - 07 ngày làm việc kể từ ngày nhận tạm ứng.\nHàng đặt từ hãng sản xuất: Giao trong vòng 60 - 90 ngày tùy theo kế hoạch sản xuất của nhà máy.' },
      { stt: 5, title: 'Bảo hành thiết bị', content: 'Khung thép & cấu trúc chịu lực: Bảo hành 10 năm.\nĐộng cơ, motor, bo mạch điều khiển: Bảo hành 03 - 05 năm (theo tiêu chuẩn chính hãng Precor/Watson/Woodway).\nCác bộ phận hao mòn (dây cáp, puly, nệm, bọc da, bàn đạp): Bảo hành 12 tháng.' },
      { stt: 6, title: 'Bảo trì định kỳ', content: 'Attivo cung cấp dịch vụ bảo dưỡng định kỳ miễn phí 04 lần trong năm đầu tiên sử dụng đối với toàn bộ hệ thống máy tập chính.' },
      { stt: 7, title: 'Trách nhiệm mặt bằng', content: 'Bên mua có trách nhiệm chuẩn bị mặt bằng lắp đặt sạch sẽ, nguồn điện kỹ thuật đúng tiêu chuẩn (220V/50Hz có tiếp địa độc lập) và thang máy chở hàng/lối vận chuyển tiếp cận phòng tập.' }
    ];

    ws2.getRow(3).height = 24;
    ['STT', 'Hạng Mục', 'Nội Dung Chi Tiết'].forEach((h, idx) => {
      const cell = ws2.getCell(3, idx + 1);
      cell.value = h;
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_HEX } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = thinBorder;
    });

    let tRow = 4;
    terms.forEach(t => {
      ws2.getRow(tRow).height = t.content.includes('\n') ? 54 : 32;
      const c1 = ws2.getCell(`A${tRow}`);
      c1.value = t.stt;
      c1.alignment = { horizontal: 'center', vertical: 'middle' };
      c1.border = thinBorder;

      const c2 = ws2.getCell(`B${tRow}`);
      c2.value = t.title;
      c2.font = { name: 'Arial', size: 10, bold: true };
      c2.alignment = { horizontal: 'left', vertical: 'middle' };
      c2.border = thinBorder;

      const c3 = ws2.getCell(`C${tRow}`);
      c3.value = t.content;
      c3.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      c3.border = thinBorder;

      tRow++;
    });

    // Write buffer and trigger browser download
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Main export dispatcher:
   * Uses ExcelJS if available, otherwise seamlessly falls back to SheetJS (XLSX)
   */
  async function exportAttivoQuotationExcel(quoteData, customFileName = null) {
    const code = quoteData.quote_code || 'ATV-QUOTE';
    const client = (quoteData.customer_name || quoteData.client_name || 'Khach_Hang')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const fileName = customFileName || `Bao_Gia_${code}_${client}.xlsx`;

    // Priority 1: ExcelJS (Rich styling + Embedded Logos & Photos + Dynamic Formulas)
    if (typeof ExcelJS !== 'undefined') {
      try {
        await exportQuoteWithExcelJS(quoteData, fileName);
        return { success: true, engine: 'ExcelJS' };
      } catch (err) {
        console.warn('[CPQ Excel] ExcelJS generation failed, falling back to SheetJS:', err);
      }
    }

    // Priority 2: SheetJS (XLSX) Fallback
    if (typeof XLSX !== 'undefined') {
      try {
        exportQuoteWithSheetJS(quoteData, fileName);
        return { success: true, engine: 'SheetJS' };
      } catch (err) {
        console.error('[CPQ Excel] SheetJS generation error:', err);
        throw err;
      }
    }

    throw new Error('Không tìm thấy thư viện xuất Excel (ExcelJS hoặc SheetJS)!');
  }

  /**
   * SheetJS fallback generator
   */
  function exportQuoteWithSheetJS(quoteData, fileName) {
    const wb = XLSX.utils.book_new();
    const rows = [
      ['CÔNG TY TNHH ATTIVO INTERNATIONAL (VIETNAM)'],
      ['Trụ sở: Tòa nhà Detech, Số 8 Tôn Thất Thuyết, Cầu Giấy, Hà Nội | VP HCM: Tầng 3, 85 Cách Mạng Tháng 8, Q.1'],
      ['Hotline: 1900 636 330  |  Website: www.attivointl.com'],
      [],
      ['BẢNG BÁO GIÁ THIẾT BỊ & DỊCH VỤ CHÍNH HÃNG'],
      ['Kính gửi:', quoteData.customer_name || quoteData.client_name || 'Quý Khách Hàng', '', '', '', '', '', '', 'Số báo giá:', quoteData.quote_code || 'ATV-QUOTE'],
      ['Dự án:', quoteData.deal_name || 'Dự án phòng tập', '', '', '', '', '', '', 'Ngày báo giá:', (quoteData.created_at || '').slice(0, 10)],
      ['Địa chỉ:', quoteData.customer_address || 'Việt Nam', '', '', '', '', '', '', 'Hiệu lực:', quoteData.valid_until ? quoteData.valid_until.slice(0, 10) : '30 ngày'],
      [],
      ['STT', 'Mã SKU', 'Thương hiệu', 'Tên sản phẩm', 'Thông số & Tính năng nổi bật', 'Hình ảnh', 'Số lượng', 'ĐVT', 'Đơn giá niêm yết (VNĐ)', 'Chiết khấu (%)', 'Đơn giá sau CK (VNĐ)', 'Thuế VAT (%)', 'Tiền VAT (VNĐ)', 'Thành tiền trước VAT (VNĐ)']
    ];

    const items = quoteData.items || [];
    let subtotal = 0;
    let totalVat = 0;

    items.forEach((it, idx) => {
      const qty = parseFloat(it.quantity || it.qty) || 1;
      const listPrice = parseFloat(it.base_price || it.unit_price) || 0;
      const discPct = parseFloat(it.discount_pct) || 0;
      const netPrice = parseFloat(it.final_unit_price || it.unit_price) || (listPrice * (1 - discPct / 100));
      const vatRate = parseFloat(it.vat_rate) || 10;
      const lineTotal = parseFloat(it.line_total || it.total_price) || (netPrice * qty);
      const lineVat = (lineTotal * vatRate) / 100;

      subtotal += lineTotal;
      totalVat += lineVat;

      rows.push([
        idx + 1,
        it.sku || '',
        it.brand || it.brand_main || 'Attivo',
        it.name || '',
        it.specs || it.description || '',
        it.image_url ? 'Có ảnh đính kèm' : 'Chưa có ảnh',
        qty,
        it.unit || 'Bộ',
        listPrice,
        discPct / 100,
        netPrice,
        vatRate / 100,
        lineVat,
        lineTotal
      ]);
    });

    const grandTotal = subtotal + totalVat;
    rows.push([]);
    rows.push(['', '', '', '', '', '', '', '', '', '', '', 'TỔNG TIỀN HÀNG TRƯỚC THUẾ:', '', subtotal]);
    rows.push(['', '', '', '', '', '', '', '', '', '', '', 'THUẾ GIÁ TRỊ GIA TĂNG (VAT):', '', totalVat]);
    rows.push(['', '', '', '', '', '', '', '', '', '', '', 'TỔNG CỘNG THANH TOÁN (VNĐ):', '', grandTotal]);
    rows.push(['Số tiền viết bằng chữ:', numberToVietnameseWords(grandTotal)]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 }, { wch: 16 }, { wch: 16 }, { wch: 28 }, { wch: 44 }, { wch: 16 },
      { wch: 8 }, { wch: 8 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 12 },
      { wch: 15 }, { wch: 18 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Bao_Gia_Attivo');
    XLSX.writeFile(wb, fileName);
  }

  // Expose to window
  global.exportAttivoQuotationExcel = exportAttivoQuotationExcel;
  global.AttivoExcel = {
    exportAttivoQuotationExcel: exportAttivoQuotationExcel,
    downloadAttivoQuoteExcel: exportAttivoQuotationExcel,
    generateQuoteExcel: exportAttivoQuotationExcel
  };

})(typeof window !== 'undefined' ? window : this);
