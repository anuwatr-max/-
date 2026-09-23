import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Layers,
  Filter,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { TaskItem, MainDepartmentId, TaskStatus } from '../types';
import { DEPARTMENTS, FISCAL_MONTHS } from '../data/departments';
import { DepartmentPerformanceChart } from './DepartmentPerformanceChart';

interface DashboardViewProps {
  tasks: TaskItem[];
  onSelectDepartmentFilter?: (deptId: string) => void;
  onSelectStatusFilter?: (status: TaskStatus) => void;
  onOpenNewTaskModal: () => void;
}

// แถบสีอ่อน ๆ คลุมเฉพาะตัวอักษรสำหรับแต่ละกลุ่มงาน โทนสีกรอบนูนมีมิติ (Embossed 3D)
const getDeptStripStyle = (id: string) => {
  switch (id) {
    case 'admin':
    case 'general':
      // งานธุรการ สีเทา
      return 'bg-gradient-to-r from-slate-200/95 via-slate-100 to-slate-200/90 text-slate-900 border border-slate-300 border-b-[2.5px] border-b-slate-400 shadow-sm shadow-slate-900/10 ring-1 ring-inset ring-white/80';
    case 'academic':
    case 'education':
      // งานบริการการศึกษา สีเขียว
      return 'bg-gradient-to-r from-emerald-100/95 via-emerald-50 to-teal-100/90 text-emerald-950 border border-emerald-200 border-b-[2.5px] border-b-emerald-300 shadow-sm shadow-emerald-900/10 ring-1 ring-inset ring-white/80';
    case 'research':
      // งานวิจัยและพัฒนาคุณภาพการศึกษา แถบสีน้ำเงิน
      return 'bg-gradient-to-r from-blue-100/95 via-blue-50 to-sky-100/90 text-blue-950 border border-blue-200 border-b-[2.5px] border-b-blue-300 shadow-sm shadow-blue-900/10 ring-1 ring-inset ring-white/80';
    case 'finance':
      // งานการเงินและพัสดุ แถบสีฟ้า
      return 'bg-gradient-to-r from-sky-100/95 via-sky-50 to-cyan-100/90 text-sky-950 border border-sky-200 border-b-[2.5px] border-b-sky-300 shadow-sm shadow-sky-900/10 ring-1 ring-inset ring-white/80';
    default:
      return 'bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 text-slate-900 border border-slate-200 border-b-[2.5px] border-b-slate-300 shadow-sm ring-1 ring-inset ring-white/80';
  }
};

const getDeptProgressColor = (id: string) => {
  switch (id) {
    case 'admin':
    case 'general':
      return {
        bar: 'bg-gradient-to-r from-slate-500 to-slate-600',
        badge: 'bg-slate-100 border-slate-300 text-slate-800',
        dot: 'bg-slate-600',
        text: 'text-slate-800',
      };
    case 'academic':
    case 'education':
      return {
        bar: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
        badge: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        dot: 'bg-emerald-600',
        text: 'text-emerald-800',
      };
    case 'research':
      return {
        bar: 'bg-gradient-to-r from-blue-600 to-blue-700',
        badge: 'bg-blue-50 border-blue-200 text-blue-800',
        dot: 'bg-blue-600',
        text: 'text-blue-800',
      };
    case 'finance':
      return {
        bar: 'bg-gradient-to-r from-sky-500 to-sky-600',
        badge: 'bg-sky-50 border-sky-200 text-sky-800',
        dot: 'bg-sky-500',
        text: 'text-sky-800',
      };
    default:
      return {
        bar: 'bg-gradient-to-r from-blue-500 to-blue-600',
        badge: 'bg-blue-50 border-blue-200 text-blue-700',
        dot: 'bg-blue-600',
        text: 'text-blue-700',
      };
  }
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  onSelectDepartmentFilter,
  onSelectStatusFilter,
  onOpenNewTaskModal,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');

  // Filter tasks based on dashboard month/quarter filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (selectedMonth !== 'all' && task.month !== selectedMonth) {
        return false;
      }
      if (selectedQuarter !== 'all') {
        const monthObj = FISCAL_MONTHS.find(m => m.name === task.month);
        if (monthObj && String(monthObj.quarter) !== selectedQuarter) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, selectedMonth, selectedQuarter]);

  // Key metrics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'ดำเนินการแล้วเสร็จ').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'ระหว่างดำเนินการ').length;
  const notStartedTasks = filteredTasks.filter(t => t.status === 'ยังไม่ดำเนินการ').length;

  const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const averageProgress =
    totalTasks > 0
      ? Math.round(filteredTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / totalTasks)
      : 0;

  // Department statistics
  const deptStats = useMemo(() => {
    return DEPARTMENTS.map(dept => {
      const deptTasks = filteredTasks.filter(t => t.departmentId === dept.id);
      const total = deptTasks.length;
      const completed = deptTasks.filter(t => t.status === 'ดำเนินการแล้วเสร็จ').length;
      const inProgress = deptTasks.filter(t => t.status === 'ระหว่างดำเนินการ').length;
      const notStarted = deptTasks.filter(t => t.status === 'ยังไม่ดำเนินการ').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const avgProgress =
        total > 0 ? Math.round(deptTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / total) : 0;

      // Units breakdown
      const unitStats = dept.units.map(unit => {
        const unitTasks = deptTasks.filter(t => t.unitId === unit.id || t.unitName.includes(unit.name));
        const uTotal = unitTasks.length;
        const uCompleted = unitTasks.filter(t => t.status === 'ดำเนินการแล้วเสร็จ').length;
        const uInProgress = unitTasks.filter(t => t.status === 'ระหว่างดำเนินการ').length;
        const uNotStarted = unitTasks.filter(t => t.status === 'ยังไม่ดำเนินการ').length;
        const uRate = uTotal > 0 ? Math.round((uCompleted / uTotal) * 100) : 0;

        return {
          ...unit,
          total: uTotal,
          completed: uCompleted,
          inProgress: uInProgress,
          notStarted: uNotStarted,
          completionRate: uRate,
        };
      });

      return {
        ...dept,
        total,
        completed,
        inProgress,
        notStarted,
        completionRate,
        avgProgress,
        unitStats,
      };
    });
  }, [filteredTasks]);

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Top Filter Bar: Deep Navy & Cyan/Blue Accents */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <span className="inline-block px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-100/95 via-sky-50 to-indigo-100/90 text-blue-950 border border-blue-200/90 border-b-[3px] border-b-blue-300 font-bold text-base sm:text-lg shadow-md shadow-blue-950/10 ring-1 ring-inset ring-white/80">
                รายงานผลการดำเนินงาน ปีงบประมาณ 2570
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-10">
            คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200/60 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-900">
            <Filter className="h-3.5 w-3.5 text-blue-600" />
            <span>กรองข้อมูล:</span>
          </div>

          <select
            id="dashboard-quarter-filter"
            value={selectedQuarter}
            onChange={e => {
              setSelectedQuarter(e.target.value);
              if (e.target.value !== 'all') setSelectedMonth('all');
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden"
          >
            <option value="all">ทุกไตรมาส (ทั้งปี 2570)</option>
            <option value="1">ไตรมาส 1 (ต.ค. - ธ.ค. 2569)</option>
            <option value="2">ไตรมาส 2 (ม.ค. - มี.ค. 2570)</option>
            <option value="3">ไตรมาส 3 (เม.ย. - มิ.ย. 2570)</option>
            <option value="4">ไตรมาส 4 (ก.ค. - ก.ย. 2570)</option>
          </select>

          <select
            id="dashboard-month-filter"
            value={selectedMonth}
            onChange={e => {
              setSelectedMonth(e.target.value);
              if (e.target.value !== 'all') setSelectedQuarter('all');
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-hidden"
          >
            <option value="all">ทุกเดือน</option>
            {FISCAL_MONTHS.map(m => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>

          {(selectedMonth !== 'all' || selectedQuarter !== 'all') && (
            <button
              id="dashboard-clear-filter-btn"
              onClick={() => {
                setSelectedMonth('all');
                setSelectedQuarter('all');
              }}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold px-2 py-1 underline cursor-pointer"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid: ช่องสี่เหลี่ยมขนาดกะทัดรัด แถบสีนูนมีมิติ (Embossed 3D) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: งานทั้งหมด - แถบสีเทาเข้มแบบนูน */}
        <div
          id="kpi-card-total"
          className="bg-slate-50/90 rounded-xl p-3 sm:p-3.5 border border-slate-300 border-b-[3px] border-b-slate-600 shadow-sm shadow-slate-900/10 ring-1 ring-inset ring-white/80 relative overflow-hidden group hover:border-slate-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 text-white border border-slate-600 border-b-[2px] border-b-slate-950 font-bold text-xs shadow-xs ring-1 ring-inset ring-white/20">
              งานทั้งหมด
            </span>
            <div className="h-7 w-7 rounded-lg bg-slate-700 border border-slate-600 border-b-[2px] border-b-slate-950 flex items-center justify-center text-white shadow-xs">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{totalTasks}</span>
            <span className="text-xs text-slate-600">รายการ</span>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span>ความก้าวหน้ารวม</span>
            <span className="font-semibold text-slate-800">{averageProgress}%</span>
          </div>
        </div>

        {/* Card 2: ดำเนินการแล้วเสร็จ - แถบสีเขียวแบบนูน */}
        <div
          id="kpi-card-completed"
          onClick={() => onSelectStatusFilter && onSelectStatusFilter('ดำเนินการแล้วเสร็จ')}
          className="bg-emerald-50/80 rounded-xl p-3 sm:p-3.5 border border-emerald-300 border-b-[3px] border-b-emerald-600 shadow-sm shadow-emerald-950/10 ring-1 ring-inset ring-white/80 relative overflow-hidden group hover:border-emerald-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border border-emerald-500 border-b-[2px] border-b-emerald-900 font-bold text-xs shadow-xs ring-1 ring-inset ring-white/20">
              ดำเนินการแล้วเสร็จ
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-600 border border-emerald-500 border-b-[2px] border-b-emerald-900 flex items-center justify-center text-white shadow-xs">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-emerald-950 tracking-tight">{completedTasks}</span>
            <span className="text-xs text-emerald-800">รายการ</span>
          </div>
          <div className="mt-2 pt-1.5 border-t border-emerald-200/80 flex items-center justify-between text-[11px] text-emerald-800">
            <span>คิดเป็นร้อยละ</span>
            <span className="font-bold text-emerald-900">{overallCompletionRate}%</span>
          </div>
        </div>

        {/* Card 3: ระหว่างดำเนินการ - แถบสีน้ำเงินแบบนูน */}
        <div
          id="kpi-card-inprogress"
          onClick={() => onSelectStatusFilter && onSelectStatusFilter('ระหว่างดำเนินการ')}
          className="bg-blue-50/80 rounded-xl p-3 sm:p-3.5 border border-blue-300 border-b-[3px] border-b-blue-600 shadow-sm shadow-blue-950/10 ring-1 ring-inset ring-white/80 relative overflow-hidden group hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-blue-500 border-b-[2px] border-b-blue-950 font-bold text-xs shadow-xs ring-1 ring-inset ring-white/20">
              ระหว่างดำเนินการ
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-600 border border-blue-500 border-b-[2px] border-b-blue-950 flex items-center justify-center text-white shadow-xs">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-blue-950 tracking-tight">{inProgressTasks}</span>
            <span className="text-xs text-blue-800">รายการ</span>
          </div>
          <div className="mt-2 pt-1.5 border-t border-blue-200/80 flex items-center justify-between text-[11px] text-blue-800">
            <span>คิดเป็นร้อยละ</span>
            <span className="font-bold text-blue-900">
              {totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Card 4: ยังไม่ดำเนินการ - แถบสีฟ้าแบบนูน */}
        <div
          id="kpi-card-notstarted"
          onClick={() => onSelectStatusFilter && onSelectStatusFilter('ยังไม่ดำเนินการ')}
          className="bg-sky-50/80 rounded-xl p-3 sm:p-3.5 border border-sky-300 border-b-[3px] border-b-sky-500 shadow-sm shadow-sky-950/10 ring-1 ring-inset ring-white/80 relative overflow-hidden group hover:border-sky-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-white border border-sky-400 border-b-[2px] border-b-sky-800 font-bold text-xs shadow-xs ring-1 ring-inset ring-white/20">
              ยังไม่ดำเนินการ
            </span>
            <div className="h-7 w-7 rounded-lg bg-sky-500 border border-sky-400 border-b-[2px] border-b-sky-800 flex items-center justify-center text-white shadow-xs">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-sky-950 tracking-tight">{notStartedTasks}</span>
            <span className="text-xs text-sky-800">รายการ</span>
          </div>
          <div className="mt-2 pt-1.5 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800">
            <span>คิดเป็นร้อยละ</span>
            <span className="font-bold text-sky-900">
              {totalTasks > 0 ? Math.round((notStartedTasks / totalTasks) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* สำนักงานเลขานุการ Performance Breakdown & Charts */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <h3 className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="inline-block px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-100/95 via-sky-50 to-indigo-100/90 text-blue-950 border border-blue-200/90 border-b-[3px] border-b-blue-300 font-bold text-base sm:text-lg shadow-md shadow-blue-950/10 ring-1 ring-inset ring-white/80">
              ผลการดำเนินงานของสำนักงานเลขานุการ
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร</span>
        </div>

        {/* กราฟผลการดำเนินงานของ 4 งาน */}
        <DepartmentPerformanceChart
          deptStats={deptStats}
          averageCompletionRate={overallCompletionRate}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {deptStats.map(dept => (
            <div
              key={dept.id}
              id={`dept-card-${dept.id}`}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              {/* ส่วนหัวของงาน 4 กลุ่มงานหลัก: ธีมสีขาว (White Theme) พร้อมแถบสีอ่อนคลุมตัวอักษร */}
              <div className="bg-white px-5 py-4 text-slate-900 flex items-start justify-between gap-3 border-b border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                    <h4 className="tracking-tight">
                      <span
                        className={`inline-block px-3 py-1 rounded-xl text-sm sm:text-base font-bold ${getDeptStripStyle(dept.id)}`}
                      >
                        {dept.name}
                      </span>
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 font-normal ml-4">
                    {dept.units.length} หน่วยงานย่อยในสังกัด
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xl font-extrabold ${getDeptProgressColor(dept.id).text}`}>
                    {dept.completionRate}%
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">สำเร็จแล้ว</p>
                </div>
              </div>

              {/* แถบสไลเดอร์เปอร์เซ็นต์ความคืบหน้า โทนสีอ่อนเบา สุภาพ */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${getDeptProgressColor(dept.id).dot}`}></span>
                    แถบความคืบหน้าภาพรวมกลุ่มงาน:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-500">
                      {dept.completed}/{dept.total} รายการ
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border shadow-xs ${getDeptProgressColor(dept.id).badge}`}>
                      {dept.completionRate}%
                    </span>
                  </div>
                </div>
                {/* สไลเดอร์เปอร์เซ็นต์ความคืบหน้า */}
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80 shadow-inner">
                  <div
                    style={{ width: `${Math.max(dept.completionRate, 2)}%` }}
                    className={`h-full rounded-full transition-all duration-700 shadow-xs ${getDeptProgressColor(dept.id).bar}`}
                  />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Breakdown by status */}
                <div>
                  <div className="text-[11px] font-medium text-slate-500 mb-1.5 flex justify-between">
                    <span>สัดส่วนสถานะการดำเนินงาน:</span>
                    <span>{dept.total} งานทั้งหมด</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${dept.total > 0 ? (dept.completed / dept.total) * 100 : 0}%` }}
                      className="bg-emerald-500 transition-all duration-500"
                      title={`แล้วเสร็จ ${dept.completed} รายการ`}
                    />
                    <div
                      style={{ width: `${dept.total > 0 ? (dept.inProgress / dept.total) * 100 : 0}%` }}
                      className="bg-blue-600 transition-all duration-500"
                      title={`ระหว่างดำเนินการ ${dept.inProgress} รายการ`}
                    />
                    <div
                      style={{ width: `${dept.total > 0 ? (dept.notStarted / dept.total) * 100 : 0}%` }}
                      className="bg-slate-300 transition-all duration-500"
                      title={`ยังไม่ดำเนินการ ${dept.notStarted} รายการ`}
                    />
                  </div>
                </div>

                {/* Status pills count: โทนสีอ่อนเบา สุภาพ สะอาดตา */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-50/70 text-emerald-800 rounded-xl py-1.5 px-2 border border-emerald-200/60 shadow-xs">
                    <div className="font-bold text-sm text-emerald-800">{dept.completed}</div>
                    <div className="text-[10px] text-emerald-700">แล้วเสร็จ</div>
                  </div>
                  <div className="bg-blue-50/70 text-blue-800 rounded-xl py-1.5 px-2 border border-blue-200/60 shadow-xs">
                    <div className="font-bold text-sm text-blue-800">{dept.inProgress}</div>
                    <div className="text-[10px] text-blue-700">กำลังทำ</div>
                  </div>
                  <div className="bg-slate-50/70 text-slate-700 rounded-xl py-1.5 px-2 border border-slate-200/60 shadow-xs">
                    <div className="font-bold text-sm text-slate-700">{dept.notStarted}</div>
                    <div className="text-[10px] text-slate-500">ยังไม่เริ่ม</div>
                  </div>
                </div>

                {/* Sub-units list */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-semibold text-slate-600">ผลการดำเนินงานรายหน่วย:</span>
                  <div className="space-y-1.5">
                    {dept.unitStats.map(unit => (
                      <div
                        key={unit.id}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          <span className="font-bold text-blue-700 shrink-0">{unit.code}</span>
                          <span className="text-slate-800 truncate font-medium">{unit.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-slate-500">
                            {unit.completed}/{unit.total} งาน
                          </span>
                          <span
                            className={`font-semibold text-[11px] px-2 py-0.5 rounded-lg ${
                              unit.completionRate === 100
                                ? 'bg-emerald-100 text-emerald-800'
                                : unit.completionRate > 0
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {unit.completionRate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Banner: Premium Dark Navy & Midnight Blue */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-blue-900/40">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-inner">
            <Sparkles className="h-6 w-6 text-cyan-300" />
          </div>
          <div>
            <h4 className="font-bold text-base sm:text-lg text-white">
              บันทึกความก้าวหน้างานประจำปี 2570
            </h4>
            <p className="text-xs text-blue-200/90 mt-0.5">
              สามารถเพิ่มงานใหม่ อัปเดตสถานะการดำเนินงาน และซิงค์ลง Google Sheet ได้ตลอดเวลา
            </p>
          </div>
        </div>
        <button
          id="dashboard-add-task-cta-btn"
          onClick={onOpenNewTaskModal}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-950/60 transition-all cursor-pointer shrink-0 border border-cyan-400/30"
        >
          + เพิ่มงาน / โครงการใหม่
        </button>
      </div>
    </div>
  );
};
