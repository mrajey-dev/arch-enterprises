import axios from 'axios';
import { toastWarning } from './toast.js';

// 8 hours in milliseconds
export const INACTIVITY_TIMEOUT_MS = 8 * 60 * 60 * 1000;
export const ACTIVITY_STORAGE_KEY = 'arch_last_activity';
const THROTTLE_INTERVAL_MS = 15 * 1000; // Throttle storage writes to once every 15s
const CHECK_INTERVAL_MS = 30 * 1000; // Check inactivity every 30s

let checkIntervalId = null;
let lastRecordedTime = 0;
let routerInstance = null;
let isLoggingOut = false;

/**
 * Returns true if a user or admin is currently logged in.
 */
export function isUserLoggedIn() {
  return Boolean(localStorage.getItem('token') || localStorage.getItem('admin_token'));
}

/**
 * Gets the last recorded activity timestamp from localStorage.
 */
export function getLastActivity() {
  const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 0;
}

/**
 * Resets the activity timestamp (e.g. on login or manual activity).
 */
export function resetActivityTimer() {
  const now = Date.now();
  lastRecordedTime = now;
  try {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, String(now));
  } catch (e) {
    console.error('Failed to set activity timestamp in localStorage:', e);
  }
}

/**
 * Clears stored activity timestamp.
 */
export function clearActivityTimer() {
  lastRecordedTime = 0;
  try {
    localStorage.removeItem(ACTIVITY_STORAGE_KEY);
  } catch (e) {}
}

/**
 * Executes the auto logout process.
 */
export async function performAutoLogout(reason = 'inactivity') {
  if (isLoggingOut) return;
  isLoggingOut = true;

  const token = localStorage.getItem('token') || localStorage.getItem('admin_token');

  // Clear all auth and activity keys
  localStorage.removeItem('token');
  localStorage.removeItem('admin_token');
  localStorage.removeItem('user');
  localStorage.removeItem('loginTime');
  localStorage.removeItem(ACTIVITY_STORAGE_KEY);

  // Best-effort backend token revocation
  if (token) {
    try {
      axios.post(
        'https://employees.archenterprises.co.in/api/api/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {});
    } catch (e) {}
  }

  // Show inactivity message to user
  if (reason === 'inactivity') {
    toastWarning('You have been logged out due to 8 hours of inactivity. Please log in again.');
  }

  // Redirect to login page
  if (routerInstance) {
    try {
      const currentPath = routerInstance.currentRoute?.value?.path || '';
      if (currentPath !== '/auth' && currentPath !== '/') {
        await routerInstance.push('/auth');
      }
    } catch (e) {
      window.location.href = '/auth';
    }
  } else {
    window.location.href = '/auth';
  }

  setTimeout(() => {
    isLoggingOut = false;
  }, 1000);
}

/**
 * Checks if the user has been inactive for >= 8 hours.
 * Returns true if expired and triggered logout, false otherwise.
 */
export function checkInactivity() {
  if (!isUserLoggedIn()) {
    return false;
  }

  const lastActivity = getLastActivity();
  const now = Date.now();

  // If no timestamp exists yet but user is logged in, initialize it
  if (!lastActivity) {
    resetActivityTimer();
    return false;
  }

  // If 8 hours have elapsed without any activity
  if (now - lastActivity >= INACTIVITY_TIMEOUT_MS) {
    performAutoLogout('inactivity');
    return true;
  }

  return false;
}

/**
 * Handles user activity events (cursor move, typing, click, tab switch, etc.).
 */
function handleUserActivity(event) {
  if (!isUserLoggedIn()) return;

  const now = Date.now();
  const lastActivity = getLastActivity();

  // If user has already been inactive for >= 8 hours, log them out immediately
  if (lastActivity > 0 && now - lastActivity >= INACTIVITY_TIMEOUT_MS) {
    performAutoLogout('inactivity');
    return;
  }

  // For high-frequency events (e.g. mousemove, pointermove, scroll), throttle writes
  const isHighFreq =
    event && (event.type === 'mousemove' || event.type === 'pointermove' || event.type === 'scroll' || event.type === 'wheel');

  if (!isHighFreq || now - lastRecordedTime >= THROTTLE_INTERVAL_MS) {
    resetActivityTimer();
  }
}

/**
 * Handles tab visibility changes and window focus.
 */
function handleVisibilityOrFocus() {
  if (document.visibilityState === 'visible' || document.hasFocus()) {
    // Check if inactivity timeout was exceeded while away/in background
    const isExpired = checkInactivity();
    if (!isExpired) {
      handleUserActivity({ type: 'visibilitychange' });
    }
  }
}

/**
 * Handles storage events from other tabs.
 */
function handleStorageChange(event) {
  if (event.key === ACTIVITY_STORAGE_KEY && event.newValue) {
    const remoteTime = parseInt(event.newValue, 10);
    if (!Number.isNaN(remoteTime)) {
      lastRecordedTime = Math.max(lastRecordedTime, remoteTime);
    }
  } else if ((event.key === 'token' || event.key === 'admin_token') && !event.newValue) {
    // Logged out in another tab
    if (routerInstance) {
      const currentPath = routerInstance.currentRoute?.value?.path || '';
      if (currentPath !== '/auth' && currentPath !== '/') {
        routerInstance.push('/auth');
      }
    }
  }
}

// Activity event types to listen for
const TRACKED_EVENTS = [
  'mousemove',
  'pointermove',
  'mousedown',
  'click',
  'keydown',
  'keyup',
  'input',
  'scroll',
  'wheel',
  'touchstart',
  'touchend',
];

let listenersAttached = false;

/**
 * Initializes session timeout tracking.
 * @param {object} router - Vue router instance
 */
export function initSessionTimeout(router) {
  routerInstance = router;

  if (isUserLoggedIn()) {
    // If last activity is missing or very old, check immediately
    const last = getLastActivity();
    if (!last) {
      resetActivityTimer();
    } else {
      checkInactivity();
    }
  }

  if (listenersAttached) return;

  // Add user interaction listeners
  TRACKED_EVENTS.forEach((eventType) => {
    window.addEventListener(eventType, handleUserActivity, { passive: true });
  });

  // Tab switching / window focus listeners
  document.addEventListener('visibilitychange', handleVisibilityOrFocus);
  window.addEventListener('focus', handleVisibilityOrFocus);

  // Sync across tabs
  window.addEventListener('storage', handleStorageChange);

  // Periodic heartbeat timer
  if (!checkIntervalId) {
    checkIntervalId = setInterval(checkInactivity, CHECK_INTERVAL_MS);
  }

  listenersAttached = true;
}

/**
 * Cleans up event listeners and timers.
 */
export function destroySessionTimeout() {
  if (!listenersAttached) return;

  TRACKED_EVENTS.forEach((eventType) => {
    window.removeEventListener(eventType, handleUserActivity);
  });

  document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
  window.removeEventListener('focus', handleVisibilityOrFocus);
  window.removeEventListener('storage', handleStorageChange);

  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }

  listenersAttached = false;
}
