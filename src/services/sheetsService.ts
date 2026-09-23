import { TaskItem, TaskStatus, MainDepartmentId } from '../types';
import { DEPARTMENTS } from '../data/departments';
 
const SHEET_NAME = 'ติดตามงาน2570';
const SPREADSHEET_TITLE = 'ระบบติดตามงาน_ปีงบประมาณ_2570_คณะโลจิสติกส์ฯ_มน';
const STORAGE_KEY_SPREADSHEET_ID = 'nuls_tracking_spreadsheet_id_2570';
 
// [เพิ่มใหม่] รหัส Google Sheet ที่ใช้เป็น "ศูนย์กลาง" ของระบบ
// ทุกคนที่เปิดแอปนี้จะเชื่อมกับ Sheet ไฟล์เดียวกันนี้โดยอัตโนมัติ
// ไม่ต้องพิมพ์/เชื่อมต่อรหัส Sheet เองทีละคนอีกต่อไป
const DEFAULT_SPREADSHEET_ID = '1DkdJ7zienczCFhUwKYfdGUJBQ_sWi6OgoZDSOZrGMoA';
 
// [แก้ไข] ฟังก์ชันช่วยสร้าง "range" ที่เข้ารหัสถูกต้อง ปลอดภัยสำหรับใส่ใน URL
// เพราะชื่อแท็บเป็นภาษาไทย ถ้าไม่เข้ารหัสก่อน Google Sheets API จะอ่านที่อยู่ไม่ออก
// แล้วโยน error "Unable to parse range" กลับมา
const encodeRange = (range: string): string => encodeURIComponent(range);
 
export const HEADERS = [
  'รหัสงาน',
  'ชื่องาน/โครงการ/กิจกรรม',
  'กลุ่มงานหลัก',
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
 
// 1. สร้าง Google Spreadsheet ใหม่
export const createSpreadsheet = async (
  accessToken: string,
  initialTasks: TaskItem[] = []
): Promise<{ id: string; url: string }> => {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE,
        locale: 'th_TH',
        timeZone: 'Asia/Bangkok',
      },
      sheets: [
        {
          properties: {
            title: SHEET_NAME,
            sheetId: 0,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
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
  const rows = [HEADERS, ...initialTasks.map(taskToRow)];
  const initialRange = `'${SHEET_NAME}'!A1:M${rows.length}`;
 
  await fetch(
    // [แก้ไข] ใช้ encodeRange() ครอบ range ก่อนใส่ใน URL
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
 
  // ตกแต่ง Formatting แถวหัวข้อ (Header style: ส้ม ม.นเรศวร #EA580C, ตัวอักษรสีขาว หนา)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
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
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: HEADERS.length,
              },
            },
          },
        ],
      }),
    });
  } catch (formatErr) {
    console.warn('Formatting spreadsheet failed non-critically:', formatErr);
  }
 
  saveSpreadsheetId(spreadsheetId);
  return { id: spreadsheetId, url: spreadsheetUrl };
};
 
// 2. ดึงรายการงานทั้งหมดจาก Sheet
export const fetchTasksFromSheet = async (
  spreadsheetId: string,
  accessToken: string
): Promise<TaskItem[]> => {
  const range = `'${SHEET_NAME}'!A2:M`;
  const res = await fetch(
    // [แก้ไข] ใช้ encodeRange() ครอบ range ก่อนใส่ใน URL — จุดนี้คือจุดที่ทำให้ปุ่ม "รีเฟรชข้อมูลล่าสุด" error
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeRange(range)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
 
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'ไม่สามารถโหลดข้อมูลจาก Google Sheet ได้');
  }
 
  const data = await res.json();
  const rows: string[][] = data.values || [];
 
  return rows.map((row, index) => rowToTask(row, index + 2)); // row index starts at 2 (1 is header)
};
 
// 3. เพิ่มงานใหม่ลงใน Sheet (Append Row)
export const appendTaskToSheet = async (
  spreadsheetId: string,
  accessToken: string,
  task: TaskItem
): Promise<number> => {
  const rowData = taskToRow(task);
  const range = `'${SHEET_NAME}'!A:M`;
  const res = await fetch(
    // [แก้ไข] ใช้ encodeRange() ครอบ range ก่อนใส่ใน URL
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeRange(
      range
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
  );
 
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'ไม่สามารถเพิ่มข้อมูลลง Google Sheet ได้');
  }
 
  const result = await res.json();
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
  const rowData = taskToRow(task);
  const range = `'${SHEET_NAME}'!A${rowNumber}:M${rowNumber}`;
  const res = await fetch(
    // [แก้ไข] ใช้ encodeRange() ครอบ range ก่อนใส่ใน URL
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeRange(
      range
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: [rowData],
      }),
    }
  );
 
  if (!res.ok) {
    const err = await res.json();
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
  const clearRange = `'${SHEET_NAME}'!A2:M`;
 
  // First clear old data from row 2 downwards
  await fetch(
    // [แก้ไข] ใช้ encodeRange() ครอบ range ก่อนใส่ใน URL
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
    const writeRange = `'${SHEET_NAME}'!A2:M${rows.length + 1}`;
    const res = await fetch(
      // [แก้ไข] ใช้ encodeRange() ครอบ range ก่อนใส่ใน URL
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
      const err = await res.json();
      throw new Error(err?.error?.message || 'ไม่สามารถซิงค์ข้อมูลลง Google Sheet ได้');
    }
  }
};
 