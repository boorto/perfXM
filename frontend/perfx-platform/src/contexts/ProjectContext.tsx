
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type{ Project } from '../types';

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'E-Commerce Core',
      description: 'Main shopping cart and checkout flows',
      owner: 'John Doe',
      createdAt: '2023-01-15',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Warehouse Ops',
      description: 'Inventory management and logistics api',
      owner: 'Jane Smith',
      createdAt: '2023-03-22',
      status: 'Active'
    },
    {
      id: '3',
      name: 'User Identity Svc',
      description: 'Authentication and authorization microservice',
      owner: 'Admin',
      createdAt: '2023-06-10',
      status: 'Active'
    }
  ]);

  const addProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
