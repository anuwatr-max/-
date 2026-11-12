import { describe, expect, it } from 'vitest';
import { accessControlService } from './accessControl';
import { INITIAL_EMPLOYEES, createDefaultSupervisionScopes } from '../data/seedData';
import { Evaluation, EvaluationPeriod, EvaluatorAssignment } from '../types';

describe('AccessControlService - Sections 11 & 14 RLS tests', () => {
  const roundId = '2568-R1';
  const scopes = createDefaultSupervisionScopes(roundId);

  it('Super Admin U01 and Dean E01 see all evaluatees except executives E01–E05 (Section 14.1)', () => {
    const u01 = INITIAL_EMPLOYEES.find((e) => e.id === 'U01')!;
    const e01 = INITIAL_EMPLOYEES.find((e) => e.id === 'E01')!;

    const u01Supervised = accessControlService.getSupervisedEmployeeIds(
      u01,
      INITIAL_EMPLOYEES,
      scopes,
      roundId
    );
    const evaluateeCount = INITIAL_EMPLOYEES.filter((e) => !e.id.startsWith('E')).length;
    expect(u01Supervised.length).toBe(evaluateeCount);
    expect(u01Supervised.some((id) => id.startsWith('E'))).toBe(false);

    const e01Supervised = accessControlService.getSupervisedEmployeeIds(
      e01,
      INITIAL_EMPLOYEES,
      scopes,
      roundId
    );
    expect(e01Supervised.length).toBe(evaluateeCount);
  });

  it('Vice Dean for Academic E02 sees EDU division (H01, S01..S05) and excludes U01', () => {
    const e02 = INITIAL_EMPLOYEES.find((e) => e.id === 'E02')!;
    const supervised = accessControlService.getSupervisedEmployeeIds(
      e02,
      INITIAL_EMPLOYEES,
      scopes,
      roundId
    );

    expect(supervised).toContain('H01');
    expect(supervised).toContain('S01');
    expect(supervised).toContain('S02');
    expect(supervised).toContain('S03');
    expect(supervised).toContain('S04');
    expect(supervised).toContain('S05');
    expect(supervised).not.toContain('U01'); // strictly excludes U01
    expect(supervised).not.toContain('S06'); // S06 is in RES
  });

  it('Vice Dean for Student Affairs E03 sees S03 and S05', () => {
    const e03 = INITIAL_EMPLOYEES.find((e) => e.id === 'E03')!;
    const supervised = accessControlService.getSupervisedEmployeeIds(
      e03,
      INITIAL_EMPLOYEES,
      scopes,
      roundId
    );

    expect(supervised).toEqual(expect.arrayContaining(['S03', 'S05']));
    expect(supervised).not.toContain('U01');
    expect(supervised).not.toContain('S01');
  });

  it('Vice Dean for Research E04 sees RES division (H02, S06) and excludes U01', () => {
    const e04 = INITIAL_EMPLOYEES.find((e) => e.id === 'E04')!;
    const supervised = accessControlService.getSupervisedEmployeeIds(
      e04,
      INITIAL_EMPLOYEES,
      scopes,
      roundId
    );

    expect(supervised).toContain('H02');
    expect(supervised).toContain('S06');
    expect(supervised).not.toContain('U01');
    expect(supervised).not.toContain('H01');
  });

  it('Vice Dean for Planning E05 sees S01 and H02', () => {
    const e05 = INITIAL_EMPLOYEES.find((e) => e.id === 'E05')!;
    const supervised = accessControlService.getSupervisedEmployeeIds(
      e05,
      INITIAL_EMPLOYEES,
      scopes,
      roundId
    );

    expect(supervised).toContain('S01');
    expect(supervised).toContain('H02');
    expect(supervised).not.toContain('U01');
  });

  it('Section 11.1: Evaluatee cannot see evaluator breakdown when isResultsPublished is false', () => {
    const s01 = INITIAL_EMPLOYEES.find((e) => e.id === 'S01')!;
    const unpublishedPeriod: EvaluationPeriod = {
      id: '2569-R1',
      round: 1,
      year: 2569,
      label: 'รอบที่ 1',
      workPeriod: '1 ก.ค. – 31 ธ.ค. 2568',
      startDate: '2025-07-01',
      endDate: '2025-12-31',
      autoDeadline: '2026-01-09',
      effectiveDeadline: '2026-01-09',
      isOpen: true,
      isResultsPublished: false,
    };

    const mockEval: Evaluation = {
      id: 'eval-S01-2569-R1',
      employeeId: 'S01',
      periodId: '2569-R1',
      formStatus: 'ส่งแล้ว',
      updatedAt: '2026-01-05',
      kpis: [],
      competencies: [],
      evaluatorScores: {
        E02: {
          evaluatorId: 'E02',
          achievementScore: 68,
          behaviorScore: 28,
        },
      },
      itemScores: {
        item_1_self: {
          id: 'item_1_self',
          evaluationId: 'eval-S01-2569-R1',
          criteriaId: 'crit_1',
          raterId: 'self',
          raterType: 'self',
          score: 5,
          updatedAt: '2026-01-05',
        },
        item_1_E02: {
          id: 'item_1_E02',
          evaluationId: 'eval-S01-2569-R1',
          criteriaId: 'crit_1',
          raterId: 'E02',
          raterType: 'evaluator',
          score: 4,
          updatedAt: '2026-01-05',
        },
      },
    };

    const filtered = accessControlService.filterEvaluationForUser(
      mockEval,
      s01,
      unpublishedPeriod,
      []
    );

    // Evaluator scores MUST be stripped when unpublished
    expect(Object.keys(filtered.evaluatorScores || {}).length).toBe(0);
    // Evaluator item scores MUST be stripped, only self kept
    expect(filtered.itemScores?.item_1_self).toBeDefined();
    expect(filtered.itemScores?.item_1_E02).toBeUndefined();
  });

  it('Section 11.2: Evaluator cannot see other evaluators private scores', () => {
    const e02 = INITIAL_EMPLOYEES.find((e) => e.id === 'E02')!;
    const publishedPeriod: EvaluationPeriod = {
      id: '2568-R1',
      round: 1,
      year: 2568,
      label: 'รอบที่ 1',
      workPeriod: '',
      startDate: '',
      endDate: '',
      autoDeadline: '',
      effectiveDeadline: '',
      isOpen: false,
      isResultsPublished: true,
    };

    const assignments: EvaluatorAssignment[] = [
      {
        id: 'ea-1',
        roundId: '2568-R1',
        evaluateeId: 'S01',
        evaluatorId: 'E02',
        type: 'achievement',
        weight: 60,
      },
      {
        id: 'ea-2',
        roundId: '2568-R1',
        evaluateeId: 'S01',
        evaluatorId: 'E05',
        type: 'achievement',
        weight: 40,
      },
    ];

    const mockEval: Evaluation = {
      id: 'eval-S01-2568-R1',
      employeeId: 'S01',
      periodId: '2568-R1',
      formStatus: 'ส่งแล้ว',
      updatedAt: '2025-01-05',
      kpis: [],
      competencies: [],
      evaluatorScores: {
        E02: {
          evaluatorId: 'E02',
          achievementScore: 68,
          behaviorScore: 28,
        },
        E05: {
          evaluatorId: 'E05',
          achievementScore: 65,
          behaviorScore: 27,
        },
      },
      itemScores: {
        crit_1_self: { id: 'crit_1_self', evaluationId: 'eval-S01-2568-R1', criteriaId: 'crit_1', raterId: 'self', raterType: 'self', score: 5, updatedAt: '' },
        crit_1_E02: { id: 'crit_1_E02', evaluationId: 'eval-S01-2568-R1', criteriaId: 'crit_1', raterId: 'E02', raterType: 'evaluator', score: 4, updatedAt: '' },
        crit_1_E05: { id: 'crit_1_E05', evaluationId: 'eval-S01-2568-R1', criteriaId: 'crit_1', raterId: 'E05', raterType: 'evaluator', score: 3, updatedAt: '' },
      },
    };

    const filteredForE02 = accessControlService.filterEvaluationForUser(
      mockEval,
      e02,
      publishedPeriod,
      assignments
    );

    // E02 sees only their own score and NOT E05's
    expect(filteredForE02.evaluatorScores?.E02).toBeDefined();
    expect(filteredForE02.evaluatorScores?.E05).toBeUndefined();

    // E02 sees self item score (for comparison) and E02's score, but NOT E05's score
    expect(filteredForE02.itemScores?.crit_1_self).toBeDefined();
    expect(filteredForE02.itemScores?.crit_1_E02).toBeDefined();
    expect(filteredForE02.itemScores?.crit_1_E05).toBeUndefined();
  });

  it('Section 14.2: Strict access to Overall Score Summary is granted ONLY to E01 and U01', () => {
    const e01 = INITIAL_EMPLOYEES.find((e) => e.id === 'E01')!;
    const u01 = INITIAL_EMPLOYEES.find((e) => e.id === 'U01')!;
    const e02 = INITIAL_EMPLOYEES.find((e) => e.id === 'E02')!;
    const e05 = INITIAL_EMPLOYEES.find((e) => e.id === 'E05')!;
    const h01 = INITIAL_EMPLOYEES.find((e) => e.id === 'H01')!;
    const s01 = INITIAL_EMPLOYEES.find((e) => e.id === 'S01')!;

    // E01 and U01 are authorized
    expect(accessControlService.canAccessOverallSummary(e01)).toBe(true);
    expect(accessControlService.canAccessOverallSummary(u01)).toBe(true);

    // Vice Deans, Heads, and Staff are strictly forbidden (403)
    expect(accessControlService.canAccessOverallSummary(e02)).toBe(false);
    expect(accessControlService.canAccessOverallSummary(e05)).toBe(false);
    expect(accessControlService.canAccessOverallSummary(h01)).toBe(false);
    expect(accessControlService.canAccessOverallSummary(s01)).toBe(false);
  });
});
