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

  // Once startDate is chosen (and no endDate yet), compute the first unavailable
  // date that follows startDate. Any date >= that limit is blocked as endDate.
  const endDateLimit = useMemo(() => {
    if (!startDate || endDate) return null;
    const start = parseLocal(startDate);
    const cur = new Date(start);
    cur.setDate(cur.getDate() + 1);
    for (let i = 0; i < 730; i++) {
      if (isInRange(cur, unavailablePeriods)) return toStr(cur);
      cur.setDate(cur.getDate() + 1);
    }
    return null;
  }, [startDate, endDate, unavailablePeriods]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isBlocked = (str) => {
    if (isInRange(parseLocal(str), unavailablePeriods)) return true;
    if (endDateLimit && str >= endDateLimit) return true;
    return false;
  };

  const handleClick = (date) => {
    if (!date) return;
    const str = toStr(date);
    if (date < today) return;
    if (isBlocked(str)) return;

    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: str, endDate: '' });
    } else {
      if (str <= startDate) {
        onChange({ startDate: str, endDate: '' });
      } else {
        onChange({ startDate, endDate: str });
      }
    }
  };

  const getState = (date) => {
    if (!date) return 'empty';
    const str = toStr(date);
    const isPast = date < today;
    const isStart = str === startDate;
    const isEnd = str === endDate;
    const isToday = str === toStr(today);
    const unavail = isBlocked(str);

    let inRange = false;
    if (startDate && endDate) {
      inRange = str > startDate && str < endDate;
    } else if (startDate && !endDate && hovered && hovered > startDate) {
      const withinLimit = !endDateLimit || hovered < endDateLimit;
      inRange = withinLimit && str > startDate && str < hovered;
    }

    if (isPast) return 'past';
    if (unavail) return 'unavailable';
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
                if (startDate && !endDate && !isBlocked(str)) setHovered(str);
              }}
              onMouseLeave={() => setHovered(null)}
              title={state === 'unavailable' ? 'Non disponible' : undefined}
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
