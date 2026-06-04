import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, BookOpen, AlertCircle, Settings, CheckSquare, Compass } from 'lucide-react';
import { getHijriDateParts, formatHijriDate } from './utils';
import { FASTS, IBADAH, isForbiddenFastingDay } from './data';
import SettingsModal from './SettingsModal';
import PrayerTimesWidget from './PrayerTimesWidget';
import './App.css';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker', 'sholat', 'puasa'
  
  // Settings & Adjustments state
  const [hijriAdjustment, setHijriAdjustmentState] = useState(() => {
    const saved = localStorage.getItem('hijri_adjustment');
    return saved !== null ? parseInt(saved, 10) : 0;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Tracker State
  const [trackerData, setTrackerData] = useState(() => {
    const saved = localStorage.getItem('hijri_tracker_data');
    return saved ? JSON.parse(saved) : {};
  });

  // Determine fasts and ibadah for selected date dynamically at render time
  const hijriParts = getHijriDateParts(selectedDate, hijriAdjustment);
  const activeFasts = FASTS.filter(fast => fast.check(selectedDate, hijriParts));
  const activeIbadah = IBADAH.filter(ibadah => ibadah.check ? ibadah.check(selectedDate, hijriParts) : true);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const isForbidden = isForbiddenFastingDay(getHijriDateParts(selectedDate, hijriAdjustment));

  // Date picker lists
  const monthsList = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  
  const baseYear = new Date().getFullYear();
  const yearsList = [];
  for (let y = baseYear - 10; y <= baseYear + 10; y++) {
    yearsList.push(y);
  }

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    const newDate = new Date(currentDate);
    newDate.setMonth(newMonth);
    setCurrentDate(newDate);
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    const newDate = new Date(currentDate);
    newDate.setFullYear(newYear);
    setCurrentDate(newDate);
  };

  // Tracker Logic
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const completedList = trackerData[dateKey] || [];

  const getTodayAmalanList = () => {
    const list = [
      { id: 'sholat-subuh', name: 'Shalat Subuh', category: 'Fardhu' },
      { id: 'sholat-dzuhur', name: 'Shalat Dzuhur', category: 'Fardhu' },
      { id: 'sholat-ashar', name: 'Shalat Ashar', category: 'Fardhu' },
      { id: 'sholat-maghrib', name: 'Shalat Maghrib', category: 'Fardhu' },
      { id: 'sholat-isya', name: 'Shalat Isya', category: 'Fardhu' },
    ];
    
    if (!isForbidden) {
      activeFasts.forEach(f => {
        list.push({ id: `fast-${f.id}`, name: f.name, category: `Puasa ${f.type}` });
      });
    }

    activeIbadah.forEach(ib => {
      list.push({ id: `ibadah-${ib.id}`, name: ib.name, category: 'Sunnah' });
    });

    return list;
  };

  const toggleTrackerItem = (itemId) => {
    const newCompleted = completedList.includes(itemId)
      ? completedList.filter(id => id !== itemId)
      : [...completedList, itemId];
    
    const newTrackerData = {
      ...trackerData,
      [dateKey]: newCompleted
    };
    setTrackerData(newTrackerData);
    localStorage.setItem('hijri_tracker_data', JSON.stringify(newTrackerData));
  };

  const handleResetTracker = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua data tracker ibadah Anda?')) {
      setTrackerData({});
      localStorage.removeItem('hijri_tracker_data');
      setIsSettingsOpen(false);
    }
  };

  const setHijriAdjustment = (val) => {
    setHijriAdjustmentState(val);
    localStorage.setItem('hijri_adjustment', val.toString());
  };

  const todayAmalan = getTodayAmalanList();
  const completedTodayCount = todayAmalan.filter(item => completedList.includes(item.id)).length;
  const totalTodayCount = todayAmalan.length;
  const progressPercent = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Kalender Hijriah</h1>
        <p>Panduan Puasa & Ibadah Harian</p>
      </header>

      <main className="calendar-section">
        <div className="calendar-header">
          <div className="calendar-title-selectors">
            <div className="selectors-row">
              <select 
                value={currentDate.getMonth()} 
                onChange={handleMonthChange}
                className="nav-select"
              >
                {monthsList.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
              <select 
                value={currentDate.getFullYear()} 
                onChange={handleYearChange}
                className="nav-select"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <p className="hijri-month-header">{formatHijriDate(currentDate, hijriAdjustment)}</p>
          </div>
          <div className="nav-buttons">
            <button className="icon-button" onClick={prevMonth} title="Bulan Sebelumnya">
              <ChevronLeft size={20} />
            </button>
            <button className="icon-button today-btn" onClick={() => {
              setCurrentDate(new Date());
              setSelectedDate(new Date());
            }} title="Hari Ini">
              <span style={{fontSize: '0.75rem', fontWeight: 700}}>HARI INI</span>
            </button>
            <button className="icon-button" onClick={nextMonth} title="Bulan Selanjutnya">
              <ChevronRight size={20} />
            </button>
            <button className="icon-button settings-toggle-btn" onClick={() => setIsSettingsOpen(true)} title="Pengaturan">
              <Settings size={20} />
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
            const hijriParts = getHijriDateParts(day, hijriAdjustment);
            const isForbiddenDay = isForbiddenFastingDay(hijriParts);
            const dayFasts = FASTS.filter(f => f.check(day, hijriParts));
            
            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`day-cell ${
                  !isSameMonth(day, monthStart) ? "is-other-month" : ""
                } ${isToday(day) ? "is-today" : ""} ${
                  isSameDay(day, selectedDate) ? "is-selected" : ""
                }`}
              >
                <div className="day-cell-top">
                  <span className="gregorian-day">{format(day, "d")}</span>
                  <span className="hijri-day">{hijriParts.day}</span>
                </div>
                <div className="indicators">
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
        <div className="sidebar-tabs">
          <button 
            className={`tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            <CheckSquare size={16} />
            Amalan
          </button>
          <button 
            className={`tab-btn ${activeTab === 'sholat' ? 'active' : ''}`}
            onClick={() => setActiveTab('sholat')}
          >
            <Compass size={16} />
            Sholat
          </button>
          <button 
            className={`tab-btn ${activeTab === 'puasa' ? 'active' : ''}`}
            onClick={() => setActiveTab('puasa')}
          >
            <AlertCircle size={16} />
            Puasa
          </button>
        </div>

        <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          {activeTab === 'tracker' && (
            <>
              {/* Tracker Amal Harian */}
              <div className="card tracker-card">
                <h3 className="card-title">
                  <CheckSquare size={24} />
                  Tracker Amal Harian
                </h3>

                <div className="tracker-progress-container">
                  <div className="tracker-progress-text">
                    <span>{completedTodayCount} dari {totalTodayCount} amalan selesai</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="tracker-progress-bar-wrapper">
                    <div className="tracker-progress-bar" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                <div className="tracker-list">
                  {todayAmalan.length > 0 ? (
                    todayAmalan.map((item) => {
                      const isCompleted = completedList.includes(item.id);
                      return (
                        <div 
                          key={item.id} 
                          className={`tracker-item ${isCompleted ? 'completed' : ''}`}
                          onClick={() => toggleTrackerItem(item.id)}
                        >
                          <div className="tracker-checkbox-wrapper">
                            <div className={`tracker-checkbox-box ${isCompleted ? 'checked' : ''}`}>
                              {isCompleted && <div className="checkmark" />}
                            </div>
                          </div>
                          <div className="tracker-item-info">
                            <span className="tracker-item-name">{item.name}</span>
                            <span className={`tracker-item-badge ${item.category.toLowerCase().replace(/[^a-z]/g, '')}`}>
                              {item.category}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">Tidak ada amalan untuk hari ini.</div>
                  )}
                </div>
              </div>

              {/* Amalan & Ibadah */}
              <div className="card">
                <h3 className="card-title">
                  <BookOpen size={24} />
                  Amalan & Ibadah
                </h3>
                <div className="item-list">
                  {activeIbadah.length > 0 ? (
                    activeIbadah.map(ibadah => (
                      <div key={ibadah.id} className="info-item">
                        <div className="item-header">
                          <span className="item-name">{ibadah.name}</span>
                        </div>
                        <p className="item-desc">{ibadah.description}</p>
                        {ibadah.hadith && <div className="item-hadith">{ibadah.hadith}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">Tidak ada amalan khusus hari ini.</div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'sholat' && (
            <PrayerTimesWidget />
          )}

          {activeTab === 'puasa' && (
            /* Puasa Hari Ini */
            <div className="card">
              <h3 className="card-title">
                <AlertCircle size={24} />
                Puasa Hari Ini
              </h3>
              
              <div className="selected-date-info" style={{marginBottom: '1rem'}}>
                <strong>{format(selectedDate, "eeee, d MMMM yyyy")}</strong><br/>
                <span style={{color: 'var(--primary)'}}>{formatHijriDate(selectedDate, hijriAdjustment)}</span>
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
          )}
        </div>
      </aside>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        hijriAdjustment={hijriAdjustment}
        setHijriAdjustment={setHijriAdjustment}
        onResetTracker={handleResetTracker}
      />
    </div>
  );
}

export default App;
