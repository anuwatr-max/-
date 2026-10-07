import React, { useState, useMemo } from 'react';
import { X, ShieldCheck, UserCheck, Lock, CheckCircle2, ShieldAlert, Building2, Search } from 'lucide-react';
import { ASSIGNED_USERS_PERMISSIONS, getUserPermission } from '../data/userPermissions';

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string | null;
}

export const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const currentPerm = getUserPermission(currentUserEmail);
  const allUsers = useMemo(() => Object.values(ASSIGNED_USERS_PERMISSIONS), []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return allUsers;
    const term = searchTerm.toLowerCase();
    return allUsers.filter(
      u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.departmentTitle.toLowerCase().includes(term)
    );
  }, [allUsers, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                การกำหนดสิทธิ์ผู้ใช้งาน (Google Account)
              </h3>
              <p className="text-xs text-blue-200/90">
                ระบบสิทธิ์ตามกลุ่มงาน คณะโลจิสติกส์และดิจิทัลซัพพลายเชน ม.นเรศวร
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current User Status Banner */}
        <div className="p-4 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-700 shrink-0" />
            <span className="text-slate-600">บัญชีของคุณปัจจุบัน:</span>
            <span className="font-bold text-slate-800">{currentUserEmail || 'ยังไม่ได้เข้าสู่ระบบ'}</span>
          </div>
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
              currentPerm.role === 'super_admin'
                ? 'bg-sky-100 text-sky-900 border-sky-300'
                : currentPerm.role === 'department_admin'
                ? 'bg-blue-100 text-blue-900 border-blue-300'
                : currentPerm.role === 'unit_contributor'
                ? 'bg-purple-100 text-purple-900 border-purple-300'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {currentPerm.departmentTitle}
          </span>
        </div>

        {/* Search bar & count */}
        <div className="px-5 pt-3.5 pb-2 bg-slate-50/60 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="relative w-full sm:w-72">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, อีเมล หรือหน่วยงาน..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <span className="text-[11px] font-medium text-slate-500 self-end sm:self-center">
            ผู้ได้รับสิทธิ์ทั้งหมด <strong>{allUsers.length}</strong> ท่าน
          </span>
        </div>

        {/* Permissions Table / Cards */}
        <div className="p-5 space-y-3 max-h-[55vh] overflow-y-auto">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            รายชื่อผู้ได้รับสิทธิ์ เพิ่ม/แก้ไข เฉพาะกลุ่มงาน:
          </h4>

          {filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              ไม่พบบัญชีผู้ใช้ที่ตรงกับคำค้นหา
            </div>
          ) : (
            filteredUsers.map(user => {
            const isSelf = currentUserEmail?.toLowerCase() === user.email.toLowerCase();
            return (
              <div
                key={user.email}
                className={`p-3.5 rounded-xl border transition-all ${
                  isSelf
                    ? 'bg-blue-50/90 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/90'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">{user.name}</span>
                      {isSelf && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                          คุณ
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-500">{user.email}</div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 border ${
                      user.role === 'super_admin'
                        ? 'bg-sky-100 text-sky-900 border-sky-300'
                        : user.role === 'unit_contributor'
                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    {user.role === 'super_admin'
                      ? 'Super Admin'
                      : user.role === 'unit_contributor'
                      ? 'ผู้บันทึกเฉพาะหน่วย'
                      : 'ผู้ดูแลกลุ่มงาน'}
                  </span>
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>สิทธิ์กลุ่มงาน/หน่วย:</span>
                    <strong className="text-blue-900">{user.departmentTitle}</strong>
                  </div>
                  {user.canAdd && user.canEdit ? (
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      สามารถเพิ่ม/แก้ไขงานได้
                    </span>
                  ) : user.canAdd && !user.canEdit ? (
                    <span className="text-[11px] text-sky-900 font-semibold flex items-center gap-1 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />
                      เพิ่มงานใหม่ได้เท่านั้น (แก้ไข/ลบไม่ได้)
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                      อ่านอย่างเดียว
                    </span>
                  )}
                </div>
              </div>
            );
          }))}

          {/* General policy note */}
          <div className="mt-4 p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-600 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              <span>นโยบายสิทธิ์ความปลอดภัย:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              ผู้ใช้ที่เข้าสู่ระบบด้วย Google Account นอกเหนือจากรายชื่อข้างต้น จะได้รับสิทธิ์{' '}
              <strong>ผู้เข้าชม (อ่านอย่างเดียว)</strong> สามารถดูข้อมูล สถิติ และส่งออกรายงานได้ แต่ไม่สามารถเพิ่ม แก้ไข หรือลบงานได้
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
