
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role, Organization, ModuleType } from '../types';

interface SystemContextType {
  users: User[];
  roles: Role[];
  orgs: Organization[];
  addUser: (user: Omit<User, 'id' | 'lastLogin'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  addOrg: (org: Omit<Organization, 'id' | 'createdAt'>) => void;
  updateOrg: (id: string, updates: Partial<Organization>) => void;
  deleteOrg: (id: string) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Mock Organizations
  const [orgs, setOrgs] = useState<Organization[]>([
    { id: '1', name: 'Headquarters', code: 'HQ', description: 'Global HQ', createdAt: '2023-01-01' },
    { id: '2', name: 'Engineering', code: 'ENG', description: 'Tech Division', createdAt: '2023-02-15' },
  ]);

  // Mock Roles
  const [roles, setRoles] = useState<Role[]>([
    { 
      id: '1', 
      name: 'Administrator', 
      description: 'Full system access', 
      isSystem: true,
      permissions: Object.values(ModuleType) 
    },
    { 
      id: '2', 
      name: 'Performance Tester', 
      description: 'Can run tests and view reports', 
      isSystem: false,
      permissions: [ModuleType.DASHBOARD, ModuleType.PROJECTS, ModuleType.SCRIPTS, ModuleType.PLANS, ModuleType.EXECUTION] 
    },
    { 
      id: '3', 
      name: 'Viewer', 
      description: 'Read-only access to dashboards', 
      isSystem: false,
      permissions: [ModuleType.DASHBOARD, ModuleType.EXECUTION] 
    },
  ]);

  // Mock Users
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'admin', email: 'admin@perfx.io', roleId: '1', orgId: '1', status: 'Active', lastLogin: '2023-10-27 10:30' },
    { id: '2', username: 'john_doe', email: 'john@perfx.io', roleId: '2', orgId: '2', status: 'Active', lastLogin: '2023-10-26 14:15' },
    { id: '3', username: 'guest_user', email: 'guest@perfx.io', roleId: '3', orgId: '1', status: 'Inactive' },
  ]);

  // User Actions
  const addUser = (user: Omit<User, 'id' | 'lastLogin'>) => {
    setUsers([...users, { ...user, id: Date.now().toString() }]);
  };
  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
  };
  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  // Role Actions
  const addRole = (role: Omit<Role, 'id'>) => {
    setRoles([...roles, { ...role, id: Date.now().toString() }]);
  };
  const updateRole = (id: string, updates: Partial<Role>) => {
    setRoles(roles.map(r => r.id === id ? { ...r, ...updates } : r));
  };
  const deleteRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  // Org Actions
  const addOrg = (org: Omit<Organization, 'id' | 'createdAt'>) => {
    setOrgs([...orgs, { ...org, id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0] }]);
  };
  const updateOrg = (id: string, updates: Partial<Organization>) => {
    setOrgs(orgs.map(o => o.id === id ? { ...o, ...updates } : o));
  };
  const deleteOrg = (id: string) => {
    setOrgs(orgs.filter(o => o.id !== id));
  };

  return (
    <SystemContext.Provider value={{
      users, roles, orgs,
      addUser, updateUser, deleteUser,
      addRole, updateRole, deleteRole,
      addOrg, updateOrg, deleteOrg
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
