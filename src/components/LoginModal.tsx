import React, { useState } from 'react';
import {
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Mail,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

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
  onSignIn,
  onStaffSignIn,
  isLoading,
  errorMessage,
  onClearError,
}) => {
  const [staffEmail, setStaffEmail] = useState('');
  const [emailValidationError, setEmailValidationError] = useState<string | null>(null);
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  if (!isOpen) return null;

  const handleDeveloperDirectLogin = () => {
    onClearError();
    if (onStaffSignIn) {
      onStaffSignIn('anuwatr@nu.ac.th', 'อนุวัทย์ เรืองจันทร์');
    }
  };

  const handleStaffEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailValidationError(null);

    const clean = staffEmail.trim().toLowerCase();
    if (!clean) {
      setEmailValidationError('กรุณาระบุอีเมลบุคลากร');
      return;
    }

    if (!clean.endsWith('@nu.ac.th')) {
      setEmailValidationError('กรุณาใช้อีเมลของมหาวิทยาลัยนเรศวร (@nu.ac.th) เท่านั้น');
      return;
    }

    if (onStaffSignIn) {
      onClearError();
      onStaffSignIn(clean);
    }
  };

  // ตรวจสอบว่าเกิดข้อผิดพลาดเกี่ยวกับ origin_mismatch หรือ GitHub Pages หรือไม่
  const isOriginMismatchError =
    errorMessage &&
    (errorMessage.includes('origin_mismatch') ||
      errorMessage.includes('unauthorized-domain') ||
      errorMessage.includes('400') ||
      errorMessage.includes('GitHub') ||
      errorMessage.includes('github.io'));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 font-['Prompt',sans-serif]"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200/90 text-slate-900 animate-in zoom-in-95 duration-200 relative max-h-[92vh] overflow-y-auto">
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
          <div className="relative mb-3">
            <img
              src={`${import.meta.env.BASE_URL}logo-nu-logistics.svg`}
              alt="โลโก้ คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร"
              className="h-14 sm:h-16 w-auto max-w-[200px] object-contain drop-shadow-xs"
            />
          </div>

          <div className="space-y-1 mb-5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
              เข้าสู่ระบบติดตามงาน 2570
            </h2>
            <p className="text-xs text-sky-800 font-medium">
              คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร
            </p>
          </div>
        </div>

        {/* Error message (if any) */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-sky-50/80 border-2 border-sky-300 text-xs text-slate-800 space-y-2.5 text-left animate-in fade-in duration-150">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-sky-700 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-bold text-sky-950 text-sm">
                  {isOriginMismatchError
                    ? 'แจ้งเตือน: ข้อจำกัด Google OAuth บน GitHub Pages'
                    : 'แจ้งเตือนการเข้าสู่ระบบ'}
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed">{errorMessage}</p>
              </div>
            </div>

            {/* Quick 1-Click login for developer right in error banner */}
            <div className="pt-2 border-t border-sky-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleDeveloperDirectLogin}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>เข้าสู่ระบบทันที (ผู้พัฒนาระบบ / Super Admin)</span>
              </button>
              <button
                type="button"
                onClick={onClearError}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline text-center cursor-pointer"
              >
                ปิดข้อความเตือน
              </button>
            </div>
          </div>
        )}

        {/* SECTION 1: ผู้พัฒนาระบบหลัก (Super Admin) - 100% Reliable Access on GitHub Pages */}
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-50/50 border-2 border-sky-300/80 shadow-xs text-left relative overflow-hidden group">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-600 text-white shadow-xs">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  สำหรับผู้พัฒนาระบบ (Super Admin)
                  <span className="text-[10px] bg-sky-200/80 text-sky-900 font-semibold px-2 py-0.5 rounded-full">
                    สิทธิ์สูงสุด
                  </span>
                </h3>
                <p className="text-[11px] text-slate-600">
                  อนุวัทย์ เรืองจันทร์ • <span className="font-semibold text-sky-800">anuwatr@nu.ac.th</span>
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
            รองรับการเข้าสู่ระบบ 100% บนทุกโดเมน รวมถึง GitHub Pages (https://anuwatr-max.github.io) โดยไม่ติดปัญหา Google OAuth origin_mismatch
          </p>

          <button
            id="developer-direct-login-btn"
            type="button"
            disabled={isLoading}
            onClick={handleDeveloperDirectLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-700 hover:from-sky-700 hover:via-blue-800 hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-sky-200" />
            <span>เข้าสู่ระบบด้วยบัญชีผู้พัฒนาทันที (Super Admin)</span>
            <ArrowRight className="h-4 w-4 ml-1 opacity-80" />
          </button>
        </div>

        {/* SECTION 2: Google Account Sign-In */}
        <div className="space-y-3 mb-4">
          <button
            id="modal-google-signin-btn"
            type="button"
            disabled={isLoading}
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-sky-500 font-semibold text-xs sm:text-sm rounded-2xl shadow-xs hover:shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer group"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-sky-600 shrink-0" />
                <span className="text-slate-600 text-xs">กำลังเชื่อมต่อบัญชี Google...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-slate-800 font-bold">เข้าสู่ระบบด้วย Google Account (@nu.ac.th)</span>
              </>
            )}
          </button>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-left text-[11px] text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
            <span>ซิงค์ข้อมูลกับ Google Sheets และ Google Drive แบบ Real-time ตามสิทธิ์คำสั่งแต่งตั้ง</span>
          </div>
        </div>

        {/* SECTION 3: คณะทำงานอื่นๆ เข้าสู่ระบบด้วยอีเมล @nu.ac.th */}
        <div className="border-t border-slate-200/80 pt-3 mb-4 text-left">
          {!showEmailLogin ? (
            <button
              type="button"
              onClick={() => setShowEmailLogin(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-sky-800 hover:text-sky-950 hover:bg-sky-50/60 font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-600" />
                <span>สำหรับคณะทำงานท่านอื่น (พิมพ์อีเมล @nu.ac.th)</span>
              </div>
              <span className="text-[11px] underline">กดเพื่อเปิด</span>
            </button>
          ) : (
            <form onSubmit={handleStaffEmailSubmit} className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label htmlFor="staff-email-field" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-sky-700" />
                  <span>พิมพ์อีเมลบุคลากรเข้าระบบ:</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowEmailLogin(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ซ่อน
                </button>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <input
                    id="staff-email-field"
                    type="email"
                    value={staffEmail}
                    onChange={e => {
                      setStaffEmail(e.target.value);
                      setEmailValidationError(null);
                    }}
                    placeholder="name@nu.ac.th"
                    className="w-full px-3.5 py-2 pl-9 bg-white border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                  />
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
                {emailValidationError && (
                  <p className="text-[10px] text-rose-600 font-medium pl-1">{emailValidationError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-3 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                เข้าสู่ระบบด้วยอีเมลนี้
              </button>
            </form>
          )}
        </div>

        {/* Footer / Guest View */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="py-1 px-3 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
          >
            เข้าดูหน้าจอติดตามงานต่อ (โหมดผู้เยี่ยมชม)
          </button>
        </div>
      </div>
    </div>
  );
};
