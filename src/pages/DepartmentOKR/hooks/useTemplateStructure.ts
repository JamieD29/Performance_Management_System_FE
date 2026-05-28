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

    let finalValue = value;
    if (field === "unitScore") {
      const targetVal = Math.max(0, Number(value) || 0);
      const objMaxScore = Number(obj.maxScore) || 0;
      
      let otherSum = 0;
      obj.items?.forEach((kr: any, kIdx: number) => {
        const isTargetKR = krIdx === kIdx && subIdx === undefined && subSubIdx === undefined;
        if (!isTargetKR) {
          otherSum += Number(kr.unitScore) || 0;
        }
        
        kr.items?.forEach((sub: any, sIdx: number) => {
          const isTargetSub = krIdx === kIdx && subIdx === sIdx && subSubIdx === undefined;
          if (!isTargetSub) {
            otherSum += Number(sub.unitScore) || 0;
          }
          
          sub.items?.forEach((subsub: any, ssIdx: number) => {
            const isTargetSubSub = krIdx === kIdx && subIdx === sIdx && subSubIdx === ssIdx;
            if (!isTargetSubSub) {
              otherSum += Number(subsub.unitScore) || 0;
            }
          });
        });
      });
      
      const allowedMax = Math.max(0, objMaxScore - otherSum);
      finalValue = Math.min(targetVal, allowedMax);
    }

    if (subSubIdx !== undefined && subIdx !== undefined && krIdx !== undefined) {
      obj.items[krIdx].items[subIdx].items[subSubIdx][field] = finalValue;
    } else if (subIdx !== undefined && krIdx !== undefined) {
      obj.items[krIdx].items[subIdx][field] = finalValue;
    } else if (krIdx !== undefined) {
      obj.items[krIdx][field] = finalValue;
    } else {
      obj[field] = finalValue;
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
    const newId = String.fromCharCode(charCode);
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
    // Re-index a, b, c...
    sub.items = sub.items.map((ss: any, i: number) => ({
      ...ss,
      id: String.fromCharCode(97 + i),
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
