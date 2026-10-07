import { TaskItem, TaskStatus, MainDepartmentId } from '../types';
import { DEPARTMENTS, FISCAL_MONTHS } from '../data/departments';
 
const SHEET_NAME = 'ติดตามงาน2570';
const SPREADSHEET_TITLE = 'ระบบติดตามงาน_ปีงบประมาณ_2570';
const STORAGE_KEY_SPREADSHEET_ID = 'nuls_tracking_spreadsheet_id_2570';

/**
 * ฟังก์ชันช่วยตรวจสอบชื่อแท็บว่าเป็นเดือนใดใน 12 เดือนปีงบประมาณ (ต.ค. - ก.ย.)
 */
export const matchFiscalMonth = (title: string): string | null => {
  const t = title.trim().toLowerCase();
  if (t.includes('ต.ค') || t.includes('ตุลา')) return 'ตุลาคม 2569';
  if (t.includes('พ.ย') || t.includes('พฤศจิกา')) return 'พฤศจิกายน 2569';
  if (t.includes('ธ.ค') || t.includes('ธันวา')) return 'ธันวาคม 2569';
  if (t.includes('ม.ค') || t.includes('มกรา')) return 'มกราคม 2570';
  if (t.includes('ก.พ') || t.includes('กุมภา')) return 'กุมภาพันธ์ 2570';
  if (t.includes('มี.ค') || t.includes('มีนา')) return 'มีนาคม 2570';
  if (t.includes('เม.ย') || t.includes('เมษา')) return 'เมษายน 2570';
  if (t.includes('พ.ค') || t.includes('พฤษภา')) return 'พฤษภาคม 2570';
  if (t.includes('มิ.ย') || t.includes('มิถุนา')) return 'มิถุนายน 2570';
  if (t.includes('ก.ค') || t.includes('กรกฎา')) return 'กรกฎาคม 2570';
  if (t.includes('ส.ค') || t.includes('สิงหา')) return 'สิงหาคม 2570';
  if (t.includes('ก.ย') || t.includes('กันยา')) return 'กันยายน 2570';
  return null;
};
 
// [เพิ่มใหม่] รหัส Google Sheet ที่ใช้เป็น "ศูนย์กลาง" ของระบบ
// ทุกคนที่เปิดแอปนี้จะเชื่อมกับ Sheet ไฟล์เดียวกันนี้โดยอัตโนมัติ
// ไม่ต้องพิมพ์/เชื่อมต่อรหัส Sheet เองทีละคนอีกต่อไป
const DEFAULT_SPREADSHEET_ID = '1DkdJ7zienczCFhUwKYfdGUJBQ_sWi6OgoZDSOZrGMoA';
 
// [แก้ไข] ฟังก์ชันช่วยสร้าง "range" ที่เข้ารหัสถูกต้อง ปลอดภัยสำหรับใส่ใน URL
// ป้องกันปัญหา "Unable to parse range" โดยคงเครื่องหมาย ' ! และ : ไว้
export const formatSheetRange = (sheetTitle: string, cellRange: string): string => {
  const safeTitle = sheetTitle.replace(/'/g, "''");
  return encodeURIComponent(`'${safeTitle}'!${cellRange}`)
    .replace(/%21/g, '!')
    .replace(/%3A/g, ':')
    .replace(/%27/g, "'");
};

const encodeRange = (range: string): string => {
  return encodeURIComponent(range)
    .replace(/%21/g, '!')
    .replace(/%3A/g, ':')
    .replace(/%27/g, "'");
};
 
export const HEADERS = [
  'รหัสงาน',
  'ชื่องาน/โครงการ/กิจกรรม',
  'งานหลัก',
  'หน่วยงานย่อย',
  'ผู้รับผิดชอบ',
  'ประจำเดือน',
  'สถานะการดำเนินงาน',
  'ความก้าวหน้า (%)',
  'วันที่เริ่ม',
  'กำหนดส่ง',
  'รายละเอียดงาน',
  'ผลการดำเนินงานสรุป/หมายเหตุ',
  'อัปเดตล่าสุด',
];
 
export const getSavedSpreadsheetId = (): string | null => {
  // [แก้ไข] ถ้าเครื่องนี้ยังไม่เคยบันทึก Sheet ID ไว้ ให้ใช้รหัสกลาง (DEFAULT_SPREADSHEET_ID) แทน
  // ทำให้ทุกคนที่เปิดแอปครั้งแรก เชื่อมกับ Sheet เดียวกันได้ทันที ไม่ต้องตั้งค่าเอง
  const saved = localStorage.getItem(STORAGE_KEY_SPREADSHEET_ID);
  return saved || DEFAULT_SPREADSHEET_ID;
};
 
export const saveSpreadsheetId = (id: string): void => {
  localStorage.setItem(STORAGE_KEY_SPREADSHEET_ID, id);
};
 
export const clearSavedSpreadsheetId = (): void => {
  localStorage.removeItem(STORAGE_KEY_SPREADSHEET_ID);
};

/**
 * ตัดคำว่า "คณะโลจิสติกส์ฯ มน...." หรือชื่อคณะ/มหาวิทยาลัย ออกจากชื่อ Google Sheet
 * และจัดรูปแบบให้แสดงผลอ่านง่าย สวยงาม
 */
export const cleanSheetTitle = (title?: string | null): string => {
  if (!title) return '';
  const isRawId = /^[a-zA-Z0-9_-]{25,}$/.test(title.trim());
  if (isRawId) return title;

  let cleaned = title
    .replace(/[_\s-]*[\(\[]?คณะโลจิสติกส์.*$/gi, '')
    .replace(/[_\s-]*[\(\[]?โลจิสติกส์.*$/gi, '')
    .replace(/[_\s]+$/g, '')
    .trim();

  cleaned = cleaned.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || title;
};
 
// แปลงแถวจาก Sheet เป็น TaskItem
export const rowToTask = (row: string[], rowIndex: number): TaskItem => {
  const [
    id = `TSK-${rowIndex}`,
    title = '',
    departmentName = '',
    unitName = '',
    assignee = '',
    month = '',
    statusStr = 'ยังไม่ดำเนินการ',
    progressStr = '0',
    startDate = '',
    dueDate = '',
    description = '',
    performanceSummary = '',
    updatedAt = new Date().toISOString(),
  ] = row;
 
  // Resolve departmentId
  const dept = DEPARTMENTS.find(d => d.name.trim() === departmentName.trim());
  const departmentId: MainDepartmentId = dept ? dept.id : 'admin';
 
  // Resolve unitId
  let unitId = '';
  if (dept) {
    const unit = dept.units.find(u => unitName.includes(u.name) || unitName.includes(u.code));
    if (unit) unitId = unit.id;
  }
  if (!unitId) {
    // Search across all
    for (const d of DEPARTMENTS) {
      const u = d.units.find(unit => unitName.includes(unit.name) || unitName.includes(unit.code));
      if (u) {
        unitId = u.id;
        break;
      }
    }
  }
 
  const validStatuses: TaskStatus[] = ['ยังไม่ดำเนินการ', 'ระหว่างดำเนินการ', 'ดำเนินการแล้วเสร็จ'];
  const status: TaskStatus = validStatuses.includes(statusStr as TaskStatus)
    ? (statusStr as TaskStatus)
    : 'ยังไม่ดำเนินการ';
 
  const progress = Math.min(100, Math.max(0, parseInt(progressStr, 10) || 0));
 
  return {
    id: id || `TSK-2570-${String(rowIndex).padStart(3, '0')}`,
    rowNumber: rowIndex,
    title,
    departmentId,
    departmentName: departmentName || 'งานธุรการ',
    unitId: unitId || '1.1',
    unitName: unitName || 'หน่วยแผน',
    assignee,
    month,
    status,
    progress,
    startDate,
    dueDate,
    description,
    performanceSummary,
    updatedAt: updatedAt || new Date().toISOString(),
    createdAt: startDate || new Date().toISOString(),
  };
};
 
// แปลง TaskItem เป็นแถวสำหรับบันทึกลง Sheet
export const taskToRow = (task: TaskItem): (string | number)[] => {
  return [
    task.id,
    task.title,
    task.departmentName,
    task.unitName,
    task.assignee,
    task.month,
    task.status,
    task.progress,
    task.startDate,
    task.dueDate,
    task.description || '',
    task.performanceSummary || '',
    task.updatedAt || new Date().toISOString(),
  ];
};
 
// 1. สร้าง Google Spreadsheet ใหม่ (รองรับทั้งแบบแยก 12 แท็บประจำเดือน และแบบแผ่นรวม)
export const createSpreadsheet = async (
  accessToken: string,
  initialTasks: TaskItem[] = [],
  mode: '12months' | 'single' = '12months'
): Promise<{ id: string; url: string }> => {
  const is12Months = mode === '12months';

  const sheetDefinitions = is12Months
    ? [
        {
          properties: {
            title: 'ภาพรวมงาน 2570',
            sheetId: 0,
            gridProperties: { frozenRowCount: 1 },
          },
        },
        ...FISCAL_MONTHS.map((fm, idx) => ({
          properties: {
            title: fm.name, // e.g. 'ตุลาคม 2569', 'พฤศจิกายน 2569'
            sheetId: idx + 1,
            gridProperties: { frozenRowCount: 1 },
          },
        })),
      ]
    : [
        {
          properties: {
            title: SHEET_NAME,
            sheetId: 0,
            gridProperties: { frozenRowCount: 1 },
          },
        },
      ];

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: is12Months
          ? 'ระบบติดตามงาน_ปีงบประมาณ_2570_(12เดือน_ต.ค.-ก.ย.)'
          : SPREADSHEET_TITLE,
        locale: 'th_TH',
        timeZone: 'Asia/Bangkok',
      },
      sheets: sheetDefinitions,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err?.error?.message || 'ไม่สามารถสร้าง Google Spreadsheet ได้');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // เขียน Header และข้อมูลตัวอย่างเริ่มต้น
  if (is12Months) {
    const dataUpdates: Array<{ range: string; majorDimension: string; values: any[][] }> = [];

    // แผ่นภาพรวม
    const overviewRows = [HEADERS, ...initialTasks.map(taskToRow)];
    dataUpdates.push({
      range: `'ภาพรวมงาน 2570'!A1:M${overviewRows.length}`,
      majorDimension: 'ROWS',
      values: overviewRows,
    });

    // 12 แผ่นประจำเดือน
    for (const fm of FISCAL_MONTHS) {
      const monthTasks = initialTasks.filter(t => t.month === fm.name);
      const rows = [HEADERS, ...monthTasks.map(taskToRow)];
      dataUpdates.push({
        range: `'${fm.name}'!A1:M${rows.length}`,
        majorDimension: 'ROWS',
        values: rows,
      });
    }

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: dataUpdates,
        }),
      }
    );
  } else {
    const rows = [HEADERS, ...initialTasks.map(taskToRow)];
    const initialRange = `'${SHEET_NAME}'!A1:M${rows.length}`;
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeRange(
        initialRange
      )}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: initialRange,
          majorDimension: 'ROWS',
          values: rows,
        }),
      }
    );
  }

  // ตกแต่ง Formatting แถวหัวข้อ (Header style: ส้ม ม.นเรศวร #EA580C, ตัวอักษรสีขาว หนา)
  try {
    const sheetIdsToFormat = is12Months ? [0, ...FISCAL_MONTHS.map((_, idx) => idx + 1)] : [0];
    const formatRequests: any[] = [];

    for (const sId of sheetIdsToFormat) {
      formatRequests.push(
        {
          repeatCell: {
            range: {
              sheetId: sId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: HEADERS.length,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.917, green: 0.345, blue: 0.047 }, // #EA580C
                textFormat: {
                  foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                  bold: true,
                  fontSize: 11,
                },
                horizontalAlignment: 'CENTER',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
          },
        },
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: sId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: HEADERS.length,
            },
          },
        }
      );
    }

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests: formatRequests }),
    });
  } catch (formatErr) {
    console.warn('Formatting spreadsheet failed non-critically:', formatErr);
  }

  saveSpreadsheetId(spreadsheetId);
  return { id: spreadsheetId, url: spreadsheetUrl };
};

let resolvedSheetTitle: string | null = null;

/**
 * ดึงรายการแท็บทั้งหมดใน Google Sheet
 */
export const getSpreadsheetTabs = async (
  spreadsheetId: string,
  accessToken: string
): Promise<Array<{ sheetId: number; title: string }>> => {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(sheetId,title)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (res.ok) {
      const data = await res.json();
      return (data.sheets || []).map((s: any) => ({
        sheetId: s.properties?.sheetId ?? 0,
        title: s.properties?.title || '',
      }));
    }
  } catch (e) {
    console.warn('Could not query sheet tabs:', e);
  }
  return [{ sheetId: 0, title: SHEET_NAME }];
};

/**
 * ค้นหาชื่อแท็บจริงใน Google Sheet (เช่น 'ภาพรวมงาน 2570', 'ติดตามงาน2570' หรือแท็บแรก)
 */
export const resolveSheetTitle = async (
  spreadsheetId: string,
  accessToken: string
): Promise<string> => {
  if (resolvedSheetTitle) return resolvedSheetTitle;
  const tabs = await getSpreadsheetTabs(spreadsheetId, accessToken);
  const match =
    tabs.find(t => t.title === 'ภาพรวมงาน 2570' || t.title === SHEET_NAME) || tabs[0];
  if (match?.title) {
    resolvedSheetTitle = match.title;
    return match.title;
  }
  return SHEET_NAME;
};

// 2. ดึงรายการงานทั้งหมดจาก Sheet (รองรับทั้งแบบ 12 เดือนแยกแท็บ และแบบแผ่นรวม)
export const fetchTasksFromSheet = async (
  spreadsheetId: string,
  accessToken: string
): Promise<TaskItem[]> => {
  const tabs = await getSpreadsheetTabs(spreadsheetId, accessToken);
  
  // ตรวจสอบว่ามีแท็บที่เป็น 12 เดือนหรือไม่
  const monthlyTabs = tabs
    .map(t => ({ ...t, matchedMonth: matchFiscalMonth(t.title) }))
    .filter(t => t.matchedMonth !== null);

  // ถ้ามีแท็บเดือนมากกว่า 1 แท็บ ให้ดึงจากแท็บ 12 เดือนด้วย batchGet
  if (monthlyTabs.length >= 2) {
    try {
      const ranges = monthlyTabs.map(t => `'${t.title}'!A2:M`);
      const queryParam = ranges.map(r => `ranges=${encodeRange(r)}`).join('&');
      const batchRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${queryParam}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (batchRes.ok) {
        const batchData = await batchRes.json();
        const valueRanges = batchData.valueRanges || [];
        const allTasks: TaskItem[] = [];
        const seenIds = new Set<string>();

        valueRanges.forEach((vr: any, idx: number) => {
          const tabInfo = monthlyTabs[idx];
          const rows: string[][] = vr.values || [];
          rows.forEach((row, rowIdx) => {
            const task = rowToTask(row, rowIdx + 2);
            // หากในแถวไม่มีระบุเดือน ให้เติมเดือนจากชื่อแท็บให้อัตโนมัติ
            if (!task.month && tabInfo.matchedMonth) {
              task.month = tabInfo.matchedMonth;
            }
            if (task.id && !seenIds.has(task.id)) {
              seenIds.add(task.id);
              allTasks.push(task);
            }
          });
        });

        if (allTasks.length > 0) {
          return allTasks;
        }
      }
    } catch (batchErr) {
      console.warn('Batch get from 12 month tabs failed, falling back to master sheet:', batchErr);
    }
  }

  // แผนรองรับ: ดึงจากแผ่นรวม หรือแท็บแรก
  const sheetTitle = await resolveSheetTitle(spreadsheetId, accessToken);
  const range = `'${sheetTitle}'!A2:M`;
  let res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeRange(range)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok && res.status !== 401) {
    res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A2:M`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  }

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Google Account Session หมดอายุ กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่');
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'ไม่สามารถโหลดข้อมูลจาก Google Sheet ได้');
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  return rows.map((row, index) => rowToTask(row, index + 2));
};

// 3. เพิ่มงานใหม่ลงใน Sheet (Append Row)
export const appendTaskToSheet = async (
  spreadsheetId: string,
  accessToken: string,
  task: TaskItem
): Promise<number> => {
  let tabs: Array<{ sheetId: number; title: string }> = [];
  try {
    tabs = await getSpreadsheetTabs(spreadsheetId, accessToken);
  } catch (e) {
    tabs = [];
  }

  // 1. ค้นหาแท็บที่ตรงกับประจำเดือนของงาน (เช่น 'มีนาคม 2570', 'ตุลาคม 2569')
  let targetTabTitle = '';
  if (task.month) {
    const cleanMonth = task.month.trim();
    const matched = tabs.find(t => {
      const title = t.title.trim();
      return (
        title === cleanMonth ||
        matchFiscalMonth(title) === cleanMonth ||
        (cleanMonth.split(' ')[0] && title.includes(cleanMonth.split(' ')[0]))
      );
    });
    if (matched) {
      targetTabTitle = matched.title;
    }
  }

  // 2. หากไม่พบแท็บเดือน ให้ใช้แท็บภาพรวม หรือแท็บหลัก
  if (!targetTabTitle) {
    targetTabTitle = await resolveSheetTitle(spreadsheetId, accessToken);
  }

  const rowData = taskToRow(task);
  const primaryRange = formatSheetRange(targetTabTitle, 'A:M');

  let res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${primaryRange}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData],
      }),
    }
  );

  // สำรองแบบที่ 1: ใช้ encodeURIComponent เฉพาะชื่อชีต
  if (!res.ok && res.status !== 401) {
    res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(
        targetTabTitle
      )}'!A:M:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowData],
        }),
      }
    );
  }

  // สำรองแบบที่ 2: ใช้ A:M ไปยังแท็บแรกอัตโนมัติ
  if (!res.ok && res.status !== 401) {
    res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:M:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowData],
        }),
      }
    );
  }

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Google Account Session หมดอายุ กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่');
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'ไม่สามารถเพิ่มข้อมูลลง Google Sheet ได้');
  }

  const result = await res.json();

  // หากมีแท็บภาพรวมแยกต่างหาก (เช่น 'ภาพรวมงาน 2570') และบันทึกเข้าแท็บประจำเดือนไปแล้ว
  // ให้บันทึกสำเนาลงแท็บภาพรวมด้วยในพื้นหลัง เพื่อให้ทั้งภาพรวมและแท็บเดือนสมบูรณ์พร้อมกัน
  const overviewTab = tabs.find(t => t.title.includes('ภาพรวม') || t.title === SHEET_NAME);
  if (overviewTab && overviewTab.title !== targetTabTitle) {
    fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${formatSheetRange(
        overviewTab.title,
        'A:M'
      )}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowData],
        }),
      }
    ).catch(() => {});
  }

  // Extract row index from updatedRange e.g. "ติดตามงาน2570!A16:M16"
  const rangeStr = result?.updates?.updatedRange || '';
  const match = rangeStr.match(/![A-Z]+(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

// 4. อัปเดตงานใน Sheet (Update Row)
export const updateTaskInSheet = async (
  spreadsheetId: string,
  accessToken: string,
  rowNumber: number,
  task: TaskItem
): Promise<void> => {
  let tabs: Array<{ sheetId: number; title: string }> = [];
  try {
    tabs = await getSpreadsheetTabs(spreadsheetId, accessToken);
  } catch (e) {
    tabs = [];
  }

  let targetTabTitle = '';
  if (task.month) {
    const cleanMonth = task.month.trim();
    const matched = tabs.find(t => {
      const title = t.title.trim();
      return (
        title === cleanMonth ||
        matchFiscalMonth(title) === cleanMonth ||
        (cleanMonth.split(' ')[0] && title.includes(cleanMonth.split(' ')[0]))
      );
    });
    if (matched) {
      targetTabTitle = matched.title;
    }
  }

  if (!targetTabTitle) {
    targetTabTitle = await resolveSheetTitle(spreadsheetId, accessToken);
  }

  const rowData = taskToRow(task);
  const primaryRange = formatSheetRange(targetTabTitle, `A${rowNumber}:M${rowNumber}`);
  let res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${primaryRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: primaryRange,
        majorDimension: 'ROWS',
        values: [rowData],
      }),
    }
  );

  if (!res.ok && res.status !== 401) {
    const fallbackRange = `A${rowNumber}:M${rowNumber}`;
    res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${fallbackRange}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: fallbackRange,
          majorDimension: 'ROWS',
          values: [rowData],
        }),
      }
    );
  }

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Google Account Session หมดอายุ กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่');
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'ไม่สามารถแก้ไขข้อมูลใน Google Sheet ได้');
  }
};
 
// 5. ลบแถวใน Sheet (Delete Row)
export const deleteTaskFromSheet = async (
  spreadsheetId: string,
  accessToken: string,
  rowNumber: number
): Promise<void> => {
  // Get sheetId for SHEET_NAME
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!metaRes.ok) throw new Error('ไม่สามารถตรวจสอบโครงสร้าง Sheet ได้');
  const meta = await metaRes.json();
  const sheet = meta.sheets?.find((s: any) => s.properties?.title === SHEET_NAME) || meta.sheets?.[0];
  const sheetId = sheet?.properties?.sheetId ?? 0;
 
  // 0-indexed: rowNumber 2 in sheet means index 1
  const zeroIndex = rowNumber - 1;
 
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: zeroIndex,
              endIndex: zeroIndex + 1,
            },
          },
        },
      ],
    }),
  });
 
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'ไม่สามารถลบแถวออกจาก Google Sheet ได้');
  }
};
 
// 6. บันทึกข้อมูลงานทั้งหมดทับลงใน Sheet (Full Sync/Backup)
export const fullSyncToSheet = async (
  spreadsheetId: string,
  accessToken: string,
  tasks: TaskItem[]
): Promise<void> => {
  const tabs = await getSpreadsheetTabs(spreadsheetId, accessToken);
  const monthlyTabs = tabs
    .map(t => ({ ...t, matchedMonth: matchFiscalMonth(t.title) }))
    .filter(t => t.matchedMonth !== null);

  // กรณีมีแท็บแยก 12 เดือน ให้ซิงค์ลงทั้ง 12 แท็บประจำเดือน
  if (monthlyTabs.length >= 2) {
    const dataUpdates: Array<{ range: string; majorDimension: string; values: any[][] }> = [];

    // เคลียร์และเขียนข้อมูลลงแต่ละแท็บประจำเดือน
    for (const tab of monthlyTabs) {
      const monthTasks = tasks.filter(t => t.month === tab.matchedMonth);
      const rows = monthTasks.map(taskToRow);

      // เคลียร์ข้อมูลเก่าในแท็บเดือน
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeRange(
          `'${tab.title}'!A2:M`
        )}:clear`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      ).catch(() => {});

      if (rows.length > 0) {
        dataUpdates.push({
          range: `'${tab.title}'!A2:M${rows.length + 1}`,
          majorDimension: 'ROWS',
          values: rows,
        });
      }
    }

    // หากมีแท็บภาพรวม (ภาพรวมงาน 2570 หรือ ติดตามงาน2570) ให้เขียนข้อมูลทั้งหมดลงไปด้วย
    const overviewTab = tabs.find(
      t => t.title === 'ภาพรวมงาน 2570' || t.title === SHEET_NAME
    );
    if (overviewTab) {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeRange(
          `'${overviewTab.title}'!A2:M`
        )}:clear`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      ).catch(() => {});

      const allRows = tasks.map(taskToRow);
      if (allRows.length > 0) {
        dataUpdates.push({
          range: `'${overviewTab.title}'!A2:M${allRows.length + 1}`,
          majorDimension: 'ROWS',
          values: allRows,
        });
      }
    }

    if (dataUpdates.length > 0) {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            valueInputOption: 'USER_ENTERED',
            data: dataUpdates,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'ไม่สามารถซิงค์ข้อมูลลง 12 แท็บเดือนได้');
      }
    }
    return;
  }

  // แผนมาตรฐาน: ซิงค์ลง Sheet แผ่นเดียว
  const sheetTitle = await resolveSheetTitle(spreadsheetId, accessToken);
  const clearRange = `'${sheetTitle}'!A2:M`;

  // First clear old data from row 2 downwards
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeRange(
      clearRange
    )}:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // Write all rows
  const rows = tasks.map(taskToRow);
  if (rows.length > 0) {
    const writeRange = `'${sheetTitle}'!A2:M${rows.length + 1}`;
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeRange(
        writeRange
      )}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: writeRange,
          majorDimension: 'ROWS',
          values: rows,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'ไม่สามารถซิงค์ข้อมูลลง Google Sheet ได้');
    }
  }
};
 