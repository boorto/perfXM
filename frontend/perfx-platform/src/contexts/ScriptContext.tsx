
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type{ Script } from '../types';

interface ScriptContextType {
  scripts: Script[];
  addScript: (script: Script) => void;
  deleteScript: (id: string) => void;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export const ScriptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scripts, setScripts] = useState<Script[]>([
    { 
      id: '1', 
      name: 'Order_Checkout_Flow.jmx', 
      project: 'E-Commerce Core', 
      version: 'v1.2.0', 
      size: '24 KB', 
      updatedAt: '2023-10-27 14:30', 
      content: '<?xml version="1.0" encoding="UTF-8"?>\n<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.5">\n  <hashTree>\n    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="Order Checkout" enabled="true">\n      <!-- Mock JMX Content -->\n    </TestPlan>\n  </hashTree>\n</jmeterTestPlan>' 
    },
    { 
      id: '2', 
      name: 'User_Login_Stress.jmx', 
      project: 'E-Commerce Core', 
      version: 'v1.0.5', 
      size: '12 KB', 
      updatedAt: '2023-10-25 09:15', 
      content: '<?xml version="1.0" encoding="UTF-8"?>\n<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.5">\n ... \n</jmeterTestPlan>' 
    },
    { 
      id: '3', 
      name: 'Inventory_Search.jmx', 
      project: 'Warehouse Ops', 
      version: 'v2.0.1', 
      size: '45 KB', 
      updatedAt: '2023-10-20 11:42', 
      content: '...' 
    },
  ]);

  const addScript = (script: Script) => {
    setScripts(prev => [script, ...prev]);
  };

  const deleteScript = (id: string) => {
    setScripts(prev => prev.filter(s => s.id !== id));
  };

  return (
    <ScriptContext.Provider value={{ scripts, addScript, deleteScript }}>
      {children}
    </ScriptContext.Provider>
  );
};

export const useScripts = () => {
  const context = useContext(ScriptContext);
  if (context === undefined) {
    throw new Error('useScripts must be used within a ScriptProvider');
  }
  return context;
};
