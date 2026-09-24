import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  ChevronDown,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { TaskItem, TaskStatus, MainDepartmentId } from '../types';
import { DEPARTMENTS, FISCAL_MONTHS, TASK_STATUSES, getDeptDotClass } from '../data/departments';

interface TaskListViewProps {
  tasks: TaskItem[];
  onAddTask: () => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (task: TaskItem) => void;
  onQuickStatusChange: (task: TaskItem, newStatus: TaskStatus) => Promise<void>;
  initialStatusFilter?: TaskStatus | 'all';
  initialDeptFilter?: string;
}

const ITEMS_PER_PAGE = 10;

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onQuickStatusChange,
  initialStatusFilter = 'all',
  initialDeptFilter = 'all',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>(initialDeptFilter);
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusFilter);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Cascading units for current selected department
  const availableUnits = useMemo(() => {
    if (selectedDept === 'all') {
      return DEPARTMENTS.flatMap(d => d.units);
    }
    const dept = DEPARTMENTS.find(d => d.id === selectedDept);
    return dept ? dept.units : [];
  }, [selectedDept]);

  // Handle department filter change
  const handleDeptChange = (deptId: string) => {
    setSelectedDept(deptId);
    setSelectedUnit('all'); // reset unit when department changes
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(term);
        const matchAssignee = task.assignee.toLowerCase().includes(term);
        const matchDesc = task.description?.toLowerCase().includes(term);
        const matchUnit = task.unitName.toLowerCase().includes(term);
        if (!matchTitle && !matchAssignee && !matchDesc && !matchUnit) return false;
      }

      // Department
      if (selectedDept !== 'all' && task.departmentId !== selectedDept) {
        return false;
      }

      // Unit
      if (selectedUnit !== 'all') {
        if (task.unitId !== selectedUnit && !task.unitName.includes(selectedUnit)) {
          return false;
        }
      }

      // Status
      if (selectedStatus !== 'all' && task.status !== selectedStatus) {
        return false;
      }

      // Month
      if (selectedMonth !== 'all' && task.month !== selectedMonth) {
        return false;
      }

      return true;
    });
  }, [tasks, searchTerm, selectedDept, selectedUnit, selectedStatus, selectedMonth]);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDept, selectedUnit, selectedStatus, selectedMonth]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredTasks.length);

  const paginatedTasks = useMemo(() => {
    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === safeCurrentPage) return;
    setCurrentPage(page);
    const element = document.getElementById('task-list-view');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(safeCurrentPage - 1);
        pages.push(safeCurrentPage);
        pages.push(safeCurrentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleStatusSelect = async (task: TaskItem, newStatus: TaskStatus) => {
    if (task.status === newStatus) return;
    setUpdatingTaskId(task.id);
    try {
      await onQuickStatusChange(task, newStatus);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDept('all');
    setSelectedUnit('all');
    setSelectedStatus('all');
    setSelectedMonth('all');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedDept !== 'all' ||
    selectedUnit !== 'all' ||
    selectedStatus !== 'all' ||
    selectedMonth !== 'all';

  return (
    <div id="task-list-view" className="space-y-5">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-700 flex flex-wrap items-center gap-2">
              {/* ติดตามงาน แถบสีเทาอ่อน แบบนูน ย่อขนาดกะทัดรัด (Compact 3D Embossed Relief in Light Gray) */}
              <span className="inline-block px-3 py-1 rounded-lg bg-gradient-to-r from-slate-100 via-slate-50 to-slate-150 text-slate-700 border border-slate-200 border-b-[2.5px] border-b-slate-400 font-bold text-sm sm:text-base shadow-sm ring-1 ring-inset ring-white/90">
                ติดตามงาน ปีงบประมาณ 2570
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 shadow-xs">
                {filteredTasks.length} / {tasks.length} รายการ
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ปรับเปลี่ยนสถานะการดำเนินงานได้ทันทีผ่านเมนูดรอปดาวน์ และระบบจะบันทึกลง Google Sheet
            </p>
          </div>

          {/* Premium Blue-Cyan Add Task Button */}
          <button
            id="task-list-add-task-btn"
            onClick={onAddTask}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-800 hover:via-blue-700 hover:to-cyan-700 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>เพิ่มงาน / โครงการใหม่</span>
          </button>
        </div>

        {/* Search Bar with Blue Focus Ring */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            id="task-search-input"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ค้นหาตามชื่องาน, ผู้รับผิดชอบ, หรือหน่วยงาน..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Dropdown Filters with Blue Focus Ring */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
          {/* 1. งานหลัก (ทำเป็น drop down) */}
          <div>
            <label className="block mb-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-blue-100/70 via-sky-50 to-indigo-50/80 text-blue-950 border border-blue-200/90 border-b-[2.5px] border-b-blue-300 font-bold text-xs shadow-xs shadow-blue-900/10 ring-1 ring-inset ring-white">
                งานหลัก
              </span>
            </label>
            <select
              id="filter-dept-select"
              value={selectedDept}
              onChange={e => handleDeptChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            >
              <option value="all">ทั้งหมด (4 งาน)</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. หน่วยงานย่อย (ทำเป็น drop down) */}
          <div>
            <label className="block mb-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-blue-100/70 via-sky-50 to-indigo-50/80 text-blue-950 border border-blue-200/90 border-b-[2.5px] border-b-blue-300 font-bold text-xs shadow-xs shadow-blue-900/10 ring-1 ring-inset ring-white">
                หน่วยงานย่อย
              </span>
            </label>
            <select
              id="filter-unit-select"
              value={selectedUnit}
              onChange={e => setSelectedUnit(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            >
              <option value="all">ทุกหน่วยงาน</option>
              {availableUnits.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.code} {unit.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. สถานะการดำเนินงาน (ทำเป็น drop down) */}
          <div>
            <label className="block mb-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-blue-100/70 via-sky-50 to-indigo-50/80 text-blue-950 border border-blue-200/90 border-b-[2.5px] border-b-blue-300 font-bold text-xs shadow-xs shadow-blue-900/10 ring-1 ring-inset ring-white">
                สถานะการดำเนินงาน
              </span>
            </label>
            <select
              id="filter-status-select"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            >
              <option value="all">ทุกสถานะ</option>
              {TASK_STATUSES.map(s => (
                <option key={s.label} value={s.label}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* 4. ประจำเดือน */}
          <div>
            <label className="block mb-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-blue-100/70 via-sky-50 to-indigo-50/80 text-blue-950 border border-blue-200/90 border-b-[2.5px] border-b-blue-300 font-bold text-xs shadow-xs shadow-blue-900/10 ring-1 ring-inset ring-white">
                ประจำเดือน
              </span>
            </label>
            <div className="flex gap-1.5">
              <select
                id="filter-month-select"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="all">ทุกเดือน</option>
                {FISCAL_MONTHS.map(m => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  id="task-list-reset-filter-btn"
                  onClick={resetFilters}
                  title="รีเซ็ตตัวกรองทั้งหมด"
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task List Content */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <Filter className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">ไม่พบรายการงานที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกตัวกรองงาน/สถานะใหม่ หรือเพิ่มรายการงานใหม่
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                id="empty-reset-filter-btn"
                onClick={resetFilters}
                className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                ล้างตัวกรอง
              </button>
            )}
            <button
              id="empty-add-task-btn"
              onClick={onAddTask}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              + เพิ่มงานใหม่
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Desktop & Tablet Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-100/95 via-sky-50 to-indigo-100/90 text-blue-950 border-b-[2.5px] border-b-blue-300 shadow-xs">
                  <th className="py-3.5 px-4 w-16 font-bold text-blue-950">รหัส</th>
                  <th className="py-3.5 px-4 font-bold text-blue-950">ชื่องาน / รายละเอียด</th>
                  <th className="py-3.5 px-4 w-48 font-bold text-blue-950">งาน / หน่วยงาน</th>
                  <th className="py-3.5 px-4 w-36 font-bold text-blue-950">ผู้รับผิดชอบ</th>
                  <th className="py-3.5 px-4 w-28 font-bold text-blue-950">ประจำเดือน</th>
                  <th className="py-3.5 px-4 w-44 font-bold text-blue-950">สถานะการดำเนินงาน</th>
                  <th className="py-3.5 px-4 w-24 font-bold text-blue-950">ความคืบหน้า</th>
                  <th className="py-3.5 px-4 w-24 text-center font-bold text-blue-950">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTasks.map(task => {
                  const isUpdating = updatingTaskId === task.id;
                  return (
                    <tr
                      key={task.id}
                      id={`task-row-${task.id}`}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* รหัสงาน */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-400 text-[11px]">
                        {task.id}
                      </td>

                      {/* ชื่องาน */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-700 text-sm">{task.title}</div>
                        {task.description && (
                          <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                        {task.performanceSummary && (
                          <div className="text-emerald-700 text-[11px] mt-0.5 flex items-center gap-1 font-medium">
                            <span className="shrink-0">ผลสัมฤทธิ์:</span>
                            <span className="truncate">{task.performanceSummary}</span>
                          </div>
                        )}
                      </td>

                      {/* หน่วยงาน: Unit Badge with department color circular dot */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-600 text-[11px]">
                          {task.departmentName}
                        </div>
                        <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-[11px]">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${getDeptDotClass(task.departmentId)}`} />
                          <span>{task.unitName}</span>
                        </span>
                      </td>

                      {/* ผู้รับผิดชอบ */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <User className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{task.assignee}</span>
                        </div>
                        <div className="text-slate-400 text-[10px] mt-0.5">
                          ส่ง: {task.dueDate}
                        </div>
                      </td>

                      {/* เดือน */}
                      <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {task.month}
                      </td>

                      {/* Dropdown สถานะการดำเนินงาน (Quick Dropdown) */}
                      <td className="py-3 px-4">
                        <div className="relative">
                          <select
                            id={`quick-status-${task.id}`}
                            value={task.status}
                            disabled={isUpdating}
                            onChange={e => handleStatusSelect(task, e.target.value as TaskStatus)}
                            className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold border cursor-pointer appearance-none transition-all pr-7 ${
                              task.status === 'ดำเนินการแล้วเสร็จ'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : task.status === 'ระหว่างดำเนินการ'
                                ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                                : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
                            }`}
                          >
                            <option value="ยังไม่ดำเนินการ">ยังไม่ดำเนินการ</option>
                            <option value="ระหว่างดำเนินการ">ระหว่างดำเนินการ</option>
                            <option value="ดำเนินการแล้วเสร็จ">ดำเนินการแล้วเสร็จ</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                        </div>
                      </td>

                      {/* ความคืบหน้า */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${task.progress}%` }}
                              className={`h-full ${
                                task.progress === 100
                                  ? 'bg-emerald-500'
                                  : task.progress > 0
                                  ? 'bg-blue-600'
                                  : 'bg-slate-300'
                              }`}
                            />
                          </div>
                          <span className="font-semibold text-slate-700 text-[11px]">
                            {task.progress}%
                          </span>
                        </div>
                      </td>

                      {/* ปุ่มจัดการ */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            id={`task-edit-btn-${task.id}`}
                            onClick={() => onEditTask(task)}
                            title="แก้ไขข้อมูลงาน"
                            className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`task-delete-btn-${task.id}`}
                            onClick={() => onDeleteTask(task)}
                            title="ลบข้อมูลงาน"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (optimized for smartphones) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {paginatedTasks.map(task => {
              const isUpdating = updatingTaskId === task.id;
              return (
                <div
                  key={task.id}
                  id={`mobile-task-card-${task.id}`}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">
                          {task.id}
                        </span>
                        {/* Unit Badge with department color circular dot */}
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-200">
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${getDeptDotClass(task.departmentId)}`} />
                          <span>{task.unitName}</span>
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-700 text-sm leading-snug">
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description & Performance */}
                  {task.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>
                  )}

                  {task.performanceSummary && (
                    <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-800">
                      <span className="font-bold">ผลการดำเนินงาน:</span> {task.performanceSummary}
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 gap-2">
                    <div className="flex items-center gap-1 font-medium text-slate-700">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{task.month}</span>
                    </div>
                  </div>

                  {/* Quick Status Dropdown & Progress */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <select
                        value={task.status}
                        disabled={isUpdating}
                        onChange={e => handleStatusSelect(task, e.target.value as TaskStatus)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border appearance-none pr-8 cursor-pointer ${
                          task.status === 'ดำเนินการแล้วเสร็จ'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : task.status === 'ระหว่างดำเนินการ'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-sky-50 text-sky-800 border-sky-200'
                        }`}
                      >
                        <option value="ยังไม่ดำเนินการ">ยังไม่ดำเนินการ</option>
                        <option value="ระหว่างดำเนินการ">ระหว่างดำเนินการ</option>
                        <option value="ดำเนินการแล้วเสร็จ">ดำเนินการแล้วเสร็จ</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-3 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-10 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${task.progress}%` }}
                          className={`h-full ${
                            task.progress === 100
                              ? 'bg-emerald-500'
                              : task.progress > 0
                              ? 'bg-blue-600'
                              : 'bg-slate-300'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{task.progress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {filteredTasks.length > 0 && (
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none">
              {/* Items summary */}
              <div className="text-slate-500 text-center sm:text-left">
                แสดง <span className="font-bold text-slate-800">{filteredTasks.length > 0 ? startIndex + 1 : 0} - {endIndex}</span> จากทั้งหมด <span className="font-bold text-slate-800">{filteredTasks.length}</span> รายการ
                <span className="ml-1.5 text-slate-400 font-normal">
                  (หน้า {safeCurrentPage} จาก {totalPages} หน้า • หน้าละ 10 รายการ)
                </span>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {/* First page button */}
                {totalPages > 2 && (
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={safeCurrentPage === 1}
                    title="ไปหน้าแรก"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                )}

                {/* Previous page button */}
                <button
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer font-medium"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">ก่อนหน้า</span>
                </button>

                {/* Numbered page buttons */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((p, idx) => {
                    if (p === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-slate-400 font-medium">
                          …
                        </span>
                      );
                    }
                    const pageNum = p as number;
                    const isActive = pageNum === safeCurrentPage;
                    return (
                      <button
                        key={`page-btn-${pageNum}`}
                        onClick={() => handlePageChange(pageNum)}
                        className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-800 text-white shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-blue-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next page button */}
                <button
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer font-medium"
                >
                  <span className="hidden sm:inline">ถัดไป</span>
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Last page button */}
                {totalPages > 2 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                    title="ไปหน้าสุดท้าย"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
