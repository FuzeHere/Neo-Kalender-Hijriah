import { useState, useEffect, useCallback, useRef } from 'react';
import { addDays } from 'date-fns';
import { getHijriDateParts } from './utils';
import { FASTS, isForbiddenFastingDay } from './data';

const STORAGE_KEY = 'kalender_notif_enabled';
const LAST_NOTIF_KEY = 'kalender_last_notif_date';

export function useNotification() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const intervalRef = useRef(null);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const toggleNotification = useCallback(async () => {
    if (!enabled) {
      // Turning ON
      const perm = permission === 'granted' ? 'granted' : await requestPermission();
      if (perm === 'granted') {
        setEnabled(true);
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    } else {
      // Turning OFF
      setEnabled(false);
      localStorage.setItem(STORAGE_KEY, 'false');
    }
  }, [enabled, permission, requestPermission]);

  const sendTestNotification = useCallback(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    
    new Notification('🌙 Kalender Hijriah', {
      body: 'Notifikasi pengingat puasa berhasil diaktifkan!',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    });
  }, []);

  const checkAndNotify = useCallback(() => {
    if (!enabled || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    const now = new Date();
    const hour = now.getHours();
    
    // Only notify between 19:00-21:00 (evening reminder for tomorrow)
    if (hour < 19 || hour > 21) return;

    // Check if already notified today
    const today = now.toDateString();
    try {
      if (localStorage.getItem(LAST_NOTIF_KEY) === today) return;
    } catch {
      return;
    }

    // Check tomorrow's fasting
    const tomorrow = addDays(now, 1);
    const hijriParts = getHijriDateParts(tomorrow);
    
    if (isForbiddenFastingDay(hijriParts)) return;

    const tomorrowFasts = FASTS.filter(f => f.check(tomorrow, hijriParts));
    
    if (tomorrowFasts.length > 0) {
      const fastNames = tomorrowFasts.map(f => f.name).join(', ');
      
      new Notification('🌙 Pengingat Puasa Besok', {
        body: `Besok ada: ${fastNames}. Jangan lupa niat dan sahur!`,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
      });

      try {
        localStorage.setItem(LAST_NOTIF_KEY, today);
      } catch {
        // Ignore storage errors
      }
    }
  }, [enabled]);

  // Periodic check (every 5 minutes when tab is open)
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    checkAndNotify();
    intervalRef.current = setInterval(checkAndNotify, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, checkAndNotify]);

  return {
    permission,
    enabled,
    toggleNotification,
    sendTestNotification,
    isSupported: typeof Notification !== 'undefined',
  };
}
