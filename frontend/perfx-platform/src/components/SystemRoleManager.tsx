
import React, { useState } from 'react';
import { useSystem } from '../contexts/SystemContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Edit2, Trash2, Shield, X, Check } from 'lucide-react';
import type{ Role, ModuleType } from '../types';

export const SystemRoleManager: React.FC = () => {
  const { t } = useLanguage();
  const { roles, addRole, updateRole, deleteRole } = useSystem();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as ModuleType[]
  });

  const allModules = Object.values(ModuleType);

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (module: ModuleType) => {
    const perms = formData.permissions;
    if (perms.includes(module)) {
      setFormData({ ...formData, permissions: perms.filter(p => p !== module) });
    } else {
      setFormData({ ...formData, permissions: [...perms, module] });
    }
  };

  const handleSave = () => {
    if (editingRole) {
      updateRole(editingRole.id, formData);
    } else {
      addRole(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
       <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">{t.config.menu.roles}</h3>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} />
          {t.config.roles.add}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative group hover:border-blue-500/30 transition-all">
             <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <Shield size={20} />
                   </div>
                   <div>
                      <h4 className="font-semibold text-white">{role.name}</h4>
                      <p className="text-xs text-slate-500">{role.isSystem ? 'System Default' : 'Custom Role'}</p>
                   </div>
                </div>
                {!role.isSystem && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(role)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400"><Edit2 size={16}/></button>
                    <button onClick={() => deleteRole(role.id)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400"><Trash2 size={16}/></button>
                  </div>
                )}
             </div>
             <p className="text-sm text-slate-400 mb-4 h-10">{role.description}</p>
             
             <div className="border-t border-slate-800 pt-4">
               <div className="text-xs text-slate-500 uppercase font-medium mb-2">{t.config.roles.permissions}</div>
               <div className="flex flex-wrap gap-2">
                 {role.permissions.slice(0, 5).map(perm => (
                   <span key={perm} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{perm}</span>
                 ))}
                 {role.permissions.length > 5 && (
                   <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-1 rounded border border-slate-700">+{role.permissions.length - 5}</span>
                 )}
               </div>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">
                {editingRole ? t.config.roles.modal.titleEdit : t.config.roles.modal.titleAdd}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 flex gap-6">
               <div className="w-1/3 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">{t.config.roles.name}</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">{t.common.description}</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      rows={5}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none resize-none"
                    />
                  </div>
               </div>
               <div className="flex-1 border-l border-slate-800 pl-6">
                 <label className="block text-sm font-medium text-slate-400 mb-3">{t.config.roles.modal.selectPerms}</label>
                 <div className="grid grid-cols-2 gap-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {allModules.map(module => (
                      <div 
                        key={module}
                        onClick={() => handleTogglePermission(module)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.permissions.includes(module) 
                          ? 'bg-blue-500/10 border-blue-500/50 text-blue-100' 
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                         <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                           formData.permissions.includes(module) ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
                         }`}>
                            {formData.permissions.includes(module) && <Check size={12} className="text-white" />}
                         </div>
                         <span className="text-sm font-medium">{module}</span>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">{t.common.cancel}</button>
              <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">{t.common.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
