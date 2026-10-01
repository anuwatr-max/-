import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use local persistence so users stay logged in across page reloads on mobile
try {
  setPersistence(auth, browserLocalPersistence).catch(err => {
    console.warn('Set auth persistence warning:', err);
  });
} catch (e) {
  console.warn('Set auth persistence exception:', e);
}

const provider = new GoogleAuthProvider();
// Workspace scopes requested
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
// Allow user to select their @nu.ac.th account
provider.setCustomParameters({
  prompt: 'select_account',
});

const STORAGE_KEY_ACCESS_TOKEN = 'google_oauth_access_token_v1';

let isSigningIn = false;
let cachedAccessToken: string | null = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
  } catch (e) {
    return null;
  }
})();

// Listen for auth state changes
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (!cachedAccessToken) {
        try {
          cachedAccessToken = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
        } catch (e) {}
      }
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      try {
        localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
      } catch (e) {}
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('ไม่พบ Access Token จาก Google Authentication');
    }

    cachedAccessToken = credential.accessToken;
    try {
      localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, credential.accessToken);
    } catch (e) {
      console.warn('Failed to persist token:', e);
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    const msg = String(error?.message || '');
    if (
      msg.includes('missing initial state') ||
      msg.includes('sessionStorage') ||
      error?.code === 'auth/internal-error'
    ) {
      throw new Error('ไม่สามารถเข้าสู่ระบบในหน้านี้ได้ เนื่องจากเบราว์เซอร์ของแอป (เช่น LINE) ไม่อนุญาต กรุณากดปุ่ม 3 จุด (...) แล้วเลือก "เปิดในเบราว์เซอร์อื่น" หรือเปิดด้วย Google Chrome');
    }
    if (error?.code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
      throw new Error('การเชื่อมต่อกับเซิร์ฟเวอร์ Google Authentication ล้มเหลว (Network Request Failed) สาเหตุส่วนใหญ่เกิดจากการเปิดผ่านแอป LINE/Facebook, สัญญาณอินเทอร์เน็ตไม่เสถียร หรือมี AdBlocker บล็อก แนะนำให้คัดลอกลิงก์ไปเปิดใน Google Chrome หรือ Safari โดยตรง');
    }
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('เบราว์เซอร์บนมือถือบล็อกหน้าต่างป๊อปอัป กรุณาเปิดด้วย Google Chrome หรือ Safari เพื่อเข้าสู่ระบบ');
    }
    if (error?.code === 'auth/popup-closed-by-user') {
      throw new Error('หน้าต่างเข้าสู่ระบบถูกปิดก่อนยืนยันสำเร็จ');
    }
    if (error?.code === 'auth/cancelled-popup-request') {
      throw new Error('มีการเรียกเข้าสู่ระบบซ้ำซ้อน กรุณาลองใหม่อีกครั้ง');
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedToken = (token: string | null) => {
  cachedAccessToken = token;
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
    }
  } catch (e) {}
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  try {
    localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
  } catch (e) {}
};
