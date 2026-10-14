import { MainDepartment, FiscalMonth, TaskStatus } from '../types';

export const TASK_STATUSES: { label: TaskStatus; color: string; bg: string; border: string }[] = [
  {
    label: 'ยังไม่ดำเนินการ',
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  {
    label: 'ระหว่างดำเนินการ',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    label: 'ดำเนินการแล้วเสร็จ',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
];

export const DEPARTMENTS: MainDepartment[] = [
  {
    id: 'admin',
    name: 'งานธุรการ',
    color: 'text-slate-700',
    bgLight: 'bg-slate-100',
    borderColor: 'border-slate-300',
    units: [
      { id: '1.1', code: '1.1', name: 'หน่วยแผน', departmentId: 'admin' },
      { id: '1.2', code: '1.2', name: 'หน่วยสารบรรณ', departmentId: 'admin' },
      { id: '1.3', code: '1.3', name: 'หน่วยบุคคล', departmentId: 'admin' },
      { id: '1.4', code: '1.4', name: 'หน่วยอาคารสถานที่และยานพาหนะ', departmentId: 'admin' },
    ],
  },
  {
    id: 'academic',
    name: 'งานบริการการศึกษา',
    color: 'text-emerald-700',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    units: [
      { id: '2.1', code: '2.1', name: 'หน่วยวิชาการระดับปริญญาตรี', departmentId: 'academic' },
      { id: '2.2', code: '2.2', name: 'หน่วยวิชาการระดับบัณฑิตศึกษา', departmentId: 'academic' },
      { id: '2.3', code: '2.3', name: 'หน่วยกิจการนิสิตและศิษย์เก่าสัมพันธ์', departmentId: 'academic' },
      { id: '2.4', code: '2.4', name: 'หน่วยประชาสัมพันธ์และสื่อสารองค์กร', departmentId: 'academic' },
    ],
  },
  {
    id: 'research',
    name: 'งานวิจัยและพัฒนาคุณภาพการศึกษา',
    color: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    units: [
      { id: '3.1', code: '3.1', name: 'หน่วยเทคโนโลยีสารสนเทศ', departmentId: 'research' },
      { id: '3.2', code: '3.2', name: 'หน่วยวิจัย', departmentId: 'research' },
      { id: '3.3', code: '3.3', name: 'หน่วยบริการวิชาการ', departmentId: 'research' },
    ],
  },
  {
    id: 'finance',
    name: 'งานการเงินและพัสดุ',
    color: 'text-sky-700',
    bgLight: 'bg-sky-50',
    borderColor: 'border-sky-200',
    units: [
      { id: '4.1', code: '4.1', name: 'หน่วยการเงิน', departmentId: 'finance' },
      { id: '4.2', code: '4.2', name: 'หน่วยบัญชี', departmentId: 'finance' },
      { id: '4.3', code: '4.3', name: 'หน่วยพัสดุ', departmentId: 'finance' },
    ],
  },
];

// ===== ตั้งค่าปีงบประมาณ (แก้ที่เดียวเมื่อขึ้นปีงบประมาณใหม่) =====
// ปีงบประมาณ พ.ศ. เช่น 2570 = ตุลาคม 2569 ถึง กันยายน 2570
export const FISCAL_YEAR = 2570;

const THAI_MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

// สร้างเดือนทั้ง 12 เดือนของปีงบประมาณจาก FISCAL_YEAR (ต.ค. ปีก่อนหน้า ถึง ก.ย. ปีนี้)
const buildFiscalMonths = (fiscalYear: number): FiscalMonth[] => {
  const result: FiscalMonth[] = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = (9 + i) % 12; // 9 = ตุลาคม
    const year = monthIndex >= 9 ? fiscalYear - 1 : fiscalYear;
    const quarter = Math.floor(i / 3) + 1;
    const mm = String(monthIndex + 1).padStart(2, '0');
    result.push({
      id: `${year}-${mm}`,
      name: `${THAI_MONTH_NAMES[monthIndex]} ${year}`,
      quarter,
      year,
    });
  }
  return result;
};

export const FISCAL_MONTHS: FiscalMonth[] = buildFiscalMonths(FISCAL_YEAR);

// เดือนปัจจุบัน (เวลาไทย) ในรูปแบบชื่อเดือนของปีงบประมาณ
// ถ้าวันนี้อยู่นอกปีงบประมาณ จะคืนเดือนแรก (ก่อนเริ่มปี) หรือเดือนสุดท้าย (หลังจบปี)
export const getCurrentFiscalMonthName = (): string => {
  const ymd = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }); // YYYY-MM-DD
  const [y, m] = ymd.split('-');
  const id = `${Number(y) + 543}-${m}`;
  const found = FISCAL_MONTHS.find(fm => fm.id === id);
  if (found) return found.name;
  return id < FISCAL_MONTHS[0].id ? FISCAL_MONTHS[0].name : FISCAL_MONTHS[FISCAL_MONTHS.length - 1].name;
};

export const getDeptDotClass = (deptId: string): string => {
  switch (deptId) {
    case 'admin':
    case 'general':
      return 'bg-slate-500';
    case 'academic':
    case 'education':
      return 'bg-emerald-500';
    case 'research':
      return 'bg-blue-600';
    case 'finance':
      return 'bg-sky-400';
    default:
      return 'bg-slate-400';
  }
};
