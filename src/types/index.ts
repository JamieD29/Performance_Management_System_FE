export type DepartmentLevel = 1 | 2 | 3;

export interface Department {
  id: string;
  name: string;
  level: DepartmentLevel;
  description?: string;
  parentId: string | null;
}
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  roles: string[]; // ['ADMIN', 'USER']
  department?: {
    id: string;
    name: string;
  };

  // 🔥 THÊM CÁC TRƯỜNG MỚI VÀO ĐÂY
  staffCode?: string;
  jobTitle?: string; // Trưởng khoa, Giảng viên...
  academicRank?: string; // GS, PGS...
  degree?: string; // TS, ThS...
  teachingHours?: number;
  awards?: string;
  intellectualProperty?: string;
  joinDate?: string;

  // Chức vụ quản lý (Admin định nghĩa)
  managementPosition?: ManagementPosition | null;
}

export interface ManagementPosition {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface AppNotification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface OKR {
  id: string;
  title: string;
  description?: string;
  progress: number;
  status: "on-track" | "at-risk" | "behind";
  dueDate: string | null;
}

export interface KPI {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
}

export interface Domain {
  id: string;
  domain: string;
  addedAt: string;
}

