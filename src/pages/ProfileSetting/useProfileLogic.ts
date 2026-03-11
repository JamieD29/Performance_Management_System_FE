// src/pages/ProfileSetting/useProfileLogic.ts

import { useState, useEffect } from "react";
// Lưu ý: Đảm bảo đường dẫn import api đúng với project của bạn
import { api } from "../../services/api";
import type {
  UserProfileForm,
  FormErrors,
  NotificationState,
} from "./profile.types";
import { useProfileValidation } from "../../hooks/useProfileValidation";

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

  const [departments, setDepartments] = useState<any[]>([]);

  const { validateJoinDateStr, validateAgeAtJoinDate } = useProfileValidation();

  // --------------------------------------------------------
  // 2. FETCH DATA (Gọi API lấy dữ liệu lúc mới vào trang)
  // --------------------------------------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Gọi song song 2 API: Lấy danh sách phòng ban và Lấy thông tin user
        const [deptRes, profileRes] = await Promise.all([
          api.get("/departments"),
          api.get("/users/profile"),
        ]);

        setDepartments(deptRes.data);

        // Xử lý map dữ liệu department vào formData cho chuẩn
        const u = profileRes.data;
        const mappedData = {
          ...u,
          departmentID: u.department ? u.department.id : u.departmentID || "",
          dob: u.dateOfBirth ? u.dateOfBirth.split("T")[0] : (u.dob || ""),
        };

        setFormData(mappedData);
        setOriginalData(mappedData);
      } catch (error) {
        setNotification({
          type: "error",
          message: "Lỗi khi tải thông tin. Vui lòng thử lại.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --- Hàm lấy tên phòng ban từ ID ---
  const getDepartmentName = (id: string) => {
    return departments.find((d) => d.id === id)?.name || id || "Chưa cập nhật";
  };

  // --------------------------------------------------------
  // 3. CÁC HÀM CẬP NHẬT DỮ LIỆU & VALIDATE CHUNG
  // --------------------------------------------------------
  const handleChange = (field: keyof UserProfileForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Xóa lỗi nếu user đang gõ lại trường đó
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // --- LOGIC NGÀY VÀO TRƯỜNG ---
  // --- LOGIC NGÀY VÀO TRƯỜNG & NGÀY SINH ---
  const validateDates = (dob: string, joinDate: string, focusField?: 'dob' | 'joinDate') => {
    const { dobError, joinDateError } = validateAgeAtJoinDate(dob, joinDate);
    const genericJoinDateError = validateJoinDateStr(joinDate);
    
    setErrors(prev => ({
      ...prev,
      // Nếu focus vào DOB, chỉ hiện lỗi DOB, và xóa lỗi age trên JoinDate.
      // Nếu không có focusField (khi Save), hiện lỗi cả 2 nếu có.
      dob: focusField === 'dob' ? (dobError || undefined) : (focusField === 'joinDate' ? undefined : (dobError || undefined)),
      
      joinDate: focusField === 'joinDate' ? (joinDateError || genericJoinDateError || undefined) : 
                (focusField === 'dob' ? (genericJoinDateError || undefined) : 
                (joinDateError || genericJoinDateError || undefined))
    }));
    return dobError || joinDateError || genericJoinDateError;
  };

  const handleDobChange = (value: string) => {
    handleChange("dob", value);
    validateDates(value, formData.joinDate, 'dob');
  };

  const handleJoinDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleChange("joinDate", value);
    validateDates(formData.dob, value, 'joinDate');
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

    // Gán tạm ảnh preview để user xem trước
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
    const dateError = validateDates(formData.dob, formData.joinDate);

    // Kiểm tra trường bắt buộc (Cập nhật thêm bắt buộc bộ môn nếu cần)
    if (!formData.name || !formData.staffCode || !formData.departmentID) {
      setNotification({
        type: "error",
        message: "Vui lòng điền đầy đủ các trường bắt buộc (*)",
      });
      setActiveTab(0); // Nhảy về tab đầu tiên (hoặc tab chứa lỗi)
      return;
    }

    if (dateError) {
      setNotification({
        type: "error",
        message: dateError,
      });
      setActiveTab(0);
      return;
    }

    // 2. Tiến hành gọi API lưu dữ liệu
    setSaving(true);
    try {
      const { dob, ...restData } = formData;
      await api.patch("/users/profile", {
        ...restData,
        dateOfBirth: dob,
      });

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
    departments, // Xuất danh sách phòng ban
    getDepartmentName, // Xuất hàm lấy tên phòng ban

    // Handlers
    handleChange,
    handleJoinDateChange,
    handleDobChange,
    handleTeachingHoursChange,
    handlePreventInvalidChars,
    handleSmartPaste,
    handleAvatarChange,

    // Actions
    handleCancel,
    handleSave,
  };
};
