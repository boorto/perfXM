import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ScriptManager } from './components/ScriptManager';
import { ProjectManager } from './components/ProjectManager';
import { ExecutionMonitor } from './components/ExecutionMonitor';
import { AgentManager } from './components/AgentManager';
import { ConfigManager } from './components/ConfigManager';
import { PlanManager } from './components/PlanManager';
import { LoginPage } from './components/LoginPage';
import { ModuleType } from './types';
import { CloudLightning, Database, Globe } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { SystemProvider } from './contexts/SystemContext';
import { ScriptProvider } from './contexts/ScriptContext';
import { AgentProvider } from './contexts/AgentContext';
import { PlanProvider } from './contexts/PlanContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const PlaceholderModule = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="h-full flex flex-col items-center justify-center text-slate-600 animate-in fade-in">
    <div className="bg-slate-900 p-8 rounded-full mb-6 border border-slate-800">
      <Icon size={64} strokeWidth={1} className="text-slate-700" />
    </div>
    <h2 className="text-2xl font-bold text-slate-300 mb-2">{title}</h2>
    <p className="max-w-md text-center text-slate-500">
      This advanced module is configured and ready for integration with your backend infrastructure.
    </p>
  </div>
);

const AppContent: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeModule) {
      case ModuleType.DASHBOARD:
        return <Dashboard />;
      case ModuleType.PROJECTS:
        return <ProjectManager />;
      case ModuleType.SCRIPTS:
        return <ScriptManager />;
      case ModuleType.EXECUTION:
        return <ExecutionMonitor />;
      case ModuleType.AGENTS:
        return <AgentManager />;
      case ModuleType.CONFIG:
        return <ConfigManager />;
      case ModuleType.PLANS:
        return <PlanManager />;
      case ModuleType.SCENARIOS:
        return <PlaceholderModule title={t.nav.scenarios} icon={CloudLightning} />;
      case ModuleType.DATASOURCE:
        return <PlaceholderModule title={t.nav.datasource} icon={Database} />;
      default:
        return <Dashboard />;
    }
  };

  const moduleTitles: Record<ModuleType, string> = {
    [ModuleType.DASHBOARD]: t.nav.dashboard,
    [ModuleType.PROJECTS]: t.nav.projects,
    [ModuleType.SCENARIOS]: t.nav.scenarios,
    [ModuleType.SCRIPTS]: t.nav.scripts,
    [ModuleType.PLANS]: t.nav.plans,
    [ModuleType.EXECUTION]: t.nav.execution,
    [ModuleType.AGENTS]: t.nav.agents,
    [ModuleType.DATASOURCE]: t.nav.datasource,
    [ModuleType.CONFIG]: t.nav.config
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      
      <main className="flex-1 ml-64 p-8 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {moduleTitles[activeModule]}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Performance Engineering Platform</p>
          </div>
          
          <div className="flex gap-4 items-center">
             <button 
               onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
               className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
             >
                <Globe size={16} />
                <span className="font-medium">{language.toUpperCase()}</span>
             </button>
             <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                System Healthy
             </div>
          </div>
        </header>

        <div className="h-[calc(100vh-10rem)]">
            {renderContent()}
        </div>
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ProjectProvider>
          <ScriptProvider>
            <AgentProvider>
              <PlanProvider>
                <SystemProvider>
                  <AppContent />
                </SystemProvider>
              </PlanProvider>
            </AgentProvider>
          </ScriptProvider>
        </ProjectProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;