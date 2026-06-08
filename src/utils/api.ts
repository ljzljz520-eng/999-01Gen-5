import { Student, ExchangeRecord, AdminUser, StatsData, ApiResponse, LoginResponse, ClothingType } from '../../shared/types';

const API_BASE = '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
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
