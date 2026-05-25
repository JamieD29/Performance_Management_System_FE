export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  jobTitle?: string;
  staffCode?: string;
  managementPosition?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  memberCount?: number;
}
