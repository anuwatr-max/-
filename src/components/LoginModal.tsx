import React, { useState } from 'react';
import {
  AlertCircle,
  Loader2,
  X,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  UserCheck,
  LogIn,
  KeyRound,
} from 'lucide-react';
import { isInAppBrowser, getInAppBrowserName, openInExternalBrowser, copyCurrentUrl } from '../utils/browserEnv';
import { COMMITTEE_MEMBERS_LIST, CommitteeMemberOption } from '../data/userPermissions';

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
  const [copied, setCopied] = useState(false);
  const [selectedStaffEmail, setSelectedStaffEmail] = useState<string>(COMMITTEE_MEMBERS_LIST[0].email);
  const [customEmail, setCustomEmail] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'staff' | 'google'>('staff');

  const inApp = isInAppBrowser();
  const appName = getInAppBrowserName();

  if (!isOpen) return null;

  const handleCopy = async () => {
    const ok = await copyCurrentUrl();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenExternal = () => {
    openInExternalBrowser();
  };

  const handleQuickStaffLogin = () => {
    if (!onStaffSignIn) return;
    if (isCustomMode) {
      const email = customEmail.trim();
      if (!email) return;
      onStaffSignIn(email);
    } else {
      const member = COMMITTEE_MEMBERS_LIST.find(m => m.email === selectedStaffEmail);
      if (member) {
        onStaffSignIn(member.email, member.name);
      } else {
        onStaffSignIn(selectedStaffEmail);
      }
    }
  };

  const currentSelectedMember: CommitteeMemberOption | undefined = COMMITTEE_MEMBERS_LIST.find(
    m => m.email === selectedStaffEmail
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 text-slate-900 animate-in zoom-in-95 duration-200 relative max-h-[92vh] overflow-y-auto">
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

          <div className="space-y-1 mb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-snug">
              เข้าสู่ระบบติดตามงาน
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร
            </p>
          </div>
        </div>

        {/* In-App Browser Warning (LINE / Facebook / etc.) */}
        {inApp && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 text-left space-y-2 shadow-xs">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-xs">
                  ตรวจพบการเปิดผ่านแอป {appName || 'LINE'}
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  แนะนำให้ใช้ <strong>&quot;เข้าสู่ระบบบุคลากร (ด่วน)&quot;</strong> ด้านล่างนี้ สามารถเข้าใช้งานและบันทึกงานได้ทันทีโดยไม่ต้องเปิดเบราว์เซอร์ใหม่
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-amber-200/80">
              <button
                type="button"
                onClick={handleOpenExternal}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-[11px] cursor-pointer"
              >
                <ExternalLink className="h-3 w-3" />
                <span>เปิดใน Chrome</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-amber-300 text-amber-900 font-semibold rounded-lg text-[11px] cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-150 text-left">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="font-bold text-rose-900">การเข้าสู่ระบบผ่าน Google ไม่สำเร็จ</p>
              <p className="text-[11px] text-rose-700 leading-relaxed">{errorMessage}</p>

              <div className="p-2.5 bg-white/80 rounded-xl border border-rose-200/60 text-[11px] text-slate-700 space-y-1.5">
                <p className="font-semibold text-blue-900">
                  💡 ทางออกที่ง่ายและรวดเร็วที่สุด:
                </p>
                <p className="text-slate-600">
                  ท่านสามารถใช้ <strong>&quot;เข้าสู่ระบบบุคลากร (ด่วน)&quot;</strong> ด้านล่างนี้ โดยเลือกชื่อของท่านเพื่อเข้าสู่ระบบและบันทึกข้อมูลได้ทันที 100%
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClearError();
                    setActiveTab('staff');
                  }}
                  className="mt-1 inline-flex items-center gap-1 px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-[11px] font-semibold cursor-pointer shadow-xs"
                >
                  <UserCheck className="h-3 w-3" />
                  <span>สลับไปเข้าสู่ระบบบุคลากรทันที</span>
                </button>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClearError}
                  className="text-[11px] text-rose-600 hover:text-rose-800 underline cursor-pointer"
                >
                  ปิดข้อความแจ้งเตือน
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login Method Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl mb-4 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white text-blue-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>เข้าสู่ระบบบุคลากร (แนะนำ)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'google'
                ? 'bg-white text-blue-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
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
            <span>Google Account</span>
          </button>
        </div>

        {/* Tab 1: Staff Quick Login (100% Reliable, No Popup Blockers) */}
        {activeTab === 'staff' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  {isCustomMode ? 'ระบุอีเมลบัญชีผู้ใช้งาน:' : 'เลือกรายชื่อบุคลากร / คณะทำงาน (17 ท่าน):'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold underline cursor-pointer"
                >
                  {isCustomMode ? 'เลือกจากรายชื่อ' : 'พิมพ์อีเมลเอง'}
                </button>
              </div>

              {!isCustomMode ? (
                <div className="space-y-2">
                  <select
                    id="staff-account-select"
                    value={selectedStaffEmail}
                    onChange={e => setSelectedStaffEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                  >
                    {COMMITTEE_MEMBERS_LIST.map((member, idx) => (
                      <option key={member.email} value={member.email}>
                        {idx + 1}. {member.name} — {member.departmentTitle}
                      </option>
                    ))}
                  </select>

                  {currentSelectedMember && (
                    <div className="p-2.5 bg-white rounded-xl border border-blue-100 text-[11px] space-y-1 text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">สิทธิ์ในระบบ:</span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            currentSelectedMember.role === 'super_admin'
                              ? 'bg-amber-100 text-amber-900'
                              : currentSelectedMember.role === 'department_admin'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-purple-100 text-purple-900'
                          }`}
                        >
                          {currentSelectedMember.roleLabel}
                        </span>
                      </div>
                      <div className="text-slate-500">อีเมล: {currentSelectedMember.email}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="เช่น anuwatr@nu.ac.th หรืออีเมลของท่าน"
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-500">
                    * รองรับอีเมลสถาบัน @nu.ac.th หรืออีเมล Google ทุกบัญชี
                  </p>
                </div>
              )}
            </div>

            <button
              id="staff-signin-submit-btn"
              type="button"
              disabled={isLoading || (isCustomMode && !customEmail.trim())}
              onClick={handleQuickStaffLogin}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-800/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              <LogIn className="h-4 w-4 shrink-0" />
              <span>เข้าสู่ระบบด้วยบัญชีนี้ทันที</span>
            </button>
          </div>
        )}

        {/* Tab 2: Standard Google OAuth Sign-In */}
        {activeTab === 'google' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">เข้าสู่ระบบผ่าน Google Identity:</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ใช้บัญชี Google เพื่อเชื่อมต่อสิทธิ์การเขียนและซิงค์ข้อมูลกับ Google Sheets โดยตรง
              </p>
            </div>

            <button
              id="google-signin-submit-btn"
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
                  <span>เข้าสู่ระบบด้วย Google Account</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
          >
            เข้าดูหน้าจอติดตามงานต่อ (โหมดผู้เยี่ยมชม)
          </button>
        </div>
      </div>
    </div>
  );
};
