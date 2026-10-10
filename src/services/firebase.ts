import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithCredential,
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
 
const ALLOWED_EMAIL_DOMAIN = '@nu.ac.th';
const ALLOWED_HOSTED_DOMAIN = 'nu.ac.th';
 
/**
 * ตรวจว่าอีเมลเป็นบัญชี @nu.ac.th หรือไม่
 */
const isAllowedEmail = (email?: string | null): boolean =>
  !!email && email.trim().toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN);
 
const provider = new GoogleAuthProvider();
// Workspace scopes requested
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
// Allow user to select their @nu.ac.th account (hd เป็นเพียงตัวช่วยแนะนำบัญชี ไม่ใช่การบังคับ)
provider.setCustomParameters({
  prompt: 'select_account',
  hd: ALLOWED_HOSTED_DOMAIN,
});
 
const STORAGE_KEY_ACCESS_TOKEN = 'google_oauth_access_token_v1';
// คีย์เก่า: ไม่เก็บ/ไม่เชื่อถือโปรไฟล์ใน localStorage อีกต่อไป ใช้เฉพาะลบทิ้ง
const STORAGE_KEY_USER_PROFILE = 'google_user_profile_v1';
 
let isSigningIn = false;
let activeAuthSuccessCallback: ((user: any, token: string | null) => void) | null = null;
let cachedAccessToken: string | null = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
  } catch (e) {
    return null;
  }
})();
 
/**
 * ตรวจ access token กับ Google จริง (ไม่เชื่อค่าที่เก็บไว้ในเครื่อง)
 * คืนค่าโปรไฟล์เมื่อ token ใช้ได้ และ null เมื่อหมดอายุหรือไม่ถูกต้อง
 */
const verifyGoogleToken = async (token: string): Promise<any | null> => {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const profile = await res.json();
    if (!profile?.email || profile.email_verified === false) return null;
    return profile;
  } catch (e) {
    return null;
  }
};
 
/**
 * Helper โหลด Google Identity Services script หากยังไม่พร้อม
 */
export const loadGsiScript = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).google?.accounts?.oauth2) return Promise.resolve();
 
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('ไม่สามารถโหลด Google Identity Services ได้')));
      if ((window as any).google?.accounts?.oauth2) {
        resolve();
        return;
      }
    }
 
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('ไม่สามารถโหลด Google Identity Services ได้'));
    document.head.appendChild(script);
  });
};
 
const STORAGE_KEY_CUSTOM_CLIENT_ID = 'custom_google_oauth_client_id';
 
export const getCustomGoogleClientId = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_CLIENT_ID);
  } catch (e) {
    return null;
  }
};
 
export const setCustomGoogleClientId = (clientId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const clean = clientId.trim();
    if (clean) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_CLIENT_ID, clean);
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_CLIENT_ID);
    }
  } catch (e) {}
};
 
/**
 * เข้าสู่ระบบด้วย Google Identity Services (Direct OAuth Token Client)
 * ทำงานได้ทันทีแม้โดเมนจะยังไม่ได้ระบุใน Authorized Domains ของ Firebase Authentication
 */
export const signInWithGoogleIdentityServices = async (): Promise<{ user: any; accessToken: string }> => {
  await loadGsiScript();
  const google = (window as any).google;
  if (!google?.accounts?.oauth2) {
    throw new Error('ระบบ Google Identity Services ยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง');
  }
 
  const clientId = getCustomGoogleClientId() || (firebaseConfig as any).oAuthClientId;
  if (!clientId) {
    throw new Error('ไม่พบ Google OAuth Client ID ในการตั้งค่าระบบ');
  }
 
  return new Promise((resolve, reject) => {
    let hasReturned = false;
 
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file email profile openid',
        prompt: 'select_account',
        hd: ALLOWED_HOSTED_DOMAIN,
        callback: async (tokenResponse: any) => {
          if (hasReturned) return;
          hasReturned = true;
 
          if (tokenResponse.error) {
            const errDetail = String(tokenResponse.error_description || tokenResponse.error);
            if (errDetail.includes('origin_mismatch') || errDetail.includes('invalid_origin')) {
              reject(new Error('Google OAuth แจ้งเตือน Error 400: origin_mismatch เนื่องจากโดเมนนี้ยังไม่ได้เพิ่มใน Authorized JavaScript Origins ของ Google Cloud Console'));
              return;
            }
            reject(new Error(tokenResponse.error_description || tokenResponse.error || 'การเข้าสู่ระบบถูกยกเลิก'));
            return;
          }
 
          const accessToken = tokenResponse.access_token;
          if (!accessToken) {
            reject(new Error('ไม่พบ Access Token จากการเข้าสู่ระบบ Google'));
            return;
          }
 
          try {
            // ดึงข้อมูลโปรไฟล์ผู้ใช้จาก Google UserInfo API
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            const profile = res.ok ? await res.json() : {};
 
            // ตรวจโดเมนอีเมลก่อนเก็บ token หรืออนุญาตให้เข้าใช้งาน
            if (!isAllowedEmail(profile.email) || profile.email_verified === false) {
              reject(new Error('กรุณาเข้าสู่ระบบด้วยบัญชี @nu.ac.th เท่านั้น'));
              return;
            }
 
            const userObj = {
              uid: profile.sub || `gsi-${Date.now()}`,
              displayName: profile.name || profile.email?.split('@')[0] || 'ผู้ใช้งาน มน.',
              email: String(profile.email).trim().toLowerCase(),
              photoURL: profile.picture || null,
              accessToken,
            };
 
            cachedAccessToken = accessToken;
            setCachedToken(accessToken);
 
            // พยายามเชื่อมโยง Credential เข้ากับ Firebase
            try {
              const credential = GoogleAuthProvider.credential(null, accessToken);
              await signInWithCredential(auth, credential);
            } catch (fbErr) {
              console.warn('Firebase credential sign-in note:', fbErr);
            }
 
            if (activeAuthSuccessCallback) {
              activeAuthSuccessCallback(userObj as any, accessToken);
            }
 
            resolve({ user: userObj, accessToken });
          } catch (fetchErr: any) {
            reject(new Error(fetchErr?.message || 'ไม่สามารถดึงข้อมูลโปรไฟล์ผู้ใช้งานได้'));
          }
        },
        error_callback: (err: any) => {
          if (hasReturned) return;
          hasReturned = true;
          const errMsg = String(err?.message || err?.type || err || '');
          if (
            errMsg.includes('origin_mismatch') ||
            (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
          ) {
            reject(
              new Error(
                'เกิดข้อจำกัด Google OAuth บนโดเมนนี้ (Error 400: origin_mismatch) กรุณาเพิ่มโดเมนใน Authorized JavaScript Origins ใน Google Cloud Console'
              )
            );
            return;
          }
          reject(new Error(err?.message || 'การเปิดหน้าต่างเข้าสู่ระบบล้มเหลว กรุณาอนุญาตป๊อปอัป'));
        },
      });
 
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (clientErr: any) {
      if (hasReturned) return;
      hasReturned = true;
      reject(clientErr);
    }
  });
};
 
// Listen for auth state changes
export const initAuth = (
  onAuthSuccess?: (user: any, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  activeAuthSuccessCallback = onAuthSuccess || null;
 
  // ลบโปรไฟล์แบบเก่าที่เคยเก็บไว้ใน localStorage (ไม่เชื่อถือค่านี้อีกต่อไป)
  try {
    localStorage.removeItem(STORAGE_KEY_USER_PROFILE);
  } catch (e) {}
 
  // กู้คืนการเข้าสู่ระบบ: ต้องตรวจ token กับ Google จริงทุกครั้ง
  (async () => {
    try {
      const savedToken = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
      if (!savedToken) return;
 
      const profile = await verifyGoogleToken(savedToken);
      if (profile && isAllowedEmail(profile.email)) {
        cachedAccessToken = savedToken;
        const userObj = {
          uid: profile.sub,
          displayName: profile.name || profile.email.split('@')[0],
          email: String(profile.email).trim().toLowerCase(),
          photoURL: profile.picture || null,
          accessToken: savedToken,
        };
        if (onAuthSuccess) onAuthSuccess(userObj, savedToken);
      } else {
        // token หมดอายุ หรือไม่ใช่บัญชีที่อนุญาต
        cachedAccessToken = null;
        try {
          localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
        } catch (e) {}
        if (onAuthFailure) onAuthFailure();
      }
    } catch (e) {}
  })();
 
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (!isAllowedEmail(user.email)) {
        await logout();
        if (onAuthFailure) onAuthFailure();
        return;
      }
      if (!cachedAccessToken) {
        try {
          cachedAccessToken = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
        } catch (e) {}
      }
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      // ถ้ายังมี token ค้างอยู่ ให้บล็อกกู้คืนด้านบนเป็นผู้ตัดสิน
      let savedToken: string | null = null;
      try {
        savedToken = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
      } catch (e) {}
      if (!savedToken) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};
 
export const googleSignIn = async (): Promise<{ user: any; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('ไม่พบ Access Token จาก Google Authentication');
    }
 
    // อนุญาตเฉพาะบัญชี @nu.ac.th
    if (!isAllowedEmail(result.user.email)) {
      await logout();
      throw new Error('กรุณาเข้าสู่ระบบด้วยบัญชี @nu.ac.th เท่านั้น');
    }
 
    cachedAccessToken = credential.accessToken;
    setCachedToken(credential.accessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.warn('Firebase sign-in popup error:', error);
    const msg = String(error?.message || '');
 
    // ตรวจพบปัญหา auth/unauthorized-domain (โดเมนไม่ได้อยู่ใน Authorized Domains ของ Firebase)
    // ให้สลับไปใช้ Google Identity Services (Direct OAuth) อัตโนมัติทันที
    if (
      error?.code === 'auth/unauthorized-domain' ||
      msg.includes('unauthorized-domain')
    ) {
      console.info('Switching to Google Identity Services direct OAuth due to unauthorized-domain...');
      try {
        return await signInWithGoogleIdentityServices();
      } catch (gsiErr: any) {
        console.warn('Google Identity Services fallback error:', gsiErr);
        const gsiMsg = String(gsiErr?.message || gsiErr || '');
        if (
          gsiMsg.includes('origin_mismatch') ||
          (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))
        ) {
          throw new Error(
            'Google OAuth แจ้งเตือน Error 400: origin_mismatch เนื่องจากโดเมนนี้ยังไม่ได้เพิ่มใน Authorized JavaScript Origins ใน Google Cloud Console'
          );
        }
        throw new Error(
          gsiErr?.message ||
          'การเชื่อมต่อ Google OAuth ขัดข้อง กรุณาลองใหม่อีกครั้ง หรือเปิดใช้งานใน Google Chrome'
        );
      }
    }
 
    if (
      msg.includes('origin_mismatch') ||
      (typeof window !== 'undefined' && window.location.hostname.includes('github.io') && (msg.includes('popup-closed') || msg.includes('cancel') || msg.includes('failed')))
    ) {
      throw new Error(
        'เกิดข้อจำกัด Google OAuth บนโดเมนนี้ (Error 400: origin_mismatch) กรุณาเพิ่มโดเมนใน Authorized JavaScript Origins ใน Google Cloud Console'
      );
    }
 
    if (
      msg.includes('missing initial state') ||
      msg.includes('sessionStorage') ||
      error?.code === 'auth/internal-error'
    ) {
      throw new Error('ไม่สามารถเข้าสู่ระบบผ่าน Google ในหน้านี้ได้ เนื่องจากเบราว์เซอร์ของแอป (เช่น LINE) ไม่อนุญาต แนะนำให้กดปุ่ม "เปิดใน Chrome" ด้านบนเพื่อเข้าใช้งาน');
    }
    if (error?.code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
      throw new Error('การเชื่อมต่อกับเซิร์ฟเวอร์ Google ขัดข้อง กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง');
    }
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตป๊อปอัปในเบราว์เซอร์เพื่อเข้าสู่ระบบ Google');
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
  try {
    await signOut(auth);
  } catch (e) {}
  cachedAccessToken = null;
  try {
    localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER_PROFILE);
  } catch (e) {}
};
