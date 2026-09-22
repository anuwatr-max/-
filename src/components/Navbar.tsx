import React, { useState } from 'react';
import {
  BarChart3,
  CheckSquare,
  FileText,
  FileSpreadsheet,
  LogOut,
  RefreshCw,
  ExternalLink,
  Menu,
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Clock,
} from 'lucide-react';
import { UserAuthInfo, SheetSyncState } from '../types';

export type ActiveTab = 'dashboard' | 'tasks' | 'monthly-report';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  userInfo: UserAuthInfo | null;
  syncState: SheetSyncState;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  onOpenSheetSettings: () => void;
  onQuickSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  userInfo,
  syncState,
  onSignInWithGoogle,
  onSignOut,
  onOpenSheetSettings,
  onQuickSync,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'รายงานผลการดำเนินงาน',
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      id: 'tasks',
      label: 'ติดตามงานและสถานะ',
      icon: <CheckSquare className="h-4 w-4" />,
    },
    {
      id: 'monthly-report',
      label: 'สรุปผลประจำเดือน',
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'ยังไม่ได้ซิงค์';
    try {
      return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'เมื่อสักครู่';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Org Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white shadow-sm shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  ระบบติดตามงาน ปีงบประมาณ 2570
                </h1>
                <span className="hidden sm:inline-block bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  ปีงบ 2570
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-none">
                คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Sheets status + Google Sign In */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Google Sheets Badge / Quick Link */}
            {syncState.spreadsheetId ? (
              <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200/80 px-2.5 py-1.5 rounded-xl text-xs">
                <FileSpreadsheet className="h-4 w-4 text-blue-700 shrink-0" />
                <button
                  onClick={onOpenSheetSettings}
                  className="font-medium text-blue-900 hover:underline cursor-pointer truncate max-w-[120px] text-[11px]"
                  title="คลิกเพื่อจัดการ Google Sheet"
                >
                  Google Sheet
                </button>
                <button
                  onClick={onQuickSync}
                  disabled={syncState.isSyncing}
                  title="ซิงค์ข้อมูลกับ Google Sheet"
                  className="p-1 hover:bg-blue-100 rounded-md text-blue-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenSheetSettings}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                <span>ต่อ Google Sheet</span>
              </button>
            )}

            {/* Google Sign In Button or User Avatar */}
            {userInfo ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {userInfo.photoURL ? (
                  <img
                    src={userInfo.photoURL}
                    alt={userInfo.displayName || 'Google User'}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-800 text-white font-bold text-xs flex items-center justify-center">
                    {(userInfo.displayName || userInfo.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-900 truncate max-w-[110px]">
                    {userInfo.displayName || 'ผู้ใช้ Google'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                    {userInfo.email}
                  </div>
                </div>
                <button
                  id="navbar-signout-btn"
                  onClick={onSignOut}
                  title="ออกจากระบบ Google"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                id="navbar-google-signin-btn"
                onClick={onSignInWithGoogle}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-medium text-xs rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="h-4 w-4 shrink-0 bg-white rounded-full p-0.5"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>เข้าสู่ระบบ Google</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Mini Status Bar for Connected Google Sheet when User is Logged In */}
      {userInfo && (
        <div
          id="navbar-sheet-status-bar"
          className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border-t border-blue-900/50 px-4 sm:px-6 lg:px-8 py-2 shadow-inner"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            {/* Left: Google Sheet Connection Indicator */}
            <div className="flex items-center gap-2 min-w-0">
              {syncState.spreadsheetId ? (
                <>
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-cyan-300 flex items-center gap-1 shrink-0">
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                      Google Sheet เชื่อมต่ออยู่:
                    </span>
                    <span
                      className="font-medium text-slate-200 truncate max-w-[180px] sm:max-w-sm md:max-w-md bg-white/10 px-2 py-0.5 rounded-md border border-white/10"
                      title={syncState.spreadsheetTitle || syncState.spreadsheetId}
                    >
                      {syncState.spreadsheetTitle || syncState.spreadsheetId}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="font-semibold text-amber-300">
                      ยังไม่ได้เชื่อมต่อ Google Sheet สำหรับบัญชีนี้
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Right: Quick Actions & Sync State */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
              {syncState.spreadsheetId ? (
                <>
                  <div className="flex items-center gap-1 text-[11px] text-slate-300">
                    <Clock className="h-3 w-3 text-cyan-400" />
                    <span>ซิงค์ล่าสุด:</span>
                    <span className="font-medium text-cyan-200">{formatLastSync(syncState.lastSyncedAt)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id="navbar-quick-sync-btn"
                      onClick={onQuickSync}
                      disabled={syncState.isSyncing}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/60 hover:bg-blue-600 border border-blue-400/30 text-white font-medium text-[11px] transition-all cursor-pointer disabled:opacity-50"
                      title="ซิงค์ข้อมูลกับ Google Sheet ตอนนี้"
                    >
                      <RefreshCw className={`h-3 w-3 text-cyan-300 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                      <span>{syncState.isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ด่วน'}</span>
                    </button>

                    {syncState.spreadsheetUrl && (
                      <a
                        id="navbar-open-sheet-link"
                        href={syncState.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/60 hover:bg-emerald-600 border border-emerald-400/30 text-white font-medium text-[11px] transition-all"
                        title="เปิดดูไฟล์ Google Sheet บน Google Drive"
                      >
                        <ExternalLink className="h-3 w-3 text-emerald-300" />
                        <span>เปิด Sheet</span>
                      </a>
                    )}

                    <button
                      id="navbar-manage-sheet-btn"
                      onClick={onOpenSheetSettings}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
                      title="ตั้งค่าและจัดการการเชื่อมต่อ Google Sheet"
                    >
                      <SlidersHorizontal className="h-3 w-3" />
                      <span>จัดการ</span>
                    </button>
                  </div>
                </>
              ) : (
                <button
                  id="navbar-connect-sheet-btn"
                  onClick={onOpenSheetSettings}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>สร้างหรือเชื่อมต่อ Google Sheet ทันที</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-3">
          <nav className="space-y-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            {syncState.spreadsheetId ? (
              <button
                onClick={() => {
                  onOpenSheetSettings();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50 text-blue-900 text-xs font-medium border border-blue-200"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                  <span className="truncate">Google Sheet: {syncState.spreadsheetTitle || 'เชื่อมต่อแล้ว'}</span>
                </div>
                <span className="text-[11px] underline shrink-0 text-blue-700">จัดการ</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenSheetSettings();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium"
              >
                <FileSpreadsheet className="h-4 w-4 text-slate-500" />
                <span>เชื่อมต่อ Google Sheet</span>
              </button>
            )}

            {userInfo ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  {userInfo.photoURL ? (
                    <img
                      src={userInfo.photoURL}
                      alt="User"
                      referrerPolicy="no-referrer"
                      className="h-7 w-7 rounded-full"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-blue-800 text-white font-bold text-xs flex items-center justify-center">
                      {(userInfo.displayName || userInfo.email || 'U')[0]}
                    </div>
                  )}
                  <div className="text-left text-xs">
                    <div className="font-semibold text-slate-900">{userInfo.displayName || 'ผู้ใช้ Google'}</div>
                    <div className="text-[10px] text-slate-500">{userInfo.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 font-semibold px-2 py-1"
                >
                  ออก
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onSignInWithGoogle();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <span>เข้าสู่ระบบด้วย Google Account</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
