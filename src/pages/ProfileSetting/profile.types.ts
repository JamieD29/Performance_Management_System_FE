// src/pages/ProfileSetting/profile.types.ts

// 1. Interface cho thông tin Role (Quyền của user)
export interface UserRole {
  id?: string;
  name?: string;
  slug?: string;
  [key: string]: any; // Phòng hờ API trả về thêm field khác
}

// 2. Interface chính cho toàn bộ Form Data
export interface UserProfileForm {
  name: string; // Họ và tên
  email: string; // Email liên hệ (thường là disabled)
  dob: string; // Ngày tháng năm sinh (YYYY-MM-DD)
  roles: any[]; // Danh sách quyền
  managementPosition?: {
    id: string;
    name: string;
    slug: string;
    permissionLevel?: string;
  } | null;
  jobTitle: string; // Chức vụ (Trưởng khoa, Giảng viên...)
  academicRank: string; // Học hàm (Giáo sư, PGS, Không)
  degree: string; // Học vị (Cử nhân, Thạc sĩ, Tiến sĩ...)
  teachingHours: number | string; // Giờ giảng/năm (số hoặc chuỗi rỗng khi đang gõ)
  awards: string; // Khen thưởng & Danh hiệu
  intellectualProperty: string; // Sở hữu trí tuệ / Công trình
  joinDate: string; // Ngày vào trường (YYYY-MM-DD)
  gender: string; // Giới tính (Nam, Nữ, Khác)
  departmentID: string; // ID của Đơn vị / Bộ môn
  staffCode: string; // Mã cán bộ
  avatarUrl: string; // Link ảnh đại diện
}

// 3. Interface cho State lưu lỗi (Form Errors)
// Chỉ chứa các trường có khả năng bị lỗi validate
export interface FormErrors {
  name?: string; // Lỗi khi bỏ trống tên
  staffCode?: string; // Lỗi khi bỏ trống mã cán bộ
  departmentID?: string; // Lỗi khi chưa chọn bộ môn
  dob?: string; // Lỗi ngày sinh
  joinDate?: string; // Lỗi ngày vào trường (tương lai, quá xa...)
  teachingHours?: string; // Lỗi nhập sai giờ giảng
}

// 4. (Tuỳ chọn) Interface cho Notification để dùng chung cho gọn
export interface NotificationState {
  type: "success" | "error" | "info" | "warning";
  message: string;
}
