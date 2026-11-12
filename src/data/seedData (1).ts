import {
  CompetencyRating,
  Criteria,
  Employee,
  Evaluation,
  EvaluationPeriod,
  EvaluatorAssignment,
  ItemScore,
  Kpi,
  SupervisionScope,
} from '../types';
import { PMS_CONFIG } from './config';
import { createRoundConfig } from '../lib/dateUtils';

export const INITIAL_EMPLOYEES: Employee[] = [
  // Administrators / Executives (E01 - E05)
  {
    id: 'E01',
    fullName: 'รศ.ดร.กุลภา โสรัตน์',
    position: 'คณบดี',
    careerLevel: 'บริหาร',
    unit: 'คณะโลจิสติกส์และดิจิทัลซัพพลายเชน',
    unitCode: '-',
    roles: ['admin'],
    email: 'kullapas@nu.ac.th',
  },
  {
    id: 'E02',
    fullName: 'ผศ.ดร.ใกล้รุ่ง พรอนันต์',
    position: 'รองคณบดีฝ่ายวิชาการ',
    careerLevel: 'บริหาร',
    unit: 'คณะโลจิสติกส์และดิจิทัลซัพพลายเชน',
    unitCode: 'EDU',
    roles: ['admin'],
    email: 'klairungp@nu.ac.th',
  },
  {
    id: 'E03',
    fullName: 'ผศ.ดร.ศิริกาญจน์ จันทร์สมบัติ',
    position: 'รองคณบดีฝ่ายกิจการนิสิตและศิษย์เก่าสัมพันธ์',
    careerLevel: 'บริหาร',
    unit: 'คณะโลจิสติกส์และดิจิทัลซัพพลายเชน',
    unitCode: 'EDU',
    roles: ['admin'],
    email: 'sirikarnc@nu.ac.th',
  },
  {
    id: 'E04',
    fullName: 'รศ.ดร.วรมล เชาวรัตน์ วาตานาเบะ',
    position: 'รองคณบดีฝ่ายวิจัยและบริการวิชาการ',
    careerLevel: 'บริหาร',
    unit: 'คณะโลจิสติกส์และดิจิทัลซัพพลายเชน',
    unitCode: 'RES',
    roles: ['admin'],
    email: 'woramolc@nu.ac.th',
  },
  {
    id: 'E05',
    fullName: 'ผศ.ดร.จารุวัฒน์ พัฒน์มณี',
    position: 'รองคณบดีฝ่ายวางแผนและพัฒนาคุณภาพ',
    careerLevel: 'บริหาร',
    unit: 'คณะโลจิสติกส์และดิจิทัลซัพพลายเชน',
    unitCode: '-',
    roles: ['admin'],
    email: 'jaruwatp@nu.ac.th',
  },

  // Super Admin (U01)
  {
    id: 'U01',
    fullName: 'อนุวัทย์ เรืองจันทร์',
    position: 'หัวหน้าสำนักงานเลขานุการ',
    careerLevel: 'ชำนาญการพิเศษ',
    unit: 'ทุกกลุ่ม',
    unitCode: 'ADM',
    roles: ['super_admin', 'head'],
    email: 'anuwatr@nu.ac.th',
  },

  // Heads of Work Groups (H01 - H03)
  {
    id: 'H01',
    fullName: 'สุพิชญา เรื่องลือ',
    position: 'หัวหน้างานบริการการศึกษา',
    careerLevel: 'ชำนาญการ',
    unit: 'งานบริการการศึกษา',
    unitCode: 'EDU',
    roles: ['head', 'staff'],
    email: 'suphitchayar@nu.ac.th',
  },
  {
    id: 'H02',
    fullName: 'สุนิษา แสนศรี',
    position: 'หัวหน้างานวิจัยและพัฒนาคุณภาพการศึกษา',
    careerLevel: 'ชำนาญการ',
    unit: 'งานวิจัยและพัฒนาคุณภาพการศึกษา',
    unitCode: 'RES',
    roles: ['head', 'staff'],
    email: 'sunisasan@nu.ac.th',
  },
  {
    id: 'H03',
    fullName: 'กันยารัตน์ สมกุล',
    position: 'หัวหน้างานการเงินและพัสดุ',
    careerLevel: 'ชำนาญการ',
    unit: 'งานการเงินและพัสดุ',
    unitCode: 'FIN',
    roles: ['head', 'staff'],
    email: 'kanyaratso@nu.ac.th',
  },

  // Staff Members (S01 - S12)
  {
    id: 'S01',
    fullName: 'ฐิติกัญญารัตน์ บุตรจันทร์จรัส',
    position: 'นักวิชาการศึกษา ชำนาญการ',
    careerLevel: 'ชำนาญการ',
    unit: 'งานบริการการศึกษา',
    unitCode: 'EDU',
    roles: ['staff'],
    email: 'pawineeb@nu.ac.th',
  },
  {
    id: 'S02',
    fullName: 'ศศิธร สถาพร',
    position: 'เจ้าหน้าที่บริหารงานทั่วไป ปฏิบัติการ',
    careerLevel: 'ปฏิบัติการ',
    unit: 'งานบริการการศึกษา',
    unitCode: 'EDU',
    roles: ['staff'],
    email: 'sasithorns@nu.ac.th',
  },
  {
    id: 'S03',
    fullName: 'มารุต จีนน่วม',
    position: 'นักวิชาการโสตทัศนศึกษา ปฏิบัติการ',
    careerLevel: 'ปฏิบัติการ',
    unit: 'งานบริการการศึกษา',
    unitCode: 'EDU',
    roles: ['staff'],
    email: 'marutc@nu.ac.th',
  },
  {
    id: 'S04',
    fullName: 'รัฐภูมิ กล่ำจันทร์',
    position: 'นักวิชาการศึกษา ปฏิบัติการ',
    careerLevel: 'ปฏิบัติการ',
    unit: 'งานบริการการศึกษา',
    unitCode: 'EDU',
    roles: ['staff'],
    email: 'ratthapumk@nu.ac.th',
  },
  {
    id: 'S05',
    fullName: 'ปัทมาวดี เปรมกาศ',
    position: 'นักวิชาการศึกษา ปฏิบัติการ',
    careerLevel: 'ปฏิบัติการ',
    unit: 'งานบริการการศึกษา',
    unitCode: 'EDU',
    roles: ['staff'],
    email: 'pattamawadeep@nu.ac.th',
  },
  {
    id: 'S06',
    fullName: 'นันทวุฒิ เงินจันทร์',
    position: 'นักวิชาการโสตทัศนศึกษา ชำนาญการ',
    careerLevel: 'ชำนาญการ',
    unit: 'งานวิจัยและพัฒนาคุณภาพการศึกษา',
    unitCode: 'RES',
    roles: ['staff'],
    email: 'nantawudthn@nu.ac.th',
  },
  {
    id: 'S07',
    fullName: 'กุลพรภัสร์ สมรูป',
    position: 'นักวิชาการเงินและบัญชี ปฏิบัติการ',
    careerLevel: 'ปฏิบัติการ',
    unit: 'งานการเงินและพัสดุ',
    unitCode: 'FIN',
    roles: ['staff'],
    email: 'kunlapronpass@nu.ac.th',
  },
  {
    id: 'S08',
    fullName: 'มัลลิกา อินสาย',
    position: 'เจ้าหน้าที่บริหารงานทั่วไป ปฏิบัติการ',
    careerLevel: 'ปฏิบัติการ',
    unit: 'งานการเงินและพัสดุ',
    unitCode: 'FIN',
    roles: ['staff'],
    email: 'mullikai@nu.ac.th',
  },
  {
    id: 'S09',
    fullName: 'วิทยากร สังวาลย์วงค์',
    position: 'เจ้าหน้าที่บริหารงานทั่วไป ปฏิบัติการ',
    careerLevel: 'ปฏิบัติการ',
    unit: 'งานธุรการ',
    unitCode: 'ADM',
    roles: ['staff'],
    email: 'vittayakorns@nu.ac.th',
  },
  {
    id: 'S10',
    fullName: 'ธัญญรัตน์ ไชยวงศ์',
    position: 'เจ้าหน้าที่บริหารงานทั่วไป ปฏิบัติการ',
    careerLevel: 'ปฏิบัติการ',
    unit: 'งานธุรการ',
    unitCode: 'ADM',
    roles: ['staff'],
    email: 'thanyaratc@nu.ac.th',
  },
  {
    id: 'S11',
    fullName: 'รภัทร มงคลเขมภัทร์',
    position: 'พนักงานขับรถยนต์',
    careerLevel: 'ทั่วไป',
    unit: 'งานธุรการ',
    unitCode: 'ADM',
    roles: ['staff'],
    email: 'rapatm@nu.ac.th',
  },
  {
    id: 'S12',
    fullName: 'สมบัติ เอี่ยมเย็น',
    position: 'ช่างฝีมือทั่วไป',
    careerLevel: 'ทั่วไป',
    unit: 'งานธุรการ',
    unitCode: 'ADM',
    roles: ['staff'],
    email: 'sombati@nu.ac.th',
  },
];

/**
 * Generate default evaluator assignments matrix for a given roundId
 * strictly matching Prompt sections 6 and 7.
 */
export function createDefaultEvaluatorAssignments(roundId: string): EvaluatorAssignment[] {
  const assignments: EvaluatorAssignment[] = [];
  let counter = 1;

  const add = (
    evaluateeId: string,
    evaluatorId: string,
    type: 'achievement' | 'behavior',
    weight: number
  ) => {
    assignments.push({
      id: `ea-${roundId}-${counter++}`,
      roundId,
      evaluateeId,
      evaluatorId,
      type,
      weight,
    });
  };

  // ==========================================
  // SECTION 6: Achievement Evaluators (Max 70)
  // ==========================================
  // U01: E01 (100%)
  add('U01', 'E01', 'achievement', 100);

  // H03, S07, S08 (การเงินฯ): U01 (30%), E01 (70%)
  ['H03', 'S07', 'S08'].forEach((empId) => {
    add(empId, 'U01', 'achievement', 30);
    add(empId, 'E01', 'achievement', 70);
  });

  // S09–S12 (ธุรการ): U01 (30%), E01 (70%)
  ['S09', 'S10', 'S11', 'S12'].forEach((empId) => {
    add(empId, 'U01', 'achievement', 30);
    add(empId, 'E01', 'achievement', 70);
  });

  // H01, S02, S04: E02 (100%)
  ['H01', 'S02', 'S04'].forEach((empId) => {
    add(empId, 'E02', 'achievement', 100);
  });

  // S03, S05: E03 (100%)
  ['S03', 'S05'].forEach((empId) => {
    add(empId, 'E03', 'achievement', 100);
  });

  // S01: E02 (60%), E05 (40%)
  add('S01', 'E02', 'achievement', 60);
  add('S01', 'E05', 'achievement', 40);

  // H02: E04 (80%), E05 (20%)
  add('H02', 'E04', 'achievement', 80);
  add('H02', 'E05', 'achievement', 20);

  // S06: E04 (100%)
  add('S06', 'E04', 'achievement', 100);

  // ==========================================
  // SECTION 7: Behavior Evaluators (Max 30)
  // ==========================================
  // U01: E01 (70%), E02 (7.5%), E03 (7.5%), E04 (7.5%), E05 (7.5%) -> Total 100%
  add('U01', 'E01', 'behavior', 70);
  add('U01', 'E02', 'behavior', 7.5);
  add('U01', 'E03', 'behavior', 7.5);
  add('U01', 'E04', 'behavior', 7.5);
  add('U01', 'E05', 'behavior', 7.5);

  // H01: E01 (25%), E02 (25%), U01 (35%), H02 (7.5%), H03 (7.5%)
  add('H01', 'E01', 'behavior', 25);
  add('H01', 'E02', 'behavior', 25);
  add('H01', 'U01', 'behavior', 35);
  add('H01', 'H02', 'behavior', 7.5);
  add('H01', 'H03', 'behavior', 7.5);

  // H02: E01 (25%), E04 (25%), U01 (35%), H01 (7.5%), H03 (7.5%)
  add('H02', 'E01', 'behavior', 25);
  add('H02', 'E04', 'behavior', 25);
  add('H02', 'U01', 'behavior', 35);
  add('H02', 'H01', 'behavior', 7.5);
  add('H02', 'H03', 'behavior', 7.5);

  // H03: E01 (25%), U01 (60%), H01 (7.5%), H02 (7.5%)
  add('H03', 'E01', 'behavior', 25);
  add('H03', 'U01', 'behavior', 60);
  add('H03', 'H01', 'behavior', 7.5);
  add('H03', 'H02', 'behavior', 7.5);

  // S07, S08 (การเงินฯ): E01 (25%), U01 (60%), H03 (15%)
  ['S07', 'S08'].forEach((empId) => {
    add(empId, 'E01', 'behavior', 25);
    add(empId, 'U01', 'behavior', 60);
    add(empId, 'H03', 'behavior', 15);
  });

  // S09–S12 (ธุรการ): E01 (70%), U01 (30%) — ไม่มีหัวหน้างานคนใดประเมิน (Prompt Section A7)
  ['S09', 'S10', 'S11', 'S12'].forEach((empId) => {
    add(empId, 'E01', 'behavior', 70);
    add(empId, 'U01', 'behavior', 30);
  });

  // S01, S02, S04: H01 (30%), U01 (30%), E01 (20%), E02 (20%)
  ['S01', 'S02', 'S04'].forEach((empId) => {
    add(empId, 'H01', 'behavior', 30);
    add(empId, 'U01', 'behavior', 30);
    add(empId, 'E01', 'behavior', 20);
    add(empId, 'E02', 'behavior', 20);
  });

  // S03, S05: H01 (30%), U01 (30%), E01 (20%), E03 (20%)
  ['S03', 'S05'].forEach((empId) => {
    add(empId, 'H01', 'behavior', 30);
    add(empId, 'U01', 'behavior', 30);
    add(empId, 'E01', 'behavior', 20);
    add(empId, 'E03', 'behavior', 20);
  });

  // S06: H02 (30%), U01 (30%), E01 (20%), E04 (20%)
  add('S06', 'H02', 'behavior', 30);
  add('S06', 'U01', 'behavior', 30);
  add('S06', 'E01', 'behavior', 20);
  add('S06', 'E04', 'behavior', 20);

  return assignments;
}

/**
 * Generate default supervision scopes matching Prompt Section 14.1
 */
export function createDefaultSupervisionScopes(roundId: string): SupervisionScope[] {
  return [
    {
      id: `scope-${roundId}-u01`,
      roundId,
      userId: 'U01',
      scopeType: 'all',
    },
    {
      id: `scope-${roundId}-e01`,
      roundId,
      userId: 'E01',
      scopeType: 'all',
    },
    {
      id: `scope-${roundId}-e02`,
      roundId,
      userId: 'E02',
      scopeType: 'unit',
      unitCode: 'EDU',
    },
    {
      id: `scope-${roundId}-e03`,
      roundId,
      userId: 'E03',
      scopeType: 'individual',
      employeeIds: ['S03', 'S05'],
    },
    {
      id: `scope-${roundId}-e04`,
      roundId,
      userId: 'E04',
      scopeType: 'unit',
      unitCode: 'RES',
    },
    {
      id: `scope-${roundId}-e05`,
      roundId,
      userId: 'E05',
      scopeType: 'individual',
      employeeIds: ['S01', 'H02'],
    },
  ];
}

/**
 * Generate standard evaluation criteria with 5 rubric levels (Section 12.1)
 */
export function createDefaultCriteria(roundId: string, employeeId?: string): Criteria[] {
  const criteriaList: Criteria[] = [];

  // Behavior Competencies (30 Points Total)
  const behaviorDefs = [
    {
      code: 'C1',
      name: 'การมุ่งผลสัมฤทธิ์และความรับผิดชอบในหน้าที่',
      desc: 'ความกระตือรือร้นและมุ่งมั่นในการปฏิบัติราชการให้บรรลุเป้าหมายตามมาตรฐาน',
      weight: 15,
      levels: [
        { level: 1, title: 'ต่ำกว่าเกณฑ์', description: 'ปฏิบัติงานล่าช้ากว่ากำหนดบ่อยครั้งและต้องการการควบคุมดูแลอย่างใกล้ชิด' },
        { level: 2, title: 'พอใช้', description: 'ปฏิบัติงานได้ตามขั้นตอน แต่ยังมีข้อผิดพลาดเล็กน้อยที่ต้องแก้ไข' },
        { level: 3, title: 'ตามเป้าหมาย (เกณฑ์ปกติ)', description: 'ปฏิบัติงานสำเร็จถูกต้องครบถ้วนตามระยะเวลาที่กำหนดโดยไม่ต้องเตือน' },
        { level: 4, title: 'ดีมาก', description: 'ปฏิบัติงานได้รวดเร็วกว่ากำหนด มีความรอบคอบและช่วยแนะนำเพื่อนร่วมงานได้' },
        { level: 5, title: 'ดีเด่นเป็นเลิศ', description: 'คิดค้นปรับปรุงขั้นตอนการทำงานให้มีประสิทธิภาพสูงขึ้นและเป็นต้นแบบที่ดี' },
      ],
    },
    {
      code: 'C2',
      name: 'การบริการที่ดีและการประสานงาน',
      desc: 'ความตั้งใจให้บริการแก่นิสิต คณาจารย์ และผู้มาติดต่อด้วยความสุภาพ รวดเร็ว และเป็นมิตร',
      weight: 15,
      levels: [
        { level: 1, title: 'ต่ำกว่าเกณฑ์', description: 'มีข้อร้องเรียนด้านการให้บริการ หรือไม่กระตือรือร้นในการช่วยเหลือ' },
        { level: 2, title: 'พอใช้', description: 'ให้บริการเฉพาะเมื่อถูกร้องขอ ข้อมูลยังไม่ครบถ้วนในบางครั้ง' },
        { level: 3, title: 'ตามเป้าหมาย', description: 'ให้บริการด้วยความสุภาพ ยิ้มแย้ม และให้ข้อมูลที่ถูกต้องรวดเร็ว' },
        { level: 4, title: 'ดีมาก', description: 'ติดตามผลการบริการเชิงรุก ประสานงานแก้ไขปัญหาให้ผู้รับบริการจนลุล่วง' },
        { level: 5, title: 'ดีเด่นเป็นเลิศ', description: 'ได้รับคำชื่นชมและพัฒนาช่องทางการให้บริการใหม่ที่สะดวกรวดเร็วยิ่งขึ้น' },
      ],
    },
    {
      code: 'C3',
      name: 'การสั่งสมความเชี่ยวชาญในงานอาชีพ',
      desc: 'การพัฒนาทักษะวิชาชีพ ความรู้ในงาน และการเรียนรู้วิทยาการใหม่ๆ',
      weight: 15,
      levels: [
        { level: 1, title: 'ต่ำกว่าเกณฑ์', description: 'ขาดความรู้พื้นฐานในภาระงานที่รับผิดชอบ ไม่สนใจเรียนรู้สิ่งใหม่' },
        { level: 2, title: 'พอใช้', description: 'มีความรู้เฉพาะงานประจำ แต่ไม่สามารถแก้ไขปัญหาเฉพาะหน้าได้' },
        { level: 3, title: 'ตามเป้าหมาย', description: 'เข้าใจระเบียบและเทคนิคการปฏิบัติงานอย่างถูกต้อง เข้ารับการอบรมตามเกณฑ์' },
        { level: 4, title: 'ดีมาก', description: 'นำความรู้ใหม่มาประยุกต์ใช้ในการทำงานและแก้ปัญหาซับซ้อนได้ดี' },
        { level: 5, title: 'ดีเด่นเป็นเลิศ', description: 'เป็นวิทยากรหรือถ่ายทอดองค์ความรู้ให้แก่บุคลากรอื่นในคณะได้อย่างมีประสิทธิภาพ' },
      ],
    },
    {
      code: 'C4',
      name: 'การยึดมั่นในความถูกต้อง จริยธรรม และวินัย',
      desc: 'การรักษาจรรยาบรรณวิชาชีพ ความซื่อสัตย์สุจริต และการปฏิบัติตามวินัยข้าราชการ/พนักงาน',
      weight: 15,
      levels: [
        { level: 1, title: 'ต่ำกว่าเกณฑ์', description: 'มีประวัติละเลยวินัย หรือมาปฏิบัติงานสายโดยไม่มีเหตุผลอันควร' },
        { level: 2, title: 'พอใช้', description: 'ปฏิบัติตามระเบียบเป็นส่วนใหญ่ แต่ยังขาดความตระหนักในบางเรื่อง' },
        { level: 3, title: 'ตามเป้าหมาย', description: 'รักษาวินัยอย่างเคร่งครัด ตรงต่อเวลา และรักษาความลับของทางราชการ' },
        { level: 4, title: 'ดีมาก', description: 'เป็นผู้มีความโปร่งใส ซื่อตรง และกล้าท้วงติงในสิ่งที่ไม่ถูกต้อง' },
        { level: 5, title: 'ดีเด่นเป็นเลิศ', description: 'ได้รับการยกย่องเป็นแบบอย่างที่ดีด้านคุณธรรมจริยธรรมขององค์กร' },
      ],
    },
    {
      code: 'C5',
      name: 'การทำงานเป็นทีมและการมีส่วนร่วมในองค์กร',
      desc: 'การร่วมมือกับผู้อื่นในกลุ่มงาน การแลกเปลี่ยนข้อมูล และการสนับสนุนเป้าหมายร่วมกัน',
      weight: 15,
      levels: [
        { level: 1, title: 'ต่ำกว่าเกณฑ์', description: 'ไม่ให้ความร่วมมือกับผู้อื่น สร้างความขัดแย้งในกลุ่มงาน' },
        { level: 2, title: 'พอใช้', description: 'ร่วมงานกับผู้อื่นได้เฉพาะเมื่อได้รับคำสั่งโดยตรง' },
        { level: 3, title: 'ตามเป้าหมาย', description: 'มีมนุษยสัมพันธ์ดี ร่วมมือในกิจกรรมของคณะและสนับสนุนเพื่อนร่วมงาน' },
        { level: 4, title: 'ดีมาก', description: 'ช่วยประสานรอยต่อระหว่างกลุ่มงานและกระตุ้นบรรยากาศที่ดีในทีม' },
        { level: 5, title: 'ดีเด่นเป็นเลิศ', description: 'เป็นแกนนำในการขับเคลื่อนโครงการสำคัญของคณะจนประสบผลสำเร็จ' },
      ],
    },
    {
      code: 'F1',
      name: 'ทักษะดิจิทัลและการจัดการข้อมูล (Digital & Data)',
      desc: 'การใช้ระบบสารสนเทศ เครื่องมือดิจิทัล และการจัดเก็บข้อมูลให้ปลอดภัยและเป็นระบบ',
      weight: 15,
      levels: [
        { level: 1, title: 'ต่ำกว่าเกณฑ์', description: 'ไม่สามารถใช้ระบบงานออนไลน์พื้นฐานได้ ต้องให้ผู้อื่นทำให้เสมอ' },
        { level: 2, title: 'พอใช้', description: 'ใช้ระบบงานได้เฉพาะคำสั่งพื้นฐาน มีข้อผิดพลาดในการบันทึกข้อมูล' },
        { level: 3, title: 'ตามเป้าหมาย', description: 'ใช้ระบบ ERP, PMS และ Cloud Tools ได้อย่างถูกต้องคล่องแคล่ว' },
        { level: 4, title: 'ดีมาก', description: 'นำเครื่องมือดิจิทัลมาช่วยวิเคราะห์และลดขั้นตอนเอกสารกระดาษ' },
        { level: 5, title: 'ดีเด่นเป็นเลิศ', description: 'ออกแบบ Workflow ดิจิทัลหรือแดชบอร์ดที่ช่วยให้การบริหารจัดการมีประสิทธิภาพ' },
      ],
    },
    {
      code: 'ENV',
      name: 'การรักษาสิ่งแวดล้อมและสำนักงานสีเขียว (Green Office)',
      desc: 'การประหยัดพลังงาน ลดการใช้กระดาษ และการส่งเสริมสิ่งแวดล้อมที่ยั่งยืน',
      weight: 10,
      levels: [
        { level: 1, title: 'ต่ำกว่าเกณฑ์', description: 'ละเลยการประหยัดพลังงาน เปิดไฟ/เครื่องปรับอากาศทิ้งไว้' },
        { level: 2, title: 'พอใช้', description: 'ปฏิบัติตามแนวทางประหยัดพลังงานเมื่อมีการตรวจเตือน' },
        { level: 3, title: 'ตามเป้าหมาย', description: 'ปิดเครื่องใช้ไฟฟ้าเมื่อเลิกใช้ คัดแยกขยะ และใช้เอกสารอิเล็กทรอนิกส์' },
        { level: 4, title: 'ดีมาก', description: 'มีส่วนร่วมในกิจกรรม Green Office ของคณะอย่างต่อเนื่อง' },
        { level: 5, title: 'ดีเด่นเป็นเลิศ', description: 'ริเริ่มมาตรการลดคาร์บอนหรือนวัตกรรมสีเขียวในสำนักงาน' },
      ],
    },
  ];

  behaviorDefs.forEach((b, idx) => {
    criteriaList.push({
      id: `crit-beh-${roundId}-${b.code}`,
      roundId,
      category: 'behavior',
      code: b.code,
      name: b.name,
      description: b.desc,
      weight: b.weight,
      applicablePositionTypes: ['all'],
      levels: b.levels,
    });
  });

  // Individual Achievement Criteria (70 Points Total)
  const achDefs = [
    {
      code: 'ACH-1',
      name: 'ความสำเร็จของงานตามหน้าที่หลัก (Main Responsibilities)',
      desc: 'ปริมาณ คุณภาพ และความถูกต้องของงานที่ส่งมอบตามกรอบภาระงานและมาตรฐานเวลา',
      weight: 40,
      levels: [
        { level: 1, title: 'ต่ำกว่า 60%', description: 'ผลงานต่ำกว่ามาตรฐานที่กำหนด มีความล่าช้าส่งผลกระทบต่องานอื่น' },
        { level: 2, title: '60% - 79%', description: 'ผลงานเป็นไปตามเกณฑ์ขั้นต่ำ แต่ต้องปรับปรุงแก้ไขหลายจุด' },
        { level: 3, title: '80% - 89%', description: 'ผลงานบรรลุเป้าหมายตามมาตรฐานที่กำหนด ส่งมอบตรงเวลาและถูกต้อง' },
        { level: 4, title: '90% - 99%', description: 'ผลงานมีคุณภาพสูง เสร็จสมบูรณ์ก่อนกำหนดเวลา' },
        { level: 5, title: '100% ขึ้นไป', description: 'ผลงานเกินเป้าหมายอย่างโดดเด่น มีความถูกต้องสมบูรณ์แบบและสร้างคุณค่าสูง' },
      ],
    },
    {
      code: 'ACH-2',
      name: 'ความถูกต้องและประสิทธิภาพของกระบวนการทำงาน',
      desc: 'ความถูกต้องตามระเบียบ กฎหมาย และการบริหารเวลาอย่างมีประสิทธิภาพ',
      weight: 40,
      levels: [
        { level: 1, title: 'ต่ำกว่า 60%', description: 'เกิดข้อผิดพลาดร้ายแรงหรือไม่ปฏิบัติตามระเบียบ' },
        { level: 2, title: '60% - 79%', description: 'มีความผิดพลาดในเอกสารหรือขั้นตอนที่ต้องแก้ไขซ้ำ' },
        { level: 3, title: '80% - 89%', description: 'ดำเนินงานตามระเบียบถูกต้อง ครบถ้วนตามขั้นตอน' },
        { level: 4, title: '90% - 99%', description: 'ตรวจสอบความถูกต้องอย่างรัดกุม ไม่มีข้อผิดพลาด และลดระยะเวลารอคอย' },
        { level: 5, title: '100% ขึ้นไป', description: 'ปรับปรุงกระบวนการจนลดขั้นตอนการทำงานได้อย่างมีนัยสำคัญ' },
      ],
    },
    {
      code: 'ACH-3',
      name: 'ผลสำเร็จของงานมอบหมายพิเศษ / นวัตกรรมพัฒนางาน',
      desc: 'โครงการพิเศษที่ได้รับมอบหมายจากคณบดี/หัวหน้าสำนักงาน หรือการพัฒนาระบบใหม่',
      weight: 20,
      levels: [
        { level: 1, title: 'ต่ำกว่า 60%', description: 'ไม่สามารถดำเนินโครงการพิเศษได้ตามกรอบเวลา' },
        { level: 2, title: '60% - 79%', description: 'งานมอบหมายพิเศษล่าช้ากว่ากำหนด แต่สามารถส่งมอบได้' },
        { level: 3, title: '80% - 89%', description: 'โครงการพิเศษสำเร็จลุล่วงตามวัตถุประสงค์ที่ได้รับมอบหมาย' },
        { level: 4, title: '90% - 99%', description: 'โครงการสำเร็จเรียบร้อย มีผลการดำเนินงานที่โดดเด่น' },
        { level: 5, title: '100% ขึ้นไป', description: 'เกิดนวัตกรรมกระบวนการทำงานใหม่ที่ขยายผลใช้ได้ทั้งคณะ' },
      ],
    },
  ];

  achDefs.forEach((a) => {
    criteriaList.push({
      id: `crit-ach-${roundId}-${employeeId || 'all'}-${a.code}`,
      roundId,
      category: 'achievement',
      code: a.code,
      name: a.name,
      description: a.desc,
      weight: a.weight,
      applicablePositionTypes: ['all'],
      employeeId,
      levels: a.levels,
    });
  });

  return criteriaList;
}

export const INITIAL_PERIODS: EvaluationPeriod[] = [
  { ...createRoundConfig(1, 2568), isResultsPublished: true },
  { ...createRoundConfig(2, 2568), isResultsPublished: true },
  { ...createRoundConfig(1, 2569), isResultsPublished: false },
];

export function createDefaultCompetencies(position: Employee['position'], round: 1 | 2 = 1): CompetencyRating[] {
  const expectedLevel = PMS_CONFIG.defaultExpectedLevelByPosition[position as any] || 2;
  const activitiesConfig = PMS_CONFIG.activitiesByRound[round];

  const defaultActivities = [
    ...activitiesConfig.faculty.map((a) => ({
      id: a.id,
      name: a.name,
      type: 'faculty' as const,
      status: 'attended' as const,
    })),
    ...activitiesConfig.university.map((a) => ({
      id: a.id,
      name: a.name,
      type: 'university' as const,
      status: 'attended' as const,
    })),
  ];

  return [
    {
      code: 'C1',
      expectedLevel,
      selfLevel: expectedLevel,
      status: 'ดำเนินการแล้วเสร็จ',
      evidence: { note: 'เข้าใจโครงสร้างและการประสานงานระหว่างงานในคณะอย่างชัดเจน', links: [] },
    },
    {
      code: 'C2',
      expectedLevel,
      selfLevel: expectedLevel,
      status: 'ดำเนินการแล้วเสร็จ',
      evidence: {
        note: 'จัดทำระบบสรุปรายงานและลดขั้นตอนการส่งมอบเอกสารงบประมาณ',
        links: ['https://drive.google.com/drive/example-c2'],
        sharePercent: 100,
      },
    },
    {
      code: 'C3',
      expectedLevel,
      selfLevel: expectedLevel,
      status: 'ดำเนินการแล้วเสร็จ',
      evidence: {
        note: 'จัดเก็บระบบเอกสารการเงินแบบ Digital Filing ค้นหาได้รวดเร็ว',
        links: ['https://drive.google.com/drive/example-c3'],
        sharePercent: 100,
      },
    },
    {
      code: 'C4',
      expectedLevel,
      selfLevel: expectedLevel,
      status: 'ดำเนินการแล้วเสร็จ',
      evidence: { note: 'เข้าร่วมกิจกรรมของคณะและมหาวิทยาลัยครบตามเกณฑ์', links: [], committeeCount: 2 },
      activities: defaultActivities,
    },
    {
      code: 'C5',
      expectedLevel,
      selfLevel: expectedLevel,
      status: 'ดำเนินการแล้วเสร็จ',
      evidence: { note: 'ผลการประเมิน 360 องศาจากเพื่อนร่วมงานและผู้บังคับบัญชา', links: [] },
      surveyAverage: 3.85,
    },
    {
      code: 'C6',
      expectedLevel,
      selfLevel: expectedLevel,
      status: 'ดำเนินการแล้วเสร็จ',
      evidence: { note: 'ส่งมอบงานถูกต้องและตรงตามเวลาอย่างสม่ำเสมอ', links: [] },
    },
    {
      code: 'C7',
      expectedLevel,
      selfLevel: expectedLevel,
      status: 'ดำเนินการแล้วเสร็จ',
      evidence: { note: 'ปฏิบัติราชการตามระเบียบและจรรยาบรรณมหาวิทยาลัย ไม่มีข้อร้องเรียน', links: [] },
    },
    {
      code: 'C8',
      expectedLevel,
      selfLevel: expectedLevel,
      status: 'ดำเนินการแล้วเสร็จ',
      evidence: { note: 'ผลประเมินสมรรถนะการสื่อสารจากแบบประเมินมหาวิทยาลัย', links: [] },
      surveyAverage: 4.1,
    },
    {
      code: 'ENV',
      expectedLevel,
      selfLevel: expectedLevel,
      status: 'ดำเนินการแล้วเสร็จ',
      evidence: {
        note: 'ร่วมกิจกรรม Green Office ปิดไฟ/แอร์เมื่อไม่ใช้งาน และลดการใช้กระดาษ',
        links: [],
        sharePercent: 100,
      },
    },
    {
      code: 'F1',
      expectedLevel,
      selfLevel: expectedLevel,
      status: 'ดำเนินการแล้วเสร็จ',
      evidence: { note: 'ผ่านการอบรม Upskill/Reskill ระบบบริหารการเงิน', links: [] },
      checkedItems: expectedLevel >= 3 ? [1, 2, 3] : [1, 2],
    },
    {
      code: 'F2',
      expectedLevel,
      selfLevel: expectedLevel,
      status: 'ดำเนินการแล้วเสร็จ',
      evidence: { note: 'สอนและถ่ายทอดกระบวนการเบิกจ่ายให้บุคลากรใหม่', links: [] },
      checkedItems: expectedLevel >= 3 ? [1, 2, 3] : [1, 2],
    },
    {
      code: 'F3',
      expectedLevel,
      selfLevel: expectedLevel,
      status: 'ดำเนินการแล้วเสร็จ',
      evidence: { note: 'มีคู่มือปฏิบัติงานการเงินและการจัดซื้อพัสดุ', links: [] },
      checkedItems: expectedLevel >= 3 ? [1, 2, 3] : [1, 2],
    },
    {
      code: 'F4',
      expectedLevel,
      selfLevel: expectedLevel,
      status: 'ดำเนินการแล้วเสร็จ',
      evidence: { note: 'ใช้ระบบ ERP/e-Procurement คล่องแคล่ว', links: [] },
      checkedItems: expectedLevel >= 3 ? [1, 2, 3] : [1, 2],
    },
    {
      code: 'F5',
      expectedLevel,
      selfLevel: expectedLevel,
      status: 'ดำเนินการแล้วเสร็จ',
      evidence: { note: 'จัดทำแผนจัดซื้อจัดจ้างล่วงหน้า', links: [] },
      checkedItems: expectedLevel >= 3 ? [1, 2, 3] : [1, 2],
    },
  ];
}

export function createInitialEvaluations(): Record<string, Evaluation> {
  const evals: Record<string, Evaluation> = {};
  const periodId = '2568-R1';

  // Seed sample evaluation for U01 (with partial evaluator scores to show calculation)
  evals[`U01_${periodId}`] = {
    id: `eval-U01-${periodId}`,
    employeeId: 'U01',
    periodId,
    formStatus: 'ส่งแล้ว',
    submittedAt: '2024-12-28T09:00:00Z',
    updatedAt: '2024-12-28T09:00:00Z',
    kpis: [
      {
        id: 'kpi-u01-1',
        category: 'main',
        order: 1,
        strategicGoal: 'การบริหารจัดการสำนักงานเลขานุการอย่างมีประสิทธิภาพ',
        indicator: 'ร้อยละความสำเร็จของแผนการบริหารงานและงบประมาณสำนักงาน',
        importance: 'มากที่สุด',
        weight: 50,
        criteria: {
          outstanding: 'บรรลุเป้าหมายเกิน 100% มีนวัตกรรมลดขั้นตอน',
          achieved: 'บรรลุเป้าหมาย 100%',
          fair: 'บรรลุเป้าหมาย 80-99%',
          failed: 'ต่ำกว่า 80%',
        },
        status: 'ดำเนินการแล้วเสร็จ',
        actualValue: '100% ตามแผนงานสำนักงานเลขานุการ',
        selfLevel: 'Outstanding',
        evidence: {
          note: 'รายงานผลการบริหารจัดการสำนักงานเลขานุการ ประจำปีงบประมาณ',
          links: ['https://drive.google.com/drive/u01-report'],
        },
        updatedAt: '2024-12-28T09:00:00Z',
      },
      {
        id: 'kpi-u01-2',
        category: 'main',
        order: 2,
        strategicGoal: 'การพัฒนาระบบดิจิทัลและการประสานงานทุกกลุ่มงาน',
        indicator: 'ระบบสารสนเทศและการกำกับติดตามงานในคณะ',
        importance: 'มาก',
        weight: 50,
        criteria: {
          outstanding: 'นำระบบออนไลน์มาใช้ครบทุกกลุ่มงาน',
          achieved: 'นำระบบออนไลน์มาใช้ในงานสำคัญ',
          fair: 'ระหว่างพัฒนาระบบ',
          failed: 'ไม่สามารถพัฒนาระบบได้',
        },
        status: 'ดำเนินการแล้วเสร็จ',
        actualValue: 'พัฒนาระบบติดตามและระบบ PMS บุคลากร',
        selfLevel: 'Outstanding',
        evidence: {
          note: 'ระบบ PMS และแดชบอร์ดติดตามงาน',
          links: [],
        },
        updatedAt: '2024-12-28T09:00:00Z',
      },
    ],
    competencies: createDefaultCompetencies('หัวหน้าสำนักงานเลขานุการ', 1),
    evaluatorScores: {
      E01: {
        evaluatorId: 'E01',
        achievementScore: 68.5,
        behaviorScore: 29.0,
        comment: 'ผลงานดีเยี่ยม มีความเป็นผู้นำสูง และประสานงานได้อย่างราบรื่น',
        submittedAt: '2025-01-05T14:30:00Z',
      },
      E02: {
        evaluatorId: 'E02',
        achievementScore: 0,
        behaviorScore: 28.5,
        comment: 'ให้ความร่วมมือกับฝ่ายวิชาการเป็นอย่างดีมาก',
        submittedAt: '2025-01-06T10:15:00Z',
      },
      E03: {
        evaluatorId: 'E03',
        achievementScore: 0,
        behaviorScore: 28.0,
        comment: 'สนับสนุนกิจกรรมนิสิตอย่างรวดเร็วและมีประสิทธิภาพ',
        submittedAt: '2025-01-06T11:00:00Z',
      },
      E04: {
        evaluatorId: 'E04',
        achievementScore: 0,
        behaviorScore: 29.0,
        comment: 'การประสานงานวิจัยและบริการวิชาการยอดเยี่ยม',
        submittedAt: '2025-01-07T09:45:00Z',
      },
      E05: {
        evaluatorId: 'E05',
        achievementScore: 0,
        behaviorScore: 28.5,
        comment: 'สอดคล้องกับแผนยุทธศาสตร์และการประกันคุณภาพ',
        submittedAt: '2025-01-07T13:20:00Z',
      },
    },
  };

  // Seed sample for H01
  evals[`H01_${periodId}`] = {
    id: `eval-H01-${periodId}`,
    employeeId: 'H01',
    periodId,
    formStatus: 'ส่งแล้ว',
    submittedAt: '2024-12-25T11:00:00Z',
    updatedAt: '2024-12-25T11:00:00Z',
    kpis: [
      {
        id: 'kpi-h01-1',
        category: 'main',
        order: 1,
        strategicGoal: 'การบริหารจัดการงานบริการการศึกษา',
        indicator: 'ความสำเร็จในการจัดการเรียนการสอนและตารางสอบ',
        importance: 'มากที่สุด',
        weight: 60,
        criteria: {
          outstanding: 'ครบถ้วน ถูกต้อง 100% ไม่มีข้อร้องเรียน',
          achieved: 'ครบถ้วนตามกำหนด',
          fair: 'มีความล่าช้าเล็กน้อย',
          failed: 'ไม่เป็นไปตามกำหนด',
        },
        status: 'ดำเนินการแล้วเสร็จ',
        actualValue: 'ดำเนินการเรียบร้อย 100%',
        selfLevel: 'Outstanding',
        evidence: { note: 'รายงานสรุปการศึกษาและตารางเรียนตารางสอบ', links: [] },
        updatedAt: '2024-12-25T11:00:00Z',
      },
      {
        id: 'kpi-h01-2',
        category: 'main',
        order: 2,
        strategicGoal: 'การดูแลนิสิตและการลงทะเบียน',
        indicator: 'ระบบบริการนิสิตและการให้คำปรึกษา',
        importance: 'มาก',
        weight: 40,
        criteria: {
          outstanding: 'ความพึงพอใจนิสิตมากกว่า 90%',
          achieved: 'ความพึงพอใจนิสิตมากกว่า 80%',
          fair: 'ความพึงพอใจ 70-80%',
          failed: 'ต่ำกว่า 70%',
        },
        status: 'ดำเนินการแล้วเสร็จ',
        actualValue: 'ความพึงพอใจ 92.5%',
        selfLevel: 'Outstanding',
        evidence: { note: 'ผลประเมินความพึงพอใจนิสิต', links: [] },
        updatedAt: '2024-12-25T11:00:00Z',
      },
    ],
    competencies: createDefaultCompetencies('หัวหน้างาน', 1),
    evaluatorScores: {
      E02: {
        evaluatorId: 'E02',
        achievementScore: 67.0,
        behaviorScore: 28.5,
        comment: 'ควบคุมดูแลงานบริการการศึกษาได้เป็นอย่างดี',
        submittedAt: '2025-01-06T15:00:00Z',
      },
      U01: {
        evaluatorId: 'U01',
        achievementScore: 0,
        behaviorScore: 29.0,
        comment: 'มีความรับผิดชอบสูง รายงานผลงานสม่ำเสมอ',
        submittedAt: '2025-01-07T10:00:00Z',
      },
    },
    itemScores: {
      [`crit-ach-${periodId}-all-ACH-1_self`]: {
        id: `crit-ach-${periodId}-all-ACH-1_self`,
        evaluationId: `eval-H01-${periodId}`,
        criteriaId: `crit-ach-${periodId}-all-ACH-1`,
        raterId: 'self',
        raterType: 'self',
        score: 5,
        updatedAt: '2024-12-25T11:00:00Z',
      },
      [`crit-ach-${periodId}-all-ACH-2_self`]: {
        id: `crit-ach-${periodId}-all-ACH-2_self`,
        evaluationId: `eval-H01-${periodId}`,
        criteriaId: `crit-ach-${periodId}-all-ACH-2`,
        raterId: 'self',
        raterType: 'self',
        score: 4,
        updatedAt: '2024-12-25T11:00:00Z',
      },
      [`crit-ach-${periodId}-all-ACH-3_self`]: {
        id: `crit-ach-${periodId}-all-ACH-3_self`,
        evaluationId: `eval-H01-${periodId}`,
        criteriaId: `crit-ach-${periodId}-all-ACH-3`,
        raterId: 'self',
        raterType: 'self',
        score: 4,
        updatedAt: '2024-12-25T11:00:00Z',
      },
      // Evaluator E02 scoring H01
      [`crit-ach-${periodId}-all-ACH-1_E02`]: {
        id: `crit-ach-${periodId}-all-ACH-1_E02`,
        evaluationId: `eval-H01-${periodId}`,
        criteriaId: `crit-ach-${periodId}-all-ACH-1`,
        raterId: 'E02',
        raterType: 'evaluator',
        score: 5,
        comment: 'ผลงานเป็นไปตามเกณฑ์',
        updatedAt: '2025-01-06T15:00:00Z',
      },
      [`crit-ach-${periodId}-all-ACH-2_E02`]: {
        id: `crit-ach-${periodId}-all-ACH-2_E02`,
        evaluationId: `eval-H01-${periodId}`,
        criteriaId: `crit-ach-${periodId}-all-ACH-2`,
        raterId: 'E02',
        raterType: 'evaluator',
        score: 4,
        updatedAt: '2025-01-06T15:00:00Z',
      },
      [`crit-ach-${periodId}-all-ACH-3_E02`]: {
        id: `crit-ach-${periodId}-all-ACH-3_E02`,
        evaluationId: `eval-H01-${periodId}`,
        criteriaId: `crit-ach-${periodId}-all-ACH-3`,
        raterId: 'E02',
        raterType: 'evaluator',
        score: 4,
        updatedAt: '2025-01-06T15:00:00Z',
      },
      // Behavior items for H01
      [`crit-beh-${periodId}-C1_self`]: { id: `crit-beh-${periodId}-C1_self`, evaluationId: `eval-H01-${periodId}`, criteriaId: `crit-beh-${periodId}-C1`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-25T11:00:00Z' },
      [`crit-beh-${periodId}-C2_self`]: { id: `crit-beh-${periodId}-C2_self`, evaluationId: `eval-H01-${periodId}`, criteriaId: `crit-beh-${periodId}-C2`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-25T11:00:00Z' },
      [`crit-beh-${periodId}-C3_self`]: { id: `crit-beh-${periodId}-C3_self`, evaluationId: `eval-H01-${periodId}`, criteriaId: `crit-beh-${periodId}-C3`, raterId: 'self', raterType: 'self', score: 4, updatedAt: '2024-12-25T11:00:00Z' },
      [`crit-beh-${periodId}-C4_self`]: { id: `crit-beh-${periodId}-C4_self`, evaluationId: `eval-H01-${periodId}`, criteriaId: `crit-beh-${periodId}-C4`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-25T11:00:00Z' },
      [`crit-beh-${periodId}-C5_self`]: { id: `crit-beh-${periodId}-C5_self`, evaluationId: `eval-H01-${periodId}`, criteriaId: `crit-beh-${periodId}-C5`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-25T11:00:00Z' },
      [`crit-beh-${periodId}-F1_self`]: { id: `crit-beh-${periodId}-F1_self`, evaluationId: `eval-H01-${periodId}`, criteriaId: `crit-beh-${periodId}-F1`, raterId: 'self', raterType: 'self', score: 4, updatedAt: '2024-12-25T11:00:00Z' },
      [`crit-beh-${periodId}-ENV_self`]: { id: `crit-beh-${periodId}-ENV_self`, evaluationId: `eval-H01-${periodId}`, criteriaId: `crit-beh-${periodId}-ENV`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-25T11:00:00Z' },

      [`crit-beh-${periodId}-C1_E02`]: { id: `crit-beh-${periodId}-C1_E02`, evaluationId: `eval-H01-${periodId}`, criteriaId: `crit-beh-${periodId}-C1`, raterId: 'E02', raterType: 'evaluator', score: 5, updatedAt: '2025-01-06T15:00:00Z' },
      [`crit-beh-${periodId}-C2_E02`]: { id: `crit-beh-${periodId}-C2_E02`, evaluationId: `eval-H01-${periodId}`, criteriaId: `crit-beh-${periodId}-C2`, raterId: 'E02', raterType: 'evaluator', score: 5, updatedAt: '2025-01-06T15:00:00Z' },
      [`crit-beh-${periodId}-C3_E02`]: { id: `crit-beh-${periodId}-C3_E02`, evaluationId: `eval-H01-${periodId}`, criteriaId: `crit-beh-${periodId}-C3`, raterId: 'E02', raterType: 'evaluator', score: 4, updatedAt: '2025-01-06T15:00:00Z' },
      [`crit-beh-${periodId}-C4_E02`]: { id: `crit-beh-${periodId}-C4_E02`, evaluationId: `eval-H01-${periodId}`, criteriaId: `crit-beh-${periodId}-C4`, raterId: 'E02', raterType: 'evaluator', score: 5, updatedAt: '2025-01-06T15:00:00Z' },
      [`crit-beh-${periodId}-C5_E02`]: { id: `crit-beh-${periodId}-C5_E02`, evaluationId: `eval-H01-${periodId}`, criteriaId: `crit-beh-${periodId}-C5`, raterId: 'E02', raterType: 'evaluator', score: 5, updatedAt: '2025-01-06T15:00:00Z' },
      [`crit-beh-${periodId}-F1_E02`]: { id: `crit-beh-${periodId}-F1_E02`, evaluationId: `eval-H01-${periodId}`, criteriaId: `crit-beh-${periodId}-F1`, raterId: 'E02', raterType: 'evaluator', score: 4, updatedAt: '2025-01-06T15:00:00Z' },
      [`crit-beh-${periodId}-ENV_E02`]: { id: `crit-beh-${periodId}-ENV_E02`, evaluationId: `eval-H01-${periodId}`, criteriaId: `crit-beh-${periodId}-ENV`, raterId: 'E02', raterType: 'evaluator', score: 4, updatedAt: '2025-01-06T15:00:00Z' },
    },
  };

  // Seed itemScores for U01
  evals[`U01_${periodId}`].itemScores = {
    [`crit-ach-${periodId}-all-ACH-1_self`]: { id: `crit-ach-${periodId}-all-ACH-1_self`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-ach-${periodId}-all-ACH-1`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-28T09:00:00Z' },
    [`crit-ach-${periodId}-all-ACH-2_self`]: { id: `crit-ach-${periodId}-all-ACH-2_self`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-ach-${periodId}-all-ACH-2`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-28T09:00:00Z' },
    [`crit-ach-${periodId}-all-ACH-3_self`]: { id: `crit-ach-${periodId}-all-ACH-3_self`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-ach-${periodId}-all-ACH-3`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-28T09:00:00Z' },
    [`crit-ach-${periodId}-all-ACH-1_E01`]: { id: `crit-ach-${periodId}-all-ACH-1_E01`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-ach-${periodId}-all-ACH-1`, raterId: 'E01', raterType: 'evaluator', score: 5, updatedAt: '2025-01-05T14:30:00Z' },
    [`crit-ach-${periodId}-all-ACH-2_E01`]: { id: `crit-ach-${periodId}-all-ACH-2_E01`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-ach-${periodId}-all-ACH-2`, raterId: 'E01', raterType: 'evaluator', score: 5, updatedAt: '2025-01-05T14:30:00Z' },
    [`crit-ach-${periodId}-all-ACH-3_E01`]: { id: `crit-ach-${periodId}-all-ACH-3_E01`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-ach-${periodId}-all-ACH-3`, raterId: 'E01', raterType: 'evaluator', score: 4, updatedAt: '2025-01-05T14:30:00Z' },

    [`crit-beh-${periodId}-C1_self`]: { id: `crit-beh-${periodId}-C1_self`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-beh-${periodId}-C1`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-28T09:00:00Z' },
    [`crit-beh-${periodId}-C2_self`]: { id: `crit-beh-${periodId}-C2_self`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-beh-${periodId}-C2`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-28T09:00:00Z' },
    [`crit-beh-${periodId}-C3_self`]: { id: `crit-beh-${periodId}-C3_self`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-beh-${periodId}-C3`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-28T09:00:00Z' },
    [`crit-beh-${periodId}-C4_self`]: { id: `crit-beh-${periodId}-C4_self`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-beh-${periodId}-C4`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-28T09:00:00Z' },
    [`crit-beh-${periodId}-C5_self`]: { id: `crit-beh-${periodId}-C5_self`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-beh-${periodId}-C5`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-28T09:00:00Z' },
    [`crit-beh-${periodId}-F1_self`]: { id: `crit-beh-${periodId}-F1_self`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-beh-${periodId}-F1`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-28T09:00:00Z' },
    [`crit-beh-${periodId}-ENV_self`]: { id: `crit-beh-${periodId}-ENV_self`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-beh-${periodId}-ENV`, raterId: 'self', raterType: 'self', score: 5, updatedAt: '2024-12-28T09:00:00Z' },

    [`crit-beh-${periodId}-C1_E01`]: { id: `crit-beh-${periodId}-C1_E01`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-beh-${periodId}-C1`, raterId: 'E01', raterType: 'evaluator', score: 5, updatedAt: '2025-01-05T14:30:00Z' },
    [`crit-beh-${periodId}-C2_E01`]: { id: `crit-beh-${periodId}-C2_E01`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-beh-${periodId}-C2`, raterId: 'E01', raterType: 'evaluator', score: 5, updatedAt: '2025-01-05T14:30:00Z' },
    [`crit-beh-${periodId}-C3_E01`]: { id: `crit-beh-${periodId}-C3_E01`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-beh-${periodId}-C3`, raterId: 'E01', raterType: 'evaluator', score: 5, updatedAt: '2025-01-05T14:30:00Z' },
    [`crit-beh-${periodId}-C4_E01`]: { id: `crit-beh-${periodId}-C4_E01`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-beh-${periodId}-C4`, raterId: 'E01', raterType: 'evaluator', score: 5, updatedAt: '2025-01-05T14:30:00Z' },
    [`crit-beh-${periodId}-C5_E01`]: { id: `crit-beh-${periodId}-C5_E01`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-beh-${periodId}-C5`, raterId: 'E01', raterType: 'evaluator', score: 5, updatedAt: '2025-01-05T14:30:00Z' },
    [`crit-beh-${periodId}-F1_E01`]: { id: `crit-beh-${periodId}-F1_E01`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-beh-${periodId}-F1`, raterId: 'E01', raterType: 'evaluator', score: 5, updatedAt: '2025-01-05T14:30:00Z' },
    [`crit-beh-${periodId}-ENV_E01`]: { id: `crit-beh-${periodId}-ENV_E01`, evaluationId: `eval-U01-${periodId}`, criteriaId: `crit-beh-${periodId}-ENV`, raterId: 'E01', raterType: 'evaluator', score: 4, updatedAt: '2025-01-05T14:30:00Z' },
  };

  // Helper to add seed evaluation for other staff
  const addStaffEval = (
    empId: string,
    positionTitle: string,
    scoresByCompetency: { [code: string]: number },
    evaluatorScoresMap: Record<string, { ach: number; beh: number; comment?: string }>
  ) => {
    const itemScores: Record<string, ItemScore> = {};

    // Self behavior
    Object.entries(scoresByCompetency).forEach(([code, score]) => {
      const critId = `crit-beh-${periodId}-${code}`;
      itemScores[`${critId}_self`] = {
        id: `${critId}_self`,
        evaluationId: `eval-${empId}-${periodId}`,
        criteriaId: critId,
        raterId: 'self',
        raterType: 'self',
        score,
        updatedAt: '2024-12-26T10:00:00Z',
      };
    });

    // Evaluator items
    Object.keys(evaluatorScoresMap).forEach((raterId) => {
      Object.entries(scoresByCompetency).forEach(([code, baseScore]) => {
        const critId = `crit-beh-${periodId}-${code}`;
        // Add minor variation or test diff
        const variedScore = Math.max(1, Math.min(5, baseScore));
        itemScores[`${critId}_${raterId}`] = {
          id: `${critId}_${raterId}`,
          evaluationId: `eval-${empId}-${periodId}`,
          criteriaId: critId,
          raterId,
          raterType: 'evaluator',
          score: variedScore,
          updatedAt: '2025-01-06T10:00:00Z',
        };
      });
    });

    const formattedEvalScores: Record<string, any> = {};
    Object.entries(evaluatorScoresMap).forEach(([rId, s]) => {
      formattedEvalScores[rId] = {
        evaluatorId: rId,
        achievementScore: s.ach,
        behaviorScore: s.beh,
        comment: s.comment || 'ผลการปฏิบัติงานเป็นไปตามเกณฑ์มาตรฐาน',
        submittedAt: '2025-01-06T12:00:00Z',
      };
    });

    evals[`${empId}_${periodId}`] = {
      id: `eval-${empId}-${periodId}`,
      employeeId: empId,
      periodId,
      formStatus: 'ส่งแล้ว',
      submittedAt: '2024-12-26T10:00:00Z',
      updatedAt: '2024-12-26T10:00:00Z',
      kpis: [],
      competencies: createDefaultCompetencies(positionTitle as any, 1),
      evaluatorScores: formattedEvalScores,
      itemScores,
    };
  };

  // Seed staff in EDU: S01, S02, S03, S04, S05
  addStaffEval('S01', 'นักวิชาการศึกษา ชำนาญการ', { C1: 5, C2: 5, C3: 4, C4: 5, C5: 4, F1: 5, ENV: 4 }, {
    E02: { ach: 68.0, beh: 28.5 },
    E05: { ach: 67.0, beh: 28.0 },
    H01: { ach: 0, beh: 29.0 },
    U01: { ach: 0, beh: 28.5 },
    E01: { ach: 0, beh: 28.5 },
  });

  addStaffEval('S02', 'นักวิชาการศึกษา ปฏิบัติการ', { C1: 4, C2: 4, C3: 4, C4: 4, C5: 4, F1: 3, ENV: 4 }, {
    E02: { ach: 64.0, beh: 26.5 },
    H01: { ach: 0, beh: 26.0 },
    U01: { ach: 0, beh: 26.5 },
    E01: { ach: 0, beh: 26.0 },
  });

  addStaffEval('S03', 'นักวิชาการศึกษา ปฏิบัติการ', { C1: 4, C2: 5, C3: 3, C4: 5, C5: 5, F1: 4, ENV: 4 }, {
    E03: { ach: 66.0, beh: 27.5 },
    H01: { ach: 0, beh: 27.0 },
    U01: { ach: 0, beh: 27.5 },
    E01: { ach: 0, beh: 27.0 },
  });

  addStaffEval('S04', 'นักวิชาการโสตทัศนศึกษา ชำนาญการ', { C1: 5, C2: 4, C3: 5, C4: 4, C5: 4, F1: 5, ENV: 4 }, {
    E02: { ach: 66.5, beh: 28.0 },
    H01: { ach: 0, beh: 27.5 },
    U01: { ach: 0, beh: 28.0 },
    E01: { ach: 0, beh: 28.0 },
  });

  addStaffEval('S05', 'นักวิชาการโสตทัศนศึกษา ปฏิบัติการ', { C1: 3, C2: 4, C3: 3, C4: 4, C5: 4, F1: 4, ENV: 3 }, {
    E03: { ach: 62.0, beh: 25.0 },
    H01: { ach: 0, beh: 24.5 },
    U01: { ach: 0, beh: 25.0 },
    E01: { ach: 0, beh: 25.0 },
  });

  // Seed staff in RES: H02, S06
  addStaffEval('H02', 'หัวหน้างานวิจัยและพัฒนาคุณภาพการศึกษา', { C1: 5, C2: 4, C3: 5, C4: 5, C5: 4, F1: 5, ENV: 4 }, {
    E04: { ach: 67.5, beh: 28.5 },
    E05: { ach: 68.0, beh: 28.5 },
    E01: { ach: 0, beh: 28.5 },
    U01: { ach: 0, beh: 29.0 },
    H01: { ach: 0, beh: 28.0 },
    H03: { ach: 0, beh: 28.0 },
  });

  addStaffEval('S06', 'เจ้าหน้าที่บริหารงานทั่วไป ปฏิบัติการ', { C1: 4, C2: 4, C3: 4, C4: 5, C5: 4, F1: 4, ENV: 4 }, {
    E04: { ach: 65.0, beh: 27.0 },
    H02: { ach: 0, beh: 27.0 },
    U01: { ach: 0, beh: 27.5 },
    E01: { ach: 0, beh: 27.0 },
  });

  // Seed staff in FIN: H03, S07, S08
  addStaffEval('H03', 'หัวหน้างานการเงินและพัสดุ', { C1: 5, C2: 4, C3: 5, C4: 5, C5: 5, F1: 5, ENV: 4 }, {
    E01: { ach: 68.5, beh: 29.0 },
    U01: { ach: 69.0, beh: 29.0 },
    H01: { ach: 0, beh: 28.5 },
    H02: { ach: 0, beh: 28.5 },
  });

  addStaffEval('S07', 'นักวิชาการเงินและบัญชี ปฏิบัติการ', { C1: 4, C2: 4, C3: 4, C4: 5, C5: 4, F1: 4, ENV: 4 }, {
    E01: { ach: 65.0, beh: 27.5 },
    U01: { ach: 66.0, beh: 27.5 },
    H03: { ach: 0, beh: 27.5 },
  });

  return evals;
}
