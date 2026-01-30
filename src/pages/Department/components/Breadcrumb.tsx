// src/features/departments/components/Breadcrumb.tsx
import React from "react";
import { ChevronRight, Home } from "lucide-react";
import type { Department } from "../../../types/models";

interface BreadcrumbProps {
  path: Department[];
  onNavigate: (dept: Department | null) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ path, onNavigate }) => {
  return (
    <nav className="flex items-center w-full bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
      {/* Nút Home */}
      <button
        onClick={() => onNavigate(null)}
        className="flex justify-items-center text-gray-500 hover:text-blue-600 transition-colors shrink-0"
      >
        <Home size={18} className="mr-1" />
        <span className="font-medium">Trang chủ</span>
      </button>

      {/* Các cấp tiếp theo */}
      {path.map((dept, index) => {
        const isLast = index === path.length - 1;
        return (
          <div key={dept.id} className="flex items-center shrink-0">
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <button
              onClick={() => !isLast && onNavigate(dept)}
              disabled={isLast}
              className={`text-sm transition-colors ${
                isLast
                  ? "font-bold text-blue-700 cursor-default"
                  : "font-medium text-gray-600 hover:text-blue-600"
              }`}
            >
              {dept.name}
            </button>
          </div>
        );
      })}
    </nav>
  );
};