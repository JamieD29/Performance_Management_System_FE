import React from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Button,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

const inputClass = "w-full p-1 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition-colors bg-transparent text-sm";

export const ObjectiveRow = ({ obj, idx, updateItem, handleAddKR, handleDeleteObjective, setNonNeg }: any) => (
  <TableRow sx={{ bgcolor: "#eff6ff" }}>
    <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>{obj.id}</TableCell>
    <TableCell>
      <input
        className={`${inputClass} font-bold`}
        placeholder="Tên Mục tiêu lớn..."
        value={obj.title || ""}
        onChange={(e) => updateItem(idx, "title", e.target.value)}
      />
    </TableCell>
    <TableCell>
      <input
        type="number"
        min="0"
        className={`${inputClass} font-bold`}
        value={obj.maxScore || ""}
        onChange={(e) => updateItem(idx, "maxScore", setNonNeg(e.target.value))}
      />
    </TableCell>
    <TableCell colSpan={3}></TableCell>
    <TableCell>
      <Button
        size="small"
        startIcon={<Add />}
        onClick={() => handleAddKR(idx)}
      >
        Tiêu chí
      </Button>
      <IconButton size="small" color="error" onClick={() => handleDeleteObjective(idx)}>
        <Delete fontSize="small" />
      </IconButton>
    </TableCell>
  </TableRow>
);

export const KeyResultRow = ({ kr, oIdx, kIdx, updateItem, handleAddSubKR, handleDeleteKR, setNonNeg }: any) => (
  <TableRow sx={{ bgcolor: "#f8fafc" }}>
    <TableCell sx={{ pl: 4 }}>{kr.id}</TableCell>
    <TableCell>
      <input
        className={inputClass}
        placeholder="Nội dung Tiêu chí..."
        value={kr.title || ""}
        onChange={(e) => updateItem(oIdx, "title", e.target.value, kIdx)}
      />
    </TableCell>
    <TableCell>
      <input
        type="number"
        min="0"
        className={inputClass}
        value={kr.maxScore || ""}
        onChange={(e) => updateItem(oIdx, "maxScore", setNonNeg(e.target.value), kIdx)}
      />
    </TableCell>
    <TableCell>
      <input
        type="number"
        min="0"
        className={inputClass}
        placeholder="+1"
        value={kr.unitScore || ""}
        onChange={(e) => updateItem(oIdx, "unitScore", setNonNeg(e.target.value), kIdx)}
      />
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
      <input
        type="number"
        min="0"
        className={inputClass}
        value={kr.target || ""}
        onChange={(e) => updateItem(oIdx, "target", setNonNeg(e.target.value), kIdx)}
      />
    </TableCell>
    <TableCell>
      <Button
        size="small"
        sx={{ fontSize: "0.75rem" }}
        onClick={() => handleAddSubKR(oIdx, kIdx)}
      >
        <Add fontSize="small" />
        Chi tiết
      </Button>
      <IconButton size="small" color="error" onClick={() => handleDeleteKR(oIdx, kIdx)}>
        <Delete fontSize="small" />
      </IconButton>
    </TableCell>
  </TableRow>
);

export const SubKRRow = ({ sub, oIdx, kIdx, sIdx, updateItem, handleAddSubSubKR, handleDeleteSubKR, setNonNeg }: any) => (
  <TableRow>
    <TableCell sx={{ pl: 7, fontSize: "0.85rem" }}>{sub.id}</TableCell>
    <TableCell>
      <input
        className={`${inputClass} text-xs text-gray-600 italic`}
        placeholder="Nội dung tiêu chí nhỏ..."
        value={sub.title || ""}
        onChange={(e) => updateItem(oIdx, "title", e.target.value, kIdx, sIdx)}
      />
    </TableCell>
    <TableCell>
      <input
        type="number"
        min="0"
        className={inputClass}
        value={sub.maxScore || ""}
        onChange={(e) => updateItem(oIdx, "maxScore", setNonNeg(e.target.value), kIdx, sIdx)}
      />
    </TableCell>
    <TableCell>
      <input
        type="number"
        min="0"
        className={inputClass}
        placeholder="+1"
        value={sub.unitScore || ""}
        onChange={(e) => updateItem(oIdx, "unitScore", setNonNeg(e.target.value), kIdx, sIdx)}
      />
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
      <input
        type="number"
        min="0"
        className={inputClass}
        value={sub.target || ""}
        onChange={(e) => updateItem(oIdx, "target", setNonNeg(e.target.value), kIdx, sIdx)}
      />
    </TableCell>
    <TableCell>
      <Button
        size="small"
        sx={{ fontSize: "0.7rem" }}
        onClick={() => handleAddSubSubKR(oIdx, kIdx, sIdx)}
      >
        <Add fontSize="small" />
        a,b,c
      </Button>
      <IconButton size="small" color="error" onClick={() => handleDeleteSubKR(oIdx, kIdx, sIdx)}>
        <Delete fontSize="small" />
      </IconButton>
    </TableCell>
  </TableRow>
);

export const SubSubKRRow = ({ item, oIdx, kIdx, sIdx, ssIdx, updateItem, handleDeleteSubSubKR, setNonNeg }: any) => (
  <TableRow sx={{ bgcolor: "#fffbeb" }}>
    <TableCell sx={{ pl: 10, fontSize: "0.75rem" }}>{item.id}</TableCell>
    <TableCell>
      <input
        className={`${inputClass} text-xs text-amber-800`}
        placeholder="Mô tả cụ thể (a, b, c...)"
        value={item.title || ""}
        onChange={(e) => updateItem(oIdx, "title", e.target.value, kIdx, sIdx, ssIdx)}
      />
    </TableCell>
    <TableCell></TableCell>
    <TableCell>
      <input
        type="number"
        min="0"
        className={inputClass}
        placeholder="+1"
        value={item.unitScore || ""}
        onChange={(e) => updateItem(oIdx, "unitScore", setNonNeg(e.target.value), kIdx, sIdx, ssIdx)}
      />
    </TableCell>
    <TableCell>
      <input
        className={inputClass}
        placeholder="đv"
        value={item.unit || ""}
        onChange={(e) => updateItem(oIdx, "unit", e.target.value, kIdx, sIdx, ssIdx)}
        maxLength={50}
      />
    </TableCell>
    <TableCell>
      <input
        type="number"
        min="0"
        className={inputClass}
        value={item.target || ""}
        onChange={(e) => updateItem(oIdx, "target", setNonNeg(e.target.value), kIdx, sIdx, ssIdx)}
      />
    </TableCell>
    <TableCell>
      <IconButton size="small" color="error" onClick={() => handleDeleteSubSubKR(oIdx, kIdx, sIdx, ssIdx)}>
        <Delete fontSize="small" />
      </IconButton>
    </TableCell>
  </TableRow>
);
