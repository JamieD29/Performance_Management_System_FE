// src/utils/swal.ts
// 📌 SweetAlert2 Wrapper — Thay thế window.confirm/alert
// Cung cấp giao diện đẹp, nhất quán cho toàn bộ hệ thống.

import Swal from "sweetalert2";

// ============================================================
// 📐 Z-INDEX FIX — Đảm bảo SweetAlert luôn hiển thị trên MUI Dialog
// MUI Dialog mặc định z-index: 1300, SweetAlert2 mặc định ~1060
// ============================================================
const SWAL_Z_INDEX = 99999;

// Inject global CSS to override SweetAlert2 z-index
const style = document.createElement("style");
style.textContent = `
  .swal2-container { z-index: ${SWAL_Z_INDEX} !important; }
`;
if (!document.querySelector("[data-swal-zindex-fix]")) {
  style.setAttribute("data-swal-zindex-fix", "true");
  document.head.appendChild(style);
}

// ============================================================
// 🎨 THEME CONFIG — Tùy chỉnh màu sắc cho đồng bộ với MUI
// ============================================================
const COLORS = {
  primary: "#1976d2",
  success: "#16a34a",
  error: "#dc2626",
  warning: "#f59e0b",
  info: "#0ea5e9",
  dark: "#1e293b",
  light: "#f8fafc",
};

// ============================================================
// 🔥 CONFIRM — Thay thế window.confirm()
// ============================================================
export async function confirmAction(options: {
  title: string;
  text?: string;
  icon?: "warning" | "question" | "info";
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
}): Promise<boolean> {
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: options.icon || "question",
    showCancelButton: true,
    confirmButtonText: options.confirmText || "Xác nhận",
    cancelButtonText: options.cancelText || "Hủy",
    confirmButtonColor: options.confirmColor || COLORS.primary,
    cancelButtonColor: "#94a3b8",
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: "swal-popup-custom",
      title: "swal-title-custom",
    },
  });
  return result.isConfirmed;
}

// ============================================================
// ✅ SUCCESS — Thay thế alert() cho thông báo thành công
// ============================================================
export function showSuccess(title: string, text?: string) {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: COLORS.success,
    confirmButtonText: "OK",
    timer: 3000,
    timerProgressBar: true,
  });
}

// ============================================================
// ❌ ERROR — Thay thế alert() cho thông báo lỗi
// ============================================================
export function showError(title: string, text?: string) {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: COLORS.error,
    confirmButtonText: "Đóng",
  });
}

// ============================================================
// ⚠️ WARNING — Thay thế alert() cho cảnh báo
// ============================================================
export function showWarning(title: string, text?: string) {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonColor: COLORS.warning,
    confirmButtonText: "Đã hiểu",
  });
}

// ============================================================
// ℹ️ INFO — Thay thế alert() cho thông tin
// ============================================================
export function showInfo(title: string, text?: string) {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonColor: COLORS.info,
    confirmButtonText: "OK",
  });
}

// ============================================================
// 🗑️ DELETE CONFIRM — Dành cho các hành động xóa nguy hiểm
// ============================================================
export async function confirmDelete(itemName?: string): Promise<boolean> {
  const result = await Swal.fire({
    title: "Xác nhận xóa?",
    text: itemName
      ? `Bạn có chắc muốn xóa "${itemName}"? Hành động này không thể hoàn tác.`
      : "Hành động này không thể hoàn tác.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
    confirmButtonColor: COLORS.error,
    cancelButtonColor: "#94a3b8",
    reverseButtons: true,
    focusCancel: true,
  });
  return result.isConfirmed;
}

// ============================================================
// 🔄 LOADING — Hiển thị trạng thái loading
// ============================================================
export function showLoading(title: string = "Đang xử lý...") {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

export function closeLoading() {
  Swal.close();
}
