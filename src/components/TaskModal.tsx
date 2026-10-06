import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, AlignLeft, CheckCircle2, Building2, ShieldAlert, Lock, Trash2 } from 'lucide-react';
import { TaskItem, TaskStatus, MainDepartmentId } from '../types';
import { DEPARTMENTS, FISCAL_MONTHS, TASK_STATUSES } from '../data/departments';
import { getAllowedDepartmentsForUser, canUserEditTask, canUserDeleteTask, getUserPermission } from '../data/userPermissions';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskItem) => Promise<void>;
  onDeleteTask?: (task: TaskItem) => void;
  taskToEdit?: TaskItem | null;
  defaultMonth?: string;
  defaultDueDate?: string;
  currentUserEmail?: string | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDeleteTask,
  taskToEdit,
  defaultMonth = 'มีนาคม 2570',
  defaultDueDate,
  currentUserEmail,
}) => {
  const allowedDepts = getAllowedDepartmentsForUser(currentUserEmail);
  const userPerm = getUserPermission(currentUserEmail);
  const isPermittedToEdit = !taskToEdit || canUserEditTask(taskToEdit, currentUserEmail);
  const isPermittedToDelete = taskToEdit ? canUserDeleteTask(taskToEdit, currentUserEmail) : false;

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
      // Default new task - set to user's permitted department and unit
      const initialDept = allowedDepts.length > 0 ? allowedDepts[0].id : 'admin';
      const permittedDeptObj = allowedDepts.find(d => d.id === initialDept) || DEPARTMENTS.find(d => d.id === initialDept);
      setDepartmentId(initialDept);
      setUnitId(permittedDeptObj?.units[0]?.id || '1.1');
      setTitle('');
      setAssignee('');
      
      const targetDate = defaultDueDate || new Date().toISOString().split('T')[0];
      setStartDate(targetDate);
      setDueDate(targetDate);

      // Auto calculate month from targetDate if possible
      let initialMonth = defaultMonth;
      if (defaultDueDate) {
        const [y, m] = defaultDueDate.split('-').map(Number);
        if (y && m) {
          const beYear = y + 543;
          const mPad = String(m).padStart(2, '0');
          const fiscalId = `${beYear}-${mPad}`;
          const found = FISCAL_MONTHS.find(fm => fm.id === fiscalId);
          if (found) initialMonth = found.name;
        }
      }
      setMonth(initialMonth);

      setStatus('ยังไม่ดำเนินการ');
      setProgress(0);
      setDescription('');
      setPerformanceSummary('');
    }
    setErrors({});
  }, [taskToEdit, isOpen, defaultMonth, defaultDueDate, currentUserEmail]);

  // When department changes, set unitId to first unit of that department
  const handleDepartmentChange = (newDeptId: MainDepartmentId) => {
    setDepartmentId(newDeptId);
    const dept = allowedDepts.find(d => d.id === newDeptId) || DEPARTMENTS.find(d => d.id === newDeptId);
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
  const deptAllowed = allowedDepts.find(d => d.id === departmentId);
  const availableUnits = !taskToEdit && deptAllowed ? deptAllowed.units : (currentDept?.units || []);
  const currentUnit = currentDept?.units.find(u => u.id === unitId);

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrors({});
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPermittedToEdit) {
      setErrors({ form: `คุณไม่มีสิทธิ์บันทึกงานในกลุ่มนี้ (สิทธิ์เฉพาะกลุ่มงาน ${taskToEdit?.departmentName || 'อื่น'})` });
      return;
    }

    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'กรุณาระบุชื่องาน';
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
      onClick={handleCancel}
    >
      <div
        id="task-modal-box"
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Luxury Midnight Navy Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-4 text-white flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg">
                {taskToEdit ? 'แก้ไขข้อมูลงาน' : 'เพิ่มงานใหม่'}
              </h3>
              <p className="text-xs text-blue-200/90">
                คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร (ปีงบประมาณ 2570)
              </p>
            </div>
          </div>
          <button
            id="task-modal-close-btn"
            type="button"
            onClick={handleCancel}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Permission Alert if user cannot edit this task */}
          {!isPermittedToEdit && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-2.5 animate-in fade-in">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs">คุณไม่มีสิทธิ์แก้ไขงานกลุ่มนี้</h4>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  บัญชีของคุณ ({currentUserEmail || 'ผู้เยี่ยมชม'}) ได้รับสิทธิ์เฉพาะ <strong>{userPerm.departmentTitle}</strong> งานนี้เป็นของ <em>{taskToEdit?.departmentName}</em> จึงสามารถเปิดอ่านได้เท่านั้น
                </p>
              </div>
            </div>
          )}

          {/* User Department Badge notice when adding */}
          {!taskToEdit && allowedDepts.length === 1 && (
            <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 flex items-center justify-between text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-600" />
                <span>เพิ่มงานในสิทธิ์ของคุณ:</span>
              </span>
              <span className="font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                {userPerm.allowedUnitIds && userPerm.allowedUnitIds.length > 0
                  ? userPerm.departmentTitle
                  : allowedDepts[0].name}
              </span>
            </div>
          )}

          {errors.form && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errors.form}
            </div>
          )}

          {/* ชื่องาน */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ชื่องาน <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              disabled={!isPermittedToEdit}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="เช่น จัดทำแผนปฏิบัติการประจำปีงบประมาณ 2570"
              className={`w-full px-3.5 py-2 rounded-xl border text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors ${
                !isPermittedToEdit ? 'bg-slate-100 cursor-not-allowed' : ''
              } ${errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'}`}
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
                disabled={!isPermittedToEdit || allowedDepts.length <= 1}
                onChange={e => handleDepartmentChange(e.target.value as MainDepartmentId)}
                className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 ${
                  allowedDepts.length <= 1 || !isPermittedToEdit
                    ? 'border-slate-300 bg-slate-100 text-slate-800 font-semibold cursor-not-allowed'
                    : 'border-slate-300 bg-white text-slate-700 cursor-pointer'
                }`}
              >
                {allowedDepts.length > 0 ? (
                  allowedDepts.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} {allowedDepts.length === 1 ? '(สิทธิ์ของคุณ)' : ''}
                    </option>
                  ))
                ) : (
                  <option value={departmentId}>
                    {currentDept?.name || 'กลุ่มงาน'}
                  </option>
                )}
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
                disabled={!isPermittedToEdit || (!taskToEdit && availableUnits.length <= 1)}
                onChange={e => setUnitId(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 ${
                  !isPermittedToEdit || (!taskToEdit && availableUnits.length <= 1)
                    ? 'border-slate-300 bg-slate-100 cursor-not-allowed text-slate-800 font-semibold'
                    : 'border-slate-300 bg-white text-slate-700 cursor-pointer'
                }`}
              >
                {availableUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.code} {unit.name} {!taskToEdit && availableUnits.length === 1 ? '(สิทธิ์ของคุณ)' : ''}
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
              รายละเอียดงาน
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
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              {taskToEdit && onDeleteTask && isPermittedToDelete && (
                <button
                  id="task-modal-delete-btn"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteTask(taskToEdit);
                  }}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>ลบงานนี้</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              <button
                id="task-modal-cancel-btn"
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                ยกเลิก
              </button>
              <button
                id="task-modal-save-btn"
                type="submit"
                disabled={isSubmitting || !isPermittedToEdit}
                className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {taskToEdit ? 'บันทึกการแก้ไข' : 'เพิ่มรายการงาน'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
