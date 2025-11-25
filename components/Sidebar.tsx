
import React from 'react';
import { 
  LayoutDashboard, 
  FileCode, 
  Layers, 
  Calendar, 
  PlayCircle, 
  Settings, 
  Database, 
  Server,
  FolderOpen,
  LogOut
} from 'lucide-react';
import { ModuleType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  
  const navItems = [
    { id: ModuleType.DASHBOARD, label: t.nav.dashboard, icon: LayoutDashboard },
    { id: ModuleType.PROJECTS, label: t.nav.projects, icon: FolderOpen },
    { id: ModuleType.SCENARIOS, label: t.nav.scenarios, icon: Layers },
    { id: ModuleType.SCRIPTS, label: t.nav.scripts, icon: FileCode },
    { id: ModuleType.PLANS, label: t.nav.plans, icon: Calendar },
    { id: ModuleType.EXECUTION, label: t.nav.execution, icon: PlayCircle },
    { id: ModuleType.AGENTS, label: t.nav.agents, icon: Server },
    { id: ModuleType.DATASOURCE, label: t.nav.datasource, icon: Database },
    { id: ModuleType.CONFIG, label: t.nav.config, icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="font-bold text-white">P</span>
        </div>
        <h1 className="text-xl font-bold tracking-wider text-slate-100">Perf<span className="text-blue-500">X</span></h1>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white uppercase shadow-lg shadow-emerald-500/20">
              {user?.username.substring(0, 2) || 'AD'}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.username || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@perfx.io'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 hover:bg-slate-700 rounded-md text-slate-500 hover:text-rose-400 transition-colors"
            title={t.auth.logout}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
