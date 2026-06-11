export interface Student {
  id: number;
  studentId: string;
  name: string;
  college: string;
  className: string;
  topSize: string;
  pantsSize: string;
  shoeSize: string;
  beltSize: string;
  topReceived: boolean;
  pantsReceived: boolean;
  shoeReceived: boolean;
  beltReceived: boolean;
  receivedAt?: string;
}

export type ClothingType = 'top' | 'pants' | 'shoe' | 'belt';

export interface ExchangeRecord {
  id: number;
  studentId: string;
  type: ClothingType;
  oldSize: string;
  newSize: string;
  operator: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  username: string;
  role: 'staff' | 'admin';
  college?: string;
}

export interface PendingItem {
  type: ClothingType;
  size: string;
  count: number;
}

export interface StatsData {
  totalStudents: number;
  receivedStudents: number;
  notReceivedStudents: number;
  pendingItems: PendingItem[];
  byCollege: {
    college: string;
    total: number;
    received: number;
    notReceived: number;
  }[];
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AdminUser;
}

export const CLOTHING_TYPE_LABELS: Record<ClothingType, string> = {
  top: '上衣',
  pants: '裤子',
  shoe: '鞋',
  belt: '腰带',
};
