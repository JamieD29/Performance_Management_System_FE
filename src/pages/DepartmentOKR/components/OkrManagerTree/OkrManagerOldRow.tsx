import React from "react";
import { TableRow, TableCell } from "@mui/material";
import { useTranslation } from "react-i18next";

interface OkrManagerOldRowProps {
  oldItem: any;
  indent: number;
}

export const OkrManagerOldRow: React.FC<OkrManagerOldRowProps> = ({ oldItem, indent }) => {
  const { t } = useTranslation();

  if (!oldItem) return null;

  return (
    <TableRow sx={{ bgcolor: "#f1f5f9", opacity: 0.7 }}>
      <TableCell
        sx={{
          pl: indent,
          textDecoration: "line-through",
          color: "text.secondary",
        }}
      >
        {oldItem.id}
      </TableCell>
      <TableCell
        sx={{ textDecoration: "line-through", color: "text.secondary" }}
      >
        {t("departmentOkr.managerTree.proposedChanges.oldPrefix")}{oldItem.title}
      </TableCell>
      <TableCell
        sx={{ textDecoration: "line-through", color: "text.secondary" }}
      >
        {oldItem.maxScore || "—"}
      </TableCell>
      <TableCell
        sx={{ textDecoration: "line-through", color: "text.secondary" }}
      >
        {oldItem.unitScore
          ? `+${oldItem.unitScore}/${oldItem.unit || t("departmentOkr.managerTree.proposedChanges.unitSuffix")}`
          : "—"}
      </TableCell>
      <TableCell align="center"></TableCell>
    </TableRow>
  );
};
