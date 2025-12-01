import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Agent } from '../types';

interface AgentContextType {
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>([
    { id: '1', name: 'JMeter-Master-01', role: 'MASTER', ip: '10.0.1.10', port: 1099, status: 'Idle', region: 'us-east-1', cpuUsage: 15, memoryUsage: 32, maxThreads: 0, tags: ['controller'] },
    { id: '2', name: 'Load-Worker-01', role: 'SLAVE', ip: '10.0.1.24', port: 1099, status: 'Busy', region: 'us-east-1', cpuUsage: 84, memoryUsage: 62, maxThreads: 5000, tags: ['worker', 'high-cpu'] },
    { id: '3', name: 'Load-Worker-02', role: 'SLAVE', ip: '10.0.1.25', port: 1099, status: 'Idle', region: 'us-east-1', cpuUsage: 12, memoryUsage: 24, maxThreads: 5000, tags: ['worker'] },
    { id: '4', name: 'Load-Worker-03', role: 'SLAVE', ip: '192.168.1.55', port: 1099, status: 'Offline', region: 'eu-west-2', cpuUsage: 0, memoryUsage: 0, maxThreads: 2500, tags: ['worker', 'backup'] },
  ]);

  const addAgent = (agent: Agent) => {
    setAgents(prev => [...prev, agent]);
  };

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAgent = (id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AgentContext.Provider value={{ agents, addAgent, updateAgent, deleteAgent }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within a AgentProvider');
  }
  return context;
};