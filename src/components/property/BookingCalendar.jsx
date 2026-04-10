import { useState, useMemo } from 'react';
import './BookingCalendar.css';

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function toStr(date) {
  return date.toISOString().split('T')[0];
}

function parseLocal(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isInRange(date, periods) {
  const d = toStr(date);
  return periods.some(({ startDate, endDate }) => d >= startDate && d <= endDate);
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  // Monday = 0
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7;
}

export default function BookingCalendar({ unavailablePeriods = [], startDate, endDate, onChange }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hovered, setHovered] = useState(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const cells = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(viewYear, viewMonth, d));
    }
    return days;
  }, [viewYear, viewMonth, daysInMonth, firstDay]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleClick = (date) => {
    if (!date) return;
    const str = toStr(date);
    if (date < today) return;
    if (isInRange(date, unavailablePeriods)) return;

    if (!startDate || (startDate && endDate)) {
      // Start fresh selection
      onChange({ startDate: str, endDate: '' });
    } else {
      // Already have startDate, picking endDate
      if (str <= startDate) {
        onChange({ startDate: str, endDate: '' });
        return;
      }
      // Check no unavailable days in range
      const start = parseLocal(startDate);
      const end = date;
      let cur = new Date(start);
      cur.setDate(cur.getDate() + 1);
      while (cur < end) {
        if (isInRange(cur, unavailablePeriods)) {
          onChange({ startDate: str, endDate: '' });
          return;
        }
        cur.setDate(cur.getDate() + 1);
      }
      onChange({ startDate, endDate: str });
    }
  };

  const getState = (date) => {
    if (!date) return 'empty';
    const str = toStr(date);
    const isPast = date < today;
    const isUnavail = isInRange(date, unavailablePeriods);
    const isStart = str === startDate;
    const isEnd = str === endDate;
    const isToday = str === toStr(today);

    let inRange = false;
    if (startDate && endDate) {
      inRange = str > startDate && str < endDate;
    } else if (startDate && !endDate && hovered) {
      const h = hovered > startDate ? hovered : null;
      inRange = h && str > startDate && str < h;
    }

    if (isPast) return 'past';
    if (isUnavail) return 'unavailable';
    if (isStart) return 'start';
    if (isEnd) return 'end';
    if (inRange) return 'in-range';
    if (isToday) return 'today';
    return 'available';
  };

  return (
    <div className="booking-calendar">
      {/* Header */}
      <div className="cal-header">
        <button className="cal-nav" onClick={prevMonth} type="button">‹</button>
        <span className="cal-month-label">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="cal-nav" onClick={nextMonth} type="button">›</button>
      </div>

      {/* Day names */}
      <div className="cal-grid">
        {DAYS.map(d => (
          <div key={d} className="cal-day-name">{d}</div>
        ))}

        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="cal-cell empty" />;
          const state = getState(date);
          const str = toStr(date);
          return (
            <div
              key={str}
              className={`cal-cell ${state}`}
              onClick={() => handleClick(date)}
              onMouseEnter={() => {
                if (startDate && !endDate) setHovered(str);
              }}
              onMouseLeave={() => setHovered(null)}
              title={state === 'unavailable' ? 'Déjà réservé' : undefined}
            >
              {date.getDate()}
              {state === 'unavailable' && <span className="cal-unavail-dot" />}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <span className="legend-item"><span className="legend-dot dot-unavail" />Indisponible</span>
        <span className="legend-item"><span className="legend-dot dot-select" />Sélectionné</span>
        <span className="legend-item"><span className="legend-dot dot-range" />Période</span>
      </div>
    </div>
  );
}
