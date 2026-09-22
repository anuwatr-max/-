import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { TaskItem } from '../types';
import { DEPARTMENTS, FISCAL_MONTHS } from '../data/departments';

interface MonthlyReportViewProps {
  tasks: TaskItem[];
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({ tasks }) => {
  // Default to current active month or March 2570
  const [selectedMonth, setSelectedMonth] = useState<string>('มีนาคม 2570');

  // Filter tasks for the selected month
  const monthTasks = useMemo(() => {
    return tasks.filter(t => t.month === selectedMonth);
  }, [tasks, selectedMonth]);

  // Overall metrics for the month
  const totalMonthTasks = monthTasks.length;
  const completedMonthTasks = monthTasks.filter(t => t.status === 'ดำเนินการแล้วเสร็จ').length;
  const inProgressMonthTasks = monthTasks.filter(t => t.status === 'ระหว่างดำเนินการ').length;
  const notStartedMonthTasks = monthTasks.filter(t => t.status === 'ยังไม่ดำเนินการ').length;
  const completionRate =
    totalMonthTasks > 0 ? Math.round((completedMonthTasks / totalMonthTasks) * 100) : 0;

  // Department reports
  const departmentReports = useMemo(() => {
    return DEPARTMENTS.map(dept => {
      const deptTasks = monthTasks.filter(t => t.departmentId === dept.id);
      const total = deptTasks.length;
      const completed = deptTasks.filter(t => t.status === 'ดำเนินการแล้วเสร็จ').length;
      const inProgress = deptTasks.filter(t => t.status === 'ระหว่างดำเนินการ').length;
      const notStarted = deptTasks.filter(t => t.status === 'ยังไม่ดำเนินการ').length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Group by sub-units
      const unitGroups = dept.units.map(unit => {
        const uTasks = deptTasks.filter(t => t.unitId === unit.id || t.unitName.includes(unit.name));
        return {
          ...unit,
          tasks: uTasks,
          total: uTasks.length,
          completed: uTasks.filter(t => t.status === 'ดำเนินการแล้วเสร็จ').length,
        };
      });

      return {
        ...dept,
        tasks: deptTasks,
        total,
        completed,
        inProgress,
        notStarted,
        rate,
        unitGroups,
      };
    });
  }, [monthTasks]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="monthly-report-view" className="space-y-6">
      {/* Top Header & Month Selector */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              สรุปผลการดำเนินงานของแต่ละงานประจำเดือน
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 ml-10">
            คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร ประจำปีงบประมาณ 2570
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-blue-50/60 border border-blue-200/80 rounded-xl px-3 py-1.5">
            <Calendar className="h-4 w-4 text-blue-700 shrink-0" />
            <span className="text-xs font-semibold text-blue-900">เลือกเดือน:</span>
            <select
              id="report-month-select"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-hidden cursor-pointer"
            >
              {FISCAL_MONTHS.map(m => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <button
            id="report-print-btn"
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs border border-blue-900/40"
          >
            <Printer className="h-4 w-4 text-cyan-300" />
            <span>พิมพ์ / บันทึก PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs print:p-0 print:border-none print:shadow-none space-y-6">
        {/* Official Header for University Report: Premium Blue Emblem & Official Letterhead */}
        <div className="text-center pb-6 border-b border-slate-200 space-y-1.5">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white shadow-md shadow-blue-950/20 mb-2">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            รายงานสรุปผลการดำเนินงานประจำเดือน {selectedMonth}
          </h1>
          <p className="text-sm text-slate-800 font-semibold">
            คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร
          </p>
          <p className="text-xs text-blue-800/80 font-medium">
            แผนปฏิบัติการประจำปีงบประมาณ พ.ศ. 2570 | ข้อมูล ณ วันที่{' '}
            {new Date().toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70">
            <span className="text-xs text-blue-900 font-medium">งานในรอบเดือนนี้</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">{totalMonthTasks}</span>
              <span className="text-xs text-slate-500">งาน</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <span className="text-xs text-emerald-700 font-medium">ดำเนินการแล้วเสร็จ</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-700">{completedMonthTasks}</span>
              <span className="text-xs text-emerald-600">งาน ({completionRate}%)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <span className="text-xs text-blue-700 font-medium">ระหว่างดำเนินการ</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-blue-700">{inProgressMonthTasks}</span>
              <span className="text-xs text-blue-600">งาน</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <span className="text-xs text-amber-700 font-medium">ยังไม่ดำเนินการ</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-amber-700">{notStartedMonthTasks}</span>
              <span className="text-xs text-amber-600">งาน</span>
            </div>
          </div>
        </div>

        {/* Detail Breakdown by 4 Departments */}
        <div className="space-y-6 pt-2">
          {departmentReports.map((dept, index) => (
            <div
              key={dept.id}
              id={`report-dept-${dept.id}`}
              className="rounded-2xl border border-slate-200 overflow-hidden break-inside-avoid"
            >
              {/* Dept Header */}
              <div className="bg-slate-50/90 px-5 py-3 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-lg bg-blue-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">{dept.name}</h3>
                    <span className="text-[11px] text-slate-500">
                      มีทั้งหมด {dept.units.length} หน่วยงานย่อย
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-semibold text-slate-600">
                    ความสำเร็จ:{' '}
                    <span className="text-blue-800 font-bold">
                      {dept.completed}/{dept.total} งาน ({dept.rate}%)
                    </span>
                  </div>
                  <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                    <div
                      style={{ width: `${dept.rate}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Sub-units & Tasks Table */}
              <div className="p-4 sm:p-5 space-y-4">
                {dept.tasks.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400 italic">
                    ไม่มีรายการงานที่กำหนดส่งหรือดำเนินการในเดือน {selectedMonth}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50/40">
                          <th className="py-2.5 px-3 w-44">หน่วยงานย่อย</th>
                          <th className="py-2.5 px-3">ชื่องาน / รายละเอียด</th>
                          <th className="py-2.5 px-3 w-32">ผู้รับผิดชอบ</th>
                          <th className="py-2.5 px-3 w-28">สถานะ</th>
                          <th className="py-2.5 px-3 w-16 text-right">ความคืบหน้า</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dept.tasks.map(task => (
                          <tr key={task.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-blue-900">
                              {task.unitName}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-900">{task.title}</div>
                              {task.performanceSummary && (
                                <div className="text-emerald-700 text-[11px] mt-0.5 bg-emerald-50/60 p-1.5 rounded-md border border-emerald-100">
                                  <span className="font-semibold">ผลสัมฤทธิ์:</span>{' '}
                                  {task.performanceSummary}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-medium">
                              {task.assignee}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  task.status === 'ดำเนินการแล้วเสร็จ'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : task.status === 'ระหว่างดำเนินการ'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {task.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-700">
                              {task.progress}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Signature Box for Printable Official Report */}
        <div className="pt-8 mt-8 border-t border-slate-200 hidden print:grid grid-cols-2 gap-8 text-center text-xs text-slate-700">
          <div className="space-y-12">
            <p>ลงชื่อ.............................................................. ผู้รายงาน</p>
            <p>(..............................................................)</p>
            <p>ตำแหน่ง..............................................................</p>
          </div>
          <div className="space-y-12">
            <p>ลงชื่อ.............................................................. ผู้รับรองรายงาน</p>
            <p>(..............................................................)</p>
            <p>คณบดีคณะโลจิสติกส์และดิจิทัลซัพพลายเชน</p>
          </div>
        </div>
      </div>
    </div>
  );
};
