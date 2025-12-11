import React, { useState, useEffect } from 'react';
import { useSystem, type Organization } from '../contexts/SystemContext';
import { Plus, Edit2, Trash2, Building, X, Calendar, Loader2, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SystemOrgManager: React.FC = () => {

  const {
    organizations,
    orgsLoading,
    orgsError,
    orgsPagination,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization
  } = useSystem();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: undefined as number | undefined,
  });

  // 初始加载
  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleOpenModal = (org?: Organization) => {
    setErrorMessage(null); // 清除错误信息
    if (org) {
      setEditingOrg(org);
      setFormData({
        name: org.name,
        description: org.description || '',
        parent_id: org.parent_id,
      });
    } else {
      setEditingOrg(null);
      setFormData({ name: '', description: '', parent_id: undefined });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErrorMessage('请填写组织名称');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      if (editingOrg) {
        await updateOrganization(editingOrg.id, formData);
      } else {
        await createOrganization(formData);
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
      await deleteOrganization(deleteConfirmation);
      setDeleteConfirmation(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '删除失败');
      setDeleteConfirmation(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchOrganizations(newPage, orgsPagination.pageSize);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in h-full overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Building className="text-emerald-500" size={28} />
            组织管理
          </h2>
          <p className="text-slate-400 text-sm mt-1">管理组织架构和层级关系</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={16} />
          新建组织
        </button>
      </div>

      {/* 错误提示 */}
      {orgsError && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 flex items-center gap-3 text-rose-400">
          <AlertCircle size={20} />
          <span>{orgsError}</span>
        </div>
      )}

      {/* 加载状态 */}
      {orgsLoading && organizations.length === 0 ? (
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
                    <th className="px-6 py-4">组织名称</th>
                    <th className="px-6 py-4">描述</th>
                    <th className="px-6 py-4">创建时间</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {organizations.map(org => (
                    <tr key={org.id} className="hover:bg-slate-800/30 group transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <Building size={16} />
                          </div>
                          <span className="font-medium text-white">{org.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{org.description || '-'}</td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(org.created_at).toLocaleDateString('zh-CN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(org)}
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => confirmDelete(org.id)}
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {organizations.length === 0 && !orgsLoading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                        暂无组织数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 分页 */}
          {orgsPagination.total > 0 && (
            <div className="flex justify-between items-center text-sm text-slate-400">
              <div>
                共 {orgsPagination.total} 个组织，第 {orgsPagination.page} / {orgsPagination.totalPages} 页
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(orgsPagination.page - 1)}
                  disabled={orgsPagination.page === 1}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white transition-colors"
                >
                  上一页
                </button>
                <button
                  onClick={() => handlePageChange(orgsPagination.page + 1)}
                  disabled={orgsPagination.page >= orgsPagination.totalPages}
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">
                {editingOrg ? '编辑组织' : '新建组织'}
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
                <label className="block text-sm font-medium text-slate-400 mb-1">组织名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                  placeholder="输入组织名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none resize-none transition-all focus:ring-1 focus:ring-blue-500/50"
                  placeholder="输入组织描述"
                />
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
                <p className="text-sm text-slate-400 mt-1">此操作无法撤销，组织将被永久删除。</p>
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
                <p className="text-slate-400 mt-2">组织信息已成功保存。</p>
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
