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
  content: string;
  size: string;
  updatedAt: string;
  description?: string;
}

export interface Scenario {
  id: string;
  name: string;
  scripts: string[];
  targetRPS: number;
  duration: string;
}

export interface Agent {
  id: string;
  name: string;
  role: 'MASTER' | 'SLAVE';
  ip: string;
  port: number;
  status: 'Idle' | 'Busy' | 'Offline';
  region: string;
  cpuUsage: number;
  memoryUsage: number;
  maxThreads?: number;
  tags?: string[];
}

export interface TestPlan {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  creator_id: number;
  status: string; // draft, ready, running, completed, failed
  priority: string; // low, medium, high
  scheduled_start?: string;
  scheduled_end?: string;
  actual_start?: string;
  actual_end?: string;
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  permissions: ModuleType[];
  isSystem?: boolean;
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