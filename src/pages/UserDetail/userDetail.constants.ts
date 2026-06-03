export const OKR_STATUS_MAP: Record<string, { labelKey: string; color: string; bgcolor: string }> = {
  PENDING: { labelKey: "userDetail.status.pending", color: "#d97706", bgcolor: "#fef3c7" },
  NEGOTIATING: { labelKey: "userDetail.status.negotiating", color: "#2563eb", bgcolor: "#dbeafe" },
  ACCEPTED: { labelKey: "userDetail.status.accepted", color: "#059669", bgcolor: "#d1fae5" },
  REJECTED: { labelKey: "userDetail.status.rejected", color: "#dc2626", bgcolor: "#fee2e2" },
  SUBMITTED: { labelKey: "userDetail.status.submitted", color: "#7c3aed", bgcolor: "#ede9fe" },
  COMPLETED: { labelKey: "userDetail.status.completed", color: "#0f766e", bgcolor: "#ccfbf1" },
};

export const EVALUATION_STATUS_MAP: Record<string, { labelKey: string; color: string; bgcolor: string }> = {
  DRAFT: { labelKey: "userDetail.status.draft", color: "#64748b", bgcolor: "#f1f5f9" },
  SUBMITTED: { labelKey: "userDetail.status.waitingManager", color: "#d97706", bgcolor: "#fef3c7" },
  EVALUATED: { labelKey: "userDetail.status.managerEvaluated", color: "#059669", bgcolor: "#d1fae5" },
  APPROVED: { labelKey: "userDetail.status.finalized", color: "#0f766e", bgcolor: "#ccfbf1" },
};

export const RATING_LABELS: Record<string, string> = {
  A: "userDetail.rating.A",
  B: "userDetail.rating.B",
  C: "userDetail.rating.C",
  D: "userDetail.rating.D",
};

