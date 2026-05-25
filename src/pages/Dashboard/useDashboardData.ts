import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";

// ============================================================
// TYPES
// ============================================================

/** Trạng thái vòng đời OKR */
export type OkrStatus =
  | "PENDING"
  | "NEGOTIATING"
  | "ACCEPTED"
  | "SUBMITTED"
  | "COMPLETED"
  | "REJECTED";

/** Bước trong stepper tiến trình */
export interface OkrStep {
  key: OkrStatus | "ASSIGNED";
  label: string;
  description: string;
}

/** Thông tin OKR của user */
export interface UserOkrData {
  id: string;
  objective: string;
  status: OkrStatus;
  totalScore: number;
  managerScore: number | null;
  selfReportData: any;
  managerReportData: any;
  keyResults: any[];
  deadline: string | null;
  createdAt: string;
  cycle?: {
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
  };
}

/** Thông tin phiếu đánh giá */
export interface UserEvaluationData {
  id: string;
  status: string;
  selfScoreTotal: number;
  principalScoreTotal: number;
  selfRating: string | null;
  managerRating: string | null;
  evaluationData: Array<{
    id: string;
    name: string;
    maxScore: number;
    selfScore: number;
    principalScore: number;
  }>;
}

/** Dữ liệu tổng hợp cho dashboard */
export interface DashboardData {
  /** OKR chính (mới nhất / quan trọng nhất) */
  primaryOkr: UserOkrData | null;
  /** Tất cả OKR */
  allOkrs: UserOkrData[];
  /** Phiếu đánh giá */
  evaluation: UserEvaluationData | null;
  /** Tiến độ nhập điểm theo từng Objective */
  dataEntryProgress: Array<{
    id: string;
    name: string;
    totalItems: number;
    filledItems: number;
    percent: number;
  }>;
  /** Thông tin kỳ đánh giá hiện tại */
  currentCycle: {
    name: string;
    status: string;
    startDate: string;
    endDate: string;
  } | null;
  /** Tính toán sẵn */
  computed: {
    /** Bước hiện tại trong stepper (0-indexed) */
    currentStepIndex: number;
    /** Số ngày còn lại đến deadline */
    daysUntilDeadline: number | null;
    /** % thời gian đã qua trong kỳ */
    cycleProgressPercent: number;
    /** Có action cần thực hiện không */
    hasActionRequired: boolean;
    /** Mô tả action cần thực hiện */
    actionMessage: string;
    /** Route điều hướng cho CTA */
    actionRoute: string;
    /** Label cho CTA button */
    actionLabel: string;
    /** Tên của hạn chót */
    deadlineLabel: string | null;
  };
}

// ============================================================
// CONSTANTS
// ============================================================

/** Các bước trong quy trình OKR */
export const OKR_STEPS: OkrStep[] = [
  {
    key: "ASSIGNED",
    label: "Được giao",
    description: "OKR đã được Trưởng khoa gán cho bạn",
  },
  {
    key: "PENDING",
    label: "Chờ phản hồi",
    description: "Xem xét và phản hồi OKR được giao",
  },
  {
    key: "NEGOTIATING",
    label: "Đàm phán",
    description: "Đang trao đổi với Trưởng khoa",
  },
  {
    key: "ACCEPTED",
    label: "Đã duyệt",
    description: "OKR đã được thống nhất, sẵn sàng tự khai",
  },
  {
    key: "SUBMITTED",
    label: "Đã nộp",
    description: "Đã nộp self-report, chờ TK chấm điểm",
  },
  {
    key: "COMPLETED",
    label: "Hoàn thành",
    description: "Trưởng khoa đã chấm điểm xong",
  },
];

/** Map status → step index */
const STATUS_TO_STEP: Record<string, number> = {
  PENDING: 1,
  NEGOTIATING: 2,
  ACCEPTED: 3,
  SUBMITTED: 4,
  COMPLETED: 5,
  REJECTED: 1, // Rejected quay về bước phản hồi
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Tính số ngày còn lại từ hôm nay đến deadline */
function calcDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  const dl = new Date(deadline);
  const diff = dl.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Tính % thời gian đã qua trong kỳ */
function calcCycleProgress(startDate: string, endDate: string): number {
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (end <= start) return 0;
  const progress = ((now - start) / (end - start)) * 100;
  return Math.max(0, Math.min(100, progress));
}



/** Tính tiến độ nhập liệu số lượng mục theo từng Nhiệm vụ/Objective */
function computeDataEntryProgress(keyResults: any[], selfReportData: any) {
  if (!keyResults || !Array.isArray(keyResults)) return [];
  const progressList: any[] = [];

  for (const obj of keyResults) {
    let totalItems = 0;
    let filledItems = 0;

    const traverse = (items: any[], prefixKey: string) => {
      if (!items || !Array.isArray(items)) return;
      for (const item of items) {
        const currentKey = `${prefixKey}-${item.id}`;
        
        // Nếu là node lá (không có items con) -> tính là 1 mục cần điền
        if (!item.items || item.items.length === 0) {
          totalItems++;
          const data = selfReportData?.[currentKey];
          // Có khai số lượng > 0 HOẶC có điền minh chứng thì coi như đã nhập
          if (
            data &&
            ((data.quantity !== undefined && Number(data.quantity) > 0) ||
              (data.evidence && String(data.evidence).trim() !== ""))
          ) {
            filledItems++;
          }
        } else {
          traverse(item.items, currentKey);
        }
      }
    };

    if (obj.items) {
      traverse(obj.items, obj.id);
    }
    
    const percent = totalItems > 0 ? Math.round((filledItems / totalItems) * 100) : 0;

    progressList.push({
      id: obj.id,
      name: obj.title || obj.id,
      totalItems,
      filledItems,
      percent,
    });
  }

  return progressList;
}

/** Chọn OKR quan trọng nhất (ưu tiên theo status) */
function selectPrimaryOkr(okrs: UserOkrData[]): UserOkrData | null {
  if (!okrs || okrs.length === 0) return null;

  // Ưu tiên: ACCEPTED (cần tự khai) > SUBMITTED (đang chờ) > PENDING > NEGOTIATING > COMPLETED
  const priority: Record<string, number> = {
    ACCEPTED: 1,
    PENDING: 2,
    NEGOTIATING: 3,
    SUBMITTED: 4,
    COMPLETED: 5,
    REJECTED: 6,
  };

  const sorted = [...okrs].sort((a, b) => {
    const pa = priority[a.status] ?? 99;
    const pb = priority[b.status] ?? 99;
    if (pa !== pb) return pa - pb;
    // Nếu cùng priority, lấy mới nhất
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return sorted[0];
}

/** Tạo action message dựa trên trạng thái OKR + Evaluation */
function computeAction(
  okr: UserOkrData | null,
  evaluation: UserEvaluationData | null,
): {
  hasAction: boolean;
  message: string;
  route: string;
  label: string;
} {
  if (!okr) {
    return {
      hasAction: false,
      message: "Bạn chưa được giao OKR nào. Hãy đợi Trưởng khoa giao OKR.",
      route: "/my-okr",
      label: "Xem OKR",
    };
  }

  switch (okr.status) {
    case "PENDING":
      return {
        hasAction: true,
        message:
          "Bạn có OKR mới được giao. Hãy xem xét và chấp nhận hoặc đề xuất điều chỉnh.",
        route: "/my-okr",
        label: "Phản hồi OKR ngay",
      };
    case "NEGOTIATING":
      return {
        hasAction: true,
        message:
          "OKR đang trong quá trình đàm phán với Trưởng khoa. Kiểm tra phản hồi mới.",
        route: "/my-okr",
        label: "Xem trao đổi",
      };
    case "ACCEPTED":
      return {
        hasAction: true,
        message:
          "OKR đã được chấp nhận! Hãy nhập số liệu và minh chứng để nộp bài tự khai.",
        route: "/my-okr",
        label: "Tự khai điểm ngay",
      };
    case "SUBMITTED":
      return {
        hasAction: false,
        message:
          "Bạn đã nộp báo cáo tự khai. Đang chờ Trưởng khoa chấm điểm.",
        route: "/my-okr",
        label: "Xem lại báo cáo",
      };
    case "COMPLETED": {
      // Kiểm tra phiếu đánh giá
      if (evaluation) {
        if (evaluation.status === "EVALUATED") {
          return {
            hasAction: false,
            message:
              "Quy trình đánh giá đã hoàn tất! Xem kết quả xếp loại của bạn.",
            route: "/my-evaluation",
            label: "Xem kết quả",
          };
        }
        if (evaluation.status === "SUBMITTED") {
          return {
            hasAction: false,
            message:
              "Phiếu đánh giá đã nộp. Đang chờ Trưởng khoa xếp loại cuối cùng.",
            route: "/my-evaluation",
            label: "Xem phiếu đánh giá",
          };
        }
        // PENDING_EVALUATION
        return {
          hasAction: true,
          message:
            "OKR đã hoàn tất! Hãy tự nhận xét và nộp Phiếu Đánh Giá Xếp Loại.",
          route: "/my-evaluation",
          label: "Nộp phiếu đánh giá",
        };
      }
      return {
        hasAction: false,
        message: "OKR đã được Trưởng khoa chấm điểm xong.",
        route: "/my-okr",
        label: "Xem kết quả",
      };
    }
    case "REJECTED":
      return {
        hasAction: true,
        message: "OKR của bạn đã bị từ chối. Hãy xem lý do và gửi đề xuất mới.",
        route: "/my-okr",
        label: "Xem chi tiết",
      };
    default:
      return {
        hasAction: false,
        message: "",
        route: "/my-okr",
        label: "Xem OKR",
      };
  }
}

// ============================================================
// HOOK
// ============================================================

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Gọi song song 3 API
      const [okrRes, evalRes, cycleRes] = await Promise.allSettled([
        api.get("/okrs/my"),
        api.get("/okrs/evaluations/my"),
        api.get("/performance/cycles"),
      ]);

      // Parse OKRs
      const allOkrs: UserOkrData[] =
        okrRes.status === "fulfilled" ? okrRes.value.data || [] : [];

      // Parse Evaluation
      const evaluation: UserEvaluationData | null =
        evalRes.status === "fulfilled" ? evalRes.value.data || null : null;

      // Parse Cycles — tìm kỳ OPEN
      let currentCycle: DashboardData["currentCycle"] = null;
      if (cycleRes.status === "fulfilled") {
        const cycles = cycleRes.value.data || [];
        const openCycle = cycles.find((c: any) => c.status === "OPEN");
        const latestCycle = openCycle || cycles[0];
        if (latestCycle) {
          currentCycle = {
            name: latestCycle.name,
            status: latestCycle.status,
            startDate: latestCycle.startDate,
            endDate: latestCycle.endDate,
          };
        }
      }

      // Chọn OKR chính
      const primaryOkr = selectPrimaryOkr(allOkrs);

      // Tính toán
      const currentStepIndex = primaryOkr
        ? STATUS_TO_STEP[primaryOkr.status] ?? 0
        : 0;

      const daysUntilDeadline = primaryOkr
        ? calcDaysUntilDeadline(primaryOkr.deadline)
        : null;

      const cycleProgressPercent =
        currentCycle?.startDate && currentCycle?.endDate
          ? calcCycleProgress(currentCycle.startDate, currentCycle.endDate)
          : 0;

      const action = computeAction(primaryOkr, evaluation);

      const dataEntryProgress = primaryOkr
        ? computeDataEntryProgress(primaryOkr.keyResults, primaryOkr.selfReportData)
        : [];

      const getDeadlineLabel = (status: string) => {
        if (status === "PENDING" || status === "NEGOTIATING" || status === "REJECTED") {
          return "Hạn chót đàm phán OKR";
        }
        if (status === "ACCEPTED") {
          return "Hạn chót nộp báo cáo";
        }
        return "Hạn chót";
      };

      setData({
        primaryOkr,
        allOkrs,
        evaluation,
        currentCycle,
        dataEntryProgress,
        computed: {
          currentStepIndex,
          daysUntilDeadline,
          cycleProgressPercent,
          hasActionRequired: action.hasAction,
          actionMessage: action.message,
          actionRoute: action.route,
          actionLabel: action.label,
          deadlineLabel: primaryOkr ? getDeadlineLabel(primaryOkr.status) : null,
        },
      });
    } catch (err: any) {
      console.error("Dashboard data fetch error:", err);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
