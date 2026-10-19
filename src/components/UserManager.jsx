import React, { useState, useMemo } from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Building,
  MapPin,
  Edit3,
  Key,
  Lock,
  Unlock,
  ExternalLink,
  RotateCcw,
  Sparkles,
  ChevronRight,
  UserPlus,
  Layers,
  Check,
  X,
  Save,
  LogIn,
  Sliders,
  Shield,
  Briefcase,
  Eye,
  EyeOff,
} from "lucide-react";
import { MODULE_DEFINITIONS } from "../data/initialUsers";

export default function UserManager({
  users = [],
  setUsers,
  roles = [],
  setRoles,
  currentUser,
  setCurrentUser,
  onNavigateTab,
}) {
  const [subTab, setSubTab] = useState("users"); // "users" | "roles" | "profile"
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [notification, setNotification] = useState(null);

  // Modal States
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState("all");

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    department: "Phòng Kinh Doanh Miền Nam",
    region: "Miền Nam",
    roleId: "sales_lead",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    hubspotOwnerId: "",
    notes: "",
  });

  // Current User Profile Edit State
  const [myProfile, setMyProfile] = useState(() => ({
    name: currentUser?.name || "",
    title: currentUser?.title || "",
    phone: currentUser?.phone || "",
    email: currentUser?.email || "",
    avatar: currentUser?.avatar || "",
    region: currentUser?.region || "Toàn quốc",
    notes: currentUser?.notes || "",
  }));

  const showToast = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Departments List
  const departments = useMemo(() => {
    const set = new Set(users.map((u) => u.department).filter(Boolean));
    return Array.from(set);
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        searchTerm === "" ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.title && u.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.notes && u.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDept = filterDept === "all" || u.department === filterDept;
      const matchRole = filterRole === "all" || u.roleId === filterRole;
      const matchRegion = filterRegion === "all" || u.region === filterRegion;

      return matchSearch && matchDept && matchRole && matchRegion;
    });
  }, [users, searchTerm, filterDept, filterRole, filterRegion]);

  // User Statistics
  const userStats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const deptsCount = departments.length;
    const rolesCount = roles.length;
    return { total, active, deptsCount, rolesCount };
  }, [users, departments, roles]);

  // Handle Toggle Active/Lock Status
  const handleToggleStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === "active" ? "locked" : "active";
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
    showToast("Đã cập nhật trạng thái hoạt động của nhân sự.");
  };

  // Handle Switch Logged-in User
  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    setMyProfile({
      name: user.name,
      title: user.title,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      region: user.region,
      notes: user.notes,
    });
    showToast(`Đã chuyển phiên làm việc sang: ${user.name} (${user.title})`);
  };

  // Handle Save Edited User
  const handleSaveEditedUser = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? editingUser : u))
    );
    if (currentUser?.id === editingUser.id) {
      setCurrentUser(editingUser);
    }
    setEditingUser(null);
    showToast("Cập nhật thông tin nhân sự thành công!");
  };

  // Handle Add New User
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      alert("Vui lòng điền họ tên và email hợp lệ!");
      return;
    }
    const createdId = `USR-${String(users.length + 1).padStart(3, "0")}`;
    const created = {
      id: createdId,
      ...newUser,
      status: "active",
      lastLogin: "Chưa đăng nhập",
    };
    setUsers([created, ...users]);
    setShowAddModal(false);
    setNewUser({
      name: "",
      title: "",
      email: "",
      phone: "",
      department: "Phòng Kinh Doanh Miền Nam",
      region: "Miền Nam",
      roleId: "sales_lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      hubspotOwnerId: "",
      notes: "",
    });
    showToast(`Đã thêm nhân sự mới: ${created.name} (${createdId})`);
  };

  // Handle Update Permission for a Role
  const handleTogglePermission = (roleId, moduleId) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        const currentPerm = r.permissions[moduleId] || "none";
        let nextPerm = "full";
        if (currentPerm === "full") nextPerm = "view";
        else if (currentPerm === "view") nextPerm = "none";
        else nextPerm = "full";

        return {
          ...r,
          permissions: {
            ...r.permissions,
            [moduleId]: nextPerm,
          },
        };
      })
    );
    showToast("Đã cập nhật ma trận phân quyền!");
  };

  // Handle Save My Profile
  const handleSaveMyProfile = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      ...myProfile,
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    showToast("Đã lưu thông tin hồ sơ cá nhân thành công!");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-200" />
            <h1 className="text-lg md:text-xl font-bold text-white">
              Phân Quyền & Nhân Sự
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 font-bold rounded-xl text-xs shadow hover:bg-indigo-50 transition active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-indigo-600" />
              Thêm Nhân Sự Mới
            </button>
          </div>
        </div>

        {notification && (
          <div className="mt-4 p-3 bg-white/20 backdrop-blur-md rounded-xl text-xs font-semibold text-white flex items-center gap-2 border border-white/30 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{notification.msg}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-indigo-200">Tổng nhân sự hệ thống</div>
            <div className="text-2xl font-bold mt-1 text-white">{userStats.total}</div>
            <div className="text-[11px] text-indigo-200 mt-0.5">Tài khoản nhân sự ERP</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-indigo-200">Đang hoạt động</div>
            <div className="text-2xl font-bold mt-1 text-emerald-300">{userStats.active}</div>
            <div className="text-[11px] text-emerald-200 mt-0.5">Trạng thái Active sẵn sàng</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-indigo-200">Phòng ban phụ trách</div>
            <div className="text-2xl font-bold mt-1 text-sky-300">{userStats.deptsCount}</div>
            <div className="text-[11px] text-sky-200 mt-0.5">BOD, Ops, Tech, Sales, Media...</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-indigo-200">Vai trò phân quyền (Roles)</div>
            <div className="text-2xl font-bold mt-1 text-amber-300">{userStats.rolesCount}</div>
            <div className="text-[11px] text-amber-200 mt-0.5">Cấu hình RBAC theo chức năng</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-2xl shadow-sm">
        <button
          onClick={() => setSubTab("users")}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition ${
            subTab === "users"
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Danh Sách Nhân Sự ({users.length})
        </button>

        <button
          onClick={() => setSubTab("roles")}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition ${
            subTab === "roles"
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Ma Trận Phân Quyền Chi Tiết ({roles.length} Vai Trò)
        </button>

        <button
          onClick={() => setSubTab("profile")}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition ${
            subTab === "profile"
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Hồ Sơ Của Tôi ({currentUser?.name || "Tài khoản hiện tại"})
        </button>
      </div>

      {/* TAB 1: USERS LIST */}
      {subTab === "users" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm nhân sự theo tên, email, chức danh, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-500"
              >
                <option value="all">Tất cả phòng ban</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-500"
              >
                <option value="all">Tất cả vai trò ({roles.length})</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-500"
              >
                <option value="all">Tất cả khu vực</option>
                <option value="Toàn quốc">Toàn quốc</option>
                <option value="Miền Bắc">Miền Bắc (HN)</option>
                <option value="Miền Nam">Miền Nam (HCM)</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nhân sự</th>
                    <th className="py-3 px-4">Chức danh & Phòng ban</th>
                    <th className="py-3 px-4">Liên hệ</th>
                    <th className="py-3 px-4">Khu vực</th>
                    <th className="py-3 px-4">Vai trò phân quyền</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Không tìm thấy nhân sự nào khớp với điều kiện lọc
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const roleObj = roles.find((r) => r.id === u.roleId);
                      const isCurrent = currentUser?.id === u.id;

                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-slate-50/80 transition ${
                            isCurrent ? "bg-purple-50/40" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  {u.name}
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                                      Đang đăng nhập
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  {u.id} {u.hubspotOwnerId ? `• HS: ${u.hubspotOwnerId}` : ""}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{u.title}</div>
                            <div className="text-[11px] text-slate-500">{u.department}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-700 flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <a href={`mailto:${u.email}`} className="hover:text-purple-600">
                                {u.email}
                              </a>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {u.phone}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                              {u.region}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                roleObj ? roleObj.badgeClass : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {roleObj ? roleObj.name : u.roleId}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(u.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition ${
                                u.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                              }`}
                              title="Bấm để khóa / mở khóa tài khoản"
                            >
                              {u.status === "active" ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Hoạt động
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3 text-rose-600" /> Tạm khóa
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingUser(u)}
                                className="p-1.5 hover:bg-purple-50 text-slate-600 hover:text-purple-700 rounded-lg text-xs font-semibold transition"
                                title="Cập nhật thông tin nhân sự"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleSwitchUser(u)}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                                  isCurrent
                                    ? "bg-purple-100 text-purple-700 font-bold"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                }`}
                                title="Đăng nhập thử phiên làm việc của nhân sự này để test phân quyền"
                              >
                                <LogIn className="w-3 h-3" />
                                {isCurrent ? "Đang chọn" : "Đăng nhập thử"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RBAC PERMISSION MATRIX */}
      {subTab === "roles" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                Ma Trận Phân Quyền Theo Vai Trò (Role-Based Access Control)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhấp vào từng ô để đổi cấp độ quyền: <strong>Toàn Quyền (Full Access)</strong> ➜ <strong>Chỉ Xem (View Only)</strong> ➜ <strong>Không Có Quyền (No Access)</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Toàn Quyền (Full)
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Chỉ Xem (View)
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Chặn / Ẩn (None)
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 min-w-[220px]">Phân Hệ / Nghiệp Vụ</th>
                    {roles.map((r) => (
                      <th key={r.id} className="py-3.5 px-3 text-center min-w-[130px]">
                        <div className="font-bold text-slate-800">{r.name.split("/")[0]}</div>
                        <div className="text-[10px] text-slate-400 font-mono lowercase font-normal">
                          {r.id}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {MODULE_DEFINITIONS.map((mod) => (
                    <tr key={mod.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center justify-between">
                          <span>{mod.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal px-2 py-0.5 bg-slate-100 rounded">
                            {mod.category}
                          </span>
                        </div>
                      </td>

                      {roles.map((role) => {
                        const perm = role.permissions[mod.id] || "none";
                        return (
                          <td key={role.id} className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleTogglePermission(role.id, mod.id)}
                              className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                                perm === "full"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                  : perm === "view"
                                  ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                                  : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                              }`}
                              title={`Bấm để đổi quyền cho ${role.name} tại module ${mod.name}`}
                            >
                              {perm === "full" ? "✓ Toàn Quyền" : perm === "view" ? "👁 Chỉ Xem" : "✕ Không"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY PROFILE */}
      {subTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Card Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-4">
              <img
                src={myProfile.avatar || currentUser?.avatar}
                alt={myProfile.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-purple-100 shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>

            <h2 className="text-lg font-bold text-slate-900">{myProfile.name || "Chưa cập nhật"}</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{myProfile.title}</p>

            <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              {roles.find((r) => r.id === currentUser?.roleId)?.name || currentUser?.roleId}
            </div>

            <div className="w-full mt-6 pt-6 border-t border-slate-100 text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Mã nhân sự:</span>
                <span className="font-mono font-bold">{currentUser?.id}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Phòng ban:</span>
                <span className="font-semibold">{currentUser?.department}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Khu vực:</span>
                <span className="font-semibold">{myProfile.region}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">HubSpot ID:</span>
                <span className="font-mono">{currentUser?.hubspotOwnerId || "Chưa map"}</span>
              </div>
            </div>

            <div className="w-full mt-6 pt-4 border-t border-slate-100">
              <div className="text-[11px] text-slate-400 mb-2">Đổi tài khoản đăng nhập thử:</div>
              <select
                value={currentUser?.id}
                onChange={(e) => {
                  const target = users.find((u) => u.id === e.target.value);
                  if (target) handleSwitchUser(target);
                }}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Edit My Profile */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-purple-600" />
              Cập Nhật Thông Tin Cá Nhân
            </h3>

            <form onSubmit={handleSaveMyProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Họ và Tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={myProfile.name}
                    onChange={(e) => setMyProfile({ ...myProfile, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Chức danh công việc
                  </label>
                  <input
                    type="text"
                    value={myProfile.title}
                    onChange={(e) => setMyProfile({ ...myProfile, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Số Điện Thoại
                  </label>
                  <input
                    type="text"
                    value={myProfile.phone}
                    onChange={(e) => setMyProfile({ ...myProfile, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Công Ty (@attivointl.com)
                  </label>
                  <input
                    type="email"
                    required
                    value={myProfile.email}
                    onChange={(e) => setMyProfile({ ...myProfile, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Khu Vực Phụ Trách
                  </label>
                  <select
                    value={myProfile.region}
                    onChange={(e) => setMyProfile({ ...myProfile, region: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="Toàn quốc">Toàn quốc</option>
                    <option value="Miền Bắc">Miền Bắc (Hà Nội)</option>
                    <option value="Miền Nam">Miền Nam (TP.HCM)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Link Ảnh Đại Diện (Avatar URL)
                  </label>
                  <input
                    type="text"
                    value={myProfile.avatar}
                    onChange={(e) => setMyProfile({ ...myProfile, avatar: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ghi chú hồ sơ cá nhân / Chữ ký số
                </label>
                <textarea
                  rows={3}
                  value={myProfile.notes}
                  onChange={(e) => setMyProfile({ ...myProfile, notes: e.target.value })}
                  placeholder="Ghi chú về phân công, lịch trực, hoặc chữ ký số..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Lưu Thông Tin Hồ Sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT USER PROFILE */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
                  Cập Nhật Nhân Sự
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {editingUser.name} ({editingUser.id})
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chức danh</label>
                  <input
                    type="text"
                    value={editingUser.title}
                    onChange={(e) => setEditingUser({ ...editingUser, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phòng ban</label>
                  <input
                    type="text"
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email công ty</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vai trò phân quyền</label>
                  <select
                    value={editingUser.roleId}
                    onChange={(e) => setEditingUser({ ...editingUser, roleId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-purple-700"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khu vực</label>
                  <select
                    value={editingUser.region}
                    onChange={(e) => setEditingUser({ ...editingUser, region: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Toàn quốc">Toàn quốc</option>
                    <option value="Miền Bắc">Miền Bắc</option>
                    <option value="Miền Nam">Miền Nam</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">HubSpot Owner ID</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 472995694"
                    value={editingUser.hubspotOwnerId || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, hubspotOwnerId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng thái tài khoản</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="active">Active (Đang hoạt động)</option>
                    <option value="locked">Locked (Tạm khóa)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Ghi chú nhân sự</label>
                  <textarea
                    rows={2}
                    value={editingUser.notes || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" /> Lưu Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW USER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
                  Thêm Tài Khoản
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Thêm Nhân Sự Mới Vào Attivo ERP
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chức danh *</label>
                  <input
                    type="text"
                    required
                    placeholder="Kỹ Thuật Viên / Chuyên Viên Sales"
                    value={newUser.title}
                    onChange={(e) => setNewUser({ ...newUser, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phòng ban</label>
                  <input
                    type="text"
                    placeholder="Phòng Kỹ Thuật / Kinh Doanh"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="09xx xxx xxx"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email công ty *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@attivointl.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vai trò phân quyền</label>
                  <select
                    value={newUser.roleId}
                    onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-purple-700"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khu vực làm việc</label>
                  <select
                    value={newUser.region}
                    onChange={(e) => setNewUser({ ...newUser, region: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Toàn quốc">Toàn quốc</option>
                    <option value="Miền Bắc">Miền Bắc</option>
                    <option value="Miền Nam">Miền Nam</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Ghi chú nhân sự</label>
                  <textarea
                    rows={2}
                    placeholder="Nhiệm vụ chính, phân công dự án..."
                    value={newUser.notes}
                    onChange={(e) => setNewUser({ ...newUser, notes: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-4 h-4" /> Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
