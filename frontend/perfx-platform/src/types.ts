export enum ModuleType {
  DASHBOARD = 'DASHBOARD',
  PROJECTS = 'PROJECTS',
  SCENARIOS = 'SCENARIOS',
  SCRIPTS = 'SCRIPTS',
  PLANS = 'PLANS',
  EXECUTION = 'EXECUTION',
  AGENTS = 'AGENTS',
  DATASOURCE = 'DATASOURCE',
  CONFIG = 'CONFIG'
}

export type Language = 'en' | 'zh';

export interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: string;
  status: 'Active' | 'Archived';
}

export interface Script {
  id: string;
  name: string;
  project: string;
  version: string;
  content: string; // JMX XML content
  size: string;
  updatedAt: string;
  description?: string;
}

export interface Scenario {
  id: string;
  name: string;
  scripts: string[]; // Script IDs
  targetRPS: number;
  duration: string;
}

export interface Agent {
  id: string;
  name: string;
  role: 'MASTER' | 'SLAVE'; // JMeter Role
  ip: string;
  port: number; // JMeter/RMI Port
  status: 'Idle' | 'Busy' | 'Offline';
  region: string;
  cpuUsage: number;
  memoryUsage: number;
  maxThreads?: number; // Max concurrent threads/users
  tags?: string[];
}

export interface TestPlan {
  id: string;
  name: string;
  description: string;
  projectId: string; // Linked Project
  scriptIds: string[]; // Selected Scripts
  agentIds: string[]; // Selected Agents
  status: 'Draft' | 'Running' | 'Completed' | 'Failed';
  config: {
    threads: number;
    rampUp: number; // seconds
    duration: number; // seconds
    loops: number;
  };
  lastRun?: string;
}

export interface ExecutionLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export interface MetricPoint {
  time: string;
  rps: number;
  latency: number;
  failures: number;
}

// System Config Types
export interface Organization {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: ModuleType[]; // List of modules this role can access
  isSystem?: boolean; // System roles cannot be deleted
}

export interface User {
  id: string;
  username: string;
  email: string;
  roleId: string;
  orgId: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
}