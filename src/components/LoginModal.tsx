import React, { useState } from 'react';
import {
  AlertCircle,
  X,
  Mail,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { ASSIGNED_USERS_PERMISSIONS } from '../data/userPermissions';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onStaffSignIn?: (email: string, displayName?: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onStaffSignIn,
  isLoading,
  errorMessage,
  onClearError,
}) => {
  const [staffEmailInput, setStaffEmailInput] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  if (!isOpen) return null;

  // คณะทำงาน / บุคลากร - พิมพ์ email : nu.ac.th เข้าระบบ
  const handleStaffEmailLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInputError(null);

    let raw = staffEmailInput.trim().toLowerCase();
    if (!raw) {
      setInputError('กรุณากรอก email : nu.ac.th ของท่าน');
      return;
    }

    // หากพิมพ์เฉพาะชื่อ username ให้เติม @nu.ac.th ให้อัตโนมัติ
    if (!raw.includes('@')) {
      raw = `${raw}@nu.ac.th`;
    }

    if (!raw.endsWith('@nu.ac.th') && !raw.endsWith('@gmail.com')) {
      setInputError('กรุณาใช้อีเมลสถาบัน @nu.ac.th ในการเข้าสู่ระบบ');
      return;
    }

    const assigned = ASSIGNED_USERS_PERMISSIONS[raw];
    const name = assigned ? assigned.name : raw.split('@')[0];

    if (onStaffSignIn) {
      onStaffSignIn(raw, name);
    }
  };

  // Quick lookup preview when typing
  const cleanCurrentInput = staffEmailInput.trim().toLowerCase();
  const normalizedTypedEmail = cleanCurrentInput
    ? cleanCurrentInput.includes('@')
      ? cleanCurrentInput
      : `${cleanCurrentInput}@nu.ac.th`
    : '';
  const matchedCommitteeMember = normalizedTypedEmail
    ? ASSIGNED_USERS_PERMISSIONS[normalizedTypedEmail]
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 text-slate-900 animate-in zoom-in-95 duration-200 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="ปิดหน้าต่าง"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header / University Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-2">
            <img
              src={`${import.meta.env.BASE_URL}logo-nu-logistics.svg`}
              alt="โลโก้ คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร"
              className="h-16 w-auto max-w-[190px] object-contain drop-shadow-xs"
            />
          </div>

          <div className="space-y-0.5 mb-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-snug">
              เข้าสู่ระบบติดตามงาน
            </h2>
            <p className="text-xs text-sky-800 font-medium">
              คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร
            </p>
          </div>
        </div>

        {/* Error message (if any) */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 text-left">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <p className="font-bold text-rose-900">แจ้งเตือนการเข้าสู่ระบบ</p>
              <p className="text-[11px] text-rose-700 leading-relaxed">{errorMessage}</p>
              <button
                type="button"
                onClick={onClearError}
                className="text-[11px] text-rose-600 hover:text-rose-800 underline cursor-pointer"
              >
                ปิดข้อความแจ้งเตือน
              </button>
            </div>
          </div>
        )}

        {/* เข้าสู่ระบบสำหรับบุคลากร / คณะทำงาน */}
        <form
          onSubmit={handleStaffEmailLogin}
          className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 text-left space-y-3.5 shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-sky-100 text-sky-700 shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                พิมพ์ email : nu.ac.th
              </h3>
              <p className="text-[11px] text-sky-700 font-medium">
                เข้าสู่ระบบตามสิทธิ์ของท่าน
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="relative">
              <input
                id="committee-email-input"
                type="text"
                autoFocus
                value={staffEmailInput}
                onChange={e => {
                  setStaffEmailInput(e.target.value);
                  if (inputError) setInputError(null);
                }}
                placeholder="พิมพ์ email : nu.ac.th"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-2xs ${
                  inputError ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
            </div>

            {inputError && (
              <p className="text-[11px] text-rose-600 font-medium">{inputError}</p>
            )}

            {/* Realtime Match Preview */}
            {matchedCommitteeMember && (
              <div className="p-2.5 bg-sky-50/90 rounded-xl border border-sky-200 text-[11px] text-sky-950 flex items-center justify-between animate-in fade-in duration-150">
                <div>
                  <span className="font-bold text-sky-900">{matchedCommitteeMember.name}</span>
                  <span className="text-slate-600 block text-[10px]">
                    {matchedCommitteeMember.departmentTitle}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-sky-200 text-sky-900 font-bold text-[10px] flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-sky-700" />
                  ยืนยันพบข้อมูล
                </span>
              </div>
            )}
          </div>

          <button
            id="committee-email-submit-btn"
            type="submit"
            disabled={isLoading || !staffEmailInput.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-800/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            <span>เข้าสู่ระบบด้วยอีเมล @nu.ac.th</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        </form>

        {/* Footer / Guest View */}
        <div className="pt-3 border-t border-slate-100 mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-3 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
          >
            เข้าดูหน้าจอติดตามงานต่อ (โหมดผู้เยี่ยมชม)
          </button>
        </div>
      </div>
    </div>
  );
};
