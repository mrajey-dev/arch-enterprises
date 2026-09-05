// src/utils/webNotification.js
// Universal Desktop / System Notification & Audio Chime Service for ARCH360

let originalTitle = document.title || 'ARCH 360';

/**
 * Play a pleasant synthesized sound chime using Web Audio API
 */
export function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    
    // Note 1: E5 (659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: B5 (987.77Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.22, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    // AudioContext autoplay restrictions or unsupported
  }
}

/**
 * Check if the browser supports desktop notifications
 */
export function isDesktopNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission() {
  if (!isDesktopNotificationSupported()) return 'denied';
  return Notification.permission; // 'default', 'granted', 'denied'
}

/**
 * Request desktop notification permission from the user
 */
export async function requestNotificationPermission() {
  if (!isDesktopNotificationSupported()) return false;
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.warn('[Notification] Permission request failed:', err);
      return false;
    }
  }
  
  return false;
}

/**
 * Trigger an outside-the-app Desktop / OS notification
 * @param {Object} options
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification description / body
 * @param {string} [options.icon] - Icon URL (defaults to ARCH360 logo)
 * @param {string} [options.tag] - Grouping tag (prevents duplicates)
 * @param {Function} [options.onClick] - Action when user clicks outside notification
 */
export function showDesktopNotification({
  title = 'ARCH 360 Notification',
  body = '',
  icon = '/Arch360.png',
  tag = undefined,
  onClick = null
} = {}) {
  // Always play audio chime on new notification
  playNotificationChime();

  if (!isDesktopNotificationSupported()) {
    return null;
  }

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body: body || 'You have a new update in ARCH 360',
        icon: icon || '/Arch360.png',
        badge: icon || '/Arch360.png',
        tag: tag || ('arch_' + Date.now()),
        renotify: true,
        silent: false,
      });

      notif.onclick = function (event) {
        event.preventDefault();
        window.focus();
        if (typeof onClick === 'function') {
          onClick();
        }
        notif.close();
      };

      // Auto close after 7 seconds
      setTimeout(() => {
        try { notif.close(); } catch (e) {}
      }, 7000);

      return notif;
    } catch (e) {
      console.warn('[Notification] Error creating native notification:', e);
    }
  } else if (Notification.permission === 'default') {
    // Attempt to request permission
    requestNotificationPermission().then(granted => {
      if (granted) {
        showDesktopNotification({ title, body, icon, tag, onClick });
      }
    });
  }

  return null;
}

/**
 * Update browser tab title with unread count
 */
export function updateTabBadgeCount(count) {
  if (typeof document === 'undefined') return;
  
  if (!originalTitle || originalTitle.startsWith('(')) {
    const clean = (document.title || 'ARCH 360').replace(/^\(\d+\+?\)\s*/, '');
    if (clean) originalTitle = clean;
  }

  if (count && count > 0) {
    const label = count > 99 ? '99+' : count;
    document.title = `(${label}) ${originalTitle}`;
  } else {
    document.title = originalTitle;
  }

  // Also update OS App Badge (PWA / Windows Taskbar)
  if ('setAppBadge' in navigator) {
    if (count && count > 0) {
      navigator.setAppBadge(count).catch(() => {});
    } else {
      navigator.clearAppBadge().catch(() => {});
    }
  }
}
