import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useProjects, type Project } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { Folder, Plus, Edit2, Trash2, Search, X, Briefcase, User, Calendar, Loader2, AlertCircle, LayoutGrid, List, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ProjectManager: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const {
    projects,
    loading,
    error,
    pagination,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  } = useProjects();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  // 初始加载 - 只在组件挂载时加载项目列表
  useEffect(() => {
    fetchProjects();
  }, []);

  // 打开模态框
  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        description: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  // 保存项目
  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('请输入项目名称');
      return;
    }

    setSubmitting(true);
    try {
      if (editingProject) {
        // 更新项目
        await updateProject(editingProject.id, formData);
      } else {
        // 创建项目 - 自动使用当前登录用户作为经理
        await createProject({
          ...formData,
          manager_id: user?.id || 1
        });
      }
      setIsModalOpen(false);
      setShowSuccessModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除项目 - 打开确认框
  const confirmDelete = (id: number) => {
    setDeleteConfirmation(id);
  };

  // 执行删除
  const handleDelete = async () => {
    if (deleteConfirmation === null) return;

    try {
      await deleteProject(deleteConfirmation);
      setDeleteConfirmation(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  // 搜索过滤
  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-6 animate-in fade-in">
      {/* 头部 */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Briefcase className="text-blue-500" />
            {t.projects.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">管理测试项目和访问控制</p>
        </div>
        <div className="flex gap-3">
          {/* 视图切换 */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              title="网格视图"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              title="列表视图"
            >
              <List size={16} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.common.search}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none w-64"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            <Plus size={16} />
            {t.projects.add}
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 flex items-center gap-3 text-rose-400">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* 加载状态 */}
      {loading && projects.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            /* 项目网格 */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6">
              {filteredProjects.map(project => (
                <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-all group relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Folder size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{project.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${project.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}>
                          {project.status === 'active' ? '进行中' : '已归档'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenModal(project)}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(project.id)}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm mb-6 line-clamp-2 h-10">
                    {project.description || "暂无描述"}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User size={14} />
                      <span>{project.creator_name || '未知用户'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                  </div>

                  {/* 统计信息 */}
                  {(project.member_count !== undefined || project.script_count !== undefined) && (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex gap-4 text-xs">
                      {project.member_count !== undefined && (
                        <div className="text-slate-500">
                          成员: <span className="text-white font-medium">{project.member_count}</span>
                        </div>
                      )}
                      {project.script_count !== undefined && (
                        <div className="text-slate-500">
                          脚本: <span className="text-white font-medium">{project.script_count}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* 项目列表 */
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left text-slate-400">
                <thead className="bg-slate-950 text-slate-300 uppercase text-xs font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-3">项目名称</th>
                    <th scope="col" className="px-6 py-3">状态</th>
                    <th scope="col" className="px-6 py-3">描述</th>
                    <th scope="col" className="px-6 py-3">创建人</th>
                    <th scope="col" className="px-6 py-3">创建时间</th>
                    <th scope="col" className="px-6 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProjects.map(project => (
                    <tr key={project.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <Folder size={16} />
                        </div>
                        {project.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${project.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}>
                          {project.status === 'active' ? '进行中' : '已归档'}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        {project.description || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <User size={14} />
                          {project.creator_name || '未知'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {formatDate(project.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(project)}
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => confirmDelete(project.id)}
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProjects.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                        没有找到相关项目
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 分页信息 */}
          {pagination.total > 0 && (
            <div className="flex justify-between items-center text-sm text-slate-400 mt-auto">
              <div>
                共 {pagination.total} 个项目，第 {pagination.page} / {pagination.totalPages} 页
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchProjects(pagination.page - 1)}
                  disabled={!pagination.page || pagination.page <= 1}
                  className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() => fetchProjects(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                {editingProject ? '编辑项目' : '新建项目'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">项目名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                  placeholder="输入项目名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">项目描述</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none resize-none transition-all focus:ring-1 focus:ring-blue-500/50"
                  placeholder="输入项目描述"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">状态</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                >
                  <option value="active">进行中</option>
                  <option value="archived">已归档</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2 text-slate-400 hover:text-white font-medium disabled:opacity-50"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || submitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {t.common.save}
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
                <p className="text-sm text-slate-400 mt-1">此操作无法撤销，项目将被永久删除。</p>
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
                <p className="text-slate-400 mt-2">项目信息已成功保存。</p>
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
