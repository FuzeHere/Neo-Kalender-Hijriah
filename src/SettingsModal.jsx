import { X, RotateCcw, Info } from 'lucide-react';

function SettingsModal({ isOpen, onClose, hijriAdjustment, setHijriAdjustment, onResetTracker }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Pengaturan Kalender</h3>
          <button className="close-button" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Hijri Adjustment Section */}
          <div className="setting-group">
            <label className="setting-label">Koreksi Penyesuaian Hijriah</label>
            <p className="setting-description">
              Sesuaikan penanggalan Hijriah jika terdapat perbedaan 1 atau 2 hari dengan pengumuman rukyatul hilal lokal.
            </p>
            <div className="adjustment-selector">
              {[-2, -1, 0, 1, 2].map((val) => (
                <button
                  key={val}
                  className={`adjust-btn ${hijriAdjustment === val ? 'active' : ''}`}
                  onClick={() => setHijriAdjustment(val)}
                >
                  {val === 0 ? 'Normal' : val > 0 ? `+${val} Hari` : `${val} Hari`}
                </button>
              ))}
            </div>
            <div className="adjustment-info">
              <Info size={14} style={{ marginRight: '6px', flexShrink: 0 }} />
              <span>Nilai bawaan adalah 0 (menggunakan perhitungan standard Intl).</span>
            </div>
          </div>

          <hr className="divider" />

          {/* Reset Tracker Section */}
          <div className="setting-group">
            <label className="setting-label">Reset Tracker Ibadah</label>
            <p className="setting-description">
              Menghapus seluruh catatan dan progres ibadah harian yang telah disimpan secara lokal.
            </p>
            <button className="reset-btn" onClick={onResetTracker}>
              <RotateCcw size={16} style={{ marginRight: '8px' }} />
              Hapus Semua Data Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
