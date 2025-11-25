
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SystemUserManager } from './SystemUserManager';
import { SystemRoleManager } from './SystemRoleManager';
import { SystemOrgManager } from './SystemOrgManager';
import { Users, Shield, Building } from 'lucide-react';

enum ConfigTab {
  USERS = 'USERS',
  ROLES = 'ROLES',
  ORGS = 'ORGS'
}

export const ConfigManager: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ConfigTab>(ConfigTab.USERS);

  const tabs = [
    { id: ConfigTab.USERS, label: t.config.menu.users, icon: Users },
    { id: ConfigTab.ROLES, label: t.config.menu.roles, icon: Shield },
    { id: ConfigTab.ORGS, label: t.config.menu.orgs, icon: Building },
  ];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-6 animate-in fade-in">
      {/* Sub Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === ConfigTab.USERS && <SystemUserManager />}
        {activeTab === ConfigTab.ROLES && <SystemRoleManager />}
        {activeTab === ConfigTab.ORGS && <SystemOrgManager />}
      </div>
    </div>
  );
};
