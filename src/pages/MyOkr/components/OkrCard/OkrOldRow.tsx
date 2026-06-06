import React from "react";
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
        [Cũ] {oldItem.title}
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
          ? `+${oldItem.unitScore}/${oldItem.unit || "đv"}`
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
