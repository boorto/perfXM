import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { projectsApi, type ApiResponse } from '../services/apiService';

// 项目接口定义
export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  manager_id: number;
  creator_name?: string;  // 创建者用户名
  manager_name?: string;
  member_count?: number;
  script_count?: number;
  created_at: string;
  updated_at: string;
}

// 分页数据接口
interface PaginatedData {
  items: Project[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Context 类型定义
interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  fetchProjects: (page?: number, filters?: any) => Promise<void>;
  createProject: (data: {
    name: string;
    description: string;
    status: string;
    manager_id: number;
  }) => Promise<void>;
  updateProject: (id: number, data: any) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  getProjectDetail: (id: number) => Promise<any>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  // 获取项目列表
  const fetchProjects = async (page: number = 1, filters?: any) => {
    setLoading(true);
    setError(null);

    try {
      const response: ApiResponse<PaginatedData> = await projectsApi.getList(
        page,
        pagination.pageSize,
        filters
      );

      if (response.code === 200) {
        setProjects(response.data.items);
        setPagination({
          page: response.data.page,
          pageSize: response.data.size,
          total: response.data.total,
          totalPages: response.data.pages,
        });
      } else {
        setError(response.message || '获取项目列表失败');
      }
    } catch (err) {
      console.error('获取项目列表错误:', err);
      setError(err instanceof Error ? err.message : '获取项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建项目
  const createProject = async (data: {
    name: string;
    description: string;
    status: string;
    manager_id: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await projectsApi.create(data);

      if (response.code === 200) {
        // 重新获取项目列表
        await fetchProjects(pagination.page);
      } else {
        throw new Error(response.message || '创建项目失败');
      }
    } catch (err) {
      console.error('创建项目错误:', err);
      setError(err instanceof Error ? err.message : '创建项目失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 更新项目
  const updateProject = async (id: number, data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await projectsApi.update(id, data);

      if (response.code === 200) {
        // 重新获取项目列表
        await fetchProjects(pagination.page);
      } else {
        throw new Error(response.message || '更新项目失败');
      }
    } catch (err) {
      console.error('更新项目错误:', err);
      setError(err instanceof Error ? err.message : '更新项目失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 删除项目
  const deleteProject = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await projectsApi.delete(id);

      if (response.code === 200) {
        // 重新获取项目列表
        await fetchProjects(pagination.page);
      } else {
        throw new Error(response.message || '删除项目失败');
      }
    } catch (err) {
      console.error('删除项目错误:', err);
      setError(err instanceof Error ? err.message : '删除项目失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 获取项目详情
  const getProjectDetail = async (id: number) => {
    try {
      const response = await projectsApi.getDetail(id);

      if (response.code === 200) {
        return response.data;
      } else {
        throw new Error(response.message || '获取项目详情失败');
      }
    } catch (err) {
      console.error('获取项目详情错误:', err);
      throw err;
    }
  };

  // 组件挂载时获取项目列表
  // 初始化 - 移除自动加载，由 ProjectManager 组件按需加载
  useEffect(() => {
    // 不再自动加载项目列表
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        error,
        pagination,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        getProjectDetail,
      }}
    >
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