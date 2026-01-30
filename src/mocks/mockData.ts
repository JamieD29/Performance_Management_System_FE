import type { Department, User } from "../types/index";

export const MOCK_DEPARTMENTS: Department[] = [
  // Level 1
  { id: "lv1_1", name: "Khoa Công Nghệ Thông Tin", level: 1, parentId: null },
  { id: "lv1_2", name: "Khoa Vật Lý", level: 1, parentId: null },
  // Level 2
  {
    id: "lv2_1",
    name: "Bộ môn Công nghệ phần mềm",
    level: 2,
    parentId: "lv1_1",
  },
  { id: "lv2_2", name: "Bộ môn Mạng máy tính", level: 2, parentId: "lv1_1" },
  // Level 3
  { id: "lv3_1", name: "Nhóm R&D Web App", level: 3, parentId: "lv2_1" },
  { id: "lv3_2", name: "Tổ Giáo vụ CNPM", level: 3, parentId: "lv2_1" },
];

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Nguyễn Văn A",
    email: "nva@hcmus.edu.vn",
    roles: ["USER", "MANAGER"],
    department: { id: "lv3_1", name: "Nhóm R&D Web App" },
    jobTitle: "Trưởng nhóm Nghiên cứu",
    academicRank: "PGS",
    degree: "Tiến sĩ",
    teachingHours: 120,
    joinDate: "2015-09-01",
    awards: "Nhà giáo ưu tú 2020",
    intellectualProperty: "2 bài báo ISI, 1 bằng sáng chế",
  },
  {
    id: "u2",
    name: "Trần Thị B",
    email: "ttb@hcmus.edu.vn",
    roles: ["USER"],
    department: { id: "lv3_1", name: "Nhóm R&D Web App" },
    jobTitle: "Giảng viên",
    academicRank: "",
    degree: "Thạc sĩ",
    teachingHours: 250,
    joinDate: "2019-02-15",
  },
  {
    id: "u3",
    name: "Lê Văn C",
    email: "lvc@hcmus.edu.vn",
    roles: ["USER"],
    department: { id: "lv3_1", name: "Nhóm R&D Web App" },
    jobTitle: "Nghiên cứu viên",
    degree: "Cử nhân",
    teachingHours: 0,
    joinDate: "2023-01-10",
  },
];
