import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Save,
  Undo,
  Check,
} from "@mui/icons-material";
import { api } from "../../../services/api";
import { showError, showSuccess } from "../../../utils/swal";
import AddCriteriaDialog from "../../MyOkr/components/AddCriteriaDialog";
import { validateStructureScores } from "./TemplateEditorDialog";
import { useTranslation } from "react-i18next";
import { OkrManagerOldRow } from "./OkrManagerTree/OkrManagerOldRow";
import { OkrManagerChatRow } from "./OkrManagerTree/OkrManagerChatRow";
import {
  OkrManagerObjectiveRow,
  OkrManagerKeyResultRow,
  OkrManagerSubKeyResultRow,
  OkrManagerSubSubKeyResultRow,
} from "./OkrManagerTree/OkrManagerRows";

export default function OkrManagerTree({
  okr,
  onRefresh,
}: {
  okr: any;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [localStructure, setLocalStructure] = useState<any[]>(
    Array.isArray(okr.keyResults) ? okr.keyResults : [],
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [localComments, setLocalComments] = useState<Record<string, any[]>>({});

  // Edit/Add Criteria States
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addParentType, setAddParentType] = useState<"KR" | "SUBKR" | null>(
    null,
  );
  const [addObjectiveId, setAddObjectiveId] = useState<string | null>(null);
  const [addKrId, setAddKrId] = useState<string | null>(null);
  const [newCriteriaTitle, setNewCriteriaTitle] = useState("");
  const [newCriteriaUnitScore, setNewCriteriaUnitScore] = useState("");
  const [newCriteriaUnit, setNewCriteriaUnit] = useState("");

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
  const [localOriginalStructure, setLocalOriginalStructure] = useState<
    any[] | null
  >(
    okr.proposedChanges?.originalStructure
      ? JSON.parse(JSON.stringify(okr.proposedChanges.originalStructure))
      : null,
  );
  const originalStructure = localOriginalStructure;

  // Sync state khi okr prop thay đổi (fix: useState chỉ dùng initial value lần đầu mount)
  useEffect(() => {
    setLocalStructure(Array.isArray(okr.keyResults) ? okr.keyResults : []);
    setLocalOriginalStructure(
      okr.proposedChanges?.originalStructure
        ? JSON.parse(JSON.stringify(okr.proposedChanges.originalStructure))
        : null,
    );
    setHasChanges(false);
    setLocalComments({});
  }, [okr.keyResults, okr.proposedChanges]);

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
    if (!kr || subId === undefined) {
      return kr || null;
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

  const deletedItems: any[] = [];
  if (originalStructure) {
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

  const handleSendChat = async (itemId: string) => {
    if (!chatMessage.trim()) return;
    setChatLoading(true);
    try {
      await api.post(`/okrs/${okr.id}/chat`, {
        itemId,
        sender: "MANAGER",
        message: chatMessage,
      });
      const newMessage = {
        message: chatMessage,
        sender: "MANAGER",
        createdAt: new Date().toISOString(),
      };
      setLocalComments((prev) => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), newMessage],
      }));
      setChatMessage("");
    } catch (error: any) {
      console.error(t("departmentOkr.managerTree.chat.errorSend"), error);
      showError(t("departmentOkr.managerTree.swal.errorTitle"), error?.response?.data?.message || t("departmentOkr.managerTree.chat.errorSendMsg"));
    } finally {
      setChatLoading(false);
    }
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
      showError(t("departmentOkr.managerTree.swal.errorTitle"), t("departmentOkr.managerTree.chat.errorInputRequired"));
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
        if (kr) {
          const sub = kr.items?.find(
            (s: any) => String(s.id) === String(subId),
          );
          if (sub && sub.items) {
            sub.items = sub.items.filter(
              (ss: any) => String(ss.id) !== String(subsubId),
            );
          }
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

  const handleAcceptItem = (
    type: "OBJ" | "KR" | "SUBKR" | "SUBSUBKR",
    objId: string,
    krId?: string,
    subId?: string,
    subsubId?: string,
  ) => {
    let currentOrig = localOriginalStructure;
    if (!currentOrig) {
      currentOrig = JSON.parse(JSON.stringify(localStructure));
    }

    const newOrig = JSON.parse(JSON.stringify(currentOrig));

    // Helper to find parent in original structure
    const findParentInOrig = () => {
      const obj = newOrig.find((o: any) => String(o.id) === String(objId));
      if (type === "KR") return obj;
      if (type === "SUBKR") {
        return obj?.items?.find((k: any) => String(k.id) === String(krId));
      }
      if (type === "SUBSUBKR") {
        const kr = obj?.items?.find((k: any) => String(k.id) === String(krId));
        return kr?.items?.find((s: any) => String(s.id) === String(subId));
      }
      return null;
    };

    // Helper to find item in localStructure (current proposed state)
    const findItemInLocal = () => {
      const obj = localStructure.find(
        (o: any) => String(o.id) === String(objId),
      );
      if (type === "OBJ") return obj;
      const kr = obj?.items?.find((k: any) => String(k.id) === String(krId));
      if (type === "KR") return kr;
      const sub = kr?.items?.find((s: any) => String(s.id) === String(subId));
      if (type === "SUBKR") return sub;
      return sub?.items?.find((ss: any) => String(ss.id) === String(subsubId));
    };

    const localItem = findItemInLocal();
    if (!localItem) return;

    // Check if it already exists in original structure
    let origItem: any = null;
    const origObj = newOrig.find((o: any) => String(o.id) === String(objId));
    if (type === "OBJ") {
      origItem = origObj;
    } else if (type === "KR") {
      origItem = origObj?.items?.find(
        (k: any) => String(k.id) === String(krId),
      );
    } else if (type === "SUBKR") {
      const origKr = origObj?.items?.find(
        (k: any) => String(k.id) === String(krId),
      );
      origItem = origKr?.items?.find(
        (s: any) => String(s.id) === String(subId),
      );
    } else if (type === "SUBSUBKR") {
      const origKr = origObj?.items?.find(
        (k: any) => String(k.id) === String(krId),
      );
      const origSub = origKr?.items?.find(
        (s: any) => String(s.id) === String(subId),
      );
      origItem = origSub?.items?.find(
        (ss: any) => String(ss.id) === String(subsubId),
      );
    }

    if (origItem) {
      // 1. Cập nhật đè (Accept change)
      origItem.title = localItem.title;
      origItem.maxScore = localItem.maxScore;
      origItem.unitScore = localItem.unitScore;
      origItem.unit = localItem.unit;
      origItem.isEdited = false;
      origItem.isNew = false;
    } else {
      // 2. Thêm mới vào original structure
      const parent = findParentInOrig();
      if (parent) {
        if (!parent.items) parent.items = [];
        const newItemCloned = JSON.parse(JSON.stringify(localItem));
        newItemCloned.isNew = false;
        newItemCloned.isEdited = false;
        parent.items.push(newItemCloned);

        // Sắp xếp lại thứ tự theo ID
        parent.items.sort((a: any, b: any) => {
          const partsA = String(a.id).split(".");
          const partsB = String(b.id).split(".");
          const numA = parseFloat(partsA[partsA.length - 1]);
          const numB = parseFloat(partsB[partsB.length - 1]);
          return (isNaN(numA) ? 0 : numA) - (isNaN(numB) ? 0 : numB);
        });
      }
    }

    // Gỡ cờ isEdited khỏi localStructure cho item này để mất màu vàng
    const newLocalStructure = JSON.parse(JSON.stringify(localStructure));
    const updateLocalItem = (items: any[]) => {
      for (const item of items) {
        if (
          (type === "OBJ" && String(item.id) === String(objId)) ||
          (type === "KR" && String(item.id) === String(krId)) ||
          (type === "SUBKR" && String(item.id) === String(subId)) ||
          (type === "SUBSUBKR" && String(item.id) === String(subsubId))
        ) {
          item.isEdited = false;
          item.isNew = false;
          return true;
        }
        if (item.items && updateLocalItem(item.items)) return true;
      }
      return false;
    };
    updateLocalItem(newLocalStructure);

    setLocalStructure(newLocalStructure);
    setLocalOriginalStructure(newOrig);
    setHasChanges(true);
  };

  const handleAcceptDeleteOriginalItem = (delItem: any) => {
    if (!localOriginalStructure) return;
    const { type, objId, krId, subId } = delItem;
    const newOrig = JSON.parse(JSON.stringify(localOriginalStructure));

    if (type === "OBJ") {
      const idx = newOrig.findIndex((o: any) => String(o.id) === String(objId));
      if (idx !== -1) newOrig.splice(idx, 1);
    } else if (type === "KR") {
      const obj = newOrig.find((o: any) => String(o.id) === String(objId));
      if (obj && obj.items) {
        obj.items = obj.items.filter(
          (k: any) => String(k.id) !== String(krId),
        );
      }
    } else if (type === "SUBKR") {
      const obj = newOrig.find((o: any) => String(o.id) === String(objId));
      if (obj) {
        const kr = obj.items?.find((k: any) => String(k.id) === String(krId));
        if (kr && kr.items) {
          kr.items = kr.items.filter(
            (s: any) => String(s.id) !== String(subId),
          );
        }
      }
    } else if (type === "SUBSUBKR") {
      const obj = newOrig.find((o: any) => String(o.id) === String(objId));
      if (obj) {
        const kr = obj.items?.find((k: any) => String(k.id) === String(krId));
        if (kr) {
          const sub = kr.items?.find(
            (s: any) => String(s.id) === String(subId),
          );
          if (sub && sub.items) {
            sub.items = sub.items.filter(
              (ss: any) => String(ss.id) !== String(delItem.subsubId),
            );
          }
        }
      }
    }

    setLocalOriginalStructure(newOrig);
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
      showError(t("departmentOkr.managerTree.swal.errorTitle"), t("departmentOkr.managerTree.chat.errorInputRequired"));
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
    const validationError = validateStructureScores(localStructure, t);
    if (validationError) {
      showError(t("departmentOkr.managerTree.swal.validationErrorTitle"), validationError);
      return;
    }
    try {
      await api.put(`/okrs/${okr.id}/manager-structure`, {
        keyResults: localStructure,
        localComments:
          Object.keys(localComments).length > 0 ? localComments : undefined,
        originalStructure: localOriginalStructure,
      });
      setHasChanges(false);
      setLocalComments({});
      onRefresh();
      showSuccess(t("departmentOkr.managerTree.swal.successTitle"), t("departmentOkr.managerTree.swal.successSave"));
    } catch (error) {
      showError(t("departmentOkr.managerTree.swal.errorTitle"), t("departmentOkr.managerTree.swal.errorSave"));
    }
  };

  return (
    <Box>
      {hasChanges && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitChanges}
            startIcon={<Save />}
          >
            {t("departmentOkr.managerTree.buttons.saveStructure")}
          </Button>
        </Box>
      )}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid #e2e8f0" }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f1f5f9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                {t("departmentOkr.managerTree.table.code")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "45%" }}>
                {t("departmentOkr.managerTree.table.content")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                {t("departmentOkr.managerTree.table.maxScore")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                {t("departmentOkr.managerTree.table.unitScore")}
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", width: "15%", textAlign: "center" }}
              >
                {t("departmentOkr.managerTree.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {localStructure.map((obj: any, oIndex: number) => {
              const oldObj = findOriginalItem(obj.id);
              const isObjChanged = hasChanged(obj, oldObj);

              return (
                <React.Fragment key={obj.id || oIndex}>
                  {isObjChanged && <OkrManagerOldRow oldItem={oldObj} indent={2} />}
                  <OkrManagerObjectiveRow
                    obj={obj}
                    isObjChanged={isObjChanged}
                    handleOpenAddDialog={handleOpenAddDialog}
                    handleUndoItem={handleUndoItem}
                    handleOpenEditDialog={handleOpenEditDialog}
                    activeChatId={activeChatId}
                    setActiveChatId={setActiveChatId}
                    proposedChanges={okr.proposedChanges}
                    localComments={localComments}
                  />
                  <OkrManagerChatRow
                    itemId={obj.id}
                    colSpan={5}
                    activeChatId={activeChatId}
                    proposedChanges={okr.proposedChanges}
                    localComments={localComments}
                    chatMessage={chatMessage}
                    setChatMessage={setChatMessage}
                    chatLoading={chatLoading}
                    handleSendChat={handleSendChat}
                  />

                  {obj.items?.map((kr: any, kIndex: number) => {
                    const oldKr = findOriginalItem(obj.id, kr.id);
                    const isKrChanged = hasChanged(kr, oldKr);
                    const isKrNew = originalStructure ? !oldKr : false;

                    return (
                      <React.Fragment key={`${oIndex}-${kIndex}`}>
                        {isKrChanged && <OkrManagerOldRow oldItem={oldKr} indent={3} />}
                        <OkrManagerKeyResultRow
                          kr={kr}
                          objId={obj.id}
                          isKrChanged={isKrChanged}
                          isKrNew={isKrNew}
                          handleOpenAddDialog={handleOpenAddDialog}
                          handleAcceptItem={handleAcceptItem}
                          handleUndoItem={handleUndoItem}
                          handleOpenEditDialog={handleOpenEditDialog}
                          handleDeleteItem={handleDeleteItem}
                          activeChatId={activeChatId}
                          setActiveChatId={setActiveChatId}
                          proposedChanges={okr.proposedChanges}
                          localComments={localComments}
                        />
                        <OkrManagerChatRow
                          itemId={kr.id}
                          colSpan={5}
                          activeChatId={activeChatId}
                          proposedChanges={okr.proposedChanges}
                          localComments={localComments}
                          chatMessage={chatMessage}
                          setChatMessage={setChatMessage}
                          chatLoading={chatLoading}
                          handleSendChat={handleSendChat}
                        />

                        {kr.items?.map((sub: any, sIndex: number) => {
                          const oldSub = findOriginalItem(obj.id, kr.id, sub.id);
                          const isSubChanged = hasChanged(sub, oldSub);
                          const isSubNew = originalStructure ? !oldSub : false;

                          return (
                            <React.Fragment key={`${oIndex}-${kIndex}-${sIndex}`}>
                              {isSubChanged && <OkrManagerOldRow oldItem={oldSub} indent={6} />}
                              <OkrManagerSubKeyResultRow
                                sub={sub}
                                objId={obj.id}
                                krId={kr.id}
                                isSubChanged={isSubChanged}
                                isSubNew={isSubNew}
                                handleOpenEditDialog={handleOpenEditDialog}
                                handleAcceptItem={handleAcceptItem}
                                handleUndoItem={handleUndoItem}
                                handleDeleteItem={handleDeleteItem}
                                activeChatId={activeChatId}
                                setActiveChatId={setActiveChatId}
                                proposedChanges={okr.proposedChanges}
                                localComments={localComments}
                              />
                              <OkrManagerChatRow
                                itemId={sub.id}
                                colSpan={5}
                                activeChatId={activeChatId}
                                proposedChanges={okr.proposedChanges}
                                localComments={localComments}
                                chatMessage={chatMessage}
                                setChatMessage={setChatMessage}
                                chatLoading={chatLoading}
                                handleSendChat={handleSendChat}
                              />

                              {sub.items?.map((subsub: any, ssIndex: number) => {
                                const oldSubSub = findOriginalItem(obj.id, kr.id, sub.id, subsub.id);
                                const isSubSubChanged = hasChanged(subsub, oldSubSub);
                                const isSubSubNew = originalStructure ? !oldSubSub : false;

                                return (
                                  <React.Fragment key={`${oIndex}-${kIndex}-${sIndex}-${ssIndex}`}>
                                    {isSubSubChanged && <OkrManagerOldRow oldItem={oldSubSub} indent={9} />}
                                    <OkrManagerSubSubKeyResultRow
                                      subsub={subsub}
                                      objId={obj.id}
                                      krId={kr.id}
                                      subId={sub.id}
                                      isSubSubChanged={isSubSubChanged}
                                      isSubSubNew={isSubSubNew}
                                      handleOpenEditDialog={handleOpenEditDialog}
                                      handleAcceptItem={handleAcceptItem}
                                      handleUndoItem={handleUndoItem}
                                      handleDeleteItem={handleDeleteItem}
                                      activeChatId={activeChatId}
                                      setActiveChatId={setActiveChatId}
                                      proposedChanges={okr.proposedChanges}
                                      localComments={localComments}
                                    />
                                    <OkrManagerChatRow
                                      itemId={subsub.id}
                                      colSpan={5}
                                      activeChatId={activeChatId}
                                      proposedChanges={okr.proposedChanges}
                                      localComments={localComments}
                                      chatMessage={chatMessage}
                                      setChatMessage={setChatMessage}
                                      chatLoading={chatLoading}
                                      handleSendChat={handleSendChat}
                                    />
                                  </React.Fragment>
                                );
                              })}
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
                    colSpan={5}
                    sx={{
                      bgcolor: "#fee2e2",
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "#b91c1c",
                    }}
                  >
                    {t("departmentOkr.managerTree.table.deletedItemsHeader")}
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
                              ? 3
                              : delItem.type === "SUBKR"
                                ? 6
                                : 9,
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
                        ? `+${delItem.unitScore}/${delItem.unit || t("departmentOkr.managerTree.proposedChanges.unitSuffix")}`
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
                          onClick={() =>
                            handleAcceptDeleteOriginalItem(delItem)
                          }
                          title={t("departmentOkr.managerTree.buttons.acceptDelete")}
                        >
                          <Check fontSize="small" color="success" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRestoreDeletedItem(delItem)}
                          title={t("departmentOkr.managerTree.buttons.restore")}
                        >
                          <Undo fontSize="small" color="primary" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
        <DialogTitle>{t("departmentOkr.managerTree.editDialog.title")}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label={t("departmentOkr.managerTree.editDialog.contentLabel")}
              fullWidth
              value={editCriteriaTitle}
              onChange={(e) => setEditCriteriaTitle(e.target.value)}
            />
            <TextField
              label={t("departmentOkr.managerTree.editDialog.maxScoreLabel")}
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
                label={t("departmentOkr.managerTree.editDialog.unitScoreLabel")}
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
                label={t("departmentOkr.managerTree.editDialog.unitLabel")}
                fullWidth
                value={editCriteriaUnit}
                onChange={(e) => setEditCriteriaUnit(e.target.value)}
                placeholder={t("departmentOkr.managerTree.editDialog.unitPlaceholder")}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>{t("departmentOkr.managerTree.editDialog.cancelBtn")}</Button>
          <Button variant="contained" onClick={handleSaveEditCriteria}>
            {t("departmentOkr.managerTree.editDialog.saveBtn")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
