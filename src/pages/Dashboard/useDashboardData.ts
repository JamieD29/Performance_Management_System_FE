import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";

// ============================================================
// TYPES
// ============================================================

/** OKR lifecycle status */
export type OkrStatus =
  | "PENDING"
  | "NEGOTIATING"
  | "ACCEPTED"
  | "SUBMITTED"
  | "COMPLETED"
  | "REJECTED";

/** Step in the progress stepper */
export interface OkrStep {
  key: OkrStatus | "ASSIGNED";
  labelKey: string;
  descriptionKey: string;
}

/** User's OKR information */
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
  updatedAt: string;
  cycle?: {
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
  };
}

/** Evaluation form information */
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

/** Aggregated data for dashboard */
export interface DashboardData {
  /** Primary OKR (latest / most important) */
  primaryOkr: UserOkrData | null;
  /** All OKRs */
  allOkrs: UserOkrData[];
  /** Evaluation form */
  evaluation: UserEvaluationData | null;
  /** Data entry progress per Objective */
  dataEntryProgress: Array<{
    id: string;
    name: string;
    totalItems: number;
    filledItems: number;
    percent: number;
  }>;
  /** Current evaluation cycle info */
  currentCycle: {
    name: string;
    status: string;
    startDate: string;
    endDate: string;
  } | null;
  /** Pre-computed values */
  computed: {
    /** Current step in stepper (0-indexed) */
    currentStepIndex: number;
    /** Days remaining until deadline */
    daysUntilDeadline: number | null;
    /** Deadline countdown state */
    deadlineState: "DEFAULT" | "SUBMITTED_EARLY" | "SUBMITTED_LATE";
    /** % of time elapsed in the cycle */
    cycleProgressPercent: number;
    /** Whether there is an action required */
    hasActionRequired: boolean;
    /** Description of the required action */
    actionMessage: string;
    /** Navigation route for CTA */
    actionRoute: string;
    /** Label for CTA button */
    actionLabel: string;
    /** Deadline label name */
    deadlineLabel: string | null;
  };
}

// ============================================================
// CONSTANTS
// ============================================================

/** Steps in the OKR process */
export const OKR_STEPS: OkrStep[] = [
  {
    key: "ASSIGNED",
    labelKey: "dashboard.stepper.steps.ASSIGNED.label",
    descriptionKey: "dashboard.stepper.steps.ASSIGNED.description",
  },
  {
    key: "PENDING",
    labelKey: "dashboard.stepper.steps.PENDING.label",
    descriptionKey: "dashboard.stepper.steps.PENDING.description",
  },
  {
    key: "NEGOTIATING",
    labelKey: "dashboard.stepper.steps.NEGOTIATING.label",
    descriptionKey: "dashboard.stepper.steps.NEGOTIATING.description",
  },
  {
    key: "ACCEPTED",
    labelKey: "dashboard.stepper.steps.ACCEPTED.label",
    descriptionKey: "dashboard.stepper.steps.ACCEPTED.description",
  },
  {
    key: "INPUTTING" as any,
    labelKey: "dashboard.stepper.steps.INPUTTING.label",
    descriptionKey: "dashboard.stepper.steps.INPUTTING.description",
  },
  {
    key: "SUBMITTED",
    labelKey: "dashboard.stepper.steps.SUBMITTED.label",
    descriptionKey: "dashboard.stepper.steps.SUBMITTED.description",
  },
  {
    key: "COMPLETED",
    labelKey: "dashboard.stepper.steps.COMPLETED.label",
    descriptionKey: "dashboard.stepper.steps.COMPLETED.description",
  },
];

/** Map status → step index */
const STATUS_TO_STEP: Record<string, number> = {
  PENDING: 1,
  NEGOTIATING: 2,
  ACCEPTED: 4, // When ACCEPTED, user is at the "Start entering scores" phase
  SUBMITTED: 5,
  COMPLETED: 6,
  REJECTED: 1, // Rejected returns to the feedback step
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Calculate remaining days from today to deadline */
function calcDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  const dl = new Date(deadline);
  const diff = dl.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Calculate % of time elapsed in the cycle */
function calcCycleProgress(startDate: string, endDate: string): number {
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (end <= start) return 0;
  const progress = ((now - start) / (end - start)) * 100;
  return Math.max(0, Math.min(100, progress));
}



/** Calculate data entry progress (item count per Objective) */
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
        
        // If it's a leaf node (no child items) -> count as 1 item to fill
        if (!item.items || item.items.length === 0) {
          totalItems++;
          const data = selfReportData?.[currentKey];
          // Has entered quantity > 0 OR has filled evidence -> considered as entered
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

/** Select the most important OKR (prioritized by status) */
function selectPrimaryOkr(okrs: UserOkrData[]): UserOkrData | null {
  if (!okrs || okrs.length === 0) return null;

  // Priority: ACCEPTED (needs self-report) > SUBMITTED (waiting) > PENDING > NEGOTIATING > COMPLETED
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
    // If same priority, pick the newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return sorted[0];
}

/** Generate action message based on OKR + Evaluation status */
function computeAction(
  okr: UserOkrData | null,
  evaluation: UserEvaluationData | null,
  t: any,
): {
  hasAction: boolean;
  message: string;
  route: string;
  label: string;
} {
  if (!okr) {
    return {
      hasAction: false,
      message: t("dashboard.actions.noOkr"),
      route: "/my-okr",
      label: t("dashboard.actions.viewOkr"),
    };
  }

  switch (okr.status) {
    case "PENDING":
      return {
        hasAction: true,
        message: t("dashboard.actions.pending.message"),
        route: "/my-okr",
        label: t("dashboard.actions.pending.label"),
      };
    case "NEGOTIATING":
      return {
        hasAction: true,
        message: t("dashboard.actions.negotiating.message"),
        route: "/my-okr",
        label: t("dashboard.actions.negotiating.label"),
      };
    case "ACCEPTED":
      return {
        hasAction: true,
        message: t("dashboard.actions.accepted.message"),
        route: "/my-okr",
        label: t("dashboard.actions.accepted.label"),
      };
    case "SUBMITTED":
      return {
        hasAction: false,
        message: t("dashboard.actions.submitted.message"),
        route: "/my-okr",
        label: t("dashboard.actions.submitted.label"),
      };
    case "COMPLETED": {
      // Check evaluation form
      if (evaluation) {
        if (evaluation.status === "EVALUATED") {
          return {
            hasAction: false,
            message: t("dashboard.actions.completed.evaluated.message"),
            route: "/my-evaluation",
            label: t("dashboard.actions.completed.evaluated.label"),
          };
        }
        if (evaluation.status === "SUBMITTED") {
          return {
            hasAction: false,
            message: t("dashboard.actions.completed.submitted.message"),
            route: "/my-evaluation",
            label: t("dashboard.actions.completed.submitted.label"),
          };
        }
        // PENDING_EVALUATION
        return {
          hasAction: true,
          message: t("dashboard.actions.completed.pendingEvaluation.message"),
          route: "/my-evaluation",
          label: t("dashboard.actions.completed.pendingEvaluation.label"),
        };
      }
      return {
        hasAction: false,
        message: t("dashboard.actions.completed.noEvaluation.message"),
        route: "/my-okr",
        label: t("dashboard.actions.completed.noEvaluation.label"),
      };
    }
    case "REJECTED":
      return {
        hasAction: true,
        message: t("dashboard.actions.rejected.message"),
        route: "/my-okr",
        label: t("dashboard.actions.rejected.label"),
      };
    default:
      return {
        hasAction: false,
        message: "",
        route: "/my-okr",
        label: t("dashboard.actions.viewOkr"),
      };
  }
}

// ============================================================
// HOOK
// ============================================================

export function useDashboardData(skip?: boolean) {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(skip ? false : true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (skip) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Call 3 APIs in parallel
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

      // Parse Cycles — find the OPEN cycle
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

      // Select primary OKR
      const primaryOkr = selectPrimaryOkr(allOkrs);

      // Compute values
      const currentStepIndex = primaryOkr
        ? STATUS_TO_STEP[primaryOkr.status] ?? 0
        : 0;

      let daysUntilDeadline: number | null = null;
      let deadlineState: "DEFAULT" | "SUBMITTED_EARLY" | "SUBMITTED_LATE" = "DEFAULT";
      
      if (primaryOkr) {
        if (["PENDING", "NEGOTIATING", "REJECTED"].includes(primaryOkr.status)) {
          daysUntilDeadline = calcDaysUntilDeadline(primaryOkr.deadline);
        } else {
          const cycleEnd = primaryOkr.cycle?.endDate || currentCycle?.endDate || null;
          if (["SUBMITTED", "COMPLETED"].includes(primaryOkr.status)) {
            const subDate = primaryOkr.updatedAt ? new Date(primaryOkr.updatedAt).getTime() : null;
            const endDate = cycleEnd ? new Date(cycleEnd).getTime() : null;
            if (subDate && endDate) {
              if (subDate <= endDate) {
                deadlineState = "SUBMITTED_EARLY";
                daysUntilDeadline = Math.floor((endDate - subDate) / (1000 * 60 * 60 * 24));
              } else {
                deadlineState = "SUBMITTED_LATE";
                daysUntilDeadline = null;
              }
            } else {
              daysUntilDeadline = calcDaysUntilDeadline(cycleEnd);
            }
          } else {
            daysUntilDeadline = calcDaysUntilDeadline(cycleEnd);
          }
        }
      }

      const cycleProgressPercent =
        currentCycle?.startDate && currentCycle?.endDate
          ? calcCycleProgress(currentCycle.startDate, currentCycle.endDate)
          : 0;

      const action = computeAction(primaryOkr, evaluation, t);

      const dataEntryProgress = primaryOkr
        ? computeDataEntryProgress(primaryOkr.keyResults, primaryOkr.selfReportData)
        : [];

      const getDeadlineLabel = (status: string) => {
        if (status === "PENDING" || status === "NEGOTIATING" || status === "REJECTED") {
          return t("dashboard.deadlineLabels.negotiating");
        }
        if (status === "ACCEPTED") {
          return t("dashboard.deadlineLabels.submitting");
        }
        return t("dashboard.deadlineLabels.default");
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
          deadlineState,
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
      setError(t("dashboard.defaultError"));
    } finally {
      setLoading(false);
    }
  }, [skip, t]);

  useEffect(() => {
    if (!skip) {
      fetchData();
    }
  }, [fetchData, skip]);

  return { data, loading, error, refetch: fetchData };
}
