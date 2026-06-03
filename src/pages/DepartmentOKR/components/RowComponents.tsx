import React from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Button,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const inputClass = "w-full p-1 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition-colors bg-transparent text-sm";

export const ObjectiveRow = ({ obj, idx, updateItem, handleAddKR, handleDeleteObjective, setNonNeg }: any) => {
  const { t } = useTranslation();
  return (
    <TableRow sx={{ bgcolor: "#bfdbfe" }}>
      <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem", color: "#1e3a8a" }}>{obj.id}</TableCell>
      <TableCell>
        <input
          className={`${inputClass} font-bold text-blue-900`}
          placeholder={t("departmentOkr.rowComponents.objectivePlaceholder")}
          value={obj.title || ""}
          onChange={(e) => updateItem(idx, "title", e.target.value)}
        />
      </TableCell>
      <TableCell>
        <input
          type="number"
          min="0"
          className={`${inputClass} font-bold text-blue-900`}
          value={obj.maxScore || ""}
          onChange={(e) => updateItem(idx, "maxScore", setNonNeg(e.target.value))}
          onKeyDown={(e) => {
            if (["-", ".", "e", "E", "+", ","].includes(e.key)) {
              e.preventDefault();
            }
          }}
        />
      </TableCell>
      <TableCell colSpan={2}></TableCell>
      <TableCell>
        <Button
          size="small"
          startIcon={<Add />}
          onClick={() => handleAddKR(idx)}
        >
          {t("departmentOkr.rowComponents.addCriteria")}
        </Button>
        <IconButton size="small" color="error" onClick={() => handleDeleteObjective(idx)}>
          <Delete fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export const KeyResultRow = ({ kr, oIdx, kIdx, updateItem, handleAddSubKR, handleDeleteKR, setNonNeg }: any) => {
  const { t } = useTranslation();
  return (
    <TableRow sx={{ bgcolor: "#f8fafc" }}>
      <TableCell sx={{ pl: 4 }}>{kr.id}</TableCell>
      <TableCell>
        <input
          className={inputClass}
          placeholder={t("departmentOkr.rowComponents.krPlaceholder")}
          value={kr.title || ""}
          onChange={(e) => updateItem(oIdx, "title", e.target.value, kIdx)}
        />
      </TableCell>
      <TableCell>
        <input
          type="number"
          min="0"
          className={`${inputClass} bg-gray-100 cursor-not-allowed`}
          value={kr.maxScore || ""}
          disabled
        />
      </TableCell>
      <TableCell>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#6b7280', marginRight: '4px', fontWeight: 500 }}>+</span>
          <input
            type="number"
            min="0"
            className={inputClass}
            placeholder="1"
            value={kr.unitScore || ""}
            onChange={(e) => updateItem(oIdx, "unitScore", setNonNeg(e.target.value), kIdx)}
            onKeyDown={(e) => {
              if (["-", ".", "e", "E", "+", ","].includes(e.key)) {
                e.preventDefault();
              }
            }}
          />
        </div>
      </TableCell>
      <TableCell>
        <input
          className={inputClass}
          placeholder="N/A"
          value={kr.unit || ""}
          onChange={(e) => updateItem(oIdx, "unit", e.target.value, kIdx)}
          maxLength={50}
        />
      </TableCell>

      <TableCell>
        <Button
          size="small"
          sx={{ fontSize: "0.75rem" }}
          onClick={() => handleAddSubKR(oIdx, kIdx)}
        >
          <Add fontSize="small" />
          {t("departmentOkr.rowComponents.addDetail")}
        </Button>
        <IconButton size="small" color="error" onClick={() => handleDeleteKR(oIdx, kIdx)}>
          <Delete fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export const SubKRRow = ({ sub, oIdx, kIdx, sIdx, updateItem, handleAddSubSubKR, handleDeleteSubKR, setNonNeg }: any) => {
  const { t } = useTranslation();
  return (
    <TableRow>
      <TableCell sx={{ pl: 7, fontSize: "0.85rem" }}>{sub.id}</TableCell>
      <TableCell>
        <input
          className={`${inputClass} text-xs text-gray-600 italic`}
          placeholder={t("departmentOkr.rowComponents.subKrPlaceholder")}
          value={sub.title || ""}
          onChange={(e) => updateItem(oIdx, "title", e.target.value, kIdx, sIdx)}
        />
      </TableCell>
      <TableCell>
        <input
          type="number"
          min="0"
          className={`${inputClass} bg-gray-100 cursor-not-allowed`}
          value={sub.maxScore || ""}
          disabled
        />
      </TableCell>
      <TableCell>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#6b7280', marginRight: '4px', fontWeight: 500 }}>+</span>
          <input
            type="number"
            min="0"
            className={inputClass}
            placeholder="1"
            value={sub.unitScore || ""}
            onChange={(e) => updateItem(oIdx, "unitScore", setNonNeg(e.target.value), kIdx, sIdx)}
            onKeyDown={(e) => {
              if (["-", ".", "e", "E", "+", ","].includes(e.key)) {
                e.preventDefault();
              }
            }}
          />
        </div>
      </TableCell>
      <TableCell>
        <input
          className={inputClass}
          placeholder="N/A"
          value={sub.unit || ""}
          onChange={(e) => updateItem(oIdx, "unit", e.target.value, kIdx, sIdx)}
          maxLength={50}
        />
      </TableCell>

      <TableCell>
        <Button
          size="small"
          sx={{ fontSize: "0.7rem" }}
          onClick={() => handleAddSubSubKR(oIdx, kIdx, sIdx)}
        >
          <Add fontSize="small" />
          {t("departmentOkr.rowComponents.addSubItem")}
        </Button>
        <IconButton size="small" color="error" onClick={() => handleDeleteSubKR(oIdx, kIdx, sIdx)}>
          <Delete fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export const SubSubKRRow = ({ item, oIdx, kIdx, sIdx, ssIdx, updateItem, handleDeleteSubSubKR, setNonNeg }: any) => {
  const { t } = useTranslation();
  return (
    <TableRow sx={{ bgcolor: "#fffbeb" }}>
      <TableCell sx={{ pl: 10, fontSize: "0.75rem" }}>{item.id}</TableCell>
      <TableCell>
        <input
          className={`${inputClass} text-xs text-amber-800`}
          placeholder={t("departmentOkr.rowComponents.subSubKrPlaceholder")}
          value={item.title || ""}
          onChange={(e) => updateItem(oIdx, "title", e.target.value, kIdx, sIdx, ssIdx)}
        />
      </TableCell>
      <TableCell></TableCell>
      <TableCell>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#6b7280', marginRight: '4px', fontWeight: 500 }}>+</span>
          <input
            type="number"
            min="0"
            className={inputClass}
            placeholder="1"
            value={item.unitScore || ""}
            onChange={(e) => updateItem(oIdx, "unitScore", setNonNeg(e.target.value), kIdx, sIdx, ssIdx)}
            onKeyDown={(e) => {
              if (["-", ".", "e", "E", "+", ","].includes(e.key)) {
                e.preventDefault();
              }
            }}
          />
        </div>
      </TableCell>
      <TableCell>
        <input
          className={inputClass}
          placeholder="N/A"
          value={item.unit || ""}
          onChange={(e) => updateItem(oIdx, "unit", e.target.value, kIdx, sIdx, ssIdx)}
          maxLength={50}
        />
      </TableCell>

      <TableCell>
        <IconButton size="small" color="error" onClick={() => handleDeleteSubSubKR(oIdx, kIdx, sIdx, ssIdx)}>
          <Delete fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};
