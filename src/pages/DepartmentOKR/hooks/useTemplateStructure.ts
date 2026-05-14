import { useState, useCallback } from "react";

export const useTemplateStructure = (initialStructure: any[] = []) => {
  const [structure, setStructure] = useState<any[]>(initialStructure);

  const setNonNeg = (v: any) => Math.max(0, Number(v) || 0);

  const updateItem = useCallback((
    objIdx: number,
    field: string,
    value: any,
    krIdx?: number,
    subIdx?: number,
    subSubIdx?: number,
  ) => {
    const newStructure = [...structure];
    const obj = newStructure[objIdx];

    if (subSubIdx !== undefined && subIdx !== undefined && krIdx !== undefined) {
      obj.items[krIdx].items[subIdx].items[subSubIdx][field] = value;
    } else if (subIdx !== undefined && krIdx !== undefined) {
      obj.items[krIdx].items[subIdx][field] = value;
    } else if (krIdx !== undefined) {
      obj.items[krIdx][field] = value;
    } else {
      obj[field] = value;
    }

    setStructure(newStructure);
  }, [structure]);

  const handleAddObjective = useCallback(() => {
    const newId = String.fromCharCode(65 + structure.length); // A, B, C...
    setStructure([
      ...structure,
      {
        id: newId,
        title: "",
        maxScore: 0,
        items: [],
      },
    ]);
  }, [structure]);

  const handleDeleteObjective = useCallback((idx: number) => {
    const newStructure = structure.filter((_, i) => i !== idx);
    // Re-index A, B, C...
    const reindexed = newStructure.map((obj, i) => ({
      ...obj,
      id: String.fromCharCode(65 + i),
    }));
    setStructure(reindexed);
  }, [structure]);

  const handleAddKR = useCallback((oIdx: number) => {
    const newStructure = [...structure];
    const obj = newStructure[oIdx];
    if (!obj.items) obj.items = [];
    const newId = `${obj.id}.${obj.items.length + 1}`;
    obj.items.push({
      id: newId,
      title: "",
      maxScore: 0,
      unitScore: 0,
      unit: "",
      target: 1,
      items: [],
    });
    setStructure(newStructure);
  }, [structure]);

  const handleDeleteKR = useCallback((oIdx: number, kIdx: number) => {
    const newStructure = [...structure];
    newStructure[oIdx].items = newStructure[oIdx].items.filter(
      (_: any, i: number) => i !== kIdx,
    );
    // Re-index 1, 2, 3...
    newStructure[oIdx].items = newStructure[oIdx].items.map((kr: any, i: number) => ({
      ...kr,
      id: `${newStructure[oIdx].id}.${i + 1}`,
    }));
    setStructure(newStructure);
  }, [structure]);

  const handleAddSubKR = useCallback((oIdx: number, kIdx: number) => {
    const newStructure = [...structure];
    const kr = newStructure[oIdx].items[kIdx];
    if (!kr.items) kr.items = [];
    const newId = `${kr.id}.${kr.items.length + 1}`;
    kr.items.push({
      id: newId,
      title: "",
      maxScore: 0,
      unitScore: 0,
      unit: "",
      target: 1,
      items: [],
    });
    setStructure(newStructure);
  }, [structure]);

  const handleDeleteSubKR = useCallback((oIdx: number, kIdx: number, sIdx: number) => {
    const newStructure = [...structure];
    const kr = newStructure[oIdx].items[kIdx];
    kr.items = kr.items.filter((_: any, i: number) => i !== sIdx);
    // Re-index .1, .2, .3...
    kr.items = kr.items.map((sub: any, i: number) => ({
      ...sub,
      id: `${kr.id}.${i + 1}`,
    }));
    setStructure(newStructure);
  }, [structure]);

  const handleAddSubSubKR = useCallback((oIdx: number, kIdx: number, sIdx: number) => {
    const newStructure = [...structure];
    const sub = newStructure[oIdx].items[kIdx].items[sIdx];
    if (!sub.items) sub.items = [];
    const charCode = 97 + sub.items.length; // a, b, c...
    const newId = `${sub.id}.${String.fromCharCode(charCode)}`;
    sub.items.push({
      id: newId,
      title: "",
      unitScore: 0,
      unit: "",
      target: 1,
    });
    setStructure(newStructure);
  }, [structure]);

  const handleDeleteSubSubKR = useCallback((oIdx: number, kIdx: number, sIdx: number, ssIdx: number) => {
    const newStructure = [...structure];
    const sub = newStructure[oIdx].items[kIdx].items[sIdx];
    sub.items = sub.items.filter((_: any, i: number) => i !== ssIdx);
    // Re-index .a, .b, .c...
    sub.items = sub.items.map((ss: any, i: number) => ({
      ...ss,
      id: `${sub.id}.${String.fromCharCode(97 + i)}`,
    }));
    setStructure(newStructure);
  }, [structure]);

  return {
    structure,
    setStructure,
    updateItem,
    handleAddObjective,
    handleDeleteObjective,
    handleAddKR,
    handleDeleteKR,
    handleAddSubKR,
    handleDeleteSubKR,
    handleAddSubSubKR,
    handleDeleteSubSubKR,
    setNonNeg,
  };
};
