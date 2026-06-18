import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';

const PRAYER_NAMES = {
  Fajr: 'Subuh',
  Sunrise: 'Syuruq',
  Dhuhr: 'Dzuhur',
  Asr: 'Ashar',
  Maghrib: 'Maghrib',
  Isha: 'Isya'
};

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Fallback: Makassar, Indonesia
const DEFAULT_LAT = -5.1477;
const DEFAULT_LNG = 119.4327;
const DEFAULT_CITY = 'Makassar';

function parseTimeString(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
}

function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('');
  const intervalRef = useRef(null);

  const fetchPrayerTimes = useCallback(async (lat, lng) => {
    try {
      const dateStr = format(new Date(), 'dd-MM-yyyy');
      const cacheKey = `prayer_${dateStr}_${lat.toFixed(2)}_${lng.toFixed(2)}`;

      // Check sessionStorage cache
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setPrayerTimes(parsed.timings);
        setLocationName(parsed.location);
        setLoading(false);
        return;
      }

      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=20`
      );

      if (!res.ok) throw new Error('Gagal mengambil jadwal shalat');

      const data = await res.json();
      const timings = {};

      PRAYER_ORDER.forEach(key => {
        // Remove timezone info like " (WIB)"
        timings[key] = data.data.timings[key].split(' ')[0];
      });

      const location = data.data.meta?.timezone?.split('/')?.pop()?.replace('_', ' ') || 'Lokasi Anda';

      // Cache result
      sessionStorage.setItem(cacheKey, JSON.stringify({ timings, location }));

      setPrayerTimes(timings);
      setLocationName(location);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Get location and fetch
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Fallback to Jakarta
          setLocationName(DEFAULT_CITY);
          fetchPrayerTimes(DEFAULT_LAT, DEFAULT_LNG);
        },
        { timeout: 5000, maximumAge: 600000 }
      );
    } else {
      setLocationName(DEFAULT_CITY);
      fetchPrayerTimes(DEFAULT_LAT, DEFAULT_LNG);
    }
  }, [fetchPrayerTimes]);

  // Countdown logic
  useEffect(() => {
    if (!prayerTimes) return;

    const updateCountdown = () => {
      const now = new Date();

      for (const key of PRAYER_ORDER) {
        const prayerTime = parseTimeString(prayerTimes[key]);
        if (prayerTime > now) {
          setNextPrayer(key);
          setCountdown(formatCountdown(prayerTime - now));
          return;
        }
      }

      // All prayers passed for today → next is Fajr tomorrow
      setNextPrayer('Fajr');
      const tomorrowFajr = parseTimeString(prayerTimes.Fajr);
      tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
      setCountdown(formatCountdown(tomorrowFajr - now));
    };

    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [prayerTimes]);

  return {
    prayerTimes,
    loading,
    error,
    locationName,
    nextPrayer,
    countdown,
    prayerNames: PRAYER_NAMES,
    prayerOrder: PRAYER_ORDER,
  };
}
