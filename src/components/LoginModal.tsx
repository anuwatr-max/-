import React from 'react';
import {
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
  CheckCircle2,
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
  isLoading,
  errorMessage,
  onClearError,
}) => {
  if (!isOpen) return null;

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
          <div className="relative mb-3">
            <img
              src={`${import.meta.env.BASE_URL}logo-nu-logistics.svg`}
              alt="โลโก้ คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร"
              className="h-16 w-auto max-w-[200px] object-contain drop-shadow-xs"
            />
          </div>

          <div className="space-y-1 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
              เข้าสู่ระบบด้วย Google Account
            </h2>
            <p className="text-xs text-sky-800 font-medium">
              คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร
            </p>
          </div>
        </div>

        {/* Error message (if any) */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 text-left animate-in fade-in duration-150">
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

        {/* Main Google Sign-In Action */}
        <div className="space-y-4 mb-6">
          <button
            id="modal-google-signin-btn"
            type="button"
            disabled={isLoading}
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-sky-500 font-semibold text-sm rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer group"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-sky-600 shrink-0" />
                <span className="text-slate-600">กำลังเชื่อมต่อบัญชี Google...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
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
                <span className="text-slate-800 font-bold">เข้าสู่ระบบด้วย Google Account</span>
              </>
            )}
          </button>

          <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3.5 text-left text-xs space-y-2">
            <div className="flex items-center gap-2 text-sky-900 font-semibold">
              <ShieldCheck className="h-4 w-4 text-sky-700 shrink-0" />
              <span>การตรวจสอบสิทธิ์อัตโนมัติ</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              กรุณาเข้าสู่ระบบด้วยบัญชี Google ของมหาวิทยาลัยนเรศวร (<span className="font-semibold text-sky-800">@nu.ac.th</span>) ระบบจะทำการระบุสิทธิ์ตามคำสั่งแต่งตั้งคณะกรรมการและคณะทำงานฯ โดยอัตโนมัติ
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-sky-800 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              <span>ซิงค์ข้อมูลกับ Google Sheets และ Google Drive แบบ Real-time</span>
            </div>
          </div>
        </div>

        {/* Footer / Guest View */}
        <div className="pt-3 border-t border-slate-100 text-center">
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
