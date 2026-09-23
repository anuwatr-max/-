import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Layers,
  Award,
} from 'lucide-react';

export interface DepartmentChartData {
  id: string;
  name: string;
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
  avgProgress: number;
}

interface DepartmentPerformanceChartProps {
  deptStats: DepartmentChartData[];
  averageCompletionRate: number;
}

// โทนสีสุภาพ อ่อนเบา และเป็นทางการสำหรับแต่ละกลุ่มงาน
const DEPT_STYLE_MAP: Record<
  string,
  {
    hex: string;
    bg: string;
    border: string;
    text: string;
    lightBg: string;
    badgeBg: string;
  }
> = {
  admin: {
    hex: '#64748b', // สีเทาสุภาพแบบนูน (งานธุรการ)
    bg: 'bg-slate-500',
    border: 'border-slate-300 border-b-[2.5px] border-b-slate-400',
    text: 'text-slate-900',
    lightBg: 'bg-gradient-to-r from-slate-200/95 via-slate-100 to-slate-200/90 shadow-sm shadow-slate-900/10 ring-1 ring-inset ring-white/80',
    badgeBg: 'bg-slate-100 text-slate-800',
  },
  general: {
    hex: '#64748b', // สีเทาสุภาพแบบนูน (งานธุรการ)
    bg: 'bg-slate-500',
    border: 'border-slate-300 border-b-[2.5px] border-b-slate-400',
    text: 'text-slate-900',
    lightBg: 'bg-gradient-to-r from-slate-200/95 via-slate-100 to-slate-200/90 shadow-sm shadow-slate-900/10 ring-1 ring-inset ring-white/80',
    badgeBg: 'bg-slate-100 text-slate-800',
  },
  academic: {
    hex: '#10b981', // สีเขียว (งานบริการการศึกษา)
    bg: 'bg-emerald-500',
    border: 'border-emerald-200 border-b-[2.5px] border-b-emerald-300',
    text: 'text-emerald-950',
    lightBg: 'bg-gradient-to-r from-emerald-100/95 via-emerald-50 to-teal-100/90 shadow-sm shadow-emerald-900/10 ring-1 ring-inset ring-white/80',
    badgeBg: 'bg-emerald-100 text-emerald-800',
  },
  education: {
    hex: '#10b981', // สีเขียว (งานบริการการศึกษา)
    bg: 'bg-emerald-500',
    border: 'border-emerald-200 border-b-[2.5px] border-b-emerald-300',
    text: 'text-emerald-950',
    lightBg: 'bg-gradient-to-r from-emerald-100/95 via-emerald-50 to-teal-100/90 shadow-sm shadow-emerald-900/10 ring-1 ring-inset ring-white/80',
    badgeBg: 'bg-emerald-100 text-emerald-800',
  },
  research: {
    hex: '#2563eb', // แถบสีน้ำเงิน (งานวิจัยและพัฒนาคุณภาพการศึกษา)
    bg: 'bg-blue-600',
    border: 'border-blue-200 border-b-[2.5px] border-b-blue-300',
    text: 'text-blue-950',
    lightBg: 'bg-gradient-to-r from-blue-100/95 via-blue-50 to-sky-100/90 shadow-sm shadow-blue-900/10 ring-1 ring-inset ring-white/80',
    badgeBg: 'bg-blue-100 text-blue-800',
  },
  finance: {
    hex: '#0284c7', // แถบสีฟ้า (งานการเงินและพัสดุ)
    bg: 'bg-sky-500',
    border: 'border-sky-200 border-b-[2.5px] border-b-sky-300',
    text: 'text-sky-950',
    lightBg: 'bg-gradient-to-r from-sky-100/95 via-sky-50 to-cyan-100/90 shadow-sm shadow-sky-900/10 ring-1 ring-inset ring-white/80',
    badgeBg: 'bg-sky-100 text-sky-800',
  },
};

const DEFAULT_STYLE = {
  hex: '#64748b',
  bg: 'bg-slate-500',
  border: 'border-slate-200',
  text: 'text-slate-800',
  lightBg: 'bg-slate-50',
  badgeBg: 'bg-slate-100 text-slate-800',
};

export const DepartmentPerformanceChart: React.FC<DepartmentPerformanceChartProps> = ({
  deptStats,
  averageCompletionRate,
}) => {
  const [viewMode, setViewMode] = useState<'departments' | 'status'>('departments');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // คำนวณยอดรวมทั้งหมด
  const totalAllTasks = useMemo(() => {
    return deptStats.reduce((sum, d) => sum + d.total, 0);
  }, [deptStats]);

  const totalCompleted = useMemo(() => {
    return deptStats.reduce((sum, d) => sum + d.completed, 0);
  }, [deptStats]);

  const totalInProgress = useMemo(() => {
    return deptStats.reduce((sum, d) => sum + d.inProgress, 0);
  }, [deptStats]);

  const totalNotStarted = useMemo(() => {
    return deptStats.reduce((sum, d) => sum + d.notStarted, 0);
  }, [deptStats]);

  // หาฝ่ายที่มีผลงานก้าวหน้าสูงสุด
  const bestPerformingDept = useMemo(() => {
    if (deptStats.length === 0) return null;
    return [...deptStats].sort((a, b) => b.completionRate - a.completionRate)[0];
  }, [deptStats]);

  // ข้อมูลสำหรับ Pie Chart แบบ 4 กลุ่มงาน (สัดส่วนภาระงาน)
  const departmentPieData = useMemo(() => {
    return deptStats.map((dept, index) => {
      const style = DEPT_STYLE_MAP[dept.id] || DEFAULT_STYLE;
      const share = totalAllTasks > 0 ? Math.round((dept.total / totalAllTasks) * 100) : 0;
      return {
        id: dept.id,
        name: dept.name,
        value: dept.total,
        share,
        completed: dept.completed,
        inProgress: dept.inProgress,
        notStarted: dept.notStarted,
        completionRate: dept.completionRate,
        color: style.hex,
        index,
      };
    });
  }, [deptStats, totalAllTasks]);

  // ข้อมูลสำหรับ Pie Chart แบบสถานะภาพรวม 3 สถานะ
  const statusPieData = useMemo(() => {
    return [
      {
        name: 'ดำเนินการแล้วเสร็จ',
        value: totalCompleted,
        color: '#10b981',
        share: totalAllTasks > 0 ? Math.round((totalCompleted / totalAllTasks) * 100) : 0,
      },
      {
        name: 'ระหว่างดำเนินการ',
        value: totalInProgress,
        color: '#3b82f6',
        share: totalAllTasks > 0 ? Math.round((totalInProgress / totalAllTasks) * 100) : 0,
      },
      {
        name: 'ยังไม่ดำเนินการ',
        value: totalNotStarted,
        color: '#f59e0b',
        share: totalAllTasks > 0 ? Math.round((totalNotStarted / totalAllTasks) * 100) : 0,
      },
    ];
  }, [totalCompleted, totalInProgress, totalNotStarted, totalAllTasks]);

  const activePieData = viewMode === 'departments' ? departmentPieData : statusPieData;

  return (
    <div
      id="department-performance-pie-infographic"
      className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-5"
    >
      {/* ส่วนหัว Infographic & สลับมุมมอง */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
            <PieIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              แผนภูมิวงกลมแสดงสัดส่วนภาระงานและอัตราความสำเร็จของแต่ละกลุ่มงาน
            </p>
          </div>
        </div>

        {/* ปุ่มสลับโหมดแผนภูมิวงกลม */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          <button
            id="pie-mode-depts-btn"
            type="button"
            onClick={() => {
              setViewMode('departments');
              setHoveredIndex(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'departments'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>สัดส่วนภาระงาน 4 งาน</span>
          </button>
          <button
            id="pie-mode-status-btn"
            type="button"
            onClick={() => {
              setViewMode('status');
              setHoveredIndex(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'status'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>สถานะภาพรวม</span>
          </button>
        </div>
      </div>

      {/* สรุปไฮไลท์ Infographic (Key Highlights) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. ปริมาณงานรวม: สีเทาเข้มแบบนูน */}
        <div className="p-3.5 rounded-xl bg-slate-100/90 border border-slate-300 border-b-[3px] border-b-slate-600 shadow-sm shadow-slate-900/10 ring-1 ring-inset ring-white/80 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-700 text-white border border-slate-600 border-b-[2px] border-b-slate-950 flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="mb-1">
              <span className="inline-block px-2 py-0.5 rounded-md bg-slate-700 text-white border border-slate-600 border-b-[2px] border-b-slate-950 font-bold text-[11px] shadow-xs">
                ปริมาณงานรวม
              </span>
            </div>
            <div className="text-base font-bold text-slate-950">
              {totalAllTasks} <span className="text-xs font-normal text-slate-600">โครงการ/งาน</span>
            </div>
          </div>
        </div>

        {/* 2. ความก้าวหน้ารวมเฉลี่ย: สีเขียวนูนเหมือนแถบสีเปิด Sheet */}
        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-300 border-b-[3px] border-b-emerald-600 shadow-sm shadow-emerald-950/10 ring-1 ring-inset ring-white/80 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white border border-emerald-500 border-b-[2px] border-b-emerald-900 flex items-center justify-center shrink-0 shadow-xs">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <div className="mb-1">
              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-600 text-white border border-emerald-500 border-b-[2px] border-b-emerald-900 font-bold text-[11px] shadow-xs">
                ความก้าวหน้ารวมเฉลี่ย
              </span>
            </div>
            <div className="text-base font-bold text-emerald-950">
              {averageCompletionRate}% <span className="text-xs font-normal text-emerald-800">สำเร็จแล้ว ({totalCompleted} งาน)</span>
            </div>
          </div>
        </div>

        {/* 3. งานที่ก้าวหน้าสูงสุด งานธุรการ: สีน้ำเงินนูนเหมือนแถบสีซิงค์ด่วน */}
        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-300 border-b-[3px] border-b-blue-600 shadow-sm shadow-blue-950/10 ring-1 ring-inset ring-white/80 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white border border-blue-500 border-b-[2px] border-b-blue-950 flex items-center justify-center shrink-0 shadow-xs">
            <Award className="h-4 w-4" />
          </div>
          <div className="truncate">
            <div className="mb-1">
              <span className="inline-block px-2 py-0.5 rounded-md bg-blue-600 text-white border border-blue-500 border-b-[2px] border-b-blue-950 font-bold text-[11px] shadow-xs">
                งานที่ก้าวหน้าสูงสุด
              </span>
            </div>
            <div className="text-sm font-bold text-blue-950 truncate">
              {bestPerformingDept ? `${bestPerformingDept.name} (${bestPerformingDept.completionRate}%)` : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Infographic Grid: Donut Chart (ซ้าย) + Department Infographic Cards (ขวา) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-1">
        {/* คอลัมน์ซ้าย: Pie / Donut Chart พร้อม Center Display */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[280px] h-[280px] sm:max-w-[300px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={112}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                  onMouseEnter={(_, index) => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {activePieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#ffffff"
                      strokeWidth={hoveredIndex === index ? 3 : 1.5}
                      className="transition-all duration-200 cursor-pointer"
                      style={{
                        filter: hoveredIndex === index ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.12))' : 'none',
                        transform: hoveredIndex === index ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: 'center center',
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5 min-w-[170px]">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: data.color }}
                            />
                            <span>{data.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-100">
                            <span>จำนวน:</span>
                            <span className="font-bold">{data.value} งาน</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>สัดส่วน:</span>
                            <span className="font-bold">{data.share}%</span>
                          </div>
                          {data.completionRate !== undefined && (
                            <div className="flex items-center justify-between text-blue-700 font-bold">
                              <span>ความสำเร็จ:</span>
                              <span>{data.completionRate}%</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* ตรงกลาง Donut แสดงตัวเลขสรุป (Center Metric Infographic) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {viewMode === 'departments' ? 'งานรวม 4 กลุ่ม' : 'ความสำเร็จรวม'}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight my-0.5">
                {viewMode === 'departments' ? totalAllTasks : `${averageCompletionRate}%`}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {viewMode === 'departments' ? 'โครงการ / ภาระงาน' : `เสร็จ ${totalCompleted}/${totalAllTasks} งาน`}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            * นำเมาส์ไปชี้ที่ชิ้นแผนภูมิเพื่อดูสัดส่วนและรายละเอียด
          </p>
        </div>

        {/* คอลัมน์ขวา: Infographic Cards ของ 4 งาน (หรือ 3 สถานะ) */}
        <div className="lg:col-span-7">
          {viewMode === 'departments' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deptStats.map((dept, index) => {
                const style = DEPT_STYLE_MAP[dept.id] || DEFAULT_STYLE;
                const share = totalAllTasks > 0 ? Math.round((dept.total / totalAllTasks) * 100) : 0;
                const isHovered = hoveredIndex === index;

                return (
                  <div
                    key={dept.id}
                    id={`pie-info-dept-${dept.id}`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`rounded-xl p-3.5 border transition-all cursor-pointer ${
                      isHovered
                        ? 'border-blue-400 bg-blue-50/40 shadow-sm scale-[1.01]'
                        : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {/* Header: Dept Name & Share Pill */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: style.hex }}
                        />
                        <h5 className="font-bold text-xs sm:text-sm leading-tight truncate">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-lg border text-xs font-bold ${style.lightBg} ${style.text} ${style.border}`}
                          >
                            {dept.name}
                          </span>
                        </h5>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-700 shrink-0 shadow-xs">
                        {share}% ของงาน
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 mb-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">ความก้าวหน้า:</span>
                        <span className="font-bold text-slate-800">{dept.completionRate}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${dept.completionRate}%`, backgroundColor: style.hex }}
                          className="h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>

                    {/* Quick Stats: แล้วเสร็จ / กำลังทำ / ยังไม่เริ่ม */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-lg py-1 px-1 text-emerald-800">
                        <div className="font-bold">{dept.completed}</div>
                        <div className="text-[9px] text-emerald-700">แล้วเสร็จ</div>
                      </div>
                      <div className="bg-blue-50/70 border border-blue-200/60 rounded-lg py-1 px-1 text-blue-800">
                        <div className="font-bold">{dept.inProgress}</div>
                        <div className="text-[9px] text-blue-700">กำลังทำ</div>
                      </div>
                      <div className="bg-slate-100/80 border border-slate-200/60 rounded-lg py-1 px-1 text-slate-700">
                        <div className="font-bold">{dept.notStarted}</div>
                        <div className="text-[9px] text-slate-500">ยังไม่เริ่ม</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {/* สถานะ 1: แล้วเสร็จ */}
              <div
                onMouseEnter={() => setHoveredIndex(0)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  hoveredIndex === 0
                    ? 'border-emerald-400 bg-emerald-50/70 shadow-sm'
                    : 'border-emerald-200/70 bg-emerald-50/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>ดำเนินการแล้วเสร็จ</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    {totalAllTasks > 0 ? Math.round((totalCompleted / totalAllTasks) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-emerald-800">
                  <span>จำนวนงานที่เสร็จสิ้นสมบูรณ์ตามเป้าหมาย</span>
                  <span className="text-base font-extrabold">{totalCompleted} งาน</span>
                </div>
              </div>

              {/* สถานะ 2: กำลังดำเนินการ */}
              <div
                onMouseEnter={() => setHoveredIndex(1)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  hoveredIndex === 1
                    ? 'border-blue-400 bg-blue-50/70 shadow-sm'
                    : 'border-blue-200/70 bg-blue-50/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>ระหว่างดำเนินการ</span>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                    {totalAllTasks > 0 ? Math.round((totalInProgress / totalAllTasks) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-blue-800">
                  <span>งานที่อยู่ระหว่างการดำเนินกิจกรรมตามแผน</span>
                  <span className="text-base font-extrabold">{totalInProgress} งาน</span>
                </div>
              </div>

              {/* สถานะ 3: ยังไม่ดำเนินการ */}
              <div
                onMouseEnter={() => setHoveredIndex(2)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  hoveredIndex === 2
                    ? 'border-amber-400 bg-amber-50/70 shadow-sm'
                    : 'border-amber-200/70 bg-amber-50/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span>ยังไม่ดำเนินการ</span>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                    {totalAllTasks > 0 ? Math.round((totalNotStarted / totalAllTasks) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-amber-800">
                  <span>งานที่มีกำหนดการในรอบถัดไปหรือรอเริ่มกิจกรรม</span>
                  <span className="text-base font-extrabold">{totalNotStarted} งาน</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
