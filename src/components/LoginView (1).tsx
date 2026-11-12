import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { AuthUser, Employee } from '../types';
import { PMS_CONFIG } from '../data/config';
import { EmailValidationResult, validateNuEmail } from '../services/auth';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
  availableEmployees: Employee[];
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  availableEmployees,
}) => {
  const [showChooserModal, setShowChooserModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedEmailForVerify, setSelectedEmailForVerify] = useState<string | null>(null);

  // Security rejection error state
  const [rejectionError, setRejectionError] = useState<EmailValidationResult | null>(null);

  // Quick staff accounts for instant selection
  const staffAccounts = availableEmployees.map((emp) => ({
    email: emp.email || `${emp.id}@nu.ac.th`,
    name: emp.fullName,
    position: emp.position,
    unit: emp.unit,
    avatar: emp.avatar,
    employeeId: emp.id,
  }));

  const handleAttemptLogin = (email: string, name?: string, employeeId?: string) => {
    setIsVerifying(true);
    setSelectedEmailForVerify(email);
    setRejectionError(null);

    // Realistic verification simulation
    setTimeout(() => {
      const result = validateNuEmail(email);

      if (!result.isValid) {
        setIsVerifying(false);
        setSelectedEmailForVerify(null);
        setRejectionError(result);
        return;
      }

      // Valid @nu.ac.th account
      const matchedEmployee = availableEmployees.find(
        (e) => e.email?.toLowerCase() === email.toLowerCase() || e.id === employeeId
      );

      const authUser: AuthUser = {
        email: email.trim().toLowerCase(),
        name: name || matchedEmployee?.fullName || email.split('@')[0],
        position: matchedEmployee?.position || 'ผู้ปฏิบัติการ',
        unit: matchedEmployee?.unit || 'สำนักงานเลขานุการ',
        roles: matchedEmployee?.roles || ['staff'],
        employeeId: matchedEmployee?.id || `emp-${Date.now()}`,
        authenticatedAt: new Date().toISOString(),
      };

      setIsVerifying(false);
      setShowChooserModal(false);
      onLoginSuccess(authUser);
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    handleAttemptLogin(customEmail.trim(), customName.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-sky-50/40 to-slate-100 flex flex-col justify-between font-sarabun text-slate-800">
      {/* Top Bar with Branding */}
      <header className="bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 text-white px-4 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            {/* Faculty Logo with rounded badge */}
            <div className="shrink-0 bg-white rounded-xl p-1.5 shadow-sm border border-white/20 flex items-center justify-center">
              <img
                src="/assets/aistudio/png__17_-removebg-preview__1__2d7cc0ad.png"
                alt="โลโก้คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร"
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-white leading-tight">
                {PMS_CONFIG.systemName}
              </div>
              <div className="text-xs text-sky-200 mt-0.5 font-medium">
                {PMS_CONFIG.facultyName} {PMS_CONFIG.universityName}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ระบบปลอดภัย เฉพาะโดเมน @nu.ac.th</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-xl">
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
            {/* Header Visual Badge */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-teal-900 p-6 sm:p-8 text-center text-white relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white p-2 mb-3.5 shadow-md">
                <img
                  src="/assets/aistudio/png__17_-removebg-preview__1__2d7cc0ad.png"
                  alt="โลโก้คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                ระบบประเมินผลการปฏิบัติราชการ (PMS)
              </h2>
              <p className="text-sm text-sky-200 mt-1 font-normal">
                {PMS_CONFIG.facultyName} {PMS_CONFIG.universityName}
              </p>
              <div className="mt-3 inline-flex items-center space-x-1.5 bg-white/15 px-3 py-1 rounded-full text-xs text-slate-100 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-300" />
                <span>สงวนสิทธิ์การเข้าใช้งานเฉพาะบุคลากรภายใน</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Security Rejection Alert (If triggered) */}
              {rejectionError && (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 text-rose-900 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5 text-rose-600">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm sm:text-base text-rose-950 flex items-center gap-1.5">
                        <span>{rejectionError.errorTitle || 'ไม่อนุญาตให้เข้าใช้งาน'}</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">
                        {rejectionError.errorMessage}
                      </p>
                      {rejectionError.attemptedEmail && (
                        <div className="text-xs font-mono bg-rose-100/70 border border-rose-200 rounded-lg px-2.5 py-1 text-rose-900 inline-block mt-1">
                          อีเมลที่ตรวจพบ: {rejectionError.attemptedEmail}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-rose-200 pt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-rose-700 font-medium">
                      💡 กรุณาสลับไปใช้อีเมล @nu.ac.th
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectionError(null);
                        setShowChooserModal(true);
                      }}
                      className="text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 px-3.5 py-1.5 rounded-lg transition shadow-xs"
                    >
                      เลือกบัญชี @nu.ac.th ใหม่
                    </button>
                  </div>
                </div>
              )}

              {/* The Dedicated Google Account Sign-In Button */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setRejectionError(null);
                    setShowChooserModal(true);
                  }}
                  disabled={isVerifying}
                  className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold py-3.5 px-5 rounded-2xl border-2 border-slate-300 hover:border-blue-500 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] group cursor-pointer"
                >
                  {/* Google SVG Icon */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                  <span className="text-sm sm:text-base text-slate-800 group-hover:text-blue-900 transition font-bold">
                    เข้าสู่ระบบด้วย Google Account (@nu.ac.th)
                  </span>
                </button>

                <p className="text-center text-xs text-slate-500">
                  ระบบจะตรวจสอบโดเมนอีเมลมหาวิทยาลัยโดยอัตโนมัติก่อนอนุญาตให้เข้าใช้งาน
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Google Account Selector / Modal */}
      {showChooserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span className="font-bold text-slate-800 text-sm">ลงชื่อเข้าใช้ด้วย Google</span>
              </div>
              <button
                type="button"
                onClick={() => setShowChooserModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  เลือกบัญชี Google Account ของท่าน
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  เพื่อเข้าสู่ระบบ PMS คณะโลจิสติกส์และดิจิทัลซัพพลายเชน
                </p>
              </div>

              {/* Verifying Spinner */}
              {isVerifying ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">
                    กำลังตรวจสอบสิทธิ์บัญชี {selectedEmailForVerify}...
                  </p>
                  <p className="text-xs text-slate-400">ระบบรักษาความปลอดภัย @nu.ac.th</p>
                </div>
              ) : (
                <>
                  {/* Account Options List */}
                  <div className="space-y-2">
                    {staffAccounts.map((account) => (
                      <button
                        key={account.email}
                        type="button"
                        onClick={() =>
                          handleAttemptLogin(account.email, account.name, account.employeeId)
                        }
                        className="w-full text-left p-3 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 border border-blue-200">
                            {account.name.charAt(0)}
                          </div>
                          <div className="truncate">
                            <div className="text-sm font-bold text-slate-800 group-hover:text-blue-900 truncate">
                              {account.name}
                            </div>
                            <div className="text-xs text-slate-500 truncate">{account.email}</div>
                            <div className="text-[11px] text-sky-700 mt-0.5">
                              {account.position} • {account.unit}
                            </div>
                          </div>
                        </div>
                        <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 ml-2">
                          @nu.ac.th
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Toggle Custom Email Input */}
                  {!showCustomInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className="w-full py-2.5 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1.5 border border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>ลงชื่อเข้าใช้ด้วยบัญชี Google อื่น</span>
                    </button>
                  ) : (
                    <form
                      onSubmit={handleCustomSubmit}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700">
                          ระบุอีเมล Google Account:
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowCustomInput(false)}
                          className="text-[11px] text-slate-400 hover:text-slate-600"
                        >
                          ยกเลิก
                        </button>
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="yourname@nu.ac.th"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="ชื่อ-นามสกุล (ไม่บังคับ)"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                      >
                        ยืนยันและตรวจสอบสิทธิ์
                      </button>
                    </form>
                  )}

                  {/* Security Demo Button for testing rejection */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400 mb-1.5 font-medium">
                      สำหรับทดสอบระบบความปลอดภัย (Security Rejection Test):
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleAttemptLogin(
                          'user.test@gmail.com',
                          'นายทดสอบ บัญชีภายนอก'
                        )
                      }
                      className="w-full text-left p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 transition flex items-center justify-between text-xs text-rose-800 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="truncate">ทดสอบเข้าด้วย: user.test@gmail.com</span>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                        @gmail.com
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <p>
          ระบบประเมินผลการปฏิบัติราชการ บุคลากรสายสนับสนุน (PMS) • คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          สงวนลิขสิทธิ์ © 2569 มหาวิทยาลัยนเรศวร (Naresuan University)
        </p>
      </footer>
    </div>
  );
};
