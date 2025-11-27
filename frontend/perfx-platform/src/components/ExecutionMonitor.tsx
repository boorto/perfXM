import React, { useState, useEffect } from 'react';
import { Terminal, PauseCircle, StopCircle, RefreshCw } from 'lucide-react';
import type{ ExecutionLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const ExecutionMonitor: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isRunning, setIsRunning] = useState(true);

  // Simulate incoming logs
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      const levels: ('INFO' | 'WARN' | 'ERROR')[] = ['INFO', 'INFO', 'INFO', 'WARN', 'INFO'];
      const newLog: ExecutionLog = {
        timestamp: new Date().toISOString().split('T')[1].split('.')[0],
        level: levels[Math.floor(Math.random() * levels.length)],
        message: `[Agent-01] Request processed successfully in ${Math.floor(Math.random() * 100 + 20)}ms`
      };
      setLogs(prev => [...prev.slice(-50), newLog]);
    }, 1500);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-6 animate-in fade-in">
       {/* Status Header */}
       <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-between">
         <div className="flex items-center gap-6">
           <div className="relative">
             <div className={`w-4 h-4 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
             {isRunning && <div className="absolute inset-0 w-4 h-4 rounded-full bg-emerald-500 animate-ping opacity-75"></div>}
           </div>
           <div>
             <h2 className="text-xl font-bold text-white">Scenario: Black Friday Checkout</h2>
             <p className="text-slate-400 text-sm mt-1">Running on 4 agents • Target: 5000 RPS</p>
           </div>
         </div>

         <div className="flex gap-3">
           <button 
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-all"
           >
             {isRunning ? <PauseCircle size={20} /> : <RefreshCw size={20} />}
             {isRunning ? t.execution.pause : t.execution.resume}
           </button>
           <button className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-lg shadow-rose-900/20 transition-all">
             <StopCircle size={20} /> {t.execution.stop}
           </button>
         </div>
       </div>

       {/* Terminal */}
       <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl flex flex-col overflow-hidden font-mono shadow-2xl">
         <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2">
           <Terminal size={16} className="text-slate-500" />
           <span className="text-sm text-slate-400">{t.execution.console}</span>
         </div>
         <div className="flex-1 p-4 overflow-y-auto space-y-1">
           {logs.map((log, idx) => (
             <div key={idx} className="text-sm flex gap-3 hover:bg-white/5 p-0.5 rounded">
               <span className="text-slate-500 select-none">[{log.timestamp}]</span>
               <span className={`font-bold w-12 ${
                 log.level === 'INFO' ? 'text-blue-400' : 
                 log.level === 'WARN' ? 'text-yellow-400' : 'text-rose-400'
               }`}>{log.level}</span>
               <span className="text-slate-300">{log.message}</span>
             </div>
           ))}
           {logs.length === 0 && <div className="text-slate-600 italic">{t.execution.waiting}</div>}
         </div>
       </div>
    </div>
  );
};