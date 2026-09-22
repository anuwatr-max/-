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

interface DashboardViewProps {
  tasks: TaskItem[];
  onSelectDepartmentFilter?: (deptId: string) => void;
  onSelectStatusFilter?: (status: TaskStatus) => void;
  onOpenNewTaskModal: () => void;
}

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
            <h2 className="text-lg font-bold text-slate-900">
              รายงานผลการดำเนินงาน ปีงบประมาณ 2570
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 ml-10">
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: งานทั้งหมด */}
        <div
          id="kpi-card-total"
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">งาน/โครงการทั้งหมด</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalTasks}</span>
            <span className="text-xs text-slate-500">รายการ</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ความก้าวหน้ารวม</span>
            <span className="font-semibold text-blue-700">{averageProgress}%</span>
          </div>
        </div>

        {/* Card 2: ดำเนินการแล้วเสร็จ */}
        <div
          id="kpi-card-completed"
          onClick={() => onSelectStatusFilter && onSelectStatusFilter('ดำเนินการแล้วเสร็จ')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-emerald-700">ดำเนินการแล้วเสร็จ</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700">{completedTasks}</span>
            <span className="text-xs text-emerald-600">รายการ</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-emerald-50 flex items-center justify-between text-xs text-emerald-700">
            <span>คิดเป็นร้อยละ</span>
            <span className="font-bold text-emerald-600">{overallCompletionRate}%</span>
          </div>
        </div>

        {/* Card 3: ระหว่างดำเนินการ */}
        <div
          id="kpi-card-inprogress"
          onClick={() => onSelectStatusFilter && onSelectStatusFilter('ระหว่างดำเนินการ')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-blue-700">ระหว่างดำเนินการ</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-blue-700">{inProgressTasks}</span>
            <span className="text-xs text-blue-600">รายการ</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-blue-50 flex items-center justify-between text-xs text-blue-700">
            <span>คิดเป็นร้อยละ</span>
            <span className="font-bold text-blue-600">
              {totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Card 4: ยังไม่ดำเนินการ */}
        <div
          id="kpi-card-notstarted"
          onClick={() => onSelectStatusFilter && onSelectStatusFilter('ยังไม่ดำเนินการ')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-amber-700">ยังไม่ดำเนินการ</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-700">{notStartedTasks}</span>
            <span className="text-xs text-amber-600">รายการ</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-amber-50 flex items-center justify-between text-xs text-amber-700">
            <span>คิดเป็นร้อยละ</span>
            <span className="font-bold text-amber-600">
              {totalTasks > 0 ? Math.round((notStartedTasks / totalTasks) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* 4 Main Departments Performance Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <span>ผลการดำเนินงานจำแนกตามกลุ่มงานหลัก (4 กลุ่มงาน)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">คณะโลจิสติกส์และดิจิทัลซัพพลายเชน</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deptStats.map(dept => (
            <div
              key={dept.id}
              id={`dept-card-${dept.id}`}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{dept.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    มีหน่วยงานย่อย {dept.units.length} หน่วยงาน
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-blue-800">{dept.completionRate}%</span>
                  <p className="text-[11px] text-slate-400">สำเร็จแล้ว</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
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

              {/* Status pills count */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-emerald-50 text-emerald-800 rounded-xl py-1.5 px-2 border border-emerald-100">
                  <div className="font-bold text-sm">{dept.completed}</div>
                  <div className="text-[10px] text-emerald-600">แล้วเสร็จ</div>
                </div>
                <div className="bg-blue-50 text-blue-800 rounded-xl py-1.5 px-2 border border-blue-100">
                  <div className="font-bold text-sm">{dept.inProgress}</div>
                  <div className="text-[10px] text-blue-600">กำลังทำ</div>
                </div>
                <div className="bg-slate-50 text-slate-700 rounded-xl py-1.5 px-2 border border-slate-200">
                  <div className="font-bold text-sm">{dept.notStarted}</div>
                  <div className="text-[10px] text-slate-500">ยังไม่เริ่ม</div>
                </div>
              </div>

              {/* Sub-units list */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
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
