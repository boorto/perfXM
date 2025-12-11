import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../services/apiService';

export interface TestPlan {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  creator_id: number;
  status: string;
  priority: string;
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

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

interface PlanContextType {
  plans: TestPlan[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  fetchPlans: (page?: number, pageSize?: number, filters?: any) => Promise<void>;
  createPlan: (data: any) => Promise<void>;
  updatePlan: (id: number, data: any) => Promise<void>;
  deletePlan: (id: number) => Promise<void>;
  executePlan: (id: number) => Promise<void>;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plans, setPlans] = useState<TestPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  // 获取测试计划列表
  const fetchPlans = useCallback(async (page: number = 1, pageSize: number = 20, filters: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.testPlans.getList(page, pageSize, filters);
      if (response.code === 200) {
        const data = response.data as any;
        setPlans(data.items || []);
        setPagination({
          page: data.page || page,
          pageSize: data.page_size || pageSize,
          total: data.total || 0,
        });
      } else {
        throw new Error(response.message || '获取测试计划列表失败');
      }
    } catch (err) {
      console.error('获取测试计划列表错误:', err);
      setError(err instanceof Error ? err.message : '获取测试计划列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建测试计划
  const createPlan = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.testPlans.create(data);
      if (response.code === 200) {
        // 重新获取列表
        await fetchPlans(pagination.page, pagination.pageSize);
      } else {
        throw new Error(response.message || '创建测试计划失败');
      }
    } catch (err) {
      console.error('创建测试计划错误:', err);
      setError(err instanceof Error ? err.message : '创建测试计划失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPlans, pagination]);

  // 更新测试计划
  const updatePlan = useCallback(async (id: number, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.testPlans.update(id, data);
      if (response.code === 200) {
        // 更新本地状态
        setPlans(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
      } else {
        throw new Error(response.message || '更新测试计划失败');
      }
    } catch (err) {
      console.error('更新测试计划错误:', err);
      setError(err instanceof Error ? err.message : '更新测试计划失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除测试计划
  const deletePlan = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.testPlans.delete(id);
      if (response.code === 200) {
        // 从本地状态移除
        setPlans(prev => prev.filter(p => p.id !== id));
      } else {
        throw new Error(response.message || '删除测试计划失败');
      }
    } catch (err) {
      console.error('删除测试计划错误:', err);
      setError(err instanceof Error ? err.message : '删除测试计划失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 执行测试计划
  const executePlan = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.testPlans.execute(id);
      if (response.code === 200) {
        // 更新计划状态为运行中
        setPlans(prev => prev.map(p => p.id === id ? { ...p, status: 'running' } : p));
      } else {
        throw new Error(response.message || '执行测试计划失败');
      }
    } catch (err) {
      console.error('执行测试计划错误:', err);
      setError(err instanceof Error ? err.message : '执行测试计划失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PlanContext.Provider value={{
      plans,
      loading,
      error,
      pagination,
      fetchPlans,
      createPlan,
      updatePlan,
      deletePlan,
      executePlan,
    }}>
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