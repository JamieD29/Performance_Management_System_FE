// xlsx is dynamically imported in parseExcelToStructure() to avoid loading ~300KB on initial page load

// ============================================================
// Types
// ============================================================
export interface StructureItem {
  id: string;
  type: "objective" | "kr" | "sub_kr" | "sub_sub_kr";
  title: string;
  maxScore: number;
  unitScore: number;
  unit: string;
  target: number;
  items: StructureItem[];
}

// ============================================================
// Score Text Parser
// ============================================================
/**
 * Parse cột "Mức điểm" từ Excel.
 * Ví dụ:
 *   "Tối đa 25 điểm"     → { maxScore: 25, unitScore: 0, unit: "" }
 *   "+2"                  → { maxScore: 0,  unitScore: 2, unit: "" }
 *   "+2/học phần"         → { maxScore: 0,  unitScore: 2, unit: "học phần" }
 *   "+3/chương trình"     → { maxScore: 0,  unitScore: 3, unit: "chương trình" }
 *   "" / "Điểm do HT..."  → { maxScore: 0,  unitScore: 0, unit: "" }
 */
function parseScoreText(text: string): {
  maxScore: number;
  unitScore: number;
  unit: string;
} {
  if (!text || typeof text !== "string") {
    return { maxScore: 0, unitScore: 0, unit: "" };
  }

  const trimmed = text.trim();

  // "Tối đa 25 điểm" → maxScore = 25
  const maxMatch = trimmed.match(/[Tt]ối\s*đa\s+(\d+)\s*điểm/);
  if (maxMatch) {
    return { maxScore: Number(maxMatch[1]), unitScore: 0, unit: "" };
  }

  // "+2/học phần" or "+3/chương trình"
  const unitMatch = trimmed.match(/^\+?\s*(\d+)\s*\/\s*(.+)$/);
  if (unitMatch) {
    return {
      maxScore: 0,
      unitScore: Number(unitMatch[1]),
      unit: unitMatch[2].trim(),
    };
  }

  // "+2" or "+10"
  const simpleMatch = trimmed.match(/^\+?\s*(\d+)$/);
  if (simpleMatch) {
    return { maxScore: 0, unitScore: Number(simpleMatch[1]), unit: "" };
  }

  // Numeric value (plain number like 0)
  const numVal = Number(trimmed);
  if (!isNaN(numVal)) {
    return { maxScore: 0, unitScore: numVal, unit: "" };
  }

  // Fallback: "Điểm do Hiệu trưởng quyết định", etc.
  return { maxScore: 0, unitScore: 0, unit: "" };
}

// ============================================================
// Row Level Detection
// ============================================================
type RowLevel = "objective" | "kr" | "sub_kr" | "sub_sub_kr" | "no_stt" | null;

function detectLevel(sttRaw: any): RowLevel {
  if (sttRaw === null || sttRaw === undefined || sttRaw === "") {
    return "no_stt";
  }

  const stt = String(sttRaw).trim();

  // Sub-sub-KR: single lowercase letter (a, b, c, d) — check BEFORE objective
  if (/^[a-z]$/.test(stt)) return "sub_sub_kr";

  // Objective: single uppercase letter (A, B, C, D) — case-sensitive, no `i` flag
  if (/^[A-Z]$/.test(stt)) return "objective";

  // Sub-KR: number.number (1.1, 1.2, 4.3)
  if (/^\d+\.\d+$/.test(stt)) return "sub_kr";

  // KR: single integer (1, 2, 3)
  if (/^\d+$/.test(stt)) return "kr";

  // Stop markers
  const upper = stt.toUpperCase();
  if (upper.includes("TỔNG ĐIỂM") || upper.includes("ĐỀ XUẤT")) return null;

  return null;
}

// ============================================================
// Find Header Row
// ============================================================
function findHeaderRow(rows: any[][]): number {
  for (let i = 0; i < Math.min(rows.length, 50); i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const first = String(row[0] || "")
      .trim()
      .toUpperCase();
    if (first === "STT") return i;
  }
  // Fallback: look for a row right before the first "A" objective row
  for (let i = 0; i < Math.min(rows.length, 50); i++) {
    const row = rows[i];
    if (!row) continue;
    const stt = String(row[0] || "").trim();
    if (/^[A-Z]$/.test(stt) && row.length > 1 && row[1]) {
      return i - 1; // Assume header is one row before
    }
  }
  return -1;
}

// ============================================================
// Main Parser
// ============================================================
export async function parseExcelToStructure(
  file: File,
): Promise<StructureItem[]> {
  // Dynamic import — xlsx is only loaded when user imports an Excel file
  const XLSX = await import("xlsx");

  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);
  const workbook = XLSX.read(data, { type: "array" });

  // Use first sheet
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("File Excel không có sheet nào.");
  }

  const sheet = workbook.Sheets[sheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  });

  // Find header row for column mapping
  const headerIdx = findHeaderRow(rows);
  if (headerIdx < 0) {
    throw new Error(
      'Không tìm thấy dòng tiêu đề (STT, Nội dung...). Hãy đảm bảo file có cột "STT".',
    );
  }

  // Parse data rows (start one row after header)
  const structure: StructureItem[] = [];
  let currentObj: StructureItem | null = null;
  let currentKR: StructureItem | null = null;
  let currentSubKR: StructureItem | null = null;

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const sttRaw = row[0];
    const content = String(row[1] || "").trim();
    const scoreText = String(row[2] || "").trim();

    // Skip empty content rows
    if (!content && !scoreText && (sttRaw === "" || sttRaw === null)) continue;

    const level = detectLevel(sttRaw);

    // Stop parsing at summary rows
    if (level === null) {
      const sttStr = String(sttRaw || "")
        .trim()
        .toUpperCase();
      if (
        sttStr.includes("TỔNG ĐIỂM") ||
        sttStr.includes("ĐỀ XUẤT") ||
        content.toUpperCase().includes("TỔNG ĐIỂM")
      ) {
        break;
      }
      continue;
    }

    const scores = parseScoreText(scoreText);

    if (level === "objective") {
      currentObj = {
        id: String(sttRaw).trim().toUpperCase(),
        type: "objective",
        title: content,
        maxScore: scores.maxScore,
        unitScore: scores.unitScore,
        unit: scores.unit,
        target: 0,
        items: [],
      };
      structure.push(currentObj);
      currentKR = null;
      currentSubKR = null;
    } else if (level === "kr") {
      currentKR = {
        id: String(sttRaw).trim(),
        type: "kr",
        title: content,
        maxScore: scores.maxScore,
        unitScore: scores.unitScore,
        unit: scores.unit,
        target: 0,
        items: [],
      };
      currentObj?.items.push(currentKR);
      currentSubKR = null;
    } else if (level === "sub_kr") {
      currentSubKR = {
        id: String(sttRaw).trim(),
        type: "sub_kr",
        title: content,
        maxScore: scores.maxScore,
        unitScore: scores.unitScore,
        unit: scores.unit,
        target: 0,
        items: [],
      };
      currentKR?.items.push(currentSubKR);
    } else if (level === "sub_sub_kr") {
      const subSubKR: StructureItem = {
        id: String(sttRaw).trim(),
        type: "sub_sub_kr",
        title: content,
        maxScore: scores.maxScore,
        unitScore: scores.unitScore,
        unit: scores.unit,
        target: 0,
        items: [],
      };
      // Attach to currentSubKR if exists, otherwise to currentKR
      if (currentSubKR) {
        currentSubKR.items.push(subSubKR);
      } else if (currentKR) {
        currentKR.items.push(subSubKR);
      }
    } else if (level === "no_stt") {
      // Rows with no STT but have content → treat as sub-KR under current KR
      if (content) {
        const noSttItem: StructureItem = {
          id: "",
          type: "sub_kr",
          title: content,
          maxScore: scores.maxScore,
          unitScore: scores.unitScore,
          unit: scores.unit,
          target: 0,
          items: [],
        };
        if (currentKR) {
          // Auto-generate ID based on position
          const existingSubCount = currentKR.items.length;
          noSttItem.id = `${currentKR.id}.${existingSubCount + 1}`;
          currentKR.items.push(noSttItem);
          currentSubKR = noSttItem;
        }
      }
    }
  }

  return structure;
}

