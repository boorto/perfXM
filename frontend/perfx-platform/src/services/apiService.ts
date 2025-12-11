/**
 * API Service for PerfX Platform
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = 'http://localhost:8006/api';

// API Response types
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: {
        id: number;
        username: string;
        email: string;
        real_name: string;
        phone?: string;
        avatar?: string;
        is_superuser: boolean;
        is_active: boolean;
    };
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    real_name: string;
    phone?: string;
    avatar?: string;
    is_superuser: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Generic API request handler
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('perfx_token');
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            // Handle 401 Unauthorized - token expired or invalid
            if (response.status === 401) {
                // Clear token and redirect to login
                localStorage.removeItem('perfx_token');
                localStorage.removeItem('perfx_user');
                window.location.href = '/login';
                throw new Error('认证已过期，请重新登录');
            }

            // Handle other HTTP errors
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
        }

        const data: ApiResponse<T> = await response.json();
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

/**
 * Authentication API
 */
export const authApi = {
    /**
     * User login
     */
    login: async (username: string, password: string): Promise<LoginResponse> => {
        const response = await apiRequest<LoginResponse>('/users/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        if (response.code === 200) {
            return response.data;
        }

        throw new Error(response.message || 'Login failed');
    },

    /**
     * Get current user info
     */
    getCurrentUser: async (): Promise<UserProfile> => {
        const response = await apiRequest<UserProfile>('/users/me', {
            method: 'GET',
        });

        if (response.code === 200) {
            return response.data;
        }

        throw new Error(response.message || 'Failed to get user info');
    },

    /**
     * Change password
     */
    changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
        const response = await apiRequest('/users/change-password', {
            method: 'POST',
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
        });

        if (response.code !== 200) {
            throw new Error(response.message || 'Failed to change password');
        }
    },
};

/**
 * Users API
 */
export const usersApi = {
    /**
     * 获取用户列表
     */
    getList: async (page: number = 1, pageSize: number = 100, filters?: any) => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
            ...filters,
        });

        return apiRequest(`/users?${params}`, { method: 'GET' });
    },

    /**
     * 获取用户详情
     */
    getDetail: async (id: number) => {
        return apiRequest(`/users/${id}`, { method: 'GET' });
    },

    /**
     * 创建用户
     */
    create: async (data: any) => {
        return apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * 更新用户
     */
    update: async (id: number, data: any) => {
        return apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * 删除用户
     */
    delete: async (id: number) => {
        return apiRequest(`/users/${id}`, { method: 'DELETE' });
    },

    /**
     * 重置密码
     */
    resetPassword: async (id: number, newPassword: string) => {
        return apiRequest(`/users/${id}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ new_password: newPassword }),
        });
    },
};

/**
 * Projects API
 */
export const projectsApi = {
    /**
     * Get projects list
     */
    getList: async (page: number = 1, pageSize: number = 20, filters?: any) => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
            ...filters,
        });

        return apiRequest(`/projects?${params}`, { method: 'GET' });
    },

    /**
     * Get project detail
     */
    getDetail: async (id: number) => {
        return apiRequest(`/projects/${id}`, { method: 'GET' });
    },

    /**
     * Create project
     */
    create: async (data: any) => {
        return apiRequest('/projects', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update project
     */
    update: async (id: number, data: any) => {
        return apiRequest(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete project
     */
    delete: async (id: number) => {
        return apiRequest(`/projects/${id}`, { method: 'DELETE' });
    },
};

/**
 * Scripts API
 */
export const scriptsApi = {
    /**
     * Get scripts list
     */
    getList: async (page: number = 1, pageSize: number = 20, filters?: any) => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
            ...filters,
        });

        return apiRequest(`/scripts?${params.toString()}`, { method: 'GET' });
    },

    /**
     * Get script detail
     */
    getDetail: async (id: number) => {
        return apiRequest(`/scripts/${id}`, { method: 'GET' });
    },

    /**
     * Upload script
     */
    upload: async (formData: FormData) => {
        const token = localStorage.getItem('perfx_token');
        const response = await fetch(`${API_BASE_URL}/scripts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload script');
        }

        return response.json();
    },

    /**
     * Update script
     */
    update: async (id: number, data: any) => {
        return apiRequest(`/scripts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete script
     */
    delete: async (id: number) => {
        return apiRequest(`/scripts/${id}`, { method: 'DELETE' });
    },
};

/**
 * Test Plans API
 */
export const testPlansApi = {
    /**
     * Get test plans list
     */
    getList: async (page: number = 1, pageSize: number = 20, filters?: any) => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
            ...filters,
        });

        return apiRequest(`/test-plans?${params.toString()}`, { method: 'GET' });
    },

    /**
     * Get test plan detail
     */
    getDetail: async (id: number) => {
        return apiRequest(`/test-plans/${id}`, { method: 'GET' });
    },

    /**
     * Create test plan
     */
    create: async (data: any) => {
        return apiRequest('/test-plans', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update test plan
     */
    update: async (id: number, data: any) => {
        return apiRequest(`/test-plans/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete test plan
     */
    delete: async (id: number) => {
        return apiRequest(`/test-plans/${id}`, { method: 'DELETE' });
    },

    /**
     * Execute test plan
     */
    execute: async (id: number) => {
        return apiRequest(`/test-plans/${id}/execute`, {
            method: 'POST',
        });
    },
};

/**
 * Organizations API
 */
export const organizationsApi = {
    /**
     * Get organizations list
     */
    getList: async (page: number = 1, pageSize: number = 20, filters?: any) => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
            ...filters,
        });

        return apiRequest(`/organizations?${params}`, { method: 'GET' });
    },

    /**
     * Get organization tree
     */
    getTree: async () => {
        return apiRequest('/organizations/tree', { method: 'GET' });
    },

    /**
     * Create organization
     */
    create: async (data: any) => {
        return apiRequest('/organizations', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update organization
     */
    update: async (id: number, data: any) => {
        return apiRequest(`/organizations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete organization
     */
    delete: async (id: number) => {
        return apiRequest(`/organizations/${id}`, { method: 'DELETE' });
    },
};

/**
 * Roles API
 */
export const rolesApi = {
    /**
     * Get roles list
     */
    getList: async (page: number = 1, pageSize: number = 20, filters?: any) => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
            ...filters,
        });

        return apiRequest(`/users/system/roles?${params}`, { method: 'GET' });
    },

    /**
     * Get role detail
     */
    getDetail: async (id: number) => {
        return apiRequest(`/users/system/roles/${id}`, { method: 'GET' });
    },

    /**
     * Create role
     */
    create: async (data: any) => {
        return apiRequest('/users/system/roles', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update role
     */
    update: async (id: number, data: any) => {
        return apiRequest(`/users/system/roles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete role
     */
    delete: async (id: number) => {
        return apiRequest(`/users/system/roles/${id}`, { method: 'DELETE' });
    },
};

export default {
    auth: authApi,
    users: usersApi,
    projects: projectsApi,
    scripts: scriptsApi,
    testPlans: testPlansApi,
    organizations: organizationsApi,
    roles: rolesApi,
};
