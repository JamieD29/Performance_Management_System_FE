// ⚠️ FALLBACK VALUES — Chỉ sử dụng khi API /users/profile-options không khả dụng.
// 📌 Nguồn chính thức (Single Source of Truth): Backend → user.entity.ts

export const FALLBACK_JOB_TITLES = [
  "Giảng viên",
  "Giảng viên chính",
  "Trợ giảng",
  "Giáo vụ",
  "Nghiên cứu viên",
  "Chuyên viên",
  "Kỹ thuật viên",
  "Nhân viên hỗ trợ",
];

export const FALLBACK_ACADEMIC_RANKS = ["Giáo sư", "Phó giáo sư", "Không"];

export const FALLBACK_DEGREES = ["Cử nhân", "Thạc sĩ", "Tiến sĩ", "Không"];

export const FALLBACK_GENDERS = ["Nam", "Nữ", "Khác"];

// --- MÀU SẮC THEME DÙNG CHUNG (UI) ---

export const THEME_COLORS = {
  IDENTITY: "#0ea5e9", // Xanh dương - Dùng cho Thông tin cá nhân
  WORK: "#f59e0b", // Vàng cam - Dùng cho Công việc & Học vấn
  ACHIEVEMENT: "#8b5cf6", // Tím - Dùng cho Thành tích & Nghiên cứu
};
