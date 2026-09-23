import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, AlignLeft, CheckCircle2, Building2 } from 'lucide-react';
import { TaskItem, TaskStatus, MainDepartmentId } from '../types';
import { DEPARTMENTS, FISCAL_MONTHS, TASK_STATUSES } from '../data/departments';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskItem) => Promise<void>;
  taskToEdit?: TaskItem | null;
  defaultMonth?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  defaultMonth = 'มีนาคม 2570',
}) => {
  const [departmentId, setDepartmentId] = useState<MainDepartmentId>('admin');
  const [unitId, setUnitId] = useState<string>('1.1');
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [month, setMonth] = useState(defaultMonth);
  const [status, setStatus] = useState<TaskStatus>('ยังไม่ดำเนินการ');
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [performanceSummary, setPerformanceSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (taskToEdit) {
      setDepartmentId(taskToEdit.departmentId);
      setUnitId(taskToEdit.unitId);
      setTitle(taskToEdit.title);
      setAssignee(taskToEdit.assignee);
      setMonth(taskToEdit.month);
      setStatus(taskToEdit.status);
      setProgress(taskToEdit.progress);
      setStartDate(taskToEdit.startDate);
      setDueDate(taskToEdit.dueDate);
      setDescription(taskToEdit.description || '');
      setPerformanceSummary(taskToEdit.performanceSummary || '');
    } else {
      // Default new task
      setDepartmentId('admin');
      setUnitId('1.1');
      setTitle('');
      setAssignee('');
      setMonth(defaultMonth);
      setStatus('ยังไม่ดำเนินการ');
      setProgress(0);
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setDueDate(today);
      setDescription('');
      setPerformanceSummary('');
    }
    setErrors({});
  }, [taskToEdit, isOpen, defaultMonth]);

  // When department changes, set unitId to first unit of that department
  const handleDepartmentChange = (newDeptId: MainDepartmentId) => {
    setDepartmentId(newDeptId);
    const dept = DEPARTMENTS.find(d => d.id === newDeptId);
    if (dept && dept.units.length > 0) {
      setUnitId(dept.units[0].id);
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    if (newStatus === 'ดำเนินการแล้วเสร็จ' && progress < 100) {
      setProgress(100);
    } else if (newStatus === 'ยังไม่ดำเนินการ') {
      setProgress(0);
    } else if (newStatus === 'ระหว่างดำเนินการ' && (progress === 0 || progress === 100)) {
      setProgress(50);
    }
  };

  const handleProgressChange = (newProg: number) => {
    setProgress(newProg);
    if (newProg === 100) {
      setStatus('ดำเนินการแล้วเสร็จ');
    } else if (newProg > 0 && newProg < 100) {
      setStatus('ระหว่างดำเนินการ');
    } else if (newProg === 0) {
      setStatus('ยังไม่ดำเนินการ');
    }
  };

  const currentDept = DEPARTMENTS.find(d => d.id === departmentId);
  const currentUnit = currentDept?.units.find(u => u.id === unitId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'กรุณาระบุชื่องาน / โครงการ';
    }
    if (!assignee.trim()) {
      newErrors.assignee = 'กรุณาระบุผู้รับผิดชอบ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const taskData: TaskItem = {
        id: taskToEdit?.id || `TK-${Date.now().toString().slice(-4)}`,
        rowNumber: taskToEdit?.rowNumber,
        title: title.trim(),
        departmentId,
        departmentName: currentDept?.name || '',
        unitId,
        unitName: currentUnit?.name ? `${currentUnit.code} ${currentUnit.name}` : unitId,
        assignee: assignee.trim(),
        month,
        status,
        progress,
        startDate,
        dueDate,
        description: description.trim(),
        performanceSummary: performanceSummary.trim(),
        updatedAt: now,
        createdAt: taskToEdit?.createdAt || now,
      };

      await onSave(taskData);
      onClose();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="task-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="task-modal-box"
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Luxury Midnight Navy Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-4 text-white flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg">
                {taskToEdit ? 'แก้ไขข้อมูลงาน / โครงการ' : 'เพิ่มงาน / โครงการใหม่'}
              </h3>
              <p className="text-xs text-blue-200/90">
                คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร (ปีงบประมาณ 2570)
              </p>
            </div>
          </div>
          <button
            id="task-modal-close-btn"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* ชื่องาน / โครงการ */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ชื่องาน / โครงการ / กิจกรรม <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="เช่น จัดทำแผนปฏิบัติการประจำปีงบประมาณ 2570"
              className={`w-full px-3.5 py-2 rounded-xl border text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors ${
                errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
          </div>

          {/* งาน และ หน่วยงานย่อย (Cascading Dropdowns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-slate-100 via-slate-50 to-slate-150 text-slate-700 border border-slate-200 border-b-[2.5px] border-b-slate-300 font-bold text-xs shadow-xs ring-1 ring-inset ring-white">
                  งานหลัก
                </span>{' '}
                <span className="text-rose-500">*</span>
              </label>
              <select
                id="task-department-select"
                value={departmentId}
                onChange={e => handleDepartmentChange(e.target.value as MainDepartmentId)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-slate-100 via-slate-50 to-slate-150 text-slate-700 border border-slate-200 border-b-[2.5px] border-b-slate-300 font-bold text-xs shadow-xs ring-1 ring-inset ring-white">
                  หน่วยงานย่อย
                </span>{' '}
                <span className="text-rose-500">*</span>
              </label>
              <select
                id="task-unit-select"
                value={unitId}
                onChange={e => setUnitId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                {currentDept?.units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.code} {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* สถานะการดำเนินงาน & ประจำเดือน */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-slate-100 via-slate-50 to-slate-150 text-slate-700 border border-slate-200 border-b-[2.5px] border-b-slate-300 font-bold text-xs shadow-xs ring-1 ring-inset ring-white">
                  สถานะการดำเนินงาน
                </span>{' '}
                <span className="text-rose-500">*</span>
              </label>
              <select
                id="task-status-select"
                value={status}
                onChange={e => handleStatusChange(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                {TASK_STATUSES.map(s => (
                  <option key={s.label} value={s.label}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-slate-100 via-slate-50 to-slate-150 text-slate-700 border border-slate-200 border-b-[2.5px] border-b-slate-300 font-bold text-xs shadow-xs ring-1 ring-inset ring-white">
                  ประจำเดือน
                </span>
              </label>
              <select
                id="task-month-select"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                {FISCAL_MONTHS.map(m => (
                  <option key={m.id} value={m.name}>
                    {m.name} (ไตรมาส {m.quarter})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ความก้าวหน้า Progress Slider: Cyan/Blue Color */}
          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <span>ความก้าวหน้าการดำเนินงาน</span>
              </span>
              <span className="font-bold text-blue-700 text-base">{progress}%</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="task-progress-slider"
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={e => handleProgressChange(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
              />
              <span className="text-xs font-semibold text-blue-800 w-14 text-right bg-white px-2 py-0.5 rounded-md border border-blue-200 shrink-0">
                {progress === 100 ? 'เสร็จสิ้น' : progress > 0 ? 'กำลังทำ' : 'ยังไม่เริ่ม'}
              </span>
            </div>
          </div>

          {/* ผู้รับผิดชอบ และ วันที่ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ผู้รับผิดชอบ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="task-assignee-input"
                  type="text"
                  value={assignee}
                  onChange={e => setAssignee(e.target.value)}
                  placeholder="ชื่อ-นามสกุล ผู้รับผิดชอบ"
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 ${
                    errors.assignee ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.assignee && <p className="mt-1 text-xs text-rose-600">{errors.assignee}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                วันที่เริ่มต้น <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="task-startdate-input"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                กำหนดส่ง / สิ้นสุด <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="task-duedate-input"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* รายละเอียดงาน */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              รายละเอียดงาน / กิจกรรม
            </label>
            <textarea
              id="task-description-input"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="ระบุวัตถุประสงค์ ขอบเขตงาน หรือขั้นตอนการดำเนินงาน..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* สรุปผลการดำเนินงาน / หมายเหตุ */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              สรุปผลการดำเนินงาน / ผลสัมฤทธิ์ / หมายเหตุ
            </label>
            <textarea
              id="task-performance-input"
              rows={2}
              value={performanceSummary}
              onChange={e => setPerformanceSummary(e.target.value)}
              placeholder="เช่น ดำเนินการส่งรายงานเรียบร้อยแล้ว, เอกสารอนุมัติครบถ้วน..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              id="task-modal-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              id="task-modal-save-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {taskToEdit ? 'บันทึกการแก้ไข' : 'เพิ่มรายการงาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
