// src/pages/ProfileSetting/useProfileLogic.ts

import { useState, useEffect } from "react";
// Note: Ensure the API import path is correct for your project
import { api } from "../../services/api";
import type {
  UserProfileForm,
  FormErrors,
  NotificationState,
} from "./profile.types";
import { useProfileValidation } from "../../hooks/useProfileValidation";
import { useTranslation } from "react-i18next";

export const useProfileLogic = () => {
  const { t } = useTranslation();
  // --------------------------------------------------------
  // 1. STATE DECLARATIONS
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
  // 2. FETCH DATA (Call API to load profile data on mount)
  // --------------------------------------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Call 2 APIs in parallel: Fetch departments and user profile data
        const [deptRes, profileRes] = await Promise.all([
          api.get("/departments"),
          api.get("/users/profile"),
        ]);

        setDepartments(deptRes.data);

        // Map department and date of birth correctly into formData
        const u = profileRes.data;
        const mappedData = {
          ...u,
          departmentID: u.department ? u.department.id : u.departmentID || "",
          dob: u.dateOfBirth ? u.dateOfBirth.split("T")[0] : u.dob || "",
        };

        setFormData(mappedData);
        setOriginalData(mappedData);
        syncToSession(mappedData); // Synchronize when fetch completes
      } catch (error) {
        setNotification({
          type: "error",
          message: t("profile.messages.loadError"),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [t]);

  // --- Helper to get department name from ID ---
  const getDepartmentName = (id: string) => {
    return departments.find((d) => d.id === id)?.name || id || t("profile.notUpdated");
  };

  // --- Sync data to localStorage (to update Header/Sidebar accordingly) ---
  const syncToSession = (data: any) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = {
          ...user,
          ...data,
          // Header dùng 'avatar', API entity dùng 'avatarUrl'
          avatar: data.avatarUrl || data.avatar || user.avatar,
          name: data.name || user.name,
          jobTitle: data.jobTitle || user.jobTitle,
          profileCompleted: true, // Mark profile setup as completed
          // Sync roles to a string array for easier checking in Sidebar/Header
          roles: data.roles
            ? data.roles.map((r: any) =>
                typeof r === "string" ? r : r.slug || r.name,
              )
            : user.roles,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error("Sync session failed", e);
    }
  };

  // --------------------------------------------------------
  // 3. DATA UPDATE HANDLERS & GENERAL VALIDATION
  // --------------------------------------------------------
  const handleChange = (field: keyof UserProfileForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when the user is retyping in that field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // --- JOIN DATE & DATE OF BIRTH LOGIC ---
  const validateDates = (
    dob: string,
    joinDate: string,
    focusField?: "dob" | "joinDate",
  ) => {
    const { dobError, joinDateError } = validateAgeAtJoinDate(dob, joinDate);
    const genericJoinDateError = validateJoinDateStr(joinDate);

    setErrors((prev) => ({
      ...prev,
      // If focused on DOB, only display DOB error, and clear age error on JoinDate.
      // If no focusField (on Save), display both errors if they exist.
      dob:
        focusField === "dob"
          ? dobError || undefined
          : focusField === "joinDate"
            ? undefined
            : dobError || undefined,

      joinDate:
        focusField === "joinDate"
          ? joinDateError || genericJoinDateError || undefined
          : focusField === "dob"
            ? genericJoinDateError || undefined
            : joinDateError || genericJoinDateError || undefined,
    }));
    return dobError || joinDateError || genericJoinDateError;
  };

  const handleDobChange = (value: string) => {
    handleChange("dob", value);
    validateDates(value, formData.joinDate, "dob");
  };

  const handleJoinDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleChange("joinDate", value);
    validateDates(formData.dob, value, "joinDate");
  };

  // --- TEACHING HOURS LOGIC (Prevent spam, negative values, mathematical symbols) ---
  const handleTeachingHoursChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value.replace(/[^0-9]/g, ""); // Keep digits only
    handleChange("teachingHours", val ? Number(val) : "");
  };

  const handlePreventInvalidChars = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
      e.preventDefault(); // Block mathematical characters
    }
  };

  const handleSmartPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("text");
    if (/[^0-9]/.test(pastedData)) {
      e.preventDefault(); // Block paste if it contains non-numeric characters
      setNotification({
        type: "warning",
        message: t("profile.warnings.onlyNumbers"),
      });
    }
  };

  // --- AVATAR CHANGE LOGIC ---
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Temporarily assign preview URL for user to preview
    const previewUrl = URL.createObjectURL(file);
    handleChange("avatarUrl", previewUrl);
  };

  // --------------------------------------------------------
  // 4. ACTION HANDLERS (SAVE & CANCEL)
  // --------------------------------------------------------
  const handleCancel = () => {
    setFormData(originalData); // Restore original data copy
    setIsEditing(false);
    setErrors({});
  };

  const handleSave = async () => {
    // 1. Check validation errors before saving
    const dateError = validateDates(formData.dob, formData.joinDate);

    // Check required fields (Add required department checks if needed)
    if (!formData.name || !formData.staffCode || !formData.departmentID) {
      setNotification({
        type: "error",
        message: t("profile.warnings.requiredFields"),
      });
      setActiveTab(0); // Navigate to the first tab (or tab containing errors)
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

    // 2. Call API to save data
    setSaving(true);
    try {
      const { dob, ...restData } = formData;
      await api.patch("/users/profile", {
        ...restData,
        dateOfBirth: dob,
      });

      setOriginalData(formData); // Update original data copy with new values
      setIsEditing(false);
      syncToSession(formData); // Synchronize to session after successful save
      setNotification({
        type: "success",
        message: t("profile.messages.saveSuccess"),
      });
    } catch (error: any) {
      setNotification({
        type: "error",
        message:
          error?.response?.data?.message ||
          t("profile.messages.saveError"),
      });
    } finally {
      setSaving(false);
    }
  };

  const { dobError } = validateAgeAtJoinDate(formData.dob, formData.joinDate);
  const ageWarning = dobError || "";

  // --------------------------------------------------------
  // 5. EXPORT VARIABLES & ACTIONS FOR UI
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
    departments, // Export departments list
    getDepartmentName, // Export helper to get department name
    ageWarning, // Export age warning

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
