import { Clock, MapPin } from 'lucide-react';
import { usePrayerTimes } from '../usePrayerTimes';

export default function PrayerTimesCard() {
  const { 
    prayerTimes, loading, error, locationName, 
    nextPrayer, countdown, prayerNames, prayerOrder 
  } = usePrayerTimes();

  return (
    <div className="card">
      <h3 className="card-title">
        <Clock size={22} />
        Jadwal Shalat
      </h3>

      {loading ? (
        <div className="prayer-loading">
          <span className="loading-pulse">🕌</span>
          <p style={{ marginTop: '0.5rem' }}>Mengambil jadwal shalat...</p>
        </div>
      ) : error ? (
        <div className="prayer-error">
          <p>⚠️ {error}</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Pastikan koneksi internet aktif.</p>
        </div>
      ) : prayerTimes ? (
        <>
          <div className="prayer-location">
            <MapPin size={14} />
            <span>{locationName}</span>
          </div>

          <div className="prayer-times-grid">
            {prayerOrder.map(key => (
              <div 
                key={key} 
                className={`prayer-time-row ${key === nextPrayer ? 'is-next' : ''}`}
              >
                <span className="prayer-time-name">{prayerNames[key]}</span>
                <span className="prayer-time-value">{prayerTimes[key]}</span>
              </div>
            ))}
          </div>

          {nextPrayer && countdown && (
            <div className="countdown-container">
              <div className="countdown-label">
                {prayerNames[nextPrayer]} dalam
              </div>
              <div className="countdown-time">{countdown}</div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
