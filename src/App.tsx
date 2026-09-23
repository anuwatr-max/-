import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TaskListView } from './components/TaskListView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { TaskModal } from './components/TaskModal';
import { ConfirmModal } from './components/ConfirmModal';
import { SheetSettingsModal } from './components/SheetSettingsModal';
import { TaskItem, TaskStatus, UserAuthInfo, SheetSyncState } from './types';
import { INITIAL_SAMPLE_TASKS } from './data/sampleTasks';
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
} from './services/sheetsService';
import { CheckCircle2, AlertCircle, RefreshCw, FileSpreadsheet } from 'lucide-react';

const LOCAL_STORAGE_TASKS_KEY = 'nuls_tracking_tasks_2570';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Tasks state (initial load from localStorage or fallback to sample tasks)
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load local tasks:', e);
    }
    return INITIAL_SAMPLE_TASKS;
  });

  // User Auth State
  const [userInfo, setUserInfo] = useState<UserAuthInfo | null>(null);

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
        setUserInfo({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          accessToken: token,
        });

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
              setSyncState(prev => ({
                ...prev,
                isSyncing: false,
                error: 'ไม่สามารถดึงข้อมูลจาก Sheet ได้ กำลังใช้ข้อมูลท้องถิ่น',
              }));
            }
          }
        }
      },
      () => {
        setUserInfo(null);
      }
    );

    return () => unsubscribe();
  }, [showToast]);

  // Google Sign In
  const handleSignInWithGoogle = async () => {
    try {
      setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
      const result = await googleSignIn();
      if (result) {
        setUserInfo({
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          accessToken: result.accessToken,
        });
        showToast(`เข้าสู่ระบบสำเร็จ: ${result.user.displayName || result.user.email}`, 'success');

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
            } else {
              // Write existing local tasks to empty sheet
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
      showToast(err?.message || 'การเข้าสู่ระบบ Google ขัดข้อง กรุณาลองใหม่อีกครั้ง', 'error');
      setSyncState(prev => ({ ...prev, isSyncing: false }));
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await logout();
      setUserInfo(null);
      showToast('ออกจากระบบเรียบร้อยแล้ว', 'success');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Create new spreadsheet
  const handleCreateNewSheet = async () => {
    let token = await getAccessToken();
    if (!token && userInfo?.accessToken) token = userInfo.accessToken;
    if (!token) {
      handleSignInWithGoogle();
      return;
    }

    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      const newSheet = await createSpreadsheet(token, tasks);
      setSyncState(prev => ({
        ...prev,
        spreadsheetId: newSheet.id,
        spreadsheetUrl: newSheet.url,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
      }));
      showToast('สร้างและเชื่อมต่อ Google Sheet ใหม่สำเร็จ', 'success');
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

  // Full sync tasks to sheet
  const handleSyncAllTasks = async () => {
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
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
      }));
      showToast('รีเฟรชข้อมูลล่าสุดจาก Google Sheet สำเร็จ', 'success');
    } catch (err: any) {
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: err?.message || 'ไม่สามารถดึงข้อมูลล่าสุดได้',
      }));
      showToast('ไม่สามารถดึงข้อมูลล่าสุดจาก Sheet ได้ ลองใหม่อีกครั้ง', 'error');
    }
  };

  // Add or Edit Task handler
  const handleSaveTask = async (taskData: TaskItem) => {
    const isEdit = tasks.some(t => t.id === taskData.id);
    let updatedTasks: TaskItem[];

    if (isEdit) {
      updatedTasks = tasks.map(t => (t.id === taskData.id ? taskData : t));
      setTasks(updatedTasks);
      showToast('บันทึกการแก้ไขงานสำเร็จ', 'success');
    } else {
      updatedTasks = [taskData, ...tasks];
      setTasks(updatedTasks);
      showToast('เพิ่มรายการงานใหม่สำเร็จ', 'success');
    }

    // Background sync to Google Sheet if connected
    const token = await getAccessToken();
    if (token && syncState.spreadsheetId) {
      try {
        if (isEdit && taskData.rowNumber) {
          await updateTaskInSheet(syncState.spreadsheetId, token, taskData.rowNumber, taskData);
        } else {
          const row = await appendTaskToSheet(syncState.spreadsheetId, token, taskData);
          if (row > 0) {
            setTasks(prev => prev.map(t => (t.id === taskData.id ? { ...t, rowNumber: row } : t)));
          }
        }
        setSyncState(prev => ({ ...prev, lastSyncedAt: new Date() }));
      } catch (sheetErr: any) {
        // [แก้ไข 1.1] แจ้งเตือนผู้ใช้แบบเห็นได้จริง แทนที่จะเงียบไว้แค่ใน console
        console.warn('Background sync failed:', sheetErr);
        showToast(
          'บันทึกในเครื่องสำเร็จ แต่ส่งข้อมูลขึ้น Google Sheet ไม่สำเร็จ กรุณากดซิงค์ใหม่อีกครั้ง',
          'error'
        );
      }
    }
  };

  // Quick Status change directly from list or dashboard
  const handleQuickStatusChange = async (task: TaskItem, newStatus: TaskStatus) => {
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

    setTasks(prev => prev.map(t => (t.id === task.id ? updatedTask : t)));
    showToast(`เปลี่ยนสถานะเป็น "${newStatus}" เรียบร้อยแล้ว`, 'success');

    // Background update Google Sheet if connected
    const token = await getAccessToken();
    if (token && syncState.spreadsheetId && task.rowNumber) {
      try {
        await updateTaskInSheet(syncState.spreadsheetId, token, task.rowNumber, updatedTask);
        setSyncState(prev => ({ ...prev, lastSyncedAt: new Date() }));
      } catch (err: any) {
        // [แก้ไข 1.2] แจ้งเตือนผู้ใช้แบบเห็นได้จริง แทนที่จะเงียบไว้แค่ใน console
        console.warn('Status update on sheet failed:', err);
        showToast(
          'เปลี่ยนสถานะในเครื่องสำเร็จ แต่ยังไม่ได้อัปเดตลง Google Sheet กรุณากดซิงค์ใหม่',
          'error'
        );
      }
    }
  };

  // Request Task Delete (Google Workspace skill requires explicit confirmation)
  const handleDeleteTaskRequest = (task: TaskItem) => {
    setConfirmModalState({
      isOpen: true,
      title: 'ยืนยันการลบรายการงาน',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบ "${task.title}" (รหัส: ${task.id})? ข้อมูลจะถูกลบออกจากระบบและ Google Sheet ทันที`,
      confirmLabel: 'ลบรายการนี้',
      isDestructive: true,
      onConfirm: async () => {
        const remainingTasks = tasks.filter(t => t.id !== task.id);
        setTasks(remainingTasks);
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
        showToast(`ลบงาน "${task.title}" เรียบร้อยแล้ว`, 'success');

        // Update Google Sheet
        const token = await getAccessToken();
        if (token && syncState.spreadsheetId) {
          try {
            if (task.rowNumber) {
              await deleteTaskFromSheet(syncState.spreadsheetId, token, task.rowNumber);
            } else {
              await fullSyncToSheet(syncState.spreadsheetId, token, remainingTasks);
            }
            setSyncState(prev => ({ ...prev, lastSyncedAt: new Date() }));
          } catch (sheetErr: any) {
            // [แก้ไข 1.3] แจ้งเตือนผู้ใช้แบบเห็นได้จริง ถ้าลองซิงค์ซ้ำแล้วยังไม่สำเร็จ
            console.warn('Delete on sheet failed, performing full sync:', sheetErr);
            try {
              if (syncState.spreadsheetId) {
                await fullSyncToSheet(syncState.spreadsheetId, token, remainingTasks);
              }
            } catch (retryErr) {
              showToast(
                'ลบในเครื่องสำเร็จ แต่ลบใน Google Sheet ไม่สำเร็จ กรุณากดซิงค์ใหม่',
                'error'
              );
            }
          }
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Prompt',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 ${
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

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userInfo={userInfo}
        syncState={syncState}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSignOut={handleSignOut}
        onOpenSheetSettings={() => setIsSheetSettingsOpen(true)}
        onQuickSync={handleSyncAllTasks}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* [NEW] ปุ่มรีเฟรชข้อมูลล่าสุด - แสดงเฉพาะตอนเชื่อมต่อ Sheet แล้ว */}
        {syncState.spreadsheetId && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleRefreshFromSheet}
              disabled={syncState.isSyncing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
              {syncState.isSyncing ? 'กำลังรีเฟรช...' : 'รีเฟรชข้อมูลล่าสุด'}
            </button>
          </div>
        )}

        {/* Connection Notice Banner if Not Connected */}
        {!syncState.spreadsheetId && (
          <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900">
                  ระบบกำลังทำงานในโหมดจัดเก็บข้อมูลเฉพาะเครื่อง (Local Mode)
                </span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  เข้าสู่ระบบด้วย Google Account เพื่อเชื่อมต่อและบันทึกข้อมูลลง Google Sheet อัตโนมัติ
                </p>
              </div>
            </div>
            <button
              onClick={handleSignInWithGoogle}
              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              เข้าสู่ระบบ Google
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
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskListView
            tasks={tasks}
            initialStatusFilter={initialFilterStatus}
            initialDeptFilter={initialFilterDept}
            onAddTask={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            onEditTask={task => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTaskRequest}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}

        {activeTab === 'monthly-report' && <MonthlyReportView tasks={tasks} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-8 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            ระบบติดตามงาน (Work Tracking System) ปีงบประมาณ 2570
          </p>
          <p className="text-slate-500 text-[11px]">
            คณะโลจิสติกส์และดิจิทัลซัพพลายเชน มหาวิทยาลัยนเรศวร (Faculty of Logistics and Digital Supply Chain, Naresuan University)
          </p>
          <p className="text-slate-400 text-[10px] pt-1">
            เชื่อมต่อการจัดเก็บข้อมูลด้วย Google Sheets API & Google Authentication
          </p>
        </div>
      </footer>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
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
        isOpen={isSheetSettingsOpen}
        onClose={() => setIsSheetSettingsOpen(false)}
        syncState={syncState}
        isAuthenticated={!!userInfo}
        onCreateNewSheet={handleCreateNewSheet}
        onSyncAllTasks={handleSyncAllTasks}
        onConnectExistingSheet={handleConnectExistingSheet}
        onSignInWithGoogle={handleSignInWithGoogle}
      />
    </div>
  );
}

