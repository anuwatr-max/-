import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  RotateCcw,
  List,
  Grid,
  Eye,
  Edit2,
  X,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Check,
  Lock,
} from 'lucide-react';
import { TaskItem, TaskStatus, MainDepartmentId } from '../types';
import { DEPARTMENTS, FISCAL_MONTHS, TASK_STATUSES, getDeptDotClass } from '../data/departments';
import { canUserAddTask, canUserEditTask, getUserPermission } from '../data/userPermissions';
import { DeviceMode } from './DeviceDropdown';

interface TaskCalendarViewProps {
  tasks: TaskItem[];
  onAddTask: (defaultDate?: string) => void;
  onEditTask: (task: TaskItem) => void;
  onQuickStatusChange: (task: TaskItem, newStatus: TaskStatus) => Promise<void>;
  deviceMode?: DeviceMode;
  isGuestMode?: boolean;
  currentUserEmail?: string | null;
}

const THAI_MONTH_NAMES_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_DAY_NAMES = [
  { short: 'จ.', full: 'จันทร์' },
  { short: 'อ.', full: 'อังคาร' },
  { short: 'พ.', full: 'พุธ' },
  { short: 'พฤ.', full: 'พฤหัสบดี' },
  { short: 'ศ.', full: 'ศุกร์' },
  { short: 'ส.', full: 'เสาร์' },
  { short: 'อา.', full: 'อาทิตย์' },
];

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  onAddTask,
  onEditTask,
  onQuickStatusChange,
  deviceMode = 'desktop',
  isGuestMode = false,
  currentUserEmail,
}) => {
  const isMobileLayout = deviceMode === 'mobile';
  const canAdd = !isGuestMode && canUserAddTask(currentUserEmail);
  const userPerm = getUserPermission(currentUserEmail);

  // State สำหรับเดือนและปีที่แสดงในปฏิทิน
  // ค่าเริ่มต้น: ดึงจากเดือนปัจจุบันจริง หรือถ้าอยู่ในช่วงปีงบประมาณ 2570
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // หา task แรกที่มี dueDate เพื่อดูช่วงเวลา หากไม่มีให้ใช้วันนี้
    const now = new Date();
    return now;
  });

  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // สำหรับการคลิกดูรายละเอียดของงาน หรือ วันที่ถูกเลือก
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed (0 = Jan, 9 = Oct)

  // เปลี่ยนเดือน
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDayString(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDayString(null);
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const todayStr = today.toISOString().split('T')[0];
    setSelectedDayString(todayStr);
  };

  // กระโดดไปยังเดือนงบประมาณที่เลือก
  const handleSelectFiscalMonth = (fiscalId: string) => {
    // fiscalId format: '2569-10' or '2570-03'
    const [beYearStr, monthStr] = fiscalId.split('-');
    const beYear = parseInt(beYearStr, 10);
    const m = parseInt(monthStr, 10) - 1;
    const ceYear = beYear - 543;
    setCurrentDate(new Date(ceYear, m, 1));
    setSelectedDayString(null);
  };

  // กรอง Tasks ตามคำค้นหา และ Department / Status
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // ค้นหาตามคำค้นหา (ชื่องาน, ผู้รับผิดชอบ, หน่วยงาน)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(term);
        const matchesAssignee = task.assignee.toLowerCase().includes(term);
        const matchesDept = task.departmentName.toLowerCase().includes(term);
        const matchesUnit = task.unitName.toLowerCase().includes(term);
        if (!matchesTitle && !matchesAssignee && !matchesDept && !matchesUnit) {
          return false;
        }
      }

      // กรองตามหน่วยงาน
      if (selectedDept !== 'all' && task.departmentId !== selectedDept) {
        return false;
      }

      // กรองตามสถานะ
      if (selectedStatus !== 'all' && task.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [tasks, searchTerm, selectedDept, selectedStatus]);

  // คำนวณวันทั้งหมดในตารางปฏิทินของเดือนปัจจุบัน
  // ตารางแบบ 7 คอลัมน์ เริ่มต้นจากวันจันทร์ (Monday = 0, Sunday = 6)
  const calendarDays = useMemo(() => {
    const year = currentYear;
    const month = currentMonth;

    // วันแรกของเดือน
    const firstDayOfMonth = new Date(year, month, 1);
    // วันสุดท้ายของเดือน
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // หาวันในสัปดาห์ของวันแรก (0 = อาทิตย์, 1 = จันทร์, ..., 6 = เสาร์)
    // แปลงให้วันจันทร์เป็น 0 และวันอาทิตย์เป็น 6
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    // วันสุดท้ายของเดือนก่อนหน้า
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: {
      dateString: string; // YYYY-MM-DD
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      dateObj: Date;
    }[] = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // เติมวันจากเดือนก่อนหน้า
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(year, month - 1, dayNum);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(dayNum).padStart(2, '0');
      const dateString = `${y}-${m}-${dayStr}`;
      days.push({
        dateString,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
        dateObj: d,
      });
    }

    // วันในเดือนปัจจุบัน
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(dayNum).padStart(2, '0');
      const dateString = `${y}-${m}-${dayStr}`;
      days.push({
        dateString,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
        dateObj: d,
      });
    }

    // เติมวันของเดือนถัดไปให้เต็มสัปดาห์ (แถวละ 7 วัน รวมเป็นทวีคูณของ 7)
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remainingDays; dayNum++) {
      const d = new Date(year, month + 1, dayNum);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(dayNum).padStart(2, '0');
      const dateString = `${y}-${m}-${dayStr}`;
      days.push({
        dateString,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
        dateObj: d,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // แมป Tasks เข้ากับแต่ละวันที่ (ตาม dueDate เป็นหลัก หรือ startDate)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskItem[]>();
    filteredTasks.forEach(task => {
      // ตรวจสอบ dueDate ก่อน
      if (task.dueDate) {
        const dateKey = task.dueDate.trim();
        const existing = map.get(dateKey) || [];
        existing.push(task);
        map.set(dateKey, existing);
      }
    });
    return map;
  }, [filteredTasks]);

  // สถิติประจำเดือนที่กำลังแสดงผลอยู่
  const monthStats = useMemo(() => {
    const y = currentYear;
    const m = currentMonth;
    const monthTasks = filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      const [tY, tM] = task.dueDate.split('-').map(Number);
      return tY === y && tM === m + 1;
    });

    const total = monthTasks.length;
    const completed = monthTasks.filter(t => t.status === 'ดำเนินการแล้วเสร็จ').length;
    const inProgress = monthTasks.filter(t => t.status === 'ระหว่างดำเนินการ').length;
    const notStarted = monthTasks.filter(t => t.status === 'ยังไม่ดำเนินการ').length;

    return { total, completed, inProgress, notStarted, monthTasks };
  }, [filteredTasks, currentYear, currentMonth]);

  // สรุปงานในมุมมอง Agenda (เรียงตามวันที่ dueDate)
  const agendaGroupedTasks = useMemo(() => {
    const y = currentYear;
    const m = currentMonth;
    // ดึงงานที่มี dueDate ในเดือนนี้
    const currentMonthTasks = filteredTasks.filter(task => {
      if (!task.dueDate) return false;
      const [tY, tM] = task.dueDate.split('-').map(Number);
      return tY === y && tM === m + 1;
    });

    // เรียงตาม dueDate
    currentMonthTasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    // จัดกลุ่มตาม dueDate
    const groups: { dateStr: string; tasks: TaskItem[] }[] = [];
    const map = new Map<string, TaskItem[]>();

    currentMonthTasks.forEach(t => {
      const arr = map.get(t.dueDate) || [];
      arr.push(t);
      map.set(t.dueDate, arr);
    });

    Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([dateStr, items]) => {
        groups.push({ dateStr, tasks: items });
      });

    return groups;
  }, [filteredTasks, currentYear, currentMonth]);

  // วันที่ที่ถูกเลือกในปัจจุบัน (หรือคลิกเพื่อดูรายการงานในวันนั้น)
  const selectedDayTasks = useMemo(() => {
    if (!selectedDayString) return [];
    return tasksByDate.get(selectedDayString) || [];
  }, [selectedDayString, tasksByDate]);

  // Format วันที่แบบไทย
  const formatThaiDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (!y || !m || !d) return dateStr;
      const beYear = y + 543;
      const monthName = THAI_MONTH_NAMES_FULL[m - 1] || '';
      return `${d} ${monthName} ${beYear}`;
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'ดำเนินการแล้วเสร็จ':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>แล้วเสร็จ</span>
          </span>
        );
      case 'ระหว่างดำเนินการ':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            <Clock className="h-3 w-3 text-blue-600" />
            <span>กำลังทำ</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
            <AlertCircle className="h-3 w-3 text-sky-600" />
            <span>ยังไม่เริ่ม</span>
          </span>
        );
    }
  };

  // หา fiscal month id ปัจจุบัน
  const currentFiscalMonthId = useMemo(() => {
    const beYear = currentYear + 543;
    const mStr = String(currentMonth + 1).padStart(2, '0');
    return `${beYear}-${mStr}`;
  }, [currentYear, currentMonth]);

  const handleQuickStatusUpdate = async (task: TaskItem, newStatus: TaskStatus) => {
    if (isGuestMode) return;
    setIsUpdatingStatus(true);
    try {
      await onQuickStatusChange(task, newStatus);
      if (selectedTask && selectedTask.id === task.id) {
        setSelectedTask({ ...selectedTask, status: newStatus, progress: newStatus === 'ดำเนินการแล้วเสร็จ' ? 100 : selectedTask.progress });
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card: คอนโซลควบคุมปฏิทิน พื้นสีฟ้าอ่อนแบบนูน (Light Blue 3D Embossed Relief Console) */}
      <div className="bg-gradient-to-b from-sky-50/95 via-sky-50/50 to-blue-100/60 rounded-2xl border border-sky-200/90 border-t-white border-b-[3.5px] border-b-sky-300 shadow-md shadow-sky-950/5 ring-1 ring-inset ring-white/90 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title and subtitle */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/95 text-blue-700 border border-sky-200 shadow-2xs">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-700 flex flex-wrap items-center gap-2">
                  {/* ปฏิทินงาน กรอบสี่เหลี่ยมพื้นสีเทานูน (Compact 3D Embossed Relief in Gray) */}
                  <span className="inline-block px-3 py-1 rounded-lg bg-gradient-to-r from-slate-100 via-slate-50 to-slate-150 text-slate-700 border border-slate-200 border-b-[2.5px] border-b-slate-400 font-bold text-sm sm:text-base shadow-sm ring-1 ring-inset ring-white/90">
                    ปฏิทินงาน ปีงบประมาณ 2570
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100/80 text-blue-900 border border-blue-200 shadow-2xs">
                    รอบกำหนดส่ง
                  </span>
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร
                </p>
              </div>
            </div>
          </div>

          {/* Month Switcher & Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* View Mode Toggle: ปฏิทิน / กำหนดการ */}
            <div className="flex items-center p-1 bg-white/80 rounded-xl border border-sky-200/90 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 text-slate-800 font-bold border-t border-t-white border-x border-slate-300 border-b-[2px] border-b-slate-400 shadow-xs ring-1 ring-inset ring-white/90'
                    : 'text-slate-600 hover:text-slate-800 font-medium'
                }`}
                title="มุมมองปฏิทินรายเดือน"
              >
                <Grid className="h-3.5 w-3.5" />
                <span>รายเดือน</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 text-slate-800 font-bold border-t border-t-white border-x border-slate-300 border-b-[2px] border-b-slate-400 shadow-xs ring-1 ring-inset ring-white/90'
                    : 'text-slate-600 hover:text-slate-800 font-medium'
                }`}
                title="มุมมองกำหนดการตามวันที่"
              >
                <List className="h-3.5 w-3.5" />
                <span>กำหนดการ</span>
              </button>
            </div>

            {/* ปุ่ม วันนี้ */}
            <button
              type="button"
              onClick={handleGoToday}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 hover:from-slate-100 hover:to-slate-200 border-t border-t-white border-x border-slate-200 border-b-[2px] border-b-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs active:translate-y-0.5"
            >
              วันนี้
            </button>

            {/* ปุ่มเพิ่มงานใหม่ - แสดงเฉพาะผู้มีสิทธิ์ */}
            {canAdd && (
              <button
                type="button"
                onClick={() => onAddTask()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer active:translate-y-0.5 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>เพิ่มงานใหม่</span>
              </button>
            )}
          </div>
        </div>

        {/* Month Navigation & Fiscal Month Quick Select Bar */}
        <div className="mt-5 pt-4 border-t border-sky-200/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Main Month Stepper */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 hover:from-slate-100 hover:to-slate-200 border-t border-t-white border-x border-slate-200 border-b-[2px] border-b-slate-300 text-slate-700 shadow-2xs transition-all cursor-pointer active:translate-y-0.5"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="text-center min-w-[180px]">
              <span className="block text-base sm:text-lg font-bold text-blue-950">
                {THAI_MONTH_NAMES_FULL[currentMonth]} {currentYear + 543}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                (ค.ศ. {currentYear} · {currentDate.toLocaleDateString('en-US', { month: 'short' })})
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 hover:from-slate-100 hover:to-slate-200 border-t border-t-white border-x border-slate-200 border-b-[2px] border-b-slate-300 text-slate-700 shadow-2xs transition-all cursor-pointer active:translate-y-0.5"
              title="เดือนถัดไป"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Fiscal Month Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-600 shrink-0">เลือกเดือน:</span>
            <select
              value={currentFiscalMonthId}
              onChange={(e) => handleSelectFiscalMonth(e.target.value)}
              className="text-xs bg-white/95 border border-sky-200/90 rounded-xl px-3 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer shadow-2xs"
            >
              <optgroup label="ปีงบประมาณ 2570 (ต.ค. 2569 - ก.ย. 2570)">
                {FISCAL_MONTHS.map(fm => (
                  <option key={fm.id} value={fm.id}>
                    {fm.name} (Q{fm.quarter})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Monthly Summary Metric Pills */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="p-3 rounded-xl bg-white/90 border border-sky-200/90 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-slate-700 font-medium">งานครบกำหนดเดือนนี้</span>
            <span className="text-sm sm:text-base font-bold text-slate-900">{monthStats.total} งาน</span>
          </div>
          <div className="p-3 rounded-xl bg-white/90 border border-emerald-200/90 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              แล้วเสร็จ
            </span>
            <span className="text-sm sm:text-base font-bold text-emerald-900">{monthStats.completed}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/90 border border-blue-200/90 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-blue-800 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              กำลังทำ
            </span>
            <span className="text-sm sm:text-base font-bold text-blue-900">{monthStats.inProgress}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/90 border border-sky-200/90 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-sky-800 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              ยังไม่เริ่ม
            </span>
            <span className="text-sm sm:text-base font-bold text-sky-900">{monthStats.notStarted}</span>
          </div>
        </div>
      </div>

      {/* 2. Filters & Search Bar: คอนโซลค้นหาและตัวกรอง พื้นสีฟ้าอ่อนแบบนูน (Light Blue 3D Embossed Relief Console) */}
      <div className="bg-gradient-to-b from-sky-50/95 via-sky-50/50 to-blue-100/60 rounded-2xl border border-sky-200/90 border-t-white border-b-[3.5px] border-b-sky-300 shadow-md shadow-sky-950/5 ring-1 ring-inset ring-white/90 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-600" />
            <input
              type="text"
              placeholder="ค้นหาชื่องาน, ผู้รับผิดชอบ หรือหน่วยงาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white/95 border border-sky-200/90 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden transition-all shadow-2xs text-slate-800 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-white/95 border border-sky-200/90 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer shadow-2xs text-slate-800 font-medium"
            >
              <option value="all">ทุกกลุ่มงาน</option>
              {DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-white/95 border border-sky-200/90 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer shadow-2xs text-slate-800 font-medium"
            >
              <option value="all">ทุกสถานะ</option>
              {TASK_STATUSES.map(s => (
                <option key={s.label} value={s.label}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="sm:col-span-1 flex items-center justify-end">
            {(searchTerm || selectedDept !== 'all' || selectedStatus !== 'all') ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDept('all');
                  setSelectedStatus('all');
                }}
                className="w-full py-2 px-2 text-xs font-semibold text-slate-700 bg-white/90 hover:bg-white border border-sky-200 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                title="ล้างตัวกรอง"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="sm:hidden">ล้างตัวกรอง</span>
              </button>
            ) : (
              <div className="hidden sm:block text-[11px] text-sky-800/80 font-semibold text-center w-full">กรอง</div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-2.5 border-t border-sky-200/70 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-sky-950">กลุ่มงาน:</span>
            {DEPARTMENTS.map(dept => (
              <div key={dept.id} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${getDeptDotClass(dept.id)}`} />
                <span className="font-medium text-slate-700">{dept.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-sky-950">สถานะ:</span>
            <div className="flex items-center gap-1 text-emerald-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>แล้วเสร็จ</span>
            </div>
            <div className="flex items-center gap-1 text-blue-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>กำลังทำ</span>
            </div>
            <div className="flex items-center gap-1 text-sky-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>ยังไม่เริ่ม</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Calendar Body */}
      {viewMode === 'month' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Day of Week Header: กรอบสี่เหลี่ยมมุมกะทัดรัด แยกแต่ละวัน พื้นไล่ระดับสีเทาอ่อน */}
          <div className="grid grid-cols-7 bg-slate-50/70 border-b border-slate-200 p-1 sm:p-2 gap-1 sm:gap-1.5 text-center select-none">
            {THAI_DAY_NAMES.map((d, idx) => {
              const isWeekend = idx >= 5;
              return (
                <div
                  key={d.short}
                  className={`flex items-center justify-center py-1 sm:py-2 px-0.5 sm:px-2 rounded-lg bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 border-t border-t-white border-x border-slate-200/90 border-b-[2px] sm:border-b-[2.5px] border-b-slate-300 shadow-xs shadow-slate-900/5 ring-1 ring-inset ring-white/90 transition-all ${
                    isWeekend ? 'text-amber-900' : 'text-slate-800'
                  }`}
                >
                  <span className="font-bold text-[11px] sm:text-xs md:text-sm tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.95)]">
                    <span className="hidden sm:inline">{d.full}</span>
                    <span className="sm:hidden">{d.short}</span>
                  </span>
                  {isWeekend && (
                    <span className="ml-1 sm:ml-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-2xs shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 border-b border-slate-200">
            {calendarDays.map((day) => {
              const dayTasks = tasksByDate.get(day.dateString) || [];
              const isSelected = selectedDayString === day.dateString;
              const hasTasks = dayTasks.length > 0;

              return (
                <div
                  key={day.dateString}
                  onClick={() => {
                    setSelectedDayString(day.dateString);
                  }}
                  className={`min-h-[90px] sm:min-h-[120px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60 text-slate-400'
                  } ${day.isToday ? 'bg-blue-50/40 ring-1 ring-inset ring-blue-400/80' : ''} ${
                    isSelected ? 'bg-blue-50/70 ring-2 ring-blue-600 z-10' : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Top Bar: Date number + Today badge + Add button */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                          day.isToday
                            ? 'bg-blue-700 text-white shadow-2xs'
                            : isSelected
                            ? 'bg-blue-100 text-blue-900 font-extrabold'
                            : day.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                      {day.isToday && (
                        <span className="hidden md:inline-block text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded">
                          วันนี้
                        </span>
                      )}
                    </div>

                    {/* Task count pill if tasks exist */}
                    {hasTasks && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-900 transition-colors">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task list inside cell (desktop view shows up to 2-3 items) */}
                  <div className="space-y-1 overflow-hidden flex-1">
                    {dayTasks.slice(0, isMobileLayout ? 1 : 2).map(task => {
                      const deptDot = getDeptDotClass(task.departmentId);
                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task);
                          }}
                          className="px-1.5 py-1 rounded-md text-[10px] sm:text-[11px] leading-tight font-medium bg-slate-50 hover:bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all flex items-center gap-1.5 truncate group/item"
                          title={`${task.title} (${task.status} - ${task.assignee})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${deptDot}`} />
                          <span className="truncate text-slate-800 font-semibold group-hover/item:text-blue-900">
                            {task.title}
                          </span>
                        </div>
                      );
                    })}

                    {/* Overflow tasks badge */}
                    {dayTasks.length > (isMobileLayout ? 1 : 2) && (
                      <div className="text-[10px] font-semibold text-blue-700 hover:underline pt-0.5 px-1 truncate">
                        +{dayTasks.length - (isMobileLayout ? 1 : 2)} งานเพิ่มเติม...
                      </div>
                    )}
                  </div>

                  {/* Bottom Day indicators (on mobile when cells are very compact) */}
                  <div className="mt-1 flex items-center gap-1">
                    {dayTasks.slice(0, 4).map((t, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${getDeptDotClass(t.departmentId)} sm:hidden`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Date Detail Drawer underneath calendar if a date is clicked */}
          {selectedDayString && (
            <div className="p-4 sm:p-5 bg-gradient-to-b from-blue-50/50 to-white border-t border-blue-100 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-blue-700" />
                  <h3 className="text-sm sm:text-base font-bold text-blue-950">
                    กำหนดส่งงาน วันที่ {formatThaiDate(selectedDayString)}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {selectedDayTasks.length} งาน
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {canAdd && (
                    <button
                      type="button"
                      onClick={() => onAddTask(selectedDayString)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>เพิ่มงานในวันนี้</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedDayString(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {selectedDayTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200/80">
                  ไม่มีกำหนดส่งงานในวันนี้
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedDayTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                          <span className={`w-2 h-2 rounded-full ${getDeptDotClass(task.departmentId)}`} />
                          <span>{task.departmentName}</span>
                        </div>
                        {getStatusBadge(task.status)}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 line-clamp-2">
                        {task.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400" />
                          <span className="truncate max-w-[120px]">{task.assignee}</span>
                        </span>
                        <span className="font-semibold text-blue-900">
                          คืบหน้า {task.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Agenda / Timeline View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm sm:text-base font-bold text-blue-950 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-blue-700" />
              <span>กำหนดการดำเนินงาน เดือน {THAI_MONTH_NAMES_FULL[currentMonth]} {currentYear + 543}</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              พบ {monthStats.total} รายการ
            </span>
          </div>

          {agendaGroupedTasks.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CalendarIcon className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">ไม่พบงานที่มีกำหนดส่งในเดือนนี้</p>
              <p className="text-xs text-slate-400">ท่านสามารถเปลี่ยนเดือนด้านบน หรือล้างตัวกรองเพื่อดูข้อมูล</p>
            </div>
          ) : (
            <div className="space-y-6">
              {agendaGroupedTasks.map(group => {
                const isToday = new Date().toISOString().split('T')[0] === group.dateStr;
                return (
                  <div key={group.dateStr} className="space-y-2.5">
                    {/* Date Header */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        isToday
                          ? 'bg-blue-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{formatThaiDate(group.dateStr)}</span>
                        {isToday && <span>(วันนี้)</span>}
                      </span>
                      <div className="h-px bg-slate-200 flex-1" />
                      <span className="text-[11px] font-semibold text-slate-500">
                        {group.tasks.length} งาน
                      </span>
                    </div>

                    {/* Task cards on that date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-2 sm:pl-4">
                      {group.tasks.map(task => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="p-4 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer space-y-2.5 group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${getDeptDotClass(task.departmentId)}`} />
                              <span>{task.departmentName}</span>
                            </span>
                            {getStatusBadge(task.status)}
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-900 line-clamp-2">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Progress bar */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                              <span>ความคืบหน้า</span>
                              <span>{task.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  task.status === 'ดำเนินการแล้วเสร็จ'
                                    ? 'bg-emerald-500'
                                    : task.status === 'ระหว่างดำเนินการ'
                                    ? 'bg-blue-600'
                                    : 'bg-sky-400'
                                }`}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/70">
                            <span className="flex items-center gap-1 text-slate-600">
                              <User className="h-3 w-3 text-slate-400" />
                              <span className="truncate max-w-[130px]">{task.assignee}</span>
                            </span>
                            <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                              <span>ดูรายละเอียด</span>
                              <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Task Detail Modal / Slide-over */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${getDeptDotClass(selectedTask.departmentId)}`} />
                <span className="text-xs font-bold text-slate-700">
                  {selectedTask.departmentName} · {selectedTask.unitName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Title & Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">
                    รหัส: {selectedTask.id}
                  </span>
                  {getStatusBadge(selectedTask.status)}
                </div>
                <h3 className="text-base font-bold text-blue-950 leading-snug">
                  {selectedTask.title}
                </h3>
              </div>

              {/* Progress Bar */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>ความก้าวหน้าการดำเนินงาน</span>
                  <span className="text-blue-900 font-bold">{selectedTask.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedTask.status === 'ดำเนินการแล้วเสร็จ'
                        ? 'bg-emerald-500'
                        : selectedTask.status === 'ระหว่างดำเนินการ'
                        ? 'bg-blue-600'
                        : 'bg-sky-400'
                    }`}
                    style={{ width: `${selectedTask.progress}%` }}
                  />
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="block text-[11px] text-slate-500 mb-1">ผู้รับผิดชอบ</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{selectedTask.assignee || '-'}</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="block text-[11px] text-slate-500 mb-1">ประจำเดือนงบประมาณ</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{selectedTask.month || '-'}</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="block text-[11px] text-slate-500 mb-1">วันที่เริ่มต้น</span>
                  <span className="font-bold text-slate-800">
                    {selectedTask.startDate ? formatThaiDate(selectedTask.startDate) : '-'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                  <span className="block text-[11px] text-blue-700 font-medium mb-1">กำหนดส่ง (Due Date)</span>
                  <span className="font-bold text-blue-950">
                    {selectedTask.dueDate ? formatThaiDate(selectedTask.dueDate) : '-'}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selectedTask.description && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-700">รายละเอียดงาน:</span>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              {/* Performance Summary */}
              {selectedTask.performanceSummary && (
                <div className="space-y-1">
                  <span className="font-bold text-emerald-800">ผลการดำเนินงานสรุป:</span>
                  <p className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-emerald-900 leading-relaxed whitespace-pre-wrap">
                    {selectedTask.performanceSummary}
                  </p>
                </div>
              )}

              {/* Quick Status Update for Authorized Users */}
              {!isGuestMode && (
                canUserEditTask(selectedTask, currentUserEmail) ? (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700">เปลี่ยนสถานะด่วน:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {TASK_STATUSES.map(s => {
                        const isCurrent = selectedTask.status === s.label;
                        return (
                          <button
                            key={s.label}
                            type="button"
                            disabled={isUpdatingStatus}
                            onClick={() => handleQuickStatusUpdate(selectedTask, s.label)}
                            className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isCurrent
                                ? 'bg-blue-800 text-white border-blue-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isCurrent && <Check className="h-3 w-3" />}
                            <span>{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                      <span>สิทธิ์การแก้ไข:</span>
                    </span>
                    <span className="font-semibold text-slate-800">
                      เฉพาะเจ้าหน้าที่ {selectedTask.departmentName}
                    </span>
                  </div>
                )
              )}

              {/* Guest Mode Notice */}
              {isGuestMode && (
                <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-[11px]">
                  เปิดดูในโหมดผู้เยี่ยมชม (กรุณาเข้าสู่ระบบด้วยอีเมล @nu.ac.th เพื่อแก้ไขหรือเปลี่ยนสถานะงาน)
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                {!isGuestMode && canUserEditTask(selectedTask, currentUserEmail) && (
                  <button
                    type="button"
                    onClick={() => {
                      const task = selectedTask;
                      setSelectedTask(null);
                      onEditTask(task);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white border border-slate-200 hover:border-blue-400 rounded-xl transition-all cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>แก้ไขงาน</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
