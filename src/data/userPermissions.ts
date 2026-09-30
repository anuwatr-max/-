import { MainDepartmentId, TaskItem } from '../types';
import { DEPARTMENTS } from './departments';

export type UserRole = 'super_admin' | 'department_admin' | 'viewer';

export interface UserPermissionConfig {
  email: string;
  name: string;
  role: UserRole;
  allowedDepartmentIds: MainDepartmentId[];
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
    departmentTitle: 'งานบริการการศึกษา',
    canManageSheet: false,
  },

  // 2. นางสาวสุนิษา แสนศรี - สามารถเพิ่ม แก้ไข เฉพาะในงานวิจัยและพัฒนาคุณภาพการศึกษาได้
  'sunisasan@nu.ac.th': {
    email: 'sunisasan@nu.ac.th',
    name: 'นางสาวสุนิษา แสนศรี',
    role: 'department_admin',
    allowedDepartmentIds: ['research'],
    departmentTitle: 'งานวิจัยและพัฒนาคุณภาพการศึกษา',
    canManageSheet: false,
  },

  // 3. นางสาวกันยารัตน์ สมกุล - สามารถเพิ่ม แก้ไข เฉพาะในงานการเงินและพัสดุได้
  'kanyaratso@nu.ac.th': {
    email: 'kanyaratso@nu.ac.th',
    name: 'นางสาวกันยารัตน์ สมกุล',
    role: 'department_admin',
    allowedDepartmentIds: ['finance'],
    departmentTitle: 'งานการเงินและพัสดุ',
    canManageSheet: false,
  },

  // 4. ผู้ดูแลระบบหลัก (Super Admin) - อนุวัฒน์ รุ่งรุจีรัตน์
  'anuwatr@nu.ac.th': {
    email: 'anuwatr@nu.ac.th',
    name: 'อนุวัฒน์ รุ่งรุจีรัตน์',
    role: 'super_admin',
    allowedDepartmentIds: ['admin', 'academic', 'research', 'finance'],
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
      name: 'ผู้เยี่ยมชมทั่วไป',
      role: 'viewer',
      allowedDepartmentIds: [],
      departmentTitle: 'ผู้เข้าชม (อ่านอย่างเดียว)',
      canManageSheet: false,
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  const assigned = ASSIGNED_USERS_PERMISSIONS[cleanEmail];
  if (assigned) {
    return assigned;
  }

  // หากเป็นอีเมล @nu.ac.th อื่นๆ ที่ยังไม่ได้ระบุสิทธิ์เฉพาะกลุ่มงาน
  // ให้สิทธิ์ดูและตรวจสอบข้อมูล (Viewer)
  return {
    email: cleanEmail,
    name: email.split('@')[0],
    role: 'viewer',
    allowedDepartmentIds: [],
    departmentTitle: 'ผู้ใช้งาน มน. (อ่านอย่างเดียว)',
    canManageSheet: false,
  };
};

/**
 * ตรวจสอบว่าผู้ใช้งานสามารถเพิ่มงานใหม่ได้หรือไม่
 */
export const canUserAddTask = (email?: string | null): boolean => {
  const perm = getUserPermission(email);
  return perm.role === 'super_admin' || (perm.role === 'department_admin' && perm.allowedDepartmentIds.length > 0);
};

/**
 * ตรวจสอบว่าผู้ใช้งานสามารถแก้ไขงานนี้ได้หรือไม่
 */
export const canUserEditTask = (task: TaskItem, email?: string | null): boolean => {
  const perm = getUserPermission(email);
  if (perm.role === 'super_admin') return true;
  if (perm.role === 'department_admin') {
    return perm.allowedDepartmentIds.includes(task.departmentId);
  }
  return false;
};

/**
 * ตรวจสอบว่าผู้ใช้งานสามารถลบงานนี้ได้หรือไม่
 */
export const canUserDeleteTask = (task: TaskItem, email?: string | null): boolean => {
  const perm = getUserPermission(email);
  if (perm.role === 'super_admin') return true;
  if (perm.role === 'department_admin') {
    return perm.allowedDepartmentIds.includes(task.departmentId);
  }
  return false;
};

/**
 * ดึงรายการกลุ่มงานที่ผู้ใช้รายนี้มีสิทธิ์เลือกเมื่อเพิ่มหรือแก้ไขงาน
 */
export const getAllowedDepartmentsForUser = (email?: string | null) => {
  const perm = getUserPermission(email);
  if (perm.role === 'super_admin') {
    return DEPARTMENTS;
  }
  return DEPARTMENTS.filter(dept => perm.allowedDepartmentIds.includes(dept.id));
};
