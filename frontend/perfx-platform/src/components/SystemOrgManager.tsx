
import React, { useState } from 'react';
import { useSystem } from '../contexts/SystemContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Edit2, Trash2, Building, X, Calendar } from 'lucide-react';
import type{ Organization } from '../types';

export const SystemOrgManager: React.FC = () => {
  const { t } = useLanguage();
  const { orgs, addOrg, updateOrg, deleteOrg } = useSystem();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  const handleOpenModal = (org?: Organization) => {
    if (org) {
      setEditingOrg(org);
      setFormData({
        name: org.name,
        code: org.code,
        description: org.description
      });
    } else {
      setEditingOrg(null);
      setFormData({ name: '', code: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingOrg) {
      updateOrg(editingOrg.id, formData);
    } else {
      addOrg(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
       <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">{t.config.menu.orgs}</h3>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} />
          {t.config.orgs.add}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
           <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">{t.config.orgs.name}</th>
              <th className="px-6 py-4">{t.config.orgs.code}</th>
              <th className="px-6 py-4">{t.common.description}</th>
              <th className="px-6 py-4">{t.config.orgs.created}</th>
              <th className="px-6 py-4 text-right">{t.common.actions}</th>
            </tr>
          </thead>
           <tbody className="divide-y divide-slate-800 text-sm">
             {orgs.map(org => (
               <tr key={org.id} className="hover:bg-slate-800/30 group">
                 <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                       <Building size={16} />
                     </div>
                     <span className="font-medium text-white">{org.name}</span>
                   </div>
                 </td>
                 <td className="px-6 py-4 font-mono text-slate-400">{org.code}</td>
                 <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{org.description}</td>
                 <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                   <Calendar size={14} />
                   {org.createdAt}
                 </td>
                 <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(org)} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400"><Edit2 size={16}/></button>
                      <button onClick={() => deleteOrg(org.id)} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-rose-400"><Trash2 size={16}/></button>
                    </div>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
               <h3 className="text-lg font-semibold text-white">
                {editingOrg ? t.config.orgs.modal.titleEdit : t.config.orgs.modal.titleAdd}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">{t.config.orgs.name}</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">{t.config.orgs.code}</label>
                  <input 
                    type="text" 
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none uppercase"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">{t.common.description}</label>
                   <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none resize-none"
                    />
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
