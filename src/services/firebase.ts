import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Workspace scopes requested
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
// Allow user to select their @nu.ac.th account
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Listen for auth state changes
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User is logged in to Firebase, but token might need re-fetching or prompt
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
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
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('เบราว์เซอร์บนมือถือบล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตป๊อปอัปในการตั้งค่าเบราว์เซอร์ หรือเปิดด้วย Google Chrome/Safari');
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
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
