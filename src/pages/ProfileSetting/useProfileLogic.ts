// src/pages/ProfileSetting/useProfileLogic.ts

import { useState, useEffect } from "react";
// Lưu ý: Hãy đảm bảo đường dẫn import api đúng với project của bạn
import { api } from "../../services/api";
import type {
    UserProfileForm,
    FormErrors,
    NotificationState,
} from "./profile.types";

export const useProfileLogic = () => {
  // --------------------------------------------------------
  // 1. KHAI BÁO STATE
  // --------------------------------------------------------
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(
    null,
  );

  const [formData, setFormData] = useState<UserProfileForm>(
    {} as UserProfileForm,
  );
  const [originalData, setOriginalData] = useState<UserProfileForm>(
    {} as UserProfileForm,
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const minJoinDateStr = "1996-01-01"; // Mốc thời gian hợp lệ cho ngày vào trường

  // --------------------------------------------------------
  // 2. FETCH DATA (Gọi API lấy dữ liệu lúc mới vào trang)
  // --------------------------------------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Thay đổi endpoint '/users/profile' theo đúng API thực tế của Backend bạn
        const res = await api.get("/users/profile");

        setFormData(res.data);
        setOriginalData(res.data); // Lưu lại bản gốc để dùng cho nút "Hủy"
      } catch (error) {
        setNotification({
          type: "error",
          message: "Lỗi khi tải thông tin cá nhân. Vui lòng thử lại.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --------------------------------------------------------
  // 3. CÁC HÀM CẬP NHẬT DỮ LIỆU & VALIDATE CHUNG
  // --------------------------------------------------------
  const handleChange = (field: keyof UserProfileForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Nếu đang có lỗi ở field này mà user gõ lại thì xoá lỗi đi cho đẹp
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // --- LOGIC NGÀY VÀO TRƯỜNG ---
  const validateJoinDate = (dateValue: string): string => {
    if (!dateValue) return "";

    const selectedDate = new Date(dateValue);
    const currentDate = new Date();
    const minimumDate = new Date(minJoinDateStr);

    if (selectedDate > currentDate)
      return "Ngày vào trường không thể ở tương lai.";
    if (selectedDate < minimumDate)
      return `Không hợp lệ (phải từ năm ${minimumDate.getFullYear()}).`;
    return "";
  };

  const handleJoinDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleChange("joinDate", value);

    const errorMsg = validateJoinDate(value);
    setErrors((prev) => ({ ...prev, joinDate: errorMsg }));
  };

  // --- LOGIC GIỜ GIẢNG/NĂM (Chống spam, số âm, ký tự lạ) ---
  const handleTeachingHoursChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value.replace(/[^0-9]/g, ""); // Chỉ giữ lại số
    handleChange("teachingHours", val ? Number(val) : "");
  };

  const handlePreventInvalidChars = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
      e.preventDefault(); // Chặn gõ ký tự toán học
    }
  };

  const handleSmartPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("text");
    if (/[^0-9]/.test(pastedData)) {
      e.preventDefault(); // Chặn dán nếu chứa chữ/ký tự lạ
      setNotification({
        type: "warning",
        message: "Chỉ được dán ký tự số vào ô Giờ giảng.",
      });
    }
  };

  // --- LOGIC ĐỔI AVATAR ---
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Gán tạm ảnh preview để user xem trước (Có thể cần gọi API upload riêng ở đây tùy Backend)
    const previewUrl = URL.createObjectURL(file);
    handleChange("avatarUrl", previewUrl);
  };

  // --------------------------------------------------------
  // 4. CÁC HÀM HÀNH ĐỘNG (LƯU & HỦY)
  // --------------------------------------------------------
  const handleCancel = () => {
    setFormData(originalData); // Phục hồi lại dữ liệu cũ
    setIsEditing(false);
    setErrors({});
  };

  const handleSave = async () => {
    // 1. Kiểm tra lỗi validate trước khi cho lưu
    const dateError = validateJoinDate(formData.joinDate);

    // Kiểm tra trường bắt buộc
    if (!formData.name || !formData.staffCode) {
      setNotification({
        type: "error",
        message: "Vui lòng điền đầy đủ các trường bắt buộc (*)",
      });
      setActiveTab(0); // Nhảy về tab đầu tiên để user thấy
      return;
    }

    if (dateError) {
      setErrors((prev) => ({ ...prev, joinDate: dateError }));
      setNotification({
        type: "error",
        message: "Ngày vào trường không hợp lệ.",
      });
      setActiveTab(0);
      return;
    }

    // 2. Tiến hành gọi API lưu dữ liệu
    setSaving(true);
    try {
      // Thay đổi endpoint '/users/profile' theo backend thực tế
      await api.put("/users/profile", formData);

      setOriginalData(formData); // Cập nhật lại bản gốc bằng data mới
      setIsEditing(false);
      setNotification({
        type: "success",
        message: "Cập nhật thông tin hồ sơ thành công!",
      });
    } catch (error) {
      setNotification({
        type: "error",
        message: "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------------
  // 5. EXPORT NHỮNG GÌ UI CẦN DÙNG
  // --------------------------------------------------------
  return {
    // States
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    loading,
    saving,
    notification,
    setNotification,
    formData,
    errors,

    // Handlers
    handleChange,
    handleJoinDateChange,
    handleTeachingHoursChange,
    handlePreventInvalidChars,
    handleSmartPaste,
    handleAvatarChange,

    // Actions
    handleCancel,
    handleSave,
  };
};
