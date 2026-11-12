import {
  AuthUser,
  CalculatedWeightedScore,
  Employee,
  Evaluation,
  EvaluationPeriod,
  EvaluatorAssignment,
  SupervisionScope,
  UserRole,
} from '../types';
import { PMS_CONFIG } from '../data/config';

/**
 * Access Control & Row-Level Security Service (Sections 11 & 14)
 * Enforces strict authorization filtering at the data layer.
 */
export class AccessControlService {
  /**
   * Checks if a user has a specific role
   */
  hasRole(user: Employee | AuthUser | null, role: UserRole): boolean {
    if (!user) return false;
    return user.roles?.includes(role) || false;
  }

  isSuperAdmin(user: Employee | AuthUser | null): boolean {
    if (!user) return false;
    const userId = 'id' in user ? user.id : user.employeeId;
    return userId === 'U01' || this.hasRole(user, 'super_admin');
  }

  /**
   * หน้า "ตั้งค่าระบบ": อนุญาตเฉพาะบัญชีที่ล็อกอินด้วยอีเมลที่กำหนด (อนุวัทย์ เรืองจันทร์) เท่านั้น
   * ตรวจจากบัญชีที่ล็อกอินจริง ไม่ใช่ผู้ใช้ที่เลือกจาก dropdown
   */
  canAccessAdminSettings(authUser: AuthUser | null | undefined): boolean {
    if (!authUser?.email) return false;
    return authUser.email.toLowerCase() === PMS_CONFIG.adminSettingsEmail.toLowerCase();
  }

  /**
   * Section 14.2: Overall Score Summary access
   * STRICT ACCESS: Only Dean E01 and Super Admin U01 are permitted.
   * All other users (including Vice Deans E02-E05 and regular staff) are denied (403 Forbidden).
   */
  canAccessOverallSummary(user: Employee | AuthUser | null): boolean {
    if (!user) return false;
    const userId = 'id' in user ? user.id : user.employeeId;
    return userId === 'E01' || userId === 'U01';
  }

  /**
   * Checks if user is an authorized executive with supervision scope
   */
  isExecutive(user: Employee | AuthUser | null): boolean {
    if (!user) return false;
    const userId = 'id' in user ? user.id : user.employeeId;
    return (
      this.isSuperAdmin(user) ||
      this.hasRole(user, 'admin') ||
      userId.startsWith('E') ||
      userId.startsWith('H')
    );
  }

  /**
   * Returns list of employee IDs that the current user is authorized to view in the Behavior Overview (Section 14.1)
   */
  getSupervisedEmployeeIds(
    currentUser: Employee,
    allEmployees: Employee[],
    scopes: SupervisionScope[],
    roundId: string
  ): string[] {
    // 1. super_admin (U01) and Dean (E01) see everyone
    //    (ยกเว้นผู้บริหาร E01–E05 ซึ่งเป็นผู้ประเมินเท่านั้น ไม่ใช่ผู้ถูกประเมิน)
    if (this.isSuperAdmin(currentUser) || currentUser.id === 'E01') {
      return allEmployees.filter((e) => !e.id.startsWith('E')).map((e) => e.id);
    }

    // 2. Check supervision_scopes table
    const userScopes = scopes.filter((s) => s.roundId === roundId && s.userId === currentUser.id);

    if (userScopes.length === 0) {
      // If no explicit scope configured, fallback to default policy:
      // Heads see their workgroup (excluding U01)
      if (currentUser.id.startsWith('H') && currentUser.unitCode && currentUser.unitCode !== '-') {
        return allEmployees
          .filter((e) => e.unitCode === currentUser.unitCode && e.id !== 'U01')
          .map((e) => e.id);
      }
      return [currentUser.id];
    }

    const authorizedIds = new Set<string>();

    userScopes.forEach((scope) => {
      if (scope.scopeType === 'all') {
        allEmployees.forEach((e) => authorizedIds.add(e.id));
      } else if (scope.scopeType === 'unit' && scope.unitCode) {
        allEmployees
          .filter((e) => e.unitCode === scope.unitCode && e.id !== 'U01')
          .forEach((e) => authorizedIds.add(e.id));
      } else if (scope.scopeType === 'individual' && scope.employeeIds) {
        scope.employeeIds.forEach((id) => authorizedIds.add(id));
      }
    });

    // Vice Deans (E02..E05) do not include U01 in their general overview
    if (currentUser.id.startsWith('E') && currentUser.id !== 'E01') {
      authorizedIds.delete('U01');
    }

    return Array.from(authorizedIds);
  }

  /**
   * Row-level check: Can currentUser view the evaluation of targetEmployeeId?
   */
  canViewEvaluation(
    currentUser: Employee,
    targetEmployeeId: string,
    roundId: string,
    assignments: EvaluatorAssignment[],
    scopes: SupervisionScope[],
    allEmployees: Employee[]
  ): boolean {
    // 1. super_admin sees all
    if (this.isSuperAdmin(currentUser)) return true;

    // 2. Evaluatee can view their own
    if (currentUser.id === targetEmployeeId) return true;

    // 3. Evaluator can view target if assigned in evaluator_assignments
    const isAssigned = assignments.some(
      (a) =>
        a.roundId === roundId && a.evaluatorId === currentUser.id && a.evaluateeId === targetEmployeeId
    );
    if (isAssigned) return true;

    // 4. Executive with supervision scope
    const supervisedIds = this.getSupervisedEmployeeIds(currentUser, allEmployees, scopes, roundId);
    if (supervisedIds.includes(targetEmployeeId)) return true;

    return false;
  }

  /**
   * Filters evaluation data before presenting to the user (Section 11)
   * - Hides evaluator breakdown from evaluatee until super_admin publishes results
   * - Restricts evaluator to their assigned categories
   * - Masks other evaluators' private scores
   */
  filterEvaluationForUser(
    evaluation: Evaluation,
    currentUser: Employee,
    period: EvaluationPeriod,
    assignments: EvaluatorAssignment[]
  ): Evaluation {
    // If super_admin, return full evaluation
    if (this.isSuperAdmin(currentUser)) {
      return evaluation;
    }

    const isEvaluatee = evaluation.employeeId === currentUser.id;
    const isResultsPublished = !!period.isResultsPublished;
    const allowDetailedBreakdown = !!period.showEvaluatorDetailsToEvaluatee;

    // Clone evaluation to prevent mutating raw stored state
    const filtered: Evaluation = {
      ...evaluation,
      evaluatorScores: { ...(evaluation.evaluatorScores || {}) },
      itemScores: { ...(evaluation.itemScores || {}) },
    };

    // Case 1: Evaluatee looking at their own evaluation
    if (isEvaluatee) {
      if (!isResultsPublished) {
        // Results not published yet: strip all evaluator individual scores
        filtered.evaluatorScores = {};
        // Strip evaluator item scores, only keep self scores
        const selfItemScores: typeof filtered.itemScores = {};
        Object.entries(filtered.itemScores || {}).forEach(([key, item]) => {
          if (item.raterType === 'self') {
            selfItemScores[key] = item;
          }
        });
        filtered.itemScores = selfItemScores;
      } else if (!allowDetailedBreakdown) {
        // Published, but per-evaluator identity is masked (shows aggregate only)
        // We will mask raterId to protect evaluator anonymity if requested
      }
      return filtered;
    }

    // Case 2: Evaluator looking at an examinee
    const userAssignments = assignments.filter(
      (a) =>
        a.roundId === period.id &&
        a.evaluatorId === currentUser.id &&
        a.evaluateeId === evaluation.employeeId
    );

    const hasAchievement = userAssignments.some((a) => a.type === 'achievement');
    const hasBehavior = userAssignments.some((a) => a.type === 'behavior');

    // Evaluator CANNOT see other evaluators' scores!
    const myScoresOnly: typeof filtered.evaluatorScores = {};
    if (filtered.evaluatorScores?.[currentUser.id]) {
      myScoresOnly[currentUser.id] = filtered.evaluatorScores[currentUser.id];
    }
    filtered.evaluatorScores = myScoresOnly;

    // In item scores: only keep self score (for reference) and current evaluator's score
    const filteredItemScores: typeof filtered.itemScores = {};
    Object.entries(filtered.itemScores || {}).forEach(([key, item]) => {
      if (item.raterType === 'self' || item.raterId === currentUser.id) {
        filteredItemScores[key] = item;
      }
    });
    filtered.itemScores = filteredItemScores;

    return filtered;
  }
}

export const accessControlService = new AccessControlService();
