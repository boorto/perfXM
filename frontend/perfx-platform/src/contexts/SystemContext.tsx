import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { organizationsApi, usersApi, rolesApi, type ApiResponse } from '../services/apiService';

// 组织接口定义
export interface Organization {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  manager_id?: number;
  level?: number;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

// 用户接口定义
export interface User {
  id: number;
  username: string;
  email: string;
  real_name?: string;
  phone?: string;
  avatar?: string;
  is_superuser: boolean;
  is_active: boolean;
  org_id?: number;
  org_name?: string;
  role_id?: number;
  role_name?: string;
  created_at: string;
  updated_at: string;
}

// 角色接口定义
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
  is_system: boolean;
  org_id?: number;
  org_name?: string;
  created_at: string;
  updated_at: string;
}

// 分页数据接口
interface PaginatedData {
  items: any[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 分页状态接口
interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface SystemContextType {
  // 组织管理
  organizations: Organization[];
  orgsLoading: boolean;
  orgsError: string | null;
  orgsPagination: Pagination;
  fetchOrganizations: (page?: number, pageSize?: number, filters?: any) => Promise<void>;
  createOrganization: (data: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateOrganization: (id: number, data: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: number) => Promise<void>;

  // 用户管理
  users: User[];
  usersLoading: boolean;
  usersError: string | null;
  usersPagination: Pagination;
  fetchUsers: (page?: number, pageSize?: number, filters?: any) => Promise<void>;
  createUser: (data: any) => Promise<void>;
  updateUser: (id: number, data: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;

  // 角色管理
  roles: Role[];
  rolesLoading: boolean;
  rolesError: string | null;
  rolesPagination: Pagination;
  fetchRoles: (page?: number, pageSize?: number, filters?: any) => Promise<void>;
  createRole: (data: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRole: (id: number, data: Partial<Role>) => Promise<void>;
  deleteRole: (id: number) => Promise<void>;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 组织管理状态
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [orgsError, setOrgsError] = useState<string | null>(null);
  const [orgsPagination, setOrgsPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  // 用户管理状态
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersPagination, setUsersPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  // 角色管理状态
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [rolesPagination, setRolesPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  // 获取组织列表
  const fetchOrganizations = useCallback(async (page = 1, pageSize = 20, filters?: any) => {
    setOrgsLoading(true);
    setOrgsError(null);
    try {
      const response = await organizationsApi.getList(page, pageSize, filters);
      if (response.code === 200) {
        const data = response.data as PaginatedData;
        setOrganizations(data.items);
        setOrgsPagination({
          page: data.page,
          pageSize: data.page_size,
          total: data.total,
          totalPages: data.total_pages,
        });
      }
    } catch (err) {
      setOrgsError(err instanceof Error ? err.message : '获取组织列表失败');
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  // 创建组织
  const createOrganization = useCallback(async (data: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await organizationsApi.create(data);
    if (response.code === 200) {
      await fetchOrganizations(orgsPagination.page, orgsPagination.pageSize);
    } else {
      throw new Error(response.message || '创建组织失败');
    }
  }, [fetchOrganizations, orgsPagination.page, orgsPagination.pageSize]);

  // 更新组织
  const updateOrganization = useCallback(async (id: number, data: Partial<Organization>) => {
    const response = await organizationsApi.update(id, data);
    if (response.code === 200) {
      await fetchOrganizations(orgsPagination.page, orgsPagination.pageSize);
    } else {
      throw new Error(response.message || '更新组织失败');
    }
  }, [fetchOrganizations, orgsPagination.page, orgsPagination.pageSize]);

  // 删除组织
  const deleteOrganization = useCallback(async (id: number) => {
    const response = await organizationsApi.delete(id);
    if (response.code === 200) {
      await fetchOrganizations(orgsPagination.page, orgsPagination.pageSize);
    } else {
      throw new Error(response.message || '删除组织失败');
    }
  }, [fetchOrganizations, orgsPagination.page, orgsPagination.pageSize]);

  // 获取用户列表
  const fetchUsers = useCallback(async (page = 1, pageSize = 20, filters?: any) => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await usersApi.getList(page, pageSize, filters);
      if (response.code === 200) {
        const data = response.data as PaginatedData;
        setUsers(data.items);
        setUsersPagination({
          page: data.page,
          pageSize: data.page_size,
          total: data.total,
          totalPages: data.total_pages,
        });
      }
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : '获取用户列表失败');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // 创建用户
  const createUser = useCallback(async (data: any) => {
    const response = await usersApi.create(data);
    if (response.code === 200) {
      await fetchUsers(usersPagination.page, usersPagination.pageSize);
    } else {
      throw new Error(response.message || '创建用户失败');
    }
  }, [fetchUsers, usersPagination.page, usersPagination.pageSize]);

  // 更新用户
  const updateUser = useCallback(async (id: number, data: Partial<User>) => {
    const response = await usersApi.update(id, data);
    if (response.code === 200) {
      await fetchUsers(usersPagination.page, usersPagination.pageSize);
    } else {
      throw new Error(response.message || '更新用户失败');
    }
  }, [fetchUsers, usersPagination.page, usersPagination.pageSize]);

  // 删除用户
  const deleteUser = useCallback(async (id: number) => {
    const response = await usersApi.delete(id);
    if (response.code === 200) {
      await fetchUsers(usersPagination.page, usersPagination.pageSize);
    } else {
      throw new Error(response.message || '删除用户失败');
    }
  }, [fetchUsers, usersPagination.page, usersPagination.pageSize]);

  // 获取角色列表
  const fetchRoles = useCallback(async (page = 1, pageSize = 20, filters?: any) => {
    setRolesLoading(true);
    setRolesError(null);
    try {
      const response = await rolesApi.getList(page, pageSize, filters);
      if (response.code === 200) {
        const data = response.data as PaginatedData;
        setRoles(data.items);
        setRolesPagination({
          page: data.page,
          pageSize: data.page_size,
          total: data.total,
          totalPages: data.total_pages,
        });
      }
    } catch (err) {
      setRolesError(err instanceof Error ? err.message : '获取角色列表失败');
    } finally {
      setRolesLoading(false);
    }
  }, []);

  // 创建角色
  const createRole = useCallback(async (data: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await rolesApi.create(data);
    if (response.code === 200) {
      await fetchRoles(rolesPagination.page, rolesPagination.pageSize);
    } else {
      throw new Error(response.message || '创建角色失败');
    }
  }, [fetchRoles, rolesPagination.page, rolesPagination.pageSize]);

  // 更新角色
  const updateRole = useCallback(async (id: number, data: Partial<Role>) => {
    const response = await rolesApi.update(id, data);
    if (response.code === 200) {
      await fetchRoles(rolesPagination.page, rolesPagination.pageSize);
    } else {
      throw new Error(response.message || '更新角色失败');
    }
  }, [fetchRoles, rolesPagination.page, rolesPagination.pageSize]);

  // 删除角色
  const deleteRole = useCallback(async (id: number) => {
    const response = await rolesApi.delete(id);
    if (response.code === 200) {
      await fetchRoles(rolesPagination.page, rolesPagination.pageSize);
    } else {
      throw new Error(response.message || '删除角色失败');
    }
  }, [fetchRoles, rolesPagination.page, rolesPagination.pageSize]);

  // 初始化 - 移除自动加载，由各组件按需加载
  useEffect(() => {
    // 不再自动加载数据，由各组件在需要时调用
  }, []);

  return (
    <SystemContext.Provider value={{
      organizations,
      orgsLoading,
      orgsError,
      orgsPagination,
      fetchOrganizations,
      createOrganization,
      updateOrganization,
      deleteOrganization,

      users,
      usersLoading,
      usersError,
      usersPagination,
      fetchUsers,
      createUser,
      updateUser,
      deleteUser,

      roles,
      rolesLoading,
      rolesError,
      rolesPagination,
      fetchRoles,
      createRole,
      updateRole,
      deleteRole,
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