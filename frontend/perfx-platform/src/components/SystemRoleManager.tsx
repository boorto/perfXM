import React, { useState, useEffect } from 'react';
import { useSystem, type Role } from '../contexts/SystemContext';
import { Plus, Edit2, Trash2, Shield, X, Calendar, Loader2, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SystemRoleManager: React.FC = () => {

  const {
    roles,
    rolesLoading,
    rolesError,
    rolesPagination,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    organizations,
    fetchOrganizations,
  } = useSystem();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_system: false,
    permissions: [] as string[],
    org_id: undefined as number | undefined,
  });

  // 可用权限列表
  const availablePermissions = [
    { id: 'project:view', name: '查看项目' },
    { id: 'project:create', name: '创建项目' },
    { id: 'project:update', name: '更新项目' },
    { id: 'project:delete', name: '删除项目' },
    { id: 'script:view', name: '查看脚本' },
    { id: 'script:create', name: '创建脚本' },
    { id: 'script:update', name: '更新脚本' },
    { id: 'script:delete', name: '删除脚本' },
    { id: 'test_plan:view', name: '查看测试计划' },
    { id: 'test_plan:create', name: '创建测试计划' },
    { id: 'test_plan:update', name: '更新测试计划' },
    { id: 'test_plan:delete', name: '删除测试计划' },
    { id: 'test_plan:execute', name: '执行测试计划' },
    { id: 'user:view', name: '查看用户' },
    { id: 'user:create', name: '创建用户' },
    { id: 'user:update', name: '更新用户' },
    { id: 'user:delete', name: '删除用户' },
  ];

  // 初始加载 - 只加载角色列表
  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenModal = (role?: Role) => {
    setErrorMessage(null); // 清除错误信息

    // 打开表单时加载组织数据（用于下拉选择）
    if (organizations.length === 0) {
      fetchOrganizations(1, 100);
    }

    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        is_system: role.is_system,
        permissions: role.permissions || [],
        org_id: role.org_id,
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        is_system: false,
        permissions: [],
        org_id: undefined,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErrorMessage('请填写角色名称');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, formData);
      } else {
        await createRole(formData);
      }
      setIsModalOpen(false);
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id: number, isSystem: boolean) => {
    if (isSystem) {
      setErrorMessage('系统角色不能删除');
      return;
    }
    setDeleteConfirmation(id);
  };

  const handleDelete = async () => {
    if (deleteConfirmation === null) return;

    try {
      await deleteRole(deleteConfirmation);
      setDeleteConfirmation(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '删除失败');
      setDeleteConfirmation(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchRoles(newPage, rolesPagination.pageSize);
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in h-full overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="text-purple-500" size={28} />
            角色管理
          </h2>
          <p className="text-slate-400 text-sm mt-1">管理角色和权限配置</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={16} />
          新建角色
        </button>
      </div>

      {/* 错误提示 */}
      {rolesError && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 flex items-center gap-3 text-rose-400">
          <AlertCircle size={20} />
          <span>{rolesError}</span>
        </div>
      )}

      {/* 加载状态 */}
      {rolesLoading && roles.length === 0 ? (
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
                    <th className="px-6 py-4">角色名称</th>
                    <th className="px-6 py-4">描述</th>
                    <th className="px-6 py-4">所属组织</th>
                    <th className="px-6 py-4">权限数量</th>
                    <th className="px-6 py-4">类型</th>
                    <th className="px-6 py-4">创建时间</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {roles.map(role => (
                    <tr key={role.id} className="hover:bg-slate-800/30 group transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role.is_system
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-purple-500/10 text-purple-500'
                            }`}>
                            <Shield size={16} />
                          </div>
                          <span className="font-medium text-white">{role.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{role.description || '-'}</td>
                      <td className="px-6 py-4 text-slate-400">
                        {role.org_name || <span className="text-slate-600">未分配</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                          {role.permissions?.length || 0} 项权限
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${role.is_system
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                          }`}>
                          {role.is_system ? '系统角色' : '自定义'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(role.created_at).toLocaleDateString('zh-CN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(role)}
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => confirmDelete(role.id, role.is_system)}
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-30"
                            disabled={role.is_system}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {roles.length === 0 && !rolesLoading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                        暂无角色数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 分页 */}
          {rolesPagination.total > 0 && (
            <div className="flex justify-between items-center text-sm text-slate-400">
              <div>
                共 {rolesPagination.total} 个角色，第 {rolesPagination.page} / {rolesPagination.totalPages} 页
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(rolesPagination.page - 1)}
                  disabled={rolesPagination.page === 1}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white transition-colors"
                >
                  上一页
                </button>
                <button
                  onClick={() => handlePageChange(rolesPagination.page + 1)}
                  disabled={rolesPagination.page >= rolesPagination.totalPages}
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h3 className="text-lg font-semibold text-white">
                {editingRole ? '编辑角色' : '新建角色'}
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

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">角色名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                  placeholder="输入角色名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none resize-none transition-all focus:ring-1 focus:ring-blue-500/50"
                  placeholder="输入角色描述"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_system}
                    onChange={e => setFormData({ ...formData, is_system: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-600 focus:ring-amber-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-sm text-slate-300">系统角色（不可删除）</span>
                </label>
              </div>

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
                <label className="block text-sm font-medium text-slate-400 mb-3">权限配置</label>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    {availablePermissions.map(permission => (
                      <label key={permission.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/50 p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900"
                        />
                        <span className="text-sm text-slate-300">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  已选择 {formData.permissions.length} 项权限
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-slate-900">
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
                <p className="text-sm text-slate-400 mt-1">此操作无法撤销，角色将被永久删除。</p>
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
                <p className="text-slate-400 mt-2">角色信息已成功保存。</p>
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