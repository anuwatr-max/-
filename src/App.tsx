import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TaskListView } from './components/TaskListView';
import { TaskCalendarView } from './components/TaskCalendarView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { TaskModal } from './components/TaskModal';
import { ConfirmModal } from './components/ConfirmModal';
import { SheetSettingsModal } from './components/SheetSettingsModal';
import { LoginModal } from './components/LoginModal';
import { UserPermissionsModal } from './components/UserPermissionsModal';
import { DeviceDropdown, DeviceMode } from './components/DeviceDropdown';
import { TaskItem, TaskStatus, UserAuthInfo, SheetSyncState } from './types';

import {
  canUserAddTask,
  canUserAddTaskInUnit,
  canUserEditTask,
  canUserDeleteTask,
  getUserPermission,
} from './data/userPermissions';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setCachedToken,
} from './services/firebase';
import {
  getSavedSpreadsheetId,
  saveSpreadsheetId,
  createSpreadsheet,
  fetchTasksFromSheet,
  appendTaskToSheet,
  updateTaskInSheet,
  deleteTaskFromSheet,
  fullSyncToSheet,
  enforceCentralSpreadsheetId,
} from './services/sheetsService'; 
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Smartphone,
  Tablet,
  X,
  ShieldCheck,
  LogIn,
  ExternalLink,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import {
  isInAppBrowser,
  getInAppBrowserName,
  openInExternalBrowser,
  copyCurrentUrl,
  isLineBrowser,
} from './utils/browserEnv';

const LOCAL_STORAGE_TASKS_KEY = 'nuls_tracking_tasks_2570';

// Google Sheet กลางของคณะ (ต้องตรงกับ DEFAULT_SPREADSHEET_ID ใน sheetsService.ts) ใช้เตือนเมื่อเชื่อมต่อผิดไฟล์
const CENTRAL_SHEET_ID = '1p0fOVgVV8YanwdGajiUn-Pkj1HfA7E2Lbjctl5kSkwM';

// ตรวจว่า error เกิดจากการเชื่อมต่อ Google หมดอายุ (token เก่าเกิน ~1 ชั่วโมง) หรือไม่
const isSessionError = (err: any): boolean => {
  const msg = String(err?.message || err || '');
  return (
    msg.includes('หมดอายุ') ||
    msg.includes('401') ||
    /unauthenticated|invalid credentials|invalid_grant|token/i.test(msg)
  );
};

// รหัสงานตัวอย่างปลอมจากเวอร์ชันก่อนหน้า (TSK-2570-001 ถึง 014) ใช้ล้างออกจากแคชในเครื่อง
const LEGACY_SAMPLE_TASK_IDS = new Set(
  Array.from({ length: 14 }, (_, i) => `TSK-2570-${String(i + 1).padStart(3, '0')}`)
);

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [deviceZoom, setDeviceZoom] = useState<number>(1);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const [inAppNoticeDismissed, setInAppNoticeDismissed] = useState<boolean>(false);

  const inApp = isInAppBrowser();
  const inAppName = getInAppBrowserName();

  // ตรวจจับและเปิดผ่านเบราว์เซอร์หลักอัตโนมัติหากเปิดผ่าน LINE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || '';
      const isLine = /Line\//i.test(ua);
      const hasParam = window.location.search.includes('openExternalBrowser=1');
      if (isLine && !hasParam) {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('openExternalBrowser', '1');
          window.location.replace(url.toString());
        } catch (e) {
          console.warn('LINE auto-redirect error:', e);
        }
      }
    }
  }, []);

  // ตรวจจับขนาดหน้าจอจริง เพื่อไม่ให้เกิดกรอบจำลองบนมือถือจริง
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tasks state: โหลดจากแคชในเครื่อง (ถ้ามี) และจะถูกแทนที่ด้วยข้อมูลจริงจาก Google Sheet หลังเข้าสู่ระบบ
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // ตัดงานตัวอย่างปลอมที่อาจค้างอยู่ในแคชออก
          return parsed.filter((t: TaskItem) => !LEGACY_SAMPLE_TASK_IDS.has(t.id));
        }
      }
    } catch (e) {
      console.error('Failed to load local tasks:', e);
    }
    return [];
  });

  // User Auth State
  const [userInfo, setUserInfo] = useState<UserAuthInfo | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  // true = การเชื่อมต่อ Google หมดอายุ ทำให้อ่าน/เขียน Sheet ไม่ได้ (แสดงแถบเตือนให้เข้าสู่ระบบใหม่)
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  // true ระหว่างกำลังบันทึกลง Sheet เพื่อไม่ให้การดึงข้อมูลอัตโนมัติมาทับหน้าจอ
  const isSavingRef = useRef<boolean>(false);

  // Helper ตรวจสอบว่าใช้อีเมลมหาวิทยาลัยนเรศวร (@nu.ac.th) หรือไม่
  const isNuEmail = (email?: string | null): boolean => {
    if (!email) return false;
    return email.trim().toLowerCase().endsWith('@nu.ac.th');
  };

  // เฉพาะผู้ดูแลระบบหลัก (Super Admin) ที่ซิงค์ข้อมูลทั้งหมดลง Google Sheet ได้
  const canManageSheet = getUserPermission(userInfo?.email).canManageSheet;

  // Google Sheet Sync State
  const [syncState, setSyncState] = useState<SheetSyncState>({
    spreadsheetId: getSavedSpreadsheetId(),
    spreadsheetUrl: getSavedSpreadsheetId()
      ? `https://docs.google.com/spreadsheets/d/${getSavedSpreadsheetId()}`
      : null,
    spreadsheetTitle: 'ระบบติดตามงาน_ปีงบประมาณ_2570_คณะโลจิสติกส์ฯ_มน',
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
  });

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [taskModalDefaultDate, setTaskModalDefaultDate] = useState<string | undefined>(undefined);
  const [isSheetSettingsOpen, setIsSheetSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Confirm Modal state (Required for destructive operations by Google Workspace skill)
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Quick filters passed from Dashboard to Task List
  const [initialFilterStatus, setInitialFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [initialFilterDept, setInitialFilterDept] = useState<string>('all');

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);    
  }, []);

  // ขอ Google access token สำหรับอ่าน/เขียน Sheet (null = ไม่มี token ที่ใช้ได้)
  const getSheetToken = async (): Promise<string | null> => {
    let token: string | null | undefined = null;
    try {
      token = (await getAccessToken()) as string | null | undefined;
    } catch (e) {}
    if (!token) token = userInfo?.accessToken;
    if (!token) {
      try {
        const stored = localStorage.getItem('google_oauth_access_token_v1');
        if (stored) {
          token = stored;
          setCachedToken(stored);
        }
      } catch (e) {}
    }
    return token || null;
  };
  
  // ผู้ใช้ที่ไม่ใช่ Super Admin ต้องใช้ Sheet กลางเท่านั้น: ล้าง Sheet ID ที่เคยเชื่อมเองไว้ในเบราว์เซอร์
  const applyCentralSheetForUser = (email?: string | null) => {
    if (getUserPermission(email).canManageSheet) return;
    if (!enforceCentralSpreadsheetId()) return;
    const centralId = getSavedSpreadsheetId();
    setSyncState(prev => ({
      ...prev,
      spreadsheetId: centralId,
      spreadsheetUrl: centralId ? `https://docs.google.com/spreadsheets/d/${centralId}` : null,
    }));
    console.info('รีเซ็ตการเชื่อมต่อ Google Sheet กลับเป็น Sheet กลางของคณะ');
  };
  
  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [tasks]);

  // Initialize Firebase Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        if (user?.email && !isNuEmail(user.email)) {
          await logout();
          setUserInfo(null);
          setIsAuthChecking(false);
          return;
        }

        setAuthError(null);
        setUserInfo({
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'บุคลากร มน.',
          email: user.email,
          photoURL: user.photoURL,
          accessToken: token,
        });

        // ผู้ใช้ที่ไม่ใช่ Super Admin: ใช้ Sheet กลางเสมอ (ล้าง Sheet ID ที่เคยเชื่อมเองไว้)
        applyCentralSheetForUser(user.email);
        
        if (token) {
          setCachedToken(token);
          // If sheet already exists, attempt to pull latest tasks from Sheet
          const existingSheetId = getSavedSpreadsheetId();
          if (existingSheetId) {
            try {
              setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
              const sheetTasks = await fetchTasksFromSheet(existingSheetId, token);
              if (sheetTasks.length > 0) {
                setTasks(sheetTasks);
                setSyncState(prev => ({
                  ...prev,
                  isSyncing: false,
                  lastSyncedAt: new Date(),
                  error: null,
                }));
                showToast('ดึงข้อมูลล่าสุดจาก Google Sheet สำเร็จ', 'success');
              } else {
                setSyncState(prev => ({ ...prev, isSyncing: false }));
              }
            } catch (err: any) {
              console.warn('Auto fetch from sheet error:', err);
              if (isSessionError(err)) setSessionExpired(true);
              setSyncState(prev => ({
                ...prev,
                isSyncing: false,
                error: 'ไม่สามารถดึงข้อมูลจาก Sheet ได้ กำลังใช้ข้อมูลท้องถิ่น',
              }));
            }
          }
        } else {
          // ล็อกอิน Firebase อยู่ แต่ไม่มี Google token (หมดอายุ) จึงอ่าน/เขียน Sheet ไม่ได้
          setSessionExpired(true);
        }
        setIsAuthChecking(false);
      },
      () => {
        setUserInfo(null);
        setIsAuthChecking(false);
      }
    );

    return () => unsubscribe();
  }, [showToast]);

  // ดึงข้อมูลล่าสุดจาก Google Sheet แบบเงียบ ๆ (ไม่แสดง toast) เพื่อให้ทุกเครื่องเห็นข้อมูลตรงกัน
  const silentRefreshFromSheet = useCallback(async () => {
    if (!userInfo || !syncState.spreadsheetId || isSavingRef.current) return;
    const token = await getSheetToken();
    if (!token) {
      setSessionExpired(true);
      return;
    }
    try {
      const sheetTasks = await fetchTasksFromSheet(syncState.spreadsheetId, token);
      if (isSavingRef.current) return;
      // ไม่ทับข้อมูลด้วยรายการว่าง เผื่ออ่าน Sheet ไม่สมบูรณ์
      if (sheetTasks.length > 0) {
        setTasks(sheetTasks);
        setSyncState(prev => ({ ...prev, lastSyncedAt: new Date(), error: null }));
      }
      setSessionExpired(false);
    } catch (err: any) {
      if (isSessionError(err)) setSessionExpired(true);
      console.warn('Silent refresh failed:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo, syncState.spreadsheetId]);

  // ดึงข้อมูลใหม่ทันทีเมื่อเข้าสู่ระบบ, เมื่อกลับมาที่แท็บ และทุก 3 นาที
  useEffect(() => {
    if (!userInfo || !syncState.spreadsheetId) return;
    silentRefreshFromSheet();
    const timer = setInterval(silentRefreshFromSheet, 3 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') silentRefreshFromSheet();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [userInfo, syncState.spreadsheetId, silentRefreshFromSheet]);

  // Google Sign In
  const handleSignInWithGoogle = async () => {
    try {
      setIsLoggingIn(true);
      setAuthError(null);
      setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
      const result = await googleSignIn();
      if (result) {
        // ตรวจสอบว่าใช้อีเมลมหาวิทยาลัยนเรศวร (@nu.ac.th) เท่านั้น
        if (result.user?.email && !isNuEmail(result.user.email)) {
          await logout();
          const err = `อีเมล ${result.user.email} ไม่ได้รับอนุญาต ระบบรองรับเฉพาะบัญชี Google ของมหาวิทยาลัยนเรศวร (@nu.ac.th) เท่านั้น`;
          setAuthError(err);
          showToast(err, 'error');
          setIsLoginModalOpen(true);
          setSyncState(prev => ({ ...prev, isSyncing: false }));
          return;
        }

        setAuthError(null);
        setUserInfo({
          uid: result.user.uid,
          displayName: result.user.displayName || result.user.email?.split('@')[0] || 'ผู้ใช้งาน Google',
          email: result.user.email,
          photoURL: result.user.photoURL,
          accessToken: result.accessToken,
        });
        setIsLoginModalOpen(false);
        setSessionExpired(false);
        showToast(`ยินดีต้อนรับ: ${result.user.displayName || result.user.email}`, 'success');
         // ผู้ใช้ที่ไม่ใช่ Super Admin: ใช้ Sheet กลางเสมอ (ล้าง Sheet ID ที่เคยเชื่อมเองไว้)
        applyCentralSheetForUser(result.user.email);
        // Check if spreadsheet exists, if not prompt to create one
        let sheetId = getSavedSpreadsheetId();
        if (!sheetId) {
          try {
            const newSheet = await createSpreadsheet(result.accessToken, tasks);
            sheetId = newSheet.id;
            setSyncState(prev => ({
              ...prev,
              spreadsheetId: newSheet.id,
              spreadsheetUrl: newSheet.url,
              isSyncing: false,
              lastSyncedAt: new Date(),
              error: null,
            }));
            showToast('สร้าง Google Sheet ติดตามงาน 2570 และเชื่อมต่อสำเร็จแล้ว', 'success');
          } catch (createErr: any) {
            console.error('Error auto-creating sheet:', createErr);
            setSyncState(prev => ({
              ...prev,
              isSyncing: false,
              error: createErr?.message || 'ไม่สามารถสร้าง Google Sheet อัตโนมัติได้',
            }));
          }
        } else {
          // Sync or fetch
          try {
            const sheetTasks = await fetchTasksFromSheet(sheetId, result.accessToken);
            if (sheetTasks.length > 0) {
              setTasks(sheetTasks);
            } else if (getUserPermission(result.user.email).canManageSheet && tasks.length > 0) {
              // เฉพาะผู้ดูแลระบบหลัก: เขียนข้อมูลในเครื่องลง Sheet ที่ยังว่าง
              await fullSyncToSheet(sheetId, result.accessToken, tasks);
            }
            setSyncState(prev => ({
              ...prev,
              spreadsheetId: sheetId,
              spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
              isSyncing: false,
              lastSyncedAt: new Date(),
              error: null,
            }));
            showToast('เชื่อมต่อ Google Sheet และซิงค์ข้อมูลเรียบร้อยแล้ว', 'success');
          } catch (syncErr: any) {
            setSyncState(prev => ({
              ...prev,
              isSyncing: false,
              error: syncErr?.message || 'ไม่สามารถซิงค์ข้อมูลกับ Sheet ได้',
            }));
          }
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const isPopupClosed = err?.code === 'auth/popup-closed-by-user';
      const msg = isPopupClosed
        ? 'ยกเลิกการเข้าสู่ระบบ Google'
        : (err?.message || 'การเข้าสู่ระบบ Google ขัดข้อง กรุณาลองใหม่อีกครั้ง');
      setAuthError(msg);
      if (!isPopupClosed) {
        setIsLoginModalOpen(true);
      }
      showToast(msg, 'error');
      setSyncState(prev => ({ ...prev, isSyncing: false }));
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await logout();
      setUserInfo(null);
      setAuthError(null);
      showToast('ออกจากระบบเรียบร้อยแล้ว', 'success');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // หน้าตั้งค่า Google Sheet: เฉพาะผู้ดูแลระบบหลักเท่านั้น
  const handleOpenSheetSettings = () => {
    if (!canManageSheet) {
      showToast('เฉพาะผู้ดูแลระบบหลักที่เปิดหน้าตั้งค่า Google Sheet ได้', 'error');
      return;
    }
    setIsSheetSettingsOpen(true);
  };
  
  // Create new spreadsheet
  const handleCreateNewSheet = async (mode: '12months' | 'single' = '12months') => {
    if (!canManageSheet) {
      const msg = 'เฉพาะผู้ดูแลระบบหลักที่สร้างไฟล์ Google Sheet ใหม่ได้';
      showToast(msg, 'error');
      throw new Error(msg);
    } 
    let token = await getAccessToken();
    if (!token && userInfo?.accessToken) token = userInfo.accessToken;
    if (!token) {
      handleSignInWithGoogle();
      return;
    }

    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      const newSheet = await createSpreadsheet(token, tasks, mode);
      setSyncState(prev => ({
        ...prev,
        spreadsheetId: newSheet.id,
        spreadsheetUrl: newSheet.url,
        spreadsheetTitle: mode === '12months'
          ? 'ระบบติดตามงาน_ปีงบประมาณ_2570_(12เดือน_ต.ค.-ก.ย.)'
          : 'ระบบติดตามงาน_ปีงบประมาณ_2570',
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
      }));
      showToast(
        mode === '12months'
          ? 'สร้าง Google Sheet แยก 12 แท็บประจำเดือน (ต.ค. - ก.ย.) สำเร็จแล้ว'
          : 'สร้างและเชื่อมต่อ Google Sheet ใหม่สำเร็จ',
        'success'
      );
    } catch (err: any) {
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: err?.message || 'ไม่สามารถสร้าง Google Sheet ได้',
      }));
      throw err;
    }
  };

  // Connect existing spreadsheet
  const handleConnectExistingSheet = async (id: string) => {
    if (!canManageSheet) {
      const msg = 'เฉพาะผู้ดูแลระบบหลักที่เชื่อมต่อ Google Sheet ID อื่นได้';
      showToast(msg, 'error');
      throw new Error(msg);
    }
    let token = await getAccessToken();
    if (!token && userInfo?.accessToken) token = userInfo.accessToken;
    if (!token) {
      handleSignInWithGoogle();
      return;
    }

    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      const sheetTasks = await fetchTasksFromSheet(id, token);
      saveSpreadsheetId(id);
      if (sheetTasks.length > 0) {
        setTasks(sheetTasks);
      }
      setSyncState({
        spreadsheetId: id,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${id}`,
        spreadsheetTitle: 'Google Sheet ติดตามงาน 2570',
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
      });
      showToast('เชื่อมต่อ Google Sheet สำเร็จและโหลดข้อมูลเรียบร้อย', 'success');
    } catch (err: any) {
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: err?.message || 'ไม่สามารถเชื่อมต่อกับ Spreadsheet ID นี้ได้',
      }));
      throw err;
    }
  };

  // Full sync tasks to sheet (เฉพาะผู้ดูแลระบบหลัก เพราะล้างข้อมูลเดิมแล้วเขียนทับทั้ง Sheet)
  const handleSyncAllTasks = async () => {
    if (!canManageSheet) {
      showToast('เฉพาะผู้ดูแลระบบหลักที่ซิงค์ข้อมูลทั้งหมดลง Google Sheet ได้ (ระบบบันทึกงานลง Sheet ให้อัตโนมัติอยู่แล้ว)', 'error');
      return;
    }

    let token = await getAccessToken();
    if (!token && userInfo?.accessToken) token = userInfo.accessToken;
    if (!token || !syncState.spreadsheetId) {
      setIsSheetSettingsOpen(true);
      return;
    }

    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      await fullSyncToSheet(syncState.spreadsheetId, token, tasks);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
      }));
      showToast('ซิงค์ข้อมูลทั้งหมดลง Google Sheet สำเร็จ', 'success');
    } catch (err: any) {
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: err?.message || 'การซิงค์ข้อมูลล้มเหลว',
      }));
      showToast(err?.message || 'ไม่สามารถซิงค์ข้อมูลได้', 'error');
    }
  };

  // ดึงข้อมูลล่าสุดจาก Google Sheet มาแสดง (ใช้ตอนอยากเช็คว่ามีใครแก้ไขข้อมูลไปหรือไม่) [NEW]
  const handleRefreshFromSheet = async () => {
    let token = await getAccessToken();
    if (!token && userInfo?.accessToken) token = userInfo.accessToken;

    if (!token || !syncState.spreadsheetId) {
      showToast('กรุณาเข้าสู่ระบบ Google และเชื่อมต่อ Sheet ก่อน', 'error');
      return;
    }

    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      const sheetTasks = await fetchTasksFromSheet(syncState.spreadsheetId, token);
      setTasks(sheetTasks);
      setSessionExpired(false);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
      }));
      showToast('รีเฟรชข้อมูลล่าสุดจาก Google Sheet สำเร็จ', 'success');
    } catch (err: any) {
      if (isSessionError(err)) setSessionExpired(true);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: err?.message || 'ไม่สามารถดึงข้อมูลล่าสุดได้',
      }));
      showToast('ไม่สามารถดึงข้อมูลล่าสุดจาก Sheet ได้ ลองใหม่อีกครั้ง', 'error');
    }
  };

  // แจ้งเตือนเมื่อบันทึกลง Google Sheet ไม่สำเร็จ (ระบบไม่เก็บข้อมูลไว้เฉพาะในเครื่องอีกต่อไป)
  const notifySaveFailed = (err?: any): string => {
    let msg: string;
    if (isSessionError(err)) {
      setSessionExpired(true);
      msg = 'ยังไม่ได้บันทึก: การเชื่อมต่อ Google หมดอายุ กรุณากด "เข้าสู่ระบบ Google ใหม่" แล้วกดบันทึกอีกครั้ง';
    } else {
      msg = `ยังไม่ได้บันทึก: เขียนลง Google Sheet ไม่สำเร็จ (${err?.message || 'กรุณาลองใหม่อีกครั้ง'})`;
    }
    showToast(msg, 'error');
    return msg;
  };

  // เตรียม Sheet ID และ token ก่อนเขียนข้อมูล
  // คืนค่า { sheetId, token } ถ้าพร้อมเขียน หรือคืนข้อความ error (string) ถ้าบันทึกไม่ได้ (แสดง toast แล้ว)
  const requireWriteAccess = async (): Promise<{ sheetId: string; token: string } | string> => {
    const sheetId = syncState.spreadsheetId;
    if (!sheetId) {
      const msg = 'ยังไม่ได้เชื่อมต่อ Google Sheet จึงยังบันทึกไม่ได้ กรุณาเข้าสู่ระบบแล้วลองใหม่';
      showToast(msg, 'error');
      return msg;
    }
    const token = await getSheetToken();
    if (!token) {
      setSessionExpired(true);
      const msg = 'ยังไม่ได้บันทึก: การเชื่อมต่อ Google หมดอายุ กรุณากด "เข้าสู่ระบบ Google ใหม่" แล้วกดบันทึกอีกครั้ง';
      showToast(msg, 'error');
      return msg;
    }
    return { sheetId, token };
  };

  // Add or Edit Task handler (เขียน Google Sheet ก่อน สำเร็จแล้วจึงอัปเดตหน้าจอ)
  // คืนค่า undefined เมื่อสำเร็จ หรือข้อความ error (string) เมื่อไม่สำเร็จ เพื่อให้หน้าต่างแก้ไขไม่ปิดและข้อมูลที่กรอกไม่หาย
  const handleSaveTask = async (taskData: TaskItem): Promise<string | void> => {
    const isEdit = tasks.some(t => t.id === taskData.id);
    const deny = (msg: string): string => {
      showToast(msg, 'error');
      return msg;
    };

    // ตรวจสอบสิทธิ์ผู้ใช้งานตามบัญชี Google
    const perm = getUserPermission(userInfo?.email);
    if (isEdit) {
      const originalTask = tasks.find(t => t.id === taskData.id);
      if (
        !canUserEditTask(taskData, userInfo?.email) ||
        (originalTask && !canUserEditTask(originalTask, userInfo?.email))
      ) {
        return deny(`คุณไม่มีสิทธิ์แก้ไขงานกลุ่มนี้ (สิทธิ์ของคุณ: ${perm.departmentTitle})`);
      }
    } else {
      if (!canUserAddTask(userInfo?.email)) {
        return deny(`คุณไม่มีสิทธิ์เพิ่มงานในระบบ (สิทธิ์ของคุณ: ${perm.departmentTitle})`);
      }
      if (!canUserAddTaskInUnit(taskData, userInfo?.email)) {
        return deny(`คุณเพิ่มงานได้เฉพาะหน่วยของตนเอง (สิทธิ์ของคุณ: ${perm.departmentTitle})`);
      }
    }

    const access = await requireWriteAccess();
    if (typeof access === 'string') return access;
    const { sheetId, token } = access;

    isSavingRef.current = true;
    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      if (isEdit) {
        await updateTaskInSheet(sheetId, token, taskData);
        setTasks(prev => prev.map(t => (t.id === taskData.id ? taskData : t)));
      } else {
        const row = await appendTaskToSheet(sheetId, token, taskData);
        const newTask: TaskItem = row > 0 ? { ...taskData, rowNumber: row } : taskData;
        setTasks(prev => [newTask, ...prev]);
      }
      setSessionExpired(false);
      setSyncState(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date(), error: null }));
      showToast(
        isEdit ? 'บันทึกการแก้ไขลง Google Sheet สำเร็จ' : 'เพิ่มรายการงานใหม่ลง Google Sheet สำเร็จ',
        'success'
      );
    } catch (err: any) {
      console.warn('Save to sheet failed:', err);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: err?.message || 'บันทึกลง Google Sheet ไม่สำเร็จ',
      }));
      return notifySaveFailed(err);
    } finally {
      isSavingRef.current = false;
    }
  };

  // Quick Status change directly from list or dashboard
  const handleQuickStatusChange = async (task: TaskItem, newStatus: TaskStatus) => {
    // ตรวจสอบสิทธิ์แก้ไขงาน
    if (!canUserEditTask(task, userInfo?.email)) {
      const perm = getUserPermission(userInfo?.email);
      showToast(`คุณไม่มีสิทธิ์เปลี่ยนสถานะงานกลุ่มนี้ (สิทธิ์ของคุณ: ${perm.departmentTitle})`, 'error');
      return;
    }

    let newProgress = task.progress;
    if (newStatus === 'ดำเนินการแล้วเสร็จ') {
      newProgress = 100;
    } else if (newStatus === 'ยังไม่ดำเนินการ') {
      newProgress = 0;
    } else if (newStatus === 'ระหว่างดำเนินการ' && (newProgress === 0 || newProgress === 100)) {
      newProgress = 50;
    }

    const updatedTask: TaskItem = {
      ...task,
      status: newStatus,
      progress: newProgress,
      updatedAt: new Date().toISOString(),
    };

    const access = await requireWriteAccess();
    if (typeof access === 'string') return;
    const { sheetId, token } = access;

    isSavingRef.current = true;
    setSyncState(prev => ({ ...prev, isSyncing: true }));
    try {
      await updateTaskInSheet(sheetId, token, updatedTask);
      setTasks(prev => prev.map(t => (t.id === task.id ? updatedTask : t)));
      setSessionExpired(false);
      setSyncState(prev => ({ ...prev, isSyncing: false, lastSyncedAt: new Date() }));
      showToast(`เปลี่ยนสถานะเป็น "${newStatus}" และบันทึกลง Google Sheet แล้ว`, 'success');
    } catch (err: any) {
      console.warn('Status update on sheet failed:', err);
      setSyncState(prev => ({ ...prev, isSyncing: false }));
      notifySaveFailed(err);
    } finally {
      isSavingRef.current = false;
    }
  };

  // Request Task Delete (Google Workspace skill requires explicit confirmation)
  const handleDeleteTaskRequest = (task: TaskItem) => {
    // ตรวจสอบสิทธิ์ลบงาน
    if (!canUserDeleteTask(task, userInfo?.email)) {
      const perm = getUserPermission(userInfo?.email);
      showToast(`คุณไม่มีสิทธิ์ลบงานกลุ่มนี้ (สิทธิ์ของคุณ: ${perm.departmentTitle})`, 'error');
      return;
    }

    setConfirmModalState({
      isOpen: true,
      title: 'ยืนยันการลบรายการงาน',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบ "${task.title}" (รหัส: ${task.id})? ข้อมูลจะถูกลบออกจากระบบและ Google Sheet ทันที`,
      confirmLabel: 'ลบรายการนี้',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));

        // ลบใน Google Sheet ก่อน สำเร็จแล้วจึงลบออกจากหน้าจอ
        const access = await requireWriteAccess();
        if (typeof access === 'string') return;
        const { sheetId, token } = access;

        isSavingRef.current = true;
        try {
          await deleteTaskFromSheet(sheetId, token, task);
          setTasks(prev => prev.filter(t => t.id !== task.id));
          setSessionExpired(false);
          setSyncState(prev => ({ ...prev, lastSyncedAt: new Date() }));
          showToast(`ลบงาน "${task.title}" เรียบร้อยแล้ว`, 'success');
        } catch (sheetErr: any) {
          // ไม่เขียนทับทั้ง Sheet เมื่อลบล้มเหลว เพื่อไม่ให้ข้อมูลของผู้ใช้อื่นหาย
          console.warn('Delete on sheet failed:', sheetErr);
          notifySaveFailed(sheetErr);
        } finally {
          isSavingRef.current = false;
        }
      },
    });
  };

  // Navigation handlers from Dashboard clicks
  const handleSelectStatusFromDashboard = (status: TaskStatus) => {
    setInitialFilterStatus(status);
    setActiveTab('tasks');
  };

  const handleSelectDeptFromDashboard = (deptId: string) => {
    setInitialFilterDept(deptId);
    setActiveTab('tasks');
  };

  // ตรวจสอบว่าเปิดโหมดจำลองอุปกรณ์เฉพาะบนจอเดสก์ท็อปเท่านั้น
  const isSimulatorActive = !isMobileScreen && deviceMode !== 'desktop';

  return (
    <div className={`min-h-screen flex flex-col ${
      isSimulatorActive
        ? 'bg-slate-100 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] py-4 px-2 sm:px-4 items-center justify-start overflow-x-auto'
        : 'bg-slate-50'
    }`}>
      {/* Top Simulator Control Bar (เฉพาะเมื่อเปิดบน Desktop และเปิดโหมดจำลอง) */}
      {isSimulatorActive && (
        <header className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-md border border-slate-200/90 py-2 px-4 shadow-sm rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-3 text-xs z-50">
          <div className="flex items-center gap-3">
            <DeviceDropdown deviceMode={deviceMode} onChangeDeviceMode={setDeviceMode} />
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              {deviceMode === 'mobile' ? (
                <>
                  <Smartphone className="h-4 w-4 text-blue-600" />
                  <span>จำลองสมาร์ตโฟน (Mobile: 390 × 844 px)</span>
                </>
              ) : (
                <>
                  <Tablet className="h-4 w-4 text-blue-600" />
                  <span>จำลองแท็บเล็ต (Tablet: 768 × 1024 px)</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Zoom Scale Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <span className="px-2 text-slate-500 font-medium text-[11px]">ขนาด:</span>
              <button
                type="button"
                onClick={() => setDeviceZoom(1)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                  deviceZoom === 1
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => setDeviceZoom(1.2)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                  deviceZoom === 1.2
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="ขยายขนาดให้อ่านง่าย ชัดเจน เต็มตา"
              >
                120% (ขยายชัดเจน)
              </button>
            </div>

            {/* Close / Return to full screen */}
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl border border-slate-200 font-medium text-xs transition-colors cursor-pointer select-none"
              title="กลับสู่มุมมองขนาดหน้าจอปกติ (เต็มจอ)"
            >
              <X className="h-3.5 w-3.5" />
              <span>กลับหน้าจอปกติ</span>
            </button>
          </div>
        </header>
      )}

      {/* Frame Container for Simulated Devices (เฉพาะบน Desktop เมื่อเลือกจำลอง) */}
      <div
        style={isSimulatorActive && deviceMode === 'mobile' && deviceZoom !== 1 ? { transform: `scale(${deviceZoom})`, transformOrigin: 'top center' } : undefined}
        className={`w-full transition-all duration-300 flex flex-col flex-1 ${
          isSimulatorActive && deviceMode === 'tablet'
            ? 'max-w-[768px] mx-auto my-2 rounded-[32px] shadow-2xl border-[10px] border-slate-800 overflow-hidden bg-slate-50 min-h-[85vh] max-h-[90vh] ring-1 ring-slate-900/10'
            : isSimulatorActive && deviceMode === 'mobile'
            ? 'max-w-[390px] mx-auto my-2 rounded-[42px] shadow-2xl border-[10px] border-slate-800 overflow-hidden bg-slate-50 min-h-[844px] max-h-[88vh] ring-1 ring-slate-900/10'
            : 'bg-slate-50 text-slate-900'
        } font-['Prompt',sans-serif]`}
      >
        {/* Mobile Top Notch / Dynamic Island */}
        {isSimulatorActive && deviceMode === 'mobile' && (
          <div className="w-full bg-slate-800 py-1.5 flex justify-center items-center shrink-0">
            <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-end pr-2">
              <div className="w-2 h-2 rounded-full bg-blue-500/40" />
            </div>
          </div>
        )}

        {/* Scrollable Container inside phone/tablet frame */}
        <div className={`flex flex-col flex-1 ${isSimulatorActive ? 'overflow-y-auto' : ''}`}>
          {/* Main Navbar */}
          <Navbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userInfo={userInfo}
            syncState={syncState}
            onSignInWithGoogle={() => setIsLoginModalOpen(true)}
            onSignOut={handleSignOut}
            onOpenSheetSettings={handleOpenSheetSettings}
            onQuickSync={canManageSheet ? handleSyncAllTasks : handleRefreshFromSheet}
            deviceMode={deviceMode}
            onChangeDeviceMode={setDeviceMode}
            onOpenPermissionsModal={() => setIsPermissionsModalOpen(true)}
          />

          {/* Main Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* [NEW] Banner แจ้งเตือนเมื่อเปิดใน LINE หรือ In-App Browser */}
            {inApp && !inAppNoticeDismissed && (
              <div className="mb-4 bg-gradient-to-r from-sky-50 via-blue-50/70 to-indigo-50 border border-sky-300 rounded-2xl p-3.5 sm:p-4 text-sky-950 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-xl bg-sky-500 text-white shrink-0 mt-0.5 shadow-xs">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-sky-900">
                        กำลังเปิดผ่านแอป {inAppName || 'LINE'}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-sky-200 text-sky-900 text-[10px] font-bold">
                        แนะนำเปิดใน Google Chrome
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-sky-800 mt-1 leading-relaxed">
                      Google ไม่อนุญาตให้ล็อกอินบัญชี <strong>@nu.ac.th</strong> ผ่านเบราว์เซอร์ของแอป (จะเกิดข้อผิดพลาด <em>missing initial state</em>) หากต้องการบันทึกหรือซิงค์ข้อมูล กรุณากดปุ่มเปิดใน Chrome
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0">
                  <button
                    type="button"
                    onClick={() => openInExternalBrowser()}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>เปิดใน Chrome</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyCurrentUrl();
                      if (ok) showToast('คัดลอกลิงก์สำเร็จ นำไปวางใน Google Chrome ได้เลย', 'success');
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-sky-100/60 border border-sky-300 text-sky-900 text-xs font-semibold shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
                    title="คัดลอกลิงก์เพื่อไปวางใน Chrome"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">คัดลอกลิงก์</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInAppNoticeDismissed(true)}
                    className="p-1.5 rounded-xl text-sky-700 hover:text-sky-950 hover:bg-sky-200/60 transition-colors"
                    title="ปิดการแจ้งเตือนนี้"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* แถบเตือนสีเหลือง: การเชื่อมต่อ Google หมดอายุ (อ่าน/เขียน Sheet ไม่ได้) */}
            {userInfo && sessionExpired && (
              <div className="mb-4 bg-amber-50 border border-amber-300 rounded-2xl p-3.5 sm:p-4 text-amber-950 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-amber-900">
                      การเชื่อมต่อ Google หมดอายุ ข้อมูลที่แก้ไขจะยังไม่ถูกบันทึก
                    </h3>
                    <p className="text-[11px] sm:text-xs text-amber-800 mt-1 leading-relaxed">
                      กรุณาเข้าสู่ระบบ Google ใหม่ (ใช้เวลาไม่กี่วินาที) แล้วจึงเพิ่มหรือแก้ไขงานต่อ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignInWithGoogle}
                  disabled={isLoggingIn}
                  className="shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>เข้าสู่ระบบ Google ใหม่</span>
                </button>
              </div>
            )}

            {/* แถบเตือนสีแดง: เชื่อมต่อ Google Sheet คนละไฟล์กับไฟล์กลางของคณะ */}
            {userInfo && syncState.spreadsheetId && syncState.spreadsheetId !== CENTRAL_SHEET_ID && (
              <div className="mb-4 bg-rose-50 border border-rose-300 rounded-2xl p-3.5 sm:p-4 text-rose-950 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-rose-900">
                      เครื่องนี้เชื่อมต่อ Google Sheet คนละไฟล์กับไฟล์กลางของคณะ
                    </h3>
                    <p className="text-[11px] sm:text-xs text-rose-800 mt-1 leading-relaxed">
                      ข้อมูลที่เห็นอาจไม่ตรงกับเครื่องอื่น และงานที่บันทึกจะไม่ไปอยู่ในไฟล์กลาง
                      {canManageSheet
                        ? ' กรุณาเปิดหน้าตั้งค่า Google Sheet แล้วเชื่อมต่อไฟล์กลางอีกครั้ง'
                        : ' กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่ หากยังพบข้อความนี้ให้แจ้งผู้ดูแลระบบ'}
                    </p>
                  </div>
                </div>
                {canManageSheet && (
                  <button
                    type="button"
                    onClick={() => setIsSheetSettingsOpen(true)}
                    className="shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>เปิดหน้าตั้งค่า Google Sheet</span>
                  </button>
                )}
              </div>
            )}

            {/* ปุ่มรีเฟรชข้อมูลล่าสุด - แสดงเฉพาะหน้า รายงานผลการดำเนินงาน (dashboard) เท่านั้น */}
            {syncState.spreadsheetId && activeTab === 'dashboard' && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={handleRefreshFromSheet}
                  disabled={syncState.isSyncing}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-b from-sky-400 via-sky-500 to-sky-600 hover:from-sky-500 hover:to-sky-700 border-t border-t-sky-200 border-x border-sky-500 border-b-[3.5px] border-b-sky-850 shadow-md shadow-sky-600/25 ring-1 ring-inset ring-white/30 rounded-xl transition-all active:translate-y-0.5 active:border-b-2 disabled:opacity-50 cursor-pointer select-none"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                  <span>รีเฟรชข้อมูลล่าสุดจาก Google Sheet</span>
                </button>
              </div>
            )}

            {/* Tab Views */}
            {activeTab === 'dashboard' && (
              <DashboardView
                tasks={tasks}
                onSelectDepartmentFilter={handleSelectDeptFromDashboard}
                onSelectStatusFilter={handleSelectStatusFromDashboard}
                onOpenNewTaskModal={() => {
                  if (!userInfo) {
                    showToast('กรุณาเข้าสู่ระบบด้วยอีเมล @nu.ac.th ก่อนเพิ่มงานใหม่', 'error');
                    setIsLoginModalOpen(true);
                    return;
                  }
                  setTaskToEdit(null);
                  setTaskModalDefaultDate(undefined);
                  setIsTaskModalOpen(true);
                }}
                deviceMode={deviceMode}
                isGuestMode={!userInfo}
                currentUserEmail={userInfo?.email}
              />
            )}

            {activeTab === 'tasks' && (
              <TaskListView
                tasks={tasks}
                initialStatusFilter={initialFilterStatus}
                initialDeptFilter={initialFilterDept}
                onAddTask={() => {
                  if (!userInfo) {
                    showToast('กรุณาเข้าสู่ระบบด้วยอีเมล @nu.ac.th ก่อนเพิ่มงานใหม่', 'error');
                    setIsLoginModalOpen(true);
                    return;
                  }
                  setTaskToEdit(null);
                  setTaskModalDefaultDate(undefined);
                  setIsTaskModalOpen(true);
                }}
                onEditTask={task => {
                  setTaskToEdit(task);
                  setTaskModalDefaultDate(undefined);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTaskRequest}
                onQuickStatusChange={handleQuickStatusChange}
                deviceMode={deviceMode}
                isGuestMode={!userInfo}
                currentUserEmail={userInfo?.email}
              />
            )}

            {activeTab === 'calendar' && (
              <TaskCalendarView
                tasks={tasks}
                onAddTask={(defaultDate?: string) => {
                  if (!userInfo) {
                    showToast('กรุณาเข้าสู่ระบบด้วยอีเมล @nu.ac.th ก่อนเพิ่มงานใหม่', 'error');
                    setIsLoginModalOpen(true);
                    return;
                  }
                  setTaskToEdit(null);
                  setTaskModalDefaultDate(defaultDate);
                  setIsTaskModalOpen(true);
                }}
                onEditTask={task => {
                  setTaskToEdit(task);
                  setTaskModalDefaultDate(undefined);
                  setIsTaskModalOpen(true);
                }}
                onQuickStatusChange={handleQuickStatusChange}
                deviceMode={deviceMode}
                isGuestMode={!userInfo}
                currentUserEmail={userInfo?.email}
              />
            )}

            {activeTab === 'monthly-report' && <MonthlyReportView tasks={tasks} />}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white py-6 mt-8 text-center text-xs text-slate-500 print:hidden">
            <div className="max-w-7xl mx-auto px-4 space-y-1.5">
              <p className="font-semibold text-slate-700">
                ระบบติดตามงาน ปีงบประมาณ 2570
              </p>
              <p className="text-slate-500 text-[11px]">
                คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร
              </p>
              <p className="text-slate-400 text-[10px] pt-0.5 flex flex-wrap items-center justify-center gap-x-2">
                <span>เชื่อมต่อการจัดเก็บข้อมูลด้วย Google Sheets API & Google Authentication</span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span>จัดทำโดย นายอนุวัทย์&nbsp;&nbsp;เรืองจันทร์</span>
              </p>
            </div>
          </footer>
        </div>

        {/* Mobile Home Indicator bar */}
        {deviceMode === 'mobile' && (
          <div className="w-full bg-slate-800 py-2 flex justify-center items-center shrink-0">
            <div className="w-28 h-1 bg-slate-500 rounded-full" />
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className={`fixed bottom-5 right-5 z-[60] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-white border border-slate-800'
              : 'bg-rose-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-white" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
          setTaskModalDefaultDate(undefined);
        }}
        onSave={handleSaveTask}
        onDeleteTask={task => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
          handleDeleteTaskRequest(task);
        }}
        taskToEdit={taskToEdit}
        defaultDueDate={taskModalDefaultDate}
        currentUserEmail={userInfo?.email}
        sessionExpired={sessionExpired}
        onReLogin={handleSignInWithGoogle}
      />

      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmLabel={confirmModalState.confirmLabel}
        isDestructive={confirmModalState.isDestructive}
        onConfirm={confirmModalState.onConfirm}
        onCancel={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
      />

      <SheetSettingsModal
        isOpen={isSheetSettingsOpen && canManageSheet}
        onClose={() => setIsSheetSettingsOpen(false)}
        syncState={syncState}
        isAuthenticated={!!userInfo}
        onCreateNewSheet={handleCreateNewSheet}
        onSyncAllTasks={handleSyncAllTasks}
        onConnectExistingSheet={handleConnectExistingSheet}
        onSignInWithGoogle={handleSignInWithGoogle}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSignIn={handleSignInWithGoogle}
        isLoading={isLoggingIn}
        errorMessage={authError}
        onClearError={() => setAuthError(null)}
      />

      <UserPermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        currentUserEmail={userInfo?.email}
      />
    </div>
  );
}
