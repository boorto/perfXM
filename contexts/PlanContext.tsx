
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TestPlan } from '../types';

interface PlanContextType {
  plans: TestPlan[];
  addPlan: (plan: Omit<TestPlan, 'id'>) => void;
  updatePlan: (id: string, updates: Partial<TestPlan>) => void;
  deletePlan: (id: string) => void;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plans, setPlans] = useState<TestPlan[]>([
    {
      id: '1',
      name: 'Black Friday Peak Load',
      description: 'Stress test for checkout service',
      projectId: '1', // E-Commerce Core
      status: 'Completed',
      scriptIds: ['1'],
      agentIds: ['1', '2', '3'],
      config: { threads: 10000, rampUp: 60, duration: 600, loops: 1 },
      lastRun: '2023-10-26 15:30'
    },
    {
      id: '2',
      name: 'Inventory API Soak Test',
      description: 'Long running stability test',
      projectId: '2', // Warehouse Ops
      status: 'Draft',
      scriptIds: ['3'],
      agentIds: ['1', '2'],
      config: { threads: 500, rampUp: 30, duration: 3600, loops: -1 },
    }
  ]);

  const addPlan = (plan: Omit<TestPlan, 'id'>) => {
    const newPlan = { ...plan, id: Date.now().toString() };
    setPlans(prev => [newPlan, ...prev]);
  };

  const updatePlan = (id: string, updates: Partial<TestPlan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PlanContext.Provider value={{ plans, addPlan, updatePlan, deletePlan }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlans = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlans must be used within a PlanProvider');
  }
  return context;
};
