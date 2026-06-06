import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";
import { confirmDelete, showError } from "../../utils/swal";
import DepartmentMasterView from "./components/DepartmentMasterView";
import DepartmentDetailView from "./components/DepartmentDetailView";
import type { Department } from "./department.types";

export default function DepartmentPage() {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const deptId = searchParams.get("deptId");

  const selectedDept = departments.find(d => d.id === deptId) || null;

  const handleSelectDept = (dept: Department) => {
    setSearchParams({ deptId: dept.id });
  };

  const handleBack = () => {
    setSearchParams(prev => {
      prev.delete("deptId");
      return prev;
    });
  };

  // --- User / Role ---
  const userStr = localStorage.getItem("user");
  const loggedInUser = userStr ? JSON.parse(userStr) : null;
  const rawRoles = loggedInUser?.roles || [];
  const userRoles = Array.isArray(rawRoles)
    ? rawRoles.map((r: any) =>
        (typeof r === "string" ? r : r.slug || r.name || "")
          .toString()
          .toUpperCase(),
      )
    : [];

  const isAdmin = userRoles.includes("ADMIN");
  const mngLevel = loggedInUser?.managementPosition?.permissionLevel || "NONE";
  const isKhoa = !isAdmin && ["SYSTEM", "KHOA"].includes(mngLevel);
  // isDonVi chỉ đúng khi KHÔNG phải admin và KHÔNG phải khoa
  const isDonVi = !isAdmin && !isKhoa && mngLevel === "DON_VI";
  // Bất kỳ user nào có chức vụ quản lý đều xem được tab nhân sự
  const hasManagementPosition = !!loggedInUser?.managementPosition;

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Auto-navigate: CHỈ cho user thuần DON_VI (không phải admin/khoa)
  useEffect(() => {
    if (isDonVi && !isAdmin && !isKhoa && departments.length > 0 && !selectedDept) {
      const myDept = departments.find(
        (d) => d.id === loggedInUser?.department?.id,
      );
      if (myDept) {
        handleSelectDept(myDept);
      }
    }
  }, [isDonVi, isAdmin, isKhoa, departments, selectedDept, loggedInUser?.department?.id]);

  const handleDeleteDept = async (id: string, name: string) => {
    const ok = await confirmDelete(name);
    if (ok) {
      try {
        await api.delete(`/departments/${id}`);
        fetchDepartments();
      } catch (error) {
        showError(t("departmentMaster.deleteErrorTitle"), t("departmentMaster.deleteErrorText"));
      }
    }
  };

  if (selectedDept) {
    return (
      <DepartmentDetailView
        department={selectedDept}
        isAdmin={isAdmin}
        isDonVi={isDonVi}
        onBack={handleBack}
      />
    );
  }

  return (
    <DepartmentMasterView
      departments={departments}
      loading={loading}
      isAdmin={isAdmin}
      isKhoa={isKhoa}
      isDonVi={isDonVi}
      hasManagementPosition={hasManagementPosition}
      loggedInUser={loggedInUser}
      onSelectDept={handleSelectDept}
      onDeleteDept={handleDeleteDept}
      onRefresh={fetchDepartments}
    />
  );
}
