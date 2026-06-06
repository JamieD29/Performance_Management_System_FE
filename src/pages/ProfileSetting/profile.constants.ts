// ⚠️ FALLBACK VALUES — Only used when /users/profile-options API is unavailable.
// 📌 Official Source (Single Source of Truth): Backend → user.entity.ts

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

// --- SHARED THEME COLORS (UI) ---

export const THEME_COLORS = {
  IDENTITY: "#0ea5e9", // Light Blue - Used for Personal Information
  WORK: "#f59e0b", // Amber Orange - Used for Work & Education
  ACHIEVEMENT: "#8b5cf6", // Purple - Used for Achievements & Research
};
