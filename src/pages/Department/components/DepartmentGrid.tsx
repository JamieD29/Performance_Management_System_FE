// src/features/departments/components/DepartmentGrid.tsx
import React from "react";
import { ChevronRight, Folder, Plus } from "lucide-react";
import type { Department } from "../../../types/models";

interface DepartmentGridProps {
  departments: Department[];
  currentDept: Department | null;
  onSelect: (dept: Department) => void;
  onAddClick: () => void;
}

export const DepartmentGrid: React.FC<DepartmentGridProps> = ({
  departments,
  currentDept,
  onSelect,
  onAddClick,
}) => {
  return (
    <div className="w-full">
      {/* Header Bar: Tên danh sách + Nút thêm mới nằm ngang hàng */}
      <div className="flex flex-row justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-800">
          {currentDept ? currentDept.name : "Danh sách Khoa / Phòng ban"}
        </h3>

        <button
          onClick={onAddClick}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Thêm đơn vị</span>
        </button>
      </div>

      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Folder size={48} className="mb-3 opacity-20" />
          <p>Chưa có đơn vị trực thuộc nào.</p>
        </div>
      ) : (
        /* --- GRID LAYOUT: QUAN TRỌNG ĐỂ NẰM NGANG --- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              onClick={() => onSelect(dept)}
              className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-400 cursor-pointer transition-all duration-200 ease-in-out flex flex-col justify-between h-32"
            >
              {/* Icon và Tên */}
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Folder size={24} />
                </div>
                {/* Mũi tên chỉ hiện khi hover */}
                <ChevronRight className="text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Thông tin Text */}
              <div className="mt-3">
                <h4 className="font-bold text-gray-800 group-hover:text-blue-700 text-lg truncate">
                  {dept.name}
                </h4>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">
                  Level {dept.level} • Trực thuộc
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};