import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  PlusCircle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { SheetSyncState } from '../types';
import { cleanSheetTitle } from '../services/sheetsService';

interface SheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SheetSyncState;
  isAuthenticated: boolean;
  onSignInWithGoogle: () => void;
  onCreateNewSheet: () => Promise<void>;
  onConnectExistingSheet: (sheetId: string) => Promise<void>;
  onSyncAllTasks: () => Promise<void>;
}

export const SheetSettingsModal: React.FC<SheetSettingsModalProps> = ({
  isOpen,
  onClose,
  syncState,
  isAuthenticated,
  onSignInWithGoogle,
  onCreateNewSheet,
  onConnectExistingSheet,
  onSyncAllTasks,
}) => {
  const [customSheetId, setCustomSheetId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSheetId.trim()) return;

    let cleanId = customSheetId.trim();
    // Support full Google Sheets URL pasting
    if (cleanId.includes('/spreadsheets/d/')) {
      const match = cleanId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        cleanId = match[1];
      }
    }

    setIsConnecting(true);
    setActionSuccessMsg(null);
    try {
      await onConnectExistingSheet(cleanId);
      setActionSuccessMsg('เชื่อมต่อ Google Sheet สำเร็จแล้ว');
      setCustomSheetId('');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreate = async () => {
    setActionSuccessMsg(null);
    try {
      await onCreateNewSheet();
      setActionSuccessMsg('สร้างและเชื่อมต่อ Google Sheet ใหม่สำเร็จแล้ว');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSync = async () => {
    setActionSuccessMsg(null);
    try {
      await onSyncAllTasks();
      setActionSuccessMsg('ซิงค์ข้อมูลกับ Google Sheet เรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      id="sheet-settings-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="sheet-settings-modal-box"
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Luxury Midnight Navy Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-4 text-white flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg">การเชื่อมต่อ Google Sheets</h3>
              <p className="text-xs text-blue-200/90">
                จัดเก็บข้อมูลระบบติดตามงาน ปีงบประมาณ 2570 แบบคลาวด์
              </p>
            </div>
          </div>
          <button
            id="sheet-settings-close-btn"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {actionSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {syncState.error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{syncState.error}</span>
            </div>
          )}

          {!isAuthenticated ? (
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-center space-y-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">ต้องเข้าสู่ระบบ Google Account</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                  กรุณาเข้าสู่ระบบด้วยบัญชี Google เพื่อให้ระบบสามารถเข้าถึงและบันทึกข้อมูลลง Google Sheet ของคุณได้
                </p>
              </div>
              <button
                id="sheet-modal-signin-btn"
                onClick={onSignInWithGoogle}
                className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-medium rounded-xl text-xs transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
              >
                เข้าสู่ระบบ Google Account
              </button>
            </div>
          ) : (
            <>
              {/* Connected Sheet Details */}
              {syncState.spreadsheetId ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Google Sheet ที่เชื่อมต่ออยู่:</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> เชื่อมต่อแล้ว
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 break-all">
                      {cleanSheetTitle(syncState.spreadsheetTitle) || 'ระบบติดตามงาน ปีงบประมาณ 2570'}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-500 truncate">
                      ID: {syncState.spreadsheetId}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <a
                      id="sheet-modal-open-link"
                      href={syncState.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${syncState.spreadsheetId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>เปิดดูใน Google Sheets</span>
                    </a>

                    <button
                      id="sheet-modal-force-sync-btn"
                      onClick={handleSync}
                      disabled={syncState.isSyncing}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                      <span>{syncState.isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลทั้งหมดทับ Sheet'}</span>
                    </button>
                  </div>

                  {syncState.lastSyncedAt && (
                    <p className="text-[10px] text-slate-400 pt-1">
                      ซิงค์ล่าสุด: {syncState.lastSyncedAt.toLocaleTimeString('th-TH')} น.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-center space-y-3">
                  <p className="text-xs text-slate-600">
                    ยังไม่มีการเชื่อมต่อกับ Google Sheet สำหรับติดตามงานปี 2570
                  </p>
                  <button
                    id="sheet-modal-create-sheet-btn"
                    onClick={handleCreate}
                    disabled={syncState.isSyncing}
                    className="px-4 py-2 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    {syncState.isSyncing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="h-4 w-4" />
                    )}
                    <span>สร้าง Google Sheet ติดตามงาน 2570 อัตโนมัติ</span>
                  </button>
                </div>
              )}

              {/* Create or Connect another sheet */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h5 className="text-xs font-bold text-slate-700">หรือระบุ Google Sheet ID / ลิงก์ ที่มีอยู่แล้ว:</h5>
                <form onSubmit={handleConnectExisting} className="flex gap-2">
                  <input
                    id="sheet-modal-id-input"
                    type="text"
                    value={customSheetId}
                    onChange={e => setCustomSheetId(e.target.value)}
                    placeholder="วาง Spreadsheet ID หรือ URL เต็ม..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                  <button
                    id="sheet-modal-connect-btn"
                    type="submit"
                    disabled={isConnecting || !customSheetId.trim()}
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                  >
                    เชื่อมต่อ
                  </button>
                </form>
              </div>
            </>
          )}

          <div className="pt-2 flex justify-end">
            <button
              id="sheet-modal-close-footer-btn"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
