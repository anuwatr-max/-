export type TaskStatus = 'ยังไม่ดำเนินการ' | 'ระหว่างดำเนินการ' | 'ดำเนินการแล้วเสร็จ';

export type MainDepartmentId = 'admin' | 'academic' | 'research' | 'finance';

export interface SubUnit {
  id: string;
  code: string;
  name: string;
  departmentId: MainDepartmentId;
}

export interface MainDepartment {
  id: MainDepartmentId;
  name: string;
  color: string;
  bgLight: string;
  borderColor: string;
  units: SubUnit[];
}

export interface TaskItem {
  id: string;
  rowNumber?: number; // Sheet row number if synced
  title: string;
  departmentId: MainDepartmentId;
  departmentName: string;
  unitId: string;
  unitName: string;
  assignee: string;
  month: string; // เช่น 'ตุลาคม 2569', 'มกราคม 2570'
  status: TaskStatus;
  progress: number; // 0 - 100
  startDate: string;
  dueDate: string;
  description?: string;
  performanceSummary?: string; // ผลการดำเนินงานสรุป
  updatedAt: string;
  createdAt: string;
}

export interface FiscalMonth {
  id: string;
  name: string;
  quarter: 1 | 2 | 3 | 4;
  year: number;
}

export interface UserAuthInfo {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  accessToken: string | null;
}

export interface SheetSyncState {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  spreadsheetTitle: string | null;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
}
