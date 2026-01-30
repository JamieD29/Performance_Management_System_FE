// src/features/departments/components/MemberDetailModal.tsx
import React from "react";
import { X } from "lucide-react";
import type { User } from './../../types/index';

interface MemberDetailModalProps {
  member: User | null;
  onClose: () => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  onClose,
}) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4 text-blue-900 border-b pb-2">
          Thông tin thành viên
        </h2>

        <div className="space-y-3">
          <div>
            <span className="font-semibold text-gray-600">Họ tên:</span>{" "}
            {member.name}
          </div>
          <div>
            <span className="font-semibold text-gray-600">Email:</span>{" "}
            {member.email}
          </div>
          <div>
            <span className="font-semibold text-gray-600">Vai trò:</span>{" "}
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm">
              {member.jobTitle}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Tiến độ OKR:</span>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: 60 }}
              ></div>
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              60% hoàn thành
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Đóng
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Xem chi tiết OKR
          </button>
        </div>
      </div>
    </div>
  );
};
