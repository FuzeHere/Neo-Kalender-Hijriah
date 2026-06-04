import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Compass, RefreshCw } from 'lucide-react';

function PrayerTimesWidget() {
  const [locationName, setLocationName] = useState('Jakarta (Default)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timings, setTimings] = useState(null);
  const [nextPrayer, setNextPrayer] = useState({ name: '', timeStr: '', countdown: '' });
  const timerRef = useRef(null);

  // Fetch prayer times from Aladhan API
  const fetchPrayerTimes = useCallback(async (latitude, longitude) => {
    setLoading(true);
    try {
      const todayUnix = Math.floor(Date.now() / 1000);
      const url = `https://api.aladhan.com/v1/timings/${todayUnix}?latitude=${latitude}&longitude=${longitude}&method=11`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Respons jaringan bermasalah.');
      const data = await response.json();
      
      if (data && data.data && data.data.timings) {
        setTimings(data.data.timings);
        if (data.data.meta && data.data.meta.timezone) {
          setLocationName(data.data.meta.timezone.split('/').pop().replace('_', ' ') + ' (Deteksi Otomatis)');
        }
      } else {
        throw new Error('Format data tidak sesuai.');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat jadwal sholat dari server.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get current location
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser Anda.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationName('Lokasi Anda (GPS)');
        fetchPrayerTimes(latitude, longitude);
      },
      (err) => {
        console.error(err);
        setError('Gagal mendeteksi lokasi otomatis. Menggunakan lokasi default.');
        setLoading(false);
        fetchPrayerTimes(-6.2088, 106.8456); // Fallback to Jakarta
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, [fetchPrayerTimes]);

  // Run on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      detectLocation();
    }, 0);
    return () => clearTimeout(timer);
  }, [detectLocation]);

  // Update countdown
  useEffect(() => {
    if (!timings) return;

    const calculateCountdown = () => {
      const now = new Date();
      const prayerNamesMap = {
        Fajr: 'Subuh',
        Sunrise: 'Syuruq',
        Dhuhr: 'Dzuhur',
        Asr: 'Ashar',
        Maghrib: 'Maghrib',
        Isha: 'Isya'
      };

      const trackedPrayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const prayerTimesToday = [];

      trackedPrayers.forEach(key => {
        if (timings[key]) {
          const [hours, minutes] = timings[key].split(':').map(Number);
          const pDate = new Date(now);
          pDate.setHours(hours, minutes, 0, 0);
          prayerTimesToday.push({
            key,
            name: prayerNamesMap[key],
            time: pDate
          });
        }
      });

      // Find next prayer today
      let next = prayerTimesToday.find(p => p.time > now);

      // If no remaining prayers today, the next one is Fajr tomorrow
      if (!next) {
        const firstPrayer = prayerTimesToday[0];
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [hours, minutes] = timings[firstPrayer.key].split(':').map(Number);
        const pDate = new Date(tomorrow);
        pDate.setHours(hours, minutes, 0, 0);

        next = {
          key: firstPrayer.key,
          name: firstPrayer.name + ' (Besok)',
          time: pDate
        };
      }

      // Calculate diff
      const diffMs = next.time - now;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

      const pad = (num) => String(num).padStart(2, '0');
      const timeStr = timings[next.key.replace(' (Besok)', '')] || '';

      setNextPrayer({
        name: next.name,
        timeStr,
        countdown: `${pad(diffHrs)}:${pad(diffMins)}:${pad(diffSecs)}`
      });
    };

    calculateCountdown();
    timerRef.current = setInterval(calculateCountdown, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timings]);

  // Prayer display helper
  const prayerDisplayList = [
    { key: 'Fajr', name: 'Subuh' },
    { key: 'Sunrise', name: 'Syuruq' },
    { key: 'Dhuhr', name: 'Dzuhur' },
    { key: 'Asr', name: 'Ashar' },
    { key: 'Maghrib', name: 'Maghrib' },
    { key: 'Isha', name: 'Isya' }
  ];

  return (
    <div className="card prayer-card">
      <div className="prayer-header">
        <h3 className="card-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
          <Compass size={24} className="compass-icon" />
          Jadwal Sholat
        </h3>
        <button 
          className={`refresh-btn ${loading ? 'loading' : ''}`}
          onClick={detectLocation}
          title="Segarkan lokasi & jadwal"
          disabled={loading}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="location-info">
        <MapPin size={14} style={{ marginRight: '4px', color: 'var(--primary)' }} />
        <span>{locationName}</span>
      </div>

      {error && <div className="prayer-error-msg">{error}</div>}

      {/* Countdown Area */}
      {nextPrayer.name && timings && (
        <div className="next-prayer-countdown">
          <div className="next-title">Selanjutnya: {nextPrayer.name} ({nextPrayer.timeStr})</div>
          <div className="countdown-timer">{nextPrayer.countdown}</div>
        </div>
      )}

      {/* Timings List */}
      <div className="prayer-times-grid">
        {loading && !timings ? (
          <div className="loading-state">Memuat jadwal sholat...</div>
        ) : timings ? (
          prayerDisplayList.map((prayer) => {
            const isNext = nextPrayer.name.startsWith(prayer.name);
            return (
              <div 
                key={prayer.key} 
                className={`prayer-time-item ${isNext ? 'is-next-active' : ''}`}
              >
                <span className="prayer-name">{prayer.name}</span>
                <span className="prayer-time">{timings[prayer.key]}</span>
              </div>
            );
          })
        ) : (
          <div className="empty-state">Jadwal sholat tidak tersedia.</div>
        )}
      </div>
    </div>
  );
}

export default PrayerTimesWidget;
