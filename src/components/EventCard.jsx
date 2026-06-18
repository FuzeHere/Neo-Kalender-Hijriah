import { Star } from 'lucide-react';
import { formatHijriDate } from '../utils';

export default function EventCard({ event, selectedDate }) {
  if (!event) return null;

  return (
    <div className="card event-card">
      <h3 className="card-title">
        <Star size={22} />
        Hari Besar Islam
      </h3>
      <div className="event-item">
        <span className="event-item-emoji">{event.emoji}</span>
        <div className="event-item-info">
          <div className="event-item-name">{event.name}</div>
          <div className="event-item-date">{formatHijriDate(selectedDate)}</div>
          <p className="item-desc" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
            {event.description}
          </p>
        </div>
      </div>
    </div>
  );
}
