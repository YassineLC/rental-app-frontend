import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './MyBookingsPage.css';

const STATUS_CONFIG = {
  PENDING:   { label: 'En attente',  cls: 'badge-yellow', step: 1 },
  CONFIRMED: { label: 'Confirmée',   cls: 'badge-green',  step: 2 },
  ACTIVE:    { label: 'En cours',    cls: 'badge-active', step: 3 },
  COMPLETED: { label: 'Terminée',    cls: 'badge-gray',   step: 4 },
  CANCELLED: { label: 'Annulée',     cls: 'badge-red',    step: 0 },
};

const TIMELINE_STEPS = [
  { key: 'PENDING',   label: 'Demande envoyée',    dateKey: 'createdAt' },
  { key: 'CONFIRMED', label: 'Confirmée',           dateKey: 'confirmedAt' },
  { key: 'ACTIVE',    label: 'Location en cours',   dateKey: 'activatedAt' },
  { key: 'COMPLETED', label: 'Terminée',            dateKey: 'completedAt' },
];

function fmt(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function BookingTimeline({ booking }) {
  const current = STATUS_CONFIG[booking.status] || { step: 0 };
  const cancelled = booking.status === 'CANCELLED';

  if (cancelled) {
    return (
      <div className="timeline timeline-cancelled">
        <div className="timeline-step done">
          <div className="timeline-dot" />
          <div className="timeline-info">
            <span className="timeline-label">Demande envoyée</span>
            <span className="timeline-date">{fmt(booking.createdAt)}</span>
          </div>
        </div>
        <div className="timeline-connector cancelled" />
        <div className="timeline-step cancelled-step">
          <div className="timeline-dot dot-cancelled" />
          <div className="timeline-info">
            <span className="timeline-label">Annulée</span>
            <span className="timeline-date">{fmt(booking.cancelledAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline">
      {TIMELINE_STEPS.map((step, i) => {
        const done = current.step > i + 1;
        const active = current.step === i + 1;
        const pending = current.step < i + 1;
        const date = booking[step.dateKey];
        return (
          <div key={step.key} className="timeline-track">
            <div className={`timeline-step ${done ? 'done' : active ? 'active' : 'pending'}`}>
              <div className={`timeline-dot ${done ? 'dot-done' : active ? 'dot-active' : ''}`}>
                {done && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                {active && <div className="dot-pulse" />}
              </div>
              <div className="timeline-info">
                <span className="timeline-label">{step.label}</span>
                {date && <span className="timeline-date">{fmt(date)}</span>}
                {active && !date && step.key === 'ACTIVE' && (
                  <span className="timeline-date">Depuis le {fmt(booking.startDate)}</span>
                )}
              </div>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`timeline-connector ${done ? 'connector-done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    bookingService.getMyBookings()
      .then(setBookings)
      .catch(() => setLoadError('Impossible de charger vos réservations.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Annuler cette réservation ?')) return;
    setCancellingId(id);
    setError('');
    try {
      const updated = await bookingService.cancel(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible d\'annuler cette réservation.');
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    if (filter === 'active') return ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(b.status);
    if (filter === 'done') return ['COMPLETED', 'CANCELLED'].includes(b.status);
    return true;
  });

  const activeCount = bookings.filter((b) => ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(b.status)).length;

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="my-bookings-page page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="section-title">Mes réservations</h1>
            <p className="section-subtitle">Suivez l'état de vos demandes de location</p>
          </div>
          {activeCount > 0 && (
            <div className="bookings-summary">
              <span className="summary-pill">{activeCount} en cours</span>
            </div>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loadError && <div className="alert alert-error">{loadError}</div>}

        {/* Filtres */}
        {bookings.length > 0 && (
          <div className="bookings-filters">
            {[['all','Toutes'], ['active','En cours'], ['done','Terminées / Annulées']].map(([val, label]) => (
              <button
                key={val}
                className={`filter-btn ${filter === val ? 'active' : ''}`}
                onClick={() => setFilter(val)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>Aucune réservation</h3>
            <p>Vous n'avez pas encore effectué de réservation.</p>
            <Link to="/properties" className="btn btn-primary mt-16">Parcourir les logements</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map((booking) => {
              const status = STATUS_CONFIG[booking.status] || { label: booking.status, cls: 'badge-gray' };
              const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
              return (
                <div key={booking.id} className={`booking-card card ${booking.status === 'ACTIVE' ? 'booking-card-active' : ''}`}>
                  <div className="booking-card-header">
                    <div>
                      <h3 className="booking-property-title">{booking.propertyTitle}</h3>
                      <p className="booking-property-city text-muted">{booking.propertyCity}</p>
                    </div>
                    <span className={`badge ${status.cls}`}>{status.label}</span>
                  </div>

                  {/* Timeline */}
                  <BookingTimeline booking={booking} />

                  <div className="booking-card-body">
                    <div className="booking-detail">
                      <span className="booking-detail-label">Arrivée</span>
                      <span>{new Date(booking.startDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="booking-detail">
                      <span className="booking-detail-label">Départ</span>
                      <span>{new Date(booking.endDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="booking-detail">
                      <span className="booking-detail-label">Total</span>
                      <span className="booking-price">{Number(booking.totalPrice).toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>

                  {booking.message && (
                    <p className="booking-message">"{booking.message}"</p>
                  )}

                  {canCancel && (
                    <div className="booking-card-footer">
                      <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                        Demande le {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id ? 'Annulation...' : 'Annuler'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
