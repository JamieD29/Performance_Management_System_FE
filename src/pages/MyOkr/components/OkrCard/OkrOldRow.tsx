import React from "react";
import { useTranslation } from "react-i18next";
import { TableRow, TableCell } from "@mui/material";

interface OkrOldRowProps {
  oldItem: any;
  indent: number;
  status: string;
  canReport: boolean;
}

export const OkrOldRow: React.FC<OkrOldRowProps> = ({
  oldItem,
  indent,
  status,
  canReport,
}) => {
  const { t } = useTranslation();
  if (!oldItem || !(status === "PENDING" || status === "NEGOTIATING")) {
    return null;
  }

  return (
    <TableRow sx={{ bgcolor: "#f1f5f9", opacity: 0.7 }}>
      <TableCell
        sx={{
          pl: indent,
          textDecoration: "line-through",
          color: "text.secondary",
          fontSize: "1rem",
        }}
      >
        {oldItem.id}
      </TableCell>
      <TableCell
        sx={{ textDecoration: "line-through", color: "text.secondary" }}
      >
        [${t("okrCard.old")}] {oldItem.title}
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
          ? `+${oldItem.unitScore}/${oldItem.unit || t("okrCard.unit")}`
          : "—"}
      </TableCell>
      {canReport && (
        <>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </>
      )}
      <TableCell align="center"></TableCell>
    </TableRow>
  );
};
