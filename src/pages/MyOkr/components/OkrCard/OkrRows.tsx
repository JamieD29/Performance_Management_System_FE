import React from "react";
import { useTranslation } from "react-i18next";
import { TableRow, TableCell, Chip, TextField, IconButton, Box } from "@mui/material";
import { Add, Undo, Edit, Comment, Delete } from "@mui/icons-material";
import { OkrOldRow } from "./OkrOldRow";
import NegotiationChat from "../NegotiationChat";

interface SharedProps {
  okr: any;
  reportData: Record<string, any>;
  localComments: Record<string, any[]>;
  originalStructure: any[] | null;
  activeChatId: string | null;
  chatMessage: string;
  chatLoading: boolean;
  canReport: boolean;
  isSubmitted: boolean;
  isCompleted: boolean;
  isPending: boolean;
  setActiveChatId: (val: string | null) => void;
  setChatMessage: (val: string) => void;
  handleSendChat: (itemId: string) => Promise<void>;
  handleOpenAddDialog: (type: "KR" | "SUBKR", objId: string, krId?: string) => void;
  handleOpenEditDialog: (type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR", objId: string, krId?: string, subId?: string, subsubId?: string) => void;
  handleUndoItem: (type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR", objId: string, krId?: string, subId?: string, subsubId?: string) => void;
  handleDeleteItem: (objId: string, krId?: string, subId?: string, subsubId?: string) => void;
  updateReport: (krId: string, field: "quantity" | "evidence", value: any, maxScore?: number, unitScore?: number) => void;
  findOriginalItem: (objId: string, krId?: string, subId?: string, subsubId?: string) => any;
  hasChanged: (newItem: any, oldItem: any) => boolean;
  t: (key: string, options?: any) => string;
}

interface ObjectiveRowProps extends SharedProps {
  obj: any;
  oIndex: number;
  calcObjectiveReportQty: (obj: any) => number;
  calcObjectiveReportScore: (obj: any) => number;
  calcObjectiveSubmittedQty: (obj: any) => number;
  calcObjectiveScore: (obj: any) => number;
  calcObjectiveManagerQty: (obj: any) => number;
  calcObjectiveManagerScore: (obj: any) => number;
}

export const OkrObjectiveRow: React.FC<ObjectiveRowProps> = ({
  obj,
  okr,
  localComments,
  activeChatId,
  chatMessage,
  chatLoading,
  canReport,
  isSubmitted,
  isCompleted,
  isPending,
  setActiveChatId,
  setChatMessage,
  handleSendChat,
  handleOpenAddDialog,
  handleOpenEditDialog,
  handleUndoItem,
  findOriginalItem,
  hasChanged,
  calcObjectiveReportQty,
  calcObjectiveReportScore,
  calcObjectiveSubmittedQty,
  calcObjectiveScore,
  calcObjectiveManagerQty,
  calcObjectiveManagerScore,
}) => {
  const { t } = useTranslation();
  const oldObj = findOriginalItem(obj.id);
  const isObjChanged = hasChanged(obj, oldObj);

  return (
    <React.Fragment>
      {isObjChanged && (
        <OkrOldRow
          oldItem={oldObj}
          indent={2}
          status={okr.status}
          canReport={canReport}
        />
      )}
      <TableRow sx={{ bgcolor: isObjChanged ? "#fef08a" : "#dbeafe" }}>
        <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
          {obj.id}
        </TableCell>
        <TableCell sx={{ fontWeight: "bold" }}>
          {isObjChanged ? `[${t("okrCard.new")}] ` : ""}
          {obj.title}
        </TableCell>
        <TableCell sx={{ fontWeight: "bold" }}>
          {obj.maxScore}
        </TableCell>
        <TableCell></TableCell>
        {canReport && (
          <>
            <TableCell
              align="center"
              sx={{
                fontWeight: "bold",
                color: "#1e3a8a",
              }}
            >
              {calcObjectiveReportQty(obj)}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: "bold",
                color: "#1e3a8a",
              }}
            >
              {calcObjectiveReportScore(obj)} / {obj.maxScore || 0}
            </TableCell>
            <TableCell align="center">—</TableCell>
          </>
        )}
        {(isSubmitted || isCompleted) && (
          <>
            <TableCell
              align="center"
              sx={{
                fontWeight: "bold",
                color: "#475569",
              }}
            >
              {calcObjectiveSubmittedQty(obj)}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: "bold",
                color: "#475569",
              }}
            >
              {calcObjectiveScore(obj)} / {obj.maxScore || 0}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: "bold",
                color: "#15803d",
              }}
            >
              {okr.status === "COMPLETED" ? (
                calcObjectiveManagerQty(obj)
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: "bold",
                color: "#15803d",
              }}
            >
              {okr.status === "COMPLETED" ? (
                `${calcObjectiveManagerScore(obj)} / ${obj.maxScore || 0}`
              ) : (
                "—"
              )}
            </TableCell>
          </>
        )}
        {(isPending || okr.status === "NEGOTIATING") && (
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
                title={t("okrCard.tooltips.addCriteria")}
              >
                <Add fontSize="small" color="success" />
              </IconButton>
              {isObjChanged && (
                <IconButton
                  size="small"
                  onClick={() => handleUndoItem("OBJ", obj.id)}
                  title={t("okrCard.tooltips.undoChanges")}
                >
                  <Undo fontSize="small" color="primary" />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={() => handleOpenEditDialog("OBJ", obj.id)}
                title={t("okrCard.tooltips.edit")}
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
                    okr.proposedChanges?.[obj.id]?.length > 0 ||
                    localComments[obj.id]?.length > 0
                      ? "primary"
                      : "inherit"
                  }
                />
              </IconButton>
            </Box>
          </TableCell>
        )}
      </TableRow>
      <NegotiationChat
        itemId={obj.id}
        activeChatId={activeChatId}
        history={[
          ...(okr.proposedChanges?.[obj.id] || []),
          ...(localComments[obj.id] || []),
        ]}
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        onSend={handleSendChat}
        loading={chatLoading}
        colSpan={11}
        status={okr.status}
      />
    </React.Fragment>
  );
};

interface KeyResultRowProps extends SharedProps {
  kr: any;
  obj: any;
  kIndex: number;
  getManagerData: (key: string, kr: any) => any;
}

export const OkrKeyResultRow: React.FC<KeyResultRowProps> = ({
  kr,
  obj,
  okr,
  reportData,
  localComments,
  originalStructure,
  activeChatId,
  chatMessage,
  chatLoading,
  canReport,
  isSubmitted,
  isCompleted,
  isPending,
  setActiveChatId,
  setChatMessage,
  handleSendChat,
  handleOpenAddDialog,
  handleOpenEditDialog,
  handleUndoItem,
  handleDeleteItem,
  updateReport,
  findOriginalItem,
  hasChanged,
  getManagerData,
}) => {
  const { t } = useTranslation();
  const krKey = `${obj.id}-${kr.id}`;
  const krQty = reportData[krKey]?.quantity || 0;
  const krUnitScore = Number(kr.unitScore) || 0;
  const krCalcScore = krUnitScore > 0 ? krQty * krUnitScore : krQty;
  const existingReport = okr.selfReportData?.[krKey];
  const oldKr = findOriginalItem(obj.id, kr.id);
  const isKrChanged = hasChanged(kr, oldKr);
  const isKrNew = originalStructure ? !oldKr : false;

  return (
    <React.Fragment>
      {isKrChanged && (
        <OkrOldRow
          oldItem={oldKr}
          indent={3}
          status={okr.status}
          canReport={canReport}
        />
      )}
      <TableRow
        sx={{
          bgcolor: isKrNew || isKrChanged || kr.isEdited ? "#fef08a" : "#f8fafc",
        }}
      >
        <TableCell
          sx={{
            pl: 3,
            fontWeight: isKrNew || isKrChanged || kr.isEdited ? "bold" : "normal",
          }}
        >
          {kr.id}
        </TableCell>
        <TableCell
          sx={{
            fontWeight: isKrNew || isKrChanged || kr.isEdited ? "bold" : "normal",
          }}
        >
          {isKrChanged ? `[${t("okrCard.new")}] ` : ""}
          {kr.title}
        </TableCell>
        <TableCell
          sx={{
            fontWeight: isKrNew || isKrChanged || kr.isEdited ? "bold" : "normal",
          }}
        >
          {kr.maxScore || "—"}
        </TableCell>
        <TableCell>
          {kr.unitScore ? (
            <Chip
              label={`+${kr.unitScore}/${kr.unit || t("okrCard.unit")}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          ) : (
            "—"
          )}
        </TableCell>
        {canReport && (
          <>
            <TableCell>
              {Number(kr.unitScore) > 0 ? (
                <TextField
                  size="small"
                  type="number"
                  value={krQty || ""}
                  onChange={(e) =>
                    updateReport(
                      krKey,
                      "quantity",
                      e.target.value,
                      Number(kr.maxScore) || undefined,
                      Number(kr.unitScore) || undefined
                    )
                  }
                  onKeyDown={(e) => {
                    if (["-", ".", "e", "E", "+", ","].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  inputProps={{
                    min: 0,
                    style: { textAlign: "center" },
                  }}
                  sx={{ width: 80 }}
                />
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#2563eb",
              }}
            >
              {Number(kr.unitScore) > 0
                ? Math.min(
                    krCalcScore,
                    Number(kr.maxScore) || Number(kr.unitScore) || Infinity
                  ).toFixed(1)
                : "—"}
            </TableCell>
            <TableCell>
              {Number(kr.unitScore) > 0 ? (
                <TextField
                  size="small"
                  fullWidth
                  placeholder={t("okrCard.placeholders.evidenceLink")}
                  value={reportData[krKey]?.evidence || ""}
                  onChange={(e) => updateReport(krKey, "evidence", e.target.value)}
                />
              ) : (
                "—"
              )}
            </TableCell>
          </>
        )}
        {(isSubmitted || isCompleted) && (
          <>
            <TableCell align="center">
              {existingReport?.quantity || 0}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: "bold",
                color: "#2563eb",
              }}
            >
              {existingReport?.score || 0}
            </TableCell>
            <TableCell align="center">
              {okr.status === "COMPLETED" ? (
                getManagerData(krKey, kr).quantity
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: "bold",
                color: "#16a34a",
              }}
            >
              {okr.status === "COMPLETED" ? (
                getManagerData(krKey, kr).score.toFixed(1)
              ) : (
                "—"
              )}
            </TableCell>
          </>
        )}
        {(isPending || okr.status === "NEGOTIATING") && (
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
                onClick={() => handleOpenAddDialog("SUBKR", obj.id, kr.id)}
                title={t("okrCard.tooltips.addSubCriteria")}
              >
                <Add fontSize="small" color="success" />
              </IconButton>
              {isKrChanged && (
                <IconButton
                  size="small"
                  onClick={() => handleUndoItem("KR", obj.id, kr.id)}
                  title={t("okrCard.tooltips.undoChanges")}
                >
                  <Undo fontSize="small" color="primary" />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={() => handleOpenEditDialog("KR", obj.id, kr.id)}
                title={t("okrCard.tooltips.edit")}
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
                    okr.proposedChanges?.[kr.id]?.length > 0 ||
                    localComments[kr.id]?.length > 0
                      ? "primary"
                      : "inherit"
                  }
                />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDeleteItem(obj.id, kr.id)}
                title={t("okrCard.tooltips.deleteCriteria")}
              >
                <Delete fontSize="small" color="error" />
              </IconButton>
            </Box>
          </TableCell>
        )}
      </TableRow>
      <NegotiationChat
        itemId={kr.id}
        activeChatId={activeChatId}
        history={[
          ...(okr.proposedChanges?.[kr.id] || []),
          ...(localComments[kr.id] || []),
        ]}
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        onSend={handleSendChat}
        loading={chatLoading}
        colSpan={11}
        status={okr.status}
      />
    </React.Fragment>
  );
};

interface SubKeyResultRowProps extends SharedProps {
  sub: any;
  kr: any;
  obj: any;
  sIndex: number;
  getManagerData: (key: string, sub: any) => any;
}

export const OkrSubKeyResultRow: React.FC<SubKeyResultRowProps> = ({
  sub,
  kr,
  obj,
  okr,
  reportData,
  localComments,
  originalStructure,
  activeChatId,
  chatMessage,
  chatLoading,
  canReport,
  isSubmitted,
  isCompleted,
  isPending,
  setActiveChatId,
  setChatMessage,
  handleSendChat,
  handleOpenEditDialog,
  handleUndoItem,
  handleDeleteItem,
  updateReport,
  findOriginalItem,
  hasChanged,
  getManagerData,
}) => {
  const { t } = useTranslation();
  const subKey = `${obj.id}-${kr.id}-${sub.id}`;
  const subQty = reportData[subKey]?.quantity || 0;
  const subUnitScore = Number(sub.unitScore) || 0;
  const subCalcScore = subUnitScore > 0 ? subQty * subUnitScore : subQty;
  const existingSub = okr.selfReportData?.[subKey];
  const oldSub = findOriginalItem(obj.id, kr.id, sub.id);
  const isSubChanged = hasChanged(sub, oldSub);
  const isSubNew = originalStructure ? !oldSub : false;

  return (
    <React.Fragment>
      {isSubChanged && (
        <OkrOldRow
          oldItem={oldSub}
          indent={6}
          status={okr.status}
          canReport={canReport}
        />
      )}
      <TableRow
        sx={{
          bgcolor: isSubNew || isSubChanged || sub.isEdited ? "#fef08a" : "inherit",
        }}
      >
        <TableCell
          sx={{
            pl: 6,
            fontSize: "0.85rem",
            fontWeight: isSubNew || isSubChanged || sub.isEdited ? "bold" : "normal",
          }}
        >
          {sub.id}
        </TableCell>
        <TableCell
          sx={{
            fontSize: "0.9rem",
            fontWeight: isSubNew || isSubChanged || sub.isEdited ? "bold" : "normal",
          }}
        >
          {isSubChanged ? `[${t("okrCard.new")}] ` : ""}
          {sub.title}
        </TableCell>
        <TableCell
          sx={{
            fontWeight: isSubNew || isSubChanged || sub.isEdited ? "bold" : "normal",
          }}
        >
          {sub.maxScore || "—"}
        </TableCell>
        <TableCell>
          {sub.unitScore ? (
            <Chip
              label={`+${sub.unitScore}/${sub.unit || t("okrCard.unit")}`}
              size="small"
              variant="outlined"
            />
          ) : (
            "—"
          )}
        </TableCell>
        {canReport && (
          <>
            <TableCell>
              {Number(sub.unitScore) > 0 ? (
                <TextField
                  size="small"
                  type="number"
                  value={subQty || ""}
                  onChange={(e) =>
                    updateReport(
                      subKey,
                      "quantity",
                      e.target.value,
                      Number(sub.maxScore) || undefined,
                      Number(sub.unitScore) || undefined
                    )
                  }
                  onKeyDown={(e) => {
                    if (["-", ".", "e", "E", "+", ","].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  inputProps={{
                    min: 0,
                    style: { textAlign: "center" },
                  }}
                  sx={{ width: 80 }}
                />
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#2563eb",
              }}
            >
              {Number(sub.unitScore) > 0
                ? Math.min(
                    subCalcScore,
                    Number(sub.maxScore) || Number(sub.unitScore) || Infinity
                  ).toFixed(1)
                : "—"}
            </TableCell>
            <TableCell>
              {Number(sub.unitScore) > 0 ? (
                <TextField
                  size="small"
                  fullWidth
                  placeholder={t("okrCard.placeholders.link")}
                  value={reportData[subKey]?.evidence || ""}
                  onChange={(e) => updateReport(subKey, "evidence", e.target.value)}
                />
              ) : (
                "—"
              )}
            </TableCell>
          </>
        )}
        {(isSubmitted || isCompleted) && (
          <>
            <TableCell align="center">
              {existingSub?.quantity || 0}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: "bold",
                color: "#2563eb",
              }}
            >
              {existingSub?.score || 0}
            </TableCell>
            <TableCell align="center">
              {okr.status === "COMPLETED" ? (
                getManagerData(subKey, sub).quantity
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: "bold",
                color: "#16a34a",
              }}
            >
              {okr.status === "COMPLETED" ? (
                getManagerData(subKey, sub).score.toFixed(1)
              ) : (
                "—"
              )}
            </TableCell>
          </>
        )}
        {(isPending || okr.status === "NEGOTIATING") && (
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
                onClick={() => handleOpenEditDialog("SUBKR", obj.id, kr.id, sub.id)}
                title={t("okrCard.tooltips.edit")}
              >
                <Edit fontSize="small" color="info" />
              </IconButton>
              {isSubChanged && (
                <IconButton
                  size="small"
                  onClick={() => handleUndoItem("SUBKR", obj.id, kr.id, sub.id)}
                  title={t("okrCard.tooltips.undoChanges")}
                >
                  <Undo fontSize="small" color="primary" />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={() =>
                  setActiveChatId(activeChatId === sub.id ? null : sub.id)
                }
              >
                <Comment
                  fontSize="small"
                  color={
                    okr.proposedChanges?.[sub.id]?.length > 0 ||
                    localComments[sub.id]?.length > 0
                      ? "primary"
                      : "inherit"
                  }
                />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDeleteItem(obj.id, kr.id, sub.id)}
                title={t("okrCard.tooltips.deleteSubCriteria")}
              >
                <Delete fontSize="small" color="error" />
              </IconButton>
            </Box>
          </TableCell>
        )}
      </TableRow>
      <NegotiationChat
        itemId={sub.id}
        activeChatId={activeChatId}
        history={[
          ...(okr.proposedChanges?.[sub.id] || []),
          ...(localComments[sub.id] || []),
        ]}
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        onSend={handleSendChat}
        loading={chatLoading}
        colSpan={11}
        status={okr.status}
      />
    </React.Fragment>
  );
};

interface SubSubKeyResultRowProps extends SharedProps {
  subsub: any;
  sub: any;
  kr: any;
  obj: any;
  ssIndex: number;
  getManagerData: (key: string, subsub: any) => any;
}

export const OkrSubSubKeyResultRow: React.FC<SubSubKeyResultRowProps> = ({
  subsub,
  sub,
  kr,
  obj,
  okr,
  reportData,
  localComments,
  originalStructure,
  activeChatId,
  chatMessage,
  chatLoading,
  canReport,
  isSubmitted,
  isCompleted,
  isPending,
  setActiveChatId,
  setChatMessage,
  handleSendChat,
  handleOpenEditDialog,
  handleUndoItem,
  handleDeleteItem,
  updateReport,
  findOriginalItem,
  hasChanged,
  getManagerData,
}) => {
  const { t } = useTranslation();
  const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
  const subsubQty = reportData[subsubKey]?.quantity || 0;
  const subsubUnitScore = Number(subsub.unitScore) || 0;
  const subsubCalcScore = subsubUnitScore > 0 ? subsubQty * subsubUnitScore : subsubQty;
  const existingSubSub = okr.selfReportData?.[subsubKey];
  const oldSubSub = findOriginalItem(obj.id, kr.id, sub.id, subsub.id);
  const isSubSubChanged = hasChanged(subsub, oldSubSub);
  const isSubSubNew = originalStructure ? !oldSubSub : false;

  return (
    <React.Fragment>
      {isSubSubChanged && (
        <OkrOldRow
          oldItem={oldSubSub}
          indent={9}
          status={okr.status}
          canReport={canReport}
        />
      )}
      <TableRow
        sx={{
          bgcolor:
            isSubSubNew || isSubSubChanged || subsub.isEdited
              ? "#fef08a"
              : "#fffbeb",
        }}
      >
        <TableCell
          sx={{
            pl: 9,
            fontSize: "0.8rem",
            fontWeight: isSubSubNew || isSubSubChanged || subsub.isEdited ? "bold" : "normal",
          }}
        >
          {subsub.id}
        </TableCell>
        <TableCell
          sx={{
            fontSize: "0.85rem",
            fontWeight: isSubSubNew || isSubSubChanged || subsub.isEdited ? "bold" : "normal",
          }}
        >
          {isSubSubChanged ? `[${t("okrCard.new")}] ` : ""}
          {subsub.title}
        </TableCell>
        <TableCell
          sx={{
            fontWeight: isSubSubNew || isSubSubChanged || subsub.isEdited ? "bold" : "normal",
          }}
        >
          —
        </TableCell>
        <TableCell>
          {subsub.unitScore ? (
            <Chip
              label={`+${subsub.unitScore}/${subsub.unit || t("okrCard.unit")}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.75rem" }}
            />
          ) : (
            "—"
          )}
        </TableCell>
        {canReport && (
          <>
            <TableCell>
              {Number(subsub.unitScore) > 0 ? (
                <TextField
                  size="small"
                  type="number"
                  value={subsubQty || ""}
                  onChange={(e) =>
                    updateReport(
                      subsubKey,
                      "quantity",
                      e.target.value,
                      undefined,
                      Number(subsub.unitScore) || undefined
                    )
                  }
                  onKeyDown={(e) => {
                    if (["-", ".", "e", "E", "+", ","].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  inputProps={{
                    min: 0,
                    style: { textAlign: "center" },
                  }}
                  sx={{ width: 80 }}
                />
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#2563eb",
              }}
            >
              {Number(subsub.unitScore) > 0
                ? Math.min(subsubCalcScore, Number(subsub.unitScore) || Infinity).toFixed(1)
                : "—"}
            </TableCell>
            <TableCell>
              {Number(subsub.unitScore) > 0 ? (
                <TextField
                  size="small"
                  fullWidth
                  placeholder={t("okrCard.placeholders.link")}
                  value={reportData[subsubKey]?.evidence || ""}
                  onChange={(e) => updateReport(subsubKey, "evidence", e.target.value)}
                />
              ) : (
                "—"
              )}
            </TableCell>
          </>
        )}
        {(isSubmitted || isCompleted) && (
          <>
            <TableCell align="center">
              {existingSubSub?.quantity || 0}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: "bold",
                color: "#2563eb",
              }}
            >
              {existingSubSub?.score || 0}
            </TableCell>
            <TableCell align="center">
              {okr.status === "COMPLETED" ? (
                getManagerData(subsubKey, subsub).quantity
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: "bold",
                color: "#16a34a",
              }}
            >
              {okr.status === "COMPLETED" ? (
                getManagerData(subsubKey, subsub).score.toFixed(1)
              ) : (
                "—"
              )}
            </TableCell>
          </>
        )}
        {(isPending || okr.status === "NEGOTIATING") && (
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
                onClick={() =>
                  handleOpenEditDialog(
                    "SUBSUBKR",
                    obj.id,
                    kr.id,
                    sub.id,
                    subsub.id
                  )
                }
                title={t("okrCard.tooltips.edit")}
              >
                <Edit fontSize="small" color="info" />
              </IconButton>
              {isSubSubChanged && (
                <IconButton
                  size="small"
                  onClick={() =>
                    handleUndoItem("SUBSUBKR", obj.id, kr.id, sub.id, subsub.id)
                  }
                  title={t("okrCard.tooltips.undoChanges")}
                >
                  <Undo fontSize="small" color="primary" />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={() =>
                  setActiveChatId(activeChatId === subsub.id ? null : subsub.id)
                }
              >
                <Comment
                  fontSize="small"
                  color={
                    okr.proposedChanges?.[subsub.id]?.length > 0 ||
                    localComments[subsub.id]?.length > 0
                      ? "primary"
                      : "inherit"
                  }
                />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDeleteItem(obj.id, kr.id, sub.id, subsub.id)}
                title={t("okrCard.tooltips.deleteSubCriteria")}
              >
                <Delete fontSize="small" color="error" />
              </IconButton>
            </Box>
          </TableCell>
        )}
      </TableRow>
      <NegotiationChat
        itemId={subsub.id}
        activeChatId={activeChatId}
        history={[
          ...(okr.proposedChanges?.[subsub.id] || []),
          ...(localComments[subsub.id] || []),
        ]}
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        onSend={handleSendChat}
        loading={chatLoading}
        colSpan={11}
        status={okr.status}
      />
    </React.Fragment>
  );
};
