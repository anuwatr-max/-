import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CalendarClock, User, X } from 'lucide-react';
import { TaskItem } from '../types';
import { canUserEditTask, getUserPermission } from '../data/userPermissions';

// แจ้งเตือนงานใกล้ครบกำหนดภายในกี่วัน (นับรวมวันนี้)
const DUE_SOON_DAYS = 3;

// วันที่ปัจจุบันตามเวลาไทย รูปแบบ YYYY-MM-DD (ไม่ใช้ toISOString เพราะเป็นเวลา UTC)
const getBangkokToday = (): string =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

// แปลงสตริงวันที่ YYYY-MM-DD เป็นจำนวนวัน (นับแบบ UTC ล้วน เพื่อเลี่ยงปัญหาเขตเวลา)
const toDayNumber = (dateStr: string | undefined | null): number | null => {
  if (!dateStr) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateStr).trim());
  if (!m) return null;
  return Math.floor(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / 86400000);
};

interface NotificationBellProps {
  tasks: TaskItem[];
  currentUserEmail?: string | null;
  onOpenTask?: (task: TaskItem) => void;
}

interface DueItem {
  task: TaskItem;
  daysLeft: number; // ติดลบ = เลยกำหนดแล้ว
  canOpen: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  tasks,
  currentUserEmail,
  onOpenTask,
}) => {
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState<string>(() => getBangkokToday());
  const wrapperRef = useRef<HTMLDivElement>(null);

  // อัปเดตวันที่ทุก 1 นาที และเมื่อกลับมาเปิดแท็บ (กรณีเปิดค้างข้ามวัน)
  useEffect(() => {
    const refresh = () => setToday(getBangkokToday());
    const timer = window.setInterval(refresh, 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // ปิดกล่องเมื่อคลิกนอกกล่อง หรือกด Esc
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const perm = getUserPermission(currentUserEmail);
  // เจ้าหน้าที่หน่วยงาน/สิทธิ์กลุ่มงาน เห็นเฉพาะงานที่ตนมีสิทธิ์แก้ไข (หน่วยของตัวเอง)
  // Super Admin, ผู้บริหารและผู้ดูอย่างเดียว เห็นทุกหน่วย
  const scopedToOwnUnits = perm.role === 'unit_contributor' || perm.role === 'department_admin';

  const items: DueItem[] = useMemo(() => {
    const todayNum = toDayNumber(today);
    if (todayNum === null) return [];
    const result: DueItem[] = [];
    for (const task of tasks) {
      if (task.status === 'ดำเนินการแล้วเสร็จ') continue;
      const dueNum = toDayNumber(task.dueDate);
      if (dueNum === null) continue;
      const daysLeft = dueNum - todayNum;
      if (daysLeft > DUE_SOON_DAYS) continue;
      const canEdit = canUserEditTask(task, currentUserEmail);
      if (scopedToOwnUnits && !canEdit) continue;
      result.push({ task, daysLeft, canOpen: canEdit && !!onOpenTask });
    }
    // เลยกำหนดก่อน แล้วเรียงตามกำหนดส่งใกล้สุด
    result.sort((a, b) => a.daysLeft - b.daysLeft);
    return result;
  }, [tasks, today, currentUserEmail, scopedToOwnUnits, onOpenTask]);

  const count = items.length;
  const overdueCount = items.filter(i => i.daysLeft < 0).length;

  const badgeText = (d: number) =>
    d < 0 ? `เลยกำหนด ${Math.abs(d)} วัน` : d === 0 ? 'ครบกำหนดวันนี้' : `อีก ${d} วัน`;
  const badgeClass = (d: number) =>
    d < 0
      ? 'bg-rose-100 text-rose-800 border-rose-300'
      : d === 0
      ? 'bg-orange-100 text-orange-800 border-orange-300'
      : 'bg-amber-100 text-amber-800 border-amber-300';

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        id="navbar-notification-bell"
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label={count > 0 ? `งานใกล้ครบกำหนด ${count} งาน` : 'งานใกล้ครบกำหนด (ไม่มี)'}
        aria-expanded={open}
        title={count > 0 ? `งานใกล้ครบกำหนด ${count} งาน` : 'ไม่มีงานใกล้ครบกำหนด'}
        className="relative h-9 w-9 rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white flex items-center justify-center border border-blue-400 border-b-[2.5px] border-b-blue-900 shadow-sm shadow-blue-900/20 ring-1 ring-inset ring-white/25 transition-all cursor-pointer active:translate-y-0.5 select-none"
      >
        <Bell className="h-[18px] w-[18px]" />
        {count > 0 && (
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold leading-none flex items-center justify-center border-2 border-white ${
              overdueCount > 0 ? 'animate-pulse' : ''
            }`}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="งานใกล้ครบกำหนด"
          className="fixed left-3 right-3 top-[72px] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[24rem] z-50 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/15 overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-bold">
                <CalendarClock className="h-4 w-4 text-cyan-300 shrink-0" />
                <span>งานใกล้ครบกำหนด</span>
                <span className="text-[11px] font-medium text-cyan-200">(ภายใน {DUE_SOON_DAYS} วัน)</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5">
                {scopedToOwnUnits ? 'แสดงเฉพาะงานของหน่วยที่คุณดูแล' : 'แสดงงานของทุกหน่วย'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="ปิด"
              className="p-1 rounded-lg hover:bg-white/15 text-slate-200 cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {count === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-500">
              ไม่มีงานใกล้ครบกำหนดใน {DUE_SOON_DAYS} วัน
            </div>
          ) : (
            <ul className="max-h-[60vh] sm:max-h-96 overflow-y-auto divide-y divide-slate-100">
              {items.map(({ task, daysLeft, canOpen }) => {
                const content = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-slate-800 text-xs leading-snug line-clamp-2 text-left">
                        {task.title}
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${badgeClass(daysLeft)}`}
                      >
                        {badgeText(daysLeft)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 text-left">
                      <span className="font-medium text-slate-600">{task.unitName}</span>
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-400" />
                        {task.assignee}
                      </span>
                      <span>ส่ง: {task.dueDate}</span>
                    </div>
                  </>
                );
                return (
                  <li key={task.id}>
                    {canOpen ? (
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          onOpenTask && onOpenTask(task);
                        }}
                        className="w-full px-4 py-2.5 hover:bg-sky-50 transition-colors cursor-pointer block"
                        title="เปิดเพื่อแก้ไขงานนี้"
                      >
                        {content}
                      </button>
                    ) : (
                      <div className="px-4 py-2.5">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
