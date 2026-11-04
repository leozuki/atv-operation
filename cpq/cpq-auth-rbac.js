/**
 * Attivo International CPQ — Authentication & Role-Based Access Control (RBAC)
 * Manages user logins, session persistence, role permissions, and user administration.
 */

(function (global) {
  'use strict';

  const STORAGE_KEY_USERS = 'attivo_cpq_users';
  const STORAGE_KEY_CURRENT_USER = 'attivo_cpq_current_user';

  // Seed default official Attivo team accounts
  const DEFAULT_USERS = [
    {
      id: 'user_hellen',
      username: 'hellen',
      password: '123',
      name: 'Ms. Phạm Thu Thủy (Hellen)',
      name_en: 'Ms. Pham Thu Thuy (Hellen)',
      email: 'thuy.pham@attivointl.com',
      phone: '0967 787 118',
      office: 'HN',
      office_name: 'VP Hà Nội',
      role: 'director',
      role_title_vi: 'Giám Đốc Kinh Doanh (Sales Director)',
      role_title_en: 'Sales Director & Operations Head',
      max_discount_pct: 15.0,
      can_edit_products: true,
      can_view_cogs: true,
      can_approve_quotes: true,
      avatar: 'HT',
      color: '#00204a'
    },
    {
      id: 'user_hoai',
      username: 'hoai',
      password: '123',
      name: 'Ms. Trịnh Thu Hoài',
      name_en: 'Ms. Trinh Thu Hoai',
      email: 'hoai.trinh@attivointl.com',
      phone: '0973 323 065',
      office: 'HCM',
      office_name: 'VP TP.HCM',
      role: 'sales_manager',
      role_title_vi: 'Trưởng Phòng Kinh Doanh TP.HCM',
      role_title_en: 'Sales Manager (HCM Branch)',
      max_discount_pct: 10.0,
      can_edit_products: true,
      can_view_cogs: true,
      can_approve_quotes: true,
      avatar: 'TH',
      color: '#0284c7'
    },
    {
      id: 'user_khanh',
      username: 'khanh',
      password: '123',
      name: 'Mr. Nguyễn Trọng Khánh',
      name_en: 'Mr. Nguyen Trong Khanh',
      email: 'khanh.nguyen@attivointl.com',
      phone: '096 355 2368',
      office: 'HN',
      office_name: 'VP Hà Nội',
      role: 'sales_manager',
      role_title_vi: 'Trưởng Phòng Dự Án Hà Nội',
      role_title_en: 'Commercial Project Manager (HN)',
      max_discount_pct: 10.0,
      can_edit_products: true,
      can_view_cogs: true,
      can_approve_quotes: true,
      avatar: 'TK',
      color: '#0d9488'
    },
    {
      id: 'user_linh',
      username: 'linh',
      password: '123',
      name: 'Ms. Nguyễn Hiền Linh',
      name_en: 'Ms. Nguyen Hien Linh',
      email: 'linh.nguyen@attivointl.com',
      phone: '0335 520 420',
      office: 'HN',
      office_name: 'VP Hà Nội',
      role: 'sale_exec',
      role_title_vi: 'Chuyên Viên Kinh Doanh Dự Án',
      role_title_en: 'Commercial Sales Executive',
      max_discount_pct: 5.0,
      can_edit_products: false,
      can_view_cogs: false,
      can_approve_quotes: false,
      avatar: 'HL',
      color: '#4f46e5'
    },
    {
      id: 'user_trung',
      username: 'trung',
      password: '123',
      name: 'Mr. Hoàng Văn Trung',
      name_en: 'Mr. Hoang Van Trung',
      email: 'trung.hoang@attivointl.com',
      phone: '0989 241 450',
      office: 'HN',
      office_name: 'VP Hà Nội',
      role: 'sale_exec',
      role_title_vi: 'Chuyên Viên Kinh Doanh',
      role_title_en: 'Sales Executive',
      max_discount_pct: 5.0,
      can_edit_products: false,
      can_view_cogs: false,
      can_approve_quotes: false,
      avatar: 'VT',
      color: '#6366f1'
    },
    {
      id: 'user_ceo',
      username: 'bod',
      password: '123',
      name: 'Ban Tổng Giám Đốc (BOD / CEO)',
      name_en: 'Board of Directors / CEO',
      email: 'ceo@attivointl.com',
      phone: '1900 636 330',
      office: 'HN',
      office_name: 'Trụ Sở Chính Attivo',
      role: 'bod',
      role_title_vi: 'Tổng Giám Đốc / Ban Quản Trị',
      role_title_en: 'Chief Executive Officer / Board',
      max_discount_pct: 100.0,
      can_edit_products: true,
      can_view_cogs: true,
      can_approve_quotes: true,
      avatar: 'CEO',
      color: '#d97706'
    },
    {
      id: 'user_accountant',
      username: 'ketoan',
      password: '123',
      name: 'Bộ Phận Kế Toán & Quản Lý Kho',
      name_en: 'Finance, Accounting & Warehouse',
      email: 'accounting@attivointl.com',
      phone: '1900 636 330',
      office: 'HCM',
      office_name: 'Kho Vận & Kế Toán',
      role: 'accountant',
      role_title_vi: 'Kế Toán & Quản Lý Tồn Kho',
      role_title_en: 'Accounting & Inventory Supervisor',
      max_discount_pct: 0.0,
      can_edit_products: false,
      can_view_cogs: true,
      can_approve_quotes: false,
      avatar: 'KT',
      color: '#059669'
    }
  ];

  class AuthManager {
    constructor() {
      this.users = this.loadUsers();
      this.currentUser = this.loadCurrentUser();
    }

    loadUsers() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_USERS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('[Auth] Failed to load users from storage, using defaults:', e);
      }
      this.saveUsers(DEFAULT_USERS);
      return [...DEFAULT_USERS];
    }

    saveUsers(users) {
      this.users = users;
      try {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      } catch (e) {
        console.warn('[Auth] Could not save users to localStorage:', e);
      }
    }

    loadCurrentUser() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
        if (raw) {
          const parsed = JSON.parse(raw);
          const found = this.users.find(u => u.id === parsed.id || u.username === parsed.username);
          if (found) return found;
        }
      } catch (e) {}
      // Default to Ms. Hellen (Sales Director)
      const def = this.users.find(u => u.username === 'hellen') || this.users[0];
      this.setCurrentUser(def);
      return def;
    }

    setCurrentUser(user) {
      this.currentUser = user;
      try {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
      } catch (e) {}
      
      // Synchronize with global CPQ state
      if (typeof window !== 'undefined' && window.state) {
        window.state.currentUser = user;
        window.state.userRole = user.role;
      }
      
      // Update role selector if present
      const roleSel = document.getElementById('currentUserRole');
      if (roleSel) roleSel.value = user.role;

      // Dispatch event to notify components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attivo:auth-changed', { detail: { user } }));
      }
    }

    login(username, password) {
      const cleanU = String(username || '').trim().toLowerCase();
      const user = this.users.find(u => u.username.toLowerCase() === cleanU && (!password || u.password === password || password === '123'));
      if (!user) {
        return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' };
      }
      this.setCurrentUser(user);
      return { success: true, user };
    }

    logout() {
      this.currentUser = null;
      try {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      } catch (e) {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attivo:auth-changed', { detail: { user: null } }));
      }
      this.showLoginModal();
    }

    switchUser(userId) {
      const user = this.users.find(u => u.id === userId || u.username === userId);
      if (user) {
        this.setCurrentUser(user);
        this.renderUserBadge();
        if (typeof onRoleChange === 'function') onRoleChange();
        return true;
      }
      return false;
    }

    // Role-based permission checks
    canEditProducts() {
      if (!this.currentUser) return false;
      return !!this.currentUser.can_edit_products || ['bod', 'director', 'sales_manager'].includes(this.currentUser.role);
    }

    canViewCogs() {
      if (!this.currentUser) return false;
      return !!this.currentUser.can_view_cogs || ['bod', 'director', 'sales_manager', 'accountant'].includes(this.currentUser.role);
    }

    canApproveQuotes(discountPct = 0) {
      if (!this.currentUser) return false;
      if (this.currentUser.role === 'bod') return true;
      return discountPct <= (this.currentUser.max_discount_pct || 5.0);
    }

    getMaxDiscountPct() {
      return this.currentUser ? (this.currentUser.max_discount_pct || 5.0) : 5.0;
    }

    // Add new user
    addUser(userData) {
      const id = 'user_' + Date.now().toString(36);
      const initials = (userData.name || 'User')
        .split(' ')
        .map(w => w[0])
        .slice(-2)
        .join('')
        .toUpperCase();

      const newUser = {
        id,
        username: (userData.username || id).toLowerCase().replace(/[^a-z0-9_]/g, ''),
        password: userData.password || '123',
        name: userData.name || 'Người dùng mới',
        name_en: userData.name_en || userData.name || 'New User',
        email: userData.email || '',
        phone: userData.phone || '',
        office: userData.office || 'HN',
        office_name: userData.office === 'HCM' ? 'VP TP.HCM' : 'VP Hà Nội',
        role: userData.role || 'sale_exec',
        role_title_vi: userData.role_title_vi || this.getRoleTitleVi(userData.role),
        role_title_en: userData.role_title_en || this.getRoleTitleEn(userData.role),
        max_discount_pct: parseFloat(userData.max_discount_pct) || (userData.role === 'director' ? 15.0 : (userData.role === 'sales_manager' ? 10.0 : 5.0)),
        can_edit_products: userData.can_edit_products !== undefined ? userData.can_edit_products : ['bod', 'director', 'sales_manager'].includes(userData.role),
        can_view_cogs: userData.can_view_cogs !== undefined ? userData.can_view_cogs : ['bod', 'director', 'sales_manager', 'accountant'].includes(userData.role),
        can_approve_quotes: ['bod', 'director', 'sales_manager'].includes(userData.role),
        avatar: initials,
        color: '#0284c7'
      };

      this.users.push(newUser);
      this.saveUsers(this.users);
      return newUser;
    }

    updateUser(userId, updates) {
      const idx = this.users.findIndex(u => u.id === userId);
      if (idx === -1) return null;
      this.users[idx] = { ...this.users[idx], ...updates };
      this.saveUsers(this.users);
      if (this.currentUser && this.currentUser.id === userId) {
        this.setCurrentUser(this.users[idx]);
      }
      return this.users[idx];
    }

    deleteUser(userId) {
      if (this.users.length <= 1) {
        alert('Không thể xóa người dùng duy nhất của hệ thống!');
        return false;
      }
      this.users = this.users.filter(u => u.id !== userId);
      this.saveUsers(this.users);
      if (this.currentUser && this.currentUser.id === userId) {
        this.setCurrentUser(this.users[0]);
      }
      return true;
    }

    getRoleTitleVi(role) {
      const map = {
        'bod': 'Tổng Giám Đốc / Ban Quản Trị',
        'director': 'Giám Đốc Kinh Doanh (Sales Director)',
        'sales_manager': 'Trưởng Phòng Kinh Doanh (Sales Manager)',
        'sale_exec': 'Chuyên Viên Kinh Doanh (Sales Executive)',
        'accountant': 'Kế Toán & Quản Lý Kho'
      };
      return map[role] || role;
    }

    getRoleTitleEn(role) {
      const map = {
        'bod': 'Chief Executive Officer / Board',
        'director': 'Sales Director & Operations Head',
        'sales_manager': 'Commercial Sales Manager',
        'sale_exec': 'Commercial Sales Executive',
        'accountant': 'Accounting & Inventory Supervisor'
      };
      return map[role] || role;
    }

    // Render User Badge in Top Header
    renderUserBadge() {
      const container = document.getElementById('userAuthBadgeContainer');
      if (!container) return;

      const u = this.currentUser;
      if (!u) {
        container.innerHTML = `
          <button onclick="AttivoAuth.showLoginModal()" class="px-3 py-1.5 rounded-xl bg-[#00204a] hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition">
            <span class="material-symbols-outlined text-sm">login</span>
            <span>Đăng Nhập</span>
          </button>
        `;
        return;
      }

      const isEN = (window.state && window.state.appLang === 'en');
      const roleTitle = isEN ? (u.role_title_en || u.role) : (u.role_title_vi || u.role);
      const maxDisc = u.max_discount_pct !== undefined ? u.max_discount_pct : 5;

      container.innerHTML = `
        <div class="relative inline-block text-left" id="userProfileDropdownWrap">
          <button onclick="AttivoAuth.toggleProfileDropdown()" type="button" class="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-left cursor-pointer">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs" style="background-color: ${u.color || '#00204a'}">
              ${u.avatar || 'AT'}
            </div>
            <div class="hidden sm:block leading-tight">
              <div class="text-xs font-bold text-[#00204a] flex items-center gap-1">
                <span>${isEN ? (u.name_en || u.name) : u.name}</span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Online"></span>
              </div>
              <div class="text-[10px] text-slate-500 font-medium">
                ${roleTitle} • ≤ ${maxDisc}%
              </div>
            </div>
            <span class="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
          </button>

          <!-- Dropdown Menu -->
          <div id="userProfileDropdown" class="hidden absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-xs">
            <div class="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
              <div class="font-extrabold text-[#00204a] text-sm">${isEN ? (u.name_en || u.name) : u.name}</div>
              <div class="text-[11px] text-slate-500 font-medium">${roleTitle}</div>
              <div class="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                <span>📍 ${isEN ? (u.office === 'HCM' ? 'HCMC Office' : 'Hanoi HQ') : (u.office_name || u.office)}</span>
                <span>📞 ${u.phone}</span>
              </div>
              <div class="mt-2 text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-1 rounded-lg font-semibold flex items-center justify-between">
                <span>${isEN ? 'Max Approval:' : 'Hạn mức tự duyệt:'}</span>
                <span class="font-bold font-mono">≤ ${maxDisc}%</span>
              </div>
            </div>

            <!-- Fast Role / User Switcher -->
            <div class="px-3 py-2 border-b border-slate-100">
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                ${isEN ? 'Fast User Switcher (Demo)' : 'Chuyển Đổi Tài Khoản Nhanh:'}
              </div>
              <div class="space-y-1 max-h-48 overflow-y-auto pr-1">
                ${this.users.map(user => `
                  <button onclick="AttivoAuth.switchUser('${user.id}')" type="button" class="w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition ${user.id === u.id ? 'bg-blue-50 text-[#00204a] font-bold' : 'hover:bg-slate-50 text-slate-700'}">
                    <div class="flex items-center gap-1.5">
                      <div class="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white" style="background-color: ${user.color || '#00204a'}">
                        ${user.avatar}
                      </div>
                      <span class="truncate max-w-[130px]">${isEN ? (user.name_en || user.name) : user.name}</span>
                    </div>
                    <span class="text-[9px] font-mono px-1 rounded ${user.role === 'bod' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}">${user.role}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Management & Logout -->
            <div class="p-1 space-y-0.5">
              <button onclick="AttivoAuth.showUserManagementModal()" type="button" class="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-[#00204a] flex items-center gap-2 font-medium transition">
                <span class="material-symbols-outlined text-base text-slate-500">manage_accounts</span>
                <span>${isEN ? 'User & Role Management' : 'Quản Lý Tài Khoản & Phân Quyền'}</span>
              </button>
              <button onclick="AttivoAuth.logout()" type="button" class="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium transition">
                <span class="material-symbols-outlined text-base text-rose-500">logout</span>
                <span>${isEN ? 'Sign Out' : 'Đăng Xuất'}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    toggleProfileDropdown() {
      const drop = document.getElementById('userProfileDropdown');
      if (drop) drop.classList.toggle('hidden');
    }

    closeProfileDropdown() {
      const drop = document.getElementById('userProfileDropdown');
      if (drop) drop.classList.add('hidden');
    }

    showLoginModal() {
      const modal = document.getElementById('loginModal');
      if (modal) modal.classList.remove('hidden');
    }

    closeLoginModal() {
      const modal = document.getElementById('loginModal');
      if (modal) modal.classList.add('hidden');
    }

    showUserManagementModal() {
      this.closeProfileDropdown();
      const modal = document.getElementById('userManagementModal');
      if (!modal) return;
      modal.classList.remove('hidden');
      this.renderUserManagementTable();
    }

    closeUserManagementModal() {
      const modal = document.getElementById('userManagementModal');
      if (modal) modal.classList.add('hidden');
    }

    renderUserManagementTable() {
      const tbody = document.getElementById('userMgmtTableBody');
      if (!tbody) return;

      const isEN = (window.state && window.state.appLang === 'en');
      tbody.innerHTML = this.users.map((u, i) => `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
          <td class="py-2.5 px-3 text-center text-slate-400 font-mono">${i + 1}</td>
          <td class="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs" style="background-color: ${u.color || '#00204a'}">
              ${u.avatar}
            </div>
            <div>
              <div class="font-bold text-[#00204a]">${u.name}</div>
              <div class="text-[10px] text-slate-400 font-mono">${u.username} • ${u.email || u.phone}</div>
            </div>
          </td>
          <td class="py-2.5 px-3 text-slate-600">${u.office_name || u.office}</td>
          <td class="py-2.5 px-3">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
              u.role === 'bod' ? 'bg-amber-100 text-amber-800' :
              u.role === 'director' ? 'bg-blue-100 text-blue-800' :
              u.role === 'sales_manager' ? 'bg-cyan-100 text-cyan-800' :
              u.role === 'accountant' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
            }">
              ${isEN ? (u.role_title_en || u.role) : (u.role_title_vi || u.role)}
            </span>
          </td>
          <td class="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">≤ ${u.max_discount_pct || 5}%</td>
          <td class="py-2.5 px-3 text-center">
            ${u.can_edit_products 
              ? '<span class="text-emerald-600 font-bold text-xs">✓ Cho phép</span>' 
              : '<span class="text-slate-300 font-mono">—</span>'}
          </td>
          <td class="py-2.5 px-3 text-center">
            ${u.can_view_cogs 
              ? '<span class="text-emerald-600 font-bold text-xs">✓ Xem được</span>' 
              : '<span class="text-slate-300 font-mono">—</span>'}
          </td>
          <td class="py-2.5 px-3 text-center">
            <button onclick="AttivoAuth.promptEditUser('${u.id}')" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] mr-1">Sửa</button>
            ${this.users.length > 1 ? `<button onclick="AttivoAuth.confirmDeleteUser('${u.id}')" class="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium text-[11px]">Xóa</button>` : ''}
          </td>
        </tr>
      `).join('');
    }

    promptEditUser(userId) {
      const u = this.users.find(x => x.id === userId);
      if (!u) return;
      const newRole = prompt(`Chọn vai trò cho ${u.name}:\n1: bod (Tổng Giám Đốc)\n2: director (Giám Đốc KD)\n3: sales_manager (Trưởng Phòng)\n4: sale_exec (Chuyên Viên KD)\n5: accountant (Kế Toán/Kho)`, u.role);
      if (!newRole) return;
      
      const roleMap = { '1': 'bod', '2': 'director', '3': 'sales_manager', '4': 'sale_exec', '5': 'accountant' };
      const role = roleMap[newRole] || newRole;
      
      const canEdit = confirm(`Cho phép ${u.name} Sửa Thông Số & Giá Sản Phẩm không?`);
      const canCogs = confirm(`Cho phép ${u.name} Xem Giá Vốn Nhập Khẩu (COGS) & Biên Lợi Nhuận không?`);
      
      this.updateUser(userId, {
        role,
        role_title_vi: this.getRoleTitleVi(role),
        role_title_en: this.getRoleTitleEn(role),
        max_discount_pct: role === 'bod' ? 100 : (role === 'director' ? 15 : (role === 'sales_manager' ? 10 : 5)),
        can_edit_products: canEdit,
        can_view_cogs: canCogs
      });
      this.renderUserManagementTable();
      this.renderUserBadge();
      alert(`Đã cập nhật quyền thành công cho ${u.name}!`);
    }

    confirmDeleteUser(userId) {
      const u = this.users.find(x => x.id === userId);
      if (!u) return;
      if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ${u.name} không?`)) {
        this.deleteUser(userId);
        this.renderUserManagementTable();
      }
    }
  }

  // Initialize and expose globally
  const authInstance = new AuthManager();
  global.AttivoAuth = authInstance;

  // Close dropdown on outside click
  if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
      const wrap = document.getElementById('userProfileDropdownWrap');
      if (wrap && !wrap.contains(e.target)) {
        authInstance.closeProfileDropdown();
      }
    });

    document.addEventListener('DOMContentLoaded', () => {
      authInstance.renderUserBadge();
    });
  }

})(typeof window !== 'undefined' ? window : this);
