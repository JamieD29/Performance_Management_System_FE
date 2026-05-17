"use strict";
// src/utils/swal.ts
// 📌 SweetAlert2 Wrapper — Thay thế window.confirm/alert
// Cung cấp giao diện đẹp, nhất quán cho toàn bộ hệ thống.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmAction = confirmAction;
exports.showSuccess = showSuccess;
exports.showError = showError;
exports.showWarning = showWarning;
exports.showInfo = showInfo;
exports.confirmDelete = confirmDelete;
exports.showLoading = showLoading;
exports.closeLoading = closeLoading;
var sweetalert2_1 = require("sweetalert2");
// ============================================================
// 📐 Z-INDEX FIX — Đảm bảo SweetAlert luôn hiển thị trên MUI Dialog
// MUI Dialog mặc định z-index: 1300, SweetAlert2 mặc định ~1060
// ============================================================
var SWAL_Z_INDEX = 99999;
// Inject global CSS to override SweetAlert2 z-index
var style = document.createElement("style");
style.textContent = "\n  .swal2-container { z-index: ".concat(SWAL_Z_INDEX, " !important; }\n");
if (!document.querySelector("[data-swal-zindex-fix]")) {
    style.setAttribute("data-swal-zindex-fix", "true");
    document.head.appendChild(style);
}
// ============================================================
// 🎨 THEME CONFIG — Tùy chỉnh màu sắc cho đồng bộ với MUI
// ============================================================
var COLORS = {
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
function confirmAction(options) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sweetalert2_1.default.fire({
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
                    })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.isConfirmed];
            }
        });
    });
}
// ============================================================
// ✅ SUCCESS — Thay thế alert() cho thông báo thành công
// ============================================================
function showSuccess(title, text) {
    return sweetalert2_1.default.fire({
        icon: "success",
        title: title,
        text: text,
        confirmButtonColor: COLORS.success,
        confirmButtonText: "OK",
        timer: 3000,
        timerProgressBar: true,
    });
}
// ============================================================
// ❌ ERROR — Thay thế alert() cho thông báo lỗi
// ============================================================
function showError(title, text) {
    return sweetalert2_1.default.fire({
        icon: "error",
        title: title,
        text: text,
        confirmButtonColor: COLORS.error,
        confirmButtonText: "Đóng",
    });
}
// ============================================================
// ⚠️ WARNING — Thay thế alert() cho cảnh báo
// ============================================================
function showWarning(title, text) {
    return sweetalert2_1.default.fire({
        icon: "warning",
        title: title,
        text: text,
        confirmButtonColor: COLORS.warning,
        confirmButtonText: "Đã hiểu",
    });
}
// ============================================================
// ℹ️ INFO — Thay thế alert() cho thông tin
// ============================================================
function showInfo(title, text) {
    return sweetalert2_1.default.fire({
        icon: "info",
        title: title,
        text: text,
        confirmButtonColor: COLORS.info,
        confirmButtonText: "OK",
    });
}
// ============================================================
// 🗑️ DELETE CONFIRM — Dành cho các hành động xóa nguy hiểm
// ============================================================
function confirmDelete(itemName) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sweetalert2_1.default.fire({
                        title: "Xác nhận xóa?",
                        text: itemName
                            ? "B\u1EA1n c\u00F3 ch\u1EAFc mu\u1ED1n x\u00F3a \"".concat(itemName, "\"? H\u00E0nh \u0111\u1ED9ng n\u00E0y kh\u00F4ng th\u1EC3 ho\u00E0n t\u00E1c.")
                            : "Hành động này không thể hoàn tác.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Xóa",
                        cancelButtonText: "Hủy",
                        confirmButtonColor: COLORS.error,
                        cancelButtonColor: "#94a3b8",
                        reverseButtons: true,
                        focusCancel: true,
                    })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.isConfirmed];
            }
        });
    });
}
// ============================================================
// 🔄 LOADING — Hiển thị trạng thái loading
// ============================================================
function showLoading(title) {
    if (title === void 0) { title = "Đang xử lý..."; }
    sweetalert2_1.default.fire({
        title: title,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: function () {
            sweetalert2_1.default.showLoading();
        },
    });
}
function closeLoading() {
    sweetalert2_1.default.close();
}
