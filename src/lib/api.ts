import { z } from 'zod';

const API_BASE_URL = 'https://ll3lb573-3000.inc1.devtunnels.ms';

// Validation schemas
export const passwordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const emailSchema = z.string().email('Invalid email address');

// Types
export interface User {
  _id?: string;
  email: string;
  name: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
  owner: {
    _id: string;
    name: string;
  };
  completedAt: Date | null;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate: Date | null;
  assignedTo: string | null;
  project?: string;
}

// API Response types
interface ApiResponse<T = any> {
  success: boolean;
  msg?: string;
  error?: string;
  data?: T;
}

// Token management
const TOKEN_KEY = 'authToken';

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// API helper
const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok && data.error === 'Unauthorized') {
      removeToken();
      window.location.href = '/login';
    }

    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const result = await apiRequest<{ token?: string }>('/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (result.success && result.data?.token) {
      setToken(result.data.token);
    }
    
    return result;
  },

  signup: async (email: string, password: string) => {
    return apiRequest('/user/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile: async () => {
    return apiRequest<User>('/user/profile', {
      method: 'GET',
    });
  },

  updateProfile: async (name: string, password?: string) => {
    const body: any = { name };
    if (password) body.password = password;
    
    return apiRequest('/user/update', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  logout: () => {
    removeToken();
    window.location.href = '/login';
  },
};

// User API
export const userApi = {
  list: async (key?: string) => {
    const params = key ? `?key=${encodeURIComponent(key)}` : '';
    return apiRequest<User[]>(`/user/list${params}`, {
      method: 'GET',
    });
  },
};

// Project API
export const projectApi = {
  list: async (key?: string, status?: string) => {
    const params = new URLSearchParams();
    if (key) params.append('key', key);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    
    return apiRequest<Project[]>(`/project${query}`, {
      method: 'GET',
    });
  },

  get: async (id: string) => {
    return apiRequest<Project>(`/project/${id}`, {
      method: 'GET',
    });
  },

  create: async (title: string, description: string) => {
    return apiRequest('/project', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  },

  update: async (id: string, data: Partial<Project>) => {
    return apiRequest(`/project/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/project/delete/${id}`, {
      method: 'DELETE',
    });
  },
};

// Task API
export const taskApi = {
  listByProject: async (projectId: string, key?: string, status?: string) => {
    const params = new URLSearchParams();
    if (key) params.append('key', key);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    
    return apiRequest<Task[]>(`/task/${projectId}${query}`, {
      method: 'GET',
    });
  },

  get: async (id: string) => {
    return apiRequest<Task>(`/task?id=${id}`, {
      method: 'GET',
    });
  },

  create: async (title: string, description: string, project: string) => {
    return apiRequest('/task', {
      method: 'POST',
      body: JSON.stringify({ title, description, project }),
    });
  },

  update: async (id: string, data: Partial<Task>) => {
    return apiRequest(`/task/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/task/delete/${id}`, {
      method: 'DELETE',
    });
  },
};