
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePlans } from '../contexts/PlanContext';
import { useProjects } from '../contexts/ProjectContext';
import { useScripts } from '../contexts/ScriptContext';
import { useAgents } from '../contexts/AgentContext';
import { TestPlan, ExecutionLog } from '../types';
import { Calendar, Play, Plus, Trash2, Edit2, Check, X, Server, FileCode, Terminal, RefreshCw, StopCircle, PauseCircle, Activity, AlertCircle, ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const PlanManager: React.FC = () => {
  const { t } = useLanguage();
  const { plans, addPlan, deletePlan, updatePlan } = usePlans();
  const { projects } = useProjects();
  const { scripts } = useScripts();
  const { agents } = useAgents();

  const [activeView, setActiveView] = useState<'LIST' | 'CREATE' | 'EXECUTE'>('LIST');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  // Execution State
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [executionMetrics, setExecutionMetrics] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<TestPlan>>({
    name: '',
    projectId: '',
    scriptIds: [],
    agentIds: [],
    config: { threads: 100, rampUp: 10, duration: 60, loops: 1 }
  });
  const [step, setStep] = useState(1);

  // --- Derived State for Wizard ---
  // 1. Find the full project object based on the selected ID
  const selectedProject = useMemo(() => 
    projects.find(p => p.id === formData.projectId), 
    [projects, formData.projectId]
  );

  // 2. Filter scripts that belong to this project
  // scripts.project stores the project NAME, so we compare names.
  const availableScripts = useMemo(() => {
    if (!selectedProject) return [];
    return scripts.filter(s => s.project === selectedProject.name);
  }, [scripts, selectedProject]);

  // --- Execution Logic (Simulation) ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeView === 'EXECUTE' && isRunning) {
       interval = setInterval(() => {
           // Simulating metrics
           const now = new Date();
           const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
           setExecutionMetrics(prev => [...prev.slice(-20), {
               time: timeStr,
               rps: Math.floor(Math.random() * 2000 + 500),
               latency: Math.floor(Math.random() * 100 + 20)
           }]);

           // Simulating logs
           if (Math.random() > 0.7) {
               const levels: ('INFO'|'WARN')[] = ['INFO', 'WARN'];
               const msg = `[Agent-Worker-${Math.floor(Math.random()*3)}] Transaction processed in ${Math.floor(Math.random()*100)}ms`;
               setExecutionLogs(prev => [...prev.slice(-50), {
                   timestamp: timeStr,
                   level: levels[Math.floor(Math.random() * levels.length)],
                   message: msg
               }]);
           }
       }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeView, isRunning]);

  const handleStartExecution = (planId: string) => {
    setSelectedPlanId(planId);
    setActiveView('EXECUTE');
    setIsRunning(true);
    updatePlan(planId, { status: 'Running', lastRun: new Date().toISOString().slice(0, 16).replace('T', ' ') });
    setExecutionLogs([{ timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'Initializing distributed cluster...' }]);
    setExecutionMetrics([]);
  };

  const handleStopExecution = () => {
    setIsRunning(false);
    if (selectedPlanId) {
        updatePlan(selectedPlanId, { status: 'Completed' });
    }
  };

  const handleCreateSave = () => {
    if (formData.name && formData.projectId) {
       addPlan(formData as Omit<TestPlan, 'id'>);
       setActiveView('LIST');
       setFormData({
        name: '',
        projectId: '',
        scriptIds: [],
        agentIds: [],
        config: { threads: 100, rampUp: 10, duration: 60, loops: 1 }
       });
       setStep(1);
    }
  };

  const renderCreateWizard = () => {
    return (
        <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Wizard Header */}
            <div className="bg-slate-800/50 p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Calendar className="text-blue-500" />
                    {t.plans.modal.title}
                </h3>
                <div className="flex gap-4 items-center">
                     <div className="flex gap-1">
                         {[1,2,3,4].map(s => (
                             <div key={s} className={`h-1.5 w-8 rounded-full transition-colors ${step >= s ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                         ))}
                     </div>
                     <span className="text-sm font-mono text-slate-400">Step {step}/4</span>
                </div>
            </div>
            
            <div className="p-8 min-h-[400px]">
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                        <div className="mb-6">
                            <h4 className="text-lg font-medium text-white">{t.plans.modal.step1}</h4>
                            <p className="text-sm text-slate-400 mt-1">Define the core metadata for your load test plan.</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t.plans.modal.nameLabel}</label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                placeholder="e.g., Black Friday Peak Load Test"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t.plans.modal.projectLabel}</label>
                            <select 
                                value={formData.projectId} 
                                onChange={e => setFormData({...formData, projectId: e.target.value, scriptIds: []})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                            >
                                <option value="">-- Select Associated Project --</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <div className="flex gap-2 mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-200">
                                    Selecting a project will filter the available scripts in the next step. Only scripts belonging to this project will be shown.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                     <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h4 className="text-lg font-medium text-white">{t.plans.modal.step2}</h4>
                                <p className="text-sm text-slate-400 mt-1">
                                    Showing scripts for project: <span className="text-blue-400 font-semibold">{selectedProject?.name}</span>
                                </p>
                            </div>
                            <div className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-400 border border-slate-700">
                                {availableScripts.length} scripts available
                            </div>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden min-h-[250px] relative">
                             {availableScripts.length === 0 ? (
                                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                     <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                                         <FileCode className="text-slate-600" size={32} />
                                     </div>
                                     <h5 className="text-slate-300 font-medium mb-2">No Scripts Found</h5>
                                     <p className="text-slate-500 text-sm max-w-sm mb-6">
                                         There are no scripts associated with project <span className="text-slate-300 font-medium">"{selectedProject?.name}"</span>.
                                     </p>
                                     <button onClick={() => setActiveView('LIST')} className="text-blue-500 hover:text-blue-400 text-sm font-medium hover:underline">
                                         Go to Script Management to upload scripts
                                     </button>
                                 </div>
                             ) : (
                                <div className="divide-y divide-slate-800">
                                    {availableScripts.map(script => (
                                        <label key={script.id} className={`flex items-start gap-4 p-4 cursor-pointer transition-colors ${formData.scriptIds?.includes(script.id) ? 'bg-blue-600/5' : 'hover:bg-slate-900'}`}>
                                            <div className="pt-1">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.scriptIds?.includes(script.id)}
                                                    onChange={e => {
                                                        const current = formData.scriptIds || [];
                                                        setFormData({
                                                            ...formData, 
                                                            scriptIds: e.target.checked ? [...current, script.id] : current.filter(id => id !== script.id)
                                                        });
                                                    }}
                                                    className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-offset-0 focus:ring-2 focus:ring-blue-500/50"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="font-medium text-white flex items-center gap-2">
                                                        <FileCode size={16} className="text-slate-500" />
                                                        {script.name}
                                                    </div>
                                                    <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                                                        {script.size}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                                                    <span className="bg-slate-800/50 px-1.5 rounded text-slate-400">{script.version}</span>
                                                    <span>Updated: {script.updatedAt}</span>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                             )}
                        </div>
                     </div>
                )}

                {step === 3 && (
                     <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                        <div>
                            <h4 className="text-lg font-medium text-white">{t.plans.modal.step3}</h4>
                            <p className="text-sm text-slate-400 mt-1">Select the load generators (Agents) for this test.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {agents.length === 0 && (
                                <div className="col-span-2 p-12 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 bg-slate-950/50">
                                    No agents configured. Please go to "Machine Config" to add agents.
                                </div>
                            )}
                            {agents.map(agent => (
                                <div 
                                    key={agent.id}
                                    onClick={() => {
                                        const current = formData.agentIds || [];
                                        if (current.includes(agent.id)) {
                                            setFormData({...formData, agentIds: current.filter(id => id !== agent.id)});
                                        } else {
                                            setFormData({...formData, agentIds: [...current, agent.id]});
                                        }
                                    }}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden group ${
                                        formData.agentIds?.includes(agent.id) 
                                        ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-900/10' 
                                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${agent.role === 'MASTER' ? 'bg-purple-500/10 text-purple-500' : 'bg-slate-800 text-slate-400'}`}>
                                                <Server size={20} />
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{agent.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">{agent.ip}</div>
                                            </div>
                                        </div>
                                        {formData.agentIds?.includes(agent.id) && (
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                                                <Check size={14} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${agent.role === 'MASTER' ? 'border-purple-500/20 text-purple-400 bg-purple-500/5' : 'border-slate-700 text-slate-400 bg-slate-800'}`}>
                                            {agent.role}
                                        </span>
                                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                                            {agent.region}
                                        </span>
                                        {agent.status === 'Busy' && (
                                            <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                                                <Activity size={10} /> Busy
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                        <div>
                            <h4 className="text-lg font-medium text-white">{t.plans.modal.step4}</h4>
                            <p className="text-sm text-slate-400 mt-1">Configure the load profile parameters.</p>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h5 className="text-white font-medium">Load Distribution</h5>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Total load will be distributed among <span className="text-white font-bold">{formData.agentIds?.length || 0}</span> selected agents.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">{t.plans.modal.threadsLabel}</label>
                                    <div className="relative group">
                                        <input 
                                            type="number" 
                                            value={formData.config?.threads}
                                            onChange={e => setFormData({...formData, config: {...formData.config!, threads: parseInt(e.target.value)}})}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">Total Users</span>
                                    </div>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">{t.plans.modal.durationLabel}</label>
                                    <div className="relative group">
                                        <input 
                                            type="number" 
                                            value={formData.config?.duration}
                                            onChange={e => setFormData({...formData, config: {...formData.config!, duration: parseInt(e.target.value)}})}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">Seconds</span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">{t.plans.modal.rampUpLabel}</label>
                                    <div className="relative group">
                                        <input 
                                            type="number" 
                                            value={formData.config?.rampUp}
                                            onChange={e => setFormData({...formData, config: {...formData.config!, rampUp: parseInt(e.target.value)}})}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">Seconds</span>
                                    </div>
                                    <div className="mt-2 text-xs text-slate-500">
                                        Calculated Rate: <span className="text-slate-300">{Math.round((formData.config?.threads || 0) / (formData.config?.rampUp || 1))} users/sec</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
                <button 
                    onClick={() => step > 1 ? setStep(step - 1) : setActiveView('LIST')}
                    className="flex items-center gap-2 px-6 py-2.5 text-slate-400 hover:text-white font-medium transition-colors"
                >
                    {step > 1 ? <ArrowLeft size={16} /> : <X size={16} />}
                    {step > 1 ? 'Back' : t.common.cancel}
                </button>
                <div className="flex gap-4 items-center">
                    <button 
                        onClick={() => step < 4 ? setStep(step + 1) : handleCreateSave()}
                        disabled={step === 1 && !formData.projectId}
                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2"
                    >
                        {step < 4 ? 'Next' : t.common.save}
                        {step < 4 && <div className="text-white/50">→</div>}
                    </button>
                </div>
            </div>
        </div>
    );
  };

  const renderExecutionView = () => {
      const plan = plans.find(p => p.id === selectedPlanId);
      if (!plan) return null;

      return (
          <div className="h-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
               {/* Header Control Panel */}
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex justify-between items-center shadow-lg">
                   <div>
                       <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono">
                                ID: {plan.id}
                            </span>
                       </div>
                       <p className="text-slate-400 mt-2 flex items-center gap-6 text-sm">
                           <span className="flex items-center gap-2"><Activity size={14} className="text-slate-500"/> Target: {plan.config.threads} VU</span>
                           <span className="flex items-center gap-2"><Calendar size={14} className="text-slate-500"/> Duration: {plan.config.duration}s</span>
                           <span className="flex items-center gap-2"><Server size={14} className="text-slate-500"/> Agents: {plan.agentIds.length} Nodes</span>
                       </p>
                   </div>
                   <div className="flex gap-4">
                       <button 
                            onClick={() => setActiveView('LIST')}
                            className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                        >
                           Close
                       </button>
                       {isRunning ? (
                           <button 
                                onClick={handleStopExecution}
                                className="flex items-center gap-2 px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium shadow-lg shadow-rose-900/20 transition-all"
                           >
                               <StopCircle size={18} /> {t.common.stop}
                           </button>
                       ) : (
                           <button 
                                onClick={() => handleStartExecution(plan.id)}
                                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-lg shadow-emerald-900/20 transition-all"
                           >
                               <RefreshCw size={18} /> Restart
                           </button>
                       )}
                   </div>
               </div>

               {/* Charts & Logs Grid */}
               <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                    {/* Charts Column */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col shadow-lg">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Activity size={18} className="text-blue-500" />
                                {t.plans.execution.progress} (RPS)
                            </h3>
                            <div className="flex-1 min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={executionMetrics}>
                                        <defs>
                                            <linearGradient id="colorRpsExec" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 12}} />
                                        <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }} />
                                        <Area type="monotone" dataKey="rps" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRpsExec)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Logs Column */}
                    <div className="bg-[#0f172a] border border-slate-800 rounded-xl flex flex-col overflow-hidden font-mono shadow-2xl">
                         <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2">
                            <Terminal size={16} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-300">{t.plans.execution.logs}</span>
                         </div>
                         <div className="flex-1 p-4 overflow-y-auto space-y-1.5 custom-scrollbar">
                             {executionLogs.map((log, i) => (
                                 <div key={i} className="text-xs flex gap-2">
                                     <span className="text-slate-500 shrink-0 select-none">{log.timestamp}</span>
                                     <span className={`font-bold shrink-0 ${log.level === 'INFO' ? 'text-blue-400' : 'text-amber-400'}`}>[{log.level}]</span>
                                     <span className="text-slate-300 break-all">{log.message}</span>
                                 </div>
                             ))}
                             {activeView === 'EXECUTE' && isRunning && (
                                 <div className="animate-pulse flex gap-1 mt-2">
                                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full delay-75"></div>
                                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full delay-150"></div>
                                 </div>
                             )}
                         </div>
                    </div>
               </div>
          </div>
      );
  };

  if (activeView === 'CREATE') return renderCreateWizard();
  if (activeView === 'EXECUTE') return renderExecutionView();

  // LIST VIEW
  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-6 animate-in fade-in">
        <div className="flex justify-between items-end">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <Calendar className="text-blue-500" />
                    {t.plans.title}
                </h2>
                <p className="text-slate-400 text-sm mt-1">{t.plans.subtitle}</p>
            </div>
            <button 
                onClick={() => setActiveView('CREATE')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
            >
                <Plus size={18} />
                {t.plans.add}
            </button>
        </div>

        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
             <table className="w-full text-left">
                 <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
                     <tr>
                         <th className="px-6 py-4">{t.plans.table.name}</th>
                         <th className="px-6 py-4">{t.plans.table.project}</th>
                         <th className="px-6 py-4">{t.plans.table.config}</th>
                         <th className="px-6 py-4">{t.plans.table.lastRun}</th>
                         <th className="px-6 py-4">{t.plans.table.status}</th>
                         <th className="px-6 py-4 text-right">{t.common.actions}</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800 text-sm">
                     {plans.map(plan => {
                         const projName = projects.find(p => p.id === plan.projectId)?.name || 'Unknown';
                         return (
                             <tr key={plan.id} className="hover:bg-slate-800/30 group transition-colors">
                                 <td className="px-6 py-4">
                                     <div className="font-medium text-white">{plan.name}</div>
                                     <div className="text-xs text-slate-500 mt-1 line-clamp-1">{plan.description}</div>
                                 </td>
                                 <td className="px-6 py-4 text-slate-300">{projName}</td>
                                 <td className="px-6 py-4">
                                     <div className="text-xs text-slate-400 space-y-0.5">
                                         <div><span className="text-slate-500">Threads:</span> {plan.config.threads}</div>
                                         <div><span className="text-slate-500">Duration:</span> {plan.config.duration}s</div>
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 text-slate-400 text-xs font-mono">{plan.lastRun || '-'}</td>
                                 <td className="px-6 py-4">
                                     <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                         plan.status === 'Running' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse' :
                                         plan.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                         'bg-slate-700/50 text-slate-400 border-slate-600'
                                     }`}>
                                         {plan.status}
                                     </span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                     <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button 
                                            onClick={() => handleStartExecution(plan.id)}
                                            className="p-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-lg transition-all"
                                            title={t.common.run}
                                         >
                                             <Play size={16} />
                                         </button>
                                         <button 
                                            onClick={() => deletePlan(plan.id)}
                                            className="p-1.5 hover:bg-slate-700 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                                         >
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
    </div>
  );
};
