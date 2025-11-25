
import React, { useState } from 'react';
import { useSystem } from '../contexts/SystemContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Edit2, Trash2, Search, X, User as UserIcon, Mail, Building, Shield } from 'lucide-react';
import { User } from '../types';

export const SystemUserManager: React.FC = () => {
  const { t } = useLanguage();
  const { users, roles, orgs, addUser, updateUser, deleteUser } = useSystem();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    roleId: '',
    orgId: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        orgId: user.orgId,
        status: user.status
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        roleId: roles[0]?.id || '',
        orgId: orgs[0]?.id || '',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      addUser(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">{t.config.menu.users}</h3>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} />
          {t.config.users.add}
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">{t.config.users.username}</th>
              <th className="px-6 py-4">{t.config.users.role}</th>
              <th className="px-6 py-4">{t.config.users.org}</th>
              <th className="px-6 py-4">{t.common.status}</th>
              <th className="px-6 py-4">{t.config.users.lastLogin}</th>
              <th className="px-6 py-4 text-right">{t.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {users.map(user => {
              const roleName = roles.find(r => r.id === user.roleId)?.name || 'Unknown';
              const orgName = orgs.find(o => o.id === user.orgId)?.name || 'Unknown';
              return (
                <tr key={user.id} className="hover:bg-slate-800/30 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                        <UserIcon size={14} />
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.username}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{roleName}</td>
                  <td className="px-6 py-4 text-slate-300">{orgName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs border ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-700'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-mono">{user.lastLogin || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(user)} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteUser(user.id)} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-rose-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">
                {editingUser ? t.config.users.modal.titleEdit : t.config.users.modal.titleAdd}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">{t.config.users.username}</label>
                <input 
                  type="text" 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">{t.config.users.email}</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">{t.config.users.role}</label>
                  <select 
                    value={formData.roleId}
                    onChange={e => setFormData({...formData, roleId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  >
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">{t.config.users.org}</label>
                  <select 
                    value={formData.orgId}
                    onChange={e => setFormData({...formData, orgId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  >
                    {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">{t.common.status}</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
