
import React, { useState } from 'react';
import type{ Agent } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAgents } from '../contexts/AgentContext';
import { Server, Plus, Edit2, Trash2, Power, Cpu, Activity, Search, X, Network, Crown, HardDrive } from 'lucide-react';

export const AgentManager: React.FC = () => {
  const { t } = useLanguage();
  const { agents, addAgent, updateAgent, deleteAgent } = useAgents();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({ name: '', role: 'SLAVE' as 'MASTER'|'SLAVE', ip: '', port: 1099, region: '', maxThreads: 5000, tags: '' });

  const handleOpenModal = (agent?: Agent) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name,
        role: agent.role,
        ip: agent.ip,
        port: agent.port || 1099,
        region: agent.region,
        maxThreads: agent.maxThreads || 5000,
        tags: agent.tags?.join(', ') || ''
      });
    } else {
      setEditingAgent(null);
      setFormData({ name: '', role: 'SLAVE', ip: '', port: 1099, region: 'us-east-1', maxThreads: 5000, tags: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    if (editingAgent) {
      updateAgent(editingAgent.id, { ...formData, tags: tagsArray });
    } else {
      const newAgent: Agent = {
        id: Date.now().toString(),
        status: 'Idle',
        cpuUsage: 0,
        memoryUsage: 0,
        ...formData,
        tags: tagsArray
      };
      addAgent(newAgent);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this machine?')) {
      deleteAgent(id);
    }
  };

  const toggleStatus = (agent: Agent) => {
    updateAgent(agent.id, { status: agent.status === 'Offline' ? 'Idle' : 'Offline' });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      Idle: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      Busy: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      Offline: 'bg-slate-700/50 text-slate-500 border-slate-700',
    };
    const labels = {
        Idle: t.agents.status.idle,
        Busy: t.agents.status.busy,
        Offline: t.agents.status.offline
    };
    const activeStyle = styles[status as keyof typeof styles] || styles.Offline;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${activeStyle}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Offline' ? 'bg-slate-500' : status === 'Busy' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}></span>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-6 animate-in fade-in">
      {/* Header Actions */}
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Server className="text-blue-500" />
                {t.agents.title}
            </h2>
            <p className="text-slate-400 text-sm mt-1">{t.agents.subtitle}</p>
        </div>
        <div className="flex gap-3">
             <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all border border-slate-700">
                <Network size={16} />
                {t.agents.checkConn}
            </button>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                    type="text" 
                    placeholder={t.common.search}
                    className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none w-64"
                />
            </div>
            <button 
                onClick={() => handleOpenModal()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
            >
                <Plus size={16} />
                {t.agents.addAgent}
            </button>
        </div>
      </div>

      {/* Agents Grid/List */}
      <div className="flex-1 overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800/50 sticky top-0 z-10 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <tr>
                    <th className="px-6 py-4">{t.agents.table.name}</th>
                    <th className="px-6 py-4">{t.agents.table.role}</th>
                    <th className="px-6 py-4">{t.agents.table.endpoint}</th>
                    <th className="px-6 py-4">{t.agents.table.status}</th>
                    <th className="px-6 py-4 w-1/5">{t.agents.table.resources}</th>
                    <th className="px-6 py-4">{t.agents.table.maxThreads}</th>
                    <th className="px-6 py-4 text-right">{t.agents.table.actions}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
                {agents.map(agent => (
                    <tr key={agent.id} className="hover:bg-slate-800/30 group transition-colors">
                        <td className="px-6 py-4">
                            <div className="font-medium text-white flex items-center gap-2">
                                {agent.name}
                            </div>
                            <div className="flex gap-1 mt-1">
                                {agent.tags?.map(tag => (
                                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                             {agent.role === 'MASTER' ? (
                                 <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-medium">
                                     <Crown size={12} /> Master
                                 </span>
                             ) : (
                                 <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-700/30 text-slate-400 border border-slate-700 text-xs font-medium">
                                     <HardDrive size={12} /> Slave
                                 </span>
                             )}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-400 text-xs">
                            {agent.ip}:{agent.port}
                        </td>
                        <td className="px-6 py-4">
                            <StatusBadge status={agent.status} />
                        </td>
                        <td className="px-6 py-4">
                           <div className="space-y-2">
                               <div className="flex items-center gap-2 text-xs">
                                   <Cpu size={12} className="text-slate-500" />
                                   <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                       <div 
                                        className={`h-full rounded-full ${agent.cpuUsage > 80 ? 'bg-rose-500' : 'bg-blue-500'}`} 
                                        style={{width: `${agent.cpuUsage}%`}}
                                       ></div>
                                   </div>
                               </div>
                               <div className="flex items-center gap-2 text-xs">
                                   <Activity size={12} className="text-slate-500" />
                                   <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                       <div 
                                        className={`h-full rounded-full ${agent.memoryUsage > 80 ? 'bg-amber-500' : 'bg-purple-500'}`} 
                                        style={{width: `${agent.memoryUsage}%`}}
                                       ></div>
                                   </div>
                               </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                            {agent.role === 'SLAVE' ? agent.maxThreads?.toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => toggleStatus(agent)}
                                    className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors" 
                                    title={agent.status === 'Offline' ? 'Start' : 'Stop'}
                                >
                                    <Power size={16} className={agent.status === 'Offline' ? 'text-emerald-500' : 'text-rose-500'} />
                                </button>
                                <button 
                                    onClick={() => handleOpenModal(agent)}
                                    className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(agent.id)}
                                    className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <h3 className="text-lg font-semibold text-white">
                        {editingAgent ? t.agents.modal.titleEdit : t.agents.modal.titleAdd}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t.agents.modal.roleLabel}</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setFormData({...formData, role: 'MASTER', maxThreads: 0})}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                                    formData.role === 'MASTER' 
                                    ? 'bg-purple-500/10 border-purple-500 text-purple-400' 
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                }`}
                            >
                                <Crown size={16} /> {t.agents.roles.master}
                            </button>
                            <button
                                onClick={() => setFormData({...formData, role: 'SLAVE', maxThreads: 5000})}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                                    formData.role === 'SLAVE' 
                                    ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                }`}
                            >
                                <HardDrive size={16} /> {t.agents.roles.slave}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t.agents.modal.nameLabel}</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{t.agents.modal.ipLabel}</label>
                            <input 
                                type="text" 
                                value={formData.ip}
                                onChange={e => setFormData({...formData, ip: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                                placeholder="e.g. 10.0.1.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{t.agents.modal.portLabel}</label>
                            <input 
                                type="number" 
                                value={formData.port}
                                onChange={e => setFormData({...formData, port: parseInt(e.target.value)})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {formData.role === 'SLAVE' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{t.agents.modal.threadsLabel}</label>
                            <input 
                                type="number" 
                                value={formData.maxThreads}
                                onChange={e => setFormData({...formData, maxThreads: parseInt(e.target.value)})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t.agents.modal.regionLabel}</label>
                        <select 
                            value={formData.region}
                            onChange={e => setFormData({...formData, region: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                        >
                            <option value="us-east-1">US East (N. Virginia)</option>
                            <option value="us-west-2">US West (Oregon)</option>
                            <option value="eu-west-1">EU (Ireland)</option>
                            <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t.agents.modal.tagsLabel}</label>
                        <input 
                            type="text" 
                            value={formData.tags}
                            onChange={e => setFormData({...formData, tags: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
                            placeholder="e.g. worker, gpu, high-mem"
                        />
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
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
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
