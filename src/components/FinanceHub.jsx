import React, { useState } from "react";
import { formatVND } from "../utils/formatters";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";

export default function FinanceHub({ collections, onAddCollection }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBank, setSelectedBank] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // New collection form state
  const [newCustomer, setNewCustomer] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState("2026-10-12");
  const [newDealType, setNewDealType] = useState("Thanh toán hợp đồng cung cấp thiết bị");
  const [newBank, setNewBank] = useState("Chuyển khoản VCB");
  const [newNotes, setNewNotes] = useState("");

  const totalVND = collections.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalUSD = (totalVND / 26000).toFixed(2);

  const filteredCollections = collections.filter((c) => {
    const matchSearch =
      c.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dealType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBank = selectedBank === "all" || c.paymentMethod.includes(selectedBank);
    return matchSearch && matchBank;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCustomer || !newAmount) return;

    const newEntry = {
      id: `COL-${Date.now()}`,
      customer: newCustomer.toUpperCase(),
      amount: Number(newAmount),
      date: newDate,
      dealType: newDealType,
      paymentMethod: newBank,
      status: "collected",
      notes: newNotes || "Đã xác nhận tiền vào tài khoản",
    };

    onAddCollection(newEntry);
    setNewCustomer("");
    setNewAmount("");
    setNewNotes("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </span>
          <h1 className="text-lg md:text-xl font-bold text-slate-900">
            Tài Chính & Thu Tiền
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ghi Nhận Khoản Thu Mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng Tiền Thu Về (VNĐ)
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {formatVND(totalVND)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% tiền thực đã nổi tài khoản ngân hàng</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quy Đổi Đô La (USD)
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-blue-600 mt-2">
            ${Number(totalUSD).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Tỷ giá quy đổi nội bộ WBR: 1 USD ≈ 26,000 VNĐ
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Số Lượng Khách Thanh Toán
            </span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-purple-700 mt-2">
            {collections.length} Khách Hàng
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Từ 29/09 đến 03/10/2026
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mục Tiêu Dòng Tiền Tuần
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">
            Đạt 107.8%
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Vượt kế hoạch thu hồi công nợ tuần 1 tỷ VNĐ
          </div>
        </div>
      </div>

      {/* Cash Contribution Progress Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
          <span>Phân Bổ Tỷ Trọng Dòng Tiền Đóng Góp Trong Tuần</span>
          <span className="text-xs font-normal text-slate-500">8 Khách Hàng</span>
        </h3>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
          {collections.map((c, i) => {
            const pct = ((c.amount / totalVND) * 100).toFixed(1);
            const colors = [
              "bg-emerald-500",
              "bg-blue-500",
              "bg-indigo-500",
              "bg-purple-500",
              "bg-pink-500",
              "bg-amber-500",
              "bg-cyan-500",
              "bg-teal-500",
            ];
            return (
              <div
                key={c.id || i}
                style={{ width: `${pct}%` }}
                className={`${colors[i % colors.length]} h-full transition-all duration-300 hover:opacity-80`}
                title={`${c.customer}: ${formatVND(c.amount)} (${pct}%)`}
              />
            );
          })}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs">
          {collections.map((c, i) => {
            const pct = ((c.amount / totalVND) * 100).toFixed(1);
            const dotColors = [
              "bg-emerald-500",
              "bg-blue-500",
              "bg-indigo-500",
              "bg-purple-500",
              "bg-pink-500",
              "bg-amber-500",
              "bg-cyan-500",
              "bg-teal-500",
            ];
            return (
              <div key={c.id || i} className="flex items-center gap-1.5 text-slate-600">
                <span className={`w-2 h-2 rounded-full ${dotColors[i % dotColors.length]}`} />
                <span className="font-semibold text-slate-800 truncate">{c.customer}:</span>
                <span>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm theo tên khách hàng, nội dung thanh toán, ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>

        <select
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
        >
          <option value="all">Tất cả ngân hàng thụ hưởng</option>
          <option value="VCB">Vietcombank (VCB)</option>
          <option value="BIDV">BIDV</option>
          <option value="Techcombank">Techcombank</option>
          <option value="ACB">ACB</option>
          <option value="Vietinbank">Vietinbank</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">STT</th>
                <th className="py-3.5 px-4">Khách Hàng (Customer)</th>
                <th className="py-3.5 px-4 text-right">Số Tiền (VNĐ)</th>
                <th className="py-3.5 px-4 text-right">Quy Đổi (USD)</th>
                <th className="py-3.5 px-4">Ngày Tiền Về</th>
                <th className="py-3.5 px-4">Hình Thức / Tài Khoản</th>
                <th className="py-3.5 px-4">Hạng Mục Thanh Toán</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCollections.map((col, index) => {
                const usdVal = (col.amount / 26000).toFixed(2);
                return (
                  <tr key={col.id || index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">{index + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{col.customer}</div>
                      <div className="text-xs text-slate-500">{col.notes}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">
                      {formatVND(col.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-blue-600 font-mono text-xs">
                      ${Number(usdVal).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{col.date}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        {col.paymentMethod}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 text-xs font-medium max-w-xs truncate">
                        {col.dealType}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã Khớp Tiền
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/70 border-t-2 border-slate-300 font-bold text-sm">
                <td colSpan="2" className="py-4 px-4 text-slate-900 uppercase">
                  TỔNG CỘNG THỰC THU (TOTAL)
                </td>
                <td className="py-4 px-4 text-right text-emerald-700 font-extrabold text-base">
                  {formatVND(totalVND)}
                </td>
                <td className="py-4 px-4 text-right text-blue-700 font-mono font-extrabold text-base">
                  ${Number(totalUSD).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td colSpan="4" className="py-4 px-4 text-xs text-slate-500">
                  Hoàn tất kiểm toán dòng tiền tuần kết thúc ngày 03/10/2026.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add Collection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Thêm Khoản Tiền Về Mới</h3>
            <p className="text-slate-500 text-xs mb-4">
              Ghi nhận dòng tiền thanh toán hoặc tạm ứng từ khách hàng vào quỹ tài khoản.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên Khách Hàng / Đơn Vị *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: CALIFORNIA FITNESS..."
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số Tiền Thực Nhận (VNĐ) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ví dụ: 150000000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày Tiền Về
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngân Hàng Nhận
                  </label>
                  <select
                    value={newBank}
                    onChange={(e) => setNewBank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Chuyển khoản VCB">Vietcombank (VCB)</option>
                    <option value="Chuyển khoản BIDV">BIDV</option>
                    <option value="Chuyển khoản Techcombank">Techcombank</option>
                    <option value="Chuyển khoản ACB">ACB</option>
                    <option value="Chuyển khoản Vietinbank">Vietinbank</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội Dung Thanh Toán
                </label>
                <input
                  type="text"
                  value={newDealType}
                  onChange={(e) => setNewDealType(e.target.value)}
                  placeholder="Thanh toán đợt máy / Đặt cọc..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi Chú</label>
                <textarea
                  rows="2"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Số chứng từ, ủy nhiệm chi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Lưu Khoản Thu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
