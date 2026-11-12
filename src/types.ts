export type Position =
  | 'คณบดี'
  | 'รองคณบดีฝ่ายวิชาการ'
  | 'รองคณบดีฝ่ายกิจการนิสิตและศิษย์เก่าสัมพันธ์'
  | 'รองคณบดีฝ่ายวิจัยและบริการวิชาการ'
  | 'รองคณบดีฝ่ายวางแผนและพัฒนาคุณภาพ'
  | 'หัวหน้าสำนักงานเลขานุการ'
  | 'หัวหน้างาน'
  | 'หัวหน้างานบริการการศึกษา'
  | 'หัวหน้างานวิจัยและพัฒนาคุณภาพการศึกษา'
  | 'หัวหน้างานการเงินและพัสดุ'
  | 'นักวิชาการศึกษา ชำนาญการ'
  | 'นักวิชาการศึกษา ปฏิบัติการ'
  | 'นักวิชาการโสตทัศนศึกษา ชำนาญการ'
  | 'นักวิชาการโสตทัศนศึกษา ปฏิบัติการ'
  | 'นักวิชาการเงินและบัญชี ปฏิบัติการ'
  | 'เจ้าหน้าที่บริหารงานทั่วไป ปฏิบัติการ'
  | 'พนักงานขับรถยนต์'
  | 'ช่างฝีมือทั่วไป'
  | 'ผู้ปฏิบัติการ';

export type CareerLevel =
  | 'บริหาร'
  | 'ปฏิบัติการ'
  | 'ชำนาญการ'
  | 'ชำนาญการพิเศษ'
  | 'เชี่ยวชาญ'
  | 'เชี่ยวชาญพิเศษ'
  | 'ทั่วไป';

export type UnitCode = 'EDU' | 'RES' | 'FIN' | 'ADM' | '-';

export type Unit =
  | 'คณะโลจิสติกส์และดิจิทัลซัพพลายเชน'
  | 'สำนักงานเลขานุการ'
  | 'งานธุรการ'
  | 'งานบริการการศึกษา'
  | 'งานวิจัยและพัฒนาคุณภาพการศึกษา'
  | 'งานการเงินและพัสดุ'
  | 'ทุกกลุ่ม'
  | '-';

export type UserRole = 'super_admin' | 'admin' | 'head' | 'staff';

export type Round = 1 | 2; // รอบ 1 = ก.ค.–ธ.ค., รอบ 2 = ม.ค.–มิ.ย.

export interface EvaluationPeriod {
  id: string;            // เช่น '2569-R1'
  round: Round;
  year: number;          // พ.ศ.
  label: string;         // เช่น 'รอบที่ 1 (ก.ค. – ธ.ค. 2568)'
  workPeriod: string;    // '1 ก.ค. – 31 ธ.ค. 2568'
  startDate: string;     // ISO date
  endDate: string;       // ISO date
  autoDeadline: string;  // คำนวณอัตโนมัติ (วันศุกร์ของสัปดาห์ที่ 2)
  effectiveDeadline: string; // วันปิดรับจริง (super_admin ปรับ/ขยายได้)
  isOpen: boolean;       // เปิดให้กรอก/แก้ไขได้หรือไม่
  unlockedEmployeeIds?: string[]; // รายชื่อผู้ถูกประเมินที่ super_admin ปลดล็อกพิเศษเป็นรายคน
  isResultsPublished?: boolean;   // super_admin กด "ประกาศผล"
  showEvaluatorDetailsToEvaluatee?: boolean; // เปิดให้ผู้รับการประเมินเห็นคะแนนรายผู้ประเมินหรือไม่ (default: false)
}

export type WorkStatus = 'ยังไม่ดำเนินการ' | 'ระหว่างดำเนินการ' | 'ดำเนินการแล้วเสร็จ';
export type KpiCategory = 'main' | 'special';
export type ResultLevel = 'Outstanding' | 'Achieved' | 'Fair' | 'Failed' | 'N/A';
export type Importance = 'น้อย' | 'ปานกลาง' | 'มาก' | 'มากที่สุด';
export type FormStatus = 'ยังไม่บันทึก' | 'ร่าง' | 'ส่งแล้ว';

export interface Employee {
  id: string; // e.g. 'E01', 'U01', 'H01', 'S01'
  fullName: string;
  position: Position | string;
  careerLevel: CareerLevel | string;
  unit: Unit | string;
  unitCode: UnitCode;
  roles: UserRole[];
  email: string;
  avatar?: string;
}

export interface AuthUser {
  email: string;
  name: string;
  position?: Position | string;
  unit?: Unit | string;
  roles: UserRole[];
  picture?: string;
  employeeId: string;
  authenticatedAt: string;
  googleAccessToken?: string;
}

export interface EvaluatorAssignment {
  id: string;
  roundId: string;
  evaluateeId: string;  // ผู้ถูกประเมิน
  evaluatorId: string;  // ผู้ประเมิน
  type: 'achievement' | 'behavior';
  weight: number;       // % เช่น 30, 70, 25, 7.5
}

export interface EvaluatorScoreRecord {
  evaluatorId: string;
  submittedAt?: string;
  achievementScore: number; // คะแนนส่วนผลสัมฤทธิ์ (เต็ม 70)
  behaviorScore: number;    // คะแนนส่วนพฤติกรรม (เต็ม 30)
  comment?: string;
}

// Section 12.1: Criteria & Levels (เกณฑ์การประเมินรายข้อ)
export interface CriteriaLevel {
  level: number; // 1..5
  title: string;
  description: string;
}

export interface Criteria {
  id: string;
  roundId: string;
  category: 'achievement' | 'behavior';
  code: string;
  name: string;
  description: string;
  weight: number; // % (รวม 100% ในแต่ละส่วน)
  applicablePositionTypes: ('head' | 'staff' | 'all')[];
  targetValue?: string;
  levels: CriteriaLevel[];
  employeeId?: string; // สำหรับ achievement ที่เป็นตัวชี้วัดเฉพาะบุคคล
}

// Section 12.2: Item Score (คะแนนรายข้อ)
export interface ItemScore {
  id: string;
  evaluationId: string;
  criteriaId: string;
  raterId: string;
  raterType: 'self' | 'evaluator';
  score: number; // ระดับ 1..5
  comment?: string;
  updatedAt: string;
}

// Section 14.7: Overall Summary Guide Content (คู่มือการใช้งานหน้าสรุปภาพรวม)
export interface OverallSummaryGuideContent {
  columnsMeaning: string;
  calculationMethod: string;
  sortingRules: string;
  pendingMeaning: string;
  filterAndExport: string;
}

// Section 14.1: Supervision Scope (ขอบเขตการกำกับดูแล)
export interface SupervisionScope {
  id: string;
  roundId: string;
  userId: string; // e.g. E01, E02, E03, E04, E05, U01
  scopeType: 'all' | 'unit' | 'individual';
  unitCode?: UnitCode;
  employeeIds?: string[]; // รายบุคคล เช่น S01, H02 สำหรับ E05 หรือ S03, S05 สำหรับ E03
}

export interface KpiCriteria {
  outstanding: string;
  achieved: string;
  fair: string;
  failed: string;
}

export interface KpiEvidence {
  note: string;
  links: string[];
}

export interface Kpi {
  id: string;
  category: KpiCategory;
  order: number;
  strategicGoal: string;
  indicator: string;
  importance: Importance;
  weight: number;
  criteria: KpiCriteria;
  status: WorkStatus;
  actualValue: string;
  selfLevel: ResultLevel | null;
  evidence: KpiEvidence;
  updatedAt: string;
}

export interface ActivityAttendance {
  id: string;
  name: string;
  type: 'faculty' | 'university';
  status: 'attended' | 'excused' | 'absent';
  isCommittee?: boolean;
}

export interface CompetencyEvidence {
  note: string;
  links: string[];
  sharePercent?: number;
  hasAward?: boolean;
  committeeCount?: number;
}

export interface CompetencyRating {
  code: string;
  expectedLevel: number;
  selfLevel: number | null;
  status: WorkStatus;
  evidence: CompetencyEvidence;
  checkedItems?: number[];
  surveyAverage?: number;
  activities?: ActivityAttendance[];
}

export interface Evaluation {
  id: string;
  employeeId: string;
  periodId: string;
  kpis: Kpi[];
  competencies: CompetencyRating[];
  formStatus: FormStatus;
  submittedAt?: string;
  updatedAt: string;
  // Evaluator Scores given by each evaluator: { [evaluatorId]: EvaluatorScoreRecord }
  evaluatorScores?: Record<string, EvaluatorScoreRecord>;
  // Item-level scores: { [`${criteriaId}_${raterId}`]: ItemScore }
  itemScores?: Record<string, ItemScore>;
  googleSheetSync?: {
    syncedAt?: string;
    sheetUrl?: string;
    spreadsheetId?: string;
  };
}

export interface CalculatedWeightedScore {
  evaluateeId: string;
  periodId: string;
  
  // Achievement (70)
  achievementScore: number;
  achievementWeightSum: number;
  achievementEvaluatorCount: number;
  achievementCompletedCount: number;
  achievementEvaluatorDetails: {
    evaluatorId: string;
    evaluatorName: string;
    weight: number;
    score: number;
    isSubmitted: boolean;
  }[];

  // Behavior (30)
  behaviorScore: number;
  behaviorWeightSum: number;
  behaviorEvaluatorCount: number;
  behaviorCompletedCount: number;
  behaviorEvaluatorDetails: {
    evaluatorId: string;
    evaluatorName: string;
    weight: number;
    score: number;
    isSubmitted: boolean;
  }[];

  // Self evaluation scores (for reference only)
  selfAchievementScore: number;
  selfBehaviorScore: number;
  selfTotalScore: number;

  // Final Total (100)
  totalScore: number;
  isFullyEvaluated: boolean;
  overallStatus: 'ยังไม่บันทึก' | 'ประเมินตนเองแล้ว' | 'อยู่ระหว่างประเมิน' | 'ผู้ประเมินครบแล้ว';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorName: string;
  action: string;
  target: string;
  details: string;
}

export interface ScoreSummary {
  groupPercentMain: number;
  mainScore: number;
  mainWeightTotal: number;
  mainEffectiveWeightTotal: number;
  
  hasSpecial: boolean;
  groupPercentSpecial: number;
  specialScore: number;
  specialWeightTotal: number;
  specialEffectiveWeightTotal: number;

  achievementScore: number;
  isAchievementProvisional: boolean;

  coreScore: number;
  coreExpectedSum: number;
  coreSelfSum: number;
  functionalScore: number;
  functionalExpectedSum: number;
  functionalSelfSum: number;
  behaviorScore: number;
  isBehaviorProvisional: boolean;

  totalScore: number;
}
