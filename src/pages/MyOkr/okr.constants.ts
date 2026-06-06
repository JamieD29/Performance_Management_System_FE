export const statusConfig: Record<
  string,
  { labelKey: string; color: "warning" | "info" | "success" | "error" | "default" }
> = {
  PENDING: { labelKey: "okrCard.status.pending", color: "warning" },
  NEGOTIATING: { labelKey: "okrCard.status.negotiating", color: "info" },
  ACCEPTED: { labelKey: "okrCard.status.accepted", color: "success" },
  SUBMITTED: { labelKey: "okrCard.status.submitted", color: "info" },
  COMPLETED: { labelKey: "okrCard.status.completed", color: "success" },
  REJECTED: { labelKey: "okrCard.status.rejected", color: "error" },
};
