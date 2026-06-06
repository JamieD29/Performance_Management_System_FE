export function useOkrCalculations(
  localStructure: any[],
  reportData: Record<string, any>,
  okr: any
) {
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
        const krCappedScore = Math.min(
          krCalcScore,
          Number(kr.maxScore) || Number(kr.unitScore) || Infinity
        );
        objRawScore += krCappedScore;

        kr.items?.forEach((sub: any) => {
          const subKey = `${obj.id}-${kr.id}-${sub.id}`;
          const subQty = reportData[subKey]?.quantity || 0;
          const subUnitScore = Number(sub.unitScore) || 0;
          const subCalcScore = subUnitScore > 0 ? subQty * subUnitScore : subQty;
          const subCappedScore = Math.min(
            subCalcScore,
            Number(sub.maxScore) || Number(sub.unitScore) || Infinity
          );
          objRawScore += subCappedScore;

          sub.items?.forEach((subsub: any) => {
            const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
            const subsubQty = reportData[subsubKey]?.quantity || 0;
            const subsubUnitScore = Number(subsub.unitScore) || 0;
            const subsubCalcScore =
              subsubUnitScore > 0 ? subsubQty * subsubUnitScore : subsubQty;
            const subsubCappedScore = Math.min(
              subsubCalcScore,
              Number(subsub.maxScore) || Number(subsub.unitScore) || Infinity
            );
            objRawScore += subsubCappedScore;
          });
        });
      });

      const objScore =
        maxObjScore > 0 ? Math.min(objRawScore, maxObjScore) : objRawScore;
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
      const krCappedScore = Math.min(
        krCalcScore,
        Number(kr.maxScore) || Number(kr.unitScore) || Infinity
      );
      total += krCappedScore;

      kr.items?.forEach((sub: any) => {
        const subKey = `${obj.id}-${kr.id}-${sub.id}`;
        const subQty = reportData[subKey]?.quantity || 0;
        const subUnitScore = Number(sub.unitScore) || 0;
        const subCalcScore = subUnitScore > 0 ? subQty * subUnitScore : subQty;
        const subCappedScore = Math.min(
          subCalcScore,
          Number(sub.maxScore) || Number(sub.unitScore) || Infinity
        );
        total += subCappedScore;

        sub.items?.forEach((subsub: any) => {
          const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
          const subsubQty = reportData[subsubKey]?.quantity || 0;
          const subsubUnitScore = Number(subsub.unitScore) || 0;
          const subsubCalcScore =
            subsubUnitScore > 0 ? subsubQty * subsubUnitScore : subsubQty;
          const subsubCappedScore = Math.min(
            subsubCalcScore,
            Number(subsub.maxScore) || Number(subsub.unitScore) || Infinity
          );
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

  return {
    calcTotalScore,
    calcMaxScore,
    calcObjectiveScore,
    calcObjectiveReportScore,
    calcObjectiveManagerScore,
    calcObjectiveReportQty,
    calcObjectiveSubmittedQty,
    calcObjectiveManagerQty,
    getManagerData,
  };
}
