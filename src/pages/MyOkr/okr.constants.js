"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusConfig = void 0;
exports.statusConfig = {
    PENDING: { label: "Chờ phản hồi", color: "warning" },
    NEGOTIATING: { label: "Đang đàm phán", color: "info" },
    ACCEPTED: { label: "Đã chấp nhận — Sẵn sàng tự khai", color: "success" },
    SUBMITTED: { label: "Đã nộp bài — Chờ duyệt", color: "info" },
    COMPLETED: { label: "Hoàn tất", color: "default" },
    REJECTED: { label: "Bị từ chối", color: "error" },
};
