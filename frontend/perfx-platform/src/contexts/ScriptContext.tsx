import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../services/apiService';

export interface Script {
  id: number;
  name: string;
  file_path: string;
  file_size?: number;
  script_version: string;
  script_type: string;
  description?: string;
  author_id?: number;
  project_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ScriptContextType {
  scripts: Script[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  fetchScripts: (page?: number, pageSize?: number, filters?: any) => Promise<void>;
  createScript: (data: any) => Promise<void>;
  updateScript: (id: number, data: any) => Promise<void>;
  deleteScript: (id: number) => Promise<void>;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export const ScriptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  // 获取脚本列表
  const fetchScripts = useCallback(async (page = 1, pageSize = 20, filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.scripts.getList(page, pageSize, filters);
      if (response.code === 200) {
        setScripts(response.data.items);
        setPagination({
          page: response.data.page,
          pageSize: response.data.size,
          total: response.data.total,
          totalPages: response.data.pages,
        });
      } else {
        setError(response.message || '获取脚本列表失败');
      }
    } catch (err) {
      console.error('获取脚本列表错误:', err);
      setError(err instanceof Error ? err.message : '获取脚本列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建脚本
  const createScript = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.scripts.upload(data);
      if (response.code === 200) {
        // 重新获取列表
        await fetchScripts(pagination.page, pagination.pageSize);
      } else {
        throw new Error(response.message || '创建脚本失败');
      }
    } catch (err) {
      console.error('创建脚本错误:', err);
      setError(err instanceof Error ? err.message : '创建脚本失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchScripts, pagination.page, pagination.pageSize]);

  // 更新脚本
  const updateScript = useCallback(async (id: number, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.scripts.update(id, data);
      if (response.code === 200) {
        // 重新获取列表
        await fetchScripts(pagination.page, pagination.pageSize);
      } else {
        throw new Error(response.message || '更新脚本失败');
      }
    } catch (err) {
      console.error('更新脚本错误:', err);
      setError(err instanceof Error ? err.message : '更新脚本失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchScripts, pagination.page, pagination.pageSize]);

  // 删除脚本
  const deleteScript = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.scripts.delete(id);
      if (response.code === 200) {
        // 重新获取列表
        await fetchScripts(pagination.page, pagination.pageSize);
      } else {
        throw new Error(response.message || '删除脚本失败');
      }
    } catch (err) {
      console.error('删除脚本错误:', err);
      setError(err instanceof Error ? err.message : '删除脚本失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchScripts, pagination.page, pagination.pageSize]);

  return (
    <ScriptContext.Provider
      value={{
        scripts,
        loading,
        error,
        pagination,
        fetchScripts,
        createScript,
        updateScript,
        deleteScript,
      }}
    >
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