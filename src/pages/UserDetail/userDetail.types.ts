import type { User } from "../../types";

export interface CycleOption {
  id: string;
  name: string;
  status: string;
  type: string;
  startDate: string | null;
  endDate: string | null;
}

export interface KeyResult {
  id: string;
  content: string;
  target: number;
  unit: string;
  weight: number;
  maxScore: number;
  unitScore: number;
  actual: number;
  score: number;
}

export interface StaffOkr {
  id: string;
  userId: string;
  cycleId: string;
  objective: string;
  keyResults: KeyResult[];
  totalScore: number;
  status: "PENDING" | "NEGOTIATING" | "ACCEPTED" | "REJECTED" | "SUBMITTED" | "COMPLETED";
  selfReportData?: Record<string, { quantity: number; evidence: string }>;
  managerReportData?: Record<string, { quantity: number; evidence: string }>;
  managerScore?: number;
}

export interface TaskGroupData {
  groupCode: string;
  groupName: string;
  weight: number;
  maxScore: number;
  items: any[]; // Chi tiết items nếu cần
  selfScoreTotal: number;
  principalScoreTotal: number;
}

export interface StaffEvaluation {
  id: string;
  userId: string;
  cycleId: string;
  evaluationData: TaskGroupData[];
  selfScoreTotal: number;
  principalScoreTotal: number;
  selfComment?: string;
  selfRating?: string;
  managerComment?: string;
  managerRating?: string;
  status: "DRAFT" | "SUBMITTED" | "EVALUATED" | "APPROVED";
}

export interface UserDetailData {
  user: User;
  okrs: StaffOkr[];
  evaluation: StaffEvaluation | null;
  allCycles: CycleOption[];
}
