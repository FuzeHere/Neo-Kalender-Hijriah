import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, BookOpen, AlertCircle, Bell, BellOff } from 'lucide-react';
import { getHijriDateParts, formatHijriDate } from './utils';
import { FASTS, IBADAH, isForbiddenFastingDay, getIslamicEvent } from './data';
import { useNotification } from './useNotification';
import PrayerTimesCard from './components/PrayerTimesCard';
import EventCard from './components/EventCard';
import './App.css';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFasts, setActiveFasts] = useState([]);
  const [activeIbadah, setActiveIbadah] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { enabled, toggleNotification, sendTestNotification, isSupported, permission } = useNotification();

  useEffect(() => {
    // Determine fasts and ibadah for selected date
    const hijriParts = getHijriDateParts(selectedDate);
    
    const fastsToday = FASTS.filter(fast => fast.check(selectedDate, hijriParts));
    const ibadahToday = IBADAH.filter(ibadah => ibadah.check ? ibadah.check(selectedDate, hijriParts) : true);
    const event = getIslamicEvent(hijriParts);

    setActiveFasts(fastsToday);
    setActiveIbadah(ibadahToday);
    setSelectedEvent(event);
  }, [selectedDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const isForbidden = isForbiddenFastingDay(getHijriDateParts(selectedDate));

  const handleNotificationToggle = () => {
    toggleNotification();
    if (!enabled && permission === 'granted') {
      // Send test notification when first enabling
      setTimeout(sendTestNotification, 500);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>🌙 Kalender Hijriah</h1>
          <p>Panduan Puasa, Ibadah & Jadwal Shalat</p>
        </div>
        {isSupported && (
          <div className="header-actions">
            <button
              className={`notification-toggle ${enabled ? 'active' : ''}`}
              onClick={handleNotificationToggle}
              title={
                enabled 
                  ? 'Notifikasi pengingat puasa aktif' 
                  : 'Aktifkan pengingat puasa sunnah'
              }
              id="notification-toggle"
            >
              {enabled ? <Bell size={20} /> : <BellOff size={20} />}
              {enabled && <span className="notif-dot" />}
            </button>
          </div>
        )}
      </header>

      <main className="calendar-section">
        <div className="calendar-header">
          <div>
            <h2>{format(currentDate, dateFormat)}</h2>
            <p>{formatHijriDate(currentDate)}</p>
          </div>
          <div className="nav-buttons">
            <button className="icon-button" onClick={prevMonth} id="prev-month-btn">
              <ChevronLeft size={22} />
            </button>
            <button className="icon-button" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }} id="today-btn">
              <span style={{fontSize: '0.75rem', fontWeight: 600}}>HARI INI</span>
            </button>
            <button className="icon-button" onClick={nextMonth} id="next-month-btn">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        <div className="weekdays">
          <div>Sen</div>
          <div>Sel</div>
          <div>Rab</div>
          <div>Kam</div>
          <div>Jum</div>
          <div>Sab</div>
          <div>Min</div>
        </div>

        <div className="days-grid">
          {days.map((day, idx) => {
            const hijriParts = getHijriDateParts(day);
            const isForbiddenDay = isForbiddenFastingDay(hijriParts);
            const dayFasts = FASTS.filter(f => f.check(day, hijriParts));
            const dayEvent = getIslamicEvent(hijriParts);
            
            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`day-cell ${
                  !isSameMonth(day, monthStart) ? "is-other-month" : ""
                } ${isToday(day) ? "is-today" : ""} ${
                  isSameDay(day, selectedDate) ? "is-selected" : ""
                } ${dayEvent ? "has-event" : ""}`}
              >
                <span className="gregorian-day">{format(day, "d")}</span>
                {dayEvent && <span className="event-emoji">{dayEvent.emoji}</span>}
                <span className="hijri-day">{hijriParts.day}</span>
                <div className="indicators">
                  {dayEvent && <div className="indicator-dot event" title={dayEvent.name} />}
                  {isForbiddenDay && <div className="indicator-dot forbidden" title="Hari Diharamkan Berpuasa" />}
                  {!isForbiddenDay && dayFasts.map(f => (
                    <div 
                      key={f.id} 
                      className={`indicator-dot ${f.type === 'Wajib' ? 'wajib' : 'sunnah'}`} 
                      title={f.name}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <aside className="details-section">
        {/* Prayer Times Card */}
        <PrayerTimesCard />

        {/* Islamic Event Card (only shows when an event is on selected date) */}
        {selectedEvent && (
          <EventCard event={selectedEvent} selectedDate={selectedDate} />
        )}

        {/* Fasting Card */}
        <div className="card">
          <h3 className="card-title">
            <AlertCircle size={22} />
            Puasa Hari Ini
          </h3>
          
          <div className="selected-date-info">
            <strong>{format(selectedDate, "eeee, d MMMM yyyy")}</strong><br/>
            <span style={{color: 'var(--primary)', fontSize: '0.9rem'}}>{formatHijriDate(selectedDate)}</span>
          </div>

          {isForbidden ? (
             <div className="info-item" style={{borderColor: 'var(--danger)'}}>
               <div className="item-header">
                 <span className="item-name" style={{color: 'var(--danger)'}}>Hari Diharamkan Berpuasa</span>
               </div>
               <p className="item-desc">Diharamkan untuk berpuasa pada hari raya Idul Fitri, Idul Adha, dan hari-hari Tasyrik (11, 12, 13 Dzulhijjah).</p>
             </div>
          ) : activeFasts.length > 0 ? (
            <div className="item-list">
              {activeFasts.map(fast => (
                <div key={fast.id} className="info-item">
                  <div className="item-header">
                    <span className="item-name">{fast.name}</span>
                    <span className={`badge ${fast.type === 'Wajib' ? 'wajib' : 'sunnah'}`}>{fast.type}</span>
                  </div>
                  <p className="item-desc">{fast.description}</p>
                  <div className="item-hadith">{fast.hadith}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              Tidak ada anjuran puasa khusus pada hari ini.
            </div>
          )}
        </div>

        {/* Ibadah Card */}
        <div className="card">
          <h3 className="card-title">
            <BookOpen size={22} />
            Amalan &amp; Ibadah
          </h3>
          <div className="item-list">
            {activeIbadah.map(ibadah => (
              <div key={ibadah.id} className="info-item">
                <div className="item-header">
                  <span className="item-name">{ibadah.name}</span>
                </div>
                <p className="item-desc">{ibadah.description}</p>
                {ibadah.hadith && <div className="item-hadith">{ibadah.hadith}</div>}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default App;
