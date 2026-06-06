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
  Send,
  Save,
  Close,
  Undo,
  Forum,
} from "@mui/icons-material";
import { api } from "../../../services/api";
import { confirmAction, showSuccess, showError } from "../../../utils/swal";
import { statusConfig } from "../okr.constants";
import AddCriteriaDialog from "./AddCriteriaDialog";
import { validateStructureScores } from "../../DepartmentOKR/components/TemplateEditorDialog";
import { useOkrCalculations } from "./OkrCard/useOkrCalculations";
import {
  OkrObjectiveRow,
  OkrKeyResultRow,
  OkrSubKeyResultRow,
  OkrSubSubKeyResultRow,
} from "./OkrCard/OkrRows";

interface OkrCardProps {
  okr: any;
  onRefresh: () => void;
}

const OkrCard: React.FC<OkrCardProps> = ({ okr, onRefresh }) => {
  const { t, i18n } = useTranslation();
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

    // Find Objective
    const obj = originalStructure.find(
      (o: any) => String(o.id) === String(objId),
    );
    if (!obj) return null;

    if (krId === undefined) {
      return obj;
    }

    // Find KR
    const kr = obj.items?.find((k: any) => String(k.id) === String(krId));
    if (!kr) return null;

    if (subId === undefined) {
      return kr;
    }

    // Find Sub-KR
    const sub = kr.items?.find((s: any) => String(s.id) === String(subId));
    if (!sub || subsubId === undefined) {
      return sub || null;
    }

    // Find Sub-Sub-KR
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
        // List all children of the deleted OBJ
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
          // List all children of the deleted KR
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
            // List all children of the deleted SubKR
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

    // Check for locally saved draft in browser localStorage
    const localDraftStr = localStorage.getItem(`okr_draft_${okr.id}`);
    if (localDraftStr) {
      try {
        const parsed = JSON.parse(localDraftStr);
        setReportData(parsed);
        setHasDraftChanges(true);
        return;
      } catch (e) {
        console.error("Error reading draft from localStorage", e);
      }
    }

    if (okr.selfReportData && typeof okr.selfReportData === "object") {
      setReportData(okr.selfReportData);
    } else {
      setReportData({});
    }
  }, [okr.selfReportData, okr.keyResults, okr.id]);

  const {
    calcTotalScore,
    calcMaxScore,
    calcObjectiveScore,
    calcObjectiveReportScore,
    calcObjectiveManagerScore,
    calcObjectiveReportQty,
    calcObjectiveSubmittedQty,
    calcObjectiveManagerQty,
    getManagerData,
  } = useOkrCalculations(localStructure, reportData, okr);

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
      showError(
        t("okrCard.errors.errorTitle"),
        t("okrCard.errors.enterContent")
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
      showError(
        t("okrCard.errors.errorTitle"),
        t("okrCard.errors.enterContent")
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
    const validationError = validateStructureScores(localStructure);
    if (validationError) {
      showError(
        t("okrCard.errors.scoreStructure"),
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
        t("okrCard.alerts.success"),
        t("okrCard.alerts.structureUpdated")
      );
    } catch (error) {
      showError(
        t("okrCard.errors.errorTitle"),
        t("okrCard.alerts.structureUpdateFailed")
      );
    }
  };

  const handleAccept = async () => {
    const ok = await confirmAction({
      title: t("okrCard.alerts.acceptTitle"),
      text: t("okrCard.alerts.acceptText"),
      icon: "question",
      confirmText: t("okrCard.alerts.acceptConfirm"),
      confirmColor: "#16a34a",
    });
    if (!ok) return;
    try {
      await api.put(`/okrs/${okr.id}/accept`);
      onRefresh();
    } catch (error) {
      console.error(error);
      showError(
        t("okrCard.errors.errorTitle"),
        t("okrCard.alerts.acceptError")
      );
    }
  };

  const handleSendForApproval = async () => {
    const ok = await confirmAction({
      title: t("okrCard.alerts.sendApprovalTitle"),
      text: t("okrCard.alerts.sendApprovalText"),
      icon: "question",
      confirmText: t("okrCard.alerts.sendApprovalConfirm"),
      confirmColor: "#3b82f6",
    });
    if (!ok) return;
    try {
      await api.put(`/okrs/${okr.id}/send-for-approval`);
      onRefresh();
      showSuccess(
        t("okrCard.alerts.success"),
        t("okrCard.alerts.sendApprovalSuccess")
      );
    } catch (error) {
      console.error(error);
      showError(
        t("okrCard.errors.errorTitle"),
        t("okrCard.alerts.sendApprovalError")
      );
    }
  };

  const handleSendChat = async (itemId: string) => {
    if (!chatMessage.trim()) return;
    setChatLoading(true);
    try {
      await api.post(`/okrs/${okr.id}/chat`, {
        itemId,
        sender: "USER",
        message: chatMessage,
      });
      // Update local state to display the message immediately
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
      console.error("Error sending negotiation message", error);
      showError(
        t("okrCard.errors.errorTitle"),
        error?.response?.data?.message || t("okrCard.alerts.sendMessageError")
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
      // Save draft to localStorage to prevent data loss on F5/reload
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

  // Reset "Saved" status when user modifies data
  useEffect(() => {
    if (hasDraftChanges && draftSaveStatus === "saved") {
      setDraftSaveStatus("idle");
    }
  }, [hasDraftChanges]);

  const handleSaveDraftManual = async () => {
    setDraftSaveStatus("saving");
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
      // Remove locally saved draft from localStorage after successful save to database
      localStorage.removeItem(`okr_draft_${okr.id}`);
    } catch (error) {
      console.error("Error saving draft", error);
      setDraftSaveStatus("idle");
      showError(
        t("okrCard.errors.errorTitle"),
        t("okrCard.alerts.saveDraftError")
      );
    }
  };

  const handleSubmitReport = async () => {
    const ok = await confirmAction({
      title: t("okrCard.alerts.submitReportTitle"),
      text: t("okrCard.alerts.submitReportText"),
      icon: "question",
      confirmText: t("okrCard.alerts.submitReportConfirm"),
      confirmColor: "#1976d2",
    });
    if (!ok) return;
    setSaving(true);

    const enrichedReport = buildEnrichedReport();

    try {
      await api.put(`/okrs/${okr.id}/self-report`, {
        selfReportData: enrichedReport,
      });
      // Remove locally saved draft from localStorage after successful submission
      localStorage.removeItem(`okr_draft_${okr.id}`);
      showSuccess(
        t("okrCard.alerts.success") + "!",
        t("okrCard.alerts.submitReportSuccess")
      );
      onRefresh();
    } catch (error) {
      console.error(error);
      showError(
        t("okrCard.errors.errorTitle"),
        t("okrCard.alerts.submitReportError")
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
                  ? t("okrCard.awaitingCycleStart")
                  : t(statusConfig[okr.status]?.labelKey) || okr.status
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
                  label={t("okrCard.chips.selfScore", { score: totalSelfScore.toFixed(1), max: maxScore })}
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ fontWeight: "bold" }}
                />
                <Chip
                  label={t("okrCard.chips.managerScore", { score: okr.managerScore?.toFixed(1) || 0, max: maxScore })}
                  size="small"
                  color="success"
                  variant="filled"
                  sx={{ fontWeight: "bold", bgcolor: "#2e7d32", color: "#fff" }}
                />
              </>
            ) : isSubmitted ? (
              <>
                <Chip
                  label={t("okrCard.chips.selfScore", { score: totalSelfScore.toFixed(1), max: maxScore })}
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ fontWeight: "bold" }}
                />
                <Chip
                  label={t("okrCard.chips.waitingGrading")}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ fontWeight: "bold" }}
                />
              </>
            ) : isAccepted ? (
              <Chip
                label={t("okrCard.chips.expectedScoreChip", { score: totalSelfScore.toFixed(1), max: maxScore })}
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
              {t("okrCard.completionProgress")}
            </Typography>
            <Typography variant="caption" fontWeight="bold" color="primary.main">
              {progressPercent.toFixed(0)}% ({displayScore.toFixed(1)}/{maxScore} {t("okrCard.points")})
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
                      label={t("okrCard.commentsCount", { count: objCommentsCount })}
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
                        label={t("okrCard.chips.selfReported", { score: calcObjectiveScore(obj).toFixed(1) })}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ height: 24, fontSize: "0.75rem", fontWeight: "bold" }}
                      />
                      <Chip
                        label={t("okrCard.chips.managerFinal", { score: calcObjectiveManagerScore(obj).toFixed(1) })}
                        size="small"
                        color="success"
                        sx={{ height: 24, fontSize: "0.75rem", fontWeight: "bold", bgcolor: "#2e7d32", color: "white" }}
                      />
                    </>
                  ) : isSubmitted ? (
                    <Chip
                      label={t("okrCard.chips.selfReported", { score: calcObjectiveScore(obj).toFixed(1) })}
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ height: 24, fontSize: "0.75rem", fontWeight: "bold" }}
                    />
                  ) : canReport ? (
                    <Chip
                      label={t("okrCard.chips.selfReported", { score: calcObjectiveReportScore(obj).toFixed(1) })}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 24, fontSize: "0.75rem", fontWeight: "bold" }}
                    />
                  ) : null}
                  <Chip
                    label={t("okrCard.chips.maxScore", { score: obj.maxScore })}
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
                {t("okrCard.submitChangesBtn")}
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
                <span dangerouslySetInnerHTML={{
                  __html: t("okrCard.cycleNotStartedYet", {
                    date: `<strong>${new Date(okr.cycle.startDate).toLocaleDateString(i18n.language === "en" ? "en-US" : "vi-VN")}</strong>`
                  })
                }} />
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
                  const sharedProps = {
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
                    t,
                  };

                  return (
                    <React.Fragment key={obj.id || oIndex}>
                      <OkrObjectiveRow
                        {...sharedProps}
                        obj={obj}
                        oIndex={oIndex}
                        calcObjectiveReportQty={calcObjectiveReportQty}
                        calcObjectiveReportScore={calcObjectiveReportScore}
                        calcObjectiveSubmittedQty={calcObjectiveSubmittedQty}
                        calcObjectiveScore={calcObjectiveScore}
                        calcObjectiveManagerQty={calcObjectiveManagerQty}
                        calcObjectiveManagerScore={calcObjectiveManagerScore}
                      />

                      {obj.items?.map((kr: any, kIndex: number) => (
                        <React.Fragment key={`${oIndex}-${kIndex}`}>
                          <OkrKeyResultRow
                            {...sharedProps}
                            obj={obj}
                            kr={kr}
                            kIndex={kIndex}
                            getManagerData={getManagerData}
                          />

                          {kr.items?.map((sub: any, sIndex: number) => (
                            <React.Fragment key={`${oIndex}-${kIndex}-${sIndex}`}>
                              <OkrSubKeyResultRow
                                {...sharedProps}
                                obj={obj}
                                kr={kr}
                                sub={sub}
                                sIndex={sIndex}
                                getManagerData={getManagerData}
                              />

                              {sub.items?.map((subsub: any, ssIndex: number) => (
                                <OkrSubSubKeyResultRow
                                  {...sharedProps}
                                  obj={obj}
                                  kr={kr}
                                  sub={sub}
                                  subsub={subsub}
                                  ssIndex={ssIndex}
                                  getManagerData={getManagerData}
                                />
                              ))}
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
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
                        {t("okrCard.deletedCriteria")}
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
                            ? `+${delItem.unitScore}/${delItem.unit || t("okrCard.unit")}`
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
                              title={t("okrCard.tooltips.restore")}
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
                    {t("okrCard.sendProposalApproval")}
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Check />}
                  onClick={handleAccept}
                >
                  {t("okrCard.agreeToAccept")}
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
                  / {maxScore} {t("okrCard.points")}
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
                  {saving ? t("okrCard.submitting") : t("okrCard.submit")}
                </Button>
              </Box>
            )}

            {isCompleted && (
              <Box sx={{ p: 2, bgcolor: "#f0fdf4" }}>
                <Alert severity="success">
                  <span dangerouslySetInnerHTML={{
                    __html: t("okrCard.finalScoreApproved", { score: okr.totalScore })
                  }} />
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

      {/* Edit Criteria Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("okrCard.dialogs.editCriteria.title")}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label={t("okrCard.dialogs.editCriteria.contentLabel")}
              fullWidth
              value={editCriteriaTitle}
              onChange={(e) => setEditCriteriaTitle(e.target.value)}
            />
            <TextField
              label={t("okrCard.dialogs.editCriteria.maxScoreLabel")}
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
                label={t("okrCard.dialogs.editCriteria.unitScoreLabel")}
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
                label={t("okrCard.dialogs.editCriteria.unitLabel")}
                fullWidth
                value={editCriteriaUnit}
                onChange={(e) => setEditCriteriaUnit(e.target.value)}
                placeholder={t("okrCard.dialogs.editCriteria.unitPlaceholder")}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>{t("okrCard.dialogs.editCriteria.cancel")}</Button>
          <Button variant="contained" onClick={handleSaveEditCriteria}>
            {t("okrCard.dialogs.editCriteria.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OkrCard;
