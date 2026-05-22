import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Alert,
  IconButton,
  LinearProgress,
  TextField,
  DialogActions,
} from "@mui/material";
import {
  Check,
  ExpandMore,
  ExpandLess,
  Comment,
  Send,
  Save,
  Add,
  Close,
  Delete,
  Edit,
  Undo,
  Launch,
  Forum,
} from "@mui/icons-material";
import { api } from "../../../services/api";
import { confirmAction, showSuccess, showError } from "../../../utils/swal";
import { statusConfig } from "../okr.constants";
import NegotiationChat from "./NegotiationChat";
import AddCriteriaDialog from "./AddCriteriaDialog";

interface OkrCardProps {
  okr: any;
  onRefresh: () => void;
}

const OkrCard: React.FC<OkrCardProps> = ({ okr, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Self-report state
  const [reportData, setReportData] = useState<
    Record<string, { quantity: number; evidence: string }>
  >({});
  const [saving, setSaving] = useState(false);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [draftSaveStatus, setDraftSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");

  // Add KR/SubKR State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addParentType, setAddParentType] = useState<"KR" | "SUBKR" | null>(
    null,
  );
  const [addObjectiveId, setAddObjectiveId] = useState<string | null>(null);
  const [addKrId, setAddKrId] = useState<string | null>(null);
  const [newCriteriaTitle, setNewCriteriaTitle] = useState("");
  const [newCriteriaUnitScore, setNewCriteriaUnitScore] = useState("");
  const [newCriteriaUnit, setNewCriteriaUnit] = useState("");

  const [localStructure, setLocalStructure] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [localComments, setLocalComments] = useState<Record<string, any[]>>({});

  // Edit Criteria State
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editItemInfo, setEditItemInfo] = useState<{
    type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR";
    objId: string;
    krId?: string;
    subId?: string;
    subsubId?: string;
  } | null>(null);
  const [editCriteriaTitle, setEditCriteriaTitle] = useState("");
  const [editCriteriaMaxScore, setEditCriteriaMaxScore] = useState("");
  const [editCriteriaUnitScore, setEditCriteriaUnitScore] = useState("");
  const [editCriteriaUnit, setEditCriteriaUnit] = useState("");

  // Diff Logic
  const originalStructure = okr.proposedChanges?.originalStructure || null;

  const findOriginalItem = (
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string,
  ) => {
    if (!originalStructure) return null;

    // Tìm Objective
    const obj = originalStructure.find(
      (o: any) => String(o.id) === String(objId),
    );
    if (!obj) return null;

    if (krId === undefined) {
      return obj;
    }

    // Tìm KR
    const kr = obj.items?.find((k: any) => String(k.id) === String(krId));
    if (!kr) return null;

    if (subId === undefined) {
      return kr;
    }

    // Tìm Sub-KR
    const sub = kr.items?.find((s: any) => String(s.id) === String(subId));
    if (!sub || subsubId === undefined) {
      return sub || null;
    }

    // Tìm Sub-Sub-KR
    const subsub = sub.items?.find(
      (ss: any) => String(ss.id) === String(subsubId),
    );
    return subsub || null;
  };

  const hasChanged = (newItem: any, oldItem: any) => {
    if (!oldItem) return false;
    return (
      String(newItem.title || "").trim() !==
      String(oldItem.title || "").trim() ||
      Number(newItem.maxScore || 0) !== Number(oldItem.maxScore || 0) ||
      Number(newItem.unitScore || 0) !== Number(oldItem.unitScore || 0) ||
      String(newItem.unit || "").trim() !== String(oldItem.unit || "").trim()
    );
  };

  const renderOldRow = (oldItem: any, indent: number) => {
    if (!oldItem || !(okr.status === "PENDING" || okr.status === "NEGOTIATING"))
      return null;
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
        {(okr.status === "SUBMITTED" || okr.status === "COMPLETED") && (
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

  const deletedItems: any[] = [];
  if (
    originalStructure &&
    (okr.status === "PENDING" || okr.status === "NEGOTIATING")
  ) {
    originalStructure.forEach((oldObj: any) => {
      const newObj = localStructure.find(
        (o: any) => String(o.id) === String(oldObj.id),
      );
      if (!newObj) {
        deletedItems.push({ ...oldObj, type: "OBJ", objId: oldObj.id });
        // Liệt kê tất cả con của OBJ bị xóa
        oldObj.items?.forEach((childKr: any) => {
          deletedItems.push({ ...childKr, type: "KR", objId: oldObj.id, krId: childKr.id });
          childKr.items?.forEach((childSub: any) => {
            deletedItems.push({ ...childSub, type: "SUBKR", objId: oldObj.id, krId: childKr.id, subId: childSub.id });
            childSub.items?.forEach((childSubSub: any) => {
              deletedItems.push({ ...childSubSub, type: "SUBSUBKR", objId: oldObj.id, krId: childKr.id, subId: childSub.id, subsubId: childSubSub.id });
            });
          });
        });
        return;
      }

      oldObj.items?.forEach((oldKr: any) => {
        const newKr = newObj.items?.find(
          (k: any) => String(k.id) === String(oldKr.id),
        );
        if (!newKr) {
          deletedItems.push({
            ...oldKr,
            type: "KR",
            objId: oldObj.id,
            krId: oldKr.id,
          });
          // Liệt kê tất cả con của KR bị xóa
          oldKr.items?.forEach((childSub: any) => {
            deletedItems.push({ ...childSub, type: "SUBKR", objId: oldObj.id, krId: oldKr.id, subId: childSub.id });
            childSub.items?.forEach((childSubSub: any) => {
              deletedItems.push({ ...childSubSub, type: "SUBSUBKR", objId: oldObj.id, krId: oldKr.id, subId: childSub.id, subsubId: childSubSub.id });
            });
          });
          return;
        }

        oldKr.items?.forEach((oldSub: any) => {
          const newSub = newKr.items?.find(
            (s: any) => String(s.id) === String(oldSub.id),
          );
          if (!newSub) {
            deletedItems.push({
              ...oldSub,
              type: "SUBKR",
              objId: oldObj.id,
              krId: oldKr.id,
              subId: oldSub.id,
            });
            // Liệt kê tất cả con của SubKR bị xóa
            oldSub.items?.forEach((childSubSub: any) => {
              deletedItems.push({ ...childSubSub, type: "SUBSUBKR", objId: oldObj.id, krId: oldKr.id, subId: oldSub.id, subsubId: childSubSub.id });
            });
            return;
          }

          oldSub.items?.forEach((oldSubSub: any) => {
            const newSubSub = newSub.items?.find(
              (ss: any) => String(ss.id) === String(oldSubSub.id),
            );
            if (!newSubSub) {
              deletedItems.push({
                ...oldSubSub,
                type: "SUBSUBKR",
                objId: oldObj.id,
                krId: oldKr.id,
                subId: oldSub.id,
                subsubId: oldSubSub.id,
              });
            }
          });
        });
      });
    });
  }

  const isAccepted = okr.status === "ACCEPTED";
  const isSubmitted = okr.status === "SUBMITTED";
  const isCompleted = okr.status === "COMPLETED";
  const isPending = okr.status === "PENDING";

  const isCycleStarted = okr.cycle?.startDate
    ? new Date(new Date().setHours(0, 0, 0, 0)) >=
    new Date(new Date(okr.cycle.startDate).setHours(0, 0, 0, 0))
    : true;

  const canReport = isAccepted && isCycleStarted;

  useEffect(() => {
    if (okr.selfReportData && typeof okr.selfReportData === "object") {
      setReportData(okr.selfReportData);
    }
    setLocalStructure(Array.isArray(okr.keyResults) ? okr.keyResults : []);
    setHasChanges(false);
  }, [okr.selfReportData, okr.keyResults]);

  const calcTotalScore = () => {
    let grandTotal = 0;
    localStructure.forEach((obj: any) => {
      let objRawScore = 0;
      const maxObjScore = Number(obj.maxScore) || 0;

      obj.items?.forEach((kr: any) => {
        const krKey = `${obj.id}-${kr.id}`;
        const krQty = reportData[krKey]?.quantity || 0;
        const krUnitScore = Number(kr.unitScore) || 0;
        const krCalcScore = krUnitScore > 0 ? krQty * krUnitScore : krQty;
        const krCappedScore = Math.min(krCalcScore, Number(kr.maxScore) || Infinity);
        objRawScore += krCappedScore;

        kr.items?.forEach((sub: any) => {
          const subKey = `${obj.id}-${kr.id}-${sub.id}`;
          const subQty = reportData[subKey]?.quantity || 0;
          const subUnitScore = Number(sub.unitScore) || 0;
          const subCalcScore = subUnitScore > 0 ? subQty * subUnitScore : subQty;
          const subCappedScore = Math.min(subCalcScore, Number(sub.maxScore) || Infinity);
          objRawScore += subCappedScore;

          sub.items?.forEach((subsub: any) => {
            const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
            const subsubQty = reportData[subsubKey]?.quantity || 0;
            const subsubUnitScore = Number(subsub.unitScore) || 0;
            const subsubCalcScore = subsubUnitScore > 0 ? subsubQty * subsubUnitScore : subsubQty;
            const subsubCappedScore = Math.min(subsubCalcScore, Number(subsub.maxScore) || Infinity);
            objRawScore += subsubCappedScore;
          });
        });
      });

      const objScore = maxObjScore > 0 ? Math.min(objRawScore, maxObjScore) : objRawScore;
      grandTotal += objScore;
    });
    return grandTotal;
  };

  const calcMaxScore = () => {
    let max = 0;
    localStructure.forEach((obj: any) => {
      max += Number(obj.maxScore) || 0;
    });
    return max;
  };

  const calcObjectiveScore = (obj: any) => {
    let total = 0;
    const selfReport = okr.selfReportData || {};
    obj.items?.forEach((kr: any) => {
      const krKey = `${obj.id}-${kr.id}`;
      total += Number(selfReport[krKey]?.score) || 0;
      kr.items?.forEach((sub: any) => {
        const subKey = `${obj.id}-${kr.id}-${sub.id}`;
        total += Number(selfReport[subKey]?.score) || 0;
        sub.items?.forEach((subsub: any) => {
          const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
          total += Number(selfReport[subsubKey]?.score) || 0;
        });
      });
    });
    const max = Number(obj.maxScore) || 0;
    return max > 0 ? Math.min(total, max) : total;
  };

  const handleOpenAddDialog = (
    type: "KR" | "SUBKR",
    objId: string,
    krId?: string,
  ) => {
    setAddParentType(type);
    setAddObjectiveId(objId);
    setAddKrId(krId || null);
    setNewCriteriaTitle("");
    setNewCriteriaUnitScore("");
    setNewCriteriaUnit("");
    setOpenAddDialog(true);
  };

  const handleSaveNewCriteria = () => {
    if (!newCriteriaTitle.trim()) {
      showError("Lỗi", "Vui lòng nhập nội dung.");
      return;
    }
    const newStructure = JSON.parse(JSON.stringify(localStructure));

    let generatedId = "";

    if (addParentType === "KR") {
      const obj = newStructure.find((o: any) => o.id === addObjectiveId);
      if (obj) {
        if (!obj.items) obj.items = [];
        const lastItem = obj.items[obj.items.length - 1];
        if (lastItem && lastItem.id) {
          const parts = String(lastItem.id).split(".");
          if (parts.length > 1) {
            const lastNum = parseInt(parts[parts.length - 1], 10);
            parts[parts.length - 1] = isNaN(lastNum)
              ? "1"
              : String(lastNum + 1);
            generatedId = parts.join(".");
          } else {
            const lastNum = parseInt(lastItem.id, 10);
            if (!isNaN(lastNum)) {
              generatedId = String(lastNum + 1);
            } else {
              generatedId = `${lastItem.id}.1`;
            }
          }
        } else {
          generatedId = `${obj.id}.1`;
        }

        const newItem = {
          id: generatedId,
          title: newCriteriaTitle,
          unitScore: Number(newCriteriaUnitScore) || 0,
          unit: newCriteriaUnit || "đv",
          isNew: true,
          items: [],
        };
        obj.items.push(newItem);
      }
    } else if (addParentType === "SUBKR") {
      const obj = newStructure.find((o: any) => o.id === addObjectiveId);
      if (obj) {
        const kr = obj.items?.find((k: any) => k.id === addKrId);
        if (kr) {
          if (!kr.items) kr.items = [];
          const lastItem = kr.items[kr.items.length - 1];
          if (lastItem && lastItem.id) {
            const parts = String(lastItem.id).split(".");
            if (parts.length > 1) {
              const lastNum = parseInt(parts[parts.length - 1], 10);
              parts[parts.length - 1] = isNaN(lastNum)
                ? "1"
                : String(lastNum + 1);
              generatedId = parts.join(".");
            } else {
              generatedId = `${lastItem.id}.1`;
            }
          } else {
            generatedId = `${kr.id}.1`;
          }

          const newItem = {
            id: generatedId,
            title: newCriteriaTitle,
            unitScore: Number(newCriteriaUnitScore) || 0,
            unit: newCriteriaUnit || "đv",
            isNew: true,
            items: [],
          };
          kr.items.push(newItem);
        }
      }
    }

    setLocalStructure(newStructure);
    setHasChanges(true);
    setOpenAddDialog(false);
  };

  const handleDeleteItem = (
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string,
  ) => {
    const newStructure = JSON.parse(JSON.stringify(localStructure));

    if (subsubId && subId && krId) {
      const obj = newStructure.find((o: any) => String(o.id) === String(objId));
      if (obj) {
        const kr = obj.items?.find((k: any) => String(k.id) === String(krId));
        const sub = kr?.items?.find((s: any) => String(s.id) === String(subId));
        if (sub && sub.items) {
          sub.items = sub.items.filter(
            (ss: any) => String(ss.id) !== String(subsubId),
          );
        }
      }
    } else if (subId && krId) {
      const obj = newStructure.find((o: any) => String(o.id) === String(objId));
      if (obj) {
        const kr = obj.items?.find((k: any) => String(k.id) === String(krId));
        if (kr && kr.items) {
          kr.items = kr.items.filter(
            (s: any) => String(s.id) !== String(subId),
          );
        }
      }
    } else if (krId) {
      const obj = newStructure.find((o: any) => String(o.id) === String(objId));
      if (obj && obj.items) {
        obj.items = obj.items.filter((k: any) => String(k.id) !== String(krId));
      }
    }

    setLocalStructure(newStructure);
    setHasChanges(true);
  };

  const handleUndoItem = (
    type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR",
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string,
  ) => {
    const newStructure = JSON.parse(JSON.stringify(localStructure));

    let oldItem: any = null;
    const oldObj = originalStructure?.find(
      (o: any) => String(o.id) === String(objId),
    );
    if (type === "OBJ") {
      oldItem = oldObj;
    } else if (type === "KR") {
      oldItem = oldObj?.items?.find((k: any) => String(k.id) === String(krId));
    } else if (type === "SUBKR") {
      const oldKr = oldObj?.items?.find(
        (k: any) => String(k.id) === String(krId),
      );
      oldItem = oldKr?.items?.find((s: any) => String(s.id) === String(subId));
    } else if (type === "SUBSUBKR") {
      const oldKr = oldObj?.items?.find(
        (k: any) => String(k.id) === String(krId),
      );
      const oldSub = oldKr?.items?.find(
        (s: any) => String(s.id) === String(subId),
      );
      oldItem = oldSub?.items?.find(
        (ss: any) => String(ss.id) === String(subsubId),
      );
    }

    if (!oldItem) return;

    const obj = newStructure.find((o: any) => String(o.id) === String(objId));
    if (type === "OBJ" && obj) {
      obj.title = oldItem.title;
      obj.maxScore = oldItem.maxScore;
      obj.unitScore = oldItem.unitScore;
      obj.unit = oldItem.unit;
      obj.isEdited = false;
    } else if (type === "KR" && obj) {
      const kr = obj.items?.find((k: any) => String(k.id) === String(krId));
      if (kr) {
        kr.title = oldItem.title;
        kr.maxScore = oldItem.maxScore;
        kr.unitScore = oldItem.unitScore;
        kr.unit = oldItem.unit;
        kr.isEdited = false;
      }
    } else if (type === "SUBKR" && obj) {
      const kr = obj.items?.find((k: any) => String(k.id) === String(krId));
      const sub = kr?.items?.find((s: any) => String(s.id) === String(subId));
      if (sub) {
        sub.title = oldItem.title;
        sub.maxScore = oldItem.maxScore;
        sub.unitScore = oldItem.unitScore;
        sub.unit = oldItem.unit;
        sub.isEdited = false;
      }
    } else if (type === "SUBSUBKR" && obj) {
      const kr = obj.items?.find((k: any) => String(k.id) === String(krId));
      const sub = kr?.items?.find((s: any) => String(s.id) === String(subId));
      const subsub = sub?.items?.find(
        (ss: any) => String(ss.id) === String(subsubId),
      );
      if (subsub) {
        subsub.title = oldItem.title;
        subsub.maxScore = oldItem.maxScore;
        subsub.unitScore = oldItem.unitScore;
        subsub.unit = oldItem.unit;
        subsub.isEdited = false;
      }
    }

    setLocalStructure(newStructure);
    setHasChanges(true);
  };

  const handleRestoreDeletedItem = (delItem: any) => {
    const { type, objId, krId, subId, subsubId } = delItem;
    const oldItem = findOriginalItem(objId, krId, subId, subsubId);
    if (!oldItem) return;

    const newStructure = JSON.parse(JSON.stringify(localStructure));

    if (type === "OBJ") {
      newStructure.push(JSON.parse(JSON.stringify(oldItem)));
      newStructure.sort((a: any, b: any) =>
        String(a.id).localeCompare(String(b.id)),
      );
    } else if (type === "KR") {
      const obj = newStructure.find((o: any) => String(o.id) === String(objId));
      if (obj) {
        if (!obj.items) obj.items = [];
        obj.items.push(JSON.parse(JSON.stringify(oldItem)));
        obj.items.sort((a: any, b: any) => parseFloat(a.id) - parseFloat(b.id));
      }
    } else if (type === "SUBKR") {
      const obj = newStructure.find((o: any) => String(o.id) === String(objId));
      if (obj) {
        const kr = obj.items?.find((k: any) => String(k.id) === String(krId));
        if (kr) {
          if (!kr.items) kr.items = [];
          kr.items.push(JSON.parse(JSON.stringify(oldItem)));
          kr.items.sort(
            (a: any, b: any) => parseFloat(a.id) - parseFloat(b.id),
          );
        }
      }
    } else if (type === "SUBSUBKR") {
      const obj = newStructure.find((o: any) => String(o.id) === String(objId));
      if (obj) {
        const kr = obj.items?.find((k: any) => String(k.id) === String(krId));
        const sub = kr?.items?.find((s: any) => String(s.id) === String(subId));
        if (sub) {
          if (!sub.items) sub.items = [];
          sub.items.push(JSON.parse(JSON.stringify(oldItem)));
          sub.items.sort((a: any, b: any) =>
            String(a.id).localeCompare(String(b.id)),
          );
        }
      }
    }

    setLocalStructure(newStructure);
    setHasChanges(true);
  };

  const handleOpenEditDialog = (
    type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR",
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string,
  ) => {
    let item: any = null;
    const obj = localStructure.find((o) => o.id === objId);
    if (type === "OBJ") {
      item = obj;
    } else if (type === "KR") {
      item = obj?.items?.find((k: any) => k.id === krId);
    } else if (type === "SUBKR") {
      const kr = obj?.items?.find((k: any) => k.id === krId);
      item = kr?.items?.find((s: any) => s.id === subId);
    } else if (type === "SUBSUBKR") {
      const kr = obj?.items?.find((k: any) => k.id === krId);
      const sub = kr?.items?.find((s: any) => s.id === subId);
      item = sub?.items?.find((ss: any) => ss.id === subsubId);
    }

    if (item) {
      setEditItemInfo({ type, objId, krId, subId, subsubId });
      setEditCriteriaTitle(item.title || "");
      setEditCriteriaMaxScore(String(item.maxScore ?? ""));
      setEditCriteriaUnitScore(String(item.unitScore ?? ""));
      setEditCriteriaUnit(item.unit || "");
      setOpenEditDialog(true);
    }
  };

  const handleSaveEditCriteria = () => {
    if (!editCriteriaTitle.trim()) {
      showError("Lỗi", "Vui lòng nhập nội dung.");
      return;
    }
    const newStructure = JSON.parse(JSON.stringify(localStructure));
    const obj = newStructure.find((o: any) => o.id === editItemInfo?.objId);
    let targetItem: any = null;

    if (editItemInfo?.type === "OBJ") {
      targetItem = obj;
    } else if (editItemInfo?.type === "KR") {
      targetItem = obj?.items?.find((k: any) => k.id === editItemInfo.krId);
    } else if (editItemInfo?.type === "SUBKR") {
      const kr = obj?.items?.find((k: any) => k.id === editItemInfo.krId);
      targetItem = kr?.items?.find((s: any) => s.id === editItemInfo.subId);
    } else if (editItemInfo?.type === "SUBSUBKR") {
      const kr = obj?.items?.find((k: any) => k.id === editItemInfo.krId);
      const sub = kr?.items?.find((s: any) => s.id === editItemInfo.subId);
      targetItem = sub?.items?.find(
        (ss: any) => ss.id === editItemInfo.subsubId,
      );
    }

    if (targetItem) {
      targetItem.title = editCriteriaTitle;
      targetItem.maxScore = Number(editCriteriaMaxScore) || 0;
      targetItem.unitScore = Number(editCriteriaUnitScore) || 0;
      targetItem.unit = editCriteriaUnit;
      targetItem.isEdited = true;
    }

    setLocalStructure(newStructure);
    setHasChanges(true);
    setOpenEditDialog(false);
  };

  const handleSubmitChanges = async () => {
    try {
      await api.put(`/okrs/${okr.id}/structure`, {
        keyResults: localStructure,
        localComments:
          Object.keys(localComments).length > 0 ? localComments : undefined,
      });
      setHasChanges(false);
      setLocalComments({});
      onRefresh();
      showSuccess("Thành công", "Đã gửi cấu trúc mới.");
    } catch (error) {
      showError("Lỗi", "Không thể cập nhật cấu trúc.");
    }
  };

  const handleAccept = async () => {
    const ok = await confirmAction({
      title: "Chấp nhận OKR?",
      text: "Sau khi chấp nhận, bạn sẽ bắt đầu tự khai điểm.",
      icon: "question",
      confirmText: "Đồng ý chấp nhận",
      confirmColor: "#16a34a",
    });
    if (!ok) return;
    try {
      await api.put(`/okrs/${okr.id}/accept`);
      onRefresh();
    } catch (error) {
      console.error(error);
      showError("Lỗi", "Có lỗi xảy ra khi chấp nhận OKR.");
    }
  };

  const handleSendForApproval = async () => {
    const ok = await confirmAction({
      title: "Gửi yêu cầu duyệt?",
      text: "Xác nhận gửi yêu cầu duyệt OKR này lên Trưởng khoa/Quản lý.",
      icon: "question",
      confirmText: "Gửi yêu cầu",
      confirmColor: "#3b82f6",
    });
    if (!ok) return;
    try {
      await api.put(`/okrs/${okr.id}/send-for-approval`);
      onRefresh();
      showSuccess("Thành công", "Đã gửi yêu cầu duyệt OKR.");
    } catch (error) {
      console.error(error);
      showError("Lỗi", "Có lỗi xảy ra khi gửi yêu cầu duyệt OKR.");
    }
  };

  const handleSendChat = async (itemId: string) => {
    if (!chatMessage.trim()) return;
    setChatLoading(true);
    try {
      const res = await api.post(`/okrs/${okr.id}/chat`, {
        itemId,
        sender: "USER",
        message: chatMessage,
      });
      // Cập nhật local state để hiển thị tin nhắn ngay
      const newMessage = {
        message: chatMessage,
        sender: "USER",
        createdAt: new Date().toISOString(),
      };
      setLocalComments((prev) => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), newMessage],
      }));
      setChatMessage("");
      // Refresh để cập nhật trạng thái NEGOTIATING
      onRefresh();
    } catch (error: any) {
      console.error("Lỗi gửi tin nhắn đàm phán", error);
      showError("Lỗi", error?.response?.data?.message || "Không thể gửi tin nhắn.");
    } finally {
      setChatLoading(false);
    }
  };

  const updateReport = (
    krId: string,
    field: "quantity" | "evidence",
    value: any,
  ) => {
    setReportData((prev) => ({
      ...prev,
      [krId]: {
        ...prev[krId],
        [field]: field === "quantity" ? Math.max(0, Number(value) || 0) : value,
      },
    }));
    setHasDraftChanges(true);
    setDraftSaveStatus("idle");
  };

  const buildEnrichedReport = () => {
    const enrichedReport: Record<string, any> = {};
    localStructure.forEach((obj: any) => {
      obj.items?.forEach((kr: any) => {
        const key = `${obj.id}-${kr.id}`;
        const qty = reportData[key]?.quantity || 0;
        const unitScore = Number(kr.unitScore) || 0;
        const score = unitScore > 0 ? qty * unitScore : qty;
        enrichedReport[key] = {
          quantity: qty,
          evidence: reportData[key]?.evidence || "",
          score: Math.min(score, Number(kr.maxScore) || Infinity),
          krTitle: kr.title,
          objTitle: obj.title,
        };
        kr.items?.forEach((sub: any) => {
          const subKey = `${obj.id}-${kr.id}-${sub.id}`;
          const subQty = reportData[subKey]?.quantity || 0;
          const subUnitScore = Number(sub.unitScore) || 0;
          const subScore = subUnitScore > 0 ? subQty * subUnitScore : subQty;
          enrichedReport[subKey] = {
            quantity: subQty,
            evidence: reportData[subKey]?.evidence || "",
            score: Math.min(subScore, Number(sub.maxScore) || Infinity),
            krTitle: sub.title,
            objTitle: obj.title,
          };
          sub.items?.forEach((subsub: any) => {
            const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
            const subsubQty = reportData[subsubKey]?.quantity || 0;
            const subsubUnitScore = Number(subsub.unitScore) || 0;
            const subsubScore =
              subsubUnitScore > 0 ? subsubQty * subsubUnitScore : subsubQty;
            enrichedReport[subsubKey] = {
              quantity: subsubQty,
              evidence: reportData[subsubKey]?.evidence || "",
              score: Math.min(subsubScore, Number(subsub.maxScore) || Infinity),
              krTitle: subsub.title,
              objTitle: obj.title,
            };
          });
        });
      });
    });
    return enrichedReport;
  };

  // Auto-save draft effect
  useEffect(() => {
    if (!hasDraftChanges || okr.status !== "ACCEPTED") return;

    const timer = setTimeout(async () => {
      setDraftSaveStatus("saving");
      try {
        const enrichedReport = buildEnrichedReport();
        await api.put(`/okrs/${okr.id}/draft-report`, {
          selfReportData: enrichedReport,
        });
        setDraftSaveStatus("saved");
        setHasDraftChanges(false);
      } catch (error) {
        console.error("Lỗi khi lưu nháp", error);
        setDraftSaveStatus("idle");
      }
    }, 1500); // Auto-save after 1.5s of no typing

    return () => clearTimeout(timer);
  }, [reportData, hasDraftChanges, okr.status, okr.id, localStructure]);

  const handleSaveDraftManual = async () => {
    setDraftSaveStatus("saving");
    try {
      const enrichedReport = buildEnrichedReport();
      await api.put(`/okrs/${okr.id}/draft-report`, {
        selfReportData: enrichedReport,
      });
      setDraftSaveStatus("saved");
      setHasDraftChanges(false);
      showSuccess("Thành công", "Đã lưu nháp thành công.");
    } catch (error) {
      console.error("Lỗi khi lưu nháp", error);
      setDraftSaveStatus("idle");
      showError("Lỗi", "Không thể lưu nháp.");
    }
  };

  const handleSubmitReport = async () => {
    const ok = await confirmAction({
      title: "Nộp bài tự khai?",
      text: "Sau khi nộp, bài sẽ được gửi cho Trưởng khoa duyệt. Bạn chắc chắn chứ?",
      icon: "question",
      confirmText: "Nộp bài",
      confirmColor: "#1976d2",
    });
    if (!ok) return;
    setSaving(true);

    const enrichedReport = buildEnrichedReport();

    try {
      await api.put(`/okrs/${okr.id}/self-report`, {
        selfReportData: enrichedReport,
      });
      showSuccess("Thành công!", "Đã nộp bài tự khai thành công.");
      onRefresh();
    } catch (error) {
      console.error(error);
      showError("Lỗi", "Có lỗi xảy ra khi nộp bài.");
    } finally {
      setSaving(false);
    }
  };

  const totalSelfScore =
    okr.status === "SUBMITTED" || okr.status === "COMPLETED"
      ? (okr.totalScore || 0)
      : calcTotalScore();
  const displayScore =
    okr.managerScore != null
      ? okr.managerScore
      : totalSelfScore;
  const maxScore = calcMaxScore();
  const progressPercent =
    maxScore > 0 ? Math.min((displayScore / maxScore) * 100, 100) : 0;

  const getButtonLabel = () => {
    if (okr.status === "PENDING" || okr.status === "NEGOTIATING") {
      return "Đàm phán & Chỉnh sửa";
    }
    if (canReport) {
      return "Khai báo điểm & Minh chứng";
    }
    return "Xem chi tiết";
  };

  return (
    <Paper
      sx={{
        mb: 3,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      {/* Card Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          bgcolor: "#f8fafc",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight="bold" color="#1e3a8a">
            {okr.objective}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
            <Chip
              label={
                isAccepted && !isCycleStarted
                  ? "Chờ kỳ bắt đầu"
                  : statusConfig[okr.status]?.label || okr.status
              }
              color={
                isAccepted && !isCycleStarted
                  ? "warning"
                  : statusConfig[okr.status]?.color || "default"
              }
              size="small"
            />
            {/* {(() => {
              if (okr.deadline) {
                const isNegotiationExpired = new Date() > new Date(okr.deadline);
                if (!isNegotiationExpired) {
                  return (
                    <Chip
                      label={`Deadline đàm phán: ${new Date(okr.deadline).toLocaleDateString("vi-VN")}`}
                      size="small"
                      variant="outlined"
                      color="warning"
                    />
                  );
                }
              }
              if (okr.cycle?.endDate) {
                return (
                  <Chip
                    label={`Hạn của Kỳ diễn ra: ${new Date(okr.cycle.endDate).toLocaleDateString("vi-VN")}`}
                    size="small"
                    variant="outlined"
                  />
                );
              }
              return null;
            })()} */}
            {(isAccepted || isSubmitted || isCompleted) && (
              <Chip
                label={`Điểm: ${displayScore}/${maxScore}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {draftSaveStatus === "saving" && (
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Đang lưu nháp...
            </Typography>
          )}
          {draftSaveStatus === "saved" && (
            <Typography variant="caption" color="success.main" sx={{ mr: 1 }}>
              Đã lưu nháp
            </Typography>
          )}
          <Button
            size="small"
            variant={(okr.status === "PENDING" || okr.status === "NEGOTIATING" || canReport) ? "contained" : "outlined"}
            color={
              (okr.status === "PENDING" || okr.status === "NEGOTIATING")
                ? "warning"
                : canReport
                  ? "primary"
                  : "inherit"
            }
            onClick={() => setExpanded(true)}
            sx={{ textTransform: "none", fontWeight: "bold" }}
          >
            {getButtonLabel()}
          </Button>
        </Box>
      </Box>

      {(canReport || isSubmitted || isCompleted) && (
        <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid #f1f5f9" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="500">
              Tiến độ hoàn thành:
            </Typography>
            <Typography variant="caption" fontWeight="bold" color="primary.main">
              {progressPercent.toFixed(0)}% ({displayScore.toFixed(1)}/{maxScore} điểm)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      )}

      {/* Basic Structure Info */}
      <Box sx={{ p: 2.5, borderTop: "1px solid #f1f5f9", bgcolor: "#fafafa" }}>
        <Typography
          variant="subtitle2"
          color="#334155"
          sx={{ mb: 2, fontWeight: "bold", display: "flex", alignItems: "center", gap: 1, fontSize: "0.9rem" }}
        >
          📋 Khung OKR giao trong kỳ:
        </Typography>

        {localStructure.map((obj: any, idx: number) => {
          const objCommentsCount = (okr.proposedChanges?.[obj.id]?.length || 0) + (localComments[obj.id]?.length || 0);

          return (
            <Box key={obj.id || idx} sx={{ mb: 3, "&:last-child": { mb: 0 } }}>
              {/* Objective row */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.5,
                  bgcolor: "#eff6ff",
                  p: 1.5,
                  borderRadius: 2,
                  borderLeft: "4px solid #2563eb",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="#1e3a8a" sx={{ fontSize: "0.9rem" }}>
                    {obj.id}. {obj.title}
                  </Typography>
                  {objCommentsCount > 0 && (
                    <Chip
                      icon={<Forum sx={{ fontSize: "0.8rem !important" }} />}
                      label={`${objCommentsCount} phản hồi`}
                      size="small"
                      color="warning"
                      sx={{ height: 20, fontSize: "0.65rem", fontWeight: "bold" }}
                    />
                  )}
                </Box>
                <Chip
                  label={`Tối đa: ${obj.maxScore} điểm`}
                  size="small"
                  color="primary"
                  sx={{ height: 24, fontSize: "0.75rem", fontWeight: "bold", bgcolor: "#1e3a8a" }}
                />
              </Box>

              {/* Key Results and below */}
              <Box sx={{ pl: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                {obj.items?.map((kr: any) => {
                  const krKey = `${obj.id}-${kr.id}`;
                  const krData = reportData[krKey];
                  const krQty = krData?.quantity || 0;
                  const krUnitScore = Number(kr.unitScore) || 0;
                  const krCalcScore = krUnitScore > 0 ? krQty * krUnitScore : krQty;
                  const krCappedScore = Math.min(krCalcScore, Number(kr.maxScore) || Infinity);
                  const krScore = krData?.score != null ? krData.score : krCappedScore;

                  const krCommentsCount = (okr.proposedChanges?.[kr.id]?.length || 0) + (localComments[kr.id]?.length || 0);
                  const hasReport = krQty > 0 || (krData?.evidence);

                  return (
                    <Box
                      key={kr.id}
                      sx={{
                        pl: 2,
                        borderLeft: "2px solid #cbd5e1",
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5
                      }}
                    >
                      {/* KR Row */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, flex: 1, minWidth: "250px" }}>
                          <Typography variant="body2" color="text.primary" sx={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
                            <strong>{kr.id}</strong> {kr.title}
                          </Typography>

                          {krCommentsCount > 0 && (
                            <Chip
                              icon={<Forum sx={{ fontSize: "0.75rem !important" }} />}
                              label={`${krCommentsCount}`}
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ height: 16, fontSize: "0.6rem", fontWeight: "bold", ml: 0.5 }}
                            />
                          )}
                        </Box>

                        {/* Target & Score Info */}
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
                          {kr.unitScore ? (
                            <Chip
                              label={`+${kr.unitScore}/${kr.unit || "đv"}`}
                              size="small"
                              sx={{ height: 18, fontSize: "0.65rem", color: "#475569", bgcolor: "#e2e8f0", fontWeight: "500" }}
                            />
                          ) : null}
                          {kr.maxScore ? (
                            <Chip
                              label={`Tối đa: ${kr.maxScore}đ`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: "0.65rem", color: "#475569", fontWeight: "500" }}
                            />
                          ) : null}
                        </Box>
                      </Box>

                      {/* Display Self-Report Info if exists */}
                      {hasReport && (okr.status === "ACCEPTED" || okr.status === "SUBMITTED" || okr.status === "COMPLETED") && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pl: 2, py: 0.25, flexWrap: "wrap" }}>
                          <Typography variant="caption" sx={{ color: "#16a34a", fontWeight: "600", bgcolor: "#f0fdf4", px: 1, py: 0.25, borderRadius: 1 }}>
                            Đã khai: {krQty} {kr.unit || "đv"} {kr.unitScore ? `(-> ${krScore.toFixed(1)}đ)` : `(-> ${krScore}đ)`}
                          </Typography>
                          {krData?.evidence && (
                            <Chip
                              icon={<Launch sx={{ fontSize: "0.7rem !important" }} />}
                              label="Xem minh chứng"
                              size="small"
                              component="a"
                              href={krData.evidence.startsWith("http") ? krData.evidence : `https://${krData.evidence}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              clickable
                              sx={{ height: 18, fontSize: "0.65rem", bgcolor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", cursor: "pointer" }}
                            />
                          )}
                        </Box>
                      )}

                      {/* Sub-KRs */}
                      {kr.items?.map((sub: any) => {
                        const subKey = `${obj.id}-${kr.id}-${sub.id}`;
                        const subData = reportData[subKey];
                        const subQty = subData?.quantity || 0;
                        const subUnitScore = Number(sub.unitScore) || 0;
                        const subCalcScore = subUnitScore > 0 ? subQty * subUnitScore : subQty;
                        const subCappedScore = Math.min(subCalcScore, Number(sub.maxScore) || Infinity);
                        const subScore = subData?.score != null ? subData.score : subCappedScore;

                        const subCommentsCount = (okr.proposedChanges?.[sub.id]?.length || 0) + (localComments[sub.id]?.length || 0);
                        const hasSubReport = subQty > 0 || (subData?.evidence);

                        return (
                          <Box
                            key={sub.id}
                            sx={{
                              pl: 2.5,
                              borderLeft: "2px solid #e2e8f0",
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.5,
                              mt: 0.5
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
                              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, flex: 1, minWidth: "220px" }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
                                  <strong>{sub.id}</strong> {sub.title}
                                </Typography>
                                {subCommentsCount > 0 && (
                                  <Chip
                                    icon={<Forum sx={{ fontSize: "0.75rem !important" }} />}
                                    label={`${subCommentsCount}`}
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                    sx={{ height: 16, fontSize: "0.6rem", fontWeight: "bold", ml: 0.5 }}
                                  />
                                )}
                              </Box>

                              <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
                                {sub.unitScore ? (
                                  <Chip
                                    label={`+${sub.unitScore}/${sub.unit || "đv"}`}
                                    size="small"
                                    sx={{ height: 16, fontSize: "0.6rem", color: "#64748b", bgcolor: "#f1f5f9" }}
                                  />
                                ) : null}
                                {sub.maxScore ? (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", fontWeight: "500" }}>
                                    Tối đa: {sub.maxScore}đ
                                  </Typography>
                                ) : null}
                              </Box>
                            </Box>

                            {/* Display Sub self-report */}
                            {hasSubReport && (okr.status === "ACCEPTED" || okr.status === "SUBMITTED" || okr.status === "COMPLETED") && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pl: 2, py: 0.25, flexWrap: "wrap" }}>
                                <Typography variant="caption" sx={{ color: "#16a34a", fontWeight: "600", bgcolor: "#f0fdf4", px: 0.75, py: 0.25, borderRadius: 0.5 }}>
                                  Đã khai: {subQty} {sub.unit || "đv"} {sub.unitScore ? `(-> ${subScore.toFixed(1)}đ)` : `(-> ${subScore}đ)`}
                                </Typography>
                                {subData?.evidence && (
                                  <Chip
                                    icon={<Launch sx={{ fontSize: "0.65rem !important" }} />}
                                    label="Xem minh chứng"
                                    size="small"
                                    component="a"
                                    href={subData.evidence.startsWith("http") ? subData.evidence : `https://${subData.evidence}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    clickable
                                    sx={{ height: 16, fontSize: "0.6rem", bgcolor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", cursor: "pointer" }}
                                  />
                                )}
                              </Box>
                            )}

                            {/* Sub-Sub-KRs */}
                            {sub.items?.map((subsub: any) => {
                              const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
                              const subsubData = reportData[subsubKey];
                              const subsubQty = subsubData?.quantity || 0;
                              const subsubUnitScore = Number(subsub.unitScore) || 0;
                              const subsubCalcScore = subsubUnitScore > 0 ? subsubQty * subsubUnitScore : subsubQty;
                              const subsubCappedScore = Math.min(subsubCalcScore, Number(subsub.maxScore) || Infinity);
                              const subsubScore = subsubData?.score != null ? subsubData.score : subsubCappedScore;

                              const subsubCommentsCount = (okr.proposedChanges?.[subsub.id]?.length || 0) + (localComments[subsub.id]?.length || 0);
                              const hasSubSubReport = subsubQty > 0 || (subsubData?.evidence);

                              return (
                                <Box
                                  key={subsub.id}
                                  sx={{
                                    pl: 2.5,
                                    borderLeft: "2px dashed #cbd5e1",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.5,
                                    mt: 0.5
                                  }}
                                >
                                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
                                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, flex: 1, minWidth: "200px" }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.78rem", fontStyle: "italic", lineHeight: 1.5 }}>
                                        <strong>{subsub.id}</strong> {subsub.title}
                                      </Typography>
                                      {subsubCommentsCount > 0 && (
                                        <Chip
                                          icon={<Forum sx={{ fontSize: "0.75rem !important" }} />}
                                          label={`${subsubCommentsCount}`}
                                          size="small"
                                          color="warning"
                                          variant="outlined"
                                          sx={{ height: 14, fontSize: "0.55rem", fontWeight: "bold", ml: 0.5 }}
                                        />
                                      )}
                                    </Box>

                                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
                                      {subsub.unitScore ? (
                                        <Chip
                                          label={`+${subsub.unitScore}/${subsub.unit || "đv"}`}
                                          size="small"
                                          sx={{ height: 14, fontSize: "0.55rem", color: "#64748b", bgcolor: "#f8fafc" }}
                                        />
                                      ) : null}
                                    </Box>
                                  </Box>

                                  {/* Display Sub-Sub self-report */}
                                  {hasSubSubReport && (okr.status === "ACCEPTED" || okr.status === "SUBMITTED" || okr.status === "COMPLETED") && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pl: 2, py: 0.25, flexWrap: "wrap" }}>
                                      <Typography variant="caption" sx={{ color: "#16a34a", fontWeight: "600", bgcolor: "#f0fdf4", px: 0.75, py: 0.25, borderRadius: 0.5, fontSize: "0.7rem" }}>
                                        Đã khai: {subsubQty} {subsub.unit || "đv"} {subsub.unitScore ? `(-> ${subsubScore.toFixed(1)}đ)` : `(-> ${subsubScore}đ)`}
                                      </Typography>
                                      {subsubData?.evidence && (
                                        <Chip
                                          icon={<Launch sx={{ fontSize: "0.6rem !important" }} />}
                                          label="Xem minh chứng"
                                          size="small"
                                          component="a"
                                          href={subsubData.evidence.startsWith("http") ? subsubData.evidence : `https://${subsubData.evidence}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          clickable
                                          sx={{ height: 14, fontSize: "0.55rem", bgcolor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", cursor: "pointer" }}
                                        />
                                      )}
                                    </Box>
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Expanded Dialog */}
      <Dialog
        open={expanded}
        onClose={() => setExpanded(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { minHeight: "80vh", maxHeight: "90vh" } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#1e3a8a",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>Chi tiết OKR: {okr.objective}</Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {canReport && draftSaveStatus === "saving" && (
              <Typography variant="caption" sx={{ color: "#fef08a", mr: 1 }}>
                Đang lưu nháp...
              </Typography>
            )}
            {canReport && draftSaveStatus === "saved" && (
              <Typography variant="caption" sx={{ color: "#86efac", mr: 1 }}>
                Đã lưu nháp
              </Typography>
            )}
            {(isPending || okr.status === "NEGOTIATING") && hasChanges && (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleSubmitChanges}
                startIcon={<Save />}
              >
                Gửi thay đổi & Yêu cầu duyệt
              </Button>
            )}
            <IconButton
              onClick={() => setExpanded(false)}
              sx={{ color: "white" }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {isAccepted && !isCycleStarted && (
            <Box sx={{ p: 2, bgcolor: "#fffbeb" }}>
              <Alert severity="warning">
                Kỳ đánh giá chưa bắt đầu (Dự kiến bắt đầu từ{" "}
                <strong>
                  {new Date(okr.cycle.startDate).toLocaleDateString("vi-VN")}
                </strong>
                ). Bạn chưa thể tự khai điểm lúc này.
              </Alert>
            </Box>
          )}
          <Divider />
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#1e3a8a" }}>
                <TableRow>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", width: "5%" }}
                  >
                    STT
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", width: "30%" }}
                  >
                    Nội dung
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", width: "10%" }}
                  >
                    Điểm tối đa
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", width: "12%" }}
                  >
                    Điểm/đơn vị
                  </TableCell>
                  {canReport && (
                    <>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "12%",
                        }}
                      >
                        Số lượng tự khai
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "10%",
                        }}
                      >
                        Quy đổi
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "21%",
                        }}
                      >
                        Minh chứng
                      </TableCell>
                    </>
                  )}
                  {(isSubmitted || isCompleted) && (
                    <>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "10%",
                        }}
                      >
                        Số lượng tự khai
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "10%",
                        }}
                      >
                        Điểm khai
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "10%",
                        }}
                      >
                        Tổng điểm nhiệm vụ
                      </TableCell>
                    </>
                  )}
                  {(isPending || okr.status === "NEGOTIATING") && (
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        width: "10%",
                        textAlign: "center",
                      }}
                    >
                      Đàm phán
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {localStructure.map((obj: any, oIndex: number) => {
                  const oldObj = findOriginalItem(obj.id);
                  const isObjChanged = hasChanged(obj, oldObj);

                  return (
                    <React.Fragment key={obj.id || oIndex}>
                      {isObjChanged && renderOldRow(oldObj, 2)}
                      <TableRow
                        sx={{ bgcolor: isObjChanged ? "#fef08a" : "#dbeafe" }}
                      >
                        <TableCell
                          sx={{ fontWeight: "bold", fontSize: "1rem" }}
                        >
                          {obj.id}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {isObjChanged ? "[Mới] " : ""}
                          {obj.title}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {obj.maxScore}
                        </TableCell>
                        <TableCell></TableCell>
                        {canReport && (
                          <>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                          </>
                        )}
                        {(isSubmitted || isCompleted) && (
                          <>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                color: "#15803d",
                                fontSize: "1rem",
                              }}
                            >
                              {calcObjectiveScore(obj)} / {obj.maxScore || 0}
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
                                  handleOpenAddDialog("KR", obj.id)
                                }
                                title="Thêm tiêu chí"
                              >
                                <Add fontSize="small" color="success" />
                              </IconButton>
                              {isObjChanged && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleUndoItem("OBJ", obj.id)}
                                  title="Hoàn tác thay đổi"
                                >
                                  <Undo fontSize="small" color="primary" />
                                </IconButton>
                              )}
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleOpenEditDialog("OBJ", obj.id)
                                }
                                title="Chỉnh sửa"
                              >
                                <Edit fontSize="small" color="info" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setActiveChatId(
                                    activeChatId === obj.id ? null : obj.id,
                                  )
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

                      {obj.items?.map((kr: any, kIndex: number) => {
                        const krKey = `${obj.id}-${kr.id}`;
                        const krQty = reportData[krKey]?.quantity || 0;
                        const krUnitScore = Number(kr.unitScore) || 0;
                        const krCalcScore =
                          krUnitScore > 0 ? krQty * krUnitScore : krQty;
                        const existingReport = okr.selfReportData?.[krKey];
                        const oldKr = findOriginalItem(obj.id, kr.id);
                        const isKrChanged = hasChanged(kr, oldKr);
                        const isKrNew = originalStructure ? !oldKr : false;

                        return (
                          <React.Fragment key={`${oIndex}-${kIndex}`}>
                            {isKrChanged && renderOldRow(oldKr, 3)}
                            <TableRow
                              sx={{
                                bgcolor:
                                  isKrNew || isKrChanged || kr.isEdited
                                    ? "#fef08a"
                                    : "#f8fafc",
                              }}
                            >
                              <TableCell
                                sx={{
                                  pl: 3,
                                  fontWeight:
                                    isKrNew || isKrChanged || kr.isEdited
                                      ? "bold"
                                      : "normal",
                                }}
                              >
                                {kr.id}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight:
                                    isKrNew || isKrChanged || kr.isEdited
                                      ? "bold"
                                      : "normal",
                                }}
                              >
                                {isKrChanged ? "[Mới] " : ""}
                                {kr.title}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight:
                                    isKrNew || isKrChanged || kr.isEdited
                                      ? "bold"
                                      : "normal",
                                }}
                              >
                                {kr.maxScore || "—"}
                              </TableCell>
                              <TableCell>
                                {kr.unitScore ? (
                                  <Chip
                                    label={`+${kr.unitScore}/${kr.unit || "đv"}`}
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
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={krQty || ""}
                                      onChange={(e) =>
                                        updateReport(
                                          krKey,
                                          "quantity",
                                          e.target.value,
                                        )
                                      }
                                      inputProps={{
                                        min: 0,
                                        style: { textAlign: "center" },
                                      }}
                                      sx={{ width: 80 }}
                                    />
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: "bold",
                                      color: "#2563eb",
                                    }}
                                  >
                                    {krCalcScore.toFixed(1)}
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      fullWidth
                                      placeholder="Link minh chứng..."
                                      value={reportData[krKey]?.evidence || ""}
                                      onChange={(e) =>
                                        updateReport(
                                          krKey,
                                          "evidence",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </TableCell>
                                </>
                              )}
                              {(isSubmitted || isCompleted) && (
                                <>
                                  <TableCell>
                                    {existingReport?.quantity || 0}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: "bold",
                                      color: "#2563eb",
                                    }}
                                  >
                                    {existingReport?.score || 0}
                                  </TableCell>
                                  <TableCell></TableCell>
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
                                        handleOpenAddDialog(
                                          "SUBKR",
                                          obj.id,
                                          kr.id,
                                        )
                                      }
                                      title="Thêm tiêu chí con"
                                    >
                                      <Add fontSize="small" color="success" />
                                    </IconButton>
                                    {isKrChanged && (
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleUndoItem("KR", obj.id, kr.id)
                                        }
                                        title="Hoàn tác thay đổi"
                                      >
                                        <Undo
                                          fontSize="small"
                                          color="primary"
                                        />
                                      </IconButton>
                                    )}
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleOpenEditDialog(
                                          "KR",
                                          obj.id,
                                          kr.id,
                                        )
                                      }
                                      title="Chỉnh sửa"
                                    >
                                      <Edit fontSize="small" color="info" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        setActiveChatId(
                                          activeChatId === kr.id ? null : kr.id,
                                        )
                                      }
                                    >
                                      <Comment
                                        fontSize="small"
                                        color={
                                          okr.proposedChanges?.[kr.id]?.length >
                                            0 ||
                                            localComments[kr.id]?.length > 0
                                            ? "primary"
                                            : "inherit"
                                        }
                                      />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleDeleteItem(obj.id, kr.id)
                                      }
                                      title="Xóa tiêu chí"
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

                            {kr.items?.map((sub: any, sIndex: number) => {
                              const subKey = `${obj.id}-${kr.id}-${sub.id}`;
                              const subQty = reportData[subKey]?.quantity || 0;
                              const subUnitScore = Number(sub.unitScore) || 0;
                              const subCalcScore =
                                subUnitScore > 0
                                  ? subQty * subUnitScore
                                  : subQty;
                              const existingSub = okr.selfReportData?.[subKey];
                              const oldSub = findOriginalItem(
                                obj.id,
                                kr.id,
                                sub.id,
                              );
                              const isSubChanged = hasChanged(sub, oldSub);
                              const isSubNew = originalStructure
                                ? !oldSub
                                : false;

                              return (
                                <React.Fragment
                                  key={`${oIndex}-${kIndex}-${sIndex}`}
                                >
                                  {isSubChanged && renderOldRow(oldSub, 6)}
                                  <TableRow
                                    sx={{
                                      bgcolor:
                                        isSubNew || isSubChanged || sub.isEdited
                                          ? "#fef08a"
                                          : "inherit",
                                    }}
                                  >
                                    <TableCell
                                      sx={{
                                        pl: 6,
                                        fontSize: "0.85rem",
                                        fontWeight:
                                          isSubNew ||
                                            isSubChanged ||
                                            sub.isEdited
                                            ? "bold"
                                            : "normal",
                                      }}
                                    >
                                      {sub.id}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "0.9rem",
                                        fontWeight:
                                          isSubNew ||
                                            isSubChanged ||
                                            sub.isEdited
                                            ? "bold"
                                            : "normal",
                                      }}
                                    >
                                      {isSubChanged ? "[Mới] " : ""}
                                      {sub.title}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontWeight:
                                          isSubNew ||
                                            isSubChanged ||
                                            sub.isEdited
                                            ? "bold"
                                            : "normal",
                                      }}
                                    >
                                      {sub.maxScore || "—"}
                                    </TableCell>
                                    <TableCell>
                                      {sub.unitScore ? (
                                        <Chip
                                          label={`+${sub.unitScore}/${sub.unit || "đv"}`}
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
                                          <TextField
                                            size="small"
                                            type="number"
                                            value={subQty || ""}
                                            onChange={(e) =>
                                              updateReport(
                                                subKey,
                                                "quantity",
                                                e.target.value,
                                              )
                                            }
                                            inputProps={{
                                              min: 0,
                                              style: { textAlign: "center" },
                                            }}
                                            sx={{ width: 80 }}
                                          />
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            fontWeight: "bold",
                                            color: "#2563eb",
                                          }}
                                        >
                                          {subCalcScore.toFixed(1)}
                                        </TableCell>
                                        <TableCell>
                                          <TextField
                                            size="small"
                                            fullWidth
                                            placeholder="Link..."
                                            value={
                                              reportData[subKey]?.evidence || ""
                                            }
                                            onChange={(e) =>
                                              updateReport(
                                                subKey,
                                                "evidence",
                                                e.target.value,
                                              )
                                            }
                                          />
                                        </TableCell>
                                      </>
                                    )}
                                    {(isSubmitted || isCompleted) && (
                                      <>
                                        <TableCell>
                                          {existingSub?.quantity || 0}
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            fontWeight: "bold",
                                            color: "#2563eb",
                                          }}
                                        >
                                          {existingSub?.score || 0}
                                        </TableCell>
                                        <TableCell></TableCell>
                                      </>
                                    )}
                                    {(isPending ||
                                      okr.status === "NEGOTIATING") && (
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
                                                  "SUBKR",
                                                  obj.id,
                                                  kr.id,
                                                  sub.id,
                                                )
                                              }
                                              title="Chỉnh sửa"
                                            >
                                              <Edit
                                                fontSize="small"
                                                color="info"
                                              />
                                            </IconButton>
                                            {isSubChanged && (
                                              <IconButton
                                                size="small"
                                                onClick={() =>
                                                  handleUndoItem(
                                                    "SUBKR",
                                                    obj.id,
                                                    kr.id,
                                                    sub.id,
                                                  )
                                                }
                                                title="Hoàn tác thay đổi"
                                              >
                                                <Undo
                                                  fontSize="small"
                                                  color="primary"
                                                />
                                              </IconButton>
                                            )}
                                            <IconButton
                                              size="small"
                                              onClick={() =>
                                                setActiveChatId(
                                                  activeChatId === sub.id
                                                    ? null
                                                    : sub.id,
                                                )
                                              }
                                            >
                                              <Comment
                                                fontSize="small"
                                                color={
                                                  okr.proposedChanges?.[sub.id]
                                                    ?.length > 0 ||
                                                    localComments[sub.id]?.length >
                                                    0
                                                    ? "primary"
                                                    : "inherit"
                                                }
                                              />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              onClick={() =>
                                                handleDeleteItem(
                                                  obj.id,
                                                  kr.id,
                                                  sub.id,
                                                )
                                              }
                                              title="Xóa tiêu chí con"
                                            >
                                              <Delete
                                                fontSize="small"
                                                color="error"
                                              />
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

                                  {sub.items?.map(
                                    (subsub: any, ssIndex: number) => {
                                      const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
                                      const subsubQty =
                                        reportData[subsubKey]?.quantity || 0;
                                      const subsubUnitScore =
                                        Number(subsub.unitScore) || 0;
                                      const subsubCalcScore =
                                        subsubUnitScore > 0
                                          ? subsubQty * subsubUnitScore
                                          : subsubQty;
                                      const existingSubSub =
                                        okr.selfReportData?.[subsubKey];
                                      const oldSubSub = findOriginalItem(
                                        obj.id,
                                        kr.id,
                                        sub.id,
                                        subsub.id,
                                      );
                                      const isSubSubChanged = hasChanged(
                                        subsub,
                                        oldSubSub,
                                      );
                                      const isSubSubNew = originalStructure
                                        ? !oldSubSub
                                        : false;

                                      return (
                                        <React.Fragment
                                          key={`${oIndex}-${kIndex}-${sIndex}-${ssIndex}`}
                                        >
                                          {isSubSubChanged &&
                                            renderOldRow(oldSubSub, 9)}
                                          <TableRow
                                            sx={{
                                              bgcolor:
                                                isSubSubNew ||
                                                  isSubSubChanged ||
                                                  subsub.isEdited
                                                  ? "#fef08a"
                                                  : "#fffbeb",
                                            }}
                                          >
                                            <TableCell
                                              sx={{
                                                pl: 9,
                                                fontSize: "0.8rem",
                                                fontWeight:
                                                  isSubSubNew ||
                                                    isSubSubChanged ||
                                                    subsub.isEdited
                                                    ? "bold"
                                                    : "normal",
                                              }}
                                            >
                                              {subsub.id}
                                            </TableCell>
                                            <TableCell
                                              sx={{
                                                fontSize: "0.85rem",
                                                fontWeight:
                                                  isSubSubNew ||
                                                    isSubSubChanged ||
                                                    subsub.isEdited
                                                    ? "bold"
                                                    : "normal",
                                              }}
                                            >
                                              {isSubSubChanged ? "[Mới] " : ""}
                                              {subsub.title}
                                            </TableCell>
                                            <TableCell
                                              sx={{
                                                fontWeight:
                                                  isSubSubNew ||
                                                    isSubSubChanged ||
                                                    subsub.isEdited
                                                    ? "bold"
                                                    : "normal",
                                              }}
                                            >
                                              —
                                            </TableCell>
                                            <TableCell>
                                              {subsub.unitScore ? (
                                                <Chip
                                                  label={`+${subsub.unitScore}/${subsub.unit || "đv"}`}
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
                                                  <TextField
                                                    size="small"
                                                    type="number"
                                                    value={subsubQty || ""}
                                                    onChange={(e) =>
                                                      updateReport(
                                                        subsubKey,
                                                        "quantity",
                                                        e.target.value,
                                                      )
                                                    }
                                                    inputProps={{
                                                      min: 0,
                                                      style: {
                                                        textAlign: "center",
                                                      },
                                                    }}
                                                    sx={{ width: 80 }}
                                                  />
                                                </TableCell>
                                                <TableCell
                                                  sx={{
                                                    fontWeight: "bold",
                                                    color: "#2563eb",
                                                  }}
                                                >
                                                  {subsubCalcScore.toFixed(1)}
                                                </TableCell>
                                                <TableCell>
                                                  <TextField
                                                    size="small"
                                                    fullWidth
                                                    placeholder="Link..."
                                                    value={
                                                      reportData[subsubKey]
                                                        ?.evidence || ""
                                                    }
                                                    onChange={(e) =>
                                                      updateReport(
                                                        subsubKey,
                                                        "evidence",
                                                        e.target.value,
                                                      )
                                                    }
                                                  />
                                                </TableCell>
                                              </>
                                            )}
                                            {(isSubmitted || isCompleted) && (
                                              <>
                                                <TableCell>
                                                  {existingSubSub?.quantity ||
                                                    0}
                                                </TableCell>
                                                <TableCell
                                                  sx={{
                                                    fontWeight: "bold",
                                                    color: "#2563eb",
                                                  }}
                                                >
                                                  {existingSubSub?.score || 0}
                                                </TableCell>
                                                <TableCell></TableCell>
                                              </>
                                            )}
                                            {(isPending ||
                                              okr.status === "NEGOTIATING") && (
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
                                                          subsub.id,
                                                        )
                                                      }
                                                      title="Chỉnh sửa"
                                                    >
                                                      <Edit
                                                        fontSize="small"
                                                        color="info"
                                                      />
                                                    </IconButton>
                                                    {isSubSubChanged && (
                                                      <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                          handleUndoItem(
                                                            "SUBSUBKR",
                                                            obj.id,
                                                            kr.id,
                                                            sub.id,
                                                            subsub.id,
                                                          )
                                                        }
                                                        title="Hoàn tác thay đổi"
                                                      >
                                                        <Undo
                                                          fontSize="small"
                                                          color="primary"
                                                        />
                                                      </IconButton>
                                                    )}
                                                    <IconButton
                                                      size="small"
                                                      onClick={() =>
                                                        setActiveChatId(
                                                          activeChatId ===
                                                            subsub.id
                                                            ? null
                                                            : subsub.id,
                                                        )
                                                      }
                                                    >
                                                      <Comment
                                                        fontSize="small"
                                                        color={
                                                          okr.proposedChanges?.[
                                                            subsub.id
                                                          ]?.length > 0 ||
                                                            localComments[subsub.id]
                                                              ?.length > 0
                                                            ? "primary"
                                                            : "inherit"
                                                        }
                                                      />
                                                    </IconButton>
                                                    <IconButton
                                                      size="small"
                                                      onClick={() =>
                                                        handleDeleteItem(
                                                          obj.id,
                                                          kr.id,
                                                          sub.id,
                                                          subsub.id,
                                                        )
                                                      }
                                                      title="Xóa tiêu chí con"
                                                    >
                                                      <Delete
                                                        fontSize="small"
                                                        color="error"
                                                      />
                                                    </IconButton>
                                                  </Box>
                                                </TableCell>
                                              )}
                                          </TableRow>
                                          <NegotiationChat
                                            itemId={subsub.id}
                                            activeChatId={activeChatId}
                                            history={[
                                              ...(okr.proposedChanges?.[
                                                subsub.id
                                              ] || []),
                                              ...(localComments[subsub.id] ||
                                                []),
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
                                    },
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {/* Deleted items at the end */}
                {deletedItems.length > 0 && (
                  <>
                    <TableRow>
                      <TableCell
                        colSpan={
                          isSubmitted || isCompleted ? 7 : canReport ? 7 : 5
                        }
                        sx={{
                          bgcolor: "#fee2e2",
                          fontWeight: "bold",
                          textAlign: "center",
                          color: "#b91c1c",
                        }}
                      >
                        Các tiêu chí đã bị xóa
                      </TableCell>
                    </TableRow>
                    {deletedItems.map((delItem, idx) => (
                      <TableRow key={`del-${idx}`} sx={{ bgcolor: "#fef2f2" }}>
                        <TableCell
                          sx={{
                            pl:
                              delItem.type === "OBJ"
                                ? 2
                                : delItem.type === "KR"
                                  ? 4
                                  : 8,
                            textDecoration: "line-through",
                            color: "error.main",
                          }}
                        >
                          {delItem.id}
                        </TableCell>
                        <TableCell
                          sx={{
                            textDecoration: "line-through",
                            color: "error.main",
                          }}
                        >
                          {delItem.title}
                        </TableCell>
                        <TableCell
                          sx={{
                            textDecoration: "line-through",
                            color: "error.main",
                          }}
                        >
                          {delItem.maxScore || "—"}
                        </TableCell>
                        <TableCell
                          sx={{
                            textDecoration: "line-through",
                            color: "error.main",
                          }}
                        >
                          {delItem.unitScore
                            ? `+${delItem.unitScore}/${delItem.unit || "đv"}`
                            : "—"}
                        </TableCell>
                        {canReport && (
                          <>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                          </>
                        )}
                        {(okr.status === "SUBMITTED" ||
                          okr.status === "COMPLETED") && (
                            <>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                            </>
                          )}
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleRestoreDeletedItem(delItem)}
                            title="Khôi phục"
                          >
                            <Undo fontSize="small" color="primary" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>

        </DialogContent>

        {((isPending || okr.status === "NEGOTIATING") || canReport || isCompleted) && (
          <DialogActions sx={{ p: 0, bgcolor: "#f1f5f9", display: "block" }}>
            {(isPending || okr.status === "NEGOTIATING") && (
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  bgcolor: "#f1f5f9",
                }}
              >
                {isPending && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Send />}
                    onClick={handleSendForApproval}
                  >
                    Gửi yêu cầu duyệt đề xuất
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Check />}
                  onClick={handleAccept}
                >
                  Tôi đồng ý Chấp nhận OKR này
                </Button>
              </Box>
            )}

            {canReport && (
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 2,
                  bgcolor: "#f1f5f9",
                }}
              >
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  <strong>Tổng điểm tự khai: {totalSelfScore.toFixed(1)}</strong>{" "}
                  / {maxScore} điểm
                </Typography>
                {draftSaveStatus === "saving" && (
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Đang lưu nháp...
                  </Typography>
                )}
                {draftSaveStatus === "saved" && (
                  <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                    Đã lưu nháp
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Save />}
                  onClick={handleSaveDraftManual}
                  disabled={draftSaveStatus === "saving"}
                >
                  Lưu
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleSubmitReport}
                  disabled={saving}
                >
                  {saving ? "Đang nộp..." : "Nộp bài tự khai"}
                </Button>
              </Box>
            )}

            {isCompleted && (
              <Box sx={{ p: 2, bgcolor: "#f0fdf4" }}>
                <Alert severity="success">
                  <strong>Điểm cuối cùng: {okr.totalScore} điểm</strong> — Đã được
                  Trưởng khoa duyệt.
                </Alert>
              </Box>
            )}
          </DialogActions>
        )}
      </Dialog>

      <AddCriteriaDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onSave={handleSaveNewCriteria}
        parentType={addParentType}
        title={newCriteriaTitle}
        setTitle={setNewCriteriaTitle}
        unitScore={newCriteriaUnitScore}
        setUnitScore={setNewCriteriaUnitScore}
        unit={newCriteriaUnit}
        setUnit={setNewCriteriaUnit}
      />

      {/* Dialog Sửa Tiêu chí */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa Tiêu chí</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Nội dung tiêu chí"
              fullWidth
              value={editCriteriaTitle}
              onChange={(e) => setEditCriteriaTitle(e.target.value)}
            />
            <TextField
              label="Điểm tối đa"
              type="number"
              fullWidth
              value={editCriteriaMaxScore}
              onChange={(e) => setEditCriteriaMaxScore(e.target.value)}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Điểm / Đơn vị"
                type="number"
                fullWidth
                value={editCriteriaUnitScore}
                onChange={(e) => setEditCriteriaUnitScore(e.target.value)}
              />
              <TextField
                label="Đơn vị tính"
                fullWidth
                value={editCriteriaUnit}
                onChange={(e) => setEditCriteriaUnit(e.target.value)}
                placeholder="VD: bài, đv, giờ..."
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveEditCriteria}>
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OkrCard;
