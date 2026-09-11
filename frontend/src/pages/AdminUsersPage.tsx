import React, { useState, useEffect } from "react";
import { Users, UserPlus, Shield, Check, X, RefreshCw, AlertTriangle } from "lucide-react";
import { adminApi } from "../services/api";
import { AdminUserItem } from "../types";
import { UserRole, ROLE_LABELS, ROLE_BADGE_COLORS } from "../types/roles";

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "FACTORY_OWNER" as UserRole,
  });

  const fetchUsers = async () => {
    if (users.length === 0) setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    try {
      await adminApi.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      alert("Failed to update user role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (userId: number, currentActive: boolean) => {
    setUpdatingId(userId);
    try {
      await adminApi.updateUserStatus(userId, !currentActive);
      fetchUsers();
    } catch (err) {
      alert("Failed to toggle user status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createUser(formData);
      setIsModalOpen(false);
      setFormData({ email: "", password: "", full_name: "", role: "FACTORY_OWNER" });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create user");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-industrial-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-700/50 text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                User & Access Governance
              </h1>
              <p className="text-slate-400 text-sm">
                Manage registered industrial operators, consultants, auditors, and platform administrators.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-carbon-green text-industrial-950 font-bold text-sm rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-carbon-green/20"
          >
            <UserPlus className="w-4 h-4" /> Create User
          </button>
          <button
            onClick={fetchUsers}
            className="p-2 bg-industrial-900 border border-industrial-700 rounded-xl text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-industrial-900/60 border border-industrial-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-industrial-950/90 text-xs font-mono uppercase text-slate-400 border-b border-industrial-800">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Current Role</th>
                <th className="py-3.5 px-4">Role Assignment</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800/60 font-mono text-xs">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-carbon-green" />
                    Loading platform users...
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const normalizedRole = ((u.role || "FACTORY_OWNER").toUpperCase()) as UserRole;
                  const colors = ROLE_BADGE_COLORS[normalizedRole] || ROLE_BADGE_COLORS.FACTORY_OWNER;
                  const roleLabel = ROLE_LABELS[normalizedRole] || u.role;

                  return (
                    <tr key={u.id} className="hover:bg-industrial-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white text-sm font-sans">{u.full_name}</div>
                        <div className="text-slate-400 font-mono text-xs">{u.email}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border}`}>
                          {roleLabel}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          disabled={updatingId === u.id}
                          value={normalizedRole}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-industrial-950 border border-industrial-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:border-carbon-green cursor-pointer"
                        >
                          <option value="FACTORY_OWNER">Factory Owner</option>
                          <option value="SUSTAINABILITY_CONSULTANT">Sustainability Consultant</option>
                          <option value="REGULATOR_AUDITOR">Regulator / Auditor</option>
                          <option value="ADMIN">System Administrator</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[11px] font-semibold">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/60 text-[11px] font-semibold">
                            <X className="w-3 h-3" /> Disabled
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          disabled={updatingId === u.id}
                          onClick={() => handleStatusToggle(u.id, u.is_active)}
                          className={`px-3 py-1 rounded-lg text-xs font-sans font-medium transition-colors ${
                            u.is_active
                              ? "bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/50"
                              : "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/50"
                          }`}
                        >
                          {u.is_active ? "Disable Account" : "Enable Account"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-industrial-900 border border-industrial-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">Create New Platform User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rajesh Sharma"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="FACTORY_OWNER">Factory Owner</option>
                  <option value="SUSTAINABILITY_CONSULTANT">Sustainability Consultant</option>
                  <option value="REGULATOR_AUDITOR">Regulator / Auditor</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-industrial-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-industrial-800 hover:bg-industrial-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-carbon-green hover:bg-emerald-400 text-industrial-950 font-bold rounded-xl"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
