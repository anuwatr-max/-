import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  FileCheck,
  HelpCircle,
  History,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Unlock,
  Users,
} from 'lucide-react';
import {
  AuditLogEntry,
  Criteria,
  Employee,
  EvaluationPeriod,
  EvaluatorAssignment,
  OverallSummaryGuideContent,
  SupervisionScope,
} from '../types';
import { formatThaiDate, formatThaiDateTime } from '../lib/dateUtils';
import { DEFAULT_OVERALL_SUMMARY_GUIDE, storageService } from '../services/storage';

interface AdminSettingsViewProps {
  currentPeriod: EvaluationPeriod;
  periods: EvaluationPeriod[];
  employees: Employee[];
  assignments: EvaluatorAssignment[];
  scopes?: SupervisionScope[];
  criteriaList?: Criteria[];
  auditLogs: AuditLogEntry[];
  onSaveAssignments: (roundId: string, assignments: EvaluatorAssignment[]) => Promise<void>;
  onSavePeriod: (period: EvaluationPeriod) => Promise<void>;
  onCreatePeriod: (roundNumber: 1 | 2, thaiYear: number) => Promise<void>;
  onUnlockEmployee: (periodId: string, employeeId: string) => Promise<void>;
  onLockEmployee: (periodId: string, employeeId: string) => Promise<void>;
  onPublishPeriod?: (periodId: string, isPublished: boolean) => Promise<void>;
  onToggleShowEvaluatorDetails?: (periodId: string, show: boolean) => Promise<void>;
  onSaveScopes?: (roundId: string, scopes: SupervisionScope[]) => Promise<void>;
  onSaveCriteria?: (roundId: string, criteria: Criteria[]) => Promise<void>;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  currentPeriod,
  periods,
  employees,
  assignments,
  scopes = [],
  criteriaList = [],
  auditLogs,
  onSaveAssignments,
  onSavePeriod,
  onCreatePeriod,
  onUnlockEmployee,
  onLockEmployee,
  onPublishPeriod,
  onToggleShowEvaluatorDetails,
  onSaveScopes,
  onSaveCriteria,
}) => {
  const [activeTab, setActiveTab] = useState<
    'assignments' | 'rounds' | 'scopes' | 'criteria' | 'unlocks' | 'logs' | 'guide'
  >('assignments');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoundId, setSelectedRoundId] = useState(currentPeriod.id);

  // Guide editing state (Section 14.7)
  const [guideForm, setGuideForm] = useState<OverallSummaryGuideContent>(DEFAULT_OVERALL_SUMMARY_GUIDE);
  const [isSavingGuide, setIsSavingGuide] = useState(false);

  useEffect(() => {
    storageService.getOverallSummaryGuide().then((data) => {
      setGuideForm(data);
    });
  }, []);

  const handleSaveGuide = async () => {
    setIsSavingGuide(true);
    try {
      await storageService.saveOverallSummaryGuide(guideForm);
      alert('บันทึกเนื้อหาคู่มือการใช้งานหน้าสรุปผลคะแนนภาพรวมเรียบร้อยแล้ว');
    } finally {
      setIsSavingGuide(false);
    }
  };

  const handleResetGuideToDefault = async () => {
    if (confirm('คุณต้องการรีเซ็ตเนื้อหาคู่มือกลับเป็นค่าเริ่มต้นของระบบใช่หรือไม่?')) {
      setGuideForm(DEFAULT_OVERALL_SUMMARY_GUIDE);
      await storageService.saveOverallSummaryGuide(DEFAULT_OVERALL_SUMMARY_GUIDE);
      alert('รีเซ็ตเนื้อหาคู่มือกลับเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
    }
  };

  // Local state for assignments being edited
  const [localAssignments, setLocalAssignments] = useState<EvaluatorAssignment[]>(assignments);

  // Editing round deadline
  const [editingPeriodDeadline, setEditingPeriodDeadline] = useState(currentPeriod.effectiveDeadline);
  const [isExtendingDeadline, setIsExtendingDeadline] = useState(false);

  // Create new round state
  const [newRoundNum, setNewRoundNum] = useState<1 | 2>(2);
  const [newRoundYear, setNewRoundYear] = useState<number>(2569);
  const [isCreatingRound, setIsCreatingRound] = useState(false);

  // Filter assignments by selected round
  const currentRoundAssignments = localAssignments.filter((a) => a.roundId === selectedRoundId);

  // ผู้ถูกประเมิน = ทุกคนยกเว้นผู้บริหาร E01–E05 (เป็นผู้ประเมินเท่านั้น)
  const evaluateeEmployees = employees.filter((e) => !e.id.startsWith('E'));

  // Calculate weight sums per evaluatee
  const evaluateeWeightSums = evaluateeEmployees.map((emp) => {
    const ach = currentRoundAssignments
      .filter((a) => a.evaluateeId === emp.id && a.type === 'achievement')
      .reduce((sum, a) => sum + a.weight, 0);

    const beh = currentRoundAssignments
      .filter((a) => a.evaluateeId === emp.id && a.type === 'behavior')
      .reduce((sum, a) => sum + a.weight, 0);

    return {
      emp,
      achievementWeightSum: ach,
      behaviorWeightSum: beh,
      isAchOk: ach === 100 || (ach === 0 && emp.roles.includes('admin') && emp.id.startsWith('E')),
      isBehOk:
        beh === 100 ||
        (beh === 0 && emp.roles.includes('admin') && emp.id.startsWith('E')),
    };
  });

  // Adding new assignment
  const [newEvaluateeId, setNewEvaluateeId] = useState(evaluateeEmployees[0]?.id || '');
  const [newEvaluatorId, setNewEvaluatorId] = useState(employees[1]?.id || '');
  const [newType, setNewType] = useState<'achievement' | 'behavior'>('achievement');
  const [newWeight, setNewWeight] = useState<number>(50);

  const handleAddAssignment = () => {
    if (!newEvaluateeId || !newEvaluatorId || newWeight <= 0) {
      alert('กรุณากรอกข้อมูลการมอบหมายให้ครบถ้วน');
      return;
    }

    const newItem: EvaluatorAssignment = {
      id: `ea-${selectedRoundId}-${Date.now()}`,
      roundId: selectedRoundId,
      evaluateeId: newEvaluateeId,
      evaluatorId: newEvaluatorId,
      type: newType,
      weight: Number(newWeight),
    };

    const updated = [...localAssignments, newItem];
    setLocalAssignments(updated);
  };

  const handleDeleteAssignment = (id: string) => {
    setLocalAssignments(localAssignments.filter((a) => a.id !== id));
  };

  const handleSaveAssignmentsToStorage = async () => {
    const roundAssignments = localAssignments.filter((a) => a.roundId === selectedRoundId);
    await onSaveAssignments(selectedRoundId, roundAssignments);
    alert('บันทึกการตั้งค่าตารางผู้ประเมินและค่าน้ำหนักเรียบร้อยแล้ว');
  };

  const handleSaveDeadline = async () => {
    const periodToUpdate = periods.find((p) => p.id === selectedRoundId);
    if (!periodToUpdate) return;

    const updated = {
      ...periodToUpdate,
      effectiveDeadline: editingPeriodDeadline,
    };
    await onSavePeriod(updated);
    alert(`ขยายเวลากำหนดปิดรับแบบประเมินเป็น ${formatThaiDate(editingPeriodDeadline)} เรียบร้อยแล้ว`);
    setIsExtendingDeadline(false);
  };

  const handleCreateNewRound = async () => {
    setIsCreatingRound(true);
    try {
      await onCreatePeriod(newRoundNum, newRoundYear);
      alert(`สร้างรอบการประเมินรอบที่ ${newRoundNum} ปี ${newRoundYear} เรียบร้อยแล้ว`);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการสร้างรอบใหม่');
    } finally {
      setIsCreatingRound(false);
    }
  };

  return (
    <div className="space-y-6 font-sarabun text-slate-800">
      {/* Super Admin Banner */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50 border border-sky-100 rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>ระบบจัดการผู้ดูแลระบบสูงสุด (Super Admin Portal)</span>
          </div>
          <h2 className="text-lg font-bold">
            ตั้งค่ารอบการประเมินและตารางผู้ประเมินถ่วงน้ำหนัก
          </h2>
          <p className="text-xs sm:text-sm text-sky-700 mt-1">
            จัดการตาราง evaluator_assignments, กำหนดวันปิดรับ, ปลดล็อกรายคน และตรวจสอบ Audit Log
          </p>
        </div>

        {/* Selected Round Switcher */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shrink-0">
          <label className="text-xs text-sky-700 block mb-1 font-semibold">รอบการประเมินที่กำลังตั้งค่า:</label>
          <select
            value={selectedRoundId}
            onChange={(e) => setSelectedRoundId(e.target.value)}
            className="bg-white text-slate-800 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>ผู้ประเมิน & น้ำหนัก</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rounds')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'rounds'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>รอบ & ประกาศผล</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scopes')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'scopes'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ขอบเขตผู้บริหาร (Sec 14)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('criteria')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'criteria'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>เกณฑ์รายข้อ (Rubrics)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('unlocks')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'unlocks'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Unlock className="w-3.5 h-3.5" />
          <span>ปลดล็อกรายคน</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Log ({auditLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'guide'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>คู่มือหน้าสรุป (Sec 14.7)</span>
        </button>
      </div>

      {/* Tab 1: Evaluator Assignments Matrix */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Weight Totals Verification Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ตรวจสอบผลรวมน้ำหนักของผู้ถูกประเมินแต่ละคน (Weight Sum Verification)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ระบบตรวจสอบผลรวมค่าน้ำหนัก (%) ด้านผลสัมฤทธิ์ (ปกติ = 100%) และพฤติกรรม (ปกติ = 100%)
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveAssignmentsToStorage}
                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกการตั้งค่าทั้งหมด</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {evaluateeWeightSums.map(({ emp, achievementWeightSum, behaviorWeightSum, isAchOk, isBehOk }) => (
                <div
                  key={emp.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-800">
                      {emp.id}: {emp.fullName}
                    </span>
                    <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {emp.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">ผลสัมฤทธิ์ (70):</span>
                    <span
                      className={`font-mono font-bold ${
                        isAchOk ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {achievementWeightSum}% {isAchOk ? '✓' : '⚠️'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">พฤติกรรม (30):</span>
                    <span
                      className={`font-mono font-bold ${
                        isBehOk ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {behaviorWeightSum}% {isBehOk ? '✓' : '⚠️'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Assignment Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>เพิ่มผู้ประเมินใหม่ในรอบ {selectedRoundId}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">ผู้ถูกประเมิน:</label>
                <select
                  value={newEvaluateeId}
                  onChange={(e) => setNewEvaluateeId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  {evaluateeEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.id} - {e.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">ผู้ประเมิน:</label>
                <select
                  value={newEvaluatorId}
                  onChange={(e) => setNewEvaluatorId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.id} - {e.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">ประเภท:</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="achievement">ผลสัมฤทธิ์ (70)</option>
                  <option value="behavior">พฤติกรรม (30)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">น้ำหนัก (%):</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddAssignment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                >
                  เพิ่มรายการ
                </button>
              </div>
            </div>
          </div>

          {/* Assignments Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>รายการการมอบหมายผู้ประเมินทั้งหมด ({currentRoundAssignments.length} รายการ)</span>
              </h3>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-3">ผู้ถูกประเมิน</th>
                    <th className="py-3 px-3">ผู้ประเมิน</th>
                    <th className="py-3 px-3">ประเภท</th>
                    <th className="py-3 px-3 text-center">น้ำหนัก (%)</th>
                    <th className="py-3 px-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentRoundAssignments.map((a) => {
                    const evaluatee = employees.find((e) => e.id === a.evaluateeId);
                    const evaluator = employees.find((e) => e.id === a.evaluatorId);

                    return (
                      <tr key={a.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-slate-600">{a.evaluateeId}</span> •{' '}
                          <span className="font-bold text-slate-800">{evaluatee?.fullName}</span>
                          <span className="text-[11px] text-slate-400 block">{evaluatee?.unit}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-slate-600">{a.evaluatorId}</span> •{' '}
                          <span className="font-bold text-slate-800">{evaluator?.fullName}</span>
                          <span className="text-[11px] text-slate-400 block">{evaluator?.position}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                              a.type === 'achievement'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {a.type === 'achievement' ? 'ผลสัมฤทธิ์ (70)' : 'พฤติกรรม (30)'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                          {a.weight}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteAssignment(a.id)}
                            className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition"
                            title="ลบการมอบหมายนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Rounds & Deadlines */}
      {activeTab === 'rounds' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Rounds List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>รอบการประเมินและวันปิดรับทั้งหมด</span>
            </h3>

            <div className="space-y-3">
              {periods.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{p.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        p.isOpen
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p.isOpen ? 'เปิดรับแบบประเมิน' : 'ปิดรอบแล้ว'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>ช่วงผลงาน: <strong>{p.workPeriod}</strong></div>
                    <div>
                      กำหนดปิดรับคำนวณอัตโนมัติ:{' '}
                      <strong>{formatThaiDate(p.autoDeadline)}</strong>
                    </div>
                    <div className="col-span-2">
                      วันปิดรับจริง (Effective Deadline):{' '}
                      <strong className="text-blue-700 font-bold">
                        {formatThaiDate(p.effectiveDeadline)}
                      </strong>
                    </div>
                  </div>

                  {/* Section 11.1: Publication Controls */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-700">การประกาศผลคะแนน:</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.isResultsPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.isResultsPublished ? 'ประกาศผลแล้ว' : 'ยังไม่ประกาศผล'}
                        </span>
                      </div>

                      {onPublishPeriod && (
                        <button
                          type="button"
                          onClick={() => onPublishPeriod(p.id, !p.isResultsPublished)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                            p.isResultsPublished
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          {p.isResultsPublished ? 'ยกเลิกประกาศผล' : 'กดประกาศผลการประเมิน'}
                        </button>
                      )}
                    </div>

                    {/* Section 11.1 Evaluator Details to Evaluatee Toggle */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                      <span>เปิดให้ผู้รับการประเมินเห็นคะแนนรายผู้ประเมิน:</span>
                      {onToggleShowEvaluatorDetails && (
                        <button
                          type="button"
                          onClick={() =>
                            onToggleShowEvaluatorDetails(
                              p.id,
                              !p.showEvaluatorDetailsToEvaluatee
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                            p.showEvaluatorDetailsToEvaluatee
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {p.showEvaluatorDetailsToEvaluatee ? 'เปิดแสดง' : 'ปิด (แสดงเฉพาะคะแนนรวม)'}
                        </button>
                      )}
                    </div>
                  </div>

                  {p.id === selectedRoundId && (
                    <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                      <input
                        type="date"
                        value={editingPeriodDeadline}
                        onChange={(e) => setEditingPeriodDeadline(e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleSaveDeadline}
                        className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        บันทึกการขยายเวลา
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Create New Round Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>สร้างรอบการประเมินใหม่</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              เมื่อสร้างรอบใหม่ ระบบจะคำนวณวันปิดรับอัตโนมัติ (วันศุกร์ของสัปดาห์ที่ 2)
              และคัดลอกการตั้งค่าผู้ประเมินและค่าน้ำหนักจากรอบก่อนหน้ามาใช้ทันที
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">รอบที่:</label>
                <select
                  value={newRoundNum}
                  onChange={(e) => setNewRoundNum(parseInt(e.target.value) as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  <option value={1}>รอบที่ 1: ก.ค. – ธ.ค.</option>
                  <option value={2}>รอบที่ 2: ม.ค. – มิ.ย.</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">ปี พ.ศ.:</label>
                <input
                  type="number"
                  value={newRoundYear}
                  onChange={(e) => setNewRoundYear(parseInt(e.target.value) || 2569)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                />
              </div>

              <button
                type="button"
                disabled={isCreatingRound}
                onClick={handleCreateNewRound}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition cursor-pointer"
              >
                สร้างรอบใหม่พร้อมคัดลอกการตั้งค่าผู้ประเมิน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Supervision Scopes (Section 14.1) */}
      {activeTab === 'scopes' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>ขอบเขตการกำกับดูแลของผู้บริหาร (Section 14.1 Supervision Scopes)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ตาราง supervision_scopes กำหนดขอบเขตข้อมูลที่ผู้บริหารแต่ละท่านสามารถดูภาพรวมพฤติกรรมได้
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 w-20">รหัส</th>
                  <th className="py-3 px-4 min-w-[180px]">ผู้บริหาร</th>
                  <th className="py-3 px-3">ตำแหน่ง</th>
                  <th className="py-3 px-3">ประเภทขอบเขต</th>
                  <th className="py-3 px-4 min-w-[220px]">บุคลากรที่อยู่ภายใต้การกำกับดูแล</th>
                  <th className="py-3 px-3">สิทธิ์การดูข้อมูล</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopes.map((s) => {
                  const exec = employees.find((e) => e.id === s.userId);
                  let scopeDesc = '';
                  if (s.scopeType === 'all') scopeDesc = 'บุคลากรทั้งคณะ (21 คน)';
                  else if (s.scopeType === 'unit') {
                    const unitEmps = employees.filter((e) => e.unitCode === s.unitCode && e.id !== 'U01');
                    scopeDesc = `กลุ่มงาน ${s.unitCode} (${unitEmps.map((e) => `${e.id} ${e.fullName}`).join(', ')})`;
                  } else if (s.scopeType === 'individual' && s.employeeIds) {
                    const indEmps = employees.filter((e) => s.employeeIds?.includes(e.id));
                    scopeDesc = `รายบุคคล: ${indEmps.map((e) => `${e.id} ${e.fullName}`).join(', ')}`;
                  }

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">{s.userId}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{exec?.fullName}</td>
                      <td className="py-3 px-3 text-slate-600">{exec?.position}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-[10px] text-slate-700">
                          {s.scopeType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-[11px] leading-relaxed">
                        {scopeDesc}
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        {s.userId === 'E05' ? (
                          <span className="text-teal-700 font-semibold">
                            ดูคะแนนรวมและสมรรถนะ (Read-only)
                          </span>
                        ) : s.userId === 'U01' || s.userId === 'E01' ? (
                          <span className="text-blue-700 font-semibold">
                            เห็นทั้งหมดและคะแนนรายผู้ประเมิน
                          </span>
                        ) : (
                          <span className="text-slate-600 font-semibold">
                            เห็นคะแนนรวมถ่วงน้ำหนักในกลุ่มงาน
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Criteria & Rubrics (Section 12.1) */}
      {activeTab === 'criteria' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>เกณฑ์การประเมินรายข้อ (Section 12.1 Criteria & Rubric Levels 1–5)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดงเกณฑ์การประเมินผลสัมฤทธิ์ (70) และพฤติกรรม (30) พร้อมคำอธิบายระดับ 1 ถึง 5
            </p>
          </div>

          <div className="space-y-4">
            {criteriaList.map((crit) => (
              <div
                key={crit.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-white px-2.5 py-0.5 rounded-md border border-slate-200 text-slate-800">
                      {crit.code}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{crit.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        crit.category === 'achievement'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {crit.category === 'achievement' ? 'ผลสัมฤทธิ์ (70)' : 'พฤติกรรม (30)'}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      น้ำหนัก {crit.weight}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">{crit.description}</p>

                {/* Rubric Levels */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-200">
                  {crit.levels.map((lvl) => (
                    <div
                      key={lvl.level}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1"
                    >
                      <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">
                          {lvl.level}
                        </span>
                        <span>{lvl.title}</span>
                      </div>
                      <p className="text-slate-500 text-[10px] leading-relaxed">
                        {lvl.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Unlock Individual Evaluatees */}
      {activeTab === 'unlocks' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Unlock className="w-4 h-4 text-amber-600" />
              <span>การเปิดสิทธิ์แก้ไขเป็นรายคนหลังวันปิดรับ (Individual Override)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              super_admin สามารถปลดล็อกให้บุคลากรรายบุคคลแก้ไขข้อมูลหรือส่งเพิ่มเติมได้แม้รอบจะปิดแล้ว
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {evaluateeEmployees.map((emp) => {
              const isUnlocked = currentPeriod.unlockedEmployeeIds?.includes(emp.id);

              return (
                <div
                  key={emp.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">
                      {emp.id}: {emp.fullName}
                    </div>
                    <div className="text-[11px] text-slate-500">{emp.unit}</div>
                  </div>

                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => onLockEmployee(currentPeriod.id, emp.id)}
                      className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5 text-amber-700" />
                      <span>ปลดล็อกอยู่ (ล็อกกลับ)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUnlockEmployee(currentPeriod.id, emp.id)}
                      className="text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>เปิดให้แก้ไข</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>ประวัติการแก้ไขคะแนนและการตั้งค่าทั้งหมด (Audit Trail)</span>
            </h3>
            <span className="text-xs text-slate-500">บันทึก {auditLogs.length} รายการ</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="py-2.5 px-3">วัน-เวลา</th>
                  <th className="py-2.5 px-3">ผู้ดำเนินการ</th>
                  <th className="py-2.5 px-3">การกระทำ</th>
                  <th className="py-2.5 px-3">เป้าหมาย</th>
                  <th className="py-2.5 px-3">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {formatThaiDateTime(log.timestamp)}
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-bold text-slate-800">{log.actorName}</span>
                      <span className="text-slate-400 block text-[10px]">{log.actorEmail}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-blue-100 text-blue-800 font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-700">{log.target}</td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: Overall Summary Guide Editor (Section 14.7) */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Prompt Section 14.7: User Manual Content Management</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                จัดการเนื้อหาคู่มือการใช้งานหน้าสรุปผลคะแนนภาพรวม
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Super Admin สามารถแก้ไขข้อความคู่มือที่จะแสดงผลในแผงพับเปิด/ปิด (collapsible panel)
                บนหน้าสรุปผลคะแนนภาพรวม (Section 14) ให้กับคณบดีและผู้บริหารได้ตามต้องการ
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleResetGuideToDefault}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                คืนค่าเริ่มต้น
              </button>
              <button
                type="button"
                onClick={handleSaveGuide}
                disabled={isSavingGuide}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingGuide ? 'กำลังบันทึก...' : 'บันทึกการแก้ไขคู่มือ'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Field 1: columnsMeaning */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                1. ความหมายของแต่ละช่อง (70 / 30 / 100)
              </label>
              <p className="text-[11px] text-slate-500">
                อธิบายรายละเอียดของทั้ง 4 คอลัมน์ในตารางสรุปผล
              </p>
              <textarea
                rows={4}
                value={guideForm.columnsMeaning}
                onChange={(e) =>
                  setGuideForm({ ...guideForm, columnsMeaning: e.target.value })
                }
                className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 bg-slate-50 text-slate-800 font-sans leading-relaxed"
              />
            </div>

            {/* Field 2: calculationMethod */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                2. สูตรการคำนวณคะแนนถ่วงน้ำหนัก
              </label>
              <p className="text-[11px] text-slate-500">
                สูตรคำนวณถ่วงน้ำหนักจากผู้ประเมินหลายท่าน และการหารด้วยผลรวมน้ำหนักเสมอ
              </p>
              <textarea
                rows={4}
                value={guideForm.calculationMethod}
                onChange={(e) =>
                  setGuideForm({ ...guideForm, calculationMethod: e.target.value })
                }
                className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 bg-slate-50 text-slate-800 font-sans leading-relaxed"
              />
            </div>

            {/* Field 3: sortingRules */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                3. เกณฑ์การจัดลำดับ (ข้อ 14.5)
              </label>
              <p className="text-[11px] text-slate-500">
                ลำดับความสำคัญในการจัดเรียง: คะแนนรวมมากไปน้อย, คะแนนผลสัมฤทธิ์, ก–ฮ, และรอประเมินอยู่ท้ายสุด
              </p>
              <textarea
                rows={4}
                value={guideForm.sortingRules}
                onChange={(e) =>
                  setGuideForm({ ...guideForm, sortingRules: e.target.value })
                }
                className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 bg-slate-50 text-slate-800 font-sans leading-relaxed"
              />
            </div>

            {/* Field 4: pendingMeaning */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                4. ความหมายของสถานะ "รอประเมิน (x/y)"
              </label>
              <p className="text-[11px] text-slate-500">
                เหตุผลที่ไม่แสดงค่า 0.00 และความหมายของความคืบหน้าผู้ประเมิน
              </p>
              <textarea
                rows={4}
                value={guideForm.pendingMeaning}
                onChange={(e) =>
                  setGuideForm({ ...guideForm, pendingMeaning: e.target.value })
                }
                className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 bg-slate-50 text-slate-800 font-sans leading-relaxed"
              />
            </div>

            {/* Field 5: filterAndExport */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                5. วิธีการกรองข้อมูล การคลิกดูรายบุคคล และการส่งออก
              </label>
              <p className="text-[11px] text-slate-500">
                การคลิกชื่อเพื่อเชื่อมโยงไปยังหน้ารายงานรายบุคคล และการส่งออก PDF / Excel
              </p>
              <textarea
                rows={4}
                value={guideForm.filterAndExport}
                onChange={(e) =>
                  setGuideForm({ ...guideForm, filterAndExport: e.target.value })
                }
                className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 bg-slate-50 text-slate-800 font-sans leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
