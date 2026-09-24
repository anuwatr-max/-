import React from 'react';
import { AlertCircle, Loader2, X, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
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
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 text-slate-900 animate-in zoom-in-95 duration-200 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="ปิดหน้าต่าง"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <img
              src={`${import.meta.env.BASE_URL}logo-nu-logistics.svg`}
              alt="โลโก้ คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร"
              className="h-16 w-auto max-w-[190px] object-contain drop-shadow-xs"
            />
          </div>

          <div className="space-y-1 mb-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-snug">
              เข้าสู่ระบบติดตามงาน
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร
            </p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] text-blue-800 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>สงวนสิทธิ์การเข้าใช้งานเฉพาะบัญชี <strong>@nu.ac.th</strong></span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-150">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-left">
              <p className="font-bold text-rose-900">การเข้าสู่ระบบไม่สำเร็จ</p>
              <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">{errorMessage}</p>
              <button
                type="button"
                onClick={onClearError}
                className="mt-1 text-[10px] font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
        )}

        {/* Sign In Button */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-blue-400 font-semibold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer group"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>กำลังเชื่อมต่อกับ Google...</span>
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
                <span>เข้าสู่ระบบด้วย Google (@nu.ac.th)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            เข้าดูหน้าจอติดตามงานต่อ (โหมดผู้เยี่ยมชม)
          </button>
        </div>
      </div>
    </div>
  );
};
