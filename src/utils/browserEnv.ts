/**
 * Helper utilities to detect browser environments, especially
 * in-app browsers (LINE, Facebook, Messenger, Instagram, WebViews)
 * which block Google OAuth or fail with "missing initial state" errors.
 */

export const isLineBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Line\//i.test(ua);
};

export const isInAppBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || '';
  return (
    /Line\//i.test(ua) ||
    /FBAN|FBAV/i.test(ua) ||
    /Instagram/i.test(ua) ||
    /MicroMessenger/i.test(ua) ||
    /Twitter/i.test(ua) ||
    /Snapchat/i.test(ua) ||
    /musical_ly/i.test(ua) ||
    /TikTok/i.test(ua) ||
    /wv\b/.test(ua) ||
    (/Android/i.test(ua) && /Version\/[0-9.]+/i.test(ua) && !/Chrome\/[0-9.]+/i.test(ua))
  );
};

export const getInAppBrowserName = (): string => {
  if (typeof window === 'undefined') return '';
  const ua = navigator.userAgent || '';
  if (/Line\//i.test(ua)) return 'LINE';
  if (/FBAN|FBAV/i.test(ua)) return 'Facebook';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/MicroMessenger/i.test(ua)) return 'WeChat';
  if (/Twitter/i.test(ua)) return 'Twitter/X';
  if (/TikTok|musical_ly/i.test(ua)) return 'TikTok';
  return 'In-App Browser';
};

/**
 * Open the current web app directly in the device's system browser
 * (e.g. Google Chrome on Android, Safari on iOS)
 */
export const openInExternalBrowser = (targetUrl?: string) => {
  if (typeof window === 'undefined') return;
  const rawUrl = targetUrl || window.location.href;
  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isLine = /Line\//i.test(ua);

  // Clean URL: remove any existing openExternalBrowser param
  let cleanUrl = rawUrl;
  try {
    const p = new URL(rawUrl);
    p.searchParams.delete('openExternalBrowser');
    cleanUrl = p.toString();
  } catch {
    cleanUrl = rawUrl.replace(/([?&])openExternalBrowser=[^&]+/, '');
  }

  // 1. If on Android: Use Chrome intent first (works in LINE, Facebook, IG, and all WebViews)
  if (isAndroid) {
    try {
      const parsed = new URL(cleanUrl);
      const hostAndPath = parsed.host + parsed.pathname + parsed.search + parsed.hash;
      window.location.href = `intent://${hostAndPath}#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    } catch {
      // Fall through
    }
  }

  // 2. If in LINE (especially iOS): openExternalBrowser=1 hands off to Mobile Safari
  if (isLine) {
    try {
      const parsed = new URL(cleanUrl);
      parsed.searchParams.set('openExternalBrowser', '1');
      window.location.href = parsed.toString();
      return;
    } catch {
      const sep = cleanUrl.includes('?') ? '&' : '?';
      window.location.href = `${cleanUrl}${sep}openExternalBrowser=1`;
      return;
    }
  }

  // 3. General fallback
  window.open(cleanUrl, '_system');
};

/**
 * Copy clean current URL to clipboard
 */
export const copyCurrentUrl = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  try {
    // Strip out temporary query parameters like openExternalBrowser
    let cleanUrl = window.location.href;
    try {
      const parsed = new URL(cleanUrl);
      parsed.searchParams.delete('openExternalBrowser');
      cleanUrl = parsed.toString();
    } catch {
      cleanUrl = cleanUrl.replace(/([?&])openExternalBrowser=[^&]+/, '');
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(cleanUrl);
      return true;
    }

    const input = document.createElement('input');
    input.value = cleanUrl;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.focus();
    input.select();
    const success = document.execCommand('copy');
    document.body.removeChild(input);
    return success;
  } catch {
    return false;
  }
};
