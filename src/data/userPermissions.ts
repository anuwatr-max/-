import { MainDepartmentId, TaskItem } from '../types';
import { DEPARTMENTS } from './departments';

export type UserRole = 'super_admin' | 'department_admin' | 'unit_contributor' | 'viewer';

export interface UserPermissionConfig {
  email: string;
  name: string;
  role: UserRole;
  allowedDepartmentIds: MainDepartmentId[];
  allowedUnitIds?: string[]; // กำหนดเจาะจงเฉพาะหน่วยงานย่อย (เช่น ['1.4'] หน่วยอาคารสถานที่และยานพาหนะ)
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  departmentTitle: string;
  canManageSheet: boolean;
}

// ตารางกำหนดสิทธิ์ผู้ใช้งานตามบัญชี Google Account (@nu.ac.th)
export const ASSIGNED_USERS_PERMISSIONS: Record<string, UserPermissionConfig> = {
  // 1. สุพิชญา เรื่องลือ - สามารถเพิ่ม แก้ไข เฉพาะในงานบริการการศึกษาได้
  'suphitchayar@nu.ac.th': {
    email: 'suphitchayar@nu.ac.th',
    name: 'สุพิชญา เรื่องลือ',
    role: 'department_admin',
    allowedDepartmentIds: ['academic'],
    canAdd: true,
    canEdit: true,
    canDelete: true,
    departmentTitle: 'งานบริการการศึกษา',
    canManageSheet: false,
  },

  // 2. นางสาวสุนิษา แสนศรี - สามารถเพิ่ม แก้ไข เฉพาะในงานวิจัยและพัฒนาคุณภาพการศึกษาได้
  'sunisasan@nu.ac.th': {
    email: 'sunisasan@nu.ac.th',
    name: 'นางสาวสุนิษา แสนศรี',
    role: 'department_admin',
    allowedDepartmentIds: ['research'],
    canAdd: true,
    canEdit: true,
    canDelete: true,
    departmentTitle: 'งานวิจัยและพัฒนาคุณภาพการศึกษา',
    canManageSheet: false,
  },

  // 3. นางสาวกันยารัตน์ สมกุล - สามารถเพิ่ม แก้ไข เฉพาะในงานการเงินและพัสดุได้
  'kanyaratso@nu.ac.th': {
    email: 'kanyaratso@nu.ac.th',
    name: 'นางสาวกันยารัตน์ สมกุล',
    role: 'department_admin',
    allowedDepartmentIds: ['finance'],
    canAdd: true,
    canEdit: true,
    canDelete: true,
    departmentTitle: 'งานการเงินและพัสดุ',
    canManageSheet: false,
  },

  // 4. นายวิทยากร สังวาลย์วงค์ - สามารถเพิ่มงานใหม่ได้เฉพาะหน่วยอาคารสถานที่ สำหรับการแก้ไขและลบทำไม่ได้
  'vittayakorns@nu.ac.th': {
    email: 'vittayakorns@nu.ac.th',
    name: 'นายวิทยากร สังวาลย์วงค์',
    role: 'unit_contributor',
    allowedDepartmentIds: ['admin'],
    allowedUnitIds: ['1.4'], // 1.4 = หน่วยอาคารสถานที่และยานพาหนะ
    canAdd: true,
    canEdit: false,
    canDelete: false,
    departmentTitle: 'งานธุรการ (หน่วยอาคารสถานที่และยานพาหนะ)',
    canManageSheet: false,
  },

  // 5. นางสาวธัญญรัตน์ ไชยวงศ์ - หน่วยสารบรรณ / หน่วยบุคคล (เพิ่มงานได้ แก้ไข/ลบไม่ได้)
  'thanyaratc@nu.ac.th': {
    email: 'thanyaratc@nu.ac.th',
    name: 'นางสาวธัญญรัตน์ ไชยวงศ์',
    role: 'unit_contributor',
    allowedDepartmentIds: ['admin'],
    allowedUnitIds: ['1.2', '1.3'], // 1.2 หน่วยสารบรรณ, 1.3 หน่วยบุคคล
    canAdd: true,
    canEdit: false,
    canDelete: false,
    departmentTitle: 'งานธุรการ (หน่วยสารบรรณ / หน่วยบุคคล)',
    canManageSheet: false,
  },

  // 6. นายรภัทร มงคลเขมภัทร์ - หน่วยอาคารสถานที่และยานพาหนะ (เพิ่มงานได้ แก้ไข/ลบไม่ได้)
  'rapatm@nu.ac.th': {
    email: 'rapatm@nu.ac.th',
    name: 'นายรภัทร มงคลเขมภัทร์',
    role: 'unit_contributor',
    allowedDepartmentIds: ['admin'],
    allowedUnitIds: ['1.4'], // 1.4 หน่วยอาคารสถานที่และยานพาหนะ
    canAdd: true,
    canEdit: false,
    canDelete: false,
    departmentTitle: 'งานธุรการ (หน่วยอาคารสถานที่และยานพาหนะ)',
    canManageSheet: false,
  },

  // 7. นางสาวฐิติกัญญารัตน์ บุตรจันทร์จรัส - หน่วยวิชาการระดับปริญญาตรี / หน่วยแผน (เพิ่มงานได้ แก้ไข/ลบไม่ได้)
  'pawineeb@nu.ac.th': {
    email: 'pawineeb@nu.ac.th',
    name: 'นางสาวฐิติกัญญารัตน์ บุตรจันทร์จรัส',
    role: 'unit_contributor',
    allowedDepartmentIds: ['academic', 'admin'],
    allowedUnitIds: ['2.1', '1.1'], // 2.1 หน่วยวิชาการระดับปริญญาตรี, 1.1 หน่วยแผน
    canAdd: true,
    canEdit: false,
    canDelete: false,
    departmentTitle: 'หน่วยวิชาการระดับปริญญาตรี / หน่วยแผน',
    canManageSheet: false,
  },

  // 8. นางสาวศศิธร สถาพร - หน่วยวิชาการระดับปริญญาตรี / หน่วยวิชาการระดับบัณฑิตศึกษา (เพิ่มงานได้ แก้ไข/ลบไม่ได้)
  'sasithorns@nu.ac.th': {
    email: 'sasithorns@nu.ac.th',
    name: 'นางสาวศศิธร สถาพร',
    role: 'unit_contributor',
    allowedDepartmentIds: ['academic'],
    allowedUnitIds: ['2.1', '2.2'], // 2.1 ปริญญาตรี, 2.2 บัณฑิตศึกษา
    canAdd: true,
    canEdit: false,
    canDelete: false,
    departmentTitle: 'งานบริการการศึกษา (ปริญญาตรี / บัณฑิตศึกษา)',
    canManageSheet: false,
  },

  // 9. นายมารุต จีนน่วม - หน่วยกิจการนิสิตและศิษย์เก่าสัมพันธ์ / หน่วยประชาสัมพันธ์และสื่อสารองค์กร (เพิ่มงานได้ แก้ไข/ลบไม่ได้)
  'marutc@nu.ac.th': {
    email: 'marutc@nu.ac.th',
    name: 'นายมารุต จีนน่วม',
    role: 'unit_contributor',
    allowedDepartmentIds: ['academic'],
    allowedUnitIds: ['2.3', '2.4'], // 2.3 กิจการนิสิตฯ, 2.4 ประชาสัมพันธ์ฯ
    canAdd: true,
    canEdit: false,
    canDelete: false,
    departmentTitle: 'งานบริการการศึกษา (กิจการนิสิตฯ / ประชาสัมพันธ์ฯ)',
    canManageSheet: false,
  },

  // 10. นายรัฐภูมิ กล่ำจันทร์ - หน่วยวิชาการระดับปริญญาตรี / หน่วยวิชาการระดับบัณฑิตศึกษา (เพิ่มงานได้ แก้ไข/ลบไม่ได้)
  'ratthapumk@nu.ac.th': {
    email: 'ratthapumk@nu.ac.th',
    name: 'นายรัฐภูมิ กล่ำจันทร์',
    role: 'unit_contributor',
    allowedDepartmentIds: ['academic'],
    allowedUnitIds: ['2.1', '2.2'], // 2.1 ปริญญาตรี, 2.2 บัณฑิตศึกษา
    canAdd: true,
    canEdit: false,
    canDelete: false,
    departmentTitle: 'งานบริการการศึกษา (ปริญญาตรี / บัณฑิตศึกษา)',
    canManageSheet: false,
  },

  // 11. นางสาวปัทมาวดี เปรมกาศ - หน่วยกิจการนิสิตและศิษย์เก่าสัมพันธ์ / หน่วยประชาสัมพันธ์และสื่อสารองค์กร (เพิ่มงานได้ แก้ไข/ลบไม่ได้)
  'pattamawadeep@nu.ac.th': {
    email: 'pattamawadeep@nu.ac.th',
    name: 'นางสาวปัทมาวดี เปรมกาศ',
    role: 'unit_contributor',
    allowedDepartmentIds: ['academic'],
    allowedUnitIds: ['2.3', '2.4'], // 2.3 กิจการนิสิตฯ, 2.4 ประชาสัมพันธ์ฯ
    canAdd: true,
    canEdit: false,
    canDelete: false,
    departmentTitle: 'งานบริการการศึกษา (กิจการนิสิตฯ / ประชาสัมพันธ์ฯ)',
    canManageSheet: false,
  },

  // 12. นายนันทวุฒิ เงินจันทร์ - หน่วยเทคโนโลยีสารสนเทศ (เพิ่มงานได้ แก้ไข/ลบไม่ได้)
  'nantawudthn@nu.ac.th': {
    email: 'nantawudthn@nu.ac.th',
    name: 'นายนันทวุฒิ เงินจันทร์',
    role: 'unit_contributor',
    allowedDepartmentIds: ['research'],
    allowedUnitIds: ['3.1'], // 3.1 หน่วยเทคโนโลยีสารสนเทศ
    canAdd: true,
    canEdit: false,
    canDelete: false,
    departmentTitle: 'งานวิจัยฯ (หน่วยเทคโนโลยีสารสนเทศ)',
    canManageSheet: false,
  },

  // 13. นางสาวธัญพิชชา เรืองคำ - หน่วยบริการวิชาการ (เพิ่มงานได้ แก้ไข/ลบไม่ได้)
  'thanphitchar@nu.ac.th': {
    email: 'thanphitchar@nu.ac.th',
    name: 'นางสาวธัญพิชชา เรืองคำ',
    role: 'unit_contributor',
    allowedDepartmentIds: ['research'],
    allowedUnitIds: ['3.3'], // 3.3 หน่วยบริการวิชาการ
    canAdd: true,
    canEdit: false,
    canDelete: false,
    departmentTitle: 'งานวิจัยฯ (หน่วยบริการวิชาการ)',
    canManageSheet: false,
  },

  // 14. นางสาวกุลพรภัสร์ สมรูป - หน่วยการเงิน (เพิ่มงานได้ แก้ไข/ลบไม่ได้)
  'kunlapronpass@nu.ac.th': {
    email: 'kunlapronpass@nu.ac.th',
    name: 'นางสาวกุลพรภัสร์ สมรูป',
    role: 'unit_contributor',
    allowedDepartmentIds: ['finance'],
    allowedUnitIds: ['4.1'], // 4.1 หน่วยการเงิน
    canAdd: true,
    canEdit: false,
    canDelete: false,
    departmentTitle: 'งานการเงินและพัสดุ (หน่วยการเงิน)',
    canManageSheet: false,
  },

  // 15. นางสาวมัลลิกา อินสาย - หน่วยพัสดุ (เพิ่มงานได้ แก้ไข/ลบไม่ได้)
  'mullikai@nu.ac.th': {
    email: 'mullikai@nu.ac.th',
    name: 'นางสาวมัลลิกา อินสาย',
    role: 'unit_contributor',
    allowedDepartmentIds: ['finance'],
    allowedUnitIds: ['4.3'], // 4.3 หน่วยพัสดุ
    canAdd: true,
    canEdit: false,
    canDelete: false,
    departmentTitle: 'งานการเงินและพัสดุ (หน่วยพัสดุ)',
    canManageSheet: false,
  },

  // 16. นางสาวเบญจมาภรณ์ พึ่งแก้ว - หน่วยพัสดุ (เพิ่มงานได้ แก้ไข/ลบไม่ได้)
  'benjamaponp@nu.ac.th': {
    email: 'benjamaponp@nu.ac.th',
    name: 'นางสาวเบญจมาภรณ์ พึ่งแก้ว',
    role: 'unit_contributor',
    allowedDepartmentIds: ['finance'],
    allowedUnitIds: ['4.3'], // 4.3 หน่วยพัสดุ
    canAdd: true,
    canEdit: false,
    canDelete: false,
    departmentTitle: 'งานการเงินและพัสดุ (หน่วยพัสดุ)',
    canManageSheet: false,
  },

  // 17. ผู้ดูแลระบบหลัก (Super Admin) - อนุวัทย์ เรืองจันทร์
  'anuwatr@nu.ac.th': {
    email: 'anuwatr@nu.ac.th',
    name: 'อนุวัทย์ เรืองจันทร์',
    role: 'super_admin',
    allowedDepartmentIds: ['admin', 'academic', 'research', 'finance'],
    canAdd: true,
    canEdit: true,
    canDelete: true,
    departmentTitle: 'ผู้ดูแลระบบหลัก (ทุกกลุ่มงาน)',
    canManageSheet: true,
  },
  'anuwat.r@nu.ac.th': {
    email: 'anuwat.r@nu.ac.th',
    name: 'อนุวัทย์ เรืองจันทร์',
    role: 'super_admin',
    allowedDepartmentIds: ['admin', 'academic', 'research', 'finance'],
    canAdd: true,
    canEdit: true,
    canDelete: true,
    departmentTitle: 'ผู้ดูแลระบบหลัก (ทุกกลุ่มงาน)',
    canManageSheet: true,
  },
  'anuwat.ruangchan@nu.ac.th': {
    email: 'anuwat.ruangchan@nu.ac.th',
    name: 'อนุวัทย์ เรืองจันทร์',
    role: 'super_admin',
    allowedDepartmentIds: ['admin', 'academic', 'research', 'finance'],
    canAdd: true,
    canEdit: true,
    canDelete: true,
    departmentTitle: 'ผู้ดูแลระบบหลัก (ทุกกลุ่มงาน)',
    canManageSheet: true,
  },
  'anuwatr@gmail.com': {
    email: 'anuwatr@gmail.com',
    name: 'อนุวัทย์ เรืองจันทร์',
    role: 'super_admin',
    allowedDepartmentIds: ['admin', 'academic', 'research', 'finance'],
    canAdd: true,
    canEdit: true,
    canDelete: true,
    departmentTitle: 'ผู้ดูแลระบบหลัก (ทุกกลุ่มงาน)',
    canManageSheet: true,
  },
  'anuwat.ruangchan@gmail.com': {
    email: 'anuwat.ruangchan@gmail.com',
    name: 'อนุวัทย์ เรืองจันทร์',
    role: 'super_admin',
    allowedDepartmentIds: ['admin', 'academic', 'research', 'finance'],
    canAdd: true,
    canEdit: true,
    canDelete: true,
    departmentTitle: 'ผู้ดูแลระบบหลัก (ทุกกลุ่มงาน)',
    canManageSheet: true,
  },
};

/**
 * ดึงการกำหนดสิทธิ์ของบัญชีอีเมลที่ล็อกอิน
 */
export const getUserPermission = (email?: string | null): UserPermissionConfig => {
  if (!email) {
    return {
      email: '',
      name: 'ผู้ใช้งานทั่วไป',
      role: 'unit_contributor',
      allowedDepartmentIds: ['admin', 'academic', 'research', 'finance'],
      canAdd: true,
      canEdit: true,
      canDelete: true,
      departmentTitle: 'ผู้ใช้งานทั่วไป (ทดลองใช้งานในเครื่อง)',
      canManageSheet: false,
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  // ตรวจสอบชื่ออนุวัทย์ เรืองจันทร์ (Super Admin)
  if (cleanEmail.includes('anuwat') || cleanEmail.includes('ruangchan')) {
    return {
      email: cleanEmail,
      name: 'อนุวัทย์ เรืองจันทร์',
      role: 'super_admin',
      allowedDepartmentIds: ['admin', 'academic', 'research', 'finance'],
      canAdd: true,
      canEdit: true,
      canDelete: true,
      departmentTitle: 'ผู้ดูแลระบบหลัก (ทุกกลุ่มงาน)',
      canManageSheet: true,
    };
  }

  const assigned = ASSIGNED_USERS_PERMISSIONS[cleanEmail];
  if (assigned) {
    return assigned;
  }

  // หากเป็นอีเมล @nu.ac.th อื่นๆ หรือบุคลากรทั่วไป
  // ให้สิทธิ์บันทึก/เพิ่มงานได้ทุกกลุ่มงาน เพื่อให้สามารถเพิ่มงานใหม่และบันทึกข้อมูลเพิ่มเติมได้เสมอ
  return {
    email: cleanEmail,
    name: email.split('@')[0],
    role: 'department_admin',
    allowedDepartmentIds: ['admin', 'academic', 'research', 'finance'],
    canAdd: true,
    canEdit: true,
    canDelete: false,
    departmentTitle: 'บุคลากร มน. (สามารถเพิ่มและบันทึกงานได้)',
    canManageSheet: false,
  };
};

/**
 * ตรวจสอบว่าผู้ใช้งานสามารถเพิ่มงานใหม่ได้หรือไม่
 */
export const canUserAddTask = (email?: string | null): boolean => {
  const perm = getUserPermission(email);
  return perm.canAdd || perm.role === 'super_admin';
};

/**
 * ตรวจสอบว่าผู้ใช้งานสามารถแก้ไขงานนี้ได้หรือไม่
 */
export const canUserEditTask = (task: TaskItem, email?: string | null): boolean => {
  const perm = getUserPermission(email);
  if (perm.role === 'super_admin') return true;
  if (!perm.canEdit) return false;
  if (perm.allowedUnitIds && perm.allowedUnitIds.length > 0) {
    return perm.allowedDepartmentIds.includes(task.departmentId) && perm.allowedUnitIds.includes(task.unitId);
  }
  return perm.allowedDepartmentIds.includes(task.departmentId);
};

/**
 * ตรวจสอบว่าผู้ใช้งานสามารถลบงานนี้ได้หรือไม่
 */
export const canUserDeleteTask = (task: TaskItem, email?: string | null): boolean => {
  const perm = getUserPermission(email);
  if (perm.role === 'super_admin') return true;
  if (!perm.canDelete) return false;
  if (perm.allowedUnitIds && perm.allowedUnitIds.length > 0) {
    return perm.allowedDepartmentIds.includes(task.departmentId) && perm.allowedUnitIds.includes(task.unitId);
  }
  return perm.allowedDepartmentIds.includes(task.departmentId);
};

/**
 * ดึงรายการกลุ่มงานที่ผู้ใช้รายนี้มีสิทธิ์เลือกเมื่อเพิ่มหรือแก้ไขงาน
 */
export const getAllowedDepartmentsForUser = (email?: string | null) => {
  const perm = getUserPermission(email);
  if (perm.role === 'super_admin') {
    return DEPARTMENTS;
  }
  const filteredDepts = DEPARTMENTS.filter(dept => perm.allowedDepartmentIds.includes(dept.id));

  // หากมีการจำกัดหน่วยงานย่อยเฉพาะ
  if (perm.allowedUnitIds && perm.allowedUnitIds.length > 0) {
    return filteredDepts
      .map(dept => ({
        ...dept,
        units: dept.units.filter(u => perm.allowedUnitIds!.includes(u.id)),
      }))
      .filter(dept => dept.units.length > 0);
  }

  return filteredDepts.length > 0 ? filteredDepts : DEPARTMENTS;
};
