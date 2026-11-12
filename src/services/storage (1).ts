import {
  AuditLogEntry,
  Criteria,
  Employee,
  Evaluation,
  EvaluationPeriod,
  EvaluatorAssignment,
  EvaluatorScoreRecord,
  ItemScore,
  OverallSummaryGuideContent,
  SupervisionScope,
} from '../types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_PERIODS,
  createDefaultCompetencies,
  createDefaultCriteria,
  createDefaultEvaluatorAssignments,
  createDefaultSupervisionScopes,
  createInitialEvaluations,
} from '../data/seedData';
import { createRoundConfig } from '../lib/dateUtils';
import { calculateScoresFromCriteriaItems } from '../lib/criteriaScoring';

export interface StorageService {
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | null>;
  upsertEmployee(employee: Employee): Promise<Employee>;
  getPeriods(): Promise<EvaluationPeriod[]>;
  savePeriod(period: EvaluationPeriod): Promise<void>;
  createPeriod(roundNumber: 1 | 2, thaiYear: number): Promise<EvaluationPeriod>;
  unlockEmployeeForPeriod(periodId: string, employeeId: string): Promise<void>;
  lockEmployeeForPeriod(periodId: string, employeeId: string): Promise<void>;
  publishPeriodResults(periodId: string, isPublished: boolean): Promise<EvaluationPeriod>;
  toggleShowEvaluatorDetails(periodId: string, show: boolean): Promise<EvaluationPeriod>;
  getEvaluatorAssignments(roundId: string): Promise<EvaluatorAssignment[]>;
  getAllAssignments(): Promise<EvaluatorAssignment[]>;
  saveEvaluatorAssignments(roundId: string, assignments: EvaluatorAssignment[]): Promise<void>;
  getSupervisionScopes(roundId: string): Promise<SupervisionScope[]>;
  saveSupervisionScopes(roundId: string, scopes: SupervisionScope[]): Promise<void>;
  getCriteria(roundId: string, employeeId?: string): Promise<Criteria[]>;
  saveCriteria(roundId: string, criteriaList: Criteria[]): Promise<void>;
  getEvaluation(employeeId: string, periodId: string): Promise<Evaluation | null>;
  getAllEvaluations(): Promise<Record<string, Evaluation>>;
  saveEvaluation(evaluation: Evaluation): Promise<void>;
  submitEvaluation(employeeId: string, periodId: string): Promise<Evaluation>;
  saveEvaluatorScore(
    evaluateeId: string,
    periodId: string,
    evaluatorId: string,
    score: EvaluatorScoreRecord
  ): Promise<Evaluation>;
  saveItemScore(
    score: ItemScore,
    targetEmployeeId: string,
    periodId: string
  ): Promise<Evaluation>;
  copyKpisFromPrevious(
    employeeId: string,
    currentPeriodId: string,
    previousPeriodId: string
  ): Promise<Evaluation>;
  getAuditLogs(): Promise<AuditLogEntry[]>;
  addAuditLog(actorEmail: string, actorName: string, action: string, target: string, details: string): Promise<void>;
  getOverallSummaryGuide(): Promise<OverallSummaryGuideContent>;
  saveOverallSummaryGuide(content: OverallSummaryGuideContent): Promise<void>;
  exportData(): string;
  importData(jsonData: string): boolean;
  resetToSeed(): Promise<void>;
}

export const DEFAULT_OVERALL_SUMMARY_GUIDE: OverallSummaryGuideContent = {
  columnsMeaning: `ช่อง 1: ชื่อ-นามสกุล บุคลากรผู้รับการประเมิน พร้อมแสดงตำแหน่งและกลุ่มงาน\nช่อง 2: ผลสัมฤทธิ์ของงาน (เต็ม 70 คะแนน) คำนวณจากคะแนนเฉลี่ยถ่วงน้ำหนักของผู้ประเมินทุกท่านในส่วนผลสัมฤทธิ์\nช่อง 3: พฤติกรรมการปฏิบัติงาน (เต็ม 30 คะแนน) คำนวณจากคะแนนเฉลี่ยถ่วงน้ำหนักของผู้ประเมินทุกท่านในส่วนพฤติกรรม\nช่อง 4: คะแนนรวม (เต็ม 100 คะแนน) ผลรวมของผลสัมฤทธิ์ของงาน (70) และพฤติกรรมการปฏิบัติงาน (30)`,
  calculationMethod: `สูตรคำนวณคะแนนถ่วงน้ำหนัก:\n• คะแนนส่วน = Σ(คะแนนจากผู้ประเมิน × ค่าน้ำหนัก) / Σ(ค่าน้ำหนัก)\n• คะแนนรวม (100) = คะแนนผลสัมฤทธิ์ (เต็ม 70) + คะแนนพฤติกรรม (เต็ม 30)\n• ระบบคำนวณอัตโนมัติ (read-only) แสดงทศนิยม 2 ตำแหน่ง พร้อมรองรับกรณีผลรวมน้ำหนักไม่เท่ากับ 100%`,
  sortingRules: `เกณฑ์การจัดเรียงลำดับตาราง:\n1. เรียงตามคะแนนรวม (ช่อง 4) จากมากไปน้อย\n2. หากคะแนนรวมเท่ากัน ให้เรียงตามคะแนนผลสัมฤทธิ์ (ช่อง 2) จากมากไปน้อย\n3. หากยังเท่ากันอีก ให้เรียงตามลำดับตัวอักษรชื่อภาษาไทย (ก–ฮ)\n4. รายการที่ยัง "รอประเมิน" (ผู้ประเมินยังส่งคะแนนไม่ครบ) จะถูกจัดให้อยู่ท้ายตารางเสมอ`,
  pendingMeaning: `ความหมายของสถานะ "รอประเมิน (x/y)":\nหากผู้ประเมินยังประเมินไม่ครบทุกคนในส่วนนั้น ระบบจะแสดงสถานะ "รอประเมิน (x/y)" แทนคะแนน (เช่น รอประเมิน (1/2) หมายถึงมีผู้ประเมินส่งแล้ว 1 ท่าน จากทั้งหมด 2 ท่าน) โดยจะไม่แสดงเป็น 0.00 เพื่อป้องกันความเข้าใจผิด\nหากส่วนใดส่วนหนึ่งยังไม่ครบ ช่อง 4 (คะแนนรวม) จะแสดงสถานะ "รอประเมิน"`,
  filterAndExport: `การกรองและการใช้งานร่วม:\n• ตัวกรองรอบการประเมิน (ค่าเริ่มต้นคือรอบปัจจุบัน) และกลุ่มงาน (ค่าเริ่มต้นคือทุกกลุ่มงาน)\n• คลิกที่ชื่อผู้รับการประเมินเพื่อเปิดดูหน้ารายงานผลคะแนนรายบุคคล (ข้อ 13)\n• ส่งออกรายงานได้ทั้ง PDF (พร้อมจัดหน้าพิมพ์ A4) และ Excel / CSV ตามลำดับที่แสดงผลบนหน้าจอ`,
};

const STORAGE_KEYS = {
  EMPLOYEES: 'nu_pms_employees_v3',
  PERIODS: 'nu_pms_periods_v3',
  EVALUATIONS: 'nu_pms_evaluations_v3',
  ASSIGNMENTS: 'nu_pms_evaluator_assignments_v3',
  AUDIT_LOGS: 'nu_pms_audit_logs_v3',
  SUPERVISION_SCOPES: 'nu_pms_supervision_scopes_v3',
  CRITERIA: 'nu_pms_criteria_v3',
  OVERALL_SUMMARY_GUIDE: 'nu_pms_overall_summary_guide_v3',
};

class LocalStorageService implements StorageService {
  private initialized = false;

  private init() {
    if (this.initialized) return;

    if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    }

    if (!localStorage.getItem(STORAGE_KEYS.PERIODS)) {
      localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(INITIAL_PERIODS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
      const allAssignments: EvaluatorAssignment[] = [];
      INITIAL_PERIODS.forEach((p) => {
        allAssignments.push(...createDefaultEvaluatorAssignments(p.id));
      });
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(allAssignments));
    }

    // One-time migration: หน่วยงานของผู้บริหาร E01–E05 = คณะโลจิสติกส์และดิจิทัลซัพพลายเชน
    const EXEC_UNIT_MIGRATION_KEY = 'nu_pms_migration_exec_unit_faculty';
    if (!localStorage.getItem(EXEC_UNIT_MIGRATION_KEY)) {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
        if (raw) {
          const list: Employee[] = JSON.parse(raw);
          const updated = list.map((e) =>
            ['E01', 'E02', 'E03', 'E04', 'E05'].includes(e.id) && e.unit === 'สำนักงานเลขานุการ'
              ? { ...e, unit: 'คณะโลจิสติกส์และดิจิทัลซัพพลายเชน' }
              : e
          );
          localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updated));
        }
      } catch (err) {
        console.error('Executive unit migration failed:', err);
      }
      localStorage.setItem(EXEC_UNIT_MIGRATION_KEY, 'done');
    }

    // One-time migration: น้ำหนักพฤติกรรมของ U01 จากรองคณบดี E02–E05 เปลี่ยนจาก 25% เป็น 7.5% (รวม 100%)
    const U01_WEIGHT_MIGRATION_KEY = 'nu_pms_migration_u01_beh_weight_7_5';
    if (!localStorage.getItem(U01_WEIGHT_MIGRATION_KEY)) {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
        if (raw) {
          const list: EvaluatorAssignment[] = JSON.parse(raw);
          const updated = list.map((a) =>
            a.evaluateeId === 'U01' &&
            a.type === 'behavior' &&
            ['E02', 'E03', 'E04', 'E05'].includes(a.evaluatorId) &&
            a.weight === 25
              ? { ...a, weight: 7.5 }
              : a
          );
          localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));
        }
      } catch (err) {
        console.error('U01 weight migration failed:', err);
      }
      localStorage.setItem(U01_WEIGHT_MIGRATION_KEY, 'done');
    }

    if (!localStorage.getItem(STORAGE_KEYS.SUPERVISION_SCOPES)) {
      const allScopes: SupervisionScope[] = [];
      INITIAL_PERIODS.forEach((p) => {
        allScopes.push(...createDefaultSupervisionScopes(p.id));
      });
      localStorage.setItem(STORAGE_KEYS.SUPERVISION_SCOPES, JSON.stringify(allScopes));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CRITERIA)) {
      const allCriteria: Criteria[] = [];
      INITIAL_PERIODS.forEach((p) => {
        allCriteria.push(...createDefaultCriteria(p.id));
      });
      localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(allCriteria));
    }

    if (!localStorage.getItem(STORAGE_KEYS.EVALUATIONS)) {
      const initialEvals = createInitialEvaluations();
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(initialEvals));
    }

    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      const initialLogs: AuditLogEntry[] = [
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          actorEmail: 'anuwatr@nu.ac.th',
          actorName: 'อนุวัทย์ เรืองจันทร์',
          action: 'INITIALIZE_SYSTEM',
          target: 'ระบบประเมินผล PMS',
          details: 'เริ่มต้นระบบและโหลดข้อมูลบุคลากร 21 คนและตารางผู้ประเมินถ่วงน้ำหนัก',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialLogs));
    }

    this.initialized = true;
  }

  async getEmployees(): Promise<Employee[]> {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    const emps: Employee[] = data ? JSON.parse(data) : INITIAL_EMPLOYEES;
    return emps;
  }

  async upsertEmployee(employee: Employee): Promise<Employee> {
    this.init();
    const employees = await this.getEmployees();
    const existingIndex = employees.findIndex(
      (e) =>
        e.id === employee.id ||
        (e.email && employee.email && e.email.toLowerCase() === employee.email.toLowerCase())
    );

    if (existingIndex >= 0) {
      employees[existingIndex] = { ...employees[existingIndex], ...employee };
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
      return employees[existingIndex];
    } else {
      employees.push(employee);
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
      return employee;
    }
  }

  async getEmployee(id: string): Promise<Employee | null> {
    const employees = await this.getEmployees();
    return employees.find((e) => e.id === id) || null;
  }

  async getPeriods(): Promise<EvaluationPeriod[]> {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.PERIODS);
    return data ? JSON.parse(data) : INITIAL_PERIODS;
  }

  async savePeriod(period: EvaluationPeriod): Promise<void> {
    this.init();
    const periods = await this.getPeriods();
    const idx = periods.findIndex((p) => p.id === period.id);
    if (idx >= 0) {
      periods[idx] = period;
    } else {
      periods.push(period);
    }
    localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(periods));
  }

  async createPeriod(roundNumber: 1 | 2, thaiYear: number): Promise<EvaluationPeriod> {
    this.init();
    const periods = await this.getPeriods();
    const newPeriod = createRoundConfig(roundNumber, thaiYear);

    // Copy evaluator assignments from most recent previous round
    const existingAssignments = await this.getAllAssignments();
    const previousRound = periods[periods.length - 1];
    let newAssignments: EvaluatorAssignment[] = [];

    if (previousRound) {
      const prevAssignments = existingAssignments.filter((a) => a.roundId === previousRound.id);
      newAssignments = prevAssignments.map((a, i) => ({
        ...a,
        id: `ea-${newPeriod.id}-${i + 1}`,
        roundId: newPeriod.id,
      }));
    } else {
      newAssignments = createDefaultEvaluatorAssignments(newPeriod.id);
    }

    periods.push(newPeriod);
    localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(periods));

    const combinedAssignments = [...existingAssignments, ...newAssignments];
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(combinedAssignments));

    await this.addAuditLog(
      'system',
      'System Admin',
      'CREATE_ROUND',
      newPeriod.label,
      `สร้างรอบการประเมินใหม่ และคัดลอกการตั้งค่าผู้ประเมิน ${newAssignments.length} รายการ`
    );

    return newPeriod;
  }

  async unlockEmployeeForPeriod(periodId: string, employeeId: string): Promise<void> {
    const periods = await this.getPeriods();
    const period = periods.find((p) => p.id === periodId);
    if (period) {
      const unlocked = new Set(period.unlockedEmployeeIds || []);
      unlocked.add(employeeId);
      period.unlockedEmployeeIds = Array.from(unlocked);
      await this.savePeriod(period);

      await this.addAuditLog(
        'super_admin',
        'Super Admin',
        'UNLOCK_EMPLOYEE',
        employeeId,
        `ปลดล็อกให้แก้ไขแบบประเมินเป็นรายคนในรอบ ${period.label}`
      );
    }
  }

  async lockEmployeeForPeriod(periodId: string, employeeId: string): Promise<void> {
    const periods = await this.getPeriods();
    const period = periods.find((p) => p.id === periodId);
    if (period && period.unlockedEmployeeIds) {
      period.unlockedEmployeeIds = period.unlockedEmployeeIds.filter((id) => id !== employeeId);
      await this.savePeriod(period);
    }
  }

  async publishPeriodResults(periodId: string, isPublished: boolean): Promise<EvaluationPeriod> {
    const periods = await this.getPeriods();
    const period = periods.find((p) => p.id === periodId);
    if (!period) throw new Error(`ไม่พบรอบการประเมิน ${periodId}`);

    period.isResultsPublished = isPublished;
    await this.savePeriod(period);

    await this.addAuditLog(
      'super_admin',
      'Super Admin',
      isPublished ? 'PUBLISH_RESULTS' : 'UNPUBLISH_RESULTS',
      period.label,
      isPublished
        ? 'ประกาศผลการประเมินอย่างเป็นทางการ ผู้รับการประเมินสามารถดูคะแนนสรุปได้'
        : 'ยกเลิกการประกาศผลการประเมิน'
    );

    return period;
  }

  async toggleShowEvaluatorDetails(periodId: string, show: boolean): Promise<EvaluationPeriod> {
    const periods = await this.getPeriods();
    const period = periods.find((p) => p.id === periodId);
    if (!period) throw new Error(`ไม่พบรอบการประเมิน ${periodId}`);

    period.showEvaluatorDetailsToEvaluatee = show;
    await this.savePeriod(period);

    await this.addAuditLog(
      'super_admin',
      'Super Admin',
      'TOGGLE_EVALUATOR_DETAILS',
      period.label,
      show
        ? 'เปิดให้ผู้รับการประเมินเห็นรายละเอียดคะแนนรายผู้ประเมิน'
        : 'ปิดการแสดงรายละเอียดคะแนนรายผู้ประเมิน (แสดงเฉพาะคะแนนรวมถ่วงน้ำหนัก)'
    );

    return period;
  }

  async getSupervisionScopes(roundId: string): Promise<SupervisionScope[]> {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.SUPERVISION_SCOPES);
    const allScopes: SupervisionScope[] = data ? JSON.parse(data) : [];
    const filtered = allScopes.filter((s) => s.roundId === roundId);
    if (filtered.length === 0) {
      const generated = createDefaultSupervisionScopes(roundId);
      const combined = [...allScopes, ...generated];
      localStorage.setItem(STORAGE_KEYS.SUPERVISION_SCOPES, JSON.stringify(combined));
      return generated;
    }
    return filtered;
  }

  async saveSupervisionScopes(roundId: string, scopes: SupervisionScope[]): Promise<void> {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.SUPERVISION_SCOPES);
    const allScopes: SupervisionScope[] = data ? JSON.parse(data) : [];
    const others = allScopes.filter((s) => s.roundId !== roundId);
    const combined = [...others, ...scopes];
    localStorage.setItem(STORAGE_KEYS.SUPERVISION_SCOPES, JSON.stringify(combined));

    await this.addAuditLog(
      'super_admin',
      'Super Admin',
      'UPDATE_SUPERVISION_SCOPES',
      roundId,
      `ปรับปรุงขอบเขตการกำกับดูแลผู้บริหาร (supervision_scopes) ${scopes.length} รายการ`
    );
  }

  async getCriteria(roundId: string, employeeId?: string): Promise<Criteria[]> {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.CRITERIA);
    const allCriteria: Criteria[] = data ? JSON.parse(data) : [];
    const filtered = allCriteria.filter((c) => {
      if (c.roundId !== roundId) return false;
      if (c.employeeId && employeeId && c.employeeId !== employeeId) return false;
      return true;
    });

    if (filtered.length === 0) {
      const generated = createDefaultCriteria(roundId, employeeId);
      const combined = [...allCriteria, ...generated];
      localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(combined));
      return generated;
    }
    return filtered;
  }

  async saveCriteria(roundId: string, criteriaList: Criteria[]): Promise<void> {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.CRITERIA);
    const allCriteria: Criteria[] = data ? JSON.parse(data) : [];
    const others = allCriteria.filter((c) => c.roundId !== roundId);
    const combined = [...others, ...criteriaList];
    localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(combined));

    await this.addAuditLog(
      'super_admin',
      'Super Admin',
      'UPDATE_CRITERIA',
      roundId,
      `ปรับปรุงเกณฑ์การประเมินรายข้อ (Criteria) ${criteriaList.length} รายการ`
    );
  }

  async getAllAssignments(): Promise<EvaluatorAssignment[]> {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return data ? JSON.parse(data) : [];
  }

  async getEvaluatorAssignments(roundId: string): Promise<EvaluatorAssignment[]> {
    const all = await this.getAllAssignments();
    const filtered = all.filter((a) => a.roundId === roundId);
    if (filtered.length === 0) {
      const generated = createDefaultEvaluatorAssignments(roundId);
      const combined = [...all, ...generated];
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(combined));
      return generated;
    }
    return filtered;
  }

  async saveEvaluatorAssignments(roundId: string, assignments: EvaluatorAssignment[]): Promise<void> {
    this.init();
    const all = await this.getAllAssignments();
    const others = all.filter((a) => a.roundId !== roundId);
    const combined = [...others, ...assignments];
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(combined));

    await this.addAuditLog(
      'super_admin',
      'Super Admin',
      'UPDATE_EVALUATOR_ASSIGNMENTS',
      roundId,
      `ปรับปรุงการมอบหมายและค่าน้ำหนักผู้ประเมิน (${assignments.length} รายการ)`
    );
  }

  async getAllEvaluations(): Promise<Record<string, Evaluation>> {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    return data ? JSON.parse(data) : {};
  }

  async getEvaluation(employeeId: string, periodId: string): Promise<Evaluation | null> {
    this.init();
    const evals = await this.getAllEvaluations();
    const compoundKey = `${employeeId}_${periodId}`;
    if (evals[compoundKey]) return evals[compoundKey];

    const employee = await this.getEmployee(employeeId);
    if (!employee) return null;

    // Prompt Section B2.1: Executives E01–E05 are evaluators only and have no evaluation forms
    if (employeeId.startsWith('E')) {
      return null;
    }

    const roundNum = periodId.endsWith('-R2') ? 2 : 1;
    const newEval: Evaluation = {
      id: `eval-${employeeId}-${periodId}`,
      employeeId,
      periodId,
      kpis: [],
      competencies: createDefaultCompetencies(employee.position, roundNum),
      formStatus: 'ยังไม่บันทึก',
      updatedAt: new Date().toISOString(),
      evaluatorScores: {},
    };

    evals[compoundKey] = newEval;
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evals));
    return newEval;
  }

  async saveEvaluation(evaluation: Evaluation): Promise<void> {
    this.init();
    const evals = await this.getAllEvaluations();
    const compoundKey = `${evaluation.employeeId}_${evaluation.periodId}`;
    evals[compoundKey] = {
      ...evaluation,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evals));
  }

  async submitEvaluation(employeeId: string, periodId: string): Promise<Evaluation> {
    const evaluation = await this.getEvaluation(employeeId, periodId);
    if (!evaluation) throw new Error('Evaluation not found');

    const updated: Evaluation = {
      ...evaluation,
      formStatus: 'ส่งแล้ว',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.saveEvaluation(updated);

    const emp = await this.getEmployee(employeeId);
    await this.addAuditLog(
      emp?.email || employeeId,
      emp?.fullName || employeeId,
      'SUBMIT_SELF_EVALUATION',
      `รอบ ${periodId}`,
      'ผู้รับการประเมินส่งแบบประเมินตนเองเข้าสู่ระบบ'
    );

    return updated;
  }

  async saveEvaluatorScore(
    evaluateeId: string,
    periodId: string,
    evaluatorId: string,
    score: EvaluatorScoreRecord
  ): Promise<Evaluation> {
    const evaluation = await this.getEvaluation(evaluateeId, periodId);
    if (!evaluation) throw new Error('Evaluation not found');

    const scores = evaluation.evaluatorScores || {};
    scores[evaluatorId] = {
      ...score,
      submittedAt: new Date().toISOString(),
    };

    const updated: Evaluation = {
      ...evaluation,
      evaluatorScores: scores,
      updatedAt: new Date().toISOString(),
    };

    await this.saveEvaluation(updated);

    const evaluator = await this.getEmployee(evaluatorId);
    const evaluatee = await this.getEmployee(evaluateeId);

    await this.addAuditLog(
      evaluator?.email || evaluatorId,
      evaluator?.fullName || evaluatorId,
      'SUBMIT_EVALUATOR_SCORE',
      evaluatee?.fullName || evaluateeId,
      `บันทึกคะแนนตรวจสอบ: ผลสัมฤทธิ์=${score.achievementScore}, พฤติกรรม=${score.behaviorScore}`
    );

    return updated;
  }

  async saveItemScore(
    score: ItemScore,
    targetEmployeeId: string,
    periodId: string
  ): Promise<Evaluation> {
    const evaluation = await this.getEvaluation(targetEmployeeId, periodId);
    if (!evaluation) throw new Error('Evaluation not found');

    const itemScores = { ...(evaluation.itemScores || {}) };
    const itemKey = `${score.criteriaId}_${score.raterId}`;
    itemScores[itemKey] = {
      ...score,
      updatedAt: new Date().toISOString(),
    };

    // If evaluator scored this item, automatically recalculate category score
    // according to Section 12.4 & Section 13 (Automated Read-Only Summary)
    const criteriaList = await this.getCriteria(periodId, targetEmployeeId);

    if (score.raterType === 'evaluator') {
      const calcResult = calculateScoresFromCriteriaItems(criteriaList, itemScores, score.raterId);
      const scores = { ...(evaluation.evaluatorScores || {}) };
      const prevRecord = scores[score.raterId] || {
        evaluatorId: score.raterId,
        achievementScore: 0,
        behaviorScore: 0,
      };

      scores[score.raterId] = {
        ...prevRecord,
        achievementScore: calcResult.achievementScore,
        behaviorScore: calcResult.behaviorScore,
        submittedAt: new Date().toISOString(),
        comment: score.comment || prevRecord.comment,
      };
      evaluation.evaluatorScores = scores;
    }

    const updated: Evaluation = {
      ...evaluation,
      itemScores,
      updatedAt: new Date().toISOString(),
    };

    await this.saveEvaluation(updated);

    return updated;
  }

  async copyKpisFromPrevious(
    employeeId: string,
    currentPeriodId: string,
    previousPeriodId: string
  ): Promise<Evaluation> {
    const prevEval = await this.getEvaluation(employeeId, previousPeriodId);
    if (!prevEval || prevEval.kpis.length === 0) {
      throw new Error('ไม่พบข้อมูล KPI ในรอบการประเมินก่อนหน้า');
    }

    const currentEval = await this.getEvaluation(employeeId, currentPeriodId);
    if (!currentEval) throw new Error('ไม่พบแบบประเมินรอบปัจจุบัน');

    const copiedKpis = prevEval.kpis.map((k, idx) => ({
      ...k,
      id: `kpi-copy-${Date.now()}-${idx}`,
      status: 'ยังไม่ดำเนินการ' as const,
      actualValue: '',
      selfLevel: null,
      evidence: { note: '', links: [] },
      updatedAt: new Date().toISOString(),
    }));

    const updated: Evaluation = {
      ...currentEval,
      kpis: copiedKpis,
      formStatus: 'ร่าง',
      updatedAt: new Date().toISOString(),
    };

    await this.saveEvaluation(updated);

    const emp = await this.getEmployee(employeeId);
    await this.addAuditLog(
      emp?.email || employeeId,
      emp?.fullName || employeeId,
      'COPY_KPIS',
      `จาก ${previousPeriodId} สู่ ${currentPeriodId}`,
      `คัดลอกตัวชี้วัด ${copiedKpis.length} รายการ`
    );

    return updated;
  }

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : [];
  }

  async addAuditLog(
    actorEmail: string,
    actorName: string,
    action: string,
    target: string,
    details: string
  ): Promise<void> {
    this.init();
    const logs = await this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      actorEmail,
      actorName,
      action,
      target,
      details,
    };
    logs.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 500)));
  }

  async getOverallSummaryGuide(): Promise<OverallSummaryGuideContent> {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.OVERALL_SUMMARY_GUIDE);
    if (!data) return DEFAULT_OVERALL_SUMMARY_GUIDE;
    try {
      return { ...DEFAULT_OVERALL_SUMMARY_GUIDE, ...JSON.parse(data) };
    } catch {
      return DEFAULT_OVERALL_SUMMARY_GUIDE;
    }
  }

  async saveOverallSummaryGuide(content: OverallSummaryGuideContent): Promise<void> {
    this.init();
    localStorage.setItem(STORAGE_KEYS.OVERALL_SUMMARY_GUIDE, JSON.stringify(content));
    await this.addAuditLog(
      'super_admin',
      'Super Admin',
      'UPDATE_OVERALL_SUMMARY_GUIDE',
      'คู่มือหน้าสรุปภาพรวม',
      'ปรับปรุงเนื้อหาคู่มือการใช้งานหน้าสรุปผลคะแนนภาพรวม'
    );
  }

  exportData(): string {
    this.init();
    const payload = {
      employees: localStorage.getItem(STORAGE_KEYS.EMPLOYEES),
      periods: localStorage.getItem(STORAGE_KEYS.PERIODS),
      evaluations: localStorage.getItem(STORAGE_KEYS.EVALUATIONS),
      assignments: localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS),
      scopes: localStorage.getItem(STORAGE_KEYS.SUPERVISION_SCOPES),
      criteria: localStorage.getItem(STORAGE_KEYS.CRITERIA),
      guide: localStorage.getItem(STORAGE_KEYS.OVERALL_SUMMARY_GUIDE),
      auditLogs: localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS),
      version: 'v3',
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const payload = JSON.parse(jsonData);
      if (payload.employees) localStorage.setItem(STORAGE_KEYS.EMPLOYEES, payload.employees);
      if (payload.periods) localStorage.setItem(STORAGE_KEYS.PERIODS, payload.periods);
      if (payload.evaluations) localStorage.setItem(STORAGE_KEYS.EVALUATIONS, payload.evaluations);
      if (payload.assignments) localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, payload.assignments);
      if (payload.scopes) localStorage.setItem(STORAGE_KEYS.SUPERVISION_SCOPES, payload.scopes);
      if (payload.criteria) localStorage.setItem(STORAGE_KEYS.CRITERIA, payload.criteria);
      if (payload.guide) localStorage.setItem(STORAGE_KEYS.OVERALL_SUMMARY_GUIDE, payload.guide);
      if (payload.auditLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, payload.auditLogs);
      this.initialized = false;
      this.init();
      return true;
    } catch {
      return false;
    }
  }

  async resetToSeed(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.PERIODS);
    localStorage.removeItem(STORAGE_KEYS.EVALUATIONS);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.SUPERVISION_SCOPES);
    localStorage.removeItem(STORAGE_KEYS.CRITERIA);
    localStorage.removeItem(STORAGE_KEYS.OVERALL_SUMMARY_GUIDE);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    this.initialized = false;
    this.init();
  }
}

export const storageService = new LocalStorageService();
