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
import { cleanSheetTitle } from '../services/sheetsService';
import { DeviceDropdown, DeviceMode } from './DeviceDropdown';

export type ActiveTab = 'dashboard' | 'tasks' | 'monthly-report';

export interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  userInfo: UserAuthInfo | null;
  syncState: SheetSyncState;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  onOpenSheetSettings: () => void;
  onQuickSync: () => void;
  deviceMode: DeviceMode;
  onChangeDeviceMode: (mode: DeviceMode) => void;
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
  deviceMode,
  onChangeDeviceMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    activeClass: string;
    inactiveClass: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'รายงานผลการดำเนินงาน',
      icon: <BarChart3 className="h-3.5 w-3.5 drop-shadow-xs" />,
      // แถบสีเมนูแบบนูน สีเทาอ่อน ขนาดย่อส่วนกะทัดรัด (Compact 3D Embossed Relief in Light Gray)
      activeClass:
        'bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 text-slate-800 font-bold border-t border-t-white border-x border-slate-300 border-b-[2.5px] border-b-slate-400 shadow-sm shadow-slate-900/10 ring-1 ring-inset ring-white/90 scale-[1.01]',
      inactiveClass:
        'bg-gradient-to-b from-slate-50/90 via-slate-100 to-slate-150 text-slate-600 hover:text-slate-800 font-medium border-t border-t-white/80 border-x border-slate-200 border-b-[2px] border-b-slate-300 shadow-2xs hover:from-slate-100 hover:to-slate-200 hover:border-b-slate-400',
    },
    {
      id: 'tasks',
      label: 'ติดตามงาน',
      icon: <CheckSquare className="h-3.5 w-3.5 drop-shadow-xs" />,
      // แถบสีเมนูแบบนูน สีเทาอ่อน ขนาดย่อส่วนกะทัดรัด (Compact 3D Embossed Relief in Light Gray)
      activeClass:
        'bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 text-slate-800 font-bold border-t border-t-white border-x border-slate-300 border-b-[2.5px] border-b-slate-400 shadow-sm shadow-slate-900/10 ring-1 ring-inset ring-white/90 scale-[1.01]',
      inactiveClass:
        'bg-gradient-to-b from-slate-50/90 via-slate-100 to-slate-150 text-slate-600 hover:text-slate-800 font-medium border-t border-t-white/80 border-x border-slate-200 border-b-[2px] border-b-slate-300 shadow-2xs hover:from-slate-100 hover:to-slate-200 hover:border-b-slate-400',
    },
    {
      id: 'monthly-report',
      label: 'สรุปผลประจำเดือน',
      icon: <FileText className="h-3.5 w-3.5 drop-shadow-xs" />,
      // แถบสีเมนูแบบนูน สีเทาอ่อน ขนาดย่อส่วนกะทัดรัด (Compact 3D Embossed Relief in Light Gray)
      activeClass:
        'bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 text-slate-800 font-bold border-t border-t-white border-x border-slate-300 border-b-[2.5px] border-b-slate-400 shadow-sm shadow-slate-900/10 ring-1 ring-inset ring-white/90 scale-[1.01]',
      inactiveClass:
        'bg-gradient-to-b from-slate-50/90 via-slate-100 to-slate-150 text-slate-600 hover:text-slate-800 font-medium border-t border-t-white/80 border-x border-slate-200 border-b-[2px] border-b-slate-300 shadow-2xs hover:from-slate-100 hover:to-slate-200 hover:border-b-slate-400',
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
        <div className="flex items-center justify-between gap-3 h-auto min-h-[66px] sm:min-h-[72px] py-2">
          {/* Logo & Org Title: แบบคลีน ไม่มีแถบสี */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}logo-nu-logistics.svg`}
              alt="โลโก้ คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร"
              className="h-10 sm:h-11 w-auto max-w-[85px] sm:max-w-[100px] object-contain shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-bold text-blue-800 text-xs sm:text-sm md:text-base leading-tight">
                ระบบติดตามงาน ปีงบประมาณ 2570
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight mt-0.5 line-clamp-1">
                คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs (แถบสีเมนูแบบนูน สีเทาอ่อน ขนาดย่อส่วนกะทัดรัด ไม่ทับตัวอักษรชื่อสถาบัน) */}
          <nav className={`${deviceMode === 'mobile' ? 'hidden' : 'hidden md:flex'} items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/90 shadow-inner shrink-0`}>
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all cursor-pointer active:translate-y-0.5 select-none ${
                    isActive ? item.activeClass : item.inactiveClass
                  }`}
                >
                  {item.icon}
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Device Dropdown + Google Sheet + Google Sign In */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Device Dropdown - exactly matches screenshot */}
            <DeviceDropdown
              deviceMode={deviceMode}
              onChangeDeviceMode={onChangeDeviceMode}
            />

            {/* Desktop Action Tools: Google Sheet (สีฟ้าอ่อน แบบนูน) + Google Sign In */}
            <div className={`${deviceMode === 'mobile' ? 'hidden' : 'hidden md:flex'} items-center gap-2.5`}>
              {/* 4. Google Sheet สีฟ้าอ่อน แบบนูน (Soft Light Sky Blue Embossed) */}
              {syncState.spreadsheetId ? (
                <div
                  id="navbar-sheet-button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-b from-sky-100 via-sky-50 to-sky-200 text-sky-950 font-bold border-t border-t-white border-x border-sky-200 border-b-[2.5px] border-b-sky-400 shadow-sm shadow-sky-900/10 ring-1 ring-inset ring-white text-xs active:translate-y-0.5 transition-all select-none"
                >
                  <FileSpreadsheet className="h-4 w-4 text-sky-700 shrink-0 drop-shadow-xs" />
                  <button
                    onClick={onOpenSheetSettings}
                    className="font-bold text-sky-950 hover:text-sky-800 cursor-pointer text-xs"
                    title="คลิกเพื่อจัดการ Google Sheet"
                  >
                    Google Sheet
                  </button>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="เชื่อมต่ออยู่" />
                  <button
                    onClick={onQuickSync}
                    disabled={syncState.isSyncing}
                    title="ซิงค์ข้อมูลกับ Google Sheet"
                    className="p-1 hover:bg-sky-200/80 rounded-md text-sky-800 transition-colors cursor-pointer ml-0.5"
                  >
                    <RefreshCw className={`h-3 w-3 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              ) : (
                <button
                  id="navbar-sheet-button"
                  onClick={onOpenSheetSettings}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-b from-sky-100 via-sky-50 to-sky-200 hover:from-sky-200 hover:to-sky-300 text-sky-950 font-bold border-t border-t-white border-x border-sky-200 border-b-[2.5px] border-b-sky-400 shadow-sm shadow-sky-900/10 ring-1 ring-inset ring-white text-xs active:translate-y-0.5 transition-all cursor-pointer select-none"
                >
                  <FileSpreadsheet className="h-4 w-4 text-sky-700 drop-shadow-xs" />
                  <span>Google Sheet</span>
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
                    <div className="text-xs font-semibold text-slate-700 truncate max-w-[110px]">
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

            {/* Mobile & Tablet Hamburger Toggle */}
            <div className={`flex ${deviceMode === 'mobile' ? '' : 'md:hidden'} items-center gap-2`}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-700 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Mini Status Bar for Connected Google Sheet when User is Logged In */}
      {userInfo && (
        <div
          id="navbar-sheet-status-bar"
          className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border-t border-blue-900/50 px-4 sm:px-6 lg:px-8 py-2 shadow-inner"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 text-xs">
            {/* Left: Google Sheet Connection Indicator */}
            <div className="flex items-center gap-2 min-w-0 w-full md:w-auto">
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
                      title={cleanSheetTitle(syncState.spreadsheetTitle) || syncState.spreadsheetId}
                    >
                      {cleanSheetTitle(syncState.spreadsheetTitle) || syncState.spreadsheetId}
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
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end ml-auto">
              {syncState.spreadsheetId ? (
                <>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-300 pr-1">
                    <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span className="text-slate-300">ซิงค์ล่าสุด:</span>
                    <span className="font-semibold text-cyan-200">{formatLastSync(syncState.lastSyncedAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="navbar-quick-sync-btn"
                      onClick={onQuickSync}
                      disabled={syncState.isSyncing}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 border border-blue-400/40 text-white font-semibold text-[11px] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                      title="ซิงค์ข้อมูลกับ Google Sheet ตอนนี้"
                    >
                      <RefreshCw className={`h-3 w-3 text-cyan-200 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                      <span>{syncState.isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ด่วน'}</span>
                    </button>

                    {syncState.spreadsheetUrl && (
                      <a
                        id="navbar-open-sheet-link"
                        href={syncState.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/70 hover:bg-emerald-600 border border-emerald-400/30 text-white font-medium text-[11px] transition-all"
                        title="เปิดดูไฟล์ Google Sheet บน Google Drive"
                      >
                        <ExternalLink className="h-3 w-3 text-emerald-300" />
                        <span>เปิด Sheet</span>
                      </a>
                    )}

                    <button
                      id="navbar-manage-sheet-btn"
                      onClick={onOpenSheetSettings}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 hover:text-white text-[11px] font-medium transition-colors cursor-pointer shadow-xs"
                      title="ตั้งค่าและจัดการการเชื่อมต่อ Google Sheet"
                    >
                      <SlidersHorizontal className="h-3 w-3 text-cyan-300" />
                      <span>การจัดการ</span>
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
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-3">
          <nav className="space-y-2">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer active:translate-y-0.5 transition-all select-none ${
                    isActive ? item.activeClass : item.inactiveClass
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
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-b from-sky-100 via-sky-50 to-sky-200 text-sky-950 text-xs font-bold border-t border-t-white border-x border-sky-200 border-b-[2.5px] border-b-sky-400 shadow-sm ring-1 ring-inset ring-white cursor-pointer active:translate-y-0.5 select-none"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileSpreadsheet className="h-4 w-4 text-sky-700 shrink-0 drop-shadow-xs" />
                  <span className="truncate">Google Sheet: {cleanSheetTitle(syncState.spreadsheetTitle) || 'เชื่อมต่อแล้ว'}</span>
                </div>
                <span className="text-[11px] underline shrink-0 text-sky-900 ml-2 font-semibold">การจัดการ</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenSheetSettings();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-b from-sky-100 via-sky-50 to-sky-200 hover:from-sky-200 hover:to-sky-300 text-sky-950 text-xs font-bold border-t border-t-white border-x border-sky-200 border-b-[2.5px] border-b-sky-400 shadow-sm ring-1 ring-inset ring-white cursor-pointer active:translate-y-0.5 select-none"
              >
                <FileSpreadsheet className="h-4 w-4 text-sky-700 drop-shadow-xs" />
                <span>Google Sheet (เชื่อมต่อ Sheet)</span>
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
                    <div className="font-semibold text-slate-700">{userInfo.displayName || 'ผู้ใช้ Google'}</div>
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
