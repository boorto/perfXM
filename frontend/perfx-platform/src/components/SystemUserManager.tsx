import React, { useState, useEffect } from 'react';
import { useSystem, type User } from '../contexts/SystemContext';
import { Plus, Edit2, Trash2, User as UserIcon, X, Calendar, Loader2, AlertCircle, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

export const SystemUserManager: React.FC = () => {

  const {
    users,
    usersLoading,
    usersError,
    usersPagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    organizations,
    fetchOrganizations,
    roles,
    fetchRoles,
  } = useSystem();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    real_name: '',
    phone: '',
    password: '',
    is_active: true,
    is_superuser: false,
    org_id: undefined as number | undefined,
    role_id: undefined as number | undefined,
  });

  // 初始加载 - 只加载用户列表
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    setErrorMessage(null); // 清除错误信息

    // 打开表单时加载组织和角色数据（用于下拉选择）
    if (organizations.length === 0) {
      fetchOrganizations(1, 100);
    }
    if (roles.length === 0) {
      fetchRoles(1, 100);
    }

    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        real_name: user.real_name || '',
        phone: user.phone || '',
        password: '',
        is_active: user.is_active,
        is_superuser: user.is_superuser,
        org_id: user.org_id,
        role_id: user.role_id,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        real_name: '',
        phone: '',
        password: '',
        is_active: true,
        is_superuser: false,
        org_id: undefined,
        role_id: undefined,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.username.trim() || !formData.email.trim()) {
      setErrorMessage('请填写用户名和邮箱');
      return;
    }

    if (!editingUser && !formData.password) {
      setErrorMessage('请设置密码');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      if (editingUser) {
        const updateData: any = {
          email: formData.email,
          real_name: formData.real_name,
          phone: formData.phone,
          is_active: formData.is_active,
          is_superuser: formData.is_superuser,
          org_id: formData.org_id,
        };
        await updateUser(editingUser.id, updateData);
      } else {
        await createUser(formData);
      }
      setIsModalOpen(false);
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteConfirmation(id);
  };

  const handleDelete = async () => {
    if (deleteConfirmation === null) return;

    try {
      await deleteUser(deleteConfirmation);
      setDeleteConfirmation(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '删除失败');
      setDeleteConfirmation(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, usersPagination.pageSize);
  };

  const getOrgName = (orgId?: number) => {
    if (!orgId) return '-';
    const org = organizations.find(o => o.id === orgId);
    return org?.name || `组织 ${orgId}`;
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in h-full overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <UserIcon className="text-blue-500" size={28} />
            用户管理
          </h2>
          <p className="text-slate-400 text-sm mt-1">管理系统用户和权限</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={16} />
          新建用户
        </button>
      </div>

      {/* 错误提示 */}
      {usersError && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 flex items-center gap-3 text-rose-400">
          <AlertCircle size={20} />
          <span>{usersError}</span>
        </div>
      )}

      {/* 加载状态 */}
      {usersLoading && users.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex-1 flex flex-col">
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-300 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">用户名</th>
                    <th className="px-6 py-4">真实姓名</th>
                    <th className="px-6 py-4">邮箱</th>
                    <th className="px-6 py-4">角色</th>
                    <th className="px-6 py-4">状态</th>
                    <th className="px-6 py-4">创建时间</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-800/30 group transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            {user.is_superuser ? <Shield size={16} /> : <UserIcon size={16} />}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.username}</div>
                            {user.is_superuser && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                超级管理员
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{user.real_name || '-'}</td>
                      <td className="px-6 py-4 text-slate-400">{user.email}</td>
                      <td className="px-6 py-4 text-slate-400">{user.role_name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${user.is_active
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}>
                          {user.is_active ? '启用' : '禁用'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(user.created_at).toLocaleDateString('zh-CN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => confirmDelete(user.id)}
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-rose-400 transition-colors"
                            disabled={user.is_superuser}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && !usersLoading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                        暂无用户数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 分页 */}
          {usersPagination.total > 0 && (
            <div className="flex justify-between items-center text-sm text-slate-400">
              <div>
                共 {usersPagination.total} 个用户，第 {usersPagination.page} / {usersPagination.totalPages} 页
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(usersPagination.page - 1)}
                  disabled={usersPagination.page === 1}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white transition-colors"
                >
                  上一页
                </button>
                <button
                  onClick={() => handlePageChange(usersPagination.page + 1)}
                  disabled={usersPagination.page >= usersPagination.totalPages}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white transition-colors"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 编辑/新建 模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">
                {editingUser ? '编辑用户' : '新建用户'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* 错误提示 */}
              {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 flex items-center gap-2 text-rose-400 text-sm">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">用户名 *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                    placeholder="输入用户名"
                    disabled={!!editingUser}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">真实姓名</label>
                  <input
                    type="text"
                    value={formData.real_name}
                    onChange={e => setFormData({ ...formData, real_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                    placeholder="输入真实姓名"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">邮箱 *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                    placeholder="输入邮箱"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">手机号</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-1 focus:ring-blue-500/50"
                    placeholder="输入手机号"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">密码 *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                    placeholder="设置密码"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">所属组织</label>
                <select
                  value={formData.org_id || ''}
                  onChange={e => setFormData({ ...formData, org_id: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                >
                  <option value="">无</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">角色</label>
                <select
                  value={formData.role_id || ''}
                  onChange={e => setFormData({ ...formData, role_id: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                >
                  <option value="">无</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-sm text-slate-300">启用账号</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_superuser}
                    onChange={e => setFormData({ ...formData, is_superuser: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-600 focus:ring-amber-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-sm text-slate-300">超级管理员</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
                disabled={submitting}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认 模态框 */}
      {deleteConfirmation !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">确认删除?</h3>
                <p className="text-sm text-slate-400 mt-1">此操作无法撤销，用户将被永久删除。</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium shadow-lg shadow-rose-900/20 transition-all"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 成功提示 模态框 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 animate-in zoom-in spin-in-180 duration-500">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">操作成功</h3>
                <p className="text-slate-400 mt-2">用户信息已成功保存。</p>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-900/20 transition-all"
              >
                好的
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
