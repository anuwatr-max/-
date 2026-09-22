import { MainDepartment, FiscalMonth, TaskStatus } from '../types';

export const TASK_STATUSES: { label: TaskStatus; color: string; bg: string; border: string }[] = [
  {
    label: 'ยังไม่ดำเนินการ',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
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
    color: 'text-indigo-600',
    bgLight: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
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
    color: 'text-sky-600',
    bgLight: 'bg-sky-50',
    borderColor: 'border-sky-200',
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
    color: 'text-violet-600',
    bgLight: 'bg-violet-50',
    borderColor: 'border-violet-200',
    units: [
      { id: '3.1', code: '3.1', name: 'หน่วยเทคโนโลยีสารสนเทศ', departmentId: 'research' },
      { id: '3.2', code: '3.2', name: 'หน่วยวิจัย', departmentId: 'research' },
      { id: '3.3', code: '3.3', name: 'หน่วยบริการวิชาการ', departmentId: 'research' },
    ],
  },
  {
    id: 'finance',
    name: 'งานการเงินและพัสดุ',
    color: 'text-amber-600',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    units: [
      { id: '4.1', code: '4.1', name: 'หน่วยการเงิน', departmentId: 'finance' },
      { id: '4.2', code: '4.2', name: 'หน่วยบัญชี', departmentId: 'finance' },
      { id: '4.3', code: '4.3', name: 'หน่วยพัสดุ', departmentId: 'finance' },
    ],
  },
];

// เดือนประจำปีงบประมาณ 2570 (เริ่ม ตุลาคม 2569 ถึง กันยายน 2570)
export const FISCAL_MONTHS: FiscalMonth[] = [
  { id: '2569-10', name: 'ตุลาคม 2569', quarter: 1, year: 2569 },
  { id: '2569-11', name: 'พฤศจิกายน 2569', quarter: 1, year: 2569 },
  { id: '2569-12', name: 'ธันวาคม 2569', quarter: 1, year: 2569 },
  { id: '2570-01', name: 'มกราคม 2570', quarter: 2, year: 2570 },
  { id: '2570-02', name: 'กุมภาพันธ์ 2570', quarter: 2, year: 2570 },
  { id: '2570-03', name: 'มีนาคม 2570', quarter: 2, year: 2570 },
  { id: '2570-04', name: 'เมษายน 2570', quarter: 3, year: 2570 },
  { id: '2570-05', name: 'พฤษภาคม 2570', quarter: 3, year: 2570 },
  { id: '2570-06', name: 'มิถุนายน 2570', quarter: 3, year: 2570 },
  { id: '2570-07', name: 'กรกฎาคม 2570', quarter: 4, year: 2570 },
  { id: '2570-08', name: 'สิงหาคม 2570', quarter: 4, year: 2570 },
  { id: '2570-09', name: 'กันยายน 2570', quarter: 4, year: 2570 },
];
