import { Student, ExchangeRecord, AdminUser, StatsData, ApiResponse, LoginResponse, ClothingType } from '../../shared/types';

const API_BASE = '/api';

function getAuthToken(): string | null {
  try {
    const staff = localStorage.getItem('staff-auth-storage');
    if (staff) {
      const parsed = JSON.parse(staff);
      if (parsed.state && parsed.state.token) {
        return parsed.state.token;
      }
    }
    const admin = localStorage.getItem('admin-auth-storage');
    if (admin) {
      const parsed = JSON.parse(admin);
      if (parsed.state && parsed.state.token) {
        return parsed.state.token;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    localStorage.removeItem('staff-auth-storage');
    localStorage.removeItem('admin-auth-storage');
    const data = await response.json() as ApiResponse<T>;
    throw new Error(data.message || '登录已过期，请重新登录');
  }

  if (response.status === 403) {
    const data = await response.json() as ApiResponse<T>;
    throw new Error(data.message || '权限不足');
  }
  
  const data = await response.json() as ApiResponse<T>;
  
  if (!data.success) {
    throw new Error(data.message || '请求失败');
  }
  
  return data.data as T;
}

export const api = {
  getStudent: (studentId: string): Promise<Student> => 
    request<Student>(`/student/${studentId}`),

  staffLogin: (username: string, password: string): Promise<LoginResponse> =>
    request<LoginResponse>('/staff/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  adminLogin: (username: string, password: string): Promise<LoginResponse> =>
    request<LoginResponse>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  confirmDistribute: (studentId: string, items: ClothingType[]): Promise<Student> =>
    request<Student>('/distribute/confirm', {
      method: 'POST',
      body: JSON.stringify({ studentId, items }),
    }),

  recordExchange: (data: {
    studentId: string;
    type: ClothingType;
    oldSize: string;
    newSize: string;
    operator: string;
  }): Promise<ExchangeRecord> =>
    request<ExchangeRecord>('/exchange', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getExchangeRecords: (studentId?: string): Promise<ExchangeRecord[]> => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return request<ExchangeRecord[]>(`/exchange/records${query}`);
  },

  getStats: (college?: string): Promise<StatsData> => {
    const query = college ? `?college=${encodeURIComponent(college)}` : '';
    return request<StatsData>(`/admin/stats${query}`);
  },

  getNotReceivedStudents: (college?: string): Promise<Student[]> => {
    const query = college ? `?college=${encodeURIComponent(college)}` : '';
    return request<Student[]>(`/admin/not-received${query}`);
  },
};
