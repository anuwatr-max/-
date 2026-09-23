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
import { DEPARTMENTS, FISCAL_MONTHS, getDeptDotClass } from '../data/departments';

interface MonthlyReportViewProps {
  tasks: TaskItem[];
}

// แถบสีอ่อน ๆ คลุมเฉพาะตัวอักษรสำหรับแต่ละงาน โทนสีกรอบนูนมีมิติ (Embossed 3D)
const getDeptStripStyle = (id: string) => {
  switch (id) {
    case 'admin':
    case 'general':
      // งานธุรการ สีเทา
      return 'bg-gradient-to-r from-slate-150 via-slate-100 to-slate-200/90 text-slate-700 border border-slate-200 border-b-[2.5px] border-b-slate-350 shadow-sm shadow-slate-900/10 ring-1 ring-inset ring-white/80';
    case 'academic':
    case 'education':
      // งานบริการการศึกษา สีเขียว
      return 'bg-gradient-to-r from-emerald-100/95 via-emerald-50 to-teal-100/90 text-emerald-900 border border-emerald-200 border-b-[2.5px] border-b-emerald-300 shadow-sm shadow-emerald-900/10 ring-1 ring-inset ring-white/80';
    case 'research':
      // งานวิจัยและพัฒนาคุณภาพการศึกษา แถบสีน้ำเงิน
      return 'bg-gradient-to-r from-blue-100/95 via-blue-50 to-sky-100/90 text-blue-900 border border-blue-200 border-b-[2.5px] border-b-blue-300 shadow-sm shadow-blue-900/10 ring-1 ring-inset ring-white/80';
    case 'finance':
      // งานการเงินและพัสดุ แถบสีฟ้า
      return 'bg-gradient-to-r from-sky-100/95 via-sky-50 to-cyan-100/90 text-sky-900 border border-sky-200 border-b-[2.5px] border-b-sky-300 shadow-sm shadow-sky-900/10 ring-1 ring-inset ring-white/80';
    default:
      return 'bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 text-slate-700 border border-slate-200 border-b-[2.5px] border-b-slate-300 shadow-sm ring-1 ring-inset ring-white/80';
  }
};

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({ tasks }) => {
  // Default to current active month or October 2569
  const [selectedMonth, setSelectedMonth] = useState<string>('ตุลาคม 2569');

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
            <div className="h-8 w-8 rounded-xl bg-blue-100/80 text-blue-800 flex items-center justify-center shrink-0 border border-blue-300 shadow-xs">
              <FileText className="h-5 w-5 text-blue-700" />
            </div>
            <h2>
              {/* สรุปผลประจำเดือน แถบสีเทาอ่อน แบบนูน ย่อขนาดกะทัดรัด (Compact 3D Embossed Relief in Light Gray) */}
              <span className="inline-block px-3 py-1 rounded-lg bg-gradient-to-r from-slate-100 via-slate-50 to-slate-150 text-slate-700 border border-slate-200 border-b-[2.5px] border-b-slate-400 font-bold text-sm sm:text-base shadow-sm ring-1 ring-inset ring-white/90">
                สรุปผลประจำเดือน ปีงบประมาณ 2570
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 ml-1">
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
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
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
        {/* Official Header for University Report: Official NU Logistics Emblem & Official Letterhead */}
        <div className="text-center pb-6 border-b border-slate-200 space-y-2">
          <div className="flex justify-center mb-1">
            <img
              src={`${import.meta.env.BASE_URL}logo-nu-logistics.svg`}
              alt="ตราสัญลักษณ์ คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
            />
          </div>
          <h1 className="text-sm sm:text-base font-bold text-slate-700">
            รายงานสรุปผลการดำเนินงานประจำเดือน {selectedMonth}
          </h1>
          <p className="text-sm sm:text-base text-slate-700 font-semibold">
            คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร
          </p>
          <p className="text-xs text-slate-500 font-medium">
            ข้อมูล ณ วันที่{' '}
            {new Date().toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Executive Summary Cards: ช่องสี่เหลี่ยมขนาดกะทัดรัด แถบสีนูนมีมิติ (Embossed 3D) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Card 1: งานทั้งหมด - แถบสีเทาเข้มแบบนูน */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/90 border border-slate-300 border-b-[3px] border-b-slate-600 shadow-sm shadow-slate-900/10 ring-1 ring-inset ring-white/80">
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 text-white border border-slate-600 border-b-[2px] border-b-slate-950 font-bold text-xs shadow-xs ring-1 ring-inset ring-white/20">
              งานทั้งหมด
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-700">{totalMonthTasks}</span>
              <span className="text-xs text-slate-600">งาน</span>
            </div>
          </div>

          {/* Card 2: ดำเนินการแล้วเสร็จ - แถบสีเขียวแบบนูน */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-300 border-b-[3px] border-b-emerald-600 shadow-sm shadow-emerald-950/10 ring-1 ring-inset ring-white/80">
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border border-emerald-500 border-b-[2px] border-b-emerald-900 font-bold text-xs shadow-xs ring-1 ring-inset ring-white/20">
              ดำเนินการแล้วเสร็จ
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-emerald-900">{completedMonthTasks}</span>
              <span className="text-xs text-emerald-800 font-semibold">งาน ({completionRate}%)</span>
            </div>
          </div>

          {/* Card 3: ระหว่างดำเนินการ - แถบสีน้ำเงินแบบนูน */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-blue-50/80 border border-blue-300 border-b-[3px] border-b-blue-600 shadow-sm shadow-blue-950/10 ring-1 ring-inset ring-white/80">
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-blue-500 border-b-[2px] border-b-blue-950 font-bold text-xs shadow-xs ring-1 ring-inset ring-white/20">
              ระหว่างดำเนินการ
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-blue-900">{inProgressMonthTasks}</span>
              <span className="text-xs text-blue-800 font-semibold">งาน</span>
            </div>
          </div>

          {/* Card 4: ยังไม่ดำเนินการ - แถบสีฟ้าอ่อนแบบนูน (Light Sky Blue Embossed) */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-sky-50/85 border border-sky-300 border-b-[3px] border-b-sky-500 shadow-sm shadow-sky-950/10 ring-1 ring-inset ring-white/80">
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-sky-400 to-cyan-500 text-white border border-sky-300 border-b-[2px] border-b-sky-600 font-bold text-xs shadow-xs ring-1 ring-inset ring-white/20">
              ยังไม่ดำเนินการ
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-sky-900">{notStartedMonthTasks}</span>
              <span className="text-xs text-sky-800 font-semibold">งาน</span>
            </div>
          </div>
        </div>

        {/* Detail Breakdown by 4 Departments - สำนักงานเลขานุการ */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3>
              <span className="inline-block px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-150 text-slate-700 border border-slate-200 border-b-[2.5px] border-b-slate-300 font-bold text-sm shadow-sm ring-1 ring-inset ring-white/90">
                ผลการดำเนินงานของสำนักงานเลขานุการ (จำแนกตาม 4 งาน)
              </span>
            </h3>
            <span className="text-xs text-slate-500">
              คณะโลจิสติกส์และดิจิทัลซัพพลายเชน
            </span>
          </div>
          {departmentReports.map((dept, index) => (
            <div
              key={dept.id}
              id={`report-dept-${dept.id}`}
              className="rounded-2xl border border-slate-200 overflow-hidden break-inside-avoid shadow-xs"
            >
              {/* Dept Header: ธีมสีขาว (White Theme) พร้อมแถบสีอ่อนคลุมตัวอักษร */}
              <div className="bg-white px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-700">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-black text-xs flex items-center justify-center shadow-xs">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="tracking-tight">
                      <span
                        className={`inline-block px-3 py-1 rounded-xl text-sm sm:text-base font-bold ${getDeptStripStyle(dept.id)}`}
                      >
                        {dept.name}
                      </span>
                    </h3>
                    <span className="text-xs text-slate-500 block mt-1">
                      มีทั้งหมด {dept.units.length} หน่วยงานย่อยในสังกัด
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-xs font-semibold text-slate-600">
                    ความสำเร็จ:{' '}
                    <span className="text-blue-700 font-bold text-sm">
                      {dept.completed}/{dept.total} งาน
                    </span>
                  </div>
                  <div className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 border border-blue-200 text-blue-700 shadow-xs">
                    {dept.rate}%
                  </div>
                </div>
              </div>

              {/* แถบสไลเดอร์เปอร์เซ็นต์ความคืบหน้า โทนสีอ่อนเบา สุภาพ */}
              <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-slate-700 font-semibold shrink-0">
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                  <span>ความก้าวหน้าโครงการในงาน:</span>
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                    <div
                      style={{ width: `${Math.max(dept.rate, 2)}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 shadow-xs"
                    />
                  </div>
                  <span className="text-xs font-bold text-blue-700 shrink-0 min-w-[36px] text-right">
                    {dept.rate}%
                  </span>
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
                        <tr className="bg-gradient-to-r from-blue-100/95 via-sky-50 to-indigo-100/90 text-blue-950 border-b-[2.5px] border-b-blue-300 font-bold shadow-xs">
                          <th className="py-2.5 px-3 w-44 font-bold text-blue-950">หน่วยงานย่อย</th>
                          <th className="py-2.5 px-3 font-bold text-blue-950">ชื่องาน / รายละเอียด</th>
                          <th className="py-2.5 px-3 w-32 font-bold text-blue-950">ผู้รับผิดชอบ</th>
                          <th className="py-2.5 px-3 w-28 font-bold text-blue-950">สถานะ</th>
                          <th className="py-2.5 px-3 w-16 text-right font-bold text-blue-950">ความคืบหน้า</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dept.tasks.map(task => (
                          <tr key={task.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-700">
                              <div className="flex items-center gap-1.5">
                                <span className={`h-2 w-2 rounded-full shrink-0 ${getDeptDotClass(dept.id)}`} />
                                <span>{task.unitName}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-700">{task.title}</div>
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
