import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  CalendarMonth,
} from "@mui/icons-material";
import { api } from "../../../services/api";
import { confirmAction, showSuccess, showError } from "../../../utils/swal";
import { statusConfig } from "../okr.constants";
import NegotiationChat from "./NegotiationChat";
import AddCriteriaDialog from "./AddCriteriaDialog";
import { validateStructureScores } from "../../DepartmentOKR/components/TemplateEditorDialog";

interface OkrCardProps {
  okr: any;
  onRefresh: () => void;
}

const OkrCard: React.FC<OkrCardProps> = ({ okr, onRefresh }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Self-report state
  const [reportData, setReportData] = useState<
    Record<string, { quantity: number; evidence: string; score?: number }>
  >({});
  const [saving, setSaving] = useState(false);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [draftSaveStatus, setDraftSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

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
            <TableCell></TableCell>
          </>
        )}
        {(okr.status === "PENDING" || okr.status === "NEGOTIATING") && (
          <TableCell align="center"></TableCell>
        )}
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

  const isCycleStarted =
    okr.cycle?.bypassValidation ||
    okr.cycle?.status === "OPEN" ||
    (okr.cycle?.startDate
      ? new Date(new Date().setHours(0, 0, 0, 0)) >=
        new Date(new Date(okr.cycle.startDate).setHours(0, 0, 0, 0))
      : true);

  const canReport = isAccepted && isCycleStarted;

  useEffect(() => {
    setLocalStructure(Array.isArray(okr.keyResults) ? okr.keyResults : []);
    setHasChanges(false);

    // Kiểm tra bản nháp lưu tạm ở localStorage của trình duyệt
    const localDraftStr = localStorage.getItem(`okr_draft_${okr.id}`);
    if (localDraftStr) {
      try {
        const parsed = JSON.parse(localDraftStr);
        setReportData(parsed);
        setHasDraftChanges(true);
        return;
      } catch (e) {
        console.error("Lỗi khi đọc bản nháp từ localStorage", e);
      }
    }

    if (okr.selfReportData && typeof okr.selfReportData === "object") {
      setReportData(okr.selfReportData);
    } else {
      setReportData({});
    }
  }, [okr.selfReportData, okr.keyResults, okr.id]);

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
        const krCappedScore = Math.min(krCalcScore, Number(kr.maxScore) || Number(kr.unitScore) || Infinity);
        objRawScore += krCappedScore;

        kr.items?.forEach((sub: any) => {
          const subKey = `${obj.id}-${kr.id}-${sub.id}`;
          const subQty = reportData[subKey]?.quantity || 0;
          const subUnitScore = Number(sub.unitScore) || 0;
          const subCalcScore = subUnitScore > 0 ? subQty * subUnitScore : subQty;
          const subCappedScore = Math.min(subCalcScore, Number(sub.maxScore) || Number(sub.unitScore) || Infinity);
          objRawScore += subCappedScore;

          sub.items?.forEach((subsub: any) => {
            const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
            const subsubQty = reportData[subsubKey]?.quantity || 0;
            const subsubUnitScore = Number(subsub.unitScore) || 0;
            const subsubCalcScore = subsubUnitScore > 0 ? subsubQty * subsubUnitScore : subsubQty;
            const subsubCappedScore = Math.min(subsubCalcScore, Number(subsub.maxScore) || Number(subsub.unitScore) || Infinity);
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

  const calcObjectiveReportScore = (obj: any) => {
    let total = 0;
    obj.items?.forEach((kr: any) => {
      const krKey = `${obj.id}-${kr.id}`;
      const krQty = reportData[krKey]?.quantity || 0;
      const krUnitScore = Number(kr.unitScore) || 0;
      const krCalcScore = krUnitScore > 0 ? krQty * krUnitScore : krQty;
      const krCappedScore = Math.min(krCalcScore, Number(kr.maxScore) || Number(kr.unitScore) || Infinity);
      total += krCappedScore;

      kr.items?.forEach((sub: any) => {
        const subKey = `${obj.id}-${kr.id}-${sub.id}`;
        const subQty = reportData[subKey]?.quantity || 0;
        const subUnitScore = Number(sub.unitScore) || 0;
        const subCalcScore = subUnitScore > 0 ? subQty * subUnitScore : subQty;
        const subCappedScore = Math.min(subCalcScore, Number(sub.maxScore) || Number(sub.unitScore) || Infinity);
        total += subCappedScore;

        sub.items?.forEach((subsub: any) => {
          const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
          const subsubQty = reportData[subsubKey]?.quantity || 0;
          const subsubUnitScore = Number(subsub.unitScore) || 0;
          const subsubCalcScore = subsubUnitScore > 0 ? subsubQty * subsubUnitScore : subsubQty;
          const subsubCappedScore = Math.min(subsubCalcScore, Number(subsub.maxScore) || Number(subsub.unitScore) || Infinity);
          total += subsubCappedScore;
        });
      });
    });
    const max = Number(obj.maxScore) || 0;
    return max > 0 ? Math.min(total, max) : total;
  };

  const getManagerData = (key: string, kr: any) => {
    const mgrReport = okr.managerReportData || {};
    const qty = mgrReport[key]?.quantity || 0;
    const unitScore = Number(kr.unitScore) || 0;
    const score = Math.min(
      unitScore > 0 ? qty * unitScore : qty,
      Number(kr.maxScore) || Number(kr.unitScore) || Infinity
    );
    return { quantity: qty, score };
  };

  const calcObjectiveManagerScore = (obj: any) => {
    let total = 0;
    obj.items?.forEach((kr: any) => {
      const krKey = `${obj.id}-${kr.id}`;
      const krData = getManagerData(krKey, kr);
      total += krData.score;

      kr.items?.forEach((sub: any) => {
        const subKey = `${obj.id}-${kr.id}-${sub.id}`;
        const subData = getManagerData(subKey, sub);
        total += subData.score;

        sub.items?.forEach((subsub: any) => {
          const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
          const subsubData = getManagerData(subsubKey, subsub);
          total += subsubData.score;
        });
      });
    });
    const max = Number(obj.maxScore) || 0;
    return max > 0 ? Math.min(total, max) : total;
  };

  const calcObjectiveReportQty = (obj: any) => {
    let totalQty = 0;
    obj.items?.forEach((kr: any) => {
      const krKey = `${obj.id}-${kr.id}`;
      totalQty += reportData[krKey]?.quantity || 0;
      kr.items?.forEach((sub: any) => {
        const subKey = `${obj.id}-${kr.id}-${sub.id}`;
        totalQty += reportData[subKey]?.quantity || 0;
        sub.items?.forEach((subsub: any) => {
          const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
          totalQty += reportData[subsubKey]?.quantity || 0;
        });
      });
    });
    return totalQty;
  };

  const calcObjectiveSubmittedQty = (obj: any) => {
    let totalQty = 0;
    const selfReport = okr.selfReportData || {};
    obj.items?.forEach((kr: any) => {
      const krKey = `${obj.id}-${kr.id}`;
      totalQty += Number(selfReport[krKey]?.quantity) || 0;
      kr.items?.forEach((sub: any) => {
        const subKey = `${obj.id}-${kr.id}-${sub.id}`;
        totalQty += Number(selfReport[subKey]?.quantity) || 0;
        sub.items?.forEach((subsub: any) => {
          const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
          totalQty += Number(selfReport[subsubKey]?.quantity) || 0;
        });
      });
    });
    return totalQty;
  };

  const calcObjectiveManagerQty = (obj: any) => {
    let totalQty = 0;
    const mgrReport = okr.managerReportData || {};
    obj.items?.forEach((kr: any) => {
      const krKey = `${obj.id}-${kr.id}`;
      totalQty += Number(mgrReport[krKey]?.quantity) || 0;
      kr.items?.forEach((sub: any) => {
        const subKey = `${obj.id}-${kr.id}-${sub.id}`;
        totalQty += Number(mgrReport[subKey]?.quantity) || 0;
        sub.items?.forEach((subsub: any) => {
          const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
          totalQty += Number(mgrReport[subsubKey]?.quantity) || 0;
        });
      });
    });
    return totalQty;
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
      const isEn = localStorage.getItem("i18nextLng") === "en";
      showError(
        isEn ? "Error" : "Lỗi",
        isEn ? "Please enter content." : "Vui lòng nhập nội dung."
      );
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
      const isEn = localStorage.getItem("i18nextLng") === "en";
      showError(
        isEn ? "Error" : "Lỗi",
        isEn ? "Please enter content." : "Vui lòng nhập nội dung."
      );
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
    const isEn = localStorage.getItem("i18nextLng") === "en";
    const validationError = validateStructureScores(localStructure);
    if (validationError) {
      showError(
        isEn ? "OKR Score Structure Error" : "Lỗi cấu trúc điểm OKR",
        validationError
      );
      return;
    }
    try {
      await api.put(`/okrs/${okr.id}/structure`, {
        keyResults: localStructure,
        localComments:
          Object.keys(localComments).length > 0 ? localComments : undefined,
      });
      setHasChanges(false);
      setLocalComments({});
      onRefresh();
      showSuccess(
        isEn ? "Success" : "Thành công",
        isEn ? "New structure has been sent." : "Đã gửi cấu trúc mới."
      );
    } catch (error) {
      showError(
        isEn ? "Error" : "Lỗi",
        isEn ? "Unable to update structure." : "Không thể cập nhật cấu trúc."
      );
    }
  };

  const handleAccept = async () => {
    const isEn = localStorage.getItem("i18nextLng") === "en";
    const ok = await confirmAction({
      title: isEn ? "Accept OKR?" : "Chấp nhận OKR?",
      text: isEn ? "After accepting, you will start reporting scores." : "Sau khi chấp nhận, bạn sẽ bắt đầu tự khai điểm.",
      icon: "question",
      confirmText: isEn ? "Agree to accept" : "Đồng ý chấp nhận",
      confirmColor: "#16a34a",
    });
    if (!ok) return;
    try {
      await api.put(`/okrs/${okr.id}/accept`);
      onRefresh();
    } catch (error) {
      console.error(error);
      showError(
        isEn ? "Error" : "Lỗi",
        isEn ? "An error occurred while accepting the OKR." : "Có lỗi xảy ra khi chấp nhận OKR."
      );
    }
  };

  const handleSendForApproval = async () => {
    const isEn = localStorage.getItem("i18nextLng") === "en";
    const ok = await confirmAction({
      title: isEn ? "Send for approval?" : "Gửi yêu cầu duyệt?",
      text: isEn ? "Confirm sending this OKR approval request to Dean/Manager." : "Xác nhận gửi yêu cầu duyệt OKR này lên Trưởng khoa/Quản lý.",
      icon: "question",
      confirmText: isEn ? "Send request" : "Gửi yêu cầu",
      confirmColor: "#3b82f6",
    });
    if (!ok) return;
    try {
      await api.put(`/okrs/${okr.id}/send-for-approval`);
      onRefresh();
      showSuccess(
        isEn ? "Success" : "Thành công",
        isEn ? "OKR approval request sent." : "Đã gửi yêu cầu duyệt OKR."
      );
    } catch (error) {
      console.error(error);
      showError(
        isEn ? "Error" : "Lỗi",
        isEn ? "An error occurred while sending approval request." : "Có lỗi xảy ra khi gửi yêu cầu duyệt OKR."
      );
    }
  };

  const handleSendChat = async (itemId: string) => {
    if (!chatMessage.trim()) return;
    setChatLoading(true);
    const isEn = localStorage.getItem("i18nextLng") === "en";
    try {
      await api.post(`/okrs/${okr.id}/chat`, {
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
    } catch (error: any) {
      console.error("Lỗi gửi tin nhắn đàm phán", error);
      showError(
        isEn ? "Error" : "Lỗi",
        error?.response?.data?.message || (isEn ? "Unable to send message." : "Không thể gửi tin nhắn.")
      );
    } finally {
      setChatLoading(false);
    }
  };

  const updateReport = (
    krId: string,
    field: "quantity" | "evidence",
    value: any,
    maxScore?: number,
    unitScore?: number,
  ) => {
    let cleanValue = value;
    if (field === "quantity") {
      if (value === "") {
        cleanValue = 0;
      } else {
        const cleanStr = String(value).replace(/[^0-9]/g, "");
        const numVal = parseInt(cleanStr, 10) || 0;
        
        let effectiveMax = Number(maxScore);
        if (isNaN(effectiveMax) || effectiveMax <= 0) {
          effectiveMax = Number(unitScore);
          if (isNaN(effectiveMax) || effectiveMax <= 0) {
            effectiveMax = Infinity;
          }
        }
        
        let effectiveUnit = Number(unitScore);
        if (isNaN(effectiveUnit) || effectiveUnit <= 0) {
          effectiveUnit = 1;
        }

        const maxQty = Math.floor(effectiveMax / effectiveUnit);
        cleanValue = Math.min(numVal, maxQty);
      }
    }

    setReportData((prev) => {
      const next = {
        ...prev,
        [krId]: {
          ...prev[krId],
          [field]: cleanValue,
        },
      };
      // Lưu tạm bản nháp vào localStorage để tránh mất dữ liệu khi F5/reload
      localStorage.setItem(`okr_draft_${okr.id}`, JSON.stringify(next));
      return next;
    });
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

  // Reset trạng thái "Đã lưu" khi user thay đổi dữ liệu
  useEffect(() => {
    if (hasDraftChanges && draftSaveStatus === "saved") {
      setDraftSaveStatus("idle");
    }
  }, [hasDraftChanges]);

  const handleSaveDraftManual = async () => {
    setDraftSaveStatus("saving");
    const isEn = localStorage.getItem("i18nextLng") === "en";
    try {
      const enrichedReport = buildEnrichedReport();
      await api.put(`/okrs/${okr.id}/draft-report`, {
        selfReportData: enrichedReport,
      });
      const now = new Date();
      const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      setDraftSavedAt(timeStr);
      setDraftSaveStatus("saved");
      setHasDraftChanges(false);
      // Xóa bản nháp lưu tạm ở localStorage sau khi đã lưu thành công vào cơ sở dữ liệu
      localStorage.removeItem(`okr_draft_${okr.id}`);
    } catch (error) {
      console.error("Lỗi khi lưu nháp", error);
      setDraftSaveStatus("idle");
      showError(
        isEn ? "Error" : "Lỗi",
        isEn ? "Unable to save draft to the database." : "Không thể lưu nháp vào cơ sở dữ liệu."
      );
    }
  };

  const handleSubmitReport = async () => {
    const isEn = localStorage.getItem("i18nextLng") === "en";
    const ok = await confirmAction({
      title: isEn ? "Submit self-report?" : "Nộp bài tự khai?",
      text: isEn
        ? "After submitting, your report will be sent to the Dean for review. Are you sure?"
        : "Sau khi nộp, bài sẽ được gửi cho Trưởng khoa duyệt. Bạn chắc chắn chứ?",
      icon: "question",
      confirmText: isEn ? "Submit" : "Nộp bài",
      confirmColor: "#1976d2",
    });
    if (!ok) return;
    setSaving(true);

    const enrichedReport = buildEnrichedReport();

    try {
      await api.put(`/okrs/${okr.id}/self-report`, {
        selfReportData: enrichedReport,
      });
      // Xóa bản nháp lưu tạm ở localStorage sau khi đã nộp thành công
      localStorage.removeItem(`okr_draft_${okr.id}`);
      showSuccess(
        isEn ? "Success!" : "Thành công!",
        isEn ? "Self-report submitted successfully." : "Đã nộp bài tự khai thành công."
      );
      onRefresh();
    } catch (error) {
      console.error(error);
      showError(
        isEn ? "Error" : "Lỗi",
        isEn ? "An error occurred while submitting." : "Có lỗi xảy ra khi nộp bài."
      );
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
      return t("okrCard.negotiateAndEdit");
    }
    if (canReport) {
      return t("okrCard.reportScore");
    }
    return t("okrCard.viewDetails");
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
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 0.5 }}>
            <Typography variant="h6" fontWeight="bold" color="#1e3a8a" sx={{ lineHeight: 1.2, wordBreak: "break-word" }}>
              {okr.objective}
            </Typography>
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
              size={okr.status === "COMPLETED" ? "medium" : "small"}
              sx={
                okr.status === "COMPLETED"
                  ? {
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    px: 1.5,
                    py: 0.5,
                    boxShadow: "0 2px 8px rgba(46, 125, 50, 0.25)",
                    color: "#fff",
                    bgcolor: "#2e7d32",
                    flexShrink: 0,
                    mt: 0.25,
                  }
                  : { fontWeight: 500, flexShrink: 0, mt: 0.25 }
              }
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
            {/* {okr.createdAt && (
              <Chip
                icon={<CalendarMonth sx={{ fontSize: "0.85rem !important" }} />}
                label={`Ngày giao: ${new Date(okr.createdAt).toLocaleDateString("vi-VN")}`}
                size="small"
                variant="outlined"
                color="default"
                sx={{ fontWeight: 500 }}
              />
            )} */}
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
            {isCompleted ? (
              <>
                <Chip
                  label={`Tự chấm: ${totalSelfScore.toFixed(1)}/${maxScore}đ`}
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ fontWeight: "bold" }}
                />
                <Chip
                  label={`QL chấm: ${okr.managerScore?.toFixed(1) || 0}/${maxScore}đ`}
                  size="small"
                  color="success"
                  variant="filled"
                  sx={{ fontWeight: "bold", bgcolor: "#2e7d32", color: "#fff" }}
                />
              </>
            ) : isSubmitted ? (
              <>
                <Chip
                  label={`Tự chấm: ${totalSelfScore.toFixed(1)}/${maxScore}đ`}
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ fontWeight: "bold" }}
                />
                <Chip
                  label="Chờ chấm điểm"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ fontWeight: "bold" }}
                />
              </>
            ) : isAccepted ? (
              <Chip
                label={`Điểm dự kiến: ${totalSelfScore.toFixed(1)}/${maxScore}đ`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: "bold" }}
              />
            ) : null}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {draftSaveStatus === "saving" && (
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              {t("okrCard.saving")}
            </Typography>
          )}
          {draftSaveStatus === "saved" && draftSavedAt && (
            <Typography variant="caption" color="success.main" sx={{ mr: 1 }}>
              {t("okrCard.savedAt", { time: draftSavedAt })}
            </Typography>
          )}
          {hasDraftChanges && draftSaveStatus === "idle" && (
            <Typography variant="caption" color="warning.main" sx={{ mr: 1, fontWeight: "bold" }}>
              {t("okrCard.unsavedDraft")}
            </Typography>
          )}
          <Button
            size="small"
            variant={(okr.status === "PENDING" || okr.status === "NEGOTIATING" || canReport || okr.status === "COMPLETED") ? "contained" : "outlined"}
            color={
              (okr.status === "PENDING" || okr.status === "NEGOTIATING")
                ? "warning"
                : okr.status === "COMPLETED"
                  ? "success"
                  : canReport
                    ? "primary"
                    : "inherit"
            }
            onClick={() => setExpanded(true)}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              ...(okr.status === "COMPLETED" && {
                bgcolor: "#2e7d32",
                color: "#fff",
                "&:hover": {
                  bgcolor: "#1b5e20"
                }
              })
            }}
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
          {t("okrCard.assignedOkrFramework")}
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
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  {isCompleted ? (
                    <>
                      <Chip
                        label={`Tự khai: ${calcObjectiveScore(obj).toFixed(1)}đ`}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ height: 24, fontSize: "0.75rem", fontWeight: "bold" }}
                      />
                      <Chip
                        label={`QL chốt: ${calcObjectiveManagerScore(obj).toFixed(1)}đ`}
                        size="small"
                        color="success"
                        sx={{ height: 24, fontSize: "0.75rem", fontWeight: "bold", bgcolor: "#2e7d32", color: "white" }}
                      />
                    </>
                  ) : isSubmitted ? (
                    <Chip
                      label={`Tự khai: ${calcObjectiveScore(obj).toFixed(1)}đ`}
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ height: 24, fontSize: "0.75rem", fontWeight: "bold" }}
                    />
                  ) : canReport ? (
                    <Chip
                      label={`Tự khai: ${calcObjectiveReportScore(obj).toFixed(1)}đ`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 24, fontSize: "0.75rem", fontWeight: "bold" }}
                    />
                  ) : null}
                  <Chip
                    label={`Tối đa: ${obj.maxScore} điểm`}
                    size="small"
                    color="primary"
                    sx={{ height: 24, fontSize: "0.75rem", fontWeight: "bold", bgcolor: "#1e3a8a" }}
                  />
                </Box>
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
          <Box>{t("okrCard.detailsTitle")}: {okr.objective}</Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {canReport && draftSaveStatus === "saving" && (
              <Typography variant="caption" sx={{ color: "#fef08a", mr: 1 }}>
                {t("okrCard.saving")}
              </Typography>
            )}
            {canReport && draftSaveStatus === "saved" && draftSavedAt && (
              <Typography variant="caption" sx={{ color: "#86efac", mr: 1 }}>
                {t("okrCard.savedAt", { time: draftSavedAt })}
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
                {localStorage.getItem("i18nextLng") === "en" ? "Submit Changes & Request Approval" : "Gửi thay đổi & Yêu cầu duyệt"}
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
                {localStorage.getItem("i18nextLng") === "en" ? (
                  <>
                    Evaluation cycle has not started yet (Expected start:{" "}
                    <strong>
                      {new Date(okr.cycle.startDate).toLocaleDateString("en-US")}
                    </strong>
                    ). You cannot report scores at this moment.
                  </>
                ) : (
                  <>
                    Kỳ đánh giá chưa bắt đầu (Dự kiến bắt đầu từ{" "}
                    <strong>
                      {new Date(okr.cycle.startDate).toLocaleDateString("vi-VN")}
                    </strong>
                    ). Bạn chưa thể tự khai điểm lúc này.
                  </>
                )}
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
                    {t("okrCard.tableHeaders.no")}
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", width: "30%" }}
                  >
                    {t("okrCard.tableHeaders.content")}
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", width: "10%" }}
                  >
                    {t("okrCard.tableHeaders.maxScore")}
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", width: "12%" }}
                  >
                    {t("okrCard.tableHeaders.scorePerUnit")}
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
                        {t("okrCard.tableHeaders.selfReportQty")}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "10%",
                        }}
                      >
                        {t("okrCard.tableHeaders.conversion")}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "21%",
                        }}
                      >
                        {t("okrCard.tableHeaders.evidence")}
                      </TableCell>
                    </>
                  )}
                  {(isSubmitted || isCompleted) && (
                    <>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "8%",
                          textAlign: "center",
                        }}
                      >
                        {t("okrCard.tableHeaders.selfReportQtySubmitted")}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "8%",
                          textAlign: "center",
                        }}
                      >
                        {t("okrCard.tableHeaders.selfScoreSubmitted")}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "8%",
                          textAlign: "center",
                        }}
                      >
                        {t("okrCard.tableHeaders.managerQtyApproved")}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          width: "8%",
                          textAlign: "center",
                        }}
                      >
                        {t("okrCard.tableHeaders.managerScoreApproved")}
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
                      {t("okrCard.tableHeaders.negotiation")}
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
                                            Number(kr.unitScore) || undefined,
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
                                    {Number(kr.unitScore) > 0 ? Math.min(krCalcScore, Number(kr.maxScore) || Number(kr.unitScore) || Infinity).toFixed(1) : "—"}
                                  </TableCell>
                                  <TableCell>
                                    {Number(kr.unitScore) > 0 ? (
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
                                                  Number(sub.unitScore) || undefined,
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
                                          {Number(sub.unitScore) > 0 ? Math.min(subCalcScore, Number(sub.maxScore) || Number(sub.unitScore) || Infinity).toFixed(1) : "—"}
                                        </TableCell>
                                        <TableCell>
                                          {Number(sub.unitScore) > 0 ? (
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
                                                          Number(subsub.unitScore) || undefined,
                                                        )
                                                      }
                                                      onKeyDown={(e) => {
                                                        if (["-", ".", "e", "E", "+", ","].includes(e.key)) {
                                                          e.preventDefault();
                                                        }
                                                      }}
                                                      inputProps={{
                                                        min: 0,
                                                        style: {
                                                          textAlign: "center",
                                                        },
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
                                                  {Number(subsub.unitScore) > 0 ? Math.min(subsubCalcScore, Number(subsub.unitScore) || Infinity).toFixed(1) : "—"}
                                                </TableCell>
                                                <TableCell>
                                                  {Number(subsub.unitScore) > 0 ? (
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
                          isSubmitted || isCompleted ? 8 : canReport ? 7 : 5
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
                              <TableCell></TableCell>
                            </>
                          )}
                        {(isPending || okr.status === "NEGOTIATING") && (
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleRestoreDeletedItem(delItem)}
                              title="Khôi phục"
                            >
                              <Undo fontSize="small" color="primary" />
                            </IconButton>
                          </TableCell>
                        )}
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
                    {localStorage.getItem("i18nextLng") === "en" ? "Send request for proposal approval" : "Gửi yêu cầu duyệt đề xuất"}
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Check />}
                  onClick={handleAccept}
                >
                  {localStorage.getItem("i18nextLng") === "en" ? "I agree to accept this OKR" : "Tôi đồng ý Chấp nhận OKR này"}
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
                  <strong>{t("okrCard.totalSelfScore")} {totalSelfScore.toFixed(1)}</strong>{" "}
                  / {maxScore} {localStorage.getItem("i18nextLng") === "en" ? "points" : "điểm"}
                </Typography>
                {draftSaveStatus === "saving" && (
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    {t("okrCard.saving")}
                  </Typography>
                )}
                {draftSaveStatus === "saved" && draftSavedAt && (
                  <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                    {t("okrCard.savedAt", { time: draftSavedAt })}
                  </Typography>
                )}
                {hasDraftChanges && draftSaveStatus === "idle" && (
                  <Typography variant="body2" color="warning.main" sx={{ mr: 1, fontWeight: "bold" }}>
                    {t("okrCard.unsavedDraft")}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Save />}
                  onClick={handleSaveDraftManual}
                  disabled={draftSaveStatus === "saving"}
                >
                  {t("okrCard.save")}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleSubmitReport}
                  disabled={saving}
                >
                  {saving
                    ? (localStorage.getItem("i18nextLng") === "en" ? "Submitting..." : "Đang nộp...")
                    : t("okrCard.submit")}
                </Button>
              </Box>
            )}

            {isCompleted && (
              <Box sx={{ p: 2, bgcolor: "#f0fdf4" }}>
                <Alert severity="success">
                  {localStorage.getItem("i18nextLng") === "en" ? (
                    <>
                      <strong>Final Score: {okr.totalScore} points</strong> — Approved by Dean.
                    </>
                  ) : (
                    <>
                      <strong>Điểm cuối cùng: {okr.totalScore} điểm</strong> — Đã được Trưởng khoa duyệt.
                    </>
                  )}
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
        <DialogTitle>{localStorage.getItem("i18nextLng") === "en" ? "Edit Criteria" : "Chỉnh sửa Tiêu chí"}</DialogTitle>
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
              disabled={editItemInfo?.type !== "OBJ"}
              onKeyDown={(e) => {
                if (["-", ".", "e", "E", "+", ","].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Điểm / Đơn vị"
                type="number"
                fullWidth
                value={editCriteriaUnitScore}
                onChange={(e) => setEditCriteriaUnitScore(e.target.value)}
                onKeyDown={(e) => {
                  if (["-", ".", "e", "E", "+", ","].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
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
