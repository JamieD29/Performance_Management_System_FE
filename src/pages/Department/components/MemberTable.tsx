import React from "react";
import { Users, Edit, Trash2, GraduationCap } from "lucide-react";
import type { User } from "../../../types/index";
import { showInfo } from "../../../utils/swal";
import { useTranslation } from "react-i18next";

interface MemberTableProps {
  members: User[]; // Changed from Member[] to User[]
  departmentName: string;
  onSelectMember: (user: User) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({
  members,
  departmentName,
  onSelectMember,
}) => {
  const { t } = useTranslation();

  return (
    <div className="animate-fade-in w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          {t("departmentDetail.memberTable.title", { departmentName })}
        </h3>
        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2 text-sm shadow-sm transition-all">
          <Users size={16} /> {t("departmentDetail.memberTable.addStaff")}
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("departmentDetail.memberTable.headers.nameEmail")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("departmentDetail.memberTable.headers.jobTitle")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("departmentDetail.memberTable.headers.academicRankDegree")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("departmentDetail.memberTable.headers.teachingHours")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("departmentDetail.memberTable.headers.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.length > 0 ? (
              members.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onSelectMember(user)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  {/* Column 1: Name & Email */}
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center">
                       <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                         {user.avatarUrl ? (
                           <img
                             src={user.avatarUrl}
                             alt=""
                             className="h-10 w-10 rounded-full"
                           />
                         ) : (
                           user.name.charAt(0)
                         )}
                       </div>
                       <div>
                         <div className="text-sm font-medium text-gray-900">
                           {user.name}
                         </div>
                         <div className="text-sm text-gray-500">
                           {user.email}
                         </div>
                       </div>
                     </div>
                  </td>

                  {/* Column 2: Job Title */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm font-medium border border-blue-100">
                      {user.jobTitle ? t("profile.enums.jobTitle." + user.jobTitle, { defaultValue: user.jobTitle }) : "N/A"}
                    </span>
                  </td>

                  {/* Column 3: Academic Rank / Degree */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-700">
                      <GraduationCap size={16} className="mr-2 text-gray-400" />
                      <span>
                        {user.academicRank && user.academicRank !== "Không" && user.academicRank !== "None" ? `${t("profile.enums.academicRank." + user.academicRank, { defaultValue: user.academicRank })}, ` : ""}
                        {user.degree ? t("profile.enums.degree." + user.degree, { defaultValue: user.degree }) : ""}
                      </span>
                    </div>
                  </td>

                  {/* Column 4: Teaching Hours */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.teachingHours ? t("departmentDetail.memberTable.teachingHours", { count: user.teachingHours }) : "-"}
                  </td>

                  {/* Column 5: Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mx-1 p-2 hover:bg-indigo-50 rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        showInfo(t("departmentDetail.memberTable.noticeTitle"), t("departmentDetail.memberTable.featureUnderDevelopment"));
                      }}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 mx-1 p-2 hover:bg-red-50 rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        showInfo(t("departmentDetail.memberTable.noticeTitle"), t("departmentDetail.memberTable.featureUnderDevelopment"));
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-gray-500 italic"
                >
                  {t("departmentDetail.memberTable.noStaff")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
