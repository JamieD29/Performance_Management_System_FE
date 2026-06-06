// src/pages/ProfileSetting/profile.types.ts

// 1. Interface for User Role information
export interface UserRole {
  id?: string;
  name?: string;
  slug?: string;
  [key: string]: any; // Fallback/custom fields from API
}

// 2. Main Interface for all Form Data
export interface UserProfileForm {
  name: string; // Full Name
  email: string; // Contact Email (typically disabled)
  dob: string; // Date of birth (YYYY-MM-DD)
  roles: any[]; // Roles list
  managementPosition?: {
    id: string;
    name: string;
    slug: string;
    permissionLevel?: string;
  } | null;
  jobTitle: string; // Job Title (Lecturer, Senior Lecturer, etc.)
  academicRank: string; // Academic Rank (Professor, Associate Professor, None)
  degree: string; // Academic Degree (Bachelor, Master, PhD, etc.)
  teachingHours: number | string; // Teaching hours per year (number or empty string during typing)
  awards: string; // Awards & Titles
  intellectualProperty: string; // Intellectual Property / Research Works
  joinDate: string; // Join date (YYYY-MM-DD)
  gender: string; // Gender (Male, Female, Other)
  departmentID: string; // Department / Division ID
  staffCode: string; // Staff code
  avatarUrl: string; // Avatar image link
}

// 3. Interface for error state (Form Errors)
// Only contains fields that can fail validation
export interface FormErrors {
  name?: string; // Error when name is empty
  staffCode?: string; // Error when staff code is empty
  departmentID?: string; // Error when department is unselected
  dob?: string; // Date of birth validation error
  joinDate?: string; // Join date validation error (future, too far, etc.)
  teachingHours?: string; // Teaching hours validation error
}

// 4. (Optional) Interface for Notification state
export interface NotificationState {
  type: "success" | "error" | "info" | "warning";
  message: string;
}
