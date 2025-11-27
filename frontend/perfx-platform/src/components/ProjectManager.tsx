
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useProjects } from '../contexts/ProjectContext';
import { Folder, Plus, Edit2, Trash2, Search, X, Briefcase, User, Calendar } from 'lucide-react';
import type{ Project } from '../types';

export const ProjectManager: React.FC = () => {
  const { t } = useLanguage();
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner: '',
    status: 'Active' as 'Active' | 'Archived'
  });

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description,
        owner: project.owner,
        status: project.status
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        description: '',
        owner: '',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingProject) {
      updateProject(editingProject.id, formData);
    } else {
      addProject(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-6 animate-in fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Briefcase className="text-blue-500" />
            {t.projects.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage test projects and access controls</p>
        </div>
        <div className="flex gap-3">
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

      {/* Grid */}
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
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${project.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                    {project.status === 'Active' ? t.projects.status.active : t.projects.status.archived}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(project)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(project.id)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm mb-6 line-clamp-2 h-10">
              {project.description || "No description provided."}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <User size={14} />
                <span>{project.owner}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{project.createdAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">
                {editingProject ? t.projects.modal.titleEdit : t.projects.modal.titleAdd}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">{t.projects.modal.nameLabel}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">{t.projects.modal.descLabel}</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">{t.projects.modal.ownerLabel}</label>
                  <input 
                    type="text" 
                    value={formData.owner}
                    onChange={e => setFormData({...formData, owner: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">{t.projects.modal.statusLabel}</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as 'Active' | 'Archived'})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  >
                    <option value="Active">{t.projects.status.active}</option>
                    <option value="Archived">{t.projects.status.archived}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white font-medium"
              >
                {t.common.cancel}
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.name}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium"
              >
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
