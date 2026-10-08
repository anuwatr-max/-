import React, { useState } from 'react';
import {
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Mail,
  UserCheck,
} from 'lucide-react';
import { DeviceDropdown, DeviceMode } from './DeviceDropdown';

interface LoginViewProps {
  onSignIn: () => void;
  onStaffSignIn?: (email: string, displayName?: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
  deviceMode?: DeviceMode;
  onChangeDeviceMode?: (mode: DeviceMode) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSignIn,
  onStaffSignIn,
  isLoading,
  errorMessage,
  onClearError,
  deviceMode,
  onChangeDeviceMode,
}) => {
  const [staffEmail, setStaffEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleDeveloperLogin = () => {
    onClearError();
    if (onStaffSignIn) {
      onStaffSignIn('anuwatr@nu.ac.th', 'อนุวัทย์ เรืองจันทร์');
    }
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    const clean = staffEmail.trim().toLowerCase();
    if (!clean) {
      setEmailError('กรุณากรอกอีเมล');
      return;
    }
    if (!clean.endsWith('@nu.ac.th')) {
      setEmailError('กรุณาใช้อีเมล @nu.ac.th เท่านั้น');
      return;
    }
    if (onStaffSignIn) {
      onClearError();
      onStaffSignIn(clean);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-slate-100 relative overflow-hidden font-['Prompt',sans-serif]">
      {/* Device Dropdown at top right corner */}
      {deviceMode && onChangeDeviceMode && (
        <div className="absolute top-4 right-4 z-30">
          <DeviceDropdown
            deviceMode={deviceMode}
            onChangeDeviceMode={onChangeDeviceMode}
          />
        </div>
      )}

      {/* Subtle Background Glows */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[15%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/80 border border-slate-100 text-slate-900 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Logo ด้านบน */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 via-sky-400/20 to-indigo-500/20 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <img
                src={`${import.meta.env.BASE_URL}logo-nu-logistics.svg`}
                alt="โลโก้ คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร"
                className="relative h-16 sm:h-20 w-auto max-w-[200px] object-contain drop-shadow-sm"
              />
            </div>

            {/* ชื่อระบบและหน่วยงาน */}
            <div className="space-y-1 mb-5">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                ระบบติดตามงาน
                <span className="block text-xs sm:text-sm font-light text-slate-600 mt-0.5">
                  (Task Tracking System 2570)
                </span>
              </h1>
              
              <div className="text-xs sm:text-sm text-slate-600 font-medium space-y-0.5 pt-1">
                <p className="font-semibold text-slate-700">คณะโลจิสติกส์และดิจิทัลซัพพลายเชน</p>
                <p className="text-slate-500">มหาวิทยาลัยนเรศวร</p>
              </div>
            </div>
          </div>

          {/* Error Banner (if any) */}
          {errorMessage && (
            <div
              id="login-error-banner"
              className="mb-5 p-4 rounded-2xl bg-sky-50 border-2 border-sky-300 text-xs text-slate-800 flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-200 text-left"
            >
              <AlertCircle className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-bold text-sky-950">แจ้งเตือนการเข้าสู่ระบบ</p>
                <p className="text-[11px] text-slate-700 leading-relaxed">{errorMessage}</p>
                
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDeveloperLogin}
                    className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-[11px] font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    เข้าสู่ระบบในฐานะผู้พัฒนาระบบทันที
                  </button>
                  <button
                    type="button"
                    onClick={onClearError}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    ปิดแจ้งเตือน
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Developer Card (1-Click) */}
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/70 border border-sky-200 text-left">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sky-700" />
                สำหรับผู้พัฒนาระบบ (Super Admin)
              </span>
              <span className="text-[10px] bg-sky-200 text-sky-900 font-semibold px-2 py-0.5 rounded-full">
                anuwatr@nu.ac.th
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mb-2.5">
              เข้าใช้งานได้ 100% บนทุกโดเมน รวมถึง https://anuwatr-max.github.io
            </p>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleDeveloperLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-sky-200" />
              <span>เข้าสู่ระบบด้วยบัญชีผู้พัฒนาทันที (Super Admin)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Action Button: Google Sign-in */}
          <div className="space-y-3 mb-4">
            <button
              id="google-signin-btn"
              type="button"
              disabled={isLoading}
              onClick={onSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-sky-500 font-semibold text-xs sm:text-sm rounded-2xl shadow-xs hover:shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                  <span>กำลังเชื่อมต่อระบบยืนยันตัวตน...</span>
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
                  <span>เข้าสู่ระบบด้วย Google Account (@nu.ac.th)</span>
                </>
              )}
            </button>
          </div>

          {/* Staff Email Login */}
          <div className="border-t border-slate-100 pt-3 text-left">
            {!showEmailForm ? (
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-between text-xs text-sky-800 hover:text-sky-950 font-medium py-1 cursor-pointer"
              >
                <span>คณะทำงานท่านอื่น พิมพ์อีเมล (@nu.ac.th)</span>
                <span className="text-[11px] underline">เปิดฟอร์ม</span>
              </button>
            ) : (
              <form onSubmit={handleStaffSubmit} className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label htmlFor="staff-input-view" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-sky-600" />
                    <span>อีเมลบุคลากร:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ซ่อน
                  </button>
                </div>
                <input
                  id="staff-input-view"
                  type="email"
                  value={staffEmail}
                  onChange={e => {
                    setStaffEmail(e.target.value);
                    setEmailError(null);
                  }}
                  placeholder="name@nu.ac.th"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-sky-600"
                />
                {emailError && <p className="text-[10px] text-rose-600">{emailError}</p>}
                <button
                  type="submit"
                  className="w-full py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  เข้าสู่ระบบ
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Subtle Bottom Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-slate-400/80 z-10">
        <p>© 2570 คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร • สงวนลิขสิทธิ์</p>
      </footer>
    </div>
  );
};
