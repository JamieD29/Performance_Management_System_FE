import React from "react";
import { TableRow, TableCell, Box, IconButton } from "@mui/material";
import { Add, Undo, Edit, Comment, Check, Delete } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

// ----------------------------------------------------
// 1. Objective Row Component
// ----------------------------------------------------
interface ObjectiveRowProps {
  obj: any;
  isObjChanged: boolean;
  handleOpenAddDialog: (type: "KR" | "SUBKR", objId: string) => void;
  handleUndoItem: (type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR", objId: string) => void;
  handleOpenEditDialog: (
    type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR",
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string
  ) => void;
  activeChatId: string | null;
  setActiveChatId: (val: string | null) => void;
  proposedChanges: any;
  localComments: Record<string, any[]>;
}

export const OkrManagerObjectiveRow: React.FC<ObjectiveRowProps> = ({
  obj,
  isObjChanged,
  handleOpenAddDialog,
  handleUndoItem,
  handleOpenEditDialog,
  activeChatId,
  setActiveChatId,
  proposedChanges,
  localComments,
}) => {
  const { t } = useTranslation();

  return (
    <TableRow sx={{ bgcolor: isObjChanged ? "#fef08a" : "#dbeafe" }}>
      <TableCell sx={{ fontWeight: "bold" }}>{obj.id}</TableCell>
      <TableCell sx={{ fontWeight: "bold" }}>
        {isObjChanged ? t("departmentOkr.managerTree.proposedChanges.newPrefix") : ""}
        {obj.title}
      </TableCell>
      <TableCell sx={{ fontWeight: "bold" }}>{obj.maxScore}</TableCell>
      <TableCell></TableCell>
      <TableCell align="center">
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "center",
          }}
        >
          <IconButton
            size="small"
            onClick={() => handleOpenAddDialog("KR", obj.id)}
            title={t("departmentOkr.managerTree.buttons.addCriteria")}
          >
            <Add fontSize="small" color="success" />
          </IconButton>
          {isObjChanged && (
            <IconButton
              size="small"
              onClick={() => handleUndoItem("OBJ", obj.id)}
              title={t("departmentOkr.managerTree.buttons.undoChanges")}
            >
              <Undo fontSize="small" color="primary" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => handleOpenEditDialog("OBJ", obj.id)}
            title={t("departmentOkr.managerTree.buttons.edit")}
          >
            <Edit fontSize="small" color="info" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() =>
              setActiveChatId(activeChatId === obj.id ? null : obj.id)
            }
          >
            <Comment
              fontSize="small"
              color={
                proposedChanges?.[obj.id]?.length > 0 ||
                localComments[obj.id]?.length > 0
                  ? "warning"
                  : "inherit"
              }
            />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
};

// ----------------------------------------------------
// 2. Key Result Row Component
// ----------------------------------------------------
interface KeyResultRowProps {
  kr: any;
  objId: string;
  isKrChanged: boolean;
  isKrNew: boolean;
  handleOpenAddDialog: (type: "KR" | "SUBKR", objId: string, krId?: string) => void;
  handleAcceptItem: (
    type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR",
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string
  ) => void;
  handleUndoItem: (
    type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR",
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string
  ) => void;
  handleOpenEditDialog: (
    type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR",
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string
  ) => void;
  handleDeleteItem: (
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string
  ) => void;
  activeChatId: string | null;
  setActiveChatId: (val: string | null) => void;
  proposedChanges: any;
  localComments: Record<string, any[]>;
}

export const OkrManagerKeyResultRow: React.FC<KeyResultRowProps> = ({
  kr,
  objId,
  isKrChanged,
  isKrNew,
  handleOpenAddDialog,
  handleAcceptItem,
  handleUndoItem,
  handleOpenEditDialog,
  handleDeleteItem,
  activeChatId,
  setActiveChatId,
  proposedChanges,
  localComments,
}) => {
  const { t } = useTranslation();
  const highlight = isKrNew || isKrChanged || kr.isEdited;

  return (
    <TableRow
      sx={{
        bgcolor: highlight ? "#fef08a" : "#f8fafc",
      }}
    >
      <TableCell
        sx={{
          pl: 3,
          fontWeight: highlight ? "bold" : "normal",
        }}
      >
        {kr.id}
      </TableCell>
      <TableCell
        sx={{
          fontWeight: highlight ? "bold" : "normal",
        }}
      >
        {isKrChanged ? t("departmentOkr.managerTree.proposedChanges.newPrefix") : ""}
        {kr.title}
      </TableCell>
      <TableCell>{kr.maxScore}</TableCell>
      <TableCell>
        {kr.unitScore
          ? `+${kr.unitScore}/${kr.unit || t("departmentOkr.managerTree.proposedChanges.unitSuffix")}`
          : "—"}
      </TableCell>
      <TableCell align="center">
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "center",
          }}
        >
          <IconButton
            size="small"
            onClick={() => handleOpenAddDialog("SUBKR", objId, kr.id)}
            title={t("departmentOkr.managerTree.buttons.addSubCriteria")}
          >
            <Add fontSize="small" color="success" />
          </IconButton>
          {highlight && (
            <>
              <IconButton
                size="small"
                onClick={() => handleAcceptItem("KR", objId, kr.id)}
                title={t("departmentOkr.managerTree.buttons.acceptChanges")}
              >
                <Check fontSize="small" color="success" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleUndoItem("KR", objId, kr.id)}
                title={t("departmentOkr.managerTree.buttons.undoChanges")}
              >
                <Undo fontSize="small" color="primary" />
              </IconButton>
            </>
          )}
          <IconButton
            size="small"
            onClick={() => handleOpenEditDialog("KR", objId, kr.id)}
            title={t("departmentOkr.managerTree.buttons.edit")}
          >
            <Edit fontSize="small" color="info" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() =>
              setActiveChatId(activeChatId === kr.id ? null : kr.id)
            }
          >
            <Comment
              fontSize="small"
              color={
                proposedChanges?.[kr.id]?.length > 0 ||
                localComments[kr.id]?.length > 0
                  ? "warning"
                  : "inherit"
              }
            />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteItem(objId, kr.id)}
            title={t("departmentOkr.managerTree.buttons.deleteCriteria")}
          >
            <Delete fontSize="small" color="error" />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
};

// ----------------------------------------------------
// 3. Sub-KR Row Component
// ----------------------------------------------------
interface SubKRRowProps {
  sub: any;
  objId: string;
  krId: string;
  isSubChanged: boolean;
  isSubNew: boolean;
  handleOpenEditDialog: (
    type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR",
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string
  ) => void;
  handleAcceptItem: (
    type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR",
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string
  ) => void;
  handleUndoItem: (
    type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR",
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string
  ) => void;
  handleDeleteItem: (
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string
  ) => void;
  activeChatId: string | null;
  setActiveChatId: (val: string | null) => void;
  proposedChanges: any;
  localComments: Record<string, any[]>;
}

export const OkrManagerSubKeyResultRow: React.FC<SubKRRowProps> = ({
  sub,
  objId,
  krId,
  isSubChanged,
  isSubNew,
  handleOpenEditDialog,
  handleAcceptItem,
  handleUndoItem,
  handleDeleteItem,
  activeChatId,
  setActiveChatId,
  proposedChanges,
  localComments,
}) => {
  const { t } = useTranslation();
  const highlight = isSubNew || isSubChanged || sub.isEdited;

  return (
    <TableRow
      sx={{
        bgcolor: highlight ? "#fef08a" : "inherit",
      }}
    >
      <TableCell
        sx={{
          pl: 6,
          fontWeight: highlight ? "bold" : "normal",
        }}
      >
        {sub.id}
      </TableCell>
      <TableCell
        sx={{
          fontWeight: highlight ? "bold" : "normal",
        }}
      >
        {isSubChanged ? t("departmentOkr.managerTree.proposedChanges.newPrefix") : ""}
        {sub.title}
      </TableCell>
      <TableCell>{sub.maxScore}</TableCell>
      <TableCell>
        {sub.unitScore
          ? `+${sub.unitScore}/${sub.unit || t("departmentOkr.managerTree.proposedChanges.unitSuffix")}`
          : "—"}
      </TableCell>
      <TableCell align="center">
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "center",
          }}
        >
          <IconButton
            size="small"
            onClick={() => handleOpenEditDialog("SUBKR", objId, krId, sub.id)}
            title={t("departmentOkr.managerTree.buttons.edit")}
          >
            <Edit fontSize="small" color="info" />
          </IconButton>
          {highlight && (
            <>
              <IconButton
                size="small"
                onClick={() => handleAcceptItem("SUBKR", objId, krId, sub.id)}
                title={t("departmentOkr.managerTree.buttons.acceptChanges")}
              >
                <Check fontSize="small" color="success" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleUndoItem("SUBKR", objId, krId, sub.id)}
                title={t("departmentOkr.managerTree.buttons.undoChanges")}
              >
                <Undo fontSize="small" color="primary" />
              </IconButton>
            </>
          )}
          <IconButton
            size="small"
            onClick={() => setActiveChatId(activeChatId === sub.id ? null : sub.id)}
          >
            <Comment
              fontSize="small"
              color={
                proposedChanges?.[sub.id]?.length > 0 ||
                localComments[sub.id]?.length > 0
                  ? "warning"
                  : "inherit"
              }
            />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteItem(objId, krId, sub.id)}
            title={t("departmentOkr.managerTree.buttons.deleteSubCriteria")}
          >
            <Delete fontSize="small" color="error" />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
};

// ----------------------------------------------------
// 4. Sub-Sub-KR Row Component
// ----------------------------------------------------
interface SubSubKRRowProps {
  subsub: any;
  objId: string;
  krId: string;
  subId: string;
  isSubSubChanged: boolean;
  isSubSubNew: boolean;
  handleOpenEditDialog: (
    type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR",
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string
  ) => void;
  handleAcceptItem: (
    type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR",
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string
  ) => void;
  handleUndoItem: (
    type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR",
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string
  ) => void;
  handleDeleteItem: (
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string
  ) => void;
  activeChatId: string | null;
  setActiveChatId: (val: string | null) => void;
  proposedChanges: any;
  localComments: Record<string, any[]>;
}

export const OkrManagerSubSubKeyResultRow: React.FC<SubSubKRRowProps> = ({
  subsub,
  objId,
  krId,
  subId,
  isSubSubChanged,
  isSubSubNew,
  handleOpenEditDialog,
  handleAcceptItem,
  handleUndoItem,
  handleDeleteItem,
  activeChatId,
  setActiveChatId,
  proposedChanges,
  localComments,
}) => {
  const { t } = useTranslation();
  const highlight = isSubSubNew || isSubSubChanged || subsub.isEdited;

  return (
    <TableRow
      sx={{
        bgcolor: highlight ? "#fef08a" : "#fffbeb",
      }}
    >
      <TableCell
        sx={{
          pl: 9,
          fontSize: "0.8rem",
          fontWeight: highlight ? "bold" : "normal",
        }}
      >
        {subsub.id}
      </TableCell>
      <TableCell
        sx={{
          fontSize: "0.85rem",
          fontWeight: highlight ? "bold" : "normal",
        }}
      >
        {isSubSubChanged ? t("departmentOkr.managerTree.proposedChanges.newPrefix") : ""}
        {subsub.title}
      </TableCell>
      <TableCell sx={{ fontWeight: highlight ? "bold" : "normal" }}>—</TableCell>
      <TableCell>
        {subsub.unitScore
          ? `+${subsub.unitScore}/${subsub.unit || t("departmentOkr.managerTree.proposedChanges.unitSuffix")}`
          : "—"}
      </TableCell>
      <TableCell align="center">
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "center",
          }}
        >
          <IconButton
            size="small"
            onClick={() => handleOpenEditDialog("SUBSUBKR", objId, krId, subId, subsub.id)}
            title={t("departmentOkr.managerTree.buttons.edit")}
          >
            <Edit fontSize="small" color="info" />
          </IconButton>
          {highlight && (
            <>
              <IconButton
                size="small"
                onClick={() => handleAcceptItem("SUBSUBKR", objId, krId, subId, subsub.id)}
                title={t("departmentOkr.managerTree.buttons.acceptChanges")}
              >
                <Check fontSize="small" color="success" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleUndoItem("SUBSUBKR", objId, krId, subId, subsub.id)}
                title={t("departmentOkr.managerTree.buttons.undoChanges")}
              >
                <Undo fontSize="small" color="primary" />
              </IconButton>
            </>
          )}
          <IconButton
            size="small"
            onClick={() => setActiveChatId(activeChatId === subsub.id ? null : subsub.id)}
          >
            <Comment
              fontSize="small"
              color={
                proposedChanges?.[subsub.id]?.length > 0 ||
                localComments[subsub.id]?.length > 0
                  ? "warning"
                  : "inherit"
              }
            />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteItem(objId, krId, subId, subsub.id)}
            title={t("departmentOkr.managerTree.buttons.deleteSubCriteria")}
          >
            <Delete fontSize="small" color="error" />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
};
